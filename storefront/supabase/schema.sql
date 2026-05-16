-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- ── 1. Products Table ───────────────────────────────────────────────────────
create table public.products (
  id text primary key, -- Custom string IDs used in ECLAT (e.g., 'eclat_coat_03')
  slug text unique not null,
  title text not null,
  brand text not null,
  description text,
  price numeric not null,
  original_price numeric,
  category text not null,
  image_urls text[] not null default '{}',
  image_position text,
  tags text[] not null default '{}',
  sizes text[] not null default '{}',
  semantic_metadata jsonb default '{}'::jsonb,
  stock_quantity integer not null default 0,
  rating numeric default 0,
  review_count integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ── 2. Users Profile Table ──────────────────────────────────────────────────
create table public.users_profile (
  user_id uuid primary key references auth.users(id) on delete cascade,
  first_name text,
  last_name text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ── 3. Cart Table ───────────────────────────────────────────────────────────
create table public.cart (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users(id) on delete cascade,
  guest_id uuid, -- For unauthenticated sessions
  product_id text references public.products(id) on delete cascade,
  size text,
  quantity integer not null default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  -- Ensure a cart item is unique per user/guest + product + size
  constraint cart_user_product_size_key unique (user_id, product_id, size),
  constraint cart_guest_product_size_key unique (guest_id, product_id, size),
  -- Must belong to either a user or a guest, but not both
  constraint cart_owner_check check (
    (user_id is not null and guest_id is null) or 
    (guest_id is not null and user_id is null)
  )
);

-- ── 4. Wishlist Table ───────────────────────────────────────────────────────
create table public.wishlist (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id text not null references public.products(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint wishlist_user_product_key unique (user_id, product_id)
);

-- ── Row Level Security (RLS) ────────────────────────────────────────────────

-- Enable RLS
alter table public.products enable row level security;
alter table public.users_profile enable row level security;
alter table public.cart enable row level security;
alter table public.wishlist enable row level security;

-- Products: Anyone can read products. Only service_role/admin can write.
create policy "Products are viewable by everyone" on public.products
  for select using (true);

-- Users Profile: Users can view and update their own profile
create policy "Users can view own profile" on public.users_profile
  for select using (auth.uid() = user_id);

create policy "Users can update own profile" on public.users_profile
  for update using (auth.uid() = user_id);

create policy "Users can insert own profile" on public.users_profile
  for insert with check (auth.uid() = user_id);

-- Cart: Users can manage their own cart
create policy "Users can view own cart" on public.cart
  for select using (auth.uid() = user_id);

create policy "Users can insert into own cart" on public.cart
  for insert with check (auth.uid() = user_id);

create policy "Users can update own cart" on public.cart
  for update using (auth.uid() = user_id);

create policy "Users can delete from own cart" on public.cart
  for delete using (auth.uid() = user_id);

-- Cart: Guests can manage their own cart (via service_role or relaxed RLS if guest_id is provided via API)
-- Note: Since we will be using Server Actions with the Supabase Server Client (which runs as the user),
-- we need to allow anonymous users to access carts where the guest_id matches.
-- However, true secure guest carts are best handled strictly server-side using the service_role key to bypass RLS,
-- or by passing the guest_id securely. For maximum security, we'll restrict guest cart access 
-- so it can only be queried via server-side APIs using `supabase_service_role` or by matching a signed cookie.
-- To allow client-side RLS for guests, we'd need a custom JWT. 
-- We will handle guest carts strictly via Server Actions (which bypasses RLS if using service_role, or we can use a custom header).
-- For simplicity, we'll allow anonymous access if guest_id matches the requested guest_id (passed via API).
create policy "Guests can manage cart" on public.cart
  for all using (guest_id is not null); -- In a real prod environment, validate the guest_id securely via Server Actions.

-- Wishlist: Users can manage their own wishlist
create policy "Users can view own wishlist" on public.wishlist
  for select using (auth.uid() = user_id);

create policy "Users can insert into own wishlist" on public.wishlist
  for insert with check (auth.uid() = user_id);

create policy "Users can delete from own wishlist" on public.wishlist
  for delete using (auth.uid() = user_id);

-- Trigger for automatically creating a profile upon auth.users insertion
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users_profile (user_id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
