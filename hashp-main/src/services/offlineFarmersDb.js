import { agentRegisteredFarmers } from "../mockData/agent";

const DB_NAME = "hcx-offline-farmers";
const DB_VERSION = 1;
const STORE_NAME = "farmers";

const LEGACY_SYNC_STATUS_KEY = "hcx_agent_farmers_sync";
const LEGACY_FARMERS_LIST_KEY = "hcx_agent_farmers_list";
const LEGACY_MIGRATION_KEY = "hcx_offline_farmers_idb_migrated";

export const OFFLINE_FARMER_STATUS = {
  PENDING: "PENDING",
  SYNCING: "SYNCING",
  SYNCED: "SYNCED",
};

let dbPromise = null;

function canUseIndexedDb() {
  return typeof indexedDB !== "undefined";
}

function nowIso() {
  return new Date().toISOString();
}

function requestToPromise(request) {
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error("IndexedDB request failed."));
  });
}

function transactionToPromise(transaction) {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () =>
      reject(transaction.error || new Error("IndexedDB transaction failed."));
    transaction.onabort = () =>
      reject(transaction.error || new Error("IndexedDB transaction aborted."));
  });
}

function normalizeSyncStatus(status) {
  if (status === OFFLINE_FARMER_STATUS.SYNCED || status === "synced") {
    return OFFLINE_FARMER_STATUS.SYNCED;
  }
  if (status === OFFLINE_FARMER_STATUS.SYNCING || status === "syncing") {
    return OFFLINE_FARMER_STATUS.SYNCING;
  }
  return OFFLINE_FARMER_STATUS.PENDING;
}

function toUiStatus(status) {
  return status === OFFLINE_FARMER_STATUS.SYNCED ? "synced" : "pending";
}

function isOfficialFarmerId(value) {
  return typeof value === "string" && value.startsWith("HSH-");
}

function readString(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return "";
}

