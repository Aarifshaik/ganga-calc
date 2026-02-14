import { sha256 } from "js-sha256"

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")
}

export async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(pin)

  if (typeof globalThis.crypto !== "undefined" && globalThis.crypto.subtle) {
    try {
      const digest = await globalThis.crypto.subtle.digest("SHA-256", data)
      return bytesToHex(new Uint8Array(digest))
    } catch {
      return sha256(pin)
    }
  }

  return sha256(pin)
}

export async function verifyPinHash(pin: string, expectedHash: string): Promise<boolean> {
  const hashedPin = await hashPin(pin)
  return hashedPin === expectedHash.toLowerCase()
}
