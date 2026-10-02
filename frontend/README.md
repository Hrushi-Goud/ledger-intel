# Ledger — Price Intelligence Frontend

React + Recharts frontend for the Price Intelligence Agent backend.

## Setup

```bash
npm install
cp .env.example .env
# edit .env if your backend isn't on localhost:8000
npm run dev
```

Runs at http://localhost:5173 — make sure the FastAPI backend is running first.

## Structure

- `src/App.jsx` — layout, state, wires everything together
- `src/api.js` — fetch wrapper for the backend endpoints
- `src/components/TrackedList.jsx` — left-column ticker of tracked products
- `src/components/PriceChart.jsx` — Recharts price-history line chart
- `src/components/ResultsTable.jsx` — seller/price table
- `src/components/AskAgent.jsx` — natural-language question box hitting `/ask`
