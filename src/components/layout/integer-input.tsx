"use client"

import type React from "react"
import { forwardRef } from "react"

import { Input } from "@/components/ui/input"

type IntegerInputProps = Omit<React.ComponentProps<typeof Input>, "type" | "inputMode"> & {
  allowNegative?: boolean
}

export const IntegerInput = forwardRef<HTMLInputElement, IntegerInputProps>(function IntegerInput(
  { allowNegative = false, ...props },
  ref
) {
  return (
    <Input
      ref={ref}
      type="text"
      inputMode="numeric"
      pattern={allowNegative ? "-?[0-9]*" : "[0-9]*"}
      {...props}
    />
  )
})
