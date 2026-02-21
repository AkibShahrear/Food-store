-- Verification script to check database schema
-- Run this in Supabase SQL Editor to verify the schema is complete

-- Check tables
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Check products table
\d products

-- Check orders table
\d orders

-- Check order_items table
\d order_items

-- Check user_profiles table
\d user_profiles

-- Check product_ratings table
\d product_ratings

-- Check RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Check indexes
SELECT indexname FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
