import axiosInstance from '@/lib/axios'
import { EmailLogResponse, EmailStatsResponse } from '@/types'

export const emailService = {
  getAll: () =>
    axiosInstance
      .get<EmailLogResponse[]>('/api/v1/emails')
      .then((r) => {
        const data = r.data as unknown
        if (Array.isArray(data)) return data as EmailLogResponse[]
        const paged = data as { content?: EmailLogResponse[] }
        return paged.content ?? []
      }),

  getStats: () =>
    axiosInstance.get<EmailStatsResponse>('/api/v1/emails/stats').then((r) => r.data),

  getById: (id: number) =>
    axiosInstance.get<EmailLogResponse>(`/api/v1/emails/${id}`).then((r) => r.data),
}
