import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format a number as Thai Baht currency
 * Handles floating point precision issues
 * @example formatCurrency(99.9999) → "฿100.00"
 * @example formatCurrency(1234.5) → "฿1,234.50"
 */
export function formatCurrency(amount: number): string {
  const rounded = Math.round(amount * 100) / 100
  return `฿${rounded.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`
}

/**
 * Format currency without the ฿ symbol (for inputs)
 */
export function formatCurrencyValue(amount: number): string {
  const rounded = Math.round(amount * 100) / 100
  return rounded.toLocaleString('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}
