<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

import { useReserveCategoriesStore } from '@/stores/reserveCategories'
import { useReservesStore } from '@/stores/reserves'
import { formatDate, formatQuantity, getStatusLabel, getToggleLabel } from '@/utils/reserveHelpers'
import { reserveTableColumns } from '@/utils/commonData'
import CommonButton from '@/components/common/CommonButton.vue'
import IconPlus from '@/components/icons/IconPlus.vue'
import IconEdit from '@/components/icons/IconEdit.vue'
import IconDelete from '@/components/icons/IconDelete.vue'
import TransitionDropdown from '@/components/transition/TransitionDropdown.vue'
import ReserveCategoryCreate from '@/components/reserves/ReserveCategoryCreate.vue'
import ReserveCategoryManage from '@/components/reserves/ReserveCategoryManage.vue'
import CommonConfirmDialog from '@/components/common/CommonConfirmDialog.vue'
import CommonPagination from '@/components/common/CommonPagination.vue'
import type { ReserveCategory, ReserveSortField, ReserveTableColumn } from '@/@types/reserve'

const router = useRouter()

const goToCreateReserve = () => {
  router.push({ path: '/reserves/create' })
}

const reserveCategoriesStore = useReserveCategoriesStore()
const { categories: reserveCategories } = storeToRefs(reserveCategoriesStore)
const { getCategories: getReserveCategories } = reserveCategoriesStore

const reservesStore = useReservesStore()
const { reserves, filters, pagination, isLoading, error } = storeToRefs(reservesStore)
const { getReserves, toggleReserveStatus, deleteReserveById, setPage, setPerPage } = reservesStore


const quantityPerPage = ref<number>(filters.value.per_page)

// Category filter dropdown
const isOpenCategoryFilter = ref(false)
const isOpenCategoryManage = ref(false)

// Rows-per-page selector
const perPageOptions = [1, 5, 10, 20, 50] as const

// Sorting state
const activeSortField = ref<ReserveSortField | ''>('')
const activeSortOrder = ref<'asc' | 'desc'>('asc')

// Delete confirmation
const showDeleteDialog = ref(false)
const deleteReserveId = ref<number | null>(null)

function openDeleteDialog(id: number) {
  deleteReserveId.value = id
  showDeleteDialog.value = true
}

async function confirmDelete() {
  if (deleteReserveId.value != null) {
    await deleteReserveById(deleteReserveId.value)
    deleteReserveId.value = null
  }
  // After deleting the last row of a page, step back to a page that still exists
  if (pagination.value.pages > 0 && filters.value.page > pagination.value.pages) {
    setPage(pagination.value.pages)
  } else {
    getReserves()
  }
  showDeleteDialog.value = false
}

// Status filter
const statusOptions = [
  { value: 'all', label: 'Все' },
  { value: 'active', label: 'Активные' },
  { value: 'inactive', label: 'Неактивные' },
] as const

function applyStatus(value: string) {
  filters.value.status = value as 'all' | 'active' | 'inactive'
  filters.value.page = 1
  getReserves()
}

// Category filter
function applyCategory(category?: ReserveCategory) {
  filters.value.category_id = category ? Number(category.id) : null
  filters.value.page = 1
  isOpenCategoryFilter.value = false
  getReserves()
}

// Toggle sort
function toggleSort(field: ReserveSortField) {
  if (activeSortField.value === field) {
    if (activeSortOrder.value === 'asc') {
      activeSortOrder.value = 'desc'
    } else {
      activeSortField.value = ''
      activeSortOrder.value = 'asc'
    }
  } else {
    activeSortField.value = field
    activeSortOrder.value = 'asc'
  }
  filters.value.sort = activeSortField.value
  filters.value.order = activeSortOrder.value
  filters.value.page = 1
  getReserves()
}

// Handle sortable column header click
function onHeaderClick(col: ReserveTableColumn) {
  if (col.sortable && col.sortField) {
    toggleSort(col.sortField)
  }
}

watch(quantityPerPage, (newModel: number, _oldModel: number | undefined) => {
  setPerPage(newModel)
})

// Initial load
getReserveCategories()
getReserves()

onBeforeUnmount(() => {
  filters.value.status = 'all'
  filters.value.category_id = null
  filters.value.sort = ''
  filters.value.order = 'desc'
  filters.value.page = 1
  filters.value.per_page = 10
})
</script>

