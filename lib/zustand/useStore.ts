import { create } from "zustand";
import { persist } from "zustand/middleware";
import { creatorProfile, UserDetails, UserProfile } from "../types/tech-packs";

interface UserStore {
  user: UserDetails | null;
  supplierProfile: UserProfile | null;
  creatorProfile: creatorProfile | null;
  setUser: (user: UserDetails | null) => void;
  setSupplierProfile: (profile: UserProfile | null) => void;
  setCreatorProfile: (creator: creatorProfile | null) => void;
  refreshUserCredits: () => Promise<void>;
  clear: () => void;
}

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      supplierProfile: null,
      creatorProfile: null,
      setUser: (user) => set({ user }),
      setSupplierProfile: (supplierProfile) => set({ supplierProfile }),
      setCreatorProfile: (creatorProfile) => set({ creatorProfile }),
      refreshUserCredits: async () => {
        try {
          const response = await fetch("/api/getUserProfile");
          if (response.ok) {
            const userData = await response.json();
            // Update only the user data with fresh credits
            set({ user: userData });
          }
        } catch (error) {
          console.error("Failed to refresh user credits:", error);
        }
      },
      clear: () => set({ user: null, supplierProfile: null, creatorProfile: null }),
    }),
    {
      name: "user-store",
      partialize: (state) => ({
        user: state.user,
        supplierProfile: state.supplierProfile,
        creatorProfile: state.creatorProfile,
      }),
    }
  )
);
