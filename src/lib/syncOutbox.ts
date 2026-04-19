import { sqliteOutboxAdd, sqliteOutboxMarkAllPendingSynced } from "@/db/adminSqlite";

/** Record work done offline for a later server sync (stub until API exists). */
export async function enqueueOutbox(kind: string, payload: unknown) {
  await sqliteOutboxAdd({
    kind,
    payloadJson: JSON.stringify(payload),
    createdAt: Date.now(),
    synced: 0,
  });
}

/** When online, mark pending rows as synced (replace with real HTTP later). */
export async function flushOutboxIfOnline(): Promise<number> {
  if (typeof navigator !== "undefined" && !navigator.onLine) return 0;
  return sqliteOutboxMarkAllPendingSynced();
}
