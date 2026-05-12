export type Teacher = { id: string; name: string; email: string };

export const MOCK_TEACHERS: Teacher[] = [
  { id: 't-dupont', name: 'M. Dupont', email: 'p.dupont@ecole.fr' },
  { id: 't-berger', name: 'Mme Berger', email: 'a.berger@ecole.fr' },
  { id: 't-martin', name: 'M. Martin', email: 'l.martin@ecole.fr' },
  { id: 't-petit', name: 'Mme Petit', email: 's.petit@ecole.fr' },
  { id: 't-leroy', name: 'M. Leroy', email: 'j.leroy@ecole.fr' },
  { id: 't-moreau', name: 'M. Moreau', email: 'a.moreau@ecole.fr' },
];

export type Promotion = { id: string; promo: string; filiere: string; group: number; label: string };

export const PROMOTIONS: Promotion[] = [];
(['ING1', 'ING2', 'ING3', 'ING4', 'ING5'] as const).forEach((p) => {
  (['DEV', 'CYBER'] as const).forEach((f) => {
    [1, 2].forEach((g) => PROMOTIONS.push({ id: `${p}-${f}-${g}`, promo: p, filiere: f, group: g, label: `${p} ${f} ${g}` }));
  });
});
(['APPING1', 'APPING2', 'APPING3'] as const).forEach((p) => {
  (['DEV', 'CYBER'] as const).forEach((f) => {
    [1, 2].forEach((g) => PROMOTIONS.push({ id: `${p}-${f}-${g}`, promo: p, filiere: f, group: g, label: `${p} ${f} ${g}` }));
  });
});

export type SessionStatus = 'in_progress' | 'upcoming' | 'completed';
export type Session = {
  id: string;
  code: string;
  course: string;
  teacher: string;
  teacherId: string;
  room: string;
  date: string;
  timeRange: string;
  slot: 'morning' | 'afternoon' | 'full';
  status: SessionStatus;
  classLabel: string;
  enrolled: number;
  signedAM: number;
  signedPM: number;
  // Populated for real DB sessions:
  teacherCardCode?: string;
  startsAt?: string;
  endsAt?: string;
};

export const MOCK_SESSIONS: Session[] = [
  { id: '1', code: 'IOS-402', course: 'Développement iOS — SwiftUI', teacher: 'M. Dupont', teacherId: 't-dupont', room: 'A201', date: '2026-05-05', timeRange: '09:00 – 12:30', slot: 'morning', status: 'in_progress', classLabel: 'APPING2 DEV 1', enrolled: 24, signedAM: 21, signedPM: 0 },
  { id: '2', code: 'ARCH-301', course: 'Architecture logicielle', teacher: 'Mme Berger', teacherId: 't-berger', room: 'B105', date: '2026-05-05', timeRange: '09:00 – 12:30', slot: 'morning', status: 'in_progress', classLabel: 'ING3 CYBER 1', enrolled: 18, signedAM: 18, signedPM: 0 },
  { id: '3', code: 'UX-310', course: 'UX Design avancé', teacher: 'M. Martin', teacherId: 't-martin', room: 'C302', date: '2026-05-05', timeRange: '14:00 – 17:30', slot: 'afternoon', status: 'upcoming', classLabel: 'APPING1 DEV 2', enrolled: 22, signedAM: 0, signedPM: 0 },
  { id: '4', code: 'DB-220', course: 'Base de données — PostgreSQL', teacher: 'Mme Petit', teacherId: 't-petit', room: 'A105', date: '2026-05-04', timeRange: '09:00 – 17:00', slot: 'full', status: 'completed', classLabel: 'ING2 DEV 1', enrolled: 20, signedAM: 19, signedPM: 18 },
  { id: '5', code: 'PRJ-501', course: 'Projet tutoré M1', teacher: 'M. Leroy', teacherId: 't-leroy', room: 'Lab1', date: '2026-05-04', timeRange: '09:00 – 12:30', slot: 'morning', status: 'completed', classLabel: 'ING4 CYBER 2', enrolled: 15, signedAM: 14, signedPM: 0 },
  { id: '6', code: 'SEC-410', course: 'Sécurité des systèmes', teacher: 'M. Moreau', teacherId: 't-moreau', room: 'A201', date: '2026-05-03', timeRange: '09:00 – 17:00', slot: 'full', status: 'completed', classLabel: 'APPING3 CYBER 1', enrolled: 22, signedAM: 20, signedPM: 19 },
  { id: '7', code: 'IOS-403', course: 'Combine & Async iOS', teacher: 'M. Dupont', teacherId: 't-dupont', room: 'A201', date: '2026-05-06', timeRange: '14:00 – 17:30', slot: 'afternoon', status: 'upcoming', classLabel: 'APPING2 DEV 1', enrolled: 24, signedAM: 0, signedPM: 0 },
  { id: '8', code: 'IOS-401', course: 'Introduction à Swift', teacher: 'M. Dupont', teacherId: 't-dupont', room: 'A201', date: '2026-05-02', timeRange: '09:00 – 12:30', slot: 'morning', status: 'completed', classLabel: 'APPING2 DEV 1', enrolled: 24, signedAM: 22, signedPM: 0 },
];

