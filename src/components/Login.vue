<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { user_available } from '../user';
import { BeeColors, BeeGradients } from '../theme.js';
import ModernButton from './ui/ModernButton.vue';
import ModernInput from './ui/ModernInput.vue';

const router = useRouter();
const email = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMessage = ref('');
const appVersion = ref('v2.0'); // Version par défaut


async function handleLogin() {
    if (!email.value || !password.value) {
        errorMessage.value = 'Veuillez remplir tous les champs';
        return;
    }
    
    isLoading.value = true;
    errorMessage.value = '';
    
    try {
        const isAvailable = await user_available(email.value, password.value);
        
        if (isAvailable) {
            router.push('/Dashboard/home');
        } else {
            errorMessage.value = 'Email ou mot de passe incorrect';
        }
    } catch (error) {
        console.error('Erreur lors de la connexion:', error);
        errorMessage.value = error.message || 'Erreur de connexion';
    } finally {
        isLoading.value = false;
    }
}

async function fetchLatestVersion() {
  // Vérifie le cache
  const cachedVersion = localStorage.getItem('app_version');
  const cachedTime = localStorage.getItem('app_version_time');
  const oneHour = 60 * 60 * 1000; // 1 heure en millisecondes

  // Si la version est en cache et < 1h, retourne-la
  if (cachedVersion && cachedTime && (Date.now() - cachedTime < oneHour)) {
    return cachedVersion;
  }

  // Sinon, récupère depuis GitHub
  try {
    const response = await fetch(
        'https://api.github.com/repos/FLB27/BBSolutions_users_website/releases/latest',
    );
    
    const data = await response.json();
    
    // Sauvegarde en cache
    console.log('Tag:',data.tag_name)
    localStorage.setItem('app_version', data.tag_name);
    localStorage.setItem('app_version_time', Date.now());
    
    return data.tag_name;
  } catch (error) {
    console.error('Erreur récupération version:', error);
    return cachedVersion || 'v2.0'; // Fallback vers le cache ou v2.0
  }
}

onMounted(async () => {
  appVersion.value = await fetchLatestVersion();
  console.log('Version récupérée:', appVersion.value); // Debug

});

</script>

<template>
    <div class="login-container">
        <!-- Cercles décoratifs flottants -->
        <div class="decorative-circles">
            <div class="circle circle-1"></div>
            <div class="circle circle-2"></div>
            <div class="circle circle-3"></div>
            <div class="circle circle-4"></div>
        </div>
        
        <div class="login-card">
            <!-- Logo et titre -->
            <div class="login-header">
                <div class="logo-container">
                    <img src="../assets/bscale_logo_no_background.png" alt="BEE Logo" class="logo" />
                </div>
                <h1 class="title">BSolutions</h1>
                <p class="subtitle">Connectez-vous à votre compte</p>
            </div>
            
            <!-- Formulaire -->
            <form class="login-form" @submit.prevent="handleLogin">
                <ModernInput
                    v-model="email"
                    type="email"
                    label="Email"
                    placeholder="Entrez votre email"
                    icon="📧"
                    :error="errorMessage && !email ? 'Email requis' : ''"
                />
                
                <ModernInput
                    v-model="password"
                    type="password"
                    label="Mot de passe"
                    placeholder="Entrez votre mot de passe"
                    icon="🔒"
                    :error="errorMessage && !password ? 'Mot de passe requis' : ''"
                />
                
                <!-- Message d'erreur -->
                <div v-if="errorMessage" class="error-message">
                    <span class="error-icon">⚠️</span>
                    {{ errorMessage }}
                </div>
                
                <!-- Lien mot de passe oublié -->
                <a href="/forgot-password" class="forgot-password">Mot de passe oublié ?</a>
                
                <!-- Bouton de connexion -->
                <ModernButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    :loading="isLoading"
                    :disabled="!email || !password"
                    full-width
                >
                    Se connecter
                </ModernButton>
            </form>
            
            <!-- Footer -->
            <div class="login-footer">
                <p class="footer-text">
                    Pas encore de compte ? 
                    <a href="/inscription" class="register-link">Inscrivez-vous</a>
                </p>
            </div>
        </div>
        
        <!-- Version info -->
        <div class="version-info">
            BEE Solutions {{ appVersion }}
        </div>
    </div>
