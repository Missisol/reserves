import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiUrls } from '@/utils/apiUrls'
import type { ReserveCategory } from '@/@types/reserve'

export const useReserveCategoriesStore = defineStore('reserveCategories', () => {
  const categories = ref<ReserveCategory[]>([])

  async function getCategories() {
    const res = await fetch(`${apiUrls.reserveCategories}`)
    categories.value = await res.json()
  }

  async function createCategory(name: string) {
    try {
      const res = await fetch(`${apiUrls.reserveCategories}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) {
        const err = await res.json()
        return { error: err.error || 'Failed to create category' }
      }
      return await res.json()
    } catch (error) {
      console.log('error', error)
    }
  }

  async function updateCategory(id: number, name: string) {
    try {
      const res = await fetch(`${apiUrls.reserveCategory}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })
      if (!res.ok) {
        const err = await res.json()
        return { error: err.error || 'Failed to update category' }
      }
      return await res.json()
    } catch (error) {
      console.log('error', error)
    }
  }

  async function deleteCategory(id: number) {
    try {
      const res = await fetch(`${apiUrls.reserveCategory}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete' }),
      })
      if (!res.ok) {
        const err = await res.json()
        return { error: err.error || 'Failed to delete category' }
      }
      return res.status
    } catch (error) {
      console.log('error', error)
    }
  }

  return {
    categories,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  }
})
