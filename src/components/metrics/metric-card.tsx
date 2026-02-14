"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedNumber } from "@/components/motion/animated-number"
import { formatCurrency } from "@/lib/format/currency"
import { cn } from "@/lib/utils"

type MetricCardProps = {
  label: string
  value: number
  tone?: "default" | "green" | "red" | "blue" | "amber" | "violet"
  emphasize?: boolean
}

const toneClassMap: Record<NonNullable<MetricCardProps["tone"]>, string> = {
  default: "text-foreground",
  green: "text-emerald-600 dark:text-emerald-400",
  red: "text-rose-600 dark:text-rose-400",
  blue: "text-sky-600 dark:text-sky-400",
  amber: "text-amber-600 dark:text-amber-400",
  violet: "text-violet-600 dark:text-violet-400",
}

export function MetricCard({ label, value, tone = "default", emphasize = false }: MetricCardProps) {
  return (
    <Card size="sm" className="w-full">
      <CardHeader className="pb-1">
        <CardTitle className="text-[0.7rem] uppercase tracking-wide text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={cn("font-semibold", emphasize ? "text-2xl" : "text-lg", toneClassMap[tone])}>
          <AnimatedNumber value={value} formatter={formatCurrency} />
        </div>
      </CardContent>
    </Card>
  )
}

