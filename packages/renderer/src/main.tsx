import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRouter,
} from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/react-router-devtools'

// Demo routes (keeping for reference)
import FormSimpleDemo from './routes/demo/form.simple.tsx'
import FormAddressDemo from './routes/demo/form.address.tsx'
import TableDemo from './routes/demo/table.tsx'
import StoreDemo from './routes/demo/store.tsx'
import TanStackQueryDemo from './routes/demo/tanstack-query.tsx'

// CRM routes
import DashboardRoute from './routes/dashboard.tsx'
import CustomersRoute from './routes/customers.tsx'
import PropertiesRoute from './routes/properties/index.tsx'
import CalendarRoute from './routes/calendar.tsx'
import DealsRoute from './routes/deals.tsx'
import ContractsRoute from './routes/contracts.tsx'
import NetworkRoute from './routes/network.tsx'
import BuyersRoute from './routes/buyers.tsx'
import MatchesRoute from './routes/matches.tsx'
import StaffRoute from './routes/staff.tsx'
import PerformanceRoute from './routes/performance.tsx'
import CalculatorRoute from './routes/calculator.tsx'
import MapTestRoute from './routes/map-test.tsx'
import SettingsRoute from './routes/settings.tsx'
import AISearchRoute from './routes/ai-search.tsx'
import TasksRoute from './routes/tasks.tsx'

import { Layout } from './components/Layout'
import { Toaster } from './components/ui/sonner'

import * as TanStackQueryProvider from './integrations/tanstack-query/root-provider.tsx'

import './styles.css'
import reportWebVitals from './reportWebVitals.ts'

const rootRoute = createRootRoute({
  component: () => (
    <Layout>
      <Outlet />
      <TanStackRouterDevtools />
    </Layout>
  ),
})

const routeTree = rootRoute.addChildren([
  DashboardRoute(rootRoute as any),
  AISearchRoute(rootRoute as any),
  TasksRoute(rootRoute as any),
  CalendarRoute(rootRoute as any),
  CustomersRoute(rootRoute as any),
  PropertiesRoute(rootRoute as any),
  DealsRoute(rootRoute as any),
  ContractsRoute(rootRoute as any),
  NetworkRoute(rootRoute as any),
  BuyersRoute(rootRoute as any),
  MatchesRoute(rootRoute as any),
  StaffRoute(rootRoute as any),
  PerformanceRoute(rootRoute as any),
  CalculatorRoute(rootRoute as any),
  MapTestRoute(rootRoute as any),
  SettingsRoute(rootRoute as any),
  // Demo routes (keeping for reference)
  FormSimpleDemo(rootRoute as any),
  FormAddressDemo(rootRoute as any),
  TableDemo(rootRoute as any),
  StoreDemo(rootRoute as any),
  TanStackQueryDemo(rootRoute as any),
])

const TanStackQueryProviderContext = TanStackQueryProvider.getContext()
const router = createRouter({
  routeTree,
  context: {
    ...TanStackQueryProviderContext,
  },
  defaultPreload: 'intent',
  scrollRestoration: true,
  defaultStructuralSharing: true,
  defaultPreloadStaleTime: 0,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

const rootElement = document.getElementById('app')
if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement)
  root.render(
    <StrictMode>
      <TanStackQueryProvider.Provider {...TanStackQueryProviderContext}>
        <RouterProvider router={router} />
        <Toaster richColors position="top-right" />
      </TanStackQueryProvider.Provider>
    </StrictMode>,
  )
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals()
