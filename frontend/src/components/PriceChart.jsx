import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

export default function PriceChart({ snapshots }) {
  if (!snapshots || snapshots.length < 2) {
    return (
      <p className="empty-state">
        Not enough snapshots yet — refresh this product a few times (or wait for scheduled refreshes) to see a trend.
      </p>
    );
  }

  const data = snapshots.map((s) => ({
    time: new Date(s.timestamp).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    price: s.lowest_price,
  }));

  return (
    <div style={{ width: "100%", height: 220, marginTop: 20 }}>
      <ResponsiveContainer>
        <LineChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#ddd8cc" vertical={false} />
          <XAxis dataKey="time" tick={{ fontSize: 11, fill: "#565f6b" }} axisLine={{ stroke: "#1b2430" }} />
          <YAxis
            tick={{ fontSize: 11, fill: "#565f6b" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `₹${v}`}
            width={60}
          />
          <Tooltip
            formatter={(v) => [`₹${v.toLocaleString("en-IN")}`, "Lowest price"]}
            contentStyle={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12 }}
          />
          <Line type="monotone" dataKey="price" stroke="#3452b4" strokeWidth={2} dot={{ r: 3 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
