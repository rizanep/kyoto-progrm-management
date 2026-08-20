-- 005_judging_and_results.sql: Criteria, Judges, Scores, Results, and Group Points

-- Judging Criteria for Programs
CREATE TABLE IF NOT EXISTS judging_criteria (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    max_marks NUMERIC(6,2) NOT NULL DEFAULT 10,
    weight NUMERIC(4,2) DEFAULT 1.0,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Authorized Judges assigned to Programs
CREATE TABLE IF NOT EXISTS program_judges (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    program_id UUID NOT NULL REFERENCES programs(id) ON DELETE CASCADE,
    judge_profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    judge_number INT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (program_id, judge_profile_id),
    UNIQUE (program_id, judge_number)
);

-- Judge Scores
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

-- Program Results Table (Stores Calculated and Announced Results with Immutable Snapshots)
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
    -- Immutable Snapshot Data (JSON of Student Name, Group Name, Program Name at announcement)
    snapshot_data JSONB,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (program_id, participant_id)
);

-- Group Points Adjustments (Bonus, Penalty, General Non-Student Program Points)
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

CREATE INDEX IF NOT EXISTS idx_scores_prog ON judge_scores(program_id);
CREATE INDEX IF NOT EXISTS idx_results_prog ON program_results(program_id);
