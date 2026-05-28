'use client'

import { useRef } from 'react'
import { X, Upload } from 'lucide-react'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import { QuoteDayInput } from '@/types'
import { useImageUpload } from '@/hooks/useImageUpload'

interface Props {
  index: number
  day: QuoteDayInput
  onChange: (updated: QuoteDayInput) => void
  onRemove: () => void
  canRemove: boolean
}

export default function DayRow({ index, day, onChange, onRemove, canRemove }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const { uploadFile, uploading } = useImageUpload()

  function update<K extends keyof QuoteDayInput>(key: K, value: QuoteDayInput[K]) {
    onChange({ ...day, [key]: value })
  }

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const url = await uploadFile(file)
    if (url) update('imageUrl', url)
    e.target.value = ''
  }

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-[#1A5B6A] flex items-center justify-center text-white text-xs font-bold">
            {index + 1}
          </div>
          <span className="text-sm font-bold text-gray-900">Day {index + 1}</span>
        </div>
        {canRemove && (
          <button type="button" onClick={onRemove} className="p-1 rounded hover:bg-red-100 text-gray-400 hover:text-red-500 transition-colors">
            <X size={14} />
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        <Input label="Location" value={day.location} onChange={(e) => update('location', e.target.value)} />
        <Input label="Date Label" value={day.dateLabel} onChange={(e) => update('dateLabel', e.target.value)} />
      </div>

      <div className="mb-3">
        <Textarea
          label="Hotel / Accommodation"
          hint="Enter to new line"
          rows={3}
          value={day.hotel}
          onChange={(e) => update('hotel', e.target.value)}
        />
      </div>

      {/* Photo upload */}
      <div className="mb-3">
        <label className="label-base">Photo</label>
        {day.imageUrl ? (
          <div className="relative rounded-lg overflow-hidden h-28 border border-gray-200">
            <img src={day.imageUrl} alt="day" className="w-full h-full object-cover" onError={(e) => { update('imageUrl', ''); (e.target as HTMLImageElement).style.display = 'none' }} />
            <button
              type="button"
              onClick={() => update('imageUrl', '')}
              className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white rounded-full p-1 transition-colors"
            >
              <X size={12} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full h-24 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center gap-2 hover:border-amber-400 hover:bg-amber-50 transition-all text-gray-400 hover:text-amber-600"
          >
            <Upload size={20} />
            <span className="text-xs font-medium">{uploading ? 'Uploading...' : 'Click to upload photo'}</span>
            <span className="text-[10px]">JPG, PNG, WebP · max 5MB</span>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleFile} />
      </div>

      <Textarea
        label="Sightseeing & Activities"
        hint="Enter per line = 1 bullet"
        rows={4}
        value={day.sights}
        onChange={(e) => update('sights', e.target.value)}
      />
    </div>
  )
}
