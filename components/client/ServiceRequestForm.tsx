"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Loader2, Upload } from "lucide-react";

// Simplified schema for all service types
const formSchema = z.object({
    type: z.string(),
    memberId: z.string().min(1, "Please select a member"),
    description: z.string().optional(),
    agreedToTerms: z.boolean().refine(val => val === true, "You must agree to terms"),
    // Type-specific fields (optional based on type)
    testNames: z.array(z.string()).optional(),
    collectionType: z.string().optional(),
    preferredDate: z.string().optional(),
    preferredTimeSlot: z.string().optional(),
    collectionAddress: z.string().optional(),
    // Medicine
    prescriptionFile: z.any().optional(),
    deliveryType: z.string().optional(),
    deliveryAddress: z.string().optional(),
    // Ambulance
    ambulanceType: z.string().optional(),
    patientName: z.string().optional(),
    patientAge: z.string().optional(),
    pickupLocation: z.string().optional(),
    destination: z.string().optional(),
    urgency: z.string().optional(),
    // Doctor
    specialization: z.string().optional(),
    symptoms: z.string().optional(),
    consultationType: z.string().optional(),
    // Nursing/Caretaker
    serviceType: z.string().optional(),
    duration: z.string().optional(),
    // Voucher
    voucherCode: z.string().optional(),
    voucherRedeemFor: z.string().optional(),
    // General/Emergency
    subject: z.string().optional(),
    priority: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface ServiceRequestFormProps {
    initialType?: string;
    userProfile?: any;
}

const MOCK_VOUCHERS = [
    { code: "HEALTH500", value: 500, description: "₹500 off on medicines" },
    { code: "TEST200", value: 200, description: "₹200 off on diagnostic tests" },
    { code: "CONSULT100", value: 100, description: "₹100 off on consultations" },
];

export function ServiceRequestForm({ initialType, userProfile }: ServiceRequestFormProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [prescriptionPreview, setPrescriptionPreview] = useState<string | null>(null);

    const typeFromUrl = searchParams.get("type");
    const defaultType = initialType || typeFromUrl || "medical_consultation";

    const form = useForm<FormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            type: defaultType,
            memberId: userProfile?.full_name || "Myself",
            agreedToTerms: false,
            deliveryType: "home",
            collectionType: "home",
            ambulanceType: "bls",
            urgency: "scheduled",
            consultationType: "video",
            priority: "normal",
        },
    });

    const watchType = form.watch("type");

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            form.setValue("prescriptionFile", file);
            const reader = new FileReader();
            reader.onloadend = () => setPrescriptionPreview(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    async function onSubmit(data: FormValues) {
        setIsSubmitting(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        setIsSubmitting(false);
        toast.success("Service request submitted successfully!", {
            description: "You will be notified once our team reviews it."
        });
        router.push("/service-requests");
    }

    const getTitle = () => {
        const titles: Record<string, string> = {
            diagnostic: "Book Diagnostic Test",
            medicine: "Order Medicines",
            ambulance: "Ambulance Booking",
            medical_consultation: "Doctor Appointment",
            caretaker: "Caretaker Services",
            nursing: "Nursing Procedures",
            voucher: "Redeem Voucher",
            general: "General Request",
            emergency: "Emergency Service",
        };
        return titles[watchType] || "Service Request";
    };

    return (
        <div className="max-w-2xl mx-auto py-6">
            <Button variant="ghost" onClick={() => router.push('/service-requests')} className="mb-4">
                <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>

            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                <h1 className="text-xl font-bold mb-6">{getTitle()}</h1>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                    {/* Common Field: Member Selection */}
                    <div className="space-y-2">
                        <Label>Select Member</Label>
                        <Select onValueChange={(val) => form.setValue("memberId", val)} defaultValue={form.getValues("memberId")}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select Member" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Myself">Myself (Self)</SelectItem>
                                <SelectItem value="Spouse">Spouse</SelectItem>
                                <SelectItem value="Child">Child</SelectItem>
                                <SelectItem value="Parent">Parent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* ===== DIAGNOSTIC ===== */}
                    {watchType === "diagnostic" && (
                        <>
                            <div className="space-y-2">
                                <Label>Select Tests</Label>
                                <div className="border border-slate-200 rounded-md p-3 space-y-2">
                                    {['CBC - Complete Blood Count', 'Lipid Profile', 'Thyroid Panel', 'HbA1c', 'Liver Function Test', 'Kidney Function Test'].map(test => (
                                        <div key={test} className="flex items-center space-x-2">
                                            <Checkbox
                                                id={test}
                                                onCheckedChange={(checked) => {
                                                    const current = form.getValues("testNames") || [];
                                                    if (checked) form.setValue("testNames", [...current, test]);
                                                    else form.setValue("testNames", current.filter(t => t !== test));
                                                }}
                                            />
                                            <label htmlFor={test} className="text-sm">{test}</label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Collection Type</Label>
                                <RadioGroup onValueChange={(val) => form.setValue("collectionType", val)} defaultValue="home">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="home" id="d-home" />
                                        <Label htmlFor="d-home">Home Collection</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="center" id="d-center" />
                                        <Label htmlFor="d-center">Visit Diagnostic Center</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Preferred Date</Label>
                                    <Input type="date" {...form.register("preferredDate")} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Time Slot</Label>
                                    <Select onValueChange={(val) => form.setValue("preferredTimeSlot", val)}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="7am-9am">7:00 AM - 9:00 AM</SelectItem>
                                            <SelectItem value="9am-11am">9:00 AM - 11:00 AM</SelectItem>
                                            <SelectItem value="11am-1pm">11:00 AM - 1:00 PM</SelectItem>
                                            <SelectItem value="2pm-4pm">2:00 PM - 4:00 PM</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {form.watch("collectionType") === 'home' && (
                                <div className="space-y-2">
                                    <Label>Collection Address</Label>
                                    <Textarea {...form.register("collectionAddress")} placeholder="Enter complete address..." />
                                </div>
                            )}
                        </>
                    )}

                    {/* ===== MEDICINE ===== */}
                    {watchType === "medicine" && (
                        <>
                            <div className="space-y-2">
                                <Label>Upload Prescription</Label>
                                <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-teal-500 transition-colors">
                                    <input
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={handleFileChange}
                                        className="hidden"
                                        id="prescription"
                                    />
                                    <label htmlFor="prescription" className="cursor-pointer">
                                        <Upload className="mx-auto h-10 w-10 text-slate-400 mb-2" />
                                        <p className="text-sm text-slate-600">Click to upload prescription</p>
                                        <p className="text-xs text-slate-400 mt-1">JPG, PNG, PDF up to 5MB</p>
                                    </label>
                                    {prescriptionPreview && (
                                        <img src={prescriptionPreview} alt="Preview" className="mt-4 mx-auto max-h-32 rounded" />
                                    )}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Delivery Type</Label>
                                <RadioGroup onValueChange={(val) => form.setValue("deliveryType", val)} defaultValue="home">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="home" id="m-home" />
                                        <Label htmlFor="m-home">Home Delivery</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="pickup" id="m-pickup" />
                                        <Label htmlFor="m-pickup">Pickup from Store</Label>
                                    </div>
                                </RadioGroup>
                            </div>

                            {form.watch("deliveryType") === 'home' && (
                                <div className="space-y-2">
                                    <Label>Delivery Address</Label>
                                    <Textarea {...form.register("deliveryAddress")} placeholder="Enter delivery address..." />
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label>Additional Notes</Label>
                                <Textarea {...form.register("description")} placeholder="Any special instructions..." />
                            </div>
                        </>
                    )}

                    {/* ===== AMBULANCE ===== */}
                    {watchType === "ambulance" && (
                        <>
                            <div className="space-y-2">
                                <Label>Urgency</Label>
                                <RadioGroup onValueChange={(val) => form.setValue("urgency", val)} defaultValue="scheduled">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="immediate" id="urgent" />
                                        <Label htmlFor="urgent" className="text-red-600 font-semibold">🚨 Immediate (Emergency)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="scheduled" id="scheduled" />
                                        <Label htmlFor="scheduled">Scheduled Transfer</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            <div className="space-y-2">
                                <Label>Ambulance Type</Label>
                                <RadioGroup onValueChange={(val) => form.setValue("ambulanceType", val)} defaultValue="bls">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="bls" id="bls" />
                                        <Label htmlFor="bls">Basic Life Support (BLS)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="als" id="als" />
                                        <Label htmlFor="als">Advanced Life Support (ALS)</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="icu" id="icu" />
                                        <Label htmlFor="icu">ICU on Wheels</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Patient Name</Label>
                                    <Input {...form.register("patientName")} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Age</Label>
                                    <Input type="number" {...form.register("patientAge")} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Pickup Location</Label>
                                <Textarea {...form.register("pickupLocation")} placeholder="Complete pickup address..." />
                            </div>
                            <div className="space-y-2">
                                <Label>Destination Hospital / Address</Label>
                                <Input {...form.register("destination")} placeholder="Hospital name or address..." />
                            </div>
                        </>
                    )}

                    {/* ===== DOCTOR CONSULTATION ===== */}
                    {watchType === "medical_consultation" && (
                        <>
                            <div className="space-y-2">
                                <Label>Consultation Type</Label>
                                <RadioGroup onValueChange={(val) => form.setValue("consultationType", val)} defaultValue="video">
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="video" id="video" />
                                        <Label htmlFor="video">Video Consultation</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="clinic" id="clinic" />
                                        <Label htmlFor="clinic">Clinic Visit</Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <RadioGroupItem value="home" id="home-visit" />
                                        <Label htmlFor="home-visit">Home Visit</Label>
                                    </div>
                                </RadioGroup>
                            </div>
                            <div className="space-y-2">
                                <Label>Specialization</Label>
                                <Select onValueChange={(val) => form.setValue("specialization", val)}>
                                    <SelectTrigger><SelectValue placeholder="Select Specialist" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="general">General Physician</SelectItem>
                                        <SelectItem value="cardio">Cardiologist</SelectItem>
                                        <SelectItem value="ortho">Orthopedic</SelectItem>
                                        <SelectItem value="derm">Dermatologist</SelectItem>
                                        <SelectItem value="neuro">Neurologist</SelectItem>
                                        <SelectItem value="gastro">Gastroenterologist</SelectItem>
                                        <SelectItem value="ent">ENT Specialist</SelectItem>
                                        <SelectItem value="pediatric">Pediatrician</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Preferred Date</Label>
                                    <Input type="date" {...form.register("preferredDate")} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Time Slot</Label>
                                    <Select onValueChange={(val) => form.setValue("preferredTimeSlot", val)}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="morning">Morning (9 AM - 12 PM)</SelectItem>
                                            <SelectItem value="afternoon">Afternoon (12 PM - 4 PM)</SelectItem>
                                            <SelectItem value="evening">Evening (4 PM - 8 PM)</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Describe Symptoms</Label>
                                <Textarea {...form.register("symptoms")} placeholder="Brief description of symptoms..." />
                            </div>
                        </>
                    )}

                    {/* ===== CARETAKER ===== */}
                    {watchType === "caretaker" && (
                        <>
                            <div className="space-y-2">
                                <Label>Service Type</Label>
                                <Select onValueChange={(val) => form.setValue("serviceType", val)}>
                                    <SelectTrigger><SelectValue placeholder="Select Service" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="elderly">Elderly Care</SelectItem>
                                        <SelectItem value="postop">Post-operative Care</SelectItem>
                                        <SelectItem value="chronic">Chronic Illness Care</SelectItem>
                                        <SelectItem value="disabled">Disability Support</SelectItem>
                                        <SelectItem value="newborn">Newborn Care</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Duration Required</Label>
                                <Select onValueChange={(val) => form.setValue("duration", val)}>
                                    <SelectTrigger><SelectValue placeholder="Select Duration" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="8hrs">8 Hours (Day Shift)</SelectItem>
                                        <SelectItem value="12hrs">12 Hours</SelectItem>
                                        <SelectItem value="24hrs">24 Hours (Live-in)</SelectItem>
                                        <SelectItem value="weekly">Weekly Visit</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Start Date</Label>
                                    <Input type="date" {...form.register("preferredDate")} />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Special Requirements</Label>
                                <Textarea {...form.register("description")} placeholder="Any special care requirements..." />
                            </div>
                        </>
                    )}

                    {/* ===== NURSING ===== */}
                    {watchType === "nursing" && (
                        <>
                            <div className="space-y-2">
                                <Label>Procedure Required</Label>
                                <Select onValueChange={(val) => form.setValue("serviceType", val)}>
                                    <SelectTrigger><SelectValue placeholder="Select Procedure" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="injection">Injection (IM/IV)</SelectItem>
                                        <SelectItem value="dressing">Wound Dressing</SelectItem>
                                        <SelectItem value="catheter">Catheter Care</SelectItem>
                                        <SelectItem value="bp">BP / Vitals Monitoring</SelectItem>
                                        <SelectItem value="physio">Physiotherapy Session</SelectItem>
                                        <SelectItem value="nebulizer">Nebulizer Administration</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Preferred Date</Label>
                                    <Input type="date" {...form.register("preferredDate")} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Time Slot</Label>
                                    <Select onValueChange={(val) => form.setValue("preferredTimeSlot", val)}>
                                        <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="morning">Morning</SelectItem>
                                            <SelectItem value="afternoon">Afternoon</SelectItem>
                                            <SelectItem value="evening">Evening</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Address</Label>
                                <Textarea {...form.register("collectionAddress")} placeholder="Service address..." />
                            </div>
                            <div className="space-y-2">
                                <Label>Additional Notes</Label>
                                <Textarea {...form.register("description")} placeholder="Any special instructions..." />
                            </div>
                        </>
                    )}

                    {/* ===== VOUCHER REDEMPTION ===== */}
                    {watchType === "voucher" && (
                        <>
                            <div className="space-y-2">
                                <Label>Available Vouchers</Label>
                                <div className="space-y-2">
                                    {MOCK_VOUCHERS.map(v => (
                                        <div
                                            key={v.code}
                                            className={`p-4 border rounded-lg cursor-pointer transition-all ${form.watch("voucherCode") === v.code
                                                    ? 'border-purple-500 bg-purple-50'
                                                    : 'border-slate-200 hover:border-purple-300'
                                                }`}
                                            onClick={() => form.setValue("voucherCode", v.code)}
                                        >
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-bold text-purple-700">{v.code}</p>
                                                    <p className="text-sm text-slate-600">{v.description}</p>
                                                </div>
                                                <span className="text-lg font-bold text-purple-600">₹{v.value}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Redeem For</Label>
                                <Select onValueChange={(val) => form.setValue("voucherRedeemFor", val)}>
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="medicine">Medicine Purchase</SelectItem>
                                        <SelectItem value="test">Diagnostic Test</SelectItem>
                                        <SelectItem value="consultation">Doctor Consultation</SelectItem>
                                        <SelectItem value="wallet">Add to Wallet</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </>
                    )}

                    {/* ===== GENERAL REQUEST ===== */}
                    {watchType === "general" && (
                        <>
                            <div className="space-y-2">
                                <Label>Subject</Label>
                                <Input {...form.register("subject")} placeholder="Brief subject of your request..." />
                            </div>
                            <div className="space-y-2">
                                <Label>Describe Your Request</Label>
                                <Textarea {...form.register("description")} placeholder="Please provide details..." rows={5} />
                            </div>
                        </>
                    )}

                    {/* ===== EMERGENCY SERVICE ===== */}
                    {watchType === "emergency" && (
                        <>
                            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                <p className="text-red-700 font-semibold">🚨 Emergency Support</p>
                                <p className="text-sm text-red-600 mt-1">For life-threatening emergencies, call 108 or 112 immediately.</p>
                            </div>
                            <div className="space-y-2">
                                <Label>Emergency Type</Label>
                                <Select onValueChange={(val) => form.setValue("serviceType", val)}>
                                    <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="cardiac">Cardiac Emergency</SelectItem>
                                        <SelectItem value="accident">Accident / Trauma</SelectItem>
                                        <SelectItem value="breathing">Breathing Difficulty</SelectItem>
                                        <SelectItem value="stroke">Stroke Symptoms</SelectItem>
                                        <SelectItem value="other">Other Emergency</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label>Current Location</Label>
                                <Textarea {...form.register("pickupLocation")} placeholder="Exact address for emergency response..." />
                            </div>
                            <div className="space-y-2">
                                <Label>Brief Description</Label>
                                <Textarea {...form.register("description")} placeholder="Describe the emergency situation..." />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Contact Number</Label>
                                    <Input placeholder="Emergency contact..." />
                                </div>
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
                            I agree to the terms and conditions and authorize HealthMitra to process this request.
                        </Label>
                    </div>
                    {form.formState.errors.agreedToTerms && <p className="text-sm text-red-500">{form.formState.errors.agreedToTerms.message}</p>}

                    <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={isSubmitting}>
                        {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Submit Request
                    </Button>
                </form>
            </div>
        </div>
    );
}
