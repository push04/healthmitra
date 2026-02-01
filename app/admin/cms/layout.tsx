'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, MessageSquare, Quote, LayoutTemplate, Image, FileText, Zap, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const CMS_NAV = [
    { name: 'FAQ Management', href: '/admin/cms/faq', icon: MessageSquare },
    { name: 'Testimonials', href: '/admin/cms/testimonials', icon: Quote },
    { name: 'Footer Content', href: '/admin/cms/footer', icon: LayoutTemplate },
    { name: 'Page Management', href: '/admin/cms/pages', icon: FileText },
    { name: 'Hotspots & Banners', href: '/admin/cms/hotspots', icon: Zap },
    { name: 'Homepage Sections', href: '/admin/cms/homepage', icon: Home },
    { name: 'Media Library', href: '/admin/cms/media', icon: Image },
];

export default function CMSLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    return (
        <div className="flex flex-col lg:flex-row gap-6 p-6 min-h-screen bg-slate-50/50">
            <aside className="lg:w-64 flex-shrink-0">
                <div className="bg-white border border-slate-200 rounded-xl p-4 sticky top-6 shadow-sm">
                    <div className="mb-4 px-2">
                        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                            <LayoutDashboard className="h-5 w-5 text-teal-600" />
                            CMS Control
                        </h2>
                        <p className="text-xs text-slate-500 mt-1">Manage website content</p>
                    </div>
                    <nav className="space-y-1">
                        {CMS_NAV.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname.startsWith(item.href);
                            return (
                                <Link key={item.href} href={item.href}>
                                    <Button
                                        variant="ghost"
                                        className={cn(
                                            "w-full justify-start gap-3 mb-1",
                                            isActive
                                                ? "bg-teal-50 text-teal-700 hover:bg-teal-100 hover:text-teal-800"
                                                : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                        )}
                                    >
                                        <Icon className="h-4 w-4" />
                                        {item.name}
                                    </Button>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </aside>
            <main className="flex-1 bg-white rounded-xl border border-slate-200 p-6 min-h-[600px] shadow-sm">
                {children}
            </main>
        </div>
    );
}
