import requests
import os
from dotenv import load_dotenv
load_dotenv()

def get_news(query: str) -> str:
    return _fetch_news(query)

def get_targeted_news(queries: list) -> str:
    """Search multiple specific queries and combine results"""
    all_results = ""
    for query in queries:
        results = _fetch_news(query, pageSize=3)
        if results != "No recent news found.":
            all_results += f"\n[Search: '{query}']\n{results}"
    return all_results if all_results else "No recent news found."

def _fetch_news(query: str, pageSize: int = 5) -> str:
    url = "https://newsapi.org/v2/everything"
    params = {
        "q": query,
        "sortBy": "publishedAt",
        "pageSize": pageSize,
        "language": "en",
        "apiKey": os.getenv("NEWS_API_KEY")
    }
    try:
        response = requests.get(url, params=params)
        articles = response.json().get("articles", [])
        if not articles:
            return "No recent news found."
        result = ""
        for a in articles:
            title = a.get('title', '')
            desc = a.get('description', '')
            date = a.get('publishedAt', '')[:10]
            result += f"- [{date}] {title}: {desc}\n"
        return result
    except:
        return "News fetch failed."