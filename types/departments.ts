export interface Designation {
    id: string;
    name: string;
}

export interface Department {
    id: string;
    name: string;
    head?: string; // Employee Name or ID
    description?: string;
    employeeCount: number;
    status: 'active' | 'inactive';
    designations: Designation[];
}
