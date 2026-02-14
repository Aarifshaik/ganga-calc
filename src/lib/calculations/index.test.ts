import { describe, expect, it } from "vitest"

import {
  calculateEffectiveProfit,
  calculatePricePerMeter,
  calculateTotalDues,
  calculateTotalMoney,
  validateMoneyMatch,
} from "@/lib/calculations"

describe("calculation utilities", () => {
  it("calculates effective profit from profit and expenses only", () => {
    expect(calculateEffectiveProfit(1200, 450)).toBe(750)
    expect(calculateEffectiveProfit(500, 800)).toBe(-300)
  })

  it("calculates total money using opening + effective + advances", () => {
    expect(calculateTotalMoney(1000, 300, 200)).toBe(1500)
    expect(calculateTotalMoney(-100, 50, 10)).toBe(-40)
  })

  it("calculates price per meter and guards zero meters", () => {
    expect(calculatePricePerMeter(1000, 0)).toBe(0)
    expect(calculatePricePerMeter(1000, 3)).toBe(333)
    expect(calculatePricePerMeter(1500, 3)).toBe(500)
  })

  it("calculates total dues", () => {
    expect(
      calculateTotalDues([
        {
          id: "1",
          createdAt: "",
          updatedAt: "",
          name: "A",
          details: "",
          amount: 80,
        },
        {
          id: "2",
          createdAt: "",
          updatedAt: "",
          name: "B",
          details: "",
          amount: 20,
        },
      ])
    ).toBe(100)
  })

  it("validates money match and returns expected metadata", () => {
    expect(validateMoneyMatch(70, 30, 100)).toEqual({
      matches: true,
      expected: 100,
      entered: 100,
      difference: 0,
    })

    expect(validateMoneyMatch(50, 10, 80)).toEqual({
      matches: false,
      expected: 80,
      entered: 60,
      difference: 20,
    })
  })
})

