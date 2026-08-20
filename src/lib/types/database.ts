export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type ProgramStatus =
  | 'DRAFT'
  | 'SCHEDULED'
  | 'REGISTRATION_OPEN'
  | 'REGISTRATION_CLOSED'
  | 'READY'
  | 'STARTED'
  | 'ATTENDANCE'
  | 'JUDGING'
  | 'JUDGED'
  | 'ANNOUNCED'
  | 'CANCELLED'
  | 'COMPLETED';

export type ResultStatus =
  | 'NOT_STARTED'
  | 'IN_PROGRESS'
  | 'JUDGED'
  | 'REVIEWED'
  | 'ANNOUNCED'
  | 'LOCKED';

export type AttendanceStatus =
  | 'NOT_MARKED'
  | 'PRESENT'
  | 'ABSENT'
  | 'EXCUSED'
  | 'LATE';

export type ProgramType = 'INDIVIDUAL' | 'GROUP' | 'GENERAL' | 'TEAM' | 'MIXED';

export type GroupMemberRole = 'MEMBER' | 'LEADER' | 'ASST_LEADER';

export interface Organization {
  id: string;
  name: string;
  code: string;
  logo_url?: string | null;
  description?: string | null;
  status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  auth_user_id?: string | null;
  organization_id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  password_pin?: string | null;
  avatar_url?: string | null;
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  role?: 'ADMIN' | 'JUDGE' | 'ORGANIZER' | 'FACULTY' | string;
  created_at: string;
}

export interface AcademicClass {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  sort_order: number;
  is_active: boolean;
  archived_at?: string | null;
  divisions?: Division[];
  student_count?: number;
}

export interface Division {
  id: string;
  organization_id: string;
  class_id: string;
  name: string;
  code: string;
  sort_order: number;
  is_active: boolean;
  archived_at?: string | null;
}

export interface Student {
  id: string;
  organization_id: string;
  student_code: string;
  registration_number?: string | null;
  full_name: string;
  display_name?: string | null;
  photo_url?: string | null;
  date_of_birth?: string | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  class_id?: string | null;
  class_name?: string | null;
  division_id?: string | null;
  division_name?: string | null;
  group_id?: string | null;
  group_name?: string | null;
  group_color?: string | null;
  status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
  notes?: string | null;
  created_at: string;
  archived_at?: string | null;
}

export interface Group {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  description?: string | null;
  color: string;
  logo_url?: string | null;
  sort_order: number;
  status: 'ACTIVE' | 'INACTIVE' | 'ARCHIVED';
  created_at: string;
  archived_at?: string | null;
  member_count?: number;
  leader_name?: string | null;
  leader_id?: string | null;
  asst_leader_name?: string | null;
  asst_leader_id?: string | null;
  total_points?: number;
}

export interface GroupMembership {
  id: string;
  group_id: string;
  student_id: string;
  student_name?: string;
  student_code?: string;
  role: GroupMemberRole;
  is_active: boolean;
  joined_at: string;
  left_at?: string | null;
}

export interface ProgramCategory {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  description?: string | null;
  icon: string;
  color: string;
  sort_order: number;
  is_active: boolean;
}

export interface ProgramDivision {
  id: string;
  organization_id: string;
  name: string;
  code: string;
  description?: string | null;
  min_age?: number | null;
  max_age?: number | null;
  eligible_class_ids?: string[];
  sort_order: number;
  is_active: boolean;
}

export interface Position {
  id: string;
  scoring_config_id: string;
  name: string;
  code: string;
  rank: number;
  points: number;
  color: string;
  sort_order: number;
  is_active: boolean;
}

export interface Grade {
  id: string;
  scoring_config_id: string;
  name: string;
  min_mark: number;
  max_mark: number;
  points: number;
  sort_order: number;
}

export interface Program {
  id: string;
  organization_id: string;
  program_code: string;
  name: string;
  description?: string | null;
  category_id: string;
  category_name?: string;
  category_color?: string;
  division_id: string;
  division_name?: string;
  program_type: ProgramType;
  scoring_config_id?: string;
  min_participants: number;
  max_participants: number;
  duration_minutes: number;
  venue?: string | null;
  scheduled_at?: string | null;
  status: ProgramStatus;
  result_status: ResultStatus;
  started_at?: string | null;
  started_by?: string | null;
  judged_at?: string | null;
  announced_at?: string | null;
  announced_by?: string | null;
  is_public_visible: boolean;
  participant_count?: number;
  eligible_classes?: string[];
  eligible_groups?: string[];
  created_at: string;
  updated_at: string;
}

export interface ProgramParticipant {
  id: string;
  program_id: string;
  student_id?: string | null;
  student_name?: string | null;
  student_code?: string | null;
  group_id?: string | null;
  group_name?: string | null;
  group_color?: string | null;
  participant_number: number;
  registration_status: 'PENDING' | 'CONFIRMED' | 'WITHDRAWN' | 'DISQUALIFIED';
  attendance_status: AttendanceStatus;
  created_at: string;
  total_marks?: number;
  position_name?: string | null;
  grade_name?: string | null;
  points_awarded?: number;
}

export interface JudgingCriterion {
  id: string;
  program_id: string;
  name: string;
  max_marks: number;
  weight: number;
  sort_order: number;
}

export interface JudgeScore {
  id: string;
  program_id: string;
  judge_id: string;
  participant_id: string;
  criterion_id: string;
  marks: number;
  notes?: string | null;
}

export interface ProgramResult {
  id: string;
  program_id: string;
  participant_id: string;
  participant_number: number;
  participant_name: string;
  group_name?: string | null;
  group_color?: string | null;
  total_marks: number;
  position_id?: string | null;
  position_name?: string | null;
  position_rank?: number | null;
  grade_id?: string | null;
  grade_name?: string | null;
  points_awarded: number;
  is_locked: boolean;
  snapshot_data?: {
    student_name: string;
    student_code: string;
    group_name?: string;
    program_name: string;
    category_name: string;
    division_name: string;
    announced_at: string;
  };
  created_at: string;
}

export interface PosterTemplate {
  id: string;
  organization_id: string;
  name: string;
  theme_code: string;
  layout_config: Record<string, unknown>;
  background_url?: string | null;
  is_default: boolean;
}

export interface AuditLog {
  id: string;
  organization_id: string;
  user_id?: string | null;
  user_email?: string | null;
  action: string;
  entity_name: string;
  entity_id: string;
  old_values?: Record<string, unknown> | null;
  new_values?: Record<string, unknown> | null;
  ip_address?: string | null;
  created_at: string;
}

export interface GroupScoreAggregate {
  group_id: string;
  group_name: string;
  group_code: string;
  group_color: string;
  individual_points: number;
  general_program_points: number;
  bonus_points: number;
  penalty_points: number;
  total_points: number;
  rank: number;
}
