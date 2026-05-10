# Besoins fonctionnels — Interface d'administration Episign

## 1. Profil utilisateur

**Responsable pédagogique** — Consulte les émargements, gère les anomalies, exporte les documents de conformité. Accès via navigateur web (desktop prioritaire, responsive secondaire).

---

## 2. Besoins fonctionnels

### 2.1 Tableau de bord (Dashboard)

| #  | Besoin                          | Priorité | Détail                                                                  |
| -- | ------------------------------- | -------- | ----------------------------------------------------------------------- |
| D1 | Vue synthétique du jour         | P0       | Nombre de sessions en cours, taux de signature global, alertes en attente |
| D2 | Indicateurs temps réel          | P0       | Signatures remontées en live, compteur d'absences non justifiées        |
| D3 | Alertes actives                 | P0       | Tentatives de signature hors fenêtre temporelle                         |
| D4 | Accès rapide aux sessions du jour | P1     | Liste cliquable des sessions avec statut (en cours / terminée / à venir) |

### 2.2 Suivi des sessions

| #  | Besoin                       | Priorité | Détail                                                                                       |
| -- | ---------------------------- | -------- | -------------------------------------------------------------------------------------------- |
| S1 | Liste des sessions           | P0       | Filtrable par date (jour/semaine/mois), formateur, formation, salle, promotion. Recherche libre. |
| S2 | Détail d'une session         | P0       | Liste des apprenants inscrits, statut de signature (non signé, matin, après-midi, complet)   |
| S3 | Suivi temps réel             | P0       | Mise à jour live des signatures pendant une session en cours                                 |
| S4 | Taux de présence par session | P1       | Pourcentage calculé automatiquement, visible en liste et en détail                           |

### 2.3 Gestion des signatures

| #  | Besoin                          | Priorité | Détail                                                                                              |
| -- | ------------------------------- | -------- | --------------------------------------------------------------------------------------------------- |
| G1 | Visualisation d'une signature   | P0       | Image de la signature manuscrite, horodatage serveur                                                |
| G2 | Invalidation manuelle           | P0       | Motif obligatoire, traçabilité (qui a invalidé, quand, pourquoi). Confirmation requise              |
| G3 | Historique des modifications    | P1       | Journal d'audit : invalidation, justification d'une signature, par session                          |
| G4 | Régularisation                  | P1       | Possibilité de marquer une absence comme justifiée (motif obligatoire, tracée dans le journal)      |

### 2.4 Alertes et anomalies

| #  | Besoin               | Priorité | Détail                                                                                  |
| -- | -------------------- | -------- | --------------------------------------------------------------------------------------- |
| A1 | Liste des alertes    | P0       | Tentatives de signature hors fenêtre temporelle uniquement                              |
| A2 | Traitement des alertes | P0     | Marquer comme résolue / ignorée, avec commentaire. Statuts : nouvelle, résolue, ignorée |
| A3 | Notifications        | P2       | Notification navigateur ou email pour alertes critiques                                 |

### 2.5 Export et conformité

| #  | Besoin                        | Priorité | Détail                                                                                                |
| -- | ----------------------------- | -------- | ----------------------------------------------------------------------------------------------------- |
| E1 | Export PDF feuille d'émargement | P0     | Format officiel : en-tête école, intitulé formation, date, liste apprenants + signatures + horodatage |
| E2 | Export par lot                | P1       | Export PDF groupé pour une période ou une formation complète                                          |
| E3 | Export CSV/Excel              | P2       | Données brutes pour traitement externe (OPCO, Qualiopi)                                               |

### 2.6 Consultation des apprenants

| #  | Besoin                  | Priorité | Détail                                                            |
| -- | ----------------------- | -------- | ----------------------------------------------------------------- |
| U1 | Annuaire apprenants     | P1       | Recherche par nom/email, filtre par promotion, consultation du profil |
| U2 | Historique par apprenant | P1      | Toutes les signatures d'un apprenant, taux de présence global     |

---

## 3. Promotions et classes

Les apprenants sont organisés en promotions, chacune décomposée en filières et groupes :

- **Promotions** : ING1, ING2, ING3, ING4, ING5, APPING1, APPING2, APPING3
- **Filières** par promotion : DEV, CYBER
- **Groupes** par filière : 2 groupes

Format d'affichage des classes : `<PROMO> <FILIÈRE> <GROUPE>` (ex. `APPING2 DEV 1`).

---

## 4. Besoins non-fonctionnels

| #   | Besoin         | Détail                                                                           |
| --- | -------------- | -------------------------------------------------------------------------------- |
| NF1 | Temps réel     | Les signatures doivent apparaître dans les 5 secondes suivant la validation côté apprenant |
| NF2 | Responsive     | Desktop prioritaire, tablette acceptable, mobile consultation seule              |
| NF3 | Accessibilité  | Navigation clavier (Échap pour fermer les modales), contrastes WCAG AA           |
| NF4 | Performance    | Chargement < 2s, pagination pour les listes > 50 éléments                        |
| NF5 | Sécurité       | Authentification requise, sessions expirables, HTTPS obligatoire                 |
| NF6 | Langue         | Interface en français                                                            |

---

## 5. Hors périmètre (v1)

- Création / modification des sessions (géré via import ou autre outil)
- Gestion des comptes formateurs et apprenants (CRUD complet)
- Configuration du système TOTP
- Gestion des salles et du planning
- Statistiques avancées et analytics
- Gestion des devices / geofence (volontairement écartée — l'admin est focalisé sur la conformité, pas sur le contrôle intrusif)

*Ces éléments pourront être intégrés dans une v2 si la solution est déployée en production.*
