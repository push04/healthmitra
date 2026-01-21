"use client";

import { useState } from "react";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Ambulance, MapPin, Clock, AlertTriangle, PhoneCall } from "lucide-react";
import { cn } from "@/lib/utils";

interface AmbulanceBookingWizardProps {
    isOpen: boolean;
    onClose: () => void;
}

export function AmbulanceBookingWizard({ isOpen, onClose }: AmbulanceBookingWizardProps) {
    const [step, setStep] = useState(1);
    const [urgency, setUrgency] = useState("immediate");

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-2 bg-red-50 p-3 rounded-lg border border-red-100">
                        <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center text-red-600 animate-pulse">
                            <PhoneCall className="h-5 w-5" />
                        </div>
                        <div>
                            <DialogTitle className="text-red-700">Emergency Ambulance Service</DialogTitle>
                            <p className="text-xs text-red-600 font-medium">For life-threatening emergencies, call 102 / 108 immediately.</p>
                        </div>
                    </div>
                </DialogHeader>

                {/* Progress Bar */}
                <div className="h-1 w-full bg-slate-100 rounded-full mb-6 overflow-hidden">
                    <div
                        className="h-full bg-red-600 transition-all duration-300"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                {/* STEP 1: TYPE & PATIENT */}
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <Label>Ambulance Type *</Label>
                            <RadioGroup defaultValue="bls" className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="flex flex-col items-center justify-center text-center space-y-2 rounded-xl border-2 border-slate-200 p-4 hover:bg-slate-50 cursor-pointer transition-all [&:has(:checked)]:border-red-500 [&:has(:checked)]:bg-red-50/50">
                                    <RadioGroupItem value="bls" id="bls" className="sr-only" />
                                    <Label htmlFor="bls" className="cursor-pointer w-full h-full flex flex-col items-center">
                                        <Ambulance className="h-8 w-8 text-blue-500 mb-2" />
                                        <span className="font-bold text-slate-900">Basic (BLS)</span>
                                        <span className="text-xs text-slate-500 mt-1">For stable patients</span>
                                    </Label>
                                </div>
                                <div className="flex flex-col items-center justify-center text-center space-y-2 rounded-xl border-2 border-slate-200 p-4 hover:bg-slate-50 cursor-pointer transition-all [&:has(:checked)]:border-red-500 [&:has(:checked)]:bg-red-50/50">
                                    <RadioGroupItem value="als" id="als" className="sr-only" />
                                    <Label htmlFor="als" className="cursor-pointer w-full h-full flex flex-col items-center">
                                        <div className="relative">
                                            <Ambulance className="h-8 w-8 text-red-500 mb-2" />
                                            <span className="absolute -top-1 -right-1 flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span></span>
                                        </div>
                                        <span className="font-bold text-slate-900">Advanced (ALS)</span>
                                        <span className="text-xs text-slate-500 mt-1">ICU on wheels</span>
                                    </Label>
                                </div>
                                <div className="flex flex-col items-center justify-center text-center space-y-2 rounded-xl border-2 border-slate-200 p-4 hover:bg-slate-50 cursor-pointer transition-all [&:has(:checked)]:border-red-500 [&:has(:checked)]:bg-red-50/50">
                                    <RadioGroupItem value="pt" id="pt" className="sr-only" />
                                    <Label htmlFor="pt" className="cursor-pointer w-full h-full flex flex-col items-center">
                                        <Ambulance className="h-8 w-8 text-green-500 mb-2" />
                                        <span className="font-bold text-slate-900">Transport</span>
                                        <span className="text-xs text-slate-500 mt-1">Non-emergency</span>
                                    </Label>
                                </div>
                            </RadioGroup>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Patient Name *</Label>
                                <Input defaultValue="Rajesh Kumar" />
                            </div>
                            <div className="space-y-2">
                                <Label>Patient Age *</Label>
                                <Input defaultValue="35" type="number" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Medical Condition</Label>
                            <Textarea placeholder="Briefly describe the emergency..." className="min-h-[60px]" />
                        </div>
                    </div>
                )}

                {/* STEP 2: LOCATION */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div className="space-y-4 p-4 border border-slate-200 rounded-xl bg-slate-50">
                            <div className="flex items-center gap-2 mb-2">
                                <MapPin className="h-5 w-5 text-red-500" />
                                <h4 className="font-semibold text-slate-900">Pickup Location</h4>
                            </div>
                            <div className="space-y-2">
                                <Label>Address *</Label>
                                <Textarea placeholder="Enter detailed pickup address..." />
                                <Button variant="outline" size="sm" className="w-full text-blue-600 gap-2">
                                    <MapPin className="h-4 w-4" /> Use Current Location
                                </Button>
                            </div>
                        </div>

                        <div className="space-y-4 p-4 border border-slate-200 rounded-xl bg-white">
                            <div className="flex items-center gap-2 mb-2">
                                <MapPin className="h-5 w-5 text-green-500" />
                                <h4 className="font-semibold text-slate-900">Destination</h4>
                            </div>
                            <div className="space-y-2">
                                <Label>Hospital / Address *</Label>
                                <Input placeholder="Search Hospital or Enter Address" />
                                <div className="flex items-center space-x-2 mt-2">
                                    <Checkbox id="network" />
                                    <Label htmlFor="network" className="font-normal text-xs">Show only Network Hospitals</Label>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Required Time *</Label>
                                <Select value={urgency} onValueChange={setUrgency}>
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="immediate">Immediate (ASAP)</SelectItem>
                                        <SelectItem value="scheduled">Schedule for later</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            {urgency === 'scheduled' && (
                                <div className="space-y-2">
                                    <Label>Time</Label>
                                    <Input type="datetime-local" />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* STEP 3: CONFIRM */}
                {step === 3 && (
                    <div className="space-y-6">
                        <div className="bg-slate-900 text-white p-6 rounded-xl text-center space-y-4">
                            <div className="flex justify-center text-4xl mb-2">🚑</div>
                            <div>
                                <h3 className="text-2xl font-bold">~15 mins</h3>
                                <p className="text-slate-400">Estimated Arrival Time</p>
                            </div>
                            <div className="pt-4 border-t border-slate-700 flex justify-between text-sm">
                                <span>Distance: 12.5 km</span>
                                <span className="font-bold text-emerald-400">₹ 1,200 - ₹ 1,500</span>
                            </div>
                        </div>

                        <div className="flex items-start space-x-2">
                            <Checkbox id="emergency-auth" />
                            <Label htmlFor="emergency-auth" className="text-sm text-slate-700 leading-tight font-medium">
                                I confirm this is a valid request and authorize emergency services. I understand that misuse of emergency services is punishable.
                            </Label>
                        </div>
                    </div>
                )}


                <DialogFooter className="mt-8 flex justify-between items-center w-full sm:justify-between">
                    <Button
                        variant="outline"
                        onClick={step === 1 ? onClose : handleBack}
                        className="w-[100px]"
                    >
                        {step === 1 ? "Cancel" : "Back"}
                    </Button>

                    <Button
                        onClick={step === 3 ? onClose : handleNext}
                        className={cn(
                            "w-[140px] text-white",
                            step === 3 ? "bg-red-600 hover:bg-red-700 animate-pulse" : "bg-slate-900 hover:bg-slate-800"
                        )}
                    >
                        {step === 3 ? "BOOK AMBULANCE" : "Next →"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
