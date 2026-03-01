import Link from 'next/link'
import {
    Home,
    MessageSquare,
    BookOpen,
    Users,
    Settings,
    Briefcase,
    Scale,
} from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { createClient } from "@/lib/supabase/server"

export async function Sidebar() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const isBusiness = user?.user_metadata?.account_type === 'business'
    const userInitials = user?.email?.substring(0, 2).toUpperCase() || 'SJ'
    const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Guest User'

    return (
        <div className="flex h-screen w-64 flex-col border-r bg-white">
            <div className="p-6 pb-2">
                <div className="flex items-center gap-3">
                    <div className="bg-[#E2E8F0] p-1.5 rounded-lg">
                        <Scale className="h-5 w-5 text-[#8B5CF6]" />
                    </div>
                    <h2 className="text-xl font-bold text-[#0F172A] tracking-tight">Middle Me</h2>
                </div>
            </div>

            <nav className="flex-1 space-y-1 p-4 mt-4">
                <Link
                    href="/dashboard"
                    className="flex items-center gap-3 w-full rounded-full px-4 py-3 bg-[#8B5CF6] text-white transition-all font-medium shadow-md shadow-[#8B5CF6]/20"
                >
                    <Home className="h-5 w-5" />
                    Home
                </Link>
                <Link
                    href="/dashboard/sessions"
                    className="flex items-center gap-3 w-full rounded-full px-4 py-3 text-[#64748B] transition-all hover:bg-slate-50 hover:text-[#0F172A] font-medium"
                >
                    <MessageSquare className="h-5 w-5" />
                    My Sessions
                </Link>
                <Link
                    href="/dashboard/guides"
                    className="flex items-center gap-3 w-full rounded-full px-4 py-3 text-[#64748B] transition-all hover:bg-slate-50 hover:text-[#0F172A] font-medium"
                >
                    <BookOpen className="h-5 w-5" />
                    Guides
                </Link>
                <Link
                    href="/dashboard/community"
                    className="flex items-center gap-3 w-full rounded-full px-4 py-3 text-[#64748B] transition-all hover:bg-slate-50 hover:text-[#0F172A] font-medium"
                >
                    <Users className="h-5 w-5" />
                    Community
                </Link>

                {isBusiness && (
                    <div className="pt-6 pb-2">
                        <Link
                            href="/business"
                            className="flex items-center gap-3 w-full rounded-full px-4 py-3 text-[#64748B] transition-all hover:bg-slate-50 hover:text-[#0F172A] font-medium"
                        >
                            <Briefcase className="h-5 w-5" />
                            Policy & Guidelines
                        </Link>
                    </div>
                )}

                <div className="pt-2">
                    <Link
                        href="/settings"
                        className="flex items-center gap-3 w-full rounded-full px-4 py-3 text-[#64748B] transition-all hover:bg-slate-50 hover:text-[#0F172A] font-medium"
                    >
                        <Settings className="h-5 w-5" />
                        Settings
                    </Link>
                </div>
            </nav>

            <div className="p-6 pt-0">
                <div className="flex items-center gap-3 p-3 rounded-2xl border bg-white shadow-sm">
                    <Avatar className="h-10 w-10 border border-slate-200">
                        <AvatarFallback className="bg-[#8B5CF6] text-white">{userInitials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col truncate">
                        <span className="text-sm font-semibold text-[#0F172A] truncate w-24">{userName}</span>
                        <span className="text-xs text-[#64748B]">{isBusiness ? 'Business Plan' : 'Free Plan'}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

