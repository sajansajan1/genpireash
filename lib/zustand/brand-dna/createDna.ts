import { create } from "zustand";

type State = {
  createDna: any | null;
  loadingCreateDna: boolean;
  errorCreateDna: string | null;
  hasFetchedCreateDna: boolean;
  setCreateDna: (payload: any) => Promise<{ success: boolean; error?: any; data?: any | null }>;
  refreshCreateDna: () => Promise<void>;
};

export const useCreateDnaStore = create<State>((set, get) => ({
  createDna: null,
  loadingCreateDna: false,
  errorCreateDna: null,
  hasFetchedCreateDna: false,

  setCreateDna: async (payload) => {
    set({ loadingCreateDna: true, errorCreateDna: null });

    try {
      const res = await fetch("/api/brand-dna/create-dna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const error = data?.error || "Failed to create DNA";
        set({ errorCreateDna: error, loadingCreateDna: false });
        return { success: false, error };
      }

      set({
        createDna: data,
        loadingCreateDna: false,
        hasFetchedCreateDna: true,
      });

      return { success: true, data };
    } catch (error) {
      set({
        errorCreateDna: "Unexpected error occurred",
        loadingCreateDna: false,
      });
      return { success: false, error: "Unexpected error occurred" };
    }
  },

  refreshCreateDna: async () => {
    set({ hasFetchedCreateDna: false });
  },
}));
