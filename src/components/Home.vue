<script setup>
import { onMounted, ref, watch, computed } from 'vue';
import L from 'leaflet';
import { DeviceService, RucherService } from '../services/api.service.js';
import { BeeColors, formatWeightDelta,formatDate } from '../theme.js';
import ModernCard from './ui/ModernCard.vue';
import StatusBadge from './ui/StatusBadge.vue';
import WeightDelta from './ui/WeightDelta.vue';
import LoadingSpinner from './ui/LoadingSpinner.vue';

// État
const filters = ['Tout', 'Gateways', 'Ruchers'];
const activeFilter = ref('Tout');
const map = ref(null);
const modulesLayer = ref(null);
const gatewaysLayer = ref(null);
const ruchersLayer = ref(null);

// Données
const gateways = ref([]);
const modules = ref([]);
const ruchers = ref([]);
const radiusMeters = 100; //rayon du cercle de 100m autour des ruchers 
const radiusKiloMeters = 1000; //rayon du cercle de 1km autour des ruchers
const combinedModules = ref([]);
const overview = ref(null);
const isLoading = ref(true);
const error = ref(null);

// Icônes pour la carte

const gatewayIcon = L.divIcon({
    className: 'map-icon gateway-icon',
    html: '📡',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
});

const rucherIcon = L.divIcon({
    className: 'map-icon rucher-icon',
    html: '🐝',
    iconSize: [30, 30],
    iconAnchor: [15, 15]
});

// Charger les données
async function loadData() {
    isLoading.value = true;
    error.value = null;
    
    try {
        // Charger les gateways et leurs modules avec overview
        const overviewResult = await DeviceService.getModulesOverview();//await DeviceService.getModulesOverview();
        if (overviewResult.ok && overviewResult.data) {
            overview.value = overviewResult.data;
            modules.value = overviewResult.data.modules || [];

            console.log('════════════════════════════════════════');
            console.log('📦 RÉSULTAT COMPLET overviewResult:');
            console.log(JSON.stringify(overviewResult, null, 2));
            console.log('════════════════════════════════════════');
            
            console.log('📊 overview.value:', overview.value);
            console.log('🐝 modules.value:', modules.value);

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
        
        // Charger les ruchers
        const ruchersResult = await RucherService.getRuchers();
        if (ruchersResult.ok && ruchersResult.data) {
            ruchers.value = ruchersResult.data.ruchers || [];
        }

    } catch (err) {
        console.error('Erreur lors du chargement des données:', err);
        error.value = err.message || 'Erreur lors du chargement des données';
    } finally {
        isLoading.value = false;
    }
}


// Initialiser la carte
function initMap() {
    if (map.value) return;
    
    map.value = L.map('map').setView([46.603354, 1.888334], 6); // Centre de la France
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap'
    }).addTo(map.value);
    
    gatewaysLayer.value = L.layerGroup().addTo(map.value);
    ruchersLayer.value = L.layerGroup().addTo(map.value);
}

