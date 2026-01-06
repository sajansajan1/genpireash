import { creatorProfile } from "@/lib/types/tech-packs";
import { create } from "zustand";

type State = {
  createCreatorProfile: any | null;
  loadingCreateCreatorProfile: boolean;
  errorCreateCreatorProfile: string | null;
  hasFetchedCreateCreatorProfile: boolean;
  setCreateCreatorProfile: (payload: creatorProfile) => Promise<void>;
  refreshCreateCreatorProfile: () => Promise<void>;
};

export const useCreateCreatorProfileStore = create<State>((set, get) => ({
  createCreatorProfile: null,
  loadingCreateCreatorProfile: false,
  errorCreateCreatorProfile: null,
  hasFetchedCreateCreatorProfile: false,

  setCreateCreatorProfile: async (payload) => {
    set({ loadingCreateCreatorProfile: true, errorCreateCreatorProfile: null });

    try {
      const res = await fetch("/api/creator/create-creator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        set({
          errorCreateCreatorProfile: err.error || "Failed to fetch",
          loadingCreateCreatorProfile: false,
        });
        return;
      }

      const data = await res.json();
      set({
        createCreatorProfile: data,
        loadingCreateCreatorProfile: false,
        hasFetchedCreateCreatorProfile: true,
      });
    } catch (error) {
      set({
        errorCreateCreatorProfile: "Unexpected error",
        loadingCreateCreatorProfile: false,
      });
    }
  },

  refreshCreateCreatorProfile: async () => {
    set({ hasFetchedCreateCreatorProfile: false });
  },
}));
