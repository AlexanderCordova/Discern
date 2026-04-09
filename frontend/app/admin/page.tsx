'use client'

import { useState, useEffect } from 'react'
import { getAnalytics, getAdminStats, getAdvancedStats } from '@/lib/api'
import { AnalyticsMetrics } from '@discern/shared/types'
import AnalyticsCharts from '@/components/AnalyticsCharts'
import AdvancedStats from '@/components/AdvancedStats'

export default function AdminPage() {
  const [error, setError] = useState<string | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsMetrics | null>(null)
  const [stats, setStats] = useState<any>(null)
  const [advancedStats, setAdvancedStats] = useState<any>(null)
  const [days, setDays] = useState(30)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async (selectedDays: number = 30) => {
    try {
      const [analyticsData, statsData, advancedStatsData] = await Promise.all([
        getAnalytics('', selectedDays),
        getAdminStats(''),
        getAdvancedStats('', selectedDays),
      ])

      setAnalytics(analyticsData)
      setStats(statsData)
      setAdvancedStats(advancedStatsData)
    } catch (err: any) {
      setError(err.message || 'Failed to load data')
    }
  }

  return (
    <div className="min-h-screen py-12 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Platform Statistics
          </h1>
          <p className="text-gray-600">
            Analytics and insights for DISCERN platform
          </p>
        </div>

        {/* Time Range Selector */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time Range
          </label>
          <select
            value={days}
            onChange={(e) => {
              const newDays = parseInt(e.target.value)
              setDays(newDays)
              loadData(newDays)
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value={7}>Last 7 days</option>
            <option value={30}>Last 30 days</option>
            <option value={90}>Last 90 days</option>
          </select>
        </div>

        {/* Search Sources */}
        {analytics && analytics.topDomains && analytics.topDomains.length > 0 && (
          <div className="mb-8 bg-white rounded-xl shadow-lg p-6 border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Search Sources</h2>
            <input
              type="text"
              placeholder="Search for a source..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none mb-4"
            />

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {analytics.topDomains
                .filter((domain) =>
                  domain.domain.toLowerCase().includes(searchQuery.toLowerCase())
                )
                .map((domain, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-gray-900">{domain.domain}</p>
                      <p className="text-sm text-gray-600">
                        Analyzed {domain.count} time{domain.count !== 1 ? 's' : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Average Score</p>
                      <p
                        className={`text-2xl font-bold ${
                          domain.averageScore >= 80
                            ? 'text-green-600'
                            : domain.averageScore >= 50
                            ? 'text-yellow-600'
                            : 'text-red-600'
                        }`}
                      >
                        {domain.averageScore.toFixed(1)}
                      </p>
                    </div>
                  </div>
                ))}
              {analytics.topDomains.filter((domain) =>
                domain.domain.toLowerCase().includes(searchQuery.toLowerCase())
              ).length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  No sources found matching "{searchQuery}"
                </p>
              )}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        {stats && (
          <div className="grid md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
              <h3 className="text-sm font-medium text-gray-600 mb-2">
                Total Scans
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
                Top Flagged Source
              </h3>
              <p className="text-lg font-bold text-gray-900 truncate">
                {stats.topFlaggedSource}
              </p>
            </div>
          </div>
        )}

        {/* Charts */}
        {analytics && <AnalyticsCharts analytics={analytics} />}

        {/* Advanced Statistical Analysis */}
        <div className="mt-8">
          <AdvancedStats stats={advancedStats} />
        </div>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}
      </div>
    </div>
  )
}
