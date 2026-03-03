'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { ActionResult } from '@/types'

export async function signIn(formData: FormData): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) return { success: false, error: error.message }

    redirect('/dashboard')
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('NEXT_REDIRECT')) throw err
    return { success: false, error: 'Sign-in failed. Check server configuration (env vars) or try again.' }
  }
}

export async function signUp(formData: FormData): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const displayName = formData.get('display_name') as string

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    })

    if (error) return { success: false, error: error.message }

    redirect('/dashboard')
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg.includes('NEXT_REDIRECT')) throw err
    return { success: false, error: 'Sign-up failed. Check server configuration (env vars) or try again.' }
  }
}

export async function signOut(): Promise<void> {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()
  } catch {
    // continue to redirect even if signOut fails
  }
  redirect('/login')
}
