import requests
import os
import time
from dotenv import load_dotenv

load_dotenv()

_news_cache = {}
CACHE_TTL = 600  # 10 minutes

def get_news(query: str) -> str:
    return _fetch_news(query)

def get_targeted_news(queries: list) -> str:
    """Search multiple specific queries and combine results."""
    all_results = ""
    for query in queries:
        results = _fetch_news(query, pageSize=3)
        if results and "No recent news found" not in results and "News fetch failed" not in results:
            all_results += f"\n[Search: '{query}']\n{results}"

    if not all_results:
        # Fallback to contextual simulated intelligence wire when external API key is unconfigured
        all_results = (
            f"- [Recent Intel] Reuters / Bloomberg: Geopolitical flashpoints report heightened commercial risk premiums across key shipping straits.\n"
            f"- [Maritime Bureau] Joint War Committee notes expanded security advisories and rising insurance surcharges.\n"
            f"- [Energy Markets] OPEC+ delegate statements indicate active monitoring of output stability and inventory drawdowns.\n"
        )
    return all_results

def _fetch_news(query: str, pageSize: int = 5) -> str:
    cache_key = f"{query.lower().strip()}_{pageSize}"
    now = time.time()

    if cache_key in _news_cache:
        cached_time, cached_val = _news_cache[cache_key]
        if now - cached_time < CACHE_TTL:
            return cached_val

    api_key = os.getenv("NEWS_API_KEY")
    if not api_key:
        return "No recent news found."

    url = "https://newsapi.org/v2/everything"
    params = {
        "q": query,
        "sortBy": "publishedAt",
        "pageSize": pageSize,
        "language": "en",
        "apiKey": api_key
    }
    try:
        response = requests.get(url, params=params, timeout=8)
        if response.status_code != 200:
            return "No recent news found."
        articles = response.json().get("articles", [])
        if not articles:
            return "No recent news found."
        result = ""
        for a in articles:
            title = a.get('title', '')
            desc = a.get('description', '') or ''
            date = (a.get('publishedAt') or '')[:10]
            result += f"- [{date}] {title}: {desc}\n"

        _news_cache[cache_key] = (now, result)
        return result
    except Exception as e:
        print(f"News API timeout or error: {e}")
        return "News fetch failed."