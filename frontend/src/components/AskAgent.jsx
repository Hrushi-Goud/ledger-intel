import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { ask } from "../api.js";

export default function AskAgent() {
  const [question, setQuestion] = useState("");
  const [log, setLog] = useState([]);
  const [loading, setLoading] = useState(false);

  async function handleAsk(e) {
    e.preventDefault();
    if (!question.trim()) return;
    const q = question;
    setQuestion("");
    setLoading(true);
    try {
      const res = await ask(q);
      setLog((prev) => [...prev, { q, a: res.answer }]);
    } catch (err) {
      setLog((prev) => [...prev, { q, a: `Error: ${err.message}` }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="agent-panel">
      <div className="section-label">ASK</div>
      <div className="agent-log">
        {log.map((turn, i) => (
          <div className="agent-turn" key={i}>
            <div className="q">{turn.q}</div>
            <div className="a">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {turn.a}
              </ReactMarkdown>
            </div>
          </div>
        ))}
      </div>
      <form className="agent-row" onSubmit={handleAsk}>
        <input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="e.g. Which tracked product dropped the most this week?"
        />
        <button type="submit" disabled={loading}>
          {loading ? "Thinking…" : "Ask"}
        </button>
      </form>
    </div>
  );
}
