from duckduckgo_search import DDGS

def get_search_results(query: str, max_results: int = 5) -> str:
    """Useful to search the internet about a given topic and return factual results."""
    try:
        results = DDGS().text(query, max_results=max_results)
        if not results:
            return "No internet search results found."
            
        formatted_results = []
        for res in results:
            formatted_results.append(
                f"URL: {res.get('href', 'Unknown')}\n"
                f"Title: {res.get('title', 'Unknown')}\n"
                f"Content: {res.get('body', 'Unknown')}\n"
            )
        return "\n---\n".join(formatted_results)
    except Exception as e:
        return f"Internet search error: {str(e)}"
