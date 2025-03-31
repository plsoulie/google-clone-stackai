import os
import json
import requests
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables
load_dotenv()

# Define the search queries to test
test_queries = [
    "What is the capital of France?",  # Knowledge graph and answer box
    "restaurants in New York",         # Local results
    "Python programming",              # Organic results and related questions
    "latest news",                     # News results
    "weather in London",               # Weather results
    "Fast food open near me"           # Local results with time context
]

# Define the backend API endpoint
API_ENDPOINT = "http://localhost:8000/api/search"

def test_search_queries():
    print(f"Testing {len(test_queries)} search queries...")
    
    results = {}
    
    for query in test_queries:
        print(f"\nTesting query: '{query}'")
        
        # Make the request to the backend
        try:
            response = requests.post(
                API_ENDPOINT,
                json={"query": query, "num_results": 10},
                timeout=30
            )
            
            # Check if request was successful
            if response.status_code == 200:
                print(f"✓ Success ({response.status_code})")
                results[query] = response.json()
            else:
                print(f"✗ Error ({response.status_code}): {response.text}")
                results[query] = {"error": f"HTTP {response.status_code}", "details": response.text}
                
        except requests.exceptions.RequestException as e:
            print(f"✗ Request failed: {str(e)}")
            results[query] = {"error": "Request failed", "details": str(e)}
    
    # Create a results directory if it doesn't exist
    results_dir = Path("search_results")
    results_dir.mkdir(exist_ok=True)
    
    # Save results to a JSON file
    timestamp = os.path.join(results_dir, "search_test_results.json")
    with open(timestamp, "w") as f:
        json.dump(results, f, indent=2)
    
    print(f"\nResults saved to {timestamp}")
    
    # Generate a summary
    summary = {}
    for query, result in results.items():
        if "error" in result:
            summary[query] = {"status": "error", "error": result["error"]}
        else:
            # Count the different types of results
            summary[query] = {
                "status": "success",
                "organic_results": len(result.get("organic_results", [])),
                "local_results": "present" if result.get("local_results") else "none",
                "knowledge_graph": "present" if result.get("knowledge_graph") else "none",
                "related_questions": len(result.get("related_questions", [])),
            }
    
    # Save summary to a separate file
    summary_path = os.path.join(results_dir, "search_test_summary.json")
    with open(summary_path, "w") as f:
        json.dump(summary, f, indent=2)
    
    print(f"Summary saved to {summary_path}")

if __name__ == "__main__":
    test_search_queries() 