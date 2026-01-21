import { Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PlaceholderPage({ title }: { title: string }) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4 animate-in fade-in-50">
            <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                <Construction className="h-10 w-10" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            <p className="text-slate-500 max-w-md">
                This feature is currently under development and will be available soon.
            </p>
            <Link href="/dashboard">
                <Button variant="outline">Back to Dashboard</Button>
            </Link>
        </div>
    );
}
