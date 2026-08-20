# System Architecture Documentation

## Overview
The **Program Management Platform** is designed as a multi-tenant, cloud-native enterprise system using **Next.js (App Router, TypeScript, Tailwind CSS)** and **Supabase (PostgreSQL, Row-Level Security, Supabase Auth, Storage, and Realtime)**.

## Facit-Style UI & Aesthetics
The application implements an ultra-sleek, modern **Facit Dashboard Theme**:
1. **Sidebar Navigation**:
   - Deep charcoal dark rounded container (`#0c131d`) with active pill highlights (`#1e293b`).
   - Category-grouped navigation: Core (`Dashboard`, `Students`, `Classes`, `Houses`), Competition (`Programs`, `Attendance`, `Judging`, `Results`), Publishing (`Posters`, `Live Display`, `Public Portal`), System (`Settings`, `Audit Logs`).
   - User profile badge at the bottom with avatar and role indicators.
2. **Top Navigation Bar**:
   - Breadcrumb indicator.
   - Organization switcher pill.
   - Live digital clock (`8:42:01 AM Thu, Aug 20th`).
   - Theme toggle (Dark/Light).
   - Realtime cloud sync radio status indicator (`((•)) Online`).
   - Notification center.
3. **Responsive & Mobile-First**:
   - Mobile bottom navigation bar and slide-in drawer for touch devices.

## Domain Feature Modules
```
src/
├── app/                  # Next.js App Router Pages & Layouts
├── components/
│   ├── layout/           # Sidebar, Header, MobileNav, FacitShell
│   ├── shared/           # StatCards, MetricGauge, StatusPills, EmptyStates
│   └── ui/               # Button, Card, Badge, Input, Select, Modal, Tabs, Table, Avatar
├── features/
│   ├── students/         # Student CRUD & Production CSV Import Engine
│   ├── groups/           # House Groups & Leadership Appointment
│   ├── programs/         # Lifecycle State Machine & Eligibility Engine
│   ├── judging/          # Multi-Judge Tabulation & Olympic Scoring
│   ├── results/          # Standings Calculation & Announcement Snapshots
│   └── posters/          # Social Media Poster Studio (SVG / Canvas / PNG)
├── lib/
│   ├── store/            # In-Memory & LocalStorage Reactive Synchronized Store
│   ├── supabase/         # Multi-Tier Supabase Clients (client, server, admin)
│   ├── types/            # TypeScript Domain and Database Interfaces
│   └── utils/            # Formatters, Class Merge, and CSV Exporters
└── supabase/
    ├── migrations/       # Numbered SQL Migrations (001 - 007)
    └── seed.sql          # Seed Dataset matching Section 115 Scenario
```

## Security & Isolation
- **Row Level Security (RLS)**: Enforced across all operational tables.
- **Role-Based Access Control (RBAC)**: Fine-grained permissions on administrative actions.
- **Service Role Boundary**: `SUPABASE_SERVICE_ROLE_KEY` is restricted strictly to `src/lib/supabase/admin.ts` on server environments and never exposed to the client.
- **Public Data Masking**: Public routes (`/programs`, `/results`, `/live`) sanitize confidential judge scoring matrices and unannounced program states.
