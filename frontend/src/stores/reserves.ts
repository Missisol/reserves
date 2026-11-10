import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiUrls } from '@/utils/apiUrls'
import type { Reserve, ReserveFilters, ReservePagination } from '@/@types/reserve'

export const useReservesStore = defineStore('reserves', () => {
  const reserves = ref<Reserve[]>([])
  const reserve = ref<Reserve | Record<string, never>>({})
  const pagination = ref<ReservePagination>({
    page: 1,
    per_page: 10,
    total: 0,
    pages: 0,
    has_prev: false,
    has_next: false,
  })
  const filters = ref<ReserveFilters>({
    status: 'all',
    category_id: null,
    sort: '',
    order: 'desc',
    page: 1,
    per_page: 10,
  })
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  function buildQueryParams(): URLSearchParams {
    const params = new URLSearchParams()
    if (filters.value.status !== 'all') {
      params.append('status', filters.value.status)
    }
    if (filters.value.category_id) {
      params.append('category_id', String(filters.value.category_id))
    }
    if (filters.value.sort) {
      params.append('sort', filters.value.sort)
    }
    if (filters.value.order) {
      params.append('order', filters.value.order)
    }
    params.append('page', String(filters.value.page))
    params.append('per_page', String(filters.value.per_page))
    return params
  }

  async function getReserves() {
    isLoading.value = true
    error.value = null
    try {
      const res = await fetch(`${apiUrls.reserves}?${buildQueryParams().toString()}`)
      const data = await res.json()
      reserves.value = data.items
      pagination.value = data.pagination
    } catch (e) {
      error.value = 'Failed to load reserves'
      console.log('error', e)
    } finally {
      isLoading.value = false
    }
  }

  async function getReserveById(id: number | string) {
    reserve.value = {}
    isLoading.value = true
    error.value = null
    try {
      const res = await fetch(`${apiUrls.reserve}/${id}`)
      reserve.value = await res.json()
    } catch (e) {
      error.value = 'Failed to load reserve'
      console.log('error', e)
    } finally {
      isLoading.value = false
    }
  }

  async function createReserve(body: Partial<Reserve>) {
    isLoading.value = true
    error.value = null
    try {
      const res = await fetch(`${apiUrls.reserve}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        error.value = err.error || 'Failed to create reserve'
        return null
      }
      return await res.json()
    } catch (e) {
      error.value = 'Failed to create reserve'
      console.log('error', e)
    } finally {
      isLoading.value = false
    }
  }

  async function updateReserve(id: number | string, body: Partial<Reserve>) {
    isLoading.value = true
    error.value = null
    try {
      // PATCH updates only the provided fields; PUT requires the full reserve body
      const res = await fetch(`${apiUrls.reserve}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      if (!res.ok) {
        const err = await res.json()
        error.value = err.error || 'Failed to update reserve'
        return null
      }
      return await res.json()
    } catch (e) {
      error.value = 'Failed to update reserve'
      console.log('error', e)
    } finally {
      isLoading.value = false
    }
  }

  async function toggleReserveStatus(id: number) {
    const item = reserves.value.find(r => r.id === id)
    const currentReserve = reserve.value as Reserve
    const target = currentReserve.id === id ? currentReserve : item

    if (!target) return

    const newStatus = !target.is_active
    try {
      const res = await fetch(`${apiUrls.reserve}/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: newStatus }),
      })
      if (!res.ok) {
        const err = await res.json()
        error.value = err.error || 'Failed to update status'
        return null
      }
      const result = await res.json()
      // update current reserve if open
      if (currentReserve.id === id) {
        ;(currentReserve as Reserve).is_active = newStatus
      }
      // update list item
      const index = reserves.value.findIndex(r => r.id === id)
      if (index !== -1 && reserves.value[index]) {
        reserves.value[index].is_active = newStatus
      }
      return result
    } catch (e) {
      error.value = 'Failed to update status'
      console.log('error', e)
    }
    return null
  }

  async function deleteReserveById(id: number) {
    isLoading.value = true
    error.value = null
    try {
      const res = await fetch(`${apiUrls.reserve}/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      })
      if (!res.ok) {
        const err = await res.json()
        error.value = err.error || 'Failed to delete reserve'
        return false
      }
      // Remove from list
      reserves.value = reserves.value.filter(r => r.id !== id)
      return true
    } catch (e) {
      error.value = 'Failed to delete reserve'
      console.log('error', e)
    } finally {
      isLoading.value = false
    }
    return false
  }

  function setPage(page: number) {
    filters.value.page = page
    getReserves()
  }

  function setPerPage(per_page: number) {
    filters.value.per_page = per_page
    filters.value.page = 1
    getReserves()
  }

  return {
    reserves,
    reserve,
    filters,
    pagination,
    isLoading,
    error,
    getReserves,
    getReserveById,
    createReserve,
    updateReserve,
    toggleReserveStatus,
    deleteReserveById,
    setPage,
    setPerPage,
  }
})
