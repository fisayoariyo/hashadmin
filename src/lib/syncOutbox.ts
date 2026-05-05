import {
  sqliteOutboxAdd,
  sqliteOutboxListPending,
  sqliteOutboxMarkSyncedByIds,
} from "@/db/adminSqlite";
import { replayOutbox } from "@/lib/adminApi";

/** Record work done offline for a later server sync (stub until API exists). */
export async function enqueueOutbox(kind: string, payload: unknown) {
  await sqliteOutboxAdd({
    kind,
    payloadJson: JSON.stringify(payload),
    createdAt: Date.now(),
    synced: 0,
  });
}

/** When online, replay pending rows to backend and mark successful rows synced locally. */
export async function flushOutboxIfOnline(): Promise<number> {
  if (typeof navigator !== "undefined" && !navigator.onLine) return 0;
  const pendingRows = await sqliteOutboxListPending();
  if (!pendingRows.length) return 0;
  await replayOutbox(
    pendingRows.map((row) => ({
      kind: row.kind,
      payload: JSON.parse(row.payloadJson),
    })),
  );
  const ids = pendingRows.map((row) => row.id).filter((value): value is number => typeof value === "number");
  return sqliteOutboxMarkSyncedByIds(ids);
}