</template>

<style scoped>
.login-container {
    position: fixed;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, #FFF8E1 0%, #F6F1E3 50%, #FFE082 100%);
    padding: var(--bee-spacing-lg);
    overflow: hidden;
}

/* Cercles décoratifs animés */
.decorative-circles {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
}

.circle {
    position: absolute;
    border-radius: 50%;
    background: var(--bee-honey);
    opacity: 0.08;
    animation: float 8s ease-in-out infinite;
}

.circle-1 {
    width: 200px;
    height: 200px;
    top: 10%;
    left: 10%;
    animation-delay: 0s;
}

.circle-2 {
    width: 150px;
    height: 150px;
    top: 60%;
    right: 10%;
    animation-delay: 2s;
}

.circle-3 {
    width: 100px;
    height: 100px;
    bottom: 20%;
    left: 20%;
    animation-delay: 4s;
}

.circle-4 {
    width: 180px;
    height: 180px;
    top: 30%;
    right: 30%;
    animation-delay: 1s;
}

@keyframes float {
    0%, 100% {
        transform: translateY(0) scale(1);
    }
    50% {
        transform: translateY(-20px) scale(1.05);
    }
}

/* Card de connexion */
.login-card {
    width: 100%;
    max-width: 420px;
    background: var(--bee-gradient-glass);
    backdrop-filter: blur(20px);
    border-radius: var(--bee-radius-xl);
    padding: var(--bee-spacing-xl);
    box-shadow: 
        0 20px 60px rgba(0, 0, 0, 0.1),
        inset 0 1px 0 rgba(255, 255, 255, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.4);
    animation: fadeInUp 0.6s ease forwards;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Header */
.login-header {
    text-align: center;
    margin-bottom: var(--bee-spacing-xl);
}

.logo-container {
    width: 120px;
    height: 120px;
    margin: 0 auto var(--bee-spacing-lg);
    background: var(--bee-gradient-glass);
    border-radius: var(--bee-radius-xl);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 
        0 12px 40px rgba(255, 183, 0, 0.3),
        inset 0 1px 0 rgba(255, 255, 255, 0.6);
    border: 2px solid rgba(255, 255, 255, 0.4);
}

.logo {
    width: 80px;
    height: 80px;
    object-fit: contain;
}

.title {
    font-size: 28px;
    font-weight: 700;
    color: var(--bee-on-surface);
    margin: 0 0 var(--bee-spacing-sm);
}

.subtitle {
    font-size: 15px;
    color: var(--bee-on-surface-variant);
    margin: 0;
}

/* Formulaire */
.login-form {
    display: flex;
    flex-direction: column;
    gap: var(--bee-spacing-md);
}

.forgot-password {
    text-align: right;
    font-size: 13px;
    color: var(--bee-on-surface-variant);
    margin-top: calc(-1 * var(--bee-spacing-sm));
}

.forgot-password:hover {
    color: var(--bee-honey);
}

/* Message d'erreur */
.error-message {
    display: flex;
    align-items: center;
    gap: var(--bee-spacing-sm);
    padding: var(--bee-spacing-sm) var(--bee-spacing-md);
    background: rgba(244, 67, 54, 0.1);
    border: 1px solid rgba(244, 67, 54, 0.3);
    border-radius: var(--bee-radius-md);
    color: var(--bee-error);
    font-size: 14px;
}

.error-icon {
    font-size: 16px;
}

/* Footer */
.login-footer {
    margin-top: var(--bee-spacing-xl);
    text-align: center;
}

.footer-text {
    font-size: 14px;
    color: var(--bee-on-surface-variant);
    margin: 0;
}

.register-link {
    color: var(--bee-honey);
    font-weight: 600;
}

.register-link:hover {
    text-decoration: underline;
}

/* Version info */
.version-info {
    position: absolute;
    bottom: var(--bee-spacing-md);
    font-size: 12px;
    color: var(--bee-on-surface-variant);
    opacity: 0.6;
}

/* Responsive */
@media (max-width: 480px) {
    .login-card {
        padding: var(--bee-spacing-lg);
    }
    
    .logo-container {
        width: 100px;
        height: 100px;
    }
    
    .logo {
        width: 60px;
        height: 60px;
    }
    
    .title {
        font-size: 24px;
    }
}
</style>
