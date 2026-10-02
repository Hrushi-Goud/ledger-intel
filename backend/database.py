import json
import os
from typing import List, Dict

DATA_DIR = os.path.join(os.path.dirname(__file__), "data")
PRODUCTS_FILE = os.path.join(DATA_DIR, "products.json")
SNAPSHOTS_FILE = os.path.join(DATA_DIR, "snapshots.json")


def _ensure_file(path: str):
    os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(path):
        with open(path, "w") as f:
            json.dump([], f)


def _read(path: str) -> List[Dict]:
    _ensure_file(path)
    with open(path, "r") as f:
        return json.load(f)


def _write(path: str, data: List[Dict]):
    _ensure_file(path)
    with open(path, "w") as f:
        json.dump(data, f, indent=2)


# --- Products ---

def get_products() -> List[Dict]:
    return _read(PRODUCTS_FILE)


def add_product(product: Dict) -> Dict:
    products = get_products()
    products.append(product)
    _write(PRODUCTS_FILE, products)
    return product


def get_product(product_id: str) -> Dict | None:
    for p in get_products():
        if p["id"] == product_id:
            return p
    return None


def delete_product(product_id: str) -> Dict | None:
    product = get_product(product_id)
    if product is None:
        return None

    products = get_products()
    remaining = [p for p in products if p["id"] != product_id]
    _write(PRODUCTS_FILE, remaining)
    delete_snapshots(product_id)
    return product


# --- Snapshots ---

def get_snapshots(product_id: str | None = None) -> List[Dict]:
    snapshots = _read(SNAPSHOTS_FILE)
    if product_id:
        return [s for s in snapshots if s["product_id"] == product_id]
    return snapshots


def add_snapshot(snapshot: Dict) -> Dict:
    snapshots = _read(SNAPSHOTS_FILE)
    snapshots.append(snapshot)
    _write(SNAPSHOTS_FILE, snapshots)
    return snapshot


def delete_snapshots(product_id: str) -> int:
    snapshots = _read(SNAPSHOTS_FILE)
    remaining = [s for s in snapshots if s["product_id"] != product_id]
    _write(SNAPSHOTS_FILE, remaining)
    return len(snapshots) - len(remaining)
