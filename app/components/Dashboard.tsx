'use client';

import { useAppState } from '../lib/state';
import { EmptyState } from './Modal';
import { T } from '../lib/tokens';
import { CodeBadge, ClassBadge, LiveBadge } from './CodeBadge';
import { AppHeader } from './AppHeader';

const TODAY = '2026-05-05';
const TODAY_LABEL = 'Lundi 5 mai 2026';

export function DashboardPage() {
  const { alerts, sessions } = useAppState();

  const todaySessions = sessions.filter((s) => s.date === TODAY);
  const inProgress = todaySessions.filter((s) => s.status === 'in_progress').length;
  const upcoming = todaySessions.filter((s) => s.status === 'upcoming').length;

  const amSessions = todaySessions.filter((s) => s.slot === 'morning' || s.slot === 'full');
  const amSigned = amSessions.reduce((sum, s) => sum + s.signedAM, 0);
  const amTotal = amSessions.reduce((sum, s) => sum + s.enrolled, 0);
  const amPct = amTotal > 0 ? Math.round((amSigned / amTotal) * 100) : 0;

  const newAlerts = alerts.filter((a) => a.status === 'new').length;

  const absencesToday = todaySessions
    .filter((s) => s.status !== 'upcoming')
    .reduce((sum, s) => sum + Math.max(0, s.enrolled - s.signedAM), 0);

  const stats = [
    { label: "Sessions aujourd'hui", value: String(todaySessions.length), sub: `${inProgress} en cours · ${upcoming} à venir`, color: T.brand },
    { label: 'Taux de signature (matin)', value: `${amPct}%`, sub: `${amSigned} / ${amTotal} apprenants`, color: amPct >= 90 ? T.success : T.warn },
    { label: 'Alertes en attente', value: String(newAlerts), sub: 'tentatives hors horaire', color: newAlerts > 0 ? T.danger : T.muted },
    { label: 'Absences non justifiées', value: String(absencesToday), sub: "aujourd'hui", color: absencesToday > 0 ? T.warn : T.muted },
  ];

  const newAlertsList = alerts.filter((a) => a.status === 'new');

  return (
    <div>
      <AppHeader title="Tableau de bord" subtitle={TODAY_LABEL} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ background: T.card, borderRadius: 14, padding: '20px 22px', boxShadow: T.shadowMd }}>
            <div style={{ fontSize: 11.5, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', color: T.ink3, marginBottom: 10 }}>{s.label}</div>
            <div style={{ fontSize: 32, fontWeight: 700, color: s.color, lineHeight: 1, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.02em' }}>{s.value}</div>
            <div style={{ fontSize: 12.5, color: T.muted, marginTop: 6 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr', gap: 16 }}>
        <Panel title="Sessions du jour" hint={todaySessions.length > 0 ? `${todaySessions.length} planifiées` : undefined}>
          {todaySessions.length === 0 ? (
            <EmptyState icon="◫" title="Aucune session aujourd'hui" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {todaySessions.map((s, i) => {
                const pct = s.enrolled > 0 ? Math.round((s.signedAM / s.enrolled) * 100) : 0;
                return (
                  <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0', borderBottom: i === todaySessions.length - 1 ? 'none' : `1px solid ${T.hairlineSoft}` }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                        <CodeBadge code={s.code} />
                        {s.status === 'in_progress' && <LiveBadge />}
                        {s.status === 'upcoming' && (
                          <span style={{ fontSize: 10.5, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: T.warn, background: T.warnBg, padding: '3px 8px', borderRadius: 999 }}>À venir</span>
                        )}
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: T.ink, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.course}</div>
                      <div style={{ fontSize: 12, color: T.ink3, marginTop: 2 }}>{s.teacher} · {s.timeRange} · {s.room}</div>
                    </div>
                    <div style={{ textAlign: 'right', flexShrink: 0 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: pct >= 90 ? T.success : pct >= 70 ? T.warn : T.danger, fontVariantNumeric: 'tabular-nums' }}>{s.signedAM}/{s.enrolled}</div>
                      <div style={{ fontSize: 11, color: T.muted, marginTop: 2 }}>signatures</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        <Panel title="Alertes récentes" hint={newAlertsList.length > 0 ? `${newAlertsList.length} en attente` : undefined}>
          {newAlertsList.length === 0 ? (
            <EmptyState icon="✓" title="Aucune alerte" hint="Tout est en ordre." />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {newAlertsList.map((a) => (
                <div key={a.id} style={{ padding: '12px 14px', borderRadius: 10, background: T.dangerBg, border: `1px solid ${T.dangerBorder}`, display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', background: T.warn, color: '#fff', padding: '3px 7px', borderRadius: 4, flexShrink: 0, marginTop: 2, letterSpacing: '0.04em' }}>Horaire</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: T.ink }}>{a.student}</div>
                    <div style={{ fontSize: 11.5, color: T.ink3, marginTop: 2 }}>{a.detail}</div>
                    <div style={{ marginTop: 4 }}><ClassBadge label={a.classLabel} /></div>
                  </div>
                  <span style={{ fontSize: 11.5, color: T.muted, flexShrink: 0, fontVariantNumeric: 'tabular-nums' }}>{a.time}</span>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

function Panel({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ background: T.card, borderRadius: 14, padding: 22, boxShadow: T.shadowMd }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
        <h2 style={{ fontSize: 15, fontWeight: 600, color: T.ink, margin: 0, letterSpacing: '-0.01em' }}>{title}</h2>
        {hint && <span style={{ fontSize: 11.5, color: T.muted, fontWeight: 500 }}>{hint}</span>}
      </div>
      {children}
    </div>
  );
}
