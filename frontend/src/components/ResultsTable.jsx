import { useState } from "react";

export default function ResultsTable({ results }) {
  const [preview, setPreview] = useState(null);

  if (!results || results.length === 0) {
    return <p className="empty-state">No seller data in the latest snapshot.</p>;
  }

  function updatePreview(event, thumbnail) {
    const previewWidth = window.innerWidth <= 760 ? 132 : 160;
    const gap = 12;
    const left = event.clientX + gap + previewWidth <= window.innerWidth
      ? event.clientX + gap
      : event.clientX - gap - previewWidth;

    setPreview({
      src: thumbnail,
      left: Math.max(0, left),
      top: Math.max(0, Math.min(event.clientY, window.innerHeight - previewWidth)),
    });
  }

  return (
    <>
      <table className="result-table">
        <thead>
          <tr>
            <th>Seller</th>
            <th>Title</th>
            <th>Rating</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => (
            <tr
              key={i}
              className="result-row"
              onMouseEnter={(event) => r.thumbnail && updatePreview(event, r.thumbnail)}
              onMouseMove={(event) => r.thumbnail && updatePreview(event, r.thumbnail)}
              onMouseLeave={() => setPreview(null)}
            >
              <td className="seller-cell">{r.source || "—"}</td>
              <td className="title-cell">
                <div className="title-with-preview">
                  {r.link ? (
                    <a href={r.link} target="_blank" rel="noreferrer" className="result-title-link">
                      {r.title}
                    </a>
                  ) : (
                    <span className="result-title-text">{r.title}</span>
                  )}
                </div>
              </td>
              <td>{r.rating ? `${r.rating}★` : "—"}</td>
              <td className="price-cell">{r.price != null ? `₹${r.price.toLocaleString("en-IN")}` : r.price_raw || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {preview && (
        <div
          className="product-preview"
          aria-hidden="true"
          style={{ left: preview.left, top: preview.top }}
        >
          <img
            src={preview.src}
            alt=""
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        </div>
      )}
    </>
  );
}
