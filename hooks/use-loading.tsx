"use client"

import { create } from "zustand"

interface LoadingState {
  isLoading: boolean
  message: string
  showLoading: (message?: string) => void
  hideLoading: () => void
}

export const useLoading = create<LoadingState>((set) => ({
  isLoading: false,
  message: "Loading...",
  showLoading: (message = "Loading...") => set({ isLoading: true, message }),
  hideLoading: () => set({ isLoading: false }),
}))
