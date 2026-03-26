<script setup>
import { computed } from 'vue';
import { BeeColors } from '../../theme.js';

const props = defineProps({
    size: {
        type: String,
        default: 'md', // sm, md, lg
    },
    color: {
        type: String,
        default: null,
    },
    text: {
        type: String,
        default: '',
    },
});

const spinnerSize = computed(() => {
    switch (props.size) {
        case 'sm': return '24px';
        case 'lg': return '48px';
        default: return '36px';
    }
});

const spinnerColor = computed(() => props.color || BeeColors.honey);
</script>

<template>
    <div class="loading-container">
        <div 
            class="spinner" 
            :style="{ 
                width: spinnerSize, 
                height: spinnerSize,
                borderColor: `${spinnerColor}30`,
                borderTopColor: spinnerColor,
            }"
        ></div>
        <span v-if="text" class="loading-text">{{ text }}</span>
    </div>
</template>

<style scoped>
.loading-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 12px;
    padding: 24px;
}

.spinner {
    border: 3px solid;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

.loading-text {
    font-size: 14px;
    color: v-bind('BeeColors.onSurfaceVariant');
}
</style>
