import { useEffect, useMemo, useState } from "react";
import { getGeoLgas, getGeoStates } from "@/lib/adminApi";

type NigeriaStateLgaDirectory = {
  states: string[];
  lgasByState: Record<string, string[]>;
};

function getLgasForState(directory: NigeriaStateLgaDirectory, stateName: string) {
  return directory.lgasByState[stateName] ?? [];
}

export function useNigeriaStateLga() {
  const [directory, setDirectory] = useState<NigeriaStateLgaDirectory>({
    states: [],
    lgasByState: {},
  });
  const [source, setSource] = useState<"backend" | "local">("backend");

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const states = await getGeoStates();
        if (!states.length) return;

        const lgasByState: Record<string, string[]> = {};
        await Promise.all(
          states.map(async (state) => {
            const lgas = await getGeoLgas(state.id);
            lgasByState[state.name] = lgas.map((item) => item.name);
          }),
        );

        if (alive) {
          setDirectory({
            states: states.map((item) => item.name),
            lgasByState,
          });
          setSource("backend");
        }
      } catch {
        if (alive) {
          setDirectory({ states: [], lgasByState: {} });
        }
      }
    }

    void load();
    return () => {
      alive = false;
    };
  }, []);

  return useMemo(
    () => ({
      states: directory.states,
      lgasByState: directory.lgasByState,
      getLgasForState: (stateName: string) => getLgasForState(directory, stateName),
      source,
    }),
    [directory, source],
  );
}
