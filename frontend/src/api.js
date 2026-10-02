const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function handle(res) {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed (${res.status})`);
  }
  return res.json();
}

export function searchProducts(query, location = "India") {
  return fetch(`${BASE_URL}/search`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, location }),
  }).then(handle);
}

export function trackProduct(query, label, location = "India") {
  return fetch(`${BASE_URL}/track`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, label, location }),
  }).then(handle);
}

export function refreshProduct(productId) {
  return fetch(`${BASE_URL}/refresh/${productId}`, { method: "POST" }).then(handle);
}

export function listProducts() {
  return fetch(`${BASE_URL}/products`).then(handle);
}

export function getHistory(productId) {
  return fetch(`${BASE_URL}/history/${productId}`).then(handle);
}

export function ask(question) {
  return fetch(`${BASE_URL}/ask`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  }).then(handle);
}
