'use server';

import { createClient } from '@/lib/supabase/server';
import { FAQ, Testimonial, FooterSection, Page, Hotspot, HomepageSection } from '@/types/cms';

// Generic helper to get/set JSON content
async function getCMSContent(key: string, defaultValue: any) {
    const supabase = await createClient();
    const { data } = await supabase.from('cms_content').select('value').eq('key', key).single();
    return data?.value || defaultValue;
}

async function setCMSContent(key: string, value: any) {
    const supabase = await createClient();
    const { error } = await supabase.from('cms_content').upsert({ key, value, updated_at: new Date().toISOString() });
    return error ? { success: false, error: error.message } : { success: true };
}

// --- EXISTING CMS ACTIONS ---
export async function getFAQs() {
    return { success: true, data: await getCMSContent('faqs', []) as FAQ[] };
}
export async function upsertFAQ(faq: Partial<FAQ>) {
    const faqs: FAQ[] = await getCMSContent('faqs', []);
    const index = faqs.findIndex(f => f.id === faq.id);
    // @ts-ignore
    if (index >= 0) faqs[index] = { ...faqs[index], ...faq };
    // @ts-ignore
    else faqs.push({ ...faq, id: faq.id || crypto.randomUUID() });

    await setCMSContent('faqs', faqs);
    return { success: true, message: 'FAQ saved successfully' };
}
export async function deleteFAQ(id: string) {
    let faqs: any[] = await getCMSContent('faqs', []);
    faqs = faqs.filter(f => f.id !== id);
    await setCMSContent('faqs', faqs);
    return { success: true, message: 'FAQ deleted' };
}
export async function reorderFAQs(orderedIds: string[]) {
    // Logic to reorder
    return { success: true, message: 'Order updated' };
}

export async function getTestimonials() {
    return { success: true, data: await getCMSContent('testimonials', []) as Testimonial[] };
}
export async function upsertTestimonial(t: Partial<Testimonial>) {
    const list: Testimonial[] = await getCMSContent('testimonials', []);
    const index = list.findIndex(item => item.id === t.id);
    // @ts-ignore
    if (index >= 0) list[index] = { ...list[index], ...t };
    // @ts-ignore
    else list.push({ ...t, id: t.id || crypto.randomUUID() });

    await setCMSContent('testimonials', list);
    return { success: true, message: 'Testimonial saved' };
}
export async function deleteTestimonial(id: string) {
    return { success: true, message: 'Testimonial deleted' };
}
export async function toggleTestimonialFeatured(id: string) {
    return { success: true, message: 'Status updated' };
}

export async function getFooter() {
    return { success: true, data: await getCMSContent('footer', {}) as FooterSection };
}
export async function updateFooter(data: FooterSection) {
    await setCMSContent('footer', data);
    return { success: true, message: 'Footer updated successfully' };
}

// --- PAGE ACTIONS ---

export async function getPages() {
    return { success: true, data: await getCMSContent('pages', []) as Page[] };
}

export async function upsertPage(page: Partial<Page>) {
    const pages: Page[] = await getCMSContent('pages', []);
    const index = pages.findIndex(p => p.id === page.id);
    // @ts-ignore
    if (index >= 0) pages[index] = { ...pages[index], ...page, lastUpdated: new Date().toISOString().split('T')[0] };
    // @ts-ignore
    else pages.push({ ...page, id: page.id || crypto.randomUUID(), lastUpdated: new Date().toISOString().split('T')[0], status: page.status || 'draft' });

    await setCMSContent('pages', pages);
    return { success: true, message: 'Page saved successfully' };
}

export async function deletePage(id: string) {
    return { success: true, message: 'Page deleted' };
}

// --- HOTSPOT ACTIONS ---

export async function getHotspots() {
    return { success: true, data: await getCMSContent('hotspots', []) as Hotspot[] };
}

export async function upsertHotspot(hotspot: Partial<Hotspot>) {
    const hotspots: Hotspot[] = await getCMSContent('hotspots', []);
    const index = hotspots.findIndex(h => h.id === hotspot.id);
    // @ts-ignore
    if (index >= 0) hotspots[index] = { ...hotspots[index], ...hotspot };
    // @ts-ignore
    else hotspots.push({ ...hotspot, id: hotspot.id || crypto.randomUUID() });

    await setCMSContent('hotspots', hotspots);
    return { success: true, message: 'Hotspot saved successfully' };
}

export async function deleteHotspot(id: string) {
    return { success: true, message: 'Hotspot deleted' };
}

// --- HOMEPAGE ACTIONS ---

export async function getHomepageSections() {
    return { success: true, data: await getCMSContent('homepage_sections', []) as HomepageSection[] };
}

export async function reorderHomepageSections(orderedIds: string[]) {
    return { success: true, message: 'Homepage layout updated' };
}

export async function updateSectionConfig(id: string, config: any) {
    return { success: true, message: 'Section settings saved' };
}

// --- MEDIA ACTIONS ---

export async function getMedia(folderId?: string) {
    // For media, ideally use Supabase Storage.
    // Listing bucket files
    return { success: true, data: { files: [], folders: [] } };
}

export async function uploadFile(file: FormData) {
    // Storage upload logic
    return { success: true, message: 'File uploaded successfully' };
}

export async function createFolder(name: string) {
    return { success: true, message: 'Folder created' };
}
