<script setup>
import { ref, onMounted } from 'vue';
import {DeviceService, RucherService } from '../services/api.service.js';
import { BeeColors, formatFullDate } from '../theme.js';
import ModernCard from './ui/ModernCard.vue';
import ModernButton from './ui/ModernButton.vue';
import ModernInput from './ui/ModernInput.vue';
import LoadingSpinner from './ui/LoadingSpinner.vue';
import {distance} from '../CalculDistanceHaversine.js' 

// État
const ruchers = ref([]);
const gateways = ref([]);
const radiusMeters = 100; //rayon du cercle autour des ruchers en mètres
const isLoading = ref(true);
const error = ref(null);
const showCreateModal = ref(false);

// Formulaire de création
const newRucher = ref({
    nom_rucher: '',
    localisation: {
        latitude: '',
        longitude: ''
    },
    is_bio: false
});
const isCreating = ref(false);
const createError = ref(null);

// Charger les ruchers
async function loadData() {
    isLoading.value = true;
    error.value = null;
    
    try {
        const result = await RucherService.getRuchers();
        if (result.ok && result.data) {
            ruchers.value = result.data.ruchers || [];
        }

        // Charger les gateways
        const gatewaysResult = await DeviceService.getGatewaysForUser();
        if (gatewaysResult.ok && gatewaysResult.data) {
            console.log("Gateways pour onglet Ruchers:", gatewaysResult.data);
            gateways.value = gatewaysResult.data.gateways // Récupère toutes les gateways et leurs modules
        }
    } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        error.value = err.message || 'Erreur lors du chargement des données';
    } finally {
        isLoading.value = false;
    }
}

// Créer un rucher
async function createRucher() {
    if (!newRucher.value.nom_rucher.trim()) {
        createError.value = 'Le nom du rucher est requis';
        return;
    }
    
    isCreating.value = true;
    createError.value = null;
    
    try {
        const data = {
            nom_rucher: newRucher.value.nom_rucher.trim(),
            is_bio: newRucher.value.is_bio
        };
        
        // Ajouter la localisation si fournie
        if (newRucher.value.localisation.latitude && newRucher.value.localisation.longitude) {
            data.localisation = {
                latitude: parseFloat(newRucher.value.localisation.latitude),
                longitude: parseFloat(newRucher.value.localisation.longitude)
            };
        }
        
        const result = await RucherService.createRucher(data);
        if (result.ok) {
            // Réinitialiser le formulaire
            newRucher.value = {
                nom_rucher: '',
                localisation: { latitude: '', longitude: '' },
                is_bio: false
            };
            showCreateModal.value = false;
            
            // Recharger la liste
            await loadData();
        }
    } catch (err) {
        console.error('Erreur lors de la création:', err);
        createError.value = err.message || 'Erreur lors de la création';
    } finally {
        isCreating.value = false;
    }
}

// Obtenir la position actuelle
function getCurrentLocation() {
    if (!navigator.geolocation) {
        createError.value = 'La géolocalisation n\'est pas supportée';
        return;
    }
    
    navigator.geolocation.getCurrentPosition(
        (position) => {
            newRucher.value.localisation.latitude = position.coords.latitude.toFixed(6);
            newRucher.value.localisation.longitude = position.coords.longitude.toFixed(6);
        },
        (err) => {
            createError.value = 'Impossible d\'obtenir la position';
            console.error('Erreur géolocalisation:', err);
        }
    );
}

function getDistanceHaversine(latGW, longGW, latRuch, longRuch){
    const d = distance(latGW, longGW, latRuch, longRuch);
    console.log("Distance:",d);
    if(d <= radiusMeters){
        console.log('Gateway dans le périmètre du rucher')
        return true;
    } else{
        console.log('Gateway pas dans le périmètre du rucher')
        return false
    }
}

function gatewaysForRucher(rucher) {
    if (!rucher.localisation) return [];

    return gateways.value.filter(gw => {
        if (!gw.location) return false;

        const d = distance(
            gw.location.latitude,
            gw.location.longitude,
            rucher.localisation.latitude,
            rucher.localisation.longitude
        );

        return d <= radiusMeters;
    });
}

onMounted(loadData);
</script>

