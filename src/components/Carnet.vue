<script setup>
import { ref, onMounted, computed } from 'vue';
import { InterventionService, TranshumanceService, RucheService } from '../services/api.service.js';
import { BeeColors, formatFullDate, formatDate } from '../theme.js';
import ModernCard from './ui/ModernCard.vue';
import ModernButton from './ui/ModernButton.vue';
import ModernInput from './ui/ModernInput.vue';
import LoadingSpinner from './ui/LoadingSpinner.vue';

// État
const activeTab = ref('nourrissements');
const nourrissements = ref([]);
const traitements = ref([]);
const recoltes = ref([]);
const transhumances = ref([]);
const ruches = ref([]);

const isLoading = ref(true);
const error = ref(null);

// Modals
const showCreateModal = ref(false);
const createType = ref('nourrissement');
const isCreating = ref(false);
const createError = ref(null);

// Formulaires
const newNourrissement = ref({
    rucheId: '',
    dateNourrissement: new Date().toISOString().split('T')[0],
    typeNourriture: 'sirop',
    quantiteKg: '',
    is_organique: false,
    raison: 'stimulation',
    remarques: ''
});

const newTraitement = ref({
    rucheId: '',
    dateTraitement: new Date().toISOString().split('T')[0],
    typeTraitement: 'varroa',
    produitUtilise: '',
    dosageMg: '',
    dureeTraitementJours: '',
    veterinaire: '',
    remarques: ''
});

const newRecolte = ref({
    rucheId: '',
    dateRecolte: new Date().toISOString().split('T')[0],
    quantiteMielKg: '',
    typeMiel: '',
    qualiteMiel: 'bonne',
    remarques: ''
});

// Types et options
const typesNourriture = ['sirop', 'candi', 'pollen', 'eau sucrée', 'autre'];
const raisonsNourrissement = ['stimulation', 'survie', 'développement', 'autre'];
const typesTraitement = ['varroa', 'loque', 'nosémose', 'autre'];
const qualitesMiel = ['excellente', 'bonne', 'moyenne', 'faible'];

// Charger les données
async function loadData() {
    isLoading.value = true;
    error.value = null;
    
    try {
        // Charger les ruches pour les formulaires
        const ruchesResult = await RucheService.getRuchesForUser();
        if (ruchesResult.ok && ruchesResult.data) {
            ruches.value = ruchesResult.data.ruches || [];
        }
        
        // Charger selon l'onglet actif
        await loadActiveTabData();
    } catch (err) {
        console.error('Erreur lors du chargement:', err);
        error.value = err.message || 'Erreur lors du chargement';
    } finally {
        isLoading.value = false;
    }
}

async function loadActiveTabData() {
    try {
        switch (activeTab.value) {
            case 'nourrissements':
                const nResult = await InterventionService.getNourrissements();
                if (nResult.ok && nResult.data) {
                    nourrissements.value = nResult.data.nourrissements || [];
                }
                break;
                
            case 'traitements':
                const tResult = await InterventionService.getTraitements();
                if (tResult.ok && tResult.data) {
                    traitements.value = tResult.data.traitements || [];
                }
                break;
                
            case 'recoltes':
                const rResult = await InterventionService.getRecoltes();
                if (rResult.ok && rResult.data) {
                    recoltes.value = rResult.data.recoltes || [];
                }
                break;
                
            case 'transhumances':
                const thResult = await TranshumanceService.getTranshumances();
                if (thResult.ok && thResult.data) {
                    transhumances.value = thResult.data.transhumances || [];
                }
                break;
        }
    } catch (err) {
        console.error('Erreur chargement onglet:', err);
    }
}

// Changer d'onglet
function changeTab(tab) {
    activeTab.value = tab;
    loadActiveTabData();
}

// Ouvrir le modal de création
function openCreateModal(type) {
    createType.value = type;
    createError.value = null;
    showCreateModal.value = true;
}

