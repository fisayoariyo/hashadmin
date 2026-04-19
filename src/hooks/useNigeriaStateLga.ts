import { useEffect, useMemo, useState } from "react";
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

  useEffect(() => {
    let alive = true;
    loadNigeriaStateLgaDirectory().then((data) => {
      if (alive) setDirectory(data);
    });
    return () => {
      alive = false;
    };
  }, []);

  return useMemo(
    () => ({
      states: directory.states,
      lgasByState: directory.lgasByState,
      getLgasForState: (stateName: string) => getLgasForState(directory, stateName),
    }),
    [directory],
  );
}
