import { LucideIcon } from 'lucide-react';

export type PlanStatus = 'active' | 'inactive' | 'draft';
export type PlanType = 'B2C' | 'B2B';
export type ValidityType = 'year' | 'month';

export interface PlanService {
    id: string;
    name: string;
    categoryId: string;
    description: string;
    limit_description?: string;
    duration_description?: string;
    status: 'enabled' | 'disabled';
    displayOrder: number;
}

export interface PlanCategory {
    id: string;
    name: string;
    description?: string;
    icon?: string; // URL or icon name
    status: 'active' | 'inactive';
    displayOrder: number;
}

export interface Plan {
    id: string; // e.g., PLAN-2024-001
    name: string;
    type: PlanType;
    description: string;
    basePrice: number;
    gstPercent: number;
    totalPrice: number;
    imageUrl?: string;
    status: PlanStatus;

    // Validity
    validityType: ValidityType;
    validityValue: number; // e.g. 1 if type is year

    // Members
    memberCountMin: number;
    memberCountMax: number;

    // Categories (linked)
    categoryIds: string[];

    // Services
    services: PlanService[];

    // SEO & Visibility
    slug?: string;
    showOnWebsite: boolean;
    isFeatured: boolean;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];

    createdAt: string;
    updatedAt: string;
}

// --- MOCK CATEGORIES ---
export const MOCK_CATEGORIES: PlanCategory[] = [
    {
        id: 'cat_1',
        name: 'General Health',
        description: 'Basic health checkups and consultations',
        status: 'active',
        displayOrder: 1,
    },
    {
        id: 'cat_2',
        name: 'Dental Care',
        description: 'Dental procedures and preventive care',
        status: 'active',
        displayOrder: 2,
    },
    {
        id: 'cat_3',
        name: 'Nursing Services',
        description: 'Home nursing and elderly care',
        status: 'active',
        displayOrder: 3,
    },
    {
        id: 'cat_4',
        name: 'Emergency Services',
        description: 'Ambulance and urgent care',
        status: 'active',
        displayOrder: 4,
    },
    {
        id: 'cat_5',
        name: 'Physiotherapy',
        description: 'Physical therapy sessions',
        status: 'inactive',
        displayOrder: 5,
    },
];

// --- MOCK PLANS ---
export const MOCK_PLANS: Plan[] = [
    {
        id: 'PLAN-2024-001',
        name: 'Gold Health Plan',
        type: 'B2C',
        description: 'Comprehensive health coverage for the whole family.',
        basePrice: 10593.22, // roughly to make 12500 with 18% GST
        gstPercent: 18,
        totalPrice: 12500,
        status: 'active',
        validityType: 'year',
        validityValue: 1,
        memberCountMin: 1,
        memberCountMax: 4,
        categoryIds: ['cat_1', 'cat_2'],
        showOnWebsite: true,
        isFeatured: true,
        slug: 'gold-health-plan',
        services: [
            {
                id: 'srv_1',
                name: 'Free Dental Checkup',
                categoryId: 'cat_2',
                description: 'Annual dental checkup included',
                limit_description: '1 per year',
                duration_description: '30 minutes',
                status: 'enabled',
                displayOrder: 1
            },
            {
                id: 'srv_2',
                name: 'General Physician Consult',
                categoryId: 'cat_1',
                description: 'Online consultation',
                limit_description: 'Unlimited',
                status: 'enabled',
                displayOrder: 2
            }
        ],
        createdAt: '2025-01-15T14:30:00Z',
        updatedAt: '2025-01-20T10:00:00Z',
    },
    {
        id: 'PLAN-2024-002',
        name: 'Corporate Wellness',
        type: 'B2B',
        description: 'Exclusive plan for corporate employees.',
        basePrice: 20000,
        gstPercent: 18,
        totalPrice: 23600,
        status: 'active',
        validityType: 'year',
        validityValue: 1,
        memberCountMin: 10,
        memberCountMax: 50,
        categoryIds: ['cat_1'],
        showOnWebsite: false,
        isFeatured: false,
        slug: 'corporate-wellness-2024',
        services: [],
        createdAt: '2025-01-10T09:00:00Z',
        updatedAt: '2025-01-10T09:00:00Z',
    },
    {
        id: 'PLAN-2024-003',
        name: 'Senior Citizen Care',
        type: 'B2C',
        description: 'Specialized care for seniors.',
        basePrice: 8000,
        gstPercent: 18,
        totalPrice: 9440,
        status: 'draft',
        validityType: 'month',
        validityValue: 6,
        memberCountMin: 1,
        memberCountMax: 2,
        categoryIds: ['cat_3'],
        showOnWebsite: false,
        isFeatured: false,
        services: [],
        createdAt: '2025-02-01T12:00:00Z',
        updatedAt: '2025-02-01T12:00:00Z',
    }
];
