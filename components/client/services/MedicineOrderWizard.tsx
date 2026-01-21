"use client";

import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
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
import { Pill, Upload, X, FileText, CheckCircle, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface MedicineOrderWizardProps {
    isOpen: boolean;
    onClose: () => void;
}

export function MedicineOrderWizard({ isOpen, onClose }: MedicineOrderWizardProps) {
    const [step, setStep] = useState(1);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const [deliveryType, setDeliveryType] = useState("home");

    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            setUploadedFile(acceptedFiles[0]);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': ['.jpeg', '.jpg', '.png'],
            'application/pdf': ['.pdf']
        },
        maxSize: 5242880, // 5MB
        multiple: false
    });

    const handleNext = () => setStep(step + 1);
    const handleBack = () => setStep(step - 1);
    const resetAndClose = () => {
        setStep(1);
        setUploadedFile(null);
        onClose();
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between mb-2">
                        <DialogTitle>Medicine Order Request</DialogTitle>
                        <span className="text-sm font-medium text-slate-500 bg-slate-100 px-3 py-1 rounded-full">Step {step} of 3</span>
                    </div>
                </DialogHeader>

                {/* Progress Bar */}
                <div className="h-1 w-full bg-slate-100 rounded-full mb-6 overflow-hidden">
                    <div
                        className="h-full bg-emerald-600 transition-all duration-300"
                        style={{ width: `${(step / 3) * 100}%` }}
                    />
                </div>

                {/* STEP 1: UPLOAD & MEMBER */}
                {step === 1 && (
                    <div className="space-y-6">
                        <div className="space-y-2">
                            <Label>Select Member *</Label>
                            <Select defaultValue="self">
                                <SelectTrigger>
                                    <SelectValue placeholder="Select Member" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="self">Rajesh Kumar (Self)</SelectItem>
                                    <SelectItem value="spouse">Priya Kumar (Spouse)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-3">
                            <Label>Upload Prescription *</Label>
                            {!uploadedFile ? (
                                <div
                                    {...getRootProps()}
                                    className={cn(
                                        "border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer transition-colors hover:border-emerald-500 hover:bg-emerald-50/50",
                                        isDragActive && "border-emerald-500 bg-emerald-50"
                                    )}
                                >
                                    <input {...getInputProps()} />
                                    <div className="flex flex-col items-center gap-3">
                                        <div className="h-12 w-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                            <Upload className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-700">Click to upload or drag & drop</p>
                                            <p className="text-xs text-slate-500 mt-1">PDF, JPG, PNG (Max 5MB)</p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between p-4 border border-slate-200 rounded-xl bg-slate-50">
                                    <div className="flex items-center gap-3">
                                        <FileText className="h-8 w-8 text-slate-400" />
                                        <div>
                                            <p className="font-medium text-slate-900 truncate max-w-[200px]">{uploadedFile.name}</p>
                                            <p className="text-xs text-slate-500">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }} className="text-red-500 hover:text-red-700 hover:bg-red-50">
                                        <X className="h-4 w-4 mr-1" /> Remove
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* STEP 2: DELIVERY DETAILS */}
                {step === 2 && (
                    <div className="space-y-6">
                        <div className="space-y-3">
                            <Label>Delivery Type *</Label>
                            <RadioGroup value={deliveryType} onValueChange={setDeliveryType} className="grid grid-cols-2 gap-4">
                                <div className="flex items-center space-x-2 rounded-lg border border-slate-200 p-4 [&:has(:checked)]:border-emerald-500 [&:has(:checked)]:bg-emerald-50">
                                    <RadioGroupItem value="home" id="home-del" />
                                    <Label htmlFor="home-del" className="cursor-pointer font-medium">Home Delivery</Label>
                                </div>
                                <div className="flex items-center space-x-2 rounded-lg border border-slate-200 p-4 [&:has(:checked)]:border-emerald-500 [&:has(:checked)]:bg-emerald-50">
                                    <RadioGroupItem value="pickup" id="pickup" />
                                    <Label htmlFor="pickup" className="cursor-pointer font-medium">Pickup from Pharmacy</Label>
                                </div>
                            </RadioGroup>
                        </div>

                        {deliveryType === 'home' && (
                            <div className="space-y-4 animate-in fade-in-50">
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <Label>Delivery Address *</Label>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox id="reg-addr-med" />
                                            <Label htmlFor="reg-addr-med" className="text-xs font-normal">Use registered address</Label>
                                        </div>
                                    </div>
                                    <Textarea placeholder="Enter full address..." className="min-h-[80px]" />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Pincode *</Label>
                                        <Input placeholder="Enter Pincode" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label>City *</Label>
                                        <Input placeholder="Enter City" />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="space-y-4 pt-4 border-t border-slate-100">
                            <div className="flex items-start gap-3 p-3 bg-amber-50 rounded-lg text-amber-800 text-sm">
                                <AlertTriangle className="h-5 w-5 shrink-0 mt-0.5" />
                                <p>Our pharmacist will verify the prescription and share the final quotation before processing the order.</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: REVIEW */}
                {step === 3 && (
                    <div className="space-y-6">
                        <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-6 flex flex-col items-center justify-center text-center space-y-3">
                            <div className="h-14 w-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                                <CheckCircle className="h-8 w-8" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-emerald-900">Review Request</h3>
                                <p className="text-sm text-emerald-700">Please confirm your medicine order details.</p>
                            </div>
                        </div>

                        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden text-sm">
                            <div className="p-4 grid grid-cols-2 gap-4 border-b border-slate-100">
                                <div>
                                    <span className="text-slate-500 block">Patient</span>
                                    <span className="font-medium text-slate-900">Rajesh Kumar</span>
                                </div>
                                <div>
                                    <span className="text-slate-500 block">Delivery Type</span>
                                    <span className="font-medium text-slate-900 capitalize">{deliveryType}</span>
                                </div>
                            </div>
                            <div className="p-4 bg-slate-50">
                                <span className="text-slate-500 block mb-2">Attached Prescription</span>
                                <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-emerald-600" />
                                    <span className="font-medium text-slate-700 underline">{uploadedFile?.name || "prescription.jpg"}</span>
                                </div>
                            </div>
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
                        onClick={step === 3 ? resetAndClose : handleNext}
                        className="w-[140px] bg-emerald-600 hover:bg-emerald-700 text-white"
                        disabled={step === 1 && !uploadedFile}
                    >
                        {step === 3 ? "Submit Order" : "Next →"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
