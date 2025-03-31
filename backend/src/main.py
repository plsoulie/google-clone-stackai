from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from serpapi import GoogleSearch
import os
from dotenv import load_dotenv
from typing import List, Optional, Dict, Any
import logging
import json
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

app = FastAPI()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, replace with specific origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Path to mock data
MOCK_DATA_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "../mockSerpData.json"))

# Load mock data
def load_mock_data():
    try:
        logger.info(f"Trying to load mock data from: {MOCK_DATA_PATH}")
        with open(MOCK_DATA_PATH, 'r') as f:
            data = json.load(f)
            # Debug - check if thumbnail exists in the original data
            if 'local_results' in data and 'places' in data['local_results'] and data['local_results']['places']:
                first_place = data['local_results']['places'][0]
                logger.info(f"First place keys: {first_place.keys()}")
                logger.info(f"First place has thumbnail: {'thumbnail' in first_place}")
                if 'thumbnail' in first_place:
                    logger.info(f"Thumbnail value: {first_place['thumbnail']}")
            logger.info("Mock data loaded successfully")
            return data
    except Exception as e:
        logger.error(f"Error loading mock data: {str(e)}")
        return None

# Load mock data at startup
mock_data = load_mock_data()

@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.info(f"Incoming request: {request.method} {request.url}")
    response = await call_next(request)
    logger.info(f"Response status: {response.status_code}")
    return response

class SearchQuery(BaseModel):
    query: str
    num_results: int = 10

class OrganicResult(BaseModel):
    title: str
    link: str
    snippet: str
    position: int
    thumbnail: Optional[str] = None

class LocalResult(BaseModel):
    title: str
    address: str
    rating: Optional[float] = None
    reviews: Optional[int] = None
    phone: Optional[str] = None
    website: Optional[str] = None
    thumbnail: Optional[str] = None

class KnowledgeGraph(BaseModel):
    title: str
    description: Optional[str] = None
    attributes: Dict[str, Any] = {}

class RelatedQuestion(BaseModel):
    question: str
    snippet: Optional[str] = None

class SearchResponse(BaseModel):
    query: str
    organic_results: List[OrganicResult]
    local_results: Optional[List[LocalResult]] = None
    knowledge_graph: Optional[KnowledgeGraph] = None
    related_questions: Optional[List[RelatedQuestion]] = None
    related_searches: Optional[List[str]] = None
    inline_images: Optional[List[Dict[str, Any]]] = None
    answer_box: Optional[Dict[str, Any]] = None
    ai_response: Optional[str] = None

def normalize_organic_results(results: List[Dict[str, Any]]) -> List[OrganicResult]:
    normalized = []
    if not isinstance(results, list):
        return normalized
    for result in results:
        if not isinstance(result, dict):
            continue
        normalized.append(OrganicResult(
            title=result.get("title", ""),
            link=result.get("link", ""),
            snippet=result.get("snippet", ""),
            position=result.get("position", 0),
            thumbnail=result.get("thumbnail", None)
        ))
    return normalized

def normalize_local_results(results: List[Dict[str, Any]]) -> List[LocalResult]:
    normalized = []
    if not isinstance(results, list):
        return normalized
    for result in results:
        if not isinstance(result, dict):
            continue
        normalized.append(LocalResult(
            title=result.get("title", ""),
            address=result.get("address", ""),
            rating=result.get("rating", None),
            reviews=result.get("reviews", None),
            phone=result.get("phone", None),
            website=result.get("website", None),
            thumbnail=result.get("thumbnail", None)
        ))
    return normalized

def normalize_knowledge_graph(graph: Dict[str, Any]) -> KnowledgeGraph:
    if not graph or not isinstance(graph, dict):
        return None
    
    attributes = {}
    for key, value in graph.items():
        if key not in ["title", "description"]:
            attributes[key] = value

    return KnowledgeGraph(
        title=graph.get("title", ""),
        description=graph.get("description", None),
        attributes=attributes
    )

def extract_related_searches(related_searches: List[Dict[str, Any]]) -> List[str]:
    if not related_searches or not isinstance(related_searches, list):
        return []
    return [item.get("query", "") for item in related_searches if isinstance(item, dict) and "query" in item]

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

