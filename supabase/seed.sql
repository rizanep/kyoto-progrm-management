-- ==============================================================================
-- SIRAJU ULOOMUDHIN MADRASA KAPPAKKAL — ISHQE HABEEB 26 SEED DATA
-- ==============================================================================

DO $$
DECLARE
    org_id UUID := '00000000-0000-0000-0000-000000000001'::UUID;
    prof_id UUID := '00000000-0000-0000-0000-000000000002'::UUID;
    c1_id UUID := uuid_generate_v4();
    c2_id UUID := uuid_generate_v4();
    c3_id UUID := uuid_generate_v4();
    c4_id UUID := uuid_generate_v4();
    c5_id UUID := uuid_generate_v4();
    c6_id UUID := uuid_generate_v4();
    c7_id UUID := uuid_generate_v4();
    c8_id UUID := uuid_generate_v4();
    c9_id UUID := uuid_generate_v4();
    c10_id UUID := uuid_generate_v4();
    div_a_id UUID := uuid_generate_v4();
    div_b_id UUID := uuid_generate_v4();
    grp_red_id UUID := uuid_generate_v4();
    grp_blue_id UUID := uuid_generate_v4();
    grp_green_id UUID := uuid_generate_v4();
    grp_yellow_id UUID := uuid_generate_v4();
    cat_stage_id UUID := uuid_generate_v4();
    cat_lit_id UUID := uuid_generate_v4();
    cat_arts_id UUID := uuid_generate_v4();
    div_subj_id UUID := uuid_generate_v4();
    div_jun_id UUID := uuid_generate_v4();
    div_sen_id UUID := uuid_generate_v4();
    cfg_id UUID := uuid_generate_v4();
    prog_qiraat_id UUID := uuid_generate_v4();
    prog_naat_id UUID := uuid_generate_v4();
    s1_id UUID := uuid_generate_v4();
    s2_id UUID := uuid_generate_v4();
    s3_id UUID := uuid_generate_v4();
    s4_id UUID := uuid_generate_v4();
    crit1_id UUID := uuid_generate_v4();
    part1_id UUID := uuid_generate_v4();
    part2_id UUID := uuid_generate_v4();
    part3_id UUID := uuid_generate_v4();
