import { Card, CardContent } from "@/components/ui/card"

type EmptyStateProps = {
  message: string
}

export function EmptyState({ message }: EmptyStateProps) {
  return (
    <Card size="sm" className="w-full">
      <CardContent className="py-6 text-center text-xs text-muted-foreground">{message}</CardContent>
    </Card>
  )
}

