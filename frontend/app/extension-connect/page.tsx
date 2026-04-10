'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function ExtensionConnectPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin?callbackUrl=/extension-connect')
    }
  }, [status, router])

  useEffect(() => {
    // Send userId to extension when signed in
    if (session?.user?.id) {
      // Post message to window so content script can pick it up
      window.postMessage({
        type: 'DISCERN_USER_SIGNED_IN',
        userId: session.user.id
      }, '*')

      // Auto-close tab after 3 seconds
      setTimeout(() => {
        window.close()
      }, 3000)
    }
  }, [session])

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
    <div className="min-h-screen flex items-center justify-center bg-[#fbfbfd] px-6">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>

        <h1 className="text-4xl font-semibold text-[#1d1d1f] mb-4 tracking-tight">
          Extension Connected!
        </h1>

        <p className="text-lg text-[#6e6e73] mb-8">
          Your extension is now connected. This tab will close automatically in a moment.
        </p>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <p className="text-sm text-[#6e6e73] mb-3">Signed in as:</p>
          <p className="text-lg font-semibold text-[#1d1d1f] mb-2">{session.user?.name}</p>
          <p className="text-sm text-[#6e6e73]">{session.user?.email}</p>
        </div>

        <button
          onClick={() => window.close()}
          className="w-full px-8 py-4 bg-[#0071e3] text-white text-lg font-medium rounded-full hover:bg-[#0077ed] transition-all duration-300 hover:scale-[1.02] shadow-xl"
        >
          Close This Tab
        </button>

        <p className="text-sm text-[#6e6e73] mt-6">
          You can now use the DISCERN extension to analyze any webpage!
        </p>
      </div>
    </div>
  )
}