// Créer une entrée
async function createEntry() {
    isCreating.value = true;
    createError.value = null;
    
    try {
        let result;
        
        switch (createType.value) {
            case 'nourrissement':
                if (!newNourrissement.value.rucheId || !newNourrissement.value.quantiteKg) {
                    createError.value = 'Veuillez remplir tous les champs requis';
                    isCreating.value = false;
                    return;
                }
                result = await InterventionService.createNourrissement({
                    ...newNourrissement.value,
                    quantiteKg: parseFloat(newNourrissement.value.quantiteKg)
                });
                break;
                
            case 'traitement':
                if (!newTraitement.value.rucheId || !newTraitement.value.produitUtilise) {
                    createError.value = 'Veuillez remplir tous les champs requis';
                    isCreating.value = false;
                    return;
                }
                result = await InterventionService.createTraitement({
                    ...newTraitement.value,
                    dosageMg: parseFloat(newTraitement.value.dosageMg),
                    dureeTraitementJours: parseInt(newTraitement.value.dureeTraitementJours)
                });
                break;
                
            case 'recolte':
                if (!newRecolte.value.rucheId || !newRecolte.value.quantiteMielKg) {
                    createError.value = 'Veuillez remplir tous les champs requis';
                    isCreating.value = false;
                    return;
                }
                result = await InterventionService.createRecolte({
                    ...newRecolte.value,
                    quantiteMielKg: parseFloat(newRecolte.value.quantiteMielKg)
                });
                break;
        }
        
        if (result && result.ok) {
            showCreateModal.value = false;
            resetForms();
            await loadActiveTabData();
        }
    } catch (err) {
        console.error('Erreur création:', err);
        createError.value = err.message || 'Erreur lors de la création';
    } finally {
        isCreating.value = false;
    }
}

// Réinitialiser les formulaires
function resetForms() {
    newNourrissement.value = {
        rucheId: '',
        dateNourrissement: new Date().toISOString().split('T')[0],
        typeNourriture: 'sirop',
        quantiteKg: '',
        is_organique: false,
        raison: 'stimulation',
        remarques: ''
    };
    newTraitement.value = {
        rucheId: '',
        dateTraitement: new Date().toISOString().split('T')[0],
        typeTraitement: 'varroa',
        produitUtilise: '',
        dosageMg: '',
        dureeTraitementJours: '',
        veterinaire: '',
        remarques: ''
    };
    newRecolte.value = {
        rucheId: '',
        dateRecolte: new Date().toISOString().split('T')[0],
        quantiteMielKg: '',
        typeMiel: '',
        qualiteMiel: 'bonne',
        remarques: ''
    };
}

// Données de l'onglet actif
const currentData = computed(() => {
    switch (activeTab.value) {
        case 'nourrissements': return nourrissements.value;
        case 'traitements': return traitements.value;
        case 'recoltes': return recoltes.value;
        case 'transhumances': return transhumances.value;
        default: return [];
    }
});

// Computed pour la ruche sélectionnée dans le formulaire
const selectedRucheId = computed({
    get() {
        switch (createType.value) {
            case 'nourrissement': return newNourrissement.value.rucheId;
            case 'traitement': return newTraitement.value.rucheId;
            case 'recolte': return newRecolte.value.rucheId;
            default: return '';
        }
    },
    set(value) {
        switch (createType.value) {
            case 'nourrissement': 
                newNourrissement.value.rucheId = value;
                break;
            case 'traitement': 
                newTraitement.value.rucheId = value;
                break;
            case 'recolte': 
                newRecolte.value.rucheId = value;
                break;
        }
    }
});

onMounted(loadData);
</script>

