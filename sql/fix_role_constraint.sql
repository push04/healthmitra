-- Fix profiles table role CHECK constraint to allow agent roles
-- Run this in Supabase SQL Editor

-- Drop existing check constraint
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add new check constraint with all required roles
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN (
    'user', 
    'admin', 
    'franchise_owner', 
    'doctor', 
    'diagnostic_center', 
    'pharmacy',
    'agent',
    'employee',
    'call_center_agent',
    'call_centre_agent',
    'supervisor',
    'team_leader'
));