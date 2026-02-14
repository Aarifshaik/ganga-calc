"use client"

import { animate, useMotionValue, useReducedMotion } from "framer-motion"
import { useEffect, useState } from "react"

import { BOUNCY_SPRING } from "@/components/motion/spring"

type AnimatedNumberProps = {
  value: number
  formatter?: (value: number) => string
  className?: string
}

export function AnimatedNumber({
  value,
  formatter = (nextValue) => String(nextValue),
  className,
}: AnimatedNumberProps) {
  const reduceMotion = useReducedMotion()
  const motionValue = useMotionValue(value)
  const [displayValue, setDisplayValue] = useState(value)

  useEffect(() => {
    if (reduceMotion) {
      setDisplayValue(value)
      return
    }

    const controls = animate(motionValue, value, {
      ...BOUNCY_SPRING,
      onUpdate(latest) {
        setDisplayValue(Math.round(latest))
      },
    })

    return () => controls.stop()
  }, [motionValue, reduceMotion, value])

  return <span className={className}>{formatter(displayValue)}</span>
}

