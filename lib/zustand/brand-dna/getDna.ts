import { create } from "zustand";

type State = {
  getCreatorDna: any[] | null;
  loadingGetCreatorDna: boolean;
  errorGetCreatorDna: string | null;
  hasFetchedCreatorDna: boolean;
  fetchCreatorDna: () => Promise<void>;
  FetchAgainCreatorDna: () => Promise<void>;
  refresCreatorDna: () => Promise<void>;
  getActiveDna: () => any | null;
};

export const useGetCreatorDnaStore = create<State>((set, get) => ({
  getCreatorDna: null,
  loadingGetCreatorDna: false,
  errorGetCreatorDna: null,
  hasFetchedCreatorDna: false,

  getActiveDna: () => {
    const dnas = get().getCreatorDna;
    if (!dnas || dnas.length === 0) return null;
    return dnas.find((dna: any) => dna.status === true) || null;
  },

  fetchCreatorDna: async () => {
    if (get().hasFetchedCreatorDna) return;

    set({ loadingGetCreatorDna: true, errorGetCreatorDna: null });

    try {
      const res = await fetch("/api/brand-dna/get-dna");
      if (!res.ok) {
        const err = await res.json();
        set({ errorGetCreatorDna: err.error || "Failed to fetch", loadingGetCreatorDna: false });
        return;
      }

      const dnas = await res.json();
      // Store empty array if no DNAs exist, otherwise store the array
      set({ getCreatorDna: dnas || [], loadingGetCreatorDna: false, hasFetchedCreatorDna: true });
    } catch (error) {
      console.error("Error fetching Brand DNA:", error);
      set({ errorGetCreatorDna: "Unexpected error", loadingGetCreatorDna: false });
    }
  },

  FetchAgainCreatorDna: async () => {
    set({ hasFetchedCreatorDna: false });
    await get().fetchCreatorDna();
  },
  refresCreatorDna: async () => {
    // set({ loadingGetCreatorDna: true });
    try {
      const res = await fetch("/api/brand-dna/get-dna");
      const dnas = await res.json();
      set({ getCreatorDna: dnas || [], loadingGetCreatorDna: false, hasFetchedCreatorDna: true });
    } catch (error) {
      console.error("Error refreshing Brand DNA:", error);
      // set({ loadingGetCreatorDna: false });
    }
  },
}));
