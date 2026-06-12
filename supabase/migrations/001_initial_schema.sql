-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Merchant accounts table
create table merchants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  business_name text not null,
  email text not null unique,
  phone text,
  logo_url text,
  api_key text unique default encode(gen_random_bytes(32), 'hex'),
  webhook_url text,
  language text default 'en' check (language in ('en', 'bn')),
  created_at timestamptz default now()
);

-- Payment wallets table
create table wallets (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid references merchants(id) on delete cascade,
  provider text not null check (provider in ('bkash','nagad','rocket','upay')),
  wallet_number text not null,
  account_type text not null check (account_type in ('personal','merchant','agent')),
  display_name text,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- Payment transactions table
create table transactions (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid references merchants(id) on delete cascade,
  wallet_id uuid references wallets(id),
  trx_id text not null,
  amount numeric(12,2) not null,
  currency text default 'BDT',
  customer_name text,
  customer_phone text,
  customer_email text,
  order_id text,
  status text default 'pending' check (status in ('pending','approved','rejected','refunded')),
  provider text not null check (provider in ('bkash','nagad','rocket','upay')),
  notes text,
  verified_at timestamptz,
  verified_by uuid references auth.users(id),
  created_at timestamptz default now(),
  -- Fraud prevention: unique constraint on (merchant_id, trx_id)
  unique(merchant_id, trx_id)
);

-- Staff access table (multi-staff per merchant)
create table staff (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid references merchants(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text default 'staff' check (role in ('owner','admin','staff')),
  invited_email text,
  accepted_at timestamptz,
  created_at timestamptz default now()
);

-- Webhook delivery log table
create table webhook_logs (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid references merchants(id),
  transaction_id uuid references transactions(id),
  event text not null,
  payload jsonb,
  response_status int,
  delivered_at timestamptz default now()
);

-- Checkout sessions table (for hosted checkout page)
create table checkout_sessions (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid references merchants(id) on delete cascade,
  amount numeric(12,2) not null,
  order_id text,
  customer_name text,
  customer_phone text,
  customer_email text,
  redirect_url text,
  status text default 'pending',
  expires_at timestamptz default (now() + interval '30 minutes'),
  transaction_id uuid references transactions(id),
  created_at timestamptz default now()
);

-- Create indexes for better query performance
create index idx_merchants_user_id on merchants(user_id);
create index idx_merchants_api_key on merchants(api_key);
create index idx_wallets_merchant_id on wallets(merchant_id);
create index idx_transactions_merchant_id on transactions(merchant_id);
create index idx_transactions_status on transactions(status);
create index idx_transactions_created_at on transactions(created_at desc);
create index idx_staff_merchant_id on staff(merchant_id);
create index idx_staff_user_id on staff(user_id);
create index idx_checkout_sessions_merchant_id on checkout_sessions(merchant_id);
create index idx_checkout_sessions_status on checkout_sessions(status);

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
alter table merchants enable row level security;
alter table wallets enable row level security;
alter table transactions enable row level security;
alter table staff enable row level security;
alter table webhook_logs enable row level security;
alter table checkout_sessions enable row level security;

-- Merchants policies
create policy "Users can view their own merchant account"
  on merchants for select
  using (auth.uid() = user_id);

create policy "Users can insert their own merchant account"
  on merchants for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own merchant account"
  on merchants for update
  using (auth.uid() = user_id);

-- Wallets policies
create policy "Merchants can view their own wallets"
  on wallets for select
  using (
    merchant_id in (
      select id from merchants where user_id = auth.uid()
    )
  );

create policy "Merchants can insert their own wallets"
  on wallets for insert
  with check (
    merchant_id in (
      select id from merchants where user_id = auth.uid()
    )
  );

create policy "Merchants can update their own wallets"
  on wallets for update
  using (
    merchant_id in (
      select id from merchants where user_id = auth.uid()
    )
  );

create policy "Merchants can delete their own wallets"
  on wallets for delete
  using (
    merchant_id in (
      select id from merchants where user_id = auth.uid()
    )
  );

-- Transactions policies
create policy "Merchants can view their own transactions"
  on transactions for select
  using (
    merchant_id in (
      select id from merchants where user_id = auth.uid()
    )
    or
    merchant_id in (
      select merchant_id from staff where user_id = auth.uid()
    )
  );

create policy "Anyone can insert transactions" -- For public checkout
  on transactions for insert
  with check (true);

create policy "Merchants can update their own transactions"
  on transactions for update
  using (
    merchant_id in (
      select id from merchants where user_id = auth.uid()
    )
    or
    merchant_id in (
      select merchant_id from staff where user_id = auth.uid()
    )
  );

-- Staff policies
create policy "Merchants can view their staff"
  on staff for select
  using (
    merchant_id in (
      select id from merchants where user_id = auth.uid()
    )
  );

create policy "Merchants can manage their staff"
  on staff for all
  using (
    merchant_id in (
      select id from merchants where user_id = auth.uid()
    )
  );

-- Webhook logs policies
create policy "Merchants can view their webhook logs"
  on webhook_logs for select
  using (
    merchant_id in (
      select id from merchants where user_id = auth.uid()
    )
  );

-- Checkout sessions policies
create policy "Merchants can view their checkout sessions"
  on checkout_sessions for select
  using (
    merchant_id in (
      select id from merchants where user_id = auth.uid()
    )
  );

create policy "Merchants can create checkout sessions"
  on checkout_sessions for insert
  with check (
    merchant_id in (
      select id from merchants where user_id = auth.uid()
    )
  );

create policy "Merchants can update their checkout sessions"
  on checkout_sessions for update
  using (
    merchant_id in (
      select id from merchants where user_id = auth.uid()
    )
  );

create policy "Anyone can view active checkout sessions" -- For public checkout page
  on checkout_sessions for select
  using (status = 'pending' and expires_at > now());

-- Function to automatically create merchant record after user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.merchants (user_id, business_name, email)
  values (new.id, coalesce(new.raw_user_meta_data->>'business_name', 'My Business'), new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to create merchant on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Function to regenerate API key
create or replace function regenerate_api_key(merchant_uuid uuid)
returns text as $$
declare
  new_key text;
begin
  new_key := encode(gen_random_bytes(32), 'hex');
  update merchants set api_key = new_key where id = merchant_uuid;
  return new_key;
end;
$$ language plpgsql security definer;
