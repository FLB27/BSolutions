<script setup>
import { computed } from 'vue';
import { BeeColors, BeeGradients, BeeRadius, BeeShadows, BeeSpacing } from '../../theme.js';

const props = defineProps({
    variant: {
        type: String,
        default: 'default', // default, glass, outlined
    },
    active: {
        type: Boolean,
        default: false,
    },
    hoverable: {
        type: Boolean,
        default: false,
    },
    padding: {
        type: String,
        default: 'md', // xs, sm, md, lg, xl
    },
});

const cardStyle = computed(() => {
    const paddingValue = BeeSpacing[props.padding] || BeeSpacing.md;
    
    let background = BeeGradients.card;
    let border = `1px solid ${BeeColors.gray200}`;
    let shadow = BeeShadows.medium;
    
    if (props.variant === 'glass') {
        background = BeeGradients.glass;
        border = `1px solid rgba(255, 255, 255, 0.4)`;
        shadow = BeeShadows.glass;
    } else if (props.variant === 'outlined') {
        background = 'transparent';
        border = `2px solid ${BeeColors.gray300}`;
        shadow = 'none';
    }
    
    if (props.active) {
        border = `2px solid ${BeeColors.success}40`;
    }
    
    return {
        background,
        border,
        borderRadius: BeeRadius.large,
        boxShadow: shadow,
        padding: paddingValue,
        transition: 'all 0.25s ease',
    };
});
</script>

<template>
    <div 
        class="modern-card" 
        :class="{ hoverable: hoverable, active: active }"
        :style="cardStyle"
    >
        <slot></slot>
    </div>
</template>

<style scoped>
.modern-card {
    width: 100%;
    box-sizing: border-box;
}

.modern-card.hoverable:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.modern-card.active {
    border-color: rgba(76, 175, 80, 0.4) !important;
}
</style>
