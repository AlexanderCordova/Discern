'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/analyze')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbfbfd]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0071e3] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-[#6e6e73]">Loading...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen bg-[#fbfbfd] py-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-5xl md:text-6xl font-semibold text-[#1d1d1f] mb-4 tracking-tight">
            Account Settings
          </h1>
          <p className="text-xl text-[#6e6e73]">
            Manage your account information and preferences
          </p>
        </div>

        {/* Account Information Card */}
        <div className="bg-white rounded-[28px] shadow-lg border border-black/5 p-8 mb-6">
          <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-6">Profile Information</h2>

          <div className="flex items-center gap-6 mb-8">
            {session.user?.image ? (
              <img
                src={session.user.image}
                alt={session.user.name || 'User'}
                className="w-24 h-24 rounded-full border-4 border-[#0071e3]"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#0071e3] flex items-center justify-center text-white font-bold text-4xl">
                {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || 'U'}
              </div>
            )}

            <div>
              <h3 className="text-xl font-semibold text-[#1d1d1f] mb-1">
                {session.user?.name || 'User'}
              </h3>
              <p className="text-[#6e6e73]">{session.user?.email}</p>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-[#6e6e73]">Name</label>
              <p className="text-lg text-[#1d1d1f] mt-1">{session.user?.name || 'Not provided'}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-[#6e6e73]">Email</label>
              <p className="text-lg text-[#1d1d1f] mt-1">{session.user?.email}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-[#6e6e73]">Account ID</label>
              <p className="text-sm text-[#86868b] font-mono mt-1">{session.user?.id}</p>
            </div>
          </div>
        </div>

        {/* Usage & Limits Card */}
        <div className="bg-white rounded-[28px] shadow-lg border border-black/5 p-8 mb-6">
          <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-6">Usage & Limits</h2>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-[#f5f5f7] rounded-2xl">
              <div>
                <p className="font-medium text-[#1d1d1f]">Daily Analysis Limit</p>
                <p className="text-sm text-[#6e6e73]">Resets every 24 hours</p>
              </div>
              <span className="text-2xl font-bold text-[#0071e3]">3 / day</span>
            </div>

            <div className="flex items-center justify-between p-4 bg-[#f5f5f7] rounded-2xl">
              <div>
                <p className="font-medium text-[#1d1d1f]">Search History</p>
                <p className="text-sm text-[#6e6e73]">All your past analyses</p>
              </div>
              <a
                href="/history"
                className="px-4 py-2 bg-[#0071e3] text-white text-sm font-medium rounded-full hover:bg-[#0077ed] transition-all"
              >
                View History
              </a>
            </div>
          </div>
        </div>

        {/* Quick Links Card */}
        <div className="bg-white rounded-[28px] shadow-lg border border-black/5 p-8 mb-6">
          <h2 className="text-2xl font-semibold text-[#1d1d1f] mb-6">Quick Links</h2>

          <div className="space-y-3">
            <a
              href="/dashboard"
              className="flex items-center justify-between p-4 hover:bg-[#f5f5f7] rounded-2xl transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0071e3]/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#0071e3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <span className="font-medium text-[#1d1d1f]">My Dashboard</span>
              </div>
              <svg className="w-5 h-5 text-[#86868b] group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>

            <a
              href="/history"
              className="flex items-center justify-between p-4 hover:bg-[#f5f5f7] rounded-2xl transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0071e3]/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#0071e3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="font-medium text-[#1d1d1f]">Search History</span>
              </div>
              <svg className="w-5 h-5 text-[#86868b] group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>

            <a
              href="/analyze"
              className="flex items-center justify-between p-4 hover:bg-[#f5f5f7] rounded-2xl transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#0071e3]/10 flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#0071e3]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span className="font-medium text-[#1d1d1f]">Analyze Content</span>
              </div>
              <svg className="w-5 h-5 text-[#86868b] group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          </div>
        </div>

        {/* Danger Zone Card */}
        <div className="bg-white rounded-[28px] shadow-lg border border-red-200 p-8">
          <h2 className="text-2xl font-semibold text-red-600 mb-6">Account Actions</h2>

          <div className="space-y-4">
            <button
              onClick={() => signOut({ callbackUrl: '/' })}
              className="w-full px-6 py-4 bg-red-600 text-white font-medium rounded-2xl hover:bg-red-700 transition-all duration-200"
            >
              Sign Out
            </button>

            <p className="text-sm text-[#6e6e73] text-center">
              Your analysis history and data will be preserved
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
