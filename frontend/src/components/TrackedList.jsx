export default function TrackedList({ products, snapshotsByProduct, activeId, onSelect, onUntrack }) {
  if (products.length === 0) {
    return <p className="empty-state">Nothing tracked yet. Search above and track a product to start building history.</p>;
  }

  return (
    <div>
      <div className="section-label">TRACKED</div>
      {products.map((p) => {
        const snaps = snapshotsByProduct[p.id] || [];
        const latest = snaps[snaps.length - 1];
        const prev = snaps[snaps.length - 2];
        const latestPrice = latest?.lowest_price;
        const prevPrice = prev?.lowest_price;
        let deltaLabel = null;
        let deltaClass = "";
        if (latestPrice != null && prevPrice != null && prevPrice !== 0) {
          const pct = ((latestPrice - prevPrice) / prevPrice) * 100;
          deltaClass = pct > 0 ? "up" : pct < 0 ? "down" : "";
          deltaLabel = `${pct > 0 ? "+" : ""}${pct.toFixed(1)}%`;
        }

        return (
          <div
            key={p.id}
            className={`ticker-row ${activeId === p.id ? "active" : ""}`}
            onClick={() => onSelect(p.id)}
          >
            <span className="label">{p.label}</span>
            <span className="ticker-tools" style={{ textAlign: "right" }}>
              <span>
                <div className="price">
                  {latestPrice != null ? `₹${latestPrice.toLocaleString("en-IN")}` : "—"}
                </div>
                {deltaLabel && <div className={`delta ${deltaClass}`}>{deltaLabel}</div>}
              </span>
              <button
                type="button"
                className="secondary untrack-button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUntrack(p.id);
                }}
              >
                Untrack
              </button>
            </span>
          </div>
        );
      })}
    </div>
  );
}
