declare module "nigeria-state-lga-data" {
  export type NigeriaStateData = {
    name: string;
    capital: string;
    lgas: string[];
    towns: string[];
  };

  const api: {
    getStates: () => string[];
    getLgas: (state: string) => string[];
    getStatesData: () => NigeriaStateData[];
  };

  export default api;
}
