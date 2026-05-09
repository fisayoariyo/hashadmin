import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getGeoLgas, getGeoStates } from "@/lib/adminApi";

type NigeriaStateLgaDirectory = {
  states: string[];
  stateIdByName: Record<string, string>;
  lgasByState: Record<string, string[]>;
};

const GEO_CACHE_KEY = "hashmar_admin_geo_directory_v1";

function readGeoCache(): NigeriaStateLgaDirectory | null {
  try {
    const raw = sessionStorage.getItem(GEO_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<NigeriaStateLgaDirectory>;
    if (!parsed || typeof parsed !== "object") return null;
    if (!Array.isArray(parsed.states)) return null;
    if (!parsed.stateIdByName || typeof parsed.stateIdByName !== "object") return null;
    if (!parsed.lgasByState || typeof parsed.lgasByState !== "object") return null;
    return {
      states: parsed.states.filter((item): item is string => typeof item === "string"),
      stateIdByName: parsed.stateIdByName as Record<string, string>,
      lgasByState: parsed.lgasByState as Record<string, string[]>,
    };
  } catch {
    return null;
  }
}

function writeGeoCache(directory: NigeriaStateLgaDirectory) {
  try {
    sessionStorage.setItem(GEO_CACHE_KEY, JSON.stringify(directory));
  } catch {
    // Ignore storage quota/private mode errors.
  }
}

export function useNigeriaStateLga() {
  const [directory, setDirectory] = useState<NigeriaStateLgaDirectory>(() => {
    return (
      readGeoCache() || {
        states: [],
        stateIdByName: {},
        lgasByState: {},
      }
    );
  });
  const [source, setSource] = useState<"backend" | "local">("backend");
  const lgaLoadInFlight = useRef<Set<string>>(new Set());

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const states = await getGeoStates();
        if (!states.length) return;
        const stateIdByName = states.reduce<Record<string, string>>((acc, state) => {
          acc[state.name] = state.id;
          return acc;
        }, {});

        if (alive) {
          setDirectory((prev) => ({
            states: states.map((item) => item.name),
            stateIdByName,
            lgasByState: prev.lgasByState,
          }));
          setSource("backend");
        }
      } catch {
        if (alive) {
          setDirectory((prev) => prev);
        }
      }
    }

    if (directory.states.length > 0) {
      setSource("local");
    }
    void load();
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    writeGeoCache(directory);
  }, [directory]);

  const getLgasForState = useCallback(
    (stateName: string) => {
      const existing = directory.lgasByState[stateName];
      if (existing && existing.length) return existing;

      const stateId = directory.stateIdByName[stateName];
      if (!stateId) return [];
      if (lgaLoadInFlight.current.has(stateName)) return [];

      lgaLoadInFlight.current.add(stateName);
      void getGeoLgas(stateId)
        .then((lgas) => {
          setDirectory((prev) => ({
            ...prev,
            lgasByState: {
              ...prev.lgasByState,
              [stateName]: lgas.map((item) => item.name),
            },
          }));
        })
        .finally(() => {
          lgaLoadInFlight.current.delete(stateName);
        });

      return [];
    },
    [directory.lgasByState, directory.stateIdByName],
  );

  return useMemo(
    () => ({
      states: directory.states,
      lgasByState: directory.lgasByState,
      getLgasForState,
      source,
    }),
    [directory, getLgasForState, source],
  );
}
