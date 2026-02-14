"use client"

import { useRef, useState } from "react"
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
import { calculatePricePerMeter } from "@/lib/calculations"
import { formatTime } from "@/lib/format/date-time"
import { formatCurrency, parseIntegerInput } from "@/lib/format/currency"
import { cn } from "@/lib/utils"
import type { AppCatalogs, ProfitEntry } from "@/types/domain"

type ProfitModuleProps = {
  dayKey: string
  entries: ProfitEntry[]
  catalogs: AppCatalogs
  openingBalance: number | null
  totalProfit: number
  effectiveProfit: number
  editable: boolean
  canUseModules: boolean
  onSetOpeningBalance: (value: number) => boolean
  onUpsert: (input: {
    id?: string
    vehicleId: string
    agentName: string
    meters: number
    totalPrice: number
  }) => boolean
  onDelete: (id: string) => boolean
}

type ProfitFormState = {
  id?: string
  vehicleId: string
  agentName: string
  meters: string
  totalPrice: string
}

const initialFormState: ProfitFormState = {
  vehicleId: "",
  agentName: "",
  meters: "",
  totalPrice: "",
}

export function ProfitModule({
  dayKey,
  entries,
  catalogs,
  openingBalance,
  totalProfit,
  effectiveProfit,
  editable,
  canUseModules,
  onSetOpeningBalance,
  onUpsert,
  onDelete,
}: ProfitModuleProps) {
  const reduceMotion = useReducedMotion()
  const [sheetOpen, setSheetOpen] = useState(false)
  const [isSavingOpening, setIsSavingOpening] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState<ProfitFormState>(initialFormState)
  const openingInputRef = useRef<HTMLInputElement>(null)

  const isEdit = Boolean(form.id)
  const metersValue = parseIntegerInput(form.meters)
  const totalPriceValue = parseIntegerInput(form.totalPrice)
  const pricePerMeter = calculatePricePerMeter(totalPriceValue, metersValue)

  const canSubmit =
    canUseModules &&
    editable &&
    form.vehicleId.trim().length > 0 &&
    form.agentName.trim().length > 0 &&
    metersValue > 0 &&
    totalPriceValue >= 0

  const openAddSheet = () => {
    setForm(initialFormState)
    setSheetOpen(true)
  }

  const openEditSheet = (entry: ProfitEntry) => {
    setForm({
      id: entry.id,
      vehicleId: entry.vehicleId,
      agentName: entry.agentName,
      meters: String(entry.meters),
      totalPrice: String(entry.totalPrice),
    })
    setSheetOpen(true)
  }

  const closeSheet = () => {
    setSheetOpen(false)
    setIsSubmitting(false)
  }

  const submit = () => {
    if (!canSubmit || isSubmitting) {
      return
    }
    setIsSubmitting(true)
    const ok = onUpsert({
      id: form.id,
      vehicleId: form.vehicleId,
      agentName: form.agentName,
      meters: metersValue,
      totalPrice: totalPriceValue,
    })
    if (ok) {
      closeSheet()
      return
    }
    setIsSubmitting(false)
  }

  const saveOpeningBalance = () => {
    if (!editable || isSavingOpening) {
      return
    }
    setIsSavingOpening(true)
    const amount = parseIntegerInput(openingInputRef.current?.value ?? "")
    onSetOpeningBalance(amount)
    setIsSavingOpening(false)
  }

  return (
    <>
      <ModuleShell
        title="Profit"
        metrics={
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <MetricCard label="Effective Profit" value={effectiveProfit} tone="green" emphasize />
              <MetricCard label="Total Profit" value={totalProfit} />
            </div>
            <div className="rounded-md border bg-card p-2">
              <p className="mb-2 text-xs font-medium">Opening Balance (mandatory)</p>
              <div className="flex items-center gap-2">
                <IntegerInput
                  key={`${dayKey}-${openingBalance ?? "unset"}`}
                  defaultValue={openingBalance === null ? "" : String(openingBalance)}
                  ref={openingInputRef}
                  placeholder="0"
                  disabled={!editable}
                />
                <Button onClick={saveOpeningBalance} disabled={!editable || isSavingOpening} className="min-h-9">
                  Save
                </Button>
              </div>
            </div>
          </div>
        }
        addLabel="Add Profit"
        onAdd={openAddSheet}
        disabled={!canUseModules}
      >
        {entries.length === 0 ? (
          <EmptyState message="No profit entries for this day." />
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
                    title={vehicle}
                    subtitle={entry.agentName}
                    amount={entry.totalPrice}
                    lines={[
                      `Meters: ${entry.meters}`,
                      `Price / meter: ${formatCurrency(calculatePricePerMeter(entry.totalPrice, entry.meters))}`,
                    ]}
                    meta={formatTime(entry.createdAt)}
                    onEdit={editable ? () => openEditSheet(entry) : undefined}
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
        title={isEdit ? "Edit Profit Entry" : "Add Profit Entry"}
        description="Profit entries affect daily and effective profit."
        body={
          <FieldGroup>
            <Field>
              <FieldLabel htmlFor="profit-vehicle">Vehicle</FieldLabel>
              <Select value={form.vehicleId} onValueChange={(value) => setForm((prev) => ({ ...prev, vehicleId: value }))}>
                <SelectTrigger id="profit-vehicle" className="w-full">
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
              <FieldLabel htmlFor="profit-agent">Agent Name</FieldLabel>
              <Input
                id="profit-agent"
                list="agent-options"
                placeholder="Select or type agent"
                value={form.agentName}
                onChange={(event) => setForm((prev) => ({ ...prev, agentName: event.target.value }))}
              />
              <datalist id="agent-options">
                {catalogs.agents.map((agent) => (
                  <option key={agent} value={agent} />
                ))}
              </datalist>
            </Field>
            <Field>
              <FieldLabel htmlFor="profit-meters">Meters</FieldLabel>
              <IntegerInput
                id="profit-meters"
                placeholder="0"
                value={form.meters}
                onChange={(event) => setForm((prev) => ({ ...prev, meters: event.target.value }))}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="profit-total">Total Price (₦)</FieldLabel>
              <IntegerInput
                id="profit-total"
                placeholder="0"
                value={form.totalPrice}
                onChange={(event) => setForm((prev) => ({ ...prev, totalPrice: event.target.value }))}
              />
            </Field>
            <p className={cn("text-xs", metersValue > 0 ? "text-muted-foreground" : "text-amber-600")}>
              Price/meter: {formatCurrency(pricePerMeter)}
            </p>
          </FieldGroup>
        }
        footer={
          <Button className="min-h-10 w-full" onClick={submit} disabled={!canSubmit || isSubmitting}>
            {isEdit ? "Update Profit" : "Save Profit"}
          </Button>
        }
      />
    </>
  )
}
