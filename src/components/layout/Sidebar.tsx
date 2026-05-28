'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, FileText, Mail, User, LogOut, MapPin } from 'lucide-react'
import { useAuthContext } from '@/context/AuthContext'
import { authService } from '@/services/auth.service'
import { cn } from '@/lib/utils'

const NAV = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Quotes', href: '/quotes', icon: FileText },
  { label: 'Email Logs', href: '/emails', icon: Mail },
  { label: 'Profile', href: '/profile', icon: User },
]

export default function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, logout } = useAuthContext()

  async function handleLogout() {
    try {
      const token = localStorage.getItem('accessToken')
      if (token) await authService.logout(token)
    } catch {
      // ignore
    }
    logout()
    router.push('/login')
  }

  return (
    <aside className="fixed left-0 top-0 h-screen w-[220px] flex flex-col bg-[#0F2050] text-white z-40">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#C9A84C] flex items-center justify-center flex-shrink-0">
            <MapPin size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm tracking-wide leading-none">TOURIST LEADER</p>
            <p className="text-[10px] text-white/50 mt-0.5 tracking-widest">QUOTESEND</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="px-3 mb-2 text-[10px] font-semibold text-white/30 uppercase tracking-widest">Menu</p>
        {NAV.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all',
                active
                  ? 'bg-[#C9A84C] text-white shadow-sm'
                  : 'text-white/70 hover:bg-white/10 hover:text-white',
              )}
            >
              <Icon size={17} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User */}
      <div className="border-t border-white/10 p-3">
        <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 group">
          <div className="w-8 h-8 rounded-full bg-[#C9A84C]/30 flex items-center justify-center flex-shrink-0 text-sm font-bold text-[#C9A84C]">
            {user?.name?.[0]?.toUpperCase() ?? 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.name ?? 'Agent'}</p>
            <p className="text-[10px] text-white/40 truncate">{user?.email ?? ''}</p>
          </div>
          <button
            onClick={handleLogout}
            title="Logout"
            className="opacity-40 group-hover:opacity-100 transition-opacity text-white hover:text-red-400"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  )
}
