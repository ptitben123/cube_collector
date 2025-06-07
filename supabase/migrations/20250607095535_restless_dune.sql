/*
  # Friend System Implementation

  1. New Tables
    - `friends`
      - `id` (uuid, primary key)
      - `profile_id` (uuid, foreign key to profiles)
      - `friend_id` (uuid, foreign key to profiles)
      - `status` (text, default 'offline')
      - `created_at` (timestamp)
      - Unique constraint on (profile_id, friend_id)
    
    - `friend_requests`
      - `id` (uuid, primary key)
      - `sender_id` (uuid, foreign key to profiles)
      - `receiver_id` (uuid, foreign key to profiles)
      - `created_at` (timestamp)
      - Unique constraint on (sender_id, receiver_id)

  2. Security
    - Enable RLS on both tables
    - Add policies for authenticated users to manage their own friends and requests
*/

-- Create friends table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'friends') THEN
    CREATE TABLE friends (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      profile_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
      friend_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
      status text DEFAULT 'offline',
      created_at timestamptz DEFAULT now()
    );
    
    -- Add unique constraint
    ALTER TABLE friends ADD CONSTRAINT friends_profile_id_friend_id_key UNIQUE(profile_id, friend_id);
  END IF;
END $$;

-- Create friend_requests table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'friend_requests') THEN
    CREATE TABLE friend_requests (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      sender_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
      receiver_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
      created_at timestamptz DEFAULT now()
    );
    
    -- Add unique constraint
    ALTER TABLE friend_requests ADD CONSTRAINT friend_requests_sender_id_receiver_id_key UNIQUE(sender_id, receiver_id);
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE friend_requests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DO $$
BEGIN
  -- Drop friends policies if they exist
  DROP POLICY IF EXISTS "Users can read own friends" ON friends;
  DROP POLICY IF EXISTS "Users can insert own friends" ON friends;
  DROP POLICY IF EXISTS "Users can update own friends" ON friends;
  
  -- Drop friend_requests policies if they exist
  DROP POLICY IF EXISTS "Users can read own friend requests" ON friend_requests;
  DROP POLICY IF EXISTS "Users can insert own friend requests" ON friend_requests;
  DROP POLICY IF EXISTS "Users can delete own friend requests" ON friend_requests;
END $$;

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