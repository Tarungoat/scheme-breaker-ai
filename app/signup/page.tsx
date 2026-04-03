'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else if (data.session) {
      router.push('/dashboard/analyse');
      router.refresh();
    } else {
      setSuccess(true);
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-[#0a0a0a] text-white font-sans selection:bg-[#00b4d8] selection:text-[#0a0a0a]">
      <div className="w-full max-w-md p-10 space-y-8 bg-[#111] border-2 border-white/10 rounded-none shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="text-center">
          <h1 className="text-4xl font-black tracking-tighter uppercase text-white">Join Lab</h1>
          <p className="mt-4 text-xs font-bold tracking-widest text-white/40 uppercase">Break the scheme. Claim your A*.</p>
        </div>
        
        <form onSubmit={handleSignup} className="mt-10 space-y-8">
          <div className="space-y-6 text-left">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-[10px] font-black uppercase tracking-widest text-[#00b4d8]">Email Address</label>
              <input
                id="email"
                type="email"
                required
                className="block w-full px-5 py-4 bg-[#0a0a0a] border border-white/20 text-white placeholder-white/10 focus:outline-none focus:ring-1 focus:ring-[#00b4d8] rounded-none transition duration-200"
                placeholder="future-star@college.ac.uk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="block text-[10px] font-black uppercase tracking-widest text-[#00b4d8]">Password</label>
              <input
                id="password"
                type="password"
                required
                className="block w-full px-5 py-4 bg-[#0a0a0a] border border-white/20 text-white placeholder-white/10 focus:outline-none focus:ring-1 focus:ring-[#00b4d8] rounded-none transition duration-200"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold uppercase tracking-wider rounded-none animate-pulse">
              {error}
            </div>
          )}

          {success && (
            <div className="p-4 bg-[#00b4d8]/10 border border-[#00b4d8]/30 text-[#00b4d8] text-xs font-bold uppercase tracking-wider rounded-none">
              Success! Please check your email to confirm your account.
            </div>
          )}

          <button
            type="submit"
            disabled={loading || success}
            className="w-full flex justify-center py-5 bg-[#00b4d8] text-[#0a0a0a] font-black text-lg uppercase tracking-widest rounded-none shadow-[0_0_20px_rgba(0,180,216,0.2)] hover:bg-white hover:shadow-[0_0_30px_rgba(0,180,216,0.4)] transition-all duration-300 disabled:opacity-50"
          >
            {loading ? 'Initializing...' : success ? 'Check Email' : 'Deploy to Dashboard'}
          </button>
        </form>

        <p className="text-center text-[10px] font-black tracking-widest text-white/30 uppercase pt-4 border-t border-white/5">
          Previously registered?{' '}
          <Link href="/login" className="text-[#00b4d8] hover:text-white transition-colors duration-200">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
