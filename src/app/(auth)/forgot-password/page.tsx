'use client'

import Link from 'next/link'
import { ArrowLeft, Clock } from 'lucide-react'

export default function ForgotPasswordPage() {
  return (
    <div className="text-center">
      <div className="w-14 h-14 rounded-full bg-amber-50 flex items-center justify-center mx-auto mb-4">
        <Clock size={24} className="text-amber-500" />
      </div>
      <h2 className="text-xl font-bold text-gray-900 mb-2">Coming Soon</h2>
      <p className="text-sm text-gray-500 mb-6">
        Password reset via OTP will be available once the backend adds this endpoint.
      </p>
      <Link href="/login" className="inline-flex items-center gap-2 text-sm text-[#0F2050] font-semibold hover:underline">
        <ArrowLeft size={14} /> Back to Sign In
      </Link>
    </div>
  )
}
