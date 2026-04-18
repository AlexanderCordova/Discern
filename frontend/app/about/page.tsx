export default function About() {
  return (
    <div className="min-h-screen py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            About DISCERN
          </h1>
          <p className="text-xl text-gray-600">
            Built for the Presidential AI Challenge
          </p>
        </div>

        {/* Mission */}
        <section className="mb-16 bg-white rounded-xl p-8 shadow-sm border border-gray-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            DISCERN allows individuals to navigate the modern information landscape with
            accuracy. In an era of widespread misinformation, particularly with the development 
            of AI, we provide transparent credibility analysis to inform users abou the information 
            they receive.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Our platform emphasizes <strong>transparency</strong> and <strong>explainability</strong>,
            ensuring users understand not just the credibility score, but the reasoning behind it.
          </p>
        </section>

        {/* How It Works */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">How It Works</h2>

          <div className="space-y-6">
            {steps.map((step, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {step.title}
                    </h3>
                    <p className="text-gray-700">{step.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Scoring Framework */}
        <section className="mb-16 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">Scoring Framework</h2>
          <p className="text-gray-700 mb-6">
            Every piece of content is scored from <strong>0-100</strong> across four key factors:
          </p>

          <div className="grid md:grid-cols-2 gap-6">
            {factors.map((factor, index) => (
              <div key={index} className="bg-white rounded-lg p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-3xl"></span>
                  <h4 className="font-bold text-gray-900">{factor.name}</h4>
                </div>
                <p className="text-sm text-gray-600">{factor.description}</p>
                <p className="text-xs text-gray-500 mt-2 italic">{factor.weight}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-white rounded-lg border border-blue-300">
            <p className="text-sm text-gray-700">
              <strong>Final Score:</strong> The sum of all four factors (0-100).
              Scores are categorized as:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-gray-700">
              <li> <strong>High Credibility (80-100):</strong> Reliable, well-sourced content</li>
              <li> <strong>Medium Credibility (50-79):</strong> Mixed signals, verify important claims</li>
              <li> <strong>Low Credibility (0-49):</strong> Significant issues detected, high skepticism warranted</li>
            </ul>
          </div>
        </section>

        {/* Ethics & Transparency */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ethics & Transparency
          </h2>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-6">
            <h3 className="font-bold text-gray-900 mb-2"> Important Disclaimer</h3>
            <p className="text-gray-700">
              DISCERN provides <strong>AI-assisted credibility analysis</strong>, not absolute truth.
              Our scores are based on algorithmic assessment and should be used as one tool among
              many in evaluating information. Always:
            </p>
            <ul className="mt-3 space-y-1 text-gray-700 list-disc list-inside">
              <li>Verify important information from multiple sources</li>
              <li>Consider context and nuance beyond algorithmic scoring</li>
              <li>Use critical thinking alongside AI assistance</li>
              <li>Consult experts for specialized or critical decisions</li>
            </ul>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-2"> Transparency</h4>
              <p className="text-sm text-gray-600">
                Every score includes detailed explanations of how it was calculated
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-2"> AI Limitations</h4>
              <p className="text-sm text-gray-600">
                We openly acknowledge uncertainty and potential biases in AI analysis
              </p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <h4 className="font-bold text-gray-900 mb-2"> Privacy</h4>
              <p className="text-sm text-gray-600">
                No personal data collection, analysis only for credibility assessment
              </p>
            </div>
          </div>
        </section>

        {/* Technology */}
        <section className="bg-gray-800 text-white rounded-xl p-8">
          <h2 className="text-3xl font-bold mb-6">Technology Stack</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">AI & Backend</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Anthropic Claude (Sonnet 4.6) for AI analysis</li>
                <li>• Node.js + Express API</li>
                <li>• PostgreSQL database</li>
                <li>• PDF parsing & web scraping</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Frontend</h4>
              <ul className="text-sm text-gray-300 space-y-1">
                <li>• Next.js 14 (React framework)</li>
                <li>• CSS for styling</li>
                <li>• Framer Motion animations</li>
                <li>• Recharts for analytics</li>
              </ul>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

const steps = [
  {
    title: 'Content Extraction',
    description: 'We fetch and extract text from URLs, parse PDFs, or process pasted text while preserving structure and context.',
  },
  {
    title: 'AI Analysis',
    description: 'Claude AI processes the content through structured prompts designed specifically for credibility assessment.',
  },
  {
    title: 'Multi-Factor Scoring',
    description: 'Content is evaluated across neutrality, source reputation, evidence quality, and logical consistency.',
  },
  {
    title: 'Citation Generation',
    description: 'Key claims are extracted and cross-referenced with supporting or contradicting sources.',
  },
  {
    title: 'Explainability',
    description: 'A detailed breakdown shows exactly how each factor contributed to the final score.',
  },
  {
    title: 'Results Delivery',
    description: 'You receive a comprehensive credibility report with actionable insights and warnings.',
  },
]

const factors = [
  {
    name: 'Neutrality',
    description: 'Evaluates fact-based language vs. emotional manipulation and loaded terminology',
    weight: 'Worth 0-25 points (higher score = more neutral)',
  },
  {
    name: 'Source Reputation',
    description: 'Evaluates domain authority, institutional credibility, and author expertise',
    weight: 'Worth 0-25 points',
  },
  {
    name: 'Evidence Quality',
    description: 'Assesses citations, data sources, peer review, and supporting documentation',
    weight: 'Worth 0-25 points',
  },
  {
    name: 'Logical Consistency',
    description: 'Checks for contradictions, fallacies, and reasoning soundness',
    weight: 'Worth 0-25 points',
  },
]
