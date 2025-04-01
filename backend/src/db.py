import os
import logging
from supabase import create_client
from dotenv import load_dotenv
from typing import Dict, Any, Optional
import json

from .models import SearchResult, AIResponse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

# Export the supabase client to be used in other modules
if not supabase_url or not supabase_key:
    logger.warning("Supabase credentials not found. Database functionality will be disabled.")
    supabase_client = None
else:
    try:
        # Simple client initialization for version 1.0.4
        supabase_client = create_client(supabase_url, supabase_key)
        logger.info("Supabase client initialized successfully.")
    except TypeError as e:
        # If there's a TypeError (like unexpected keyword argument 'proxy')
        # Try an alternative initialization method
        if 'proxy' in str(e):
            try:
                logger.info("Trying alternative Supabase client initialization without proxy settings")
                # Import directly from supabase.client to have more control
                from supabase.client import Client
                
                # Create client instance directly without proxy parameter
                supabase_client = Client(
                    supabase_url=supabase_url,
                    supabase_key=supabase_key,
                )
                logger.info("Supabase client initialized with alternative method.")
            except Exception as alt_e:
                logger.error(f"Alternative Supabase client initialization failed: {str(alt_e)}")
                supabase_client = None
        else:
            logger.error(f"Failed to initialize Supabase client: {str(e)}")
            supabase_client = None
    except Exception as e:
        logger.error(f"Failed to initialize Supabase client: {str(e)}")
        supabase_client = None

# Export at module level for direct imports
__all__ = ['save_search_result', 'update_search_with_ai_response', 'get_search_result', 'supabase_client', 'fix_search_record_components']

async def save_search_result(result: SearchResult) -> Optional[str]:
    """
    Save a search result to the Supabase database.
    
    Args:
        result: SearchResult object to save
        
    Returns:
        Optional[str]: The ID of the created record or None if saving failed
    """
    if not supabase_client:
        logger.warning("Supabase client not available. Search result not saved.")
        return result.id
        
    try:
        # Convert the record to a dictionary
        result_dict = result.model_dump()
        
        # Handle datetime serialization
        result_dict["timestamp"] = result_dict["timestamp"].isoformat()
        
        # Debug: Log what we're trying to save
        logger.info(f"Attempting to save search result with ID: {result.id}")
        logger.info(f"Search result keys: {list(result_dict.keys())}")
        logger.info(f"Result contains organic_results: {bool(result_dict.get('organic_results'))}")
        
        # Fix column values to ensure they're properly formatted for Supabase
        
        # 1. For JSON arrays, ensure they're initialized as empty arrays if None
        # These should never be null in the database
        for array_field in ["organic_results", "related_searches"]:
            if result_dict.get(array_field) is None or not isinstance(result_dict[array_field], list):
                logger.warning(f"Field {array_field} is None or not a list, initializing as empty array")
                result_dict[array_field] = []
            
        # 2. For JSON objects, ensure they're properly formatted or set to null
        for object_field in ["knowledge_graph", "local_results", "related_questions", "inline_images", "answer_box"]:
            if result_dict.get(object_field) is None:
                # It's okay for these to be null
                result_dict[object_field] = None
            elif isinstance(result_dict[object_field], dict) and len(result_dict[object_field]) == 0:
                # Empty dict should be null in the database
                result_dict[object_field] = None
            elif isinstance(result_dict[object_field], list) and len(result_dict[object_field]) == 0:
                # Empty list for these fields should be null
                result_dict[object_field] = None
                
        # 3. Set a default query value if missing
        if not result_dict.get("query"):
            result_dict["query"] = "Unknown query"
        
        # Verify the data before saving
        logger.info(f"Verification before saving:")
        logger.info(f"- organic_results: {len(result_dict['organic_results']) if isinstance(result_dict.get('organic_results'), list) else 'Not a list'}")
        logger.info(f"- related_searches: {len(result_dict['related_searches']) if isinstance(result_dict.get('related_searches'), list) else 'Not a list'}")
            
        # Insert the record
        logger.info(f"Sending request to Supabase table: search_results")
        response = supabase_client.table("search_results").insert(result_dict).execute()
        logger.info(f"Response from Supabase: {response}")
        data = response.data
        
        if not data:
            logger.error(f"Failed to save search result: {response}")
            return None
            
        logger.info(f"Search result saved successfully with ID: {result.id}")
        return result.id
        
    except Exception as e:
        logger.error(f"Error saving search result: {str(e)}")
        logger.exception("Full exception details:")
        return None


