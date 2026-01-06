import { create } from "zustand";

type State = {
  CreateCollection: any | null;
  loadingCreateCollection: boolean;
  errorCreateCollection: string | null;
  hasFetchedCreateCollection: boolean;
  setCreateCollection: (payload: any) => Promise<{ success: boolean; error?: any; data?: any | null }>;
  refreshCreateCollection: () => Promise<void>;
};

export const useCreateCollectionStore = create<State>((set, get) => ({
  CreateCollection: null,
  loadingCreateCollection: false,
  errorCreateCollection: null,
  hasFetchedCreateCollection: false,

  setCreateCollection: async (payload) => {
    set({ loadingCreateCollection: true, errorCreateCollection: null });

    try {
      const res = await fetch("/api/ai-collections/create-collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const error = data?.error || "Failed to create Collection";
        set({ errorCreateCollection: error, loadingCreateCollection: false });
        return { success: false, error };
      }

      set({
        CreateCollection: data,
        loadingCreateCollection: false,
        hasFetchedCreateCollection: true,
      });

      return { success: true, data };
    } catch (error) {
      set({
        errorCreateCollection: "Unexpected error occurred",
        loadingCreateCollection: false,
      });
      return { success: false, error: "Unexpected error occurred" };
    }
  },

  refreshCreateCollection: async () => {
    set({ hasFetchedCreateCollection: false });
  },
}));
