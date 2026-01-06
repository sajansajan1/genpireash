import { create } from "zustand";

type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
};

type State = {
  rfqs: any[] | null;
  loadingRfqs: boolean;
  loadingMore: boolean;
  errorRfqs: string | null;
  hasFetchedRfqs: boolean;
  pagination: PaginationInfo | null;
  fetchRfqs: (creatorId?: string, page?: number, limit?: number) => Promise<void>;
  fetchMoreRfqs: (creatorId: string) => Promise<void>;
  refreshRfqs: (creatorId: string) => Promise<void>;
};

export const useGetCreatorRfqsStore = create<State>((set, get) => ({
  rfqs: null,
  loadingRfqs: false,
  loadingMore: false,
  errorRfqs: null,
  hasFetchedRfqs: false,
  pagination: null,

  // 🔹 Fetch first page of RFQs
  fetchRfqs: async (creatorId, page = 1, limit = 10) => {
    if (!creatorId) {
      console.error("❌ Missing creatorId");
      set({ errorRfqs: "Missing creator ID" });
      return;
    }

    if (get().loadingRfqs) {
      console.log("⏸️ Already loading RFQs, skipping fetch");
      return;
    }

    console.log(`📥 Fetching RFQs for creatorId=${creatorId}, page=${page}, limit=${limit}`);
    set({ loadingRfqs: true, errorRfqs: null });

    try {
      const res = await fetch(`/api/supplier/rfqs/creator/get-rfqs?creatorId=${creatorId}&page=${page}&limit=${limit}`);

      console.log(`📡 API response status: ${res.status}`);
      if (!res.ok) {
        const err = await res.json();
        console.error("❌ API error:", err);
        set({ errorRfqs: err.error || "Failed to fetch RFQs", loadingRfqs: false });
        return;
      }

      const response = await res.json();
      console.log(`✅ Received ${response.data?.length || 0} RFQs`);

      set({
        rfqs: response.data || [],
        pagination: response.pagination,
        loadingRfqs: false,
        hasFetchedRfqs: true,
      });
    } catch (error) {
      console.error("❌ Fetch RFQs error:", error);
      set({ errorRfqs: "Unexpected error", loadingRfqs: false });
    }
  },

  // 🔹 Fetch next page of RFQs (pagination)
  fetchMoreRfqs: async (creatorId) => {
    const { pagination, rfqs, loadingMore } = get();

    if (loadingMore) {
      console.log("⏸️ Already loading more RFQs, skipping");
      return;
    }
    if (!pagination?.hasMore) {
      console.log("🛑 No more RFQs to load");
      return;
    }
    if (!rfqs) {
      console.log("🛑 No RFQs loaded yet");
      return;
    }

    const nextPage = (pagination?.page || 1) + 1;
    console.log(`📥 Fetching more RFQs: page=${nextPage}`);
    set({ loadingMore: true, errorRfqs: null });

    try {
      const res = await fetch(
        `/api/supplier/rfqs/creator/get-rfqs?creatorId=${creatorId}&page=${nextPage}&limit=${pagination?.limit || 10}`
      );
      console.log(`📡 API response status: ${res.status}`);

      if (!res.ok) {
        const err = await res.json();
        console.error("❌ API error:", err);
        set({ errorRfqs: err.error || "Failed to fetch more RFQs", loadingMore: false });
        return;
      }

      const response = await res.json();
      console.log(`✅ Received ${response.data?.length || 0} more RFQs`);

      set({
        rfqs: [...rfqs, ...(response.data || [])],
        pagination: response.pagination,
        loadingMore: false,
      });
    } catch (error) {
      console.error("❌ Fetch more RFQs error:", error);
      set({ errorRfqs: "Unexpected error", loadingMore: false });
    }
  },

  // 🔹 Refresh RFQ list
  refreshRfqs: async (creatorId: string) => {
    if (!creatorId) {
      console.error("❌ Missing supplierId");
      return;
    }

    try {
      const res = await fetch(`/api/supplier/rfqs/creator/get-rfqs?creatorId=${creatorId}&page=1&limit=10`);

      if (!res.ok) {
        const err = await res.json();
        console.error("❌ Refresh RFQs error:", err);
        return;
      }

      const response = await res.json();

      set({
        rfqs: response.data || [],
        pagination: response.pagination,
        hasFetchedRfqs: true,
      });
    } catch (error) {
      console.error("❌ Error refreshing Supplier RFQs:", error);
    }
  },
}));
