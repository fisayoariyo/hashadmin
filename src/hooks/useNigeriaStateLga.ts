import { useEffect, useMemo, useState } from "react";
import { getGeoLgas, getGeoStates } from "@/lib/adminApi";
import {
  getLgasForState,
  getLocalNigeriaStateLgaDirectory,
  loadNigeriaStateLgaDirectory,
  type NigeriaStateLgaDirectory,
} from "@/mockData/nigeriaStateLga";

export function useNigeriaStateLga() {
  const [directory, setDirectory] = useState<NigeriaStateLgaDirectory>(
    getLocalNigeriaStateLgaDirectory(),
  );
  const [source, setSource] = useState<"backend" | "local">("local");

  useEffect(() => {
    let alive = true;
    const localDirectory = getLocalNigeriaStateLgaDirectory();

    async function load() {
      try {
        const states = await getGeoStates();
        if (!states.length) throw new Error("Geo states are empty.");

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
        return;
      } catch {
        /* fallback below */
      }

      const data = await loadNigeriaStateLgaDirectory();
      if (alive) {
        setDirectory(data.states.length ? data : localDirectory);
        setSource("local");
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
