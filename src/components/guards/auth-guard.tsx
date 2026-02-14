"use client"

import type { ReactNode } from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

import { useStoreHydration } from "@/store/useStoreHydration"
import { useAppStore } from "@/store/useAppStore"

type AuthGuardProps = {
  children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter()
  const hydrated = useStoreHydration()
  const session = useAppStore((state) => state.session)

  useEffect(() => {
    if (!hydrated) {
      return
    }
    if (!session) {
      router.replace("/login")
    }
  }, [hydrated, router, session])

  if (!hydrated) {
    return <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">Loading...</div>
  }

  if (!session) {
    return null
  }

  return <>{children}</>
}

