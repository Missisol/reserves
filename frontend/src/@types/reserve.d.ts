export interface ReserveCategory {
  id: number | string
  name: string
}

export interface Reserve {
  id: number
  created_at: string
  category_id: number | null
  category_name?: string
  kind: string
  description?: string | null
  quantity: number
  unit?: string | null
  expiry_date?: string | null
  location?: string | null
  place?: string | null
  is_active: boolean
  error?: unknown
}

export type ReserveStatusFilter = 'all' | 'active' | 'inactive'

export type ReserveSortField = 'kind' | 'quantity' | 'category' | 'location' | 'place'

export type SortOrder = 'asc' | 'desc'

export interface ReservePagination {
  page: number
  per_page: number
  total: number
  pages: number
  has_prev: boolean
  has_next: boolean
}

export interface ReserveFilters {
  status: ReserveStatusFilter
  category_id: number | null
  sort: ReserveSortField | ''
  order: SortOrder
  page: number
  per_page: number
}
