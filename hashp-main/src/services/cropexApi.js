import { CropexHttpError, cropexFetch } from "./cropexHttp";

const AGENT_AUTH_KEY = "hcx_agent_auth";
const FARMER_AUTH_KEY = "hcx_farmer_auth";

function readStoredSession(storageKey) {
  try {
    const raw = sessionStorage.getItem(storageKey);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

function writeStoredSession(storageKey, session) {
  sessionStorage.setItem(storageKey, JSON.stringify(session));
}

function readString(...values) {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
    if (typeof value === "number" && Number.isFinite(value)) return String(value);
  }
  return "";
}

function extractDataRoot(data) {
  if (!data || typeof data !== "object") return {};
  return data.data && typeof data.data === "object" ? data.data : data;
}

function extractTokens(data) {
  const root = extractDataRoot(data);
  const tokenSource =
    root.tokens && typeof root.tokens === "object"
      ? root.tokens
      : data?.tokens && typeof data.tokens === "object"
        ? data.tokens
        : root;

  return {
    accessToken: readString(
      tokenSource?.access_token,
      tokenSource?.accessToken,
      root?.access_token,
      root?.accessToken,
      root?.token,
      data?.access_token,
      data?.accessToken,
      data?.token
    ),
    refreshToken: readString(
      tokenSource?.refresh_token,
      tokenSource?.refreshToken,
      root?.refresh_token,
      root?.refreshToken,
      data?.refresh_token,
      data?.refreshToken
    ),
  };
}

function extractAuthUser(data) {
  const root = extractDataRoot(data);
  return root.user ?? data?.user ?? root.agent ?? root.farmer ?? root;
}

function buildQuery(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value == null) return;
    if (typeof value === "string" && !value.trim()) return;
    searchParams.set(key, String(value));
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
}

function collectObjects(value, bucket = []) {
  if (Array.isArray(value)) {
    value.forEach((item) => collectObjects(item, bucket));
    return bucket;
  }
  if (!value || typeof value !== "object") return bucket;
  bucket.push(value);
  Object.values(value).forEach((child) => collectObjects(child, bucket));
  return bucket;
}

function findArrayInPayload(payload, keys) {
  if (!payload || typeof payload !== "object") return [];
  for (const key of keys) {
    if (Array.isArray(payload[key])) return payload[key];
  }
  for (const key of keys) {
    const child = payload[key];
    if (child && typeof child === "object") {
      const found = findArrayInPayload(child, keys);
      if (found.length > 0) return found;
    }
  }
  return [];
}

function findObjectInPayload(payload, keys) {
  if (!payload || typeof payload !== "object") return payload;
  for (const key of keys) {
    const child = payload[key];
    if (child && typeof child === "object" && !Array.isArray(child)) return child;
  }
  return payload;
}

function isFailureLike(obj) {
  const status = readString(obj?.status).toLowerCase();
  if (status === "failed" || status === "error" || status === "rejected") return true;
  if (readString(obj?.error, obj?.reason, obj?.details) && (obj?.client_id || obj?.phone_number || obj?.nin)) {
    return true;
  }
  return false;
}

function syncEntryKey(entry) {
  return (
    entry.clientId ||
    entry.officialFarmerId ||
    entry.phone ||
    entry.nin ||
    entry.name ||
    ""
  ).toLowerCase();
}

