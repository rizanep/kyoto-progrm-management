'use client';

import * as React from 'react';
import Link from 'next/link';
import { Trophy, Crown, ArrowLeft, Radio, Medal, Sparkles, Tv } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { dbStore } from '@/lib/store/mockDatabase';

export default function PublicLeaderboardPage() {
  const [rankings, setRankings] = React.useState(dbStore.getChampionshipRankings());
  const [students, setStudents] = React.useState(dbStore.getState().students);

  React.useEffect(() => {
    return dbStore.subscribe(() => {
      setRankings(dbStore.getChampionshipRankings());
      setStudents(dbStore.getState().students);
    });
  }, []);

  const maxPoints = Math.max(...rankings.map((r) => r.total_points), 1);

  return (
    <div className="min-h-screen bg-[#f8fafc] dark:bg-[#090d14] text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Top Navbar */}
      <header className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link href="/programs" className="flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900 dark:text-slate-300">
          <ArrowLeft className="w-4 h-4" /> Back to Programs Catalog
        </Link>

        <div className="flex items-center gap-2">
          <Link href="/live">
            <Button variant="outline" size="sm" className="text-xs font-bold text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800">
              <Tv className="w-4 h-4 mr-1" /> Open Live Projector
            </Button>
          </Link>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] border border-emerald-200 dark:border-emerald-800">
            <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-500" />
            <span>Live Standings</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 py-8 flex-1 w-full space-y-8">
        {/* Banner */}
        <div className="text-center space-y-2">
          <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 font-black text-xs uppercase tracking-wider inline-flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5" /> Annual Championship Trophy
          </span>
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
            Overall House Standings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
            Live aggregated scores derived from announced results, general trivia, and house performance.
          </p>
        </div>

        {/* Podium / Top Houses Display */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          {rankings.map((grp) => {
            const isFirst = grp.rank === 1;
            const widthPercent = Math.round((grp.total_points / maxPoints) * 100);

            return (
              <Card
                key={grp.group_id}
                className={`p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden transition-all shadow-md ${
                  isFirst
                    ? 'border-2 border-amber-400 bg-amber-50/20 dark:bg-amber-950/20 sm:-translate-y-2'
                    : ''
                }`}
                hoverEffect
              >
                <div
                  className="absolute top-0 left-0 right-0 h-2"
                  style={{ backgroundColor: grp.group_color }}
                />

                <div>
                  <div className="flex items-start justify-between mb-3">
                    <span
                      className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-sm ${
                        isFirst
                          ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-500/40'
                          : grp.rank === 2
                          ? 'bg-slate-300 text-slate-900'
                          : 'bg-amber-700 text-white'
                      }`}
                    >
                      {isFirst ? <Crown className="w-5 h-5" /> : `#${grp.rank}`}
                    </span>
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-bold text-white shadow-2xs"
                      style={{ backgroundColor: grp.group_color }}
                    >
                      {grp.group_code}
                    </span>
                  </div>

                  <h3 className="text-lg font-black text-slate-900 dark:text-white">
                    {grp.group_name}
                  </h3>

                  {/* Visual Progress Meter Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2 mt-4 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700 ease-out"
                      style={{
                        width: `${widthPercent}%`,
                        backgroundColor: grp.group_color,
                      }}
                    />
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-baseline justify-between">
                  <span className="text-xs text-slate-400 font-semibold">Championship Points</span>
                  <span className="text-3xl font-black text-slate-900 dark:text-white">
                    {grp.total_points} <span className="text-xs font-bold text-slate-400">pts</span>
                  </span>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Detailed Points Matrix Table */}
        <Card className="p-0 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800">
          <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800">
            <CardTitle className="text-base font-bold">House Scoring Breakdown</CardTitle>
            <CardDescription>
              Disaggregated by solo program results, general trivia points, and adjustments
            </CardDescription>
          </CardHeader>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>House Team</TableHead>
                <TableHead>Individual Program Points</TableHead>
                <TableHead>General Points</TableHead>
                <TableHead className="text-right">Total Score</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rankings.map((grp) => (
                <TableRow key={grp.group_id}>
                  <TableCell className="font-black text-sm">#{grp.rank}</TableCell>
                  <TableCell>
                    <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: grp.group_color }} />
                      {grp.group_name}
                    </span>
                  </TableCell>
                  <TableCell className="font-semibold">{grp.individual_points} pts</TableCell>
                  <TableCell className="font-semibold">{grp.general_program_points} pts</TableCell>
                  <TableCell className="text-right font-black text-base text-slate-900 dark:text-white">
                    {grp.total_points} pts
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
        <p>{dbStore.getState().organization.name} • {dbStore.getState().organization.description || 'ISHQE HABEEB 26'}</p>
      </footer>
    </div>
  );
}
