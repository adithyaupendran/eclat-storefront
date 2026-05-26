-- Migration: add visual_description column to products table
-- Run this in your Supabase SQL editor (Dashboard → SQL Editor → New Query)

alter table public.products
  add column if not exists visual_description text;

comment on column public.products.visual_description is
  'Auto-generated visual description from the product image using Gemini Vision. '
  'Generated once at product creation/update time — never at search time. '
  'Used by the Gemini search prompt for accurate visual attribute matching '
  '(e.g. sleeves, neckline, silhouette, colour, material).';
