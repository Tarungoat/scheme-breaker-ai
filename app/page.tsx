"use client";

import { useState, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";

interface GradeResult {
  breakdown: string;
  model: string;
}

function UploadZone({
  label,
  sublabel,
  accent,
  file,
  filename,
  onFile,
}: {
  label: string;
  sublabel: string;
  accent: "emerald" | "cyan";
  file: string | null;
  filename: string;
  onFile: (f: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const borderClass =
    accent === "emerald"
      ? dragging
        ? "border-emerald-400/80 bg-emerald-950/30"
        : file
        ? "border-emerald-500/50 bg-emerald-950/20"
        : "border-slate-700 hover:border-emerald-500/50 hover:bg-slate-900/50"
      : dragging
      ? "border-cyan-400/80 bg-cyan-950/30"
      : file
      ? "border-cyan-500/50 bg-cyan-950/20"
      : "border-slate-700 hover:border-cyan-500/50 hover:bg-slate-900/50";

  const iconClass =
    accent === "emerald"
      ? "text-emerald-400"
      : "text-cyan-400";

  const badgeClass =
    accent === "emerald"
      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
      : "bg-cyan-500/20 text-cyan-300 border-cyan-500/30";

  const glowClass =
    accent === "emerald"
      ? "shadow-[0_0_30px_rgba(16,185,129,0.1)]"
      : "shadow-[0_0_30px_rgba(6,182,212,0.1)]";

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const f = e.dataTransfer.files?.[0];
      if (f && f.type.startsWith("image/")) onFile(f);
    },
    [onFile]
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) onFile(f);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-bold border ${badgeClass}`}
        >
          {sublabel}
        </span>
        <h2 className="text-sm font-semibold text-slate-300">{label}</h2>
      </div>

      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        className={`relative flex flex-col items-center justify-center w-full h-60 rounded-2xl cursor-pointer transition-all duration-200 overflow-hidden border-2 border-dashed ${borderClass} ${file ? glowClass : ""}`}
      >
        {file ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={file}
              alt="preview"
              className="absolute inset-0 w-full h-full object-cover opacity-25"
            />
            <div className="relative z-10 flex flex-col items-center gap-3 px-4 text-center">
              <div className={`w-11 h-11 rounded-full flex items-center justify-center bg-slate-800/90 ring-2 ${accent === "emerald" ? "ring-emerald-500/40" : "ring-cyan-500/40"}`}>
                <svg className={`w-5 h-5 ${iconClass}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              </div>
              <p className={`text-sm font-medium ${iconClass} truncate max-w-[200px]`}>{filename}</p>
              <p className="text-xs text-slate-500">Click to replace</p>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center gap-4 px-6 text-center select-none">
            <div className="w-14 h-14 rounded-2xl bg-slate-800/60 flex items-center justify-center border border-slate-700/50">
              <svg className="w-7 h-7 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
              </svg>
            </div>
            <div>
              <p className="text-sm text-slate-300 font-medium mb-1">
                {dragging ? "Drop it here" : "Drag & drop or click to upload"}
              </p>
              <p className="text-xs text-slate-600">PNG, JPG, WEBP accepted</p>
            </div>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleChange}
        />
      </div>
    </div>
  );
}

