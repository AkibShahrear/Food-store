-- Fix RLS policies for user_profiles to allow inserts based on authenticated user
DROP POLICY IF EXISTS "Users can insert own profile" ON user_profiles;

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (true);

-- Also drop the existing update policy and recreate it
DROP POLICY IF EXISTS "Users can update own profile" ON user_profiles;

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);