<template>
    <div class="ruchers-page">
        <!-- Header -->
        <div class="page-header">
            <div class="header-content">
                <h1>🐝 Mes Ruchers</h1>
                <p class="subtitle">Gérez vos emplacements de ruchers</p>
            </div>
            <div class="header-actions">
                <ModernButton @click="loadData" :loading="isLoading" variant="outline">
                    🔄 Actualiser
                </ModernButton>
                <ModernButton @click="showCreateModal = true" variant="primary">
                    ➕ Nouveau rucher
                </ModernButton>
            </div>
        </div>
        
        <!-- Loading -->
        <LoadingSpinner v-if="isLoading" text="Chargement des ruchers..." />
        
        <!-- Error -->
        <ModernCard v-else-if="error" variant="outlined" class="error-card">
            <div class="error-content">
                <span class="error-icon">⚠️</span>
                <p>{{ error }}</p>
                <ModernButton @click="loadData" variant="primary">
                    Réessayer
                </ModernButton>
            </div>
        </ModernCard>
        
        <!-- Empty state -->
        <ModernCard v-else-if="ruchers.length === 0" class="empty-card">
            <div class="empty-content">
                <span class="empty-icon">🏕️</span>
                <h3>Aucun rucher</h3>
                <p>Commencez par créer votre premier rucher</p>
                <ModernButton @click="showCreateModal = true" variant="primary">
                    ➕ Créer un rucher
                </ModernButton>
            </div>
        </ModernCard>
        
        <!-- Liste des ruchers -->
        <div class="ruchers-grid" v-else>
            <ModernCard
                v-for="rucher in ruchers"
                :key="rucher._id"
                hoverable
                class="rucher-card"
            >
                <div class="rucher-header">
                    <div class="rucher-icon">🐝</div>
                    <div class="rucher-info">
                        <h3>{{ rucher.nom_rucher }}</h3>
                        <span v-if="rucher.is_bio" class="bio-badge">🌿 Bio</span>
                    </div>
                </div>
                
                <div class="rucher-body">
                    <!-- Localisation -->
                    <div class="rucher-location" v-if="rucher.localisation">
                        <span class="location-icon">📍</span>
                        <span class="location-coords">
                            {{ rucher.localisation.latitude?.toFixed(4) }}, 
                            {{ rucher.localisation.longitude?.toFixed(4) }}
                        </span>
                    </div>
                    <div class="rucher-location" v-else>
                        <span class="location-icon">📍</span>
                        <span class="no-location">Position non définie</span>
                    </div>
                    
                    <!-- Date de création -->
                    <div class="rucher-date" v-if="rucher.createdAt">
                        <span class="date-icon">📅</span>
                        <span>Créé le {{ formatFullDate(rucher.createdAt) }}</span>
                    </div>

                    <!--Gateways rattachées-->
                    <div class="gateway-attached" v-for="gw in gateways">
                        <!-- {{result = getDistanceHaversine(gw.location.latitude, gw.location.longitude, rucher.localisation.latitude, rucher.localisation.longitude)}} -->
                        <span v-if="getDistanceHaversine(gw.location.latitude, gw.location.longitude, rucher.localisation.latitude, rucher.localisation.longitude) == true">
                            {{ gw.nom }}
                        </span>
                    </div>
                </div>
                
                <div class="rucher-footer">
                    <ModernButton variant="ghost" size="sm">
                        Voir détails →
                    </ModernButton>
                </div>
            </ModernCard>
        </div>
        
        <!-- Modal de création -->
        <div class="modal-overlay" v-if="showCreateModal" @click.self="showCreateModal = false">
            <ModernCard class="create-modal">
                <div class="modal-header">
                    <h2>➕ Nouveau rucher</h2>
                    <button class="close-btn" @click="showCreateModal = false">✕</button>
                </div>
                
                <form class="modal-body" @submit.prevent="createRucher">
                    <ModernInput
                        v-model="newRucher.nom_rucher"
                        label="Nom du rucher"
                        placeholder="Ex: Rucher de la colline"
                        icon="🐝"
                        :error="createError && !newRucher.nom_rucher ? 'Nom requis' : ''"
                    />
                    
                    <div class="location-fields">
                        <label class="field-label">📍 Localisation (optionnel)</label>
                        <div class="location-inputs">
                            <input
                                v-model="newRucher.localisation.latitude"
                                type="number"
                                step="any"
                                placeholder="Latitude"
                                class="location-input"
                            />
                            <input
                                v-model="newRucher.localisation.longitude"
                                type="number"
                                step="any"
                                placeholder="Longitude"
                                class="location-input"
                            />
                        </div>
                        <button type="button" class="gps-btn" @click="getCurrentLocation">
                            📍 Utiliser ma position
                        </button>
                    </div>
                    
                    <div class="bio-field">
                        <label class="checkbox-label">
                            <input type="checkbox" v-model="newRucher.is_bio" />
                            <span class="checkbox-text">🌿 Rucher Bio</span>
                        </label>
                    </div>
                    
                    <!-- Erreur -->
                    <div v-if="createError" class="create-error">
                        ⚠️ {{ createError }}
                    </div>
                    
                    <div class="modal-actions">
                        <ModernButton 
                            type="button" 
                            variant="secondary" 
                            @click="showCreateModal = false"
                        >
                            Annuler
                        </ModernButton>
                        <ModernButton 
                            type="submit" 
                            variant="primary" 
                            :loading="isCreating"
                        >
                            Créer le rucher
                        </ModernButton>
                    </div>
                </form>
            </ModernCard>
        </div>
    </div>
</template>

<style scoped>
.ruchers-page {
    padding: var(--bee-spacing-md);
    max-width: 1400px;
    margin: 0 auto;
}

