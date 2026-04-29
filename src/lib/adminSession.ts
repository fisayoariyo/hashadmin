import type { AdminSessionRecord } from "@/db/adminSqlite";
import {
  sqliteDeleteSession,
  sqliteGetSession,
  sqlitePutSession,
} from "@/db/adminSqlite";

const LS_KEY = "hashmar_admin_session_v1";

export type { AdminSessionRecord };

type StoredAdminAuthState = Partial<AdminSessionRecord> & {
  accessToken?: string;
  refreshToken?: string;
  userId?: string;
  role?: string;
};

function readStoredAuthState(): StoredAdminAuthState | undefined {
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw) as StoredAdminAuthState;
    return parsed && typeof parsed === "object" ? parsed : undefined;
  } catch {
    return undefined;
  }
}

function writeStoredAuthState(state: StoredAdminAuthState) {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

export async function getAdminSession(): Promise<AdminSessionRecord | undefined> {
  const row = await sqliteGetSession();
  if (row) return row;
  try {
    const parsed = readStoredAuthState();
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

export function getAdminAuthState() {
  return readStoredAuthState();
}

export async function saveAdminSession(
  email: string,
  displayName = "Admin",
  authState: Omit<StoredAdminAuthState, "email" | "displayName" | "createdAt"> = {},
) {
  const rec: AdminSessionRecord = {
    key: "current",
    email,
    displayName,
    createdAt: Date.now(),
  };
  await sqlitePutSession(rec);
  writeStoredAuthState({
    ...authState,
    email: rec.email,
    displayName: rec.displayName,
    createdAt: rec.createdAt,
  });
}

export async function updateAdminTokens(tokens: {
  accessToken?: string;
  refreshToken?: string;
}) {
  const current = readStoredAuthState();
  if (!current?.email) return;
  writeStoredAuthState({
    ...current,
    accessToken: tokens.accessToken || current.accessToken,
    refreshToken: tokens.refreshToken || current.refreshToken,
  });
}

export async function clearAdminSession() {
  await sqliteDeleteSession();
  localStorage.removeItem(LS_KEY);
}
