import { creatorProfile } from "@/lib/types/tech-packs";
import { create } from "zustand";

type State = {
  updateCreatorProfile: creatorProfile | null;
  loadingUpdateCreatorProfile: boolean;
  errorUpdateCreatorProfile: string | null;
  hasFetchedUpdateCreatorProfile: boolean;
  setUpdateCreatorProfile: (
    payload: creatorProfile
  ) => Promise<{ success: boolean; error?: any; data?: creatorProfile | null }>;
};

export const useUpdateCreatorProfileStore = create<State>((set, get) => ({
  updateCreatorProfile: null,
  loadingUpdateCreatorProfile: false,
  errorUpdateCreatorProfile: null,
  hasFetchedUpdateCreatorProfile: false,

  setUpdateCreatorProfile: async (payload) => {
    set({ loadingUpdateCreatorProfile: true, errorUpdateCreatorProfile: null });

    try {
      const res = await fetch("/api/creator/update-creator", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const profileData = await res.json();
      console.log("API response ==> ", profileData);

      if (!res.ok) {
        set({
          errorUpdateCreatorProfile: profileData.error || "Failed to fetch",
          loadingUpdateCreatorProfile: false,
        });
        return { success: false, error: profileData.error || "Failed to fetch" };
      }

      const updatedProfile =
        Array.isArray(profileData.data) && profileData.data.length > 0 ? profileData.data[0] : null;

      set({
        updateCreatorProfile: updatedProfile,
        loadingUpdateCreatorProfile: false,
        hasFetchedUpdateCreatorProfile: true,
      });

      return { success: true, data: updatedProfile };
    } catch (error) {
      set({
        errorUpdateCreatorProfile: "Unexpected error",
        loadingUpdateCreatorProfile: false,
      });
      return { success: false, error: "Unexpected error" };
    }
  },
}));
