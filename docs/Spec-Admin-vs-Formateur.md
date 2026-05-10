# Spec — Séparation Admin / Formateur

## 1. Pourquoi

Le PDF identifie **trois surfaces** : iOS apprenant, **page TOTP formateur**, **dashboard admin**.

Le BO actuel est entièrement orienté admin (responsable pédagogique). Il manque la surface formateur, qui est une web app distincte avec un périmètre beaucoup plus restreint.

---

## 2. Rôles & périmètre

### Admin (responsable pédagogique) — déjà construit
- Vision **transversale** (toutes promotions, tous formateurs)
- Audit, conformité, gestion des anomalies

### Formateur (nouveau)
- Vision **scopée à ses propres sessions**
- Outil opérationnel pendant la session (afficher TOTP, voir les arrivées en temps réel)
- Pas de capacité d'audit (invalider/justifier → escalade vers admin)

### Matrice des capacités

| Capacité | Admin | Formateur |
|---|:-:|:-:|
| Liste de toutes les sessions | ✅ | ❌ |
| Mes sessions (filtrées) | — | ✅ |
| **Démarrer une session** (afficher TOTP/QR) | ❌ | ✅ |
| Suivi temps réel des signatures | ✅ (passif) | ✅ (actif, sa session) |
| Marquer en retard / clore manuellement | ❌ | ✅ |
| Voir la liste des apprenants d'une session | ✅ | ✅ (siennes) |
| Invalider une signature | ✅ | ❌ (escalade) |
| Justifier une absence | ✅ | ❌ (escalade) |
| Gérer les alertes | ✅ | ❌ |
| Exports PDF/CSV | ✅ (toutes) | ✅ (ses sessions) |
| Annuaire apprenants | ✅ (toutes promos) | ✅ (ses classes) |
| Journal d'audit | ✅ | ❌ |

---

## 3. Écrans formateur à construire

### F1 — Mes sessions
Liste des sessions assignées au formateur, segmentée **Aujourd'hui / À venir / Passées**. Filtre rapide par classe.

### F2 — Session active (le cœur de l'outil) ⭐
Pendant qu'une session est `in_progress`, c'est l'écran qu'on garde ouvert :

- **Grand code TOTP** (6 chiffres, monospace, énorme), régénéré toutes les 30s avec barre de progression
- **QR code** en fallback (pour scan rapide via app iOS)
- **Liste live des arrivées** : apparition animée de chaque apprenant qui signe, ordre chronologique avec horodatage
- **Compteur** "21 / 24 signés" + barre de progression
- **Liste des absents** (visible mais grisée)
- **Actions** : "Marquer en retard" (par apprenant), "Clore la session", "Pause" (suspend les signatures temporairement)

### F3 — Détail session passée
Roll call lecture seule, export PDF de la feuille d'émargement, lien "signaler une anomalie" (escalade admin).

### F4 — Mon profil
Nom, email, mes classes, lien "déconnexion".

### F5 — Mon tableau de bord (optionnel, P1)
Mini-vue : prochaine session, taux moyen de présence sur le mois.

---

## 4. Architecture technique

**Un seul Next.js app, deux espaces (segments du router) :**

```
/                  → redirige selon rôle (admin → /admin, formateur → /teacher)
/admin             → BO admin (déjà construit, déplacé sous ce segment)
/teacher           → BO formateur (nouveau)
/teacher/sessions/[id]/live  → écran F2 plein écran
```

Avantages :
- Un seul build, un seul déploiement
- Code partagé : tokens, mock-data, AppStateProvider, ToastProvider, Sidebar (avec variantes)
- Auth future : un seul flux, route guard côté layout

**Variantes visuelles** :
- Sidebar admin : fond `--ink` foncé, accent `--brand` (déjà fait)
- Sidebar formateur : fond `--brand-deep` saturé, accent blanc — pour distinguer immédiatement
- Logo/header : tag "BO" → admin, tag "Cours" → formateur

---

## 5. Modèle de données — additions

```ts
type Teacher = {
  id: string;
  name: string;
  email: string;
  classes: string[]; // promotions enseignées
};

// Session gagne :
type Session = {
  /* ... */
  teacherId: string;  // foreign key
  totpCode?: string;  // seulement quand status === 'in_progress'
  totpExpiresAt?: number;
};

// AppState gagne :
type AppState = {
  /* ... */
  currentRole: 'admin' | 'teacher';
  currentUserId: string;        // teacherId quand role === 'teacher'
  signatureFeed: SignatureEvent[]; // pour le live feed
};
```

`MOCK_SESSIONS` est étendu avec `teacherId`, et l'écran formateur les filtre via `s.teacherId === currentUserId`.

---

## 6. Mode dev — actions de test ⚙️

Un panneau flottant `<DevTools />` (bouton bottom-right qui ouvre un drawer), visible uniquement quand `process.env.NODE_ENV !== 'production'` OU `?dev=1`. Il permet de :

| Action | Effet |
|---|---|
| **Changer de rôle** | Admin ↔ Formateur (sélection du formateur) |
| **Changer de formateur** | Bascule vers M. Dupont / Mme Berger / etc. |
| **Avancer le TOTP** | Force la régénération du code |
| **Simuler une signature** | Pousse un événement `signed` dans le feed (un apprenant aléatoire) |
| **Simuler une alerte** | Génère une alerte time-based |
| **Toggle session** | Flip `in_progress` ↔ `completed` |
| **Reset state** | Restaure invalidations/justifications/alertes par défaut |
| **Avancer le temps** | Décale la "date du jour" pour tester les filtres |

**Localisation du code** : `app/dev/` — un dossier isolé. Tout import depuis ce dossier est marqué pour suppression.

**Suppression future** : un seul `git rm -r app/dev` + retrait de `<DevTools />` dans `layout.tsx` + retrait du flag `?dev=1`. Aucun couplage avec le code métier.

---

## 7. Plan de mise en œuvre

1. **Refactor structure** : déplacer le code admin actuel sous `/admin`, créer le shell `/teacher`, mettre la racine en redirect
2. **Étendre les modèles** : ajouter `teacherId` sur sessions, créer `MOCK_TEACHERS`, étendre `AppState` avec rôle/utilisateur courant
3. **Sidebar formateur** : variante visuelle, nav réduite (Mes sessions, Profil)
4. **Écrans F1, F3, F4** (statiques, faciles)
5. **Écran F2 (live)** : TOTP + QR + feed temps réel — c'est l'écran à soigner
6. **DevTools panel** sous `app/dev/`, branché en dernier
7. **Migration future** : remplacer DevTools par auth, supprimer `app/dev/`

---

## 8. Hors périmètre v1

- Authentification réelle (mockée par DevTools)
- Validation TOTP côté serveur (le code affiché n'a pas de logique réelle, c'est purement visuel pour la maquette)
- Notifications push aux apprenants
- Multi-formateur sur une même session
- Modification des sessions (création/édition reste hors-scope, comme côté admin)
