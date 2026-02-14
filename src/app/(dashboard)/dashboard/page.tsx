"use client"

import type { ReactNode } from "react"
import { useMemo, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { IconAlertTriangle, IconCalendar, IconCash, IconDoorExit, IconFileDollar, IconReceipt, IconTrendingUp, IconWallet } from "@tabler/icons-react"

import { AuthGuard } from "@/components/guards/auth-guard"
import { BottomTabs, type AppTab, type AppTabId } from "@/components/layout/bottom-tabs"
import { MotionTap } from "@/components/motion/motion-tap"
import { BOUNCY_SPRING } from "@/components/motion/spring"
import { AdvancesModule } from "@/features/advances/advances-module"
import { DuesModule } from "@/features/dues/dues-module"
import { ExpensesModule } from "@/features/expenses/expenses-module"
import { MoneyModule } from "@/features/money/money-module"
import { ProfitModule } from "@/features/profit/profit-module"
import { getGreeting, isPastDay } from "@/lib/date/day"
import { useTodayKey } from "@/lib/date/use-today-key"
import { formatCurrency } from "@/lib/format/currency"
import { getDayTotals } from "@/lib/selectors/day-totals"
import { useAppStore } from "@/store/useAppStore"
import type { DayLedger } from "@/types/domain"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"

const TABS: AppTab[] = [
  { id: "profit", label: "Profit", icon: IconTrendingUp },
  { id: "expenses", label: "Expenses", icon: IconReceipt },
  { id: "advances", label: "Advances", icon: IconCash },
  { id: "dues", label: "Dues", icon: IconFileDollar },
  { id: "money", label: "Where Money", icon: IconWallet },
]

type MismatchState = {
  title: string
  lines: [string, string, string]
} | null

function createFallbackDay(dayKey: string): DayLedger {
  return {
    date: dayKey,
    openingBalance: null,
    profits: [],
    expenses: [],
    advances: [],
    dues: [],
    moneyEntries: [],
    isFinalized: false,
    finalizedAt: null,
  }
}

function DashboardScreen() {
  const reduceMotion = useReducedMotion()
  const todayKey = useTodayKey()
  const [activeTab, setActiveTab] = useState<AppTabId>("profit")
  const [isFinalizing, setIsFinalizing] = useState(false)
  const [mismatchState, setMismatchState] = useState<MismatchState>(null)
  const [confirmFinalizeOpen, setConfirmFinalizeOpen] = useState(false)

  const selectedDay = useAppStore((state) => state.selectedDay)
  const days = useAppStore((state) => state.days)
  const catalogs = useAppStore((state) => state.catalogs)
  const storageRecovered = useAppStore((state) => state.storageRecovered)
  const dismissStorageRecovered = useAppStore((state) => state.dismissStorageRecovered)
  const session = useAppStore((state) => state.session)
  const users = useAppStore((state) => state.users)
  const setSelectedDay = useAppStore((state) => state.setSelectedDay)
  const setOpeningBalance = useAppStore((state) => state.setOpeningBalance)
  const logout = useAppStore((state) => state.logout)
  const finalizeDay = useAppStore((state) => state.finalizeDay)

  const upsertProfit = useAppStore((state) => state.upsertProfit)
  const deleteProfit = useAppStore((state) => state.deleteProfit)
  const upsertExpense = useAppStore((state) => state.upsertExpense)
  const deleteExpense = useAppStore((state) => state.deleteExpense)
  const upsertAdvance = useAppStore((state) => state.upsertAdvance)
  const deleteAdvance = useAppStore((state) => state.deleteAdvance)
  const upsertDue = useAppStore((state) => state.upsertDue)
  const deleteDue = useAppStore((state) => state.deleteDue)
  const upsertMoneyEntry = useAppStore((state) => state.upsertMoneyEntry)
  const deleteMoneyEntry = useAppStore((state) => state.deleteMoneyEntry)

  const day = useMemo(() => days[selectedDay] ?? createFallbackDay(selectedDay), [days, selectedDay])
  const totals = useMemo(() => getDayTotals(day), [day])

  const currentUser = useMemo(
    () => users.find((user) => user.id === session?.userId) ?? null,
    [session, users]
  )

  const isPast = isPastDay(selectedDay, todayKey)
  const editable = selectedDay === todayKey && !day.isFinalized
  const canUseModules = editable && day.openingBalance !== null

  const requestFinalize = () => {
    if (!editable || isFinalizing) {
      return
    }
    if (day.openingBalance === null) {
      setMismatchState({
        title: "Opening balance required",
        lines: [
          "Set the opening balance from the Profit tab first.",
          `Entered: ${formatCurrency(totals.totalDistributed)}`,
          `Expected: ${formatCurrency(totals.totalMoney)}`,
        ],
      })
      return
    }

    if (!totals.moneyValidation.matches) {
      setMismatchState({
        title: "Money mismatch",
        lines: [
          `Expected: ${formatCurrency(totals.moneyValidation.expected)}`,
          `Entered: ${formatCurrency(totals.moneyValidation.entered)}`,
          `Difference: ${formatCurrency(totals.moneyValidation.difference)}`,
        ],
      })
      return
    }

    setConfirmFinalizeOpen(true)
  }

  const confirmFinalize = () => {
    if (!editable || isFinalizing) {
      return
    }

    setIsFinalizing(true)
    const result = finalizeDay()
    if (!result.ok && result.reason === "mismatch") {
      setMismatchState({
        title: "Money mismatch",
        lines: [
          `Expected: ${formatCurrency(result.expected)}`,
          `Entered: ${formatCurrency(result.entered)}`,
          `Difference: ${formatCurrency(result.difference)}`,
        ],
      })
    }
    if (!result.ok && result.reason === "opening_balance_required") {
      setMismatchState({
        title: "Opening balance required",
        lines: [
          "Set the opening balance from the Profit tab first.",
          `Entered: ${formatCurrency(totals.totalDistributed)}`,
          `Expected: ${formatCurrency(totals.totalMoney)}`,
        ],
      })
    }
    if (result.ok) {
      setConfirmFinalizeOpen(false)
    }
    setIsFinalizing(false)
  }

  const tabContent = (
    {
      profit: (
        <ProfitModule
          dayKey={selectedDay}
          entries={day.profits}
          catalogs={catalogs}
          openingBalance={day.openingBalance}
          totalProfit={totals.dailyProfit}
          effectiveProfit={totals.effectiveProfit}
          editable={editable}
          canUseModules={canUseModules}
          onSetOpeningBalance={setOpeningBalance}
          onUpsert={upsertProfit}
          onDelete={deleteProfit}
        />
      ),
      expenses: (
        <ExpensesModule
          entries={day.expenses}
          catalogs={catalogs}
          totalExpenses={totals.totalExpenses}
          editable={editable}
          canUseModules={canUseModules}
          onUpsert={upsertExpense}
          onDelete={deleteExpense}
        />
      ),
      advances: (
        <AdvancesModule
          entries={day.advances}
          totalAdvances={totals.totalAdvances}
          editable={editable}
          canUseModules={canUseModules}
          onUpsert={upsertAdvance}
          onDelete={deleteAdvance}
        />
      ),
      dues: (
        <DuesModule
          entries={day.dues}
          totalDues={totals.totalDues}
          editable={editable}
          canUseModules={canUseModules}
          onUpsert={upsertDue}
          onDelete={deleteDue}
        />
      ),
      money: (
        <MoneyModule
          entries={day.moneyEntries}
          catalogs={catalogs}
          totalDues={totals.totalDues}
          totalMoney={totals.totalMoney}
          totalDistributed={totals.totalDistributed}
          validation={totals.moneyValidation}
          editable={editable}
          canUseModules={canUseModules}
          onUpsert={upsertMoneyEntry}
          onDelete={deleteMoneyEntry}
        />
      ),
    } satisfies Record<AppTabId, ReactNode>
  )[activeTab]

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-md flex-col overflow-x-hidden">
      <header className="sticky top-0 z-30 space-y-2 border-b bg-background/95 px-4 pb-3 pt-4 backdrop-blur-sm">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs text-muted-foreground">{getGreeting()}</p>
            <h1 className="text-base font-semibold">Ganga Drilling Ltd.</h1>
            <p className="text-xs text-muted-foreground">{currentUser?.name ?? "Operator"}</p>
          </div>
          <Button asChild size="sm" variant="outline" className="min-h-9">
            <MotionTap onClick={() => logout()}>
              <IconDoorExit data-icon="inline-start" />
              Logout
            </MotionTap>
          </Button>
        </div>
        {storageRecovered ? (
          <div className="rounded-md border border-amber-500/50 bg-amber-500/10 px-2 py-1 text-xs text-amber-700 dark:text-amber-300">
            localStorage corruption detected. Previous payload was archived.
            <button className="ml-2 underline" onClick={dismissStorageRecovered}>
              Dismiss
            </button>
          </div>
        ) : null}
      </header>

      <section className="flex flex-1 flex-col overflow-hidden px-4 py-3 pb-24">
        <Card size="sm" className="mb-3 w-full">
          <CardHeader>
            <CardTitle className="text-sm">Day Control</CardTitle>
            <CardDescription>
              {isPast ? "Past day is view-only." : day.isFinalized ? "This day is finalized and read-only." : "Today is editable."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="selected-day">
                  <IconCalendar data-icon="inline-start" className="inline size-3.5" /> Date
                </FieldLabel>
                <input
                  id="selected-day"
                  type="date"
                  max={todayKey}
                  value={selectedDay}
                  onChange={(event) => setSelectedDay(event.target.value)}
                  className="bg-input/20 dark:bg-input/30 border-input focus-visible:border-ring focus-visible:ring-ring/30 h-9 w-full rounded-md border px-2 py-1 text-sm outline-none focus-visible:ring-2"
                />
              </Field>
            </FieldGroup>
          </CardContent>
        </Card>

        {!canUseModules && editable && activeTab !== "profit" ? (
          <div className="mb-3 rounded-md border border-amber-500/50 bg-amber-500/10 px-2 py-2 text-xs text-amber-700 dark:text-amber-300">
            Set opening balance in the Profit tab to unlock entries.
          </div>
        ) : null}

        <div className="min-h-0 flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={reduceMotion ? false : { opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, x: -12 }}
              transition={reduceMotion ? undefined : BOUNCY_SPRING}
              className="h-full"
            >
              {tabContent}
            </motion.div>
          </AnimatePresence>
        </div>

        {activeTab === "money" ? (
          <Card size="sm" className="mb-2 mt-2 w-full">
            <CardHeader>
              <CardTitle className="text-sm">Finalize Day</CardTitle>
              <CardDescription>
                Equation required: user distribution + dues = total money
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="rounded-md border bg-card p-2 text-xs text-muted-foreground">
                <p>Expected: {formatCurrency(totals.totalMoney)}</p>
                <p>Entered: {formatCurrency(totals.totalDistributed)}</p>
              </div>
              <Button className="min-h-10 w-full" onClick={requestFinalize} disabled={!editable || isFinalizing}>
                {day.isFinalized ? "Day Finalized" : isFinalizing ? "Finalizing..." : "Finalize Day"}
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <BottomTabs tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} />
      </section>

      <AlertDialog open={Boolean(mismatchState)} onOpenChange={(open) => (open ? undefined : setMismatchState(null))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <IconAlertTriangle />
            </AlertDialogMedia>
            <AlertDialogTitle>{mismatchState?.title ?? "Validation error"}</AlertDialogTitle>
            <AlertDialogDescription>
              {mismatchState?.lines[0] ?? ""}
              <br />
              {mismatchState?.lines[1] ?? ""}
              <br />
              {mismatchState?.lines[2] ?? ""}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setMismatchState(null)}>Okay</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={confirmFinalizeOpen} onOpenChange={setConfirmFinalizeOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia>
              <IconAlertTriangle />
            </AlertDialogMedia>
            <AlertDialogTitle>Reconfirm finalization</AlertDialogTitle>
            <AlertDialogDescription>
              Finalizing makes this day read-only forever.
              <br />
              Expected: {formatCurrency(totals.moneyValidation.expected)}
              <br />
              Entered: {formatCurrency(totals.moneyValidation.entered)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmFinalize} disabled={isFinalizing}>
              {isFinalizing ? "Finalizing..." : "Yes, Finalize"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </main>
  )
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardScreen />
    </AuthGuard>
  )
}
