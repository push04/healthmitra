'use client';

import React, { useState } from 'react';
import { Search, Filter, X, Calendar, ChevronDown } from 'lucide-react';

export interface FilterState {
    search: string;
    type: string;
    status: string;
    member: string;
    dateRange: string;
    customStart?: string;
    customEnd?: string;
}

interface ServiceRequestFiltersProps {
    filters: FilterState;
    onFiltersChange: (filters: FilterState) => void;
    onReset: () => void;
}

const TYPE_OPTIONS = [
    { value: 'all', label: 'All Types' },
    { value: 'medical_consultation', label: 'Medical' },
    { value: 'diagnostic', label: 'Diagnostic' },
    { value: 'medicine', label: 'Medicine' },
    { value: 'ambulance', label: 'Ambulance' },
    { value: 'caretaker', label: 'Caretaker' },
    { value: 'doctor', label: 'Doctor' },
    { value: 'nursing', label: 'Nursing' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'general', label: 'General' },
    { value: 'voucher', label: 'Voucher' },
];

const STATUS_OPTIONS = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'under_review', label: 'Under Review' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'cancelled', label: 'Cancelled' },
    { value: 'bill_rejected', label: 'Bill Rejected' },
];

const MEMBER_OPTIONS = [
    { value: 'all', label: 'All Members' },
    { value: 'self', label: 'Self' },
    { value: 'spouse', label: 'Spouse' },
    { value: 'father', label: 'Father' },
    { value: 'mother', label: 'Mother' },
    { value: 'son', label: 'Son' },
    { value: 'daughter', label: 'Daughter' },
];

const DATE_OPTIONS = [
    { value: 'all', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: '7days', label: 'Last 7 Days' },
    { value: '30days', label: 'Last 30 Days' },
    { value: '3months', label: 'Last 3 Months' },
    { value: 'custom', label: 'Custom Range' },
];

export function ServiceRequestFilters({ filters, onFiltersChange, onReset }: ServiceRequestFiltersProps) {
    const [showCustomDate, setShowCustomDate] = useState(filters.dateRange === 'custom');

    const handleChange = (key: keyof FilterState, value: string) => {
        if (key === 'dateRange') {
            setShowCustomDate(value === 'custom');
        }
        onFiltersChange({ ...filters, [key]: value });
    };

    const hasActiveFilters = filters.type !== 'all' || filters.status !== 'all' ||
        filters.member !== 'all' || filters.dateRange !== 'all' || filters.search;

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 mb-6 space-y-4">
            {/* Search Bar */}
            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Search by ID, description, doctor name, hospital..."
                    value={filters.search}
                    onChange={(e) => handleChange('search', e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
            </div>

            {/* Filter Dropdowns */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Type Filter */}
                <div className="relative">
                    <select
                        value={filters.type}
                        onChange={(e) => handleChange('type', e.target.value)}
                        className="w-full appearance-none px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                    >
                        {TYPE_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>

                {/* Status Filter */}
                <div className="relative">
                    <select
                        value={filters.status}
                        onChange={(e) => handleChange('status', e.target.value)}
                        className="w-full appearance-none px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                    >
                        {STATUS_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>

                {/* Member Filter */}
                <div className="relative">
                    <select
                        value={filters.member}
                        onChange={(e) => handleChange('member', e.target.value)}
                        className="w-full appearance-none px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                    >
                        {MEMBER_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>

                {/* Date Filter */}
                <div className="relative">
                    <select
                        value={filters.dateRange}
                        onChange={(e) => handleChange('dateRange', e.target.value)}
                        className="w-full appearance-none px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500 cursor-pointer"
                    >
                        {DATE_OPTIONS.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                </div>
            </div>

            {/* Custom Date Range */}
            {showCustomDate && (
                <div className="flex flex-wrap gap-3 items-center bg-slate-50 p-3 rounded-xl">
                    <span className="text-sm text-slate-600">From:</span>
                    <input
                        type="date"
                        value={filters.customStart || ''}
                        onChange={(e) => handleChange('customStart', e.target.value)}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                    <span className="text-sm text-slate-600">To:</span>
                    <input
                        type="date"
                        value={filters.customEnd || ''}
                        onChange={(e) => handleChange('customEnd', e.target.value)}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-slate-400" />
                    <span className="text-sm text-slate-500">
                        {hasActiveFilters ? 'Filters applied' : 'No filters applied'}
                    </span>
                </div>

                {hasActiveFilters && (
                    <button
                        onClick={onReset}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <X className="h-4 w-4" />
                        Reset Filters
                    </button>
                )}
            </div>
        </div>
    );
}

export default ServiceRequestFilters;
