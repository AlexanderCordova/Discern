'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
import AnalyticsCharts from '@/components/AnalyticsCharts'
import AdvancedStats from '@/components/AdvancedStats'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [analytics, setAnalytics] = useState<any>(null)
  const [stats, setStats] = useState<any>(null)
  const [advancedStats, setAdvancedStats] = useState<any>(null)
  const [days, setDays] = useState(30)

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/api/auth/signin?callbackUrl=/dashboard')
    } else if (status === 'authenticated') {
      loadUserAnalytics()
    }
  }, [status, days])

  const loadUserAnalytics = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_URL}/api/user/analytics`, {
        params: { days },
        headers: {
          Authorization: `Bearer ${session?.user?.id}`,
        },
      })

      setAnalytics(response.data.analytics)
      setStats(response.data.stats)
      setAdvancedStats(response.data.advancedStats)
    } catch (error) {
      console.error('Failed to load analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/user/export`, {
        params: { days },
        headers: {
          Authorization: `Bearer ${session?.user?.id}`,
        },
        responseType: 'blob',
      })

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `discern-my-analytics-${new Date().toISOString().split('T')[0]}.csv`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Failed to export data:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {session.user?.image && (
              <img
                src={session.user.image}
                alt={session.user.name || 'User'}
                className="w-16 h-16 rounded-full border-2 border-blue-600"
              />
            )}
            <div>
              <h1 className="text-4xl font-bold text-gray-900">
                Welcome back, {session.user?.name?.split(' ')[0] || 'User'}!
              </h1>
              <p className="text-gray-600">
                Your personal credibility analysis dashboard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleExportCSV}
              className="px-6 py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition"
            >
              Export My Data (CSV)
            </button>
          </div>
        </div>

        {/* Time Range Selector */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Range
          </label>
          <select
            value={days}
            onChange={(e) => setDays(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
            <option value={365}>Last year</option>
          </select>
        </div>

        {stats && stats.totalScans === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              No analyses yet
            </h2>
            <p className="text-gray-600 mb-8">
              Start analyzing content to see your personal statistics here.
            </p>
            <a
              href="/analyze"
              className="inline-block px-8 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
            >
              Start Analyzing
            </a>
          </div>
        ) : (
          <>
            {/* Quick Stats */}
            {stats && (
              <div className="grid md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">
                    Total Analyses
                  </h3>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalScans.toLocaleString()}
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">
                    Average Score
                  </h3>
                  <p className="text-3xl font-bold text-blue-600">
                    {stats.averageScore.toFixed(1)}
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">
                    Low Credibility %
                  </h3>
                  <p className="text-3xl font-bold text-red-600">
                    {stats.lowCredibilityPercentage}%
                  </p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
                  <h3 className="text-sm font-medium text-gray-600 mb-2">
                    Most Analyzed
                  </h3>
                  <p className="text-lg font-bold text-gray-900 truncate">
                    {stats.topSource || 'N/A'}
                  </p>
                </div>
              </div>
            )}

            {/* Charts */}
            {analytics && <AnalyticsCharts analytics={analytics} />}

            {/* Advanced Stats */}
            <div className="mt-8">
              <AdvancedStats stats={advancedStats} />
            </div>
          </>
        )}
      </div>
    </div>
  )
}
