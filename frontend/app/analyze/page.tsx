'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSession, signIn } from 'next-auth/react'
import AnalyzerInput from '@/components/AnalyzerInput'
import CredibilityResult from '@/components/CredibilityResult'
import { analyzeContent } from '@/lib/api'
import { AnalysisResult } from '@discern/shared/types'

function AnalyzeContent() {
  const { data: session, status } = useSession()
  const searchParams = useSearchParams()
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [processingStep, setProcessingStep] = useState<string>('')

  useEffect(() => {
    const urlParam = searchParams.get('url')

    if (urlParam) {
      handleAnalyze('url', urlParam)
    }
  }, [searchParams])

  const handleAnalyze = async (
    type: 'url' | 'text' | 'pdf',
    content: string,
    analysisMode?: 'brief' | 'detailed'
  ) => {
    setLoading(true)
    setError(null)
    setResult(null)
    setProcessingStep('Initiating analysis...')

    try {
      // Simulate processing steps for better UX
      const steps = [
        'Extracting content...',
        'Analyzing bias and language...',
        'Evaluating source reputation...',
        'Verifying evidence and citations...',
        'Assessing logical consistency...',
        'Generating citations...',
        'Calculating credibility score...',
      ]

      let stepIndex = 0
      const stepInterval = setInterval(() => {
        if (stepIndex < steps.length) {
          setProcessingStep(steps[stepIndex])
          stepIndex++
        }
      }, 2000)

      const data = await analyzeContent({
        type,
        content,
        demoMode: false,
        explainabilityMode: false,
        analysisMode: analysisMode || 'brief',
      })

      clearInterval(stepInterval)
      setResult(data)
      setProcessingStep('')
    } catch (err: any) {
      setError(err.message || 'Analysis failed. Please try again.')
      setProcessingStep('')
    } finally {
      setLoading(false)
    }
  }

  // Show loading state while checking authentication
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

  // Require authentication
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbfbfd] px-6">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 bg-gradient-to-br from-[#0071e3] to-[#0055cc] rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-4xl font-semibold text-[#1d1d1f] mb-4 tracking-tight">
            Sign in required
          </h1>
          <p className="text-lg text-[#6e6e73] mb-8">
            Create a free account to analyze content and track your search history.
          </p>
          <button
            onClick={() => signIn()}
            className="px-8 py-4 bg-[#0071e3] text-white text-lg font-medium rounded-full hover:bg-[#0077ed] transition-all duration-300 hover:scale-[1.02] shadow-xl"
          >
            Sign in to continue
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#fbfbfd] py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        {!result && (
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-semibold text-[#1d1d1f] mb-6 tracking-tight">
              Analyze content
            </h1>
            <p className="text-xl text-[#6e6e73] max-w-3xl mx-auto leading-relaxed">
              Paste a URL, enter text, or upload a PDF for comprehensive credibility analysis
            </p>
          </div>
        )}

        {/* Input Section */}
        {!result && (
          <AnalyzerInput
            onAnalyze={handleAnalyze}
            loading={loading}
            processingStep={processingStep}
          />
        )}

        {/* Error Display */}
        {error && (
          <div className="max-w-3xl mx-auto mb-8 p-6 bg-red-50 border border-red-200 rounded-[28px]">
            <p className="text-red-800 font-medium">Error: {error}</p>
          </div>
        )}

        {/* Result Display */}
        {result && (
          <div className="animate-fade-in">
            <CredibilityResult
              result={result}
              onAnalyzeNew={() => {
                setResult(null)
                setError(null)
              }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default function AnalyzePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[#fbfbfd]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#0071e3] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-[#6e6e73]">Loading...</p>
        </div>
      </div>
    }>
      <AnalyzeContent />
    </Suspense>
  )
}
