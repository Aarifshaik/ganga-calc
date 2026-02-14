"use client"

import type { ReactNode } from "react"

import { Button } from "@/components/ui/button"
import { MotionTap } from "@/components/motion/motion-tap"

type ModuleShellProps = {
  title: string
  metrics: ReactNode
  children: ReactNode
  addLabel: string
  onAdd: () => void
  disabled?: boolean
}

export function ModuleShell({ title, metrics, children, addLabel, onAdd, disabled = false }: ModuleShellProps) {
  return (
    <section className="flex min-h-0 flex-1 flex-col gap-3 overflow-hidden">
      <div className="space-y-2">
        <h2 className="text-sm font-semibold">{title}</h2>
        {metrics}
      </div>
      <Button asChild className="min-h-10 w-full" disabled={disabled}>
        <MotionTap onClick={onAdd}>{addLabel}</MotionTap>
      </Button>
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pb-4">{children}</div>
    </section>
  )
}

