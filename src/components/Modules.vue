<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { DeviceService } from '../services/api.service.js';
import { BeeColors, formatWeightDelta, formatDate } from '../theme.js';
import ModernCard from './ui/ModernCard.vue';
import ModernButton from './ui/ModernButton.vue';
import StatusBadge from './ui/StatusBadge.vue';
import WeightDelta from './ui/WeightDelta.vue';
import LoadingSpinner from './ui/LoadingSpinner.vue';

const router = useRouter();

// État
const modules = ref([]);
const gateways = ref([]);
const overview = ref(null);
const isLoading = ref(true);
const error = ref(null);
const searchQuery = ref('');
const filterStatus = ref('all'); // all, active, inactive

// Charger les données
async function loadModules() {
    isLoading.value = true;
    error.value = null;
    
    try {
        const result = await DeviceService.getModulesOverview();
        if (result.ok && result.data) {
            overview.value = result.data;
            modules.value = result.data.modules || [];
        }

        // Charger les gateways
        const gatewaysResult = await DeviceService.getGatewaysForUser();
        if (gatewaysResult.ok && gatewaysResult.data) {
            // console.log("Retour API Gateways:", gatewaysResult.data);
            gateways.value = gatewaysResult.data.gateways // Récupère toutes les gateways et leurs modules
            // 🔍 VISUALISATION COMPLÈTE
            console.log('📡 gateways.value:', gateways.value);          
            console.log('════════════════════════════════════════');
        }

    } catch (err) {
        console.error('Erreur lors du chargement des modules:', err);
        error.value = err.message || 'Erreur lors du chargement';
    } finally {
        isLoading.value = false;
    }
}

// Modules filtrés
//const filteredModules = computed(() => {
const filteredGateways = computed(() => {

    // let result = modules.value;
    let result = gateways.value;
    
    // Filtre par status
    if (filterStatus.value !== 'all') {
        result = result.filter(m => m.status === filterStatus.value);
    }
    
    // Filtre par recherche
    if (searchQuery.value.trim()) {
        const query = searchQuery.value.toLowerCase();
        result = result.filter(gw => 
            gw.nom?.toLowerCase().includes(query)
        );
    }
    
    return result;
});

// Navigation vers le détail
function goToModule(moduleId) {
    router.push(`/Dashboard/module/${moduleId}`);
}

onMounted(loadModules);
</script>

<template>
    <div class="modules-page">
        <!-- Header -->
        <div class="page-header">
            <div class="header-content">
                <h1>🛜 Mes Modules</h1>
                <p class="subtitle">Gérez vos modules de pesée et suivez l'évolution de vos ruches</p>
            </div>
            <ModernButton @click="loadModules" :loading="isLoading" variant="outline">
                🔄 Actualiser
            </ModernButton>
        </div>
        
        <!-- Stats Overview -->
        <div class="stats-overview" v-if="overview && !isLoading">
            <ModernCard class="stat-card">
                <div class="stat-icon">📦</div>
                <div class="stat-info">
                    <div class="stat-value">{{ overview.totalModules }}</div>
                    <div class="stat-label">Total modules</div>
                </div>
            </ModernCard>
            
            <ModernCard class="stat-card">
                <div class="stat-icon">✅</div>
                <div class="stat-info">
                    <div class="stat-value" :style="{ color: BeeColors.success }">
                        {{ overview.activeModules }}
                    </div>
                    <div class="stat-label">Modules actifs</div>
                </div>
            </ModernCard>
            
            <ModernCard class="stat-card">
                <WeightDelta
                    :value="overview.totalWeight24h"
                    label="Total 24h"
                    icon="⏱️"
                    :compact="true"
                />
            </ModernCard>
            
            <ModernCard class="stat-card">
                <WeightDelta
                    :value="overview.totalWeight8d"
                    label="Total 8 jours"
                    icon="📅"
                    :compact="true"
                />
            </ModernCard>
        </div>
        
        <!-- Filtres -->
        <div class="filters-bar">
            <div class="search-box">
                <span class="search-icon">🔍</span>
                <input
                    v-model="searchQuery"
                    type="text"
                    placeholder="Rechercher un module..."
                    class="search-input"
                />
            </div>
            
            <div class="status-filters">
                <button
                    :class="['filter-btn', { active: filterStatus === 'all' }]"
                    @click="filterStatus = 'all'"
                >
                    Tous
                </button>
                <button
                    :class="['filter-btn', { active: filterStatus === 'active' }]"
                    @click="filterStatus = 'active'"
                >
                    ✅ Actifs
                </button>
                <button
                    :class="['filter-btn', { active: filterStatus === 'inactive' }]"
                    @click="filterStatus = 'inactive'"
                >
                    ⏸️ Inactifs
                </button>
            </div>
        </div>
        
        <!-- Loading -->
        <LoadingSpinner v-if="isLoading" text="Chargement des modules..." />
        
        <!-- Error -->
        <ModernCard v-else-if="error" variant="outlined" class="error-card">
            <div class="error-content">
                <span class="error-icon">⚠️</span>
                <p>{{ error }}</p>
                <ModernButton @click="loadModules" variant="primary">
                    Réessayer
                </ModernButton>
            </div>
        </ModernCard>
        
        <!-- Empty state -->
        <ModernCard v-else-if="filteredGateways.length === 0" class="empty-card">
            <div class="empty-content">
                <span class="empty-icon">📦</span>
                <h3>Aucun module trouvé</h3>
                <p v-if="searchQuery || filterStatus !== 'all'">
                    Essayez de modifier vos filtres de recherche
                </p>
                <p v-else>
                    Vous n'avez pas encore de modules assignés à votre compte
                </p>
            </div>
        </ModernCard>
        
        <!-- Liste des modules -->
        <div class="gateways-grid" v-else>
            <ModernCard
                v-for="gateway in filteredGateways"
                :key="gateway._id"
                hoverable
                :active="gateway.status === 'active'"
                class="gateway-card"
            > <!--Voir pour modifier -->
                <div class="module-header">
                    <div class="module-title" >
                        <h3>📡 {{ gateway.nom || 'Module sans nom' }}</h3>
                        <StatusBadge :status="gateway.status" />
                    </div>
                </div>
                
                <div class="module-body">

                    <div class="module-gateway" v-for="mod in gateway.modules"> <!--On affiche tous les modules rattachés à la gateway-->
                        <div class="card-mod-title" @click="goToModule(mod._id)">{{mod.name}}</div>
                        <p v-if="mod.type === 'BScale'">
                            {{ mod.lastMeasurement.data.Poids.toFixed(1) || '--' }} kg
                        </p>
                        <p v-else-if="mod.type === 'BTemp'">
                             {{ mod.lastMeasurement.data.TempI.toFixed(1) || '--' }} °C
                        </p>
                        <p v-else-if="mod.type === 'BWeath'">
                             {{ mod.lastMeasurement.data.HygE.toFixed(1) || '--' }} %HR /
                             {{ mod.lastMeasurement.data.TempE.toFixed(1) || '--' }} °C /
                             {{ mod.lastMeasurement.data.Pression.toFixed(1) || '--' }} hPa
                        </p>
                    </div>
                    
                </div>
                
                <!-- <div class="module-footer">
                </div> -->
            </ModernCard>
        </div>
    </div>
