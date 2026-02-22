-- ============================================================================
-- SUPABASE STORAGE BUCKETS SETUP
-- Run this in Supabase SQL Editor
-- ============================================================================

-- ============================================================================
-- 1. CREATE STORAGE BUCKETS
-- ============================================================================

-- Documents Bucket (PHR, Reimbursements, User Documents)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'documents',
    'documents',
    true,
    10485760, -- 10MB limit
    ARRAY['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
)
ON CONFLICT (id) DO NOTHING;

-- CMS Media Bucket (Images, Videos for Website Content)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'cms',
    'cms',
    true,
    52428800, -- 50MB limit
    ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp', 'video/mp4', 'video/webm']
)
ON CONFLICT (id) DO NOTHING;

-- Avatars Bucket (Profile Pictures)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'avatars',
    'avatars',
    true,
    2097152, -- 2MB limit
    ARRAY['image/jpeg', 'image/png', 'image/jpg', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- E-Cards Bucket (Generated E-Cards)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'ecards',
    'ecards',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- Exports Bucket (Reports, Downloads)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'exports',
    'exports',
    true,
    104857600, -- 100MB limit
    ARRAY['application/pdf', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv']
)
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. ADD DOCUMENT URL COLUMNS TO TABLES (if not exists)
-- ============================================================================

-- Add document_url to phr_documents if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'phr_documents' AND column_name = 'document_url') THEN
        ALTER TABLE phr_documents ADD COLUMN document_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'phr_documents' AND column_name = 'file_path') THEN
        ALTER TABLE phr_documents ADD COLUMN file_path TEXT;
    END IF;
END $$;

-- Add document_url to reimbursement_claims if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reimbursement_claims' AND column_name = 'document_url') THEN
        ALTER TABLE reimbursement_claims ADD COLUMN document_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'reimbursement_claims' AND column_name = 'bill_document_url') THEN
        ALTER TABLE reimbursement_claims ADD COLUMN bill_document_url TEXT;
    END IF;
END $$;

-- Add avatar_url to profiles if not exists (already exists based on earlier check)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'avatar_url') THEN
        ALTER TABLE profiles ADD COLUMN avatar_url TEXT;
    END IF;
END $$;

-- Add photo_url to ecard_members if not exists
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ecard_members' AND column_name = 'photo_url') THEN
        ALTER TABLE ecard_members ADD COLUMN photo_url TEXT;
    END IF;
END $$;

-- ============================================================================
-- 3. STORAGE POLICIES FOR DOCUMENTS BUCKET
-- ============================================================================

-- Anyone can view documents (read access)
DROP POLICY IF EXISTS "Anyone can view documents" ON storage.objects;
CREATE POLICY "Anyone can view documents" ON storage.objects
    FOR SELECT USING (bucket_id = 'documents');

-- Authenticated users can upload their own documents
DROP POLICY IF EXISTS "Users can upload own documents" ON storage.objects;
CREATE POLICY "Users can upload own documents" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'documents' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Users can update/delete their own documents
DROP POLICY IF EXISTS "Users can manage own documents" ON storage.objects;
CREATE POLICY "Users can manage own documents" ON storage.objects
    FOR UPDATE TO authenticated
    USING (
        bucket_id = 'documents' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    )
    WITH CHECK (
        bucket_id = 'documents' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Users can delete their own documents
DROP POLICY IF EXISTS "Users can delete own documents" ON storage.objects;
CREATE POLICY "Users can delete own documents" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'documents' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Service role can manage all documents
DROP POLICY IF EXISTS "Service role can manage all documents" ON storage.objects;
CREATE POLICY "Service role can manage all documents" ON storage.objects
    FOR ALL USING (
        bucket_id = 'documents' 
        AND auth.role() = 'service_role'
    );

-- ============================================================================
-- 4. STORAGE POLICIES FOR CMS BUCKET
-- ============================================================================

-- Anyone can view CMS files (public access)
DROP POLICY IF EXISTS "Anyone can view cms" ON storage.objects;
CREATE POLICY "Anyone can view cms" ON storage.objects
    FOR SELECT USING (bucket_id = 'cms');

-- Authenticated users can upload CMS files
DROP POLICY IF EXISTS "Users can upload cms" ON storage.objects;
CREATE POLICY "Users can upload cms" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'cms');

-- Service role can manage CMS files
DROP POLICY IF EXISTS "Service role can manage cms" ON storage.objects;
CREATE POLICY "Service role can manage cms" ON storage.objects
    FOR ALL USING (
        bucket_id = 'cms' 
        AND auth.role() = 'service_role'
    );

-- ============================================================================
-- 5. STORAGE POLICIES FOR AVATARS BUCKET
-- ============================================================================

-- Anyone can view avatars (public access)
DROP POLICY IF EXISTS "Anyone can view avatars" ON storage.objects;
CREATE POLICY "Anyone can view avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');

