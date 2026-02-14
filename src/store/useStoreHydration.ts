"use client"

import { useEffect, useState } from "react"

import { useAppStore } from "@/store/useAppStore"

export function useStoreHydration(): boolean {
  const [hydrated, setHydrated] = useState(useAppStore.persist.hasHydrated())

  useEffect(() => {
    const unsubscribeHydrate = useAppStore.persist.onHydrate(() => setHydrated(false))
    const unsubscribeFinishHydration = useAppStore.persist.onFinishHydration(() => setHydrated(true))

    return () => {
      unsubscribeHydrate()
      unsubscribeFinishHydration()
    }
  }, [])

  return hydrated
}
