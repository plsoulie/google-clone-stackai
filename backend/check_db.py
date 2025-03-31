import os
import sys
import asyncio
from dotenv import load_dotenv
from supabase import create_client
import json

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    print("Supabase credentials not found.")
    sys.exit(1)

supabase = create_client(supabase_url, supabase_key)

async def check_search_result(search_id):
    print(f"Checking database for search_id: {search_id}")
    
    # Query the search_results table
    try:
        response = supabase.table("search_results").select("*").eq("id", search_id).execute()
        
        # Access data directly from response object (not as a dict)
        data = response.data
        
        if not data:
            print(f"No search result found with ID: {search_id}")
            return
        
        result = data[0]
        print("\nSearch Result Database Entry:")
        print(f"ID: {result.get('id')}")
        print(f"Query: {result.get('query')}")
        print(f"Timestamp: {result.get('timestamp')}")
        print(f"AI Response: {result.get('ai_response')}")
        print(f"Location: {result.get('location')}")
        
        # Check what components are present in the search result
        components = [
            "organic_results", 
            "knowledge_graph", 
            "local_results", 
            "related_questions", 
            "related_searches", 
            "inline_images", 
            "answer_box"
        ]
        
        print("\nComponents Present:")
        for component in components:
            value = result.get(component)
            if isinstance(value, list):
                print(f"- {component}: {len(value)} items")
                if len(value) > 0:
                    print(f"  First item keys: {list(value[0].keys()) if isinstance(value[0], dict) else 'Not a dict'}")
            elif value is not None:
                print(f"- {component}: Present")
                if isinstance(value, dict):
                    print(f"  Keys: {list(value.keys())}")
            else:
                print(f"- {component}: None")
                
        # Also check if there's an entry in the ai_responses table
        ai_response = supabase.table("ai_responses").select("*").eq("search_id", search_id).execute()
        
        ai_data = ai_response.data
        
        if ai_data:
            print("\nAI Response Entry:")
            print(f"ID: {ai_data[0].get('id')}")
            print(f"Search ID: {ai_data[0].get('search_id')}")
            print(f"Timestamp: {ai_data[0].get('timestamp')}")
            print(f"Response: {ai_data[0].get('response')}")
        else:
            print("\nNo AI Response entry found for this search ID")
    
    except Exception as e:
        print(f"Error querying database: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python check_db.py <search_id>")
        sys.exit(1)
    
    search_id = sys.argv[1]
    asyncio.run(check_search_result(search_id)) 