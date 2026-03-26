<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { UserService } from '../services/api.service.js';
import { user, logout } from '../user.js';
import { BeeColors } from '../theme.js';
import ModernCard from './ui/ModernCard.vue';
import ModernButton from './ui/ModernButton.vue';
import ModernInput from './ui/ModernInput.vue';
import LoadingSpinner from './ui/LoadingSpinner.vue';

const router = useRouter();

// État
const profile = ref(null);
const isLoading = ref(true);
const isSaving = ref(false);
const error = ref(null);
const successMessage = ref('');

// Mode édition
const isEditing = ref(false);
const editForm = ref({
    nom: '',
    prenom: '',
    adresse_postale: {
        adr: '',
        code_postal: '',
        ville: ''
    },
    is_bio: false,
    bio_cert_number: '',
    napi_number: '',
    rucher_search_radius: 5
});

// Charger le profil
async function loadProfile() {
    isLoading.value = true;
    error.value = null;
    
    try {
        const result = await UserService.getMyProfile();
        if (result.ok && result.data) {
            profile.value = result.data.user;
            
            // Pré-remplir le formulaire d'édition
            editForm.value = {
                nom: profile.value.nom || '',
                prenom: profile.value.prenom || '',
                adresse_postale: {
                    adr: profile.value.adresse_postale?.adr || '',
                    code_postal: profile.value.adresse_postale?.code_postal || '',
                    ville: profile.value.adresse_postale?.ville || ''
                },
                is_bio: profile.value.is_bio || false,
                bio_cert_number: profile.value.bio_cert_number || '',
                napi_number: profile.value.napi_number || '',
                rucher_search_radius: profile.value.rucher_search_radius || 5
            };
        }
    } catch (err) {
        console.error('Erreur lors du chargement du profil:', err);
        error.value = err.message || 'Erreur lors du chargement';
    } finally {
        isLoading.value = false;
    }
}

// Sauvegarder les modifications
async function saveProfile() {
    isSaving.value = true;
    error.value = null;
    successMessage.value = '';
    
    try {
        const result = await UserService.updateMyProfile(editForm.value);
        if (result.ok) {
            profile.value = result.data.user;
            isEditing.value = false;
            successMessage.value = 'Profil mis à jour avec succès !';
            
            // Masquer le message après 3 secondes
            setTimeout(() => {
                successMessage.value = '';
            }, 3000);
        }
    } catch (err) {
        console.error('Erreur lors de la sauvegarde:', err);
        error.value = err.message || 'Erreur lors de la sauvegarde';
    } finally {
        isSaving.value = false;
    }
}

// Annuler l'édition
function cancelEdit() {
    isEditing.value = false;
    // Réinitialiser le formulaire
    if (profile.value) {
        editForm.value = {
            nom: profile.value.nom || '',
            prenom: profile.value.prenom || '',
            adresse_postale: {
                adr: profile.value.adresse_postale?.adr || '',
                code_postal: profile.value.adresse_postale?.code_postal || '',
                ville: profile.value.adresse_postale?.ville || ''
            },
            is_bio: profile.value.is_bio || false,
            bio_cert_number: profile.value.bio_cert_number || '',
            napi_number: profile.value.napi_number || '',
            rucher_search_radius: profile.value.rucher_search_radius || 5
        };
    }
}

// Déconnexion
function handleLogout() {
    logout();
    router.push('/login');
}

// Nom complet
const fullName = computed(() => {
    if (!profile.value) return 'Utilisateur';
    const parts = [profile.value.prenom, profile.value.nom].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : 'Utilisateur';
});

onMounted(loadProfile);
</script>

