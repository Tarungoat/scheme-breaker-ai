"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Plus, ChevronDown } from "lucide-react";

export default function LandingPage() {
  const [daysLeft, setDaysLeft] = useState(0);

  useEffect(() => {
    // Target: Mid-May (May 15th) of the current year
    const now = new Date();
    let target = new Date(now.getFullYear(), 4, 15); 
    if (now > target) {
      target = new Date(now.getFullYear() + 1, 4, 15);
    }
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    setDaysLeft(diff);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white selection:bg-[#00b4d8] selection:text-[#0a0a0a] font-sans overflow-x-hidden">
      {/* ── BACKGROUND ── */}
      <div className="fixed inset-0 pointer-events-none z-0">
        {/* Faint Brutalist Grid */}
        <div 
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            backgroundPosition: "center center"
          }}
        />
        {/* Subtle radial vignette to focus center */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_#0a0a0a_100%)] opacity-80" />
      </div>

      {/* ── NAVIGATION ── */}
      <nav className="relative z-50 flex items-center justify-between px-6 py-6 md:px-12 max-w-7xl mx-auto border-b border-white/5">
        <div className="text-xl font-black tracking-tighter uppercase whitespace-nowrap">
          <span className="text-white">Scheme</span>
          <span className="text-[#00b4d8]">Breaker</span>
          <span className="text-white/30 text-xs ml-2 uppercase tracking-widest relative -top-1">AI</span>
        </div>
        <div className="flex items-center gap-6 text-sm font-bold uppercase tracking-widest text-white/50">
          <Link href="/login" className="hover:text-white transition-colors duration-200">Log In</Link>
          <Link 
            href="/signup" 
            className="border border-[#00b4d8] bg-[#00b4d8]/10 text-[#00b4d8] px-5 py-2.5 hover:bg-[#00b4d8] hover:text-[#0a0a0a] transition-all duration-300 rounded-none shadow-[0_0_15px_rgba(0,180,216,0.15)] hover:shadow-[0_0_25px_rgba(0,180,216,0.4)]"
          >
            Access Now
          </Link>
        </div>
      </nav>

      <main className="relative z-10 flex flex-col items-center">
        {/* ── HERO SECTION ── */}
        <section className="w-full flex-col flex items-center justify-center pt-24 pb-32 px-6 text-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-6"
          >
            <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 px-4 py-1.5 uppercase tracking-widest text-[10px] text-white/70 rounded-none mix-blend-screen backdrop-blur-sm">
              <span className="w-1.5 h-1.5 bg-[#00b4d8] inline-block animate-pulse" />
              <span>AQA / CIE / Edexcel Supported</span>
            </div>

            <h1 className="text-5xl sm:text-7xl md:text-8xl font-black tracking-tighter leading-[1.05] text-white/90">
              KNOW EXACTLY WHY YOU <br className="hidden md:block" />
              <span className="text-white relative">
                LOST
                {/* Harsh strikethrough or underline aesthetic */}
                <svg className="absolute w-full h-[0.3em] left-0 -bottom-[0.1em] text-[#00b4d8]" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5H100" stroke="currentColor" strokeWidth="6" />
                </svg>
              </span>
              {" "} MARKS. <br className="hidden sm:block text-white/50" />
              <span className="text-white/40">FIX IT IN MINUTES.</span>
            </h1>

            <p className="max-w-2xl mx-auto text-lg md:text-xl text-white/60 leading-relaxed font-medium mt-8">
              Upload handwritten essays. Get instant, examiner-level grading against official AQA/CIE mark schemes. Zero generic feedback. Pure brutal accuracy.
            </p>

            <div className="flex mt-12 mb-6 justify-center">
              <Link
                href="/signup"
                className="group relative inline-flex items-center justify-center px-8 py-5 bg-[#00b4d8] text-[#0a0a0a] text-lg font-black uppercase tracking-wider rounded-none overflow-hidden transition-transform duration-300 hover:scale-[1.02]"
              >
                {/* Glow layer */}
                <div className="absolute inset-0 bg-[#00b4d8] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                {/* Content */}
                <span className="relative z-10 flex items-center gap-3">
                  Start Free Diagnostic
                  <svg className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                  </svg>
                </span>
                {/* Sharp hover effect lines */}
                <div className="absolute inset-0 border border-white/0 group-hover:border-white/50 transition-colors duration-300 z-20 pointer-events-none" />
              </Link>
            </div>

            <p className="text-sm font-bold uppercase tracking-widest text-[#00b4d8]">
              You are {daysLeft} days away from your A-Level exams. Are you ready?
            </p>
          </motion.div>
        </section>

        {/* ── SOCIAL PROOF BAR ── */}
        <section className="w-full border-y border-white/10 bg-white/[0.02] backdrop-blur-md">
          <div className="max-w-7xl mx-auto py-8 px-6 md:px-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <h3 className="text-xs uppercase tracking-widest text-white/40 font-bold whitespace-nowrap">
              Trusted by students at elite UK colleges
            </h3>
            <div className="flex flex-wrap items-center justify-center md:justify-end gap-x-12 gap-y-6 text-sm font-medium text-white/80 uppercase tracking-wider">
              <div className="flex items-center gap-2">
                <span className="text-[#00b4d8] font-black text-lg">14,000+</span>
                <span className="text-white/40 text-xs">Essays Graded</span>
              </div>
              <div className="w-1 h-1 bg-white/20 rounded-full hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="text-[#00b4d8] font-black text-lg">45</span>
                <span className="text-white/40 text-xs">Verified Examiners</span>
              </div>
              <div className="w-1 h-1 bg-white/20 rounded-full hidden sm:block" />
              <div className="flex items-center gap-2">
                <span className="text-[#00b4d8] font-black text-lg">98%</span>
                <span className="text-white/40 text-xs">Match to Real Scores</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── HOW IT WORKS (BENTO BOX GRID) ── */}
        <section className="w-full max-w-7xl mx-auto py-32 px-6 md:px-12">
          <div className="mb-16">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white">
              The Execution Flow
            </h2>
            <p className="text-white/50 mt-4 uppercase tracking-widest text-sm font-medium">Bypass human bias. Get objective level targets.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Card 1 */}
            <div className="border border-white/10 bg-[#0c0c0c] p-8 sm:p-10 flex flex-col gap-8 transition-colors hover:border-[#00b4d8]/50 relative group">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00b4d8] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-5xl font-black text-white/10 leading-none">01</div>
              <div className="flex-1">
                <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-3">Snap a photo</h3>
                <p className="text-white/50 text-sm leading-relaxed">Simply upload your handwritten essay. Our OCR engine accurately parses illegible scrawls and maps it straight into digital text.</p>
              </div>
              {/* Visual abstraction */}
              <div className="w-full h-32 border border-white/5 bg-[#080808] relative overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjMDgwODA4Ij48L3JlY3Q+CjxwYXRoIGQ9Ik0wIDBMOCA4Wk04IDBMMCA4WiIgc3Ryb2tlPSIjMTExIiBzdHJva2Utd2lkdGg9IjEiPjwvcGF0aD4KPC9zdmc+')] opacity-50" />
                <div className="w-16 h-16 border-2 border-[#00b4d8] relative z-10 flex items-center justify-center bg-[#0a0a0a]">
                  <Plus className="text-[#00b4d8]" />
                </div>
              </div>
            </div>

            {/* Card 2 */}
            <div className="border border-white/10 bg-[#0c0c0c] p-8 sm:p-10 flex flex-col gap-8 transition-colors hover:border-[#00b4d8]/50 relative group">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00b4d8] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-5xl font-black text-white/10 leading-none">02</div>
              <div className="flex-1">
                <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-3">Map to descriptors</h3>
                <p className="text-white/50 text-sm leading-relaxed">The AI cross-references your text against actual AQA/CIE examiner reports and mark schemes. It identifies conceptual gaps mercilessly.</p>
              </div>
              <div className="w-full h-32 border border-white/5 bg-[#080808] flex items-center p-4">
                <div className="w-full space-y-2">
                  <div className="w-3/4 h-2 bg-white/20" />
                  <div className="w-1/2 h-2 bg-[#00b4d8]/40" />
                  <div className="w-full h-2 bg-white/10" />
                  <div className="w-4/5 h-2 bg-white/10" />
                </div>
              </div>
            </div>

            {/* Card 3 (With Code Example) */}
            <div className="border border-white/10 bg-[#0c0c0c] p-8 sm:p-10 flex flex-col gap-8 transition-colors hover:border-[#00b4d8]/50 relative group md:col-span-1 lg:col-span-1">
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#00b4d8] to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="text-5xl font-black text-white/10 leading-none">03</div>
              <div className="flex-1">
                <h3 className="text-2xl font-black uppercase tracking-tight text-white mb-3">Get exact fixes</h3>
                <p className="text-white/50 text-sm leading-relaxed">Understand exactly what vocabulary or analysis limits your band. See direct transformations from your current level to the next.</p>
              </div>
              <div className="w-full border border-white/10 bg-[#050505] p-4 relative font-mono text-[10px] sm:text-xs">
                <div className="text-white/40 mb-2">// Band progression mapped</div>
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-center text-red-400">
                    <span>{"{"} "Current Level": 3,</span>
                  </div>
                  <div className="flex justify-between items-center pl-4 text-white/60">
                    <span>"Error": "Descriptive, lacks evaluation"</span>
                  </div>
                  <div className="flex justify-between items-center text-[#00b4d8]">
                    <span>{" "} "Target Level": 4,</span>
                  </div>
                  <div className="flex justify-between items-center pl-4 text-[#00b4d8]">
                    <span>"Fix": "Synthesize points A & B to show causality" {"}"}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── PRICING (Brutalist Kanban/Table Style) ── */}
        <section className="w-full border-t border-white/10 bg-[#080808] py-32">
          <div className="max-w-5xl mx-auto px-6 md:px-12 text-center">
            <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter text-white mb-16">
              Invest in your A*
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border border-white/10 text-left">
              {/* Free Tier */}
              <div className="p-10 border-b md:border-b-0 md:border-r border-white/10 flex flex-col">
                <div className="uppercase tracking-widest text-xs font-bold text-white/50 mb-2">Base Access</div>
                <h3 className="text-3xl font-black text-white mb-6">Free Tier</h3>
                <div className="flex items-baseline gap-2 mb-8 border-b border-white/10 pb-8">
                  <span className="text-5xl font-black text-white">£0</span>
                  <span className="text-white/40 uppercase text-sm font-bold tracking-widest">/ always</span>
                </div>
                <ul className="flex-1 space-y-4 text-sm text-white/70 font-medium mb-12">
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-white/30" /> 3 diagnostics per day</li>
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-white/30" /> Standard AQA/CIE mark schemes</li>
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-white/30" /> Basic level descriptor mapping</li>
                </ul>
                <Link href="/signup" className="block text-center border border-white/20 py-4 hover:bg-white/5 hover:border-white/40 transition-colors uppercase font-bold tracking-widest text-sm text-white">
                  Create Free Account
                </Link>
              </div>

              {/* Pro Tier */}
              <div className="p-10 flex flex-col bg-[#050505] relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[2px] bg-[#00b4d8]" />
                <div className="absolute -right-12 top-8 rotate-45 border border-[#00b4d8]/30 bg-[#00b4d8]/10 text-[#00b4d8] text-[10px] uppercase font-black tracking-widest py-1 px-12">
                  Elite
                </div>
                <div className="uppercase tracking-widest text-xs font-bold text-[#00b4d8] mb-2">Uncapped Potential</div>
                <h3 className="text-3xl font-black text-white mb-6">Pro Tier</h3>
                <div className="flex items-baseline gap-2 mb-8 border-b border-white/10 pb-8">
                  <span className="text-5xl font-black text-white">£4.99</span>
                  <span className="text-white/40 uppercase text-sm font-bold tracking-widest">/ month</span>
                </div>
                <ul className="flex-1 space-y-4 text-sm text-white/90 font-medium mb-12">
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-[#00b4d8]" /> Unlimited analysis & diagnostics</li>
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-[#00b4d8]" /> Full past paper historical tracking</li>
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-[#00b4d8]" /> Priority grading speed (under 10s)</li>
                  <li className="flex items-center gap-3"><div className="w-1.5 h-1.5 bg-[#00b4d8]" /> Deep-dive line-by-line breakdown</li>
                </ul>
                <Link href="/signup" className="block w-full text-center bg-[#00b4d8] text-[#0a0a0a] py-4 hover:bg-white transition-colors uppercase font-black tracking-widest text-sm">
                  Upgrade to Pro
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ & FOOTER / TRUST ── */}
        <section className="w-full border-t border-white/10 py-32 px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-black uppercase tracking-tighter text-white mb-10 border-l-4 border-[#00b4d8] pl-6">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {/* Accordion 1 */}
              <details className="group border border-white/10 bg-[#0c0c0c] open:bg-[#111] transition-colors rounded-none [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between p-6 uppercase tracking-wider text-sm font-bold text-white/80 group-open:text-white">
                  Can it read my terrible handwriting?
                  <ChevronDown className="w-5 h-5 text-[#00b4d8] transition-transform group-open:-rotate-180" />
                </summary>
                <div className="px-6 pb-6 text-white/50 text-sm leading-relaxed border-t border-white/5 pt-4">
                  Yes. Our vision model is specifically calibrated to parse handwritten exam scripts, cross-outs, and margin notes just like a real examiner.
                </div>
              </details>
              {/* Accordion 2 */}
              <details className="group border border-white/10 bg-[#0c0c0c] open:bg-[#111] transition-colors rounded-none [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between p-6 uppercase tracking-wider text-sm font-bold text-white/80 group-open:text-white">
                  Which exam boards are supported?
                  <ChevronDown className="w-5 h-5 text-[#00b4d8] transition-transform group-open:-rotate-180" />
                </summary>
                <div className="px-6 pb-6 text-white/50 text-sm leading-relaxed border-t border-white/5 pt-4">
                  Primarily AQA and CIE A-Levels & GCSEs. We also support Edexcel Pearson. You upload the official PDF scheme, our system adapts to its specific level descriptors.
                </div>
              </details>
              {/* Accordion 3 */}
              <details className="group border border-white/10 bg-[#0c0c0c] open:bg-[#111] transition-colors rounded-none [&_summary::-webkit-details-marker]:hidden">
                <summary className="flex cursor-pointer items-center justify-between p-6 uppercase tracking-wider text-sm font-bold text-white/80 group-open:text-white">
                  Is my data used to train the AI?
                  <ChevronDown className="w-5 h-5 text-[#00b4d8] transition-transform group-open:-rotate-180" />
                </summary>
                <div className="px-6 pb-6 text-white/50 text-sm leading-relaxed border-t border-white/5 pt-4">
                  No. We maintain strict data privacy. Your essays are processed temporarily in memory for the analysis and encrypted at rest in your personal vault.
                </div>
              </details>
            </div>
          </div>
        </section>

        {/* Footer Base */}
        <footer className="w-full py-12 border-t border-white/10 text-center flex flex-col items-center gap-6 px-6">
          <div className="text-2xl font-black tracking-tighter uppercase">
            <span className="text-white">Scheme</span>
            <span className="text-[#00b4d8]">Breaker</span>
          </div>
          <p className="text-white/40 uppercase tracking-widest text-[10px] font-bold">
            Built by students who aced it. <br/>
            <span className="text-[#00b4d8] mt-2 inline-block">4 A*s Aesthetic</span>
          </p>
          <div className="flex gap-6 mt-4 text-xs text-white/30 uppercase tracking-wider font-bold">
            <Link href="#" className="hover:text-white transition-colors">Terms</Link>
            <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="mailto:hello@schemebreaker.com" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </footer>
      </main>
    </div>
  );
}
