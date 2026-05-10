'use client';

import { T } from '../lib/tokens';

export function ProgressBar({ value, max }: { value: number; max: number }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  const color = pct >= 90 ? T.success : pct >= 70 ? T.warn : T.danger;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 64, height: 6, borderRadius: 3, background: T.chip, overflow: 'hidden' }}>
        <div style={{ height: '100%', borderRadius: 3, background: color, width: pct + '%', transition: 'width 0.4s ease-out' }} />
      </div>
      <span style={{ fontSize: 12, color: T.ink3, minWidth: 36, fontVariantNumeric: 'tabular-nums', fontWeight: 500 }}>{value}/{max}</span>
    </div>
  );
}
