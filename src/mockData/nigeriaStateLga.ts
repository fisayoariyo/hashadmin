import nigeriaStateLgaData from "nigeria-state-lga-data";

export type NigeriaStateLgaDirectory = {
  states: string[];
  lgasByState: Record<string, string[]>;
};

type RemoteStateRecord = {
  name: string;
  lgas: string[];
};

const normalizeState = (value: string) => value.trim().toLowerCase();

function toDirectory(records: RemoteStateRecord[]): NigeriaStateLgaDirectory {
  const lgasByState: Record<string, string[]> = {};
  const states = records
    .map((s) => s.name)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  for (const state of states) {
    const match = records.find((r) => normalizeState(r.name) === normalizeState(state));
    lgasByState[state] = (match?.lgas ?? []).slice().sort((a, b) => a.localeCompare(b));
  }

  return { states, lgasByState };
}

const localDirectory = toDirectory(
  nigeriaStateLgaData.getStatesData().map((s) => ({
    name: s.name,
    lgas: s.lgas ?? [],
  })),
);

export function getLocalNigeriaStateLgaDirectory(): NigeriaStateLgaDirectory {
  return localDirectory;
}

function parseRemotePayload(payload: unknown): RemoteStateRecord[] | null {
  if (!payload || typeof payload !== "object") return null;

  const candidate = payload as {
    states?: unknown;
    data?: unknown;
  };

  const records = Array.isArray(candidate.states)
    ? candidate.states
    : Array.isArray(candidate.data)
      ? candidate.data
      : null;

  if (!records) return null;

  const normalized = records
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const value = item as { name?: unknown; lgas?: unknown };
      if (typeof value.name !== "string" || !Array.isArray(value.lgas)) return null;
      return {
        name: value.name,
        lgas: value.lgas.filter((x): x is string => typeof x === "string"),
      };
    })
    .filter((x): x is RemoteStateRecord => Boolean(x));

  return normalized.length > 0 ? normalized : null;
}

/**
 * API-ready loader.
 * - If `VITE_NIGERIA_LOCATIONS_ENDPOINT` is set, it tries backend first.
 * - On any failure, it falls back to local package data.
 */
export async function loadNigeriaStateLgaDirectory(): Promise<NigeriaStateLgaDirectory> {
  const endpoint = import.meta.env.VITE_NIGERIA_LOCATIONS_ENDPOINT as string | undefined;
  if (!endpoint) return localDirectory;

  try {
    const response = await fetch(endpoint, { method: "GET" });
    if (!response.ok) throw new Error(`Location API failed with ${response.status}`);
    const payload = (await response.json()) as unknown;
    const records = parseRemotePayload(payload);
    if (!records) throw new Error("Invalid location payload");
    return toDirectory(records);
  } catch {
    return localDirectory;
  }
}

export function getLgasForState(
  directory: NigeriaStateLgaDirectory,
  stateName: string,
): string[] {
  const state = directory.states.find((s) => normalizeState(s) === normalizeState(stateName));
  if (!state) return [];
  return directory.lgasByState[state] ?? [];
}
