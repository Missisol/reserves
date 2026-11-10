<script setup lang="ts">
import type { Category } from '@/@types/category'

interface Props {
  categories: Category[]
  idName?: string
  className?: string
  selected?: boolean
  isDefaultOption?: boolean
  isDisabledCondition?: boolean
}

const model = defineModel<string | number>('model')
const { categories, idName, className, isDefaultOption, isDisabledCondition } = defineProps<Props>()
</script>

<template>
  <select
    v-model="model"
    name="category"
    :id="idName"
    class="category-select"
    :class="className"
  >
    <option
      v-if="isDefaultOption"
      value=""
      :selected="true"
      disabled
    >--Выберите категорию--</option>
    <option 
      v-for="category in categories" 
      :key="category.id" 
      :value="category.id"
      :disabled="isDisabledCondition ? category?.name === '' : false"
    >{{ category?.name || 'Без категории' }}</option>
  </select>

</template>

<style scoped>
select,
::picker(select) {
  appearance: base-select;
}

select::picker-icon {
  color: var(--color-muted-foreground);
  transition: 0.4s rotate;
}

select:open::picker-icon {
  rotate: 180deg;
}

::picker(select) {
  border: none;
}

option:disabled {
  color: var(--color-muted-foreground);
}

option {
  --color-option: var(--option-color, var(--color-primary));

  display: flex;
  justify-content: flex-start;
  gap: 1rem;

  border: 2px solid var(--color-input);
  background: var(--color-background);
  padding: .5rem;
  transition: 0.4s;
}

option:first-of-type {
  border-radius: .5rem .5rem 0 0;
}

option:last-of-type {
  border-radius: 0 0 .5rem .5rem;
}

::picker(select) {
  border-radius: .5rem;
}

option:not(option:last-of-type) {
  border-bottom: none;
}

option:nth-of-type(odd) {
  background: var(--color-gradient-card);
}

option:hover:not(:disabled),
option:focus {
  background: var(--color-option);
  color: var(--color-primary-foreground);
  font-weight: 600;
}
</style>