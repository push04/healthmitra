"use client";

import { useState, useEffect } from "react";
import { DashboardData } from "@/types/dashboard";
import { fetchDashboardData, markNotificationAsRead as apiMarkRead } from "@/lib/api/client";

interface UseDashboardReturn {
    data: DashboardData | null;
    loading: boolean;
    error: string | null;
    refresh: () => Promise<void>;
    markNotificationAsRead: (id: string) => Promise<void>;
}

export function useDashboard(initialData?: DashboardData): UseDashboardReturn {
    const [data, setData] = useState<DashboardData | null>(initialData || null);
    const [loading, setLoading] = useState<boolean>(!initialData);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        // Only fetch immediately if no initial data
        const fetchData = async (isInitial: boolean) => {
            if (isInitial && !initialData) setLoading(true);
            try {
                const response = await fetchDashboardData();
                if (isMounted && response.success) {
                    setData(response.data);
                    setError(null);
                } else if (isMounted) {
                    setError(response.error || "Failed to fetch data");
                }
            } catch (err) {
                if (isMounted) setError("Network error");
                console.error(err);
            } finally {
                // Only turn off loading if it was an initial fetch that needed loading
                if (isMounted && (isInitial && !initialData)) setLoading(false);
            }
        };

        if (!initialData) {
            fetchData(true);
        }

        const interval = setInterval(() => {
            fetchData(false);
        }, 30000);

        return () => {
            isMounted = false;
            clearInterval(interval);
        };
    }, [initialData]);

    const refresh = async () => {
        setLoading(true);
        const response = await fetchDashboardData();
        if (response.success) {
            setData(response.data);
            setError(null);
        } else {
            setError(response.error || "Failed to fetch data");
        }
        setLoading(false);
    };

    const markNotificationAsRead = async (id: string) => {
        // Optimistic update
        if (data) {
            setData({
                ...data,
                notifications: data.notifications.map((n) =>
                    n.id === id ? { ...n, isRead: true } : n
                ),
            });
        }

        await apiMarkRead(id);
    };

    return { data, loading, error, refresh, markNotificationAsRead };
}
