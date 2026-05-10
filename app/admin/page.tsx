'use client';

import { useState } from 'react';
import { Sidebar, type PageId } from '../components/Sidebar';
import { DashboardPage } from '../components/Dashboard';
import { SessionsPage } from '../components/Sessions';
import { SessionDetailPage } from '../components/SessionDetail';
import { AlertsPage } from '../components/Alerts';
import { StudentsPage } from '../components/Students';
import { ExportsPage } from '../components/Exports';
import type { Session } from '../lib/mock-data';

export default function AdminApp() {
  const [page, setPage] = useState<PageId>('dashboard');
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  const renderPage = () => {
    if (selectedSession) return <SessionDetailPage session={selectedSession} onBack={() => setSelectedSession(null)} />;
    switch (page) {
      case 'dashboard':
        return <DashboardPage />;
      case 'sessions':
      case 'signatures':
        return <SessionsPage onViewSession={(s) => setSelectedSession(s)} />;
      case 'alerts':
        return <AlertsPage />;
      case 'students':
        return <StudentsPage />;
      case 'exports':
        return <ExportsPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar
        activePage={page}
        onNavigate={(p) => {
          setPage(p);
          setSelectedSession(null);
        }}
      />
      <main style={{ marginLeft: 240, flex: 1, padding: '28px 36px', minHeight: '100vh', maxWidth: 'calc(100vw - 240px)' }}>{renderPage()}</main>
    </div>
  );
}
