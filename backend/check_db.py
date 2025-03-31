import asyncio
import json
from src.db import get_search_result

async def run():
    # Try to get the latest search result
    search_id = '4d32f618-6f31-458f-8713-1e9df0765bd5'  # Updated to the latest search ID
    
    result = await get_search_result(search_id)
    if result:
        # Print the local_results structure
        local_results = result.get('local_results')
        print("Local results found in database:")
        print(json.dumps(local_results, indent=2))
        
        # Check if thumbnails exist
        if local_results:
            for i, item in enumerate(local_results):
                print(f"Item {i+1} title: {item.get('title')}")
                print(f"Item {i+1} thumbnail: {item.get('thumbnail')}")
        else:
            print("No local results found in this search.")
    else:
        print(f"No search result found with ID: {search_id}")

if __name__ == "__main__":
    asyncio.run(run()) 