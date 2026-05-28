'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Send } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import { quoteService } from '@/services/quote.service'
import { useToastContext } from '@/context/ToastContext'
import { getErrorMessage } from '@/lib/utils'

const schema = z.object({
  toEmail: z.string().email('Invalid email'),
  ccEmail: z.string().email('Invalid email').optional().or(z.literal('')),
  subject: z.string().min(1, 'Required'),
  message: z.string().min(1, 'Required'),
})
type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  quoteId: number
  defaultToEmail?: string
  tourName?: string
  quoteNumber?: string
  clientName?: string
  onSent: () => void
}

export default function SendEmailModal({ open, onClose, quoteId, defaultToEmail, tourName, quoteNumber, clientName, onSent }: Props) {
  const { showToast } = useToastContext()
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    values: {
      toEmail: defaultToEmail ?? '',
      ccEmail: '',
      subject: `Your ${tourName ?? 'Tour'} Quote — ${quoteNumber ?? ''}`,
      message: `Dear ${clientName ?? 'Sir/Madam'},\n\nGreetings from Tourist Leader! Please find attached your personalized travel quotation.\n\nBest regards,\nTourist Leader Team`,
    },
  })

  async function onSubmit(data: FormData) {
    try {
      await quoteService.sendEmail(quoteId, {
        toEmail: data.toEmail,
        ccEmail: data.ccEmail || undefined,
        subject: data.subject,
        message: data.message,
      })
      reset()
      onSent()
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Send Quote by Email" maxWidth="max-w-xl">
      <div className="mb-4 px-3 py-2 bg-blue-50 rounded-lg text-xs text-blue-700 font-medium">
        📎 A PDF of this quote will be automatically attached
      </div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="To (Recipient)" type="email" required error={errors.toEmail?.message} {...register('toEmail')} />
          <Input label="CC (optional)" type="email" error={errors.ccEmail?.message} {...register('ccEmail')} />
        </div>
        <Input label="Subject" required error={errors.subject?.message} {...register('subject')} />
        <Textarea label="Message" rows={6} error={errors.message?.message} {...register('message')} />
        <div className="flex gap-3 justify-end pt-2">
          <Button type="button" variant="ghost" onClick={() => { reset(); onClose() }}>Cancel</Button>
          <Button type="submit" loading={isSubmitting}>
            <Send size={14} /> Send Email
          </Button>
        </div>
      </form>
    </Modal>
  )
}
