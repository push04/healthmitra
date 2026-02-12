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

export interface PlanDetail {
    id: string;
    question: string;
    answer: string;
}

export interface PlanCategory {
    id: string;
    name: string;
    description?: string;
    icon?: string;
    status: 'active' | 'inactive';
    displayOrder: number;
}

export interface Plan {
    id: string;
    name: string;
    type: PlanType;
    description: string;
    basePrice: number;
    gstPercent: number;
    totalPrice: number;
    status: PlanStatus;

    // Media
    planImage?: string;
    brochurePdf?: string;

    // Validity
    validityType: ValidityType;
    validityValue: number;
    extraValidity?: number; // additional months

    // Members
    memberCountMin: number;
    memberCountMax: number;

    // Categories (linked)
    categoryIds: string[];

    // Services
    services: PlanService[];

    // Plan Details (Q&A / FAQ per plan)
    planDetails?: PlanDetail[];

    // SEO & Visibility
    slug?: string;
    showOnWebsite: boolean;
    isFeatured: boolean;
    metaTitle?: string;
    metaDescription?: string;
    metaKeywords?: string[];

    imageUrl?: string;
    createdAt: string;
    updatedAt: string;
}

// --- MOCK CATEGORIES ---
export const MOCK_CATEGORIES: PlanCategory[] = [
    {
        id: 'cat_1',
        name: 'Elder Care',
        description: 'Comprehensive elderly care and support services',
        icon: 'heart-handshake',
        status: 'active',
        displayOrder: 1,
    },
    {
        id: 'cat_2',
        name: 'Nursing',
        description: 'Professional nursing and home healthcare',
        icon: 'stethoscope',
        status: 'active',
        displayOrder: 2,
    },
    {
        id: 'cat_3',
        name: 'General Health',
        description: 'Basic health checkups and consultations',
        icon: 'activity',
        status: 'active',
        displayOrder: 3,
    },
    {
        id: 'cat_4',
        name: 'Emergency Services',
        description: 'Ambulance and urgent care',
        icon: 'ambulance',
        status: 'active',
        displayOrder: 4,
    },
    {
        id: 'cat_5',
        name: 'Physiotherapy',
        description: 'Physical therapy and rehabilitation sessions',
        icon: 'dumbbell',
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
        basePrice: 10593.22,
        gstPercent: 18,
        totalPrice: 12500,
        status: 'active',
        planImage: '/plans/gold-plan.jpg',
        brochurePdf: '/plans/gold-plan-brochure.pdf',
        validityType: 'year',
        validityValue: 1,
        extraValidity: 3,
        memberCountMin: 1,
        memberCountMax: 4,
        categoryIds: ['cat_1', 'cat_3'],
        showOnWebsite: true,
        isFeatured: true,
        slug: 'gold-health-plan',
        services: [
            {
                id: 'srv_1',
                name: 'Elder Care Checkup',
                categoryId: 'cat_1',
                description: 'Quarterly home visit for elderly members',
                limit_description: '4 per year',
                duration_description: '60 minutes',
                status: 'enabled',
                displayOrder: 1
            },
            {
                id: 'srv_2',
                name: 'General Physician Consult',
                categoryId: 'cat_3',
                description: 'Online consultation',
                limit_description: 'Unlimited',
                status: 'enabled',
                displayOrder: 2
            }
        ],
        planDetails: [
            {
                id: 'pd_1',
                question: 'What does this plan cover?',
                answer: 'The Gold Health Plan includes elder care checkups, general physician consultations, and basic diagnostic tests for up to 4 family members.'
            },
            {
                id: 'pd_2',
                question: 'Is there a waiting period?',
                answer: 'No waiting period. Coverage begins immediately upon activation.'
            },
            {
                id: 'pd_3',
                question: 'Can I upgrade my plan later?',
                answer: 'Yes, you can upgrade to a higher plan at any time. The price difference will be adjusted.'
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
        planImage: '/plans/corporate-plan.jpg',
        validityType: 'year',
        validityValue: 1,
        memberCountMin: 10,
        memberCountMax: 50,
        categoryIds: ['cat_3'],
        showOnWebsite: false,
        isFeatured: false,
        slug: 'corporate-wellness-2024',
        services: [],
        planDetails: [
            {
                id: 'pd_4',
                question: 'How many employees can be enrolled?',
                answer: 'Between 10 and 50 employees per corporate plan. For larger groups, contact our sales team.'
            }
        ],
        createdAt: '2025-01-10T09:00:00Z',
        updatedAt: '2025-01-10T09:00:00Z',
    },
    {
        id: 'PLAN-2024-003',
        name: 'Senior Citizen Care',
        type: 'B2C',
        description: 'Specialized care for seniors with nursing and elder care services.',
        basePrice: 8000,
        gstPercent: 18,
        totalPrice: 9440,
        status: 'draft',
        planImage: '/plans/senior-plan.jpg',
        brochurePdf: '/plans/senior-brochure.pdf',
        validityType: 'month',
        validityValue: 6,
        extraValidity: 1,
        memberCountMin: 1,
        memberCountMax: 2,
        categoryIds: ['cat_1', 'cat_2'],
        showOnWebsite: false,
        isFeatured: false,
        services: [
            {
                id: 'srv_3',
                name: 'Home Nursing Visit',
                categoryId: 'cat_2',
                description: 'Weekly nursing visit at home',
                limit_description: '4 per month',
                duration_description: '90 minutes',
                status: 'enabled',
                displayOrder: 1
            }
        ],
        planDetails: [
            {
                id: 'pd_5',
                question: 'What nursing services are included?',
                answer: 'Weekly home visits by a qualified nurse, vitals monitoring, medication management, and post-surgery care assistance.'
            },
            {
                id: 'pd_6',
                question: 'Is this plan available for caretakers?',
                answer: 'Yes, the plan covers both the senior citizen and one designated caretaker member.'
            }
        ],
        createdAt: '2025-02-01T12:00:00Z',
        updatedAt: '2025-02-01T12:00:00Z',
    }
];
