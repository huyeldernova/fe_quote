import { QuoteStatus } from '@/types'

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://api.thedigitaldyno.in:8081'

// ─── Brand Colors ──────────────────────────────────────────────────────────
export const BRAND = {
  navy: '#0F2050',
  navyLight: '#1E3A6E',
  gold: '#C9A84C',
  teal: '#1A5B6A',
  cream: '#F5EDE0',
  orange: '#C4613A',
} as const

// ─── Quote Status ──────────────────────────────────────────────────────────
export const STATUS_CONFIG: Record<QuoteStatus, { label: string; bg: string; text: string }> = {
  DRAFT: { label: 'Draft', bg: 'bg-gray-100', text: 'text-gray-600' },
  SENT: { label: 'Sent', bg: 'bg-blue-100', text: 'text-blue-700' },
  VIEWED: { label: 'Viewed', bg: 'bg-green-100', text: 'text-green-700' },
}

// ─── Cost Categories ──────────────────────────────────────────────────────
export const COST_OPTIONS = [
  { emoji: '🏨', label: 'Hotel & Accommodation' },
  { emoji: '✈️', label: 'Flights & Airfare' },
  { emoji: '🚗', label: 'Ground Transportation' },
  { emoji: '🚌', label: 'Airport Transfer' },
  { emoji: '🧭', label: 'Tour Guide Fees' },
  { emoji: '🎫', label: 'Entrance Fees & Tickets' },
  { emoji: '🍽️', label: 'Meals & Dining' },
  { emoji: '🎯', label: 'Activities & Excursions' },
  { emoji: '🛳️', label: 'Cruise / Ferry / Boat' },
  { emoji: '📋', label: 'Visa & Documentation' },
  { emoji: '🛡️', label: 'Travel Insurance' },
  { emoji: '🌿', label: 'Wellness & Spa' },
  { emoji: '💡', label: 'Miscellaneous / Other' },
] as const

// ─── Calendar ─────────────────────────────────────────────────────────────
export const MONTHS_LONG = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export const MONTHS_SHORT = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
]

export const WEEKDAYS_SHORT = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su']

export const WEEKDAYS_LONG = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
]

// ─── Preview — Package details (fixed) ────────────────────────────────────
export const PACKAGE_INCLUDED = [
  'Flight Tickets (International)',
  'Visa (if applicable)',
  'Accommodation with daily breakfast',
  'Meals as per program',
  'Air-con transfers & transportation',
  'All entrance fees as per program',
  'Government tax & service charge',
  'Mineral water per person (tour days)',
]

export const PACKAGE_EXCLUDED = [
  'Excess baggage & personal expenses',
  'Laundry services',
  'Early check-in / late check-out fees',
  'Optional excursions & activities',
  'Meals other than mentioned',
  'Drinks during meals',
  'Peak season surcharges',
  'Personal insurance',
  'Tips & gratuities',
  '5% TCS Declaration',
]

// ─── Nav items ─────────────────────────────────────────────────────────────
export const NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'Quotes', href: '/quotes', icon: 'FileText' },
  { label: 'Email Logs', href: '/emails', icon: 'Mail' },
  { label: 'Profile', href: '/profile', icon: 'User' },
] as const