function dedupeSyncEntries(entries) {
  const seen = new Set();
  return entries.filter((entry) => {
    const key = syncEntryKey(entry);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeSyncEntry(row) {
  if (!row || typeof row !== "object") return null;
  const clientId = readString(row.client_id, row.clientId);
  const officialFarmerId = readString(row.farmer_id, row.farmerId, row.id);
  const phone = readString(row.phone_number, row.phone);
  const nin = readString(row.nin);
  const name = readString(row.full_name, row.name);

  if (!clientId && !officialFarmerId && !phone && !nin && !name) return null;

  return {
    clientId,
    officialFarmerId,
    phone,
    nin,
    name,
    state: readString(row.state_of_origin, row.state),
    lga: readString(row.lga, row.local_govt_area),
    gender: readString(row.gender),
    address: readString(row.residential_address, row.address),
    farmSize: readString(row.farm_size),
    landOwnership: readString(row.land_ownership),
    primaryCrop: Array.isArray(row.primary_crops)
      ? readString(row.primary_crops[0])
      : readString(row.primary_crop, row.crop_type),
    cooperative: readString(row.cooperative_name, row.cooperative),
    photo: readString(row.profile_photo_url, row.photo_url, row.profile_photo, row.photo),
    regDate: readString(row.created_at, row.issue_date, row.updated_at),
    errorMessage: readString(row.error, row.reason, row.details, row.message),
  };
}

function mergeTokensIntoSession(storageKey, data) {
  const previous = readStoredSession(storageKey) || {};
  const tokens = extractTokens(data);
  writeStoredSession(storageKey, {
    ...previous,
    accessToken: tokens.accessToken || previous.accessToken || "",
    refreshToken: tokens.refreshToken || previous.refreshToken || "",
  });
}

function setSessionFromAuthResponse(storageKey, data, opts = {}) {
  const previous = readStoredSession(storageKey) || {};
  const tokens = extractTokens(data);
  const user = extractAuthUser(data);
  const idField = opts.idField || "userId";

  writeStoredSession(storageKey, {
    ...previous,
    accessToken: tokens.accessToken || previous.accessToken || "",
    refreshToken: tokens.refreshToken || previous.refreshToken || "",
    [idField]: readString(user?.id, previous[idField]),
    email: readString(user?.email, data?.email, previous.email),
    fullName: readString(user?.full_name, user?.name, previous.fullName),
    phone: readString(user?.phone_number, user?.phone, previous.phone),
    role: readString(user?.role, opts.defaultRole, previous.role),
  });
}

async function cropexSessionFetch(storageKey, path, opts = {}, retryOnRefresh = true) {
  const session = readStoredSession(storageKey) || {};
  try {
    return await cropexFetch(path, {
      ...opts,
      token: readString(session.accessToken, session.access_token) || undefined,
    });
  } catch (error) {
    const refreshToken = readString(session.refreshToken, session.refresh_token);
    if (!(error instanceof CropexHttpError) || error.status !== 401 || !retryOnRefresh || !refreshToken) {
      if (error instanceof CropexHttpError && error.status === 401 && !refreshToken) {
        clearStoredSession(storageKey);
      }
      throw error;
    }

    try {
      const refreshed = await cropexFetch("/agents/refresh", {
        method: "POST",
        body: { refresh_token: refreshToken },
      });
      mergeTokensIntoSession(storageKey, refreshed);
    } catch (refreshError) {
      clearStoredSession(storageKey);
      throw refreshError;
    }

    return cropexSessionFetch(storageKey, path, opts, false);
  }
}

function clearStoredSession(storageKey) {
  try {
    sessionStorage.removeItem(storageKey);
  } catch {
    /* ignore */
  }
}

export function getAgentSession() {
  return readStoredSession(AGENT_AUTH_KEY);
}

export function getFarmerSession() {
  return readStoredSession(FARMER_AUTH_KEY);
}

export function getAgentAccessToken() {
  const session = getAgentSession();
  return readString(session?.accessToken, session?.access_token);
}

export function getFarmerAccessToken() {
  const session = getFarmerSession();
  return readString(session?.accessToken, session?.access_token);
}

export function mergeAgentTokensFromRefreshResponse(data) {
  mergeTokensIntoSession(AGENT_AUTH_KEY, data);
}

export function setAgentSessionFromAuthResponse(data) {
  setSessionFromAuthResponse(AGENT_AUTH_KEY, data, {
    idField: "agentId",
    defaultRole: "AGENT",
  });
}

export function setFarmerSessionFromAuthResponse(data) {
  setSessionFromAuthResponse(FARMER_AUTH_KEY, data, {
    idField: "farmerUserId",
    defaultRole: "FARMER",
  });
}

export function getAgentIdFromSession() {
  const session = getAgentSession();
  return readString(session?.agentId, session?.agent_id, session?.userId, session?.user_id);
}

export function clearAgentSession() {
  clearStoredSession(AGENT_AUTH_KEY);
}

export function clearFarmerSession() {
  clearStoredSession(FARMER_AUTH_KEY);
}

export function sendOtp(phone) {
  return cropexFetch("/auth/login", {
    method: "POST",
    body: { phone_number: formatPhoneForApi(phone) },
  });
}

export function verifyOtp(phone, code) {
  return cropexFetch("/auth/verify", {
    method: "POST",
    body: {
      phone_number: formatPhoneForApi(phone),
      otp: String(code || "").trim(),
    },
  });
}

export function agentVerifyOtp(phone, code) {
  return cropexFetch("/agents/verify-otp", {
    method: "POST",
    body: {
      phone_number: formatPhoneForApi(phone),
      otp: String(code || "").trim(),
    },
  });
}

export function resetPassword({ phone, otp, newPassword }) {
  return cropexFetch("/auth/reset-password", {
    method: "POST",
    body: {
      phone_number: formatPhoneForApi(phone),
      otp: String(otp || "").trim(),
      new_password: newPassword,
    },
  });
}

export function agentRegister(body) {
  return cropexFetch("/agents/register", {
    method: "POST",
    body,
  });
}

export function completeAgentRegistration(body) {
  return cropexSessionFetch(AGENT_AUTH_KEY, "/agents/complete-registration", {
    method: "POST",
    body,
  });
}

export function agentLogin(body) {
  return cropexFetch("/auth/login", {
    method: "POST",
    body,
  });
}

export function agentRefresh(refreshToken) {
  return cropexFetch("/agents/refresh", {
    method: "POST",
    body: { refresh_token: refreshToken },
  });
}

export function listFarmers({ page = 1, page_size = 200, search, status, agent_id } = {}) {
  return cropexSessionFetch(
    AGENT_AUTH_KEY,
    `/farmers${buildQuery({
      page,
      page_size,
      search,
      status,
      agent_id,
    })}`
  );
}

export function searchFarmers(query) {
  return cropexSessionFetch(
    AGENT_AUTH_KEY,
    `/farmers/search${buildQuery({
      q: query,
    })}`
  );
}

export function getFarmerById(id) {
  return cropexSessionFetch(AGENT_AUTH_KEY, `/farmers/${encodeURIComponent(id)}`);
}

export function enrollFarmer(body) {
  return cropexSessionFetch(AGENT_AUTH_KEY, "/farmers", {
    method: "POST",
    body,
  });
}

export async function syncFarmers(records) {
  const payload = await cropexSessionFetch(AGENT_AUTH_KEY, "/farmers/sync", {
    method: "POST",
    body: records,
  });

  const objects = collectObjects(payload);
  const failures = dedupeSyncEntries(
    objects.filter(isFailureLike).map(normalizeSyncEntry).filter(Boolean)
  );
  const failureKeys = new Set(failures.map(syncEntryKey).filter(Boolean));
  const successes = dedupeSyncEntries(
    objects
      .filter((obj) => !isFailureLike(obj))
      .map(normalizeSyncEntry)
      .filter(Boolean)
      .filter((entry) => !failureKeys.has(syncEntryKey(entry)))
  );

  return {
    raw: payload,
    successes,
    failures,
    assumeAllSucceeded: successes.length === 0 && failures.length === 0,
  };
}

export function getGeoStates() {
  return cropexFetch("/geo/states");
}

export function getGeoLgas(stateId) {
  return cropexFetch(`/geo/states/${encodeURIComponent(stateId)}/lgas`);
}

export function extractGeoArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  return findArrayInPayload(payload, ["data", "states", "lgas", "items", "results", "records"]);
}

export function mapGeoStateOption(row) {
  if (!row || typeof row !== "object") return null;
  const id = row.id ?? row.state_id ?? row.code ?? row.name;
  const name = readString(row.name, row.state);
  if (!id || !name) return null;
  return { id: String(id), name };
}

export function mapGeoLgaOption(row) {
  if (!row || typeof row !== "object") return null;
  const id = row.id ?? row.lga_id ?? row.name;
  const name = readString(row.name, row.lga);
  if (!id || !name) return null;
  return { id: String(id), name };
}

export function getFarmerDashboard() {
  return cropexSessionFetch(FARMER_AUTH_KEY, "/farmers/me");
}

export function getFarmerIdCard() {
  return cropexSessionFetch(FARMER_AUTH_KEY, "/farmers/id-card");
}

export function getAgentDashboard() {
  return cropexSessionFetch(AGENT_AUTH_KEY, "/agents/me");
}

export function createSupportTicket(body) {
  return cropexSessionFetch(AGENT_AUTH_KEY, "/support/tickets", {
    method: "POST",
    body,
  });
}

export function extractFarmerRecord(payload) {
  if (payload == null || typeof payload !== "object") return payload;
  return findObjectInPayload(payload, ["data", "farmer", "item", "record"]);
}

export function extractFarmersArray(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];
  return findArrayInPayload(payload, ["data", "farmers", "items", "results", "records", "rows"]);
}

export function mapApiFarmerToUi(row) {
  if (!row || typeof row !== "object") return null;

  const primaryCrop =
    Array.isArray(row.primary_crops) && row.primary_crops.length > 0
      ? row.primary_crops[0]
      : row.primary_crop || row.crop_type || row.primaryCrop || "-";
  const createdAt = readString(row.created_at, row.enrolled_at, row.reg_date, row.updated_at);
  const regDate =
    createdAt && createdAt.includes("T")
      ? createdAt.slice(0, 10).split("-").reverse().join("/")
      : createdAt || "-";

  return {
    id: readString(row.farmer_id, row.id, row.uuid, row.farmerId, row.hsh_id, row.client_id),
    officialFarmerId: readString(row.farmer_id, row.farmerId, row.id),
    clientId: readString(row.client_id, row.clientId),
    name: readString(row.full_name, row.name, row.fullName) || "Farmer",
    photo:
      readString(row.profile_photo_url, row.photo_url, row.profile_photo, row.photo) ||
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=320&q=80&fit=crop",
    regDate,
    status: "synced",
    primaryCrop,
    state: readString(row.state_of_origin, row.state) || "-",
    lga: readString(row.lga, row.local_govt_area) || "-",
    phone: readString(row.phone_number, row.phone) || "-",
    cooperative: readString(row.cooperative_name, row.cooperative) || "-",
    farmSize: readString(row.farm_size) || "-",
    landOwnership: readString(row.land_ownership) || "-",
    gender:
      row.gender === "M" ? "Male" : row.gender === "F" ? "Female" : readString(row.gender) || "-",
    dob: readString(row.date_of_birth, row.dob) || "-",
    nin: readString(row.nin) || "-",
    address: readString(row.residential_address, row.address, row.farm_location) || "-",
    offline: false,
    hasOfficialId: true,
    biometric: { face: true, fingerprint: true },
  };
}

export function formatPhoneForApi(digits) {
  const normalized = String(digits || "").replace(/\D/g, "");
  if (!normalized) return "";
  if (normalized.startsWith("234")) return `+${normalized}`;
  if (normalized.startsWith("0")) return `+234${normalized.slice(1)}`;
  return `+234${normalized}`;
}

export function mapGenderToFarmerApi(gender) {
  if (gender === "Male") return "M";
  if (gender === "Female") return "F";
  return "Other";
}

export function mapYearsExperienceToInt(label) {
  const values = {
    "Less than 1 year": 0,
    "1-3 years": 2,
    "4-7 years": 5,
    "8-15 years": 10,
    "15+ years": 18,
  };
  return values[label] ?? 0;
}

export function draftToEnrollmentPayload(draft, enrolledByAgentId) {
  const personal = draft.personal || {};
  const farm = draft.farm || {};
  const phone_number = formatPhoneForApi(personal.phone);
  const primaryCrops =
    Array.isArray(personal.primaryCrops) && personal.primaryCrops.length > 0
      ? personal.primaryCrops
      : farm.cropType
        ? [farm.cropType]
        : [];

  const body = {
    full_name: personal.fullName,
    phone_number,
    nin: personal.nin,
    bvn: personal.bvn,
    gender: mapGenderToFarmerApi(personal.gender),
    date_of_birth: personal.dob,
    state_of_origin: personal.state,
    lga: personal.lga,
    residential_address: personal.address,
    marital_status: personal.maritalStatus || undefined,
    education_level: personal.educationLevel || undefined,
    farming_experience: mapYearsExperienceToInt(personal.yearsExperience),
    primary_crops: primaryCrops,
    secondary_crops: [],
    next_of_kin_name: personal.nextKinName || undefined,
    next_of_kin_phone: personal.nextKinPhone
      ? formatPhoneForApi(personal.nextKinPhone)
      : undefined,
    next_of_kin_relation: personal.nextKinRelationship || undefined,
    crop_type: farm.cropType || undefined,
    farm_location: farm.farmLocation || undefined,
    farm_size: farm.farmSize || undefined,
    land_ownership: farm.landOwnership || undefined,
    soil_type: farm.soilType || undefined,
  };

  if (enrolledByAgentId) {
    body.enrolled_by_agent_id = String(enrolledByAgentId);
  }

  return body;
}
