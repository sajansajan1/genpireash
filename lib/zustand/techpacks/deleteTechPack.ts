import { create } from "zustand";

type DeleteResponse = {
  success: boolean;
  message: string;
};

type State = {
  deleteTechPack: DeleteResponse | null;
  loadingDeleteTechPack: boolean;
  errorDeleteTechPack: string | null;
  hasFetchedDeleteTechPack: boolean;
  setDeleteTechPack: (techPackId: string) => Promise<DeleteResponse>;
};

export const useDeleteTechPackStore = create<State>((set) => ({
  deleteTechPack: null,
  loadingDeleteTechPack: false,
  errorDeleteTechPack: null,
  hasFetchedDeleteTechPack: false,

  setDeleteTechPack: async (techPackId: string) => {
    set({ loadingDeleteTechPack: true, errorDeleteTechPack: null });

    try {
      const res = await fetch(`/api/tech-pack/delete-techpack?project_id=${techPackId}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const data: DeleteResponse = await res.json();

      if (!res.ok) {
        set({
          errorDeleteTechPack: data?.message || "Failed to delete tech pack",
          loadingDeleteTechPack: false,
        });
        return { success: false, message: data?.message || "Failed to delete tech pack" };
      }

      set({
        deleteTechPack: data,
        loadingDeleteTechPack: false,
        hasFetchedDeleteTechPack: true,
      });

      return data;
    } catch (error) {
      set({
        errorDeleteTechPack: "Unexpected error occurred",
        loadingDeleteTechPack: false,
      });

      return { success: false, message: "Unexpected error occurred" };
    }
  },
}));
