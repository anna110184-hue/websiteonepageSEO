# Supabase Setup Instructions

Your Supabase project is configured and ready to use! Here's how to get started.

## 📋 Project Credentials

- **Project URL**: `https://dxnfkfljryacxpzlncem.supabase.co`
- **API Key**: Already configured in your `.env` file
- **Project ID**: `dxnfkfljryacxpzlncem`

## 🚀 Quick Start

### 1. Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### 2. Use the Pre-configured Client

```javascript
import { supabase, supabaseHelpers } from './lib/supabase/client.js'

// Ready to use! No additional setup required
const { data, error } = await supabaseHelpers.select('users')
```

### 3. Environment Variables

Your `.env` file is already configured with:
- `SUPABASE_URL` - Your project URL
- `SUPABASE_ANON_KEY` - Your public API key

## 📁 File Structure Created

```
├── config/supabase/
│   ├── .env.example          # Template for environment variables
│   ├── types.js              # TypeScript definitions and constants
│   └── setup-instructions.md # This file
├── lib/supabase/
│   └── client.js             # Configured Supabase client with helpers
├── examples/supabase/
│   ├── basic-usage.js        # Basic CRUD operations
│   └── react-integration.js  # React hooks and components
└── .env                      # Your actual environment variables
```

## 🔧 Next Steps

### 1. Create Your First Table

Go to your [Supabase Dashboard](https://supabase.com/dashboard/project/dxnfkfljryacxpzlncem) and create a table:

```sql
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);
```

### 2. Set Up Row Level Security (RLS)

```sql
-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Allow users to read all profiles
CREATE POLICY "Public profiles are viewable by everyone"
ON users FOR SELECT
USING (true);

-- Allow users to insert their own profile
CREATE POLICY "Users can insert their own profile"
ON users FOR INSERT
WITH CHECK (auth.uid() = id);
```

### 3. Test Your Setup

```javascript
import { supabaseHelpers } from './lib/supabase/client.js'

// Test connection
const { data, error } = await supabaseHelpers.select('users')
console.log('Connection test:', { data, error })
```

## 🛠️ Common Operations

### Authentication

```javascript
// Sign up
const { data, error } = await supabaseHelpers.signUp('user@example.com', 'password')

// Sign in
const { data, error } = await supabaseHelpers.signIn('user@example.com', 'password')

// Get current user
const { user, error } = await supabaseHelpers.getCurrentUser()
```

### Database Operations

```javascript
// Insert
await supabaseHelpers.insert('users', { name: 'John', email: 'john@example.com' })

// Select all
await supabaseHelpers.select('users')

// Select with filters
await supabaseHelpers.select('users', 'name, email', { active: true })

// Update
await supabaseHelpers.update('users', { name: 'Jane' }, { id: 'user-id' })

// Delete
await supabaseHelpers.delete('users', { id: 'user-id' })
```

### Real-time Subscriptions

```javascript
const subscription = supabase
  .channel('users_changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'users'
  }, (payload) => {
    console.log('Change received!', payload)
  })
  .subscribe()
```

## 📚 Additional Resources

- [Supabase Dashboard](https://supabase.com/dashboard/project/dxnfkfljryacxpzlncem)
- [Supabase Documentation](https://supabase.com/docs)
- [JavaScript Client Reference](https://supabase.com/docs/reference/javascript/introduction)
- [SQL Editor](https://supabase.com/dashboard/project/dxnfkfljryacxpzlncem/sql)

## 🔐 Security Notes

- Never commit your `.env` file to version control
- The anon key is safe to use in client-side code
- Use Row Level Security (RLS) for data protection
- Consider using the service role key for server-side operations only

Your Supabase setup is complete and ready for development! 🎉