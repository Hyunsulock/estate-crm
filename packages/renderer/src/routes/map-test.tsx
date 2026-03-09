import { createRoute } from '@tanstack/react-router'
import { KakaoMapTest } from '@/components/KakaoMapTest'
import type { RootRoute } from '@tanstack/react-router'

function MapTestPage() {
  return <KakaoMapTest />
}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: '/map-test',
    component: MapTestPage,
    getParentRoute: () => parentRoute,
  })
