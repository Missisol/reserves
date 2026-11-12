
import type { Theme } from '@/@types/common'
import type { ReserveTableColumn } from '@/@types/reserve'

export const themes: Theme[] = [
  {name: 'Светлая', value: 'light'},
  {name: 'Темная', value: 'dark'},
  {name: 'Авто', value: 'light dark'}
]

export const reserveTableColumns: ReserveTableColumn[] = [
  { key: 'created_at',    label: 'Дата записи',  sortable: false, cellType: 'datetime' },
  { key: 'category_name', label: 'Категория',    sortable: true,  sortField: 'category', cellType: 'text' },
  { key: 'kind',          label: 'Вид',          sortable: true,  sortField: 'kind',     cellType: 'text' },
  { key: 'description',   label: 'Описание',     sortable: false, cellType: 'text' },
  { key: 'quantity',      label: 'Количество',   sortable: true,  sortField: 'quantity', cellType: 'quantity' },
  { key: 'expiry_date',   label: 'Годен до',     sortable: false, cellType: 'date' },
  { key: 'location',      label: 'Локация',      sortable: true,  sortField: 'location', cellType: 'text' },
  { key: 'place',         label: 'Место',        sortable: true,  sortField: 'place',    cellType: 'text' },
  { key: 'is_active',     label: 'Статус',       sortable: false, cellType: 'status' },
  { key: '_actions',      label: 'Действия',     sortable: false, cellType: 'actions' },
]
