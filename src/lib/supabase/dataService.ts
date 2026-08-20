import { supabaseClient } from './client';
import { dbStore } from '@/lib/store/mockDatabase';

export async function syncLiveSupabaseData() {
  if (!supabaseClient) return false;

  try {
    // 1. Fetch Organization
    const { data: orgData } = await supabaseClient.from('organizations').select('*').limit(1).single();
    if (orgData) {
      dbStore.setState((prev) => ({ ...prev, organization: orgData }));
    }

    // 2. Fetch Profiles / Users
    const { data: profilesData } = await supabaseClient.from('profiles').select('*');
    if (profilesData && profilesData.length > 0) {
      dbStore.setState((prev) => ({
        ...prev,
        users: profilesData,
        profile: profilesData[0] || prev.profile,
      }));
    }

    // 3. Fetch Classes
    const { data: classesData } = await supabaseClient.from('academic_classes').select('*').order('sort_order');
    if (classesData && classesData.length > 0) {
      dbStore.setState((prev) => ({ ...prev, classes: classesData }));
    }

    // 4. Fetch Students
    const { data: studentsData } = await supabaseClient.from('students').select('*');
    if (studentsData && studentsData.length > 0) {
      dbStore.setState((prev) => ({ ...prev, students: studentsData }));
    }

    // 5. Fetch Groups
    const { data: groupsData } = await supabaseClient.from('groups').select('*').order('sort_order');
    if (groupsData && groupsData.length > 0) {
      dbStore.setState((prev) => ({ ...prev, groups: groupsData }));
    }

    // 6. Fetch Programs
    const { data: programsData } = await supabaseClient.from('programs').select('*');
    if (programsData && programsData.length > 0) {
      dbStore.setState((prev) => ({ ...prev, programs: programsData }));
    }

    return true;
  } catch (error) {
    console.warn('Live Supabase synchronization notice:', error);
    return false;
  }
}
