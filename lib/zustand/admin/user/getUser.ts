import { create } from "zustand";

type UserCredit = {
  id: string;
  created_at: string;
  expires_at: string | null;
  subscription_id: string | null;
  status: string;
  user_id: string;
  credits: number;
  plan_type: string;
  updated_at: string | null;
  membership: string;
  users?: { email: string };
};

type ApiResponse = {
  data: UserCredit[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

type State = {
  GetUsers: ApiResponse | null;
  loadingGetUsers: boolean;
  errorGetUsers: string | null;
  hasFetchedGetUsers: boolean;
  currentPage: number;
  searchQuery: string;

  fetchUsersCredits: (page?: number, search?: string) => Promise<void>;
  loadMoreUsers: () => Promise<void>;
  searchUsers: (search: string) => Promise<void>;
  refreshUsers: () => Promise<void>; // 🔥 added here
};

export const useGetUsersStore = create<State>((set, get) => ({
  GetUsers: null,
  loadingGetUsers: false,
  errorGetUsers: null,
  hasFetchedGetUsers: false,
  currentPage: 1,
  searchQuery: "",

  fetchUsersCredits: async (page = 1, search = "") => {
    set({ loadingGetUsers: true });

    try {
      const url = search
        ? `/api/admin/users/get-users?page=${page}&search=${encodeURIComponent(search)}`
        : `/api/admin/users/get-users?page=${page}`;

      const res = await fetch(url);

      if (!res.ok) {
        const err = await res.json();
        set({
          errorGetUsers: err.error || "Failed to fetch users",
          loadingGetUsers: false,
        });
        return;
      }

      const result: ApiResponse = await res.json();
      const prevSearch = get().searchQuery;

      if (page === 1 || search !== prevSearch) {
        // replace
        set({
          GetUsers: result,
          currentPage: 1,
          searchQuery: search,
          loadingGetUsers: false,
        });
      } else {
        // append
        const prev = get().GetUsers;

        set({
          GetUsers: {
            ...result,
            data: [...(prev?.data || []), ...result.data],
          },
          currentPage: page,
          loadingGetUsers: false,
        });
      }
    } catch (error) {
      console.error("fetchUsersCredits error:", error);
      set({ errorGetUsers: "Unexpected error", loadingGetUsers: false });
    }
  },

  loadMoreUsers: async () => {
    const { GetUsers, currentPage, searchQuery } = get();
    if (!GetUsers) return;

    if (currentPage >= GetUsers.totalPages) return;
    await get().fetchUsersCredits(currentPage + 1, searchQuery);
  },

  searchUsers: async (search: string) => {
    await get().fetchUsersCredits(1, search);
  },

  refreshUsers: async () => {
    const { currentPage, searchQuery, fetchUsersCredits } = get();
    await fetchUsersCredits(currentPage, searchQuery);
  },
}));
