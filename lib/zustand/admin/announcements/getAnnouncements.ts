import { create } from "zustand";

type State = {
  GetAnnouncements: any | null;
  loadingGetAnnouncements: boolean;
  errorGetAnnouncements: string | null;
  hasFetchedGetAnnouncements: boolean;
  fetchGetAnnouncements: () => Promise<void>;
  refresGetAnnouncements: () => Promise<void>;
};

export const useGetAnnouncementsStore = create<State>((set, get) => ({
  GetAnnouncements: null,
  loadingGetAnnouncements: false,
  errorGetAnnouncements: null,
  hasFetchedGetAnnouncements: false,

  fetchGetAnnouncements: async () => {
    if (get().hasFetchedGetAnnouncements) return;

    set({ loadingGetAnnouncements: true, errorGetAnnouncements: null });

    try {
      const res = await fetch("/api/genp-announcements");
      console.log("res ==> ", res);
      if (!res.ok) {
        const err = await res.json();
        set({ errorGetAnnouncements: err.error || "Failed to fetch", loadingGetAnnouncements: false });
        return;
      }

      const credits = await res.json();
      console.log("credits ==> ", credits);
      set({ GetAnnouncements: credits, loadingGetAnnouncements: false, hasFetchedGetAnnouncements: true });
    } catch (error) {
      set({ errorGetAnnouncements: "Unexpected error", loadingGetAnnouncements: false });
    }
  },

  refresGetAnnouncements: async () => {
    set({ hasFetchedGetAnnouncements: false });
    await get().fetchGetAnnouncements();
  },
}));
