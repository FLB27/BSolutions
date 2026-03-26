// Service API centralisé pour toutes les routes backend
import { api } from '../API.js';

// ===== AUTHENTIFICATION =====
export const AuthService = {
    async login(email, password) {
        return await api('/auth/login', {
            method: 'POST',
            body: { email, password },
        });
    },

    async register(email, password) {
        return await api('/auth/register', {
            method: 'POST',
            body: { email, password },
        });
    },

    async requestPasswordReset(email) {
        return await api('/auth/forgot-password', {
            method: 'POST',
        body: JSON.stringify({ email: email.trim() }),
        });
    },

    async resetPassword(token, newPassword) {
        return await api('/auth/reset-password', {
            method: 'POST',
            body: JSON.stringify({
                token,
                newPassword
            }),
        });
    },

    async verifyEmail(token){
        return await api(`/auth/verify-email?token=${token}`, {
            method: 'GET',
        });
    },

    async verifyToken(token) {
        return await api('/auth/verify-token', {
            method: 'POST',
            body: { token },
        });
    },

    async logout() {
        return await api('/auth/logout', {
            method: 'POST',
        });
    },
};

// ===== UTILISATEURS =====
export const UserService = {
    async getMyProfile() {
        return await api('/users/profile/me', { method: 'GET' });
    },

    async updateMyProfile(data) {
        return await api('/users/profile/me', {
            method: 'PUT',
            body: data,
        });
    },

    async getUserById(userId) {
        return await api(`/users/${userId}`, { method: 'GET' });
    },
};

// ===== RUCHERS =====
export const RucherService = {
    async getRuchers() {
        return await api('/ruchers', { method: 'GET' });
    },

    async createRucher(data) {
        return await api('/ruchers', {
            method: 'POST',
            body: data,
        });
    },
};

// ===== RUCHES =====
export const RucheService = {
    async getRuchesForUser() {
        return await api('/ruches/user', { method: 'GET' });
    },
};

// ===== DEVICES (MODULES & GATEWAYS) =====
export const DeviceService = {
    // Gateways
    async getGatewaysForUser() {
        return await api('/devices/gateways/user', { method: 'GET' });
    },

    async getGatewayById(gatewayId) {
        return await api(`/devices/gateways/${gatewayId}`, { method: 'GET' });
    },

    async assignGateway(nom, gatewayId, location = null) {
        return await api('/devices/gateway/assign', {
            method: 'PUT',
            body: { nom, gatewayId, location },
        });
    },

    // Modules
    async getModulesForUser() {
        return await api('/devices/modules/user', { method: 'GET' });
    },

    async getModulesOverview() {
        return await api('/devices/modules/user/overview', { method: 'GET' });
    },

    async getModuleInfo(moduleId) { //Renvoie id, type, modèle
        return await api(`/devices/modules/${moduleId}/info`, { method: 'GET' });
    },

    async getModuleWeight(moduleId) { //Renvoie id, nom, dernier poids, delta 24h et 8j, status
        return await api(`/devices/modules/${moduleId}/weight`, { method: 'GET' });
    },

    async assignModule(moduleId, name = null, rucherId = null, rucheId = null) {
        return await api('/devices/module/assign', {
            method: 'PUT',
            body: { moduleId, name, rucherId, rucheId },
        });
    },
};

// ===== DATA (MESURES) =====
export const DataService = {
    async getModuleMeasurements(moduleId, options = {}) {
        let url = `/data/modules/${moduleId}/measurements`;
        const params = new URLSearchParams();
        
        if (options.fromDate) params.append('fromDate', options.fromDate);
        if (options.toDate) params.append('toDate', options.toDate);
        if (options.limit) params.append('limit', options.limit);
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        
        return await api(url, { method: 'GET' });
    },

    async getLatestModuleMeasurement(moduleId) {
        return await api(`/data/modules/${moduleId}/measurements/latest`, { method: 'GET' });
    },

    async getGatewayMeasurements(gatewayId, options = {}) {
        let url = `/data/gateways/${gatewayId}/measurements`;
        const params = new URLSearchParams();
        
        if (options.fromDate) params.append('fromDate', options.fromDate);
        if (options.toDate) params.append('toDate', options.toDate);
        if (options.limit) params.append('limit', options.limit);
        
        if (params.toString()) {
            url += `?${params.toString()}`;
        }
        
        return await api(url, { method: 'GET' });
    },
};

// ===== INTERVENTIONS =====
export const InterventionService = {
    // Nourrissements
    async getNourrissements() {
        return await api('/interventions/nourrissements', { method: 'GET' });
    },

    async createNourrissement(data) {
        return await api('/interventions/nourrissements', {
            method: 'POST',
            body: data,
        });
    },

    async updateNourrissement(id, data) {
        return await api(`/interventions/nourrissements/${id}`, {
            method: 'PUT',
            body: data,
        });
    },

    async deleteNourrissement(id) {
        return await api(`/interventions/nourrissements/${id}`, {
            method: 'DELETE',
        });
    },

    // Récoltes
    async getRecoltes() {
        return await api('/interventions/recoltes', { method: 'GET' });
    },

    async createRecolte(data) {
        return await api('/interventions/recoltes', {
            method: 'POST',
            body: data,
        });
    },

    // Traitements
    async getTraitements() {
        return await api('/interventions/traitements', { method: 'GET' });
    },

    async createTraitement(data) {
        return await api('/interventions/traitements', {
            method: 'POST',
            body: data,
        });
    },
};

// ===== TRANSHUMANCES =====
export const TranshumanceService = {
    async getTranshumances() {
        return await api('/transhumances', { method: 'GET' });
    },

    async createTranshumance(data) {
        return await api('/transhumances', {
            method: 'POST',
            body: data,
        });
    },
};

// Export par défaut de tous les services
export default {
    Auth: AuthService,
    User: UserService,
    Rucher: RucherService,
    Ruche: RucheService,
    Device: DeviceService,
    Data: DataService,
    Intervention: InterventionService,
    Transhumance: TranshumanceService,
};
