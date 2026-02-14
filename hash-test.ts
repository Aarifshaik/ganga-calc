function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
}

export async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(pin)
  const digest = await crypto.subtle.digest("SHA-256", data)
  return bytesToHex(new Uint8Array(digest))
}

// 🔽 run from terminal
async function main() {
  const pin = process.argv[2] || "1234"
  const hash = await hashPin(pin)
  console.log("PIN:", pin)
  console.log("SHA256:", hash)
}

main()
