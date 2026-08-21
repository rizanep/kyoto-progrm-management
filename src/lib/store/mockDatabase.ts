import {
  Organization,
  Profile,
  AcademicClass,
  Division,
  Student,
  Group,
  GroupMembership,
  ProgramCategory,
  ProgramDivision,
  Position,
  Grade,
  Program,
  ProgramParticipant,
  JudgingCriterion,
  JudgeScore,
  ProgramResult,
  PosterTemplate,
  AuditLog,
  GroupScoreAggregate,
} from '@/lib/types/database';

export interface DatabaseState {
  organization: Organization;
  profile: Profile;
  users: Profile[];
  classes: AcademicClass[];
  divisions: Division[];
  students: Student[];
  groups: Group[];
  groupMemberships: GroupMembership[];
  categories: ProgramCategory[];
  programDivisions: ProgramDivision[];
  positions: Position[];
  grades: Grade[];
  programs: Program[];
  participants: ProgramParticipant[];
  judgingCriteria: Record<string, JudgingCriterion[]>;
  scores: Record<string, JudgeScore[]>; // key: programId
  results: Record<string, ProgramResult[]>; // key: programId
  templates: PosterTemplate[];
  auditLogs: AuditLog[];
  groupPointAdjustments: Array<{
    id: string;
    group_id: string;
    program_id?: string;
    points: number;
    adjustment_type: string;
    reason: string;
    created_at: string;
  }>;
}

const DEFAULT_ORG_ID = '00000000-0000-0000-0000-000000000001';
const DEFAULT_CONFIG_ID = 'cfg-default-2026';

