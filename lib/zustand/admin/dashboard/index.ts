import { create } from "zustand";

type State = {
  getAdminDashboardCounts: any | null;
  loadingAdminDashboardCounts: boolean;
  errorAdminDashboardCounts: string | null;
  hasFetchedAdminDashboardCounts: boolean;
  fetchAdminDashboardCounts: () => Promise<void>;
  refreshAdminDashboardCounts: () => Promise<void>;
};

export const useAdminDashboardCountsStore = create<State>((set, get) => ({
  getAdminDashboardCounts: null,
  loadingAdminDashboardCounts: false,
  errorAdminDashboardCounts: null,
  hasFetchedAdminDashboardCounts: false,

  fetchAdminDashboardCounts: async () => {
    if (get().hasFetchedAdminDashboardCounts) return;

    set({ loadingAdminDashboardCounts: true, errorAdminDashboardCounts: null });

    try {
      const res = await fetch("/api/admin/dashboard");
      if (!res.ok) {
        const err = await res.json();
        set({ errorAdminDashboardCounts: err.error || "Failed to fetch", loadingAdminDashboardCounts: false });
        return;
      }

      const ideas = await res.json();
      set({ getAdminDashboardCounts: ideas, loadingAdminDashboardCounts: false, hasFetchedAdminDashboardCounts: true });
    } catch (error) {
      set({ errorAdminDashboardCounts: "Unexpected error", loadingAdminDashboardCounts: false });
    }
  },

  refreshAdminDashboardCounts: async () => {
    set({ hasFetchedAdminDashboardCounts: false });
    await get().fetchAdminDashboardCounts();
  },
}));
