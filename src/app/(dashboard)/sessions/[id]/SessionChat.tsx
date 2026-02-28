'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { MessageBubble } from '@/components/features/sessions/MessageBubble'
import { ChatInput } from '@/components/features/sessions/ChatInput'
import type { Message, Session } from '@/types'

interface Props {
  session: Session
  initialMessages: Message[]
}

const statusConfig = {
  open: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  resolved: 'bg-blue-50 text-blue-700 border-blue-200',
  archived: 'bg-muted text-muted-foreground border-border',
}

export function SessionChat({ session, initialMessages }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const bottomRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  function handleMessage(userContent: string, aiContent: string) {
    const now = new Date().toISOString()
    setMessages((prev) => [
      ...prev,
      { id: crypto.randomUUID(), session_id: session.id, role: 'user', content: userContent, created_at: now },
      { id: crypto.randomUUID(), session_id: session.id, role: 'mediator', content: aiContent, created_at: now },
    ])
  }

  const isDisabled = session.status !== 'open'

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="border-b px-6 py-4 flex items-center gap-4 bg-background">
        <Link
          href="/sessions"
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Back to sessions"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="font-medium text-sm truncate">{session.title}</h1>
          {session.topic && (
            <p className="text-xs text-muted-foreground">{session.topic}</p>
          )}
        </div>
        <span
          className={cn(
            'shrink-0 text-xs font-medium px-2.5 py-1 rounded-full border',
            statusConfig[session.status]
          )}
        >
          {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <span className="text-lg font-semibold">AI</span>
            </div>
            <p className="text-muted-foreground text-sm max-w-xs">
              Middle Me is ready to help. Share your perspective on{' '}
              <strong>{session.topic ?? 'this topic'}</strong> to begin.
            </p>
          </div>
        ) : (
          messages.map((m) => <MessageBubble key={m.id} message={m} />)
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      {isDisabled ? (
        <div className="border-t px-6 py-4 text-center text-sm text-muted-foreground">
          This session is {session.status}. Start a new session to continue.
        </div>
      ) : (
        <div className="border-t px-6 py-4 bg-background">
          <ChatInput
            sessionId={session.id}
            onMessage={handleMessage}
          />
        </div>
      )}
    </div>
  )
}
