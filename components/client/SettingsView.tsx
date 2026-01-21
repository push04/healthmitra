'use client';

import React from 'react';
import { User, Bell, Lock, LogOut, Moon, Globe, Shield } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SettingsView() {
    const router = useRouter();

    const handleSignOut = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/login');
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-10">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
                <p className="text-slate-500 text-sm">Manage your account preferences and application settings</p>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
                <Link href="/profile" className="block">
                    <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
                        <div className="flex items-center gap-4">
                            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                <User size={20} />
                            </div>
                            <div>
                                <p className="font-medium text-slate-700">Account Settings</p>
                                <p className="text-xs text-slate-500">Profile, Email, Phone</p>
                            </div>
                        </div>
                    </div>
                </Link>

                <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-amber-50 text-amber-600 rounded-lg">
                            <Bell size={20} />
                        </div>
                        <div>
                            <p className="font-medium text-slate-700">Notifications</p>
                            <p className="text-xs text-slate-500">Email, Push, SMS</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
                            <Lock size={20} />
                        </div>
                        <div>
                            <p className="font-medium text-slate-700">Privacy & Security</p>
                            <p className="text-xs text-slate-500">Password, 2FA</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                            <Globe size={20} />
                        </div>
                        <div>
                            <p className="font-medium text-slate-700">Language</p>
                            <p className="text-xs text-slate-500">English (India)</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
                <button onClick={handleSignOut} className="w-full p-4 flex items-center gap-4 hover:bg-red-50 transition-colors text-left group">
                    <div className="p-2 bg-red-50 text-red-600 rounded-lg group-hover:bg-red-100">
                        <LogOut size={20} />
                    </div>
                    <div>
                        <p className="font-medium text-red-600">Sign Out</p>
                        <p className="text-xs text-red-400">Log out of your account</p>
                    </div>
                </button>
            </div>
        </div>
    );
}
