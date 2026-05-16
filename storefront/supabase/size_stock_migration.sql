-- Run in Supabase SQL Editor
-- Adds per-size stock tracking to products

ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS size_stock jsonb DEFAULT '{}'::jsonb;

-- Example: {"XS": 3, "S": 10, "M": 8, "L": 5, "XL": 2}
