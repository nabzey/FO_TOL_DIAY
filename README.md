# FOTOL JAY - Plateforme de Vente de Produits d'Occasion

Application web et mobile pour la vente de produits d'occasion avec photo obligatoire via l'appareil photo.

## 🎯 Caractéristiques Principales

- **Publication sans compte**: Les vendeurs publient leurs produits sans créer de compte
- **Photo obligatoire**: Prise de photo directement via l'appareil (pas d'import galerie)
- **Stockage CDN**: Images hébergées sur Cloudinary pour performance optimale
- **Modération**: Admin et modérateurs valident les publications
- **Consultation publique**: Acheteurs consultent sans connexion
- **Expiration automatique**: Produits expirés après 7 jours
- **Système VIP**: Priorité d'affichage pour certains produits
- **Notifications email**: Vendeurs notifiés par email

## 🏗️ Architecture

### Backend (Node.js + Express + Prisma)
- API REST avec TypeScript
- Base de données MySQL avec Prisma ORM
- Authentification JWT (Admin/Modérateur uniquement)
- Upload d'images vers Cloudinary
- Validation avec express-validator
- Sécurité avec Helmet et CORS
- Tâches automatiques avec node-cron
- Envoi d'emails avec Nodemailer

### Frontend (Angular 20)
- Interface responsive avec TailwindCSS
- Accès caméra pour photos natives
- Composants modulaires avec Angular Signals
- Icônes Lucide Angular
- Validation de formulaires avec Zod
- Gestion d'état réactive
- Tests E2E avec Playwright

## 📋 Prérequis

- Node.js >= 18
- MySQL >= 8
- Angular CLI >= 20
- Compte Cloudinary (gratuit)

## 🚀 Installation

### 1. Clonage du projet

```bash
git clone <repository-url>
cd projet_fotoljay
```

### 2. Backend

```bash
cd back
npm install

# Configuration des variables d'environnement
cp .env.example .env
# Remplir les variables (voir section Variables d'environnement)

# Génération du client Prisma
npm run prisma:generate

# Création de la base de données et migration
npm run prisma:migrate

# Seed (création des comptes admin/modérateur)
npm run prisma:seed

# Démarrage en mode développement
npm run dev
```

### 3. Frontend

```bash
cd front
npm install

# Démarrage du serveur de développement
npm start
# Ou avec Angular CLI
ng serve
```

## 🔑 Comptes par Défaut

Après le seed:
- **Admin**: admin@fotoljay.com / admin123
- **Modérateur**: moderator@fotoljay.com / moderator123

## 📡 API Endpoints

### Authentification (Admin/Modérateur)
- `POST /api/auth/login` - Connexion

### Produits
- `GET /api/products` - Liste des produits approuvés (public)
- `GET /api/products/:id` - Détails d'un produit (public)
- `POST /api/products` - Publier un produit (public, avec photos)
- `GET /api/products/moderation/pending` - Produits en attente (auth requis)
- `POST /api/products/:id/approve` - Approuver un produit (auth requis)
- `POST /api/products/:id/reject` - Rejeter un produit (auth requis)
- `DELETE /api/products/:id` - Supprimer un produit (auth requis)
- `PUT /api/products/:id/vip` - Marquer comme VIP (admin uniquement)

### Utilisateurs
- `GET /api/users` - Liste des utilisateurs (admin uniquement)

### Notifications
- `GET /api/notifications` - Liste des notifications (auth requis)
- `PUT /api/notifications/:id/read` - Marquer comme lu (auth requis)

### Vendeurs
- `POST /api/sellers/auth` - Authentification vendeur
- `GET /api/sellers/products` - Produits du vendeur (auth vendeur)
- `PUT /api/sellers/profile` - Mise à jour profil vendeur (auth vendeur)

## 🖼️ Configuration Cloudinary

