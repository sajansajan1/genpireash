import { creatorProfile } from "@/lib/types/tech-packs";
import { create } from "zustand";

type State = {
  getCreatorProfile: creatorProfile | null;
  loadingCreatorProfile: boolean;
  errorCreatorProfile: string | null;
  hasFetched: boolean;
  fetchCreatorProfile: () => Promise<void>;
  refreshCreatorProfile: () => Promise<void>;
};

export const useCreatorProfileStore = create<State>((set, get) => ({
  getCreatorProfile: null,
  loadingCreatorProfile: false,
  errorCreatorProfile: null,
  hasFetched: false,

  fetchCreatorProfile: async () => {
    if (get().hasFetched) return;

    set({ loadingCreatorProfile: true, errorCreatorProfile: null });

    try {
      const res = await fetch("/api/creator/get-creatorProfile");
      if (!res.ok) {
        const err = await res.json();
        set({ errorCreatorProfile: err.error || "Failed to fetch", loadingCreatorProfile: false });
        return;
      }

      const ideas = await res.json();
      set({ getCreatorProfile: ideas, loadingCreatorProfile: false, hasFetched: true });
    } catch (error) {
      set({ errorCreatorProfile: "Unexpected error", loadingCreatorProfile: false });
    }
  },

  refreshCreatorProfile: async () => {
    set({ hasFetched: false });
    await get().fetchCreatorProfile();
  },
}));
