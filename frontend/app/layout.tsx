import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Providers from '@/components/Providers'
import UserNav from '@/components/UserNav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'DISCERN - Credibility Analysis',
  description: 'Instant credibility analysis for the information age.',
  keywords: ['credibility', 'fact-checking', 'transparency', 'misinformation'],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          {/* Navigation */}
          <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl bg-white/80 border-b border-black/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
              <div className="flex justify-between items-center h-24">
                {/* Logo */}
                <a href="/" className="flex items-center group flex-shrink-0">
                  <img
                    src="/logo.png"
                    alt="DISCERN Logo"
                    className="h-20 w-auto object-contain m-0 p-0"
                  />
                </a>

                {/* Navigation Links */}
                <div className="flex items-center gap-3 sm:gap-6 md:gap-8">
                  <a
                    href="/"
                    className="text-xs sm:text-sm font-medium text-[#1d1d1f] hover:text-[#0071e3] transition-colors duration-200"
                  >
                    Home
                  </a>
                  <a
                    href="/analyze"
                    className="text-xs sm:text-sm font-medium text-[#1d1d1f] hover:text-[#0071e3] transition-colors duration-200"
                  >
                    Analyze
                  </a>
                  <a
                    href="/about"
                    className="text-xs sm:text-sm font-medium text-[#1d1d1f] hover:text-[#0071e3] transition-colors duration-200"
                  >
                    About
                  </a>
                  <a
                    href="/admin"
                    className="text-xs sm:text-sm font-medium text-[#1d1d1f] hover:text-[#0071e3] transition-colors duration-200"
                  >
                    Statistics
                  </a>

                  {/* User Navigation */}
                  <UserNav />
                </div>
              </div>
            </div>
          </nav>

          {/* Add padding-top to account for fixed nav */}
          <main className="pt-24">{children}</main>

          {/* Footer */}
          <footer className="bg-[#f5f5f7] border-t border-black/5">
            <div className="max-w-7xl mx-auto px-6 py-16">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center mb-6">
                  <img
                    src="/logo.png"
                    alt="DISCERN Logo"
                    className="h-16 w-auto object-contain m-0 p-0"
                  />
                </div>

                <p className="text-sm text-[#6e6e73] max-w-md mx-auto">
                  Advanced credibility analysis powered by Anthropic Claude.
                </p>

                <div className="pt-6 border-t border-black/5 mt-8">
                  <p className="text-xs text-[#86868b]">
                    DISCERN may make mistakes. Always verify important information independently.
                  </p>
                </div>
              </div>
            </div>
          </footer>
        </Providers>
      </body>
    </html>
  )
}
