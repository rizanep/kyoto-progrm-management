import * as React from 'react';
import { FacitShell } from '@/components/layout/facit-shell';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FacitShell>{children}</FacitShell>;
}
