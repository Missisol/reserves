<script setup lang="ts">
import { computed } from 'vue'
import type { ReserveFilters, ReservePagination } from '@/@types/reserve'

interface Props {
  optionsData: readonly number[]
  pagination: ReservePagination
  filters: ReserveFilters
}

const emit = defineEmits<{
  setPage: [page: number]
}>()
const model = defineModel<string | number>('model')
const { optionsData, pagination, filters } = defineProps<Props>()

const visiblePages = computed(() => {
  const total = pagination.pages
  const current = pagination.page
  if (total <= 0) return [] as (number | '…')[]

  const delta = 1
  const pages = new Set<number>()
  for (let i = Math.max(1, current - delta); i <= Math.min(total, current + delta); i++) {
    pages.add(i)
  }
  pages.add(1)
  pages.add(total)

  const sorted = [...pages].sort((a, b) => a - b)
  const result: (number | '…')[] = []
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push('…')
    result.push(sorted[i])
  }
  return result
})

</script>

<template>
  <div class="pagination">
    <div class="pagination__controls">
      <div class="pagination__rows-per-page">
        <label for="rows-per-page" class="pagination__label">Показывать:</label>
      <select
        v-model="model"
        name="category"
        id="rows-per-page"
        class="category-select"
      >
        <option 
          v-for="opt in optionsData" 
          :key="opt" 
          :value="opt"
        >{{ opt }}</option>
      </select>
        <span class="pagination__label">записей</span>
      </div>


      <div class="pagination__total">
        Всего: {{ pagination.total }}
      </div>
    </div>

    <nav class="pagination__pages" aria-label="Навигация по страницам">
      <button
        class="pagination__btn pagination__btn--text"
        :disabled="!pagination.has_prev"
        @click="emit('setPage', pagination.page - 1)"
      >
        ‹‹
      </button>

      <template v-for="(page, idx) in visiblePages" :key="idx">
        <template v-if="page === '…'">
          <span class="pagination__ellipsis" aria-hidden="true">…</span>
        </template>
        <button
          v-else
          class="pagination__btn pagination__page"
          :class="{ 'pagination__page--active': page === filters.page }"
          @click="emit('setPage', page)"
        >{{ page }}</button>
      </template>

      <button
        class="pagination__btn pagination__btn--text"
        :disabled="!pagination.has_next"
        @click="emit('setPage', pagination.page + 1)"
      >
        ››
      </button>
    </nav>

  </div>
</template>

<style scoped>
.pagination {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: var(--size-2);
}

.pagination__controls {
  width: 100%;
  display: flex;
  justify-content: space-between;
}

.pagination__rows-per-page {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.pagination__label {
  font-size: var(--font-size-14);
  color: var(--color-muted-foreground);
}

.pagination__rows-per-page select {
  padding: 4px 8px;
  border: 1px solid var(--color-input);
  border-radius: var(--radius);
  background: var(--color-background);
  color: inherit;
  font-size: var(--font-size-14);
  cursor: pointer;
}

.pagination__pages {
  display: flex;
  align-items: center;
  gap: var(--size-3);
}

.pagination__btn,
.pagination__page {
  background: var(--color-background);
  border: 1px solid var(--cbtn-border, var(--color-primary));
  border-radius: calc(var(--radius) - 2px);
  padding-block: var(--size-2);
  padding-inline: var(--size-3);
  display: inline-flex;
  justify-content: center;
  align-items: center;
  font-size: var(--font-size-14);
  line-height: 1.5rem;
  font-weight: 500;
  white-space: nowrap;
  cursor: pointer;
}

.pagination__btn--text {
  border: none;
  font-size: var(--font-size-24);
}

.pagination__page--active {
  color: var(--color-primary-foreground);
  background: var(--cbtn-background, var(--color-primary));
  font-weight: 700;
  pointer-events: none;
}

.pagination__ellipsis {
  color: var(--color-muted-foreground);
  padding: 0 2px;
}

.pagination__btn:disabled,
.action-btn:disabled {
  color: hsl(from var(--color-muted-foreground) h s l / 0.8);
  pointer-events: none;
}

.pagination__total {
  font-size: var(--font-size-14);
  color: var(--color-muted-foreground);
  align-self: center;
}

</style>
