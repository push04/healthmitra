"use client";

import { Search, ListFilter, ArrowUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function PlanFilters() {
    return (
        <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1 md:max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Search plans by name..."
                    className="pl-10 border-slate-200 focus:ring-teal-500 focus:border-teal-500"
                />
            </div>

            <div className="flex gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2 border-slate-200 text-slate-600">
                            <ListFilter className="h-4 w-4" />
                            Status: All
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>All</DropdownMenuItem>
                        <DropdownMenuItem>Active</DropdownMenuItem>
                        <DropdownMenuItem>Expired</DropdownMenuItem>
                        <DropdownMenuItem>Expiring Soon</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2 border-slate-200 text-slate-600">
                            <ArrowUpDown className="h-4 w-4" />
                            Sort: Recent
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem>Recent First</DropdownMenuItem>
                        <DropdownMenuItem>Oldest First</DropdownMenuItem>
                        <DropdownMenuItem>Name A-Z</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>
    );
}
