export type FAQCategory = 'General' | 'Plans & Coverage' | 'E-Cards' | 'Reimbursements' | 'Wallet & Payments';

// --- EXISTING ---
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

// --- NEW MODULES FOR PHASE 4 ---

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

// --- DATA ---

export const MOCK_FAQS: FAQ[] = [
    {
        id: 'faq_1',
        question: 'How do I download my E-Card?',
        answer: '<p>To download your E-Card, log in to your dashboard...</p>',
        category: 'E-Cards',
        order: 1,
        status: 'active'
    },
    {
        id: 'faq_2',
        question: 'How long does reimbursement take?',
        answer: '<p>Reimbursement claims are typically processed within 7-10 working days.</p>',
        category: 'Reimbursements',
        order: 2,
        status: 'active'
    }
];

export const MOCK_TESTIMONIALS: Testimonial[] = [
    {
        id: 't_1',
        customerName: 'Rajesh Kumar',
        rating: 5,
        text: 'Excellent service! The claim process was smooth.',
        location: 'Ahmedabad, Gujarat',
        date: '2023-10-15',
        isFeatured: true,
        isVerified: true,
        status: 'active'
    }
];

export const MOCK_FOOTER: FooterSection = {
    companyName: 'HealthMitra',
    aboutText: 'HealthMitra is your trusted partner for comprehensive healthcare solutions.',
    address: '101, Health Hub, Science City Road, Ahmedabad',
    phone: '+91 98765 43210',
    email: 'support@healthmitra.com',
    workingHours: 'Mon - Sat: 9:00 AM - 6:00 PM',
    socialLinks: { facebook: 'https://fb.com', instagram: 'https://ig.com' },
    quickLinks: [
        { id: 'l_1', text: 'Plans', url: '/plans', openInNewTab: false },
        { id: 'l_2', text: 'About Us', url: '/about-us', openInNewTab: false }
    ],
    legalLinks: {
        privacyPolicy: '/privacy-policy',
        termsConditions: '/terms',
        refundPolicy: '/refund-policy'
    },
    newsletter: {
        title: 'Subscribe to our Newsletter',
        description: 'Get the latest health tips and insurance updates.',
        enabled: true
    }
};

export const MOCK_PAGES: Page[] = [
    {
        id: 'page_about',
        title: 'About Us',
        slug: 'about-us',
        content: '<h1>About HealthMitra</h1><p>We are dedicated to...</p>',
        seo: { metaTitle: 'About Us - HealthMitra', metaDescription: 'Learn more about HealthMitra...', keywords: ['health', 'insurance'] },
        status: 'published',
        lastUpdated: '2024-01-15'
    },
    {
        id: 'page_contact',
        title: 'Contact Us',
        slug: 'contact',
        content: '<h1>Contact Us</h1><p>Reach out to us...</p>',
        seo: { metaTitle: 'Contact Us', metaDescription: 'Contact us...', keywords: [] },
        status: 'published',
        lastUpdated: '2024-01-20'
    }
];

export const MOCK_HOTSPOTS: Hotspot[] = [
    {
        id: 'hs_1',
        title: 'New Year Offer',
        message: 'Get 20% OFF on all plans. Limited time!',
        type: 'info',
        position: 'top-banner',
        link: { url: '/plans', buttonText: 'View Plans' },
        validity: { start: '2025-01-01', end: '2025-01-31', alwaysActive: false },
        priority: 1,
        status: 'active'
    }
];

export const MOCK_SECTIONS: HomepageSection[] = [
    { id: 'sec_hero', name: 'Hero Banner', key: 'hero', isActive: true, order: 1, config: { heading: 'Your Health, Our Priority' } },
    { id: 'sec_plans', name: 'Featured Plans', key: 'plans', isActive: true, order: 2, config: {} },
    { id: 'sec_works', name: 'How It Works', key: 'works', isActive: true, order: 3, config: {} },
    { id: 'sec_testimonials', name: 'Testimonials', key: 'testimonials', isActive: true, order: 4, config: {} },
    { id: 'sec_faq', name: 'FAQ Section', key: 'faq', isActive: true, order: 5, config: {} }
];

export const MOCK_MEDIA_FOLDERS: MediaFolder[] = [
    { id: 'f_plans', name: 'Plans', itemCount: 45 },
    { id: 'f_test', name: 'Testimonials', itemCount: 28 },
    { id: 'f_pages', name: 'Pages', itemCount: 67 }
];

export const MOCK_MEDIA: MediaItem[] = [
    { id: 'm_1', name: 'hero-banner.jpg', url: '/images/hero.jpg', type: 'image', folder: 'f_pages', size: '1.2 MB', uploadedAt: '2024-01-10' },
    { id: 'm_2', name: 'plan-gold.png', url: '/images/gold.png', type: 'image', folder: 'f_plans', size: '500 KB', uploadedAt: '2024-01-12' }
];
