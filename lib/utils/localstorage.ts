import { creatorProfile, UserDetails, UserProfile } from "../types/tech-packs";

function getLocalStorageItem<T>(key: string): T | null {
  if (typeof window !== "undefined") {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  }
  return null;
}

export const supplierProfile: UserProfile | null =
  getLocalStorageItem<UserProfile>("userProfile");
export const CreatorProfile: creatorProfile | null =
  getLocalStorageItem<creatorProfile>("userProfile");
export const UserDetail: UserDetails | null =
  getLocalStorageItem<UserDetails>("user");