@app.post("/api/search", response_model=SearchResponse)
async def search(query: SearchQuery):
    try:
        logger.info(f"Search query received: {query.query}")
        
        # Get SerpAPI key from environment variables
        serpapi_key = os.getenv("SERPAPI_KEY")
        if not serpapi_key:
            logger.error("SERPAPI_KEY not found in environment variables")
            raise HTTPException(status_code=500, detail="SERPAPI_KEY not configured")
        
        logger.info(f"Using SerpAPI key starting with: {serpapi_key[:5]}...")
        logger.info(f"Making search request for query: {query.query}")
        
        # Create search parameters
        params = {
            "engine": "google",
            "q": query.query,
            "num": query.num_results,
            "api_key": serpapi_key,
            "gl": "us",  # Set to US for consistent results
            "hl": "en"   # Set to English for consistent results
        }

        logger.info(f"SerpAPI params (excluding API key): {params}")
        logger.info(f"API key validity check: {'valid' if serpapi_key and len(serpapi_key) > 10 else 'invalid'}")
        
        # Flag to track if we're using live data or mock data
        using_mock_data = False
        
        try:
            logger.info("Calling SerpAPI...")
            # Perform the search
            search = GoogleSearch(params)
            results = search.get_dict()
            
            # Check if results are valid
            if not results:
                logger.error("SerpAPI returned empty results")
                using_mock_data = True
            elif "error" in results:
                logger.error(f"SerpAPI returned an error: {results.get('error')}")
                using_mock_data = True
            else:
                logger.info(f"SerpAPI response received - keys: {list(results.keys() if results else [])}")
                logger.info(f"Query '{query.query}' returned {len(results.get('organic_results', []))} organic results")
                logger.info(f"Response valid: {'organic_results' in results}")
            
            # Save the SerpAPI response for debugging
            try:
                with open("response.json", "w") as f:
                    json.dump(results, f)
                logger.info("SerpAPI response saved to response.json")
            except Exception as e:
                logger.error(f"Failed to save SerpAPI response: {e}")
            
        except Exception as e:
            logger.error(f"Error calling SerpAPI: {e}")
            using_mock_data = True
        
        # Fallback to mock data if needed
        if using_mock_data:
            logger.warning("Falling back to mock data")
            if not mock_data:
                logger.error("Mock data not available")
                raise HTTPException(status_code=500, detail="No valid search results available")
            
            results = mock_data
            logger.info("Using mock data fallback")
        else:
            logger.info(f"Successfully using live data from SerpAPI for query: {query.query}")
        
        if not isinstance(results, dict):
            logger.error(f"Unexpected response type: {type(results)}")
            raise HTTPException(status_code=500, detail="Invalid response format")

        # Extract and normalize local results directly to keep the thumbnail field
        local_results_data = []
        if isinstance(results.get("local_results"), dict) and isinstance(results.get("local_results").get("places"), list):
            # Debug the original data
            first_place = results["local_results"]["places"][0] if results["local_results"]["places"] else {}
            logger.info(f"Original first place data: {first_place}")
            logger.info(f"First place has thumbnail? {'thumbnail' in first_place}")
            
            for place in results["local_results"]["places"]:
                logger.info(f"Processing place with keys: {place.keys()}")
                place_data = {
                    "title": place.get("title", ""),
                    "address": place.get("address", ""),
                    "rating": place.get("rating", None),
                    "reviews": place.get("reviews", None),
                    "phone": place.get("phone", None),
                    "website": place.get("website", None),
                    "thumbnail": place.get("thumbnail", None),
                }
                logger.info(f"Mapped place thumbnail: {place_data['thumbnail']}")
                local_results_data.append(place_data)
            logger.info(f"Processed {len(local_results_data)} local results with thumbnails")
        else:
            logger.warning("No local_results.places found in search results")
        
        # Extract and normalize different result types
        response = SearchResponse(
            query=query.query,
            organic_results=normalize_organic_results(results.get("organic_results", [])),
            local_results=local_results_data,  # Use our direct extraction with thumbnails
            knowledge_graph=normalize_knowledge_graph(results.get("knowledge_graph", {})),
            related_questions=[
                RelatedQuestion(
                    question=q.get("question", ""),
                    snippet=q.get("snippet", None)
                )
                for q in results.get("related_questions", [])
                if isinstance(q, dict)
            ],
            related_searches=extract_related_searches(results.get("related_searches", [])),
            inline_images=results.get("inline_images", []) if isinstance(results.get("inline_images"), list) else [],
            answer_box=results.get("answer_box", None) if isinstance(results.get("answer_box"), dict) else None,
            ai_response=results.get("ai_generated_response", None) if isinstance(results.get("ai_generated_response"), str) else None
        )

        return response

    except Exception as e:
        logger.error(f"Error during search: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/test_search", response_model=SearchResponse)
async def test_search_endpoint(query: SearchQuery):
    # Logic from test_search.py to perform the search
    # Return the formatted results
    return await search(query)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 