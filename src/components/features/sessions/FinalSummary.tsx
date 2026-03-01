'use client'

import { useState } from 'react'
import { Check, Copy, Share2 } from 'lucide-react'
import type { SessionSummary } from '@/types'

interface Props {
  summary: SessionSummary
  sessionTitle: string
  businessMode?: boolean
}

export function FinalSummary({ summary, sessionTitle, businessMode = false }: Props) {
  const [copied, setCopied] = useState(false)

  async function handleCopy() {
    const text = [
      `Middle Me — "${sessionTitle}"`,
      '',
      'COMMON GROUND',
      summary.middle_ground,
      '',
      'BRIDGE STATEMENTS',
      ...summary.bridge_statements.map((s, i) => `${i + 1}. ${s}`),
      '',
      'A HOPEFUL PATH FORWARD',
      summary.advice,
    ].join('\n')

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback: do nothing
    }
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-positive-green/15 border-2 border-positive-green/30 mb-4">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="w-7 h-7 text-positive-green"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              stroke="currentColor"
              d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-semibold text-slate-800 tracking-tight mb-2">
          Common Ground Found
        </h2>
        <p className="text-slate-500 text-sm max-w-sm mx-auto">
          {businessMode
            ? 'Workplace Harmony AI identified shared professional values and a path forward for your team.'
            : "Here's what still connects you — and a path back to each other."}
        </p>
      </div>

      {/* Three panels */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-3">

        {/* Panel 1 — Middle Ground */}
        <div className="md:col-span-3 bg-gradient-to-br from-positive-blue/10 to-positive-blue/5 border border-positive-blue/15 rounded-2xl px-7 py-6">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-positive-blue" />
            <p className="text-xs font-semibold text-positive-blue uppercase tracking-widest">
              The Middle Ground
            </p>
          </div>
          <p className="text-lg text-slate-700 leading-relaxed font-normal">
            {summary.middle_ground}
          </p>
        </div>

        {/* Panel 2 — Bridge Statements */}
        <div className="md:col-span-2 bg-slate-50 border border-positive-blue/10 rounded-2xl px-7 py-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-positive-blue/50" />
            <p className="text-xs font-semibold text-positive-blue/70 uppercase tracking-widest">
              Bridge Statements
            </p>
          </div>
          <p className="text-xs text-muted-foreground mb-4">
            Things you could actually say to each other:
          </p>
          <ul className="space-y-3">
            {summary.bridge_statements.map((statement, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="shrink-0 mt-0.5 w-5 h-5 rounded-full bg-positive-blue/10 text-positive-blue text-xs font-bold flex items-center justify-center">
                  {i + 1}
                </span>
                <p className="text-sm text-slate-600 leading-relaxed italic">
                  &ldquo;{statement}&rdquo;
                </p>
              </li>
            ))}
          </ul>
        </div>

        {/* Panel 3 — Advice */}
        <div className="bg-positive-green/10 border border-positive-green/15 rounded-2xl px-7 py-6 flex flex-col">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-2 h-2 rounded-full bg-positive-green" />
            <p className="text-xs font-semibold text-positive-green uppercase tracking-widest">
              A Hopeful Path Forward
            </p>
          </div>
          <p className="text-sm text-slate-600 leading-relaxed flex-1">
            {summary.advice}
          </p>
        </div>

      </div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-3 mt-8">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          {copied ? (
            <>
              <Check className="w-4 h-4 text-emerald-500" />
              Copied
            </>
          ) : (
            <>
              <Copy className="w-4 h-4" />
              Copy summary
            </>
          )}
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>

      {/* Certificate footer */}
      <p className="text-center text-xs text-muted-foreground mt-6">
        {businessMode ? 'Workplace Harmony AI · Policy-Aware Mediation' : 'Middle Me · AI-guided emotional mediation'}
        {' · '}{new Date().toLocaleDateString()}
      </p>
    </div>
  )
}
