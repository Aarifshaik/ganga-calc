"use client"

import { useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"

import { EntryCard } from "@/components/cards/entry-card"
import { EmptyState } from "@/components/layout/empty-state"
import { IntegerInput } from "@/components/layout/integer-input"
import { ModuleShell } from "@/components/layout/module-shell"
import { BOUNCY_SPRING } from "@/components/motion/spring"
import { MetricCard } from "@/components/metrics/metric-card"
import { FullSheet } from "@/components/sheets/full-sheet"
import { Button } from "@/components/ui/button"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { formatTime } from "@/lib/format/date-time"
import { formatCurrency, parseIntegerInput } from "@/lib/format/currency"
import type { AppCatalogs, MoneyEntry } from "@/types/domain"

type MoneyModuleProps = {
  entries: MoneyEntry[]
  catalogs: AppCatalogs
  totalDues: number
  totalMoney: number
  totalDistributed: number
  validation: {
    matches: boolean
    expected: number
    entered: number
    difference: number
  }
  editable: boolean
  canUseModules: boolean
  onUpsert: (input: { id?: string; locationName: string; amount: number }) => boolean
  onDelete: (id: string) => boolean
}

type MoneyFormState = {
  id?: string
  locationName: string
  amount: string
}

const initialForm: MoneyFormState = {
  locationName: "",
  amount: "",
}

export function MoneyModule({
  entries,
  catalogs,
  totalDues,
  totalMoney,
  totalDistributed,
  validation,
  editable,
  canUseModules,
  onUpsert,
  onDelete,
}: MoneyModuleProps) {
  const reduceMotion = useReducedMotion()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState<MoneyFormState>(initialForm)

  const isEdit = Boolean(form.id)
  const amountValue = parseIntegerInput(form.amount)
  const canSubmit = canUseModules && editable && form.locationName.trim().length > 0 && amountValue >= 0

  const openAdd = () => {
    setForm(initialForm)
    setSheetOpen(true)
  }

  const openEdit = (entry: MoneyEntry) => {
    setForm({
      id: entry.id,
      locationName: entry.locationName,
      amount: String(entry.amount),
    })
    setSheetOpen(true)
  }

  const submit = () => {
    if (!canSubmit || isSubmitting) {
      return
    }
    setIsSubmitting(true)
    const ok = onUpsert({
      id: form.id,
      locationName: form.locationName,
      amount: amountValue,
    })
    if (ok) {
      setSheetOpen(false)
      setIsSubmitting(false)
      return
    }
    setIsSubmitting(false)
  }

  return (
    <>
      <ModuleShell
        title="Where Is Money"
        metrics={
          <div className="grid grid-cols-2 gap-2">
            <MetricCard label="Total Distributed" value={totalDistributed} tone="violet" emphasize />
            <MetricCard label="Total Money" value={totalMoney} />
            <div className="col-span-2 rounded-md border bg-card p-2 text-xs">
              <p className={validation.matches ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                {validation.matches ? "Money equation matched" : "Money equation mismatch"}
              </p>
              <p className="text-muted-foreground">
                User entries + dues = {formatCurrency(validation.entered)} / {formatCurrency(validation.expected)}
              </p>
            </div>
          </div>
        }
        addLabel="Add Money Location"
        onAdd={openAdd}
        disabled={!canUseModules}
      >
        {entries.length === 0 ? (
          <EmptyState message="No distribution entries yet." />
        ) : (
          <AnimatePresence initial={false}>
            {entries.map((entry, index) => (
              <motion.div
                key={entry.id}
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: 8 }}
                transition={reduceMotion ? undefined : { ...BOUNCY_SPRING, delay: index * 0.03 }}
              >
                <EntryCard
                  title={entry.locationName}
                  amount={entry.amount}
                  meta={formatTime(entry.createdAt)}
                  onEdit={editable ? () => openEdit(entry) : undefined}
                  onDelete={editable ? () => onDelete(entry.id) : undefined}
                  disabled={!editable}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}

        <EntryCard
          title="Dues (auto)"
          subtitle="Auto-synced from Dues module"
          amount={totalDues}
          lines={["Read only"]}
          disabled
        />
      </ModuleShell>

      <FullSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={isEdit ? "Edit Money Entry" : "Add Money Entry"}
        body={
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="money-location">Location Name</FieldLabel>
              <Input
                id="money-location"
                list="money-location-options"
                placeholder="Cash in hand, bank..."
                value={form.locationName}
                onChange={(event) => setForm((prev) => ({ ...prev, locationName: event.target.value }))}
              />
              <datalist id="money-location-options">
                {catalogs.moneyLocations.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </Field>
            <Field>
              <FieldLabel htmlFor="money-amount">Amount (₦)</FieldLabel>
              <IntegerInput
                id="money-amount"
                placeholder="0"
                value={form.amount}
                onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
              />
            </Field>
          </FieldGroup>
        }
        footer={
          <Button className="min-h-10 w-full" onClick={submit} disabled={!canSubmit || isSubmitting}>
            {isEdit ? "Update Entry" : "Save Entry"}
          </Button>
        }
      />
    </>
  )
}