<template>
    <div class="profile-page">
        <!-- Header -->
        <div class="page-header">
            <div class="header-content">
                <h1>👤 Mon Profil</h1>
                <p class="subtitle">Gérez vos informations personnelles</p>
            </div>
        </div>
        
        <!-- Loading -->
        <LoadingSpinner v-if="isLoading" text="Chargement du profil..." />
        
        <!-- Error -->
        <ModernCard v-else-if="error && !profile" variant="outlined" class="error-card">
            <div class="error-content">
                <span class="error-icon">⚠️</span>
                <p>{{ error }}</p>
                <ModernButton @click="loadProfile" variant="primary">
                    Réessayer
                </ModernButton>
            </div>
        </ModernCard>
        
        <!-- Contenu -->
        <template v-else-if="profile">
            <!-- Message de succès -->
            <div v-if="successMessage" class="success-message">
                ✅ {{ successMessage }}
            </div>
            
            <!-- Message d'erreur -->
            <div v-if="error" class="error-message">
                ⚠️ {{ error }}
            </div>
            
            <!-- Section Avatar et infos principales -->
            <ModernCard class="profile-hero">
                <div class="avatar-section">
                    <div class="avatar">
                        <span class="avatar-icon">🐝</span>
                    </div>
                    <div class="user-info">
                        <h2>{{ fullName }}</h2>
                        <p class="user-email">{{ profile.email }}</p>
                        <div class="user-badges">
                            <span v-if="profile.role === 'admin'" class="badge admin">👑 Admin</span>
                            <span v-if="profile.is_bio" class="badge bio">🌿 Bio certifié</span>
                            <span v-if="profile.isVerified" class="badge verified">✓ Vérifié</span>
                        </div>
                    </div>
                </div>
                
                <div class="hero-actions">
                    <ModernButton 
                        v-if="!isEditing" 
                        @click="isEditing = true" 
                        variant="primary"
                    >
                        ✏️ Modifier
                    </ModernButton>
                    <template v-else>
                        <ModernButton @click="cancelEdit" variant="secondary">
                            Annuler
                        </ModernButton>
                        <ModernButton @click="saveProfile" variant="primary" :loading="isSaving">
                            💾 Enregistrer
                        </ModernButton>
                    </template>
                </div>
            </ModernCard>
            
            <!-- Informations détaillées -->
            <div class="profile-sections">
                <!-- Section Identité -->
                <ModernCard class="section-card">
                    <h3 class="section-title">🪪 Identité</h3>
                    
                    <template v-if="!isEditing">
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">Prénom</span>
                                <span class="info-value">{{ profile.prenom || '—' }}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Nom</span>
                                <span class="info-value">{{ profile.nom || '—' }}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Email</span>
                                <span class="info-value">{{ profile.email }}</span>
                            </div>
                        </div>
                    </template>
                    
                    <template v-else>
                        <div class="edit-grid">
                            <ModernInput
                                v-model="editForm.prenom"
                                label="Prénom"
                                placeholder="Votre prénom"
                                icon="👤"
                            />
                            <ModernInput
                                v-model="editForm.nom"
                                label="Nom"
                                placeholder="Votre nom"
                                icon="👤"
                            />
                        </div>
                    </template>
                </ModernCard>
                
                <!-- Section Adresse -->
                <ModernCard class="section-card">
                    <h3 class="section-title">📍 Adresse</h3>
                    
                    <template v-if="!isEditing">
                        <div class="info-grid">
                            <div class="info-item full">
                                <span class="info-label">Adresse</span>
                                <span class="info-value">{{ profile.adresse_postale?.adr || '—' }}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Code postal</span>
                                <span class="info-value">{{ profile.adresse_postale?.code_postal || '—' }}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Ville</span>
                                <span class="info-value">{{ profile.adresse_postale?.ville || '—' }}</span>
                            </div>
                        </div>
                    </template>
                    
                    <template v-else>
                        <div class="edit-grid">
                            <div class="full">
                                <ModernInput
                                    v-model="editForm.adresse_postale.adr"
                                    label="Adresse"
                                    placeholder="Numéro et rue"
                                    icon="🏠"
                                />
                            </div>
                            <ModernInput
                                v-model="editForm.adresse_postale.code_postal"
                                label="Code postal"
                                placeholder="00000"
                            />
                            <ModernInput
                                v-model="editForm.adresse_postale.ville"
                                label="Ville"
                                placeholder="Ville"
                            />
                        </div>
                    </template>
                </ModernCard>
                
                <!-- Section Apiculture -->
                <ModernCard class="section-card">
                    <h3 class="section-title">🐝 Informations apicoles</h3>
                    
                    <template v-if="!isEditing">
                        <div class="info-grid">
                            <div class="info-item">
                                <span class="info-label">N° NAPI</span>
                                <span class="info-value">{{ profile.napi_number || '—' }}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Apiculture Bio</span>
                                <span class="info-value">{{ profile.is_bio ? '✅ Oui' : '❌ Non' }}</span>
                            </div>
                            <div class="info-item" v-if="profile.is_bio">
                                <span class="info-label">N° certification Bio</span>
                                <span class="info-value">{{ profile.bio_cert_number || '—' }}</span>
                            </div>
                            <div class="info-item">
                                <span class="info-label">Rayon de recherche ruchers</span>
                                <span class="info-value">{{ profile.rucher_search_radius || 5 }} km</span>
                            </div>
                        </div>
                    </template>
                    
                    <template v-else>
                        <div class="edit-grid">
                            <ModernInput
                                v-model="editForm.napi_number"
                                label="N° NAPI"
                                placeholder="Votre numéro NAPI"
                                icon="📋"
                            />
                            <div class="checkbox-field">
                                <label>
                                    <input type="checkbox" v-model="editForm.is_bio" />
                                    <span>🌿 Apiculture biologique</span>
                                </label>
                            </div>
                            <ModernInput
                                v-if="editForm.is_bio"
                                v-model="editForm.bio_cert_number"
                                label="N° certification Bio"
                                placeholder="Numéro de certification"
                                icon="🌿"
                            />
                            <ModernInput
                                v-model="editForm.rucher_search_radius"
                                type="number"
                                label="Rayon de recherche (km)"
                                placeholder="5"
                                icon="📍"
                            />
                        </div>
                    </template>
                </ModernCard>
            </div>
            
            <!-- Section Déconnexion -->
            <ModernCard class="logout-section">
                <div class="logout-content">
                    <div class="logout-info">
                        <h3>🚪 Déconnexion</h3>
                        <p>Vous serez redirigé vers la page de connexion</p>
                    </div>
                    <ModernButton @click="handleLogout" variant="danger">
                        Se déconnecter
                    </ModernButton>
                </div>
            </ModernCard>
        </template>
    </div>
