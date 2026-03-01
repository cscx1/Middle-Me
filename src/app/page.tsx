import Link from 'next/link'
import { ArrowRight, Heart, Briefcase, Sparkles } from 'lucide-react'

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
              className="text-sm bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors font-medium"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-4 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 text-xs font-semibold px-3 py-1.5 rounded-full mb-8 border border-indigo-100">
          <Sparkles className="w-3 h-3" />
          AI-Powered Emotional Mediation
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-6 leading-[1.1] text-slate-800">
          Find common ground through<br />
          <span className="text-indigo-600">AI-guided emotional mediation</span>
        </h1>
        <p className="text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Middle Me sees both sides, de-escalates conflict, and guides people toward a middle ground —
          for personal relationships, workplace teams, and communities.
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-indigo-600 text-white px-7 py-3.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-sm text-base"
          >
            Start a Mediation
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 border border-border px-7 py-3.5 rounded-xl font-medium hover:bg-muted transition-colors text-base"
          >
            Sign in
          </Link>
        </div>
      </section>

      {/* How it works — visual callout */}
      <section className="max-w-3xl mx-auto px-4 pb-16">
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 border border-blue-100 rounded-2xl px-8 py-8 text-center">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-widest mb-6">How it works</p>
          <div className="grid grid-cols-3 gap-6">
            {[
              { step: '1', label: 'Share both perspectives' },
              { step: '2', label: 'AI mediates with empathy' },
              { step: '3', label: 'Find the middle ground' },
            ].map(({ step, label }) => (
              <div key={step} className="flex flex-col items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-600 font-bold text-lg flex items-center justify-center border border-indigo-200">
                  {step}
                </div>
                <p className="text-sm text-slate-600 font-medium text-center leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <h2 className="text-center text-sm font-semibold text-muted-foreground uppercase tracking-widest mb-10">
          Built for every kind of conflict
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border border-rose-100 rounded-2xl p-7 bg-rose-50/50 hover:shadow-sm transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-rose-100 flex items-center justify-center mb-5">
              <Heart className="w-5 h-5 text-rose-500" />
            </div>
            <h3 className="font-semibold text-base mb-2 text-slate-800">Personal Relationships</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Navigate disagreements with partners, family, or friends with empathy and clarity.
              AI helps you hear what&apos;s really being said beneath the tension.
            </p>
          </div>

          <div className="border border-indigo-100 rounded-2xl p-7 bg-indigo-50/50 hover:shadow-sm transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center mb-5">
              <Briefcase className="w-5 h-5 text-indigo-500" />
            </div>
            <h3 className="font-semibold text-base mb-2 text-slate-800">Workplace Conflict</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Resolve team tensions with policy-aware AI mediation built for professional settings.
              Business Mode surfaces your company&apos;s EAP and inclusion standards.
            </p>
          </div>

          <div className="border border-emerald-100 rounded-2xl p-7 bg-emerald-50/50 hover:shadow-sm transition-shadow">
            <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center mb-5">
              <Sparkles className="w-5 h-5 text-emerald-500" />
            </div>
            <h3 className="font-semibold text-base mb-2 text-slate-800">Mental Well-being</h3>
            <p className="text-sm text-slate-500 leading-relaxed">
              Reduce emotional stress through structured, AI-guided reflection and mutual understanding.
              Walk away feeling heard — not just right.
            </p>
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="max-w-5xl mx-auto px-4 pb-24">
        <div className="bg-gradient-to-br from-indigo-600 to-indigo-700 rounded-2xl px-10 py-12 text-center text-white">
          <h2 className="text-2xl font-bold mb-3 leading-tight">
            Every conflict has a middle ground.
          </h2>
          <p className="text-indigo-200 mb-7 max-w-lg mx-auto text-sm leading-relaxed">
            Join Middle Me and let AI help you find it — for stronger bonds, more inclusive teams,
            and healthier communities.
          </p>
          <Link
            href="/signup"
            className="inline-flex items-center gap-2 bg-white text-indigo-700 px-7 py-3 rounded-xl font-semibold hover:bg-indigo-50 transition-colors shadow-sm"
          >
            Get started free
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Middle Me — Strengthening bonds through AI-guided mediation.
        </div>
      </footer>
    </div>
  )
}
