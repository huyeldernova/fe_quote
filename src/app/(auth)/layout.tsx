'use client'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#0F2050] via-[#1E3A6E] to-[#0A1535] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-xl bg-[#C9A84C] flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div className="text-left">
              <p className="font-bold text-white text-base tracking-wide leading-none">TOURIST LEADER</p>
              <p className="text-[10px] text-white/50 tracking-widest mt-0.5">QUOTESEND</p>
            </div>
          </div>
          <p className="text-white/50 text-sm mt-3">Professional travel quotation management</p>
        </div>
        <div className="bg-white rounded-2xl shadow-2xl p-8">{children}</div>
      </div>
    </main>
  )
}
