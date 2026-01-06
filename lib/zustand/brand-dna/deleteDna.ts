import { create } from "zustand";

type DeleteResponse = {
  success: boolean;
  message: string;
};

type State = {
  DeleteDna: DeleteResponse | null;
  loadingDeleteDna: boolean;
  errorDeleteDna: string | null;
  hasFetchedDeleteDna: boolean;
  setDeleteDna: (techPackId: string) => Promise<DeleteResponse>;
};

export const useDeleteDnaStore = create<State>((set) => ({
  DeleteDna: null,
  loadingDeleteDna: false,
  errorDeleteDna: null,
  hasFetchedDeleteDna: false,

  setDeleteDna: async (id: string) => {
    set({ loadingDeleteDna: true, errorDeleteDna: null });

    try {
      const res = await fetch(`/api/brand-dna/delete-dna?project_id=${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });

      const data: DeleteResponse = await res.json();

      if (!res.ok) {
        set({
          errorDeleteDna: data?.message || "Failed to delete dna",
          loadingDeleteDna: false,
        });
        return { success: false, message: data?.message || "Failed to delete dna" };
      }

      set({
        DeleteDna: data,
        loadingDeleteDna: false,
        hasFetchedDeleteDna: true,
      });

      return data;
    } catch (error) {
      set({
        errorDeleteDna: "Unexpected error occurred",
        loadingDeleteDna: false,
      });

      return { success: false, message: "Unexpected error occurred" };
    }
  },
}));
