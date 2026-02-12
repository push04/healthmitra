'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Handshake, Eye, EyeOff, Loader2 } from 'lucide-react';
import { partnerLogin } from '@/app/actions/partners';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function PartnerLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        if (!email) { toast.error('Please enter your email'); return; }
        setLoading(true);
        const res = await partnerLogin(email, password);
        if (res.success) {
            toast.success(res.message);
            router.push('/partner/dashboard');
        } else {
            toast.error(res.error);
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-4">
            <Card className="w-full max-w-md bg-white border-slate-200 shadow-lg">
                <CardHeader className="text-center pb-2">
                    <div className="mx-auto h-14 w-14 rounded-2xl bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mb-3">
                        <Handshake className="h-7 w-7 text-white" />
                    </div>
                    <CardTitle className="text-2xl text-slate-900">Partner Portal</CardTitle>
                    <CardDescription className="text-slate-500">Sign in to manage your referrals and commissions.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 pt-2">
                    <div>
                        <Label className="text-slate-600">Email</Label>
                        <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="partner@example.com" className="mt-1 bg-white border-slate-200 text-slate-900" />
                    </div>
                    <div>
                        <Label className="text-slate-600">Password</Label>
                        <div className="relative mt-1">
                            <Input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="bg-white border-slate-200 text-slate-900 pr-10" />
                            <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                        </div>
                    </div>
                    <Button onClick={handleLogin} disabled={loading} className="w-full bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:opacity-90">
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null} Sign In
                    </Button>
                    <p className="text-xs text-center text-slate-400">Demo: rajesh@healthcare.com / any password</p>
                </CardContent>
            </Card>
        </div>
    );
}
