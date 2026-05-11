-- Run this in Supabase SQL Editor

-- Add face descriptor column to users
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS face_descriptor TEXT,
  ADD COLUMN IF NOT EXISTS reset_otp TEXT,
  ADD COLUMN IF NOT EXISTS reset_otp_expiry TIMESTAMPTZ;

-- Company settings table for office location
CREATE TABLE IF NOT EXISTS company_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  office_name VARCHAR(255),
  office_lat DECIMAL(10, 7),
  office_lng DECIMAL(10, 7),
  allowed_radius_meters INTEGER DEFAULT 200,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
