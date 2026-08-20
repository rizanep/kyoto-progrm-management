import Link from 'next/link';
import {
  Trophy,
  Layers,
  Users,
  Shield,
  Tv,
  ArrowRight,
  Sparkles,
  LayoutDashboard,
  CheckCircle2,
  Lock,
  Scale,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function RootHomePage() {
  return (
    <div className="min-h-screen bg-[#090d14] text-white flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 px-6 sm:px-12 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-full bg-blue-500" />
            <span className="w-3 h-3 rounded-full bg-amber-400" />
            <span className="w-3 h-3 rounded-full bg-emerald-400" />
            <span className="w-3 h-3 rounded-full bg-rose-500" />
          </div>
          <span className="text-xl font-black tracking-tight text-white">
            Program<span className="text-blue-400">Hub</span> PRO
          </span>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/programs">
            <Button variant="ghost" size="sm" className="text-slate-300 hover:text-white">
              Public Portal
            </Button>
          </Link>
          <Link href="/live">
            <Button variant="outline" size="sm" className="text-emerald-400 border-emerald-500/40 hover:bg-emerald-950/40">
              <Tv className="w-4 h-4 mr-1.5" /> Live Projector
            </Button>
          </Link>
          <Link href="/admin/dashboard">
            <Button variant="primary" size="sm">
              <LayoutDashboard className="w-4 h-4 mr-1.5" /> Launch Admin Console
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-6 py-16 sm:py-24 text-center space-y-8 flex-1 flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Next.js + Supabase Production Platform
        </div>

        <h1 className="text-4xl sm:text-6xl font-black tracking-tight text-white max-w-4xl leading-tight">
          Next-Gen Competition, Judging & Program Management Platform
        </h1>

        <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
          Production-grade academic management, dynamic eligibility engines, multi-judge scoring matrix, real-time live projector feeds, and automatic social media poster generation.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link href="/admin/dashboard">
            <Button size="lg" className="h-12 px-8 text-base font-bold shadow-lg shadow-blue-600/30">
              Enter Admin Workspace <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          <Link href="/programs">
            <Button variant="outline" size="lg" className="h-12 px-8 text-base font-bold bg-slate-900 border-slate-700 hover:bg-slate-800 text-white">
              Public Schedule Catalog
            </Button>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full pt-12 text-left">
          <Card className="p-5 rounded-3xl bg-slate-900/60 border-slate-800 space-y-2">
            <div className="p-2.5 rounded-2xl bg-blue-500/10 text-blue-400 w-fit">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Students & Houses</h3>
            <p className="text-xs text-slate-400">
              Academic classes, bulk CSV import, and house captain appointments.
            </p>
          </Card>

          <Card className="p-5 rounded-3xl bg-slate-900/60 border-slate-800 space-y-2">
            <div className="p-2.5 rounded-2xl bg-purple-500/10 text-purple-400 w-fit">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Judging Engine</h3>
            <p className="text-xs text-slate-400">
              Multi-judge evaluation, Olympic trimmed scoring, and auto grade bands.
            </p>
          </Card>

          <Card className="p-5 rounded-3xl bg-slate-900/60 border-slate-800 space-y-2">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-400 w-fit">
              <Trophy className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Championship Ticker</h3>
            <p className="text-xs text-slate-400">
              Certified announcements, immutable snapshots, and house standings.
            </p>
          </Card>

          <Card className="p-5 rounded-3xl bg-slate-900/60 border-slate-800 space-y-2">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-400 w-fit">
              <Tv className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-white text-sm">Live Projector & Posters</h3>
            <p className="text-xs text-slate-400">
              Real-time auditorium TV screen stream and instant social media poster studio.
            </p>
          </Card>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-6 px-6 text-center text-xs text-slate-500">
        ProgramHub Production Architecture • Built with Next.js App Router, TypeScript, Tailwind CSS & Supabase
      </footer>
    </div>
  );
}
