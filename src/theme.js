// Design System cohérent avec l'application iOS BEE
// Couleurs, typographie, espacements et utilitaires

// ===== COULEURS =====
export const BeeColors = {
    // Couleurs principales
    honey: '#FFB700',           // Couleur miel principale
    honeyLight: '#FFD54F',      // Miel clair
    honeyDark: '#F9A825',       // Miel foncé
    amber: '#FFAB00',           // Ambre
    
    // Couleurs de surface
    surface: '#FFFFFF',
    surfaceVariant: '#F5F5F5',
    background: '#FFF8E1',      // Fond crème léger
    backgroundDark: '#F6F1E3',
    
    // Couleurs de texte
    onSurface: '#1C1B1F',
    onSurfaceVariant: '#6B6B6B',
    onPrimary: '#FFFFFF',
    
    // Couleurs sémantiques
    success: '#4CAF50',
    successLight: '#81C784',
    error: '#F44336',
    errorLight: '#E57373',
    warning: '#FF9800',
    info: '#2196F3',
    
    // Couleurs neutres
    gray100: '#F5F5F5',
    gray200: '#EEEEEE',
    gray300: '#E0E0E0',
    gray400: '#BDBDBD',
    gray500: '#9E9E9E',
    gray600: '#757575',
};

// ===== DÉGRADÉS =====
export const BeeGradients = {
    primary: 'linear-gradient(135deg, #FFB700 0%, #FF9500 100%)',
    primarySoft: 'linear-gradient(135deg, #FFD54F 0%, #FFB700 100%)',
    background: 'linear-gradient(180deg, #FFF8E1 0%, #F6F1E3 100%)',
    card: 'linear-gradient(145deg, rgba(255,255,255,0.95) 0%, rgba(255,248,225,0.9) 100%)',
    glass: 'linear-gradient(135deg, rgba(255,255,255,0.8) 0%, rgba(255,255,255,0.4) 100%)',
    success: 'linear-gradient(135deg, #4CAF50 0%, #81C784 100%)',
    error: 'linear-gradient(135deg, #F44336 0%, #E57373 100%)',
};

// ===== ESPACEMENTS =====
export const BeeSpacing = {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
};

// ===== RAYONS DE BORDURE =====
export const BeeRadius = {
    small: '8px',
    medium: '12px',
    large: '16px',
    extraLarge: '24px',
    full: '9999px',
};

// ===== OMBRES =====
export const BeeShadows = {
    small: '0 2px 8px rgba(0, 0, 0, 0.08)',
    medium: '0 4px 16px rgba(0, 0, 0, 0.12)',
    large: '0 8px 32px rgba(0, 0, 0, 0.16)',
    colored: '0 8px 24px rgba(255, 183, 0, 0.3)',
    glass: '0 8px 32px rgba(0, 0, 0, 0.1)',
};

// ===== TYPOGRAPHIE =====
export const BeeTypography = {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    
    // Tailles
    largeTitle: { fontSize: '34px', fontWeight: '700', lineHeight: '1.2' },
    title1: { fontSize: '28px', fontWeight: '700', lineHeight: '1.2' },
    title2: { fontSize: '22px', fontWeight: '600', lineHeight: '1.3' },
    title3: { fontSize: '20px', fontWeight: '600', lineHeight: '1.3' },
    headline: { fontSize: '17px', fontWeight: '600', lineHeight: '1.4' },
    body: { fontSize: '16px', fontWeight: '400', lineHeight: '1.5' },
    callout: { fontSize: '15px', fontWeight: '400', lineHeight: '1.4' },
    subheadline: { fontSize: '14px', fontWeight: '400', lineHeight: '1.4' },
    caption: { fontSize: '12px', fontWeight: '400', lineHeight: '1.3' },
};

// ===== ANIMATIONS =====
export const BeeAnimations = {
    fast: '150ms ease',
    normal: '250ms ease',
    slow: '350ms ease',
    spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
};

// ===== UTILITAIRES =====

// Formater un delta de poids avec signe et couleur
export function formatWeightDelta(delta) {
    if (delta === null || delta === undefined) {
        return { text: '-- kg', color: BeeColors.onSurfaceVariant };
    }
    const sign = delta >= 0 ? '+' : '';
    const text = `${sign}${delta.toFixed(1)} kg`;
    let color;
    if (delta > 0) color = BeeColors.success;
    else if (delta < 0) color = BeeColors.error;
    else color = BeeColors.onSurfaceVariant;
    
    return { text, color };
}

// Formater une date ISO en format lisible
export function formatDate(isoString) {
    if (!isoString) return '--';
    const date = new Date(isoString);
    return date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Formater une date complète
export function formatFullDate(isoString) {
    if (!isoString) return '--';
    const date = new Date(isoString);
    return date.toLocaleDateString('fr-FR', { 
        day: '2-digit', 
        month: 'long',
        year: 'numeric'
    });
}

// Déterminer si un module est actif (dernière mesure < 12h)
export function isModuleActive(lastMeasurementDate) {
    if (!lastMeasurementDate) return false;
    const twelveHoursAgo = Date.now() - 12 * 60 * 60 * 1000;
    return new Date(lastMeasurementDate).getTime() > twelveHoursAgo;
}

// Générer les styles CSS pour un composant
export function generateCardStyle(isActive = false) {
    return {
        background: BeeGradients.card,
        borderRadius: BeeRadius.large,
        boxShadow: BeeShadows.medium,
        border: `1px solid ${isActive ? BeeColors.success + '40' : BeeColors.gray300}`,
        padding: BeeSpacing.md,
    };
}
