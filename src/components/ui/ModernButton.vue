<script setup>
import { computed } from 'vue';
import { BeeColors, BeeGradients, BeeRadius, BeeShadows, BeeSpacing } from '../../theme.js';

const props = defineProps({
    variant: {
        type: String,
        default: 'primary', // primary, secondary, outline, ghost
    },
    size: {
        type: String,
        default: 'md', // sm, md, lg
    },
    loading: {
        type: Boolean,
        default: false,
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    fullWidth: {
        type: Boolean,
        default: false,
    },
    icon: {
        type: String,
        default: null,
    },
});

const emit = defineEmits(['click']);

const buttonStyle = computed(() => {
    let background, color, border, shadow;
    
    switch (props.variant) {
        case 'primary':
            background = BeeGradients.primary;
            color = '#FFFFFF';
            border = 'none';
            shadow = BeeShadows.colored;
            break;
        case 'secondary':
            background = BeeColors.gray100;
            color = BeeColors.onSurface;
            border = 'none';
            shadow = BeeShadows.small;
            break;
        case 'outline':
            background = 'transparent';
            color = BeeColors.honey;
            border = `2px solid ${BeeColors.honey}`;
            shadow = 'none';
            break;
        case 'ghost':
            background = 'transparent';
            color = BeeColors.onSurface;
            border = 'none';
            shadow = 'none';
            break;
        case 'success':
            background = BeeGradients.success;
            color = '#FFFFFF';
            border = 'none';
            shadow = BeeShadows.medium;
            break;
        case 'danger':
            background = BeeGradients.error;
            color = '#FFFFFF';
            border = 'none';
            shadow = BeeShadows.medium;
            break;
        default:
            background = BeeGradients.primary;
            color = '#FFFFFF';
            border = 'none';
            shadow = BeeShadows.colored;
    }
    
    let padding, fontSize;
    switch (props.size) {
        case 'sm':
            padding = `${BeeSpacing.xs} ${BeeSpacing.md}`;
            fontSize = '14px';
            break;
        case 'lg':
            padding = `${BeeSpacing.md} ${BeeSpacing.xl}`;
            fontSize = '18px';
            break;
        default:
            padding = `${BeeSpacing.sm} ${BeeSpacing.lg}`;
            fontSize = '16px';
    }
    
    return {
        background,
        color,
        border,
        boxShadow: shadow,
        padding,
        fontSize,
        borderRadius: BeeRadius.medium,
        fontWeight: '600',
        cursor: props.disabled ? 'not-allowed' : 'pointer',
        opacity: props.disabled ? 0.6 : 1,
        width: props.fullWidth ? '100%' : 'auto',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: BeeSpacing.sm,
        transition: 'all 0.2s ease',
    };
});

function handleClick(e) {
    if (!props.disabled && !props.loading) {
        emit('click', e);
    }
}
</script>

<template>
    <button 
        class="modern-button"
        :style="buttonStyle"
        :disabled="disabled || loading"
        @click="handleClick"
    >
        <span v-if="loading" class="loader"></span>
        <span v-else-if="icon" class="icon">{{ icon }}</span>
        <slot></slot>
    </button>
</template>

<style scoped>
.modern-button {
    font-family: inherit;
    outline: none;
}

.modern-button:not(:disabled):hover {
    transform: translateY(-2px);
    filter: brightness(1.05);
}

.modern-button:not(:disabled):active {
    transform: translateY(0);
    filter: brightness(0.95);
}

.loader {
    width: 18px;
    height: 18px;
    border: 2px solid currentColor;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.icon {
    font-size: 1.2em;
}
</style>
