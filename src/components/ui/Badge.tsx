import { QuoteStatus } from '@/types'
import { STATUS_CONFIG } from '@/constants'
import { cn } from '@/lib/utils'

export function Badge({ status }: { status: QuoteStatus }) {
  const { label, bg, text } = STATUS_CONFIG[status]
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold', bg, text)}>
      {label}
    </span>
  )
}
