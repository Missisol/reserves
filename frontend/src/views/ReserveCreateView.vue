<script setup lang="ts">
import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

import { useReserveCategoriesStore } from '@/stores/reserveCategories'
import { useReservesStore } from '@/stores/reserves'
import type { Reserve } from '@/@types/reserve'
import ReserveLayout from '@/components/reserves/ReserveLayout.vue'
import ReserveForm from '@/components/reserves/ReserveForm.vue'

const router = useRouter()

const reserveCategoriesStore = useReserveCategoriesStore()
const { categories } = storeToRefs(reserveCategoriesStore)
const { getCategories } = reserveCategoriesStore

const reservesStore = useReservesStore()
const { createReserve } = reservesStore

const data = ref<Partial<Reserve>>({
  kind: '',
  description: '',
  quantity: 0,
  unit: '',
  is_active: true,
})

if (!categories.value.length) {
  getCategories()
}

async function create() {
  const result = await createReserve(data.value)
  if (result?.id) {
    router.push({ path: '/' })
  }
}
</script>

<template>
  <ReserveLayout
    @action="router.push({ path: '/' })"
    text="Назад к запасам"
  >
    <template #content>
      <ReserveForm
        v-model:model="data"
        :categories="categories"
        @sendForm="create"
      />
    </template>
  </ReserveLayout>
</template>

<style scoped>
</style>
