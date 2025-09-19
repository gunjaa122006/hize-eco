-- Fix infinite recursion in profiles RLS policies
-- The "Admins can view all profiles" policy is causing infinite recursion 
-- because it queries the profiles table from within a profiles table policy

-- Drop the problematic admin policy that causes infinite recursion
DROP POLICY "Admins can view all profiles" ON public.profiles;

-- Create a simpler approach: admins can update their own role to admin
-- and then use a different mechanism for admin access if needed
-- For now, we'll rely on the existing "Users can view their own profile" policy
-- and handle admin functionality at the application level