<template>
  <div class="parent">

    <!-- Filters -->
    <section class="filters">
      <h2 class="section__title">Фильтры</h2>
      <div class="filter">
        <h3 class="filters__label">Статус:</h3>
        <ul class="filters__group">
          <li
            v-for="opt in statusOptions"
            :key="opt.value"
            class="filter-btn"
            :class="{ 'filter-btn--active': filters.status === opt.value }"
            @click="applyStatus(opt.value)"
          >{{ opt.label }}</li>
        </ul>
      </div>

      <div class="filter">
        <h3 class="filters__label">Категория:</h3>
        <ul class="filters__group">
          <li
            class="filter-btn"
            :class="{ 'filter-btn--active': !filters.category_id }"
            @click="applyCategory()"
          >Все</li>
          <li
            v-for="cat in reserveCategories"
            :key="cat.id"
            class="filter-btn"
            :class="{ 'filter-btn--active': filters.category_id === cat.id }"
            @click="applyCategory(cat)"
          >{{ cat.name }}</li>
        </ul>
      </div>
    </section>

    <!-- Category management -->
    <TransitionDropdown v-model="isOpenCategoryManage">
      <template #button>Управление категориями</template>
      <div
        v-if="isOpenCategoryManage"
        class="category-manage"
      >
        <ReserveCategoryCreate />
        <ReserveCategoryManage />
      </div>
    </TransitionDropdown>


    <section class="controls">
      <h2 class="section__title">Запасы</h2>
      <div class="controls__box">
        <CommonButton @buttonAction="goToCreateReserve">
          <template #icon><IconPlus /></template>
          <template #text>Добавить запас</template>
        </CommonButton>
      </div>
    </section>

    <!-- Loading / Error / Empty -->
    <template v-if="isLoading && !reserves.length">
      <p class="empty">Загрузка...</p>
    </template>
    <template v-else-if="error">
      <p class="empty error">{{ error }}</p>
    </template>
    <template v-else-if="!reserves.length">
      <p class="empty">
        Записей пока нет.
        <RouterLink
          to="/reserves/create"
          class="empty__link"
        >Добавить первый</RouterLink>
      </p>
    </template>
    <template v-else>
      <div class="table-wrapper">
        <table class="table">
          <thead>
            <tr>
              <th
                v-for="col in reserveTableColumns"
                :key="col.key"
                :class="{ sortable: col.sortable }"
                @click="onHeaderClick(col)"
              >
                {{ col.label }}
                <span v-if="col.sortable && activeSortField === col.sortField">
                  {{ activeSortOrder === 'asc' ? ' ↑' : ' ↓' }}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in reserves" :key="item.id">
              <td v-for="col in reserveTableColumns" :key="col.key">
                <!-- datetime: ISO datetime → date part only -->
                <template v-if="col.cellType === 'datetime'">
                  {{ formatDate(String((item as Record<string, unknown>)[col.key] ?? '').slice(0, 10)) }}
                </template>
                <!-- date (expiry_date) -->
                <template v-else-if="col.cellType === 'date'">
                  {{ formatDate((item as Record<string, unknown>)[col.key] as string | null | undefined) }}
                </template>
                <!-- quantity -->
                <template v-else-if="col.cellType === 'quantity'">
                  {{ formatQuantity(item) }}
                </template>
                <!-- status -->
                <template v-else-if="col.cellType === 'status'">
                  <span
                    class="status-badge"
                    :class="{ 'status-badge--inactive': !item.is_active }"
                  >{{ getStatusLabel(item.is_active) }}</span>
                </template>
                <!-- actions -->
                <template v-else-if="col.cellType === 'actions'">
                  <div class="actions">
                    <RouterLink
                      :to="`/reserves/${item.id}/edit`"
                      class="action-btn"
                      title="Редактировать"
                    >
                      <IconEdit />
                    </RouterLink>
                    <button
                      class="action-btn action-btn--text"
                      :title="item.is_active ? 'Использовано' : 'Вернуть'"
                      @click="toggleReserveStatus(item.id)"
                    >
                      {{ getToggleLabel(item.is_active) }}
                    </button>
                    <button
                      class="action-btn action-btn--danger"
                      title="Удалить"
                      @click="openDeleteDialog(item.id)"
                    >
                      <IconDelete />
                    </button>
                  </div>
                </template>
                <!-- text (default) -->
                <template v-else>
                  {{ (item as Record<string, unknown>)[col.key] || '—' }}
                </template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>


      <!-- Pagination -->
      <CommonPagination
        :optionsData="perPageOptions"
        :pagination="pagination"
        :filters="filters"
        @setPage="setPage"
        v-model:model="quantityPerPage" />

    </template>

    <!-- Delete confirmation -->
    <CommonConfirmDialog
      v-model="showDeleteDialog"
      title="Удаление записи"
      message="Вы уверены, что хотите удалить эту запись? Это действие нельзя отменить."
      :confirmText="'Удалить'"
      :cancelText="'Отмена'"
      @confirm="confirmDelete"
    />
  </div>
