import { useState, useMemo } from 'react'
import { createRoute } from '@tanstack/react-router'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, RefreshCw, Crown, TrendingUp, Home, Building2, House, Store, MapPin } from 'lucide-react'
import { KakaoMap } from '@/components/KakaoMap'
import { TableSkeleton } from '@/components/skeletons'
import type { RootRoute } from '@tanstack/react-router'
import type { Property, NaverAd } from '@/types'

// Hooks
import { usePropertyFilters } from './hooks/usePropertyFilters'
import { usePropertyMutations } from './hooks/usePropertyMutations'
import { usePropertyData } from './hooks/usePropertyData'

// Components
import {
  PropertyFilters,
  PropertiesTable,
  PropertyDetailModal,
  NaverAdTab,
  AdAnalysisTab,
} from './components'

function PropertiesPage() {
  // Data
  const {
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
    isLoading,
    getUserName,
    getPropertyName,
    getAdsForProperty,
    getMatchesForProperty,
    getSuggestionsForAd,
  } = usePropertyData()

  // Filters
  const {
    filters,
    setFilters,
    showFilters,
    setShowFilters,
    showHidden,
    setShowHidden,
    filteredProperties,
    activeFilterCount,
    resetFilters,
  } = usePropertyFilters(properties)

  // UI State
  const [activeTab, setActiveTab] = useState<string>('properties')
  const [propertyTypeTab, setPropertyTypeTab] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list')
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null)
  const [selectedNaverAd, setSelectedNaverAd] = useState<NaverAd | null>(null)
  const [expandedPropertyId, setExpandedPropertyId] = useState<string | null>(null)

  // Mutations
  const {
    updatePropertyMutation,
    verifyInfoMutation,
    toggleHideMutation,
    createConsultationMutation,
    syncNaverAdsMutation,
    linkAdMutation,
    unlinkAdMutation,
    acceptSuggestionMutation,
    dismissSuggestionMutation,
    saveOwnerMutation,
  } = usePropertyMutations({
    onPropertyUpdated: () => setSelectedProperty(null),
    onConsultationCreated: () => {},
    onNaverAdLinked: () => setSelectedNaverAd(null),
  })

  // Handlers
  const handleSelectProperty = (property: Property) => {
    setSelectedProperty(property)
  }

  const handleToggleHide = (id: string, isHidden: boolean) => {
    toggleHideMutation.mutate({ id, isHidden })
  }

  const handleSaveProperty = (id: string, updates: Partial<Property>) => {
    updatePropertyMutation.mutate({ id, updates })
  }

  const handleVerifyInfo = (id: string) => {
    verifyInfoMutation.mutate({
      id,
      updates: {
        infoVerifiedAt: new Date(),
        updatedAt: new Date(),
      },
    })
  }

  const handleSaveOwner = async (data: { name: string; phone: string; phone2?: string }) => {
    return saveOwnerMutation.mutateAsync(data)
  }

  const handleCreateConsultation = (data: Parameters<typeof createConsultationMutation.mutate>[0]) => {
    createConsultationMutation.mutate(data)
  }

  const handleLinkAd = (adId: string, propertyId: string) => {
    linkAdMutation.mutate({ adId, propertyId })
  }

  const handleUnlinkAd = (adId: string) => {
    unlinkAdMutation.mutate(adId)
  }

  const handleAcceptSuggestion = (adId: string, propertyId: string) => {
    acceptSuggestionMutation.mutate({ adId, propertyId })
  }

  const handleDismissSuggestion = (adId: string, propertyId: string) => {
    dismissSuggestionMutation.mutate({ adId, propertyId })
  }

  const hiddenCount = properties.filter((p) => p.isHidden).length

  // 타입별 필터링
  const typeFilteredProperties = useMemo(() => {
    if (propertyTypeTab === 'all') return filteredProperties
    const typeGroups: Record<string, string[]> = {
      'apt': ['apartment', 'officetel'],
      'villa': ['villa', 'house'],
      'commercial': ['commercial'],
      'land': ['land'],
    }
    const types = typeGroups[propertyTypeTab]
    if (!types) return filteredProperties
    return filteredProperties.filter((p) => types.includes(p.type))
  }, [filteredProperties, propertyTypeTab])

  // 타입별 카운트 (filteredProperties 기준)
  const typeCounts = useMemo(() => ({
    all: filteredProperties.length,
    apt: filteredProperties.filter((p) => p.type === 'apartment' || p.type === 'officetel').length,
    villa: filteredProperties.filter((p) => p.type === 'villa' || p.type === 'house').length,
    commercial: filteredProperties.filter((p) => p.type === 'commercial').length,
    land: filteredProperties.filter((p) => p.type === 'land').length,
  }), [filteredProperties])

  return (
    <div className="flex flex-col h-full -m-6 p-6 gap-4 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">매물 관리</h1>
          <p className="text-muted-foreground text-sm">
            매물 정보를 실시간으로 관리하세요
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === 'naver' && (
            <Button
              variant="outline"
              onClick={() => syncNaverAdsMutation.mutate()}
              disabled={syncNaverAdsMutation.isPending}
            >
              <RefreshCw className={`size-4 mr-2 ${syncNaverAdsMutation.isPending ? 'animate-spin' : ''}`} />
              {syncNaverAdsMutation.isPending ? '동기화 중...' : '광고 동기화'}
            </Button>
          )}
          {activeTab === 'properties' && (
            <Button>
              <Plus className="size-4 mr-2" />
              매물 등록
            </Button>
          )}
        </div>
      </div>

      {/* Tabs - shadcn Tabs 컴포넌트 사용 */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0 gap-4">
        {isPremium && (
          <TabsList className="bg-muted/50 p-1">
            <TabsTrigger value="properties" className="gap-2 data-[state=active]:bg-background">
              <Home className="size-4" />
              매물 목록
            </TabsTrigger>
            <TabsTrigger value="naver" className="gap-2 data-[state=active]:bg-background">
              <Crown className="size-4 text-amber-500" />
              네이버 광고 매칭
              {matchSuggestions.length > 0 && (
                <Badge variant="destructive" className="px-1.5 py-0 text-xs rounded-full">
                  {matchSuggestions.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="adAnalysis" className="gap-2 data-[state=active]:bg-background">
              <TrendingUp className="size-4 text-green-500" />
              광고 분석
            </TabsTrigger>
          </TabsList>
        )}

        {/* Properties Tab Content */}
        <TabsContent value="properties" className="flex-1 flex flex-col min-h-0 gap-4 mt-0 overflow-hidden">
          {/* Filters */}
          <PropertyFilters
            filters={filters}
            setFilters={setFilters}
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            showHidden={showHidden}
            setShowHidden={setShowHidden}
            activeFilterCount={activeFilterCount}
            resetFilters={resetFilters}
            hiddenCount={hiddenCount}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />

          {/* 매물 타입 탭 */}
          <div className="flex gap-1 border-b">
            {[
              { key: 'all', label: '전체', icon: Home },
              { key: 'apt', label: '아파트/오피스텔', icon: Building2 },
              { key: 'villa', label: '빌라/주택', icon: House },
              { key: 'commercial', label: '상가', icon: Store },
              { key: 'land', label: '토지', icon: MapPin },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setPropertyTypeTab(key)}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  propertyTypeTab === key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
                }`}
              >
                <Icon className="size-3.5" />
                {label}
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                  propertyTypeTab === key
                    ? 'bg-primary/10 text-primary'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {typeCounts[key as keyof typeof typeCounts]}
                </span>
              </button>
            ))}
          </div>

          {/* Property View (List or Map) */}
          {isLoading ? (
            <TableSkeleton columns={10} rows={8} />
          ) : typeFilteredProperties.length === 0 ? (
            <Card className="p-12">
              <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                  <Home className="size-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-1">
                  {filters.searchQuery || activeFilterCount > 0
                    ? '검색 결과가 없습니다'
                    : '등록된 매물이 없습니다'}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {filters.searchQuery || activeFilterCount > 0
                    ? '다른 검색어나 필터를 시도해보세요'
                    : '첫 번째 매물을 등록해보세요'}
                </p>
              </div>
            </Card>
          ) : viewMode === 'map' ? (
            /* 지도 뷰 */
            <Card className="overflow-hidden">
              <KakaoMap
                properties={typeFilteredProperties}
                locations={propertyLocations.filter(loc =>
                  typeFilteredProperties.some(p => p.id === loc.propertyId)
                )}
                onPropertyClick={(propertyId) => {
                  const property = properties.find(p => p.id === propertyId)
                  if (property) handleSelectProperty(property)
                }}
                selectedPropertyId={selectedProperty?.id}
                className="h-[600px]"
              />
            </Card>
          ) : (
            /* 목록 뷰 */
            <PropertiesTable
              properties={typeFilteredProperties}
              isPremium={isPremium}
              expandedPropertyId={expandedPropertyId}
              setExpandedPropertyId={setExpandedPropertyId}
              onSelectProperty={handleSelectProperty}
              onToggleHide={handleToggleHide}
              onUnlinkAd={handleUnlinkAd}
              onVerifyInfo={handleVerifyInfo}
              getUserName={getUserName}
              getMatchesForProperty={getMatchesForProperty}
              getAdsForProperty={getAdsForProperty}
              buyerRequirements={buyerRequirements}
              contacts={contacts}
            />
          )}
        </TabsContent>

        {/* Naver Ads Tab Content */}
        <TabsContent value="naver" className="mt-0">
          {isPremium && (
            <NaverAdTab
              naverAds={naverAds}
              matchSuggestions={matchSuggestions}
              properties={properties}
              selectedNaverAd={selectedNaverAd}
              setSelectedNaverAd={setSelectedNaverAd}
              getPropertyName={getPropertyName}
              getSuggestionsForAd={getSuggestionsForAd}
              onLinkAd={handleLinkAd}
              onUnlinkAd={handleUnlinkAd}
              onAcceptSuggestion={handleAcceptSuggestion}
              onDismissSuggestion={handleDismissSuggestion}
              isLinking={linkAdMutation.isPending}
              isUnlinking={unlinkAdMutation.isPending}
              isAccepting={acceptSuggestionMutation.isPending}
              isDismissing={dismissSuggestionMutation.isPending}
            />
          )}
        </TabsContent>

        {/* Ad Analysis Tab Content */}
        <TabsContent value="adAnalysis" className="mt-0">
          {isPremium && <AdAnalysisTab naverAds={naverAds} />}
        </TabsContent>
      </Tabs>

      {/* Property Detail Modal */}
      <PropertyDetailModal
        property={selectedProperty}
        isOpen={!!selectedProperty}
        onClose={() => setSelectedProperty(null)}
        users={users}
        isPremium={isPremium}
        naverAds={naverAds}
        matches={matches}
        buyerRequirements={buyerRequirements}
        contacts={contacts}
        consultations={consultations}
        realTransactions={realTransactions}
        marketPrices={marketPrices}
        onSave={handleSaveProperty}
        onVerifyInfo={handleVerifyInfo}
        onSaveOwner={handleSaveOwner}
        onCreateConsultation={handleCreateConsultation}
        isSaving={updatePropertyMutation.isPending || createConsultationMutation.isPending}
      />
    </div>
  )
}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: '/properties',
    component: PropertiesPage,
    getParentRoute: () => parentRoute,
  })
