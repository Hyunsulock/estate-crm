import { createRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { dealsApi, matchesApi, propertiesApi, buyerRequirementsApi, contactsApi, usersApi, dealChecklistApi } from '@/api'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Plus, Search, DollarSign, Building2, User, FileText, Calendar, CheckCircle2, Archive, Users, ChevronDown, ChevronUp, CreditCard, ListChecks, Check, Circle } from 'lucide-react'
import type { RootRoute } from '@tanstack/react-router'
import type { DealStage, Deal, ChecklistItem, TransactionType } from '@/types'
import { generateDefaultChecklist } from '@/data/mock-data'

// 체크리스트 섹션 컴포넌트
function ChecklistSection({
  deal,
  onToggle,
  isLoading,
}: {
  deal: Deal
  onToggle: (itemId: string) => void
  isLoading: boolean
}) {
  // 체크리스트가 없으면 기본값 사용
  const checklist: ChecklistItem[] = deal.checklist && deal.checklist.length > 0
    ? deal.checklist
    : generateDefaultChecklist()

  const completedCount = checklist.filter((item) => item.checked).length
  const totalCount = checklist.length
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-xs font-medium">
          <ListChecks className="size-3" />
          체크리스트
        </div>
        <div className="flex items-center gap-2">
          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground">
            {completedCount}/{totalCount}
          </span>
        </div>
      </div>

      <div className="space-y-1 max-h-[200px] overflow-y-auto">
        {checklist.map((item) => (
          <button
            key={item.id}
            onClick={() => onToggle(item.id)}
            disabled={isLoading}
            className="w-full flex items-center gap-2 p-1.5 rounded hover:bg-muted/50 transition-colors text-left group"
          >
            {item.checked ? (
              <div className="size-4 rounded border border-primary bg-primary flex items-center justify-center">
                <Check className="size-3 text-primary-foreground" />
              </div>
            ) : (
              <div className="size-4 rounded border border-muted-foreground/30 group-hover:border-primary/50">
                <Circle className="size-3 text-transparent" />
              </div>
            )}
            <span
              className={`text-xs flex-1 ${
                item.checked ? 'text-muted-foreground line-through' : ''
              }`}
            >
              {item.label}
            </span>
            {item.checkedAt && (
              <span className="text-[10px] text-muted-foreground">
                {new Date(item.checkedAt).toLocaleDateString('ko-KR', {
                  month: 'short',
                  day: 'numeric',
                })}
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}

function DealsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedDealId, setExpandedDealId] = useState<string | null>(null)
  const [showClosedDeals, setShowClosedDeals] = useState(false)
  const [transactionTypeFilter, setTransactionTypeFilter] = useState<TransactionType | 'all'>('all')
  const queryClient = useQueryClient()

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: dealsApi.getAll,
  })

  const { data: matches = [] } = useQuery({
    queryKey: ['matches'],
    queryFn: matchesApi.getAll,
  })

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: propertiesApi.getAll,
  })

  const { data: buyerRequirements = [] } = useQuery({
    queryKey: ['buyerRequirements'],
    queryFn: buyerRequirementsApi.getAll,
  })

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: contactsApi.getAll,
  })

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
  })

  // 거래 종료 mutation
  const closeDealMutation = useMutation({
    mutationFn: async (dealId: string) => {
      // In real app, this would call API to close the deal
      const deal = deals.find(d => d.id === dealId)
      if (!deal) throw new Error('Deal not found')
      return dealsApi.update(dealId, {
        ...deal,
        stage: 'closed' as DealStage,
        closedAt: new Date(),
        closedBy: 'user-1', // Current user
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] })
    },
  })

  // 체크리스트 토글 mutation
  const toggleChecklistMutation = useMutation({
    mutationFn: async ({ dealId, itemId }: { dealId: string; itemId: string }) => {
      return dealChecklistApi.toggleItem(dealId, itemId, 'user-1')
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deals'] })
    },
  })

  // 거래 단계 한글 매핑 및 색상 (매칭에서 전환 후 단계만)
  const stageConfig: Record<
    DealStage,
    { label: string; color: string; bgColor: string }
  > = {
    selection: {
      label: '최종 선택',
      color: 'text-blue-700 dark:text-blue-300',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    deposit: {
      label: '가계약금',
      color: 'text-yellow-700 dark:text-yellow-300',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    },
    contract: {
      label: '본계약',
      color: 'text-purple-700 dark:text-purple-300',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    },
    completed: {
      label: '완료',
      color: 'text-green-700 dark:text-green-300',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
    closed: {
      label: '종료',
      color: 'text-gray-700 dark:text-gray-300',
      bgColor: 'bg-gray-100 dark:bg-gray-900/30',
    },
    cancelled: {
      label: '취소',
      color: 'text-red-700 dark:text-red-300',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
    },
  }

  // Match에서 매물/구매자 정보 가져오기
  const getDealInfo = (matchId: string) => {
    const match = matches.find((m) => m.id === matchId)
    if (!match) return null

    const property = properties.find((p) => p.id === match.propertyId)
    const buyerReq = buyerRequirements.find((r) => r.id === match.buyerReqId)
    const buyerContact = buyerReq ? contacts.find((c) => c.id === buyerReq.contactId) : null

    return { match, property, buyerReq, buyerContact }
  }

  // 검색 필터링 (closed 거래는 메인 뷰에서 제외)
  const filteredDeals = deals.filter((deal) => {
    // closed 거래는 별도 섹션에서 표시
    if (deal.stage === 'closed') return false

    const info = getDealInfo(deal.matchId)

    // 거래 타입 필터
    if (transactionTypeFilter !== 'all') {
      if (info?.property?.transactionType !== transactionTypeFilter) return false
    }

    const query = searchQuery.toLowerCase()
    if (!query) return true

    return (
      info?.property?.ownerName.toLowerCase().includes(query) ||
      info?.buyerContact?.name.toLowerCase().includes(query) ||
      deal.notes?.toLowerCase().includes(query)
    )
  })

  // 종료된 거래 (closed) - 거래 타입 필터 적용
  const closedDeals = deals.filter((deal) => {
    if (deal.stage !== 'closed') return false

    // 거래 타입 필터
    if (transactionTypeFilter !== 'all') {
      const info = getDealInfo(deal.matchId)
      if (info?.property?.transactionType !== transactionTypeFilter) return false
    }

    return true
  })

  // 단계별 거래 그룹화
  const dealsByStage = (stage: DealStage) => {
    return filteredDeals.filter((deal) => deal.stage === stage)
  }

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    return user?.name || '미지정'
  }

  // 가격 포맷팅
  const formatPrice = (price: number | undefined) => {
    if (!price) return '-'
    const billion = Math.floor(price / 100000000)
    const million = Math.floor((price % 100000000) / 10000)

    if (billion > 0 && million > 0) {
      return `${billion}억 ${million}만원`
    } else if (billion > 0) {
      return `${billion}억원`
    } else {
      return `${million}만원`
    }
  }

  // 날짜 포맷팅
  const formatDate = (date: Date | undefined) => {
    if (!date) return '-'
    return new Date(date).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  // 통계 계산
  const completedDeals = deals.filter((d) => d.stage === 'completed')
  const totalRevenue = deals
    .filter((d) => d.stage === 'completed' || d.stage === 'closed')
    .reduce((sum, deal) => sum + (deal.commission || 0), 0)
  const activeDeals = deals.filter(
    (d) => d.stage !== 'completed' && d.stage !== 'cancelled' && d.stage !== 'closed',
  )

  // 정산 완료 금액 계산
  const totalSettled = closedDeals.reduce((sum, deal) => {
    const settled = deal.commissionSettlements?.reduce((s, settlement) => s + settlement.amount, 0) || 0
    return sum + settled
  }, 0)

  // 파이프라인 단계들 (매칭에서 전환된 후 단계만)
  const pipelineStages: DealStage[] = [
    'selection',
    'deposit',
    'contract',
    'completed',
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="size-7" />
            거래 관리
          </h1>
          <p className="text-muted-foreground mt-1">
            매칭에서 전환된 거래를 관리합니다 (선택 → 가계약 → 본계약 → 완료)
          </p>
        </div>
        <Button disabled>
          <Plus className="size-4 mr-2" />
          거래 추가
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">전체 거래</div>
          <div className="text-2xl font-bold mt-1">{deals.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">진행 중</div>
          <div className="text-2xl font-bold mt-1">{activeDeals.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">완료된 거래</div>
          <div className="text-2xl font-bold mt-1">{completedDeals.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">총 수수료</div>
          <div className="text-2xl font-bold mt-1 flex items-center gap-1">
            <DollarSign className="size-5" />
            {(totalRevenue / 10000).toFixed(0)}만
          </div>
        </Card>
      </div>

      {/* Search Bar & Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="매물명, 구매자명으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          {/* 거래 타입 필터 */}
          <div className="flex gap-1">
            {([
              { value: 'all', label: '전체' },
              { value: 'sale', label: '매매' },
              { value: 'lease', label: '전세' },
              { value: 'monthly', label: '월세' },
            ] as const).map((option) => (
              <Button
                key={option.value}
                variant={transactionTypeFilter === option.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setTransactionTypeFilter(option.value)}
                className="px-3"
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Pipeline View */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-4">
          {pipelineStages.map((stage) => {
            const stageDeals = dealsByStage(stage)
            const config = stageConfig[stage]

            return (
              <div key={stage} className="space-y-3">
                {/* Stage Header */}
                <div className={`${config.bgColor} rounded-lg p-3`}>
                  <div className="flex items-center justify-between">
                    <h3 className={`font-semibold ${config.color}`}>{config.label}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {stageDeals.length}
                    </Badge>
                  </div>
                </div>

                {/* Deals in Stage */}
                <div className="space-y-3 min-h-[200px]">
                  {stageDeals.length === 0 ? (
                    <Card className="p-4">
                      <p className="text-xs text-muted-foreground text-center">
                        거래 없음
                      </p>
                    </Card>
                  ) : (
                    stageDeals.map((deal) => {
                      const info = getDealInfo(deal.matchId)
                      const isExpanded = expandedDealId === deal.id

                      return (
                        <Card
                          key={deal.id}
                          className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                          onClick={() => setExpandedDealId(isExpanded ? null : deal.id)}
                        >
                          <div className="space-y-3">
                            {/* 매물 정보 */}
                            <div className="flex items-start gap-2">
                              <Building2 className="size-4 text-muted-foreground mt-0.5" />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                  <h4 className="font-medium text-sm line-clamp-1">
                                    {info?.property
                                      ? `${info.property.ownerName} (${info.property.unitType || info.property.type})`
                                      : '매물 정보 없음'}
                                  </h4>
                                  {info?.property?.transactionType && (
                                    <Badge
                                      variant="outline"
                                      className={`text-[10px] px-1.5 py-0 ${
                                        info.property.transactionType === 'sale'
                                          ? 'border-blue-500 text-blue-600'
                                          : info.property.transactionType === 'lease'
                                            ? 'border-purple-500 text-purple-600'
                                            : 'border-orange-500 text-orange-600'
                                      }`}
                                    >
                                      {info.property.transactionType === 'sale'
                                        ? '매매'
                                        : info.property.transactionType === 'lease'
                                          ? '전세'
                                          : '월세'}
                                    </Badge>
                                  )}
                                </div>
                              </div>
                              {isExpanded ? (
                                <ChevronUp className="size-4 text-muted-foreground" />
                              ) : (
                                <ChevronDown className="size-4 text-muted-foreground" />
                              )}
                            </div>

                            {/* 구매자 정보 */}
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <User className="size-3" />
                              <span>{info?.buyerContact?.name || '구매자 정보 없음'}</span>
                            </div>

                            {/* 합의 금액 */}
                            {deal.agreedPrice && (
                              <div className="flex items-center gap-1 text-primary font-semibold">
                                <DollarSign className="size-3.5" />
                                <span className="text-sm">{formatPrice(deal.agreedPrice)}</span>
                              </div>
                            )}

                            {/* 가계약금 (deposit 이상 단계) */}
                            {deal.depositAmount && (
                              <div className="text-xs text-muted-foreground">
                                가계약금: {formatPrice(deal.depositAmount)}
                              </div>
                            )}

                            {/* 본계약 예정일 */}
                            {deal.contractDate && (
                              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                <Calendar className="size-3" />
                                <span>본계약: {formatDate(deal.contractDate)}</span>
                              </div>
                            )}

                            {/* Joint Brokerage Badge */}
                            {deal.isJointBrokerage && (
                              <Badge variant="outline" className="text-xs">
                                공동중개
                              </Badge>
                            )}

                            {/* Assigned Users */}
                            <div className="flex items-center gap-2 pt-2 border-t">
                              <div className="flex -space-x-2">
                                {deal.assignedTo.slice(0, 3).map((userId) => (
                                  <Avatar key={userId} className="size-6 border-2 border-background">
                                    <AvatarFallback className="text-xs">
                                      {getUserName(userId)[0]}
                                    </AvatarFallback>
                                  </Avatar>
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground flex-1 truncate">
                                {deal.assignedTo.map((id) => getUserName(id)).join(', ')}
                              </span>
                            </div>

                            {/* Commission (if available) */}
                            {deal.commission && (
                              <div className="text-xs text-muted-foreground pt-2 border-t">
                                수수료: {formatPrice(deal.commission)}
                              </div>
                            )}

                            {/* Expanded Details */}
                            {isExpanded && (
                              <div className="pt-3 border-t space-y-3" onClick={(e) => e.stopPropagation()}>
                                {/* 체크리스트 */}
                                <ChecklistSection
                                  deal={deal}
                                  onToggle={(itemId) => toggleChecklistMutation.mutate({ dealId: deal.id, itemId })}
                                  isLoading={toggleChecklistMutation.isPending}
                                />

                                {/* 수수료 상세 */}
                                {deal.commission && (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-xs font-medium">
                                      <CreditCard className="size-3" />
                                      수수료 상세
                                    </div>
                                    <div className="text-xs text-muted-foreground pl-4 space-y-0.5">
                                      <div>매수인측: {formatPrice(deal.commissionFromBuyer)}</div>
                                      <div>매도인측: {formatPrice(deal.commissionFromSeller)}</div>
                                      {deal.isJointBrokerage && deal.partnerCommission && (
                                        <div>상대 중개사: {formatPrice(deal.partnerCommission)}</div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* 기여자 목록 */}
                                {deal.contributions && deal.contributions.length > 0 && (
                                  <div className="space-y-1">
                                    <div className="flex items-center gap-1 text-xs font-medium">
                                      <Users className="size-3" />
                                      기여자
                                    </div>
                                    <div className="space-y-1 pl-4">
                                      {deal.contributions.slice(0, 5).map((contribution, idx) => (
                                        <div key={idx} className="text-xs text-muted-foreground">
                                          <span className="font-medium">{contribution.userName}</span>
                                          <span className="mx-1">-</span>
                                          <span>{contribution.action}</span>
                                        </div>
                                      ))}
                                      {deal.contributions.length > 5 && (
                                        <div className="text-xs text-muted-foreground">
                                          외 {deal.contributions.length - 5}명
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                )}

                                {/* 완료 단계에서 거래 종료 버튼 */}
                                {stage === 'completed' && (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="w-full mt-2"
                                    onClick={() => closeDealMutation.mutate(deal.id)}
                                    disabled={closeDealMutation.isPending}
                                  >
                                    <Archive className="size-3 mr-1" />
                                    거래 종료
                                  </Button>
                                )}
                              </div>
                            )}
                          </div>
                        </Card>
                      )
                    })
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Closed Deals Section (종료된 거래) */}
      {closedDeals.length > 0 && (
        <div className="border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Archive className="size-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">종료된 거래</h3>
              <Badge variant="secondary">{closedDeals.length}</Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowClosedDeals(!showClosedDeals)}
            >
              {showClosedDeals ? '접기' : '펼치기'}
              {showClosedDeals ? (
                <ChevronUp className="size-4 ml-1" />
              ) : (
                <ChevronDown className="size-4 ml-1" />
              )}
            </Button>
          </div>

          {/* 종료 거래 요약 통계 */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <Card className="p-3">
              <div className="text-xs text-muted-foreground">총 종료 거래</div>
              <div className="text-xl font-bold">{closedDeals.length}건</div>
            </Card>
            <Card className="p-3">
              <div className="text-xs text-muted-foreground">총 수수료</div>
              <div className="text-xl font-bold text-primary">
                {formatPrice(closedDeals.reduce((sum, d) => sum + (d.commission || 0), 0))}
              </div>
            </Card>
            <Card className="p-3">
              <div className="text-xs text-muted-foreground">정산 완료</div>
              <div className="text-xl font-bold text-green-600">
                {formatPrice(totalSettled)}
              </div>
            </Card>
          </div>

          {showClosedDeals && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {closedDeals.map((deal) => {
                const info = getDealInfo(deal.matchId)
                const config = stageConfig.closed
                const settledAmount = deal.commissionSettlements?.reduce((sum, s) => sum + s.amount, 0) || 0
                const isFullySettled = settledAmount >= (deal.commission || 0)

                return (
                  <Card key={deal.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm line-clamp-1">
                            {info?.property
                              ? `${info.property.ownerName} (${info.property.unitType || info.property.type})`
                              : '매물 정보 없음'}
                          </h4>
                          {info?.property?.transactionType && (
                            <Badge
                              variant="outline"
                              className={`text-[10px] px-1.5 py-0 ${
                                info.property.transactionType === 'sale'
                                  ? 'border-blue-500 text-blue-600'
                                  : info.property.transactionType === 'lease'
                                    ? 'border-purple-500 text-purple-600'
                                    : 'border-orange-500 text-orange-600'
                              }`}
                            >
                              {info.property.transactionType === 'sale'
                                ? '매매'
                                : info.property.transactionType === 'lease'
                                  ? '전세'
                                  : '월세'}
                            </Badge>
                          )}
                        </div>
                        <Badge className={`${config.bgColor} ${config.color} border-0 text-xs`}>
                          {config.label}
                        </Badge>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        {info?.buyerContact?.name || '-'}
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium">
                          {formatPrice(deal.agreedPrice)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          종료: {formatDate(deal.closedAt)}
                        </div>
                      </div>

                      {/* 수수료 정산 상태 */}
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">수수료 정산</span>
                          {isFullySettled ? (
                            <Badge variant="default" className="bg-green-600 text-xs">
                              <CheckCircle2 className="size-3 mr-1" />
                              완료
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-xs">
                              {formatPrice(settledAmount)} / {formatPrice(deal.commission)}
                            </Badge>
                          )}
                        </div>

                        {/* 정산 내역 */}
                        {deal.commissionSettlements && deal.commissionSettlements.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {deal.commissionSettlements.map((settlement) => (
                              <div key={settlement.id} className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>
                                  {settlement.paidBy === 'buyer' ? '매수인' : '매도인'}
                                  {settlement.method && ` (${settlement.method})`}
                                </span>
                                <span>{formatPrice(settlement.amount)}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 기여자 수 */}
                      {deal.contributions && deal.contributions.length > 0 && (
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Users className="size-3" />
                          기여자 {deal.contributions.length}명
                        </div>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* Cancelled Deals Section */}
      {dealsByStage('cancelled').length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-3">취소된 거래</h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {dealsByStage('cancelled').map((deal) => {
              const info = getDealInfo(deal.matchId)
              const config = stageConfig.cancelled

              return (
                <Card key={deal.id} className="p-4 opacity-60">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm line-clamp-1">
                          {info?.property
                            ? `${info.property.ownerName} (${info.property.unitType || info.property.type})`
                            : '매물 정보 없음'}
                        </h4>
                        {info?.property?.transactionType && (
                          <Badge
                            variant="outline"
                            className={`text-[10px] px-1.5 py-0 ${
                              info.property.transactionType === 'sale'
                                ? 'border-blue-500 text-blue-600'
                                : info.property.transactionType === 'lease'
                                  ? 'border-purple-500 text-purple-600'
                                  : 'border-orange-500 text-orange-600'
                            }`}
                          >
                            {info.property.transactionType === 'sale'
                              ? '매매'
                              : info.property.transactionType === 'lease'
                                ? '전세'
                                : '월세'}
                          </Badge>
                        )}
                      </div>
                      <Badge className={`${config.bgColor} ${config.color} border-0 text-xs`}>
                        {config.label}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {info?.buyerContact?.name || '-'}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {formatPrice(deal.agreedPrice)}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: '/deals',
    component: DealsPage,
    getParentRoute: () => parentRoute,
  })
