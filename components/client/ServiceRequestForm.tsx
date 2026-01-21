"use client";

import { useState } from "react";
import { useForm, UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { serviceRequestFormSchema, ServiceRequestFormValues } from "@/lib/validations/service-request";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useCreateServiceRequest } from "@/hooks/useServiceRequests";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2 } from "lucide-react";

interface ServiceRequestFormProps {
    initialType?: string;
    userProfile?: any;
}

export function ServiceRequestForm({ initialType, userProfile }: ServiceRequestFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const createRequest = useCreateServiceRequest();

    // Default values dependent on type
    const typeFromUrl = searchParams.get("type");
    const defaultType = (initialType as any) || typeFromUrl || "medical_consultation";
    const defaultMember = userProfile ? userProfile.full_name : "";

    const form = useForm<ServiceRequestFormValues>({
        resolver: zodResolver(serviceRequestFormSchema),
        defaultValues: {
            type: defaultType,
            memberId: defaultMember, // Using name as ID for simplicity if backend expects string, else use userProfile.id
            agreedToTerms: false,
            // Add defaults for other unions as needed to avoid uncontrolled errors
            ...(defaultType === 'ambulance' ? { urgency: 'immediate', ambulanceType: 'bls' } : {}),
            ...(defaultType === 'medicine' ? { deliveryType: 'home' } : {}),
            ...(defaultType === 'diagnostic' ? { collectionType: 'home', testNames: [] } : {}),
        },
    });

    const watchType = form.watch("type");

    async function onSubmit(data: ServiceRequestFormValues) {
        try {
            const result = await createRequest.mutateAsync(data);
            if (result.success) {
                toast.success("Service request submitted successfully!");
                router.push(`/service-requests/${result.id}`);
            }
        } catch (error) {
            toast.error("Failed to submit request.");
            console.error(error);
        }
    }

    // Dynamic Form Sections based on 'watchType'
    return (
        <div className="max-w-2xl mx-auto py-6">
            <Button variant="ghost" onClick={() => router.push('/service-requests')} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h1 className="text-xl font-bold mb-6 capitalize">{watchType.replace("_", " ")} Request</h1>

                {/* We map the RHF context manually since shadcn Form is a wrapper */}
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                    {/* Common Field: Member Selection */}
                    <div className="space-y-2">
                        <Label>Select Member</Label>
                        <Select onValueChange={(val) => form.setValue("memberId", val)} defaultValue={form.getValues("memberId")}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Member" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={userProfile?.full_name || "Myself"}>{userProfile?.full_name || "Myself"} (Self)</SelectItem>
                                {/* Future: Map dependents here */}
                            </SelectContent>
                        </Select>
                        {form.formState.errors.memberId && <p className="text-sm text-red-500">{form.formState.errors.memberId.message}</p>}
                    </div>

                    {/* --- TYPE SPECIFIC FIELDS --- */}

                    {/* DIAGNOSTIC */}
                    {watchType === "diagnostic" && (
                        <>
                            {/* Mock Test Selection for simplicity in this unified form */}
                            <div className="space-y-2">
                                <Label>Select Tests</Label>
                                <div className="border border-slate-200 rounded-md p-3 space-y-2">
                                    {['CBC', 'Lipid Profile', 'Thyroid'].map(test => (
                                        <div key={test} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={test}
                                                onCheckedChange={(checked) => {
                                                    const current = form.getValues("testNames") as string[] || [];
                                                    if (checked) form.setValue("testNames", [...current, test] as any);
                                                    else form.setValue("testNames", current.filter(t => t !== test) as any);
                                                }}
                                            />
                                            <label htmlFor={test}>{test}</label>
                                        </div>
                                    ))}
                                </div>
                                {watchType === 'diagnostic' && (form.formState.errors as any).testNames && (
                                    <p className="text-sm text-red-500">{(form.formState.errors as any).testNames.message}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label>Collection Type</Label>
                                <RadioGroup onValueChange={(val) => form.setValue("collectionType", val as any)} defaultValue="home">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="home" id="d-home" />
                                        <Label htmlFor="d-home">Home Collection</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="center" id="d-center" />
                                        <Label htmlFor="d-center">Visit Center</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Date</Label>
                                    <Input type="date" {...form.register("preferredDate" as any)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Time Slot</Label>
                                    <Select onValueChange={(val) => form.setValue("preferredTimeSlot" as any, val)}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="morning">Morning</SelectItem>
                                            <SelectItem value="afternoon">Afternoon</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {form.watch("collectionType" as any) === 'home' && (
                                <div className="space-y-2">
                                    <Label>Collection Address</Label>
                                    <Textarea {...form.register("collectionAddress" as any)} placeholder="Enter address..." />
                                </div>
                            )}
                        </>
                    )}

                    {/* AMBULANCE */}
                    {watchType === "ambulance" && (
                        <>
                            <div className="space-y-2">
                                <Label>Ambulance Type</Label>
                                <RadioGroup onValueChange={(val) => form.setValue("ambulanceType" as any, val)} defaultValue="bls">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="bls" id="bls" />
                                        <Label htmlFor="bls">Basic (BLS)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="als" id="als" />
                                        <Label htmlFor="als">Advanced (ALS)</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Patient Name</Label>
                                    <Input {...form.register("patientName" as any)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Age</Label>
                                    <Input type="number" {...form.register("patientAge" as any)} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Pickup Location</Label>
                                <Textarea {...form.register("pickupLocation" as any)} />
                            </div>
                            <div className="space-y-2">
                                <Label>Destination</Label>
                                <Input {...form.register("destination" as any)} />
                            </div>
                        </>
                    )}


                    {/* Terms */}
                    <div className="flex items-start space-x-2 pt-4 border-t">
                        <Checkbox
                            id="terms"
                            checked={form.watch("agreedToTerms")}
                            onCheckedChange={(c) => form.setValue("agreedToTerms", c as boolean)}
                        />
                        <Label htmlFor="terms" className="text-sm text-slate-500 leading-none">
                            I agree to the terms and conditions.
                        </Label>
                    </div>
                    {form.formState.errors.agreedToTerms && <p className="text-sm text-red-500">{form.formState.errors.agreedToTerms.message}</p>}


                    <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={createRequest.isPending}>
                        {createRequest.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Request
                    </Button>
                </form>
            </div>
        </div>
    );
}

// Helper to wrap generic form components if needed, but for now we used raw HTML/Shadcn mix for speed + union type complexity handling
