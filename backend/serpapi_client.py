import os
import requests
from typing import List
from models import ShoppingResult

SERPAPI_URL = "https://serpapi.com/search"


def _parse_price(price_raw: str | None) -> float | None:
    if not price_raw:
        return None
    cleaned = "".join(c for c in price_raw if c.isdigit() or c == ".")
    try:
        return float(cleaned) if cleaned else None
    except ValueError:
        return None


def search_shopping(query: str, location: str = "India") -> List[ShoppingResult]:
    api_key = os.getenv("SERPAPI_KEY")
    if not api_key:
        raise RuntimeError("SERPAPI_KEY is not set in the environment")

    params = {
        "engine": "google_shopping",
        "q": query,
        "gl": "in",
        "hl": "en",
        "google_domain": "google.com",
        "location": location,
        "api_key": api_key,
    }

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

    return results
