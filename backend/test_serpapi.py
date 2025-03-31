import os
import json
from dotenv import load_dotenv
from serpapi import GoogleSearch

# Load environment variables
load_dotenv()
serpapi_key = os.getenv("SERPAPI_KEY")
print(f"Using API key (first 5 chars): {serpapi_key[:5]}...")

# Set up search parameters
params = {
    "q": "test query",
    "engine": "google",
    "api_key": serpapi_key
}

try:
    print("Making API call to SerpAPI...")
    search = GoogleSearch(params)
    results = search.get_dict()
    
    if "error" in results:
        print(f"SerpAPI returned an error: {results.get('error')}")
    else:
        print(f"Success! Found {len(results.get('organic_results', []))} organic results")
        print(f"Response keys: {list(results.keys())}")
        
        # Save results to file
        with open("test_response.json", "w") as f:
            json.dump(results, f)
        print("Results saved to test_response.json")
except Exception as e:
    print(f"Error during search: {str(e)}")
