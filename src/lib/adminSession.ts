import type { AdminSessionRecord } from "@/db/adminSqlite";
import {
  sqliteDeleteSession,
  sqliteGetSession,
  sqlitePutSession,
} from "@/db/adminSqlite";

const LS_KEY = "hashmar_admin_session_v1";

export type { AdminSessionRecord };

export async function getAdminSession(): Promise<AdminSessionRecord | undefined> {
  const row = await sqliteGetSession();
  if (row) return row;
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as Partial<AdminSessionRecord>;
    if (parsed?.email) {
      const rec: AdminSessionRecord = {
        key: "current",
        email: parsed.email,
        displayName: parsed.displayName ?? "Admin",
        createdAt: parsed.createdAt ?? Date.now(),
      };
      await sqlitePutSession(rec);
      return rec;
    }
  } catch {
    /* ignore */
  }
  return undefined;
}

export async function saveAdminSession(email: string, displayName = "Admin") {
  const rec: AdminSessionRecord = {
    key: "current",
    email,
    displayName,
    createdAt: Date.now(),
  };
  await sqlitePutSession(rec);
  localStorage.setItem(LS_KEY, JSON.stringify(rec));
}

export async function clearAdminSession() {
  await sqliteDeleteSession();
  localStorage.removeItem(LS_KEY);
}
