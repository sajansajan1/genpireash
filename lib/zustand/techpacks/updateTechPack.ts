import { create } from "zustand";

type State = {
  updateTechPack: any | null;
  loadingUpdateTechPack: boolean;
  errorUpdateTechPack: string | null;
  hasFetchedUpdateTechPack: boolean;
  setUpdateTechPack: (
    project_id: string,
    updatedTechpack: any
  ) => Promise<{ success: boolean; error?: any; data?: any | null }>;
};

export const useUpdateTechPackStore = create<State>((set, get) => ({
  updateTechPack: null,
  loadingUpdateTechPack: false,
  errorUpdateTechPack: null,
  hasFetchedUpdateTechPack: false,

  setUpdateTechPack: async (project_id, updatedTechpack) => {
    set({ loadingUpdateTechPack: true, errorUpdateTechPack: null });

    try {
      const payload = {
        project_id,
        updatedTechpack,
      };

      const res = await fetch("/api/tech-pack/update-techpack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseData = await res.json();
      console.log("API response ==> ", responseData);

      if (!res.ok) {
        set({
          errorUpdateTechPack: responseData.error || "Failed to update",
          loadingUpdateTechPack: false,
        });
        return { success: false, error: responseData.error || "Failed to update" };
      }

      set({
        updateTechPack: responseData,
        loadingUpdateTechPack: false,
        hasFetchedUpdateTechPack: true,
      });

      return { success: true, data: responseData };
    } catch (error) {
      set({
        errorUpdateTechPack: "Unexpected error",
        loadingUpdateTechPack: false,
      });
      return { success: false, error: "Unexpected error" };
    }
  },
}));
