<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { DeviceService, DataService } from '../services/api.service.js';
import { BeeColors, formatWeightDelta, formatDate, formatFullDate } from '../theme.js';
import ModernCard from './ui/ModernCard.vue';
import ModernButton from './ui/ModernButton.vue';
import StatusBadge from './ui/StatusBadge.vue';
import WeightDelta from './ui/WeightDelta.vue';
import LoadingSpinner from './ui/LoadingSpinner.vue';
import MeasurementsChart from './GrapheModule.vue';

const route = useRoute();
const router = useRouter();

// Props
const props = defineProps({ //récupère l'id pour afficher en fonction
    moduleId: {
        type: String,
        default: null
    }
});

// État
const module = ref(null);
const grapheModuletype = ref(null);
const measurements = ref([]);
const isLoading = ref(true);
const isLoadingHistory = ref(false);
const error = ref(null);
const selectedPeriod = ref('7d'); // 24h, 7d, 30d, all

// ID du module (depuis props ou route)
const currentModuleId = computed(() => props.moduleId || route.params.moduleId);

// Charger les infos du module
async function loadModuleInfo() {
    if (!currentModuleId.value) {
        error.value = 'ID du module manquant';
        isLoading.value = false;
        return;
    }
    
    isLoading.value = true;
    error.value = null;
    
    try {
        // Charger les infos de poids du module
        const result = await DeviceService.getModuleWeight(currentModuleId.value);
        if (result.ok && result.data) {
            module.value = result.data;
        }

        const temp = await DeviceService.getModuleInfo(currentModuleId.value);
        console.log("Temp:",temp)
        if (temp.ok && temp.data) {
            grapheModuletype.value = temp.data.module.type;
            console.log("Graphe value:",grapheModuletype.value)
        }
        
        // Charger l'historique
        await loadHistory();
    } catch (err) {
        console.error('Erreur lors du chargement du module:', err);
        error.value = err.message || 'Erreur lors du chargement';
    } finally {
        isLoading.value = false;
    }
}

// Charger l'historique des mesures
async function loadHistory() {
    if (!currentModuleId.value) return;
    
    isLoadingHistory.value = true;
    
    try {
        const options = {};
        const now = new Date();
        
        switch (selectedPeriod.value) {
            case '24h':
                options.fromDate = new Date(now - 24 * 60 * 60 * 1000).toISOString();
                break;
            case '7d':
                options.fromDate = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString();
                break;
            case '30d':
                options.fromDate = new Date(now - 30 * 24 * 60 * 60 * 1000).toISOString();
                break;
            default:
                options.limit = 100;
        }
        
        const result = await DataService.getModuleMeasurements(currentModuleId.value, options);
        if (result.ok && result.data) {
            measurements.value = result.data.measurements || [];
        }
    } catch (err) {
        console.error('Erreur lors du chargement de l\'historique:', err);
    } finally {
        isLoadingHistory.value = false;
    }
}

// Calculer les stats de l'historique
const historyStats = computed(() => {
    if (!measurements.value.length) return null;
    
    const weights = measurements.value
        .filter(m => m.data?.Poids != null)
        .map(m => m.data.Poids);
    
    if (!weights.length) return null;
    
    return {
        min: Math.min(...weights).toFixed(1),
        max: Math.max(...weights).toFixed(1),
        avg: (weights.reduce((a, b) => a + b, 0) / weights.length).toFixed(1),
        count: measurements.value.length
    };
});

// Dernière mesure
const lastMeasurement = computed(() => {
    if (!measurements.value.length) return null;
    return measurements.value[0];
});

// Retour à la liste
function goBack() {
    router.push('/Dashboard/modules');
}

// Watchers
watch(selectedPeriod, () => {
    loadHistory();
});

watch(currentModuleId, () => {
    if (currentModuleId.value) {
        loadModuleInfo();
    }
});

onMounted(loadModuleInfo);
</script>

