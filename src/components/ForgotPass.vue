<script setup>
import apiService from '../services/api.service.js';
import ModernButton from './ui/ModernButton.vue';
import ModernInput from './ui/ModernInput.vue';
import { ref } from 'vue';
import { router } from '../router_dashboard.js';
import { api } from '../API.js';
// import { addLog } from '@/composables/useLogs'

// Forgot password
const forgotEmail = ref('')
const forgotResult = ref(null) // { type: 'success' | 'error', message: '' }

// Reset password
const resetToken = ref('')
const resetPassword = ref('')
const resetConfirm = ref('')
const resetResult = ref(null)

const showResetForm = ref(false)
const errorMessage = ref('')



async function handleForgotPassword() {
  forgotResult.value = null

  if (!forgotEmail.value) {
    forgotResult.value = {
      type: 'error',
      message: 'Email requis'
    }
    return
  }

  const result = await apiService.Auth.requestPasswordReset(forgotEmail.value.trim())

  if (result.ok) {
    forgotResult.value = {
      type: 'success',
      message: result.data.message
    }
    forgotEmail.value = ''
    console.log('Demande de réinitialisation envoyée', 'success')
    showResetForm.value = true
  } else {
    forgotResult.value = {
      type: 'error',
      message: result.data?.message || 'Erreur'
    }
    console.log('Erreur:', forgotResult.value.message)
  }
}


async function handleResetPassword() {
  resetResult.value = null

  if (resetPassword.value !== resetConfirm.value) {
    resetResult.value = {
      type: 'error',
      message: 'Les deux mots de passe ne correspondent pas.'
    }
    return
  }

  if (resetPassword.value.length < 6) {
    resetResult.value = {
      type: 'error',
      message: 'Le mot de passe doit contenir au moins 6 caractères.'
    }
    return
  }

  const result = await apiService.Auth.resetPassword(resetToken.value.trim(), resetPassword.value) // trim() pour éviter les espaces accidentels

  if (result.ok) {
    resetResult.value = {
      type: 'success',
      message: result.data.message
    }

    showResetForm.value = false
    resetToken.value = ''
    resetPassword.value = ''
    resetConfirm.value = ''

    console.log('Mot de passe réinitialisé avec succès')
    setTimeout(() => {
      router.push('/Login')
    }, 2000)
  } else {
    resetResult.value = {
      type: 'error',
      message: result.data?.message || 'Erreur'
    }
    console.log('Erreur:', resetResult.value.message)
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
                <div class="login-header">Mot de passe oublié</div>
                <form class="form-group" @submit.prevent="handleForgotPassword">
                    <ModernInput v-model="forgotEmail" type="email" id="forgotEmail" placeholder="Email" required icon="📧"
                    :error="errorMessage && !forgotEmail ? 'Email requis' : ''"/>
                    <ModernButton
                    type="submit"
                    variant="primary"
                    size="lg"
                    :disabled="!forgotEmail"
                    full-width
                    >
                    Envoyer
                    </ModernButton> 
                    <div v-if="forgotResult" :class="forgotResult.type">
                        {{ forgotResult.message }}
                    </div>
                </form>

                <form v-if="showResetForm" @submit.prevent="handleResetPassword">
                    <ModernInput v-model="resetToken" type="text" id="resetToken" placeholder="Token" required icon="🔑"/>
                    <ModernInput v-model="resetPassword" type="password" id="resetPassword" placeholder="Nouveau mot de passe" required icon="🔒"/>
                    <ModernInput v-model="resetConfirm" type="password" id="resetConfirm" placeholder="Confirmer le mot de passe" required icon="🔒"/>
                    <ModernButton type="submit" variant="primary" size="lg" full-width> Réinitialiser </ModernButton >

                <div v-if="resetResult" :class="resetResult.type">
                    {{ resetResult.message }}
                </div>
                </form>
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