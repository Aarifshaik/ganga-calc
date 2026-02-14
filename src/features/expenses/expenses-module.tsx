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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { VEHICLES } from "@/lib/constants/vehicles"
import { formatTime } from "@/lib/format/date-time"
import { parseIntegerInput } from "@/lib/format/currency"
import type { AppCatalogs, ExpenseEntry } from "@/types/domain"

type ExpensesModuleProps = {
  entries: ExpenseEntry[]
  catalogs: AppCatalogs
  totalExpenses: number
  editable: boolean
  canUseModules: boolean
  onUpsert: (input: { id?: string; vehicleId: string; expenseType: string; amount: number }) => boolean
  onDelete: (id: string) => boolean
}

type ExpensesFormState = {
  id?: string
  vehicleId: string
  expenseType: string
  amount: string
}

const initialForm: ExpensesFormState = {
  vehicleId: "",
  expenseType: "",
  amount: "",
}

export function ExpensesModule({
  entries,
  catalogs,
  totalExpenses,
  editable,
  canUseModules,
  onUpsert,
  onDelete,
}: ExpensesModuleProps) {
  const reduceMotion = useReducedMotion()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState<ExpensesFormState>(initialForm)

  const isEdit = Boolean(form.id)
  const amountValue = parseIntegerInput(form.amount)
  const canSubmit =
    canUseModules &&
    editable &&
    form.vehicleId.trim().length > 0 &&
    form.expenseType.trim().length > 0 &&
    amountValue >= 0

  const openAdd = () => {
    setForm(initialForm)
    setSheetOpen(true)
  }

  const openEdit = (entry: ExpenseEntry) => {
    setForm({
      id: entry.id,
      vehicleId: entry.vehicleId,
      expenseType: entry.expenseType,
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
      vehicleId: form.vehicleId,
      expenseType: form.expenseType,
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
        title="Expenses"
        metrics={<MetricCard label="Total Expenses" value={totalExpenses} tone="red" emphasize />}
        addLabel="Add Expense"
        onAdd={openAdd}
        disabled={!canUseModules}
      >
        {entries.length === 0 ? (
          <EmptyState message="No expense entries for this day." />
        ) : (
          <AnimatePresence initial={false}>
            {entries.map((entry, index) => {
              const vehicle = VEHICLES.find((item) => item.id === entry.vehicleId)?.name ?? entry.vehicleId
              return (
                <motion.div
                  key={entry.id}
                  initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, y: 8 }}
                  transition={reduceMotion ? undefined : { ...BOUNCY_SPRING, delay: index * 0.03 }}
                >
                  <EntryCard
                    title={entry.expenseType}
                    subtitle={vehicle}
                    amount={entry.amount}
                    meta={formatTime(entry.createdAt)}
                    onEdit={editable ? () => openEdit(entry) : undefined}
                    onDelete={editable ? () => onDelete(entry.id) : undefined}
                    disabled={!editable}
                  />
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </ModuleShell>

      <FullSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={isEdit ? "Edit Expense" : "Add Expense"}
        body={
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="expense-vehicle">Vehicle</FieldLabel>
              <Select value={form.vehicleId} onValueChange={(value) => setForm((prev) => ({ ...prev, vehicleId: value }))}>
                <SelectTrigger id="expense-vehicle" className="w-full">
                  <SelectValue placeholder="Select vehicle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {VEHICLES.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel htmlFor="expense-type">Expense Type</FieldLabel>
              <Input
                id="expense-type"
                list="expense-type-options"
                placeholder="Fuel, repairs..."
                value={form.expenseType}
                onChange={(event) => setForm((prev) => ({ ...prev, expenseType: event.target.value }))}
              />
              <datalist id="expense-type-options">
                {catalogs.expenseTypes.map((option) => (
                  <option key={option} value={option} />
                ))}
              </datalist>
            </Field>
            <Field>
              <FieldLabel htmlFor="expense-amount">Amount (₦)</FieldLabel>
              <IntegerInput
                id="expense-amount"
                placeholder="0"
                value={form.amount}
                onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
              />
            </Field>
          </FieldGroup>
        }
        footer={
          <Button className="min-h-10 w-full" onClick={submit} disabled={!canSubmit || isSubmitting}>
            {isEdit ? "Update Expense" : "Save Expense"}
          </Button>
        }
      />
    </>
  )
}
