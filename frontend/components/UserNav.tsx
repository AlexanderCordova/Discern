'use client'

import { useSession, signIn, signOut } from 'next-auth/react'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

export default function UserNav() {
  const { data: session, status } = useSession()
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (status === 'loading') {
    return (
      <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
    )
  }

  if (!session) {
    return (
      <button
        onClick={() => signIn()}
        className="px-6 py-3 text-base font-semibold text-white bg-[#0071e3] rounded-full hover:bg-[#0077ed] transition-all duration-200 hover:scale-[1.02] shadow-lg"
      >
        Sign In
      </button>
    )
  }

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
      >
        {session.user?.image ? (
          <img
            src={session.user.image}
            alt={session.user.name || 'User'}
            className="w-8 h-8 rounded-full border-2 border-[#0071e3]"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#0071e3] flex items-center justify-center text-white font-medium text-sm">
            {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || 'U'}
          </div>
        )}
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-sm font-medium text-gray-900">{session.user?.name}</p>
            <p className="text-xs text-gray-500 truncate">{session.user?.email}</p>
          </div>

          <Link
            href="/dashboard"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => setShowMenu(false)}
          >
            My Dashboard
          </Link>

          <Link
            href="/history"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => setShowMenu(false)}
          >
            Search History
          </Link>

          <Link
            href="/settings"
            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
            onClick={() => setShowMenu(false)}
          >
            Account Settings
          </Link>

          <div className="border-t border-gray-100 my-1" />

          <button
            onClick={() => {
              setShowMenu(false)
              signOut()
            }}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  )
}