</template>

<style scoped>
.modules-page {
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

/* Stats Overview */
.stats-overview {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--bee-spacing-md);
    margin-bottom: var(--bee-spacing-xl);
}

.stat-card {
    display: flex;
    align-items: center;
    gap: var(--bee-spacing-md);
}

.stat-icon {
    font-size: 32px;
}

.stat-value {
    font-size: 24px;
    font-weight: 700;
    color: var(--bee-honey);
}

.stat-label {
    font-size: 12px;
    color: var(--bee-on-surface-variant);
}

/* Filtres */
.filters-bar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--bee-spacing-md);
    margin-bottom: var(--bee-spacing-lg);
    flex-wrap: wrap;
}

.search-box {
    display: flex;
    align-items: center;
    gap: var(--bee-spacing-sm);
    padding: var(--bee-spacing-sm) var(--bee-spacing-md);
    background: var(--bee-surface);
    border-radius: var(--bee-radius-md);
    box-shadow: var(--bee-shadow-sm);
    flex: 1;
    max-width: 400px;
}

.search-icon {
    font-size: 16px;
}

.search-input {
    flex: 1;
    border: none;
    outline: none;
    font-size: 14px;
    background: transparent;
    font-family: inherit;
}

.status-filters {
    display: flex;
    gap: var(--bee-spacing-xs);
}

.filter-btn {
    padding: var(--bee-spacing-xs) var(--bee-spacing-md);
    border: none;
    border-radius: var(--bee-radius-md);
    background: var(--bee-surface);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--bee-transition-fast);
}

.filter-btn:hover {
    background: var(--bee-gray-100);
}

.filter-btn.active {
    background: var(--bee-gradient-primary);
    color: white;
}

/* Modules Grid */
/* .modules-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: var(--bee-spacing-md);
} */

.gateways-grid{
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
    gap: var(--bee-spacing-md);
}
/* 
.module-card {
    cursor: pointer;
    display: flex;
    flex-direction: column;
} */

.gateway-card{
    cursor: pointer;
    display: flex;
    flex-direction: column;
}

.card-mod-title{
    font-weight: 600px;
}

.card-mod-title:hover{
    color: orange;
}

.module-header {
    margin-bottom: var(--bee-spacing-md);
    padding-bottom: var(--bee-spacing-sm);
    border-bottom: 1px solid var(--bee-gray-200);
}

.module-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--bee-spacing-sm);
}

.module-title h3 {
    font-size: 16px;
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.module-gateway {
    font-size: 12px;
    font-style: bold;
    color: var(--bee-on-surface-variant);
    margin-top: var(--bee-spacing-xs);
    display: flex;
    justify-content: space-between;
    padding-right: 30px;
}

.module-body {
    flex: 1;
}

.weight-display {
    margin-bottom: var(--bee-spacing-md);
}

.weight-current {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--bee-spacing-md);
    background: var(--bee-gray-100);
    border-radius: var(--bee-radius-md);
}

.weight-label {
    font-size: 12px;
    color: var(--bee-on-surface-variant);
}

.weight-value {
    font-size: 28px;
    font-weight: 700;
    color: var(--bee-honey);
}

.deltas-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--bee-spacing-sm);
}

.module-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: var(--bee-spacing-md);
    padding-top: var(--bee-spacing-sm);
    border-top: 1px solid var(--bee-gray-200);
}

.last-update {
    font-size: 11px;
    color: var(--bee-on-surface-variant);
}

.view-details {
    font-size: 12px;
    font-weight: 600;
    color: var(--bee-honey);
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
    margin: 0;
}

/* Responsive */
@media (max-width: 1024px) {
    .stats-overview {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 768px) {
    .page-header {
        flex-direction: column;
        gap: var(--bee-spacing-md);
    }
    
    .filters-bar {
        flex-direction: column;
        align-items: stretch;
    }
    
    .search-box {
        max-width: none;
    }
    
    .status-filters {
        justify-content: center;
    }
    
    .stats-overview {
        grid-template-columns: 1fr 1fr;
    }
}
</style>
