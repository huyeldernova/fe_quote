'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
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

const passwordSchema = z.object({
  currentPassword: z.string().min(6, 'Required'),
  newPassword: z.string().min(8, 'Min 8 characters'),
  confirmPassword: z.string().min(8, 'Required'),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: 'Passwords do not match', path: ['confirmPassword'],
})

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>

export default function ProfilePage() {
  const { user, setUser } = useAuthContext()
  const { showToast } = useToastContext()

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? '', company: user?.company ?? '' },
  })

  const passwordForm = useForm<PasswordForm>({ resolver: zodResolver(passwordSchema) })

  async function onSaveProfile(data: ProfileForm) {
    try {
      const updated = await authService.updateMe(data)
      setUser(updated)
      showToast('Profile updated ✓')
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    }
  }

  async function onChangePassword(data: PasswordForm) {
    try {
      await authService.changePassword(data)
      showToast('Password changed ✓')
      passwordForm.reset()
    } catch (err) {
      showToast(getErrorMessage(err), 'error')
    }
  }

  return (
    <div className="p-6 max-w-xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Profile</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account</p>
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

      {/* Edit Profile */}
      <div className="card p-6">
        <h3 className="font-semibold text-sm text-gray-900 mb-4">Edit Profile</h3>
        <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
          <Input label="Full Name" required error={profileForm.formState.errors.name?.message} {...profileForm.register('name')} />
          <Input label="Company" error={profileForm.formState.errors.company?.message} {...profileForm.register('company')} />
          <Input label="Email" value={user?.email ?? ''} disabled className="bg-gray-50 cursor-not-allowed" />
          <Button type="submit" loading={profileForm.formState.isSubmitting} disabled={!profileForm.formState.isDirty}>
            Save Changes
          </Button>
        </form>
      </div>

      {/* Change Password */}
      <div className="card p-6">
        <h3 className="font-semibold text-sm text-gray-900 mb-4">Change Password</h3>
        <form onSubmit={passwordForm.handleSubmit(onChangePassword)} className="space-y-4">
          <Input label="Current Password" type="password" required error={passwordForm.formState.errors.currentPassword?.message} {...passwordForm.register('currentPassword')} />
          <Input label="New Password" type="password" required error={passwordForm.formState.errors.newPassword?.message} {...passwordForm.register('newPassword')} />
          <Input label="Confirm New Password" type="password" required error={passwordForm.formState.errors.confirmPassword?.message} {...passwordForm.register('confirmPassword')} />
          <Button type="submit" loading={passwordForm.formState.isSubmitting}>
            Change Password
          </Button>
        </form>
      </div>
    </div>
  )
}