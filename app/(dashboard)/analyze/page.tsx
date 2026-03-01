"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UploadCloud, Image as ImageIcon, AlertCircle } from "lucide-react"

export default function AnalyzePage() {
    const [isUploading, setIsUploading] = useState(false)
    const [analyzed, setAnalyzed] = useState(false)

    const handleUpload = () => {
        setIsUploading(true)
        setTimeout(() => {
            setIsUploading(false)
            setAnalyzed(true)
        }, 2000)
    }

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Screen Capture Analysis</h1>
                <p className="text-muted-foreground mt-2">
                    Upload a screenshot of a heated conversation. Our AI will identify core arguments and suggest de-escalation points.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <Card className="border-dashed border-2">
                    <CardHeader>
                        <CardTitle>Upload Image</CardTitle>
                        <CardDescription>Drag and drop or click to upload</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                        {analyzed ? (
                            <div className="flex flex-col items-center">
                                <ImageIcon className="h-16 w-16 mb-4 text-primary" />
                                <p className="font-medium text-foreground">reddit_argument.png</p>
                                <p className="text-sm">Uploaded successfully</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center cursor-pointer hover:text-foreground transition-colors" onClick={handleUpload}>
                                <UploadCloud className="h-16 w-16 mb-4" />
                                <Button variant="secondary" disabled={isUploading}>
                                    {isUploading ? "Uploading..." : "Select File"}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card className={`transition-all ${analyzed ? 'opacity-100' : 'opacity-50 blur-sm pointer-events-none'}`}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <AlertCircle className="h-5 w-5 text-amber-500" />
                            Analysis Results
                        </CardTitle>
                        <CardDescription>Gemini AI insights from the uploaded image</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="bg-muted p-4 rounded-lg">
                            <h3 className="font-semibold mb-2">Core Disagreement</h3>
                            <p className="text-sm">
                                User A is arguing for stricter environmental regulations based on long-term data, while User B is concerned about immediate economic impacts on small businesses.
                            </p>
                        </div>
                        <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                            <h3 className="font-semibold mb-2 text-primary">Suggested Middle Ground</h3>
                            <ul className="text-sm space-y-2 list-disc pl-4">
                                <li>Acknowledge the shared goal of a sustainable future.</li>
                                <li>Propose a phased approach to regulations to give small businesses time to adapt.</li>
                                <li>Focus on subsidies or grants that help offset economic impacts.</li>
                            </ul>
                        </div>
                        <Button className="w-full">Generate Response Draft</Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
