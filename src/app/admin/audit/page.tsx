'use client';

import * as React from 'react';
import { History, Shield, Search, Filter, Clock, UserCheck } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { dbStore } from '@/lib/store/mockDatabase';
import { formatTime, formatDate } from '@/lib/utils/formatters';

export default function AuditLogsPage() {
  const [logs, setLogs] = React.useState(dbStore.getState().auditLogs);
  const [search, setSearch] = React.useState('');

  React.useEffect(() => {
    return dbStore.subscribe(() => {
      setLogs(dbStore.getState().auditLogs);
    });
  }, []);

  const filtered = logs.filter(
    (l) =>
      l.action.toLowerCase().includes(search.toLowerCase()) ||
      (l.user_email && l.user_email.toLowerCase().includes(search.toLowerCase())) ||
      l.entity_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <History className="w-6 h-6 text-blue-600" />
          <span>System Audit Trail & Security Logs</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Cryptographically auditable log of administrative mutations, judging submissions, and announcements.
        </p>
      </div>

      <Card className="p-4 rounded-2xl">
        <Input
          placeholder="Filter by action, admin email, or entity..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="w-4 h-4" />}
        />
      </Card>

      <Card className="p-0 rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Target Entity</TableHead>
              <TableHead>Change Payload</TableHead>
              <TableHead>IP Address</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="text-xs text-slate-500 whitespace-nowrap">
                  {formatDate(log.created_at)} • {formatTime(log.created_at)}
                </TableCell>
                <TableCell>
                  <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    {log.action}
                  </span>
                </TableCell>
                <TableCell className="text-xs font-semibold">{log.user_email}</TableCell>
                <TableCell className="text-xs font-mono">
                  {log.entity_name} #{log.entity_id.slice(0, 8)}
                </TableCell>
                <TableCell className="text-xs font-mono text-slate-600 dark:text-slate-300 max-w-xs truncate">
                  {JSON.stringify(log.new_values || {})}
                </TableCell>
                <TableCell className="text-xs text-slate-400 font-mono">
                  {log.ip_address || '127.0.0.1'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
