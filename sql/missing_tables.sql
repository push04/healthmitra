-- HealthMitra Database Schema - Missing Tables
-- Run this in Supabase Dashboard > SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. FAQS Table
CREATE TABLE IF NOT EXISTS faqs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT DEFAULT 'general',
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TESTIMONIALS Table
CREATE TABLE IF NOT EXISTS testimonials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    designation TEXT,
    company TEXT,
    content TEXT NOT NULL,
    rating INTEGER DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    avatar_url TEXT,
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PAGES Table (CMS Pages)
CREATE TABLE IF NOT EXISTS pages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    meta_title TEXT,
    meta_description TEXT,
    content TEXT,
    template TEXT DEFAULT 'default',
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. HOMEPAGE SECTIONS Table
CREATE TABLE IF NOT EXISTS homepage_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    section_key TEXT UNIQUE NOT NULL,
    title TEXT,
    subtitle TEXT,
    content TEXT,
    settings JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. MEDIA FOLDERS Table
CREATE TABLE IF NOT EXISTS media_folders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    parent_id UUID REFERENCES media_folders(id),
    path TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MEDIA Table
CREATE TABLE IF NOT EXISTS media (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    folder_id UUID REFERENCES media_folders(id),
    filename TEXT NOT NULL,
    file_path TEXT NOT NULL,
    file_type TEXT,
    file_size INTEGER,
    mime_type TEXT,
    width INTEGER,
    height INTEGER,
    alt_text TEXT,
    caption TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PARTNERS Table
CREATE TABLE IF NOT EXISTS partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    company_name TEXT,
    company_type TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    gst_number TEXT,
    logo_url TEXT,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. COMMISSIONS Table
CREATE TABLE IF NOT EXISTS commissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES partners(id),
    user_id UUID REFERENCES auth.users(id),
    plan_id UUID REFERENCES plans(id),
    sale_id UUID,
    amount DECIMAL(10,2) NOT NULL,
    percentage DECIMAL(5,2),
    commission_type TEXT DEFAULT 'sale',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'paid', 'rejected')),
    payout_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. WITHDRAWALS Table
CREATE TABLE IF NOT EXISTS withdrawals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    partner_id UUID REFERENCES partners(id),
    amount DECIMAL(10,2) NOT NULL,
    payment_method TEXT,
    bank_name TEXT,
    account_number TEXT,
    ifsc_code TEXT,
    upi_id TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'paid')),
    remarks TEXT,
    processed_by UUID REFERENCES auth.users(id),
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. SUPPORT TICKETS Table
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES auth.users(id),
    subject TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT,
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
    assigned_to UUID REFERENCES auth.users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. SUPPORT REPLIES Table
CREATE TABLE IF NOT EXISTS support_replies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id),
    message TEXT NOT NULL,
    is_internal BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. PAYMENT TRANSACTIONS Table
CREATE TABLE IF NOT EXISTS payment_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    plan_id UUID REFERENCES plans(id),
    invoice_id UUID,
    transaction_id TEXT,
    gateway TEXT,
    amount DECIMAL(10,2) NOT NULL,
    currency TEXT DEFAULT 'INR',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
    payment_method TEXT,
    gateway_response JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. ACTIVITY LOGS Table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id),
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_faqs_active ON faqs(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_testimonials_active ON testimonials(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_pages_slug ON pages(slug);
CREATE INDEX IF NOT EXISTS idx_homepage_sections_active ON homepage_sections(is_active, sort_order);
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
CREATE INDEX IF NOT EXISTS idx_commissions_partner ON commissions(partner_id);
CREATE INDEX IF NOT EXISTS idx_commissions_status ON commissions(status);
CREATE INDEX IF NOT EXISTS idx_withdrawals_user ON withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_withdrawals_status ON withdrawals(status);
CREATE INDEX IF NOT EXISTS idx_support_tickets_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_replies_ticket ON support_replies(ticket_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at);

-- Enable RLS on all tables
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Create policies (allow read for all, write only for authenticated users)
-- FAQS
CREATE POLICY "Allow read faqs" ON faqs FOR SELECT USING (true);
CREATE POLICY "Allow admin write faqs" ON faqs FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'employee')));

