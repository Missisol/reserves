export const routes = [
  {
    path: '/',
    name: 'reserves',
    component: () => import('@/views/ReservesView.vue'),
  },
  {
    path: '/reserves/create',
    name: 'reserve-create',
    component: () => import('@/views/ReserveCreateView.vue'),
  },
  {
    path: '/reserves/:id/edit',
    name: 'reserve-update',
    component: () => import('@/views/ReserveUpdateView.vue'),
  },
]

const routeTitles: Record<string, string> = {
  'reserves': 'Запасы',
  'reserve-create': 'Создать запас',
  'reserve-update': 'Редактировать запас',
}

export function setDocumentTitle(routeName: string | symbol | null | undefined) {
  const title = routeName && routeTitles[String(routeName)]
  document.title = title ? `${title}` : 'Запасы'
}