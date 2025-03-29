from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from serpapi import GoogleSearch
import os
from dotenv import load_dotenv
from typing import List, Optional, Dict, Any

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
    for result in results:
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
    for result in results:
        normalized.append(LocalResult(
            title=result.get("title", ""),
            address=result.get("address", ""),
            rating=result.get("rating", None),
            reviews=result.get("reviews", None),
            phone=result.get("phone", None),
            website=result.get("website", None)
        ))
    return normalized

def normalize_knowledge_graph(graph: Dict[str, Any]) -> KnowledgeGraph:
    if not graph:
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

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

@app.post("/api/search", response_model=SearchResponse)
async def search(query: SearchQuery):
    try:
        # Get SerpAPI key from environment variables
        serpapi_key = os.getenv("SERPAPI_KEY")
        if not serpapi_key:
            raise HTTPException(status_code=500, detail="SERPAPI_KEY not configured")

        # Create search parameters
        params = {
            "engine": "google",
            "q": query.query,
            "num": query.num_results,
            "api_key": serpapi_key,
            "gl": "us",  # Set to US for consistent results
            "hl": "en"   # Set to English for consistent results
        }

        # Perform the search
        search = GoogleSearch(params)
        results = search.get_dict()

        # Extract and normalize different result types
        response = SearchResponse(
            query=query.query,
            organic_results=normalize_organic_results(results.get("organic_results", [])),
            local_results=normalize_local_results(results.get("local_results", [])),
            knowledge_graph=normalize_knowledge_graph(results.get("knowledge_graph", {})),
            related_questions=[
                RelatedQuestion(
                    question=q.get("question", ""),
                    snippet=q.get("snippet", None)
                )
                for q in results.get("related_questions", [])
            ],
            related_searches=results.get("related_searches", []),
            inline_images=results.get("inline_images", []),
            answer_box=results.get("answer_box", None),
            ai_response=results.get("ai_generated_response", None)
        )

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 