import { z } from "zod";

export const requestTypeSchema = z.enum([
    "medical_consultation",
    "diagnostic",
    "medicine",
    "ambulance",
    "caretaker",
    "nursing",
    "other"
]);

// Shared fields
const baseRequestSchema = z.object({
    type: requestTypeSchema,
    memberId: z.string().min(1, "Member is required"),
    agreedToTerms: z.boolean().refine(val => val === true, "You must agree to the terms"),
});

// 1. Diagnostic Schema
export const diagnosticSchema = baseRequestSchema.extend({
    type: z.literal("diagnostic"),
    testNames: z.array(z.string()).min(1, "Select at least one test"),
    collectionType: z.enum(["home", "center"]),
    preferredDate: z.string().min(1, "Date is required"),
    preferredTimeSlot: z.string().min(1, "Time slot is required"),
    collectionAddress: z.string().optional(), // Required if home
}).refine((data) => {
    if (data.collectionType === "home" && !data.collectionAddress) {
        return false;
    }
    return true;
}, {
    message: "Address is required for home collection",
    path: ["collectionAddress"]
});

// 2. Medicine Schema
export const medicineSchema = baseRequestSchema.extend({
    type: z.literal("medicine"),
    deliveryType: z.enum(["home", "pickup"]),
    prescriptionFile: z.any().optional(), // In real app, validate File object or URL
    deliveryAddress: z.string().optional(),
    pincode: z.string().optional(),
    city: z.string().optional(),
}).refine((data) => {
    if (data.deliveryType === "home") {
        return !!data.deliveryAddress && !!data.pincode && !!data.city;
    }
    return true;
}, {
    message: "Address details are required for home delivery",
    path: ["deliveryAddress"]
});

// 3. Ambulance Schema
export const ambulanceSchema = baseRequestSchema.extend({
    type: z.literal("ambulance"),
    ambulanceType: z.enum(["bls", "als", "patient_transport"]),
    patientName: z.string().min(1, "Patient Name is required"),
    patientAge: z.string().or(z.number()),
    pickupLocation: z.string().min(5, "Pickup location is required"),
    destination: z.string().min(5, "Destination is required"),
    urgency: z.enum(["immediate", "scheduled"]),
    scheduledTime: z.string().optional(),
});

// Union Schema for the main form
export const serviceRequestFormSchema = z.discriminatedUnion("type", [
    diagnosticSchema,
    medicineSchema,
    ambulanceSchema,
    // Add others as needed...
]);

export type ServiceRequestFormValues = z.infer<typeof serviceRequestFormSchema>;
