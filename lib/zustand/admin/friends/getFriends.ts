import { create } from "zustand";

type State = {
  GetFriends: any | null;
  loadingGetFriends: boolean;
  errorGetFriends: string | null;
  hasFetchedGetFriends: boolean;
  fetchGetFriends: () => Promise<void>;
  refresGetFriends: () => Promise<void>;
};

export const useGetFriendsStore = create<State>((set, get) => ({
  GetFriends: null,
  loadingGetFriends: false,
  errorGetFriends: null,
  hasFetchedGetFriends: false,

  fetchGetFriends: async () => {
    if (get().hasFetchedGetFriends) return;

    set({ loadingGetFriends: true, errorGetFriends: null });

    try {
      const res = await fetch("/api/admin/friends/get-friends");
      console.log("res ==> ", res);
      if (!res.ok) {
        const err = await res.json();
        set({ errorGetFriends: err.error || "Failed to fetch", loadingGetFriends: false });
        return;
      }

      const credits = await res.json();
      console.log("credits ==> ", credits);
      set({ GetFriends: credits, loadingGetFriends: false, hasFetchedGetFriends: true });
    } catch (error) {
      set({ errorGetFriends: "Unexpected error", loadingGetFriends: false });
    }
  },

  refresGetFriends: async () => {
    set({ hasFetchedGetFriends: false });
    await get().fetchGetFriends();
  },
}));
