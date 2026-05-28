'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Clock } from 'lucide-react'
import { authService } from '@/services/auth.service'
import { useAuthContext } from '@/context/AuthContext'
import { useToastContext } from '@/context/ToastContext'
import { getErrorMessage } from '@/lib/utils'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const profileSchema = z.object({
  name: z.string().min(2, 'Min 2 characters'),
  company: z.string().optional(),
})
type ProfileForm = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const { user, setUser } = useAuthContext()
  const { showToast } = useToastContext()

  const { register, handleSubmit, formState: { errors, isSubmitting, isDirty } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', company: user?.company ?? '' },
  })

  async function onSave(data: ProfileForm) {
    try {
      const updated = await authService.updateMe(data)
      setUser(updated)
      showToast('Profile updated ✓')
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    }
  }

  return (
    <div className="p-6 max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account settings</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-[#0F2050] flex items-center justify-center text-white text-2xl font-bold">
          {user?.name?.[0]?.toUpperCase() ?? 'A'}
        </div>
        <div>
          <p className="font-bold text-gray-900">{user?.name}</p>
          <p className="text-sm text-gray-500">{user?.email}</p>
          <p className="text-xs text-gray-400 mt-0.5">Role: {user?.role}</p>
        </div>
      </div>

      {/* Profile form */}
      <div className="card p-6">
        <h3 className="font-semibold text-sm text-gray-900 mb-4">Edit Profile</h3>
        <form onSubmit={handleSubmit(onSave)} className="space-y-4">
          <Input label="Full Name" required error={errors.name?.message} {...register('name')} />
          <Input label="Company" error={errors.company?.message} {...register('company')} />
          <Input label="Email" value={user?.email ?? ''} disabled className="bg-gray-50 cursor-not-allowed" />
          <Button type="submit" loading={isSubmitting} disabled={!isDirty}>Save Changes</Button>
        </form>
      </div>

      {/* Change Password — coming soon */}
      <div className="card p-6">
        <h3 className="font-semibold text-sm text-gray-900 mb-3">Change Password</h3>
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-lg p-4">
          <Clock size={16} className="text-amber-500 flex-shrink-0" />
          <p className="text-sm text-amber-700">
            Password change will be available once the backend adds the <code className="text-xs bg-amber-100 px-1 py-0.5 rounded">PUT /auth/change-password</code> endpoint.
          </p>
        </div>
      </div>
    </div>
  )
}
