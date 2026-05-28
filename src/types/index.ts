// ─── Auth ──────────────────────────────────────────────────────────────────
export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  company?: string
}

export interface UserResponse {
  id: string
  name: string
  email: string
  company: string | null
  role: string
}

export interface AuthResponse {
  accessToken: string
  refreshToken: string
  user: UserResponse
}

export interface RefreshTokenResponse {
  accessToken: string
  refreshToken: string
}

export interface UpdateProfileRequest {
  name?: string
  company?: string
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export interface ForgotPasswordRequest {
  email: string
}

export interface ResetPasswordRequest {
  email: string
  otp: string
  newPassword: string
  confirmPassword: string
}

// ─── Quotes ────────────────────────────────────────────────────────────────
export type QuoteStatus = 'DRAFT' | 'SENT' | 'VIEWED'

export interface QuoteCostResponse {
  id: number
  label: string
  amount: number
  sortOrder: number
}

export interface QuoteDayResponse {
  id: number
  dayNumber: number
  location: string
  dateLabel: string
  hotel: string
  sights: string
  note: string
  imageUrl: string | null
}

export interface QuoteListItem {
  id: number
  quoteNumber: string
  clientName: string
  tourName: string
  startDate: string
  paxCount: number
  pricePerPerson: number
  totalAmount: number
  status: QuoteStatus
  createdAt: string
}

export interface QuoteResponse {
  id: number
  quoteNumber: string
  clientName: string
  clientEmail: string
  tourName: string
  tourType: string
  startDate: string
  endDate: string
  routeFrom: string
  routeTo: string
  arrivingAt: string
  departingFrom: string
  transport: string
  starRating: string
  paxCount: number
  profitMargin: number
  pricePerPerson: number
  totalAmount: number
  status: QuoteStatus
  costs: QuoteCostResponse[]
  days: QuoteDayResponse[]
  createdAt: string
  updatedAt: string
}

// ─── Quote Form (what FE submits) ─────────────────────────────────────────
export interface QuoteCostInput {
  label: string
  amount: number
  sortOrder: number
}

export interface QuoteDayInput {
  dayNumber: number
  location: string
  dateLabel: string
  hotel: string
  sights: string
  note: string
  imageUrl: string
}

export interface QuoteFormData {
  clientName: string
  clientEmail: string
  tourName: string
  // Hidden fields (sent to API but not shown in UI)
  tourType: string
  transport: string
  starRating: string
  arrivingAt: string
  departingFrom: string
  profitMargin: number
  // Visible fields
  startDate: string
  endDate: string
  routeFrom: string
  routeTo: string
  paxCount: number
  costs: QuoteCostInput[]
  days: QuoteDayInput[]
}

// ─── Pagination ────────────────────────────────────────────────────────────
export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  last: boolean
}

// ─── Email Logs ────────────────────────────────────────────────────────────
export interface EmailLogResponse {
  id: number
  quoteId: number
  toEmail: string
  ccEmail: string | null
  subject: string
  sentAt: string
  opened: boolean
  openedAt: string | null
  clicked: boolean
  clickedAt: string | null
}

export interface EmailStatsResponse {
  totalSent: number
  totalOpened: number
  totalClicked: number
  openRate: number
}

export interface SendEmailRequest {
  toEmail: string
  ccEmail?: string
  subject: string
  message: string
}

// ─── Dashboard ─────────────────────────────────────────────────────────────
export interface DashboardStats {
  totalQuotes: number
  estimatedRevenue: number
  draftCount: number
  sentCount: number
  viewedCount: number
  emailsSent: number
  openRate: number
  recentQuotes: QuoteListItem[]
  recentEmails: EmailLogResponse[]
}

// ─── Image ─────────────────────────────────────────────────────────────────
export interface ImageUploadResponse {
  imageUrl: string
}

// ─── API Error ─────────────────────────────────────────────────────────────
export interface ApiError {
  code: number
  status: number
  message: string
  error: string
  path: string
}

// ─── Duplicate ─────────────────────────────────────────────────────────────
export interface DuplicateQuoteResponse {
  newQuoteId: number
  quoteNumber: string
}
