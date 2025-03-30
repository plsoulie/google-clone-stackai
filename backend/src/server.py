import asyncio
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import json
from typing import Dict, Any, Optional, List
import os
from dotenv import load_dotenv
from rich.console import Console
import httpx
from serpapi import GoogleSearch

# Import the test_search functionality
from test_search import format_results

# Load environment variables
load_dotenv()

# Check if SERPAPI_KEY is set
serpapi_key = os.getenv('SERPAPI_KEY')
if not serpapi_key:
    print("Warning: SERPAPI_KEY not found in environment variables.")
else:
    print(f"SERPAPI_KEY found. First 4 characters: {serpapi_key[:4]}...")

app = FastAPI()
console = Console()

# Add CORS middleware to allow requests from the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, in production specify the actual origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class SearchRequest(BaseModel):
    query: str
    num_results: int = 10

class SearchResponse(BaseModel):
    query: str
    organic_results: Optional[List[Dict[str, Any]]] = None
    knowledge_graph: Optional[Dict[str, Any]] = None
    local_results: Optional[Dict[str, Any]] = None
    related_questions: Optional[List[Dict[str, Any]]] = None
    related_searches: Optional[List[Dict[str, Any]]] = None
    answer_box: Optional[Dict[str, Any]] = None
    search_metadata: Optional[Dict[str, Any]] = None
    search_parameters: Optional[Dict[str, Any]] = None
    search_information: Optional[Dict[str, Any]] = None
    recipes_results: Optional[List[Dict[str, Any]]] = None
    error: Optional[str] = None

# Make real search API calls using SerpAPI
async def search_with_serpapi(query: str, num_results: int = 10) -> Dict[str, Any]:
    console.print(f"[yellow]Making SerpAPI request for:[/yellow] {query}")
    
    if not serpapi_key:
        console.print("[red]Error: SERPAPI_KEY is not set in the environment variables.[/red]")
        return {"query": query, "error": "SERPAPI_KEY not set"}
    
    try:
        # Set up the SerpAPI parameters
        params = {
            "engine": "google",
            "q": query,
            "api_key": serpapi_key,
            "num": num_results,
            "hl": "en",
            "gl": "us"
        }
        
        # Make the API request
        search = GoogleSearch(params)
        results = search.get_dict()
        
        # Debug: Print the API response keys
        console.print(f"[blue]SerpAPI Response Keys:[/blue] {', '.join(results.keys())}")
        
        # Create a response object with the query and all relevant sections
        response = {
            "query": query,
            "search_metadata": results.get("search_metadata", {}),
            "search_parameters": results.get("search_parameters", {}),
            "search_information": results.get("search_information", {})
        }
        
        # Copy all available sections from the SerpAPI response
        for key in [
            "organic_results", 
            "related_questions", 
            "related_searches", 
            "answer_box", 
            "recipes_results"
        ]:
            if key in results:
                response[key] = results[key]
        
        # Handle knowledge_graph specially (since it has a complex structure)
        if "knowledge_graph" in results:
            kg = results["knowledge_graph"]
            response["knowledge_graph"] = {}
            
            # Copy all fields, but handle the ones we specifically format
            for k, v in kg.items():
                response["knowledge_graph"][k] = v
        
        # Handle local_results specially (since it has a complex structure)
        if "local_results" in results:
            response["local_results"] = results["local_results"]
            
        # Format and print results to terminal
        format_results(response)
        
        return response
    
    except Exception as e:
        console.print(f"[red]Error making SerpAPI request: {str(e)}[/red]")
        # Return a fallback response with error information
        return {
            "query": query,
            "error": str(e),
            "organic_results": [
                {
                    "position": 1,
                    "title": "Error performing search",
                    "link": "https://example.com/error",
                    "snippet": f"An error occurred: {str(e)}"
                }
            ]
        }

@app.post("/api/search", response_model=SearchResponse)
async def search(request: SearchRequest):
    if not request.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    # Make a real search API call
    results = await search_with_serpapi(request.query, request.num_results)
    
    return results

if __name__ == "__main__":
    uvicorn.run("server:app", host="127.0.0.1", port=8000, reload=True) 