-- TESTIMONIALS
CREATE POLICY "Allow read testimonials" ON testimonials FOR SELECT USING (true);
CREATE POLICY "Allow admin write testimonials" ON testimonials FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'employee')));

-- PAGES
CREATE POLICY "Allow read published pages" ON pages FOR SELECT USING (is_published = true OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'employee')));
CREATE POLICY "Allow admin write pages" ON pages FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'employee')));

-- HOMEPAGE SECTIONS
CREATE POLICY "Allow read homepage_sections" ON homepage_sections FOR SELECT USING (true);
CREATE POLICY "Allow admin write homepage_sections" ON homepage_sections FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'employee')));

-- MEDIA
CREATE POLICY "Allow read media" ON media FOR SELECT USING (true);
CREATE POLICY "Allow auth write media" ON media FOR ALL USING (auth.uid() IS NOT NULL);

-- MEDIA FOLDERS
CREATE POLICY "Allow read media_folders" ON media_folders FOR SELECT USING (true);
CREATE POLICY "Allow auth write media_folders" ON media_folders FOR ALL USING (auth.uid() IS NOT NULL);

-- PARTNERS
CREATE POLICY "Allow admin read partners" ON partners FOR SELECT USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'employee', 'franchise_owner')));
CREATE POLICY "Allow admin write partners" ON partners FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- COMMISSIONS
CREATE POLICY "Allow own commissions read" ON commissions FOR SELECT USING (user_id = auth.uid() OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'employee')));
CREATE POLICY "Allow admin write commissions" ON commissions FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- WITHDRAWALS
CREATE POLICY "Allow own withdrawals read" ON withdrawals FOR SELECT USING (user_id = auth.uid() OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'employee')));
CREATE POLICY "Allow auth create withdrawals" ON withdrawals FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Allow admin write withdrawals" ON withdrawals FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- SUPPORT TICKETS
CREATE POLICY "Allow own tickets read" ON support_tickets FOR SELECT USING (user_id = auth.uid() OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'employee', 'call_center_agent')));
CREATE POLICY "Allow auth create tickets" ON support_tickets FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Allow admin write tickets" ON support_tickets FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'employee')));

-- SUPPORT REPLIES
CREATE POLICY "Allow own replies read" ON support_replies FOR SELECT USING (user_id = auth.uid() OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'employee', 'call_center_agent')));
CREATE POLICY "Allow auth create replies" ON support_replies FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Allow admin write replies" ON support_replies FOR UPDATE USING (auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'employee')));

-- PAYMENT TRANSACTIONS
CREATE POLICY "Allow own transactions read" ON payment_transactions FOR SELECT USING (user_id = auth.uid() OR auth.uid() IN (SELECT id FROM profiles WHERE role IN ('admin', 'employee')));
CREATE POLICY "Allow admin write transactions" ON payment_transactions FOR ALL USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- ACTIVITY LOGS
CREATE POLICY "Allow admin read activity_logs" ON activity_logs FOR SELECT USING (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));
CREATE POLICY "Allow admin write activity_logs" ON activity_logs FOR INSERT WITH CHECK (auth.uid() IN (SELECT id FROM profiles WHERE role = 'admin'));

-- Insert default data
INSERT INTO homepage_sections (section_key, title, is_active, sort_order) VALUES
    ('hero', 'Hero Section', true, 1),
    ('features', 'Features Section', true, 2),
    ('plans', 'Plans Section', true, 3),
    ('testimonials', 'Testimonials Section', true, 4),
    ('faq', 'FAQ Section', true, 5),
    ('cta', 'Call to Action', true, 6),
    ('footer', 'Footer', true, 7)
ON CONFLICT (section_key) DO NOTHING;

-- Grant permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
