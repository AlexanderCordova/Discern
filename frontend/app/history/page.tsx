'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function HistoryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [history, setHistory] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin?callbackUrl=/history')
    } else if (status === 'authenticated') {
      loadHistory()
    }
  }, [status])

  const loadHistory = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/api/user/history`, {
        headers: {
          Authorization: `Bearer ${session?.user?.id}`,
        },
      })

      setHistory(response.data.data || [])
    } catch (error) {
      console.error('Failed to load history:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredHistory = history.filter((item) => {
    // Filter by type
    if (filterType !== 'all' && item.contentType !== filterType) {
      return false
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      const matchesDomain = item.domain?.toLowerCase().includes(query)
      const matchesSummary = item.summary?.toLowerCase().includes(query)
      const matchesContent = item.originalContent?.toLowerCase().includes(query)
      return matchesDomain || matchesSummary || matchesContent
    }

    return true
  })

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your search history...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Search History
          </h1>
          <p className="text-gray-600">
            View and manage your past credibility analyses
          </p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 mb-6">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by domain, content, or summary..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Filter by type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Type
              </label>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value="all">All Types</option>
                <option value="url">URLs</option>
                <option value="text">Text</option>
                <option value="pdf">PDFs</option>
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredHistory.length} of {history.length} analyses
          </div>
        </div>

        {/* History List */}
        {filteredHistory.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              {searchQuery || filterType !== 'all' ? 'No results found' : 'No search history yet'}
            </h2>
            <p className="text-gray-600 mb-8">
              {searchQuery || filterType !== 'all'
                ? 'Try adjusting your filters or search query.'
                : 'Start analyzing content to build your search history.'}
            </p>
            {!searchQuery && filterType === 'all' && (
              <a
                href="/analyze"
                className="inline-block px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
              >
                Start Analyzing
              </a>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    {/* Content Type Badge */}
                    <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 mb-2">
                      {item.contentType.toUpperCase()}
                    </span>

                    {/* Domain or Title */}
                    {item.domain && (
                      <h3 className="text-xl font-bold text-gray-900 mb-2">
                        {item.domain}
                      </h3>
                    )}

                    {/* Summary */}
                    <p className="text-gray-600 line-clamp-2 mb-3">
                      {item.summary}
                    </p>

                    {/* Date */}
                    <p className="text-sm text-gray-500">
                      Analyzed {new Date(item.createdAt).toLocaleDateString()} at{' '}
                      {new Date(item.createdAt).toLocaleTimeString()}
                    </p>
                  </div>

                  {/* Score */}
                  <div className="ml-6 text-center">
                    <div
                      className={`text-4xl font-bold ${
                        item.score >= 80
                          ? 'text-green-600'
                          : item.score >= 50
                          ? 'text-yellow-600'
                          : 'text-red-600'
                      }`}
                    >
                      {item.score}
                    </div>
                    <p className="text-sm text-gray-600 mt-1">Score</p>
                  </div>
                </div>

                {/* Factors */}
                <div className="grid grid-cols-4 gap-3 mb-4">
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Neutrality</p>
                    <p className="text-lg font-bold text-gray-900">
                      {item.factors?.bias || 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Source</p>
                    <p className="text-lg font-bold text-gray-900">
                      {item.factors?.source_reputation || 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Evidence</p>
                    <p className="text-lg font-bold text-gray-900">
                      {item.factors?.evidence || 0}
                    </p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs text-gray-600 mb-1">Logic</p>
                    <p className="text-lg font-bold text-gray-900">
                      {item.factors?.logic || 0}
                    </p>
                  </div>
                </div>

                {/* Preview Content */}
                {item.originalContent && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium text-blue-600 hover:text-blue-700">
                      View analyzed content
                    </summary>
                    <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-700 whitespace-pre-wrap line-clamp-6">
                        {item.originalContent.substring(0, 500)}
                        {item.originalContent.length > 500 && '...'}
                      </p>
                    </div>
                  </details>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
