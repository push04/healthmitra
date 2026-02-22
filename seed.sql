-- Massive Seed Data for HealthMitra
-- Generated: 2026-02-17
-- Purpose: Create a realistic demo environment with hundreds of records
-- FIXED: Used valid UUIDs (Hex only) to enforce foreign key constraints.

-------------------------------------------------------------------------------
-- 1. PLANS (UUID prefix: 1111...)
-------------------------------------------------------------------------------
INSERT INTO public.plans (id, name, description, price, features, coverage_amount, duration_days, is_active) 
VALUES 
('11111111-1111-1111-1111-000000000001', 'Silver Health Plan', 'Essential health coverage for individuals including basic consultations and pharmacy discounts.', 4999.00, '["Unlimited Doctor Consultations", "10% Pharmacy Discount", "Basic Health Checkup", "Dental Checkup"]', 200000, 365, true),
('11111111-1111-1111-1111-000000000002', 'Gold Health Plan', 'Comprehensive coverage for couples with hospitalization benefits.', 9999.00, '["Cashless Hospitalization", "24/7 Medical Assistance", "Full Body Checkup", "Free Ambulance (2/yr)", "15% Pharmacy Discount"]', 500000, 365, true),
('11111111-1111-1111-1111-000000000003', 'Platinum Health Plan', 'Premium family coverage with global assistance and zero waiting period.', 19999.00, '["Global Coverage", "Air Ambulance Support", "Premium Room Upgrade", "Zero Waiting Period", "20% Pharmacy Discount", "Dedicated Relationship Manager"]', 1000000, 365, true),
('11111111-1111-1111-1111-000000000004', 'Senior Citizen Care', 'Specialized care plan for elderly with home visits.', 7999.00, '["Weekly Home Nurse Visit", "Medicine Delivery", "Emergency Response", "Dialysis Support"]', 300000, 365, true),
('11111111-1111-1111-1111-000000000005', 'Corporate Wellness', 'Bulk plan for employees with mental health support.', 2999.00, '["Tele-consultation", "Mental Health Sessions", "Gym Membership Discounts", "Ergonomic Assessment"]', 100000, 365, true);


-------------------------------------------------------------------------------
-- 2. SYSTEM SETTINGS
-------------------------------------------------------------------------------
INSERT INTO public.system_settings (key, value, description, is_secure)
VALUES 
('site_name', 'HealthMitra', 'Name of the application', false),
('support_email', 'support@healthmitra.in', 'Main support email', false),
('razorpay_key_id', 'rzp_test_placeholder_key', 'Razorpay Public Key ID', false),
('razorpay_key_secret', 'rzp_test_placeholder_secret', 'Razorpay Secret Key', true),
('maintenance_mode', 'false', 'Toggle maintenance mode', false);


