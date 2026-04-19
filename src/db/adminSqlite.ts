import initSqlJs, { type Database, type SqlJsStatic } from "sql.js";

/** Single-row session stored offline (SQLite snapshot persisted in IndexedDB). */
export type AdminSessionRecord = {
  key: "current";
  email: string;
  displayName: string;
  createdAt: number;
};

/** Queue for changes to push when the app is online again. */
export type SyncOutboxRecord = {
  id?: number;
  kind: string;
  payloadJson: string;
  createdAt: number;
  /** 0 = pending sync, 1 = synced (mock or server ack). */
  synced: 0 | 1;
};

const SQL_JS_VERSION = "1.14.1";

const IDB_NAME = "hashmar_admin_sqlite_meta";
const IDB_VERSION = 1;
const IDB_STORE = "kv";
const SNAPSHOT_KEY = "sqlite_snapshot";

let sqlModulePromise: Promise<SqlJsStatic> | null = null;
let dbPromise: Promise<Database> | null = null;
let writeChain: Promise<void> = Promise.resolve();

function getSqlModule(): Promise<SqlJsStatic> {
  if (!sqlModulePromise) {
    sqlModulePromise = initSqlJs({
      locateFile: (file: string) =>
        `https://cdn.jsdelivr.net/npm/sql.js@${SQL_JS_VERSION}/dist/${file}`,
    });
  }
  return sqlModulePromise;
}

function openIdb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(IDB_NAME, IDB_VERSION);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB open failed"));
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = () => {
      const idb = req.result;
      if (!idb.objectStoreNames.contains(IDB_STORE)) idb.createObjectStore(IDB_STORE);
    };
  });
}

async function readSnapshot(): Promise<Uint8Array | null> {
  const idb = await openIdb();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(IDB_STORE, "readonly");
    const r = tx.objectStore(IDB_STORE).get(SNAPSHOT_KEY);
    r.onerror = () => {
      idb.close();
      reject(r.error);
    };
    r.onsuccess = () => {
      idb.close();
      const v = r.result;
      resolve(v ? new Uint8Array(v as ArrayBuffer) : null);
    };
  });
}

async function writeSnapshot(data: Uint8Array): Promise<void> {
  const idb = await openIdb();
  return new Promise((resolve, reject) => {
    const tx = idb.transaction(IDB_STORE, "readwrite");
    tx.oncomplete = () => {
      idb.close();
      resolve();
    };
    tx.onerror = () => {
      idb.close();
      reject(tx.error);
    };
    tx.objectStore(IDB_STORE).put(data.buffer, SNAPSHOT_KEY);
  });
}

async function persist(db: Database): Promise<void> {
  const data = db.export();
  await writeSnapshot(data);
}

function ensureSchema(db: Database): void {
  db.run(`
    CREATE TABLE IF NOT EXISTS session (
      key TEXT PRIMARY KEY,
      email TEXT NOT NULL,
      display_name TEXT NOT NULL,
      created_at INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS outbox (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      kind TEXT NOT NULL,
      payload_json TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      synced INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_outbox_synced ON outbox(synced, created_at);
  `);
}

async function openDatabase(): Promise<Database> {
  const SQL = await getSqlModule();
  const snapshot = await readSnapshot();
  const db = snapshot?.byteLength ? new SQL.Database(snapshot) : new SQL.Database();
  ensureSchema(db);
  if (!snapshot?.byteLength) await persist(db);
  return db;
}

function getDb(): Promise<Database> {
  if (!dbPromise) dbPromise = openDatabase();
  return dbPromise;
}

/** Serialize writes + snapshot export so concurrent callers stay consistent. */
function withWrite<T>(fn: (db: Database) => T | Promise<T>): Promise<T> {
  const run = async () => {
    const db = await getDb();
    return fn(db);
  };
  const next = writeChain.then(run, run);
  writeChain = next.then(
    () => undefined,
    () => undefined,
  );
  return next;
}

export async function sqliteGetSession(): Promise<AdminSessionRecord | undefined> {
  const db = await getDb();
  const stmt = db.prepare(
    "SELECT email, display_name, created_at FROM session WHERE key = 'current' LIMIT 1",
  );
  try {
    if (!stmt.step()) return undefined;
    const row = stmt.get() as [string, string, number];
    return {
      key: "current",
      email: row[0],
      displayName: row[1],
      createdAt: row[2],
    };
  } finally {
    stmt.free();
  }
}

export async function sqlitePutSession(rec: AdminSessionRecord): Promise<void> {
  await withWrite(async (db) => {
    db.run(
      "INSERT OR REPLACE INTO session (key, email, display_name, created_at) VALUES ('current', ?, ?, ?)",
      [rec.email, rec.displayName, rec.createdAt],
    );
    await persist(db);
  });
}

export async function sqliteDeleteSession(): Promise<void> {
  await withWrite(async (db) => {
    db.run("DELETE FROM session WHERE key = 'current'");
    await persist(db);
  });
}

export async function sqliteOutboxAdd(row: Omit<SyncOutboxRecord, "id">): Promise<void> {
  await withWrite(async (db) => {
    db.run(
      "INSERT INTO outbox (kind, payload_json, created_at, synced) VALUES (?, ?, ?, ?)",
      [row.kind, row.payloadJson, row.createdAt, row.synced],
    );
    await persist(db);
  });
}

/** Mark all pending outbox rows synced in one write + snapshot (used when browser is online). */
export async function sqliteOutboxMarkAllPendingSynced(): Promise<number> {
  return withWrite(async (db) => {
    db.run("UPDATE outbox SET synced = 1 WHERE synced = 0");
    const n = db.getRowsModified();
    await persist(db);
    return n;
  });
}
