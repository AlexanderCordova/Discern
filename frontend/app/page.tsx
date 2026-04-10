'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useState } from 'react'

export default function Home() {
  const [demoUrl, setDemoUrl] = useState('')
  const [isHoveringPrimary, setIsHoveringPrimary] = useState(false)

  return (
    <div className="min-h-screen bg-[#fbfbfd]">
      {/* Hero Section */}
      <section className="relative pt-32 pb-40 px-6 overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-[#f5f5f7] to-white opacity-60" />

        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="text-center"
          >
            {/* Main headline */}
            <h1 className="text-7xl md:text-8xl lg:text-9xl font-semibold tracking-tight text-[#1d1d1f] mb-6 leading-[1.05]">
              Truth at a glance.
            </h1>

            {/* Subheadline */}
            <p className="text-2xl md:text-3xl font-normal text-[#6e6e73] mb-4 max-w-4xl mx-auto leading-snug tracking-tight">
              Instant credibility analysis.
            </p>

            <p className="text-lg md:text-xl font-normal text-[#86868b] mb-16 max-w-2xl mx-auto">
              DISCERN brings transparency to online content with advanced analysis you can trust.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
              <Link
                href="/analyze"
                onMouseEnter={() => setIsHoveringPrimary(true)}
                onMouseLeave={() => setIsHoveringPrimary(false)}
                className="group relative px-8 py-4 bg-[#0071e3] text-white text-lg font-medium rounded-full overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
              >
                <span className="relative z-10">Analyze now</span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#0077ed] to-[#0055cc] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>

              <Link
                href="/about"
                className="px-8 py-4 text-[#0071e3] text-lg font-medium rounded-full border-2 border-[#0071e3] hover:bg-[#0071e3] hover:text-white transition-all duration-300 hover:scale-[1.02]"
              >
                Learn more
              </Link>
            </div>

            {/* Quick try input - glassmorphism */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="max-w-3xl mx-auto"
            >
              <div className="relative backdrop-blur-xl bg-white/60 rounded-[28px] p-3 shadow-2xl border border-white/20">
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="text"
                    placeholder="Paste any article URL"
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    className="flex-1 px-6 py-4 bg-white/80 backdrop-blur-sm rounded-[20px] text-[#1d1d1f] text-lg placeholder-[#86868b] border border-black/5 focus:border-[#0071e3]/30 focus:ring-4 focus:ring-[#0071e3]/10 outline-none transition-all duration-200"
                  />
                  <Link
                    href={demoUrl ? `/analyze?url=${encodeURIComponent(demoUrl)}` : '/analyze'}
                    className="px-8 py-4 bg-[#1d1d1f] text-white text-lg font-medium rounded-[20px] hover:bg-[#2d2d2f] transition-all duration-200 hover:scale-[1.02] whitespace-nowrap"
                  >
                    Analyze
                  </Link>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Large Visual Cards */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-24"
          >
            <h2 className="text-5xl md:text-6xl font-semibold text-[#1d1d1f] mb-6 tracking-tight">
              Credibility. Clarity. Confidence.
            </h2>
            <p className="text-xl text-[#86868b] max-w-3xl mx-auto">
              Four pillars of analysis used to reveal the truth.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="group relative bg-[#f5f5f7] rounded-[28px] p-12 overflow-hidden hover:bg-[#e8e8ed] transition-all duration-500"
              >
                {/* Subtle gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div className="relative z-10">
                  {/* Visual indicator */}
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0071e3] to-[#0055cc] mb-8 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-500">
                    <div className="w-8 h-8 border-2 border-white/60 rounded-lg" />
                  </div>

                  <h3 className="text-3xl font-semibold text-[#1d1d1f] mb-4 tracking-tight">
                    {feature.title}
                  </h3>
                  <p className="text-lg text-[#6e6e73] leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Analysis Showcase Section */}
      <section className="py-32 px-6 bg-[#fbfbfd] relative overflow-hidden">
        {/* Decorative blur elements */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-[#0071e3]/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#6e6e73]/10 rounded-full blur-[120px]" />

        <div className="relative max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-semibold text-[#1d1d1f] mb-6 tracking-tight">
              Transparent by design.
            </h2>
            <p className="text-xl text-[#86868b] max-w-3xl mx-auto">
              Every analysis breaks down how credibility is evaluated across four dimensions.
            </p>
          </motion.div>

          {/* Scoring factors visual */}
          <div className="backdrop-blur-xl bg-white/80 rounded-[40px] p-12 shadow-2xl border border-white/20">
            <div className="grid md:grid-cols-2 gap-10">
              {scoringFactors.map((factor, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">
                      {factor.name}
                    </h4>
                    <span className="text-3xl font-bold text-[#0071e3] tabular-nums">
                      {factor.demoValue}
                    </span>
                  </div>
                  <p className="text-base text-[#6e6e73] mb-6 leading-relaxed">
                    {factor.description}
                  </p>

                  {/* Progress bar */}
                  <div className="relative h-2 bg-[#e8e8ed] rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${factor.demoValue}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.2, delay: 0.3 + index * 0.1, ease: [0.16, 1, 0.3, 1] }}
                      className="h-full bg-gradient-to-r from-[#0071e3] to-[#0055cc] rounded-full"
                    />
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-6xl md:text-7xl font-semibold text-[#1d1d1f] mb-8 tracking-tight leading-tight">
              Start analyzing today.
            </h2>
            <p className="text-xl text-[#6e6e73] mb-12">
              Create a free account to get 3 free analyses per day and track your search history.
            </p>

            <Link
              href="/analyze"
              className="inline-block px-10 py-5 bg-[#0071e3] text-white text-xl font-medium rounded-full hover:bg-[#0077ed] transition-all duration-300 hover:scale-[1.02] shadow-xl"
            >
              Get started
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

const features = [
  {
    title: 'Source Verification',
    description: 'Advanced algorithms evaluate publisher reputation, domain authority, and institutional credibility to ensure you know where information originates.',
  },
  {
    title: 'Bias Detection',
    description: 'Sophisticated language analysis identifies emotional manipulation, loaded terminology, and factual presentation to reveal underlying perspectives.',
  },
  {
    title: 'Evidence Analysis',
    description: 'Comprehensive citation checking verifies claims against supporting sources, assessing data quality and expert references.',
  },
  {
    title: 'Logic Verification',
    description: 'Deep reasoning analysis detects contradictions, fallacies, and inconsistencies to ensure arguments are sound and coherent.',
  },
]

const scoringFactors = [
  {
    name: 'Neutrality',
    description: 'Measures objective language versus emotional manipulation',
    demoValue: 85,
  },
  {
    name: 'Source Quality',
    description: 'Evaluates publisher authority and institutional trust',
    demoValue: 92,
  },
  {
    name: 'Evidence',
    description: 'Assesses citation quality and data verification',
    demoValue: 78,
  },
  {
    name: 'Reasoning',
    description: 'Checks logical consistency and argument structure',
    demoValue: 88,
  },
]
