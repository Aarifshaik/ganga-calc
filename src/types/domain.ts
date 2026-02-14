export type User = {
  id: string
  name: string
  pinHash: string
}

export type Vehicle = {
  id: string
  name: string
}

export type AppEntryBase = {
  id: string
  createdAt: string
  updatedAt: string
}

export type ProfitEntry = AppEntryBase & {
  vehicleId: string
  agentName: string
  meters: number
  totalPrice: number
}

export type ExpenseEntry = AppEntryBase & {
  vehicleId: string
  expenseType: string
  amount: number
}

export type AdvanceEntry = AppEntryBase & {
  name: string
  details: string
  amount: number
}

export type DueEntry = AppEntryBase & {
  name: string
  details: string
  amount: number
}

export type MoneyEntry = AppEntryBase & {
  locationName: string
  amount: number
}

export type DayLedger = {
  date: string
  openingBalance: number | null
  profits: ProfitEntry[]
  expenses: ExpenseEntry[]
  advances: AdvanceEntry[]
  dues: DueEntry[]
  moneyEntries: MoneyEntry[]
  isFinalized: boolean
  finalizedAt: string | null
}

export type AuthSession = {
  userId: string
  loggedInAt: string
}

export type AppCatalogs = {
  agents: string[]
  expenseTypes: string[]
  moneyLocations: string[]
}

export type AppData = {
  version: number
  selectedDay: string
  session: AuthSession | null
  catalogs: AppCatalogs
  days: Record<string, DayLedger>
}

