"use client";

import React, { useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, AlertCircle, RefreshCw, XCircle, FileImage, ShieldAlert, Award } from 'lucide-react';

export default function AnalysePage() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const [board, setBoard] = useState('AQA');
  const [paper, setPaper] = useState('English Language Paper 1');
  const [question, setQuestion] = useState('Q1');
  
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    current_level: number;
    missing_elements: string;
    "3_specific_fixes": string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      // create preview url if image
      if (selected.type.startsWith('image/')) {
        setPreviewUrl(URL.createObjectURL(selected));
      } else {
        setPreviewUrl(null); // Document icon fallback
      }
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAnalyse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please upload an essay image or PDF.");
      return;
    }
    
    setLoading(true);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("board", board);
    formData.append("paper", paper);
    formData.append("question", question);

    try {
      const res = await fetch("/api/analyse", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Failed to analyse essay.");
      }

      setResult(data.result);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white p-6 md:p-12 font-sans selection:bg-emerald-500/30">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-br from-white to-neutral-400 bg-clip-text text-transparent">
            AI Essay Analysis
          </h1>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">
            Upload your handwritten answer and let Scheme-Breaker instantly evaluate your work against official examiner rubrics.
          </p>
        </div>

        {!result && (
          <form onSubmit={handleAnalyse} className="grid md:grid-cols-2 gap-8 bg-[#111] border border-neutral-800 p-8 shadow-2xl rounded-none">
            
            {/* Left Col: Params */}
            <div className="space-y-6">
              <h2 className="text-xl font-bold flex items-center text-neutral-200">
                <ShieldAlert className="w-5 h-5 mr-2 text-emerald-400" /> Exam Parameters
              </h2>
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-400">Exam Board</label>
                <select 
                  value={board} 
                  onChange={(e) => setBoard(e.target.value)}
                  className="w-full bg-black border border-neutral-800 text-white p-3 focus:outline-none focus:ring-2 focus:ring-[#00b4d8] rounded-none transition duration-200"
                >
                  <option value="AQA">AQA</option>
                  <option value="CIE">CIE</option>
                  <option value="Edexcel">Edexcel</option>
                  <option value="OCR">OCR</option>
                  <option value="WJEC">WJEC</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-400">Paper</label>
                <select 
                  value={paper} 
                  onChange={(e) => setPaper(e.target.value)}
                  className="w-full bg-black border border-neutral-800 text-white p-3 focus:outline-none focus:ring-2 focus:ring-[#00b4d8] rounded-none transition duration-200"
                >
                  <option value="English Language Paper 1">English Language Paper 1</option>
                  <option value="English Language Paper 2">English Language Paper 2</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-neutral-400">Question Number</label>
                <select 
                  value={question} 
                  onChange={(e) => setQuestion(e.target.value)}
                  className="w-full bg-black border border-neutral-800 text-white p-3 focus:outline-none focus:ring-2 focus:ring-[#00b4d8] rounded-none transition duration-200"
                >
                  {['Q1', 'Q2', 'Q3', 'Q4', 'Q5'].map(q => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Right Col: Upload */}
            <div className="space-y-6 flex flex-col justify-between">
              <h2 className="text-xl font-bold flex items-center text-neutral-200">
                <FileImage className="w-5 h-5 mr-2 text-emerald-400" /> Upload Answer
              </h2>
              
              {!file ? (
                <div 
                  className="flex-1 border-2 border-dashed border-neutral-700 hover:border-[#00b4d8] bg-[#0a0a0a] flex flex-col items-center justify-center p-8 text-center cursor-pointer transition-all duration-300 group rounded-none"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <div className="w-16 h-16 bg-[#111] group-hover:bg-[#00b4d8]/10 flex items-center justify-center mb-4 transition-colors rounded-none">
                    <UploadCloud className="w-8 h-8 text-neutral-400 group-hover:text-[#00b4d8]" />
                  </div>
                  <p className="text-sm text-neutral-300 font-medium">Click to upload Image or PDF</p>
                  <p className="text-xs text-neutral-600 mt-2">Max file size 10MB</p>
                </div>
              ) : (
                <div className="flex-1 bg-[#111] border border-neutral-800 p-4 flex flex-col relative overflow-hidden group rounded-none">
                  <button 
                    type="button"
                    onClick={clearFile}
                    className="absolute top-3 right-3 p-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors z-10 rounded-none"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>
                  
                  {previewUrl ? (
                    <div className="relative w-full h-40 overflow-hidden mb-4 border border-neutral-800 rounded-none">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <div className="w-full h-40 bg-[#0a0a0a] border border-neutral-800 flex items-center justify-center mb-4 rounded-none">
                      <FileImage className="w-12 h-12 text-neutral-600" />
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-3 mt-auto">
                    <div className="w-10 h-10 bg-[#00b4d8]/10 flex items-center justify-center flex-shrink-0 rounded-none">
                      <CheckCircle2 className="w-5 h-5 text-[#00b4d8]" />
                    </div>
                    <div className="truncate">
                      <p className="text-sm font-medium text-white truncate">{file.name}</p>
                      <p className="text-xs text-neutral-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                </div>
              )}
              
              <input 
                type="file" 
                className="hidden" 
                ref={fileInputRef} 
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={handleFileChange}
              />

              <button 
                type="submit" 
                disabled={loading || !file}
                className="w-full py-4 px-6 bg-[#00b4d8] hover:bg-[#0096b8] text-white font-bold shadow-lg shadow-[#00b4d8]/20 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center rounded-none"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 mr-3 animate-spin" /> Analyzing handwriting and mapping to rubrics...
                  </>
                ) : (
                  "Analyse My Answer"
                )}
              </button>
            </div>
          </form>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl p-6 flex items-start animate-in fade-in slide-in-from-bottom-4">
            <AlertCircle className="w-6 h-6 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-bold text-red-300">Analysis Failed</h3>
              <p className="text-sm opacity-80 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Success Results Card */}
        {result && (
          <div className="bg-[#111] border border-neutral-800 p-8 md:p-10 shadow-2xl animate-in fade-in slide-in-from-bottom-8 rounded-none">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-neutral-800 pb-8 mb-8">
              <div>
                <h2 className="text-3xl font-extrabold text-white mb-2">Analysis Complete</h2>
                <p className="text-neutral-400">{board} {paper} - {question}</p>
              </div>
              
              <div className="mt-6 md:mt-0 bg-[#0a0a0a] border border-neutral-800 px-6 py-4 flex items-center rounded-none">
                <Award className="w-10 h-10 text-[#00b4d8] mr-4" />
                <div>
                  <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Current Level</p>
                  <p className="text-3xl font-black text-white">Level {result.current_level}</p>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-1 gap-8 mb-10">
              <div className="bg-orange-500/5 border border-orange-500/10 p-6 rounded-none">
                <div className="flex items-center mb-4">
                  <AlertCircle className="w-6 h-6 text-orange-400 mr-3" />
                  <h3 className="text-lg font-bold text-white">What&apos;s Missing</h3>
                </div>
                <p className="text-neutral-300 leading-relaxed">
                  {result.missing_elements}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <h3 className="text-xl font-bold flex items-center text-white border-b border-neutral-800 pb-4">
                <RefreshCw className="w-6 h-6 text-[#00b4d8] mr-3" /> Actionable Fixes
              </h3>
              
              <div className="space-y-4">
                {result["3_specific_fixes"].map((edit, idx) => (
                  <div key={idx} className="flex bg-[#0a0a0a] border border-neutral-800 p-5 hover:border-neutral-700 transition-colors rounded-none">
                    <div className="w-8 h-8 bg-[#00b4d8]/20 text-[#00b4d8] font-black flex items-center justify-center mr-4 flex-shrink-0 rounded-none">
                      {idx + 1}
                    </div>
                    <p className="text-neutral-200 mt-1">{edit}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
