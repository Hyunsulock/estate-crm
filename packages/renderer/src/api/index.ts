// 통합 API 레이어
// Supabase로 전환된 API는 supabase/에서, 아직 전환 안 된 건 mock-api에서 가져옴
// Phase 2+ 테이블들은 mock 유지

// === Supabase API (Phase 1 핵심) ===
export { usersApi } from './supabase/users'
export { propertiesApi } from './supabase/properties'
export { contactsApi } from './supabase/contacts'
export { buildingsApi, dongsApi, unitsApi } from './supabase/buildings'
export { ownershipsApi } from './supabase/ownerships'
export { consultationsApi } from './supabase/consultations'
export { buyerRequirementsApi } from './supabase/buyers'
export { tasksApi } from './supabase/tasks'
export { externalFeedsApi } from './supabase/external-feeds'
export { insightsApi } from './supabase/insights'
export { syncLogsApi } from './supabase/sync-logs'

// === Mock API (Phase 2+ / 아직 미전환) ===
export {
  customersApi,
  dealsApi,
  eventsApi,
  networkGroupsApi,
  networkPostsApi,
  searchApi,
  buyerConsultationsApi,
  matchesApi,
  contractsApi,
  activityLogsApi,
  officeApi,
  naverAdsApi,
  naverAdMatchSuggestionsApi,
  contractTemplatesApi,
  commissionApi,
  dealChecklistApi,
  realTransactionsApi,
  marketPricesApi,
  buildingRegistryApi,
  fieldVisitsApi,
  propertyLocationsApi,
  calculatorApi,
  aiSearchApi,
} from './mock-api'
