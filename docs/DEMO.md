# Episign — Demo Guide

## Overview

Episign is a digital attendance system for EPITA. It has two surfaces:

| Surface | Who | URL / Platform |
|---|---|---|
| **iOS App** | Students | iPad / iPhone |
| **Back Office** | Teachers & Admins | episign.samylayaida.com |

The demo covers three roles. Student is fully detailed — teacher and admin are walkthrough-level.

---

## Pre-Demo Setup

### Accounts

| Role | Platform | Credentials |
|---|---|---|
| Student | iOS App (ForgeID) | `samy.layaida` / ForgeID password |
| Teacher | Back Office | `teacher@epita.fr` / *(set in Supabase Auth)* |
| Admin | Back Office | `admin@epita.fr` / *(set in Supabase Auth)* |

> **Supabase setup required:** Teacher and admin accounts must exist in Supabase Auth **and** have a matching row in the `teachers` or `admins` table with `auth_user_id` set. Create them via the Supabase dashboard → Authentication → Users.

### Session to demo with

A session must be **in progress** at demo time for the full check-in flow to work. Either:
- Create one via **Back Office → Sessions → Nouvelle session** timed to the presentation, or
- Manually set a session's `starts_at` / `ends_at` to bracket the demo window in Supabase.

The teacher's **6-digit card code** (`card_code` column in the `teachers` table) must be known — you'll read it aloud on screen during the student flow.

### Devices

- iPad or iPhone with the Episign app installed (signed build)
- Laptop / external screen with Back Office open in two tabs (one as teacher, one as admin)
- Face ID must work on the device (or use the simulator with Face ID enabled via **Features → Face ID → Enrolled**)

---

## Flow 1 — Student (iOS App)

> **This is the hero flow of the demo.** Run it end-to-end without stopping.

### 1.1 — Sign in

1. Open the Episign app.
2. Tap **Sign in with EpitaID**.
3. The in-app browser opens the ForgeID login at `cri.epita.fr`.
4. Enter credentials → authorize scopes → the browser closes automatically.
5. The app lands on the **Dashboard** showing today's sessions pulled from Supabase.

> If OAuth redirect isn't working yet: tap the small **"Skip login (dev)"** link at the bottom of the sign-in screen to load the mock profile (Samy Layaida, APPING2 DEV D2).

### 1.2 — Dashboard

The dashboard shows:
- Today's sessions with live/upcoming badges
- Each card shows course name, teacher, room, and time range
- Sessions marked **LIVE** are open for check-in

Tap a **LIVE** session card to open its detail, then tap **Sign attendance**.

### 1.3 — Check-In Flow (3 steps)

#### Step 1 — Face ID

- The app prompts for biometric authentication.
- On a real device: look at the camera.
- On simulator: **Simulator → Features → Face ID → Matching Face**.
- On success the screen transitions automatically to step 2.

#### Step 2 — Teacher Code

- The teacher's 6-digit card code is displayed on the Back Office teacher screen (visible to the audience on the second screen).
- The student types the 6 digits into the OTP field.
- Tap **Continuer** — the code is not validated yet, it will be checked server-side with the student code together.

#### Step 3 — Student Code

- The student's personal attendance code is shown on the **Profile** tab of the app (field: **Attendance Code**).
- Open Profile tab, note the code, come back to the check-in screen.
- Enter the 6-digit code and tap **Signer ma présence**.
- The app calls `submit_attendance` with both codes and the session ID.

#### Step 4 — Confirmation

- On success: a green confirmation screen appears — **"Présence enregistrée ✓"** with a timestamp.
- Dismiss to return to the dashboard. The session card updates its check-in status.

### 1.4 — What happens on the other side (live, show on second screen)

While the student signs, the Back Office teacher screen updates in real time:
- The student's name appears in the **live signature feed** on the right.
- The signed count increments instantly (`signedAM` counter).
- The student row in the attendance table turns green.

This real-time update uses a **Supabase realtime subscription** on the `attendance` table — no polling.

---

## Flow 2 — Teacher (Back Office)

