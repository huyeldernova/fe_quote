'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ArrowLeft, Mail, ShieldCheck, KeyRound, Check } from 'lucide-react'
import { authService } from '@/services/auth.service'
import { useToastContext } from '@/context/ToastContext'
import { getErrorMessage } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

// ── Schemas ────────────────────────────────────────────────────────────────
const emailSchema = z.object({
  email: z.string().email('Invalid email'),
})
const resetSchema = z.object({
  otp: z.string().length(6, 'OTP must be 6 digits'),
  newPassword: z.string().min(8, 'Min 8 characters'),
  confirmPassword: z.string().min(8, 'Min 8 characters'),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

type EmailForm = z.infer<typeof emailSchema>
type ResetForm = z.infer<typeof resetSchema>

// ── Step indicator ─────────────────────────────────────────────────────────
const STEPS = [
  { num: 1, label: 'Email' },
  { num: 2, label: 'OTP' },
  { num: 3, label: 'New Password' },
]

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((s, i) => (
        <div key={s.num} className="flex items-center gap-2">
          <div className="flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
              ${current > s.num ? 'bg-green-500 text-white' :
                current === s.num ? 'bg-[#0F2050] text-white' :
                'bg-gray-100 text-gray-400'}`}>
              {current > s.num ? <Check size={14} /> : s.num}
            </div>
            <span className={`text-[10px] font-medium ${current === s.num ? 'text-[#0F2050]' : 'text-gray-400'}`}>
              {s.label}
            </span>
          </div>
          {i < STEPS.length - 1 && (
            <div className={`w-10 h-0.5 mb-4 transition-all ${current > s.num ? 'bg-green-400' : 'bg-gray-200'}`} />
          )}
        </div>
      ))}
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function ForgotPasswordPage() {
  const router = useRouter()
  const { showToast } = useToastContext()
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [done, setDone] = useState(false)

  const emailForm = useForm<EmailForm>({ resolver: zodResolver(emailSchema) })
  const resetForm = useForm<ResetForm>({ resolver: zodResolver(resetSchema) })

  // Step 1 — Send OTP
  async function onSendOtp(data: EmailForm) {
    try {
      await authService.forgotPassword({ email: data.email })
      setEmail(data.email)
      setStep(2)
      showToast('OTP sent to your email 📧')
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    }
  }

  // Step 2 → 3 — just move to next step
  function onConfirmOtp() {
    const otp = resetForm.getValues('otp')
    if (!otp || otp.length < 6) {
      resetForm.setError('otp', { message: 'Enter 6-digit OTP' })
      return
    }
    setStep(3)
  }

  // Step 3 — Reset password
  async function onReset(data: ResetForm) {
    try {
      await authService.resetPassword({
        email,
        otp: data.otp,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      })
      setDone(true)
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    }
  }

  // ── Success screen ────────────────────────────────────────────────────
  if (done) return (
    <div className="text-center">
      <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
        <Check size={28} className="text-green-500" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Password Reset!</h2>
      <p className="text-sm text-gray-500 mb-6">Your password has been updated successfully.</p>
      <Button className="w-full" onClick={() => router.push('/login')}>
        Back to Sign In →
      </Button>
    </div>
  )

  return (
    <>
      <StepIndicator current={step} />

      {/* ── Step 1: Email ── */}
      {step === 1 && (
        <>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0">
              <Mail size={18} className="text-blue-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Forgot Password?</h2>
              <p className="text-xs text-gray-500">Enter your email to receive an OTP</p>
            </div>
          </div>
          <form onSubmit={emailForm.handleSubmit(onSendOtp)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              error={emailForm.formState.errors.email?.message}
              {...emailForm.register('email')}
            />
            <Button type="submit" className="w-full" size="lg" loading={emailForm.formState.isSubmitting}>
              Send OTP →
            </Button>
          </form>
          <div className="text-center mt-4">
            <Link href="/login" className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600">
              <ArrowLeft size={13} /> Back to Sign In
            </Link>
          </div>
        </>
      )}

      {/* ── Step 2: OTP ── */}
      {step === 2 && (
        <>
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
              <ShieldCheck size={18} className="text-amber-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">Enter OTP</h2>
              <p className="text-xs text-gray-500">Sent to <strong>{email}</strong></p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4 text-xs text-amber-700 text-center">
            Check your inbox — OTP expires in <strong>10 minutes</strong>
          </div>

          <div className="space-y-4">
            <Input
              label="OTP Code"
              required
              autoComplete="one-time-code"
              inputMode="numeric"
              maxLength={6}
              placeholder="6-digit code e.g. 384606"
              error={resetForm.formState.errors.otp?.message}
              {...resetForm.register('otp')}
            />
            <Button className="w-full" size="lg" onClick={onConfirmOtp}>
              Verify OTP →
            </Button>
          </div>

          <div className="flex items-center justify-between mt-4">
            <button onClick={() => setStep(1)} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
              <ArrowLeft size={12} /> Change email
            </button>
            <button
              onClick={() => emailForm.handleSubmit(onSendOtp)({ email })}
              className="text-xs text-[#0F2050] hover:underline font-medium"
            >
              Resend OTP
            </button>
          </div>
        </>
      )}

      {/* ── Step 3: New Password ── */}
      {step === 3 && (
        <>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0">
              <KeyRound size={18} className="text-green-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-gray-900">New Password</h2>
              <p className="text-xs text-gray-500">OTP verified ✓ Set your new password</p>
            </div>
          </div>
          <form onSubmit={resetForm.handleSubmit(onReset)} className="space-y-4">
            <Input
              label="New Password"
              type="password"
              required
              autoComplete="new-password"
              placeholder="Min 8 characters"
              error={resetForm.formState.errors.newPassword?.message}
              {...resetForm.register('newPassword')}
            />
            <Input
              label="Confirm New Password"
              type="password"
              required
              autoComplete="new-password"
              placeholder="Repeat new password"
              error={resetForm.formState.errors.confirmPassword?.message}
              {...resetForm.register('confirmPassword')}
            />
            <Button type="submit" className="w-full" size="lg" loading={resetForm.formState.isSubmitting}>
              Reset Password ✓
            </Button>
          </form>
          <button onClick={() => setStep(2)} className="mt-3 text-xs text-gray-400 hover:text-gray-600 w-full text-center flex items-center justify-center gap-1">
            <ArrowLeft size={12} /> Back to OTP
          </button>
        </>
      )}
    </>
  )
}