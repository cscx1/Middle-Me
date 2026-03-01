"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MessageSquare, Send } from "lucide-react"

export default function UserMediationPage() {
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: "Alice",
            role: "user",
            content: "I think we should prioritize the marketing budget for Q3. We need more visibility.",
            time: "10:00 AM"
        },
        {
            id: 2,
            sender: "Bob",
            role: "user",
            content: "Marketing is a waste right now. We need that money in product development to fix the core issues first.",
            time: "10:05 AM"
        },
        {
            id: 3,
            sender: "AI Mediator",
            role: "ai",
            content: "It seems Alice is focused on outward growth to drive revenue, while Bob is concerned about the internal quality of the product. \n\n**Middle Ground Suggestion:** What if we allocate 70% to product development to fix the immediate bugs, and 30% to targeted marketing that highlights these improvements?",
            time: "10:06 AM"
        }
    ])
    const [input, setInput] = useState("")

    const sendMessage = () => {
        if (!input.trim()) return
        setMessages([
            ...messages,
            { id: Date.now(), sender: "You", role: "user", content: input, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ])
        setInput("")
    }

    return (
        <div className="flex flex-col h-[calc(100vh-6rem)] max-w-5xl mx-auto space-y-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <MessageSquare className="h-8 w-8 text-primary" />
                    1-on-1 Mediation
                </h1>
                <p className="text-muted-foreground mt-2">
                    Asynchronous discussion with an AI mediator helping to bridge the gap.
                </p>
            </div>

            <Card className="flex-1 flex flex-col overflow-hidden">
                <CardHeader className="bg-muted/30 border-b py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-lg">Budget Allocation Dispute</CardTitle>
                            <CardDescription>Participants: Alice, Bob (You), and AI Mediator</CardDescription>
                        </div>
                        <div className="flex -space-x-2">
                            <Avatar className="border-2 border-background">
                                <AvatarFallback>AL</AvatarFallback>
                            </Avatar>
                            <Avatar className="border-2 border-background">
                                <AvatarFallback>BO</AvatarFallback>
                            </Avatar>
                            <Avatar className="border-2 border-primary bg-primary text-primary-foreground">
                                <AvatarFallback>AI</AvatarFallback>
                            </Avatar>
                        </div>
                    </div>
                </CardHeader>

                <ScrollArea className="flex-1 p-6">
                    <div className="space-y-6">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-4 ${msg.sender === "You" ? "justify-end" : "justify-start"}`}
                            >
                                {msg.sender !== "You" && (
                                    <Avatar className={msg.role === 'ai' ? 'bg-primary text-primary-foreground' : 'bg-muted'}>
                                        <AvatarFallback>{msg.sender.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                )}

                                <div className={`max-w-[75%] flex flex-col gap-1 ${msg.sender === "You" ? "items-end" : "items-start"}`}>
                                    <div className="flex items-baseline gap-2 mx-1">
                                        <span className="text-sm font-medium">{msg.sender}</span>
                                        <span className="text-xs text-muted-foreground">{msg.time}</span>
                                    </div>

                                    <div className={`p-4 rounded-xl shadow-sm ${msg.role === 'ai'
                                            ? "bg-primary/10 border border-primary/20 text-foreground"
                                            : msg.sender === "You"
                                                ? "bg-primary text-primary-foreground rounded-tr-none"
                                                : "bg-muted rounded-tl-none"
                                        }`}>
                                        <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                    </div>
                                </div>

                                {msg.sender === "You" && (
                                    <Avatar className="bg-primary/20">
                                        <AvatarFallback>YO</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <div className="p-4 border-t bg-background">
                    <form
                        onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                        className="flex gap-2"
                    >
                        <Input
                            placeholder="Type your perspective..."
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            className="flex-1"
                        />
                        <Button type="submit">
                            <Send className="h-4 w-4 mr-2" />
                            Send
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    )
}
