<script setup>
import { computed } from 'vue';
import { BeeColors, BeeRadius, BeeSpacing } from '../../theme.js';

const props = defineProps({
    status: {
        type: String,
        required: true, // active, inactive, pending, error
    },
    text: {
        type: String,
        default: '',
    },
    size: {
        type: String,
        default: 'md', // sm, md
    },
});

const statusConfig = {
    active: { color: BeeColors.success, label: 'En ligne', icon: '●' },
    inactive: { color: BeeColors.error, label: 'Hors ligne', icon: '●' },
    pending: { color: BeeColors.warning, label: 'En attente', icon: '○' },
    error: { color: BeeColors.error, label: 'Erreur', icon: '!' },
    maintenance: { color: BeeColors.info, label: 'Maintenance', icon: '⚙' },
    libre: { color: BeeColors.gray500, label: 'Libre', icon: '○' },
};

const config = computed(() => statusConfig[props.status] || statusConfig.inactive);

const badgeStyle = computed(() => {
    const padding = props.size === 'sm' 
        ? `${BeeSpacing.xs} ${BeeSpacing.sm}` 
        : `${BeeSpacing.xs} ${BeeSpacing.md}`;
    const fontSize = props.size === 'sm' ? '11px' : '12px';
    
    return {
        display: 'inline-flex',
        alignItems: 'center',
        gap: BeeSpacing.xs,
        padding,
        fontSize,
        fontWeight: '600',
        color: config.value.color,
        background: `${config.value.color}15`,
        borderRadius: BeeRadius.small,
    };
});
</script>

<template>
    <span :style="badgeStyle" class="status-badge">
        <span class="status-icon">{{ config.icon }}</span>
        <span>{{ text || config.label }}</span>
    </span>
</template>

<style scoped>
.status-badge {
    white-space: nowrap;
}

.status-icon {
    font-size: 0.8em;
}
</style>