<template>
    <div class="carnet-page">
        <!-- Header -->
        <div class="page-header">
            <div class="header-content">
                <h1>📔 Carnet d'élevage</h1>
                <p class="subtitle">Suivez toutes vos interventions sur les ruches</p>
            </div>
            <ModernButton 
                @click="openCreateModal(activeTab === 'nourrissements' ? 'nourrissement' : activeTab === 'traitements' ? 'traitement' : 'recolte')" 
                variant="primary"
                v-if="activeTab !== 'transhumances'"
            >
                ➕ Ajouter
            </ModernButton>
        </div>
        
        <!-- Tabs -->
        <div class="tabs">
            <button 
                :class="['tab', { active: activeTab === 'nourrissements' }]"
                @click="changeTab('nourrissements')"
            >
                🍯 Nourrissements
            </button>
            <button 
                :class="['tab', { active: activeTab === 'traitements' }]"
                @click="changeTab('traitements')"
            >
                💊 Traitements
            </button>
            <button 
                :class="['tab', { active: activeTab === 'recoltes' }]"
                @click="changeTab('recoltes')"
            >
                🍯 Récoltes
            </button>
            <button 
                :class="['tab', { active: activeTab === 'transhumances' }]"
                @click="changeTab('transhumances')"
            >
                🚚 Transhumances
            </button>
        </div>
        
        <!-- Loading -->
        <LoadingSpinner v-if="isLoading" text="Chargement..." />
        
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
        
        <!-- Contenu -->
        <template v-else>
            <!-- Empty state -->
            <ModernCard v-if="currentData.length === 0" class="empty-card">
                <div class="empty-content">
                    <span class="empty-icon">
                        {{ activeTab === 'nourrissements' ? '🍯' : activeTab === 'traitements' ? '💊' : activeTab === 'recoltes' ? '🍯' : '🚚' }}
                    </span>
                    <h3>Aucune entrée</h3>
                    <p>Commencez par ajouter votre première entrée</p>
                </div>
            </ModernCard>
            
            <!-- Liste des entrées -->
            <div class="entries-list" v-else>
                <!-- Nourrissements -->
                <template v-if="activeTab === 'nourrissements'">
                    <ModernCard v-for="item in nourrissements" :key="item._id" class="entry-card">
                        <div class="entry-header">
                            <div class="entry-icon">🍯</div>
                            <div class="entry-info">
                                <h3>{{ item.typeNourriture }}</h3>
                                <span class="entry-date">{{ formatFullDate(item.dateNourrissement) }}</span>
                            </div>
                            <div class="entry-badge" v-if="item.is_organique">🌿 Bio</div>
                        </div>
                        <div class="entry-body">
                            <div class="entry-detail">
                                <span class="detail-label">Ruche:</span>
                                <span>{{ item.rucheId?.nom_ruche || 'Non spécifiée' }}</span>
                            </div>
                            <div class="entry-detail">
                                <span class="detail-label">Quantité:</span>
                                <span class="detail-value">{{ item.quantiteKg }} kg</span>
                            </div>
                            <div class="entry-detail">
                                <span class="detail-label">Raison:</span>
                                <span>{{ item.raison }}</span>
                            </div>
                            <!-- <p class="entry-remarks" v-if="item.remarques">{{ item.remarques }}</p> -->
                        </div>
                    </ModernCard>
                </template>
                
                <!-- Traitements -->
                <template v-if="activeTab === 'traitements'">
                    <ModernCard v-for="item in traitements" :key="item._id" class="entry-card">
                        <div class="entry-header">
                            <div class="entry-icon">💊</div>
                            <div class="entry-info">
                                <h3>{{ item.typeTraitement }}</h3>
                                <span class="entry-date">{{ formatFullDate(item.dateTraitement) }}</span>
                            </div>
                        </div>
                        <div class="entry-body">
                            <div class="entry-detail">
                                <span class="detail-label">Ruche:</span>
                                <span>{{ item.rucheId?.nom_ruche || 'Non spécifiée' }}</span>
                            </div>
                            <div class="entry-detail">
                                <span class="detail-label">Produit:</span>
                                <span>{{ item.produitUtilise }}</span>
                            </div>
                            <div class="entry-detail">
                                <span class="detail-label">Dosage:</span>
                                <span class="detail-value">{{ item.dosageMg }} mg</span>
                            </div>
                            <div class="entry-detail">
                                <span class="detail-label">Durée:</span>
                                <span>{{ item.dureeTraitementJours }} jours</span>
                            </div>
                            <div class="entry-detail">
                                <span class="detail-label">Vétérinaire:</span>
                                <span>{{ item.veterinaire }}</span>
                            </div>
                        </div>
                    </ModernCard>
                </template>
                
                <!-- Récoltes -->
                <template v-if="activeTab === 'recoltes'">
                    <ModernCard v-for="item in recoltes" :key="item._id" class="entry-card">
                        <div class="entry-header">
                            <div class="entry-icon">🍯</div>
                            <div class="entry-info">
                                <h3>{{ item.typeMiel || 'Miel' }}</h3>
                                <span class="entry-date">{{ formatFullDate(item.dateRecolte) }}</span>
                            </div>
                            <div class="entry-badge quality" :class="item.qualiteMiel">
                                {{ item.qualiteMiel }}
                            </div>
                        </div>
                        <div class="entry-body">
                            <div class="entry-detail">
                                <span class="detail-label">Ruche:</span>
                                <span>{{ item.rucheId?.nom_ruche || 'Non spécifiée' }}</span>
                            </div>
                            <div class="entry-detail">
                                <span class="detail-label">Quantité:</span>
                                <span class="detail-value highlight">{{ item.quantiteMielKg }} kg</span>
                            </div>
                        </div>
                    </ModernCard>
                </template>
                
                <!-- Transhumances -->
                <template v-if="activeTab === 'transhumances'">
                    <ModernCard v-for="item in transhumances" :key="item._id" class="entry-card">
                        <div class="entry-header">
                            <div class="entry-icon">🚚</div>
                            <div class="entry-info">
                                <h3>Transhumance</h3>
                                <span class="entry-date">{{ formatFullDate(item.dateDepart) }}</span>
                            </div>
                        </div>
                        <div class="entry-body">
                            <div class="entry-detail">
                                <span class="detail-label">Destination:</span>
                                <span>{{ item.rucherDestination || 'Non spécifiée' }}</span>
                            </div>
                        </div>
                    </ModernCard>
                </template>
            </div>
        </template>
        
        <!-- Modal de création -->
        <div class="modal-overlay" v-if="showCreateModal" @click.self="showCreateModal = false">
            <ModernCard class="create-modal">
                <div class="modal-header">
                    <h2>
                        {{ createType === 'nourrissement' ? '🍯 Nouveau nourrissement' : 
                           createType === 'traitement' ? '💊 Nouveau traitement' : '🍯 Nouvelle récolte' }}
                    </h2>
                    <button class="close-btn" @click="showCreateModal = false">✕</button>
                </div>
                
                <form class="modal-body" @submit.prevent="createEntry">
                    <!-- Sélection de la ruche (commun) -->
                    <div class="form-field">
                        <label>Ruche *</label>
                        <select 
                            v-model="selectedRucheId"
                            class="select-field"
                            required
                        >
                            <option value="">Sélectionner une ruche</option>
                            <option v-for="ruche in ruches" :key="ruche._id" :value="ruche._id">
                                {{ ruche.nom_ruche }}
                            </option>
                        </select>
                    </div>
                    
                    <!-- Formulaire Nourrissement -->
                    <template v-if="createType === 'nourrissement'">
                        <div class="form-field">
                            <label>Date *</label>
                            <input type="date" v-model="newNourrissement.dateNourrissement" class="input-field" required />
                        </div>
                        <div class="form-row">
                            <div class="form-field">
                                <label>Type de nourriture *</label>
                                <select v-model="newNourrissement.typeNourriture" class="select-field" required>
                                    <option v-for="type in typesNourriture" :key="type" :value="type">{{ type }}</option>
                                </select>
                            </div>
                            <div class="form-field">
                                <label>Quantité (kg) *</label>
                                <input type="number" step="0.1" v-model="newNourrissement.quantiteKg" class="input-field" required />
                            </div>
                        </div>
                        <div class="form-field">
                            <label>Raison *</label>
                            <select v-model="newNourrissement.raison" class="select-field" required>
                                <option v-for="raison in raisonsNourrissement" :key="raison" :value="raison">{{ raison }}</option>
                            </select>
                        </div>
                        <div class="form-field checkbox">
                            <label>
                                <input type="checkbox" v-model="newNourrissement.is_organique" />
                                🌿 Produit biologique
                            </label>
                        </div>
                    </template>
                    
                    <!-- Formulaire Traitement -->
                    <template v-if="createType === 'traitement'">
                        <div class="form-field">
                            <label>Date *</label>
                            <input type="date" v-model="newTraitement.dateTraitement" class="input-field" required />
                        </div>
                        <div class="form-field">
                            <label>Type de traitement *</label>
                            <select v-model="newTraitement.typeTraitement" class="select-field" required>
                                <option v-for="type in typesTraitement" :key="type" :value="type">{{ type }}</option>
                            </select>
                        </div>
                        <div class="form-field">
                            <label>Produit utilisé *</label>
                            <input type="text" v-model="newTraitement.produitUtilise" class="input-field" required />
                        </div>
                        <div class="form-row">
                            <div class="form-field">
                                <label>Dosage (mg) *</label>
                                <input type="number" v-model="newTraitement.dosageMg" class="input-field" required />
                            </div>
                            <div class="form-field">
                                <label>Durée (jours) *</label>
                                <input type="number" v-model="newTraitement.dureeTraitementJours" class="input-field" required />
                            </div>
                        </div>
                        <div class="form-field">
                            <label>Vétérinaire *</label>
                            <input type="text" v-model="newTraitement.veterinaire" class="input-field" required />
                        </div>
                    </template>
                    
                    <!-- Formulaire Récolte -->
                    <template v-if="createType === 'recolte'">
                        <div class="form-field">
                            <label>Date *</label>
                            <input type="date" v-model="newRecolte.dateRecolte" class="input-field" required />
                        </div>
                        <div class="form-row">
                            <div class="form-field">
                                <label>Quantité (kg) *</label>
                                <input type="number" step="0.1" v-model="newRecolte.quantiteMielKg" class="input-field" required />
                            </div>
                            <div class="form-field">
                                <label>Type de miel *</label>
                                <input type="text" v-model="newRecolte.typeMiel" class="input-field" placeholder="Ex: Acacia, Toutes fleurs..." required />
                            </div>
                        </div>
                        <div class="form-field">
                            <label>Qualité *</label>
                            <select v-model="newRecolte.qualiteMiel" class="select-field" required>
                                <option v-for="q in qualitesMiel" :key="q" :value="q">{{ q }}</option>
                            </select>
                        </div>
                    </template>
                    
                    <!-- Erreur -->
                    <div v-if="createError" class="create-error">⚠️ {{ createError }}</div>
                    
                    <div class="modal-actions">
                        <ModernButton type="button" variant="secondary" @click="showCreateModal = false">
                            Annuler
                        </ModernButton>
                        <ModernButton type="submit" variant="primary" :loading="isCreating">
                            Créer
                        </ModernButton>
                    </div>
                </form>
            </ModernCard>
        </div>
    </div>
