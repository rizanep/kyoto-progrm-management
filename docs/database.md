# Database Schema & Migrations Reference

The platform uses a relational PostgreSQL database schema managed via reproducible migrations in `supabase/migrations/`.

## Migration Sequence

1. `001_initial_schema.sql`
   - `organizations`: Tenancy foundation with status, logo, and metadata.
   - `profiles`: Authenticated users linked to Supabase Auth `auth.users`.
   - `roles`, `permissions`, `role_permissions`, `user_roles`: Fine-grained RBAC.

2. `002_academic_and_students.sql`
   - `academic_classes`: Institutional classes (Class 5, Class 6, etc.).
   - `divisions`: Sections under classes (Division A, Division B).
   - `students`: Enrolled student roster with unique `student_code` per organization.

3. `003_groups_and_members.sql`
   - `groups`: House teams (Red Phoenix, Blue Dragons, Green Falcons).
   - `group_memberships`: Historical house assignments and leadership roles (`LEADER`, `ASST_LEADER`, `MEMBER`).

4. `004_programs_and_eligibility.sql`
   - `program_categories`: Stage, Non-Stage, Sports, Literary, etc.
   - `program_divisions`: Sub-Junior, Junior, Senior, Open (with optional age bounds).
   - `scoring_configurations`: Scoring method and tie-breaking snapshots.
   - `positions`: Dynamic rank points (1st = 5, 2nd = 3, 3rd = 1, etc.).
   - `grades`: Letter grade bands (Grade A: 80-100%, Grade B: 60-79.99%).
   - `programs`: Master competition schedule and state tracking.
   - `program_participants`: Registered performers and chest numbers.

5. `005_judging_and_results.sql`
   - `judging_criteria`: Program-specific parameters (e.g. Performance 40, Technique 30, etc.).
   - `program_judges`: Authorized jury appointments.
   - `judge_scores`: Atomic score inputs.
   - `program_results`: Computed ranks, grades, award points, and immutable announcement snapshots (`snapshot_data JSONB`).
   - `group_point_adjustments`: General non-student program points, bonuses, and penalties.

6. `006_posters_and_audit.sql`
   - `poster_templates`: Social media poster layout themes.
   - `generated_posters`: Rendered images stored in Supabase Storage.
   - `audit_logs`: Production audit logs with author, entity, changes payload, and IP.

7. `007_rls_and_indexes.sql`
   - Row Level Security (RLS) policies for tenant isolation, judge permissions, and safe public read views.