export const STUDENT_NAMES = [
  'Emma Lefevre', 'Lucas Bernard', 'Chloé Dubois', 'Hugo Thomas', 'Léa Moreau',
  'Nathan Robert', 'Manon Richard', 'Théo Durand', 'Camille Simon', 'Louis Laurent',
  'Sarah Michel', 'Arthur Lefebvre', 'Jade Garcia', 'Raphaël David', 'Inès Bertrand',
  'Adam Roux', 'Zoé Vincent', 'Gabriel Fournier', 'Clara Morel', 'Maxime Girard',
  'Lina Bonnet', 'Ethan Dupont', 'Alice Lemaire', 'Noah Lambert',
];

export const CLASS_ASSIGNMENTS: Record<string, string> = {};
STUDENT_NAMES.forEach((name, i) => {
  CLASS_ASSIGNMENTS[name] = PROMOTIONS[i % PROMOTIONS.length].label;
});

export type StudentRow = {
  id: number;
  name: string;
  email: string;
  signedAM: boolean;
  signedPM: boolean;
  classLabel: string;
};

export function generateStudents(sessionId: string, enrolled: number, signedAM: number, signedPM: number, classLabel?: string): StudentRow[] {
  return STUDENT_NAMES.slice(0, enrolled).map((name, i) => ({
    id: i,
    name,
    email: name.toLowerCase().replace(' ', '.') + '@ecole.fr',
    signedAM: i < signedAM,
    signedPM: i < signedPM,
    classLabel: classLabel || CLASS_ASSIGNMENTS[name],
  }));
}

export type AlertStatus = 'new' | 'resolved' | 'ignored';
export type Alert = {
  id: number;
  type: 'time';
  student: string;
  session: string;
  classLabel: string;
  date: string;
  time: string;
  detail: string;
  status: AlertStatus;
  comment?: string;
};

export const MOCK_ALERTS: Alert[] = [
  { id: 1, type: 'time', student: 'Hugo Thomas', session: 'Développement iOS — SwiftUI', classLabel: 'APPING2 DEV 1', date: '2026-05-05', time: '07:42', detail: "Tentative de signature 48 min avant l'ouverture de la session", status: 'new' },
  { id: 2, type: 'time', student: 'Adam Roux', session: 'Architecture logicielle', classLabel: 'ING3 CYBER 1', date: '2026-05-05', time: '18:05', detail: 'Tentative de signature 2h après la fermeture de la session', status: 'new' },
  { id: 3, type: 'time', student: 'Léa Moreau', session: 'Base de données — PostgreSQL', classLabel: 'ING2 DEV 1', date: '2026-05-04', time: '18:45', detail: 'Tentative de signature 2h15 après la fermeture de la session', status: 'resolved' },
];
