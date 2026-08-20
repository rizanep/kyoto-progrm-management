-- ==============================================================================
-- PROGRAM MANAGEMENT PLATFORM: FULL SCHEMA & SEED SCRIPT (ONE-CLICK DEPLOY)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Organizations Table
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(50) UNIQUE NOT NULL,
    logo_url TEXT,
    description TEXT,
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'ARCHIVED')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_user_id UUID UNIQUE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    avatar_url TEXT,
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'BANNED')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Roles & Permissions
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    is_system BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (organization_id, code)
);

CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(100) UNIQUE NOT NULL,
    module VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID NOT NULL REFERENCES permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (role_id, permission_id)
);

CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (profile_id, role_id)
);

-- 4. Academic Classes & Divisions
CREATE TABLE IF NOT EXISTS academic_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMPTZ,
    UNIQUE (organization_id, code)
);

CREATE TABLE IF NOT EXISTS divisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES academic_classes(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(50) NOT NULL,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMPTZ,
    UNIQUE (class_id, code)
);

-- 5. Students
CREATE TABLE IF NOT EXISTS students (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    student_code VARCHAR(100) NOT NULL,
    registration_number VARCHAR(100),
    full_name VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    photo_url TEXT,
    date_of_birth DATE,
    gender VARCHAR(20) CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
    class_id UUID REFERENCES academic_classes(id) ON DELETE SET NULL,
    division_id UUID REFERENCES divisions(id) ON DELETE SET NULL,
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'ARCHIVED')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMPTZ,
    UNIQUE (organization_id, student_code)
);

-- 6. Groups & Memberships
CREATE TABLE IF NOT EXISTS groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    color VARCHAR(30) DEFAULT '#3b82f6',
    logo_url TEXT,
    sort_order INT DEFAULT 0,
    status VARCHAR(50) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    archived_at TIMESTAMPTZ,
    UNIQUE (organization_id, code)
);

CREATE TABLE IF NOT EXISTS group_memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'MEMBER' CHECK (role IN ('MEMBER', 'LEADER', 'ASST_LEADER')),
    is_active BOOLEAN DEFAULT true,
    joined_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    left_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (group_id, student_id, joined_at)
);

-- 7. Competition Configurations, Categories & Divisions
CREATE TABLE IF NOT EXISTS program_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    icon VARCHAR(50) DEFAULT 'Layers',
    color VARCHAR(30) DEFAULT '#6366f1',
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (organization_id, code)
);

CREATE TABLE IF NOT EXISTS program_divisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    min_age INT,
    max_age INT,
    eligible_class_ids UUID[] DEFAULT '{}',
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (organization_id, code)
);

