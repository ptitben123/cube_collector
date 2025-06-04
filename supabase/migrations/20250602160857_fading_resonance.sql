/*
  # Initial Schema Setup
  
  1. New Tables
    - profiles (user profile data)
    - unlocked_skins (tracks which skins users have unlocked)
    - custom_skins (user-created custom skins)
    - upgrades (user upgrade progress)
    - claimed_trophies (tracks claimed trophies)
    - friends (user friendships)
    - friend_requests (pending friend requests)
    
  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
    - Handle new user creation with trigger
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  nickname text,
  profile_picture text,
  score integer DEFAULT 0,
  total_collected integer DEFAULT 0,
  total_points_gained integer DEFAULT 0,
  point_multiplier float DEFAULT 1,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create unlocked_skins table
CREATE TABLE IF NOT EXISTS unlocked_skins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles ON DELETE CASCADE,
  skin_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(profile_id, skin_id)
);

-- Create custom_skins table
CREATE TABLE IF NOT EXISTS custom_skins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  color text NOT NULL,
  is_rounded boolean DEFAULT false,
  rotate boolean DEFAULT false,
  glow boolean DEFAULT false,
  pulse boolean DEFAULT false,
  border boolean DEFAULT false,
  border_color text,
  shadow boolean DEFAULT false,
  shadow_color text,
  trail boolean DEFAULT false,
  trail_color text,
  created_at timestamptz DEFAULT now()
);

-- Create upgrades table
CREATE TABLE IF NOT EXISTS upgrades (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles ON DELETE CASCADE,
  upgrade_id text NOT NULL,
  level integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(profile_id, upgrade_id)
);

-- Create claimed_trophies table
CREATE TABLE IF NOT EXISTS claimed_trophies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles ON DELETE CASCADE,
  trophy_id text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(profile_id, trophy_id)
);

-- Create friends table
CREATE TABLE IF NOT EXISTS friends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles ON DELETE CASCADE,
  friend_id uuid REFERENCES profiles ON DELETE CASCADE,
  status text DEFAULT 'offline',
  created_at timestamptz DEFAULT now(),
  UNIQUE(profile_id, friend_id)
);

-- Create friend_requests table
CREATE TABLE IF NOT EXISTS friend_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES profiles ON DELETE CASCADE,
  receiver_id uuid REFERENCES profiles ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(sender_id, receiver_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE unlocked_skins ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_skins ENABLE ROW LEVEL SECURITY;
ALTER TABLE upgrades ENABLE ROW LEVEL SECURITY;
ALTER TABLE claimed_trophies ENABLE ROW LEVEL SECURITY;
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

-- Create policies with existence checks
DO $$ 
BEGIN
  -- Profiles policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can read own profile'
  ) THEN
    CREATE POLICY "Users can read own profile"
      ON profiles FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users can update own profile'
  ) THEN
    CREATE POLICY "Users can update own profile"
      ON profiles FOR UPDATE
      TO authenticated
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;

  -- Unlocked skins policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'unlocked_skins' AND policyname = 'Users can read own unlocked skins'
  ) THEN
    CREATE POLICY "Users can read own unlocked skins"
      ON unlocked_skins FOR SELECT
      TO authenticated
      USING (auth.uid() = profile_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'unlocked_skins' AND policyname = 'Users can insert own unlocked skins'
  ) THEN
    CREATE POLICY "Users can insert own unlocked skins"
      ON unlocked_skins FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = profile_id);
  END IF;

  -- Custom skins policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'custom_skins' AND policyname = 'Users can read own custom skins'
  ) THEN
    CREATE POLICY "Users can read own custom skins"
      ON custom_skins FOR SELECT
      TO authenticated
      USING (auth.uid() = profile_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'custom_skins' AND policyname = 'Users can insert own custom skins'
  ) THEN
    CREATE POLICY "Users can insert own custom skins"
      ON custom_skins FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = profile_id);
  END IF;

  -- Upgrades policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'upgrades' AND policyname = 'Users can read own upgrades'
  ) THEN
    CREATE POLICY "Users can read own upgrades"
      ON upgrades FOR SELECT
      TO authenticated
      USING (auth.uid() = profile_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'upgrades' AND policyname = 'Users can update own upgrades'
  ) THEN
    CREATE POLICY "Users can update own upgrades"
      ON upgrades FOR UPDATE
      TO authenticated
      USING (auth.uid() = profile_id)
      WITH CHECK (auth.uid() = profile_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'upgrades' AND policyname = 'Users can insert own upgrades'
  ) THEN
    CREATE POLICY "Users can insert own upgrades"
      ON upgrades FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = profile_id);
  END IF;

  -- Claimed trophies policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'claimed_trophies' AND policyname = 'Users can read own claimed trophies'
  ) THEN
    CREATE POLICY "Users can read own claimed trophies"
      ON claimed_trophies FOR SELECT
      TO authenticated
      USING (auth.uid() = profile_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'claimed_trophies' AND policyname = 'Users can insert own claimed trophies'
  ) THEN
    CREATE POLICY "Users can insert own claimed trophies"
      ON claimed_trophies FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = profile_id);
  END IF;

  -- Friends policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'friends' AND policyname = 'Users can read own friends'
  ) THEN
    CREATE POLICY "Users can read own friends"
      ON friends FOR SELECT
      TO authenticated
      USING (auth.uid() = profile_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'friends' AND policyname = 'Users can update own friends'
  ) THEN
    CREATE POLICY "Users can update own friends"
      ON friends FOR UPDATE
      TO authenticated
      USING (auth.uid() = profile_id)
      WITH CHECK (auth.uid() = profile_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'friends' AND policyname = 'Users can insert own friends'
  ) THEN
    CREATE POLICY "Users can insert own friends"
      ON friends FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = profile_id);
  END IF;

  -- Friend requests policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'friend_requests' AND policyname = 'Users can read own friend requests'
  ) THEN
    CREATE POLICY "Users can read own friend requests"
      ON friend_requests FOR SELECT
      TO authenticated
      USING (auth.uid() = receiver_id OR auth.uid() = sender_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'friend_requests' AND policyname = 'Users can insert own friend requests'
  ) THEN
    CREATE POLICY "Users can insert own friend requests"
      ON friend_requests FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = sender_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'friend_requests' AND policyname = 'Users can delete own friend requests'
  ) THEN
    CREATE POLICY "Users can delete own friend requests"
      ON friend_requests FOR DELETE
      TO authenticated
      USING (auth.uid() = receiver_id OR auth.uid() = sender_id);
  END IF;
END $$;

-- Drop existing function and trigger if they exist
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- Create function to handle user creation with explicit schema references
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  
  -- Insert default skin
  INSERT INTO public.unlocked_skins (profile_id, skin_id)
  VALUES (new.id, 'default');
  
  RETURN new;
END;
$$;

-- Create trigger for new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();