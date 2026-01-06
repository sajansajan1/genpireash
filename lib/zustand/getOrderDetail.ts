import { create } from "zustand";

type State = {
  getOrderDetail: any | null;
  loadingGetOrderDetail: boolean;
  errorGetOrderDetail: string | null;
  hasFetched: boolean;
  fetchGetOrderDetail: (techPackId: string) => Promise<void>;
  refreshGetOrderDetail: () => void;
};

export const useGetOrderDetailStore = create<State>((set, get) => ({
  getOrderDetail: null,
  loadingGetOrderDetail: false,
  errorGetOrderDetail: null,
  hasFetched: false,

  fetchGetOrderDetail: async (techPackId: string) => {
    if (get().hasFetched) return;

    set({ loadingGetOrderDetail: true, errorGetOrderDetail: null });

    try {
      const res = await fetch(`/api/get-order-detail?tech_pack_id=${techPackId}`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const err = await res.json();
        set({
          errorGetOrderDetail: err.error || "Failed to fetch",
          loadingGetOrderDetail: false,
        });
        return;
      }

      const data = await res.json();

      if (!data || Object.keys(data).length === 0) {
        set({
          getOrderDetail: null,
          loadingGetOrderDetail: false,
          hasFetched: true,
        });
      } else {
        set({
          getOrderDetail: data,
          loadingGetOrderDetail: false,
          hasFetched: true,
        });
      }
    } catch (error) {
      set({
        errorGetOrderDetail: "Unexpected error",
        loadingGetOrderDetail: false,
      });
    }
  },

  refreshGetOrderDetail: () => {
    set({ hasFetched: false });
  },
}));