-- Authenticated users can upload their own avatar
DROP POLICY IF EXISTS "Users can upload own avatar" ON storage.objects;
CREATE POLICY "Users can upload own avatar" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'avatars' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Users can update their own avatar
DROP POLICY IF EXISTS "Users can update own avatar" ON storage.objects;
CREATE POLICY "Users can update own avatar" ON storage.objects
    FOR UPDATE TO authenticated
    USING (
        bucket_id = 'avatars' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    )
    WITH CHECK (
        bucket_id = 'avatars' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Users can delete their own avatar
DROP POLICY IF EXISTS "Users can delete own avatar" ON storage.objects;
CREATE POLICY "Users can delete own avatar" ON storage.objects
    FOR DELETE TO authenticated
    USING (
        bucket_id = 'avatars' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Service role can manage all avatars
DROP POLICY IF EXISTS "Service role can manage all avatars" ON storage.objects;
CREATE POLICY "Service role can manage all avatars" ON storage.objects
    FOR ALL USING (
        bucket_id = 'avatars' 
        AND auth.role() = 'service_role'
    );

-- ============================================================================
-- 6. STORAGE POLICIES FOR ECARDS BUCKET
-- ============================================================================

-- Anyone can view e-cards (public access)
DROP POLICY IF EXISTS "Anyone can view ecards" ON storage.objects;
CREATE POLICY "Anyone can view ecards" ON storage.objects
    FOR SELECT USING (bucket_id = 'ecards');

-- Authenticated users can upload their own e-cards
DROP POLICY IF EXISTS "Users can upload own ecards" ON storage.objects;
CREATE POLICY "Users can upload own ecards" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'ecards' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Users can manage their own e-cards
DROP POLICY IF EXISTS "Users can manage own ecards" ON storage.objects;
CREATE POLICY "Users can manage own ecards" ON storage.objects
    FOR ALL USING (
        bucket_id = 'ecards' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Service role can manage all e-cards
DROP POLICY IF EXISTS "Service role can manage all ecards" ON storage.objects;
CREATE POLICY "Service role can manage all ecards" ON storage.objects
    FOR ALL USING (
        bucket_id = 'ecards' 
        AND auth.role() = 'service_role'
    );

-- ============================================================================
-- 7. STORAGE POLICIES FOR EXPORTS BUCKET
-- ============================================================================

-- Authenticated users can view exports
DROP POLICY IF EXISTS "Users can view exports" ON storage.objects;
CREATE POLICY "Users can view exports" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'exports');

-- Users can upload to their own export folder
DROP POLICY IF EXISTS "Users can upload exports" ON storage.objects;
CREATE POLICY "Users can upload exports" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
        bucket_id = 'exports' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Users can manage their own exports
DROP POLICY IF EXISTS "Users can manage own exports" ON storage.objects;
CREATE POLICY "Users can manage own exports" ON storage.objects
    FOR ALL USING (
        bucket_id = 'exports' 
        AND (storage.foldername(name))[1] = auth.uid()::text
    );

-- Service role can manage all exports
DROP POLICY IF EXISTS "Service role can manage all exports" ON storage.objects;
CREATE POLICY "Service role can manage all exports" ON storage.objects
    FOR ALL USING (
        bucket_id = 'exports' 
        AND auth.role() = 'service_role'
    );

-- ============================================================================
-- 8. VERIFY BUCKETS CREATED
-- ============================================================================

SELECT 
    id as bucket_id,
    name,
    public,
    file_size_limit,
    array_length(allowed_mime_types, 1) as mime_types_count
FROM storage.buckets
WHERE id IN ('documents', 'cms', 'avatars', 'ecards', 'exports')
ORDER BY id;

-- ============================================================================
-- 9. VERIFY COLUMNS ADDED
-- ============================================================================

SELECT 
    'phr_documents' as table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'phr_documents'
AND column_name IN ('document_url', 'file_path')
UNION ALL
SELECT 
    'reimbursement_claims',
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'reimbursement_claims'
AND column_name IN ('document_url', 'bill_document_url')
UNION ALL
SELECT 
    'profiles',
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'profiles'
AND column_name = 'avatar_url'
UNION ALL
SELECT 
    'ecard_members',
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'ecard_members'
AND column_name = 'photo_url';

-- ============================================================================
-- 10. CREATE FOLDER PLACEHOLDERS (Optional - for organization)
-- ============================================================================

-- These are optional placeholder files to create folder structure
-- Uncomment if you want pre-created folders

-- INSERT INTO storage.objects (bucket_id, name, owner, created_at, updated_at, last_accessed_at)
-- VALUES ('documents', 'phr/', NULL, NOW(), NOW(), NOW())
-- ON CONFLICT DO NOTHING;

-- INSERT INTO storage.objects (bucket_id, name, owner, created_at, updated_at, last_accessed_at)
-- VALUES ('documents', 'reimbursements/', NULL, NOW(), NOW(), NOW())
-- ON CONFLICT DO NOTHING;

SELECT 'Storage setup completed successfully!' as status;
