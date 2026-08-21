'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Users,
  ShieldAlert,
  Layers,
  Sparkles,
  Trophy,
  Activity,
  ArrowUpRight,
  Plus,
  Upload,
  Calendar,
  Clock,
  Radio,
  Tv,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { StatCard } from '@/components/shared/stat-card';
import { MetricGauge } from '@/components/shared/metric-gauge';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { StatusPill } from '@/components/shared/status-pill';
import { dbStore } from '@/lib/store/mockDatabase';
import { formatTime } from '@/lib/utils/formatters';

export default function AdminDashboardPage() {
  const [state, setState] = React.useState(dbStore.getState());
  const [rankings, setRankings] = React.useState(dbStore.getChampionshipRankings());

  React.useEffect(() => {
    return dbStore.subscribe(() => {
      setState(dbStore.getState());
      setRankings(dbStore.getChampionshipRankings());
    });
  }, []);

  const totalStudents = state.students.length;
  const totalGroups = state.groups.length;
  const totalPrograms = state.programs.length;
  const runningPrograms = state.programs.filter((p) => p.status === 'STARTED' || p.status === 'JUDGING').length;
  const announcedPrograms = state.programs.filter((p) => p.status === 'ANNOUNCED').length;
  const completionRate = totalPrograms > 0 ? (announcedPrograms / totalPrograms) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Top 5 Stat Cards (Facit Grid layout matching screenshot) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <StatCard
          title="Students"
          subtitle="Enrolled Roster"
          value={totalStudents}
          icon={<Users className="w-5 h-5 text-blue-500" />}
          iconBg="bg-blue-50 dark:bg-blue-950/50"
          badgeText="Active"
          badgeType="success"
          footerTrend="100% Assigned"
          footerStatus="Optimal"
        />
        <StatCard
          title="House Teams"
          subtitle="Active Groups"
          value={totalGroups}
          icon={<ShieldAlert className="w-5 h-5 text-purple-500" />}
          iconBg="bg-purple-50 dark:bg-purple-950/50"
          badgeText="Championship"
          badgeType="info"
          footerTrend="3 Houses Active"
          footerStatus="Ranked"
        />
        <StatCard
          title="Programs"
          subtitle="Scheduled Events"
          value={totalPrograms}
          icon={<Layers className="w-5 h-5 text-amber-500" />}
          iconBg="bg-amber-50 dark:bg-amber-950/50"
          badgeText={`${runningPrograms} Live`}
          badgeType="warning"
          footerTrend="2 Stage / 1 Non-Stage"
          footerStatus="On Schedule"
        />
        <StatCard
          title="Judged Events"
          subtitle="Scoring Completed"
          value={announcedPrograms + (state.programs.filter((p) => p.status === 'JUDGED').length)}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          iconBg="bg-emerald-50 dark:bg-emerald-950/50"
          badgeText="Verified"
          badgeType="success"
          footerTrend="Olympic Criteria"
          footerStatus="Audited"
        />
        <StatCard
          title="Announced"
          subtitle="Publicly Live"
          value={announcedPrograms}
          icon={<Trophy className="w-5 h-5 text-rose-500" />}
          iconBg="bg-rose-50 dark:bg-rose-950/50"
          badgeText="Published"
          badgeType="neutral"
          footerTrend="Realtime Synced"
          footerStatus="Public Live"
        />
      </div>

      {/* Quick Launch Action Ribbon */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-3xl p-4 sm:p-6 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-bold tracking-wide uppercase">
              Championship Control
            </span>
            <span className="flex items-center gap-1 text-xs text-blue-100">
              <Radio className="w-3.5 h-3.5 text-emerald-300 animate-pulse" /> Live Session
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {state.organization.name}
          </h2>
          <p className="text-xs sm:text-sm text-blue-100 mt-1 max-w-xl">
            {state.organization.description || 'Annual Islamic Arts & Academic Fest — ISHQE HABEEB 26'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Link href="/admin/programs/new">
            <Button variant="secondary" size="sm" className="bg-white text-blue-900 hover:bg-blue-50 font-bold border-none">
              <Plus className="w-4 h-4 mr-1 text-blue-600" /> New Program
            </Button>
          </Link>
          <Link href="/admin/students/import">
            <Button variant="outline" size="sm" className="bg-white/10 text-white border-white/30 hover:bg-white/20">
              <Upload className="w-4 h-4 mr-1" /> Import CSV
            </Button>
          </Link>
          <Link href="/live" target="_blank">
            <Button variant="outline" size="sm" className="bg-emerald-500/20 text-emerald-100 border-emerald-400/40 hover:bg-emerald-500/30">
              <Tv className="w-4 h-4 mr-1 text-emerald-300" /> Open TV Display
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Grid: Program Timeline vs Metric Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Running & Today's Programs */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 rounded-3xl">
            <CardHeader className="p-0 border-none pb-4 flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-600" />
                  <span>Competition Program Schedule & Live Status</span>
                </CardTitle>
                <CardDescription>
                  Real-time progression through Draft, Scheduled, Started, Judging, and Announced
                </CardDescription>
              </div>
              <Link href="/admin/programs">
                <Button variant="ghost" size="sm" className="text-xs text-blue-600 dark:text-blue-400">
                  View All Programs <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </CardHeader>

            <div className="space-y-3">
              {state.programs.map((prog) => (
                <div
                  key={prog.id}
                  className="p-4 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black">
                        {prog.program_code}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        {prog.name}
                      </h4>
                      <StatusPill status={prog.status} />
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> {prog.category_name} • {prog.division_name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> {formatTime(prog.scheduled_at)}
                      </span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {prog.participant_count || 0} Registered
                      </span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {prog.status === 'STARTED' && (
                      <Link href={`/admin/judging/${prog.id}`}>
                        <Button size="sm" variant="primary" className="text-xs h-8">
                          Enter Judging
                        </Button>
                      </Link>
                    )}
                    {prog.status === 'ANNOUNCED' && (
                      <Link href={`/admin/results/review/${prog.id}`}>
                        <Button size="sm" variant="outline" className="text-xs h-8">
                          View Results
                        </Button>
                      </Link>
                    )}
                    {prog.status === 'SCHEDULED' && (
                      <Link href={`/admin/programs/${prog.id}`}>
                        <Button size="sm" variant="secondary" className="text-xs h-8">
                          Manage
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* House Points Leaderboard */}
          <Card className="p-6 rounded-3xl">
            <CardHeader className="p-0 border-none pb-4 flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-amber-500" />
                  <span>Overall Championship Standings</span>
                </CardTitle>
                <CardDescription>
                  Aggregated from certified announcements, general program points, and awards
                </CardDescription>
              </div>
              <Link href="/results">
                <Button variant="ghost" size="sm" className="text-xs text-blue-600 dark:text-blue-400">
                  Public Standings <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </CardHeader>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
              {rankings.map((grp) => (
                <div
                  key={grp.group_id}
                  className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between shadow-xs relative overflow-hidden"
                >
                  <div
                    className="absolute top-0 left-0 right-0 h-1.5"
                    style={{ backgroundColor: grp.group_color }}
                  />
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-extrabold text-slate-500 uppercase">
                        Rank #{grp.rank}
                      </span>
                      <span
                        className="px-2 py-0.5 rounded-full text-[10px] font-bold text-white"
                        style={{ backgroundColor: grp.group_color }}
                      >
                        {grp.group_code}
                      </span>
                    </div>
                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
                      {grp.group_name}
                    </h4>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-baseline justify-between">
                    <span className="text-xs text-slate-400">Total Score</span>
                    <span className="text-2xl font-black text-slate-900 dark:text-white">
                      {grp.total_points} <span className="text-xs font-bold text-slate-400">pts</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Right 1 Col: Metric Gauge & System Activity */}
        <div className="space-y-6">
          <MetricGauge
            title="Event Completion Rate"
            percentage={completionRate}
            capacity={`${announcedPrograms} / ${totalPrograms}`}
            threshold="100% Target"
            unitLabel="Programs Certified"
          />

          {/* Recent Audit Activity */}
          <Card className="p-5 rounded-3xl">
            <CardHeader className="p-0 border-none pb-3">
              <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Live Audit Activity
              </CardTitle>
            </CardHeader>
            <div className="space-y-3">
              {state.auditLogs.slice(0, 4).map((log) => (
                <div key={log.id} className="text-xs space-y-0.5 pb-2 border-b border-slate-100 dark:border-slate-800/50 last:border-none last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{log.action}</span>
                    <span className="text-[10px] text-slate-400">{formatTime(log.created_at)}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {log.user_email} • {log.entity_name} #{log.entity_id}
                  </p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
