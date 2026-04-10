'use server';

import { createAdminClient } from '@/lib/supabase/server';
import { FAQ, Testimonial, FooterSection, Page, Hotspot, HomepageSection } from '@/types/cms';

async function getCMSContent(key: string, defaultValue: any) {
    const supabase = await createAdminClient();
    try {
        const { data } = await supabase
            .from('cms_content')
            .select('value')
            .eq('key', key)
            .single();
        return data?.value || defaultValue;
    } catch (error) {
        console.error(`Error fetching CMS content for key ${key}:`, error);
        return defaultValue;
    }
}

async function setCMSContent(key: string, value: any) {
    const supabase = await createAdminClient();
    
    try {
        // Check if key exists first
        const { data: existing } = await supabase
            .from('cms_content')
            .select('id, key')
            .eq('key', key)
            .single();
        
        if (existing) {
            // Update existing
            const { error } = await supabase
                .from('cms_content')
                .update({ 
                    value, 
                    updated_at: new Date().toISOString() 
                })
                .eq('key', key);
            if (error) throw error;
        } else {
            // Insert new
            const { error } = await supabase
                .from('cms_content')
                .insert({ 
                    key, 
                    value, 
                    created_at: new Date().toISOString(),
                    updated_at: new Date().toISOString()
                });
            if (error) throw error;
        }
        return { success: true };
    } catch (error: any) {
        console.error(`Error setting CMS content for key ${key}:`, error);
        return { success: false, error: error.message || 'Failed to save CMS content' };
    }
}