export const initialData: DatabaseState = {
  organization: {
    id: DEFAULT_ORG_ID,
    name: 'SIRAJU ULOOMUDHIN MADRASA KAPPAKKAL',
    code: 'SUM-KPKL',
    logo_url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=150',
    description: 'Premier Islamic Arts & Academic Fest — ISHQE HABEEB 26',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  profile: {
    id: '00000000-0000-0000-0000-000000000002',
    organization_id: DEFAULT_ORG_ID,
    full_name: 'Muhammad Danish',
    email: 'admin@sumkappakkal.edu',
    phone: '8281740483',
    password_pin: '8281',
    role: 'ADMIN',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    status: 'ACTIVE',
    created_at: new Date().toISOString(),
  },
  users: [
    {
      id: '00000000-0000-0000-0000-000000000002',
      organization_id: DEFAULT_ORG_ID,
      full_name: 'Muhammad Danish',
      email: 'admin@sumkappakkal.edu',
      phone: '8281740483',
      password_pin: '8281',
      role: 'ADMIN',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    },
    {
      id: 'usr-judge-1',
      organization_id: DEFAULT_ORG_ID,
      full_name: 'Ustad Abdul Rahman',
      email: 'judge1@sumkappakkal.edu',
      phone: '9876543210',
      password_pin: '1234',
      role: 'JUDGE',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    },
    {
      id: 'usr-organizer-1',
      organization_id: DEFAULT_ORG_ID,
      full_name: 'Zubair Moulavi',
      email: 'organizer@sumkappakkal.edu',
      phone: '9895012345',
      password_pin: '5555',
      role: 'ORGANIZER',
      avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    },
  ],
  classes: [
    { id: 'cls-5', organization_id: DEFAULT_ORG_ID, name: 'Class 5', code: 'CLS-05', sort_order: 1, is_active: true, student_count: 2 },
    { id: 'cls-6', organization_id: DEFAULT_ORG_ID, name: 'Class 6', code: 'CLS-06', sort_order: 2, is_active: true, student_count: 2 },
    { id: 'cls-7', organization_id: DEFAULT_ORG_ID, name: 'Class 7', code: 'CLS-07', sort_order: 3, is_active: true, student_count: 1 },
  ],
  divisions: [
    { id: 'div-5a', organization_id: DEFAULT_ORG_ID, class_id: 'cls-5', name: 'Division A', code: 'DIV-A', sort_order: 1, is_active: true },
    { id: 'div-5b', organization_id: DEFAULT_ORG_ID, class_id: 'cls-5', name: 'Division B', code: 'DIV-B', sort_order: 2, is_active: true },
    { id: 'div-6a', organization_id: DEFAULT_ORG_ID, class_id: 'cls-6', name: 'Division A', code: 'DIV-A', sort_order: 1, is_active: true },
    { id: 'div-7a', organization_id: DEFAULT_ORG_ID, class_id: 'cls-7', name: 'Division A', code: 'DIV-A', sort_order: 1, is_active: true },
  ],
  groups: [
    { id: 'grp-red', organization_id: DEFAULT_ORG_ID, name: 'Red Phoenix', code: 'GRP-RED', description: 'Courage, passion, and excellence', color: '#ef4444', sort_order: 1, status: 'ACTIVE', created_at: new Date().toISOString(), member_count: 2, leader_name: 'Aarav Sharma', asst_leader_name: null, total_points: 25 },
    { id: 'grp-blue', organization_id: DEFAULT_ORG_ID, name: 'Blue Dragons', code: 'GRP-BLUE', description: 'Wisdom, focus, and strength', color: '#3b82f6', sort_order: 2, status: 'ACTIVE', created_at: new Date().toISOString(), member_count: 2, leader_name: 'Ananya Iyer', asst_leader_name: null, total_points: 18 },
    { id: 'grp-green', organization_id: DEFAULT_ORG_ID, name: 'Green Falcons', code: 'GRP-GREEN', description: 'Agility, harmony, and resilience', color: '#10b981', sort_order: 3, status: 'ACTIVE', created_at: new Date().toISOString(), member_count: 1, leader_name: 'Rohan Verma', asst_leader_name: 'Zoya Khan', total_points: 12 },
  ],
  students: [
    {
      id: 'stu-1',
      organization_id: DEFAULT_ORG_ID,
      student_code: 'STU-001',
      registration_number: 'REG-2026-001',
      full_name: 'Aarav Sharma',
      display_name: 'Aarav',
      photo_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      date_of_birth: '2014-04-12',
      gender: 'MALE',
      class_id: 'cls-5',
      class_name: 'Class 5',
      division_id: 'div-5a',
      division_name: 'Division A',
      group_id: 'grp-red',
      group_name: 'Red Phoenix',
      group_color: '#ef4444',
      status: 'ACTIVE',
      notes: 'Excellent classical dancer',
      created_at: new Date().toISOString(),
    },
    {
      id: 'stu-2',
      organization_id: DEFAULT_ORG_ID,
      student_code: 'STU-002',
      registration_number: 'REG-2026-002',
      full_name: 'Ananya Iyer',
      display_name: 'Ananya',
      photo_url: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150',
      date_of_birth: '2014-07-25',
      gender: 'FEMALE',
      class_id: 'cls-5',
      class_name: 'Class 5',
      division_id: 'div-5a',
      division_name: 'Division A',
      group_id: 'grp-blue',
      group_name: 'Blue Dragons',
      group_color: '#3b82f6',
      status: 'ACTIVE',
      notes: 'Vocal soloist and debate finalist',
      created_at: new Date().toISOString(),
    },
    {
      id: 'stu-3',
      organization_id: DEFAULT_ORG_ID,
      student_code: 'STU-003',
      registration_number: 'REG-2026-003',
      full_name: 'Rohan Verma',
      display_name: 'Rohan',
      photo_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      date_of_birth: '2013-11-03',
      gender: 'MALE',
      class_id: 'cls-6',
      class_name: 'Class 6',
      division_id: 'div-6a',
      division_name: 'Division A',
      group_id: 'grp-green',
      group_name: 'Green Falcons',
      group_color: '#10b981',
      status: 'ACTIVE',
      notes: 'State level athlete',
      created_at: new Date().toISOString(),
    },
    {
      id: 'stu-4',
      organization_id: DEFAULT_ORG_ID,
      student_code: 'STU-004',
      registration_number: 'REG-2026-004',
      full_name: 'Zoya Khan',
      display_name: 'Zoya',
      photo_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      date_of_birth: '2013-09-18',
      gender: 'FEMALE',
      class_id: 'cls-6',
      class_name: 'Class 6',
      division_id: 'div-6a',
      division_name: 'Division A',
      group_id: 'grp-red',
      group_name: 'Red Phoenix',
      group_color: '#ef4444',
      status: 'ACTIVE',
      notes: 'Public speaking champion',
      created_at: new Date().toISOString(),
    },
    {
      id: 'stu-5',
      organization_id: DEFAULT_ORG_ID,
      student_code: 'STU-005',
      registration_number: 'REG-2026-005',
      full_name: 'Kabir Mehta',
      display_name: 'Kabir',
      photo_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      date_of_birth: '2012-05-10',
      gender: 'MALE',
      class_id: 'cls-7',
      class_name: 'Class 7',
      division_id: 'div-7a',
      division_name: 'Division A',
      group_id: 'grp-blue',
      group_name: 'Blue Dragons',
      group_color: '#3b82f6',
      status: 'ACTIVE',
      notes: 'Guitar and instrumental enthusiast',
      created_at: new Date().toISOString(),
    },
  ],
  groupMemberships: [
    { id: 'gm-1', group_id: 'grp-red', student_id: 'stu-1', student_name: 'Aarav Sharma', student_code: 'STU-001', role: 'LEADER', is_active: true, joined_at: new Date().toISOString() },
    { id: 'gm-2', group_id: 'grp-blue', student_id: 'stu-2', student_name: 'Ananya Iyer', student_code: 'STU-002', role: 'LEADER', is_active: true, joined_at: new Date().toISOString() },
    { id: 'gm-3', group_id: 'grp-green', student_id: 'stu-3', student_name: 'Rohan Verma', student_code: 'STU-003', role: 'LEADER', is_active: true, joined_at: new Date().toISOString() },
    { id: 'gm-4', group_id: 'grp-red', student_id: 'stu-4', student_name: 'Zoya Khan', student_code: 'STU-004', role: 'ASST_LEADER', is_active: true, joined_at: new Date().toISOString() },
    { id: 'gm-5', group_id: 'grp-blue', student_id: 'stu-5', student_name: 'Kabir Mehta', student_code: 'STU-005', role: 'MEMBER', is_active: true, joined_at: new Date().toISOString() },
  ],
  categories: [
    { id: 'cat-stage', organization_id: DEFAULT_ORG_ID, name: 'Stage Arts', code: 'CAT-STAGE', description: 'Performing arts, dance, vocal, drama', icon: 'Music', color: '#8b5cf6', sort_order: 1, is_active: true },
    { id: 'cat-nonstage', organization_id: DEFAULT_ORG_ID, name: 'Non-Stage Arts', code: 'CAT-NONSTAGE', description: 'Painting, calligraphy, essay, quiz', icon: 'Palette', color: '#06b6d4', sort_order: 2, is_active: true },
    { id: 'cat-sports', organization_id: DEFAULT_ORG_ID, name: 'Athletics & Sports', code: 'CAT-SPORTS', description: 'Track, field, sprint, relay', icon: 'Trophy', color: '#f59e0b', sort_order: 3, is_active: true },
    { id: 'cat-literary', organization_id: DEFAULT_ORG_ID, name: 'Literary & Debate', code: 'CAT-LIT', description: 'Elocution, extempore, debate', icon: 'BookOpen', color: '#10b981', sort_order: 4, is_active: true },
  ],
  programDivisions: [
    { id: 'pdiv-subj', organization_id: DEFAULT_ORG_ID, name: 'Sub-Junior', code: 'DIV-SUBJ', description: 'Classes 1 to 4', eligible_class_ids: ['cls-1', 'cls-2', 'cls-3', 'cls-4'], sort_order: 1, is_active: true },
    { id: 'pdiv-jun', organization_id: DEFAULT_ORG_ID, name: 'Junior', code: 'DIV-JUN', description: 'Classes 5 to 7', eligible_class_ids: ['cls-5', 'cls-6', 'cls-7'], sort_order: 2, is_active: true },
    { id: 'pdiv-sen', organization_id: DEFAULT_ORG_ID, name: 'Senior', code: 'DIV-SEN', description: 'Classes 8 to 10', eligible_class_ids: ['cls-8', 'cls-9', 'cls-10'], sort_order: 3, is_active: true },
    { id: 'pdiv-open', organization_id: DEFAULT_ORG_ID, name: 'General / Open', code: 'DIV-OPEN', description: 'Open for all classes', eligible_class_ids: ['cls-5', 'cls-6', 'cls-7', 'cls-8', 'cls-9', 'cls-10'], sort_order: 4, is_active: true },
  ],
  positions: [
    { id: 'pos-1', scoring_config_id: DEFAULT_CONFIG_ID, name: '1st Place', code: 'POS-1ST', rank: 1, points: 5, color: '#eab308', sort_order: 1, is_active: true },
    { id: 'pos-2', scoring_config_id: DEFAULT_CONFIG_ID, name: '2nd Place', code: 'POS-2ND', rank: 2, points: 3, color: '#94a3b8', sort_order: 2, is_active: true },
    { id: 'pos-3', scoring_config_id: DEFAULT_CONFIG_ID, name: '3rd Place', code: 'POS-3RD', rank: 3, points: 1, color: '#b45309', sort_order: 3, is_active: true },
  ],
  grades: [
    { id: 'grd-a', scoring_config_id: DEFAULT_CONFIG_ID, name: 'Grade A', min_mark: 80, max_mark: 100, points: 5, sort_order: 1 },
    { id: 'grd-b', scoring_config_id: DEFAULT_CONFIG_ID, name: 'Grade B', min_mark: 60, max_mark: 79.99, points: 3, sort_order: 2 },
    { id: 'grd-c', scoring_config_id: DEFAULT_CONFIG_ID, name: 'Grade C', min_mark: 40, max_mark: 59.99, points: 1, sort_order: 3 },
  ],
  programs: [
    {
      id: 'prog-1',
      organization_id: DEFAULT_ORG_ID,
      program_code: 'IH-01',
      name: 'Qira’at & Tajweed Competition',
      description: 'Holy Quran recitation with authentic Tajweed rules — ISHQE HABEEB 26',
      category_id: 'cat-stage',
      category_name: 'Stage Arts',
      category_color: '#8b5cf6',
      division_id: 'pdiv-jun',
      division_name: 'Junior',
      program_type: 'INDIVIDUAL',
      scoring_config_id: DEFAULT_CONFIG_ID,
      min_participants: 1,
      max_participants: 10,
      duration_minutes: 8,
      venue: 'Main Madrasa Stage A',
      scheduled_at: new Date(Date.now() + 3600000).toISOString(),
      status: 'STARTED',
      result_status: 'IN_PROGRESS',
      started_at: new Date().toISOString(),
      is_public_visible: true,
      participant_count: 3,
      eligible_classes: ['cls-5', 'cls-6', 'cls-7'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prog-2',
      organization_id: DEFAULT_ORG_ID,
      program_code: 'IH-02',
      name: 'Naat Sharif (Madhu Ganam)',
      description: 'Soulful praise of Prophet Muhammad ﷺ — ISHQE HABEEB 26',
      category_id: 'cat-stage',
      category_name: 'Stage Arts',
      category_color: '#8b5cf6',
      division_id: 'pdiv-sen',
      division_name: 'Senior',
      program_type: 'INDIVIDUAL',
      scoring_config_id: DEFAULT_CONFIG_ID,
      min_participants: 1,
      max_participants: 10,
      duration_minutes: 5,
      venue: 'Main Stage B',
      scheduled_at: new Date(Date.now() + 7200000).toISOString(),
      status: 'ANNOUNCED',
      result_status: 'ANNOUNCED',
      announced_at: new Date().toISOString(),
      is_public_visible: true,
      participant_count: 3,
      eligible_classes: ['cls-6', 'cls-7'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: 'prog-3',
      organization_id: DEFAULT_ORG_ID,
      program_code: 'IH-03',
      name: 'Islamic Elocution / Speech',
      description: 'Topic: Seerat-un-Nabi & Islamic Ethics — ISHQE HABEEB 26',
      category_id: 'cat-literary',
      category_name: 'Literary & Debate',
      category_color: '#10b981',
      division_id: 'pdiv-open',
      division_name: 'General / Open',
      program_type: 'INDIVIDUAL',
      scoring_config_id: DEFAULT_CONFIG_ID,
      min_participants: 1,
      max_participants: 15,
      duration_minutes: 10,
      venue: 'Auditorium Hall C',
      scheduled_at: new Date(Date.now() + 10800000).toISOString(),
      status: 'SCHEDULED',
      result_status: 'NOT_STARTED',
      is_public_visible: true,
      participant_count: 2,
      eligible_classes: ['cls-5', 'cls-6', 'cls-7'],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ],
  participants: [
    {
      id: 'part-1',
      program_id: 'prog-1',
      student_id: 'stu-1',
      student_name: 'Aarav Sharma',
      student_code: 'STU-001',
      group_id: 'grp-red',
      group_name: 'Red Phoenix',
      group_color: '#ef4444',
      participant_number: 101,
      registration_status: 'CONFIRMED',
      attendance_status: 'PRESENT',
      created_at: new Date().toISOString(),
    },
    {
      id: 'part-2',
      program_id: 'prog-1',
      student_id: 'stu-2',
      student_name: 'Ananya Iyer',
      student_code: 'STU-002',
      group_id: 'grp-blue',
      group_name: 'Blue Dragons',
      group_color: '#3b82f6',
      participant_number: 102,
      registration_status: 'CONFIRMED',
      attendance_status: 'PRESENT',
      created_at: new Date().toISOString(),
    },
    {
      id: 'part-3',
      program_id: 'prog-1',
      student_id: 'stu-4',
      student_name: 'Zoya Khan',
      student_code: 'STU-004',
      group_id: 'grp-red',
      group_name: 'Red Phoenix',
      group_color: '#ef4444',
      participant_number: 103,
      registration_status: 'CONFIRMED',
      attendance_status: 'PRESENT',
      created_at: new Date().toISOString(),
    },
    {
      id: 'part-4',
      program_id: 'prog-2',
      student_id: 'stu-4',
      student_name: 'Zoya Khan',
      student_code: 'STU-004',
      group_id: 'grp-red',
      group_name: 'Red Phoenix',
      group_color: '#ef4444',
      participant_number: 201,
      registration_status: 'CONFIRMED',
      attendance_status: 'PRESENT',
      created_at: new Date().toISOString(),
      total_marks: 92,
      position_name: '1st Place',
      grade_name: 'Grade A',
      points_awarded: 5,
    },
    {
      id: 'part-5',
      program_id: 'prog-2',
      student_id: 'stu-3',
      student_name: 'Rohan Verma',
      student_code: 'STU-003',
      group_id: 'grp-green',
      group_name: 'Green Falcons',
      group_color: '#10b981',
      participant_number: 202,
      registration_status: 'CONFIRMED',
      attendance_status: 'PRESENT',
      created_at: new Date().toISOString(),
      total_marks: 84,
      position_name: '2nd Place',
      grade_name: 'Grade A',
      points_awarded: 3,
    },
  ],
  judgingCriteria: {
    'prog-1': [
      { id: 'crit-1', program_id: 'prog-1', name: 'Performance & Expression (Bhava)', max_marks: 40, weight: 1.0, sort_order: 1 },
      { id: 'crit-2', program_id: 'prog-1', name: 'Technique & Rhythm (Tala)', max_marks: 30, weight: 1.0, sort_order: 2 },
      { id: 'crit-3', program_id: 'prog-1', name: 'Presentation & Attire (Aharya)', max_marks: 20, weight: 1.0, sort_order: 3 },
      { id: 'crit-4', program_id: 'prog-1', name: 'Discipline & Stage Presence', max_marks: 10, weight: 1.0, sort_order: 4 },
    ],
    'prog-2': [
      { id: 'crit-21', program_id: 'prog-2', name: 'Content & Coherence', max_marks: 40, weight: 1.0, sort_order: 1 },
      { id: 'crit-22', program_id: 'prog-2', name: 'Fluency & Vocabulary', max_marks: 30, weight: 1.0, sort_order: 2 },
      { id: 'crit-23', program_id: 'prog-2', name: 'Voice Modulation & Impact', max_marks: 30, weight: 1.0, sort_order: 3 },
    ],
  },
  scores: {
    'prog-2': [
      { id: 'sc-1', program_id: 'prog-2', judge_id: 'judge-1', participant_id: 'part-4', criterion_id: 'crit-21', marks: 38 },
      { id: 'sc-2', program_id: 'prog-2', judge_id: 'judge-1', participant_id: 'part-4', criterion_id: 'crit-22', marks: 28 },
      { id: 'sc-3', program_id: 'prog-2', judge_id: 'judge-1', participant_id: 'part-4', criterion_id: 'crit-23', marks: 26 },
      { id: 'sc-4', program_id: 'prog-2', judge_id: 'judge-1', participant_id: 'part-5', criterion_id: 'crit-21', marks: 34 },
      { id: 'sc-5', program_id: 'prog-2', judge_id: 'judge-1', participant_id: 'part-5', criterion_id: 'crit-22', marks: 26 },
      { id: 'sc-6', program_id: 'prog-2', judge_id: 'judge-1', participant_id: 'part-5', criterion_id: 'crit-23', marks: 24 },
    ],
  },
  results: {
    'prog-2': [
      {
        id: 'res-1',
        program_id: 'prog-2',
        participant_id: 'part-4',
        participant_number: 201,
        participant_name: 'Zoya Khan',
        group_name: 'Red Phoenix',
        group_color: '#ef4444',
        total_marks: 92,
        position_id: 'pos-1',
        position_name: '1st Place',
        position_rank: 1,
        grade_id: 'grd-a',
        grade_name: 'Grade A',
        points_awarded: 5,
        is_locked: true,
        snapshot_data: {
          student_name: 'Zoya Khan',
          student_code: 'STU-004',
          group_name: 'Red Phoenix',
          program_name: 'English Extempore Speech',
          category_name: 'Literary & Debate',
          division_name: 'Junior',
          announced_at: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
      },
      {
        id: 'res-2',
        program_id: 'prog-2',
        participant_id: 'part-5',
        participant_number: 202,
        participant_name: 'Rohan Verma',
        group_name: 'Green Falcons',
        group_color: '#10b981',
        total_marks: 84,
        position_id: 'pos-2',
        position_name: '2nd Place',
        position_rank: 2,
        grade_id: 'grd-a',
        grade_name: 'Grade A',
        points_awarded: 3,
        is_locked: true,
        snapshot_data: {
          student_name: 'Rohan Verma',
          student_code: 'STU-003',
          group_name: 'Green Falcons',
          program_name: 'English Extempore Speech',
          category_name: 'Literary & Debate',
          division_name: 'Junior',
          announced_at: new Date().toISOString(),
        },
        created_at: new Date().toISOString(),
      },
    ],
  },
  templates: [
    {
      id: 'tmpl-1',
      organization_id: DEFAULT_ORG_ID,
      name: 'Royal Gold Championship',
      theme_code: 'ROYAL_GOLD',
      layout_config: { background: 'gradient-dark-gold', headerFont: 'serif' },
      is_default: true,
    },
    {
      id: 'tmpl-2',
      organization_id: DEFAULT_ORG_ID,
      name: 'Modern Cyber Athletic',
      theme_code: 'CYBER_ATHLETIC',
      layout_config: { background: 'gradient-slate-indigo', headerFont: 'sans' },
      is_default: false,
    },
  ],
  auditLogs: [
    {
      id: 'aud-1',
      organization_id: DEFAULT_ORG_ID,
      user_email: 'mail@transituae.com',
      action: 'ANNOUNCE_RESULTS',
      entity_name: 'program',
      entity_id: 'prog-2',
      new_values: { status: 'ANNOUNCED', program: 'English Extempore Speech' },
      ip_address: '192.168.1.1',
      created_at: new Date(Date.now() - 1800000).toISOString(),
    },
    {
      id: 'aud-2',
      organization_id: DEFAULT_ORG_ID,
      user_email: 'mail@transituae.com',
      action: 'START_PROGRAM',
      entity_name: 'program',
      entity_id: 'prog-1',
      new_values: { status: 'STARTED', program: 'Junior Classical Dance' },
      ip_address: '192.168.1.1',
      created_at: new Date(Date.now() - 3600000).toISOString(),
    },
  ],
  groupPointAdjustments: [
    {
      id: 'adj-1',
      group_id: 'grp-red',
      points: 10,
      adjustment_type: 'GENERAL_PROGRAM',
      reason: 'General Sportsmanship Award',
      created_at: new Date().toISOString(),
    },
  ],
};

const STORAGE_KEY = 'programhub_db_v6';

class StoreManager {
  private state: DatabaseState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = initialData;
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        try {
          this.state = { ...initialData, ...JSON.parse(saved) };
        } catch {
          this.state = initialData;
        }
      }
    }
  }

  public getState(): DatabaseState {
    return this.state;
  }

  public setState(updater: (prev: DatabaseState) => DatabaseState) {
    this.state = updater(this.state);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
      } catch (e) {
        console.warn('LocalStorage save failed', e);
      }
    }
    this.notify();
  }

  public resetToDefaults() {
    this.state = initialData;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    this.notify();
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  // Championship Leaderboard Aggregator
  public getChampionshipRankings(): GroupScoreAggregate[] {
    const s = this.state;
    const groupTotals: Record<string, { ind: number; gen: number; bon: number; pen: number }> = {};

    s.groups.forEach((g) => {
      groupTotals[g.id] = { ind: 0, gen: 0, bon: 0, pen: 0 };
    });

    // 1. Add points from announced program results
    Object.values(s.results).forEach((resList) => {
      resList.forEach((r) => {
        const part = s.participants.find((p) => p.id === r.participant_id);
        if (part?.group_id && groupTotals[part.group_id]) {
          groupTotals[part.group_id].ind += r.points_awarded || 0;
        }
      });
    });

    // 2. Add manual adjustments / general program marks
    s.groupPointAdjustments.forEach((adj) => {
      if (groupTotals[adj.group_id]) {
        if (adj.adjustment_type === 'GENERAL_PROGRAM') {
          groupTotals[adj.group_id].gen += adj.points;
        } else if (adj.adjustment_type === 'BONUS') {
          groupTotals[adj.group_id].bon += adj.points;
        } else if (adj.adjustment_type === 'PENALTY') {
          groupTotals[adj.group_id].pen += adj.points;
        }
      }
    });

    const aggregates: GroupScoreAggregate[] = s.groups.map((g) => {
      const t = groupTotals[g.id] || { ind: 0, gen: 0, bon: 0, pen: 0 };
      const total = t.ind + t.gen + t.bon - t.pen;
      return {
        group_id: g.id,
        group_name: g.name,
        group_code: g.code,
        group_color: g.color,
        individual_points: t.ind,
        general_program_points: t.gen,
        bonus_points: t.bon,
        penalty_points: t.pen,
        total_points: total,
        rank: 0,
      };
    });

    aggregates.sort((a, b) => b.total_points - a.total_points);
    aggregates.forEach((agg, idx) => {
      agg.rank = idx + 1;
    });

    return aggregates;
  }
}

export const dbStore = new StoreManager();
