"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPurchases, addPlanMember, updatePlanMember } from "@/lib/api/purchases";
import { CreateMemberData } from "@/types/purchase";

const KEYS = {
    all: ["purchases"] as const,
    list: (params?: any) => [...KEYS.all, "list", params] as const,
};

export function usePurchases(params?: { status?: string; search?: string; sort?: string }) {
    return useQuery({
        queryKey: KEYS.list(params),
        queryFn: () => fetchPurchases(params),
    });
}

export function useAddMember() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: CreateMemberData) => addPlanMember(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: KEYS.all });
        },
    });
}
