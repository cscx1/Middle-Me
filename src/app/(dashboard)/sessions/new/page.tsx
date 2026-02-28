import { createSession } from '@/actions/sessions'

export const metadata = { title: 'New Session — Middle Me' }

export default function NewSessionPage() {
  return (
    <div className="max-w-xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-semibold tracking-tight mb-8">
        Start a new session
      </h1>

      <form action={createSession} className="space-y-5">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-1.5">
            What would you like to mediate?
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            className="w-full border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="e.g. 'My partner and I disagree on moving cities'"
          />
        </div>

        <div>
          <label htmlFor="topic" className="block text-sm font-medium mb-1.5">
            Topic tag{' '}
            <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <input
            id="topic"
            name="topic"
            type="text"
            className="w-full border rounded-lg px-3 py-2.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="e.g. 'climate change', 'immigration', 'work-life balance'"
          />
          <p className="text-xs text-muted-foreground mt-1.5">
            Used to pull in relevant news context for the AI mediator.
          </p>
        </div>

        <button
          type="submit"
          className="w-full bg-primary text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Start session
        </button>
      </form>
    </div>
  )
}