// Mettre à jour les markers sur la carte
function updateMapMarkers(filter) {
    if (!map.value || !gatewaysLayer.value || !ruchersLayer.value) return;
    
    gatewaysLayer.value.clearLayers();
    ruchersLayer.value.clearLayers();
    
    const bounds = [];

    // Afficher les gateways
    if (filter === 'Tout' || filter === 'Gateways') {
        gateways.value.forEach(gateway => {
            if (gateway.location?.latitude && gateway.location?.longitude) {
                const marker = L.marker(
                    [gateway.location.latitude, gateway.location.longitude],
                    { icon: gatewayIcon }
                );

                marker.bindPopup(`
                    <div class="map-popup">
                        <a href="/Dashboard/modules" class="gateway-link">
                             <strong>📡 ${gateway.name || 'Gateway'}</strong>
                        </a>
                        <br>
                        <small>Statut: ${gateway.status || 'Inconnu'}</small>
                    </div>
                `);

                marker.addTo(gatewaysLayer.value);
                bounds.push([gateway.location.latitude, gateway.location.longitude]);
            }
        });
    }

    // Afficher les ruchers
    if (filter === 'Tout' || filter === 'Ruchers') {
        ruchers.value.forEach(rucher => {
            if (rucher.localisation?.latitude && rucher.localisation?.longitude) {
                const marker = L.marker(
                    [rucher.localisation.latitude, rucher.localisation.longitude],
                    { icon: rucherIcon }
                );
                // Créer les cercles
                const rucherCircle = L.circle([rucher.localisation.latitude, rucher.localisation.longitude], {
                    color: 'blue',       // bordure
                    fillColor: '#2ECC71', // remplissage
                    fillOpacity: 0.3,
                    radius: radiusMeters
                });

                const rucherKmCircle = L.circle([rucher.localisation.latitude, rucher.localisation.longitude], {
                    color: 'cyan',       // bordure
                    fillColor: '#2ECC71', // remplissage
                    fillOpacity: 0.3,
                    radius: radiusKiloMeters
                });
                
                marker.bindPopup(`
                    <div class="map-popup">
                        <a href="/Dashboard/ruchers" class="rucher-link">
                            <strong>🐝 ${rucher.name || 'Rucher'}</strong>
                        </a>
                        <br>
                        <small>${rucher.is_bio ? '🌿 Bio' : ''}</small>
                    </div>
                `);
                
                rucherCircle.addTo(ruchersLayer.value)
                rucherKmCircle.addTo(ruchersLayer.value)
                marker.addTo(ruchersLayer.value);
                bounds.push([rucher.localisation.latitude, rucher.localisation.longitude]);
            }
        });
    }
    
    
    // Ajuster la vue si des markers existent
    if (bounds.length > 0) {
        map.value.fitBounds(bounds, { padding: [50, 50], maxZoom: 12, animate: true } );
    }
}

// Computed pour le résumé
const summaryStats = computed(() => ({
    totalModules: overview.value?.totalModules || 0,
    activeModules: overview.value?.activeModules || 0,
    totalWeight24h: overview.value?.totalWeight24h || 0,
    totalWeight8d: overview.value?.totalWeight8d || 0,
}));

// Watchers
watch(activeFilter, (filter) => {
    updateMapMarkers(filter);
});

watch([modules, ruchers], () => {
    updateMapMarkers(activeFilter.value);
});

// Lifecycle
onMounted(async () => {
    await loadData();
    initMap();
    updateMapMarkers(activeFilter.value);
});

</script>