<template>
    <div class="module-detail-page">
        <!-- Header avec navigation -->
        <div class="page-header">
            <button class="back-btn" @click="goBack">
                ← Retour aux modules
            </button>
            <ModernButton @click="loadModuleInfo" :loading="isLoading" variant="outline" size="sm">
                🔄 Actualiser
            </ModernButton>
        </div>
        
        <!-- Loading -->
        <LoadingSpinner v-if="isLoading" text="Chargement du module..." />
        
        <!-- Error -->
        <ModernCard v-else-if="error" variant="outlined" class="error-card">
            <div class="error-content">
                <span class="error-icon">⚠️</span>
                <p>{{ error }}</p>
                <ModernButton @click="loadModuleInfo" variant="primary">
                    Réessayer
                </ModernButton>
            </div>
        </ModernCard>
        
        <!-- Contenu -->
        <template v-else-if="module">
            <!-- Infos principales -->
            <div class="module-hero">
                <ModernCard class="hero-card">
                    <div class="hero-header">
                        <div class="hero-title">
                            <h3>{{ module.name }}</h3>
                            <StatusBadge :status="module.status" />
                        </div>
                    </div>
                    
                    <!-- <div class="hero-body">                        -->
                        <!-- Deltas -->
                        <!-- <div class="deltas-grid">
                            <WeightDelta
                                :value="module.deltaWeight24h"
                                label="Dernières 24h"
                                icon="⏱️"
                            />
                            <WeightDelta
                                :value="module.deltaWeight8d"
                                label="8 derniers jours"
                                icon="📅"
                            />
                        </div> -->
                    <!-- </div> -->
                </ModernCard>
            </div>
            
            <!-- Dernières valeurs -->
            <div class="last-values" v-if="lastMeasurement">
                <h2>📊 Dernières mesures</h2>
                <div class="values-grid">
                    <ModernCard v-if="lastMeasurement.data?.TempE != null" class="value-card">
                        <div class="value-icon">🌡️</div>
                        <div class="value-info">
                            <span class="value-number">{{ lastMeasurement.data.TempE?.toFixed(1) }}°C</span>
                            <span class="value-label">Temp. extérieure</span>
                        </div>
                    </ModernCard>
                    
                    <ModernCard v-if="lastMeasurement.data?.TempI != null" class="value-card">
                        <div class="value-icon">🌡️</div>
                        <div class="value-info">
                            <span class="value-number">{{ lastMeasurement.data.TempI?.toFixed(1) }}°C</span>
                            <span class="value-label">Temp. intérieure</span>
                        </div>
                    </ModernCard>
                    
                    <ModernCard v-if="lastMeasurement.data?.HygE != null" class="value-card">
                        <div class="value-icon">💧</div>
                        <div class="value-info">
                            <span class="value-number">{{ lastMeasurement.data.HygE?.toFixed(0) }}%</span>
                            <span class="value-label">Humidité</span>
                        </div>
                    </ModernCard>
                    
                    <ModernCard v-if="lastMeasurement.data?.Pression != null" class="value-card">
                        <div class="value-icon">💨</div>
                        <div class="value-info">
                            <span class="value-number">{{ lastMeasurement.data.Pression?.toFixed(0) }} hPa</span>
                            <span class="value-label">Pression atmosphérique</span>
                        </div>
                    </ModernCard>

                    
                    <ModernCard v-if="lastMeasurement.data?.Poids != null" class="value-card">
                        <div class="value-icon">⚖️</div>
                        <div class="value-info">
                            <span class="value-number">{{ (lastMeasurement.data.Poids?.toFixed(2)) }} kg</span>
                            <span class="value-label">Poids</span>
                        </div>
                    </ModernCard>
                </div>
            </div>
            
            <!-- Historique -->
            <div class="history-section">
                <div class="section-header">
                    <h2>📈 Historique</h2>
                    <div class="period-selector">
                        <button
                            v-for="period in ['24h', '7d', '30d', 'all']"
                            :key="period"
                            :class="['period-btn', { active: selectedPeriod === period }]"
                            @click="selectedPeriod = period"
                        >
                            {{ period === 'all' ? 'Tout' : period }}
                        </button>
                    </div>
                </div>
                
                <!-- Stats de l'historique -->
                <div class="history-stats" v-if="historyStats">
                    <ModernCard class="stat-mini">
                        <span class="stat-label">Min</span>
                        <span class="stat-value">{{ historyStats.min }} kg</span>
                    </ModernCard>
                    <ModernCard class="stat-mini">
                        <span class="stat-label">Max</span>
                        <span class="stat-value">{{ historyStats.max }} kg</span>
                    </ModernCard>
                    <ModernCard class="stat-mini">
                        <span class="stat-label">Moyenne</span>
                        <span class="stat-value">{{ historyStats.avg }} kg</span>
                    </ModernCard>
                    <ModernCard class="stat-mini">
                        <span class="stat-label">Mesures</span>
                        <span class="stat-value">{{ historyStats.count }}</span>
                    </ModernCard>
                </div>
                
                <!-- Loading historique -->
                <LoadingSpinner v-if="isLoadingHistory" size="sm" text="Chargement..." />
                
                <!-- Tableau des mesures -->
                <ModernCard v-else-if="measurements.length > 0" class="history-table-card">
                      <MeasurementsChart
                        :measurements="measurements"
                        :type="grapheModuletype"
                      />
                </ModernCard>
                
                <!-- Empty state -->
                <ModernCard v-else class="empty-history">
                    <div class="empty-content">
                        <span class="empty-icon">📊</span>
                        <p>Aucune mesure pour cette période</p>
                    </div>
                </ModernCard>
            </div>
        </template>
    </div>
