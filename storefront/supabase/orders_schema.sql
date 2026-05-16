-- Run this in Supabase SQL Editor after schema.sql

-- ── Orders Table ─────────────────────────────────────────────────────────────
create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete set null,
  status text not null default 'pending', -- pending, confirmed, shipped, delivered, cancelled
  total_amount numeric not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ── Order Items Table ─────────────────────────────────────────────────────────
create table public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id text not null references public.products(id) on delete restrict,
  size text,
  quantity integer not null default 1,
  unit_price numeric not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS
alter table public.orders enable row level security;
alter table public.order_items enable row level security;

-- Users can see their own orders
create policy "Users can view own orders" on public.orders
  for select using (auth.uid() = user_id);

-- Order items: users can view items in their orders
create policy "Users can view own order items" on public.order_items
  for select using (
    order_id in (select id from public.orders where user_id = auth.uid())
  );
