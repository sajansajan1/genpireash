import { create } from "zustand";

type State = {
  GetAmbassador: any | null;
  loadingGetAmbassador: boolean;
  errorGetAmbassador: string | null;
  hasFetchedGetAmbassador: boolean;
  fetchGetAmbassador: () => Promise<void>;
  refreshGetAmbassador: () => Promise<void>;
};

export const useGetAmbassadorStore = create<State>((set, get) => ({
  GetAmbassador: null,
  loadingGetAmbassador: false,
  errorGetAmbassador: null,
  hasFetchedGetAmbassador: false,

  fetchGetAmbassador: async () => {
    if (get().hasFetchedGetAmbassador) return;

    set({ loadingGetAmbassador: true, errorGetAmbassador: null });

    try {
      const res = await fetch("/api/ambassador/get-ambassador");
      if (!res.ok) {
        const err = await res.json();
        set({ errorGetAmbassador: err.error || "Failed to fetch", loadingGetAmbassador: false });
        return;
      }

      const ideas = await res.json();
      set({ GetAmbassador: ideas, loadingGetAmbassador: false, hasFetchedGetAmbassador: true });
    } catch (error) {
      set({ errorGetAmbassador: "Unexpected error", loadingGetAmbassador: false });
    }
  },

  refreshGetAmbassador: async () => {
    set({ hasFetchedGetAmbassador: false });
    await get().fetchGetAmbassador();
  },
}));