</template>

<style scoped>
.module-detail-page {
    padding: var(--bee-spacing-md);
    max-width: 1200px;
    margin: 0 auto;
}

/* Header */
.page-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--bee-spacing-lg);
}

.back-btn {
    background: none;
    border: none;
    font-size: 14px;
    font-weight: 600;
    color: var(--bee-on-surface-variant);
    cursor: pointer;
    padding: var(--bee-spacing-sm);
    border-radius: var(--bee-radius-sm);
    transition: all var(--bee-transition-fast);
}

.back-btn:hover {
    color: var(--bee-honey);
}

/* Hero Section */
.module-hero {
    margin-bottom: var(--bee-spacing-xl);
}

.hero-card {
    background: var(--bee-gradient-primary);
    color: white;
}

.hero-header {
    display: flex;
    justify-content: center;
    align-items: center;
}

.hero-title {
    display: flex;
    align-items: center;
    color: black;
    gap: var(--bee-spacing-md);
}

.hero-title h1 {
    font-size: 24px;
    margin: 0;
    color: white;
}

.hero-body {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: var(--bee-spacing-xl);
    align-items: center;
}

.current-weight {
    text-align: center;
    padding: var(--bee-spacing-lg);
    background: rgba(255, 255, 255, 0.2);
    border-radius: var(--bee-radius-lg);
}

.weight-label {
    display: block;
    font-size: 14px;
    opacity: 0.9;
    margin-bottom: var(--bee-spacing-sm);
}

.weight-value {
    font-size: 48px;
    font-weight: 700;
}

.weight-unit {
    font-size: 24px;
    font-weight: 400;
}

.deltas-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--bee-spacing-md);
}

/* Dernières valeurs */
.last-values {
    margin-bottom: var(--bee-spacing-xl);
}

.last-values h2 {
    font-size: 18px;
    margin: 0 0 var(--bee-spacing-md);
}

.values-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: var(--bee-spacing-md);
}

.value-card {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--bee-spacing-md);
}

.value-icon {
    font-size: 28px;
}

.value-number {
    display: block;
    font-size: 20px;
    font-weight: 700;
    color: var(--bee-honey);
}

.value-label {
    display: block;
    font-size: 12px;
    color: var(--bee-on-surface-variant);
}

/* Historique */
.history-section {
    margin-bottom: var(--bee-spacing-xl);
}

.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: var(--bee-spacing-md);
    flex-wrap: wrap;
    gap: var(--bee-spacing-md);
}

.section-header h2 {
    font-size: 18px;
    margin: 0;
}

.period-selector {
    display: flex;
    gap: var(--bee-spacing-xs);
}

.period-btn {
    padding: var(--bee-spacing-xs) var(--bee-spacing-md);
    border: none;
    border-radius: var(--bee-radius-md);
    background: var(--bee-surface);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all var(--bee-transition-fast);
}

.period-btn:hover {
    background: var(--bee-gray-100);
}

.period-btn.active {
    background: var(--bee-gradient-primary);
    color: white;
}

.history-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: var(--bee-spacing-sm);
    margin-bottom: var(--bee-spacing-md);
}

.stat-mini {
    text-align: center;
    padding: var(--bee-spacing-sm) !important;
}

.stat-mini .stat-label {
    display: block;
    font-size: 11px;
    color: var(--bee-on-surface-variant);
}

.stat-mini .stat-value {
    display: block;
    font-size: 16px;
    font-weight: 700;
    color: var(--bee-honey);
}

/* Tableau */
.history-table-card {
    overflow: hidden;
}

.table-wrapper {
    overflow-x: auto;
}

.history-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
}

.history-table th,
.history-table td {
    padding: var(--bee-spacing-sm) var(--bee-spacing-md);
    text-align: left;
    border-bottom: 1px solid var(--bee-gray-200);
}

.history-table th {
    font-weight: 600;
    color: var(--bee-on-surface-variant);
    background: var(--bee-gray-100);
}

.history-table .weight-cell {
    font-weight: 600;
    color: var(--bee-honey);
}

.table-footer {
    padding: var(--bee-spacing-sm);
    text-align: center;
    font-size: 12px;
    color: var(--bee-on-surface-variant);
    border-top: 1px solid var(--bee-gray-200);
}

/* États */
.error-card, .empty-history {
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
    .hero-body {
        grid-template-columns: 1fr;
    }
    
    .deltas-grid {
        grid-template-columns: 1fr;
    }
    
    .history-stats {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .weight-value {
        font-size: 36px;
    }
}
</style>
