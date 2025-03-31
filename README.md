# StackAI Google Clone

A search engine clone with AI enhancements, built with Next.js and FastAPI.

## Project Overview

This project implements a Google-like search interface with modern features:
- Search functionality powered by SerpAPI
- AI-powered result summaries using DeepSeek AI
- Knowledge panels for information-rich queries
- Recent search history tracking
- Responsive design

## Project Structure

```
├── backend/             # FastAPI backend server
│   ├── src/             # Source code
│   │   ├── main.py      # Main API endpoints
│   │   ├── db.py        # Database interactions
│   │   └── models.py    # Data models
│   ├── supabase/        # Database schema and migrations
│   └── restart.sh       # Utility script to restart the server
├── frontend/            # Next.js frontend application
│   ├── src/             # Source code
│   │   ├── app/         # Next.js app router
│   │   ├── components/  # React components
│   │   ├── api/         # API client code
│   │   └── hooks/       # Custom React hooks
│   └── public/          # Static assets
├── tests/               # Test utilities
├── data/                # Data files for the application
└── .env                 # Environment variables (add your own)
```

## Setup and Installation

### Prerequisites
- Node.js v18+
- Python 3.10+
- Supabase account (for database)
- SerpAPI key
- DeepSeek API key

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create and activate a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
# Edit .env file with your API keys and database credentials

# Start the server
./restart.sh  # Or: python -m src.main
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Set up environment variables
# Edit .env.local with your API configuration

# Start the development server
npm run dev
```

## Usage

Once both servers are running:
1. Access the frontend at http://localhost:3000
2. Use the search bar to perform searches
3. View search results with AI-enhanced summaries
4. Explore knowledge panels and related searches

## API Endpoints

- `/api/search` - Perform a search query
- `/api/search/{search_id}/ai_response` - Get AI-generated response for a search
- `/api/recent_searches` - Get recent search queries

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
