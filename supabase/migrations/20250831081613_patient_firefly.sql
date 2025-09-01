/*
  # Initial Health Checkup App Schema

  1. New Tables
    - `symptoms`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `description` (text, symptom description)
      - `ai_advice` (text, AI-generated advice)
      - `referral_needed` (boolean, whether hospital referral is recommended)
      - `created_at` (timestamp)
    - `payments`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key to auth.users)
      - `amount` (numeric, payment amount)
      - `status` (text, payment status)
      - `payment_ref` (text, IntaSend payment reference)
      - `created_at` (timestamp)
    - `clinics`
      - `id` (uuid, primary key)
      - `name` (text, clinic name)
      - `address` (text, clinic address)
      - `latitude` (numeric, clinic latitude)
      - `longitude` (numeric, clinic longitude)
      - `phone` (text, clinic phone number)
      - `created_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add comprehensive policies for user data access
    - Admin policies for viewing all data
    - Secure payment and symptom data

  3. Extensions
    - Enable uuid-ossp for UUID generation
*/

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create symptoms table
CREATE TABLE IF NOT EXISTS symptoms (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  description text NOT NULL,
  ai_advice text DEFAULT '',
  referral_needed boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create payments table
CREATE TABLE IF NOT EXISTS payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'pending',
  payment_ref text UNIQUE,
  created_at timestamptz DEFAULT now()
);

-- Create clinics table for fallback data
CREATE TABLE IF NOT EXISTS clinics (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  address text NOT NULL,
  latitude numeric NOT NULL,
  longitude numeric NOT NULL,
  phone text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;

-- Symptoms policies
CREATE POLICY "Users can insert their own symptoms"
  ON symptoms
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own symptoms"
  ON symptoms
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own symptoms"
  ON symptoms
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own symptoms"
  ON symptoms
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all symptoms"
  ON symptoms
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Payments policies
CREATE POLICY "Users can insert their own payments"
  ON payments
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own payments"
  ON payments
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payments"
  ON payments
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all payments"
  ON payments
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Clinics policies (public read access)
CREATE POLICY "Anyone can view clinics"
  ON clinics
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can manage clinics"
  ON clinics
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE id = auth.uid() 
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Insert some sample clinic data
INSERT INTO clinics (name, address, latitude, longitude, phone) VALUES
  ('Nairobi Hospital', 'Argwings Kodhek Rd, Nairobi', -1.3026, 36.8157, '+254 20 2845000'),
  ('Kenyatta National Hospital', 'Hospital Rd, Nairobi', -1.3006, 36.8063, '+254 20 2726300'),
  ('Aga Khan University Hospital', 'Third Parklands Ave, Nairobi', -1.2581, 36.8066, '+254 20 3662000'),
  ('MP Shah Hospital', 'Shivachi Rd, Nairobi', -1.2843, 36.8172, '+254 20 4285000'),
  ('Gertrudes Children Hospital', 'Muthaiga Rd, Nairobi', -1.2496, 36.8342, '+254 20 2095000')
ON CONFLICT DO NOTHING;