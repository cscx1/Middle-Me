'use client'

import { useTransition, useRef } from 'react'
import { Send } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface Props {
  sessionId: string
  onMessage: (userContent: string, aiContent: string) => void
  disabled?: boolean
}

export function ChatInput({ sessionId, onMessage, disabled }: Props) {
  const [isPending, startTransition] = useTransition()
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const content = textareaRef.current?.value.trim()
    if (!content) return

    startTransition(async () => {
      const { sendMessage } = await import('@/actions/sessions')
      const result = await sendMessage(sessionId, content)

      if (!result.success) {
        toast.error(result.error)
        return
      }

      onMessage(result.data.userMessage.content, result.data.aiMessage.content)
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
    <form onSubmit={handleSubmit} className="flex items-end gap-2">
      <textarea
        ref={textareaRef}
        name="content"
        rows={2}
        disabled={isPending || disabled}
        onKeyDown={handleKeyDown}
        placeholder="Share your perspective… (Enter to send, Shift+Enter for newline)"
        className={cn(
          'flex-1 resize-none border rounded-xl px-4 py-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring',
          'disabled:opacity-50 placeholder:text-muted-foreground'
        )}
      />
      <button
        type="submit"
        disabled={isPending || disabled}
        className="h-10 w-10 shrink-0 rounded-xl bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50"
        aria-label="Send message"
      >
        <Send className="w-4 h-4" />
      </button>
    </form>
  )
}
