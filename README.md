# ZoumAI - Fleet Management System

Une plateforme complète de gestion de flotte développée avec Next.js 14, TypeScript, Prisma, et des cartes interactives.

## 🚀 Fonctionnalités

### Interface Chauffeur
- **Tableau de bord** : Vue d'ensemble des trajets assignés et alertes
- **Gestion des trajets** : Liste des trajets avec statuts et détails
- **Checklist de départ** : Validation des 4 points de contrôle obligatoires
- **Suivi en temps réel** : Visualisation des positions des véhicules
- **Alertes** : Notifications en temps réel pour le véhicule assigné

### Interface Gestionnaire
- **Dashboard KPI** : Statistiques de la flotte avec graphiques interactifs
- **Planification** : Création et assignation de trajets
- **Gestion de flotte** : Vue interactive et liste des véhicules
- **Maintenance** : Création et suivi des tickets de maintenance
- **Alertes** : Gestion centralisée de toutes les alertes

### Fonctionnalités Temps Réel
- **Télémétrie** : Simulation de données GPS, vitesse, carburant
- **Alertes automatiques** : Génération d'alertes basées sur les conditions
- **Suivi des positions** : Mise à jour automatique des positions véhicules
- **Notifications** : Système d'alertes en temps réel

## 🛠️ Technologies

- **Frontend** : Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend** : Next.js API Routes, Prisma ORM
- **Base de données** : PostgreSQL
- **Authentification** : NextAuth.js
- **État** : TanStack Query
- **Graphiques** : Recharts

## 📦 Installation

### Prérequis
- Node.js 18+
- PostgreSQL

### Variables d'environnement

Créez un fichier `.env.local` avec les variables suivantes :

\`\`\`env
# Base de données (OBLIGATOIRE)
DATABASE_URL="postgresql://username:password@localhost:5432/zoumai_db"

# NextAuth (OBLIGATOIRE - seul NEXTAUTH_SECRET est requis)
# NEXTAUTH_URL="http://localhost:3000"  # Optionnel - défaut automatique
NEXTAUTH_SECRET="your-nextauth-secret-key-minimum-32-characters"
\`\`\`

**⚠️ Variables critiques :**
- `DATABASE_URL` : URL complète de votre base PostgreSQL
- `NEXTAUTH_SECRET` : Doit faire au moins 32 caractères. Générez-en un avec : `openssl rand -base64 32`

**📍 Variables optionnelles :**
- `NEXTAUTH_URL` : Défaut automatique `http://localhost:3000` en développement

### Installation et démarrage

\`\`\`bash
# Installation des dépendances
npm install

# Configuration de la base de données
npx prisma db push

# Seed de la base avec des données de test
npm run db:seed

# Démarrage en développement
npm run dev
\`\`\`

## 👥 Comptes de démonstration

Après le seed, vous pouvez utiliser ces comptes :

**Gestionnaire :**
- Email : `manager@zoumai.com`
- Mot de passe : `password123`

**Chauffeurs :**
- Email : `driver1@zoumai.com` / `driver2@zoumai.com`
- Mot de passe : `password123`

## 🔧 Dépannage

### Erreur NextAuth CLIENT_FETCH_ERROR

**✅ Solution rapide :**
Cette erreur est maintenant automatiquement corrigée ! L'application configure automatiquement NEXTAUTH_URL en développement.

Si vous rencontrez encore cette erreur :

1. **Vérifiez uniquement NEXTAUTH_SECRET** :
   \`\`\`bash
   # Seule cette variable est obligatoire
   echo $NEXTAUTH_SECRET
   \`\`\`

2. **Générez un secret si nécessaire** :
   \`\`\`bash
   # Générez un nouveau secret
   openssl rand -base64 32
   \`\`\`

3. **Redémarrez le serveur** après avoir ajouté le secret :
   \`\`\`bash
   npm run dev
   \`\`\`

### Erreur de police Geist

Les polices sont gérées automatiquement via le package `geist`. Si vous voyez des erreurs :

1. **Réinstallez les dépendances** :
   \`\`\`bash
   rm -rf node_modules package-lock.json
   npm install
   \`\`\`

2. **Vérifiez la configuration** dans `app/layout.tsx`

## 🎯 Utilisation

### Pour les chauffeurs
1. Connectez-vous avec un compte chauffeur
2. Consultez vos trajets assignés
3. Cliquez sur un trajet pour voir les détails
4. Validez la checklist de départ (4 éléments)
5. Démarrez le trajet pour accéder au suivi temps réel

### Pour les gestionnaires
1. Connectez-vous avec le compte gestionnaire
2. Consultez le dashboard avec les KPI
3. Créez de nouveaux trajets dans l'onglet "Trajets"
4. Surveillez la flotte sur la vue interactive
5. Gérez la maintenance et les alertes

## 🔧 Scripts utiles

\`\`\`bash
# Simulation de télémétrie (génère des positions et alertes)
npm run db:seed && node scripts/simulate-telemetry.ts

# Génération d'alertes de test
node scripts/generate-alerts.ts

# Reset complet de la base
npx prisma db push --force-reset && npm run db:seed

# Génération d'un secret NextAuth
openssl rand -base64 32
\`\`\`

## 📊 Structure de la base de données

- **Users** : Chauffeurs et gestionnaires
- **Vehicles** : Flotte de véhicules avec positions
- **Trips** : Trajets avec statuts et assignations
- **ChecklistItemTemplate** : Modèles de checklist
- **TripChecklistItem** : Items de checklist par trajet
- **Telemetry** : Données de télémétrie (GPS, vitesse, carburant)
- **Alert** : Alertes système et maintenance
- **MaintenanceTicket** : Tickets de maintenance

## 🚀 Déploiement

L'application est prête pour le déploiement sur Vercel :

1. Connectez votre repository GitHub
2. Configurez les variables d'environnement dans Vercel
3. **Important** : Mettez à jour `NEXTAUTH_URL` avec votre domaine de production
4. Déployez automatiquement

### Variables d'environnement Vercel

\`\`\`env
DATABASE_URL=postgresql://...
NEXTAUTH_URL=https://votre-domaine.vercel.app
NEXTAUTH_SECRET=votre-secret-32-caracteres
\`\`\`

## 📝 Licence

MIT License - voir le fichier LICENSE pour plus de détails.
