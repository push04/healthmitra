'use server';

import {
    MOCK_FAQS, MOCK_TESTIMONIALS, MOCK_FOOTER, MOCK_PAGES, MOCK_HOTSPOTS, MOCK_SECTIONS, MOCK_MEDIA, MOCK_MEDIA_FOLDERS,
    FAQ, Testimonial, FooterSection, Page, Hotspot, HomepageSection, MediaItem
} from '@/app/lib/mock/cms-data';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- EXISTING CMS ACTIONS ---
export async function getFAQs() { await delay(400); return { success: true, data: MOCK_FAQS.sort((a, b) => a.order - b.order) }; }
export async function upsertFAQ(faq: Partial<FAQ>) { await delay(500); return { success: true, message: 'FAQ saved successfully' }; }
export async function deleteFAQ(id: string) { await delay(300); return { success: true, message: 'FAQ deleted' }; }
export async function reorderFAQs(orderedIds: string[]) { await delay(400); return { success: true, message: 'Order updated' }; }
export async function getTestimonials() { await delay(500); return { success: true, data: MOCK_TESTIMONIALS }; }
export async function upsertTestimonial(t: Partial<Testimonial>) { await delay(600); return { success: true, message: 'Testimonial saved' }; }
export async function deleteTestimonial(id: string) { await delay(300); return { success: true, message: 'Testimonial deleted' }; }
export async function toggleTestimonialFeatured(id: string) { await delay(300); return { success: true, message: 'Status updated' }; }
export async function getFooter() { await delay(300); return { success: true, data: MOCK_FOOTER }; }
export async function updateFooter(data: FooterSection) { await delay(800); return { success: true, message: 'Footer updated successfully' }; }

// --- PAGE ACTIONS ---

export async function getPages() {
    await delay(500);
    return { success: true, data: MOCK_PAGES };
}

export async function upsertPage(page: Partial<Page>) {
    await delay(1000);
    console.log("Upserting Page:", page);
    return { success: true, message: 'Page saved successfully' };
}

export async function deletePage(id: string) {
    await delay(500);
    return { success: true, message: 'Page deleted' };
}

// --- HOTSPOT ACTIONS ---

export async function getHotspots() {
    await delay(400);
    return { success: true, data: MOCK_HOTSPOTS };
}

export async function upsertHotspot(hotspot: Partial<Hotspot>) {
    await delay(800);
    console.log("Upserting Hotspot:", hotspot);
    return { success: true, message: 'Hotspot saved successfully' };
}

export async function deleteHotspot(id: string) {
    await delay(300);
    return { success: true, message: 'Hotspot deleted' };
}

// --- HOMEPAGE ACTIONS ---

export async function getHomepageSections() {
    await delay(300);
    return { success: true, data: MOCK_SECTIONS.sort((a, b) => a.order - b.order) };
}

export async function reorderHomepageSections(orderedIds: string[]) {
    await delay(600);
    console.log("Reordering Sections:", orderedIds);
    return { success: true, message: 'Homepage layout updated' };
}

export async function updateSectionConfig(id: string, config: any) {
    await delay(500);
    console.log("Updating Section Config:", id, config);
    return { success: true, message: 'Section settings saved' };
}

// --- MEDIA ACTIONS ---

export async function getMedia(folderId?: string) {
    await delay(400);
    const files = folderId && folderId !== 'root' ? MOCK_MEDIA.filter(m => m.folder === folderId) : MOCK_MEDIA.filter(m => m.folder === 'root');
    return { success: true, data: { files, folders: MOCK_MEDIA_FOLDERS } };
}

export async function uploadFile(file: FormData) {
    await delay(1500);
    return { success: true, message: 'File uploaded successfully' };
}

export async function createFolder(name: string) {
    await delay(500);
    return { success: true, message: 'Folder created' };
}
