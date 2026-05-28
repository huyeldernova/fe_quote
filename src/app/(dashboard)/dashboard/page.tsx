'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FileText, DollarSign, Mail, TrendingUp, Plus, Eye, Send, FileEdit } from 'lucide-react'
import { dashboardService } from '@/services/dashboard.service'
import { DashboardStats } from '@/types'
import { Badge } from '@/components/ui/Badge'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useToastContext } from '@/context/ToastContext'
import { getErrorMessage, formatCurrency } from '@/lib/utils'
import Button from '@/components/ui/Button'

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string
}) {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${color}`}>
          <Icon size={20} className="text-white" />
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const { showToast } = useToastContext()

  useEffect(() => {
    dashboardService.getStats()
      .then(setStats)
      .catch((err) => showToast(getErrorMessage(err), 'error'))
      .finally(() => setLoading(false))
  }, [showToast])

  if (loading) return <LoadingSpinner />

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Overview of your quotation activity</p>
        </div>
        <Link href="/quotes/new">
          <Button size="sm">
            <Plus size={14} /> New Quote
          </Button>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={FileText} label="Total Quotes" value={stats?.totalQuotes ?? 0} color="bg-[#0F2050]" />
        <StatCard icon={DollarSign} label="Est. Revenue" value={formatCurrency(stats?.estimatedRevenue ?? 0)} color="bg-[#C9A84C]" />
        <StatCard icon={Mail} label="Emails Sent" value={stats?.emailsSent ?? 0} color="bg-blue-600" />
        <StatCard icon={TrendingUp} label="Open Rate" value={`${stats?.openRate ?? 0}%`} color="bg-green-600" />
      </div>

      {/* Status counts */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Draft', value: stats?.draftCount ?? 0, icon: FileEdit, color: 'text-gray-600 bg-gray-100' },
          { label: 'Sent', value: stats?.sentCount ?? 0, icon: Send, color: 'text-blue-600 bg-blue-50' },
          { label: 'Viewed', value: stats?.viewedCount ?? 0, icon: Eye, color: 'text-green-600 bg-green-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
              <Icon size={17} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium">{label}</p>
              <p className="text-xl font-bold text-gray-900">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent quotes */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-sm text-gray-900">Recent Quotes</h3>
            <Link href="/quotes" className="text-xs text-[#0F2050] hover:underline font-medium">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {(stats?.recentQuotes ?? []).length === 0 && (
              <p className="text-center text-sm text-gray-400 py-8">No quotes yet</p>
            )}
            {(stats?.recentQuotes ?? []).map((q) => (
              <Link key={q.id} href={`/quotes/${q.id}`} className="flex items-center px-5 py-3 hover:bg-gray-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">{q.clientName}</p>
                  <p className="text-xs text-gray-500 truncate">{q.tourName}</p>
                </div>
                <div className="text-right ml-3">
                  <Badge status={q.status} />
                  <p className="text-xs text-gray-400 mt-1">{q.createdAt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent emails */}
        <div className="card overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-semibold text-sm text-gray-900">Recent Emails</h3>
            <Link href="/emails" className="text-xs text-[#0F2050] hover:underline font-medium">View all →</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {(stats?.recentEmails ?? []).length === 0 && (
              <p className="text-center text-sm text-gray-400 py-8">No emails sent yet</p>
            )}
            {(stats?.recentEmails ?? []).map((e) => (
              <div key={e.id} className="flex items-center px-5 py-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{e.toEmail}</p>
                  <p className="text-xs text-gray-500 truncate">{e.subject}</p>
                </div>
                <div className="text-right ml-3 flex-shrink-0">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${e.opened ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                    {e.opened ? 'Opened' : 'Sent'}
                  </span>
                  <p className="text-xs text-gray-400 mt-1">{e.sentAt}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
