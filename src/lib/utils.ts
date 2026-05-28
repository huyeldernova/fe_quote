import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { MONTHS_SHORT, WEEKDAYS_LONG } from '@/constants'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0')
  const m = MONTHS_SHORT[date.getMonth()]
  const y = date.getFullYear()
  return `${d} ${m} ${y}`
}

export function formatDateShort(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0')
  const m = MONTHS_SHORT[date.getMonth()]
  return `${d} ${m}`
}

export function getWeekday(date: Date): string {
  return WEEKDAYS_LONG[date.getDay()]
}

export function midnight(date: Date): Date {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

export function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  )
}

export function addDays(date: Date, n: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + n)
  return d
}

export function calcNights(start: Date, end: Date): number {
  return Math.max(0, Math.round((end.getTime() - start.getTime()) / 86_400_000))
}

export function formatCurrency(amount: number, currency = '₹'): string {
  return `${currency}${amount.toLocaleString('en-IN')}`
}

/** Price calculation matching BE formula */
export function calcPricePerPerson(totalCost: number, profitMargin: number): number {
  if (profitMargin >= 100) return 0
  return Math.ceil(totalCost / (1 - profitMargin / 100) / 50) * 50
}

export function getErrorMessage(error: unknown): string {
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosError = error as { response?: { data?: { message?: string } } }
    return axiosError.response?.data?.message ?? 'An error occurred'
  }
  if (error instanceof Error) return error.message
  return 'An error occurred'
}
