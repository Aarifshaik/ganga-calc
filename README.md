# 📱 Ganga Drilling Ltd. — Daily Billing & Cash Tracker

**Status:** 🔒 Frozen Spec (Phase 1)
Mobile-first daily cash ledger built with **Next.js + TypeScript + shadcn/ui**, optimized for Chrome on mobile devices.

---

# 🎯 Product Vision

A fast, tap-friendly daily financial notebook for **Ganga Drilling Ltd.** that enables operators to:

* Record drilling profits
* Track expenses and advances
* Track dues receivable
* Reconcile where money is
* Prevent day-closing mismatches
* Work fully offline

**Users:** max 3 shared operators (same data access)

---

# 🧱 Tech Stack (Frozen)

* **Framework:** Next.js (App Router)
* **Language:** TypeScript (strict)
* **UI:** shadcn/ui (strict usage)
* **Styling:** Tailwind CSS
* **Animations:** Framer Motion (playful bouncy)
* **State:** Zustand
* **Storage:** LocalStorage (Phase 1)
* **Auth:** Hashed PIN (frontend only)
* **Target devices:** iPhone 15, Samsung A55
* **Browser:** Chrome mobile

⚠️ No backend in Phase 1
⚠️ Fully offline capable

---

# 🏠 Main Screen

## Header

Displays:

* Greeting (Good morning/afternoon/evening)
* **Ganga Drilling Ltd.**
* Current user name
* Logout button

---

# 🔐 Authentication

## PIN Login

### Rules

* Max 3 predefined users
* Same data access for all
* PIN stored as **SHA-256 hash**
* No plaintext PIN anywhere
* Session stored locally

### User Type

```ts
type User = {
  id: string
  name: string
  pinHash: string
}
```

---

# 🚗 Vehicles (Fixed Master)

Predefined list:

1. Rig 1
2. Rig 2
3. Rig 3
4. Rig 4
5. Rig 5

```ts
type Vehicle = {
  id: string
  name: string
}
```

---

# 📅 Day Control System

## Calendar Behavior

* Default = today
* Past days = view only
* Only today = editable
* Each day has independent ledger

---

## Opening Balance (MANDATORY GATE)

Located on day control screen.

### Rules

* Must be entered before using any module
* Default allowed = 0
* Stored per day
* Included in **total money**
* NOT included in effective profit

---

# 📊 Financial Logic (FINALIZED)

This section is **authoritative**.

---

## 1️⃣ Daily Profit

```
dailyProfit = sum(profit transactions)
```

---

## 2️⃣ Total Expenses

```
totalExpenses = sum(expenses)
```

(Advances are NOT part of expenses total.)

---

## 3️⃣ Effective Profit (DAY ONLY)

⚠️ Core business metric

```
effectiveProfit = dailyProfit - totalExpenses
```

Rules:

* Opening balance NOT included
* Advances NOT included
* Dues NOT included

---

## 4️⃣ Total Advances

Advances represent money given out but treated as recoverable.

```
totalAdvances = sum(advances)
```

Behavior:

* Stored separately
* NOT part of expenses
* Added back in total money

---

## 5️⃣ Total Dues

Dues represent **money expected but not yet received**.

```
totalDues = sum(dues entries)
```

Behavior:

* Manually entered in Dues module
* Automatically injected into Where Is Money
* User cannot manually edit the auto dues row there

---

## 6️⃣ Total Money (Master Reconciliation Value)

🚨 MOST IMPORTANT FORMULA

```
totalMoney =
  openingBalance
  + effectiveProfit
  + totalAdvances
```

⚠️ Dues are NOT added here
⚠️ Dues only appear inside distribution

---

## 7️⃣ Where Is Money Validation

User distribution must equal:

```
sum(whereIsMoneyUserEntries)
+ totalDues (auto row)
=== totalMoney
```

---

# 🧩 Module Specifications

---

# 🟢 1. Profit Module

## Header Metrics

Display in order:

1. **Effective Profit** (largest, green)
2. **Total Profit** (secondary)

---

## ➕ Add Profit (Sheet Modal)

Fields:

1. Opening Balance (read-only reference)
2. Vehicle (dropdown)
3. Agent Name (creatable select)
4. Meters (numeric keyboard)
5. Total Price (currency numeric)

---

## 🔢 Auto Calculation

Live while typing:

```
pricePerMeter = totalPrice / meters
```

Rules:

