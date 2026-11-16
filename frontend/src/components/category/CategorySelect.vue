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
</style>