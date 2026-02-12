'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Loader2, LogIn, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { franchiseLogin } from '@/app/actions/franchise';
import { useRouter } from 'next/navigation';

export default function FranchiseLoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const res = await franchiseLogin(email, password);
        if (res.success) {
            toast.success(res.message);
            router.push('/franchise/dashboard');
        } else {
            toast.error(res.error || 'Login failed');
        }
        setLoading(false);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-cyan-50/20 flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-white border-slate-200 shadow-xl">
                <CardHeader className="text-center pb-2 space-y-3">
                    <div className="mx-auto h-14 w-14 bg-gradient-to-br from-teal-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-200/50">
                        <Building2 className="h-7 w-7 text-white" />
                    </div>
                    <div>
                        <CardTitle className="text-2xl font-bold text-slate-900">Franchise Portal</CardTitle>
                        <p className="text-sm text-slate-500 mt-1">Sign in to manage your franchise operations</p>
                    </div>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-slate-600">Email Address</Label>
                            <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="franchise@healthmitra.com" className="bg-white border-slate-200 text-slate-900" required />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-slate-600">Password</Label>
                            <div className="relative">
                                <Input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter password" className="bg-white border-slate-200 text-slate-900 pr-10" required />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <Button type="submit" disabled={loading} className="w-full bg-teal-600 hover:bg-teal-700 text-white mt-2">
                            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LogIn className="h-4 w-4 mr-2" />} Sign In
                        </Button>
                    </form>
                    <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                        <p className="text-xs text-slate-500 font-medium mb-1">Demo Credentials:</p>
                        <p className="text-xs text-slate-400">Email: delhi@healthmitra.com</p>
                        <p className="text-xs text-slate-400">Password: franchise123</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