<template>
    <div class="home-container">
        <!-- Section Carte -->
        <div class="map-section">
            <div id="map"></div>
            
            <!-- Filtres -->
            <div class="filters">
                <button
                    v-for="f in filters"
                    :key="f"
                    :class="{ active: activeFilter === f }"
                    @click="activeFilter = f"
                >
                    {{ f }}
                </button>
            </div>
            
            <!-- Légende -->
            <div class="legende">
                📡 Gateway &nbsp; 🐝 Rucher
            </div>
        </div>
        
        <!-- Section Aperçu -->
        <div class="overview-section">
            <div class="section-header">
                <h2>📊 Aperçu</h2>
                <button class="refresh-btn" @click="loadData" :disabled="isLoading">
                    {{ isLoading ? '⏳' : '🔄' }}
                </button>
            </div>
            
            <!-- Loading -->
            <LoadingSpinner v-if="isLoading" text="Chargement des données..." />
            
            <!-- Erreur -->
            <ModernCard v-else-if="error" variant="outlined">
                <div class="error-state">
                    <span class="error-icon">⚠️</span>
                    <p>{{ error }}</p>
                    <button class="btn btn-primary" @click="loadData">Réessayer</button>
                </div>
            </ModernCard>
            
            <!-- Contenu -->
            <template v-else>
                <!-- Stats rapides -->
                <div class="quick-stats">
                    <ModernCard class="stat-card">
                        <div class="stat-value">{{ summaryStats.totalModules }}</div>
                        <div class="stat-label">Modules</div>
                    </ModernCard>
                    
                    <ModernCard class="stat-card">
                        <div class="stat-value" :style="{ color: BeeColors.success }">
                            {{ summaryStats.activeModules }}
                        </div>
                        <div class="stat-label">Actifs</div>
                    </ModernCard>
                    
                    <ModernCard class="stat-card">
                        <div class="stat-value">{{ ruchers.length }}</div>
                        <div class="stat-label">Ruchers</div>
                    </ModernCard>
                </div>
                
                <!-- Deltas globaux -->
                <div class="global-deltas">
                    <WeightDelta
                        :value="summaryStats.totalWeight24h"
                        label="Total 24h"
                        icon="⏱️"
                    />
                    <WeightDelta
                        :value="summaryStats.totalWeight8d"
                        label="Total 8 jours"
                        icon="📅"
                    />
                </div>
                
                <!-- Liste des modules -->
                <div class="modules-list">
                    <h3>🛜 Mes Modules</h3>
                    
                    <div v-if="modules.length === 0" class="empty-state">
                        <span class="empty-icon">📦</span>
                        <p>Aucun module trouvé</p>
                    </div>
                    
                    <!--les 5 premiers éléments du tableau modules-->
                    <router-link
                        v-for="module in modules.filter(m => m.type === 'BScale').slice(0, 5)" 
                        :key="module._id"
                        :to="`/Dashboard/module/${module._id}`"
                        class="module-card-link"
                    >
                        <ModernCard hoverable :active="module.status === 'active'">
                            <div class="module-card-content">
                                <div class="module-info">
                                    <div class="module-name">
                                        {{ module.name || 'Module sans nom' }}
                                    </div>
                                    <div class="module-gateway" v-if="module.gatewayName">
                                        📡 {{ module.gatewayName }}
                                    </div>
                                </div>
                                
                                <StatusBadge :status="module.status" size="sm" />
                                
                                <div v-if="module.type === 'BScale'" class="module-weight">
                                    <div class="weight-value">
                                        {{ module.lastMeasurement.data.Poids?.toFixed(1) ?? '--' }} kg  <!-- Afficher le poids avec un chiffre après la virgule-->
                                    </div>
                                    <div class="weight-delta" :style="{ color: formatWeightDelta(module.deltaWeight8d).color }">
                                        {{ formatWeightDelta(module.deltaWeight8d).text }}
                                    </div>
                                </div>
                                
                            </div>
                        </ModernCard>
                    </router-link>
                    
                    <router-link  to="/Dashboard/modules" class="view-all-link">
                        Voir tous les modules →
                    </router-link>
                </div>
            </template>
        </div>
    </div>
</template>

<style>
.home-container {
    display: grid;
    grid-template-columns: 1fr 380px;
    gap: var(--bee-spacing-lg);
    height: 100%;
    min-height: calc(100vh - 150px);
}

/* Section Carte */
.map-section {
    position: relative;
    border-radius: var(--bee-radius-lg);
    overflow: hidden;
    box-shadow: var(--bee-shadow-md);
}

#map {
    height: 100%;
    min-height: 500px;
    border-radius: var(--bee-radius-lg);
}

.filters {
    position: absolute;
    top: var(--bee-spacing-md);
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    display: flex;
    gap: var(--bee-spacing-xs);
    padding: var(--bee-spacing-xs);
    background: var(--bee-gradient-glass);
    backdrop-filter: blur(10px);
    border-radius: var(--bee-radius-full);
    box-shadow: var(--bee-shadow-md);
}

.filters button {
    padding: var(--bee-spacing-xs) var(--bee-spacing-md);
    border: none;
    border-radius: var(--bee-radius-full);
    background: transparent;
    font-size: 13px;
    font-weight: 600;
    color: var(--bee-on-surface);
    cursor: pointer;
    transition: all var(--bee-transition-fast);
}

.filters button:hover {
    background: var(--bee-gray-100);
}

.filters button.active {
    background: var(--bee-gradient-primary);
    color: white;
}

