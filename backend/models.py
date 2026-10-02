from pydantic import BaseModel, Field
from typing import Optional, List, Literal
from datetime import datetime
import uuid


class ShoppingResult(BaseModel):
    title: str
    price: Optional[float] = None
    price_raw: Optional[str] = None
    source: Optional[str] = None
    link: Optional[str] = None
    thumbnail: Optional[str] = None
    rating: Optional[float] = None
    reviews: Optional[float] = None


class SearchRequest(BaseModel):
    query: str
    location: Literal["India", "Global"] = "India"


class SearchResponse(BaseModel):
    query: str
    results: List[ShoppingResult]
    count: int


class TrackRequest(BaseModel):
    query: str
    label: Optional[str] = None
    location: Literal["India", "Global"] = "India"


class PriceSnapshot(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    product_id: str
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    results: List[ShoppingResult]
    lowest_price: Optional[float] = None


class TrackedProduct(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    query: str
    label: str
    location: Literal["India", "Global"] = "India"
    created_at: str = Field(default_factory=lambda: datetime.utcnow().isoformat())


class AskRequest(BaseModel):
    question: str
