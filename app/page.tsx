"use client";

import { useState, useRef, useCallback } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [studentFile, setStudentFile] = useState<string | null>(null);
  const [studentName, setStudentName] = useState<string>("");
  const [schemeFile, setSchemeFile] = useState<string | null>(null);
  const [schemeName, setSchemeName] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const studentRef = useRef<HTMLInputElement>(null);
  const schemeRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent, type: "student" | "scheme") => {
      e.preventDefault();
      e.stopPropagation();
      const file = e.dataTransfer.files?.[0];
      if (file && file.type.startsWith("image/")) {
        processFile(file, type);
      }
    },
    []
  );

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "student" | "scheme"
  ) => {
    const file = e.target.files?.[0];
    if (file) processFile(file, type);
  };

  const processFile = (file: File, type: "student" | "scheme") => {
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
  };

  const handleGrade = async () => {
    if (!studentFile || !schemeFile) return;
    setLoading(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentImage: studentFile,
          schemeImage: schemeFile,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.breakdown);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setError(message);
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

  const bothUploaded = !!studentFile && !!schemeFile;

  return (
    <main className="min-h-screen bg-[#050a14] text-white antialiased">
      {/* Ambient glow background */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-emerald-500/5 blur-[120px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-cyan-500/5 blur-[120px]" />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="fixed inset-0 -z-10 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      <div className="max-w-5xl mx-auto px-6 py-16 sm:py-24">
        {/* Header */}
        <header className="text-center mb-16 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium tracking-wide mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            AI-Powered Grading Engine
          </div>

          <h1 className="text-5xl sm:text-7xl font-black tracking-tight">
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              SchemeBreaker
            </span>
            <span className="text-white/80"> AI</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Upload your handwritten answer and the official mark scheme.
            <br />
            <span className="text-emerald-400 font-semibold">
              Get ruthlessly graded in seconds.
            </span>
          </p>
        </header>

        {/* Upload Zones */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          {/* Zone A: Student Answer */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 text-xs font-black">
                A
              </span>
              <h2 className="text-base font-semibold text-slate-200">
                Your Handwritten Answer
              </h2>
            </div>

            <div
              onDrop={(e) => handleDrop(e, "student")}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => studentRef.current?.click()}
              className={`relative flex flex-col items-center justify-center w-full h-56 rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden group
                ${
                  studentFile
                    ? "border-2 border-emerald-500/40 bg-emerald-950/20"
                    : "border-2 border-dashed border-slate-700/80 bg-slate-900/30 hover:border-emerald-500/50 hover:bg-slate-900/50"
                }`}
            >
              {studentFile ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={studentFile}
                    alt="Student answer preview"
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                  />
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm text-emerald-300 font-medium truncate max-w-[200px]">
                      {studentName}
                    </p>
                    <p className="text-xs text-slate-500">Click to replace</p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-800/80 flex items-center justify-center group-hover:bg-emerald-500/10 transition-colors">
                    <svg className="w-6 h-6 text-slate-500 group-hover:text-emerald-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-300 font-medium">
                      Drop image here or click to browse
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      PNG, JPG up to 10MB
                    </p>
                  </div>
                </div>
              )}
              <input
                ref={studentRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "student")}
              />
            </div>
          </div>

          {/* Zone B: Mark Scheme */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 text-xs font-black">
                B
              </span>
              <h2 className="text-base font-semibold text-slate-200">
                Official Mark Scheme
              </h2>
            </div>

            <div
              onDrop={(e) => handleDrop(e, "scheme")}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => schemeRef.current?.click()}
              className={`relative flex flex-col items-center justify-center w-full h-56 rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden group
                ${
                  schemeFile
                    ? "border-2 border-cyan-500/40 bg-cyan-950/20"
                    : "border-2 border-dashed border-slate-700/80 bg-slate-900/30 hover:border-cyan-500/50 hover:bg-slate-900/50"
                }`}
            >
              {schemeFile ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={schemeFile}
                    alt="Mark scheme preview"
                    className="absolute inset-0 w-full h-full object-cover opacity-30"
                  />
                  <div className="relative z-10 flex flex-col items-center gap-2">
                    <div className="w-10 h-10 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm text-cyan-300 font-medium truncate max-w-[200px]">
                      {schemeName}
                    </p>
                    <p className="text-xs text-slate-500">Click to replace</p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-800/80 flex items-center justify-center group-hover:bg-cyan-500/10 transition-colors">
                    <svg className="w-6 h-6 text-slate-500 group-hover:text-cyan-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-slate-300 font-medium">
                      Drop image here or click to browse
                    </p>
                    <p className="text-xs text-slate-600 mt-1">
                      PNG, JPG up to 10MB
                    </p>
                  </div>
                </div>
              )}
              <input
                ref={schemeRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => handleFileChange(e, "scheme")}
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
          <button
            onClick={handleGrade}
            disabled={!bothUploaded || loading}
            className={`relative px-10 py-4 rounded-2xl text-lg font-bold transition-all duration-300 transform
              ${
                bothUploaded && !loading
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-[0_0_30px_rgba(16,185,129,0.25)] hover:shadow-[0_0_50px_rgba(16,185,129,0.4)] hover:scale-[1.02] active:scale-[0.98]"
                  : "bg-slate-800/60 text-slate-500 cursor-not-allowed"
              }`}
          >
            {loading ? (
              <span className="flex items-center gap-3">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing...
              </span>
            ) : (
              "⚡ Grade My Execution"
            )}
          </button>

          {(result || error) && (
            <button
              onClick={handleReset}
              className="px-6 py-4 rounded-2xl text-sm font-medium text-slate-400 bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 transition-all"
            >
              ↻ Start Over
            </button>
          )}
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-5 rounded-2xl bg-red-950/30 border border-red-500/30 text-red-300">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-red-400 font-bold text-sm">⚠ Error</span>
            </div>
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* Results Dashboard */}
        {result && (
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/5 to-transparent rounded-3xl blur-xl -z-10" />
            <div className="bg-slate-900/60 backdrop-blur-md border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl">
              {/* Results Header */}
              <div className="px-8 py-5 border-b border-slate-700/50 bg-slate-800/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Ruthless Verdict
                  </h2>
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  powered by gemini-2.0-flash
                </span>
              </div>

              {/* Results Body */}
              <div className="p-8">
                <div className="prose prose-invert max-w-none prose-emerald prose-headings:text-emerald-400 prose-headings:font-bold prose-headings:tracking-tight prose-p:text-slate-300 prose-p:leading-relaxed prose-strong:text-emerald-300 prose-li:text-slate-300 prose-code:text-cyan-300 prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm">
                  <ReactMarkdown>{result}</ReactMarkdown>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-20 text-center text-xs text-slate-600">
          SchemeBreaker AI — Built for students who want the truth, not comfort.
        </footer>
      </div>
    </main>
  );
}
