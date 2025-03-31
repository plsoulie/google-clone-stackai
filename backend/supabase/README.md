# Supabase Setup Instructions

This project uses Supabase to store search results and AI-generated content. Follow these steps to set up your Supabase database.

## 1. Create a Supabase Project

1. Sign up or log in at [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon/public key - you'll need these for configuration

## 2. Create Database Tables

### Option A: Using the SQL Editor

1. In your Supabase project dashboard, go to the SQL Editor
2. Copy the contents of `init.sql` from this directory
3. Paste and run the SQL in the Supabase SQL Editor

### Option B: Using the Dashboard

1. Create a `search_results` table with the following columns:
   - `id` (uuid, primary key)
   - `query` (text, not null)
   - `timestamp` (timestamptz, default: now())
   - `organic_results` (jsonb, not null)
   - `knowledge_graph` (jsonb, nullable)
   - `local_results` (jsonb, nullable)
   - `related_questions` (jsonb, nullable)
   - `related_searches` (jsonb, nullable)
   - `inline_images` (jsonb, nullable)
   - `answer_box` (jsonb, nullable)
   - `ai_response` (text, nullable)
   - `location` (text, nullable)

2. Create an `ai_responses` table with the following columns:
   - `id` (uuid, primary key, default: uuid_generate_v4())
   - `search_id` (uuid, not null, foreign key to search_results.id)
   - `response` (text, not null)
   - `timestamp` (timestamptz, default: now())

## 3. Configure Environment Variables

Add your Supabase credentials to the `.env` file in the backend directory:

```
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_KEY=your-anon-key
```

## 4. RLS Policies (If Using Auth)

The default setup uses public policies that allow all operations without authentication. If you're using Supabase Auth, you'll need to modify the RLS policies to use authentication checks.

## 5. Migration from Previous Structure

If you previously had a `search_records` table and want to migrate the data to the new `search_results` structure:

1. In your Supabase project dashboard, go to the SQL Editor
2. Copy the contents of `migrate.sql` from this directory
3. Paste and run the SQL in the Supabase SQL Editor

The migration script will:
- Create the new `search_results` table if it doesn't exist
- Copy and transform data from `search_records` to `search_results`
- Update foreign key constraints
- Create necessary indexes and policies
- Rename the old table to `search_records_backup`

## Testing the Integration

You can test the database integration by running:

```bash
cd backend
python direct_test_supabase.py
``` 