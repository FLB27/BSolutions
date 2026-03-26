# BB User Vue - Frontend Utilisateur

Frontend Vue.js pour l'application BBSolutions, permettant aux utilisateurs de gérer leurs ruches, modules et ruchers.

## 🚀 Démarrage rapide

### Prérequis

- Node.js (v16 ou supérieur)
- npm ou yarn
- Backend BBSolutions en cours d'exécution (port 4000 par défaut)

### Installation

```bash
# Installer les dépendances
npm install
```

### Configuration

Le frontend est configuré pour se connecter au backend remote sur Vercel par défaut.

**URL du backend par défaut :** `https://backend-bb-solutions.vercel.app`

Pour utiliser le backend local en développement :

1. **Via la console du navigateur** (recommandé) :
   ```javascript
   // Dans la console du navigateur (F12)
   localStorage.setItem('apiMode', 'local'); // Pour utiliser localhost:4000
   localStorage.setItem('apiMode', 'remote'); // Pour revenir à Vercel
   location.reload(); // Recharger la page pour appliquer le changement
   ```

2. **Via le code** :
   - Ouvrir `src/API.js`
   - Modifier la fonction `getApiBaseUrl()` si nécessaire

### Lancer le serveur de développement

```bash
npm run dev
```

Le frontend sera accessible sur `http://localhost:5173`

## 📁 Structure du projet

```
BB_user_vue/
├── src/
│   ├── API.js              # Configuration et fonctions d'appel API
│   ├── user.js             # Gestion de l'authentification utilisateur
│   ├── router_dashboard.js # Configuration des routes
│   ├── main.js             # Point d'entrée de l'application
│   ├── App.vue             # Composant racine
│   ├── DashboardLayout.vue # Layout principal avec navigation
│   ├── components/         # Composants Vue
│   │   ├── Login.vue       # Page de connexion
│   │   ├── Home.vue         # Page d'accueil
│   │   ├── Modules.vue      # Liste des modules
│   │   ├── Module.vue       # Détails d'un module
│   │   ├── Ruchers.vue      # Liste des ruchers
│   │   ├── Profile.vue      # Profil utilisateur
│   │   └── ...
│   └── assets/             # Ressources statiques
└── vite.config.js          # Configuration Vite
```

## 🔐 Authentification

L'application utilise JWT pour l'authentification :

1. **Connexion** : L'utilisateur se connecte via `/login`
2. **Token** : Le token est stocké dans `localStorage` sous les clés `authToken` et `token`
3. **Requêtes** : Le token est automatiquement ajouté dans les headers `Authorization: Bearer <token>`
4. **Protection des routes** : Les routes `/Dashboard/*` nécessitent une authentification

## 🔌 Connexion au Backend

### Routes API utilisées

- `POST /auth/login` - Connexion utilisateur
- `GET /users/profile/me` - Récupération du profil utilisateur
- `GET /devices/modules/user` - Liste des modules de l'utilisateur
- `GET /data/modules/:moduleId/measurements` - Mesures d'un module
- `GET /ruchers` - Liste des ruchers
- Et autres routes selon les composants

### Configuration CORS

Le backend doit autoriser les requêtes depuis :
- `http://localhost:5173` (développement)
- Les domaines Vercel (production)

Le backend est déjà configuré pour accepter ces origines.

## 🛠️ Développement

### Commandes disponibles

```bash
# Démarrer le serveur de développement
npm run dev

# Build pour la production
npm run build

# Prévisualiser le build de production
npm run preview
```

### Variables d'environnement

Pour utiliser des variables d'environnement, créer un fichier `.env` :

```env
VITE_API_URL=http://localhost:4000
```

Puis utiliser `import.meta.env.VITE_API_URL` dans le code.

## 📝 Notes

- Le frontend utilise Vue 3 avec Composition API
- Le routing est géré par Vue Router
- Les graphiques utilisent ApexCharts (via vue3-apexcharts)
- Les cartes utilisent Leaflet
- Firebase est configuré pour l'authentification Google (optionnel)

## 🐛 Dépannage

### Erreur CORS

Si vous rencontrez des erreurs CORS :
1. Vérifier que le backend est en cours d'exécution
2. Vérifier que le backend autorise l'origine du frontend
3. Utiliser le proxy Vite configuré dans `vite.config.js`

### Token invalide

Si le token est invalide ou expiré :
1. Se déconnecter et se reconnecter
2. Vérifier que le token est bien stocké dans `localStorage`
3. Vérifier les logs du backend pour les erreurs d'authentification

### Erreur de connexion

Si la connexion échoue :
1. Vérifier que le backend est accessible
2. Vérifier l'URL dans `src/API.js`
3. Vérifier les logs de la console du navigateur





outer.get('/gateways/user', verifyToken, async (req, res) => {
    try {
        const userId = req.user.utilisateurId;
        const gateways = await Gateway.find({ utilisateurId: userId });
        
        // Enrichir chaque gateway avec ses modules et lastMeasurement
        const gatewaysEnriched = await Promise.all(gateways.map(async (gateway) => {
            const gatewayObj = gateway.toObject();
            
            // Récupérer les modules de cette gateway
            const modules = await Module.find({ gatewayId: gateway._id, utilisateurId: userId });
            
            // Enrichir chaque module avec lastMeasurement
            const modulesEnriched = await Promise.all(modules.map(async (module) => {
                const moduleObj = module.toObject();
                const lastMeasurement = await getLastMeasurement(module._id);
                return {
                    _id: moduleObj._id,
                    name: moduleObj.name,
                    type: moduleObj.type,
                    status: await isModuleActive(module._id) ? 'active' : 'inactive',
                    lastMeasurement: lastMeasurement
                };
            }));
            
            // Récupérer la dernière mesure globale de la gateway (depuis ses modules)
            let gatewayLastMeasurement = null;
            if (modules.length > 0) {
                // Prendre la dernière mesure parmi tous les modules
                const allLastMeasurements = await Promise.all(
                    modules.map(m => getLastMeasurement(m._id))
                );
                const validMeasurements = allLastMeasurements.filter(m => m !== null);
                if (validMeasurements.length > 0) {
                    gatewayLastMeasurement = validMeasurements.sort((a, b) => 
                        new Date(b.timestamp) - new Date(a.timestamp)
                    )[0];
                }
            }
            
            return {
                _id: gatewayObj._id,
                nom: gatewayObj.nom,
                location: gatewayObj.location,
                status: gatewayObj.status,
                current_rucherId: gatewayObj.current_rucherId || null,
                modules: modulesEnriched,
                lastMeasurement: gatewayLastMeasurement
            };
        }));
        
        res.status(200).json({ gateways: gatewaysEnriched });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Erreur du serveur' });
    }
});
