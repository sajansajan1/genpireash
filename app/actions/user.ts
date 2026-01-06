"use server"

import { getProductIdeas, getUserProfile } from "@/lib/auth-service"

export async function fetchUserProfile() {
  return getUserProfile()
}


export async function fetchProductIdeas(){
  return getProductIdeas()
}
