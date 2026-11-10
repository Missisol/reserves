<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter, useRoute } from 'vue-router'

import { useReserveCategoriesStore } from '@/stores/reserveCategories'
import { useReservesStore } from '@/stores/reserves'
import type { Reserve } from '@/@types/reserve'
import ReserveLayout from '@/components/reserves/ReserveLayout.vue'
import ReserveForm from '@/components/reserves/ReserveForm.vue'
import CommonError from '@/components/common/CommonError.vue'

const router = useRouter()
const route = useRoute()
const id = Number(route.params.id)

const reserveCategoriesStore = useReserveCategoriesStore()
const { categories } = storeToRefs(reserveCategoriesStore)
const { getCategories } = reserveCategoriesStore

const reservesStore = useReservesStore()
const { reserve } = storeToRefs(reservesStore)
const { getReserveById, updateReserve } = reservesStore

const data = ref<Partial<Reserve>>({})
const initial = ref<Partial<Reserve>>({})

const currentReserve = computed<Reserve | null>(() => {
  const r = reserve.value
  return 'id' in r ? (r as Reserve) : null
})

const errorMessage = computed<string | undefined>(() => {
  const r = reserve.value
  if ('error' in r && r.error) {
    return String(r.error)
  }
  if (!currentReserve.value && reservesStore.error) {
    return reservesStore.error
  }
  return 'Запись не найдена'
})

getReserveById(id)

if (!categories.value.length) {
  getCategories()
}

function buildBody(): Partial<Reserve> {
  const body: Partial<Reserve> = {}
  const keys: (keyof Reserve)[] = [
    'category_id',
    'kind',
    'description',
    'quantity',
    'unit',
    'expiry_date',
    'location',
    'place',
    'is_active',
  ]
  for (const key of keys) {
    if (data.value[key] !== initial.value[key]) {
      ;(body[key] as unknown) = data.value[key]
    }
  }
  return body
}

async function update() {
  const body = buildBody()
  if (Object.keys(body).length === 0) {
    return
  }
  const result = await updateReserve(id, body)
  if (result?.id) {
    router.push({ path: '/reserves' })
  }
}

watch(
  currentReserve,
  (r) => {
    if (!r) return
    data.value = {
      category_id: r.category_id,
      kind: r.kind,
      description: r.description,
      quantity: r.quantity,
      unit: r.unit,
      expiry_date: r.expiry_date,
      location: r.location,
      place: r.place,
      is_active: r.is_active,
    }
    initial.value = { ...data.value }
  },
  { immediate: true }
)
</script>

<template>
  <ReserveLayout
    @action="router.push({ path: '/reserves' })"
    text="Назад к запасам"
  >
    <template #content>
      <template v-if="currentReserve">
        <ReserveForm
          v-model:model="data"
          :categories="categories"
          :createdAt="currentReserve.created_at"
          @sendForm="update"
        />
      </template>
      <template v-else>
        <CommonError :error="errorMessage" />
      </template>
    </template>
  </ReserveLayout>
</template>

<style scoped>
</style>
