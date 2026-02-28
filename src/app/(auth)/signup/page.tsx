import Link from 'next/link'
import { SignupForm } from '@/components/features/auth/SignupForm'

export const metadata = { title: 'Create account — Middle Me' }

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/" className="font-semibold text-xl tracking-tight">
            Middle Me
          </Link>
          <p className="text-muted-foreground text-sm mt-2">
            Create your account
          </p>
        </div>
        <div className="border rounded-xl p-6 bg-card shadow-sm">
          <SignupForm />
          <p className="text-center text-sm text-muted-foreground mt-4">
            Already have an account?{' '}
            <Link href="/login" className="text-foreground underline underline-offset-4">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
