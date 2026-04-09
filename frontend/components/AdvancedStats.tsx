'use client'

export default function AdvancedStats({ stats }: { stats: any }) {
  if (!stats) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
        <p className="text-center text-gray-600">
          Not enough data for statistical analysis. Analyze at least 2 articles to see advanced statistics.
        </p>
      </div>
    )
  }

  const { descriptiveStats, confidenceInterval95, correlationMatrix, factorCorrelations, rSquared, hypothesisTests, sampleSize } = stats

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Statistical Analysis</h2>
        <p className="text-purple-100">Data-driven insights from {sampleSize} analyses</p>
      </div>

      {/* Descriptive Statistics */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Descriptive Statistics</h3>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Mean (μ)</p>
            <p className="text-2xl font-bold text-blue-600">{descriptiveStats.mean}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Median</p>
            <p className="text-2xl font-bold text-blue-600">{descriptiveStats.median}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Mode</p>
            <p className="text-2xl font-bold text-blue-600">{descriptiveStats.mode}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Std Dev (σ)</p>
            <p className="text-2xl font-bold text-purple-600">{descriptiveStats.stdDev}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Variance (σ²)</p>
            <p className="text-2xl font-bold text-purple-600">{descriptiveStats.variance}</p>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Range</p>
            <p className="text-2xl font-bold text-purple-600">{descriptiveStats.range}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Q1 (25th %ile)</p>
            <p className="text-2xl font-bold text-green-600">{descriptiveStats.q1}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Q3 (75th %ile)</p>
            <p className="text-2xl font-bold text-green-600">{descriptiveStats.q3}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">IQR</p>
            <p className="text-2xl font-bold text-green-600">{descriptiveStats.iqr}</p>
          </div>
        </div>
        <div className="mt-4 bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 mb-1">Skewness</p>
          <p className="text-lg font-bold text-gray-900">
            {descriptiveStats.skewness}
            <span className="ml-2 text-sm font-normal text-gray-600">
              ({descriptiveStats.skewness > 0.5 ? 'Right-skewed' : descriptiveStats.skewness < -0.5 ? 'Left-skewed' : 'Approximately symmetric'})
            </span>
          </p>
        </div>
      </div>

      {/* Confidence Interval */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">📈 95% Confidence Interval</h3>
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
          <p className="text-sm text-gray-600 mb-3">
            We are 95% confident that the true mean credibility score is between:
          </p>
          <div className="flex items-center justify-center gap-4">
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-2xl font-bold text-blue-600">{confidenceInterval95.lower}</p>
            </div>
            <p className="text-gray-400 text-2xl">—</p>
            <div className="bg-white rounded-lg p-4 shadow">
              <p className="text-2xl font-bold text-blue-600">{confidenceInterval95.upper}</p>
            </div>
          </div>
          <p className="text-center text-sm text-gray-500 mt-3">
            Margin of Error: ±{confidenceInterval95.marginOfError}
          </p>
        </div>
      </div>

      {/* Factor Correlations */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">🔗 Factor Correlations with Overall Score</h3>
        <p className="text-sm text-gray-600 mb-4">
          Shows how strongly each scoring factor correlates with the final credibility score (-1 to +1)
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(factorCorrelations).map(([factor, value]: [string, any]) => {
            const correlation = parseFloat(value)
            const strength = Math.abs(correlation) > 0.7 ? 'Strong' : Math.abs(correlation) > 0.4 ? 'Moderate' : 'Weak'
            const color = Math.abs(correlation) > 0.7 ? 'text-green-600' : Math.abs(correlation) > 0.4 ? 'text-yellow-600' : 'text-red-600'

            return (
              <div key={factor} className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1 capitalize">{factor.replace('_', ' ')}</p>
                <p className={`text-2xl font-bold ${color}`}>{correlation.toFixed(3)}</p>
                <p className="text-xs text-gray-500 mt-1">{strength} correlation</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* R-Squared */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">📐 Multiple Regression Analysis</h3>
        <div className="bg-indigo-50 rounded-lg p-6">
          <p className="text-sm text-gray-600 mb-3">
            R² = Coefficient of Determination
          </p>
          <p className="text-4xl font-bold text-indigo-600 mb-3">{(rSquared * 100).toFixed(1)}%</p>
          <p className="text-sm text-gray-700">
            {(rSquared * 100).toFixed(1)}% of the variance in credibility scores can be explained by the four scoring factors
            (bias, source reputation, evidence quality, and logical consistency).
          </p>
        </div>
      </div>

      {/* Correlation Matrix */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">🔀 Correlation Matrix (Between Factors)</h3>
        <p className="text-sm text-gray-600 mb-4">
          Shows how scoring factors relate to each other
        </p>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(correlationMatrix).map(([pair, value]: [string, any]) => {
            const correlation = parseFloat(value)
            const [factor1, factor2] = pair.split('_')

            return (
              <div key={pair} className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1 capitalize">
                  {factor1.replace('_', ' ')} ↔ {factor2.replace('_', ' ')}
                </p>
                <p className="text-xl font-bold text-gray-900">{correlation.toFixed(3)}</p>
              </div>
            )
          })}
        </div>
      </div>

      {/* Hypothesis Test */}
      {hypothesisTests?.urlVsText && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">🧪 Hypothesis Test: URL vs Text Content</h3>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">URL Content Mean Score</p>
                <p className="text-2xl font-bold text-blue-600">{hypothesisTests.urlVsText.urlMean}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Text Content Mean Score</p>
                <p className="text-2xl font-bold text-green-600">{hypothesisTests.urlVsText.textMean}</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm text-gray-600 mb-2">t-Statistic: <span className="font-bold text-gray-900">{hypothesisTests.urlVsText.tStatistic}</span></p>
              <p className="text-sm text-gray-600 mb-2">Difference: <span className="font-bold text-gray-900">{hypothesisTests.urlVsText.difference}</span></p>
              <p className={`text-sm font-semibold ${hypothesisTests.urlVsText.significant ? 'text-red-600' : 'text-green-600'}`}>
                {hypothesisTests.urlVsText.significant
                  ? '✗ Statistically significant difference (reject null hypothesis, p < 0.05)'
                  : '✓ No significant difference (fail to reject null hypothesis, p > 0.05)'}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Reference Guide */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl shadow-lg p-6 border border-gray-300">
        <h3 className="text-lg font-bold text-gray-900 mb-3">📊 Interpreting the Data</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <p className="font-semibold mb-1">Correlation Values:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>0.7-1.0: Strong positive relationship</li>
              <li>0.4-0.7: Moderate relationship</li>
              <li>0.0-0.4: Weak relationship</li>
              <li>Negative: Inverse relationship</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-1">R² Value:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>&gt;0.75: Strong predictive power</li>
              <li>0.50-0.75: Moderate predictive power</li>
              <li>&lt;0.50: Limited predictive power</li>
            </ul>
          </div>
          <div>
            <p className="font-semibold mb-1">Distribution Shape:</p>
            <ul className="list-disc list-inside space-y-1 text-xs">
              <li>&gt;0.5: Right-skewed distribution</li>
              <li>-0.5 to 0.5: Normal distribution</li>
              <li>&lt;-0.5: Left-skewed distribution</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
