<script setup>
import { computed } from 'vue';
import { BeeColors, BeeRadius, BeeSpacing, formatWeightDelta } from '../../theme.js';

const props = defineProps({
    value: {
        type: Number,
        default: null,
    },
    label: {
        type: String,
        default: '',
    },
    icon: {
        type: String,
        default: '⏱️',
    },
    compact: {
        type: Boolean,
        default: false,
    },
});

const formatted = computed(() => formatWeightDelta(props.value));

const cardStyle = computed(() => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: props.compact ? 'flex-start' : 'center',
    gap: BeeSpacing.xs,
    padding: props.compact ? BeeSpacing.sm : BeeSpacing.md,
    background: `${formatted.value.color}10`,
    borderRadius: BeeRadius.medium,
    border: `1px solid ${formatted.value.color}30`,
}));

const valueStyle = computed(() => ({
    fontSize: props.compact ? '16px' : '20px',
    fontWeight: '700',
    color: formatted.value.color,
}));

const labelStyle = computed(() => ({
    fontSize: props.compact ? '11px' : '12px',
    fontWeight: '500',
    color: BeeColors.onSurfaceVariant,
    display: 'flex',
    alignItems: 'center',
    gap: BeeSpacing.xs,
}));
</script>

<template>
    <div :style="cardStyle" class="weight-delta">
        <span :style="labelStyle">
            <span>{{ icon }}</span>
            <span>{{ label }}</span>
        </span>
        <span :style="valueStyle">{{ formatted.text }}</span>
    </div>
</template>

<style scoped>
.weight-delta {
    min-width: 80px;
}
</style>
