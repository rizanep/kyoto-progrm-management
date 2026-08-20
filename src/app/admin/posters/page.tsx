'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Image as ImageIcon,
  Download,
  Share2,
  Sparkles,
  Palette,
  Trophy,
  Check,
  Building2,
  Crown,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { dbStore } from '@/lib/store/mockDatabase';
import { formatDate } from '@/lib/utils/formatters';

function PosterStudioContent() {
  const searchParams = useSearchParams();
  const initialProgramId = searchParams.get('programId') || '';

  const [state, setState] = React.useState(dbStore.getState());
  const [selectedProgId, setSelectedProgId] = React.useState(
    initialProgramId || state.programs[0]?.id || ''
  );
  const [selectedTemplate, setSelectedTemplate] = React.useState('ROYAL_GOLD');
  const [customSubtitle, setCustomSubtitle] = React.useState('Annual Inter-House Championship 2026');

  React.useEffect(() => {
    return dbStore.subscribe(() => {
      setState(dbStore.getState());
    });
  }, []);

  const program = state.programs.find((p) => p.id === selectedProgId);
  const results = program ? state.results[program.id] || [] : [];
  const topWinners = results.slice(0, 3);

  const handleDownload = () => {
    // Generate an image trigger from the SVG canvas
    const svgElement = document.getElementById('poster-svg');
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const URL = window.URL || window.webkitURL || window;
    const blobURL = URL.createObjectURL(svgBlob);

    const image = new Image();
    image.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 1200;
      canvas.height = 1600;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(image, 0, 0, 1200, 1600);
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = `${program?.program_code || 'EVENT'}_Result_Poster.png`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
      }
    };
    image.src = blobURL;
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-blue-600" />
            <span>Social Media Poster Studio</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Instantly render and publish high-resolution competition winner posters for Instagram, WhatsApp, and TV screens.
          </p>
        </div>

        <Button onClick={handleDownload} variant="primary" size="sm" disabled={!program}>
          <Download className="w-4 h-4 mr-1.5" /> Download HD Poster (PNG)
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 1 Col: Controls & Customization */}
        <div className="space-y-6">
          <Card className="p-5 rounded-3xl space-y-4">
            <CardHeader className="p-0 border-none pb-2">
              <CardTitle className="text-sm font-bold">Poster Configuration</CardTitle>
            </CardHeader>

            <Select
              label="Select Program"
              options={state.programs.map((p) => ({
                value: p.id,
                label: `${p.program_code} — ${p.name} (${p.status})`,
              }))}
              value={selectedProgId}
              onChange={(e) => setSelectedProgId(e.target.value)}
            />

            <Select
              label="Template Style"
              options={[
                { value: 'ROYAL_GOLD', label: '🏆 Royal Gold Luxury' },
                { value: 'CYBER_SLATE', label: '⚡ Cyber Slate Indigo' },
                { value: 'EMERALD_CHAMP', label: '🌿 Emerald Championship' },
              ]}
              value={selectedTemplate}
              onChange={(e) => setSelectedTemplate(e.target.value)}
            />

            <Input
              label="Fest Subtitle / Event Banner"
              value={customSubtitle}
              onChange={(e) => setCustomSubtitle(e.target.value)}
            />
          </Card>

          <Card className="p-5 rounded-3xl space-y-3">
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Selected Winners Snapshot
            </h4>
            {topWinners.length > 0 ? (
              <div className="space-y-2">
                {topWinners.map((w, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs"
                  >
                    <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-amber-400 text-slate-950 font-black flex items-center justify-center text-[10px]">
                        #{i + 1}
                      </span>
                      {w.participant_name}
                    </span>
                    <span className="font-semibold text-slate-500">{w.group_name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No scored winners recorded for this event.</p>
            )}
          </Card>
        </div>

        {/* Right 2 Cols: Live Visual Poster Canvas */}
        <div className="lg:col-span-2 flex flex-col items-center justify-center bg-slate-100 dark:bg-slate-950 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="w-full max-w-md shadow-2xl rounded-3xl overflow-hidden border border-slate-800">
            {/* SVG Poster Canvas */}
            <svg
              id="poster-svg"
              viewBox="0 0 600 800"
              className="w-full h-auto block select-none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <linearGradient id="bgGradGold" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0f172a" />
                  <stop offset="50%" stopColor="#1e1b4b" />
                  <stop offset="100%" stopColor="#0c131d" />
                </linearGradient>

                <linearGradient id="goldTextGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fbbf24" />
                  <stop offset="50%" stopColor="#f59e0b" />
                  <stop offset="100%" stopColor="#d97706" />
                </linearGradient>
              </defs>

              {/* Background */}
              <rect width="600" height="800" fill="url(#bgGradGold)" />

              {/* Outer Golden Border */}
              <rect
                x="20"
                y="20"
                width="560"
                height="760"
                fill="none"
                stroke="#eab308"
                strokeWidth="2"
                rx="20"
                opacity="0.6"
              />
              <rect
                x="28"
                y="28"
                width="544"
                height="744"
                fill="none"
                stroke="#eab308"
                strokeWidth="1"
                strokeDasharray="6 4"
                rx="16"
                opacity="0.4"
              />

              {/* Organization Header */}
              <text
                x="300"
                y="80"
                textAnchor="middle"
                fill="#94a3b8"
                fontSize="12"
                letterSpacing="3"
                fontWeight="bold"
              >
                APEX INTERNATIONAL ACADEMY
              </text>
              <text
                x="300"
                y="110"
                textAnchor="middle"
                fill="#f8fafc"
                fontSize="18"
                fontWeight="900"
                letterSpacing="1"
              >
                {customSubtitle.toUpperCase()}
              </text>

              {/* Program Details Banner */}
              <rect x="50" y="145" width="500" height="80" rx="14" fill="#1e293b" opacity="0.9" />
              <text
                x="300"
                y="180"
                textAnchor="middle"
                fill="url(#goldTextGrad)"
                fontSize="22"
                fontWeight="900"
              >
                {program?.name || 'ANNUAL COMPETITION'}
              </text>
              <text
                x="300"
                y="205"
                textAnchor="middle"
                fill="#cbd5e1"
                fontSize="12"
                fontWeight="bold"
              >
                {program?.category_name?.toUpperCase()} • {program?.division_name?.toUpperCase()}
              </text>

              {/* Winner 1 (Gold / 1st Place) */}
              <g transform="translate(50, 250)">
                <rect width="500" height="135" rx="16" fill="#1e293b" stroke="#eab308" strokeWidth="2" />
                <circle cx="50" cy="67" r="28" fill="#eab308" />
                <text x="50" y="74" textAnchor="middle" fill="#0f172a" fontSize="22" fontWeight="900">
                  1
                </text>
                <text x="100" y="45" fill="#eab308" fontSize="11" fontWeight="bold" letterSpacing="1">
                  FIRST PLACE • 1ST RANK
                </text>
                <text x="100" y="75" fill="#ffffff" fontSize="20" fontWeight="900">
                  {topWinners[0]?.participant_name || 'Champion Student'}
                </text>
                <text x="100" y="100" fill="#94a3b8" fontSize="13" fontWeight="bold">
                  {topWinners[0]?.group_name || 'House Team'} • {topWinners[0]?.total_marks || 95} Marks (Grade A)
                </text>
              </g>

              {/* Winner 2 (Silver / 2nd Place) */}
              <g transform="translate(50, 405)">
                <rect width="500" height="110" rx="16" fill="#1e293b" stroke="#94a3b8" strokeWidth="1.5" />
                <circle cx="45" cy="55" r="22" fill="#94a3b8" />
                <text x="45" y="61" textAnchor="middle" fill="#0f172a" fontSize="16" fontWeight="900">
                  2
                </text>
                <text x="85" y="38" fill="#94a3b8" fontSize="10" fontWeight="bold">
                  SECOND PLACE
                </text>
                <text x="85" y="64" fill="#ffffff" fontSize="17" fontWeight="900">
                  {topWinners[1]?.participant_name || 'Runner Up'}
                </text>
                <text x="85" y="88" fill="#94a3b8" fontSize="12" fontWeight="semibold">
                  {topWinners[1]?.group_name || 'House Team'} • {topWinners[1]?.total_marks || 88} Marks
                </text>
              </g>

              {/* Winner 3 (Bronze / 3rd Place) */}
              <g transform="translate(50, 535)">
                <rect width="500" height="110" rx="16" fill="#1e293b" stroke="#b45309" strokeWidth="1.5" />
                <circle cx="45" cy="55" r="22" fill="#b45309" />
                <text x="45" y="61" textAnchor="middle" fill="#ffffff" fontSize="16" fontWeight="900">
                  3
                </text>
                <text x="85" y="38" fill="#d97706" fontSize="10" fontWeight="bold">
                  THIRD PLACE
                </text>
                <text x="85" y="64" fill="#ffffff" fontSize="17" fontWeight="900">
                  {topWinners[2]?.participant_name || 'Third Rank'}
                </text>
                <text x="85" y="88" fill="#94a3b8" fontSize="12" fontWeight="semibold">
                  {topWinners[2]?.group_name || 'House Team'} • {topWinners[2]?.total_marks || 82} Marks
                </text>
              </g>

              {/* Bottom Watermark / Signature */}
              <text x="300" y="720" textAnchor="middle" fill="#64748b" fontSize="11">
                CERTIFIED & ANNOUNCED VIA PROGRAMHUB
              </text>
              <text x="300" y="740" textAnchor="middle" fill="#475569" fontSize="10">
                Official Result Verification Code: #{program?.program_code || 'P001'}-2026
              </text>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PosterStudioPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-8 text-center text-slate-400">
          <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-2" />
          <span>Loading Poster Studio...</span>
        </div>
      }
    >
      <PosterStudioContent />
    </React.Suspense>
  );
}