</template>

<style scoped>
.carnet-page {
    padding: var(--bee-spacing-md);
    max-width: 1200px;
    margin: 0 auto;
}

/* Header */
.page-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: var(--bee-spacing-lg);
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

/* Tabs */
.tabs {
    display: flex;
    gap: var(--bee-spacing-xs);
    margin-bottom: var(--bee-spacing-lg);
    padding: var(--bee-spacing-xs);
    background: var(--bee-surface);
    border-radius: var(--bee-radius-lg);
    box-shadow: var(--bee-shadow-sm);
    overflow-x: auto;
}

.tab {
    flex: 1;
    min-width: 120px;
    padding: var(--bee-spacing-sm) var(--bee-spacing-md);
    border: none;
    border-radius: var(--bee-radius-md);
    background: transparent;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--bee-transition-fast);
    white-space: nowrap;
}

.tab:hover {
    background: var(--bee-gray-100);
}

.tab.active {
    background: var(--bee-gradient-primary);
    color: white;
}

/* Entries List */
.entries-list {
    display: grid;
    gap: var(--bee-spacing-md);
}

.entry-card {
    cursor: pointer;
    transition: all var(--bee-transition-normal);
}

.entry-card:hover {
    transform: translateY(-2px);
}

.entry-header {
    display: flex;
    align-items: center;
    gap: var(--bee-spacing-md);
    margin-bottom: var(--bee-spacing-md);
    padding-bottom: var(--bee-spacing-sm);
    border-bottom: 1px solid var(--bee-gray-200);
}

