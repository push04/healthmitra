-- Storage Buckets Setup for HealthMitra
-- Run this SQL in your Supabase SQL Editor
-- NOTE: Bucket creation must be done via Supabase Dashboard or CLI due to ownership restrictions

-- Create policies for documents bucket (these will work if buckets exist)
-- Run this after creating buckets via Supabase Dashboard

-- Create policies for documents bucket
DROP POLICY IF EXISTS "Allow authenticated users to upload documents" ON storage.objects;
CREATE POLICY "Allow authenticated users to upload documents" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Allow users to view own documents" ON storage.objects;
CREATE POLICY "Allow users to view own documents" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

DROP POLICY IF EXISTS "Allow users to delete own documents" ON storage.objects;
CREATE POLICY "Allow users to delete own documents" ON storage.objects
    FOR DELETE TO authenticated
    USING (bucket_id = 'documents' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Create policies for cms bucket (admin only)
DROP POLICY IF EXISTS "Allow admins to manage CMS files" ON storage.objects;
CREATE POLICY "Allow admins to manage CMS files" ON storage.objects
    FOR ALL USING (
        bucket_id = 'cms' 
        AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Create policies for profiles bucket
DROP POLICY IF EXISTS "Allow users to upload profile pictures" ON storage.objects;
CREATE POLICY "Allow users to upload profile pictures" ON storage.objects
    FOR ALL TO authenticated
    USING (bucket_id = 'profiles' AND (storage.foldername(name))[1] = auth.uid()::text)
    WITH CHECK (bucket_id = 'profiles' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Create policies for ecards bucket
DROP POLICY IF EXISTS "Allow users to view own ecards" ON storage.objects;
CREATE POLICY "Allow users to view own ecards" ON storage.objects
    FOR SELECT TO authenticated
    USING (bucket_id = 'ecards' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Show existing buckets
SELECT id, name, public, file_size_limit FROM storage.buckets;
