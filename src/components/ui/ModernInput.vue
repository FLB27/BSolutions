<script setup>
import { ref, computed } from 'vue';
import { BeeColors, BeeRadius, BeeShadows, BeeSpacing } from '../../theme.js';

const props = defineProps({
    modelValue: {
        type: [String, Number],
        default: '',
    },
    type: {
        type: String,
        default: 'text',
    },
    label: {
        type: String,
        default: '',
    },
    placeholder: {
        type: String,
        default: '',
    },
    icon: {
        type: String,
        default: null,
    },
    error: {
        type: String,
        default: '',
    },
    disabled: {
        type: Boolean,
        default: false,
    },
});

const emit = defineEmits(['update:modelValue']);

const isFocused = ref(false);
const showPassword = ref(false);

const inputType = computed(() => {
    if (props.type === 'password') {
        return showPassword.value ? 'text' : 'password';
    }
    return props.type;
});

const containerStyle = computed(() => ({
    display: 'flex',
    alignItems: 'center',
    gap: BeeSpacing.md,
    padding: BeeSpacing.md,
    background: BeeColors.surface,
    borderRadius: BeeRadius.medium,
    boxShadow: BeeShadows.small,
    border: `2px solid ${isFocused.value ? BeeColors.honey : props.error ? BeeColors.error : 'transparent'}`,
    transition: 'all 0.2s ease',
    opacity: props.disabled ? 0.6 : 1,
}));

function handleInput(e) {
    emit('update:modelValue', e.target.value);
}

function togglePassword() {
    showPassword.value = !showPassword.value;
}
</script>

<template>
    <div class="modern-input-wrapper">
        <label v-if="label" class="input-label">{{ label }}</label>
        <div :style="containerStyle" class="input-container">
            <span v-if="icon" class="input-icon">{{ icon }}</span>
            <input
                :type="inputType"
                :value="modelValue"
                :placeholder="placeholder"
                :disabled="disabled"
                class="input-field"
                @input="handleInput"
                @focus="isFocused = true"
                @blur="isFocused = false"
            />
            <button 
                v-if="type === 'password'" 
                type="button"
                class="toggle-password"
                @click="togglePassword"
            >
                {{ showPassword ? '👁️' : 'X' }}
            </button>
        </div>
        <span v-if="error" class="input-error">{{ error }}</span>
    </div>
</template>

<style scoped>
.modern-input-wrapper {
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: 100%;
}

.input-label {
    font-size: 16px;
    font-weight: 600;
    color: v-bind('BeeColors.onSurface');
}

.input-container {
    width: 100%;
    box-sizing: border-box;
}

.input-icon {
    font-size: 20px;
    color: v-bind('BeeColors.honey');
}

.input-field {
    flex: 1;
    border: none;
    outline: none;
    background: transparent;
    font-size: 16px;
    font-family: inherit;
    color: v-bind('BeeColors.onSurface');
}

.input-field::placeholder {
    color: v-bind('BeeColors.onSurfaceVariant');
}

.input-field:disabled {
    cursor: not-allowed;
}

.toggle-password {
    background: none;
    border: none;
    cursor: pointer;
    font-size: 18px;
    padding: 0;
}

.input-error {
    font-size: 12px;
    color: v-bind('BeeColors.error');
}
</style>
