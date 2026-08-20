export function formatDate(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatTime(dateString?: string | null): string {
  if (!dateString) return '—';
  try {
    const d = new Date(dateString);
    return d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return dateString;
  }
}

export function formatDateTime(dateString?: string | null): string {
  if (!dateString) return '—';
  return `${formatDate(dateString)} at ${formatTime(dateString)}`;
}

export function formatNumber(num?: number | null, decimals = 1): string {
  if (num === undefined || num === null || isNaN(num)) return '0';
  return num % 1 === 0 ? num.toString() : num.toFixed(decimals);
}

export function getStatusBadgeVariant(status: string): string {
  switch (status) {
    case 'ACTIVE':
    case 'ANNOUNCED':
    case 'PRESENT':
    case 'COMPLETED':
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800';
    case 'STARTED':
    case 'JUDGING':
    case 'IN_PROGRESS':
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800';
    case 'SCHEDULED':
    case 'READY':
    case 'JUDGED':
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800';
    case 'DRAFT':
    case 'NOT_MARKED':
    case 'PENDING':
      return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    case 'ABSENT':
    case 'CANCELLED':
    case 'DISQUALIFIED':
    case 'BANNED':
      return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-200';
  }
}
