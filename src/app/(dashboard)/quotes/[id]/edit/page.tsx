'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { quoteService } from '@/services/quote.service'
import { QuoteResponse } from '@/types'
import QuoteForm from '@/components/quote/QuoteForm'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { useToastContext } from '@/context/ToastContext'
import { getErrorMessage } from '@/lib/utils'

export default function EditQuotePage() {
  const { id } = useParams<{ id: string }>()
  const router = useRouter()
  const { showToast } = useToastContext()
  const [quote, setQuote] = useState<QuoteResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    quoteService.getById(Number(id))
      .then(setQuote)
      .catch((err) => { showToast(getErrorMessage(err), 'error'); router.push('/quotes') })
      .finally(() => setLoading(false))
  }, [id, showToast, router])

  if (loading) return <LoadingSpinner />
  if (!quote) return null

  return <QuoteForm mode="edit" initialData={quote} />
}
