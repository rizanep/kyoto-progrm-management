'use client';

import * as React from 'react';
import {
  Settings,
  Layers,
  Award,
  Plus,
  Trash2,
  Edit2,
  Save,
  CheckCircle2,
  Shield,
  History,
  Sparkles,
  Check,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Tabs } from '@/components/ui/tabs';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Modal } from '@/components/ui/modal';
import { dbStore } from '@/lib/store/mockDatabase';
import { Position, Grade, ProgramCategory, ProgramDivision } from '@/lib/types/database';

export default function FullCRUDSettingsPage() {
  const [activeTab, setActiveTab] = React.useState('organization');
  const [org, setOrg] = React.useState(dbStore.getState().organization);
  const [profile, setProfile] = React.useState(dbStore.getState().profile);
  const [users, setUsers] = React.useState(dbStore.getState().users || [dbStore.getState().profile]);
  const [categories, setCategories] = React.useState(dbStore.getState().categories);
  const [divisions, setDivisions] = React.useState(dbStore.getState().programDivisions);
  const [positions, setPositions] = React.useState(dbStore.getState().positions);
  const [grades, setGrades] = React.useState(dbStore.getState().grades);
  const classes = dbStore.getState().classes;

  // Org Form Fields
  const [orgName, setOrgName] = React.useState(dbStore.getState().organization.name);
  const [orgCode, setOrgCode] = React.useState(dbStore.getState().organization.code);
  const [orgDesc, setOrgDesc] = React.useState(dbStore.getState().organization.description || '');
  const [adminPhone, setAdminPhone] = React.useState(dbStore.getState().profile.phone || '');
  const [adminName, setAdminName] = React.useState(dbStore.getState().profile.full_name || '');
  const [orgSaveSuccess, setOrgSaveSuccess] = React.useState(false);

  // Modal State
  const [modalType, setModalType] = React.useState<'CATEGORY' | 'DIVISION' | 'POSITION' | 'GRADE' | 'USER' | null>(null);
  const [editingItem, setEditingItem] = React.useState<any>(null);

  // Form Fields
  const [formName, setFormName] = React.useState('');
  const [formCode, setFormCode] = React.useState('');
  const [formDesc, setFormDesc] = React.useState('');
  const [formColor, setFormColor] = React.useState('#3b82f6');
  const [formRank, setFormRank] = React.useState('1');
  const [formPoints, setFormPoints] = React.useState('5');
  const [formMinMark, setFormMinMark] = React.useState('80');
  const [formMaxMark, setFormMaxMark] = React.useState('100');
  const [formSelectedClasses, setFormSelectedClasses] = React.useState<string[]>([]);
  const [formUserPhone, setFormUserPhone] = React.useState('');
  const [formUserPin, setFormUserPin] = React.useState('');
  const [formUserRole, setFormUserRole] = React.useState<'ADMIN' | 'JUDGE' | 'ORGANIZER' | 'FACULTY'>('JUDGE');

  React.useEffect(() => {
    const s = dbStore.getState();
    setOrg(s.organization);
    setProfile(s.profile);
    setUsers(s.users || [s.profile]);
    setOrgName(s.organization.name);
    setOrgCode(s.organization.code);
    setOrgDesc(s.organization.description || '');
    setAdminName(s.profile.full_name);
    setAdminPhone(s.profile.phone || '');

    return dbStore.subscribe(() => {
      const state = dbStore.getState();
      setOrg(state.organization);
      setProfile(state.profile);
      setUsers(state.users || [state.profile]);
      setCategories(state.categories);
      setDivisions(state.programDivisions);
      setPositions(state.positions);
      setGrades(state.grades);
    });
  }, []);

  const handleSaveOrganization = (e: React.FormEvent) => {
    e.preventDefault();
    dbStore.setState((prev) => {
      const updatedUsers = (prev.users || []).map((u) =>
        u.id === prev.profile.id || u.phone === prev.profile.phone || u.role === 'ADMIN'
          ? { ...u, full_name: adminName, phone: adminPhone }
          : u
      );
      return {
        ...prev,
        organization: {
          ...prev.organization,
          name: orgName,
          code: orgCode.toUpperCase(),
          description: orgDesc,
        },
        profile: {
          ...prev.profile,
          full_name: adminName,
          phone: adminPhone,
        },
        users: updatedUsers,
      };
    });
    setOrgSaveSuccess(true);
    setTimeout(() => setOrgSaveSuccess(false), 2500);
  };

  const openAddModal = (type: 'CATEGORY' | 'DIVISION' | 'POSITION' | 'GRADE' | 'USER') => {
    setModalType(type);
    setEditingItem(null);
    setFormName('');
    setFormCode('');
    setFormDesc('');
    setFormColor('#3b82f6');
    setFormRank((positions.length + 1).toString());
    setFormPoints('5');
    setFormMinMark('80');
    setFormMaxMark('100');
    setFormSelectedClasses([]);
    setFormUserPhone('');
    setFormUserPin('1234');
    setFormUserRole('JUDGE');
  };

  const openEditModal = (type: 'CATEGORY' | 'DIVISION' | 'POSITION' | 'GRADE' | 'USER', item: any) => {
    setModalType(type);
    setEditingItem(item);
    setFormName(item.name || item.full_name || '');
    setFormCode(item.code || '');
    setFormDesc(item.description || '');
    setFormColor(item.color || '#3b82f6');
    setFormRank(item.rank ? item.rank.toString() : '1');
    setFormPoints(item.points ? item.points.toString() : '0');
    setFormMinMark(item.min_mark ? item.min_mark.toString() : '0');
    setFormMaxMark(item.max_mark ? item.max_mark.toString() : '100');
    setFormSelectedClasses(item.eligible_class_ids || []);
    setFormUserPhone(item.phone || '');
    setFormUserPin(item.password_pin || '1234');
    setFormUserRole(item.role || 'JUDGE');
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();

    if (modalType === 'USER') {
      if (editingItem) {
        const isCurrentActiveUser = editingItem.id === profile.id || editingItem.phone === profile.phone;
        const updated = users.map((u) =>
          u.id === editingItem.id
            ? { ...u, full_name: formName, phone: formUserPhone, password_pin: formUserPin, role: formUserRole }
            : u
        );
        dbStore.setState((prev) => ({
          ...prev,
          users: updated,
          profile: isCurrentActiveUser
            ? { ...prev.profile, full_name: formName, phone: formUserPhone, password_pin: formUserPin, role: formUserRole }
            : prev.profile,
        }));
      } else {
        const newUser = {
          id: `usr-${Date.now()}`,
          organization_id: dbStore.getState().organization.id,
          full_name: formName,
          email: `${formName.toLowerCase().replace(/\s+/g, '')}@sumkappakkal.edu`,
          phone: formUserPhone,
          password_pin: formUserPin,
          role: formUserRole,
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          status: 'ACTIVE' as const,
          created_at: new Date().toISOString(),
        };
        dbStore.setState((prev) => ({ ...prev, users: [...prev.users, newUser] }));
      }
    } else if (modalType === 'CATEGORY') {
      if (editingItem) {
        const updated = categories.map((c) =>
          c.id === editingItem.id
            ? { ...c, name: formName, code: formCode.toUpperCase(), description: formDesc, color: formColor }
            : c
        );
        dbStore.setState((prev) => ({ ...prev, categories: updated }));
      } else {
        const newCat: ProgramCategory = {
          id: `cat-${Date.now()}`,
          organization_id: dbStore.getState().organization.id,
          name: formName,
          code: formCode.toUpperCase() || `CAT-${Date.now().toString().slice(-4)}`,
          description: formDesc,
          icon: 'Layers',
          color: formColor,
          sort_order: categories.length + 1,
          is_active: true,
        };
        dbStore.setState((prev) => ({ ...prev, categories: [...prev.categories, newCat] }));
      }
    } else if (modalType === 'DIVISION') {
      if (editingItem) {
        const updated = divisions.map((d) =>
          d.id === editingItem.id
            ? { ...d, name: formName, code: formCode.toUpperCase(), description: formDesc, eligible_class_ids: formSelectedClasses }
            : d
        );
        dbStore.setState((prev) => ({ ...prev, programDivisions: updated }));
      } else {
        const newDiv: ProgramDivision = {
          id: `pdiv-${Date.now()}`,
          organization_id: dbStore.getState().organization.id,
          name: formName,
          code: formCode.toUpperCase() || `DIV-${Date.now().toString().slice(-4)}`,
          description: formDesc || `Classes: ${formSelectedClasses.length} assigned`,
          eligible_class_ids: formSelectedClasses,
          sort_order: divisions.length + 1,
          is_active: true,
        };
        dbStore.setState((prev) => ({ ...prev, programDivisions: [...prev.programDivisions, newDiv] }));
      }
    } else if (modalType === 'POSITION') {
      const rankNum = parseInt(formRank, 10) || 1;
      const ptsNum = parseFloat(formPoints) || 0;
      if (editingItem) {
        const updated = positions.map((p) =>
          p.id === editingItem.id
            ? { ...p, name: formName, code: formCode.toUpperCase(), rank: rankNum, points: ptsNum, color: formColor }
            : p
        );
        dbStore.setState((prev) => ({ ...prev, positions: updated }));
      } else {
        const newPos: Position = {
          id: `pos-${Date.now()}`,
          scoring_config_id: 'cfg-default-2026',
          name: formName,
          code: formCode.toUpperCase() || `POS-${rankNum}`,
          rank: rankNum,
          points: ptsNum,
          color: formColor,
          sort_order: rankNum,
          is_active: true,
        };
        dbStore.setState((prev) => ({ ...prev, positions: [...prev.positions, newPos] }));
      }
    } else if (modalType === 'GRADE') {
      const minNum = parseFloat(formMinMark) || 0;
      const maxNum = parseFloat(formMaxMark) || 100;
      const ptsNum = parseFloat(formPoints) || 0;
      if (editingItem) {
        const updated = grades.map((g) =>
          g.id === editingItem.id
            ? { ...g, name: formName, min_mark: minNum, max_mark: maxNum, points: ptsNum }
            : g
        );
        dbStore.setState((prev) => ({ ...prev, grades: updated }));
      } else {
        const newGrd: Grade = {
          id: `grd-${Date.now()}`,
          scoring_config_id: 'cfg-default-2026',
          name: formName,
          min_mark: minNum,
          max_mark: maxNum,
          points: ptsNum,
          sort_order: grades.length + 1,
        };
        dbStore.setState((prev) => ({ ...prev, grades: [...prev.grades, newGrd] }));
      }
    }

    setModalType(null);
  };

  const handleDeleteUser = (id: string) => {
    dbStore.setState((prev) => ({ ...prev, users: prev.users.filter((u) => u.id !== id) }));
  };

  const handleDeleteCategory = (id: string) => {
    dbStore.setState((prev) => ({ ...prev, categories: prev.categories.filter((c) => c.id !== id) }));
  };

  const handleDeleteDivision = (id: string) => {
    dbStore.setState((prev) => ({ ...prev, programDivisions: prev.programDivisions.filter((d) => d.id !== id) }));
  };

  const handleDeletePosition = (id: string) => {
    dbStore.setState((prev) => ({ ...prev, positions: prev.positions.filter((p) => p.id !== id) }));
  };

  const handleDeleteGrade = (id: string) => {
    dbStore.setState((prev) => ({ ...prev, grades: prev.grades.filter((g) => g.id !== id) }));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-blue-600" />
            <span>Master Competition Settings</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete CRUD management for categories, class-based divisions, positions, and grading bands.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: 'organization', label: 'Organization & Fest', icon: <Sparkles className="w-3.5 h-3.5" /> },
          { id: 'users', label: 'Staff & Login Accounts', count: users.length, icon: <Shield className="w-3.5 h-3.5" /> },
          { id: 'categories', label: 'Program Categories', count: categories.length, icon: <Layers className="w-3.5 h-3.5" /> },
          { id: 'divisions', label: 'Class-Based Divisions', count: divisions.length, icon: <Shield className="w-3.5 h-3.5" /> },
          { id: 'positions', label: 'Position Points Matrix', count: positions.length, icon: <Award className="w-3.5 h-3.5" /> },
          { id: 'grades', label: 'Grade Bands', count: grades.length, icon: <Award className="w-3.5 h-3.5" /> },
        ]}
        activeTab={activeTab}
        onChange={setActiveTab}
      />

      {/* Tab: Staff & Login Accounts */}
      {activeTab === 'users' && (
        <Card className="p-0 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800">
          <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Authorized Users & Staff Accounts</CardTitle>
              <CardDescription>
                Administrators, Judges, and Organizers authorized to log in with their Phone Number and PIN
              </CardDescription>
            </div>
            <Button onClick={() => openAddModal('USER')} size="sm">
              <Plus className="w-4 h-4 mr-1" /> Add Login Account
            </Button>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User / Staff Name</TableHead>
                <TableHead>Login Phone</TableHead>
                <TableHead>Security PIN</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-600/20 text-blue-400 font-bold flex items-center justify-center text-xs">
                        {u.full_name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-extrabold text-slate-900 dark:text-white">{u.full_name}</p>
                        <p className="text-[10px] text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                    📱 {u.phone || '—'}
                  </TableCell>
                  <TableCell className="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    🔑 {u.password_pin || '8281'}
                  </TableCell>
                  <TableCell>
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {u.role || 'ADMIN'}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEditModal('USER', u)}>
                        <Edit2 className="w-4 h-4 text-slate-500" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeleteUser(u.id)}
                        disabled={users.length <= 1}
                      >
                        <Trash2 className="w-4 h-4 text-rose-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Tab 0: Organization & Fest Profile */}
      {activeTab === 'organization' && (
        <Card className="p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-6">
          <CardHeader className="p-0 border-none">
            <CardTitle className="text-lg font-black">Institution & Competition Profile</CardTitle>
            <CardDescription>
              Customize the organization title, event fest name, and registered administrator credentials
            </CardDescription>
          </CardHeader>

          {orgSaveSuccess && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-xs font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Organization profile updated successfully! All pages and public portals are synchronized.</span>
            </div>
          )}

          <form onSubmit={handleSaveOrganization} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <Input
                  label="Organization / Madrasa Full Name *"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. SIRAJU ULOOMUDHIN MADRASA KAPPAKKAL"
                  required
                />
              </div>
              <Input
                label="Institution Code *"
                value={orgCode}
                onChange={(e) => setOrgCode(e.target.value)}
                placeholder="e.g. SUM-KPKL"
                required
              />
            </div>

            <Input
              label="Fest Title & Tagline"
              value={orgDesc}
              onChange={(e) => setOrgDesc(e.target.value)}
              placeholder="e.g. Premier Islamic Arts & Academic Fest — ISHQE HABEEB 26"
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <Input
                label="Admin Full Name"
                value={adminName}
                onChange={(e) => setAdminName(e.target.value)}
              />
              <Input
                label="Admin Mobile / Login Phone *"
                value={adminPhone}
                onChange={(e) => setAdminPhone(e.target.value)}
                placeholder="e.g. 8281740483"
                required
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" variant="primary" size="md">
                <Check className="w-4 h-4 mr-1.5" /> Save Organization Profile
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Tab 1: Categories */}
      {activeTab === 'categories' && (
        <Card className="p-0 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800">
          <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Program Categories</CardTitle>
              <CardDescription>Group events into Stage, Sports, Literary, etc.</CardDescription>
            </div>
            <Button onClick={() => openAddModal('CATEGORY')} size="sm">
              <Plus className="w-4 h-4 mr-1" /> Add Category
            </Button>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Color</TableHead>
                <TableHead>Category Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((c) => (
                <TableRow key={c.id}>
                  <TableCell>
                    <span className="w-5 h-5 rounded-full block shadow-xs" style={{ backgroundColor: c.color }} />
                  </TableCell>
                  <TableCell className="font-extrabold text-slate-900 dark:text-white">{c.name}</TableCell>
                  <TableCell className="font-mono text-xs text-slate-400">{c.code}</TableCell>
                  <TableCell className="text-xs text-slate-500">{c.description || '—'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEditModal('CATEGORY', c)}>
                        <Edit2 className="w-4 h-4 text-slate-500" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDeleteCategory(c.id)}>
                        <Trash2 className="w-4 h-4 text-rose-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Tab 2: Class-Based Divisions */}
      {activeTab === 'divisions' && (
        <Card className="p-0 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800">
          <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Class-Based Divisions</CardTitle>
              <CardDescription>Competition tiers mapped directly to academic classes</CardDescription>
            </div>
            <Button onClick={() => openAddModal('DIVISION')} size="sm">
              <Plus className="w-4 h-4 mr-1" /> Add Division
            </Button>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Division Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Permitted Academic Classes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {divisions.map((d) => (
                <TableRow key={d.id}>
                  <TableCell className="font-extrabold text-slate-900 dark:text-white">{d.name}</TableCell>
                  <TableCell className="font-mono text-xs text-slate-400">{d.code}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {d.eligible_class_ids && d.eligible_class_ids.length > 0 ? (
                        d.eligible_class_ids.map((cid) => {
                          const cls = classes.find((c) => c.id === cid);
                          return (
                            <span key={cid} className="px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 font-bold text-xs">
                              {cls?.name || cid}
                            </span>
                          );
                        })
                      ) : (
                        <span className="text-xs text-slate-400">All Classes (Open)</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEditModal('DIVISION', d)}>
                        <Edit2 className="w-4 h-4 text-slate-500" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDeleteDivision(d.id)}>
                        <Trash2 className="w-4 h-4 text-rose-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Tab 3: Positions */}
      {activeTab === 'positions' && (
        <Card className="p-0 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800">
          <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Positions & Rank Points</CardTitle>
              <CardDescription>Points awarded for 1st, 2nd, 3rd place finishes</CardDescription>
            </div>
            <Button onClick={() => openAddModal('POSITION')} size="sm">
              <Plus className="w-4 h-4 mr-1" /> Add Position
            </Button>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rank</TableHead>
                <TableHead>Position Title</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Points Awarded</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {positions.map((p) => (
                <TableRow key={p.id}>
                  <TableCell className="font-bold text-sm">#{p.rank}</TableCell>
                  <TableCell className="font-extrabold flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: p.color }} />
                    {p.name}
                  </TableCell>
                  <TableCell className="font-mono text-xs text-slate-400">{p.code}</TableCell>
                  <TableCell className="font-black text-emerald-600 text-sm">+{p.points} pts</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEditModal('POSITION', p)}>
                        <Edit2 className="w-4 h-4 text-slate-500" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDeletePosition(p.id)}>
                        <Trash2 className="w-4 h-4 text-rose-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Tab 4: Grades */}
      {activeTab === 'grades' && (
        <Card className="p-0 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800">
          <CardHeader className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold">Grade Bands</CardTitle>
              <CardDescription>Letter grades applied to percentage marks (e.g. Grade A: 80 - 100%)</CardDescription>
            </div>
            <Button onClick={() => openAddModal('GRADE')} size="sm">
              <Plus className="w-4 h-4 mr-1" /> Add Grade Band
            </Button>
          </CardHeader>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Grade Name</TableHead>
                <TableHead>Min Mark (%)</TableHead>
                <TableHead>Max Mark (%)</TableHead>
                <TableHead>Bonus Points</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grades.map((g) => (
                <TableRow key={g.id}>
                  <TableCell className="font-extrabold text-blue-600">{g.name}</TableCell>
                  <TableCell className="font-bold">{g.min_mark}%</TableCell>
                  <TableCell className="font-bold">{g.max_mark}%</TableCell>
                  <TableCell className="font-black text-emerald-600">+{g.points} pts</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button size="icon" variant="ghost" onClick={() => openEditModal('GRADE', g)}>
                        <Edit2 className="w-4 h-4 text-slate-500" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => handleDeleteGrade(g.id)}>
                        <Trash2 className="w-4 h-4 text-rose-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* CRUD Modal */}
      <Modal
        isOpen={modalType !== null}
        onClose={() => setModalType(null)}
        title={editingItem ? `Edit ${modalType}` : `Create New ${modalType}`}
      >
        <form onSubmit={handleSaveModal} className="space-y-4">
          <Input
            label="Name / Title *"
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            required
          />

          {modalType !== 'USER' && (
            <Input
              label="Code *"
              value={formCode}
              onChange={(e) => setFormCode(e.target.value)}
              required
            />
          )}

          {modalType === 'USER' && (
            <div className="space-y-4">
              <Input
                label="Login Phone Number *"
                value={formUserPhone}
                onChange={(e) => setFormUserPhone(e.target.value)}
                placeholder="e.g. 9876543210"
                required
              />
              <Input
                label="Login Password / Security PIN *"
                type="text"
                value={formUserPin}
                onChange={(e) => setFormUserPin(e.target.value)}
                placeholder="e.g. 1234 or 8281"
                required
              />
              <Select
                label="User Role & Permissions *"
                options={[
                  { value: 'ADMIN', label: 'Administrator (Full Access)' },
                  { value: 'JUDGE', label: 'Judge / Evaluator (Score Sheet)' },
                  { value: 'ORGANIZER', label: 'Organizer (Events & Stage)' },
                  { value: 'FACULTY', label: 'Faculty / House Coordinator' },
                ]}
                value={formUserRole}
                onChange={(e) => setFormUserRole(e.target.value as any)}
              />
            </div>
          )}

          {modalType === 'DIVISION' && (
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Eligible Classes for this Division
              </label>
              <div className="grid grid-cols-2 gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl max-h-40 overflow-y-auto">
                {classes.map((cls) => {
                  const isChecked = formSelectedClasses.includes(cls.id);
                  return (
                    <label key={cls.id} className="flex items-center gap-2 text-xs cursor-pointer font-bold">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormSelectedClasses([...formSelectedClasses, cls.id]);
                          } else {
                            setFormSelectedClasses(formSelectedClasses.filter((id) => id !== cls.id));
                          }
                        }}
                        className="rounded text-blue-600"
                      />
                      <span>{cls.name} ({cls.code})</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          {modalType === 'CATEGORY' && (
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Badge Color
              </label>
              <input
                type="color"
                value={formColor}
                onChange={(e) => setFormColor(e.target.value)}
                className="w-full h-10 rounded-xl cursor-pointer"
              />
            </div>
          )}

          {modalType === 'POSITION' && (
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Rank (e.g. 1, 2, 3) *"
                type="number"
                value={formRank}
                onChange={(e) => setFormRank(e.target.value)}
                required
              />
              <Input
                label="Points Awarded *"
                type="number"
                value={formPoints}
                onChange={(e) => setFormPoints(e.target.value)}
                required
              />
            </div>
          )}

          {modalType === 'GRADE' && (
            <div className="grid grid-cols-3 gap-3">
              <Input
                label="Min Mark (%) *"
                type="number"
                value={formMinMark}
                onChange={(e) => setFormMinMark(e.target.value)}
                required
              />
              <Input
                label="Max Mark (%) *"
                type="number"
                value={formMaxMark}
                onChange={(e) => setFormMaxMark(e.target.value)}
                required
              />
              <Input
                label="Points Added *"
                type="number"
                value={formPoints}
                onChange={(e) => setFormPoints(e.target.value)}
                required
              />
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setModalType(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="success">
              <Check className="w-4 h-4 mr-1" /> Save
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
