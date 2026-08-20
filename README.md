# ProgramHub PRO — Production Program Management Platform

A modern, production-ready competition, judging, and program management platform built with **Next.js (App Router, React 19, TypeScript, Tailwind CSS)** and **Supabase (PostgreSQL, Row-Level Security, Supabase Auth, Storage, and Realtime)**.

Designed with a sleek **Facit Theme** with responsive layouts, dark mode, accessible components, and projector/TV display modes.

---

## 🌟 Key Features

1. **Facit UI Theme & Experience**:
   - Deep charcoal dark rounded sidebar (`#0c131d`) with active pill highlights (`#1e293b`).
   - Top navigation with organization switcher, live digital clock widget, and status badges.
   - Fully responsive for mobile devices with a slide-in drawer and sticky bottom navigation bar.
2. **Academic Structure & Students**:
   - Institutional classes (Class 5, 6, 7...) and divisions (A, B...).
   - Student roster with unique admission codes and house affiliations.
   - **Production CSV Importer Engine**: Drag & drop CSV, validation diagnostics, duplicate detection, and bulk commit.
3. **House Groups & Leadership**:
   - Multi-house championship system (Red Phoenix, Blue Dragons, Green Falcons).
   - House Captain and Assistant Captain appointments linked directly to student profiles.
4. **Configurable Competition & Programs**:
   - Dynamic categories (Stage, Non-Stage, Sports, Literary) and divisions (Sub-Junior, Junior, Senior).
   - Multi-step Program Creation Wizard with criteria weighting and class eligibility constraints.
   - **Eligibility Engine**: Validates class, division, age bounds, and capacity limits.
5. **Event Execution & Judging**:
   - Program state machine (`DRAFT` → `SCHEDULED` → `STARTED` → `JUDGING` → `JUDGED` → `ANNOUNCED`).
   - Roll call attendance marking.
   - **Dedicated Judge Scoring Portal**: Keyboard-friendly score entry, automatic total calculation, and multi-judge aggregation (`SUM`, `AVERAGE`, `OLYMPIC_TRIMMED`).
6. **Results, Standings & Announcements**:
   - Position point matrix (1st = 5 pts, 2nd = 3 pts, 3rd = 1 pt) & grade bands (Grade A, Grade B...).
   - Pre-announcement review console and certified announcement with celebration confetti.
   - Immutable snapshot generation on announcement (`snapshot_data JSONB`).
7. **Social Media Poster Studio**:
   - Live SVG / Canvas / PNG poster generation with customizable themes (Royal Gold, Cyber Slate, Emerald).
   - Download high-definition PNGs for Instagram and WhatsApp status.
8. **Public Experience & Live TV Projector Feed**:
   - Public program catalog (`/programs`) and individual result views with confidential data masked.
   - Championship Leaderboard (`/results`) with animated podium and scoring breakdown.
   - **Auditorium Projector Display Mode** (`/live`) designed for large screens with real-time updates.
9. **Production Audit Trail**:
   - Audits all mutations with user email, timestamp, entity ID, change payload, and IP address.

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env.local` and add your Supabase credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Run Automated Tests
```bash
npm run test
```

### 5. Build for Production
```bash
npm run build
```

---

## 📁 Project Structure

```
src/
├── app/                  # Next.js App Router (Admin, Public, Live Display)
├── components/           # Facit UI design system, layout, and shared components
├── features/             # Domain engines (Eligibility, Judging, Scoring, State Machine, CSV)
├── lib/                  # Supabase clients, database types, formatters, and reactive store
└── supabase/
    ├── migrations/       # Numbered SQL migrations (001 - 007)
    └── seed.sql          # Sample development & test dataset
```
