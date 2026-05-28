'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft, Edit2, FileDown, Send, Copy, Trash2, Eye } from 'lucide-react'
import { quoteService } from '@/services/quote.service'
import { QuoteResponse } from '@/types'
import { Badge } from '@/components/ui/Badge'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import SendEmailModal from '@/components/quote/SendEmailModal'
import { useToastContext } from '@/context/ToastContext'
import { getErrorMessage, formatCurrency } from '@/lib/utils'

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { showToast } = useToastContext()
  const [quote, setQuote] = useState<QuoteResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [sendOpen, setSendOpen] = useState(false)

  useEffect(() => {
    quoteService.getById(Number(id))
      .then(setQuote)
      .catch((err) => { showToast(getErrorMessage(err), 'error'); router.push('/quotes') })
      .finally(() => setLoading(false))
  }, [id, showToast, router])

  async function handleDelete() {
    if (!confirm('Delete this quote?')) return
    try {
      await quoteService.delete(Number(id))
      showToast('Quote deleted')
      router.push('/quotes')
    } catch (err) { showToast(getErrorMessage(err), 'error') }
  }

  async function handleDuplicate() {
    try {
      const res = await quoteService.duplicate(Number(id))
      showToast(`Duplicated → ${res.quoteNumber}`)
      router.push(`/quotes/${res.newQuoteId}`)
    } catch (err) { showToast(getErrorMessage(err), 'error') }
  }

  if (loading) return <LoadingSpinner />
  if (!quote) return null

  const totalCost = quote.costs.reduce((s, c) => s + c.amount, 0)

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link href="/quotes" className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"><ArrowLeft size={18} /></Link>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-gray-900 font-mono">{quote.quoteNumber}</h1>
            <Badge status={quote.status} />
          </div>
          <p className="text-sm text-gray-500 mt-0.5">{quote.tourName}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" onClick={() => quoteService.previewPdf(quote.id)}><Eye size={14} />Preview PDF</Button>
          <Button variant="ghost" size="sm" onClick={() => quoteService.downloadPdf(quote.id)}><FileDown size={14} />Download PDF</Button>
          <Button variant="ghost" size="sm" onClick={handleDuplicate}><Copy size={14} />Duplicate</Button>
          <Button size="sm" onClick={() => setSendOpen(true)}><Send size={14} />Send Email</Button>
          <Link href={`/quotes/${id}/edit`}><Button variant="gold" size="sm"><Edit2 size={14} />Edit</Button></Link>
          <Button variant="danger" size="sm" onClick={handleDelete}><Trash2 size={14} /></Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Client', value: quote.clientName, sub: quote.clientEmail },
          { label: 'Travel Dates', value: `${quote.startDate} → ${quote.endDate}` },
          { label: 'Route', value: `${quote.routeFrom} → ${quote.routeTo}` },
          { label: 'Passengers', value: `${quote.paxCount} persons` },
          { label: 'Price / Person', value: formatCurrency(quote.pricePerPerson) },
          { label: 'Total Amount', value: formatCurrency(quote.totalAmount) },
        ].map(({ label, value, sub }) => (
          <div key={label} className="card p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{label}</p>
            <p className="font-bold text-gray-900">{value}</p>
            {sub && <p className="text-xs text-gray-500 mt-0.5">{sub}</p>}
          </div>
        ))}
      </div>

      {/* Costs */}
      {quote.costs.length > 0 && (
        <div className="card overflow-hidden mb-4">
          <div className="px-5 py-3 border-b border-gray-100 font-semibold text-sm text-gray-900">Cost Breakdown</div>
          <table className="w-full text-sm">
            <tbody>
              {quote.costs.map((c) => (
                <tr key={c.id} className="border-b border-gray-50">
                  <td className="px-5 py-2.5 text-gray-700">{c.label}</td>
                  <td className="px-5 py-2.5 text-right font-semibold">{formatCurrency(c.amount)}</td>
                </tr>
              ))}
              <tr className="bg-gray-50">
                <td className="px-5 py-2.5 font-bold text-gray-900">Total Cost per Person</td>
                <td className="px-5 py-2.5 text-right font-bold text-[#0F2050]">{formatCurrency(totalCost)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Days */}
      {quote.days.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 font-semibold text-sm text-gray-900">Itinerary — {quote.days.length} Days</div>
          <div className="divide-y divide-gray-50">
            {quote.days.map((d) => (
              <div key={d.id} className="flex gap-4 p-4">
                <div className="w-8 h-8 rounded-lg bg-[#1A5B6A] flex items-center justify-center text-white font-bold text-xs flex-shrink-0 mt-0.5">{d.dayNumber}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold text-gray-900">{d.location || `Day ${d.dayNumber}`}</span>
                    {d.dateLabel && <span className="text-xs text-gray-400">{d.dateLabel}</span>}
                  </div>
                  {d.hotel && <p className="text-sm text-gray-600 mb-1">🏨 {d.hotel}</p>}
                  {d.sights && <p className="text-sm text-gray-500">{d.sights}</p>}
                </div>
                {d.imageUrl && (
                  <img src={d.imageUrl} alt={d.location} className="w-24 h-16 object-cover rounded-lg flex-shrink-0" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <SendEmailModal
        open={sendOpen}
        onClose={() => setSendOpen(false)}
        quoteId={quote.id}
        defaultToEmail={quote.clientEmail}
        tourName={quote.tourName}
        quoteNumber={quote.quoteNumber}
        clientName={quote.clientName}
        onSent={() => { setSendOpen(false); showToast('Email sent! Tracking active 📧') }}
      />
    </div>
  )
}
