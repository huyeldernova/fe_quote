'use client'

import { useState } from 'react'
import { Check } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { COST_OPTIONS } from '@/constants'
import { QuoteCostInput } from '@/types'

interface Props {
  open: boolean
  onClose: () => void
  onAdd: (cost: QuoteCostInput) => void
  nextSortOrder: number
}

export default function CostModal({ open, onClose, onAdd, nextSortOrder }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')

  function handleAdd() {
    if (!selected) { setError('Please select a category'); return }
    const amt = parseFloat(amount)
    if (!amt || amt <= 0) { setError('Enter a valid amount'); return }
    onAdd({ label: selected, amount: amt, sortOrder: nextSortOrder })
    setSelected(null); setAmount(''); setError('')
    onClose()
  }

  function handleClose() {
    setSelected(null); setAmount(''); setError('')
    onClose()
  }

  return (
    <Modal open={open} onClose={handleClose} title="Add Cost Item" maxWidth="max-w-2xl">
      <p className="text-sm text-gray-500 mb-4">Select a category, then enter the amount</p>

      <div className="grid grid-cols-4 gap-2 mb-5 max-h-64 overflow-y-auto pr-1">
        {COST_OPTIONS.map((opt) => {
          const isSelected = selected === opt.label
          return (
            <button
              key={opt.label}
              type="button"
              onClick={() => { setSelected(opt.label); setError('') }}
              className={`relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 text-center transition-all
                ${isSelected
                  ? 'border-[#0F2050] bg-blue-50 shadow-sm'
                  : 'border-gray-200 hover:border-amber-300 hover:bg-amber-50'
                }`}
            >
              {isSelected && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#0F2050] flex items-center justify-center">
                  <Check size={10} className="text-white" />
                </div>
              )}
              <span className="text-xl">{opt.emoji}</span>
              <span className="text-xs font-medium text-gray-700 leading-tight">{opt.label}</span>
            </button>
          )
        })}
      </div>

      {/* Amount */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
        <label className="label-base text-blue-700">Amount (₹)</label>
        <input
          type="number"
          min="0"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); setError('') }}
          onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
          placeholder="e.g. 25000"
          className="input-base text-xl font-bold border-transparent bg-transparent focus:ring-0 focus:border-transparent pl-0 text-[#0F2050] placeholder-blue-200"
        />
      </div>

      {error && <p className="text-xs text-red-500 mb-3">⚠ {error}</p>}

      <div className="flex gap-2 justify-end">
        <Button type="button" variant="ghost" onClick={handleClose}>Cancel</Button>
        <Button type="button" onClick={handleAdd}>
          <Check size={14} /> Add to Quote
        </Button>
      </div>
    </Modal>
  )
}
