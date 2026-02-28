import Link from 'next/link'
import { ArrowRight, MessageSquare, Scale, Zap } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="border-b">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <span className="font-semibold text-lg tracking-tight">Middle Me</span>
          <nav className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-muted text-muted-foreground text-xs font-medium px-3 py-1 rounded-full mb-6">
          <Zap className="w-3 h-3" />
          AI-powered mediation
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-6 leading-tight">
          Find common ground<br />across any difference
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
          Middle Me is an AI mediator that listens to both sides, grounds
          conversations in real news, and helps people discover shared values
          beneath opposing positions.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors"
          >
            Start a session
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 border px-6 py-3 rounded-md font-medium hover:bg-muted transition-colors"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: MessageSquare,
              title: 'Neutral Mediation',
              description:
                'Claude acts as a neutral third party — never taking sides, always seeking to understand.',
            },
            {
              icon: Scale,
              title: 'Grounded in Reality',
              description:
                'Real-time news context keeps conversations anchored in facts, not just feelings.',
            },
            {
              icon: Zap,
              title: 'Trending Topics',
              description:
                'See what divisive topics are being discussed right now and jump into the conversation.',
            },
          ].map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="border rounded-xl p-6 bg-card hover:shadow-sm transition-shadow"
            >
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Middle Me. Built for the hackathon.
        </div>
      </footer>
    </div>
  )
}
