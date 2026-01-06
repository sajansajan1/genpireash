import { create } from "zustand";

type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
};

type State = {
  SupplierRfqs: any[] | null;
  loadingSupplierRfqs: boolean;
  loadingMore: boolean;
  errorSupplierRfqs: string | null;
  hasFetchedSupplierRfqs: boolean;
  pagination: PaginationInfo | null;
  fetchSupplierRfqs: (supplierId?: string, page?: number, limit?: number) => Promise<void>;
  fetchMoreSupplierRfqs: (supplierId: string) => Promise<void>;
  refreshSupplierRfqs: (supplierId: string) => Promise<void>;
};

export const useGetSupplierRfqsStore = create<State>((set, get) => ({
  SupplierRfqs: null,
  loadingSupplierRfqs: false,
  loadingMore: false,
  errorSupplierRfqs: null,
  hasFetchedSupplierRfqs: false,
  pagination: null,

  // 🔹 Fetch first page of SupplierRfqs
  fetchSupplierRfqs: async (supplierId, page = 1, limit = 10) => {
    if (!supplierId) {
      console.error("❌ Missing supplierId");
      set({ errorSupplierRfqs: "Missing creator ID" });
      return;
    }

    if (get().loadingSupplierRfqs) {
      console.log("⏸️ Already loading SupplierRfqs, skipping fetch");
      return;
    }

    console.log(`📥 Fetching SupplierRfqs for supplierId=${supplierId}, page=${page}, limit=${limit}`);
    set({ loadingSupplierRfqs: true, errorSupplierRfqs: null });

    try {
      const res = await fetch(
        `/api/supplier/rfqs/supplier/get-rfqs?supplierId=${supplierId}&page=${page}&limit=${limit}`
      );

      console.log(`📡 API response status: ${res.status}`);
      if (!res.ok) {
        const err = await res.json();
        console.error("❌ API error:", err);
        set({ errorSupplierRfqs: err.error || "Failed to fetch SupplierRfqs", loadingSupplierRfqs: false });
        return;
      }

      const response = await res.json();
      console.log(`✅ Received ${response.data?.length || 0} SupplierRfqs`);

      set({
        SupplierRfqs: response.data || [],
        pagination: response.pagination,
        loadingSupplierRfqs: false,
        hasFetchedSupplierRfqs: true,
      });
    } catch (error) {
      console.error("❌ Fetch SupplierRfqs error:", error);
      set({ errorSupplierRfqs: "Unexpected error", loadingSupplierRfqs: false });
    }
  },

  // 🔹 Fetch next page of SupplierRfqs (pagination)
  fetchMoreSupplierRfqs: async (supplierId) => {
    const { pagination, SupplierRfqs, loadingMore } = get();

    if (loadingMore) {
      console.log("⏸️ Already loading more SupplierRfqs, skipping");
      return;
    }
    if (!pagination?.hasMore) {
      console.log("🛑 No more SupplierRfqs to load");
      return;
    }
    if (!SupplierRfqs) {
      console.log("🛑 No SupplierRfqs loaded yet");
      return;
    }

    const nextPage = (pagination?.page || 1) + 1;
    console.log(`📥 Fetching more SupplierRfqs: page=${nextPage}`);
    set({ loadingMore: true, errorSupplierRfqs: null });

    try {
      const res = await fetch(
        `/api/supplier/SupplierRfqs/creator/get-SupplierRfqs?supplierId=${supplierId}&page=${nextPage}&limit=${
          pagination?.limit || 10
        }`
      );
      console.log(`📡 API response status: ${res.status}`);

      if (!res.ok) {
        const err = await res.json();
        console.error("❌ API error:", err);
        set({ errorSupplierRfqs: err.error || "Failed to fetch more SupplierRfqs", loadingMore: false });
        return;
      }

      const response = await res.json();
      console.log(`✅ Received ${response.data?.length || 0} more SupplierRfqs`);

      set({
        SupplierRfqs: [...SupplierRfqs, ...(response.data || [])],
        pagination: response.pagination,
        loadingMore: false,
      });
    } catch (error) {
      console.error("❌ Fetch more SupplierRfqs error:", error);
      set({ errorSupplierRfqs: "Unexpected error", loadingMore: false });
    }
  },

  // 🔹 Refresh RFQ list
  refreshSupplierRfqs: async (supplierId: string) => {
    if (!supplierId) {
      console.error("❌ Missing supplierId");
      return;
    }

    try {
      const res = await fetch(`/api/supplier/rfqs/supplier/get-rfqs?supplierId=${supplierId}&page=1&limit=10`);

      if (!res.ok) {
        const err = await res.json();
        console.error("❌ Refresh RFQs error:", err);
        return;
      }

      const response = await res.json();

      set({
        SupplierRfqs: response.data || [],
        pagination: response.pagination,
        hasFetchedSupplierRfqs: true,
      });
    } catch (error) {
      console.error("❌ Error refreshing Supplier RFQs:", error);
    }
  },
}));
