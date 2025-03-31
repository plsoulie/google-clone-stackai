from serpapi import GoogleSearch
import json

# Parameters based on what's in our backend code
params = {
    'q': 'testing serpapi',
    'api_key': 'a5ea802c16d807959aa91eca47efc339a6cd42f33b68c8d3613e64646a9c7f65',
    'engine': 'google',
    'num': 10,
    'gl': 'us',
    'hl': 'en'
}

print('Making SerpAPI call...')
try:
    search = GoogleSearch(params)
    results = search.get_dict()
    print(f'Results received: {results.keys() if results else "None"}')
    print("Full response:")
    print(json.dumps(results, indent=2)[:1000])  # Print first 1000 chars to avoid overwhelming the output
    
    # Save the first result to check content
    if results.get("organic_results"):
        first_result = results["organic_results"][0]
        print(f"First result title: {first_result.get('title')}")
        print(f"First result snippet: {first_result.get('snippet')}")
except Exception as e:
    print(f'Error: {e}') 