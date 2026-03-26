import { api } from './API.js';
import { ref } from 'vue';

// Variables réactives pour l'utilisateur
export const user = ref([{ name: 'Utilisateur', role: 'utilisateur' }]);
export const authToken = ref(null);
export const userId = ref(null);

// Initialiser depuis localStorage si disponible
if (typeof window !== 'undefined') {
    const storedToken = localStorage.getItem('authToken') || localStorage.getItem('token');
    const storedUserId = localStorage.getItem('userId');
    
    if (storedToken) {
        authToken.value = storedToken;
    }
    if (storedUserId) {
        userId.value = storedUserId;
    }
}

// Fonction pour obtenir les données utilisateur depuis le backend
async function obtain_user_data() {
    try {
        // Si on a un token, récupérer les infos utilisateur
        if (authToken.value) {
            const result = await api('/users/profile/me', {
                method: 'GET',
            });
            
            if (result.ok && result.data && result.data.user) {
                const userData = result.data.user;
                // Formater les données pour correspondre au format attendu
                return [{
                    name: `${userData.prenom || ''} ${userData.nom || ''}`.trim() || userData.email || 'Utilisateur',
                    email: userData.email,
                    role: userData.role || 'utilisateur',
                    ...userData
                }];
            }
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur:', error);
    }
    
    // Retourner des données par défaut si erreur
    return [{ name: 'Utilisateur', role: 'utilisateur' }];
}

// Fonction pour mettre à jour les données utilisateur
export async function refreshUserData() {
    try {
        const userData = await obtain_user_data();
        user.value = userData;
        return userData;
    } catch (error) {
        console.error('Erreur lors du rafraîchissement des données utilisateur:', error);
        return user.value;
    }
}


export async function user_available(email, password) {
    try {
        const result = await api('/auth/login', {
            method: 'POST',
            body: { email, password },
        });

        if (result.ok && result.data.token) {
            authToken.value = result.data.token;
            userId.value = result.data.userId;
            
            console.log('🔐 Token d\'authentification reçu:', authToken.value);
            console.log('👤 ID utilisateur reçu:', userId.value);
            
            // Stocker dans localStorage
            localStorage.setItem('authToken', authToken.value);
            localStorage.setItem('token', authToken.value); // Compatibilité
            if (userId.value) {
                localStorage.setItem('userId', userId.value);
            }
            
            // Mettre à jour les données utilisateur
            await refreshUserData();
            
            console.log('✅ Connexion réussie!');
            return true;
        } else {
            const errorMsg = result.data?.message || 'Erreur de connexion';
            console.error(`❌ ${errorMsg}`);
            return false;
        }
    } catch (error) {
        console.error('❌ Erreur de connexion:', error.message);
        return false;
    }
}

// Fonction pour déconnecter l'utilisateur
export function logout() {
    authToken.value = null;
    userId.value = null;
    user.value = [{ name: 'Utilisateur', role: 'utilisateur' }];
    
    localStorage.removeItem('authToken');
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    
    console.log('👋 Déconnexion réussie');
}