.entry-icon {
    font-size: 32px;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--bee-gray-100);
    border-radius: var(--bee-radius-md);
}

.entry-info {
    flex: 1;
}

.entry-info h3 {
    font-size: 16px;
    margin: 0 0 2px;
    text-transform: capitalize;
}

.entry-date {
    font-size: 12px;
    color: var(--bee-on-surface-variant);
}

.entry-badge {
    padding: 4px 10px;
    background: rgba(76, 175, 80, 0.15);
    color: var(--bee-success);
    border-radius: var(--bee-radius-sm);
    font-size: 11px;
    font-weight: 600;
}

.entry-badge.quality {
    background: var(--bee-gray-100);
    color: var(--bee-on-surface);
}

.entry-badge.quality.excellente { background: rgba(76, 175, 80, 0.15); color: var(--bee-success); }
.entry-badge.quality.bonne { background: rgba(33, 150, 243, 0.15); color: var(--bee-info); }
.entry-badge.quality.moyenne { background: rgba(255, 152, 0, 0.15); color: var(--bee-warning); }
.entry-badge.quality.faible { background: rgba(244, 67, 54, 0.15); color: var(--bee-error); }

.entry-body {
    display: flex;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: var(--bee-spacing-sm) var(--bee-spacing-lg);
}

.entry-detail {
    font-size: 15px;
}

