# Google Clone Frontend (Serverless)

This is a Next.js-based frontend for the Google Clone project, designed to be deployed as a serverless application on Vercel.

## Serverless Architecture

This project uses a serverless approach, where API calls to external services (SerpAPI, DeepSeek) are handled through Next.js API routes directly in the frontend application. This eliminates the need for a separate backend service.

### API Integrations

- **SerpAPI**: Used for search results, directly called from Next.js API route
- **DeepSeek**: Used for AI-generated responses
- **Google Maps**: Used for map visualization, called from the client-side
- **Supabase**: Used for storing and retrieving recent searches

## Environment Variables

The following environment variables are required:

```
# Google Maps Integration
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
NEXT_PUBLIC_GOOGLE_MAPS_ID=your_google_maps_id

# SerpAPI (for search results)
SERPAPI_KEY=your_serpapi_key

# DeepSeek (for AI responses)
DEEPSEEK_API_KEY=your_deepseek_api_key

# Supabase (for database functionality)
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key

# Configuration
NEXT_PUBLIC_USE_SERVERLESS=true
```

## Supabase Setup

This project uses Supabase as a backend database for storing search history. The following tables are required:

### `recent_searches` Table
- `id`: bigint (primary key, auto-increment)
- `query`: text (not null)
- `timestamp`: timestamp with time zone (not null)
- `user_id`: uuid (optional, for future user authentication)

## Deployment on Vercel

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Set up the environment variables in the Vercel dashboard
4. Deploy

## Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with the required environment variables
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Features

- Modern search interface with multiple result types
- Server-side rendering for fast initial load
- Client-side search for subsequent queries
- Recent search history stored in Supabase
- Mobile-responsive design
- Integration with Google Maps for location results

## Project Structure

- `/src/app`: Next.js App Router pages
- `/src/app/api`: API routes for serverless functionality
- `/src/components`: React components for the UI
- `/src/api`: Client-side API utilities
- `/src/lib`: Utility functions including Supabase client
- `/public`: Static assets

## Note on API Keys

Keep your API keys confidential. The environment variables in Vercel are secure, but be careful not to expose them in your code or commit them to your repository. 