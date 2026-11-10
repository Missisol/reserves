<script setup lang="ts">
const { buttonType, disabled, className = ''  } = defineProps<{
  buttonType?: 'button' | 'submit' | 'reset',
  disabled?: boolean,
  className?: string,
}>()

const emit = defineEmits(['buttonAction'])
</script>

<template>
  <button
    :type="buttonType || 'button'"
    :disabled="disabled"
    @click="emit('buttonAction')" 
    class="common-button"
    :class="className"
  >
    <slot name="icon"></slot>
    <slot name="text"></slot>
  </button>
</template>

<style scoped>
.common-button {
  background: var(--cbtn-background, var(--color-primary));
  color: var(--text-color, var(--color-primary-foreground));
  border: 1px solid var(--cbtn-border, var(--color-primary));
  border-radius: calc(var(--radius) - 2px);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: .5rem;
  font-size: .875rem;
  line-height: 1.5rem;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
  transition: var(--transition-smooth);

  padding-block: var(--btn-padding-block, 0.5rem);
  padding-inline: var(--btn-padding-inline, 1rem);
}

@media (hover: hover) and (pointer: fine) {
  .common-button:not(:disabled):hover {
    --cbtn-fallback: var(--cbtn-background, var(--color-primary));

    background: var(--cbtn-hover, hsl(from var(--cbtn-fallback) h s l / 0.9));
    color: var(--text-hover, var(--color-primary-foreground));
  }
}

.common-button:disabled {
  background: hsl(from var(--cbtn-background) h s l / 0.5);
  color: hsl(from var(--text-color) h s l / 0.5);
  border: 1px solid hsl(from var(--cbtn-border) h s l / 0.3);
  cursor: default;
}
</style>

<style>
.common-button>svg {
  width: 1rem;
  height: 1rem;
}
</style>