> Open `episign.samylayaida.com` and log in with the teacher account **before the demo starts** so the screen is ready.

### 2.1 — Login

1. Go to `episign.samylayaida.com` → redirects to `/login`.
2. Enter teacher email + password.
3. The system detects the role automatically and redirects to `/teacher`.

### 2.2 — Teacher Dashboard

The teacher view shows:
- Their sessions list (past, live, upcoming)
- Live sessions have a pulsing **LIVE** badge

Click the active session to open the live view.

### 2.3 — Live Session Screen

This is the screen to **keep visible on the second display** during the student demo.

It shows:
- Session info (code, course, room, time range, class)
- **Teacher card code badge** — the 6-digit code the student needs to type
- Attendance table: every enrolled student with their AM/PM status
- **Live feed** on the right: incoming signatures appear here in real time as students sign

The teacher can also start an upcoming session manually by clicking **Démarrer la session**.

---

## Flow 3 — Admin (Back Office)

> Open a second browser tab (or incognito) logged in as admin to show alongside the teacher view, or run this as a separate segment.

### 3.1 — Login

Same login page — enter admin email + password. Redirected to `/admin`.

### 3.2 — Dashboard

The admin dashboard shows four KPI cards:
- **Sessions today** — count with in-progress / upcoming breakdown
- **Signature rate (morning)** — percentage of enrolled students signed, color-coded (green ≥90%, orange below)
- **Pending alerts** — count of timing-based fraud attempts
- **Unjustified absences** — students not signed across active sessions today

Below the KPIs: today's session list with per-session signature counts.

### 3.3 — Sessions

Navigate to **Sessions** in the sidebar.

- Full list of all sessions with filters (date range, status, class, free search)
- Click a session → **session detail** with the full student roster, AM/PM status, justifications
- Admin can create new sessions via **Nouvelle session** (teacher, course, room, date, time range, class)

### 3.4 — Apprenants (Students)

Navigate to **Apprenants**.

- Table of all enrolled students with overall attendance stats (total sessions, attended, rate)
- Filter by promotion or search by name / email
- Click a student → individual attendance history per session

### 3.5 — Alertes

Navigate to **Alertes**.

- Lists every attempt to sign outside the allowed time window (too early or too late)
- Each alert shows: student name, session, class, timestamp, and the exact infraction detail
- Admin can **Resolve** (with optional comment) or **Ignore** each alert
- Resolved/ignored alerts move out of the "new" count on the dashboard

---

## Suggested Keynote Order

| # | What | Screen |
|---|---|---|
| 1 | Open BO as **admin** — show dashboard KPIs | Laptop |
| 2 | Switch to **teacher** tab — show live session + teacher code | Laptop (keep visible) |
| 3 | On iOS: sign in as student → dashboard | iPad |
| 4 | Tap live session → start check-in | iPad |
| 5 | Face ID | iPad |
| 6 | Enter teacher code (read from second screen) | iPad |
| 7 | Open Profile, note attendance code, return to check-in | iPad |
| 8 | Enter student code → submit | iPad |
| 9 | Confirmation screen | iPad |
| 10 | Cut back to BO teacher screen — signature appeared live | Laptop |
| 11 | Switch to admin → Alertes to show anomaly detection | Laptop |

Total estimated run time: **4–6 minutes** end to end.

---

## Troubleshooting

| Issue | Fix |
|---|---|
| OAuth redirect fails | Use **"Skip login (dev)"** button on the sign-in screen |
| `submit_attendance` returns error | Verify the teacher code matches `teachers.card_code` in Supabase and the session is `in_progress` |
| Real-time feed not updating | Check Supabase realtime is enabled for the `attendance` table (Table Editor → Replication) |
| Face ID fails on simulator | Simulator → Features → Face ID → Enrolled, then use Matching Face |
| BO login says "Compte non autorisé" | The Supabase Auth user exists but has no matching row in `admins` or `teachers` with `auth_user_id` set |
| App shows `—` for attendance code | Student signed in via mock login — real code only populated after OAuth sign-in via `upsert_student` RPC |