BEGIN
    -- 1. Organization: SIRAJU ULOOMUDHIN MADRASA KAPPAKKAL
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

    -- 2. Admin Profile with Phone: 8281740483 (Password/PIN: 8281)
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

    -- 3. Academic Classes (Class 1 to 10)
    INSERT INTO academic_classes (id, organization_id, name, code, sort_order)
    VALUES 
        (c1_id, org_id, 'Class 1', 'CLS-01', 1),
        (c2_id, org_id, 'Class 2', 'CLS-02', 2),
        (c3_id, org_id, 'Class 3', 'CLS-03', 3),
        (c4_id, org_id, 'Class 4', 'CLS-04', 4),
        (c5_id, org_id, 'Class 5', 'CLS-05', 5),
        (c6_id, org_id, 'Class 6', 'CLS-06', 6),
        (c7_id, org_id, 'Class 7', 'CLS-07', 7),
        (c8_id, org_id, 'Class 8', 'CLS-08', 8),
        (c9_id, org_id, 'Class 9', 'CLS-09', 9),
        (c10_id, org_id, 'Class 10', 'CLS-10', 10)
    ON CONFLICT (organization_id, code) DO NOTHING;

    -- 4. Sections / Divisions
    INSERT INTO divisions (id, organization_id, class_id, name, code, sort_order)
    VALUES 
        (div_a_id, org_id, c5_id, 'Division A', 'SEC-5A', 1),
        (div_b_id, org_id, c5_id, 'Division B', 'SEC-5B', 2)
    ON CONFLICT (class_id, code) DO NOTHING;

    -- 5. House Groups
    INSERT INTO groups (id, organization_id, name, code, description, color, sort_order)
    VALUES 
        (grp_red_id, org_id, 'Red Phoenix', 'GRP-RED', 'House Red — ISHQE HABEEB 26', '#ef4444', 1),
        (grp_blue_id, org_id, 'Blue Dragons', 'GRP-BLUE', 'House Blue — ISHQE HABEEB 26', '#3b82f6', 2),
        (grp_green_id, org_id, 'Green Falcons', 'GRP-GREEN', 'House Green — ISHQE HABEEB 26', '#10b981', 3),
        (grp_yellow_id, org_id, 'Yellow Lions', 'GRP-YEL', 'House Yellow — ISHQE HABEEB 26', '#f59e0b', 4)
    ON CONFLICT (organization_id, code) DO NOTHING;

    -- 6. Program Categories
    INSERT INTO program_categories (id, organization_id, name, code, description, icon, color, sort_order)
    VALUES 
        (cat_stage_id, org_id, 'Stage Arts', 'CAT-STAGE', 'Qiraat, Naat, Duff, Speech', 'Music', '#8b5cf6', 1),
        (cat_lit_id, org_id, 'Literary & Islamic Studies', 'CAT-LIT', 'Essay, Quiz, Quran Hifz, Calligraphy', 'BookOpen', '#10b981', 2),
        (cat_arts_id, org_id, 'General Non-Stage', 'CAT-ARTS', 'Poster design, Arabic handwriting', 'Palette', '#06b6d4', 3)
    ON CONFLICT (organization_id, code) DO NOTHING;

    -- 7. Class-Based Divisions
    INSERT INTO program_divisions (id, organization_id, name, code, description, eligible_class_ids, sort_order)
    VALUES 
        (div_subj_id, org_id, 'Sub-Junior', 'DIV-SUBJ', 'Classes 1 to 4', ARRAY[c1_id, c2_id, c3_id, c4_id], 1),
        (div_jun_id, org_id, 'Junior', 'DIV-JUN', 'Classes 5 to 7', ARRAY[c5_id, c6_id, c7_id], 2),
        (div_sen_id, org_id, 'Senior', 'DIV-SEN', 'Classes 8 to 10', ARRAY[c8_id, c9_id, c10_id], 3)
    ON CONFLICT (organization_id, code) DO NOTHING;

    -- 8. Scoring Configurations, Positions, Grades
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

    -- 9. Students
    INSERT INTO students (id, organization_id, student_code, registration_number, full_name, display_name, date_of_birth, gender, class_id, division_id, status)
    VALUES 
        (s1_id, org_id, 'STU-001', 'REG-2026-001', 'Aarav Sharma', 'Aarav', '2014-04-12', 'MALE', c5_id, div_a_id, 'ACTIVE'),
        (s2_id, org_id, 'STU-002', 'REG-2026-002', 'Ananya Iyer', 'Ananya', '2014-07-25', 'FEMALE', c5_id, div_a_id, 'ACTIVE'),
        (s3_id, org_id, 'STU-003', 'REG-2026-003', 'Rohan Verma', 'Rohan', '2013-11-03', 'MALE', c6_id, div_a_id, 'ACTIVE'),
        (s4_id, org_id, 'STU-004', 'REG-2026-004', 'Zoya Khan', 'Zoya', '2013-09-18', 'FEMALE', c6_id, div_a_id, 'ACTIVE')
    ON CONFLICT (organization_id, student_code) DO NOTHING;

    -- 10. Programs: ISHQE HABEEB 26
    INSERT INTO programs (
        id, organization_id, program_code, name, description, 
        category_id, division_id, program_type, scoring_config_id, 
        min_participants, max_participants, duration_minutes, venue, scheduled_at, status, result_status
    )
    VALUES (
        prog_qiraat_id, org_id, 'IH-01', 'Qira’at & Tajweed Competition', 
        'Holy Quran recitation with authentic Tajweed — ISHQE HABEEB 26',
        cat_stage_id, div_jun_id, 'INDIVIDUAL', cfg_id,
        1, 10, 8, 'Main Madrasa Stage A', CURRENT_TIMESTAMP + INTERVAL '2 hours', 'STARTED', 'IN_PROGRESS'
    )
    ON CONFLICT (organization_id, program_code) DO NOTHING;

    INSERT INTO judging_criteria (id, program_id, name, max_marks, weight, sort_order)
    VALUES (crit1_id, prog_qiraat_id, 'Total Performance & Tajweed', 100.0, 1.0, 1)
    ON CONFLICT DO NOTHING;

    -- Participants with unique Chest Numbers
    INSERT INTO program_participants (id, program_id, student_id, group_id, participant_number, registration_status, attendance_status)
    VALUES 
        (part1_id, prog_qiraat_id, s1_id, grp_red_id, 101, 'CONFIRMED', 'PRESENT'),
        (part2_id, prog_qiraat_id, s2_id, grp_blue_id, 102, 'CONFIRMED', 'PRESENT'),
        (part3_id, prog_qiraat_id, s4_id, grp_red_id, 103, 'CONFIRMED', 'PRESENT')
    ON CONFLICT (program_id, student_id) DO NOTHING;

END $$;
