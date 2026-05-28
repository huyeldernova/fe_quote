'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, Printer, Save, ArrowLeft, FileDown } from 'lucide-react'
import { quoteService } from '@/services/quote.service'
import { QuoteFormData, QuoteCostInput, QuoteDayInput, QuoteResponse } from '@/types'
import { useToastContext } from '@/context/ToastContext'
import { getErrorMessage, formatDate, formatDateShort, addDays, calcNights, formatCurrency, calcPricePerPerson } from '@/lib/utils'
import { COST_OPTIONS } from '@/constants'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import CostModal from './CostModal'
import DayRow from './DayRow'
import QuotePreview, { printQuotePdf } from './QuotePreview'
import CalendarPicker from './CalendarPicker'

interface Props {
  initialData?: QuoteResponse
  mode: 'create' | 'edit'
}

function emptyDay(dayNumber: number, dateLabel = ''): QuoteDayInput {
  return { dayNumber, location: '', dateLabel, hotel: '', sights: '', note: '', imageUrl: '' }
}

export default function QuoteForm({ initialData, mode }: Props) {
  const router = useRouter()
  const { showToast } = useToastContext()
  const [saving, setSaving] = useState(false)
  const [costModalOpen, setCostModalOpen] = useState(false)

  // ── Form State ────────────────────────────────────────────────────────
  const [clientName, setClientName] = useState(initialData?.clientName ?? '')
  const [clientEmail, setClientEmail] = useState(initialData?.clientEmail ?? '')
  const [tourName, setTourName] = useState(initialData?.tourName ?? '')
  const [routeFrom, setRouteFrom] = useState(initialData?.routeFrom ?? '')
  const [routeTo, setRouteTo] = useState(initialData?.routeTo ?? '')
  const [paxCount, setPaxCount] = useState(initialData?.paxCount ?? 2)
  const [startDate, setStartDate] = useState<Date | null>(initialData?.startDate ? new Date(initialData.startDate) : null)
  const [endDate, setEndDate] = useState<Date | null>(initialData?.endDate ? new Date(initialData.endDate) : null)
  const [fmtStart, setFmtStart] = useState(initialData?.startDate ?? '')
  const [fmtEnd, setFmtEnd] = useState(initialData?.endDate ?? '')

  const initCosts = (): QuoteCostInput[] =>
    (initialData?.costs ?? []).map((c) => ({ label: c.label, amount: c.amount, sortOrder: c.sortOrder }))
  const initDays = (): QuoteDayInput[] =>
    (initialData?.days ?? [{ dayNumber: 1, location: '', dateLabel: '', hotel: '', sights: '', note: '', imageUrl: '' }])
      .map((d) => ({ dayNumber: d.dayNumber, location: d.location || '', dateLabel: d.dateLabel || '', hotel: d.hotel || '', sights: d.sights || '', note: d.note || '', imageUrl: d.imageUrl || '' }))

  const [costs, setCosts] = useState<QuoteCostInput[]>(initCosts)
  const [days, setDays] = useState<QuoteDayInput[]>(initDays)

  // ── Derived pricing ───────────────────────────────────────────────────
  const totalCost = costs.reduce((s, c) => s + (c.amount || 0), 0)
  const ppp = calcPricePerPerson(totalCost, 0)
  const totalAmount = ppp * paxCount

  // ── Date handler — auto-generates days ────────────────────────────────
  function handleDatesChange(start: Date, end: Date, nights: number) {
    setStartDate(start); setEndDate(end)
    setFmtStart(formatDate(start)); setFmtEnd(formatDate(end))
    const totalDays = nights + 1
    const newDays: QuoteDayInput[] = Array.from({ length: totalDays }, (_, i) => {
      const dt = addDays(start, i)
      const label = formatDateShort(dt)
      return emptyDay(i + 1, label)
    })
    setDays(newDays)
    showToast(`${nights} nights · ${totalDays} days generated ✓`)
  }

  // ── Cost handlers ─────────────────────────────────────────────────────
  function addCost(cost: QuoteCostInput) { setCosts((prev) => [...prev, cost]) }
  function removeCost(i: number) { setCosts((prev) => prev.filter((_, idx) => idx !== i)) }

  // ── Day handlers ──────────────────────────────────────────────────────
  function addDay() { setDays((prev) => [...prev, emptyDay(prev.length + 1)]) }
  function removeDay(i: number) {
    setDays((prev) => prev.filter((_, idx) => idx !== i).map((d, idx) => ({ ...d, dayNumber: idx + 1 })))
  }
  function updateDay(i: number, updated: QuoteDayInput) {
    setDays((prev) => prev.map((d, idx) => idx === i ? updated : d))
  }

  // ── Build payload ─────────────────────────────────────────────────────
  function buildPayload(): QuoteFormData {
    return {
      clientName, clientEmail, tourName,
      tourType: '', transport: '', starRating: '', arrivingAt: '', departingFrom: '',
      profitMargin: 0,
      startDate: fmtStart, endDate: fmtEnd,
      routeFrom, routeTo, paxCount,
      costs, days,
    }
  }

  async function handleSave() {
    if (!clientName.trim()) { showToast('Client name is required', 'error'); return }
    if (!tourName.trim()) { showToast('Tour name is required', 'error'); return }
    if (costs.length === 0) { showToast('Add at least one cost item', 'error'); return }
    if (days.length === 0) { showToast('Add at least one day', 'error'); return }

    setSaving(true)
    try {
      if (mode === 'create') {
        const res = await quoteService.create(buildPayload())
        showToast(`Quote ${res.quoteNumber} created ✓`)
        router.push(`/quotes/${res.id}`)
      } else {
        const res = await quoteService.update(initialData!.id, buildPayload())
        showToast(`Quote ${res.quoteNumber} updated ✓`)
        router.push(`/quotes/${res.id}`)
      }
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  const previewData = { clientName, tourName, startDate: fmtStart, endDate: fmtEnd, routeFrom, routeTo, paxCount, costs, days }

  return (
    <div className="h-screen overflow-hidden flex flex-col">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-6 py-3 bg-white border-b border-gray-200 flex-shrink-0">
        <button onClick={() => router.push('/quotes')} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500"><ArrowLeft size={17} /></button>
        <div className="flex-1">
          <h1 className="text-base font-bold text-gray-900">
            {mode === 'create' ? 'Create New Quote' : `Edit — ${initialData?.quoteNumber}`}
          </h1>
          <p className="text-xs text-gray-400">Type on the left — preview updates live on the right</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => printQuotePdf(previewData)}><Printer size={13} />Download PDF</Button>
        <Button variant="ghost" size="sm" onClick={handleSave} loading={saving}><Save size={13} />Save Draft</Button>
        <Button size="sm" onClick={handleSave} loading={saving}><FileDown size={13} />Save Quote</Button>
      </div>

      {/* Body: form | preview */}
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT: Form */}
        <div className="w-[500px] flex-shrink-0 overflow-y-auto bg-gray-50 border-r border-gray-200 p-5 space-y-4">

          {/* Section 1 — Client & Tour */}
          <Section num={1} title="Client & Tour">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Input label="Client Name" required value={clientName} onChange={(e) => setClientName(e.target.value)} />
              <Input label="Client Email" type="email" value={clientEmail} onChange={(e) => setClientEmail(e.target.value)} />
            </div>
            <Input label="Tour Name" required value={tourName} onChange={(e) => setTourName(e.target.value)} />
          </Section>

          {/* Section 2 — Route & Travel Dates */}
          <Section num={2} title="Route & Travel Dates">
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Input label="From" value={routeFrom} onChange={(e) => setRouteFrom(e.target.value)} />
              <Input label="To" value={routeTo} onChange={(e) => setRouteTo(e.target.value)} />
            </div>
            <div className="mb-3">
              <Input label="Passengers" required type="number" min={1} value={paxCount} onChange={(e) => setPaxCount(Number(e.target.value))} />
            </div>
            <CalendarPicker startDate={startDate} endDate={endDate} onChange={handleDatesChange} />
          </Section>

          {/* Section 3 — Cost Breakdown */}
          <Section num={3} title="Cost Breakdown" action={<Button type="button" variant="ghost" size="sm" onClick={() => setCostModalOpen(true)}><Plus size={12} />Add Item</Button>}>
            <div className="space-y-2">
              {costs.length === 0 && <p className="text-xs text-gray-400 text-center py-4">No cost items yet. Click + Add Item</p>}
              {costs.map((c, i) => {
                const opt = COST_OPTIONS.find((o) => o.label === c.label)
                return (
                  <div key={i} className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg px-3 py-2.5">
                    <span className="text-base">{opt?.emoji ?? '📌'}</span>
                    <span className="flex-1 text-sm font-medium text-gray-900 truncate">{c.label}</span>
                    <span className="text-sm font-bold text-[#0F2050]">{formatCurrency(c.amount)}</span>
                    <button type="button" onClick={() => removeCost(i)} className="text-gray-300 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                  </div>
                )
              })}
              {costs.length > 0 && (
                <div className="flex justify-between text-xs font-semibold text-gray-600 px-3 pt-2 border-t border-gray-100">
                  <span>Total cost / person</span>
                  <span className="text-[#0F2050]">{formatCurrency(totalCost)}</span>
                </div>
              )}
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {ppp > 0 && [
                { label: 'Price / Person', value: formatCurrency(ppp), color: 'bg-green-50 border-green-200' },
                { label: `Total (${paxCount} pax)`, value: formatCurrency(totalAmount), color: 'bg-blue-50 border-blue-200' },
              ].map(({ label, value, color }) => (
                <div key={label} className={`border rounded-lg p-3 text-center ${color}`}>
                  <p className="text-xs text-gray-500">{label}</p>
                  <p className="text-base font-bold text-gray-900">{value}</p>
                </div>
              ))}
            </div>
          </Section>

          {/* Section 4 — Itinerary Days */}
          <Section num={4} title="Itinerary Days" action={<Button type="button" variant="ghost" size="sm" onClick={addDay}><Plus size={12} />Add Day</Button>}>
            <div className="space-y-3">
              {days.map((d, i) => (
                <DayRow key={i} index={i} day={d} onChange={(updated) => updateDay(i, updated)} onRemove={() => removeDay(i)} canRemove={days.length > 1} />
              ))}
            </div>
          </Section>
        </div>

        {/* RIGHT: Live Preview */}
        <div className="flex-1 bg-[#2a2a2a] relative overflow-hidden">
          <div className="bg-[#1A5B6A] px-4 h-9 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-1.5">
              {['#FF5F57','#FFBD2E','#28C840'].map((c) => <div key={c} className="w-3 h-3 rounded-full" style={{ background: c }} />)}
            </div>
            <span className="text-xs text-white/50 font-medium tracking-wide">LIVE PREVIEW</span>
            <span className="text-xs text-white/30 italic">scroll inside to see more →</span>
          </div>
          <div className="absolute inset-0 top-9 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
            <div style={{ zoom: 1.1 }}>
              <QuotePreview data={previewData} />
            </div>
          </div>
        </div>
      </div>

      <CostModal open={costModalOpen} onClose={() => setCostModalOpen(false)} onAdd={addCost} nextSortOrder={costs.length} />
    </div>
  )
}

function Section({ num, title, children, action }: {
  num: number; title: string; children: React.ReactNode; action?: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-[#0F2050] text-white text-xs font-bold flex items-center justify-center">{num}</div>
          <h3 className="text-sm font-bold text-gray-900">{title}</h3>
        </div>
        {action}
      </div>
      {children}
    </div>
  )
}
