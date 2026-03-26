<script setup>
import apiService from '../services/api.service.js';
import ModernButton from './ui/ModernButton.vue';
import ModernInput from './ui/ModernInput.vue';
import { ref } from 'vue';
import { router } from '../router_dashboard.js';

const SignUpAsked = ref(false)
const ErrorSignUp = ref(false)
const email = ref('')
const password = ref('')

const VerifyTokenAsked = ref(false)
const ErrorVerifyToken = ref(false)
const verificationToken = ref(null)
const successMessage = ref('')
const errorMessage = ref('')


async function handleRegister() {
    // e.preventDefault();
    SignUpAsked.value = true

    if (!email.value || !password.value) {
        errorMessage.value = 'Veuillez remplir tous les champs';
        return;
    }

    const result = await apiService.Auth.register(email.value,password.value)

    if (result.ok) {
        SignUpAsked.value = false
        ErrorSignUp.value = false

        successMessage.value = result.data.message || 'Inscription réussie'
        router.push('/Login')  // redirige vers la page de connexion après l'inscription réussie

        if (result.data.verificationToken) {
            verificationToken.value = result.data.verificationToken
            VerifyTokenAsked.value = true   // 👈 affiche le bloc de vérification
        }
    } else {
        ErrorSignUp.value = true
        errorMessage.value = result.data?.message || "Erreur lors de l'inscription"
    }

}
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
                <div class="login-header">Inscription</div>
                <form class="form-group" @submit.prevent="handleRegister">
                    <ModernInput v-model="email" type="email" id="registerEmail" placeholder="Email" required icon="📧"
                    :error="errorMessage && !email ? 'Email requis' : ''"/>
                    <ModernInput v-model="password"
                    type="password"
                    label="Mot de passe"
                    placeholder="Entrez votre mot de passe"
                    icon="🔒"
                    required
                    :error="errorMessage && !password ? 'Mot de passe requis' : ''"/>
                    <ModernButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    :disabled="!email || !password"
                    full-width
                    >
                    S'inscrire
                    </ModernButton> 
                </form>

                <!-- <div class="form-group" v-if="VerifyTokenAsked">
                    <h3>Vérification Email</h3>
                    <p class="success" v-if="successMessage">
                        ✅ {{ successMessage }}    
                    </p>

                    <p v-if="successMessage === null">Un email de vérification a été envoyé.</p>
                </div> -->
            </div>
        </div>
</template>

<style>
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

.form-group {
    display: flex;
    flex-direction: column;
    gap: var(--bee-spacing-md);
}

</style>