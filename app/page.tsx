"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";

export default function Home() {
  const [studentFile, setStudentFile] = useState<string | null>(null);
  const [schemeFile, setSchemeFile] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: "student" | "scheme") => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === "student") setStudentFile(reader.result as string);
        else setSchemeFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGrade = async () => {
    if (!studentFile || !schemeFile) return;
    setLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentImage: studentFile, schemeImage: schemeFile }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.breakdown);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 p-8 sm:p-20 font-sans">
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            SchemeBreaker AI
          </h1>
          <p className="text-slate-400 text-lg">
            Upload your answer and the mark scheme. Get ruthlessly graded.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Zone A: Student Answer */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-emerald-400">Zone A: Upload Handwritten Answer</h2>
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-700 border-dashed rounded-2xl cursor-pointer hover:bg-slate-900/50 hover:border-emerald-500/50 transition-all group relative overflow-hidden bg-slate-900/20">
              {studentFile ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={studentFile} alt="Student Work" className="absolute inset-0 w-full h-full object-cover opacity-50" />
              ) : null}
              <div className="relative flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-10 h-10 mb-4 text-slate-500 group-hover:text-emerald-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                <p className="mb-2 text-sm text-slate-400"><span className="font-semibold">Click to upload</span> student work</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "student")} />
            </label>
          </div>

          {/* Zone B: Mark Scheme */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-cyan-400">Zone B: Upload Mark Scheme</h2>
            <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-slate-700 border-dashed rounded-2xl cursor-pointer hover:bg-slate-900/50 hover:border-cyan-500/50 transition-all group relative overflow-hidden bg-slate-900/20">
              {schemeFile ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={schemeFile} alt="Mark Scheme" className="absolute inset-0 w-full h-full object-cover opacity-50" />
              ) : null}
              <div className="relative flex flex-col items-center justify-center pt-5 pb-6">
                <svg className="w-10 h-10 mb-4 text-slate-500 group-hover:text-cyan-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"></path></svg>
                <p className="mb-2 text-sm text-slate-400"><span className="font-semibold">Click to upload</span> mark scheme</p>
              </div>
              <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, "scheme")} />
            </label>
          </div>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleGrade}
            disabled={!studentFile || !schemeFile || loading}
            className="px-8 py-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:cursor-not-allowed text-slate-950 font-bold rounded-full text-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] transition-all transform active:scale-95"
          >
            {loading ? "Grading in Progress..." : "Grade My Execution"}
          </button>
        </div>

        {result && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-sm space-y-6">
            <h2 className="text-2xl font-bold text-slate-200 border-b border-slate-800 pb-4">Ruthless Verdict</h2>
            <div className="prose prose-invert max-w-none prose-emerald
              prose-headings:text-emerald-400 prose-strong:text-emerald-300
              prose-strong:bg-emerald-950/30 prose-strong:px-1 prose-strong:rounded
            ">
              <ReactMarkdown>{result}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
