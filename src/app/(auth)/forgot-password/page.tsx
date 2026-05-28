'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Mail, KeyRound } from 'lucide-react'
import { authService } from '@/services/auth.service'
import { useToastContext } from '@/context/ToastContext'
import { getErrorMessage } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const emailSchema = z.object({ email: z.string().email('Invalid email') })
const resetSchema = z.object({
  otp: z.string().min(4, 'Enter OTP'),
  newPassword: z.string().min(8, 'Min 8 characters'),
  confirmPassword: z.string().min(8, 'Min 8 characters'),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match', path: ['confirmPassword'],
})

type EmailForm = z.infer<typeof emailSchema>
type ResetForm = z.infer<typeof resetSchema>

export default function ForgotPasswordPage() {
  const router = useRouter()
  const { showToast } = useToastContext()
  const [step, setStep] = useState<'email' | 'reset'>('email')
  const [email, setEmail] = useState('')

  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) })
  const resetForm = useForm<ResetForm>({ resolver: zodResolver(resetSchema) })

  async function onSendOtp(data: EmailForm) {
    try {
      await authService.forgotPassword({ email: data.email })
      setEmail(data.email)
      setStep('reset')
      showToast('OTP sent to your email 📧')
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    }
  }

  async function onReset(data: ResetForm) {
    try {
      await authService.resetPassword({ email, otp: data.otp, newPassword: data.newPassword, confirmPassword: data.confirmPassword })
      showToast('Password reset successfully ✓')
      router.push('/login')
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    }
  }

  if (step === 'email') return (
    <>
      <div className="flex items-center gap-2 mb-6">
        <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center">
          <Mail size={16} className="text-blue-600" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">Forgot Password</h2>
          <p className="text-xs text-gray-500">We'll send an OTP to your email</p>
        </div>
      </div>
      <form onSubmit={emailForm.handleSubmit(onSendOtp)} className="space-y-4">
        <Input label="Email" type="email" required error={emailForm.formState.errors.email?.message} {...emailForm.register('email')} />
        <Button type="submit" className="w-full" loading={emailForm.formState.isSubmitting}>Send OTP →</Button>
      </form>
      <div className="text-center mt-4">
        <Link href="/login" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700">
          <ArrowLeft size={13} /> Back to Sign In
        </Link>
      </div>
    </>
  )

  return (
    <>
      <div className="flex items-center gap-2 mb-6">
        <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center">
          <KeyRound size={16} className="text-green-600" />
        </div>
        <div>
          <h2 className="text-base font-bold text-gray-900">Reset Password</h2>
          <p className="text-xs text-gray-500">OTP sent to <strong>{email}</strong></p>
        </div>
      </div>
      <form onSubmit={resetForm.handleSubmit(onReset)} className="space-y-4">
        <Input label="OTP Code" required error={resetForm.formState.errors.otp?.message} {...resetForm.register('otp')} />
        <Input label="New Password" type="password" required error={resetForm.formState.errors.newPassword?.message} {...resetForm.register('newPassword')} />
        <Input label="Confirm Password" type="password" required error={resetForm.formState.errors.confirmPassword?.message} {...resetForm.register('confirmPassword')} />
        <Button type="submit" className="w-full" loading={resetForm.formState.isSubmitting}>Reset Password</Button>
      </form>
      <button onClick={() => setStep('email')} className="mt-3 text-xs text-gray-400 hover:text-gray-600 w-full text-center">
        ← Change email
      </button>
    </>
  )
}