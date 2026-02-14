import { describe, expect, it } from "vitest"

import { hashPin, verifyPinHash } from "@/lib/auth/hash"

describe("hash pin", () => {
  it("generates sha256 for pin", async () => {
    const hash = await hashPin("1234")
    expect(hash).toBe("03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4")
  })

  it("verifies pin hash correctly", async () => {
    const expected = "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4"
    await expect(verifyPinHash("1234", expected)).resolves.toBe(true)
    await expect(verifyPinHash("9999", expected)).resolves.toBe(false)
  })
})

