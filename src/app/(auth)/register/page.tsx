'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authService } from '@/services/auth.service'
import { useAuthContext } from '@/context/AuthContext'
import { useToastContext } from '@/context/ToastContext'
import { getErrorMessage } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const schema = z.object({
  name: z.string().min(2, 'Min 2 characters'),
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters'),
  company: z.string().optional(),
})
type FormData = z.infer<typeof schema>

export default function RegisterPage() {
  const router = useRouter()
  const { login } = useAuthContext()
  const { showToast } = useToastContext()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  async function onSubmit(data: FormData) {
    try {
      const res = await authService.register(data)
      login(res.accessToken, res.refreshToken, res.user)
      showToast('Account created! Welcome aboard 🎉')
      router.push('/dashboard')
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    }
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex border border-gray-200 rounded-lg p-1 mb-2">
          <Link href="/login" className="flex-1 py-2 text-sm font-medium text-center text-gray-400 hover:text-gray-600 transition-colors">Sign In</Link>
          <button className="flex-1 py-2 text-sm font-semibold bg-white rounded-md shadow-sm text-[#0F2050]">Register</button>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <Input label="Full Name" required error={errors.name?.message} {...register('name')} />
          <Input label="Company" error={errors.company?.message} {...register('company')} />
        </div>
        <Input label="Email" type="email" required error={errors.email?.message} {...register('email')} />
        <Input label="Password" type="password" required error={errors.password?.message} {...register('password')} />
        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
          Create Account →
        </Button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-4">
        Already have an account?{' '}
        <Link href="/login" className="text-[#0F2050] font-semibold hover:underline">Sign In</Link>
      </p>
    </>
  )
}
