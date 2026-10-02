from fastapi import APIRouter, HTTPException
import uuid

from models import (
    SearchRequest, SearchResponse,
    TrackRequest, TrackedProduct, PriceSnapshot,
    AskRequest,
)
import database as db
from serpapi_client import search_shopping
import llm_agent

router = APIRouter()


@router.post("/search", response_model=SearchResponse)
def search(req: SearchRequest):
    results = search_shopping(req.query, req.location)
    return SearchResponse(query=req.query, results=results, count=len(results))


@router.post("/track", response_model=TrackedProduct)
def track_product(req: TrackRequest):
    product = TrackedProduct(
        query=req.query,
        label=req.label or req.query,
    ).model_dump()
    db.add_product(product)

    # take an immediate first snapshot so the chart has a starting point
    results = search_shopping(req.query, req.location)
    prices = [r.price for r in results if r.price is not None]
    snapshot = PriceSnapshot(
        product_id=product["id"],
        results=results,
        lowest_price=min(prices) if prices else None,
    ).model_dump()
    db.add_snapshot(snapshot)

    return product


@router.post("/refresh/{product_id}", response_model=PriceSnapshot)
def refresh_product(product_id: str):
    product = db.get_product(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    results = search_shopping(product["query"])
    prices = [r.price for r in results if r.price is not None]
    snapshot = PriceSnapshot(
        product_id=product_id,
        results=results,
        lowest_price=min(prices) if prices else None,
    ).model_dump()
    db.add_snapshot(snapshot)
    return snapshot


@router.get("/products")
def list_products():
    return db.get_products()


@router.delete("/products/{product_id}")
def untrack_product(product_id: str):
    product = db.get_product(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    deleted = db.delete_product(product_id)
    if deleted is not None:
        return {"deleted": True, "product_id": product_id}
    raise HTTPException(status_code=404, detail="Product not found")


@router.get("/history/{product_id}")
def get_history(product_id: str):
    product = db.get_product(product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    snapshots = db.get_snapshots(product_id)
    return {"product": product, "snapshots": snapshots}


@router.post("/ask")
def ask(req: AskRequest):
    answer = llm_agent.answer_question(req.question)
    return {"question": req.question, "answer": answer}
