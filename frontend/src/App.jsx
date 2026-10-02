import { useState, useEffect, useCallback } from "react";
import { searchProducts, trackProduct, listProducts, getHistory, refreshProduct } from "./api.js";
import TrackedList from "./components/TrackedList.jsx";
import PriceChart from "./components/PriceChart.jsx";
import ResultsTable from "./components/ResultsTable.jsx";
import AskAgent from "./components/AskAgent.jsx";

export default function App() {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [products, setProducts] = useState([]);
  const [snapshotsByProduct, setSnapshotsByProduct] = useState({});
  const [activeId, setActiveId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadProducts = useCallback(async () => {
    try {
      const list = await listProducts();
      setProducts(list);
      const entries = await Promise.all(
        list.map(async (p) => {
          const h = await getHistory(p.id);
          return [p.id, h.snapshots];
        })
      );
      setSnapshotsByProduct(Object.fromEntries(entries));
      if (!activeId && list.length > 0) setActiveId(list[0].id);
    } catch (err) {
      setError(err.message);
    }
  }, [activeId]);

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setSearchResults(null);
    try {
      const res = await searchProducts(query);
      setSearchResults(res);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleTrack() {
    setLoading(true);
    setError(null);
    try {
      const product = await trackProduct(query, query);
      setSearchResults(null);
      setQuery("");
      await loadProducts();
      setActiveId(product.id);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRefresh(productId) {
    setLoading(true);
    setError(null);
    try {
      await refreshProduct(productId);
      await loadProducts();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const activeProduct = products.find((p) => p.id === activeId);
  const activeSnapshots = snapshotsByProduct[activeId] || [];
  const latestSnapshot = activeSnapshots[activeSnapshots.length - 1];

  return (
    <div className="app">
      <div className="masthead">
        <h1>Ledger</h1>
        <span className="tagline">Live price intelligence, tracked over time</span>
      </div>

      {error && <div className="error-banner">{error}</div>}

      <form className="search-row" onSubmit={handleSearch}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search a product, e.g. iPhone 16 128GB"
        />
        <button type="submit" disabled={loading}>Search</button>
        {searchResults && (
          <button type="button" className="secondary" onClick={handleTrack} disabled={loading}>
            Track this
          </button>
        )}
      </form>

      {searchResults && (
        <div style={{ marginBottom: 36 }}>
          <div className="section-label">LIVE RESULTS — {searchResults.query}</div>
          <ResultsTable results={searchResults.results} />
        </div>
      )}

      <div className="layout">
        <TrackedList
          products={products}
          snapshotsByProduct={snapshotsByProduct}
          activeId={activeId}
          onSelect={setActiveId}
        />

        <div>
          {activeProduct ? (
            <>
              <h2 className="detail-title">{activeProduct.label}</h2>
              <button className="secondary" onClick={() => handleRefresh(activeProduct.id)} disabled={loading}>
                Refresh snapshot
              </button>
              <PriceChart snapshots={activeSnapshots} />
              {latestSnapshot && (
                <>
                  <div className="section-label" style={{ marginTop: 24 }}>
                    LATEST SNAPSHOT
                  </div>
                  <ResultsTable results={latestSnapshot.results} />
                </>
              )}
            </>
          ) : (
            <p className="empty-state">Select a tracked product to see its price history.</p>
          )}
        </div>
      </div>

      <AskAgent />
    </div>
  );
}
