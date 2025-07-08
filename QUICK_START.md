# 🚀 ARENAPP - Démarrage Rapide

Guide pour configurer et lancer ARENAPP en quelques étapes.

## ⚡ Setup Rapide (5 minutes)

### 1. Installation des dépendances
```bash
npm install
```

### 2. Configuration Supabase

#### Option A: Nouveau projet Supabase
```bash
# Installer Supabase CLI
npm install -g supabase

# Créer un nouveau projet
supabase projects create arenapp --interactive

# Récupérer les clés du projet
supabase projects api-keys --project-ref YOUR_PROJECT_REF
```

#### Option B: Projet existant
1. Aller sur [supabase.com](https://supabase.com)
2. Créer un nouveau projet
3. Récupérer les clés API dans Settings > API

### 3. Variables d'environnement
```bash
# Copier le template
cp .env.local .env.local

# Remplir avec vos clés Supabase
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

# Configuration Wave CI (pour les paiements)
WAVE_CI_API_KEY=your_wave_ci_key
WAVE_CI_API_URL=https://api.wave.com/v1

# URL de l'application
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Appliquer le schéma de base de données
```bash
# Appliquer les migrations
supabase db push

# Optionnel: Charger les données de test
supabase db reset --with-seed
```

### 5. Lancer l'application
```bash
npm run dev
```

🎉 **Application disponible sur http://localhost:3000**

---

## 🔧 Configuration Avancée

### Configuration Wave CI (Paiements Mobile Money)

1. **Créer un compte Wave CI**
   - Aller sur [Wave CI Developer](https://wave.com/ci/developers)
   - Créer un compte développeur
   - Récupérer les clés API

2. **Configurer les webhooks**
   - URL de callback: `YOUR_DOMAIN/api/payments/wave/callback`
   - Méthode: POST
   - Format: JSON

3. **Tester les paiements**
   ```bash
   # Utiliser les numéros de test Wave CI
   # +225 01 23 45 67 89 (succès)
   # +225 01 23 45 67 90 (échec)
   ```

### Configuration Admin

1. **Créer un utilisateur admin**
   ```sql
   -- Via Supabase SQL Editor
   UPDATE auth.users 
   SET raw_user_meta_data = jsonb_set(
     COALESCE(raw_user_meta_data, '{}'), 
     '{role}', 
     '"admin"'
   ) 
   WHERE email = 'admin@arenapp.ci';
   ```

2. **Ou via l'interface**
   - Créer un compte normalement
   - Modifier dans Supabase Dashboard > Authentication
   - Ajouter `{"role": "admin"}` dans user_metadata

---

## 📱 Tests Rapides

### 1. Test Authentification Dual
```bash
# Compte email/password
curl -X POST http://localhost:3000/api/auth/dual \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "password123"}'

# Invité par téléphone
curl -X POST http://localhost:3000/api/auth/dual \
  -H "Content-Type: application/json" \
  -d '{"phone": "+2250123456789"}'
```

### 2. Test Création Réservation
```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "venue_id": "VENUE_ID",
    "time_slot_id": "SLOT_ID", 
    "phone_number": "+2250123456789",
    "notes": "Test booking"
  }'
```

### 3. Test Paiement Wave CI
```bash
curl -X POST http://localhost:3000/api/payments/wave \
  -H "Content-Type: application/json" \
  -d '{
    "booking_id": "BOOKING_ID",
    "provider": "wave",
    "amount": 15000,
    "phone_number": "+2250123456789"
  }'
```

---

## 🚀 Déploiement Production

### Vercel (Recommandé)
```bash
# Installer Vercel CLI
npm install -g vercel

# Déployer
vercel

# Configurer les variables d'environnement
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add WAVE_CI_API_KEY

# Redéployer avec les variables
vercel --prod
```

### Variables Production à configurer
- ✅ `NEXT_PUBLIC_SUPABASE_URL`
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` 
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
- ✅ `WAVE_CI_API_KEY`
- ✅ `WAVE_CI_API_URL`
- ✅ `NEXT_PUBLIC_APP_URL` (URL de production)

---

## 🛠️ Commandes Utiles

```bash
# Développement
npm run dev              # Lancer en mode dev
npm run build           # Build production
npm run lint            # Vérifier le code
npm run typecheck       # Vérifier TypeScript

# Base de données
npm run db:migrate      # Appliquer migrations
npm run db:seed         # Charger données de test
npm run db:types        # Générer types TypeScript

# Tests
npm run test            # Lancer les tests
npm run test:watch      # Tests en mode watch
```

---

## 🆘 Dépannage

### Erreur: "Supabase URL not found"
- Vérifier `.env.local` est bien configuré
- Redémarrer le serveur de dev

### Erreur: "Database connection failed"
- Vérifier les clés Supabase
- S'assurer que les migrations sont appliquées

### Erreur: "Wave CI API failed"
- Vérifier les clés Wave CI
- Utiliser les numéros de test en dev

### Erreur: "RLS policy denied"
- Vérifier que l'utilisateur a les bonnes permissions
- Créer un admin si nécessaire

---

**🎯 Prêt à développer ARENAPP !**