CREATE TABLE IF NOT EXISTS scoring_configurations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    version INT DEFAULT 1,
    is_current BOOLEAN DEFAULT true,
    scoring_method VARCHAR(50) DEFAULT 'SUM' CHECK (scoring_method IN ('SUM', 'AVERAGE', 'WEIGHTED_AVERAGE', 'OLYMPIC_TRIMMED')),
    tie_breaking_rule VARCHAR(50) DEFAULT 'CRITERION_PRIORITY' CHECK (tie_breaking_rule IN ('CRITERION_PRIORITY', 'SHARED_POSITION', 'MANUAL')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scoring_config_id UUID NOT NULL REFERENCES scoring_configurations(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    code VARCHAR(50) NOT NULL,
    rank INT NOT NULL,
    points NUMERIC(6,2) DEFAULT 0,
    color VARCHAR(30) DEFAULT '#f59e0b',
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS grades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scoring_config_id UUID NOT NULL REFERENCES scoring_configurations(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,
    min_mark NUMERIC(6,2) NOT NULL,
    max_mark NUMERIC(6,2) NOT NULL,
    points NUMERIC(6,2) DEFAULT 0,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 8. Programs & Eligibility
CREATE TABLE IF NOT EXISTS programs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    program_code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES program_categories(id) ON DELETE RESTRICT,
    division_id UUID REFERENCES program_divisions(id) ON DELETE RESTRICT,
    program_type VARCHAR(50) DEFAULT 'INDIVIDUAL' CHECK (program_type IN ('INDIVIDUAL', 'GROUP', 'GENERAL', 'TEAM', 'MIXED')),
    scoring_config_id UUID REFERENCES scoring_configurations(id) ON DELETE RESTRICT,
    min_participants INT DEFAULT 1,
    max_participants INT DEFAULT 1,
    duration_minutes INT DEFAULT 10,
    venue VARCHAR(255),
    scheduled_at TIMESTAMPTZ,
    status VARCHAR(50) DEFAULT 'DRAFT' CHECK (status IN ('DRAFT', 'SCHEDULED', 'REGISTRATION_OPEN', 'REGISTRATION_CLOSED', 'READY', 'STARTED', 'ATTENDANCE', 'JUDGING', 'JUDGED', 'ANNOUNCED', 'CANCELLED', 'COMPLETED')),
    result_status VARCHAR(50) DEFAULT 'NOT_STARTED' CHECK (result_status IN ('NOT_STARTED', 'IN_PROGRESS', 'JUDGED', 'REVIEWED', 'ANNOUNCED', 'LOCKED')),
    started_at TIMESTAMPTZ,
    started_by UUID REFERENCES profiles(id),
    judged_at TIMESTAMPTZ,
    announced_at TIMESTAMPTZ,
    announced_by UUID REFERENCES profiles(id),
    is_public_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (organization_id, program_code)
);

CREATE TABLE IF NOT EXISTS program_eligible_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES academic_classes(id) ON DELETE CASCADE,
    UNIQUE (program_id, class_id)
);

CREATE TABLE IF NOT EXISTS program_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    student_id UUID REFERENCES students(id) ON DELETE CASCADE,
    group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
    participant_number INT NOT NULL,
    registration_status VARCHAR(50) DEFAULT 'CONFIRMED' CHECK (registration_status IN ('PENDING', 'CONFIRMED', 'WITHDRAWN', 'DISQUALIFIED')),
    attendance_status VARCHAR(50) DEFAULT 'NOT_MARKED' CHECK (attendance_status IN ('NOT_MARKED', 'PRESENT', 'ABSENT', 'EXCUSED', 'LATE')),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (program_id, student_id),
    UNIQUE (program_id, participant_number)
);

-- 9. Judging Criteria, Scores & Results
CREATE TABLE IF NOT EXISTS judging_criteria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    max_marks NUMERIC(6,2) NOT NULL DEFAULT 10,
    weight NUMERIC(4,2) DEFAULT 1.0,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS program_judges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    judge_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    judge_number INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (program_id, judge_profile_id),
    UNIQUE (program_id, judge_number)
);

CREATE TABLE IF NOT EXISTS judge_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    judge_id UUID NOT NULL REFERENCES program_judges(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES program_participants(id) ON DELETE CASCADE,
    criterion_id UUID NOT NULL REFERENCES judging_criteria(id) ON DELETE CASCADE,
    marks NUMERIC(6,2) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (judge_id, participant_id, criterion_id)
);

CREATE TABLE IF NOT EXISTS program_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    participant_id UUID NOT NULL REFERENCES program_participants(id) ON DELETE CASCADE,
    total_marks NUMERIC(8,2) NOT NULL DEFAULT 0,
    position_id UUID REFERENCES positions(id),
    position_name VARCHAR(50),
    position_rank INT,
    grade_id UUID REFERENCES grades(id),
    grade_name VARCHAR(50),
    points_awarded NUMERIC(8,2) DEFAULT 0,
    is_locked BOOLEAN DEFAULT false,
    snapshot_data JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (program_id, participant_id)
);