</template>

<style scoped>
.parent {
  --gradient: var(--gradient-secondary);
  --dim: left;
  --cbtn-background: var(--color-primary);
  --cbtn-border: var(--color-primary);
  --dropdown-color: var(--color-primary);
  --label-color: var(--color-primary);

  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.controls__box {
  display: flex;
  gap: 1rem;
}

.filters {
  display: flex;
  flex-direction: column;
  gap: var(--size-2);
  flex-wrap: wrap;
}

.filter {
  display: flex;
  flex-direction: column;
  /* gap: 0.5rem; */
}

.filters__group {
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  align-items: center;
  position: relative;
}

.filters__label {
  font-weight: 600;
  color: var(--color-muted-foreground);
}

.filter-btn {
  background: var(--color-background);
  border: 1px solid var(--color-input);
  border-radius: 24px;
  padding: 4px 14px;
  font-size: var(--font-size-14);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition-smooth);
}

.filter-btn--active {
  color: var(--color-primary-foreground);
  background: var(--color-primary);
  border-color: var(--color-primary);
}

.filter-btn:hover:not(.filter-btn--active) {
  background: var(--color-muted);
}

.category-dropdown {
  position: absolute;
  z-index: 20;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  box-shadow: var(--shadow-lg);
  min-width: 160px;
  padding: 0.25rem 0;
}

.category-dropdown__item {
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: var(--font-size-14);
}

.category-dropdown__item--active {
  background: var(--color-muted);
  font-weight: 600;
}

.category-dropdown__item:hover {
  background: var(--color-muted);
}

.table-wrapper {
  overflow-x: auto;
}

.table {
  width: 100%;
  border-collapse: collapse;
  min-width: 900px;
}

.table th,
.table td {
  padding: 0.5rem 1rem;
  text-align: left;
  border: 1px solid var(--color-border);
  font-size: var(--font-size-14);
}

.table th {
  background: hsl(from var(--color-muted) h s l / 0.3);
  font-weight: 600;
  color: var(--color-primary);
}

.sortable {
  cursor: pointer;
  user-select: none;
}

.sortable:hover {
  background: hsl(from var(--color-muted) h s l / 0.5);
}

.status-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: var(--font-size-14);
  font-weight: 600;
  background: var(--color-primary);
  color: var(--color-primary-foreground);
}

.status-badge--inactive {
  background: var(--color-muted);
  color: var(--color-muted-foreground);
}

.actions {
  display: flex;
  gap: 0.25rem;
}

.action-btn {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: var(--size);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-muted-foreground);
  transition: var(--transition-smooth);
  min-width: var(--size-5);
}

.pagination__btn:hover,
.action-btn:hover {
  color: var(--color-primary);
}

.action-btn--text {
  font-size: var(--font-size-14);
  font-weight: 500;
  white-space: nowrap;
}

.action-btn--danger:hover {
  color: var(--color-destructive);
}

.action-btn > svg {
  width: var(--size-4);
  height: var(--size-4);
}

.empty {
  text-align: center;
  color: var(--color-muted-foreground);
  padding: 3rem;
  font-size: var(--font-size-16);
}

.empty__link {
  color: var(--color-primary);
  text-decoration: underline;
  cursor: pointer;
}

.empty.error {
  color: var(--color-destructive);
}

.category-manage {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;

  @media (width < 768px) {
    grid-template-columns: auto;
  }
}
</style>