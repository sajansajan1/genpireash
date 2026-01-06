import { create } from "zustand";

type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasMore: boolean;
};

type State = {
  productIdeas: any[] | null;
  loadingProductIdeas: boolean;
  loadingMore: boolean;
  errorProductIdeas: string | null;
  hasFetchedProductIdeas: boolean;
  pagination: PaginationInfo | null;
  fetchProductIdeas: (page?: number, limit?: number) => Promise<void>;
  fetchMoreProductIdeas: () => Promise<void>;
  refreshProductIdeas: () => Promise<void>;
};

export const useProductIdeasStore = create<State>((set, get) => ({
  productIdeas: null,
  loadingProductIdeas: false,
  loadingMore: false,
  errorProductIdeas: null,
  hasFetchedProductIdeas: false,
  pagination: null,

  fetchProductIdeas: async (page = 1, limit = 12) => {
    // Don't fetch if already loading
    if (get().loadingProductIdeas) {
      console.log("⏸️ Already loading, skipping fetch");
      return;
    }

    console.log(`📥 Fetching products: page=${page}, limit=${limit}`);
    set({ loadingProductIdeas: true, errorProductIdeas: null });

    try {
      const res = await fetch(`/api/tech-pack/get-all-techpacks?page=${page}&limit=${limit}`);
      console.log(`📡 API response status: ${res.status}`);

      if (!res.ok) {
        const err = await res.json();
        console.error("❌ API error:", err);
        set({ errorProductIdeas: err.error || "Failed to fetch", loadingProductIdeas: false });
        return;
      }

      const response = await res.json();
      console.log(`✅ Received ${response.data?.length || 0} products, pagination:`, response.pagination);

      set({
        productIdeas: response.data || [],
        pagination: response.pagination,
        loadingProductIdeas: false,
        hasFetchedProductIdeas: true,
      });
    } catch (error) {
      console.error("❌ Fetch error:", error);
      set({ errorProductIdeas: "Unexpected error", loadingProductIdeas: false });
    }
  },

  fetchMoreProductIdeas: async () => {
    const { pagination, productIdeas, loadingMore } = get();

    // Don't fetch if already loading or no more data
    if (loadingMore) {
      console.log("⏸️ Already loading more, skipping");
      return;
    }
    if (!pagination?.hasMore) {
      console.log("🛑 No more products to load");
      return;
    }
    if (!productIdeas) {
      console.log("🛑 No products loaded yet");
      return;
    }

    const nextPage = (pagination?.page || 1) + 1;
    console.log(`📥 Fetching more products: page=${nextPage}`);
    set({ loadingMore: true, errorProductIdeas: null });

    try {
      const res = await fetch(`/api/tech-pack/get-all-techpacks?page=${nextPage}&limit=${pagination?.limit || 12}`);
      console.log(`📡 API response status: ${res.status}`);

      if (!res.ok) {
        const err = await res.json();
        console.error("❌ API error:", err);
        set({ errorProductIdeas: err.error || "Failed to fetch more", loadingMore: false });
        return;
      }

      const response = await res.json();
      console.log(
        `✅ Received ${response.data?.length || 0} more products, total now: ${
          productIdeas.length + (response.data?.length || 0)
        }`
      );

      set({
        productIdeas: [...productIdeas, ...(response.data || [])],
        pagination: response.pagination,
        loadingMore: false,
      });
    } catch (error) {
      console.error("❌ Fetch more error:", error);
      set({ errorProductIdeas: "Unexpected error", loadingMore: false });
    }
  },

  refreshProductIdeas: async () => {
    try {
      const res = await fetch(`/api/tech-pack/get-all-techpacks?page=1&limit=12`);

      if (!res.ok) {
        const err = await res.json();
        console.error("❌ Refresh RFQs error:", err);
        return;
      }

      const response = await res.json();

      set({
        productIdeas: response.data || [],
        pagination: response.pagination,
        hasFetchedProductIdeas: true,
      });
    } catch (error) {
      console.error("❌ Error refreshing Supplier RFQs:", error);
    }
  },
}));
