'use client'

import { useTransition, useRef } from 'react'
import { Send } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import type { Message, SessionSummary } from '@/types'

interface Props {
  sessionId: string
  onMessage: (
    userContent: string,
    aiContent: string,
    aiId: string,
    aiMeta?: Message['meta'],
    summary?: SessionSummary | null,
    avgRating?: number | null
  ) => void
  disabled?: boolean
  businessMode?: boolean
}

export function ChatInput({ sessionId, onMessage, disabled, businessMode = false }: Props) {
  const [isPending, startTransition] = useTransition()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const content = textareaRef.current?.value.trim()
    if (!content) return

    startTransition(async () => {
      const { sendMessage } = await import('@/actions/sessions')
      const result = await sendMessage(sessionId, content, businessMode)

      if (!result.success) {
        toast.error(result.error)
        return
      }

      onMessage(
        result.data.userMessage.content,
        result.data.aiMessage.content,
        result.data.aiMessage.id,
        (result.data.aiMessage as Message).meta,
        result.data.summary,
        result.data.avgRating
      )
      if (textareaRef.current) textareaRef.current.value = ''
    })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      e.currentTarget.form?.requestSubmit()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex items-end gap-3">
      <textarea
        ref={textareaRef}
        name="content"
        rows={2}
        disabled={isPending || disabled}
        onKeyDown={handleKeyDown}
        placeholder={
          businessMode
            ? 'Describe the workplace situation… (Enter to send)'
            : 'Share your thoughts… (Enter to send, Shift+Enter for newline)'
        }
        className={cn(
          'flex-1 resize-none border rounded-xl px-4 py-3 text-sm bg-background',
          'focus:outline-none focus:ring-2 focus:ring-positive-blue/30',
          'disabled:opacity-50 placeholder:text-muted-foreground leading-relaxed'
        )}
      />
      <button
        type="submit"
        disabled={isPending || disabled}
        className="h-11 w-11 shrink-0 rounded-xl bg-positive-blue text-white flex items-center justify-center hover:bg-positive-blue/90 transition-colors disabled:opacity-50 focus-visible:ring-2 focus-visible:ring-positive-blue/40 focus-visible:ring-offset-2"
        aria-label="Send message"
      >
        {isPending ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
      </button>
    </form>
  )
}