-------------------------------------------------------------------------------
-- 3. PROFILES (Users, Admins, Partners)
-------------------------------------------------------------------------------
-- Admin (UUID: 0000...)
INSERT INTO public.profiles (id, email, full_name, phone, role, avatar_url)
VALUES 
('00000000-0000-0000-0000-000000000001', 'admin@dpnc.in', 'Super Admin', '9999999999', 'admin', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin');

-- Franchise Owners (UUID: 3333...)
INSERT INTO public.profiles (id, email, full_name, phone, role, avatar_url) VALUES 
('33333333-3333-3333-3333-000000000001', 'delhi.franchise@dpnc.in', 'Amit Verma', '9898980001', 'franchise_owner', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amit'),
('33333333-3333-3333-3333-000000000002', 'mumbai.franchise@dpnc.in', 'Sarah Dsouza', '9898980002', 'franchise_owner', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah'),
('33333333-3333-3333-3333-000000000003', 'bangalore.franchise@dpnc.in', 'Rohan Reddy', '9898980003', 'franchise_owner', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rohan'),
('33333333-3333-3333-3333-000000000004', 'kolkata.franchise@dpnc.in', 'Priya Roy', '9898980004', 'franchise_owner', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya'),
('33333333-3333-3333-3333-000000000005', 'chennai.franchise@dpnc.in', 'Karthik S', '9898980005', 'franchise_owner', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Karthik');

-- Users (UUID: 2222...)
INSERT INTO public.profiles (id, email, full_name, phone, role, avatar_url) VALUES 
('22222222-2222-2222-2222-000000000001', 'rajesh.kumar@example.com', 'Rajesh Kumar', '9876543201', 'user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rajesh'),
('22222222-2222-2222-2222-000000000002', 'sneha.gupta@example.com', 'Sneha Gupta', '9876543202', 'user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha'),
('22222222-2222-2222-2222-000000000003', 'vikram.singh@example.com', 'Vikram Singh', '9876543203', 'user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram'),
('22222222-2222-2222-2222-000000000004', 'anita.sharma@example.com', 'Anita Sharma', '9876543204', 'user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anita'),
('22222222-2222-2222-2222-000000000005', 'mohammed.ali@example.com', 'Mohammed Ali', '9876543205', 'user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ali'),
('22222222-2222-2222-2222-000000000006', 'john.doe@example.com', 'John Doe', '9876543206', 'user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=John'),
('22222222-2222-2222-2222-000000000007', 'mary.jane@example.com', 'Mary Jane', '9876543207', 'user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mary'),
('22222222-2222-2222-2222-000000000008', 'david.smith@example.com', 'David Smith', '9876543208', 'user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=David'),
('22222222-2222-2222-2222-000000000009', 'lisa.wong@example.com', 'Lisa Wong', '9876543209', 'user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa'),
('22222222-2222-2222-2222-000000000010', 'robert.brown@example.com', 'Robert Brown', '9876543210', 'user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert'),
('22222222-2222-2222-2222-000000000011', 'patricia.jones@example.com', 'Patricia Jones', '9876543211', 'user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Patricia'),
('22222222-2222-2222-2222-000000000012', 'michael.miller@example.com', 'Michael Miller', '9876543212', 'user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael'),
('22222222-2222-2222-2222-000000000013', 'elizabeth.davis@example.com', 'Elizabeth Davis', '9876543213', 'user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Elizabeth'),
('22222222-2222-2222-2222-000000000014', 'william.garcia@example.com', 'William Garcia', '9876543214', 'user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=William'),
('22222222-2222-2222-2222-000000000015', 'jennifer.rodriguez@example.com', 'Jennifer Rodriguez', '9876543215', 'user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer'),
('22222222-2222-2222-2222-000000000016', 'charles.wilson@example.com', 'Charles Wilson', '9876543216', 'user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charles'),
('22222222-2222-2222-2222-000000000017', 'susan.martinez@example.com', 'Susan Martinez', '9876543217', 'user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Susan'),
('22222222-2222-2222-2222-000000000018', 'joseph.anderson@example.com', 'Joseph Anderson', '9876543218', 'user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Joseph'),
('22222222-2222-2222-2222-000000000019', 'margaret.taylor@example.com', 'Margaret Taylor', '9876543219', 'user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Margaret'),
('22222222-2222-2222-2222-000000000020', 'thomas.thomas@example.com', 'Thomas Thomas', '9876543220', 'user', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Thomas');


-------------------------------------------------------------------------------
-- 4. FRANCHISES (UUID: 4444...)
-------------------------------------------------------------------------------
INSERT INTO public.franchises (id, owner_user_id, franchise_name, code, contact_email, city, state, status, commission_percentage)
VALUES 
('44444444-4444-4444-4444-000000000001', '33333333-3333-3333-3333-000000000001', 'Delhi Metro Franchise', 'DEL-01', 'contact@delhi-hm.in', 'New Delhi', 'Delhi', 'active', 15.00),
('44444444-4444-4444-4444-000000000002', '33333333-3333-3333-3333-000000000002', 'Mumbai Central Hub', 'MUM-01', 'contact@mumbai-hm.in', 'Mumbai', 'Maharashtra', 'active', 20.00),
('44444444-4444-4444-4444-000000000003', '33333333-3333-3333-3333-000000000003', 'Bangalore Tech Park', 'BLR-01', 'contact@blr-hm.in', 'Bangalore', 'Karnataka', 'active', 12.00);


-------------------------------------------------------------------------------
-- 5. CITIES & LOCATIONS
-------------------------------------------------------------------------------
INSERT INTO public.cities (name, state, region, is_serviceable, service_centers) VALUES 
('New Delhi', 'Delhi', 'North', true, '[{"name": "Delhi Central Lab", "address": "CP, New Delhi"}, {"name": "South Delhi Clinic", "address": "GK-1"}]'),
('Mumbai', 'Maharashtra', 'West', true, '[{"name": "Mumbai City Hospital", "address": "Andheri West"}]'),
('Bangalore', 'Karnataka', 'South', true, '[{"name": "Bangalore Health Hub", "address": "Indiranagar"}]'),
('Chennai', 'Tamil Nadu', 'South', true, '[]'),
('Kolkata', 'West Bengal', 'East', true, '[]'),
('Pune', 'Maharashtra', 'West', true, '[]'),
('Hyderabad', 'Telangana', 'South', true, '[]'),
('Ahmedabad', 'Gujarat', 'West', true, '[]'),
('Jaipur', 'Rajasthan', 'North', true, '[]'),
('Lucknow', 'Uttar Pradesh', 'North', true, '[]');


-------------------------------------------------------------------------------
-- 6. E-CARD MEMBERS & PLANS
-------------------------------------------------------------------------------
-- Give Rajesh (User 1) a plan
INSERT INTO public.ecard_members (user_id, plan_id, member_id_code, card_unique_id, full_name, relation, dob, gender, blood_group, status, valid_from, valid_till)
VALUES 
('22222222-2222-2222-2222-000000000001', '11111111-1111-1111-1111-000000000001', 'HM-2025-001', 'CARD-001', 'Rajesh Kumar', 'Self', '1985-01-01', 'M', 'O+', 'active', '2025-01-01', '2026-01-01'),
('22222222-2222-2222-2222-000000000001', '11111111-1111-1111-1111-000000000001', 'HM-2025-002', 'CARD-002', 'Suman Kumar', 'Spouse', '1988-02-02', 'F', 'A+', 'active', '2025-01-01', '2026-01-01');

-- Give Sneha (User 2) a plan
INSERT INTO public.ecard_members (user_id, plan_id, member_id_code, card_unique_id, full_name, relation, dob, gender, blood_group, status, valid_from, valid_till)
VALUES 
('22222222-2222-2222-2222-000000000002', '11111111-1111-1111-1111-000000000002', 'HM-2025-003', 'CARD-003', 'Sneha Gupta', 'Self', '1990-03-10', 'F', 'B+', 'active', '2025-02-01', '2026-02-01');


-------------------------------------------------------------------------------
-- 7. WALLET TRANSACTIONS (Realistic History)
-------------------------------------------------------------------------------
INSERT INTO public.wallet_transactions (user_id, type, amount, description, status, transaction_date)
VALUES 
-- USER 1
('22222222-2222-2222-2222-000000000001', 'credit', 5000.00, 'Opening Balance', 'success', NOW() - INTERVAL '30 days'),
('22222222-2222-2222-2222-000000000001', 'debit', 499.00, 'Medicine Order #123', 'success', NOW() - INTERVAL '25 days'),
('22222222-2222-2222-2222-000000000001', 'credit', 2000.00, 'Reimbursement for Consultation', 'success', NOW() - INTERVAL '20 days'),
('22222222-2222-2222-2222-000000000001', 'debit', 1200.00, 'Diagnostic Test Booking', 'success', NOW() - INTERVAL '10 days'),
-- USER 2
('22222222-2222-2222-2222-000000000002', 'credit', 10000.00, 'Welcome Bonus', 'success', NOW() - INTERVAL '60 days'),
('22222222-2222-2222-2222-000000000002', 'debit', 5000.00, 'Plan Upgrades', 'success', NOW() - INTERVAL '55 days');


-------------------------------------------------------------------------------
-- 8. SERVICE REQUESTS (Varied Types & Statuses)
-------------------------------------------------------------------------------
INSERT INTO public.service_requests (request_id_display, user_id, type, status, details, created_at)
VALUES 
-- User 1 Requests
('SR-2025-101', '22222222-2222-2222-2222-000000000001', 'medical_consultation', 'completed', '{"symptoms": "High Fever", "preferredTime": "Morning", "mode": "Video"}', NOW() - INTERVAL '5 days'),
('SR-2025-102', '22222222-2222-2222-2222-000000000001', 'medicine', 'in_progress', '{"items": ["Paracetamol", "Cough Syrup"], "address": "Home"}', NOW() - INTERVAL '2 days'),
('SR-2025-103', '22222222-2222-2222-2222-000000000001', 'diagnostic', 'pending', '{"tests": ["CBC", "Lipid Profile"], "time": "Tomorrow 8AM"}', NOW()),

-- User 2 Requests
('SR-2025-104', '22222222-2222-2222-2222-000000000002', 'ambulance', 'completed', '{"pickup": "Home", "drop": "City Hospital", "emergency": true}', NOW() - INTERVAL '15 days'),
('SR-2025-105', '22222222-2222-2222-2222-000000000002', 'nursing', 'cancelled', '{"duration": "2 days", "reason": "Post surgery care"}', NOW() - INTERVAL '10 days'),
('SR-2025-106', '22222222-2222-2222-2222-000000000002', 'caretaker', 'in_progress', '{"shift": "Night", "patient_age": 70}', NOW() - INTERVAL '1 day');


-------------------------------------------------------------------------------
-- 9. REIMBURSEMENT CLAIMS
-------------------------------------------------------------------------------
INSERT INTO public.reimbursement_claims (claim_id_display, user_id, claim_type, amount_requested, status, created_at)
VALUES 
('CLM-2025-001', '22222222-2222-2222-2222-000000000001', 'medicine', 1500.00, 'approved', NOW() - INTERVAL '20 days'),
('CLM-2025-002', '22222222-2222-2222-2222-000000000001', 'opd', 500.00, 'rejected', NOW() - INTERVAL '15 days'),
('CLM-2025-003', '22222222-2222-2222-2222-000000000002', 'hospitalization', 50000.00, 'processing', NOW() - INTERVAL '2 days');


-------------------------------------------------------------------------------
-- 10. PAYMENTS (Real data only - no mock data)
-- Payments will be created automatically when users make purchases
-------------------------------------------------------------------------------
-- INSERT INTO public.payments (user_id, amount, status, razorpay_order_id, purpose, created_at)
-- VALUES 
-- (example: actual payment records will be created during checkout);


-------------------------------------------------------------------------------
-- 11. CMS Content
-------------------------------------------------------------------------------
INSERT INTO public.cms_content (key, value)
VALUES 
('home_banner', '{"title": "Welcome to HealthMitra", "subtitle": "Your Trusted Health Partner", "image": "banner1.jpg", "active": true}'),
('faq_list', '[{"q": "How to claim?", "a": "Upload bills in app"}, {"q": "Is ambulance free?", "a": "Yes for Gold plans"}]'),
('terms_conditions', '{"content": "Standard terms apply..."}'),
('privacy_policy', '{"content": "We respect your data..."}');
