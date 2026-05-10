'use client';

import { T } from '../lib/tokens';

export function CodeBadge({ code }: { code: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: 10.5, fontWeight: 700, letterSpacing: '0.04em',
        color: T.brand, background: T.tint,
        padding: '3px 7px', borderRadius: 5,
        fontVariantNumeric: 'tabular-nums',
      }}
    >
      {code}
    </span>
  );
}

export function ClassBadge({ label }: { label: string }) {
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: 11.5, fontWeight: 600, color: T.brandInk,
        background: T.chip, padding: '3px 8px', borderRadius: 5,
      }}
    >
      {label}
    </span>
  );
}

export function LiveBadge() {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: T.success, background: T.successBg, padding: '3px 8px', borderRadius: 999 }}>
      <span className="epi-live-dot" style={{ width: 6, height: 6 }} />
      LIVE
    </span>
  );
}
