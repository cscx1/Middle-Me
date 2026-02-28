import Link from 'next/link'
import { LoginForm } from '@/components/features/auth/LoginForm'

export const metadata = { title: 'Sign in — Middle Me' }

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="font-semibold text-xl tracking-tight">
            Middle Me
          </Link>
          <p className="text-muted-foreground text-sm mt-2">
            Sign in to your account
          </p>
        </div>
        <div className="border rounded-xl p-6 bg-card shadow-sm">
          <LoginForm />
          <p className="text-center text-sm text-muted-foreground mt-4">
            No account?{' '}
            <Link href="/signup" className="text-foreground underline underline-offset-4">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
