"use client"

import { useEffect, useState } from "react"

import { getDayKey } from "@/lib/date/day"

export function useTodayKey(): string {
  const [todayKey, setTodayKey] = useState(() => getDayKey())

  useEffect(() => {
    const interval = window.setInterval(() => {
      const next = getDayKey()
      setTodayKey((current) => (current === next ? current : next))
    }, 60_000)

    return () => window.clearInterval(interval)
  }, [])

  return todayKey
}

