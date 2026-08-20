import { supabaseClient } from './client';
import { dbStore } from '@/lib/store/mockDatabase';
import {
  Student,
  Program,
  ProgramParticipant,
  ProgramResult,
  Organization,
  Profile,
} from '@/lib/types/database';

const isLiveSupabase = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return url && !url.includes('placeholder') && !url.includes('your-project-id');
};

export const api = {
  // 1. Organization
  async getOrganization(): Promise<Organization | null> {
    if (isLiveSupabase()) {
      const { data, error } = await supabaseClient.from('organizations').select('*').limit(1).single();
      if (data && !error) {
        dbStore.setState((prev) => ({ ...prev, organization: data }));
        return data;
      }
    }
    return dbStore.getState().organization;
  },

  async updateOrganization(updates: Partial<Organization>) {
    if (isLiveSupabase()) {
      const orgId = dbStore.getState().organization.id;
      await supabaseClient.from('organizations').update(updates).eq('id', orgId);
    }
    dbStore.setState((prev) => ({
      ...prev,
      organization: { ...prev.organization, ...updates },
    }));
  },

  // 2. Students
  async getStudents(): Promise<Student[]> {
    if (isLiveSupabase()) {
      const { data, error } = await supabaseClient.from('students').select('*').order('created_at', { ascending: false });
      if (data && !error) {
        dbStore.setState((prev) => ({ ...prev, students: data }));
        return data;
      }
    }
    return dbStore.getState().students;
  },

  async createStudent(student: Omit<Student, 'id' | 'created_at'>) {
    const newStudent: Student = {
      ...student,
      id: `stu-${Date.now()}`,
      created_at: new Date().toISOString(),
    };

    if (isLiveSupabase()) {
      const { data } = await supabaseClient.from('students').insert([newStudent]).select().single();
      if (data) {
        dbStore.setState((prev) => ({ ...prev, students: [data, ...prev.students] }));
        return data;
      }
    }

    dbStore.setState((prev) => ({ ...prev, students: [newStudent, ...prev.students] }));
    return newStudent;
  },

  async deleteStudent(studentId: string) {
    if (isLiveSupabase()) {
      await supabaseClient.from('students').delete().eq('id', studentId);
    }
    dbStore.setState((prev) => ({
      ...prev,
      students: prev.students.filter((s) => s.id !== studentId),
    }));
  },

  // 3. Programs
  async getPrograms(): Promise<Program[]> {
    if (isLiveSupabase()) {
      const { data, error } = await supabaseClient.from('programs').select('*').order('scheduled_at', { ascending: true });
      if (data && !error) {
        dbStore.setState((prev) => ({ ...prev, programs: data }));
        return data;
      }
    }
    return dbStore.getState().programs;
  },

  async createProgram(program: Omit<Program, 'id' | 'created_at' | 'updated_at'>) {
    const newProg: Program = {
      ...program,
      id: `prog-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (isLiveSupabase()) {
      const { data } = await supabaseClient.from('programs').insert([newProg]).select().single();
      if (data) {
        dbStore.setState((prev) => ({ ...prev, programs: [data, ...prev.programs] }));
        return data;
      }
    }

    dbStore.setState((prev) => ({ ...prev, programs: [newProg, ...prev.programs] }));
    return newProg;
  },

  // 4. Participants
  async assignParticipants(programId: string, participants: ProgramParticipant[]) {
    if (isLiveSupabase()) {
      await supabaseClient.from('program_participants').insert(participants);
    }
    dbStore.setState((prev) => ({
      ...prev,
      participants: [...prev.participants, ...participants],
      programs: prev.programs.map((p) =>
        p.id === programId ? { ...p, participant_count: (p.participant_count || 0) + participants.length } : p
      ),
    }));
  },

  // 5. Results & Announcement
  async saveResults(programId: string, results: ProgramResult[]) {
    if (isLiveSupabase()) {
      await supabaseClient.from('program_results').upsert(results, { onConflict: 'program_id,participant_id' });
      await supabaseClient.from('programs').update({
        status: 'JUDGED',
        result_status: 'JUDGED',
        judged_at: new Date().toISOString(),
      }).eq('id', programId);
    }
    dbStore.setState((prev) => ({
      ...prev,
      results: { ...prev.results, [programId]: results },
      programs: prev.programs.map((p) =>
        p.id === programId ? { ...p, status: 'JUDGED', result_status: 'JUDGED' } : p
      ),
    }));
  },

  async announceResults(programId: string, results: ProgramResult[]) {
    const now = new Date().toISOString();
    if (isLiveSupabase()) {
      await supabaseClient.from('program_results').upsert(results, { onConflict: 'program_id,participant_id' });
      await supabaseClient.from('programs').update({
        status: 'ANNOUNCED',
        result_status: 'ANNOUNCED',
        announced_at: now,
      }).eq('id', programId);
    }
    dbStore.setState((prev) => ({
      ...prev,
      results: { ...prev.results, [programId]: results },
      programs: prev.programs.map((p) =>
        p.id === programId ? { ...p, status: 'ANNOUNCED', result_status: 'ANNOUNCED', announced_at: now } : p
      ),
    }));
  },

  // 6. Users / Profiles
  async getUsers(): Promise<Profile[]> {
    if (isLiveSupabase()) {
      const { data, error } = await supabaseClient.from('profiles').select('*');
      if (data && !error) {
        dbStore.setState((prev) => ({ ...prev, users: data }));
        return data;
      }
    }
    return dbStore.getState().users;
  },

  async createUser(user: Profile) {
    if (isLiveSupabase()) {
      await supabaseClient.from('profiles').insert([user]);
    }
    dbStore.setState((prev) => ({
      ...prev,
      users: [...(prev.users || []), user],
    }));
  },
};
