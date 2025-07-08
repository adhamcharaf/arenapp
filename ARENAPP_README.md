# ARENAPP - Système de Réservation Sportive Côte d'Ivoire

Application de réservation de sessions de padel et football avec paiement mobile money intégré.

## 🚀 Fonctionnalités

### Phase 1 - Infrastructure Complète
- ✅ **Authentification Dual** : Comptes email/password ou réservation invité par téléphone
- ✅ **Réservation de Créneaux** : Padel et football avec gestion temps réel
- ✅ **Paiement Mobile Money** : Wave CI (prioritaire), Orange Money, MTN Mobile Money
- ✅ **Tracking No-Shows** : Collecte de données pour gestion manuelle
- ✅ **Interface Admin** : Gestion terrains et réservations
- ✅ **Sécurité Fintech** : RLS policies, audit logs, validation stricte

## 🛠️ Stack Technique

- **Frontend** : Next.js 15 + TypeScript + Tailwind CSS
- **Backend** : Next.js API Routes + Supabase PostgreSQL
- **Auth** : Supabase Auth (dual system)
- **Paiements** : APIs Mobile Money Côte d'Ivoire
- **Déploiement** : Vercel

## 📦 Installation

### Prérequis
- Node.js 18+
- npm ou yarn
- Compte Supabase
- Clés API Wave CI

### Configuration

1. **Cloner et installer**
```bash
git clone <repository>
cd arenapp
npm install
```

2. **Variables d'environnement**
```bash
cp .env.local.example .env.local
```

Configurer dans `.env.local` :
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Wave CI
WAVE_CI_API_KEY=your_wave_ci_api_key
WAVE_CI_API_URL=https://api.wave.com/v1

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
TIMEZONE=Africa/Abidjan
```

3. **Base de données**
```bash
# Appliquer les migrations
npx supabase db push

# Seed data (optionnel)
npx supabase db reset --with-seed
```

4. **Démarrer l'application**
```bash
npm run dev
```

## 🗄️ Schéma Base de Données

### Tables Principales

#### `users` - Authentification Dual
```sql
- id: UUID (PK)
- email: TEXT (unique, nullable)
- phone: TEXT (unique, nullable) 
- auth_type: ENUM('account', 'guest')
- created_at: TIMESTAMP
```

#### `venues` - Terrains avec Sports
```sql
- id: UUID (PK)
- name: TEXT
- sport_type: ENUM('padel', 'football')
- location: TEXT
- price_per_hour: DECIMAL
- is_active: BOOLEAN
```

#### `time_slots` - Créneaux Horaires
```sql
- id: UUID (PK)
- venue_id: UUID (FK)
- start_time: TIMESTAMP
- end_time: TIMESTAMP
- is_available: BOOLEAN
```

#### `bookings` - Réservations
```sql
- id: UUID (PK)
- user_id: UUID (FK)
- venue_id: UUID (FK)
- time_slot_id: UUID (FK)
- status: ENUM('pending', 'confirmed', 'cancelled', 'completed', 'no_show')
- phone_number: TEXT
- total_amount: DECIMAL
```

#### `payments` - Paiements Mobile Money
```sql
- id: UUID (PK)
- booking_id: UUID (FK)
- provider: ENUM('wave', 'orange', 'mtn')
- amount: DECIMAL
- status: ENUM('pending', 'completed', 'failed', 'refunded')
- transaction_id: TEXT
```

## 🔒 Sécurité RLS

### Politiques par Rôle
- **Admin** : Accès complet toutes tables
- **Utilisateur Authentifié** : Accès ses propres données
- **Invité** : Accès limité pour réservations

### Fonctions Utilitaires
- `is_admin()` : Vérification rôle admin
- `is_time_slot_available()` : Validation disponibilité
- `get_no_show_stats()` : Statistiques utilisateur

## 📱 API Endpoints

### Authentification
- `POST /api/auth/dual` : Connexion email/password ou téléphone
- `GET /api/auth/dual` : Statut authentification

### Réservations
- `GET /api/bookings` : Liste réservations
- `POST /api/bookings` : Créer réservation
- `PUT /api/bookings` : Modifier réservation

### Paiements Wave CI
- `POST /api/payments/wave` : Initier paiement
- `GET /api/payments/wave` : Vérifier statut
- `POST /api/payments/wave/callback` : Webhook Wave CI

## 🌍 Spécificités Côte d'Ivoire

### Formats Locaux
- **Timezone** : Africa/Abidjan
- **Devise** : FCFA (XOF)
- **Téléphone** : Format +225XXXXXXXX

### Mobile Money Intégré
1. **Wave CI** (Priorité) - API REST moderne
2. **Orange Money** (Phase 2) - API complexe
3. **MTN Mobile Money** (Phase 3) - Legacy SOAP

## 🧪 Tests

```bash
# Tests unitaires
npm run test

# Tests d'intégration
npm run test:integration

# Validation sécurité RLS
npm run test:security
```

## 🚀 Déploiement

### Vercel (Recommandé)
```bash
# Connecter à Vercel
npx vercel

# Configurer variables environnement
npx vercel env add NEXT_PUBLIC_SUPABASE_URL
npx vercel env add WAVE_CI_API_KEY
# ... autres variables

# Déployer
npx vercel --prod
```

### Variables Production Requises
- Toutes les variables `.env.local`
- URL de production pour callbacks Wave CI
- Clés API production

## 📚 Documentation Technique

### Hooks Personnalisés
- `useAuth()` : Gestion authentification dual
- `useBookings()` : CRUD réservations
- `usePayments()` : Intégrations paiement

### Validation
- Schémas Zod pour tous formulaires
- Validation téléphones ivoiriens
- Contraintes métier appliquées

### Performance
- Index optimisés pour requêtes fréquentes
- Cache stratégique
- Optimisation mobile-first

## 🛡️ Audit & Conformité

### Trail de Sécurité
- Audit automatique toutes actions sensibles
- Logs détaillés paiements
- Tracking modifications réservations

### Monitoring
- Logs erreurs centralisés
- Métriques performance
- Alertes paiements échoués

## 📞 Support

### Développement
- Issues GitHub pour bugs
- Documentation inline complète
- Scripts de migration versionnés

### Production
- Monitoring 24/7
- Backup automatique base de données
- Plan de rollback

---

## 🎯 Roadmap Phase 2

- [ ] Interface admin avancée
- [ ] Intégration Orange Money
- [ ] Notifications SMS
- [ ] Exports analytics
- [ ] Application mobile

---

**ARENAPP** - Réservation sportive nouvelle génération pour la Côte d'Ivoire 🇨🇮