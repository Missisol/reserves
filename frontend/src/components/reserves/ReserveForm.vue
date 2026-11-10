<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

import CategorySelect from '@/components/category/CategorySelect.vue'
import CommonButton from '@/components/common/CommonButton.vue'
import IconSave from '@/components/icons/IconSave.vue'

import type { ReserveCategory, Reserve } from '@/@types/reserve'
import { formatDateTime, toInputDate } from '@/utils/reserveHelpers'

const { categories, createdAt } = defineProps<{
  categories: ReserveCategory[]
  createdAt?: string
}>()

const emit = defineEmits<{
  (e: 'sendForm'): void
}>()

const model = defineModel<Partial<Reserve>>('model', { required: true })

// CategorySelect expects string|number, while category_id may be null
const categoryModel = computed({
  get: () => model.value.category_id ?? '',
  set: (value: string | number) => {
    model.value.category_id = value === '' ? null : Number(value)
  },
})

const unitOptions = ['шт', 'кг', 'г', 'л', 'мл', 'уп', 'кор']

const errors = computed(() => {
  const result: Record<string, string> = {}
  if (!model.value.kind?.trim()) {
    result.kind = 'Укажите вид запаса'
  }
  if (model.value.quantity == null || model.value.quantity <= 0) {
    result.quantity = 'Количество должно быть больше 0'
  }
  return result
})

const isValid = computed(() => Object.keys(errors.value).length === 0)

const submitted = ref(false)

function sendForm() {
  submitted.value = true
  if (!isValid.value) {
    return
  }
  emit('sendForm')
}

function cancel() {
  router.push({ path: '/reserves' })
}

const router = useRouter()
</script>

<template>
  <form
    class="form"
    @submit.prevent="sendForm"
  >
    <label
      for="category"
      class="label"
    >Категория
      <CategorySelect
        :categories="categories"
        idName="category"
        :isDefaultOption="true"
        v-model:model="categoryModel"
      />
    </label>
    <label
      for="kind"
      class="label"
    >Вид
      <input
        id="kind"
        v-model="model.kind"
        type="text"
        placeholder="Например: крупа, картофель"
      >
      <span
        v-if="submitted && errors.kind"
        class="label__error"
      >{{ errors.kind }}</span>
    </label>
    <label
      for="description"
      class="label"
    >Описание
      <textarea
        id="description"
        v-model="model.description"
        rows="3"
      ></textarea>
    </label>
    <div class="field-row">
      <label
        for="quantity"
        class="label"
      >Количество
        <input
          id="quantity"
          v-model.number="model.quantity"
          type="number"
          min="0"
          step="0.01"
        >
        <span
          v-if="submitted && errors.quantity"
          class="label__error"
        >{{ errors.quantity }}</span>
      </label>
      <label
        for="unit"
        class="label"
      >Единица
        <input
          id="unit"
          v-model="model.unit"
          type="text"
          list="unit-options"
          placeholder="кг"
        >
        <datalist id="unit-options">
          <option
            v-for="unit in unitOptions"
            :key="unit"
            :value="unit"
          ></option>
        </datalist>
      </label>
    </div>
    <div class="field-row">
      <label
        for="expiry_date"
        class="label"
      >Дата, до которой годен
        <input
          id="expiry_date"
          :value="toInputDate(model.expiry_date)"
          type="date"
          @input="model.expiry_date = ($event.target as HTMLInputElement).value || null"
        >
      </label>
      <div
        v-if="createdAt"
        class="label"
      >
        <span class="label__text">Дата записи</span>
        <span class="value--readonly">{{ formatDateTime(createdAt) }}</span>
      </div>
    </div>
    <div class="field-row">
      <label
        for="location"
        class="label"
      >Локация
        <input
          id="location"
          v-model="model.location"
          type="text"
          placeholder="Например: кладовая"
        >
      </label>
      <label
        for="place"
        class="label"
      >Место
        <input
          id="place"
          v-model="model.place"
          type="text"
          placeholder="Например: полка 2"
        >
      </label>
    </div>
    <label class="checkbox">
      <input
        v-model="model.is_active"
        type="checkbox"
      >
      <span>Запись активна</span>
    </label>
    <div class="button-wrapper">
      <CommonButton buttonType="submit">
        <template #icon><IconSave /></template>
        <template #text>Сохранить</template>
      </CommonButton>
      <div class="common-button--dark">
        <CommonButton @buttonAction="cancel">
          <template #text>Отмена</template>
        </CommonButton>
      </div>
    </div>
  </form>
</template>

<style scoped>
.form {
  display: grid;
  gap: 1.5rem;
}

.field-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;

  @media (width < 768px) {
    grid-template-columns: auto;
  }
}

.label {
  color: var(--color-secondary);
  font-size: 1rem;
  line-height: 1.5rem;
  font-weight: 600;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.label__text {
  color: var(--color-secondary);
}

.label input,
.label textarea,
.label select {
  font-size: 0.875rem;
  line-height: 1.25rem;
  font-weight: 400;
  color: var(--color-foreground);
  background: hsl(from var(--color-background) h s l / 0.5);
  border: 1px solid var(--color-input);
  border-radius: calc(var(--radius) - 2px);
  padding: 0.5rem 0.75rem;
}

.label textarea {
  resize: vertical;
  field-sizing: content;
}

.label__error {
  font-size: 0.75rem;
  line-height: 1rem;
  font-weight: 400;
  color: var(--color-destructive);
}

.value--readonly {
  color: var(--color-foreground);
  font-weight: 400;
  font-size: 0.875rem;
}

.checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-foreground);
  font-size: 0.875rem;
  cursor: pointer;
}

.checkbox input {
  width: 1rem;
  height: 1rem;
  accent-color: var(--color-secondary);
}

.button-wrapper {
  --cbtn-background: var(--color-secondary);
  --cbtn-border: var(--color-secondary);
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}
</style>
