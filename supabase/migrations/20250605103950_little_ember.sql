```sql
/*
  # Add Friend System Tables

  1. New Tables
    - `friends`
      - Stores friend relationships between users
      - Includes online status tracking
    
    - `friend_requests`
      - Stores pending friend requests
      - Links sender and receiver profiles

  2. Security
    - Enable RLS on new tables
    - Add policies for friend-related operations
*/

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

CREATE POLICY "Users can delete own friends"
  ON friends FOR DELETE
  TO authenticated
  USING (auth.uid() = profile_id);

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
```