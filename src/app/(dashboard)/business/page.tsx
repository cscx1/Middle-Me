import { createClient } from '@/lib/supabase/server'
import { BusinessDashboard } from '@/components/features/business/BusinessDashboard'
import type { Session } from '@/types'

export const metadata = { title: 'Workplace Harmony AI — Middle Me' }

export default async function BusinessPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data } = await supabase
    .from('sessions')
    .select('*')
    .eq('created_by', user!.id)
    .eq('business_mode', true)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  const sessions = (data ?? []) as Session[]

  return <BusinessDashboard sessions={sessions} />
}
