'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppState, type Role } from '../lib/state';
import { T } from '../lib/tokens';
import { supabase, getAuthRole } from '../lib/supabase';

const ADMIN_EMAIL = 'admin@ecole.fr';

export default function LoginPage() {
  const router = useRouter();
  const { setRole, setCurrentTeacherId } = useAppState();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { data, error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError || !data.user) {
      setError(authError?.message ?? 'Identifiants incorrects');
      setLoading(false);
      return;
    }

    const roleInfo = await getAuthRole(data.user.id);
    if (!roleInfo) {
      setError('Compte non autorisé. Contactez un administrateur.');
      await supabase.auth.signOut();
      setLoading(false);
      return;
    }

    setRole(roleInfo.role);
    if (roleInfo.role === 'teacher') setCurrentTeacherId(roleInfo.profileId);
    router.push(roleInfo.role === 'admin' ? '/admin' : '/teacher');
  };

  return (
    <>
      <style>{`
        

        .login-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: var(--font-dm-sans), -apple-system, sans-serif;
          background: #0A1B2E;
        }

        /* === LEFT PANEL === */
        .panel-left {
          position: relative;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 48px 52px;
          overflow: hidden;
          background: #0A1B2E;
        }

        .grid-bg {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 36px 36px;
        }

        .grid-fade {
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at 80% 50%, transparent 20%, #0A1B2E 70%);
        }

        .e-mark {
          position: absolute;
          right: -60px;
          top: 50%;
          transform: translateY(-50%);
          font-family: var(--font-dm-serif), Georgia, serif;
          font-size: clamp(280px, 28vw, 420px);
          line-height: 1;
          color: transparent;
          -webkit-text-stroke: 1px rgba(255,255,255,0.06);
          user-select: none;
          pointer-events: none;
          animation: e-float 6s ease-in-out infinite;
        }

        @keyframes e-float {
          0%, 100% { transform: translateY(-50%) rotate(-1deg); }
          50%       { transform: translateY(calc(-50% - 12px)) rotate(0.5deg); }
        }

        .left-content {
          position: relative;
          z-index: 1;
          animation: slide-left 0.7s cubic-bezier(0.16,1,0.3,1) both;
        }

        @keyframes slide-left {
          from { opacity: 0; transform: translateX(-20px); }
          to   { opacity: 1; transform: translateX(0); }
        }

        .logo-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 0;
        }

        .logo-mark {
          width: 38px;
          height: 38px;
          border-radius: 11px;
          background: linear-gradient(135deg, #1E4FD6, #3E74E8);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: var(--font-dm-serif), Georgia, serif;
          font-size: 18px;
          color: #fff;
          box-shadow: 0 4px 16px rgba(30,79,214,0.45);
        }

        .logo-name {
          font-size: 20px;
          font-weight: 600;
          color: #fff;
          letter-spacing: -0.02em;
        }

        .left-bottom {
          position: relative;
          z-index: 1;
        }

        .left-tagline {
          font-family: var(--font-dm-serif), Georgia, serif;
          font-size: clamp(28px, 3vw, 40px);
          line-height: 1.18;
          color: #fff;
          letter-spacing: -0.02em;
          margin-bottom: 18px;
        }

        .left-sub {
          font-size: 14px;
          color: rgba(255,255,255,0.45);
          line-height: 1.6;
          max-width: 320px;
        }

        .left-badge {
          margin-top: 32px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 999px;
          font-size: 11.5px;
          font-weight: 600;
          letter-spacing: 0.04em;
          color: rgba(255,255,255,0.5);
        }

        .badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #1E8F5F;
        }

        /* === RIGHT PANEL === */
        .panel-right {
          background: #F4F6FA;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px 40px;
          position: relative;
        }

        .form-card {
          width: 100%;
          max-width: 420px;
          animation: slide-up 0.6s 0.1s cubic-bezier(0.16,1,0.3,1) both;
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(16px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .form-heading {
          font-family: var(--font-dm-serif), Georgia, serif;
          font-size: 30px;
          color: #0A1B2E;
          letter-spacing: -0.02em;
          margin: 0 0 6px;
        }

        .form-sub {
          font-size: 14px;
          color: #8896AB;
          margin: 0 0 32px;
          line-height: 1.5;
        }

        .field-label {
          display: block;
          font-size: 11.5px;
          font-weight: 700;
          letter-spacing: 0.07em;
          text-transform: uppercase;
          color: #4A5D7A;
          margin-bottom: 7px;
        }

        /* Role cards */
        .role-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 22px;
        }

        .role-card {
          border: 1.5px solid;
          border-radius: 12px;
          padding: 16px 14px;
          cursor: pointer;
          transition: all 0.18s;
          background: #fff;
          text-align: left;
        }

        .role-card.selected {
          border-color: #1E4FD6;
          background: #EBF0FD;
          box-shadow: 0 0 0 3px rgba(30,79,214,0.1);
        }

        .role-card:not(.selected) {
          border-color: rgba(10,27,46,0.1);
        }

        .role-card:not(.selected):hover {
          border-color: rgba(10,27,46,0.2);
          background: #FAFBFD;
        }

        .role-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 10px;
          font-size: 15px;
        }

        .role-title {
          font-size: 13px;
          font-weight: 700;
          color: #0A1B2E;
          margin: 0 0 2px;
        }

        .role-desc {
          font-size: 11.5px;
          color: #8896AB;
          line-height: 1.4;
        }

        /* Input */
        .input-wrap {
          position: relative;
          margin-bottom: 22px;
        }

        .epi-input {
          width: 100%;
          padding: 12px 16px;
          border-radius: 10px;
          border: 1.5px solid rgba(10,27,46,0.12);
          background: #fff;
          font-size: 14px;
          font-family: var(--font-dm-sans), sans-serif;
          color: #0A1B2E;
          transition: border-color 0.15s, box-shadow 0.15s;
          box-sizing: border-box;
        }

        .epi-input::placeholder { color: #8896AB; }

        .epi-input:focus {
          border-color: #1E4FD6;
          outline: none;
          box-shadow: 0 0 0 3px rgba(30,79,214,0.12);
        }

        /* Teacher select */
        .teacher-row {
          margin-bottom: 22px;
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transition: max-height 0.3s ease, opacity 0.25s ease, margin-bottom 0.3s ease;
        }

        .teacher-row.visible {
          max-height: 80px;
          opacity: 1;
        }

        /* Submit */
        .submit-btn {
          width: 100%;
          padding: 14px;
          border-radius: 12px;
          border: none;
          background: #0A1B2E;
          color: #fff;
          font-family: var(--font-dm-sans), sans-serif;
          font-size: 14.5px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.18s, transform 0.1s, box-shadow 0.18s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          position: relative;
          overflow: hidden;
        }

        .submit-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.06), transparent);
          transform: translateX(-100%);
          transition: transform 0.5s;
        }

        .submit-btn:hover::after { transform: translateX(100%); }

        .submit-btn:hover:not(:disabled) {
          background: #1C2E4A;
          box-shadow: 0 6px 20px rgba(10,27,46,0.25);
        }

        .submit-btn:active:not(:disabled) { transform: translateY(1px); }
        .submit-btn:disabled { background: #CBD5E1; cursor: not-allowed; }

        .error-msg {
          font-size: 12.5px;
          color: #B8382F;
          background: #FDE6E3;
          border: 1px solid #F5BFB9;
          border-radius: 8px;
          padding: 9px 12px;
          margin-bottom: 16px;
          animation: slide-up 0.2s ease both;
        }

        .divider {
          display: flex;
          align-items: center;
          gap: 12px;
          margin: 24px 0;
          color: #C4CDD8;
          font-size: 12px;
        }
        .divider::before, .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(10,27,46,0.08);
        }

        /* Spinner */
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner {
          width: 16px; height: 16px; border-radius: 50%;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          animation: spin 0.7s linear infinite;
        }

        @media (max-width: 768px) {
          .login-root { grid-template-columns: 1fr; }
          .panel-left { display: none; }
          .panel-right { padding: 32px 24px; }
        }
      `}</style>

      <div className="login-root">
        {/* ── LEFT PANEL ── */}
        <div className="panel-left">
          <div className="grid-bg" />
          <div className="grid-fade" />
          <div className="e-mark" aria-hidden>E</div>

          <div className="left-content logo-row">
            <div className="logo-mark">E</div>
            <span className="logo-name">Episign</span>
          </div>

          <div className="left-bottom left-content">
            <h1 className="left-tagline">
              Gestion des<br />
              émargements<br />
              numériques.
            </h1>
            <p className="left-sub">
              Suivi temps réel des signatures, gestion des sessions, conformité Qualiopi — tout en un.
            </p>
            <div className="left-badge">
              <span className="badge-dot" />
              Système actif · 2 sessions en cours
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL ── */}
        <div className="panel-right">
          <div className="form-card">
            <h2 className="form-heading">Connexion</h2>
            <p className="form-sub">Accédez à votre espace Episign.</p>

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div className="input-wrap">
                <label className="field-label">Adresse e-mail</label>
                <input
                  type="email"
                  className="epi-input"
                  style={{ marginTop: 8 }}
                  placeholder="vous@ecole.fr"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(''); }}
                  autoComplete="email"
                  autoFocus
                  required
                />
              </div>

              {/* Password */}
              <div className="input-wrap" style={{ marginBottom: 28 }}>
                <label className="field-label">Mot de passe</label>
                <input
                  type="password"
                  className="epi-input"
                  style={{ marginTop: 8 }}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
                  autoComplete="current-password"
                  required
                />
              </div>

              {error && <div className="error-msg">{error}</div>}

              <button type="submit" className="submit-btn" disabled={loading || !email || !password}>
                {loading ? <span className="spinner" /> : null}
                {loading ? 'Connexion en cours…' : 'Se connecter'}
              </button>
            </form>

            <div className="divider">Episign Back-Office</div>
            <p style={{ fontSize: 12, color: '#B0BCCC', textAlign: 'center', lineHeight: 1.6, margin: 0 }}>
              Votre rôle (formateur ou responsable) est détecté automatiquement.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
