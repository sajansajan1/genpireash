import { create } from "zustand";

type State = {
  CreatePayoutAmbassador: any | null;
  loadingCreatePayoutAmbassador: boolean;
  errorCreatePayoutAmbassador: string | null;
  hasFetchedCreatePayoutAmbassador: boolean;
  setCreatePayoutAmbassador: (payload: any) => Promise<{ success: boolean; error?: any; data?: any | null }>;
  refreshCreatePayoutAmbassador: () => Promise<void>;
};

export const useCreatePayoutAmbassadorStore = create<State>((set, get) => ({
  CreatePayoutAmbassador: null,
  loadingCreatePayoutAmbassador: false,
  errorCreatePayoutAmbassador: null,
  hasFetchedCreatePayoutAmbassador: false,

  setCreatePayoutAmbassador: async (payload) => {
    set({ loadingCreatePayoutAmbassador: true, errorCreatePayoutAmbassador: null });

    try {
      const res = await fetch("/api/ambassador/create-payout-ambassador", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        const error = data?.error || "Failed to create DNA";
        set({ errorCreatePayoutAmbassador: error, loadingCreatePayoutAmbassador: false });
        return { success: false, error };
      }

      set({
        CreatePayoutAmbassador: data,
        loadingCreatePayoutAmbassador: false,
        hasFetchedCreatePayoutAmbassador: true,
      });

      return { success: true, data };
    } catch (error) {
      set({
        errorCreatePayoutAmbassador: "Unexpected error occurred",
        loadingCreatePayoutAmbassador: false,
      });
      return { success: false, error: "Unexpected error occurred" };
    }
  },

  refreshCreatePayoutAmbassador: async () => {
    set({ hasFetchedCreatePayoutAmbassador: false });
  },
}));