</template>

<style scoped>
.profile-page {
    padding: var(--bee-spacing-md);
    max-width: 900px;
    margin: 0 auto;
}

/* Header */
.page-header {
    margin-bottom: var(--bee-spacing-xl);
}

.header-content h1 {
    font-size: 28px;
    margin: 0 0 var(--bee-spacing-xs);
}

.subtitle {
    font-size: 14px;
    color: var(--bee-on-surface-variant);
    margin: 0;
}

/* Messages */
.success-message, .error-message {
    padding: var(--bee-spacing-md);
    border-radius: var(--bee-radius-md);
    margin-bottom: var(--bee-spacing-lg);
    font-size: 14px;
}

.success-message {
    background: rgba(76, 175, 80, 0.1);
    color: var(--bee-success);
    border: 1px solid rgba(76, 175, 80, 0.3);
}

.error-message {
    background: rgba(244, 67, 54, 0.1);
    color: var(--bee-error);
    border: 1px solid rgba(244, 67, 54, 0.3);
}

/* Hero Section */
.profile-hero {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--bee-spacing-lg);
    flex-wrap: wrap;
    gap: var(--bee-spacing-lg);
}

.avatar-section {
    display: flex;
    align-items: center;
    gap: var(--bee-spacing-lg);
}

.avatar {
    width: 80px;
    height: 80px;
    background: var(--bee-gradient-primary);
    border-radius: var(--bee-radius-xl);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: var(--bee-shadow-colored);
}

