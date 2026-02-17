'use client';

import RazorpaySettingsForm from "@/components/admin/settings/RazorpaySettingsForm";
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator, BreadcrumbPage } from "@/components/ui/breadcrumb";

export default function PaymentGatewaysPage() {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-2">
                <Breadcrumb>
                    <BreadcrumbList>
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/admin/dashboard">Dashboard</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbLink href="/admin/settings">Settings</BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator />
                        <BreadcrumbItem>
                            <BreadcrumbPage>Payment Gateways</BreadcrumbPage>
                        </BreadcrumbItem>
                    </BreadcrumbList>
                </Breadcrumb>
                <h1 className="text-3xl font-bold tracking-tight text-slate-900">Payment Gateways</h1>
                <p className="text-slate-500">Manage payment providers and API credentials.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <RazorpaySettingsForm />

                    {/* Placeholder for future gateways */}
                    {/* <StripeSettingsForm /> */}
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <h3 className="font-semibold text-slate-900 mb-2">Security Note</h3>
                        <p className="text-sm text-slate-600 mb-4">
                            API Keys are encrypted before storage. We use industry-standard encryption for your Secret Keys.
                        </p>
                        <ul className="text-sm text-slate-600 space-y-2 list-disc pl-4">
                            <li>Keys are masked in the UI</li>
                            <li>Only Admins can update keys</li>
                            <li>Do not share these keys publicly</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
