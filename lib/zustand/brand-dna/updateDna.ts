import { create } from "zustand";

type State = {
  updateCreatorDna: any | null;
  loadingUpdateCreatorDna: boolean;
  errorUpdateCreatorDna: string | null;
  hasFetchedUpdateCreatorDna: boolean;
  setUpdateCreatorDna: (payload: any) => Promise<{ success: boolean; error?: any; data?: any | null }>;
};

export const useUpdateCreatorDnaStore = create<State>((set, get) => ({
  updateCreatorDna: null,
  loadingUpdateCreatorDna: false,
  errorUpdateCreatorDna: null,
  hasFetchedUpdateCreatorDna: false,

  setUpdateCreatorDna: async (payload) => {
    set({ loadingUpdateCreatorDna: true, errorUpdateCreatorDna: null });

    try {
      const res = await fetch("/api/brand-dna/update-dna", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const dna = await res.json();
      console.log("API response ==> ", dna);

      if (!res.ok) {
        set({
          errorUpdateCreatorDna: dna.error || "Failed to fetch",
          loadingUpdateCreatorDna: false,
        });
        return { success: false, error: dna.error || "Failed to fetch" };
      }

      const updatedProfile = Array.isArray(dna.data) && dna.data.length > 0 ? dna.data[0] : null;

      set({
        updateCreatorDna: updatedProfile,
        loadingUpdateCreatorDna: false,
        hasFetchedUpdateCreatorDna: true,
      });

      return { success: true, data: updatedProfile };
    } catch (error) {
      set({
        errorUpdateCreatorDna: "Unexpected error",
        loadingUpdateCreatorDna: false,
      });
      return { success: false, error: "Unexpected error" };
    }
  },
}));
