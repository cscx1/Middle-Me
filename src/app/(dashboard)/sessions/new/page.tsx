'use client'

import { useState, useTransition, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { toast } from 'sonner'
import { Paperclip, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { createSession } from '@/actions/sessions'
import type { SessionCategory } from '@/types'

const CATEGORIES: { value: SessionCategory; label: string; emoji: string }[] = [
  { value: 'relationships', label: 'Relationships', emoji: '💛' },
  { value: 'family',        label: 'Family',        emoji: '🏡' },
  { value: 'work',          label: 'Work',          emoji: '💼' },
  { value: 'politics',      label: 'Politics',      emoji: '🗳️' },
  { value: 'religion',      label: 'Religion',      emoji: '🕊️' },
  { value: 'health',        label: 'Health',        emoji: '🌿' },
  { value: 'other',         label: 'Other',         emoji: '💬' },
]

export default function NewSessionPage() {
  const searchParams = useSearchParams()
  const prefillTopic = searchParams.get('topic') ?? ''
  const isBusiness = searchParams.get('mode') === 'business'

  const [category, setCategory] = useState<SessionCategory | null>(
    isBusiness ? 'work' : null
  )
  const [isPending, startTransition] = useTransition()
  const [mediaFileName, setMediaFileName] = useState<string | null>(null)
  const [parsedMediaText, setParsedMediaText] = useState<string>('')
  const [isParsing, setIsParsing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setMediaFileName(file.name)
    setIsParsing(true)

    // Demo stub: In production, call Google Cloud Vision API
    // For now, show a placeholder that the user can edit
    await new Promise((r) => setTimeout(r, 800)) // simulate API latency
    setParsedMediaText(
      `[Text extracted from "${file.name}" — edit or replace with the actual content from your image or document]`
    )
    setIsParsing(false)

    toast.info('Media parsed (demo mode). Edit the text below as needed.')
  }

  function clearMedia() {
    setMediaFileName(null)
    setParsedMediaText('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    if (category) formData.set('category', category)

    // nothing extra to do — defaultValue keeps the textarea value in sync with FormData

    startTransition(async () => {
      try {
        await createSession(formData)
        // If we reach here without redirect, something unexpected happened
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        // redirect() throws internally — this is expected on success
        if (
          msg.includes('NEXT_REDIRECT') ||
          msg.includes('navigation') ||
          (err as { digest?: string }).digest?.startsWith('NEXT_REDIRECT')
        ) {
          return
        }
        console.error('createSession client error:', msg)
        toast.error(msg.replace('Failed to create session: ', '') || 'Something went wrong. Please try again.')
      }
    })
  }

  return (
    <div className="max-w-2xl mx-auto px-6 py-10">
      <div className="mb-8">
        <div className="flex items-center gap-2.5 mb-2">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {isBusiness ? 'Workplace Mediation' : 'Meet in the Middle'}
          </h1>
          {isBusiness && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-positive-blue text-white">
              Workplace Harmony AI
            </span>
          )}
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {isBusiness
            ? 'Policy-aware mediation for teams. The AI will reference company guidelines and workplace standards.'
            : 'Share both perspectives and let the AI find the common ground. The more context you provide, the better the mediation.'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-7">
        {/* Pass mode=business to createSession when launched from Business Dashboard */}
        {isBusiness && <input type="hidden" name="mode" value="business" />}

        {/* Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            What&apos;s the disagreement?
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            defaultValue={prefillTopic}
            className="w-full border rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring placeholder:text-muted-foreground"
            placeholder="e.g. My partner and I disagree about work-life balance"
          />
          <input type="hidden" name="topic" value={category ?? ''} />
        </div>

        {/* Category pills */}
        <div>
          <label className="block text-sm font-medium mb-3">
            Category
            <span className="text-muted-foreground font-normal ml-1">(optional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => setCategory(category === cat.value ? null : cat.value)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all duration-150',
                  category === cat.value
                    ? 'bg-positive-blue text-white border-positive-blue shadow-sm'
                    : 'bg-background text-muted-foreground border-border hover:border-positive-blue/40 hover:text-positive-blue'
                )}
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
          {category === 'work' && !isBusiness && (
            <p className="text-xs text-positive-blue mt-2 flex items-center gap-1">
              <span>💼</span>
              For policy-aware workplace mediation, visit{' '}
              <a href="/business" className="underline underline-offset-2">Workplace Harmony AI</a>.
            </p>
          )}
        </div>

        {/* Two-perspective section */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div className="flex flex-col">
            <label htmlFor="user_perspective" className="block text-sm font-medium mb-2">
              Your side of the story
            </label>
            <textarea
              id="user_perspective"
              name="user_perspective"
              rows={5}
              required
              className="flex-1 border rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none placeholder:text-muted-foreground leading-relaxed"
              placeholder="Describe your perspective, feelings, and what matters most to you in this situation…"
            />
          </div>

          <div className="flex flex-col">
            <label htmlFor="opposing_perspective" className="block text-sm font-medium mb-2">
              Their perspective or what they&apos;ve said
            </label>
            <textarea
              id="opposing_perspective"
              name="opposing_perspective"
              rows={5}
              key={parsedMediaText ? 'parsed' : 'empty'}
              defaultValue={parsedMediaText}
              className="flex-1 border rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring resize-none placeholder:text-muted-foreground leading-relaxed"
              placeholder="Describe their position, or paste a conversation excerpt…"
            />
          </div>
        </div>

        {/* Optional media upload */}
        <div>
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*,.pdf"
              className="hidden"
              id="opposing_media"
              onChange={handleFileChange}
            />
            {!mediaFileName ? (
              <label
                htmlFor="opposing_media"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:border-indigo-300 hover:text-indigo-600 cursor-pointer transition-colors"
              >
                <Paperclip className="w-3.5 h-3.5" />
                Upload image, video, or document
              </label>
            ) : (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-50 border border-indigo-200 text-sm text-indigo-700">
                <Paperclip className="w-3.5 h-3.5" />
                <span className="truncate max-w-[160px]">{mediaFileName}</span>
                {isParsing && (
                  <span className="w-3.5 h-3.5 border-2 border-indigo-300 border-t-indigo-600 rounded-full animate-spin" />
                )}
                <button type="button" onClick={clearMedia} className="ml-1 text-indigo-400 hover:text-indigo-700">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Text will be extracted and added to the opposing perspective.
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex-1 h-px bg-border" />
          <span>AI will read both sides before responding</span>
          <div className="flex-1 h-px bg-border" />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending || isParsing}
          className="w-full bg-positive-blue hover:bg-positive-blue/90 text-white rounded-xl px-4 py-3 text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm focus-visible:ring-2 focus-visible:ring-positive-blue/40 focus-visible:ring-offset-2"
        >
          {isPending ? 'Starting mediation…' : 'Start Mediation'}
        </button>
      </form>
    </div>
  )
}
