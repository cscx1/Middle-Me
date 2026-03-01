"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, PieChart, Plus, ThumbsUp, Activity } from "lucide-react"

export default function GroupMediationPage() {
    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                        <Users className="h-8 w-8 text-indigo-500" />
                        Group Consensus
                    </h1>
                    <p className="text-muted-foreground mt-2">
                        Multi-party discussion topic mapping to find overlapping agreements.
                    </p>
                </div>
                <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Group Topic
                </Button>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle>Return to Office Policy 2026</CardTitle>
                                    <CardDescription>Active Group • 142 Participants</CardDescription>
                                </div>
                                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 hover:bg-indigo-100">
                                    <Activity className="h-3 w-3 mr-1" /> Analyzing
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="p-6 bg-muted/30 rounded-lg flex flex-col items-center justify-center min-h-[300px] border border-dashed">
                                <PieChart className="h-16 w-16 text-muted-foreground mb-4 opacity-50" />
                                <h3 className="text-lg font-medium mb-2">Consensus Mapping in Progress</h3>
                                <p className="text-center text-sm text-muted-foreground max-w-md">
                                    Gemini is currently analyzing 342 recent comments to cluster arguments and identify areas of mutual agreement.
                                </p>
                                <div className="mt-6 flex flex-wrap justify-center gap-2">
                                    <Badge variant="outline">Flexible Hours (42%)</Badge>
                                    <Badge variant="outline">Commute Subsidies (28%)</Badge>
                                    <Badge variant="outline">Strict 3-Day Rule (15%)</Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Identified Middle Grounds</CardTitle>
                            <CardDescription>AI-generated proposals based on group sentiment</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="p-4 border rounded-lg bg-indigo-50/50 dark:bg-indigo-950/20">
                                <div className="flex justify-between items-start mb-2">
                                    <h4 className="font-semibold text-indigo-700 dark:text-indigo-400">Proposal A: Anchor Days with Flexibility</h4>
                                    <Badge>68% Confidence</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Require 2 specific "anchor days" (Tue/Wed) for cross-team collaboration, allowing employees to choose their 3rd day or work remotely the rest of the week.
                                </p>
                                <div className="flex items-center justify-between">
                                    <div className="flex -space-x-2">
                                        {[1, 2, 3, 4, 5].map(i => (
                                            <div key={i} className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px]">
                                                User
                                            </div>
                                        ))}
                                        <div className="h-6 px-2 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px]">
                                            +45 agreed
                                        </div>
                                    </div>
                                    <Button variant="outline" size="sm">
                                        <ThumbsUp className="h-4 w-4 mr-2" /> Endorse
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Your Contribution</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <textarea
                                className="w-full min-h-[150px] p-3 text-sm rounded-md border bg-transparent"
                                placeholder="Share your perspective on the Return to Office policy..."
                            ></textarea>
                            <Button className="w-full">Submit Opinion</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                "Sarah added a new perspective on childcare costs.",
                                "AI Mediator identified a new sub-cluster regarding commute times.",
                                "David endorsed Proposal A."
                            ].map((act, i) => (
                                <div key={i} className="text-sm pb-4 border-b last:border-0 last:pb-0">
                                    {act}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