.legende {
    position: absolute;
    bottom: var(--bee-spacing-md);
    left: 50%;
    transform: translateX(-50%);
    z-index: 1000;
    padding: var(--bee-spacing-xs) var(--bee-spacing-md);
    background: var(--bee-gradient-glass);
    backdrop-filter: blur(10px);
    border-radius: var(--bee-radius-md);
    font-size: 12px;
    box-shadow: var(--bee-shadow-sm);
}

/* Section Aperçu */
.overview-section {
    display: flex;
    flex-direction: column;
    gap: var(--bee-spacing-md);
    overflow-y: auto;
    max-height: calc(100vh - 150px);
    padding-right: var(--bee-spacing-xs);
}

.section-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.section-header h2 {
    font-size: 20px;
    margin: 0;
}

.refresh-btn {
    background: none;
    border: none;
    font-size: 18px;
    cursor: pointer;
    padding: var(--bee-spacing-xs);
    border-radius: var(--bee-radius-sm);
    transition: all var(--bee-transition-fast);
}

.refresh-btn:hover {
    background: var(--bee-gray-100);
}

.refresh-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

/* Stats rapides */
.quick-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: var(--bee-spacing-sm);
}

.stat-card {
    text-align: center;
    padding: var(--bee-spacing-md) !important;
}

.stat-value {
    font-size: 28px;
    font-weight: 700;
    color: var(--bee-honey);
}

.stat-label {
    font-size: 12px;
    color: var(--bee-on-surface-variant);
    margin-top: var(--bee-spacing-xs);
}

/* Deltas globaux */
.global-deltas {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--bee-spacing-sm);
}

/* Liste des modules */
.modules-list {
    display: flex;
    flex-direction: column;
    gap: var(--bee-spacing-sm);
}

.modules-list h3 {
    font-size: 16px;
    margin: var(--bee-spacing-sm) 0;
}

.module-card-link {
    text-decoration: none;
    color: inherit;
}

.module-card-content {
    display: flex;
    align-items: center;
    gap: var(--bee-spacing-md);
}

.module-info {
    flex: 1;
    min-width: 0;
}

.module-name {
    font-weight: 600;
    font-size: 15px;
    color: var(--bee-on-surface);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.module-gateway {
    font-size: 12px;
    color: var(--bee-on-surface-variant);
    margin-top: 2px;
}

.module-weight {
    text-align: right;
}

.module-temp {
    text-align: right;
}

.weight-value {
    font-size: 16px;
    font-weight: 600;
    color: var(--bee-on-surface);
}
.temp-value {
    font-size: 16px;
    font-weight: 600;
    color: var(--bee-on-surface);
}

.weight-delta {
    font-size: 13px;
    font-weight: 600;
}

.view-all-link {
    text-align: center;
    padding: var(--bee-spacing-sm);
    font-size: 14px;
    font-weight: 600;
    color: var(--bee-honey);
}

.view-all-link:hover {
    text-decoration: underline;
}

/* États */
.error-state {
    text-align: center;
    padding: var(--bee-spacing-lg);
}

.error-icon {
    font-size: 32px;
    display: block;
    margin-bottom: var(--bee-spacing-sm);
}

.empty-state {
    text-align: center;
    padding: var(--bee-spacing-xl);
    color: var(--bee-on-surface-variant);
}

.empty-icon {
    font-size: 32px;
    display: block;
    margin-bottom: var(--bee-spacing-sm);
}

/* Responsive */
@media (max-width: 1024px) {
    .home-container {
        grid-template-columns: 1fr;
        grid-template-rows: 400px auto;
    }
    
    .overview-section {
        max-height: none;
    }
}

@media (max-width: 768px) {
    .home-container {
        grid-template-rows: 300px auto;
    }
    
    .quick-stats {
        grid-template-columns: repeat(3, 1fr);
    }
}
/* Styles globaux pour les popups de la carte */
.map-popup {
    font-family: var(--bee-font-family);
    font-size: 13px;
    /* color: var(--bee-on-surface); */
}

.gateway-link:hover, .rucher-link:hover {
    text-decoration: none;
    color: orange;
}

.map-icon {
    font-size: 24px;
    line-height: 30px;
    text-align: center;
}
</style>
