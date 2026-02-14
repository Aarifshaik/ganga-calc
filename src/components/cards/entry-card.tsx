"use client"

import { IconEdit, IconTrash } from "@tabler/icons-react"

import { MotionTap } from "@/components/motion/motion-tap"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { formatCurrency } from "@/lib/format/currency"

type EntryCardProps = {
  title: string
  subtitle?: string
  amount: number
  lines?: string[]
  meta?: string
  onEdit?: () => void
  onDelete?: () => void
  disabled?: boolean
}

export function EntryCard({
  title,
  subtitle,
  amount,
  lines = [],
  meta,
  onEdit,
  onDelete,
  disabled = false,
}: EntryCardProps) {
  return (
    <Card size="sm" className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 space-y-1">
            <CardTitle className="truncate text-sm">{title}</CardTitle>
            {subtitle ? <p className="truncate text-xs text-muted-foreground">{subtitle}</p> : null}
          </div>
          <div className="text-sm font-semibold">{formatCurrency(amount)}</div>
        </div>
      </CardHeader>
      {(lines.length > 0 || meta) && (
        <CardContent className="space-y-1 pb-2 text-xs text-muted-foreground">
          {lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
          {meta ? <p>{meta}</p> : null}
        </CardContent>
      )}
      {(onEdit || onDelete) && (
        <CardFooter className="gap-2 border-t pt-3">
          {onEdit ? (
            <Button asChild size="sm" variant="outline" className="min-h-8 flex-1" disabled={disabled}>
              <MotionTap onClick={onEdit}>
                <IconEdit data-icon="inline-start" />
                Edit
              </MotionTap>
            </Button>
          ) : null}
          {onDelete ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="destructive" className="min-h-8 flex-1" disabled={disabled}>
                  <IconTrash data-icon="inline-start" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent size="sm">
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete this entry?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete <strong>{title}</strong>? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction variant="destructive" onClick={onDelete}>
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : null}
        </CardFooter>
      )}
    </Card>
  )
}
