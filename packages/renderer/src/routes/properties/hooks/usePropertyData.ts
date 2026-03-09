import { useQuery } from '@tanstack/react-query'
import {
  propertiesApi,
  usersApi,
  officeApi,
  naverAdsApi,
  naverAdMatchSuggestionsApi,
  matchesApi,
  buyerRequirementsApi,
  contactsApi,
  consultationsApi,
  realTransactionsApi,
  marketPricesApi,
  propertyLocationsApi,
} from '@/api'

export function usePropertyData() {
  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: propertiesApi.getAllFull,
  })

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
  })

  const { data: isPremium = false } = useQuery({
    queryKey: ['office', 'isPremium'],
    queryFn: officeApi.isPremium,
  })

  const { data: naverAds = [] } = useQuery({
    queryKey: ['naverAds'],
    queryFn: naverAdsApi.getAll,
    enabled: isPremium,
  })

  const { data: matchSuggestions = [] } = useQuery({
    queryKey: ['naverAdMatchSuggestions'],
    queryFn: naverAdMatchSuggestionsApi.getAll,
    enabled: isPremium,
  })

  const { data: matches = [] } = useQuery({
    queryKey: ['matches'],
    queryFn: matchesApi.getAll,
  })

  const { data: buyerRequirements = [] } = useQuery({
    queryKey: ['buyerRequirements'],
    queryFn: buyerRequirementsApi.getAll,
  })

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: contactsApi.getAll,
  })

  const { data: consultations = [] } = useQuery({
    queryKey: ['consultations'],
    queryFn: consultationsApi.getAll,
  })

  const { data: realTransactions = [] } = useQuery({
    queryKey: ['realTransactions'],
    queryFn: realTransactionsApi.getAll,
  })

  const { data: marketPrices = [] } = useQuery({
    queryKey: ['marketPrices'],
    queryFn: marketPricesApi.getAll,
  })

  const { data: propertyLocations = [] } = useQuery({
    queryKey: ['propertyLocations'],
    queryFn: propertyLocationsApi.getAll,
  })

  // 유틸리티 함수들
  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    return user?.name || '미지정'
  }

  const getPropertyName = (propertyId: string) => {
    const property = properties.find((p) => p.id === propertyId) as (typeof properties[number] & { buildingName?: string; dongName?: string; unitName?: string }) | undefined
    if (!property) return '알 수 없음'
    // PropertyFull view provides buildingName, dongName, unitName
    return `${property.buildingName || ''} ${property.dongName || ''} ${property.unitName || ''}`.trim() || '매물'
  }

  const getAdsForProperty = (propertyId: string) => {
    return naverAds.filter((ad) => ad.matchedPropertyId === propertyId)
  }

  const getMatchesForProperty = (propertyId: string) => {
    return matches.filter((m) => m.propertyId === propertyId)
  }

  const getBuyerName = (buyerReqId: string) => {
    const req = buyerRequirements.find((r) => r.id === buyerReqId)
    if (!req) return '알 수 없음'
    const contact = contacts.find((c) => c.id === req.contactId)
    return contact?.name || '알 수 없음'
  }

  const getSuggestionsForAd = (adId: string) => {
    return matchSuggestions.filter((s) => s.naverAdId === adId)
  }

  return {
    // 데이터
    properties,
    users,
    isPremium,
    naverAds,
    matchSuggestions,
    matches,
    buyerRequirements,
    contacts,
    consultations,
    realTransactions,
    marketPrices,
    propertyLocations,
    // 상태
    isLoading: propertiesLoading,
    // 유틸리티
    getUserName,
    getPropertyName,
    getAdsForProperty,
    getMatchesForProperty,
    getBuyerName,
    getSuggestionsForAd,
  }
}
