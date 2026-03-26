// Définition de la fonction d'appel API avec gestion des sessions et des erreurs.
import {router} from './router_dashboard.js'

// Configuration de l'URL du backend
// Par défaut, utilise l'URL remote (Vercel) pour la production
const API_CONFIG = {
    LOCAL: 'http://localhost:4000',
    REMOTE: 'https://backend-bb-solutions.vercel.app'
};

// Variable pour tracker si on a déjà loggé l'URL
let hasLoggedUrl = false;

// Détecter automatiquement l'environnement ou utiliser celui stocké dans localStorage
// Par défaut, utilise REMOTE (Vercel) même en développement
function getApiBaseUrl() {
    const savedMode = localStorage.getItem('apiMode');
    
    // Si un mode est explicitement défini dans localStorage, l'utiliser
    if (savedMode === 'local') {
        if (!hasLoggedUrl) {
            console.log('🌐 Mode API: LOCAL (http://localhost:4000)');
            hasLoggedUrl = true;
        }
        return API_CONFIG.LOCAL;
    }
    
    // Par défaut, toujours utiliser REMOTE (Vercel)
    if (!hasLoggedUrl) {
        console.log('🌐 Mode API: REMOTE (Vercel)');
        hasLoggedUrl = true;
    }
    return API_CONFIG.REMOTE;
}

// Calculer BASE_URL dynamiquement à chaque appel pour permettre le changement en runtime
export function getBaseUrl() {
    return getApiBaseUrl();
}

// Exporter BASE_URL pour compatibilité (sera recalculé si nécessaire)
export let BASE_URL = getApiBaseUrl();

// Fonction pour obtenir le token depuis localStorage
function getAuthToken() {
    return localStorage.getItem('authToken') || localStorage.getItem('token');
}

export async function api(url, params = {}) {
    // Recalculer BASE_URL à chaque appel pour permettre le changement dynamique
    const baseUrl = getApiBaseUrl();
    
    // Configuration par défaut
    params = Object.assign({
        mode: 'cors', // Permet les requêtes cross-origin
        cache: 'no-cache', // Désactive la mise en cache pour obtenir des données fraîches
    }, params);

    // Configuration des headers
    const headers = {
        'Content-Type': 'application/json',
    };

    // Ajouter le token d'authentification si disponible
    const token = getAuthToken();
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    // Fusionner avec les headers existants
    params.headers = Object.assign(headers, params.headers || {});

    // Convertir le body en JSON si c'est un objet
    if (params.body && typeof params.body === 'object' && !(params.body instanceof FormData)) {
        params.body = JSON.stringify(params.body);
    }

    try {
        const response = await fetch(baseUrl + url, params);

        // Gérer les réponses vides
        let json = {};
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            const text = await response.text();
            if (text) {
                try {
                    json = JSON.parse(text);
                } catch (e) {
                    console.error('Erreur lors du parsing JSON:', e);
                    json = { error: 'Réponse invalide du serveur', raw: text };
                }
            }
        }

        // Gestion des erreurs : si la réponse n'est pas ok, lancer une erreur avec le message approprié
        if (!response.ok) {
            const errorMessage = json.message || json.error || `Erreur ${response.status}: ${response.statusText}`;
            
            // Si erreur 401 (non autorisé), supprimer le token invalide
            if (response.status === 401 ||  response.status === 403 ) {
                localStorage.removeItem('authToken');
                localStorage.removeItem('token');
                localStorage.removeItem('userId');
                
                //Renvoie à la page de log si token mort
                console.log('Token KO renvoie vers /login')
                router.push('/login');
            }
            
            throw new Error(errorMessage);
        }

        // Retourner un objet avec ok et data pour cohérence avec le code existant
        return {
            ok: true,
            status: response.status,
            data: json
        };
    } catch (error) {
        // Si c'est déjà une Error qu'on a lancée, la relancer
        if (error instanceof Error && error.message) {
            throw error;
        }
        
        // Sinon, créer une nouvelle erreur
        throw new Error(error.message || 'Erreur lors de la communication avec le serveur');
    }
}

// Fonction pour changer le mode API (local/remote)
export function setApiMode(mode) {
    if (mode === 'local' || mode === 'remote') {
        localStorage.setItem('apiMode', mode);
        hasLoggedUrl = false; // Réinitialiser pour afficher le nouveau mode
        BASE_URL = getApiBaseUrl(); // Mettre à jour BASE_URL
        console.log(`🔄 Mode API changé: ${mode} (${mode === 'local' ? API_CONFIG.LOCAL : API_CONFIG.REMOTE})`);
    }
}

// Fonction pour obtenir le mode API actuel
export function getApiMode() {
    return localStorage.getItem('apiMode') || 'remote';
}

// Afficher l'URL utilisée au chargement
console.log(`🚀 Frontend BB_user_vue initialisé`);
console.log(`📡 Backend URL: ${getApiBaseUrl()}`);
console.log(`⚙️  Mode API: ${getApiMode()}`);
