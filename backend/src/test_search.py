import httpx
import json
from typing import Dict, Any
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich import print as rprint
import time

console = Console()

def format_results(response: Dict[str, Any]) -> None:
    """Format and display search results in a readable way."""
    # Display query
    console.print(Panel(f"[bold blue]Search Query:[/bold blue] {response['query']}", title="Search Results"))

    # Display organic results
    if response.get("organic_results"):
        table = Table(title="Organic Results", show_header=True, header_style="bold magenta")
        table.add_column("Position", style="dim")
        table.add_column("Title", style="bold")
        table.add_column("Link", style="blue")
        table.add_column("Snippet", style="white")

        for result in response["organic_results"]:
            table.add_row(
                str(result["position"]),
                result["title"],
                result["link"],
                result["snippet"]
            )
        console.print(table)

    # Display knowledge graph if available
    if response.get("knowledge_graph"):
        kg = response["knowledge_graph"]
        console.print(Panel(
            f"[bold green]Knowledge Graph:[/bold green]\n"
            f"Title: {kg['title']}\n"
            f"Description: {kg['description']}\n"
            f"Attributes: {json.dumps(kg['attributes'], indent=2)}",
            title="Knowledge Graph"
        ))

    # Display local results if available
    if response.get("local_results"):
        table = Table(title="Local Results", show_header=True, header_style="bold yellow")
        table.add_column("Title", style="bold")
        table.add_column("Address", style="white")
        table.add_column("Rating", style="green")
        table.add_column("Reviews", style="cyan")
        table.add_column("Phone", style="magenta")
        table.add_column("Website", style="blue")

        for result in response["local_results"]:
            table.add_row(
                result["title"],
                result["address"],
                str(result.get("rating", "N/A")),
                str(result.get("reviews", "N/A")),
                result.get("phone", "N/A"),
                result.get("website", "N/A")
            )
        console.print(table)

    # Display related questions if available
    if response.get("related_questions"):
        console.print(Panel(
            "\n".join([
                f"[bold]Q:[/bold] {q['question']}\n"
                f"[italic]A:[/italic] {q.get('snippet', 'No answer available')}\n"
                for q in response["related_questions"]
            ]),
            title="Related Questions"
        ))

    # Display related searches if available
    if response.get("related_searches"):
        console.print(Panel(
            "\n".join(response["related_searches"]),
            title="Related Searches"
        ))

    # Display answer box if available
    if response.get("answer_box"):
        console.print(Panel(
            f"[bold]Type:[/bold] {response['answer_box'].get('type', 'N/A')}\n"
            f"[bold]Answer:[/bold] {response['answer_box'].get('answer', 'N/A')}",
            title="Answer Box"
        ))

    # Display AI response if available
    if response.get("ai_response"):
        console.print(Panel(
            response["ai_response"],
            title="AI Response"
        ))

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
    asyncio.run(main()) 