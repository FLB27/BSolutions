<script setup>
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { logout } from '../user.js';

const router = useRouter();

onMounted(() => {
    // Effectuer la déconnexion
    logout();
    
    // Rediriger vers la page de login après un court délai
    setTimeout(() => {
        router.push('/login');
    }, 1500);
});
</script>

<template>
    <div class="logout-container">
        <div class="logout-card">
            <div class="logout-icon">👋</div>
            <h2>Déconnexion en cours...</h2>
            <p>À bientôt !</p>
            <div class="loader"></div>
        </div>
    </div>
</template>

<style scoped>
.logout-container {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 100%;
    padding: var(--bee-spacing-xl);
}

.logout-card {
    text-align: center;
    padding: var(--bee-spacing-xxl);
    background: var(--bee-gradient-card);
    border-radius: var(--bee-radius-xl);
    box-shadow: var(--bee-shadow-lg);
}

.logout-icon {
    font-size: 64px;
    margin-bottom: var(--bee-spacing-lg);
    animation: wave 1s ease-in-out infinite;
}

@keyframes wave {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(20deg); }
    75% { transform: rotate(-20deg); }
}

h2 {
    font-size: 24px;
    color: var(--bee-on-surface);
    margin: 0 0 var(--bee-spacing-sm);
}

p {
    font-size: 16px;
    color: var(--bee-on-surface-variant);
    margin: 0 0 var(--bee-spacing-lg);
}

.loader {
    width: 40px;
    height: 40px;
    border: 4px solid var(--bee-gray-200);
    border-top-color: var(--bee-honey);
    border-radius: 50%;
    margin: 0 auto;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
</style>
