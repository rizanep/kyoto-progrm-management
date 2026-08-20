'use client';

import * as React from 'react';
import {
  Shield,
  Plus,
  Users,
  Trophy,
  Crown,
  UserCheck,
  Edit2,
  Trash2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { Avatar } from '@/components/ui/avatar';
import { dbStore } from '@/lib/store/mockDatabase';
import { Group, GroupMembership } from '@/lib/types/database';

export default function GroupsPage() {
  const [groups, setGroups] = React.useState(dbStore.getState().groups);
  const [students] = React.useState(dbStore.getState().students);
  const [memberships, setMemberships] = React.useState(dbStore.getState().groupMemberships);
  const [rankings, setRankings] = React.useState(dbStore.getChampionshipRankings());

  const [isGroupModalOpen, setIsGroupModalOpen] = React.useState(false);
  const [isLeaderModalOpen, setIsLeaderModalOpen] = React.useState(false);
  const [selectedGroup, setSelectedGroup] = React.useState<Group | null>(null);

  // Group Form
  const [groupName, setGroupName] = React.useState('');
  const [groupCode, setGroupCode] = React.useState('');
  const [groupColor, setGroupColor] = React.useState('#3b82f6');
  const [groupDesc, setGroupDesc] = React.useState('');

  // Leader Form
  const [selectedLeaderId, setSelectedLeaderId] = React.useState('');
  const [selectedAsstLeaderId, setSelectedAsstLeaderId] = React.useState('');

  React.useEffect(() => {
    return dbStore.subscribe(() => {
      setGroups(dbStore.getState().groups);
      setMemberships(dbStore.getState().groupMemberships);
      setRankings(dbStore.getChampionshipRankings());
    });
  }, []);

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName || !groupCode) return;

    const newGroup: Group = {
      id: `grp-${Date.now()}`,
      organization_id: dbStore.getState().organization.id,
      name: groupName,
      code: groupCode.toUpperCase(),
      description: groupDesc,
      color: groupColor,
      sort_order: groups.length + 1,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      member_count: 0,
      total_points: 0,
    };

    dbStore.setState((prev) => ({
      ...prev,
      groups: [...prev.groups, newGroup],
      auditLogs: [
        {
          id: `aud-${Date.now()}`,
          organization_id: prev.organization.id,
          user_email: prev.profile.email,
          action: 'CREATE_GROUP',
          entity_name: 'group',
          entity_id: newGroup.id,
          new_values: { name: newGroup.name, code: newGroup.code },
          created_at: new Date().toISOString(),
        },
        ...prev.auditLogs,
      ],
    }));

    setGroupName('');
    setGroupCode('');
    setGroupDesc('');
    setIsGroupModalOpen(false);
  };

  const handleSaveLeadership = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup) return;

    const leaderStudent = students.find((s) => s.id === selectedLeaderId);
    const asstStudent = students.find((s) => s.id === selectedAsstLeaderId);

    dbStore.setState((prev) => {
      const updatedGroups = prev.groups.map((g) => {
        if (g.id === selectedGroup.id) {
          return {
            ...g,
            leader_id: selectedLeaderId || null,
            leader_name: leaderStudent ? leaderStudent.full_name : null,
            asst_leader_id: selectedAsstLeaderId || null,
            asst_leader_name: asstStudent ? asstStudent.full_name : null,
          };
        }
        return g;
      });

      return {
        ...prev,
        groups: updatedGroups,
        auditLogs: [
          {
            id: `aud-${Date.now()}`,
            organization_id: prev.organization.id,
            user_email: prev.profile.email,
            action: 'UPDATE_GROUP_LEADERS',
            entity_name: 'group',
            entity_id: selectedGroup.id,
            new_values: {
              leader: leaderStudent?.full_name,
              asst_leader: asstStudent?.full_name,
            },
            created_at: new Date().toISOString(),
          },
          ...prev.auditLogs,
        ],
      };
    });

    setIsLeaderModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Shield className="w-6 h-6 text-blue-600" />
            <span>House Groups & Leadership</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage competition houses, captain appointments, and cumulative point tallies.
          </p>
        </div>

        <Button onClick={() => setIsGroupModalOpen(true)} size="sm">
          <Plus className="w-4 h-4 mr-1.5" /> Create House Group
        </Button>
      </div>

      {/* Groups Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {groups.map((grp) => {
          const rankInfo = rankings.find((r) => r.group_id === grp.id);
          const memberList = students.filter((s) => s.group_id === grp.id);

          return (
            <Card
              key={grp.id}
              className="p-6 rounded-3xl flex flex-col justify-between relative overflow-hidden border border-slate-200/80 dark:border-slate-800"
              hoverEffect
            >
              <div
                className="absolute top-0 left-0 right-0 h-2"
                style={{ backgroundColor: grp.color }}
              />

              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black text-lg shadow-sm"
                      style={{ backgroundColor: grp.color }}
                    >
                      {grp.code.slice(0, 3)}
                    </div>
                    <div>
                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                        {grp.name}
                      </h3>
                      <p className="text-xs text-slate-400">{grp.code}</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800 rounded-full text-xs font-black">
                    Rank #{rankInfo?.rank || 1}
                  </span>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4 min-h-[32px]">
                  {grp.description || 'No description provided.'}
                </p>

                {/* Captains & Officers */}
                <div className="space-y-2 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5 text-amber-500" /> Leader:
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {grp.leader_name || <span className="text-slate-400 italic">Not Assigned</span>}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-500 flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-blue-500" /> Asst Leader:
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {grp.asst_leader_name || <span className="text-slate-400 italic">Not Assigned</span>}
                    </span>
                  </div>
                </div>

                {/* Member Roster Preview */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-500 mb-2">
                    <span>Enrolled Members ({memberList.length})</span>
                    <button
                      onClick={() => {
                        setSelectedGroup(grp);
                        setSelectedLeaderId(grp.leader_id || '');
                        setSelectedAsstLeaderId(grp.asst_leader_id || '');
                        setIsLeaderModalOpen(true);
                      }}
                      className="text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      Assign Leaders
                    </button>
                  </div>
                  <div className="flex -space-x-2 overflow-hidden py-1">
                    {memberList.slice(0, 5).map((stu) => (
                      <Avatar
                        key={stu.id}
                        src={stu.photo_url}
                        alt={stu.full_name}
                        fallbackText={stu.full_name}
                        size="sm"
                        className="border-2 border-white dark:border-slate-900"
                      />
                    ))}
                    {memberList.length > 5 && (
                      <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center border-2 border-white dark:border-slate-900">
                        +{memberList.length - 5}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Total Points Footer */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/60 flex items-baseline justify-between">
                <span className="text-xs text-slate-400 font-medium">Championship Score</span>
                <span className="text-2xl font-black text-slate-900 dark:text-white">
                  {rankInfo?.total_points || 0} <span className="text-xs font-bold text-slate-400">pts</span>
                </span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Create House Modal */}
      <Modal
        isOpen={isGroupModalOpen}
        onClose={() => setIsGroupModalOpen(false)}
        title="Create House Group"
        description="Add a new competition house team."
      >
        <form onSubmit={handleCreateGroup} className="space-y-4">
          <Input
            label="House Name *"
            placeholder="e.g. Yellow Tigers"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            required
          />
          <Input
            label="Code *"
            placeholder="e.g. GRP-YEL"
            value={groupCode}
            onChange={(e) => setGroupCode(e.target.value)}
            required
          />
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
              House Theme Color
            </label>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={groupColor}
                onChange={(e) => setGroupColor(e.target.value)}
                className="w-10 h-10 rounded-xl cursor-pointer border border-slate-200 dark:border-slate-700"
              />
              <span className="font-mono text-xs font-bold text-slate-600 dark:text-slate-300">
                {groupColor}
              </span>
            </div>
          </div>
          <Input
            label="Motto / Description"
            placeholder="e.g. Bravery, honor, and sportsmanship"
            value={groupDesc}
            onChange={(e) => setGroupDesc(e.target.value)}
          />
          <div className="flex items-center justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsGroupModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Create House</Button>
          </div>
        </form>
      </Modal>

      {/* Assign Leaders Modal */}
      <Modal
        isOpen={isLeaderModalOpen}
        onClose={() => setIsLeaderModalOpen(false)}
        title={`Assign Captains for ${selectedGroup?.name || ''}`}
        description="Designate official student leaders for this house team."
      >
        <form onSubmit={handleSaveLeadership} className="space-y-4">
          <Select
            label="House Captain / Leader"
            options={students
              .filter((s) => !selectedGroup || s.group_id === selectedGroup.id)
              .map((s) => ({ value: s.id, label: `${s.full_name} (${s.student_code})` }))}
            placeholder="Select House Captain"
            value={selectedLeaderId}
            onChange={(e) => setSelectedLeaderId(e.target.value)}
          />

          <Select
            label="Assistant House Captain"
            options={students
              .filter((s) => !selectedGroup || s.group_id === selectedGroup.id)
              .map((s) => ({ value: s.id, label: `${s.full_name} (${s.student_code})` }))}
            placeholder="Select Assistant Captain"
            value={selectedAsstLeaderId}
            onChange={(e) => setSelectedAsstLeaderId(e.target.value)}
          />

          <div className="flex items-center justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsLeaderModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Appointments</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
