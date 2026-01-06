import { create } from "zustand";

type State = {
  getTechPack: any | null;
  loadingGetTechPack: boolean;
  errorGetTechPack: string | null;
  hasFetched: boolean;
  fetchGetTechPack: (params: { id: any }) => Promise<void>;
  refreshGetTechPack: (params: { id: string }) => Promise<void>;
  setGetTechPack: (updated: any) => void; // 🔧 Add this
};

export const useGetTechPackStore = create<State>((set, get) => ({
  getTechPack: null,
  loadingGetTechPack: false,
  errorGetTechPack: null,
  hasFetched: false,

  fetchGetTechPack: async ({ id }) => {
    if (get().hasFetched || !id) return;

    set({ loadingGetTechPack: true, errorGetTechPack: null });

    try {
      const res = await fetch("/api/tech-pack/get-techpack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const err = await res.json();
        set({
          errorGetTechPack: err.error || "Failed to fetch",
          loadingGetTechPack: false,
        });
        return;
      }

      const data = await res.json();
      set({
        getTechPack: data.productIdea,
        loadingGetTechPack: false,
        hasFetched: true,
      });
    } catch (error) {
      set({
        errorGetTechPack: "Unexpected error",
        loadingGetTechPack: false,
      });
    }
  },

  refreshGetTechPack: async (params) => {
    set({ hasFetched: false });
    await get().fetchGetTechPack(params);
  },
  setGetTechPack: (updated) => set({ getTechPack: updated }),
}));
