"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Scale, User, Building2 } from "lucide-react"
import { useState } from "react"
import { login } from "./(auth)/actions"

export default function Home() {
    const [accountType, setAccountType] = useState<"individual" | "business">("individual")
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState(false)

    async function handleLogin(formData: FormData) {
        setError(null)
        setLoading(true)

        const result = await login(formData)

        if (result?.error) {
            setError(result.error)
            setLoading(false)
        }
    }

    return (
        <div className="flex min-h-screen bg-[#F8FAFC]">
            {/* Left Column: Branding & Copy */}
            <div className="hidden lg:flex flex-col justify-center w-1/2 p-24">
                <div className="max-w-md">
                    <div className="flex items-center gap-3 mb-16">
                        <div className="bg-[#E2E8F0] p-2 rounded-lg">
                            <Scale className="h-6 w-6 text-[#475569]" />
                        </div>
                        <h1 className="text-2xl font-bold text-[#475569]">Middle Me</h1>
                    </div>

                    <h2 className="text-6xl font-extrabold text-[#334155] leading-tight mb-6">
                        Find your <span className="text-[#64748B]">middle ground.</span>
                    </h2>

                    <p className="text-xl text-[#64748B] leading-relaxed mb-12">
                        A neutral space for conflict resolution and de-escalation. Connect, communicate, and resolve disputes with confidence and calm.
                    </p>

                    <div className="border-l-4 border-[#CBD5E1] pl-6 py-2">
                        <p className="italic text-[#64748B] mb-4">
                            "The most effective way to reach an agreement without the noise."
                        </p>
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-slate-300 flex items-center justify-center overflow-hidden">
                                <div className="h-full w-full bg-[#475569] flex items-center justify-center text-xs text-white">SJ</div>
                            </div>
                            <span className="text-sm font-semibold text-[#334155]">Sarah Jenkins, Mediator</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Column: Login Form */}
            <div className="flex flex-col justify-center items-center w-full lg:w-1/2 p-8">
                <Card className="w-full max-w-md p-8 shadow-xl shadow-slate-200/50 border-0 rounded-2xl">
                    <div className="mb-8">
                        <h2 className="text-2xl font-bold text-[#0F172A] mb-2">Welcome back</h2>
                        <p className="text-[#64748B] text-sm">Please enter your details to sign in.</p>
                    </div>

                    <CardContent className="p-0 space-y-5">
                        <form action={handleLogin}>
                            {error && (
                                <div className="bg-destructive/15 text-destructive text-sm p-3 rounded-md mb-4">
                                    {error}
                                </div>
                            )}
                            <div className="space-y-2 mb-5">
                                <Label htmlFor="email" className="text-[#334155]">Email address</Label>
                                <Input
                                    id="email"
                                    name="email"
                                    type="email"
                                    placeholder="you@example.com"
                                    className="h-11 border-slate-200 focus-visible:ring-slate-300"
                                    required
                                />
                            </div>

                            <div className="space-y-2 mb-5">
                                <div className="flex justify-between items-center">
                                    <Label htmlFor="password" className="text-[#334155]">Password</Label>
                                    <Link href="#" className="text-sm text-[#64748B] hover:text-[#334155]">
                                        Forgot password?
                                    </Link>
                                </div>
                                <Input
                                    id="password"
                                    name="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="h-11 border-slate-200 focus-visible:ring-slate-300"
                                    required
                                />
                            </div>

                            <div className="block w-full pt-2">
                                <Button type="submit" disabled={loading} className="w-full h-11 bg-[#5A6B84] hover:bg-[#475569] text-white">
                                    {loading ? "Logging in..." : "Log In"}
                                </Button>
                            </div>
                        </form>

                        <div className="relative my-6">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-200" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white px-4 text-[#94A3B8]">Or continue with</span>
                            </div>
                        </div>

                        <div className="flex gap-4">
                            <Button variant="outline" className="w-full h-11 border-slate-200 text-[#334155] font-normal">
                                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                                </svg>
                                Google
                            </Button>
                            <Button variant="outline" className="w-full h-11 border-slate-200 text-[#334155] font-normal">
                                <svg className="mr-2 h-4 w-4 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                </svg>
                                Facebook
                            </Button>
                        </div>

                        <Dialog>
                            <DialogTrigger asChild>
                                <div className="block w-full pt-4">
                                    <Button className="w-full h-11 bg-[#7CB30B] hover:bg-[#659409] text-white">
                                        Create New Account
                                    </Button>
                                </div>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-2xl p-8 rounded-2xl border-0 shadow-2xl">
                                <DialogHeader className="mb-6">
                                    <DialogTitle className="text-2xl font-bold text-[#0F172A]">Create New Account</DialogTitle>
                                    <DialogDescription className="text-base text-[#64748B] mt-2">
                                        Choose the account type that best describes you to get started with your neutral space.
                                    </DialogDescription>
                                </DialogHeader>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    {/* Individual Card */}
                                    <div
                                        onClick={() => setAccountType("individual")}
                                        className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-center h-48 ${accountType === "individual"
                                            ? "border-[#7CB30B] bg-[#F7FEE7]"
                                            : "border-slate-200 hover:border-slate-300 bg-white"
                                            }`}
                                    >
                                        {accountType === "individual" && (
                                            <span className="absolute -top-3 right-4 bg-[#7CB30B] text-white text-[10px] font-bold px-2 py-1 rounded">
                                                SELECTED
                                            </span>
                                        )}
                                        <User className={`h-12 w-12 mb-4 ${accountType === "individual" ? "text-[#7CB30B]" : "text-slate-400"}`} />
                                        <h3 className="font-semibold text-[#0F172A] mb-1">Individual</h3>
                                        <p className="text-xs text-[#64748B]">Personal conflict resolution</p>
                                    </div>

                                    {/* Business Card */}
                                    <div
                                        onClick={() => setAccountType("business")}
                                        className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all flex flex-col items-center justify-center text-center h-48 ${accountType === "business"
                                            ? "border-[#7CB30B] bg-[#F7FEE7]"
                                            : "border-slate-200 hover:border-slate-300 bg-white"
                                            }`}
                                    >
                                        {accountType === "business" && (
                                            <span className="absolute -top-3 right-4 bg-[#7CB30B] text-white text-[10px] font-bold px-2 py-1 rounded">
                                                SELECTED
                                            </span>
                                        )}
                                        <Building2 className={`h-12 w-12 mb-4 ${accountType === "business" ? "text-[#7CB30B]" : "text-slate-400"}`} />
                                        <h3 className="font-semibold text-[#0F172A] mb-1">Business / Org</h3>
                                        <p className="text-xs text-[#64748B]">Workplace mediation tools</p>
                                    </div>
                                </div>

                                <div className="flex justify-end gap-3">
                                    <Button variant="outline" className="px-6 h-11 border-slate-200 text-[#334155] rounded-full">
                                        Cancel
                                    </Button>
                                    <Link href={`/signup?type=${accountType}`}>
                                        <Button className="px-6 h-11 bg-[#7CB30B] hover:bg-[#659409] text-white rounded-full">
                                            Continue to Sign Up
                                        </Button>
                                    </Link>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <p className="text-center text-xs text-[#94A3B8] mt-6">
                            By clicking continue, you agree to our <Link href="#" className="underline">Terms of Service</Link> and <Link href="#" className="underline">Privacy Policy</Link>.
                        </p>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
