"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { MotionTap } from "@/components/motion/motion-tap"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAppStore } from "@/store/useAppStore"
import { useStoreHydration } from "@/store/useStoreHydration"

export default function LoginPage() {
  const router = useRouter()
  const hydrated = useStoreHydration()
  const users = useAppStore((state) => state.users)
  const login = useAppStore((state) => state.login)
  const session = useAppStore((state) => state.session)

  const [selectedUserId, setSelectedUserId] = useState("")
  const [pin, setPin] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!hydrated) {
      return
    }
    if (session) {
      router.replace("/dashboard")
    }
  }, [hydrated, router, session])

  const activeUserId = selectedUserId || users[0]?.id || ""

  const canSubmit = hydrated && activeUserId.length > 0 && pin.length > 0 && !isSubmitting

  const submit = async () => {
    if (!canSubmit) {
      return
    }
    setIsSubmitting(true)
    setErrorMessage("")
    try {
      const ok = await login(activeUserId, pin)
      if (!ok) {
        setErrorMessage("Invalid operator or PIN.")
        return
      }
      router.replace("/dashboard")
    } catch {
      setErrorMessage("PIN verification failed on this device. Try updating Chrome.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!hydrated) {
    return <div className="flex min-h-dvh items-center justify-center text-sm text-muted-foreground">Loading...</div>
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-4 py-8">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Ganga Drilling Ltd.</CardTitle>
          <CardDescription>Sign in with operator PIN</CardDescription>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="login-user">Operator</FieldLabel>
              <Select value={activeUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger id="login-user" className="w-full">
                  <SelectValue placeholder="Select operator" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="login-pin">PIN</FieldLabel>
              <Input
                id="login-pin"
                type="password"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="one-time-code"
                value={pin}
                onChange={(event) => setPin(event.target.value)}
                placeholder="Enter PIN"
              />
            </Field>
            {errorMessage ? <p className="text-xs text-rose-600 dark:text-rose-400">{errorMessage}</p> : null}
            <Button asChild className="min-h-10 w-full" disabled={!canSubmit}>
              <MotionTap onClick={() => void submit()}>{isSubmitting ? "Signing in..." : "Login"}</MotionTap>
            </Button>
          </FieldGroup>
        </CardContent>
      </Card>
    </main>
  )
}
