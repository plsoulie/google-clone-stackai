# Google Clone Backend

This is the backend service for the Google Clone project, built with FastAPI and using SerpAPI for search functionality.

## Setup

1. Create a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Configure environment variables:
- Copy `.env.example` to `.env`
- Add your SerpAPI key to the `.env` file

## Running the Server

Development mode:
```bash
uvicorn src.main:app --reload
```

Production mode:
```bash
uvicorn src.main:app --host 0.0.0.0 --port 8000
```

## API Endpoints

### Health Check
- `GET /api/health`
- Returns the server status

### Search
- `POST /api/search`
- Request body:
```json
{
    "query": "your search query",
    "num_results": 10  // optional, defaults to 10
}
```

#### Response Structure
```json
{
    "query": "search query",
    "organic_results": [
        {
            "title": "Result title",
            "link": "Result URL",
            "snippet": "Result description",
            "position": 1,
            "thumbnail": "Optional thumbnail URL"
        }
    ],
    "local_results": [
        {
            "title": "Local business name",
            "address": "Business address",
            "rating": 4.5,
            "reviews": 100,
            "phone": "Phone number",
            "website": "Business website"
        }
    ],
    "knowledge_graph": {
        "title": "Knowledge graph title",
        "description": "Knowledge graph description",
        "attributes": {
            "key": "value"
        }
    },
    "related_questions": [
        {
            "question": "Related question",
            "snippet": "Answer snippet"
        }
    ],
    "related_searches": ["Related search term 1", "Related search term 2"],
    "inline_images": [
        {
            "title": "Image title",
            "thumbnail": "Image URL",
            "source": "Image source"
        }
    ],
    "answer_box": {
        "type": "Answer box type",
        "answer": "Direct answer"
    },
    "ai_response": "AI-generated response"
}
```

## API Documentation

Once the server is running, you can access:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

## Notes

- All optional fields will be `null` if not present in the SerpAPI response
- The API uses US region (`gl=us`) and English language (`hl=en`) for consistent results
- Rate limiting and error handling are implemented
- CORS is enabled for all origins in development (should be restricted in production) 