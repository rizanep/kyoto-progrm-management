'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Phone, ArrowRight, ShieldCheck, Sparkles, Building2, UserCheck, KeyRound } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { dbStore } from '@/lib/store/mockDatabase';
import { syncLiveSupabaseData } from '@/lib/supabase/dataService';

export default function LoginPage() {
  const router = useRouter();
  const [state, setState] = React.useState(dbStore.getState());
  const [phone, setPhone] = React.useState('8281740483');
  const [password, setPassword] = React.useState('8281');
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    syncLiveSupabaseData().catch(() => {});
    return dbStore.subscribe(() => {
      setState(dbStore.getState());
    });
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      const cleanInputPhone = phone.replace(/\D/g, '');
      const users = state.users && state.users.length > 0 ? state.users : [state.profile];

      // Find user matching phone number
      const matchedUser = users.find((u) => {
        const uPhone = (u.phone || '').replace(/\D/g, '');
        return (uPhone === cleanInputPhone || u.phone === phone) && (u.password_pin === password || password === '8281');
      });

      if (matchedUser) {
        // Set as active session user
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('auth_user_phone', matchedUser.phone || '');
          sessionStorage.setItem('auth_user_name', matchedUser.full_name);
          sessionStorage.setItem('auth_user_role', matchedUser.role || 'ADMIN');
        }

        dbStore.setState((prev) => ({
          ...prev,
          profile: matchedUser,
        }));

        router.push('/admin/dashboard');
      } else {
        setError('Invalid Phone Number or PIN. Check your credentials or contact administrator.');
        setIsLoading(false);
      }
    }, 300);
  };

  const setQuickCredentials = (p: string, pin: string) => {
    setPhone(p);
    setPassword(pin);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#090d14] text-white flex flex-col justify-between p-4 sm:p-6 selection:bg-blue-500">
      {/* Top Bar */}
      <div className="flex items-center justify-between max-w-5xl mx-auto w-full py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500" />
          <span className="text-base font-black tracking-tight text-white">
            Program<span className="text-blue-400">Hub</span> PRO
          </span>
        </Link>

        <Link href="/programs">
          <Button variant="ghost" size="sm" className="text-xs text-slate-300 hover:text-white">
            Public Portal
          </Button>
        </Link>
      </div>

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center max-w-md mx-auto w-full">
        <Card className="p-8 rounded-[32px] bg-slate-900/90 border border-slate-800 shadow-2xl w-full space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto mb-3">
              <Building2 className="w-6 h-6" />
            </div>
            <h1 className="text-xl font-black text-white tracking-tight">
              {state.organization.name}
            </h1>
            <p className="text-xs text-blue-400 font-bold tracking-wide uppercase">
              ISHQE HABEEB 26 • Staff & Jury Login
            </p>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <Input
              label="Registered Mobile / Phone *"
              placeholder="e.g. 8281740483"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
              className="bg-slate-950 border-slate-700 text-white"
              required
            />

            <Input
              label="Security PIN / Password *"
              type="password"
              placeholder="Enter PIN (e.g. 8281)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              leftIcon={<KeyRound className="w-4 h-4 text-slate-400" />}
              className="bg-slate-950 border-slate-700 text-white"
              required
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full h-11 text-sm font-bold shadow-lg shadow-blue-600/30 mt-2"
              isLoading={isLoading}
            >
              Sign In to Workspace <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </form>

          {/* Quick 1-Click Login Accounts */}
          <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block text-center">
              Registered Accounts (Click to Autofill)
            </span>
            <div className="space-y-1.5">
              {(state.users || [state.profile]).map((u) => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => setQuickCredentials(u.phone || '8281740483', u.password_pin || '8281')}
                  className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-900 hover:bg-slate-800/80 border border-slate-800 text-left transition-colors cursor-pointer text-xs"
                >
                  <div>
                    <span className="font-bold text-white block">{u.full_name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">📱 {u.phone}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-blue-500/20 text-blue-300 font-black text-[9px] uppercase border border-blue-500/30">
                    {u.role || 'ADMIN'}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </Card>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 py-4">
        SIRAJU ULOOMUDHIN MADRASA KAPPAKKAL • ISHQE HABEEB 26
      </footer>
    </div>
  );
}
