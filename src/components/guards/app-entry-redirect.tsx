"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { useStoreHydration } from "@/store/useStoreHydration"
import { useAppStore } from "@/store/useAppStore"

export function AppEntryRedirect() {
  const router = useRouter()
  const hydrated = useStoreHydration()
  const session = useAppStore((state) => state.session)

  useEffect(() => {
    if (!hydrated) {
      return
    }
    if (session) {
      router.replace("/dashboard")
      return
    }
    router.replace("/login")
  }, [hydrated, router, session])

  return <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">Loading...</div>
}

