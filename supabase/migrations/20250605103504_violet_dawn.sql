/*
  # Add controls and trophies to profiles table
  
  1. Changes
    - Add controls column to profiles table (JSONB)
    - Add claimed_trophies column to profiles table (text[])
    
  2. Security
    - Maintain existing RLS policies
*/

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS controls JSONB DEFAULT '{
  "upKey": "w",
  "downKey": "s",
  "leftKey": "a",
  "rightKey": "d",
  "shopKey": "e",
  "inventoryKey": "q"
}'::jsonb,
ADD COLUMN IF NOT EXISTS claimed_trophies text[] DEFAULT '{}'::text[];