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

export const MOCK_DEPARTMENTS: Department[] = [
    {
        id: 'dept_sales',
        name: 'Sales',
        head: 'Rajesh Kumar',
        description: 'Responsible for acquiring new customers and partners.',
        employeeCount: 45,
        status: 'active',
        designations: [
            { id: 'des_sales_mgr', name: 'Sales Manager' },
            { id: 'des_sales_exec', name: 'Sales Executive' },
            { id: 'des_sales_tl', name: 'Team Leader' }
        ]
    },
    {
        id: 'dept_support',
        name: 'Customer Support',
        head: 'Priya Sharma',
        description: 'Handling customer queries and service requests.',
        employeeCount: 25,
        status: 'active',
        designations: [
            { id: 'des_supp_mgr', name: 'Support Manager' },
            { id: 'des_supp_assoc', name: 'Support Associate' }
        ]
    },
    {
        id: 'dept_accounts',
        name: 'Accounts',
        head: 'Vikram Singh',
        description: 'Managing finances, salaries, and reimbursements.',
        employeeCount: 15,
        status: 'active',
        designations: [
            { id: 'des_acct_mgr', name: 'Accounts Manager' },
            { id: 'des_acct_exec', name: 'Accountant' }
        ]
    },
    {
        id: 'dept_ops',
        name: 'Operations',
        head: 'Amit Verma',
        description: 'Overseeing service fulfillment and logistics.',
        employeeCount: 20,
        status: 'active',
        designations: [
            { id: 'des_ops_head', name: 'Operations Head' },
            { id: 'des_ops_exec', name: 'Executive' }
        ]
    }
];
