import { create } from "zustand";

type State = {
  GetSuppliers: any | null;
  loadingGetSuppliers: boolean;
  errorGetSuppliers: string | null;
  hasFetchedGetSuppliers: boolean;
  fetchGetSuppliers: () => Promise<void>;
  refresGetSuppliers: () => Promise<void>;
};

export const useGetSuppliersStore = create<State>((set, get) => ({
  GetSuppliers: null,
  loadingGetSuppliers: false,
  errorGetSuppliers: null,
  hasFetchedGetSuppliers: false,

  fetchGetSuppliers: async () => {
    if (get().hasFetchedGetSuppliers) return;

    set({ loadingGetSuppliers: true, errorGetSuppliers: null });

    try {
      const res = await fetch("/api/admin/suppliers/get-suppliers");
      console.log("res ==> ", res);
      if (!res.ok) {
        const err = await res.json();
        set({ errorGetSuppliers: err.error || "Failed to fetch", loadingGetSuppliers: false });
        return;
      }

      const credits = await res.json();
      console.log("credits ==> ", credits);
      set({ GetSuppliers: credits, loadingGetSuppliers: false, hasFetchedGetSuppliers: true });
    } catch (error) {
      set({ errorGetSuppliers: "Unexpected error", loadingGetSuppliers: false });
    }
  },

  refresGetSuppliers: async () => {
    set({ hasFetchedGetSuppliers: false });
    await get().fetchGetSuppliers();
  },
}));
