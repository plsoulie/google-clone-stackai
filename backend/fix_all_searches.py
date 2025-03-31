import os
import sys
import json
import asyncio
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

async def fix_all_search_records():
    print("Fixing all search records in the database...")
    
    # Get all search records
    try:
        response = supabase.table("search_results").select("id,query,ai_response").execute()
        data = response.data
        
        if not data:
            print("No search results found in the database.")
            return
        
        print(f"Found {len(data)} search records to process")
        
        # Get sample search data from the mock file
        mock_file_path = os.path.join(os.path.dirname(__file__), "mockSerpData.json")
        print(f"Loading mock data from: {mock_file_path}")
        with open(mock_file_path, 'r') as f:
            mock_data = json.load(f)
        
        # Extract components to add to the records
        organic_results = mock_data.get("organic_results", [])[:3]  # Only use first 3 for simplicity
        knowledge_graph = mock_data.get("knowledge_graph")
        local_results = mock_data.get("local_results", {}).get("places", [])[:2]  # Only use first 2
        related_questions = mock_data.get("related_questions", [])[:3]  # Only use first 3
        related_searches = [item.get("query", "") for item in mock_data.get("related_searches", [])[:5]]
        
        # Create update data template
        update_data_template = {
            "organic_results": organic_results,
            "knowledge_graph": knowledge_graph,
            "local_results": local_results,
            "related_questions": related_questions,
            "related_searches": related_searches
        }
        
        # Counters for statistics
        success_count = 0
        error_count = 0
        
        # Process each record
        for record in data:
            record_id = record.get("id")
            record_query = record.get("query")
            has_ai_response = bool(record.get("ai_response"))
            
            print(f"\nProcessing record {record_id}")
            print(f"Query: {record_query}")
            print(f"Has AI response: {has_ai_response}")
            
            try:
                # Create a copy of the update template and add the query
                update_data = update_data_template.copy()
                update_data["query"] = record_query if record_query else "Unknown query"
                
                # Update the record
                response = supabase.table("search_results").update(update_data).eq("id", record_id).execute()
                
                if response.data:
                    print(f"Successfully updated search record")
                    success_count += 1
                else:
                    print(f"Failed to update search record: {response}")
                    error_count += 1
            
            except Exception as e:
                print(f"Error updating search record: {e}")
                error_count += 1
        
        print("\nSummary:")
        print(f"Total records processed: {len(data)}")
        print(f"Successfully updated: {success_count}")
        print(f"Failed to update: {error_count}")
        
    except Exception as e:
        print(f"Error retrieving search records: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(fix_all_search_records()) 