function createClientId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `client-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;
}

function makePendingDisplayId(clientId) {
  const suffix = String(clientId || "").replace(/-/g, "").slice(0, 8).toUpperCase();
  return `PENDING-${suffix || "LOCAL"}`;
}

function getRecordPayload(record, clientId) {
  const payload =
    record.payload && typeof record.payload === "object" && !Array.isArray(record.payload)
      ? { ...record.payload }
      : {};
  return {
    ...payload,
    client_id: readString(payload.client_id, clientId),
  };
}

function toStoredFarmerRecord(record) {
  const clientId = readString(record.clientId) || createClientId();
  const createdAt = readString(record.createdAt) || nowIso();
  const officialFarmerId =
    readString(record.officialFarmerId) ||
    (isOfficialFarmerId(record.id) ? record.id : "") ||
    "";
  const payload = getRecordPayload(record, clientId);

  return {
    ...record,
    clientId,
    payload,
    ownerAgentId: readString(record.ownerAgentId),
    officialFarmerId,
    id: officialFarmerId || readString(record.id) || makePendingDisplayId(clientId),
    status: normalizeSyncStatus(record.status),
    createdAt,
    updatedAt: readString(record.updatedAt) || createdAt,
    syncedAt: readString(record.syncedAt) || null,
    lastError: readString(record.lastError),
  };
}

function toUiFarmerRecord(record) {
  return {
    ...record,
    id: record.officialFarmerId || record.id || makePendingDisplayId(record.clientId),
    status: toUiStatus(record.status),
    offline: true,
    hasOfficialId: Boolean(record.officialFarmerId),
    syncStatus: record.status,
  };
}

function filterByOwner(records, ownerAgentId) {
  if (!ownerAgentId) {
    return records.filter((record) => !record.ownerAgentId);
  }
  return records.filter((record) => !record.ownerAgentId || record.ownerAgentId === ownerAgentId);
}

function dispatchSyncUpdate() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent("hcx-farmers-sync"));
  window.dispatchEvent(new CustomEvent("hcx-farmers-refresh"));
}

function parseLegacyFarmers() {
  try {
    const raw = localStorage.getItem(LEGACY_FARMERS_LIST_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function isLegacyOfflineCandidate(record, mockIds) {
  if (!record || typeof record !== "object") return false;
  if (!mockIds.has(String(record.id || ""))) return true;
  return record.status === "pending" || record.status === "syncing";
}

async function openDb() {
  if (!canUseIndexedDb()) {
    throw new Error("IndexedDB is not available in this environment.");
  }
  if (!dbPromise) {
    dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);
      request.onupgradeneeded = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: "clientId" });
          store.createIndex("byOwner", "ownerAgentId", { unique: false });
          store.createIndex("byStatus", "status", { unique: false });
          store.createIndex("byUpdatedAt", "updatedAt", { unique: false });
        }
      };
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error("Failed to open IndexedDB."));
    });
  }
  return dbPromise;
}

async function migrateLegacyOfflineFarmers() {
  if (!canUseIndexedDb()) return;

  try {
    if (localStorage.getItem(LEGACY_MIGRATION_KEY) === "1") return;
  } catch {
    return;
  }

  const legacyFarmers = parseLegacyFarmers();
  const mockIds = new Set(agentRegisteredFarmers.map((farmer) => String(farmer.id)));
  const candidates = legacyFarmers.filter((record) => isLegacyOfflineCandidate(record, mockIds));

  if (candidates.length > 0) {
    const db = await openDb();
    const transaction = db.transaction(STORE_NAME, "readwrite");
    const store = transaction.objectStore(STORE_NAME);

    candidates.forEach((record) => {
      const clientId = readString(record.clientId, record.id) || createClientId();
      store.put(
        toStoredFarmerRecord({
          ...record,
          clientId,
          id: isOfficialFarmerId(record.id) ? record.id : makePendingDisplayId(clientId),
          officialFarmerId: isOfficialFarmerId(record.id) ? record.id : "",
        })
      );
    });

    await transactionToPromise(transaction);
  }

  try {
    localStorage.removeItem(LEGACY_SYNC_STATUS_KEY);
    localStorage.removeItem(LEGACY_FARMERS_LIST_KEY);
    localStorage.setItem(LEGACY_MIGRATION_KEY, "1");
  } catch {
    /* ignore */
  }
}

async function getAllStoredRecords() {
  await migrateLegacyOfflineFarmers();
  const db = await openDb();
  const transaction = db.transaction(STORE_NAME, "readonly");
  const store = transaction.objectStore(STORE_NAME);
  const records = await requestToPromise(store.getAll());
  await transactionToPromise(transaction);
  return records;
}

async function putStoredRecords(records) {
  const db = await openDb();
  const transaction = db.transaction(STORE_NAME, "readwrite");
  const store = transaction.objectStore(STORE_NAME);
  records.forEach((record) => {
    store.put(toStoredFarmerRecord(record));
  });
  await transactionToPromise(transaction);
  dispatchSyncUpdate();
}

function matchesFarmerReference(record, reference) {
  const ref = readString(reference);
  if (!ref) return false;
  return [record.clientId, record.id, record.officialFarmerId].includes(ref);
}

function matchSyncEntry(record, entry) {
  if (!entry) return false;
  if (entry.clientId && entry.clientId === record.clientId) return true;

  const payload = record.payload || {};
  const recordPhone = readString(payload.phone_number, record.phone);
  if (entry.phone && recordPhone && entry.phone === recordPhone) return true;

  const recordNin = readString(payload.nin, record.nin);
  if (entry.nin && recordNin && entry.nin === recordNin) return true;

  const recordName = readString(payload.full_name, record.name).toLowerCase();
  if (entry.name && recordName && entry.name.toLowerCase() === recordName) return true;

  return false;
}

function toDisplayDate(rawDate, fallback) {
  const value = readString(rawDate);
  if (!value) return fallback;
  if (!value.includes("T")) return value;
  return value.slice(0, 10).split("-").reverse().join("/");
}

function mergeSyncedRecord(record, entry, updatedAt) {
  const payload = record.payload || {};
  const officialFarmerId = readString(entry?.officialFarmerId, record.officialFarmerId);
  return {
    ...record,
    officialFarmerId,
    id: officialFarmerId || record.id,
    status: OFFLINE_FARMER_STATUS.SYNCED,
    syncedAt: updatedAt,
    updatedAt,
    lastError: "",
    name: readString(entry?.name, record.name, payload.full_name),
    phone: readString(entry?.phone, record.phone, payload.phone_number),
    state: readString(entry?.state, record.state, payload.state_of_origin),
    lga: readString(entry?.lga, record.lga, payload.lga),
    address: readString(entry?.address, record.address, payload.residential_address),
    nin: readString(entry?.nin, record.nin, payload.nin),
    photo: readString(entry?.photo, record.photo),
    primaryCrop: readString(
      entry?.primaryCrop,
      record.primaryCrop,
      Array.isArray(payload.primary_crops) ? payload.primary_crops[0] : payload.crop_type
    ),
    farmSize: readString(entry?.farmSize, record.farmSize, payload.farm_size),
    landOwnership: readString(entry?.landOwnership, record.landOwnership, payload.land_ownership),
    cooperative: readString(entry?.cooperative, record.cooperative),
    gender: readString(entry?.gender, record.gender),
    regDate: toDisplayDate(entry?.regDate, record.regDate),
  };
}

function mergeFailedRecord(record, entry, updatedAt) {
  return {
    ...record,
    status: OFFLINE_FARMER_STATUS.PENDING,
    updatedAt,
    lastError: readString(entry?.errorMessage, entry?.message, entry?.error) || "Sync failed.",
  };
}

export async function listOfflineFarmers(ownerAgentId = "") {
  const records = filterByOwner(await getAllStoredRecords(), ownerAgentId).sort(
    (left, right) => new Date(right.updatedAt) - new Date(left.updatedAt)
  );
  return records.map(toUiFarmerRecord);
}

export async function createOfflineFarmerRecord(record) {
  const storedRecord = toStoredFarmerRecord(record);
  await putStoredRecords([storedRecord]);
  return toUiFarmerRecord(storedRecord);
}

export async function getOfflineSyncCounts(ownerAgentId = "") {
  const records = filterByOwner(await getAllStoredRecords(), ownerAgentId);
  return {
    completed: records.filter((record) => record.status === OFFLINE_FARMER_STATUS.SYNCED).length,
    pending: records.filter((record) => record.status !== OFFLINE_FARMER_STATUS.SYNCED).length,
  };
}

export async function getPendingOfflineFarmerRecords(ownerAgentId = "") {
  return filterByOwner(await getAllStoredRecords(), ownerAgentId)
    .filter((record) => record.status !== OFFLINE_FARMER_STATUS.SYNCED)
    .sort((left, right) => new Date(left.createdAt) - new Date(right.createdAt));
}

export async function setOfflineFarmersSyncing(references, ownerAgentId = "") {
  const refSet = new Set((references || []).map((ref) => readString(ref)).filter(Boolean));
  if (refSet.size === 0) return [];

  const updatedAt = nowIso();
  const records = filterByOwner(await getAllStoredRecords(), ownerAgentId)
    .filter((record) => refSet.has(record.clientId) || refSet.has(record.id))
    .map((record) => ({
      ...record,
      status: OFFLINE_FARMER_STATUS.SYNCING,
      updatedAt,
      lastError: "",
    }));

  if (records.length === 0) return [];
  await putStoredRecords(records);
  return records.map(toUiFarmerRecord);
}

export async function applyOfflineSyncResults({
  ownerAgentId = "",
  submittedIds = [],
  successes = [],
  failures = [],
  assumeAllSucceeded = false,
} = {}) {
  const submittedSet = new Set((submittedIds || []).map((id) => readString(id)).filter(Boolean));
  if (submittedSet.size === 0) {
    return { syncedRecords: [], failedRecords: [] };
  }

  const allRecords = await getAllStoredRecords();
  const ownerRecords = filterByOwner(allRecords, ownerAgentId);
  const targetRecords = ownerRecords.filter((record) => matchesFarmerReference(record, record.clientId) && submittedSet.has(record.clientId));
  const untouchedRecords = allRecords.filter((record) => !submittedSet.has(record.clientId));
  const updatedAt = nowIso();

  const pendingSuccesses = [...successes];
  const pendingFailures = [...failures];
  const updatedTargets = [];
  const syncedRecords = [];
  const failedRecords = [];
  const unmatchedTargets = [];

  targetRecords.forEach((record) => {
    const failureIndex = pendingFailures.findIndex((entry) => matchSyncEntry(record, entry));
    if (failureIndex >= 0) {
      const [failureEntry] = pendingFailures.splice(failureIndex, 1);
      const failedRecord = mergeFailedRecord(record, failureEntry, updatedAt);
      updatedTargets.push(failedRecord);
      failedRecords.push(toUiFarmerRecord(failedRecord));
      return;
    }

    const successIndex = pendingSuccesses.findIndex((entry) => matchSyncEntry(record, entry));
    if (successIndex >= 0) {
      const [successEntry] = pendingSuccesses.splice(successIndex, 1);
      const syncedRecord = mergeSyncedRecord(record, successEntry, updatedAt);
      updatedTargets.push(syncedRecord);
      syncedRecords.push(toUiFarmerRecord(syncedRecord));
      return;
    }

    unmatchedTargets.push(record);
  });

  if (pendingFailures.length === 0 && pendingSuccesses.length > 0 && pendingSuccesses.length === unmatchedTargets.length) {
    unmatchedTargets.splice(0).forEach((record, index) => {
      const syncedRecord = mergeSyncedRecord(record, pendingSuccesses[index], updatedAt);
      updatedTargets.push(syncedRecord);
      syncedRecords.push(toUiFarmerRecord(syncedRecord));
    });
    pendingSuccesses.length = 0;
  }

  unmatchedTargets.forEach((record) => {
    if (assumeAllSucceeded) {
      const syncedRecord = mergeSyncedRecord(record, null, updatedAt);
      updatedTargets.push(syncedRecord);
      syncedRecords.push(toUiFarmerRecord(syncedRecord));
      return;
    }

    const failedRecord = mergeFailedRecord(
      record,
      { errorMessage: "Server response could not be matched to this farmer yet." },
      updatedAt
    );
    updatedTargets.push(failedRecord);
    failedRecords.push(toUiFarmerRecord(failedRecord));
  });

  await putStoredRecords([...untouchedRecords, ...updatedTargets]);
  return { syncedRecords, failedRecords };
}

export async function markOfflineFarmerSynced(id, ownerAgentId = "") {
  const records = filterByOwner(await getAllStoredRecords(), ownerAgentId);
  const target = records.find((record) => matchesFarmerReference(record, id));
  if (!target) return null;

  const updatedAt = nowIso();
  const updatedRecord = {
    ...target,
    status: OFFLINE_FARMER_STATUS.SYNCED,
    syncedAt: updatedAt,
    updatedAt,
    lastError: "",
  };

  await putStoredRecords([updatedRecord]);
  return toUiFarmerRecord(updatedRecord);
}

export async function markAllOfflineFarmersSynced(ownerAgentId = "") {
  const records = filterByOwner(await getAllStoredRecords(), ownerAgentId).filter(
    (record) => record.status !== OFFLINE_FARMER_STATUS.SYNCED
  );
  if (records.length === 0) return [];

  const updatedAt = nowIso();
  const updatedRecords = records.map((record) => ({
    ...record,
    status: OFFLINE_FARMER_STATUS.SYNCED,
    syncedAt: updatedAt,
    updatedAt,
    lastError: "",
  }));

  await putStoredRecords(updatedRecords);
  return updatedRecords.map(toUiFarmerRecord);
}
