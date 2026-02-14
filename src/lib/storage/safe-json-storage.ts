import type { StateStorage } from "zustand/middleware"

let recoveredFromCorruption = false

export function consumeStorageRecoveryFlag(): boolean {
  const currentValue = recoveredFromCorruption
  recoveredFromCorruption = false
  return currentValue
}

export const safeJsonStorage: StateStorage = {
  getItem(key) {
    if (typeof window === "undefined") {
      return null
    }

    const raw = window.localStorage.getItem(key)
    if (raw == null) {
      return null
    }

    try {
      JSON.parse(raw)
      return raw
    } catch {
      const archivedKey = `${key}:corrupt:${Date.now()}`
      window.localStorage.setItem(archivedKey, raw)
      window.localStorage.removeItem(key)
      recoveredFromCorruption = true
      return null
    }
  },
  setItem(key, value) {
    if (typeof window === "undefined") {
      return
    }
    window.localStorage.setItem(key, value)
  },
  removeItem(key) {
    if (typeof window === "undefined") {
      return
    }
    window.localStorage.removeItem(key)
  },
}