/* Header */
.page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: var(--bee-spacing-xl);
    flex-wrap: wrap;
    gap: var(--bee-spacing-md);
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

.header-actions {
    display: flex;
    gap: var(--bee-spacing-sm);
}

/* Grille des ruchers */
.ruchers-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: var(--bee-spacing-md);
}

.rucher-card {
    display: flex;
    flex-direction: column;
}

.rucher-header {
    display: flex;
    align-items: center;
    gap: var(--bee-spacing-md);
    margin-bottom: var(--bee-spacing-md);
    padding-bottom: var(--bee-spacing-sm);
    border-bottom: 1px solid var(--bee-gray-200);
}

.rucher-icon {
    font-size: 40px;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bee-gray-100);
    border-radius: var(--bee-radius-lg);
}

.rucher-info h3 {
    font-size: 18px;
    margin: 0 0 var(--bee-spacing-xs);
}

.bio-badge {
    display: inline-block;
    padding: 2px 8px;
    background: rgba(76, 175, 80, 0.15);
    color: var(--bee-success);
    border-radius: var(--bee-radius-sm);
    font-size: 12px;
    font-weight: 600;
}

.rucher-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: var(--bee-spacing-sm);
}

.rucher-location, .rucher-date {
    display: flex;
    align-items: center;
    gap: var(--bee-spacing-sm);
    font-size: 13px;
    color: var(--bee-on-surface-variant);
}

.location-icon, .date-icon {
    font-size: 16px;
}

.no-location {
    font-style: italic;
    opacity: 0.7;
}

.rucher-footer {
    margin-top: var(--bee-spacing-md);
    padding-top: var(--bee-spacing-sm);
    border-top: 1px solid var(--bee-gray-200);
}

/* Modal */
.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: var(--bee-spacing-lg);
}

.create-modal {
    width: 100%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--bee-spacing-lg);
    padding-bottom: var(--bee-spacing-md);
    border-bottom: 1px solid var(--bee-gray-200);
}

.modal-header h2 {
    font-size: 20px;
    margin: 0;
}

.close-btn {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    padding: var(--bee-spacing-xs);
    border-radius: var(--bee-radius-sm);
    color: var(--bee-on-surface-variant);
}

.close-btn:hover {
    background: var(--bee-gray-100);
}

.modal-body {
    display: flex;
    flex-direction: column;
    gap: var(--bee-spacing-lg);
}

.field-label {
    display: block;
    font-size: 14px;
    font-weight: 600;
    color: var(--bee-on-surface);
    margin-bottom: var(--bee-spacing-sm);
}

.location-fields {
    display: flex;
    flex-direction: column;
    gap: var(--bee-spacing-sm);
}

.location-inputs {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--bee-spacing-sm);
}

.location-input {
    padding: var(--bee-spacing-sm) var(--bee-spacing-md);
    border: 2px solid var(--bee-gray-200);
    border-radius: var(--bee-radius-md);
    font-size: 14px;
    font-family: inherit;
}

.location-input:focus {
    outline: none;
    border-color: var(--bee-honey);
}

.gps-btn {
    padding: var(--bee-spacing-sm);
    background: var(--bee-gray-100);
    border: none;
    border-radius: var(--bee-radius-md);
    font-size: 13px;
    cursor: pointer;
    transition: all var(--bee-transition-fast);
}

.gps-btn:hover {
    background: var(--bee-gray-200);
}

.bio-field {
    margin-top: var(--bee-spacing-sm);
}

.checkbox-label {
    display: flex;
    align-items: center;
    gap: var(--bee-spacing-sm);
    cursor: pointer;
}

.checkbox-label input {
    width: 18px;
    height: 18px;
    accent-color: var(--bee-honey);
}

.checkbox-text {
    font-size: 14px;
}

.create-error {
    padding: var(--bee-spacing-sm) var(--bee-spacing-md);
    background: rgba(244, 67, 54, 0.1);
    border-radius: var(--bee-radius-md);
    color: var(--bee-error);
    font-size: 14px;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: var(--bee-spacing-sm);
    margin-top: var(--bee-spacing-md);
}

/* États */
.error-card, .empty-card {
    max-width: 500px;
    margin: var(--bee-spacing-xl) auto;
}

.error-content, .empty-content {
    text-align: center;
    padding: var(--bee-spacing-xl);
}

.error-icon, .empty-icon {
    font-size: 48px;
    display: block;
    margin-bottom: var(--bee-spacing-md);
}

.empty-content h3 {
    margin: 0 0 var(--bee-spacing-sm);
}

.empty-content p {
    color: var(--bee-on-surface-variant);
    margin: 0 0 var(--bee-spacing-lg);
}

/* Responsive */
@media (max-width: 768px) {
    .page-header {
        flex-direction: column;
        align-items: stretch;
    }
    
    .header-actions {
        justify-content: center;
    }
}
</style>
