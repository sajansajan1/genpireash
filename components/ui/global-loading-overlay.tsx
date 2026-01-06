"use client"

import { LoadingOverlay } from "./loading-overlay"
import { useLoading } from "@/hooks/use-loading"

export function GlobalLoadingOverlay() {
  const { isLoading, message } = useLoading()
  return <LoadingOverlay isVisible={isLoading} message={message} />
}
