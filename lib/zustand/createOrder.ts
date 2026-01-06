import { create } from "zustand";

type OrderPayload = {
  tech_pack_id: string;
  order_number: string;
  customer_name: string;
  delivery_date: string;
  payment_terms: string;
  minimum_order_quantity: number;
  special_instructions: string;
};
type State = {
  createOrder: any | null;
  loadingCreateOrder: boolean;
  errorCreateOrder: string | null;
  hasFetched: boolean;
  setCreateOrder: (payload: OrderPayload) => Promise<void>;
  refreshCreateOrder: () => Promise<void>;
};

export const useCreateOrderStore = create<State>((set, get) => ({
  createOrder: null,
  loadingCreateOrder: false,
  errorCreateOrder: null,
  hasFetched: false,

  setCreateOrder: async (payload) => {
    set({ loadingCreateOrder: true, errorCreateOrder: null });

    try {
      const res = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json();
        set({
          errorCreateOrder: err.error || "Failed to fetch",
          loadingCreateOrder: false,
        });
        return;
      }

      const data = await res.json();
      set({
        createOrder: data,
        loadingCreateOrder: false,
        hasFetched: true,
      });
    } catch (error) {
      set({
        errorCreateOrder: "Unexpected error",
        loadingCreateOrder: false,
      });
    }
  },

  refreshCreateOrder: async () => {
    set({ hasFetched: false });
  },
}));
