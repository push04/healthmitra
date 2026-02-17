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
