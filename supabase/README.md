# Supabase Database Setup

This directory contains the database schema and migrations for BDPay.

## Setup Instructions

### 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the project to be provisioned

### 2. Run the Migration

You have two options to run the migration:

#### Option A: Using Supabase Dashboard (Recommended for Quick Setup)

1. Go to your Supabase project dashboard
2. Navigate to the **SQL Editor** in the left sidebar
3. Click **New query**
4. Copy the entire contents of `migrations/001_initial_schema.sql`
5. Paste it into the SQL editor
6. Click **Run** to execute the migration

#### Option B: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push
```

### 3. Configure Environment Variables

1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy your **Project URL** and **anon public** key
3. Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Verify Setup

After running the migration, verify that the following tables were created:

- `merchants`
- `wallets`
- `transactions`
- `staff`
- `webhook_logs`
- `checkout_sessions`

You can check this in the **Table Editor** section of your Supabase dashboard.

## Database Schema

### Tables

- **merchants**: Stores merchant business information and API keys
- **wallets**: Stores payment wallet numbers (bKash, Nagad, Rocket, Upay)
- **transactions**: Stores all payment transactions with TrxID verification
- **staff**: Multi-user access management for merchant accounts
- **webhook_logs**: Logs of webhook deliveries to merchant systems
- **checkout_sessions**: Hosted payment page sessions

### Row Level Security (RLS)

All tables have RLS enabled with policies that ensure:
- Merchants can only access their own data
- Staff members can access their merchant's data
- Public checkout pages are accessible to customers
- API keys are properly secured

### Automatic Triggers

- **on_auth_user_created**: Automatically creates a merchant record when a user signs up

### Functions

- **handle_new_user()**: Creates merchant record for new users
- **regenerate_api_key(merchant_uuid)**: Regenerates API key for a merchant

## Security Notes

1. **Row Level Security** is enabled on all tables
2. **API keys** are generated using cryptographic random bytes
3. **Duplicate TrxID** prevention is enforced via unique constraint
4. **Webhook URLs** must be HTTPS only (enforced in application layer)
5. **User authentication** is handled by Supabase Auth

## Next Steps

After setting up the database:

1. Configure your `.env` file with Supabase credentials
2. Start the development server: `npm run dev`
3. Register a new merchant account
4. Add wallet numbers in the dashboard
5. Test the payment flow

## Troubleshooting

**Issue: Migration fails with "already exists" errors**
- This means the migration was already run. You can skip it or drop the tables and re-run.

**Issue: RLS blocks my queries**
- Make sure you're authenticated when accessing protected tables
- Check that your user's auth.uid() matches the user_id in merchants table

**Issue: Can't insert transactions**
- Verify that you have an active merchant account
- Check that the TrxID doesn't already exist for your merchant
