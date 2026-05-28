'use client'

import { useEffect, useState } from 'react'
import { emailService } from '@/services/email.service'
import { EmailLogResponse, EmailStatsResponse } from '@/types'
import { useToastContext } from '@/context/ToastContext'
import { getErrorMessage } from '@/lib/utils'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Send, Eye, MousePointerClick, TrendingUp } from 'lucide-react'

export default function EmailsPage() {
  const { showToast } = useToastContext()
  const [logs, setLogs] = useState<EmailLogResponse[]>([])
  const [stats, setStats] = useState<EmailStatsResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([emailService.getAll(), emailService.getStats()])
      .then(([logs, stats]) => { setLogs(logs); setStats(stats) })
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false))
  }, [showToast])

  if (loading) return <LoadingSpinner />

  const statCards = [
    { icon: Send, label: 'Total Sent', value: stats?.totalSent ?? 0, color: 'bg-blue-600' },
    { icon: Eye, label: 'Opened', value: stats?.totalOpened ?? 0, color: 'bg-green-600' },
    { icon: MousePointerClick, label: 'Clicked', value: stats?.totalClicked ?? 0, color: 'bg-purple-600' },
    { icon: TrendingUp, label: 'Open Rate', value: `${stats?.openRate ?? 0}%`, color: 'bg-amber-500' },
  ]

  return (
    <div className="p-6 space-y-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Email Logs</h1>
        <p className="text-sm text-gray-500 mt-0.5">Track email opens and clicks</p>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {statCards.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
              <Icon size={18} className="text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{label}</p>
              <p className="text-xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              {['To', 'Subject', 'Sent At', 'Opened', 'Opened At', 'Clicked'].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {logs.length === 0 && (
              <tr><td colSpan={6} className="text-center py-12 text-gray-400">No emails sent yet</td></tr>
            )}
            {logs.map((e) => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-900 font-medium">{e.toEmail}</td>
                <td className="px-4 py-3 text-gray-600 max-w-[200px] truncate">{e.subject}</td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{e.sentAt}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${e.opened ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {e.opened ? '✓ Yes' : 'No'}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{e.openedAt ?? '—'}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${e.clicked ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
                    {e.clicked ? '✓ Yes' : 'No'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
