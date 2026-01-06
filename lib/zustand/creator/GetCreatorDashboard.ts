import { create } from "zustand";
import { useUserStore } from "../useStore";

type creatorDashboard = {
  totalMatchedSuppliers: number;
  totalOpenRFQs: number;
  totalProducts: number;
};
type State = {
  creatorDashboard: creatorDashboard | null;
  loadingCreatorDashboard: boolean;
  errorCreatorDashboard: string | null;
  hasFetched: boolean;
  fetchCreatorDashboard: () => Promise<void>;
  refreshCreatorDashboard: () => Promise<void>;
};

export const useCreatorDashboardStore = create<State>((set, get) => ({
  creatorDashboard: null,
  loadingCreatorDashboard: false,
  errorCreatorDashboard: null,
  hasFetched: false,

  fetchCreatorDashboard: async () => {
    const { creatorProfile } = useUserStore.getState();
    const creatorId = creatorProfile?.id;

    if (get().hasFetched || !creatorId) return;

    set({ loadingCreatorDashboard: true, errorCreatorDashboard: null });

    try {
      const res = await fetch(`/api/creator/creator-dashboard?creatorId=${creatorId}`, {
        method: "GET",
      });

      if (!res.ok) {
        const err = await res.json();
        set({
          errorCreatorDashboard: err.error || "Failed to fetch",
          loadingCreatorDashboard: false,
        });
        return;
      }

      const data = await res.json();
      set({
        creatorDashboard: data,
        loadingCreatorDashboard: false,
        hasFetched: true,
      });
    } catch (error) {
      set({
        errorCreatorDashboard: "Unexpected error",
        loadingCreatorDashboard: false,
      });
    }
  },

  refreshCreatorDashboard: async () => {
    set({ hasFetched: false });
    await get().fetchCreatorDashboard();
  },
}));
