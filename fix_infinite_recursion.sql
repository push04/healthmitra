-- ============================================================================
-- CRITICAL FIX: STOP INFINITE RECURSION
-- Error: "infinite recursion detected in policy for relation 'profiles'"
-- Cause: The policy checks 'profiles' table -> which triggers the policy again -> infinite loop.
-- Fix: Use a 'SECURITY DEFINER' function to check admin status safely.
-- ============================================================================

-- 1. Create a Helper Function (Bypasses RLS safely)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user exists and has role 'admin'
  -- SECURITY DEFINER makes this run as superuser, avoiding the recursion trap
  RETURN EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 2. Fix 'profiles' Policy (The Source of the Error)
DROP POLICY IF EXISTS "Admins manage all profiles" ON public.profiles;

CREATE POLICY "Admins manage all profiles" ON public.profiles
FOR ALL USING (
    -- Now we use the function instead of direct query
    public.is_admin()
);


-- 3. Fix Other Policies (To be safe and consistent)
-- Service Requests
DROP POLICY IF EXISTS "Admins manage all requests" ON public.service_requests;
CREATE POLICY "Admins manage all requests" ON public.service_requests
FOR ALL USING (public.is_admin());

-- Invoices
DROP POLICY IF EXISTS "Admins manage all invoices" ON public.invoices;
CREATE POLICY "Admins manage all invoices" ON public.invoices
FOR ALL USING (public.is_admin());

-- Audit Logs
DROP POLICY IF EXISTS "Admins manage all audit logs" ON public.audit_logs;
CREATE POLICY "Admins manage all audit logs" ON public.audit_logs
FOR ALL USING (public.is_admin());

-- Departments
DROP POLICY IF EXISTS "Admins manage departments" ON public.departments;
CREATE POLICY "Admins manage departments" ON public.departments
FOR ALL USING (public.is_admin());

-- Plans
DROP POLICY IF EXISTS "Admins manage plans" ON public.plans;
CREATE POLICY "Admins manage plans" ON public.plans
FOR ALL USING (public.is_admin());

-- CMS
DROP POLICY IF EXISTS "Admins manage cms" ON public.cms_content;
CREATE POLICY "Admins manage cms" ON public.cms_content
FOR ALL USING (public.is_admin());


-- ============================================================================
-- SUCCESS: Infinite loop should be gone.
