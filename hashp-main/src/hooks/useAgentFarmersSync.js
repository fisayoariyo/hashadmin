import { useState, useCallback, useMemo, useEffect } from "react";
import {
  getAgentAccessToken,
  getAgentIdFromSession,
  getAgentSession,
  listFarmers,
  searchFarmers,
  mapApiFarmerToUi,
  syncFarmers,
  extractFarmersArray,
} from "../services/cropexApi";
import {
  applyOfflineSyncResults,
  createOfflineFarmerRecord,
  getOfflineSyncCounts,
  getPendingOfflineFarmerRecords,
  listOfflineFarmers,
  setOfflineFarmersSyncing,
} from "../services/offlineFarmersDb";

function mergeFarmers(offlineFarmers, remoteFarmers = []) {
  const takenIds = new Set(
    offlineFarmers.flatMap((farmer) =>
      [farmer.id, farmer.officialFarmerId, farmer.clientId].filter(Boolean)
    )
  );

  const liveFarmers = remoteFarmers.filter(
    (farmer) =>
      farmer &&
      !takenIds.has(farmer.id) &&
      !takenIds.has(farmer.officialFarmerId) &&
      !takenIds.has(farmer.clientId)
  );

  return [...offlineFarmers, ...liveFarmers];
}

function hasAgentApiCredentials() {
  const session = getAgentSession();
  return Boolean(getAgentAccessToken() || session?.refreshToken || session?.refresh_token);
}

function matchesFarmerQuery(farmer, query) {
  const search = String(query || "").trim().toLowerCase();
  if (!search) return true;
  return [
    farmer?.name,
    farmer?.id,
    farmer?.officialFarmerId,
    farmer?.clientId,
    farmer?.phone,
    farmer?.nin,
  ]
    .filter(Boolean)
    .some((value) => String(value).toLowerCase().includes(search));
}

async function fetchRemoteFarmers() {
  const payload = await listFarmers({
    page: 1,
    page_size: 200,
    agent_id: getAgentIdFromSession() || undefined,
  });
  return extractFarmersArray(payload).map(mapApiFarmerToUi).filter(Boolean);
}

async function fetchRemoteFarmerSearchResults(query) {
  const payload = await searchFarmers(query);
  return extractFarmersArray(payload).map(mapApiFarmerToUi).filter(Boolean);
}

async function syncPendingOfflineFarmers(references = []) {
  const ownerAgentId = getAgentIdFromSession();
  const pendingRecords = await getPendingOfflineFarmerRecords(ownerAgentId);
  const refSet = new Set((references || []).filter(Boolean));
  const recordsToSync =
    refSet.size === 0
      ? pendingRecords
      : pendingRecords.filter((record) =>
          [record.clientId, record.id, record.officialFarmerId].some((value) => refSet.has(value))
        );

  if (recordsToSync.length === 0) {
    return { syncedRecords: [], failedRecords: [] };
  }

  const submittedIds = recordsToSync.map((record) => record.clientId);
  await setOfflineFarmersSyncing(submittedIds, ownerAgentId);

  try {
    const response = await syncFarmers(
      recordsToSync.map((record) => ({
        ...(record.payload || {}),
        client_id: record.clientId,
        enrolled_by_agent_id:
          record.payload?.enrolled_by_agent_id || record.ownerAgentId || ownerAgentId || undefined,
      }))
    );

    return applyOfflineSyncResults({
      ownerAgentId,
      submittedIds,
      successes: response.successes,
      failures: response.failures,
      assumeAllSucceeded: response.assumeAllSucceeded,
    });
  } catch (error) {
    return applyOfflineSyncResults({
      ownerAgentId,
      submittedIds,
      failures: recordsToSync.map((record) => ({
        clientId: record.clientId,
        phone: record.payload?.phone_number,
        nin: record.payload?.nin,
        name: record.payload?.full_name,
        errorMessage: error instanceof Error ? error.message : "Sync failed.",
      })),
    }).then((result) => {
      throw Object.assign(error instanceof Error ? error : new Error("Sync failed."), {
        syncResult: result,
      });
    });
  }
}

export async function loadFarmersFromStorage() {
  const ownerAgentId = getAgentIdFromSession();
  const offlineFarmers = await listOfflineFarmers(ownerAgentId);

  if (!hasAgentApiCredentials()) {
    return mergeFarmers(offlineFarmers, []);
  }

  try {
    const remoteFarmers = await fetchRemoteFarmers();
    return mergeFarmers(offlineFarmers, remoteFarmers);
  } catch {
    return mergeFarmers(offlineFarmers, []);
  }
}

export function upsertFarmerInStorage(farmer) {
  return createOfflineFarmerRecord(farmer);
}

