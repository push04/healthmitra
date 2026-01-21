"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    fetchServiceRequests,
    fetchServiceRequestById,
    createServiceRequest,
    cancelServiceRequest,
    sendRequestMessage
} from "@/lib/api/service-requests";
import { ServiceRequest } from "@/types/service-request";

// Keys
const KEYS = {
    all: ["service-requests"] as const,
    lists: () => [...KEYS.all, "list"] as const,
    details: () => [...KEYS.all, "detail"] as const,
    detail: (id: string) => [...KEYS.details(), id] as const,
};

// 1. Fetch All Requests
export function useServiceRequests(params?: { type?: string; status?: string }) {
    return useQuery({
        queryKey: [...KEYS.lists(), params],
        queryFn: () => fetchServiceRequests(params),
        staleTime: 60 * 1000,
    });
}

// 2. Fetch Single Request (with Polling)
export function useServiceRequest(id: string) {
    return useQuery({
        queryKey: KEYS.detail(id),
        queryFn: () => fetchServiceRequestById(id),
        enabled: !!id,
        refetchInterval: 10000, // Poll every 10s as requested
    });
}

// 3. Create Request
export function useCreateServiceRequest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createServiceRequest,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: KEYS.lists() });
        },
    });
}

// 4. Cancel Request
export function useCancelServiceRequest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, reason }: { id: string; reason: string }) =>
            cancelServiceRequest(id, reason),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: KEYS.detail(id) });
            queryClient.invalidateQueries({ queryKey: KEYS.lists() });
        },
    });
}

// 5. Send Message
export function useSendMessage() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, message, attachments }: { id: string; message: string; attachments?: string[] }) =>
            sendRequestMessage(id, message, attachments),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: KEYS.detail(id) });
        },
    });
}
