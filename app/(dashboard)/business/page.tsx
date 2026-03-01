"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { UploadCloud, FileText, Trash2, ArrowRight } from "lucide-react"

export default function BusinessPage() {
    const [uploading, setUploading] = useState(false)
    const [documents, setDocuments] = useState<{ name: string, size: string, type: string }[]>([
        { name: "Company_Code_of_Conduct.pdf", size: "2.4 MB", type: "PDF" },
    ])

    const handleUpload = () => {
        setUploading(true)
        setTimeout(() => {
            setUploading(false)
            setDocuments([...documents, { name: "Remote_Work_Policy.pdf", size: "1.1 MB", type: "PDF" }])
        }, 1500)
    }

    const removeDoc = (index: number) => {
        setDocuments(documents.filter((_, i) => i !== index))
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] bg-[#F8FAFC]">
            <Card className="w-full max-w-3xl p-10 shadow-xl shadow-slate-200/50 border-0 rounded-3xl bg-white">
                <div className="mb-8">
                    <h1 className="text-4xl font-extrabold text-[#0F172A] mb-3">
                        Customize Your Business Framework
                    </h1>
                    <p className="text-[#64748B] text-lg">
                        Set up your organization's guidelines for conflict resolution to ensure a neutral and trustworthy environment.
                    </p>
                </div>

                <CardContent className="p-0 space-y-8">
                    {/* Upload Area */}
                    <div className="border-2 border-dashed border-slate-300 rounded-3xl p-12 flex flex-col items-center justify-center text-center bg-slate-50/50 transition-colors hover:bg-slate-50">
                        <div className="h-16 w-16 bg-[#F1F5F9] rounded-full flex items-center justify-center mb-4">
                            <UploadCloud className="h-8 w-8 text-[#94A3B8]" />
                        </div>
                        <h3 className="text-lg font-bold text-[#0F172A] mb-1">Upload Policy Documents</h3>
                        <p className="text-[#64748B] mb-6">Drag and drop your policy documents here or click to browse.</p>
                        <Button
                            onClick={handleUpload}
                            disabled={uploading}
                            className="bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-full px-8 h-12 font-semibold"
                        >
                            {uploading ? "Uploading..." : "Browse Files"}
                        </Button>
                    </div>

                    {/* Uploaded Files List */}
                    {documents.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold text-[#94A3B8] uppercase tracking-wider">Uploaded Files</h4>

                            {documents.map((doc, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 bg-[#E8F5E9] rounded-lg flex items-center justify-center">
                                            <FileText className="h-5 w-5 text-[#4CAF50]" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-[#0F172A] line-clamp-1">{doc.name}</p>
                                            <p className="text-xs text-[#94A3B8]">{doc.size} • {doc.type}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeDoc(i)}
                                        className="text-[#CBD5E1] hover:text-red-500 transition-colors p-2"
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    <Button className="w-full h-14 bg-[#50E355] hover:bg-[#45C949] text-[#0F172A] font-bold text-lg rounded-2xl shadow-lg shadow-[#50E355]/20 mt-4 group">
                        Complete Setup & Go to Dashboard
                        <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Button>

                    <p className="text-center text-xs text-[#94A3B8] mt-6">
                        By continuing, you agree to our Terms of Service regarding sensitive document handling.
                    </p>
                </CardContent>
            </Card>
        </div>
    )
}