1. Créer un compte sur [cloudinary.com](https://cloudinary.com)
2. Récupérer: Cloud Name, API Key, API Secret
3. Remplir dans `.env`:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🗄️ Schéma de Base de Données

### Modèles Principaux

#### User (Utilisateurs authentifiés - Admin/Modérateur)
- id, email, password, firstName, lastName, phone, role, isVip, isActive

#### Product (Produits)
- id, title, description, status, views, isVip, sellerId, photos[], createdAt

#### Photo (Images des produits)
- id, url, publicId, isPrimary, productId

#### Notification (Notifications email)
- id, type, message, userId?, recipientEmail, sent, sentAt

### Énumérations
- UserRole: SELLER, MODERATOR, ADMIN
- ProductStatus: PENDING, APPROVED, REJECTED, EXPIRED
- NotificationType: PRODUCT_APPROVED, PRODUCT_REJECTED, PRODUCT_EXPIRING, PRODUCT_EXPIRED, GENERAL

## 🎨 Composants Frontend

### Pages Principales
- **HomeComponent**: Page d'accueil avec liste des produits et recherche
- **SellComponent**: Espace vendeur (publication, dashboard, profil)
- **LoginComponent**: Connexion administrateur
- **AdminComponent**: Tableau de bord modération
- **SellerAuthComponent**: Authentification vendeur

### Composants Communs
- **NavbarComponent**: Navigation principale
- **NotificationBellComponent**: Notifications en temps réel
- **ThemeSelectorComponent**: Sélecteur de thème
- **ToastComponent**: Messages de notification

## 📱 Fonctionnalités Détaillées

### Pour les Vendeurs
1. **Authentification**: Connexion/inscription simple avec email
2. **Publication**: Formulaire avec prise de photo obligatoire (1-5 photos max)
3. **Dashboard**: Gestion des produits publiés (modifier, supprimer)
4. **Profil**: Mise à jour des informations de contact
5. **Notifications**: Emails de confirmation d'approbation/rejet

### Pour les Acheteurs
1. **Consultation**: Liste des produits approuvés sans connexion
2. **Recherche**: Recherche par titre/description
3. **Détails**: Vue détaillée avec toutes les photos
4. **Contact**: Email et téléphone du vendeur affichés

### Pour les Modérateurs/Admin
1. **Modération**: Approuver/rejeter les produits en attente
2. **Gestion**: Supprimer des produits inappropriés
3. **VIP**: Marquer des produits comme prioritaires
4. **Statistiques**: Vue d'ensemble des produits

## ⏰ Tâches Automatiques

- **Minuit quotidien**: Expiration des produits > 7 jours
- **10h quotidien**: Notification produits expirant dans 24h
- **Envoi d'emails**: Confirmation d'approbation/rejet aux vendeurs

## 🛠️ Technologies Utilisées

### Backend
- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Langage**: TypeScript
- **ORM**: Prisma
- **Base de données**: MySQL
- **Authentification**: JWT (jsonwebtoken)
- **Validation**: express-validator
- **Sécurité**: Helmet, CORS
- **Upload**: Multer
- **CDN**: Cloudinary
- **Email**: Nodemailer
- **Tâches**: node-cron
- **Hashage**: bcrypt

### Frontend
- **Framework**: Angular 20
- **Langage**: TypeScript
- **Styling**: TailwindCSS
- **Icônes**: Lucide Angular
- **Validation**: Zod
- **Tests E2E**: Playwright
- **Build**: Angular CLI

## 📝 Variables d'Environnement

### Backend (.env)
```env
# Base de données
DATABASE_URL=mysql://user:password@localhost:3306/fotoljay

# JWT
JWT_SECRET=your_secret_key

# Serveur
PORT=3000
NODE_ENV=development

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email (optionnel)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASSWORD=your_app_password
```

### Frontend
Aucune variable d'environnement requise - configuration dans les services.

## 🧪 Tests

### Backend
```bash
cd back
npm test  # Si configuré
```

### Frontend
```bash
cd front
npm run test:e2e  # Playwright
```

## 📦 Scripts Disponibles

### Backend
- `npm run dev` - Démarrage en développement
- `npm run build` - Build de production
- `npm start` - Démarrage en production
- `npm run prisma:generate` - Génération client Prisma
- `npm run prisma:migrate` - Migration base de données
- `npm run prisma:seed` - Seed des données
- `npm run prisma:studio` - Interface graphique Prisma

### Frontend
- `npm start` / `ng serve` - Serveur de développement
- `npm run build` / `ng build` - Build de production
- `npm run test` / `ng test` - Tests unitaires
- `npm run test:e2e` - Tests E2E avec Playwright
- `npm run lint` - Linting du code

## 🚀 Déploiement

### Backend
1. Build de production: `npm run build`
2. Configuration des variables d'environnement en production
3. Migration de la base de données
4. Démarrage: `npm start`

### Frontend
1. Build de production: `ng build --configuration production`
2. Déploiement des fichiers dist/ sur un serveur web

## 🔒 Sécurité

- **CORS**: Configuration restrictive des origines autorisées
- **Helmet**: Headers de sécurité HTTP
- **JWT**: Authentification stateless
- **bcrypt**: Hashage des mots de passe
- **Validation**: Sanitisation des entrées utilisateur
- **Rate limiting**: Protection contre les abus (à implémenter)
- **HTTPS**: Recommandé en production

## 📈 Performance

- **CDN Cloudinary**: Images optimisées et distribuées
- **Lazy loading**: Chargement différé des images
- **SSR Angular**: Rendu côté serveur pour le SEO
- **Index DB**: Optimisation des requêtes avec Prisma
- **Cache**: Headers de cache appropriés

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 📄 Licence

MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails.

## 👥 Auteur

FOTOL JAY Team

---

**Note**: Ce projet est une plateforme de marketplace spécialisée dans la vente de produits d'occasion avec un focus sur l'authenticité des photos (prise directe via caméra pour éviter les fraudes).
