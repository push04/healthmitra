export type FAQCategory = 'General' | 'Plans & Coverage' | 'E-Cards' | 'Reimbursements' | 'Wallet & Payments';

export interface FAQ {
    id: string;
    question: string;
    answer: string; // HTML/Rich text
    category: FAQCategory;
    order: number;
    status: 'active' | 'inactive';
}

export interface Testimonial {
    id: string;
    customerName: string;
    customerPhoto?: string;
    rating: number; // 1-5
    text: string;
    location: string;
    date: string;
    isFeatured: boolean;
    isVerified: boolean;
    status: 'active' | 'inactive';
}

export interface FooterLink {
    id: string;
    text: string;
    url: string;
    openInNewTab: boolean;
}

export interface FooterSection {
    companyName: string;
    aboutText: string;
    logoUrl?: string;
    address: string;
    phone: string;
    email: string;
    workingHours: string;
    socialLinks: {
        facebook?: string;
        twitter?: string;
        instagram?: string;
        linkedin?: string;
        youtube?: string;
    };
    quickLinks: FooterLink[];
    legalLinks: {
        privacyPolicy?: string;
        termsConditions?: string;
        refundPolicy?: string; // New in Phase 4
    };
    newsletter: {
        title: string;
        description: string;
        enabled: boolean;
    };
}

export type PageStatus = 'published' | 'draft';

export interface Page {
    id: string;
    title: string;
    slug: string;
    content: string; // HTML
    seo: {
        metaTitle: string;
        metaDescription: string;
        keywords: string[];
    };
    featuredImage?: string;
    status: PageStatus;
    lastUpdated: string;
}

export type HotspotType = 'info' | 'success' | 'warning' | 'error';
export type HotspotPosition = 'top-banner' | 'homepage-only' | 'popup' | 'bottom-notification';

export interface Hotspot {
    id: string;
    title: string;
    message: string;
    type: HotspotType;
    position: HotspotPosition;
    link?: {
        url: string;
        buttonText: string;
    };
    validity: {
        start: string;
        end?: string;
        alwaysActive: boolean;
    };
    priority: number;
    status: 'active' | 'inactive';
}

export interface HomepageSection {
    id: string;
    name: string; // "Hero Banner", "Featured Plans"
    key: string; // "hero", "plans"
    isActive: boolean;
    order: number;
    config: Record<string, any>; // Flexible config
}

export type MediaType = 'image' | 'video' | 'document';

export interface MediaItem {
    id: string;
    name: string;
    url: string;
    type: MediaType;
    folder: string; // 'root' or folder id
    size: string; // "2.5 MB"
    uploadedAt: string;
}

export interface MediaFolder {
    id: string;
    name: string;
    itemCount: number;
}
