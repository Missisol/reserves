<script setup lang="ts">
withDefaults(defineProps<{
  title?: string
  message: string
  confirmText?: string
  cancelText?: string
}>(), {
  title: 'Подтверждение',
  confirmText: 'Подтвердить',
  cancelText: 'Отмена'
})

const emit = defineEmits<{
  confirm: []
}>()
const isOpen = defineModel<boolean>()

function handleConfirm() {
  emit('confirm')
  isOpen.value = false
}

function handleCancel() {
  isOpen.value = false
}

function handleBackdropClick(e: Event): void {
  if (e.target === e.currentTarget) {
    handleCancel()
  }
}
</script>

<template>
  <Teleport to="body">
    <Transition name="dialog">
      <div
        v-if="isOpen"
        class="dialog-overlay"
        @click="handleBackdropClick"
      >
        <div class="dialog">
          <div class="dialog__header">
            <h3 class="dialog__title">{{ title }}</h3>
          </div>
          <div class="dialog__body">
            <p class="dialog__message">{{ message }}</p>
          </div>
          <div class="dialog__footer">
            <button
              type="button"
              class="dialog__button dialog__button--cancel"
              @click="handleCancel"
            >
              {{ cancelText }}
            </button>
            <button
              type="button"
              class="dialog__button dialog__button--confirm"
              @click="handleConfirm"
            >
              {{ confirmText }}
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: hsl(from var(--color-background) h s l / 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.dialog {
  background: var(--color-gradient-card);
  border: 1px solid hsl(from var(--color-border) h s l / 0.5);
  border-radius: var(--radius);
  box-shadow: 0 4px 6px -1px hsl(0 0% 0% / 0.1), 0 2px 4px -1px hsl(0 0% 0% / 0.06);
  max-width: 28rem;
  width: 100%;
  color: var(--color-foreground);
}

.dialog__header {
  padding: 1.25rem 1.25rem 0.75rem;
}

.dialog__title {
  font-size: 1.125rem;
  line-height: 1.75rem;
  font-weight: 600;
  color: var(--color-destructive);
  margin: 0;
}

.dialog__body {
  padding: 0.75rem 1.25rem;
}

.dialog__message {
  font-size: 0.875rem;
  line-height: 1.5rem;
  color: var(--color-foreground);
  margin: 0;
}

.dialog__footer {
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
  padding: 0.75rem 1.25rem 1.25rem;
}

.dialog__button {
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 500;
  border: none;
  border-radius: calc(var(--radius) - 2px);
  padding: 0.5rem 1rem;
  cursor: pointer;
  transition: background 0.2s;
}

.dialog__button--cancel {
  background: hsl(from var(--color-muted) h s l / 0.5);
  color: var(--color-foreground);
}

.dialog__button--cancel:hover {
  background: var(--color-muted);
}

.dialog__button--confirm {
  background: var(--color-destructive);
  color: var(--color-destructive-foreground);
}

.dialog__button--confirm:hover {
  background: hsl(from var(--color-destructive) h s l / 0.9);
}

/* Transition animations */
.dialog-enter-active,
.dialog-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-enter-active .dialog,
.dialog-leave-active .dialog {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.dialog-enter-from,
.dialog-leave-to {
  opacity: 0;
}

.dialog-enter-from .dialog,
.dialog-leave-to .dialog {
  transform: scale(0.95);
  opacity: 0;
}
</style>