export default function Home() {
  const [studentFile, setStudentFile] = useState<string | null>(null);
  const [studentName, setStudentName] = useState("");
  const [schemeFile, setSchemeFile] = useState<string | null>(null);
  const [schemeName, setSchemeName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const processFile = useCallback(
    (file: File, type: "student" | "scheme") => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        if (type === "student") {
          setStudentFile(base64);
          setStudentName(file.name);
        } else {
          setSchemeFile(base64);
          setSchemeName(file.name);
        }
      };
      reader.readAsDataURL(file);
    },
    []
  );

  const handleGrade = async () => {
    if (!studentFile || !schemeFile) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentImage: studentFile, schemeImage: schemeFile }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult({ breakdown: data.breakdown, model: data.model });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setStudentFile(null);
    setStudentName("");
    setSchemeFile(null);
    setSchemeName("");
    setResult(null);
    setError(null);
  };

  const bothReady = !!studentFile && !!schemeFile;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Background accents */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
        <div className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(16,185,129,0.06) 0%, transparent 70%)" }} />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, rgba(6,182,212,0.05) 0%, transparent 70%)" }} />
        {/* Grid */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }} />
      </div>

      <div className="max-w-4xl mx-auto px-6 py-16 sm:py-24 space-y-12">
        {/* ── Header ── */}
        <header className="text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/10 text-emerald-400 text-sm font-medium">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Elite AI Grading Engine
          </div>

          <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-none">
            <span style={{
              background: "linear-gradient(135deg, #34d399 0%, #22d3ee 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              SchemeBreaker
            </span>{" "}
            <span className="text-white/70">AI</span>
          </h1>

          <p className="text-slate-400 text-lg max-w-xl mx-auto">
            Upload your handwritten answer & the mark scheme.
            <br />
            <span className="text-emerald-400 font-semibold">Ruthless gap analysis. Zero comfort.</span>
          </p>
        </header>

        {/* ── Upload Zones ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UploadZone
            label="Handwritten Answer"
            sublabel="Answer Sheet"
            accent="emerald"
            file={studentFile}
            filename={studentName}
            onFile={(f) => processFile(f, "student")}
          />
          <UploadZone
            label="Official Mark Scheme"
            sublabel="Mark Scheme"
            accent="cyan"
            file={schemeFile}
            filename={schemeName}
            onFile={(f) => processFile(f, "scheme")}
          />
        </div>

        {/* ── Action ── */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            id="grade-button"
            onClick={handleGrade}
            disabled={!bothReady || loading}
            className={`px-10 py-4 rounded-2xl text-base font-bold transition-all duration-200 flex items-center gap-3
              ${bothReady && !loading
                ? "text-slate-950 cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
                : "text-slate-500 cursor-not-allowed"
              }`}
            style={bothReady && !loading ? {
              background: "linear-gradient(135deg, #10b981 0%, #06b6d4 100%)",
              boxShadow: "0 0 40px rgba(16,185,129,0.25), 0 4px 16px rgba(0,0,0,0.4)",
            } : {
              background: "rgba(30,41,59,0.6)",
            }}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-emerald-400" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                <span className="text-slate-400">Analyzing...</span>
              </>
            ) : (
              <>
                <span>⚡</span>
                Grade Execution
              </>
            )}
          </button>

          {(result || error) && (
            <button
              onClick={handleReset}
              className="px-6 py-4 rounded-2xl text-sm font-medium text-slate-400 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 hover:border-slate-600 transition-all"
            >
              ↻ Reset
            </button>
          )}
        </div>

        {/* ── Error ── */}
        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-950/20 p-5">
            <p className="text-sm font-semibold text-red-400 mb-1">⚠ Error</p>
            <p className="text-sm text-red-300/80">{error}</p>
          </div>
        )}

        {/* ── Results ── */}
        {result && (
          <div className="rounded-3xl border border-slate-700/50 bg-slate-900/60 backdrop-blur-md overflow-hidden"
            style={{ boxShadow: "0 0 60px rgba(16,185,129,0.08), 0 24px 48px rgba(0,0,0,0.6)" }}>
            {/* Header bar */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-slate-700/50 bg-slate-800/40">
              <div className="flex items-center gap-3">
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <h2 className="text-base font-bold text-white tracking-tight">Ruthless Verdict</h2>
              </div>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-800 px-2 py-1 rounded-md border border-slate-700">
                {result.model}
              </span>
            </div>

            {/* Content */}
            <div className="p-8">
              <div className="prose-dark">
                <ReactMarkdown>{result.breakdown}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <p className="text-center text-xs text-slate-700">
          SchemeBreaker AI — Built for students who want the truth, not comfort.
        </p>
      </div>
    </div>
  );
}
