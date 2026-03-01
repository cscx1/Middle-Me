import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Search, Bell, Image as ImageIcon, Mic, Tag, MoreHorizontal, MessageSquare, Eye, CheckCircle2, RotateCcw, ChevronRight, Briefcase, Home } from "lucide-react"

export default function DashboardPage() {
    return (
        <div className="flex flex-col h-full bg-[#F8FAFC]">
            {/* Top Navigation Bar */}
            <div className="flex items-center justify-between mb-8">
                <div className="relative w-full max-w-xl">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <Input
                        placeholder="Search for guides, sessions, or topics..."
                        className="w-full pl-10 h-12 bg-white border-0 rounded-full shadow-sm text-sm"
                    />
                </div>
                <div className="flex items-center gap-4 ml-4">
                    <button className="h-10 w-10 rounded-full bg-white flex items-center justify-center shadow-sm relative text-slate-600 hover:text-slate-900 transition-colors">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-red-500 border border-white"></span>
                    </button>
                    <Avatar className="h-10 w-10 border border-slate-200">
                        <AvatarImage src="/avatar-placeholder.png" />
                        <AvatarFallback className="bg-orange-100 text-orange-700">SJ</AvatarFallback>
                    </Avatar>
                </div>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
                {/* Main Content Area */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Start New Session Bar */}
                    <Card className="border-0 shadow-sm rounded-2xl overflow-hidden">
                        <CardContent className="p-4 flex items-center gap-4">
                            <Avatar className="h-10 w-10">
                                <AvatarImage src="/avatar-placeholder.png" />
                                <AvatarFallback className="bg-orange-100 text-orange-700">SJ</AvatarFallback>
                            </Avatar>
                            <Input
                                placeholder="Start a new mediation... Describe the conflict briefly."
                                className="border-0 shadow-none bg-slate-50 rounded-xl h-12 focus-visible:ring-0 px-4"
                            />
                        </CardContent>
                        <div className="px-4 pb-4 flex items-center justify-between">
                            <div className="flex items-center gap-4 ml-14">
                                <button className="text-slate-400 hover:text-slate-600"><ImageIcon className="h-5 w-5" /></button>
                                <button className="text-slate-400 hover:text-slate-600"><Mic className="h-5 w-5" /></button>
                                <button className="text-slate-400 hover:text-slate-600"><Tag className="h-5 w-5" /></button>
                            </div>
                            <Button className="rounded-full bg-[#8B5CF6] hover:bg-[#7C3AED] px-6">
                                Start Session
                            </Button>
                        </div>
                    </Card>

                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-bold text-[#0F172A]">Recent Sessions</h2>
                            <button className="text-sm text-[#8B5CF6] font-medium hover:underline">View All</button>
                        </div>

                        <div className="space-y-4">
                            {/* Session Card 1 */}
                            <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                                                <Briefcase className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-[#0F172A]">Marketing Dept Miscommunication</h3>
                                                <p className="text-xs text-slate-500">Active • Updated 2 hours ago</p>
                                            </div>
                                        </div>
                                        <button className="text-slate-400"><MoreHorizontal className="h-5 w-5" /></button>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                                        The conflict arose regarding the new campaign direction. Team A feels their input on visual strategy was ignored, while Team B insists the timeline didn't allow for further...
                                    </p>
                                    <div className="w-full h-32 bg-slate-100 rounded-xl mb-4 relative overflow-hidden flex items-center justify-center">
                                        <div className="absolute inset-0 bg-gradient-to-r from-green-100/50 to-blue-100/50"></div>
                                        <span className="text-slate-400 text-sm italic relative z-10">[Meeting screenshot analysis placeholder]</span>
                                        <div className="absolute bottom-2 right-2 bg-slate-800/60 backdrop-blur-sm text-white text-[10px] px-2 py-1 rounded-md z-10">4 Participants</div>
                                    </div>
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex -space-x-2">
                                            <Avatar className="h-6 w-6 border-2 border-white"><AvatarFallback className="bg-blue-200 text-[10px]">T1</AvatarFallback></Avatar>
                                            <Avatar className="h-6 w-6 border-2 border-white"><AvatarFallback className="bg-green-200 text-[10px]">T2</AvatarFallback></Avatar>
                                            <div className="h-6 w-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] text-slate-500">+2</div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
                                                <MessageSquare className="h-3.5 w-3.5" /> 12 Comments
                                            </div>
                                            <div className="flex items-center gap-1 text-slate-500 text-xs font-medium">
                                                <Eye className="h-3.5 w-3.5" /> View Progress
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Session Card 2 */}
                            <Card className="border border-slate-200 shadow-sm rounded-2xl overflow-hidden">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                                                <Home className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-[#0F172A]">Neighbor Noise Complaint</h3>
                                                <p className="text-xs text-slate-500">Resolved • Closed yesterday</p>
                                            </div>
                                        </div>
                                        <button className="text-slate-400"><MoreHorizontal className="h-5 w-5" /></button>
                                    </div>
                                    <p className="text-sm text-slate-600 mb-4">
                                        Mediation reached a successful conclusion regarding late-night renovation work. Both parties agreed to a schedule that respects quiet hours.
                                    </p>

                                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-100">
                                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                                            <CheckCircle2 className="h-3.5 w-3.5" /> Resolution Achieved
                                        </div>
                                        <button className="flex items-center gap-1 text-slate-500 text-xs font-medium hover:text-slate-700">
                                            <RotateCcw className="h-3.5 w-3.5" /> View History
                                        </button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar Area */}
                <div className="space-y-6">
                    {/* Trending Card */}
                    <Card className="border-0 shadow-sm rounded-2xl">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base flex items-center gap-2">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-600"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
                                Trending Conflicts
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="group flex items-center justify-between cursor-pointer">
                                <div>
                                    <h4 className="text-sm font-semibold text-[#0F172A] group-hover:text-[#8B5CF6] transition-colors">Remote Work Policies</h4>
                                    <p className="text-xs text-slate-500">2.4k active sessions</p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#8B5CF6] transition-colors" />
                            </div>
                            <div className="group flex items-center justify-between cursor-pointer">
                                <div>
                                    <h4 className="text-sm font-semibold text-[#0F172A] group-hover:text-[#8B5CF6] transition-colors">Shared Space Hygiene</h4>
                                    <p className="text-xs text-slate-500">1.8k active sessions</p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#8B5CF6] transition-colors" />
                            </div>
                            <div className="group flex items-center justify-between cursor-pointer">
                                <div>
                                    <h4 className="text-sm font-semibold text-[#0F172A] group-hover:text-[#8B5CF6] transition-colors">Project Deadline Stress</h4>
                                    <p className="text-xs text-slate-500">1.2k active sessions</p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#8B5CF6] transition-colors" />
                            </div>
                            <div className="group flex items-center justify-between cursor-pointer">
                                <div>
                                    <h4 className="text-sm font-semibold text-[#0F172A] group-hover:text-[#8B5CF6] transition-colors">Budget Allocation</h4>
                                    <p className="text-xs text-slate-500">900 active sessions</p>
                                </div>
                                <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-[#8B5CF6] transition-colors" />
                            </div>

                            <button className="text-sm text-[#8B5CF6] font-medium pt-2 hover:underline w-full text-left">
                                Show more topics
                            </button>
                        </CardContent>
                    </Card>

                    {/* Pro Banner */}
                    <Card className="border-0 shadow-sm rounded-2xl bg-[#8B5CF6] text-white">
                        <CardContent className="p-6">
                            <h3 className="text-lg font-bold mb-2">Need a Professional?</h3>
                            <p className="text-white/80 text-sm mb-4 leading-relaxed">
                                Connect with certified mediators for complex disputes.
                            </p>
                            <Button className="w-full bg-white text-[#8B5CF6] hover:bg-slate-50 rounded-full font-semibold h-11">
                                Find a Mediator
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