.detail-label {
    color: var(--bee-on-surface-variant);
    margin-right: var(--bee-spacing-xs);
}

.detail-value {
    font-weight: 600;
    color: var(--bee-honey);
}

.detail-value.highlight {
    font-size: 15px;
}

.entry-remarks {
    width: 100%;
    font-size: 12px;
    color: var(--bee-on-surface-variant);
    font-style: italic;
    margin: var(--bee-spacing-sm) 0 0;
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
    font-size: 18px;
    margin: 0;
}

.close-btn {
    background: none;
    border: none;
    font-size: 20px;
    cursor: pointer;
    padding: var(--bee-spacing-xs);
    color: var(--bee-on-surface-variant);
}

.modal-body {
    display: flex;
    flex-direction: column;
    gap: var(--bee-spacing-md);
}

.form-field {
    display: flex;
    flex-direction: column;
    gap: var(--bee-spacing-xs);
}

.form-field label {
    font-size: 13px;
    font-weight: 600;
    color: var(--bee-on-surface);
}

.form-field.checkbox label {
    flex-direction: row;
    align-items: center;
    gap: var(--bee-spacing-sm);
    cursor: pointer;
}

.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--bee-spacing-md);
}

.input-field, .select-field {
    padding: var(--bee-spacing-sm) var(--bee-spacing-md);
    border: 2px solid var(--bee-gray-200);
    border-radius: var(--bee-radius-md);
    font-size: 14px;
    font-family: inherit;
}

.input-field:focus, .select-field:focus {
    outline: none;
    border-color: var(--bee-honey);
}

.create-error {
    padding: var(--bee-spacing-sm);
    background: rgba(244, 67, 54, 0.1);
    border-radius: var(--bee-radius-md);
    color: var(--bee-error);
    font-size: 13px;
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

/* Responsive */
@media (max-width: 768px) {
    .tabs {
        flex-wrap: nowrap;
    }
    
    .tab {
        min-width: 100px;
        font-size: 12px;
    }
    
    .form-row {
        grid-template-columns: 1fr;
    }
}
</style>
