import { create } from "zustand";

type State = {
  ProductCollection: any | null;
  loadingProductCollection: boolean;
  errorProductCollection: string | null;
  hasFetchedProductCollection: boolean;

  fetchProductCollection: () => Promise<{ success: boolean; error?: any; data?: any | null }>;
  refreshProductCollection: () => Promise<void>;

  // NEW FUNCTIONS
  addToCollection: (collectionId: string, productId: string) => Promise<{ success: boolean; error?: any }>;
  createCollectionAndAdd: (
    title: string,
    productId: string
  ) => Promise<{ success: boolean; error?: any; collection_id?: string }>;
};

export const useProductCollectionStore = create<State>((set, get) => ({
  ProductCollection: null,
  loadingProductCollection: false,
  errorProductCollection: null,
  hasFetchedProductCollection: false,

  // -------------------------------------------------------------
  // Fetch Collections
  // -------------------------------------------------------------
  fetchProductCollection: async () => {
    set({ loadingProductCollection: true, errorProductCollection: null });

    try {
      const res = await fetch("/api/ai-collections/get-user-product-collections", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      console.log("dtatatatatata", data);

      if (!res.ok) {
        const error = data?.error || "Failed to fetch user collections";
        set({
          errorProductCollection: error,
          loadingProductCollection: false,
        });
        return { success: false, error };
      }

      set({
        ProductCollection: data,
        loadingProductCollection: false,
        hasFetchedProductCollection: true,
      });

      return { success: true, data };
    } catch (error) {
      console.error("Fetch collections error:", error);
      set({
        errorProductCollection: "Unexpected error occurred",
        loadingProductCollection: false,
      });
      return { success: false, error: "Unexpected error occurred" };
    }
  },

  refreshProductCollection: async () => {
    try {
      const res = await fetch("/api/ai-collections/get-user-product-collections", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const err = await res.json();
        console.error("❌ Refresh RFQs error:", err);
        return;
      }

      const response = await res.json();

      set({
        ProductCollection: response,
        loadingProductCollection: false,
        hasFetchedProductCollection: true,
      });
    } catch (error) {
      console.error("❌ Error refreshing Supplier RFQs:", error);
    }
  },

  // -------------------------------------------------------------
  // ADD PRODUCT TO EXISTING COLLECTION
  // -------------------------------------------------------------
  addToCollection: async (collectionId, productId) => {
    set({ loadingProductCollection: true, errorProductCollection: null });
    try {
      const res = await fetch("/api/ai-collections/create-new-product-collection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "add",
          collection_id: collectionId,
          product_id: productId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const error = data?.error || "Failed to fetch user collections";
        set({
          errorProductCollection: error,
          loadingProductCollection: false,
        });
        return { success: false, error };
      }

      await get().refreshProductCollection();
      return { success: true };
    } catch (error: any) {
      console.error("Add to collection error:", error);
      return { success: false, error: error?.message };
    } finally {
      set({ loadingProductCollection: false, errorProductCollection: null });
    }
  },

  // -------------------------------------------------------------
  // CREATE A NEW COLLECTION + ADD PRODUCT
  // -------------------------------------------------------------
  createCollectionAndAdd: async (title, productId) => {
    set({ loadingProductCollection: true, errorProductCollection: null });
    try {
      const res = await fetch("/api/ai-collections/create-new-product-collection", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "create",
          title,
          product_id: productId,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        const error = data?.error || "Failed to fetch user collections";
        set({
          errorProductCollection: error,
          loadingProductCollection: false,
        });
        return { success: false, error };
      }

      // Refresh collections after new one is created
      await get().refreshProductCollection();

      return { success: true, collection_id: data.collection_id };
    } catch (error: any) {
      console.error("Create collection error:", error);
      return { success: false, error: error?.message };
    } finally {
      set({ loadingProductCollection: false, errorProductCollection: null });
    }
  },
}));
