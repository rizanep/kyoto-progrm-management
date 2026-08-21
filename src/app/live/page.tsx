'use client';

import * as React from 'react';
import Link from 'next/link';
import { Trophy, Radio, ArrowLeft, Maximize, Clock, Crown, Sparkles, Layers } from 'lucide-react';
import { dbStore } from '@/lib/store/mockDatabase';
import { formatTime } from '@/lib/utils/formatters';

export default function LiveProjectorDisplayPage() {
  const [state, setState] = React.useState(dbStore.getState());
  const [rankings, setRankings] = React.useState(dbStore.getChampionshipRankings());
  const [currentTime, setCurrentTime] = React.useState('');

  React.useEffect(() => {
    const update = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  React.useEffect(() => {
    return dbStore.subscribe(() => {
      setState(dbStore.getState());
      setRankings(dbStore.getChampionshipRankings());
    });
  }, []);

  const runningProgram = state.programs.find(
    (p) => p.status === 'STARTED' || p.status === 'JUDGING'
  );
  const runningParticipants = runningProgram
    ? state.participants.filter((p) => p.program_id === runningProgram.id)
    : [];

  const announcedPrograms = state.programs.filter((p) => p.status === 'ANNOUNCED');
  const latestAnnounced = announcedPrograms[announcedPrograms.length - 1];
  const latestResults = latestAnnounced ? state.results[latestAnnounced.id] || [] : [];

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <div className="min-h-screen bg-[#06090e] text-white flex flex-col justify-between p-6 sm:p-10 select-none overflow-hidden font-sans">
      {/* Top TV Bar */}
      <header className="flex items-center justify-between border-b border-slate-800/80 pb-6">
        <div className="flex items-center gap-4">
          <Link href="/admin/dashboard" className="p-2 bg-slate-900 hover:bg-slate-800 rounded-2xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-slate-400" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-black tracking-widest text-emerald-400 uppercase">
                Official Live Broadcast
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white mt-0.5">
              {state.organization.name}
            </h1>
            <p className="text-xs font-bold text-blue-400">
              {state.organization.description || 'ISHQE HABEEB 26'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="text-right font-mono">
            <div className="text-2xl sm:text-3xl font-black text-blue-400 tracking-wider">
              {currentTime}
            </div>
            <span className="text-xs font-bold text-slate-500">AUDITORIUM LIVE FEED</span>
          </div>

          <button
            onClick={toggleFullscreen}
            className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-2xl transition-colors cursor-pointer"
          >
            <Maximize className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Center Stage: Split between Live on Stage & Recent Announcement */}
      <main className="grid grid-cols-1 lg:grid-cols-2 gap-8 my-8 flex-1 items-stretch">
        {/* Left: Live Stage Performance */}
        <div className="p-8 rounded-[36px] bg-gradient-to-b from-slate-900/90 to-slate-950 border-2 border-blue-500/40 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-10">
            <Radio className="w-36 h-36 text-blue-400" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 border border-blue-500/30 text-xs font-black uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
                Live on Stage Now
              </span>
              <span className="font-mono text-base font-black text-slate-400">
                {runningProgram?.program_code || 'P000'}
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
              {runningProgram?.name || 'No Active Event on Stage'}
            </h2>
            <p className="text-base text-slate-400 mb-6">
              {runningProgram ? `${runningProgram.category_name} • ${runningProgram.division_name} • ${runningProgram.venue}` : 'Stage is being prepared for next scheduled event.'}
            </p>

            {/* Performers Roster */}
            {runningParticipants.length > 0 && (
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Stage Performers
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {runningParticipants.map((p) => (
                    <div
                      key={p.id}
                      className="p-3.5 bg-slate-900/80 rounded-2xl border border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-9 h-9 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center">
                          #{p.participant_number}
                        </span>
                        <span className="font-bold text-sm text-white">{p.student_name}</span>
                      </div>
                      <span
                        className="px-2 py-0.5 rounded-md text-xs font-bold text-white"
                        style={{ backgroundColor: p.group_color || '#3b82f6' }}
                      >
                        {p.group_name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Official Stage Jury Scoring in Progress</span>
            <span className="text-emerald-400 font-bold">Auto-Syncing</span>
          </div>
        </div>

        {/* Right: Certified Result Flash */}
        <div className="p-8 rounded-[36px] bg-gradient-to-b from-amber-950/30 via-slate-900 to-slate-950 border-2 border-amber-500/40 shadow-2xl flex flex-col justify-between relative overflow-hidden">
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-black uppercase tracking-wider flex items-center gap-2">
                <Trophy className="w-3.5 h-3.5 text-amber-400" />
                Latest Certified Result
              </span>
              <span className="font-mono text-base font-black text-amber-400">
                {latestAnnounced?.program_code || 'ANNOUNCED'}
              </span>
            </div>

            <h2 className="text-3xl sm:text-4xl font-black tracking-tight text-white mb-2">
              {latestAnnounced?.name || 'Awaiting Next Announcement'}
            </h2>
            <p className="text-base text-slate-400 mb-6">
              {latestAnnounced?.category_name} • {latestAnnounced?.division_name}
            </p>

            {/* Winners Flash List */}
            {latestResults.length > 0 ? (
              <div className="space-y-3 pt-2">
                {latestResults.slice(0, 3).map((res, i) => (
                  <div
                    key={res.id || i}
                    className={`p-4 rounded-2xl flex items-center justify-between ${
                      res.position_rank === 1
                        ? 'bg-amber-500/20 border-2 border-amber-500/60'
                        : 'bg-slate-900/80 border border-slate-800'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <span
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-base ${
                          res.position_rank === 1
                            ? 'bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/50'
                            : 'bg-slate-800 text-white'
                        }`}
                      >
                        {res.position_rank || i + 1}
                      </span>
                      <div>
                        <h4 className="text-base font-black text-white">{res.participant_name}</h4>
                        <p className="text-xs text-slate-400">{res.group_name} • {res.total_marks} Marks</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xl font-black text-emerald-400">
                        +{res.points_awarded} pts
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 italic py-8">
                Results will pop up here instantly upon certification.
              </p>
            )}
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500 font-semibold">
            <span>Points tallied into championship standings</span>
            <span className="text-amber-400 font-bold">Official Certified</span>
          </div>
        </div>
      </main>

      {/* Bottom Live Championship Ticker */}
      <footer className="bg-slate-900/80 border border-slate-800 rounded-3xl p-4 sm:p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 shrink-0">
            <Trophy className="w-6 h-6 text-amber-400" />
            <span className="text-sm font-black uppercase tracking-wider text-slate-200">
              Live House Standings
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-1 w-full max-w-3xl">
            {rankings.map((grp) => (
              <div
                key={grp.group_id}
                className="p-3 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-xl bg-slate-800 text-white font-black text-xs flex items-center justify-center">
                    #{grp.rank}
                  </span>
                  <span className="font-extrabold text-sm text-white">{grp.group_name}</span>
                </div>
                <span className="text-lg font-black text-amber-400">
                  {grp.total_points} <span className="text-xs font-normal text-slate-400">pts</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
