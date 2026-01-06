// lib\zustand\admin\admin-executive\executive.ts
import { create } from "zustand";

type MetricsData = {
  wau: number; // Weekly Active Users
  mau: number; // Monthly Active Users
  totalBooked: number;
  newPlansToSignupsPercent: number;
  techpacksToUsersPercent: number;
  activeLastMonthPercent: number;
  newUsersPercent: number;
  returnUsersPercent: number;
  percentage: number;
  totalUsers: number;
  newUsers: number;
  totalSignups: number;
  lastActive: number;

  // Add proper types instead of `object`
  data: {
    weekly_active_users: number;
    monthly_active_users: number;
  };

  tech_packs: number; // Add this field
};

type State = {
  metrics: MetricsData | null;
  loading: boolean;
  error: string | null;
  hasFetched: boolean;
  fetchMetrics: (start?: Date, end?: Date) => Promise<void>;
  refreshMetrics: () => Promise<void>;
};

export const useAdminMetricsStore = create<State>((set, get) => ({
  metrics: null,
  loading: false,
  error: null,
  hasFetched: false,

  // 🧩 Fetch metrics (can include range or custom start/end)
  fetchMetrics: async (start?: Date, end?: Date, range = "monthly") => {
    set({ loading: true, error: null });

    try {
      // Dynamically build query
      let query = `/api/admin/metrics?range=${range}`;
      if (start && end) {
        query = `/api/admin/metrics?start=${start}&end=${end}`;
      }

      const res = await fetch(query);
      if (!res.ok) {
        const err = await res.json();
        set({ error: err.error || "Failed to fetch metrics", loading: false });
        return;
      }

      const data = await res.json();
      set({ metrics: data, loading: false, hasFetched: true });
    } catch (error) {
      console.error(error);
      set({ error: "Unexpected error", loading: false });
    }
  },

  refreshMetrics: async () => {
    set({ hasFetched: false });
    await get().fetchMetrics();
  },
}));
