# Google Clone Project Structure

This document outlines the restructured project organization following Next.js best practices. The project has been reorganized from a traditional React/React Router application to a modern Next.js application using the App Router.

## Directory Structure

```
frontend/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (routes)/             # Route groups
│   │   │   └── search/           # Search page route
│   │   │       └── page.tsx      # Search results page
│   │   ├── api/                  # API routes
│   │   │   └── search/           # Search API endpoint
│   │   │       └── route.ts      # Handler for search API
│   │   ├── layout.tsx            # Root layout (replaces _app.tsx)
│   │   ├── page.tsx              # Homepage (landing page)
│   │   └── not-found.tsx         # 404 page
│   ├── components/               # Reusable components
│   │   ├── ui/                   # UI components (buttons, inputs, etc.)
│   │   ├── Header.tsx            # Site header
│   │   ├── KnowledgePanel.tsx    # Knowledge panel for search results
│   │   ├── LocalMap.tsx          # Local results map component
│   │   ├── OrganicResult.tsx     # Organic search result component
│   │   ├── RelatedQuestions.tsx  # Related questions component
│   │   ├── SearchBar.tsx         # Search input component
│   │   └── SearchResults.tsx     # Search results container
│   ├── api/                      # Client-side API utilities
│   │   └── search.ts             # Search API client
│   ├── hooks/                    # Custom React hooks
│   │   ├── index.ts              # Hook exports
│   │   ├── use-mobile.tsx        # Mobile detection hook
│   │   ├── use-search.ts         # Search state management hook
│   │   ├── use-search-params.ts  # URL search params hook
│   │   └── use-toast.ts          # Toast notification hook
│   └── lib/                      # Utility functions and helpers
│       └── utils.ts              # General utilities
```

## Key Changes and Improvements

### 1. Next.js App Router Implementation

- Converted from React Router to Next.js App Router
- Created dedicated page components in the appropriate app directory structure
- Implemented proper layouts for consistent UI across pages

### 2. API Layer

- Created Next.js API routes to proxy backend requests
- Centralized API request logic in dedicated modules
- Improved error handling and request/response types

### 3. Custom Hooks

- Created custom hooks to centralize common functionality:
  - `useSearch`: Manages search state and operations
  - `useSearchParams`: Handles URL query parameters
  - `useMobile`: Detects mobile devices
  - `useToast`: Manages toast notifications

### 4. Best Practices Implemented

- Client/Server Component Separation
  - Used 'use client' directive appropriately
  - Kept server components pure where possible

- Improved Data Fetching
  - Moved API calls from components to dedicated hooks and API utilities
  - Proper error handling and loading states

- Routing
  - Implemented Next.js navigation with proper route parameters
  - Created a 404 page for missing routes

- Code Organization
  - Grouped related files into directories
  - Used index files for cleaner imports
  - Separated UI components from data/logic components

## Migration Notes

When working with this codebase, note:

1. All frontend routes are defined in the app directory structure
2. API requests should go through the Next.js API routes
3. Use the custom hooks from `/hooks` for common functionality
4. Follow the server/client component pattern (add 'use client' only when needed)

## Development Workflow

1. Place page components in the appropriate app directory
2. Create API routes in the app/api directory
3. Place reusable components in the components directory
4. Use hooks for shared state and effects
5. Use utils for pure utility functions 