export function getFarmerSyncCountsFromStorage() {
  return getOfflineSyncCounts(getAgentIdFromSession());
}

export function syncAllPendingFarmersStorage() {
  return syncPendingOfflineFarmers();
}

export function useAgentFarmersSync() {
  const [farmers, setFarmers] = useState([]);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState(null);
  const [listError, setListError] = useState(null);

  const refreshFromApi = useCallback(async () => {
    const ownerAgentId = getAgentIdFromSession();
    setListError(null);

    try {
      const offlineFarmers = await listOfflineFarmers(ownerAgentId);

      if (!hasAgentApiCredentials()) {
        setFarmers(mergeFarmers(offlineFarmers, []));
        return;
      }

      try {
        const remoteFarmers = await fetchRemoteFarmers();
        setFarmers(mergeFarmers(offlineFarmers, remoteFarmers));
      } catch (error) {
        setListError(error instanceof Error ? error.message : "Could not load farmers from the server.");
        setFarmers(mergeFarmers(offlineFarmers, []));
      }
    } catch {
      setListError("Could not load offline farmers.");
      setFarmers([]);
    }
  }, []);

  useEffect(() => {
    void refreshFromApi();
    const onExternal = () => {
      void refreshFromApi();
    };
    window.addEventListener("hcx-farmers-sync", onExternal);
    window.addEventListener("hcx-farmers-refresh", onExternal);
    return () => {
      window.removeEventListener("hcx-farmers-sync", onExternal);
      window.removeEventListener("hcx-farmers-refresh", onExternal);
    };
  }, [refreshFromApi]);

  const showMessage = useCallback((text) => {
    setSyncMessage(text);
    window.setTimeout(() => setSyncMessage(null), 3200);
  }, []);

  const syncFarmer = useCallback(
    async (id) => {
      setSyncing(true);
      try {
        const result = await syncPendingOfflineFarmers([id]);
        await refreshFromApi();

        if (result.failedRecords.length > 0 && result.syncedRecords.length === 0) {
          showMessage(result.failedRecords[0].lastError || "Farmer sync failed.");
          return result.failedRecords[0];
        }

        showMessage("Farmer record synced successfully.");
        return result.syncedRecords[0] || null;
      } catch (error) {
        await refreshFromApi();
        showMessage(error instanceof Error ? error.message : "Farmer sync failed.");
        return null;
      } finally {
        setSyncing(false);
      }
    },
    [refreshFromApi, showMessage]
  );

  const syncAllPending = useCallback(async () => {
    setSyncing(true);
    try {
      const result = await syncPendingOfflineFarmers();
      await refreshFromApi();

      if (result.failedRecords.length > 0 && result.syncedRecords.length === 0) {
        showMessage(result.failedRecords[0].lastError || "Sync failed.");
        return result;
      }

      if (result.failedRecords.length > 0) {
        showMessage(
          `${result.syncedRecords.length} farmer(s) synced, ${result.failedRecords.length} still pending.`
        );
        return result;
      }

      showMessage("All pending farmers synced.");
      return result;
    } catch (error) {
      await refreshFromApi();
      showMessage(error instanceof Error ? error.message : "Sync failed.");
      return error?.syncResult || { syncedRecords: [], failedRecords: [] };
    } finally {
      setSyncing(false);
    }
  }, [refreshFromApi, showMessage]);

  const searchFarmersByQuery = useCallback(async (query) => {
    const trimmed = String(query || "").trim();
    const ownerAgentId = getAgentIdFromSession();
    const offlineFarmers = await listOfflineFarmers(ownerAgentId);
    const offlineMatches = offlineFarmers.filter((farmer) => matchesFarmerQuery(farmer, trimmed));

    if (!trimmed) {
      if (!hasAgentApiCredentials()) {
        return mergeFarmers(offlineFarmers, []);
      }
      const remoteFarmers = await fetchRemoteFarmers();
      return mergeFarmers(offlineFarmers, remoteFarmers);
    }

    if (!hasAgentApiCredentials()) {
      return mergeFarmers(offlineMatches, []);
    }

    const remoteFarmers = await fetchRemoteFarmerSearchResults(trimmed);
    return mergeFarmers(offlineMatches, remoteFarmers);
  }, []);

  const counts = useMemo(() => {
    const queuedFarmers = farmers.filter((farmer) => farmer.offline);
    const completed = queuedFarmers.filter((farmer) => farmer.status === "synced").length;
    const pending = queuedFarmers.filter((farmer) => farmer.status === "pending").length;
    return { completed, pending };
  }, [farmers]);

  return {
    farmers,
    syncing,
    syncMessage,
    listError,
    syncFarmer,
    syncAllPending,
    searchFarmersByQuery,
    counts,
    refreshFromApi,
  };
}
