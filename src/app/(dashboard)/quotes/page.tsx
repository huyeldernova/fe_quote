'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Plus, Search, FileDown, Send, Copy, Trash2, Eye, Edit2 } from 'lucide-react'
import { quoteService } from '@/services/quote.service'
import { QuoteListItem, QuoteStatus } from '@/types'
import { Badge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useToastContext } from '@/context/ToastContext'
import { getErrorMessage, formatCurrency } from '@/lib/utils'

const STATUS_OPTS: { value: '' | QuoteStatus; label: string }[] = [
  { value: '', label: 'All Status' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SENT', label: 'Sent' },
  { value: 'VIEWED', label: 'Viewed' },
]

export default function QuotesPage() {
  const router = useRouter()
  const { showToast } = useToastContext()
  const [quotes, setQuotes] = useState<QuoteListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<'' | QuoteStatus>('')
  const [deleting, setDeleting] = useState<number | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await quoteService.getAll()
      setQuotes(data)
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setLoading(false)
    }
  }, [showToast])

  useEffect(() => { load() }, [load])

  const filtered = quotes.filter((q) => {
    const matchSearch = !search ||
      q.clientName.toLowerCase().includes(search.toLowerCase()) ||
      q.tourName.toLowerCase().includes(search.toLowerCase()) ||
      q.quoteNumber.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !status || q.status === status
    return matchSearch && matchStatus
  })

  async function handleDelete(id: number) {
    if (!confirm('Delete this quote? This cannot be undone.')) return
    setDeleting(id)
    try {
      await quoteService.delete(id)
      setQuotes((prev) => prev.filter((q) => q.id !== id))
      showToast('Quote deleted')
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setDeleting(null)
    }
  }

  async function handleDuplicate(id: number) {
    try {
      const res = await quoteService.duplicate(id)
      showToast(`Duplicated → ${res.quoteNumber}`)
      load()
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    }
  }

  async function handleDownloadPdf(id: number) {
    try {
      await quoteService.downloadPdf(id)
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    }
  }

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Quotes</h1>
          <p className="text-sm text-gray-500 mt-0.5">{quotes.length} total quotations</p>
        </div>
        <Link href="/quotes/new"><Button size="sm"><Plus size={14} />New Quote</Button></Link>
      </div>

      {/* Search & filter */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by client, tour or quote number..."
            className="input-base pl-9"
          />
        </div>
        <select
          value={status} onChange={(e) => setStatus(e.target.value as '' | QuoteStatus)}
          className="input-base w-36"
        >
          {STATUS_OPTS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? <LoadingSpinner /> : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                {['Quote #', 'Client', 'Tour', 'Date', 'Pax', 'Total', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-gray-400">
                  {quotes.length === 0 ? (
                    <div>
                      <p className="font-medium mb-1">No quotes yet</p>
                      <Link href="/quotes/new" className="text-[#0F2050] hover:underline text-sm font-semibold">Create your first quote →</Link>
                    </div>
                  ) : 'No results match your search'}
                </td></tr>
              )}
              {filtered.map((q) => (
                <tr key={q.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs font-semibold text-[#0F2050]">{q.quoteNumber}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{q.clientName}</td>
                  <td className="px-4 py-3 text-gray-600 max-w-[180px] truncate">{q.tourName}</td>
                  <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{q.startDate}</td>
                  <td className="px-4 py-3 text-center font-semibold">{q.paxCount}</td>
                  <td className="px-4 py-3 font-semibold text-gray-900 whitespace-nowrap">{formatCurrency(q.totalAmount)}</td>
                  <td className="px-4 py-3"><Badge status={q.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => router.push(`/quotes/${q.id}`)} title="View" className="p-1.5 rounded hover:bg-blue-50 text-blue-600 transition-colors"><Eye size={14} /></button>
                      <button onClick={() => router.push(`/quotes/${q.id}/edit`)} title="Edit" className="p-1.5 rounded hover:bg-amber-50 text-amber-600 transition-colors"><Edit2 size={14} /></button>
                      <button onClick={() => handleDownloadPdf(q.id)} title="PDF" className="p-1.5 rounded hover:bg-green-50 text-green-600 transition-colors"><FileDown size={14} /></button>
                      <button onClick={() => router.push(`/quotes/${q.id}#send`)} title="Send" className="p-1.5 rounded hover:bg-purple-50 text-purple-600 transition-colors"><Send size={14} /></button>
                      <button onClick={() => handleDuplicate(q.id)} title="Duplicate" className="p-1.5 rounded hover:bg-gray-100 text-gray-500 transition-colors"><Copy size={14} /></button>
                      <button onClick={() => handleDelete(q.id)} disabled={deleting === q.id} title="Delete" className="p-1.5 rounded hover:bg-red-50 text-red-500 transition-colors disabled:opacity-40"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
