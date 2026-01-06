import { create } from "zustand";

type State = {
  GetCollection: any | null;
  loadingGetCollection: boolean;
  errorGetCollection: string | null;
  hasFetched: boolean;
  fetchGetCollection: (params: { id: any }) => Promise<void>;
  refreshGetCollection: (params: { id: string }) => Promise<void>;
  setGetCollection: (updated: any) => void;
};

export const useGetCollectionStore = create<State>((set, get) => ({
  GetCollection: null,
  loadingGetCollection: false,
  errorGetCollection: null,
  hasFetched: false,

  fetchGetCollection: async ({ id }) => {
    if (get().hasFetched || !id) return;
    console.log(id, "id");
    set({ loadingGetCollection: true, errorGetCollection: null });

    try {
      const res = await fetch("/api/ai-collections/get-collection", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const err = await res.json();
        set({
          errorGetCollection: err.error || "Failed to fetch",
          loadingGetCollection: false,
        });
        return;
      }

      const data = await res.json();
      console.log("data ==> ", data);
      set({
        GetCollection: data.collection,
        loadingGetCollection: false,
        hasFetched: true,
      });
    } catch (error) {
      set({
        errorGetCollection: "Unexpected error",
        loadingGetCollection: false,
      });
    }
  },

  refreshGetCollection: async (params) => {
    set({ hasFetched: false });
    await get().fetchGetCollection(params);
  },
  setGetCollection: (updated) => set({ GetCollection: updated }),
}));
