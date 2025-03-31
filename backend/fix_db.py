import os
import sys
import json
import asyncio
import uuid
from datetime import datetime
from dotenv import load_dotenv
from supabase import create_client

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    print("Supabase credentials not found.")
    sys.exit(1)

supabase = create_client(supabase_url, supabase_key)

async def fix_search_record(search_id):
    print(f"Fixing search record with ID: {search_id}")
    
    # First check if the record exists
    try:
        response = supabase.table("search_results").select("*").eq("id", search_id).execute()
        data = response.data
        
        if not data:
            print(f"No search result found with ID: {search_id}")
            return
        
        existing_record = data[0]
        print(f"Found existing record with ID: {search_id}")
        print(f"Query: {existing_record.get('query')}")
        print(f"AI Response exists: {bool(existing_record.get('ai_response'))}")
        
        # Get sample search data from a mock
        mock_file_path = os.path.join(os.path.dirname(__file__), "mockSerpData.json")
        print(f"Loading mock data from: {mock_file_path}")
        with open(mock_file_path, 'r') as f:
            mock_data = json.load(f)
        
        # Extract components to add to the record
        organic_results = mock_data.get("organic_results", [])[:3]  # Only use first 3 for simplicity
        knowledge_graph = mock_data.get("knowledge_graph")
        local_results = mock_data.get("local_results", {}).get("places", [])[:2]  # Only use first 2
        related_questions = mock_data.get("related_questions", [])[:3]  # Only use first 3
        related_searches = [item.get("query", "") for item in mock_data.get("related_searches", [])[:5]]
        
        # Update the record with the missing components
        update_data = {
            "query": existing_record.get("query", "debugging database issues"),
            "organic_results": organic_results,
            "knowledge_graph": knowledge_graph,
            "local_results": local_results,
            "related_questions": related_questions,
            "related_searches": related_searches
        }
        
        print("Updating record with components:")
        print(f"- organic_results: {len(organic_results)} items")
        print(f"- local_results: {len(local_results)} items")
        print(f"- related_questions: {len(related_questions)} items")
        print(f"- related_searches: {len(related_searches)} items")
        print(f"- knowledge_graph: {'Present' if knowledge_graph else 'None'}")
        
        # Update the record
        response = supabase.table("search_results").update(update_data).eq("id", search_id).execute()
        
        if response.data:
            print(f"Successfully updated search record with ID: {search_id}")
            return True
        else:
            print(f"Failed to update search record: {response}")
            return False
        
    except Exception as e:
        print(f"Error fixing search record: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python fix_db.py <search_id>")
        sys.exit(1)
    
    search_id = sys.argv[1]
    asyncio.run(fix_search_record(search_id)) 