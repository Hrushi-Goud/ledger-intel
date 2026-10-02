import os
import requests
from typing import List, Literal
from models import ShoppingResult

SERPAPI_URL = "https://serpapi.com/search"
SearchLocation = Literal["India", "Global"]

def _parse_price(price_raw: str | None) -> float | None:
    if not price_raw:
        return None
    cleaned = "".join(c for c in price_raw if c.isdigit() or c == ".")
    try:
        return float(cleaned) if cleaned else None
    except ValueError:
        return None

_STOPWORDS = {"the", "a", "an", "for", "of", "in", "with", "and", "or"}

def _is_relevant(title: str, query_words: set[str]) -> bool:
    title_words = set(title.lower().split())
    return bool(title_words & query_words)

def search_shopping(query: str, location: SearchLocation = "India") -> List[ShoppingResult]:
    api_key = os.getenv("SERPAPI_KEY")
    if not api_key:
        raise RuntimeError("SERPAPI_KEY is not set in the environment")

    params = {
        "engine": "google_shopping",
        "q": query,
        "hl": "en",
        "google_domain": "google.com",
        "api_key": api_key,
    }
    if location == "India":
        params["gl"] = "in"
        params["location"] = "India"

    resp = requests.get(SERPAPI_URL, params=params, timeout=20)
    resp.raise_for_status()
    data = resp.json()

    raw_results = data.get("shopping_results", [])
    results: List[ShoppingResult] = []

    for item in raw_results:
        price_raw = item.get("price")
        results.append(
            ShoppingResult(
                title=item.get("title", "Unknown"),
                price=_parse_price(price_raw),
                price_raw=price_raw,
                source=item.get("source"),
                link=item.get("product_link") or item.get("link"),
                thumbnail=item.get("thumbnail"),
                rating=item.get("rating"),
                reviews=item.get("reviews"),
            )
        )

    query_words = {w for w in query.lower().split() if w not in _STOPWORDS}
    if query_words:
        filtered = [r for r in results if _is_relevant(r.title, query_words)]
        if filtered:
            return filtered

    return results
