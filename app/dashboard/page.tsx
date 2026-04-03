import { createServerSideClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { History, FileText, Calendar, PlusCircle } from 'lucide-react';

export default async function DashboardMainPage() {
  const supabase = await createServerSideClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white flex items-center justify-center p-6">
        <h1 className="text-2xl text-red-500">Unauthorised Access</h1>
      </div>
    );
  }

  const { data: analyses, error } = await supabase
    .from('analyses')
    .select('id, created_at, exam_board, paper, question')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-[#00b4d8] selection:text-[#0a0a0a]">
      {/* Navigation */}
      <nav className="border-b border-white/5 px-6 py-6 flex items-center justify-between max-w-7xl mx-auto">
        <div className="text-xl font-black tracking-tighter uppercase whitespace-nowrap text-white">
          <span>Scheme</span><span className="text-[#00b4d8]">Breaker</span>
        </div>
        <div className="flex gap-4 items-center">
          <Link href="/dashboard/analyse" className="inline-flex items-center text-sm font-bold uppercase tracking-widest text-black bg-[#00b4d8] px-5 py-2.5 rounded-none hover:bg-white transition-colors duration-300">
            <PlusCircle className="mr-2 w-4 h-4" /> New Analysis
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12 md:py-20">
        <div className="mb-12 border-l-4 border-[#00b4d8] pl-6">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">
            Welcome back, <span className="text-[#00b4d8]">{(user.email?.split('@')[0]) || 'Examiner'}</span>
          </h1>
          <p className="mt-4 text-white/50 text-base tracking-widest uppercase font-bold max-w-2xl">
            You have <span className="text-white">{(analyses?.length || 0)}</span> diagnostic sessions archived. 
            Ready to break another scheme?
          </p>
        </div>

        <div className="mb-16 grid grid-cols-1 md:grid-cols-2 gap-8">
           <Link href="/dashboard/analyse" className="group bg-[#111] border-2 border-[#00b4d8] p-8 hover:bg-[#00b4d8] transition-all duration-300">
              <h2 className="text-2xl font-black uppercase tracking-tight text-[#00b4d8] group-hover:text-black mb-2 flex items-center">
                Launch Diagnostic Tool <PlusCircle className="ml-3 w-6 h-6" />
              </h2>
              <p className="text-white/40 group-hover:text-black/60 text-sm font-bold uppercase tracking-widest">
                Upload new handwritten answers for instant grading.
              </p>
           </Link>
           <div className="bg-[#111] border border-white/5 p-8">
              <h2 className="text-2xl font-black uppercase tracking-tight text-white/20 mb-2">
                Daily Quota: <span className="text-white">{10 - (analyses?.length || 0)}</span> left
              </h2>
              <div className="w-full bg-white/5 h-2 mt-4">
                <div className="bg-[#00b4d8] h-full" style={{ width: `${(analyses?.length || 0) * 10}%` }}></div>
              </div>
           </div>
        </div>

        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-black uppercase tracking-tighter text-white">Recent Artifacts</h2>
          {analyses && analyses.length > 0 && (
             <Link href="/dashboard/analyse" className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00b4d8] hover:text-white transition-colors">
               + New Analysis
             </Link>
          )}
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-6 rounded-none mb-8">
            Failed to load history: {error.message}
          </div>
        )}

        {analyses && analyses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {analyses.map((analysis) => (
              <div key={analysis.id} className="bg-[#111] border border-white/10 p-6 hover:border-[#00b4d8]/50 transition-colors group rounded-none flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 bg-white/5 text-[#00b4d8] group-hover:bg-[#00b4d8]/10 transition-colors rounded-none">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="text-right">
                    <div className="text-xl font-black text-white">{analysis.exam_board}</div>
                    <div className="text-xs text-white/40 uppercase tracking-widest">{analysis.question}</div>
                  </div>
                </div>
                
                <h3 className="text-sm font-bold text-white/80 mb-6 flex-1">
                  {analysis.paper}
                </h3>
                
                <div className="flex items-center text-xs text-white/40 uppercase tracking-widest border-t border-white/5 pt-4">
                  <Calendar className="w-3 h-3 mr-2" />
                  {new Date(analysis.created_at).toLocaleDateString('en-GB', {
                    day: 'numeric', month: 'short', year: 'numeric'
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-dashed border-white/10 bg-[#0c0c0c] p-16 text-center rounded-none flex flex-col items-center">
            <History className="w-12 h-12 text-white/20 mb-4" />
            <h3 className="text-xl font-black uppercase tracking-wider text-white">No historical data</h3>
            <p className="text-white/40 mt-2 mb-8 text-sm max-w-sm">
              You haven&apos;t analyzed any essays yet. Submit your first handwritten response to see your baseline level.
            </p>
            <Link href="/dashboard/analyse" className="inline-flex items-center justify-center px-8 py-4 bg-[#00b4d8] text-[#0a0a0a] text-sm font-black uppercase tracking-wider rounded-none hover:bg-white transition-colors duration-300">
              Start Free Diagnostic
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
