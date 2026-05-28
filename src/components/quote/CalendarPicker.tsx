'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { MONTHS_LONG, MONTHS_SHORT, WEEKDAYS_SHORT } from '@/constants'
import { midnight, sameDay, formatDate, getWeekday, addDays, calcNights } from '@/lib/utils'

interface Props {
  startDate: Date | null
  endDate: Date | null
  onChange: (start: Date, end: Date, nights: number) => void
}

export default function CalendarPicker({ startDate, endDate, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const today = midnight(new Date())

  const [calStart, setCalStart] = useState<Date | null>(startDate)
  const [calEnd, setCalEnd] = useState<Date | null>(endDate)
  const [hoverDate, setHoverDate] = useState<Date | null>(null)
  const [phase, setPhase] = useState<'start' | 'end'>(startDate && !endDate ? 'end' : 'start')

  const initView1 = () => {
    if (startDate) return new Date(startDate.getFullYear(), startDate.getMonth(), 1)
    return new Date(today.getFullYear(), today.getMonth(), 1)
  }
  const [view1, setView1] = useState(initView1)
  const [view2, setView2] = useState(new Date(view1.getFullYear(), view1.getMonth() + 1, 1))

  function openPicker() {
    setCalStart(startDate); setCalEnd(endDate)
    setPhase(startDate && !endDate ? 'end' : 'start')
    const v = initView1()
    setView1(v)
    setView2(new Date(v.getFullYear(), v.getMonth() + 1, 1))
    setOpen(true)
  }

  function prev() {
    setView1(new Date(view1.getFullYear(), view1.getMonth() - 1, 1))
    setView2(new Date(view1.getFullYear(), view1.getMonth(), 1))
  }
  function next() {
    setView1(new Date(view1.getFullYear(), view1.getMonth() + 1, 1))
    setView2(new Date(view1.getFullYear(), view1.getMonth() + 2, 1))
  }

  function clickDay(dt: Date) {
    if (phase === 'start') {
      setCalStart(dt); setCalEnd(null); setHoverDate(null); setPhase('end')
    } else {
      if (dt <= (calStart!)) {
        setCalStart(dt); setCalEnd(null); setPhase('end')
      } else {
        setCalEnd(dt); setPhase('start')
      }
    }
  }

  function apply() {
    if (!calStart) return
    const end = calEnd ?? addDays(calStart, 7)
    onChange(calStart, end, calcNights(calStart, end))
    setOpen(false)
  }

  function clear() {
    setCalStart(null); setCalEnd(null); setHoverDate(null); setPhase('start')
  }

  const nights = calStart && calEnd ? calcNights(calStart, calEnd) : null

  // Trigger display
  const hasDate = startDate && endDate
  const triggerLabel = hasDate
    ? `${formatDate(startDate)} → ${formatDate(endDate)}`
    : 'Click to select travel dates'

  return (
    <>
      {/* Trigger */}
      <div>
        <label className="label-base">Travel Dates</label>
        <button
          type="button"
          onClick={openPicker}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg border border-gray-300 bg-white hover:border-amber-400 hover:ring-2 hover:ring-amber-400/20 transition-all text-left"
        >
          {hasDate ? (
            <>
              <div className="flex-1">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">🛫 Departure</div>
                <div className="text-sm font-bold text-gray-900">{formatDate(startDate)}</div>
                <div className={`text-xs ${[0, 6].includes(startDate.getDay()) ? 'text-red-500' : 'text-gray-400'}`}>{getWeekday(startDate)}</div>
              </div>
              <div className="text-center px-3 flex-shrink-0">
                <div className="text-2xl font-black text-[#0F2050]">{calcNights(startDate, endDate)}</div>
                <div className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">nights</div>
              </div>
              <div className="flex-1 text-right">
                <div className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1">
                  🛬 Return <span className="bg-green-50 text-green-700 px-1.5 py-0.5 rounded-full text-[9px]">AUTO</span>
                </div>
                <div className="text-sm font-bold text-gray-900">{formatDate(endDate)}</div>
                <div className={`text-xs ${[0, 6].includes(endDate.getDay()) ? 'text-red-500' : 'text-gray-400'}`}>{getWeekday(endDate)}</div>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 text-gray-400">
              <Calendar size={16} />
              <span className="text-sm">{triggerLabel}</span>
            </div>
          )}
          <Calendar size={16} className="text-amber-500 flex-shrink-0" />
        </button>
      </div>

      {/* Modal */}
      <Modal open={open} onClose={() => setOpen(false)} title="Select Travel Dates" maxWidth="max-w-3xl">
        {/* Summary */}
        <div className="flex items-center gap-4 bg-blue-50 rounded-xl p-4 mb-5 border border-blue-100">
          <div className="flex-1">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">🛫 Departure</div>
            <div className="text-lg font-bold text-[#0F2050]">{calStart ? formatDate(calStart) : '—'}</div>
          </div>
          {nights !== null && (
            <div className="text-center bg-[#0F2050] text-white rounded-xl px-4 py-2">
              <div className="text-2xl font-black">{nights}</div>
              <div className="text-[9px] uppercase tracking-wide opacity-70">nights</div>
            </div>
          )}
          <div className="text-amber-500 text-lg font-bold">→</div>
          <div className="flex-1 text-right">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-1">🛬 Return</div>
            <div className="text-lg font-bold text-[#0F2050]">{calEnd ? formatDate(calEnd) : '—'}</div>
          </div>
        </div>

        {/* Hint */}
        <p className="text-xs text-gray-500 text-center mb-4">
          {!calStart ? 'Click a departure date' : !calEnd ? 'Now click your return date — hover to preview' : 'Dates selected — click Apply or choose new dates'}
        </p>

        {/* Calendars */}
        <div className="flex gap-4 items-start mb-5">
          <button type="button" onClick={prev} className="p-2 rounded-full border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-colors flex-shrink-0 mt-5">
            <ChevronLeft size={16} />
          </button>
          <div className="flex-1 grid grid-cols-2 gap-4">
            {[view1, view2].map((view) => <CalMonth key={`${view.getFullYear()}-${view.getMonth()}`} view={view} today={today} calStart={calStart} calEnd={calEnd} hoverDate={phase === 'end' ? hoverDate : null} phase={phase} onClick={clickDay} onHover={setHoverDate} onLeave={() => setHoverDate(null)} />)}
          </div>
          <button type="button" onClick={next} className="p-2 rounded-full border border-gray-200 hover:bg-gray-100 hover:border-gray-300 transition-colors flex-shrink-0 mt-5">
            <ChevronRight size={16} />
          </button>
        </div>

        <div className="flex gap-2 justify-between items-center border-t border-gray-100 pt-4">
          <div className="flex gap-3 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#0F2050] inline-block"></span>Start/End</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-100 inline-block"></span>Range</span>
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={clear}>Clear</Button>
            <Button type="button" size="sm" onClick={apply} disabled={!calStart}>
              Apply Dates
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}

// ── Sub-component: single month grid ──────────────────────────────────────
function CalMonth({ view, today, calStart, calEnd, hoverDate, phase, onClick, onHover, onLeave }: {
  view: Date; today: Date; calStart: Date | null; calEnd: Date | null
  hoverDate: Date | null; phase: 'start' | 'end'
  onClick: (d: Date) => void; onHover: (d: Date) => void; onLeave: () => void
}) {
  const year = view.getFullYear(), month = view.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const blanks = (firstDay + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  return (
    <div onMouseLeave={onLeave}>
      <p className="text-center text-sm font-bold text-gray-900 mb-3">{MONTHS_LONG[month]} {year}</p>
      <div className="grid grid-cols-7 gap-0.5">
        {WEEKDAYS_SHORT.map((d) => (
          <div key={d} className="text-center text-[10px] font-bold text-gray-400 py-1">{d}</div>
        ))}
        {Array(blanks).fill(null).map((_, i) => <div key={`b${i}`} />)}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const d = i + 1
          const dt = midnight(new Date(year, month, d))
          const isPast = dt < today
          const isToday = sameDay(dt, today)
          const isStart = calStart && sameDay(dt, calStart)
          const isEnd = calEnd && sameDay(dt, calEnd)
          const inRange = calStart && calEnd && dt > calStart && dt < calEnd
          const isHoverEnd = hoverDate && sameDay(dt, hoverDate) && phase === 'end' && !calEnd && calStart && dt > calStart
          const inHover = calStart && !calEnd && hoverDate && dt > calStart && dt < hoverDate

          let cellCls = 'relative'
          let numCls = 'w-8 h-8 mx-auto flex items-center justify-center text-xs rounded-full cursor-pointer transition-all'

          if (isPast) { numCls += ' text-gray-300 cursor-default pointer-events-none' }
          else if (isStart && isEnd) { numCls += ' bg-[#0F2050] text-white font-bold' }
          else if (isStart) { cellCls += ' bg-gradient-to-r from-transparent via-transparent to-blue-100'; numCls += ' bg-[#0F2050] text-white font-bold' }
          else if (isEnd) { cellCls += ' bg-gradient-to-l from-transparent via-transparent to-blue-100'; numCls += ' bg-[#0F2050] text-white font-bold' }
          else if (inRange) { cellCls += ' bg-blue-100'; numCls += ' text-blue-800 font-semibold hover:bg-blue-200' }
          else if (isHoverEnd) { numCls += ' bg-amber-400 text-white' }
          else if (inHover) { cellCls += ' bg-amber-50'; numCls += ' text-amber-800 hover:bg-amber-100' }
          else { numCls += ' text-gray-700 hover:bg-gray-100' }

          return (
            <div key={d} className={cellCls}>
              <div
                className={numCls}
                onClick={isPast ? undefined : () => onClick(dt)}
                onMouseEnter={isPast ? undefined : () => onHover(dt)}
              >
                {d}
              </div>
              {isToday && <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-400" />}
            </div>
          )
        })}
      </div>
    </div>
  )
}
