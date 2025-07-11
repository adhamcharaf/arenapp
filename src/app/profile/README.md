# Page Profil ARENAPP

## 📋 Vue d'ensemble

La page profil permet aux utilisateurs (comptes et invités) de :
- Consulter leurs informations personnelles
- Voir leurs statistiques d'utilisation
- Gérer leur historique de réservations
- Modifier les paramètres de leur compte

## 🏗️ Architecture

### Composants créés

1. **`page.tsx`** - Page principale avec protection de route
   - Redirige vers `/auth/login` si non connecté
   - Layout responsive avec grille adaptative
   - Gestion des états de chargement

2. **`ProfileInfo.tsx`** - Informations personnelles
   - Affichage adapté selon le type d'auth (compte/invité)
   - Badge coloré pour le type de compte
   - Actions contextuelles (changer mot de passe / créer compte)

3. **`ProfileStats.tsx`** - Statistiques d'utilisation
   - Nombre total de réservations
   - Montant total dépensé (FCFA)
   - Sport préféré
   - Réservations du mois en cours

4. **`BookingHistory.tsx`** - Historique des réservations
   - Liste filtrable par statut
   - Détails complets de chaque réservation
   - Action d'annulation pour réservations actives
   - État vide avec CTA

5. **`AccountSettings.tsx`** - Paramètres du compte
   - Changement de mot de passe (comptes email)
   - Conversion invité → compte complet
   - Déconnexion avec confirmation
   - Suppression du compte (double confirmation)

6. **`BookingHistorySkeleton.tsx`** - État de chargement
   - Skeleton loader pour une meilleure UX

## 🎨 Design

### Couleurs Côte d'Ivoire
- **Vert CI** (`#00B04F`) - Headers, badges compte, boutons
- **Orange CI** (`#FF8500`) - Badges invité, accents, montants

### Layout Mobile-First
- Grille responsive `md:grid-cols-3`
- Cards avec bordures colorées
- Modals pour actions critiques

### États des réservations
- 🟡 **En attente** - Jaune
- 🟢 **Confirmée** - Vert
- 🔴 **Annulée** - Rouge
- ⚫ **Terminée** - Gris
- 🔴 **Absence** - Rouge

## 🔧 Fonctionnalités

### Implémentées ✅
- Protection de route avec redirection
- Affichage dual auth (compte/invité)
- Historique complet avec filtres
- Statistiques calculées en temps réel
- Annulation de réservations
- Modals de confirmation
- Loading states et skeletons
- Design responsive

### À implémenter 🚧
- API changement mot de passe
- API conversion invité → compte
- API suppression compte
- Pagination pour historique
- Export des données

## 📱 Utilisation

```typescript
// La page utilise les hooks existants
const { user, session, loading, signOut } = useAuth()
const { bookings, loading, cancelBooking } = useBookings(user?.id)
```

## 🔐 Sécurité

- Protection de route côté client
- Confirmations pour actions critiques
- Validation email pour suppression compte
- États de chargement pour éviter double-clic

## 🚀 Améliorations futures

1. **Notifications** - Alertes pour actions réussies
2. **Filtres avancés** - Par date, terrain, sport
3. **Export PDF** - Factures et historique
4. **Préférences** - Notifications, langue, thème
5. **QR Code** - Pour réservations confirmées