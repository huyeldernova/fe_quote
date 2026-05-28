'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Eye, EyeOff } from 'lucide-react'
import { authService } from '@/services/auth.service'
import { useAuthContext } from '@/context/AuthContext'
import { useToastContext } from '@/context/ToastContext'
import { getErrorMessage } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(6, 'Min 6 characters'),
})
type FormData = z.infer<typeof schema>

export default function LoginPage() {
  const router = useRouter()
  const { login } = useAuthContext()
  const { showToast } = useToastContext()
  const [showPw, setShowPw] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { email: 'agent@touristleader.com', password: '' },
  })

  async function onSubmit(data: FormData) {
    try {
      const res = await authService.login(data)
      login(res.accessToken, res.refreshToken, res.user)
      showToast(`Welcome back, ${res.user.name}! 👋`)
      router.push('/dashboard')
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    }
  }

  return (
    <>
      <div className="mb-6">
        <div className="flex border border-gray-200 rounded-lg p-1 mb-6">
          <button className="flex-1 py-2 text-sm font-semibold bg-white rounded-md shadow-sm text-[#0F2050]">Sign In</button>
          <Link href="/register" className="flex-1 py-2 text-sm font-medium text-center text-gray-400 hover:text-gray-600 transition-colors">Register</Link>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input label="Email" type="email" required error={errors.email?.message} {...register('email')} />
        <div>
          <Input
            label="Password" required error={errors.password?.message}
            type={showPw ? 'text' : 'password'} {...register('password')}
          />
          <button type="button" onClick={() => setShowPw(!showPw)}
            className="absolute mt-[-30px] right-3 text-gray-400 hover:text-gray-600">
            {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        <div className="flex justify-end">
          <Link href="/forgot-password" className="text-xs text-[#0F2050] hover:underline">Forgot password?</Link>
        </div>
        <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
          Sign In →
        </Button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-4">
        No account?{' '}
        <Link href="/register" className="text-[#0F2050] font-semibold hover:underline">Register</Link>
      </p>
    </>
  )
}