.avatar-icon {
    font-size: 40px;
}

.user-info h2 {
    font-size: 22px;
    margin: 0 0 var(--bee-spacing-xs);
}

.user-email {
    font-size: 14px;
    color: var(--bee-on-surface-variant);
    margin: 0 0 var(--bee-spacing-sm);
}

.user-badges {
    display: flex;
    gap: var(--bee-spacing-xs);
    flex-wrap: wrap;
}

.badge {
    padding: 2px 10px;
    font-size: 11px;
    font-weight: 600;
    border-radius: var(--bee-radius-full);
}

.badge.admin {
    background: rgba(255, 183, 0, 0.15);
    color: var(--bee-honey);
}

.badge.bio {
    background: rgba(76, 175, 80, 0.15);
    color: var(--bee-success);
}

.badge.verified {
    background: rgba(33, 150, 243, 0.15);
    color: var(--bee-info);
}

.hero-actions {
    display: flex;
    gap: var(--bee-spacing-sm);
}

/* Profile Sections */
.profile-sections {
    display: flex;
    flex-direction: column;
    gap: var(--bee-spacing-lg);
    margin-bottom: var(--bee-spacing-lg);
}

.section-card {
    padding: var(--bee-spacing-lg) !important;
}

.section-title {
    font-size: 16px;
    margin: 0 0 var(--bee-spacing-lg);
    padding-bottom: var(--bee-spacing-sm);
    border-bottom: 1px solid var(--bee-gray-200);
}

/* Info Grid (lecture) */
.info-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--bee-spacing-md) var(--bee-spacing-xl);
}

.info-item {
    display: flex;
    flex-direction: column;
    gap: var(--bee-spacing-xs);
}

.info-item.full {
    grid-column: 1 / -1;
}

.info-label {
    font-size: 12px;
    font-weight: 500;
    color: var(--bee-on-surface-variant);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.info-value {
    font-size: 15px;
    color: var(--bee-on-surface);
}

/* Edit Grid */
.edit-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--bee-spacing-md);
}

.edit-grid .full {
    grid-column: 1 / -1;
}

.checkbox-field {
    display: flex;
    align-items: center;
    padding-top: var(--bee-spacing-lg);
}

.checkbox-field label {
    display: flex;
    align-items: center;
    gap: var(--bee-spacing-sm);
    cursor: pointer;
    font-size: 14px;
}

.checkbox-field input {
    width: 18px;
    height: 18px;
    accent-color: var(--bee-honey);
}

/* Logout Section */
.logout-section {
    margin-top: var(--bee-spacing-xl);
    border: 2px solid var(--bee-error);
    background: rgba(244, 67, 54, 0.05);
}

.logout-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: var(--bee-spacing-md);
}

.logout-info h3 {
    font-size: 16px;
    margin: 0 0 var(--bee-spacing-xs);
    color: var(--bee-error);
}

.logout-info p {
    font-size: 13px;
    color: var(--bee-on-surface-variant);
    margin: 0;
}

/* États */
.error-card {
    max-width: 500px;
    margin: var(--bee-spacing-xl) auto;
}

.error-content {
    text-align: center;
    padding: var(--bee-spacing-xl);
}

.error-icon {
    font-size: 48px;
    display: block;
    margin-bottom: var(--bee-spacing-md);
}

/* Responsive */
@media (max-width: 768px) {
    .profile-hero {
        flex-direction: column;
        align-items: stretch;
    }
    
    .avatar-section {
        justify-content: center;
        text-align: center;
        flex-direction: column;
    }
    
    .hero-actions {
        justify-content: center;
    }
    
    .info-grid, .edit-grid {
        grid-template-columns: 1fr;
    }
    
    .logout-content {
        flex-direction: column;
        text-align: center;
    }
}
</style>
