# SIRAJU ULOOMUDHIN MADRASA KAPPAKKAL — ISHQE HABEEB 26
### Production Program & Fest Management Platform

A modern, high-performance, production-ready Program Management Platform designed for institutions, madrasas, schools, and cultural fest organizers. Built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase PostgreSQL**.

---

## 🌟 Key Features

### 1. 🔐 Cryptographic JWT & HttpOnly Session Security
- Server-side cryptographic JWT authentication using HMAC-SHA256 (`jose`).
- Strict `httpOnly`, `sameSite: lax`, `secure` session cookies.
- Middleware protection for all `/admin/*` routes with automatic login redirection.
- Multi-role permission model: `ADMIN`, `JUDGE`, `ORGANIZER`, `FACULTY`.

### 2. 🏛️ Organization & Fest Profile Management
- Configured for **SIRAJU ULOOMUDHIN MADRASA KAPPAKKAL** and **ISHQE HABEEB 26**.
- Live dynamic customization of organization title, fest tagline, and administrator phone via Admin Settings or the navigation bar.

### 3. 👥 User & Staff Authorization
- Admin management of authorized login users (Administrators, Judges, Organizers).
- Phone number + PIN authentication model.

### 4. 🏰 House Groups & Leadership Roster
- Full CRUD for house teams: Create, edit, delete, custom theme colors, mottos.
- Official leadership appointments: House Captains, Vice Captains, and student rosters.
- Live championship point standings and automatic ranking calculation.

### 5. 📋 Simplified Program Management & Printable Judging Sheets
- 1-page quick event creation with automatic 100-mark evaluation matrix.
- Academic class-based division filters (Sub-Junior, Junior, Senior).
- Multi-filter participant assignment (Class, House Group, Gender).
- Auto-generated sequential Chest Numbers (#101, #102, #103...).
- **Printable Judging Sheets**: Print-optimized score sheets with madrasa header, candidate numbers, mark entry columns, and judge signature lines.

### 6. 🏆 Scoring Engine & Real-time Results
- 0–100 mark entry with validation.
- Tied score handling (same marks receive identical rank and championship points).
- Immediate result verification and announcement workflow.
- Live Auditorium Projector Screen (`/live`) with real-time updates and confetti animations.

### 7. 🌗 Modern UI with Dark / Light Theme
- Facit-inspired dashboard layout with responsive mobile navigation.
- Zero-flash dark/light mode toggle with `localStorage` persistence.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Variables (`.env.local`)
Configure your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

NEXT_PUBLIC_APP_NAME="SIRAJU ULOOMUDHIN MADRASA KAPPAKKAL"
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Run Database Migrations & Seeds
Run `supabase/full_schema_and_seed.sql` in your Supabase SQL Editor.

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

* **Admin / Staff Login**: [http://localhost:3000/login](http://localhost:3000/login)
  * Default Admin Phone: `8281740483`
  * Default Admin PIN: `8281`
* **Live Projector Screen**: [http://localhost:3000/live](http://localhost:3000/live)
* **Public Fest Portal**: [http://localhost:3000/programs](http://localhost:3000/programs)

### 5. Run Automated Tests
```bash
npm run test
```

### 6. Production Build
```bash
npm run build
```
