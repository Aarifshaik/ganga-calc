"use client"

import type { ComponentType } from "react"
import { motion, useReducedMotion } from "framer-motion"

import { MotionTap } from "@/components/motion/motion-tap"
import { BOUNCY_SPRING } from "@/components/motion/spring"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type AppTabId = "profit" | "expenses" | "advances" | "dues" | "money"

export type AppTab = {
  id: AppTabId
  label: string
  icon?: ComponentType<{ className?: string }>
}

type BottomTabsProps = {
  tabs: AppTab[]
  activeTab: AppTabId
  onTabChange: (id: AppTabId) => void
}

const NAVBAR_VARIANT = process.env.NEXT_PUBLIC_NAVBAR_VARIANT === "legacy" ? "legacy" : "sticky-icons"

export function BottomTabs({ tabs, activeTab, onTabChange }: BottomTabsProps) {
  const reduceMotion = useReducedMotion()

  if (NAVBAR_VARIANT === "legacy") {
    return (
      <nav className="fixed inset-x-0 bottom-0 z-50">
        <div className="mx-auto w-full max-w-md border-t bg-background/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-sm">
          <div className="grid grid-cols-5 gap-1">
            {tabs.map((tab) => {
              const isActive = tab.id === activeTab
              return (
                <div key={tab.id} className="relative">
                  {isActive ? (
                    <motion.div
                      layoutId="active-tab-pill"
                      className="absolute inset-0 rounded-md bg-primary/10"
                      transition={reduceMotion ? { duration: 0 } : BOUNCY_SPRING}
                    />
                  ) : null}
                  <Button
                    asChild
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "relative min-h-11 w-full text-[0.65rem]",
                      isActive ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    <MotionTap onClick={() => onTabChange(tab.id)}>{tab.label}</MotionTap>
                  </Button>
                </div>
              )
            })}
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50">
      <div className="mx-auto w-full max-w-md border-t bg-background/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur-sm">
        <div className="grid grid-cols-5 gap-1">
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab
            const TabIcon = tab.icon
            return (
              <div key={tab.id} className="relative">
                {isActive ? (
                  <motion.div
                    layoutId="active-tab-pill"
                    className="absolute inset-0 rounded-md bg-primary/10"
                    transition={reduceMotion ? { duration: 0 } : BOUNCY_SPRING}
                  />
                ) : null}
                <Button
                  asChild
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "relative min-h-11 w-full py-1 text-[0.6rem]",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  <MotionTap
                    onClick={() => onTabChange(tab.id)}
                    className="flex min-h-11 w-full flex-col items-center justify-center gap-0.5"
                  >
                    {TabIcon ? <TabIcon className="size-4" /> : null}
                    <span className="leading-none">{tab.label}</span>
                  </MotionTap>
                </Button>
              </div>
            )
          })}
        </div>
      </div>
    </nav>
  )
}

