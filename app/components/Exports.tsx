'use client';

import { useState } from 'react';
import { T } from '../lib/tokens';
import { AppHeader } from './AppHeader';
import { useToast } from './Toast';

type ExportType = 'pdf_session' | 'pdf_batch' | 'csv';
type GeneratedFile = { id: number; type: ExportType; label: string; date: string };

export function ExportsPage() {
  const [generating, setGenerating] = useState<string | null>(null);
  const [generated, setGenerated] = useState<GeneratedFile[]>([]);
  const toast = useToast();

  const handleGenerate = (type: ExportType, label: string) => {
    setGenerating(label);
    setTimeout(() => {
      setGenerated((prev) => [
        { id: Date.now(), type, label, date: '2026-05-05 ' + new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) },
        ...prev,
      ]);
      setGenerating(null);
      toast.push(`${label} généré`, 'success');
    }, 1400);
  };

  const cards: { type: ExportType; title: string; desc: string; icon: React.ReactNode; tag: string }[] = [
    {
      type: 'pdf_session',
      title: "Feuille d'émargement",
      desc: "PDF officiel par session avec signatures manuscrites, en-tête école et horodatage.",
      tag: 'PDF',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M9 14l2 2 4-4" /></svg>
      ),
    },
    {
      type: 'pdf_batch',
      title: 'Export par lot',
      desc: "Toutes les feuilles d'émargement d'une période ou d'une formation, en un seul PDF.",
      tag: 'PDF',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>
      ),
    },
    {
      type: 'csv',
      title: 'Export CSV',
      desc: 'Données brutes de présence pour traitement externe (OPCO, Qualiopi).',
      tag: 'CSV',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18" /><path d="M7 14l3-3 3 3 4-4" /></svg>
      ),
    },
  ];

  return (
    <div>
      <AppHeader title="Exports" subtitle="Générer les feuilles d'émargement et rapports" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 24 }}>
        {cards.map((e) => {
          const isGenerating = generating === e.title;
          return (
            <div key={e.type} style={{ background: T.card, borderRadius: 14, boxShadow: T.shadowMd, padding: 22, display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 40, height: 40, borderRadius: 10, background: T.tint, color: T.brand, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {e.icon}
                </div>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.08em', color: T.brand, background: T.tint, padding: '3px 7px', borderRadius: 4 }}>{e.tag}</span>
              </div>
              <h3 style={{ fontSize: 15.5, fontWeight: 600, color: T.ink, margin: 0, letterSpacing: '-0.01em' }}>{e.title}</h3>
              <p style={{ fontSize: 13, color: T.ink3, margin: 0, flex: 1, lineHeight: 1.55 }}>{e.desc}</p>
              <button
                onClick={() => handleGenerate(e.type, e.title)}
                disabled={generating !== null}
                style={{
                  padding: '10px 16px', borderRadius: 10, border: 'none',
                  background: isGenerating ? T.brandSoft : generating !== null ? '#CBD5E1' : T.brand,
                  color: '#fff', fontSize: 13, fontWeight: 600,
                  cursor: generating !== null ? 'default' : 'pointer',
                  fontFamily: 'inherit', marginTop: 4,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                {isGenerating && <Spinner />}
                {isGenerating ? 'Génération...' : 'Générer'}
              </button>
            </div>
          );
        })}
      </div>

      {generated.length > 0 && (
        <div style={{ background: T.card, borderRadius: 14, boxShadow: T.shadowMd, padding: 22 }}>
          <h3 style={{ fontSize: 14.5, fontWeight: 600, color: T.ink, margin: '0 0 14px' }}>Fichiers générés</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {generated.map((g, i) => (
              <div key={g.id} style={{ display: 'flex', alignItems: 'center', padding: '12px 0', borderBottom: i === generated.length - 1 ? 'none' : `1px solid ${T.hairlineSoft}`, gap: 12 }}>
                <span style={{ fontSize: 10.5, fontWeight: 700, color: T.brand, textTransform: 'uppercase', background: T.tint, padding: '3px 7px', borderRadius: 4, letterSpacing: '0.06em' }}>{g.type.includes('pdf') ? 'PDF' : 'CSV'}</span>
                <span style={{ flex: 1, fontSize: 14, fontWeight: 600, color: T.ink }}>{g.label}</span>
                <span style={{ fontSize: 12, color: T.muted, fontVariantNumeric: 'tabular-nums' }}>{g.date}</span>
                <button onClick={() => toast.push(`Téléchargement de ${g.label}...`, 'info')} style={{ padding: '6px 12px', borderRadius: 7, border: `1px solid ${T.hairline}`, background: T.card, fontSize: 12, color: T.brand, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}>Télécharger</button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function Spinner() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" style={{ animation: 'spin 0.9s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <path d="M21 12a9 9 0 1 1-6.2-8.55" />
    </svg>
  );
}
