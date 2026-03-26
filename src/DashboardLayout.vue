<script setup>
import { onMounted, ref } from 'vue';
import { router } from './router_dashboard.js';
import { user, refreshUserData, logout } from './user.js';

const isLoading = ref(true);

// Charger les données utilisateur au montage du composant
onMounted(async () => {
    try {
        await refreshUserData();
    } catch (error) {
        console.error('Erreur lors du chargement des données utilisateur:', error);
    } finally {
        isLoading.value = false;
    }
});

function handleLogout() {
    logout();
    router.push('/login');
}
</script>

<template>
    <section id="page">
        <header>
            <h1>BSolutions</h1>
            <div class="header-right" v-if="!isLoading">
                <div class="profil">
                    <img src="./assets/user_icon.png" height="32" width="32" alt="User Icon" class="user-icon" />
                    <span>Bienvenue,</span>
                    <router-link 
                        class="username" 
                        to="/Dashboard/profil"
                    >
                        {{ user[0]?.name || 'Utilisateur' }}
                    </router-link>
                </div>
            </div>
        </header>
        
        <nav>
            <img src="./assets/bscale_logo_no_background.png" height="80" width="80" alt="Bee Icon" class="bee-icon" />
            
            <div class="nav-head">
                <router-link class="accueil" to="/Dashboard/home">
                    <span class="nav-icon">🏠</span>
                    <span class="nav-text">Accueil</span>
                </router-link>
                
                <router-link class="modules" to="/Dashboard/modules">
                    <span class="nav-icon">🛜</span>
                    <span class="nav-text">Modules</span>
                </router-link>
                
                <router-link class="ruchers" to="/Dashboard/ruchers">
                    <span class="nav-icon">🐝</span>
                    <span class="nav-text">Ruchers</span>
                </router-link>
                
                <router-link class="notes" to="/Dashboard/carnet">
                    <span class="nav-icon">📔</span>
                    <span class="nav-text">Carnet</span>
                </router-link>
            </div>
            
            <div class="nav-footer">
                <button class="logout-btn" @click="handleLogout">
                    <span class="nav-icon">🚪</span>
                    <span class="nav-text">Déconnexion</span>
                </button>
            </div>
        </nav>
        
        <main>
            <router-view></router-view>
        </main>
    </section>
</template>

<style scoped>
.nav-head {
    display: flex;
    flex-direction: column;
    gap: var(--bee-spacing-sm);
    flex: 1;
}

.nav-footer {
    margin-top: auto;
    padding-top: var(--bee-spacing-lg);
    border-top: 1px solid var(--bee-gray-200);
}

.logout-btn {
    display: flex;
    align-items: center;
    gap: var(--bee-spacing-sm);
    padding: var(--bee-spacing-sm) var(--bee-spacing-md);
    width: 100%;
    font-family: inherit;
    font-weight: 500;
    font-size: 15px;
    color: var(--bee-error);
    background: transparent;
    border: none;
    border-radius: var(--bee-radius-md);
    cursor: pointer;
    transition: all var(--bee-transition-normal);
}

.logout-btn:hover {
    background: rgba(244, 67, 54, 0.1);
}

.nav-icon {
    font-size: 18px;
}

.nav-text {
    flex: 1;
}

/* Styles pour les liens de navigation */
nav a {
    display: flex;
    align-items: center;
    gap: var(--bee-spacing-sm);
    padding: var(--bee-spacing-sm) var(--bee-spacing-md);
    font-weight: 500;
    font-size: 15px;
    color: var(--bee-on-surface);
    border-radius: var(--bee-radius-md);
    transition: all var(--bee-transition-normal);
    text-decoration: none;
}

nav a:hover {
    background: var(--bee-gray-100);
    transform: translateX(4px);
}

/* Lien actif */
nav a.router-link-exact-active {
    background: var(--bee-gradient-primary);
    color: white;
    box-shadow: var(--bee-shadow-colored);
    transform: translateX(4px);
}

nav a.router-link-exact-active:hover {
    background: var(--bee-gradient-primary);
    transform: translateX(4px);
}

.header-right {
    display: flex;
    align-items: center;
    gap: var(--bee-spacing-md);
}

.header-logout-btn {
    background: rgba(244, 67, 54, 0.1);
    border: 1px solid rgba(244, 67, 54, 0.3);
    border-radius: var(--bee-radius-md);
    padding: var(--bee-spacing-sm);
    font-size: 18px;
    cursor: pointer;
    transition: all var(--bee-transition-fast);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
}

.header-logout-btn:hover {
    background: rgba(244, 67, 54, 0.2);
    transform: scale(1.1);
}

.header-logout-btn:active {
    transform: scale(0.95);
}

/* Responsive - Navigation en bas sur mobile */
@media (max-width: 768px) {
    .nav-footer {
        display: flex;
        margin-top: var(--bee-spacing-md);
        padding-top: var(--bee-spacing-md);
        border-top: 1px solid var(--bee-gray-200);
    }
    
    nav a,
    .logout-btn {
        flex-direction: column;
        padding: var(--bee-spacing-xs);
        font-size: 11px;
        gap: 2px;
    }
    
    .nav-icon {
        font-size: 20px;
    }
    
    .header-right {
        gap: var(--bee-spacing-sm);
    }
    
    .header-logout-btn {
        width: 32px;
        height: 32px;
        font-size: 16px;
    }
}
</style>