// --- FAQ ACTIONS ---
export async function getFAQs() {
    try {
        const data = await getCMSContent('faqs', []);
        return { success: true, data: data as FAQ[] };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function upsertFAQ(faq: Partial<FAQ>) {
    try {
        const faqs: FAQ[] = await getCMSContent('faqs', []);
        const index = faqs.findIndex(f => f.id === faq.id);
        
        if (index >= 0) {
            faqs[index] = { ...faqs[index], ...faq } as FAQ;
        } else {
            faqs.push({ 
                ...faq, 
                id: faq.id || crypto.randomUUID(),
                status: faq.status || 'active',
                order: faq.order || faqs.length + 1,
                category: faq.category || 'General'
            } as FAQ);
        }

        const result = await setCMSContent('faqs', faqs);
        if (!result.success) return result;
        return { success: true, message: 'FAQ saved successfully' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteFAQ(id: string) {
    try {
        let faqs: any[] = await getCMSContent('faqs', []);
        faqs = faqs.filter(f => f.id !== id);
        const result = await setCMSContent('faqs', faqs);
        if (!result.success) return result;
        return { success: true, message: 'FAQ deleted' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function reorderFAQs(orderedIds: string[]) {
    try {
        const faqs: any[] = await getCMSContent('faqs', []);
        const reordered = orderedIds.map((id, index) => {
            const faq = faqs.find(f => f.id === id);
            if (faq) {
                return { ...faq, order: index + 1 };
            }
            return null;
        }).filter(Boolean);
        
        const remaining = faqs.filter(f => !orderedIds.includes(f.id));
        const allFaqs = [...reordered, ...remaining];
        
        const result = await setCMSContent('faqs', allFaqs);
        if (!result.success) return result;
        return { success: true, message: 'FAQ order updated' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- TESTIMONIAL ACTIONS ---
export async function getTestimonials() {
    try {
        const data = await getCMSContent('testimonials', []);
        return { success: true, data: data as Testimonial[] };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function upsertTestimonial(t: Partial<Testimonial>) {
    try {
        const list: Testimonial[] = await getCMSContent('testimonials', []);
        const index = list.findIndex(item => item.id === t.id);
        
        if (index >= 0) {
            list[index] = { ...list[index], ...t } as Testimonial;
        } else {
            list.push({ 
                ...t, 
                id: t.id || crypto.randomUUID(),
                isFeatured: t.isFeatured || false,
                status: t.status || 'active'
            } as Testimonial);
        }

        const result = await setCMSContent('testimonials', list);
        if (!result.success) return result;
        return { success: true, message: 'Testimonial saved' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteTestimonial(id: string) {
    try {
        let list: any[] = await getCMSContent('testimonials', []);
        list = list.filter(t => t.id !== id);
        const result = await setCMSContent('testimonials', list);
        if (!result.success) return result;
        return { success: true, message: 'Testimonial deleted' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function toggleTestimonialFeatured(id: string) {
    try {
        const list: any[] = await getCMSContent('testimonials', []);
        const index = list.findIndex(t => t.id === id);
        
        if (index >= 0) {
            list[index] = { ...list[index], isFeatured: !list[index].isFeatured };
            const result = await setCMSContent('testimonials', list);
            if (!result.success) return result;
            return { success: true, message: 'Featured status updated' };
        }
        return { success: false, error: 'Testimonial not found' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- FOOTER ACTIONS ---
export async function getFooter() {
    try {
        const data = await getCMSContent('footer', {
            companyName: 'HealthMitra',
            tagline: 'Your Health Partner',
            description: '',
            columns: [],
            socialLinks: {},
            copyright: '',
            contact: {}
        });
        return { success: true, data: data as FooterSection };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateFooter(data: FooterSection) {
    const result = await setCMSContent('footer', data);
    if (!result.success) return result;
    return { success: true, message: 'Footer updated successfully' };
}

// --- PAGE ACTIONS ---
export async function getPages() {
    try {
        const data = await getCMSContent('pages', []);
        return { success: true, data: data as Page[] };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function upsertPage(page: Partial<Page>) {
    try {
        const pages: Page[] = await getCMSContent('pages', []);
        const index = pages.findIndex(p => p.id === page.id);
        
        if (index >= 0) {
            pages[index] = { 
                ...pages[index], 
                ...page, 
                lastUpdated: new Date().toISOString().split('T')[0] 
            } as Page;
        } else {
            pages.push({ 
                ...page, 
                id: page.id || crypto.randomUUID(), 
                lastUpdated: new Date().toISOString().split('T')[0], 
                status: page.status || 'draft',
                slug: page.slug || page.title?.toLowerCase().replace(/\s+/g, '-') || ''
            } as Page);
        }

        const result = await setCMSContent('pages', pages);
        if (!result.success) return result;
        return { success: true, message: 'Page saved successfully' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deletePage(id: string) {
    try {
        let pages: any[] = await getCMSContent('pages', []);
        pages = pages.filter(p => p.id !== id);
        const result = await setCMSContent('pages', pages);
        if (!result.success) return result;
        return { success: true, message: 'Page deleted' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- HOTSPOT ACTIONS ---
export async function getHotspots() {
    try {
        const data = await getCMSContent('hotspots', []);
        return { success: true, data: data as Hotspot[] };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function upsertHotspot(hotspot: Partial<Hotspot>) {
    try {
        const hotspots: Hotspot[] = await getCMSContent('hotspots', []);
        const index = hotspots.findIndex(h => h.id === hotspot.id);
        
        if (index >= 0) {
            hotspots[index] = { ...hotspots[index], ...hotspot } as Hotspot;
        } else {
            hotspots.push({ 
                ...hotspot, 
                id: hotspot.id || crypto.randomUUID(),
                status: hotspot.status || 'active'
            } as Hotspot);
        }

        const result = await setCMSContent('hotspots', hotspots);
        if (!result.success) return result;
        return { success: true, message: 'Hotspot saved successfully' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function deleteHotspot(id: string) {
    try {
        let hotspots: any[] = await getCMSContent('hotspots', []);
        hotspots = hotspots.filter(h => h.id !== id);
        const result = await setCMSContent('hotspots', hotspots);
        if (!result.success) return result;
        return { success: true, message: 'Hotspot deleted' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- HOMEPAGE ACTIONS ---
export async function getHomepageSections() {
    try {
        const data = await getCMSContent('homepage_sections', []);
        return { success: true, data: data as HomepageSection[] };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function reorderHomepageSections(orderedIds: string[]) {
    try {
        const sections: any[] = await getCMSContent('homepage_sections', []);
        const reordered = orderedIds.map((id, index) => {
            const section = sections.find(s => s.id === id);
            if (section) {
                return { ...section, order: index + 1 };
            }
            return null;
        }).filter(Boolean);
        
        const remaining = sections.filter(s => !orderedIds.includes(s.id));
        const allSections = [...reordered, ...remaining];
        
        const result = await setCMSContent('homepage_sections', allSections);
        if (!result.success) return result;
        return { success: true, message: 'Homepage layout updated' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

export async function updateSectionConfig(id: string, config: any) {
    try {
        const sections: any[] = await getCMSContent('homepage_sections', []);
        const index = sections.findIndex(s => s.id === id);
        
        if (index >= 0) {
            sections[index] = { 
                ...sections[index], 
                config: { ...sections[index].config, ...config } 
            };
            const result = await setCMSContent('homepage_sections', sections);
            if (!result.success) return result;
            return { success: true, message: 'Section settings saved' };
        }
        return { success: false, error: 'Section not found' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}

// --- MEDIA ACTIONS ---
export async function getMedia(folderId?: string) {
    const supabase = await createAdminClient();
    try {
        const { data, error } = await supabase.storage.from('media').list(folderId || '');
        if (error) throw error;
        return { success: true, data: { files: data || [], folders: [] } };
    } catch (error: any) {
        console.error('Media fetch error:', error);
        return { success: true, data: { files: [], folders: [] } };
    }
}

export async function uploadFile(file: FormData) {
    const supabase = await createAdminClient();
    try {
        const fileData = file.get('file') as File;
        const bucket = file.get('bucket') as string || 'media';
        const path = file.get('path') as string || '';
        
        if (!fileData) {
            return { success: false, error: 'No file provided' };
        }

        const fileName = `${path}/${Date.now()}_${fileData.name}`;
        const { error } = await supabase.storage.from(bucket).upload(fileName, fileData);
        
        if (error) throw error;
        
        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
        
        return { success: true, message: 'File uploaded successfully', data: { url: urlData.publicUrl } };
    } catch (error: any) {
        console.error('Upload error:', error);
        return { success: false, error: error.message || 'Upload failed' };
    }
}

export async function createFolder(name: string) {
    return { success: true, message: 'Folder created' };
}

// --- INITIALIZE CMS TABLES (Run once to create tables) ---
export async function initializeCMSTables() {
    const supabase = await createAdminClient();
    
    try {
        // Check if table exists
        const { error } = await supabase
            .from('cms_content')
            .select('id')
            .limit(1);
        
        if (error && error.message.includes('does not exist')) {
            // Need to create table via direct SQL - this would need Supabase dashboard
            return { 
                success: false, 
                error: 'CMS content table does not exist. Please create it in Supabase dashboard.' 
            };
        }
        
        return { success: true, message: 'CMS tables already exist' };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
