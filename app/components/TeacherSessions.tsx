'use client';

import { useState } from 'react';
import { useAppState } from '../lib/state';
import { type Session } from '../lib/mock-data';
import { T } from '../lib/tokens';
import { CodeBadge, ClassBadge, LiveBadge } from './CodeBadge';
import { AppHeader } from './AppHeader';
import { ProgressBar } from './ProgressBar';
import { EmptyState } from './Modal';

const TODAY = '2026-05-05';

type Tab = 'today' | 'upcoming' | 'past';

export function TeacherSessionsPage({ onOpen }: { onOpen: (s: Session) => void }) {
  const { sessions, currentTeacherId } = useAppState();
  const [tab, setTab] = useState<Tab>('today');

  const mine = sessions.filter((s) => s.teacherId === currentTeacherId);
  const today = mine.filter((s) => s.date === TODAY);
  const upcoming = mine.filter((s) => s.status === 'upcoming' && s.date !== TODAY);
  const past = mine.filter((s) => s.status === 'completed' && s.date !== TODAY);

  const list = tab === 'today' ? today : tab === 'upcoming' ? upcoming : past;

  const tabs: [Tab, string, number][] = [
    ['today', "Aujourd'hui", today.length],
    ['upcoming', 'À venir', upcoming.length],
    ['past', 'Passées', past.length],
  ];

  return (
    <div>
      <AppHeader title="Mes sessions" subtitle={`${mine.length} sessions assignées`} />

      <div style={{ display: 'inline-flex', background: T.card, border: `1px solid ${T.hairline}`, borderRadius: 10, padding: 3, marginBottom: 16, boxShadow: T.shadowSm }}>
        {tabs.map(([k, l, count]) => (
          <button key={k} onClick={() => setTab(k)} style={{ padding: '7px 14px', borderRadius: 7, border: 'none', background: tab === k ? T.tint : 'transparent', color: tab === k ? T.brand : T.ink3, fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {l}
            <span style={{ fontSize: 11, padding: '1px 6px', borderRadius: 999, background: tab === k ? T.brand : T.chip, color: tab === k ? '#fff' : T.ink3, fontWeight: 700 }}>{count}</span>
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div style={{ background: T.card, borderRadius: 14, boxShadow: T.shadowMd }}>
          <EmptyState icon="◫" title={tab === 'today' ? "Aucune session aujourd'hui" : tab === 'upcoming' ? 'Aucune session à venir' : 'Aucune session passée'} />
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: 14 }}>
          {list.map((s) => (
            <SessionCard key={s.id} session={s} onOpen={() => onOpen(s)} />
          ))}
        </div>
      )}
    </div>
  );
}

function SessionCard({ session, onOpen }: { session: Session; onOpen: () => void }) {
  const isLive = session.status === 'in_progress';
  const isUpcoming = session.status === 'upcoming';
  const pct = session.enrolled > 0 ? Math.round((session.signedAM / session.enrolled) * 100) : 0;
  const cta = isLive ? 'Reprendre la session' : isUpcoming ? 'Démarrer la session' : 'Voir le détail';
  const ctaColor = isLive ? T.success : isUpcoming ? T.brand : T.ink2;

  return (
    <button
      onClick={onOpen}
      style={{
        textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit',
        background: T.card, border: 'none', borderRadius: 16,
        padding: 20, boxShadow: T.shadowMd,
        display: 'flex', flexDirection: 'column', gap: 12,
        position: 'relative', overflow: 'hidden',
      }}
    >
      {isLive && <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: T.success }} />}

      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <CodeBadge code={session.code} />
        {isLive && <LiveBadge />}
        {isUpcoming && (
          <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: T.warn, background: T.warnBg, padding: '3px 8px', borderRadius: 999 }}>À venir</span>
        )}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: T.muted, fontVariantNumeric: 'tabular-nums' }}>{session.timeRange}</span>
      </div>

      <div>
        <h3 style={{ fontSize: 17, fontWeight: 700, color: T.ink, margin: 0, letterSpacing: '-0.02em' }}>{session.course}</h3>
        <div style={{ fontSize: 13, color: T.ink3, marginTop: 4, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <ClassBadge label={session.classLabel} />
          <span>·</span>
          <span>{session.room}</span>
          <span>·</span>
          <span>{session.date}</span>
        </div>
      </div>

      {session.status !== 'upcoming' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <span style={{ fontSize: 11.5, fontWeight: 600, color: T.ink3, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Présence</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: pct >= 90 ? T.success : pct >= 70 ? T.warn : T.danger, fontVariantNumeric: 'tabular-nums' }}>{session.signedAM}/{session.enrolled} · {pct}%</span>
          </div>
          <ProgressBar value={session.signedAM} max={session.enrolled} />
        </div>
      )}

      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 8 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: ctaColor }}>{cta} →</span>
      </div>
    </button>
  );
}
