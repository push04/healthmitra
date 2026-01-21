"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Paperclip, User, HeadphonesIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
    id: string;
    sender: 'user' | 'admin';
    text: string;
    timestamp: string;
    attachment?: string;
}

const MOCK_MESSAGES: Message[] = [
    {
        id: '1',
        sender: 'admin',
        text: "Your appointment has been confirmed with Dr. Sharma for Jan 20, 2025 at 10:30 AM. You will receive a video link via SMS.",
        timestamp: "Jan 19, 02:15 PM"
    }
];

export function CommunicationThread() {
    const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
    const [newItem, setNewItem] = useState("");
    const endRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSend = () => {
        if (!newItem.trim()) return;
        const msg: Message = {
            id: Date.now().toString(),
            sender: 'user',
            text: newItem,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        setMessages([...messages, msg]);
        setNewItem("");
    };

    return (
        <div className="flex flex-col h-[400px] border border-slate-200 rounded-xl bg-white overflow-hidden shadow-sm">
            {/* Header */}
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <HeadphonesIcon className="h-4 w-4 text-teal-600" />
                    <span className="font-semibold text-slate-800 text-sm">Support Chat</span>
                </div>
                <span className="text-xs text-slate-400">Online</span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={cn(
                            "flex gap-3 max-w-[85%]",
                            msg.sender === 'user' ? "ml-auto flex-row-reverse" : ""
                        )}
                    >
                        {/* Avatar */}
                        <div className={cn(
                            "h-8 w-8 rounded-full flex items-center justify-center shrink-0",
                            msg.sender === 'admin' ? "bg-teal-100 text-teal-600" : "bg-blue-100 text-blue-600"
                        )}>
                            {msg.sender === 'admin' ? <HeadphonesIcon className="h-4 w-4" /> : <User className="h-4 w-4" />}
                        </div>

                        {/* Bubble */}
                        <div className={cn(
                            "rounded-2xl p-3 text-sm shadow-sm",
                            msg.sender === 'user'
                                ? "bg-blue-600 text-white rounded-tr-none"
                                : "bg-white border border-slate-200 text-slate-700 rounded-tl-none"
                        )}>
                            <p>{msg.text}</p>
                            {msg.attachment && (
                                <div className="mt-2 text-xs opacity-90 underline">📎 {msg.attachment}</div>
                            )}
                            <div className={cn(
                                "text-[10px] mt-1 text-right opacity-70",
                                msg.sender === 'user' ? "text-blue-100" : "text-slate-400"
                            )}>
                                {msg.timestamp}
                            </div>
                        </div>
                    </div>
                ))}
                <div ref={endRef} />
            </div>

            {/* Input */}
            <div className="p-3 bg-white border-t border-slate-100 flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-teal-600">
                    <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Type your message..."
                    className="flex-1 bg-slate-50 border-slate-200 focus-visible:ring-teal-500"
                />
                <Button onClick={handleSend} size="icon" className="bg-teal-600 hover:bg-teal-700 text-white">
                    <Send className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
}