CREATE TABLE IF NOT EXISTS group_point_adjustments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    program_id UUID REFERENCES programs(id) ON DELETE SET NULL,
    points NUMERIC(8,2) NOT NULL,
    adjustment_type VARCHAR(50) DEFAULT 'GENERAL_PROGRAM' CHECK (adjustment_type IN ('GENERAL_PROGRAM', 'BONUS', 'PENALTY', 'MANUAL_OVERRIDE')),
    reason TEXT NOT NULL,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 10. Poster Templates & Audit Logs
CREATE TABLE IF NOT EXISTS poster_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    theme_code VARCHAR(50) DEFAULT 'CLASSIC_GOLD',
    layout_config JSONB NOT NULL DEFAULT '{}'::jsonb,
    background_url TEXT,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS generated_posters (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    template_id UUID REFERENCES poster_templates(id),
    image_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    result_snapshot JSONB NOT NULL,
    generated_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    user_email VARCHAR(255),
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(100),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 11. Row Level Security Policies
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE scoring_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE programs ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_eligible_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE judging_criteria ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_judges ENABLE ROW LEVEL SECURITY;
ALTER TABLE judge_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE program_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_point_adjustments ENABLE ROW LEVEL SECURITY;
ALTER TABLE poster_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_posters ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION current_user_org_id()
RETURNS UUID AS $$
  SELECT organization_id FROM profiles WHERE auth_user_id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- Public Read Policies
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view active organizations') THEN
    CREATE POLICY "Public can view active organizations" ON organizations FOR SELECT USING (status = 'ACTIVE');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view active categories and divisions') THEN
    CREATE POLICY "Public can view active categories and divisions" ON program_categories FOR SELECT USING (is_active = true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view published programs') THEN
    CREATE POLICY "Public can view published programs" ON programs FOR SELECT USING (is_public_visible = true AND status NOT IN ('DRAFT', 'CANCELLED'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view announced results') THEN
    CREATE POLICY "Public can view announced results" ON program_results FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view groups') THEN
    CREATE POLICY "Public can view groups" ON groups FOR SELECT USING (status = 'ACTIVE');
  END IF;
END $$;

-- ==============================================================================
-- 12. SEED DATA (ACADEMY SCENARIO)
-- ==============================================================================
DO $$
DECLARE
    org_id UUID := '00000000-0000-0000-0000-000000000001'::UUID;
    prof_id UUID := '00000000-0000-0000-0000-000000000002'::UUID;
    c5_id UUID := uuid_generate_v4();
    c6_id UUID := uuid_generate_v4();
    c7_id UUID := uuid_generate_v4();
    div_a_id UUID := uuid_generate_v4();
    div_b_id UUID := uuid_generate_v4();
    grp_red_id UUID := uuid_generate_v4();
    grp_blue_id UUID := uuid_generate_v4();
    grp_green_id UUID := uuid_generate_v4();
    cat_stage_id UUID := uuid_generate_v4();
    cat_sports_id UUID := uuid_generate_v4();
    div_subj_id UUID := uuid_generate_v4();
    div_jun_id UUID := uuid_generate_v4();
    div_sen_id UUID := uuid_generate_v4();
    cfg_id UUID := uuid_generate_v4();
    prog_dance_id UUID := uuid_generate_v4();
    s1_id UUID := uuid_generate_v4();
    s2_id UUID := uuid_generate_v4();
    s3_id UUID := uuid_generate_v4();
    s4_id UUID := uuid_generate_v4();
    crit1_id UUID := uuid_generate_v4();
    crit2_id UUID := uuid_generate_v4();
    crit3_id UUID := uuid_generate_v4();
    crit4_id UUID := uuid_generate_v4();
    judge1_id UUID := uuid_generate_v4();
    part1_id UUID := uuid_generate_v4();
    part2_id UUID := uuid_generate_v4();
    part3_id UUID := uuid_generate_v4();
BEGIN
    -- Organization: SIRAJU ULOOMUDHIN MADRASA KAPPAKKAL
    INSERT INTO organizations (id, name, code, description, status)
    VALUES (
        org_id, 
        'SIRAJU ULOOMUDHIN MADRASA KAPPAKKAL', 
        'SUM-KPKL', 
        'Annual Islamic Arts & Academic Fest — ISHQE HABEEB 26', 
        'ACTIVE'
    )
    ON CONFLICT (code) DO UPDATE SET 
        name = EXCLUDED.name, 
        description = EXCLUDED.description;

    -- Admin Profile with Phone: 8281740483 (Password/PIN: 8281)
    INSERT INTO profiles (id, auth_user_id, organization_id, full_name, email, phone, status)
    VALUES (
        prof_id, 
        uuid_generate_v4(), 
        org_id, 
        'Muhammad Danish', 
        'admin@sumkappakkal.edu', 
        '8281740483', 
        'ACTIVE'
    )
    ON CONFLICT DO NOTHING;

    -- Classes
    INSERT INTO academic_classes (id, organization_id, name, code, sort_order)
    VALUES 
        (c5_id, org_id, 'Class 5', 'CLS-05', 1),
        (c6_id, org_id, 'Class 6', 'CLS-06', 2),
        (c7_id, org_id, 'Class 7', 'CLS-07', 3)
    ON CONFLICT (organization_id, code) DO NOTHING;

    -- Divisions
    INSERT INTO divisions (id, organization_id, class_id, name, code, sort_order)
    VALUES 
        (div_a_id, org_id, c5_id, 'Division A', 'SEC-A', 1),
        (div_b_id, org_id, c5_id, 'Division B', 'SEC-B', 2)
    ON CONFLICT (class_id, code) DO NOTHING;

    -- Houses
    INSERT INTO groups (id, organization_id, name, code, description, color, sort_order)
    VALUES 
        (grp_red_id, org_id, 'Red Phoenix', 'GRP-RED', 'House Red — ISHQE HABEEB 26', '#ef4444', 1),
        (grp_blue_id, org_id, 'Blue Dragons', 'GRP-BLUE', 'House Blue — ISHQE HABEEB 26', '#3b82f6', 2),
        (grp_green_id, org_id, 'Green Falcons', 'GRP-GREEN', 'House Green — ISHQE HABEEB 26', '#10b981', 3)
    ON CONFLICT (organization_id, code) DO NOTHING;

    -- Categories & Divisions
    INSERT INTO program_categories (id, organization_id, name, code, description, icon, color, sort_order)
    VALUES 
        (cat_stage_id, org_id, 'Stage Arts', 'CAT-STAGE', 'Qiraat, Naat, Duff, Speech', 'Music', '#8b5cf6', 1),
        (cat_sports_id, org_id, 'Literary & Islamic Studies', 'CAT-LIT', 'Essay, Quiz, Quran Hifz', 'BookOpen', '#10b981', 2)
    ON CONFLICT (organization_id, code) DO NOTHING;

    INSERT INTO program_divisions (id, organization_id, name, code, description, eligible_class_ids, sort_order)
    VALUES 
        (div_subj_id, org_id, 'Sub-Junior', 'DIV-SUBJ', 'Classes 1 to 4', ARRAY[c5_id], 1),
        (div_jun_id, org_id, 'Junior', 'DIV-JUN', 'Classes 5 to 7', ARRAY[c5_id, c6_id, c7_id], 2),
        (div_sen_id, org_id, 'Senior', 'DIV-SEN', 'Classes 8 to 10', ARRAY[c6_id, c7_id], 3)
    ON CONFLICT (organization_id, code) DO NOTHING;

    -- Scoring Config & Positions
    INSERT INTO scoring_configurations (id, organization_id, name, version, is_current, scoring_method, tie_breaking_rule)
    VALUES (cfg_id, org_id, 'Standard 100 Marks Matrix', 1, true, 'SUM', 'SHARED_POSITION')
    ON CONFLICT DO NOTHING;

    INSERT INTO positions (id, scoring_config_id, name, code, rank, points, color, sort_order)
    VALUES 
        (uuid_generate_v4(), cfg_id, '1st Place', 'POS-1ST', 1, 5.0, '#eab308', 1),
        (uuid_generate_v4(), cfg_id, '2nd Place', 'POS-2ND', 2, 3.0, '#94a3b8', 2),
        (uuid_generate_v4(), cfg_id, '3rd Place', 'POS-3RD', 3, 1.0, '#b45309', 3)
    ON CONFLICT DO NOTHING;

    INSERT INTO grades (id, scoring_config_id, name, min_mark, max_mark, points, sort_order)
    VALUES 
        (uuid_generate_v4(), cfg_id, 'Grade A', 80.0, 100.0, 5.0, 1),
        (uuid_generate_v4(), cfg_id, 'Grade B', 60.0, 79.99, 3.0, 2),
        (uuid_generate_v4(), cfg_id, 'Grade C', 40.0, 59.99, 1.0, 3)
    ON CONFLICT DO NOTHING;

    -- Students
    INSERT INTO students (id, organization_id, student_code, registration_number, full_name, display_name, date_of_birth, gender, class_id, division_id, status)
    VALUES 
        (s1_id, org_id, 'STU-001', 'REG-2026-001', 'Aarav Sharma', 'Aarav', '2014-04-12', 'MALE', c5_id, div_a_id, 'ACTIVE'),
        (s2_id, org_id, 'STU-002', 'REG-2026-002', 'Ananya Iyer', 'Ananya', '2014-07-25', 'FEMALE', c5_id, div_a_id, 'ACTIVE'),
        (s3_id, org_id, 'STU-003', 'REG-2026-003', 'Rohan Verma', 'Rohan', '2013-11-03', 'MALE', c6_id, div_a_id, 'ACTIVE'),
        (s4_id, org_id, 'STU-004', 'REG-2026-004', 'Zoya Khan', 'Zoya', '2013-09-18', 'FEMALE', c6_id, div_a_id, 'ACTIVE')
    ON CONFLICT (organization_id, student_code) DO NOTHING;

    -- Group Memberships
    INSERT INTO group_memberships (group_id, student_id, role, is_active)
    VALUES 
        (grp_red_id, s1_id, 'LEADER', true),
        (grp_blue_id, s2_id, 'LEADER', true),
        (grp_green_id, s3_id, 'ASST_LEADER', true),
        (grp_red_id, s4_id, 'MEMBER', true)
    ON CONFLICT DO NOTHING;

    -- Programs: ISHQE HABEEB 26
    INSERT INTO programs (
        id, organization_id, program_code, name, description, 
        category_id, division_id, program_type, scoring_config_id, 
        min_participants, max_participants, duration_minutes, venue, scheduled_at, status, result_status
    )
    VALUES (
        prog_dance_id, org_id, 'IH-01', 'Qira’at & Tajweed Competition', 
        'Holy Quran recitation with authentic Tajweed — ISHQE HABEEB 26',
        cat_stage_id, div_jun_id, 'INDIVIDUAL', cfg_id,
        1, 10, 8, 'Main Madrasa Stage A', CURRENT_TIMESTAMP + INTERVAL '2 hours', 'STARTED', 'IN_PROGRESS'
    )
    ON CONFLICT (organization_id, program_code) DO NOTHING;

    INSERT INTO judging_criteria (id, program_id, name, max_marks, weight, sort_order)
    VALUES (crit1_id, prog_dance_id, 'Total Performance & Tajweed', 100.0, 1.0, 1)
    ON CONFLICT DO NOTHING;

    -- Participants
    INSERT INTO program_participants (id, program_id, student_id, group_id, participant_number, registration_status, attendance_status)
    VALUES 
        (part1_id, prog_dance_id, s1_id, grp_red_id, 101, 'CONFIRMED', 'PRESENT'),
        (part2_id, prog_dance_id, s2_id, grp_blue_id, 102, 'CONFIRMED', 'PRESENT'),
        (part3_id, prog_dance_id, s4_id, grp_red_id, 103, 'CONFIRMED', 'PRESENT')
    ON CONFLICT (program_id, student_id) DO NOTHING;

END $$;