async def update_search_with_ai_response(search_id: str, ai_response: str) -> bool:
    """
    Update a search result with an AI-generated response.
    
    Args:
        search_id: ID of the search result to update
        ai_response: AI-generated response text
        
    Returns:
        bool: True if the update was successful, False otherwise
    """
    if not supabase_client:
        logger.warning("Supabase client not available. AI response not saved.")
        return False
        
    try:
        logger.info(f"Updating search result with AI response for ID: {search_id}")
        
        # Update the search result with the AI response
        response = supabase_client.table("search_results") \
            .update({"ai_response": ai_response}) \
            .eq("id", search_id) \
            .execute()
            
        # Access data directly from response object
        data = response.data
        
        if not data:
            logger.error(f"Failed to update search result with AI response: {response}")
            return False
            
        logger.info(f"Search result updated with AI response")
            
        # Also save in the ai_responses table for a more detailed record
        try:
            ai_response_record = AIResponse(
                search_id=search_id,
                response=ai_response
            )
            
            ai_response_dict = ai_response_record.model_dump()
            ai_response_dict["timestamp"] = ai_response_dict["timestamp"].isoformat()
            
            logger.info(f"Saving AI response to ai_responses table for search_id: {search_id}")
            ai_response_result = supabase_client.table("ai_responses").insert(ai_response_dict).execute()
            
            ai_data = ai_response_result.data
            
            if not ai_data:
                logger.error(f"Failed to save AI response record to ai_responses table")
                # Continue even if this fails, since we already updated the main record
            else:
                logger.info(f"AI response record saved to ai_responses table with ID: {ai_data[0].get('id', 'unknown')}")
        except Exception as ai_resp_error:
            logger.error(f"Error saving to ai_responses table: {str(ai_resp_error)}")
            logger.exception("Full exception details for ai_responses save:")
        
        # Return True even if the ai_responses table update failed, as long as the main record was updated
        return True
        
    except Exception as e:
        logger.error(f"Error updating search with AI response: {str(e)}")
        logger.exception("Full exception details:")
        return False


async def get_search_result(search_id: str) -> Optional[Dict[str, Any]]:
    """
    Retrieve a search result by ID.
    
    Args:
        search_id: ID of the search result to retrieve
        
    Returns:
        Optional[Dict[str, Any]]: The search result as a dictionary or None if not found
    """
    if not supabase_client:
        logger.warning("Supabase client not available. Cannot retrieve search result.")
        return None
        
    try:
        logger.info(f"Attempting to retrieve search result with ID: {search_id}")
        response = supabase_client.table("search_results") \
            .select("*") \
            .eq("id", search_id) \
            .execute()
            
        # Access data directly from the response object
        data = response.data
        
        if not data:
            logger.warning(f"No search result found with ID: {search_id}")
            return None
            
        logger.info(f"Retrieved search result with ID: {search_id}")
        logger.info(f"Result data keys: {list(data[0].keys())}")
        logger.info(f"Result contains organic_results: {bool(data[0].get('organic_results'))}")
        logger.info(f"Result contains ai_response: {bool(data[0].get('ai_response'))}")
        
        return data[0]
        
    except Exception as e:
        logger.error(f"Error retrieving search result: {str(e)}")
        logger.exception("Full exception details:")
        return None


async def fix_search_record_components(search_id: str, mock_data_path: str = None) -> bool:
    """
    Fix a specific search record by adding missing components from mock data.
    
    Args:
        search_id: ID of the search record to fix
        mock_data_path: Path to the mock data file (optional)
        
    Returns:
        bool: True if the record was fixed successfully, False otherwise
    """
    if not supabase_client:
        logger.warning("Supabase client not available. Cannot fix search record.")
        return False
        
    try:
        # Get the search record
        record = await get_search_result(search_id)
        
        if not record:
            logger.warning(f"No search record found with ID: {search_id}")
            return False
            
        logger.info(f"Found search record with ID: {search_id}")
        
        # Check if the record already has components
        has_organic_results = bool(record.get("organic_results"))
        logger.info(f"Record has organic_results: {has_organic_results}")
        
        # Only fix if components are missing
        if has_organic_results and len(record.get("organic_results", [])) > 0:
            logger.info("Record already has organic_results, skipping fix")
            return True
            
        # Load mock data
        if not mock_data_path:
            mock_data_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "mockSerpData.json")
            
        logger.info(f"Loading mock data from: {mock_data_path}")
        
        try:
            with open(mock_data_path, 'r') as f:
                mock_data = json.load(f)
        except Exception as load_error:
            logger.error(f"Error loading mock data: {str(load_error)}")
            return False
            
        # Extract components
        organic_results = mock_data.get("organic_results", [])[:3]
        knowledge_graph = mock_data.get("knowledge_graph")
        local_results = mock_data.get("local_results", {}).get("places", [])[:2]
        related_questions = mock_data.get("related_questions", [])[:3]
        related_searches = [item.get("query", "") for item in mock_data.get("related_searches", [])[:5]]
        
        # Update the record
        update_data = {
            "organic_results": organic_results,
            "knowledge_graph": knowledge_graph,
            "local_results": local_results,
            "related_questions": related_questions,
            "related_searches": related_searches
        }
        
        logger.info("Updating record with missing components")
        response = supabase_client.table("search_results").update(update_data).eq("id", search_id).execute()
        
        if not response.data:
            logger.error(f"Failed to update search record: {response}")
            return False
            
        logger.info(f"Successfully updated search record with ID: {search_id}")
        return True
        
    except Exception as e:
        logger.error(f"Error fixing search record: {str(e)}")
        logger.exception("Full exception details:")
        return False 