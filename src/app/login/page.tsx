'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Lock, Phone, ArrowRight, Building2, KeyRound, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { dbStore } from '@/lib/store/mockDatabase';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/admin/dashboard';

  const [orgName, setOrgName] = React.useState(dbStore.getState().organization.name);
  const [phone, setPhone] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    return dbStore.subscribe(() => {
      setOrgName(dbStore.getState().organization.name);
    });
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please check your credentials.');
      }

      // Update local profile in store to match logged in user
      if (data.user) {
        dbStore.setState((prev) => ({
          ...prev,
          profile: {
            ...prev.profile,
            id: data.user.id,
            full_name: data.user.fullName,
            phone: data.user.phone,
            role: data.user.role,
          },
        }));
      }

      router.push(redirectUrl);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Invalid credentials.');
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-8 rounded-[32px] bg-slate-900/90 border border-slate-800 shadow-2xl shadow-black/60 w-full space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-blue-600/20 border border-blue-500/30 text-blue-400 flex items-center justify-center mx-auto mb-3">
          <Building2 className="w-6 h-6" />
        </div>
        <h1 className="text-xl font-black text-white tracking-tight leading-snug">
          {orgName}
        </h1>
        <p className="text-xs text-blue-400 font-bold tracking-wide uppercase">
          Staff & Jury Authorization Portal
        </p>
      </div>

      {error && (
        <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold text-center leading-relaxed">
          {error}
        </div>
      )}

      <form onSubmit={handleLogin} className="space-y-4">
        <Input
          label="Registered Mobile / Phone *"
          placeholder="Enter registered mobile number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
          className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-600"
          autoComplete="tel"
          required
        />

        <Input
          label="Security PIN / Password *"
          type="password"
          placeholder="Enter your security PIN"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<KeyRound className="w-4 h-4 text-slate-400" />}
          className="bg-slate-950 border-slate-700 text-white placeholder:text-slate-600"
          autoComplete="current-password"
          required
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full h-11 text-sm font-bold shadow-lg shadow-blue-600/30"
            isLoading={isLoading}
          >
            Secure Sign In <ArrowRight className="w-4 h-4 ml-1.5" />
          </Button>
        </div>
      </form>

      <div className="pt-3 border-t border-slate-800/80 flex items-center justify-center gap-2 text-[11px] text-slate-400">
        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
        <span>End-to-End JWT Session & RBAC Protected</span>
      </div>
    </Card>
  );
}

export default function SecureLoginPage() {
  const [orgName, setOrgName] = React.useState(dbStore.getState().organization.name);

  React.useEffect(() => {
    return dbStore.subscribe(() => {
      setOrgName(dbStore.getState().organization.name);
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#090d14] text-white flex flex-col justify-between p-4 sm:p-6 selection:bg-blue-500">
      {/* Top Header */}
      <div className="flex items-center justify-between max-w-5xl mx-auto w-full py-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shadow-blue-500" />
          <span className="text-base font-black tracking-tight text-white">
            Program<span className="text-blue-400">Hub</span> PRO
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/programs">
            <Button variant="ghost" size="sm" className="text-xs text-slate-300 hover:text-white">
              Public Portal
            </Button>
          </Link>
          <Link href="/live">
            <Button variant="outline" size="sm" className="text-xs border-slate-700 text-slate-300 hover:text-white">
              Live Screen
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Login Box wrapped in Suspense */}
      <main className="flex-1 flex items-center justify-center max-w-md mx-auto w-full py-8">
        <React.Suspense
          fallback={
            <Card className="p-8 rounded-[32px] bg-slate-900/90 border border-slate-800 w-full text-center text-slate-400 text-sm">
              Loading secure portal...
            </Card>
          }
        >
          <LoginForm />
        </React.Suspense>
      </main>

      {/* Footer */}
      <footer className="text-center text-xs text-slate-500 py-4">
        {orgName} • Official Event Platform
      </footer>
    </div>
  );
}
