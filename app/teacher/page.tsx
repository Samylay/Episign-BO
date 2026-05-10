'use client';

import { useState } from 'react';
import { TeacherSidebar, type TeacherPageId } from '../components/TeacherSidebar';
import { TeacherSessionsPage } from '../components/TeacherSessions';
import { TeacherLivePage } from '../components/TeacherLive';
import { TeacherProfilePage } from '../components/TeacherProfile';
import type { Session } from '../lib/mock-data';

export default function TeacherApp() {
  const [page, setPage] = useState<TeacherPageId>('sessions');
  const [openSession, setOpenSession] = useState<Session | null>(null);

  const renderPage = () => {
    if (openSession) return <TeacherLivePage session={openSession} onBack={() => setOpenSession(null)} />;
    switch (page) {
      case 'sessions':
        return <TeacherSessionsPage onOpen={(s) => setOpenSession(s)} />;
      case 'profile':
        return <TeacherProfilePage />;
      default:
        return <TeacherSessionsPage onOpen={(s) => setOpenSession(s)} />;
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <TeacherSidebar
        activePage={page}
        onNavigate={(p) => {
          setPage(p);
          setOpenSession(null);
        }}
      />
      <main style={{ marginLeft: 240, flex: 1, padding: '28px 36px', minHeight: '100vh', maxWidth: 'calc(100vw - 240px)' }}>{renderPage()}</main>
    </div>
  );
}
