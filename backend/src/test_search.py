import httpx
import json
from typing import Dict, Any
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich import print as rprint
import time
import sys
from dotenv import load_dotenv
import os

console = Console()

load_dotenv()  # Load environment variables from .env file

serpapi_key = os.getenv('SERPAPI_KEY')

def format_results(response: Dict[str, Any]) -> None:
    """Format and display search results in a readable way."""
    # Display query 
    console.print(Panel(f"[bold blue]Search Query:[/bold blue] {response['query']}", title="Search Results"))
    
    # Check for error in response
    if response.get("error"):
        console.print(Panel(f"[bold red]Error:[/bold red] {response['error']}", title="Error"))
        return

    # Display search metadata if available
    if response.get("search_metadata"):
        metadata = response["search_metadata"]
        console.print(Panel(
            f"[bold]Status:[/bold] {metadata.get('status', 'N/A')}\n"
            f"[bold]Total Time:[/bold] {metadata.get('total_time_taken', 'N/A')} seconds",
            title="Search Metadata"
        ))

    # Display organic results
    if response.get("organic_results"):
        table = Table(title="Organic Results", show_header=True, header_style="bold magenta")
        table.add_column("Position", style="dim")
        table.add_column("Title", style="bold")
        table.add_column("Link", style="blue")
        table.add_column("Snippet", style="white")

        for result in response["organic_results"]:
            table.add_row(
                str(result.get("position", "N/A")),
                result.get("title", "No title"),
                result.get("link", "No link"),
                result.get("snippet", "No snippet")
            )
        console.print(table)

    # Display knowledge graph if available
    if response.get("knowledge_graph"):
        try:
            kg = response["knowledge_graph"]
            
            # Extract title and description if available
            title = kg.get("title", "No title")
            description = kg.get("description", "No description available")
            
            # Display basic info
            kg_panel = f"[bold green]Knowledge Graph:[/bold green]\n"
            kg_panel += f"Title: {title}\n"
            kg_panel += f"Description: {description}\n"
            
            # Display attributes if available
            if kg.get("list"):
                kg_panel += "Attributes:\n"
                for k, v in kg.get("list", {}).items():
                    kg_panel += f"  {k}: {v}\n"
            
            console.print(Panel(kg_panel, title="Knowledge Graph"))
            
        except Exception as e:
            console.print(f"[red]Error displaying knowledge graph: {str(e)}[/red]")
            console.print(f"[dim]Knowledge graph data: {kg}[/dim]")

    # Display local results if available
    if response.get("local_results") and response["local_results"].get("places"):
        table = Table(title="Local Results", show_header=True, header_style="bold yellow")
        table.add_column("Title", style="bold")
        table.add_column("Address", style="white")
        table.add_column("Rating", style="green")
        table.add_column("Reviews", style="cyan")
        table.add_column("Type", style="magenta")

        for result in response["local_results"]["places"]:
            table.add_row(
                result.get("title", "No title"),
                result.get("address", "No address"),
                str(result.get("rating", "N/A")),
                str(result.get("reviews", "N/A")),
                result.get("type", "N/A")
            )
        console.print(table)

    # Display recipes if available
    if response.get("recipes_results"):
        table = Table(title="Recipe Results", show_header=True, header_style="bold green")
        table.add_column("Title", style="bold")
        table.add_column("Source", style="white")
        table.add_column("Time", style="green")
        table.add_column("Ingredients", style="cyan")

        for result in response["recipes_results"]:
            ingredients = ", ".join(result.get("ingredients", [])) if result.get("ingredients") else "N/A"
            table.add_row(
                result.get("title", "No title"),
                result.get("source", "Unknown source"),
                result.get("total_time", "N/A"),
                ingredients
            )
        console.print(table)

    # Display related questions if available
    if response.get("related_questions"):
        try:
            questions_text = "\n".join([
                f"[bold]Q:[/bold] {q.get('question', 'No question')}\n"
                f"[italic]A:[/italic] {q.get('snippet', 'No answer available')}\n"
                for q in response["related_questions"]
            ])
            console.print(Panel(questions_text, title="Related Questions"))
        except Exception as e:
            console.print(f"[red]Error displaying related questions: {str(e)}[/red]")

    # Display related searches if available
    if response.get("related_searches"):
        try:
            # Check if related_searches is a list of strings or a list of objects
            if isinstance(response["related_searches"], list):
                if response["related_searches"] and isinstance(response["related_searches"][0], dict):
                    # It's a list of objects with query field
                    search_text = "\n".join([
                        f"• {item.get('query', 'Unknown')}" 
                        for item in response["related_searches"]
                    ])
                else:
                    # It's a list of strings
                    search_text = "\n".join([f"• {item}" for item in response["related_searches"]])
                    
                console.print(Panel(search_text, title="Related Searches"))
        except Exception as e:
            console.print(f"[red]Error displaying related searches: {str(e)}[/red]")

    # Display answer box if available
    if response.get("answer_box"):
        try:
            answer_box = response["answer_box"]
            content = ""
            
            if answer_box.get("type"):
                content += f"[bold]Type:[/bold] {answer_box.get('type')}\n"
            
            if answer_box.get("answer"):
                content += f"[bold]Answer:[/bold] {answer_box.get('answer')}\n"
            
            if answer_box.get("title"):
                content += f"[bold]Title:[/bold] {answer_box.get('title')}\n"
                
            if answer_box.get("snippet"):
                content += f"[bold]Snippet:[/bold] {answer_box.get('snippet')}\n"
                
            console.print(Panel(content, title="Answer Box"))
        except Exception as e:
            console.print(f"[red]Error displaying answer box: {str(e)}[/red]")

async def test_search(query: str, num_results: int = 10) -> None:
    """Test the search API with a given query."""
    async with httpx.AsyncClient(timeout=30.0) as client:
        try:
            console.print(f"[yellow]Making request to API...[/yellow]")
            response = await client.post(
                "http://127.0.0.1:8000/api/search",
                json={"query": query, "num_results": num_results}
            )
            
            if response.status_code != 200:
                console.print(f"[red]Error: {response.status_code} - {response.text}[/red]")
                return
                
            format_results(response.json())
            
        except httpx.ConnectError as e:
            console.print(f"[red]Connection Error: Could not connect to the server. Make sure it's running at http://127.0.0.1:8000[/red]")
        except httpx.TimeoutException as e:
            console.print(f"[red]Timeout Error: The request took too long to complete.[/red]")
        except Exception as e:
            console.print(f"[red]Unexpected error: {str(e)}[/red]")

async def main():
    # Test queries for different types of results
    test_queries = [
        # "What is the capital of France?",  # Knowledge graph and answer box
        "restaurants in New York",  # Local results
        # "Python programming",  # Organic results and related questions
        # "latest news",  # News results
        # "weather in London",  # Weather results
    ]

    for query in test_queries:
        console.print("\n" + "="*80)
        console.print(f"[bold yellow]Testing query:[/bold yellow] {query}")
        await test_search(query)
        console.print("\n" + "="*80)
        time.sleep(1)  # Add a small delay between requests

if __name__ == "__main__":
    import asyncio
    print(sys.executable)
    asyncio.run(main()) 