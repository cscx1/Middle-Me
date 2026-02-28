import { cn, formatDate } from '@/lib/utils'
import type { Message } from '@/types'

export function MessageBubble({ message }: { message: Message }) {
  const isMediator = message.role === 'mediator'

  return (
    <div
      className={cn(
        'flex gap-3',
        isMediator ? 'flex-row' : 'flex-row-reverse'
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          'w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-medium',
          isMediator
            ? 'bg-primary text-primary-foreground'
            : 'bg-muted text-muted-foreground'
        )}
      >
        {isMediator ? 'AI' : 'You'}
      </div>

      {/* Bubble */}
      <div className={cn('max-w-[75%]', isMediator ? '' : 'items-end flex flex-col')}>
        <div
          className={cn(
            'rounded-2xl px-4 py-3 text-sm leading-relaxed',
            isMediator
              ? 'bg-muted text-foreground rounded-tl-sm'
              : 'bg-primary text-primary-foreground rounded-tr-sm'
          )}
        >
          {message.content}
        </div>
        <p className="text-xs text-muted-foreground mt-1 px-1">
          {formatDate(message.created_at)}
        </p>
      </div>
    </div>
  )
}
