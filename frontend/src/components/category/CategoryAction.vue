<script setup lang="ts">
interface Props {
  title?: string
  idName?: string
  buttonTitle?: string
}

const { title, idName } = defineProps<Props>()

const emit = defineEmits<{
  submitAction: [event: SubmitEvent]
}>()
</script>

<template>
  <form
    class="form"
    @submit="emit('submitAction', $event)"
  >
    <label 
      :for="idName" 
      class="form__label"
    >{{ title }}
    </label>
    <div class="form__action">
      <slot name="input"></slot>
      <button
        type="submit"
        class="form__button"
      >
        <slot name="icon"></slot>
      </button>
    </div>
  </form>
</template>

<style scoped>
.form {
  /* --btn-color: var(--color-primary); */
  --icon-color: var(--color-primary-foreground);
  /* --label-color: var(--color-primary); */

  color: var(--color-foreground);
  background: var(--color-gradient-card);
  border: 1px solid hsl(from var(--color-border) h s l / 0.5);
  border-radius: var(--radius);
  padding: 1rem;
}

.form__label {
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 600;
  color: var(--label-color, var(--color-primary));
}

.form__action {
  display: flex;
  gap: 1rem;
  margin-block-start: 0.75rem;
}

.form__button {
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 500;
  border: none;
  color: var(--icon-color, var(--color-primary-foreground));
  background: var(--btn-color, var(--color-primary));
  border-radius: calc(var(--radius) - 2px);
  width: 2.5rem;
  height: 2.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
}

@media (hover: hover) and (pointer: fine) {
  .form__button:hover {
    background: hsl(from var(--btn-color) h s l / 0.9);
  }
}
</style>
