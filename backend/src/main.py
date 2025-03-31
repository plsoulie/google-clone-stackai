from fastapi import FastAPI, HTTPException, Request, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from serpapi import GoogleSearch
import os
from dotenv import load_dotenv
from typing import List, Optional, Dict, Any
import logging
import json
from pathlib import Path
import httpx
import asyncio

from .models import SearchQuery, SearchResult, OrganicResult, LocalResult, KnowledgeGraph, RelatedQuestion
from .db import save_search_result, update_search_with_ai_response, get_search_result, supabase_client, fix_search_record_components

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# DeepSeek API configuration
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "sk-d3ef9fa2019249adb0b5f5e95b285c72")
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"

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
    location: Optional[str] = None

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
    search_id: Optional[str] = None

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

async def generate_ai_response(query: str, search_results: List[Dict[str, Any]], search_id: str) -> Optional[str]:
    try:
        # Extract snippets from search results
        snippets = [result.get("snippet", "") for result in search_results if result.get("snippet")]
        
        if not snippets:
            logger.warning(f"No snippets available for AI response generation for query: {query}")
            snippets = ["No search results available."]
        
        # Prepare the prompt
        prompt = f"Based on these search result snippets, craft a concise, engaging narrative or insight that answers the query '{query}' in a way that feels personal and actionable, without repeating verbatim facts.\n\nSearch snippets:\n" + "\n".join(snippets)
        
        # Prepare the request payload
        payload = {
            "model": "deepseek-chat",
            "messages": [
                {"role": "system", "content": "You are a helpful assistant that provides concise, engaging responses based on search results."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.7,
            "max_tokens": 500
        }
        
        # Make the API request
        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(
                    DEEPSEEK_API_URL,
                    headers={
                        "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json=payload,
                    timeout=30.0
                )
                
                if response.status_code == 200:
                    result = response.json()
                    ai_response = result.get("choices", [{}])[0].get("message", {}).get("content", "")
                    logger.info(f"Generated AI response: {ai_response}")
                    
                    # Save the AI response to the database
                    success = await update_search_with_ai_response(search_id, ai_response)
                    if success:
                        logger.info(f"Successfully saved AI response to database for search_id: {search_id}")
                    else:
                        logger.error(f"Failed to save AI response to database for search_id: {search_id}")
                    
                    # Also save to a local file for debugging
                    try:
                        os.makedirs(os.path.join(os.path.dirname(__file__), "../logs"), exist_ok=True)
                        with open(os.path.join(os.path.dirname(__file__), "../logs/ai_response.json"), "w") as f:
                            json.dump({"query": query, "search_id": search_id, "ai_response": ai_response}, f, indent=2)
                        logger.info("AI response saved to logs/ai_response.json")
                    except Exception as e:
                        logger.error(f"Failed to save AI response to file: {e}")
                    
                    return ai_response
                else:
                    logger.error(f"DeepSeek API error: {response.status_code} - {response.text}")
                    return None
            except httpx.TimeoutException:
                logger.error("DeepSeek API request timed out")
                return None
            except Exception as api_error:
                logger.error(f"Error making DeepSeek API request: {str(api_error)}")
                return None
                
    except Exception as e:
        logger.error(f"Error generating AI response: {str(e)}")
        logger.exception("Full exception details:")
        return None

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

@app.post("/api/search", response_model=SearchResponse)
async def search(query_request: SearchQuery, background_tasks: BackgroundTasks):
    try:
        logger.info(f"Search query received: {query_request.query}")
        
        # Get SerpAPI key from environment variables
        serpapi_key = os.getenv("SERPAPI_KEY")
        if not serpapi_key:
            logger.error("SERPAPI_KEY not found in environment variables")
            raise HTTPException(status_code=500, detail="SERPAPI_KEY not configured")
        
        logger.info(f"Using SerpAPI key starting with: {serpapi_key[:5]}...")
        logger.info(f"Making search request for query: {query_request.query}")
        
        # Create search parameters
        params = {
            "engine": "google",
            "q": query_request.query,
            "num": query_request.num_results,
            "api_key": serpapi_key,
            "gl": "us",  # Set to US for consistent results
            "hl": "en",  # Set to English for consistent results
        }
         
        # Only add location if it's provided
        if query_request.location:
            logger.info(f"Using location: {query_request.location}")
            params["location"] = query_request.location
        else:
            logger.info("No location provided, local results may not be relevant")

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
                logger.info(f"Query '{query_request.query}' returned {len(results.get('organic_results', []))} organic results")
                logger.info(f"Response valid: {'organic_results' in results}")
            
            # Save the SerpAPI response for debugging - but this should not affect database operations
            try:
                os.makedirs(os.path.join(os.path.dirname(__file__), "../logs"), exist_ok=True)
                with open(os.path.join(os.path.dirname(__file__), "../logs/response.json"), "w") as f:
                    json.dump(results, f)
                logger.info("SerpAPI response saved to logs/response.json")
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
            logger.info(f"Successfully using live data from SerpAPI for query: {query_request.query}")
        
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
            local_results_data = results["local_results"]["places"]
            logger.info(f"Extracted {len(local_results_data)} local results with thumbnails")
        else:
            logger.warning("No local_results.places found in search results")
        
        # Create separate components for SearchResult
        organic_results_normalized = normalize_organic_results(results.get("organic_results", []))
        local_results_normalized = normalize_local_results(local_results_data)
        knowledge_graph_normalized = normalize_knowledge_graph(results.get("knowledge_graph"))
        related_questions_normalized = [RelatedQuestion(**q) for q in results.get("related_questions", [])]
        related_searches_normalized = extract_related_searches(results.get("related_searches", []))
        
        # Ensure all data is properly serializable
        organic_results_serialized = [result.model_dump() for result in organic_results_normalized]
        local_results_serialized = [result.model_dump() for result in local_results_normalized] if local_results_normalized else None
        knowledge_graph_serialized = knowledge_graph_normalized.model_dump() if knowledge_graph_normalized else None
        related_questions_serialized = [q.model_dump() for q in related_questions_normalized] if related_questions_normalized else None
        
        # Create a SearchResult object with all serialized data
        search_result = SearchResult(
            query=query_request.query,
            organic_results=organic_results_serialized if organic_results_serialized else [], 
            local_results=local_results_serialized,
            knowledge_graph=knowledge_graph_serialized,
            related_questions=related_questions_serialized,
            related_searches=related_searches_normalized if related_searches_normalized else [],
            inline_images=results.get("inline_images", []),
            answer_box=results.get("answer_box"),
            location=query_request.location
        )
        
        # Try to save the search result, but continue if it fails
        try:
            # Debug log the size of the search result
            logger.info(f"SearchResult object created with {len(search_result.organic_results)} organic results")
            logger.info(f"SearchResult has {len(search_result.related_searches) if search_result.related_searches else 0} related searches")
            
            # Ensure all JSON fields are valid by converting to dict
            search_result_dict = search_result.model_dump()
            logger.info(f"About to save search result with ID: {search_result.id}")
            logger.info(f"Search result keys: {list(search_result_dict.keys())}")
            
            # Save a debug copy of the search result to file
            try:
                os.makedirs(os.path.join(os.path.dirname(__file__), "../logs"), exist_ok=True)
                with open(os.path.join(os.path.dirname(__file__), "../logs/search_result.json"), "w") as f:
                    json.dump(search_result_dict, f, indent=2, default=str)
                logger.info("Search result object saved to logs/search_result.json")
            except Exception as e:
                logger.error(f"Failed to save search result debug file: {e}")
                
            # Save to database
            search_id = await save_search_result(search_result)
            logger.info(f"Search result saved with ID: {search_id}")
            
            # Verify the save was successful
            saved_result = await get_search_result(search_id)
            if saved_result:
                logger.info(f"Successfully verified search result exists in database with keys: {list(saved_result.keys())}")
                
                # If any essential search components are missing, use a direct database update as a failsafe
                if not saved_result.get("organic_results") or len(saved_result.get("organic_results", [])) == 0:
                    logger.warning("Organic results missing in saved record, applying fallback fix")
                    # Use direct db update to fix missing data
                    try:
                        # Ensure we have at least the raw search results even if normalized ones failed
                        organic_results_raw = results.get("organic_results", [])[:5] if results else []
                        
                        update_data = {
                            "organic_results": organic_results_raw if organic_results_raw else search_result_dict["organic_results"],
                            "knowledge_graph": results.get("knowledge_graph") if results else search_result_dict["knowledge_graph"],
                            "local_results": local_results_data if local_results_data else search_result_dict["local_results"],
                            "related_questions": results.get("related_questions", [])[:3] if results else search_result_dict["related_questions"],
                            "related_searches": extract_related_searches(results.get("related_searches", [])) if results else search_result_dict["related_searches"]
                        }
                        
                        response = supabase_client.table("search_results").update(update_data).eq("id", search_id).execute()
                        if response.data:
                            logger.info("Successfully applied fallback fix for missing search components")
                        else:
                            logger.error("Failed to apply fallback fix")
                    except Exception as fallback_error:
                        logger.error(f"Error applying fallback fix: {str(fallback_error)}")
                
        except Exception as db_error:
            logger.error(f"Error saving search result: {str(db_error)}")
            logger.exception("Full exception details:")
            search_id = search_result.id
        
        # Prepare the response
        response = SearchResponse(
            query=query_request.query,
            organic_results=organic_results_normalized,
            local_results=local_results_normalized,
            knowledge_graph=knowledge_graph_normalized,
            related_questions=related_questions_normalized,
            related_searches=related_searches_normalized,
            inline_images=results.get("inline_images", []),
            answer_box=results.get("answer_box"),
            ai_response=None,  # Initially set to None
            search_id=search_id  # Add the search ID to the response
        )
        
        # Start the DeepSeek API call asynchronously
        background_tasks.add_task(
            generate_ai_response,
            query_request.query,
            results.get("organic_results", []),
            search_id
        )
        
        return response
        
    except Exception as e:
        logger.error(f"Error processing search request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/search/{search_id}/ai_response")
async def get_ai_response(search_id: str):
    """
    Get the AI-generated response for a specific search.
    
    Args:
        search_id: ID of the search to get the AI response for
        
    Returns:
        Dict containing the AI response or a pending status
    """
    try:
        # Try to get the search result from the database
        try:
            search_record = await get_search_result(search_id)
            
            if search_record and "ai_response" in search_record and search_record["ai_response"]:
                return {
                    "search_id": search_id,
                    "ai_response": search_record["ai_response"],
                    "status": "complete"
                }
        except Exception as db_error:
            logger.error(f"Error retrieving search result: {str(db_error)}")
            
        # If we couldn't retrieve from database or the AI response is not ready yet
        return {
            "search_id": search_id,
            "ai_response": None,
            "status": "pending"
        }
    except Exception as e:
        logger.error(f"Error retrieving AI response: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/search/{search_id}/fix")
async def fix_search_record(search_id: str):
    """
    Fix a specific search record by adding missing components.
    
    Args:
        search_id: ID of the search record to fix
        
    Returns:
        Dict containing the status of the fix operation
    """
    try:
        # Check if the search record exists
        search_record = await get_search_result(search_id)
        
        if not search_record:
            raise HTTPException(status_code=404, detail="Search record not found")
            
        # Check if the search record has missing components
        has_organic_results = bool(search_record.get("organic_results")) and len(search_record.get("organic_results", [])) > 0
        
        if has_organic_results:
            return {
                "search_id": search_id,
                "status": "ok",
                "message": "Search record already has all components"
            }
            
        # Fix the search record
        success = await fix_search_record_components(search_id)
        
        if success:
            return {
                "search_id": search_id,
                "status": "fixed",
                "message": "Search record fixed successfully"
            }
        else:
            raise HTTPException(status_code=500, detail="Failed to fix search record")
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fixing search record: {str(e)}")
        logger.exception("Full exception details:")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 