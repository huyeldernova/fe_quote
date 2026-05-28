import axiosInstance from '@/lib/axios'
import { DashboardStats } from '@/types'

export const dashboardService = {
  getStats: () =>
    axiosInstance.get<DashboardStats>('/api/v1/dashboard/stats').then((r) => r.data),
}
