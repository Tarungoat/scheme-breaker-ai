"use client";

import { useState } from "react";
import { explainMarkPoints } from "../actions";
import Link from "next/link";
import "../globals.css";

export default function Dashboard() {
  const [question, setQuestion] = useState("");
  const [markScheme, setMarkScheme] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{ point: string; explanation: string }[]>([]);
  const [error, setError] = useState("");

  const handleDecode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question || !markScheme) {
      setError("Please fill in both the question and the mark scheme.");
      return;
    }
    
    setError("");
    setLoading(true);
    setResults([]);
    
    try {
      const data = await explainMarkPoints(question, markScheme);
      setResults(data);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: "40px 0" }}>
      <header 
        style={{ 
          display: "flex", 
          justifyContent: "space-between", 
          alignItems: "center",
          marginBottom: "3rem" 
        }}
      >
        <Link href="/" className="title-main" style={{ fontSize: "2rem", margin: 0 }}>
          <span>Scheme</span>Breaker
        </Link>
        <div style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Dashboard
        </div>
      </header>

      <div className="card">
        <form onSubmit={handleDecode}>
          <div className="input-group">
            <label className="input-label">Exam Question</label>
            <textarea 
              placeholder="Paste the question text here..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              required
            />
          </div>
          <div className="input-group">
            <label className="input-label">Official Mark Scheme</label>
            <textarea 
              placeholder="Paste the mark scheme here..."
              value={markScheme}
              onChange={(e) => setMarkScheme(e.target.value)}
              required
            />
          </div>

          <button 
            type="submit" 
            className="btn-primary" 
            disabled={loading}
            style={{ width: "100%", justifyContent: "center" }}
          >
            {loading ? <span className="loading-spinner"></span> : "Decode Mark Scheme"}
          </button>
        </form>

        {error && (
          <p style={{ color: "#ef4444", marginTop: "1rem", textAlign: "center" }}>
            {error}
          </p>
        )}
      </div>

      <div className="explanation-container">
        {results.length > 0 && (
          <>
            <h2 style={{ marginBottom: "2rem", borderBottom: "1px solid var(--border-color)", paddingBottom: "1rem" }}>
              Simplified Breakdown
            </h2>
            {results.map((item, idx) => (
              <div key={idx} className="explanation-point">
                <span className="point-number">{item.point}</span>
                <p>{item.explanation}</p>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
