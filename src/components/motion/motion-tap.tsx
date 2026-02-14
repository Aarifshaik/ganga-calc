"use client"

import type React from "react"
import { motion, useReducedMotion } from "framer-motion"

import { BOUNCY_SPRING } from "@/components/motion/spring"
import { cn } from "@/lib/utils"

type MotionTapProps = React.ComponentProps<typeof motion.button>

export function MotionTap({ className, whileTap, transition, ...props }: MotionTapProps) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.button
      type={props.type ?? "button"}
      whileTap={reduceMotion ? undefined : (whileTap ?? { scale: 0.96 })}
      transition={reduceMotion ? undefined : (transition ?? BOUNCY_SPRING)}
      className={cn(className)}
      {...props}
    />
  )
}
