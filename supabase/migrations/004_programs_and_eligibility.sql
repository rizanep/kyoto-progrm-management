-- 004_programs_and_eligibility.sql: Dynamic Categories, Divisions, Scoring Configs, Programs, and Rules

-- Program Categories (Stage, Non-Stage, Sports, Cultural, Literary, etc.)
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

-- Program Divisions (Sub-Junior, Junior, Senior, Open, etc.)
CREATE TABLE IF NOT EXISTS program_divisions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    code VARCHAR(50) NOT NULL,
    description TEXT,
    min_age INT,
    max_age INT,
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (organization_id, code)
);

-- Scoring Configuration Snapshots (Preserves Historical Rules)
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

-- Positions within Scoring Configuration
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

-- Grades within Scoring Configuration
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

-- Programs Table
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

-- Program Eligibility Rules Junction
CREATE TABLE IF NOT EXISTS program_eligible_classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    class_id UUID NOT NULL REFERENCES academic_classes(id) ON DELETE CASCADE,
    UNIQUE (program_id, class_id)
);

CREATE TABLE IF NOT EXISTS program_eligible_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    UNIQUE (program_id, group_id)
);

-- Program Participants Table
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

CREATE INDEX IF NOT EXISTS idx_programs_org ON programs(organization_id);
CREATE INDEX IF NOT EXISTS idx_programs_status ON programs(status);
CREATE INDEX IF NOT EXISTS idx_participants_prog ON program_participants(program_id);
