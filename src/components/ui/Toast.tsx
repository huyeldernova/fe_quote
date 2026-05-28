'use client'

import { CheckCircle, XCircle, Info, X } from 'lucide-react'
import { useToastContext } from '@/context/ToastContext'
import { cn } from '@/lib/utils'

export default function ToastContainer() {
  const { toasts, removeToast } = useToastContext()
  if (!toasts.length) return null
  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={cn(
            'flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium border',
            t.type === 'success' && 'bg-green-50 border-green-200 text-green-800',
            t.type === 'error'   && 'bg-red-50 border-red-200 text-red-800',
            t.type === 'info'    && 'bg-blue-50 border-blue-200 text-blue-800',
          )}
        >
          {t.type === 'success' && <CheckCircle size={16} className="flex-shrink-0 text-green-600" />}
          {t.type === 'error'   && <XCircle size={16} className="flex-shrink-0 text-red-600" />}
          {t.type === 'info'    && <Info size={16} className="flex-shrink-0 text-blue-600" />}
          <span className="flex-1">{t.message}</span>
          <button onClick={() => removeToast(t.id)} className="opacity-50 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  )
}
