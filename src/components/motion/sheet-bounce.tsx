"use client"

import type { ReactNode } from "react"
import { motion, useReducedMotion } from "framer-motion"

import { BOUNCY_SPRING } from "@/components/motion/spring"
import { cn } from "@/lib/utils"

type SheetBounceProps = {
  children: ReactNode
  className?: string
}

export function SheetBounce({ children, className }: SheetBounceProps) {
  const reduceMotion = useReducedMotion()

  if (reduceMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial={{ y: 36, opacity: 0.65 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 36, opacity: 0.65 }}
      transition={BOUNCY_SPRING}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}

