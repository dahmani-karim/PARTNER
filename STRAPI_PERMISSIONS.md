# Configuration des permissions Strapi — Programme PARTNER

## Prérequis

1. Se connecter à l'admin Strapi : `https://smartcellarapi.lacavernedurefractaire.fr/admin`
2. Aller dans **Settings → Users & Permissions Plugin → Roles**

---

## Rôle : Authenticated

### partner-application
| Route | Méthode | Permission |
|---|---|---|
| `/api/partner-applications/apply` | POST | ✅ |
| `/api/partner-applications/me` | GET | ✅ |
| `/api/partner-applications/all` | GET | ❌ (admin only) |
| `/api/partner-applications/:id/review` | PUT | ❌ (admin only) |

### partner
| Route | Méthode | Permission |
|---|---|---|
| `/api/partners/me` | GET | ✅ |
| `/api/partners/stats` | GET | ❌ (admin only) |
| `/api/partners/all` | GET | ❌ (admin only) |
| `/api/partners/:id/status` | PUT | ❌ (admin only) |

### video-submission
| Route | Méthode | Permission |
|---|---|---|
| `/api/video-submissions/submit` | POST | ✅ |
| `/api/video-submissions/mine` | GET | ✅ |
| `/api/video-submissions/weekly-count` | GET | ✅ |
| `/api/video-submissions/all` | GET | ❌ (admin only) |
| `/api/video-submissions/:id/validate` | PUT | ❌ (admin only) |

### partner-config
| Route | Méthode | Permission |
|---|---|---|
| `/api/partner-configs` | GET | ✅ |

---

## Routes Admin (protégées côté controller)

Les routes marquées **admin only** ci-dessus doivent quand même être cochées ✅ dans Strapi pour le rôle **Authenticated**, car la vérification se fait côté controller via `ctx.state.user.partnerAdmin`.

**Alternative** : créer un rôle Strapi dédié `PartnerAdmin` et assigner ces routes uniquement à ce rôle. L'approche actuelle (vérification dans le controller) est plus simple pour le MVP.

### Résumé des permissions Authenticated à activer

Cocher **toutes** les routes custom suivantes dans le panneau Strapi :

- **partner-application** : `apply`, `myApplication` (custom routes)
- **partner** : `me` (custom route)
- **video-submission** : `submit`, `myVideos`, `weeklyCount` (custom routes)
- **partner-config** : `find` (route CRUD par défaut)

Pour les routes admin (`all`, `review`, `stats`, `status`, `validate`) :
- **Option A (MVP)** : Les activer aussi pour Authenticated — la sécurité est gérée dans les controllers
- **Option B (recommandée long terme)** : Créer un rôle `PartnerAdmin` dans Strapi

---

## Champ utilisateur à configurer

1. Aller dans **Content-Type Builder → User**
2. Vérifier que le champ `partnerAdmin` (boolean, default: false) existe
3. Pour promouvoir un admin : **Content Manager → Users → [utilisateur] → partnerAdmin: true**

---

## Créer la config initiale

1. Aller dans **Content Manager → Partner Config**
2. Créer une entrée :
   - `maxPartnersPerApp`: 2
   - `weeklyVideoQuota`: 2
   - `warningThreshold`: 2
   - `rules`: (texte des règles du programme)
   - `welcomeMessage`: (message de bienvenue pour les nouveaux partners)
