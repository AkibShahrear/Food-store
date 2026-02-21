-- Create user_profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  zip_code VARCHAR(20),
  country VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create product_ratings table
CREATE TABLE product_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, user_id)
);

-- Create indexes for user_profiles
CREATE INDEX idx_user_profiles_email ON user_profiles(email);

-- Create indexes for product_ratings
CREATE INDEX idx_product_ratings_product_id ON product_ratings(product_id);
CREATE INDEX idx_product_ratings_user_id ON product_ratings(user_id);
CREATE INDEX idx_product_ratings_created_at ON product_ratings(created_at);

-- Enable Row Level Security
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_ratings ENABLE ROW LEVEL SECURITY;

-- User Profiles: Users can view all profiles (for public info), update only their own
CREATE POLICY "Enable read access for all users" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Product Ratings: Users can view all ratings, create/update only their own
CREATE POLICY "Enable read access for all users" ON product_ratings
  FOR SELECT USING (true);

CREATE POLICY "Users can create own ratings" ON product_ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings" ON product_ratings
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings" ON product_ratings
  FOR DELETE USING (auth.uid() = user_id);
