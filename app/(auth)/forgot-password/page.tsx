import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
    return (
        <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden text-center p-8">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Reset Password</h1>
            <p className="text-slate-500 dark:text-slate-400 mb-8">Enter your email to receive a reset link</p>

            <form className="space-y-4 text-left">
                <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" placeholder="you@example.com" className="mt-1" />
                </div>
                <Button className="w-full bg-cyan-600 hover:bg-cyan-700 text-white">Send Reset Link</Button>
            </form>

            <div className="mt-6">
                <Link href="/login" className="text-sm text-cyan-600 hover:underline">
                    Back to Login
                </Link>
            </div>
        </div>
    );
}
