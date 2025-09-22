# 🚀 Guide de Démarrage Rapide - ZoumAI

## Installation en 5 minutes

### 1. Cloner et installer
\`\`\`bash
git clone <votre-repo>
cd zoumai-fleet-management
npm install
\`\`\`

### 2. Configuration des variables d'environnement
\`\`\`bash
# Copiez le fichier d'exemple
cp .env.example .env.local

# Éditez .env.local avec vos valeurs
nano .env.local
\`\`\`

**Variables minimales requises :**
\`\`\`env
DATABASE_URL="postgresql://user:password@localhost:5432/zoumai_db"
# NEXTAUTH_URL="http://localhost:3000"  # Optionnel - défaut automatique
NEXTAUTH_SECRET="$(openssl rand -base64 32)"
\`\`\`

### 3. Base de données
\`\`\`bash
# Créer la base et les tables
npx prisma db push

# Ajouter les données de test
npm run db:seed
\`\`\`

### 4. Démarrer l'application
\`\`\`bash
npm run dev
\`\`\`

🎉 **C'est prêt !** Ouvrez http://localhost:3000

## 🔑 Comptes de test

**Gestionnaire :**
- Email: `manager@zoumai.com`
- Mot de passe: `password123`

**Chauffeur :**
- Email: `driver1@zoumai.com`
- Mot de passe: `password123`

## 🔧 Commandes utiles

\`\`\`bash
# Simuler des données de télémétrie
npm run db:simulate

# Générer des alertes de test
npm run db:alerts

# Reset complet de la base
npx prisma db push --force-reset && npm run db:seed
\`\`\`

## 🚨 Problèmes courants

**Erreur NextAuth :** Vérifiez que `NEXTAUTH_SECRET` fait au moins 32 caractères
**Erreur DB :** Vérifiez que PostgreSQL est démarré et `DATABASE_URL` est correct
