import axios from 'axios'
import { AnalysisRequest, AnalysisResult, AnalyticsMetrics, DemoArticle } from '@discern/shared/types'
import { getSession } from 'next-auth/react'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add interceptor to include user ID and access code in requests
api.interceptors.request.use(async (config) => {
  const session = await getSession()
  if (session?.user?.id) {
    config.headers['x-user-id'] = session.user.id
  }

  // Add access code if present (for unlimited access)
  const accessCode = localStorage.getItem('discern_access_code')
  if (accessCode) {
    config.headers['x-api-key'] = accessCode
  }

  return config
})

/**
 * Analyze content for credibility
 */
export async function analyzeContent(request: AnalysisRequest): Promise<AnalysisResult> {
  try {
    const response = await api.post('/api/analyze', request)

    if (!response.data.success) {
      throw new Error(response.data.error || 'Analysis failed')
    }

    return response.data.data
  } catch (error: any) {
    // Extract error message from axios error response
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error)
    }
    throw new Error(error.message || 'Analysis failed')
  }
}

/**
 * Get demo content options
 */
export async function getDemoContent(): Promise<DemoArticle[]> {
  try {
    const response = await api.get('/api/analyze/demo')

    if (!response.data.success) {
      throw new Error('Failed to load demo content')
    }

    return response.data.data
  } catch (error: any) {
    if (error.response?.data?.error) {
      throw new Error(error.response.data.error)
    }
    throw new Error(error.message || 'Failed to load demo content')
  }
}

/**
 * Get analytics
 */
export async function getAnalytics(token: string, days: number = 30): Promise<AnalyticsMetrics> {
  const response = await api.get('/api/admin/analytics', {
    params: { days },
  })

  if (!response.data.success) {
    throw new Error('Failed to load analytics')
  }

  return response.data.data
}

/**
 * Get quick stats
 */
export async function getAdminStats(token: string): Promise<any> {
  const response = await api.get('/api/admin/stats')

  if (!response.data.success) {
    throw new Error('Failed to load stats')
  }

  return response.data.data
}

/**
 * Get advanced statistical analysis
 */
export async function getAdvancedStats(token: string, days: number = 30): Promise<any> {
  const response = await api.get('/api/admin/advanced-stats', {
    params: { days },
  })

  if (!response.data.success) {
    throw new Error('Failed to load advanced statistics')
  }

  return response.data.data
}
