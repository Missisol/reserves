<script setup lang="ts">
import { ref } from 'vue'

import { useReserveCategoriesStore } from '@/stores/reserveCategories'
import CategoryAction from '@/components/category/CategoryAction.vue'
import IconPlus from '@/components/icons/IconPlus.vue'

const reserveCategoriesStore = useReserveCategoriesStore()
const { getCategories, createCategory } = reserveCategoriesStore

const name = ref('')
const error = ref('')

async function saveCategory(e: SubmitEvent) {
  e.preventDefault()

  if (!name.value.trim()) {
    return
  }

  const res = await createCategory(name.value)

  if (res?.error) {
    error.value = res.error
    return
  }

  if (res?.id) {
    name.value = ''
    error.value = ''
    getCategories()
  }
}
</script>

<template>
  <div class="wrapper">
    <CategoryAction
      title="Добавить категорию"
      idName="reserve_category_add"
      @submitAction="saveCategory"
    >
      <template #input>
        <input
          v-model="name"
          id="reserve_category_add"
          type="text"
          placeholder="Название категории"
          class="input"
        >
      </template>
      <template #icon>
        <IconPlus />
      </template>
    </CategoryAction>
    <span
      v-if="error"
      class="error"
    >{{ error }}</span>
  </div>
</template>

<style scoped>
.wrapper {
  --btn-color: var(--color-secondary);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.error {
  font-size: 0.75rem;
  line-height: 1rem;
  color: var(--color-destructive);
}

.form__action .input {
  --outline-color: var(--color-secondary);
}
</style>
