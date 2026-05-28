import axiosInstance from '@/lib/axios'
import {
  DuplicateQuoteResponse,
  QuoteFormData,
  QuoteListItem,
  QuoteResponse,
  SendEmailRequest,
} from '@/types'

/** Always inject hidden fields the API requires but FE doesn't show */
function withHiddenFields(data: QuoteFormData): QuoteFormData {
  return {
    ...data,
    tourType: data.tourType || '',
    transport: data.transport || '',
    starRating: data.starRating || '',
    arrivingAt: data.arrivingAt || '',
    departingFrom: data.departingFrom || '',
    profitMargin: data.profitMargin ?? 0,
    days: data.days.map((d) => ({ ...d, note: d.note || '' })),
  }
}

export const quoteService = {
  getAll: () =>
    axiosInstance
      .get<QuoteListItem[]>('/api/v1/quotes')
      .then((r) => {
        // Handle both List[] and PageResponse { content: [] }
        const data = r.data as unknown
        if (Array.isArray(data)) return data as QuoteListItem[]
        const paged = data as { content?: QuoteListItem[] }
        return paged.content ?? []
      }),

  getById: (id: number) =>
    axiosInstance.get<QuoteResponse>(`/api/v1/quotes/${id}`).then((r) => r.data),

  create: (data: QuoteFormData) =>
    axiosInstance
      .post<QuoteResponse>('/api/v1/quotes', withHiddenFields(data))
      .then((r) => r.data),

  update: (id: number, data: QuoteFormData) =>
    axiosInstance
      .put<QuoteResponse>(`/api/v1/quotes/${id}`, withHiddenFields(data))
      .then((r) => r.data),

  delete: (id: number) =>
    axiosInstance.delete(`/api/v1/quotes/${id}`),

  duplicate: (id: number) =>
    axiosInstance
      .post<DuplicateQuoteResponse>(`/api/v1/quotes/${id}/duplicate`)
      .then((r) => r.data),

  downloadPdf: async (id: number, filename?: string): Promise<void> => {
    const res = await axiosInstance.get(`/api/v1/quotes/${id}/pdf`, {
      responseType: 'blob',
    })
    const url = URL.createObjectURL(res.data as Blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename ?? `quote-${id}.pdf`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  },

  previewPdf: async (id: number): Promise<void> => {
    const res = await axiosInstance.get(`/api/v1/quotes/${id}/preview`, {
      responseType: 'blob',
    })
    const url = URL.createObjectURL(res.data as Blob)
    window.open(url, '_blank')
  },

  sendEmail: (id: number, data: SendEmailRequest) =>
    axiosInstance
      .post<{ emailLogId: number }>(`/api/v1/quotes/${id}/send`, data)
      .then((r) => r.data),
}
