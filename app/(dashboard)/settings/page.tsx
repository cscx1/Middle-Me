"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { updateProfile, updatePassword } from "@/app/(auth)/actions"

export default function SettingsPage() {
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [profileLoading, setProfileLoading] = useState(false)
    const [passwordLoading, setPasswordLoading] = useState(false)
    const [profileMessage, setProfileMessage] = useState({ text: "", type: "" })
    const [passwordMessage, setPasswordMessage] = useState({ text: "", type: "" })

    useEffect(() => {
        async function loadUser() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setFullName(user.user_metadata?.full_name || "")
                setEmail(user.email || "")
            }
        }
        loadUser()
    }, [])

    async function handleProfileUpdate(formData: FormData) {
        setProfileLoading(true)
        setProfileMessage({ text: "", type: "" })

        const result = await updateProfile(formData)

        if (result?.error) {
            setProfileMessage({ text: result.error, type: "error" })
        } else {
            setProfileMessage({ text: "Profile updated successfully.", type: "success" })
        }
        setProfileLoading(false)
    }

    async function handlePasswordUpdate(formData: FormData) {
        setPasswordLoading(true)
        setPasswordMessage({ text: "", type: "" })

        const result = await updatePassword(formData)

        if (result?.error) {
            setPasswordMessage({ text: result.error, type: "error" })
        } else {
            setPasswordMessage({ text: "Password updated successfully.", type: "success" })
        }
        setPasswordLoading(false)
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-[#0F172A] mb-2">Settings</h1>
                <p className="text-muted-foreground">Manage your account preferences and secure your profile.</p>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Profile Details</CardTitle>
                        <CardDescription>Update your personal information.</CardDescription>
                    </CardHeader>
                    <form action={handleProfileUpdate}>
                        <CardContent className="space-y-4">
                            {profileMessage.text && (
                                <div className={`p-3 rounded-md text-sm ${profileMessage.type === "error" ? "bg-destructive/15 text-destructive" : "bg-green-100 text-green-700"}`}>
                                    {profileMessage.text}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="full_name">Full Name</Label>
                                <Input
                                    id="full_name"
                                    name="full_name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="email">Email Address</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={email}
                                    disabled
                                    className="bg-muted cursor-not-allowed"
                                />
                                <p className="text-xs text-muted-foreground">Contact support to change your email address.</p>
                            </div>
                            <Button type="submit" disabled={profileLoading} className="w-full">
                                {profileLoading ? "Saving..." : "Save Profile"}
                            </Button>
                        </CardContent>
                    </form>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Security</CardTitle>
                        <CardDescription>Update your password to keep your account secure.</CardDescription>
                    </CardHeader>
                    <form action={handlePasswordUpdate}>
                        <CardContent className="space-y-4">
                            {passwordMessage.text && (
                                <div className={`p-3 rounded-md text-sm ${passwordMessage.type === "error" ? "bg-destructive/15 text-destructive" : "bg-green-100 text-green-700"}`}>
                                    {passwordMessage.text}
                                </div>
                            )}
                            <div className="space-y-2">
                                <Label htmlFor="password">New Password</Label>
                                <Input id="password" name="password" type="password" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                                <Input id="confirmPassword" name="confirmPassword" type="password" required />
                            </div>
                            <Button type="submit" disabled={passwordLoading} variant="secondary" className="w-full">
                                {passwordLoading ? "Updating..." : "Update Password"}
                            </Button>
                        </CardContent>
                    </form>
                </Card>
            </div>
        </div>
    )
}