* round to **0 decimals**
* show inline beside price
* guard meters = 0

---

## 📋 Profit List

Mobile card list showing:

* time
* vehicle
* agent
* meters
* total
* price/meter

---

# 🔴 2. Expenses Module

## Header

* **Total Expenses (red)**

---

## ➕ Add Expense (Sheet)

Fields:

1. Vehicle dropdown
2. Expense Type (creatable select)
3. Amount (₦ numeric)

---

## List

Mobile-friendly feed.

---

# 🟡 3. Advances Module

## Meaning

Money given out but recoverable.

---

## Header

* **Total Advances**

---

## ➕ Add Advance

Fields:

1. Name
2. Details
3. Amount

---

## Behavior

* Included in totalAdvances
* Added back in totalMoney
* Separate from expenses

---

# 🔵 4. Dues Module (MANUAL)

## Meaning

Money expected to come later.

---

## Header

* **Total Dues**

---

## ➕ Add Due

Fields:

1. Name
2. Details
3. Amount

---

## Behavior

* Summed into **totalDues**
* Automatically appears in Where Is Money
* Not part of totalMoney formula
* Editable until finalize

---

# 🟣 5. Where Is Money

## Purpose

Final distribution of today's money.

---

## Header

* **Total Distributed**

---

## ➕ Add Entry

Fields:

1. Location Name (creatable)
2. Amount

---

## 🔒 Auto Row

System inserts:

```
Dues (auto) = totalDues
```

Rules:

* read-only
* always included in total
* user cannot delete/edit

---

## ✅ Validation Equation

```
userMoneySum + totalDues === totalMoney
```

---

# 🔐 Finalization System

## Finalize Button (Day Screen)

---

## Preconditions

* Opening balance entered
* Money equation matches exactly

---

## On Success

* Day becomes immutable
* No add/edit/delete anywhere
* Read-only forever

---

## On Failure (Blocking Modal)

```
⚠️ Money mismatch
Expected: ₦X
Entered: ₦Y
Difference: ₦Z
```

User cannot finalize.

---

# 📱 Navigation

## Bottom Tab Bar (5 Tabs)

Order:

1. Profit
2. Expenses
3. Advances
4. Dues
5. Where Is Money

Large thumb-friendly targets.

---

# 🎨 UI/UX Requirements

## Design Rules

* Strict shadcn/ui
* Mobile-first spacing
* No hover effects
* Large tap areas
* Full-height sheet modals
* One-hand usable

---

## Animation Style

**Playful Bouncy**

Framer Motion requirements:

* spring transitions
* tap scale: 0.96
* sheet bounce open
* tab slide motion
* smooth counters

---

# 💱 Currency

* Default: **₦ Nigerian Naira**
* Integer display (no decimals)
* Stored as number

---

# 🗂️ Folder Structure (Frozen)

```
src/
  app/
    (auth)/
    (dashboard)/
  components/
    ui/
    sheets/
    cards/
    metrics/
  features/
    profit/
    expenses/
    advances/
    dues/
    money/
  lib/
    calculations/
    auth/
    storage/
  store/
    useAppStore.ts
  types/
```

---

# 🧮 Required Calculation Utilities

Location:

```
lib/calculations/
```

Functions:

* calculateEffectiveProfit
* calculateTotalMoney
* calculatePricePerMeter
* calculateTotalDues
* validateMoneyMatch

---

# ⚠️ Edge Cases

Must handle:

* meters = 0
* empty opening balance
* rapid double taps
* very large numbers
* midnight rollover
* localStorage corruption
* finalize race condition
* Android numeric keyboard quirks
* dues auto-sync into money tab

---

# 🚀 Phase Roadmap

## Phase 1 (current)

* localStorage
* PIN auth
* single device
* offline

## Phase 2

* IndexedDB
* export/import
* enhanced dues analytics

## Phase 3

* cloud sync
* role permissions
* multi-device

---

# 🧪 Definition of Done

App is complete when:

* fully usable one-handed
* no horizontal scroll
* finalize guard never fails
* calculations always consistent
* works offline
* smooth on low-end Android
* passes iPhone 15 viewport
* dues auto-injection works perfectly

---

# 🏁 Project Identity

**Company:** Ganga Drilling Ltd.
**App Type:** Mobile-first cash ledger
**Users:** ≤3 shared operators
**Primary Device:** Android Chrome
**Currency:** Nigerian Naira (₦)

---