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
import { parseIntegerInput } from "@/lib/format/currency"
import type { AdvanceEntry } from "@/types/domain"

type AdvancesModuleProps = {
  entries: AdvanceEntry[]
  totalAdvances: number
  editable: boolean
  canUseModules: boolean
  onUpsert: (input: { id?: string; name: string; details: string; amount: number }) => boolean
  onDelete: (id: string) => boolean
}

type AdvancesFormState = {
  id?: string
  name: string
  details: string
  amount: string
}

const initialForm: AdvancesFormState = {
  name: "",
  details: "",
  amount: "",
}

export function AdvancesModule({
  entries,
  totalAdvances,
  editable,
  canUseModules,
  onUpsert,
  onDelete,
}: AdvancesModuleProps) {
  const reduceMotion = useReducedMotion()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState<AdvancesFormState>(initialForm)

  const isEdit = Boolean(form.id)
  const amountValue = parseIntegerInput(form.amount)
  const canSubmit = canUseModules && editable && form.name.trim().length > 0 && amountValue >= 0

  const openAdd = () => {
    setForm(initialForm)
    setSheetOpen(true)
  }

  const openEdit = (entry: AdvanceEntry) => {
    setForm({
      id: entry.id,
      name: entry.name,
      details: entry.details,
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
      name: form.name,
      details: form.details,
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
        title="Advances"
        metrics={<MetricCard label="Total Advances" value={totalAdvances} tone="amber" emphasize />}
        addLabel="Add Advance"
        onAdd={openAdd}
        disabled={!canUseModules}
      >
        {entries.length === 0 ? (
          <EmptyState message="No advance entries for this day." />
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
                  title={entry.name}
                  subtitle={entry.details || undefined}
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
      </ModuleShell>

      <FullSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={isEdit ? "Edit Advance" : "Add Advance"}
        body={
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="advance-name">Name</FieldLabel>
              <Input
                id="advance-name"
                placeholder="Enter name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="advance-details">Details</FieldLabel>
              <Input
                id="advance-details"
                placeholder="Optional details"
                value={form.details}
                onChange={(event) => setForm((prev) => ({ ...prev, details: event.target.value }))}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="advance-amount">Amount (₦)</FieldLabel>
              <IntegerInput
                id="advance-amount"
                placeholder="0"
                value={form.amount}
                onChange={(event) => setForm((prev) => ({ ...prev, amount: event.target.value }))}
              />
            </Field>
          </FieldGroup>
        }
        footer={
          <Button className="min-h-10 w-full" onClick={submit} disabled={!canSubmit || isSubmitting}>
            {isEdit ? "Update Advance" : "Save Advance"}
          </Button>
        }
      />
    </>
  )
}
