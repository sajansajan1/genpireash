import { create } from "zustand";

type State = {
  getCreatorCollection: any | null;
  loadingGetCreatorCollection: boolean;
  errorGetCreatorCollection: string | null;
  hasFetchedCreatorCollection: boolean;
  fetchCreatorCollection: () => Promise<void>;
  refresCreatorCollection: () => Promise<void>;
};

export const useGetCreatorCollectionStore = create<State>((set, get) => ({
  getCreatorCollection: null,
  loadingGetCreatorCollection: false,
  errorGetCreatorCollection: null,
  hasFetchedCreatorCollection: false,

  fetchCreatorCollection: async () => {
    if (get().hasFetchedCreatorCollection) return;

    set({ loadingGetCreatorCollection: true, errorGetCreatorCollection: null });

    try {
      const res = await fetch("/api/ai-collections/get-all-collections");
      if (!res.ok) {
        const err = await res.json();
        set({ errorGetCreatorCollection: err.error || "Failed to fetch", loadingGetCreatorCollection: false });
        return;
      }

      const ideas = await res.json();
      set({ getCreatorCollection: ideas, loadingGetCreatorCollection: false, hasFetchedCreatorCollection: true });
    } catch (error) {
      set({ errorGetCreatorCollection: "Unexpected error", loadingGetCreatorCollection: false });
    }
  },

  refresCreatorCollection: async () => {
    try {
      const res = await fetch("/api/ai-collections/get-all-collections");
      const ideas = await res.json();
      set({ getCreatorCollection: ideas, loadingGetCreatorCollection: false, hasFetchedCreatorCollection: true });
    } catch (error) {
      console.error("Error refreshing collection:", error);
      // set({ loadingGetCreatorDna: false });
    }
  },
}));
