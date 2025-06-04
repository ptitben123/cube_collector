/*
  # Initial Game Database Schema

  1. New Tables
    - `profiles`
      - `id` (uuid, primary key, linked to auth.users)
      - `nickname` (text)
      - `profile_picture` (text)
      - `score` (integer)
      - `total_collected` (integer)
      - `total_points_gained` (integer)
      - `point_multiplier` (float)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `unlocked_skins`
      - `id` (uuid, primary key)
      - `profile_id` (uuid, references profiles)
      - `skin_id` (text)
      - `created_at` (timestamp)
    
    - `custom_skins`
      - `id` (uuid, primary key)
      - `profile_id` (uuid, references profiles)
      - `name` (text)
      - `description` (text)
      - `color` (text)
      - `is_rounded` (boolean)
      - `rotate` (boolean)
      - `glow` (boolean)
      - `pulse` (boolean)
      - `border` (boolean)
      - `border_color` (text)
      - `shadow` (boolean)
      - `shadow_color` (text)
      - `trail` (boolean)
      - `trail_color` (text)
      - `created_at` (timestamp)
    
    - `upgrades`
      - `id` (uuid, primary key)
      - `profile_id` (uuid, references profiles)
      - `upgrade_id` (text)
      - `level` (integer)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `claimed_trophies`
      - `id` (uuid, primary key)
      - `profile_id` (uuid, references profiles)
      - `trophy_id` (text)
      - `created_at` (timestamp)
    
    - `friends`
      - `id` (uuid, primary key)
      - `profile_id` (uuid, references profiles)
      - `friend_id` (uuid, references profiles)
      - `status` (text)
      - `created_at` (timestamp)
    
    - `friend_requests`
      - `id` (uuid, primary key)
      - `sender_id` (uuid, references profiles)
      - `receiver_id` (uuid, references profiles)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to:
      - Read/write their own profile data
      - Read/write their own unlocked skins
      - Read/write their own custom skins
      - Read/write their own upgrades
      - Read/write their own claimed trophies
      - Read/write their own friends
      - Read/write their own friend requests
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

-- Create policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can read own unlocked skins"
  ON unlocked_skins FOR SELECT
  TO authenticated
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert own unlocked skins"
  ON unlocked_skins FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can read own custom skins"
  ON custom_skins FOR SELECT
  TO authenticated
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert own custom skins"
  ON custom_skins FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can read own upgrades"
  ON upgrades FOR SELECT
  TO authenticated
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can update own upgrades"
  ON upgrades FOR UPDATE
  TO authenticated
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can insert own upgrades"
  ON upgrades FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can read own claimed trophies"
  ON claimed_trophies FOR SELECT
  TO authenticated
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert own claimed trophies"
  ON claimed_trophies FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can read own friends"
  ON friends FOR SELECT
  TO authenticated
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can update own friends"
  ON friends FOR UPDATE
  TO authenticated
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can insert own friends"
  ON friends FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can read own friend requests"
  ON friend_requests FOR SELECT
  TO authenticated
  USING (auth.uid() = receiver_id OR auth.uid() = sender_id);

CREATE POLICY "Users can insert own friend requests"
  ON friend_requests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can delete own friend requests"
  ON friend_requests FOR DELETE
  TO authenticated
  USING (auth.uid() = receiver_id OR auth.uid() = sender_id);

-- Create function to handle user creation
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO profiles (id)
  VALUES (new.id);
  
  -- Insert default skin
  INSERT INTO unlocked_skins (profile_id, skin_id)
  VALUES (new.id, 'default');
  
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user creation
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();