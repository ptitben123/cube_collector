/*
  # Friend System Migration

  1. New Tables
    - `friends`
      - `id` (uuid, primary key)
      - `profile_id` (uuid, foreign key to profiles)
      - `friend_id` (uuid, foreign key to profiles)
      - `status` (text, default 'offline')
      - `created_at` (timestamp)
    - `friend_requests`
      - `id` (uuid, primary key)
      - `sender_id` (uuid, foreign key to profiles)
      - `receiver_id` (uuid, foreign key to profiles)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own friends and requests
*/

-- Drop existing policies if they exist
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can read own friends" ON friends;
  DROP POLICY IF EXISTS "Users can insert own friends" ON friends;
  DROP POLICY IF EXISTS "Users can update own friends" ON friends;
  DROP POLICY IF EXISTS "Users can delete own friends" ON friends;
  DROP POLICY IF EXISTS "Users can read own friend requests" ON friend_requests;
  DROP POLICY IF EXISTS "Users can insert own friend requests" ON friend_requests;
  DROP POLICY IF EXISTS "Users can delete own friend requests" ON friend_requests;
EXCEPTION
  WHEN undefined_object THEN
    NULL;
END $$;

-- Create friends table
CREATE TABLE IF NOT EXISTS friends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  friend_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  status text DEFAULT 'offline',
  created_at timestamptz DEFAULT now(),
  UNIQUE(profile_id, friend_id)
);

-- Create friend_requests table
CREATE TABLE IF NOT EXISTS friend_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  receiver_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(sender_id, receiver_id)
);

-- Enable Row Level Security
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for friends table
CREATE POLICY "Users can read own friends"
  ON friends FOR SELECT
  TO authenticated
  USING (auth.uid() = profile_id);

CREATE POLICY "Users can insert own friends"
  ON friends FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Users can update own friends"
  ON friends FOR UPDATE
  TO authenticated
  USING (auth.uid() = profile_id)
  WITH CHECK (auth.uid() = profile_id);

-- Create policies for friend_requests table
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