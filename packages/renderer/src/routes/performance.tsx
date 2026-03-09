import { createRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { dealsApi, usersApi, matchesApi, propertiesApi, contactsApi, buyerRequirementsApi } from '@/api'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  Award,
  Calendar,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  GitCompare,
  Building2,
  UserPlus,
  Clock,
} from 'lucide-react'
import type { RootRoute } from '@tanstack/react-router'

type PeriodFilter = 'all' | 'month' | 'quarter' | 'year'

function PerformancePage() {
  const [periodFilter, setPeriodFilter] = useState<PeriodFilter>('all')
  const [compareMode, setCompareMode] = useState(false)
  const [selectedUsers, setSelectedUsers] = useState<string[]>([])
  const [showCompareModal, setShowCompareModal] = useState(false)

  const { data: deals = [], isLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: dealsApi.getAll,
  })

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
  })

  const { data: matches = [] } = useQuery({
    queryKey: ['matches'],
    queryFn: matchesApi.getAll,
  })

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: propertiesApi.getAll,
  })

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: contactsApi.getAll,
  })

  const { data: buyerRequirements = [] } = useQuery({
    queryKey: ['buyerRequirements'],
    queryFn: buyerRequirementsApi.getAll,
  })

  // 기간 필터 적용
  const filterByPeriod = (date: Date | undefined) => {
    if (!date || periodFilter === 'all') return true
    const now = new Date()
    const targetDate = new Date(date)

    switch (periodFilter) {
      case 'month':
        return (
          targetDate.getMonth() === now.getMonth() &&
          targetDate.getFullYear() === now.getFullYear()
        )
      case 'quarter': {
        const currentQuarter = Math.floor(now.getMonth() / 3)
        const targetQuarter = Math.floor(targetDate.getMonth() / 3)
        return (
          currentQuarter === targetQuarter &&
          targetDate.getFullYear() === now.getFullYear()
        )
      }
      case 'year':
        return targetDate.getFullYear() === now.getFullYear()
      default:
        return true
    }
  }

  // 완료/종료된 거래 (성과 집계 대상)
  const performanceDeals = deals.filter(
    (d) =>
      (d.stage === 'completed' || d.stage === 'closed') &&
      filterByPeriod(d.completedAt)
  )

  // 직원별 성과 계산
  const userPerformance = users.map((user) => {
    // 담당 거래 수
    const assignedDeals = performanceDeals.filter((d) =>
      d.assignedTo.includes(user.id)
    )

    // 진행 중인 거래
    const activeDeals = deals.filter(
      (d) =>
        d.assignedTo.includes(user.id) &&
        !['completed', 'closed', 'cancelled'].includes(d.stage)
    )

    // 기여한 거래 수 (contributions에 포함된 거래)
    const contributedDeals = performanceDeals.filter((d) =>
      d.contributions?.some((c) => c.userId === user.id)
    )

    // 총 수수료 (담당자로 지정된 경우)
    const totalCommission = assignedDeals.reduce(
      (sum, d) => sum + (d.commission || 0),
      0
    )

    // 평균 거래 규모
    const avgDealSize = assignedDeals.length > 0
      ? assignedDeals.reduce((sum, d) => sum + (d.agreedPrice || 0), 0) / assignedDeals.length
      : 0

    // 평균 거래 완료 소요일
    const completedDealsWithDuration = assignedDeals.filter(
      (d) => d.completedAt && d.createdAt
    )
    const avgTimeToClose = completedDealsWithDuration.length > 0
      ? Math.round(
          completedDealsWithDuration.reduce((sum, d) => {
            const days =
              (new Date(d.completedAt!).getTime() - new Date(d.createdAt).getTime()) /
              (1000 * 60 * 60 * 24)
            return sum + days
          }, 0) / completedDealsWithDuration.length
        )
      : 0

    // 기여도별 점수 계산
    const contributionScore = contributedDeals.reduce((score, deal) => {
      const contributions = deal.contributions?.filter(
        (c) => c.userId === user.id
      ) || []
      return score + contributions.length * 10 // 각 기여당 10점
    }, 0)

    // 매칭 성과
    const matchesCreated = matches.filter(
      (m) => m.assignedTo === user.id && filterByPeriod(m.createdAt)
    ).length

    // 거래 전환된 매칭 수
    const dealsConverted = matches.filter(
      (m) =>
        m.assignedTo === user.id &&
        m.stage === 'dealCreated' &&
        filterByPeriod(m.updatedAt)
    ).length

    // 신규 매물 등록 수
    const newProperties = properties.filter(
      (p) => p.assignedTo === user.id && filterByPeriod(p.createdAt)
    ).length

    // 신규 구매고객 등록 수
    const newBuyers = buyerRequirements.filter(
      (b) => b.assignedTo === user.id && filterByPeriod(b.createdAt)
    ).length

    return {
      user,
      assignedDeals: assignedDeals.length,
      activeDeals: activeDeals.length,
      contributedDeals: contributedDeals.length,
      totalCommission,
      avgDealSize,
      avgTimeToClose,
      contributionScore,
      matchesCreated,
      dealsConverted,
      conversionRate:
        matchesCreated > 0
          ? Math.round((dealsConverted / matchesCreated) * 100)
          : 0,
      newProperties,
      newBuyers,
    }
  })

  // 성과순 정렬 (수수료 기준)
  const rankedPerformance = [...userPerformance].sort(
    (a, b) => b.totalCommission - a.totalCommission
  )

  // 전체 통계
  const totalStats = {
    totalDeals: performanceDeals.length,
    totalCommission: performanceDeals.reduce(
      (sum, d) => sum + (d.commission || 0),
      0
    ),
    settledCommission: performanceDeals.reduce((sum, d) => {
      const settled =
        d.commissionSettlements?.reduce((s, settlement) => s + settlement.amount, 0) ||
        0
      return sum + settled
    }, 0),
    avgDealValue:
      performanceDeals.length > 0
        ? performanceDeals.reduce((sum, d) => sum + (d.agreedPrice || 0), 0) /
          performanceDeals.length
        : 0,
  }

  // 기여도 분석 (어떤 단계에서 기여가 많았는지)
  const stageContributions: Record<string, number> = {}
  performanceDeals.forEach((deal) => {
    deal.contributions?.forEach((contribution) => {
      const stage = String(contribution.stage)
      stageContributions[stage] = (stageContributions[stage] || 0) + 1
    })
  })

  const stageLabels: Record<string, string> = {
    suggested: '매물 추천',
    buyerContacted: '구매자 상담',
    viewing: '방문 안내',
    ownerContacted: '판매자 연락',
    negotiating: '가격 협상',
    selection: '최종 합의',
    deposit: '가계약',
    contract: '본계약',
    completed: '거래 완료',
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

  // Match에서 매물/구매자 정보 가져오기
  const getDealInfo = (matchId: string) => {
    const match = matches.find((m) => m.id === matchId)
    if (!match) return null

    const property = properties.find((p) => p.id === match.propertyId)
    const buyerReq = buyerRequirements.find((r) => r.id === match.buyerReqId)
    const buyerContact = buyerReq
      ? contacts.find((c) => c.id === buyerReq.contactId)
      : null

    return { match, property, buyerReq, buyerContact }
  }

  const periodLabels: Record<PeriodFilter, string> = {
    all: '전체',
    month: '이번 달',
    quarter: '이번 분기',
    year: '올해',
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="size-7" />
            거래 실적 대시보드
          </h1>
          <p className="text-muted-foreground mt-1">
            직원별 거래 실적과 기여도를 확인합니다
          </p>
        </div>

        {/* Period Filter & Compare */}
        <div className="flex gap-4">
          <div className="flex gap-2">
            {(Object.keys(periodLabels) as PeriodFilter[]).map((period) => (
              <Button
                key={period}
                variant={periodFilter === period ? 'default' : 'outline'}
                size="sm"
                onClick={() => setPeriodFilter(period)}
              >
                {periodLabels[period]}
              </Button>
            ))}
          </div>
          <Button
            variant={compareMode ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              if (compareMode && selectedUsers.length >= 2) {
                setShowCompareModal(true)
              } else {
                setCompareMode(!compareMode)
                setSelectedUsers([])
              }
            }}
          >
            <GitCompare className="size-4 mr-2" />
            {compareMode
              ? selectedUsers.length >= 2
                ? '비교하기'
                : `${selectedUsers.length}/2+ 선택`
              : '직원 비교'}
          </Button>
        </div>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <CheckCircle2 className="size-4" />
            완료된 거래
          </div>
          <div className="text-3xl font-bold">{totalStats.totalDeals}건</div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <DollarSign className="size-4" />
            총 수수료
          </div>
          <div className="text-3xl font-bold text-primary">
            {formatPrice(totalStats.totalCommission)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <TrendingUp className="size-4" />
            정산 완료
          </div>
          <div className="text-3xl font-bold text-green-600">
            {formatPrice(totalStats.settledCommission)}
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
            <BarChart3 className="size-4" />
            평균 거래가
          </div>
          <div className="text-3xl font-bold">
            {formatPrice(totalStats.avgDealValue)}
          </div>
        </Card>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Staff Rankings */}
          <Card className="p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Award className="size-5" />
                직원별 실적 순위
              </h2>
            </div>

            <div className="space-y-4">
              {rankedPerformance.map((perf, index) => {
                const isSelected = selectedUsers.includes(perf.user.id)

                return (
                  <div
                    key={perf.user.id}
                    className={`p-4 rounded-lg border transition-all ${
                      compareMode && isSelected
                        ? 'ring-2 ring-primary border-primary'
                        : index === 0
                          ? 'bg-yellow-50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800'
                          : index === 1
                            ? 'bg-gray-50 dark:bg-gray-900/10 border-gray-200 dark:border-gray-800'
                            : index === 2
                              ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800'
                              : 'bg-background'
                    } ${compareMode ? 'cursor-pointer hover:border-primary' : ''}`}
                    onClick={() => {
                      if (compareMode) {
                        setSelectedUsers((prev) =>
                          prev.includes(perf.user.id)
                            ? prev.filter((id) => id !== perf.user.id)
                            : [...prev, perf.user.id]
                        )
                      }
                    }}
                  >
                    <div className="flex items-center gap-4">
                      {/* Rank or Checkbox */}
                      {compareMode ? (
                        <div
                          className={`size-6 rounded border-2 flex items-center justify-center ${
                            isSelected
                              ? 'bg-primary border-primary text-primary-foreground'
                              : 'border-muted-foreground/30'
                          }`}
                        >
                          {isSelected && <CheckCircle2 className="size-4" />}
                        </div>
                      ) : (
                        <div
                          className={`text-2xl font-bold w-8 text-center ${
                            index === 0
                              ? 'text-yellow-600'
                              : index === 1
                                ? 'text-gray-500'
                                : index === 2
                                  ? 'text-orange-600'
                                  : 'text-muted-foreground'
                          }`}
                        >
                          {index + 1}
                        </div>
                      )}

                      {/* User Info */}
                      <div className="flex items-center gap-3 flex-1">
                        <Avatar className="size-10">
                          <AvatarFallback>{perf.user.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium">{perf.user.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {perf.user.role === 'manager' ? '관리자' : '직원'}
                          </div>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-5 gap-3 text-center">
                        <div>
                          <div className="text-xs text-muted-foreground">
                            담당 거래
                          </div>
                          <div className="font-bold">{perf.assignedDeals}건</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">
                            진행 중
                          </div>
                          <div className="font-bold text-blue-600">{perf.activeDeals}건</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">
                            전환율
                          </div>
                          <div className="font-bold flex items-center justify-center gap-1">
                            {perf.conversionRate}%
                            {perf.conversionRate >= 30 ? (
                              <ArrowUpRight className="size-3 text-green-600" />
                            ) : (
                              <ArrowDownRight className="size-3 text-red-600" />
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">
                            평균 거래가
                          </div>
                          <div className="font-bold text-sm">
                            {formatPrice(perf.avgDealSize)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground">
                            총 수수료
                          </div>
                          <div className="font-bold text-primary">
                            {formatPrice(perf.totalCommission)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Extended Stats Row */}
                    <div className="mt-3 pt-3 border-t grid grid-cols-5 gap-3 text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Building2 className="size-3" />
                        신규 매물: <span className="font-medium text-foreground">{perf.newProperties}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <UserPlus className="size-3" />
                        신규 고객: <span className="font-medium text-foreground">{perf.newBuyers}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="size-3" />
                        기여: <span className="font-medium text-foreground">{perf.contributedDeals}건</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="size-3" />
                        평균 소요일: <span className="font-medium text-foreground">{perf.avgTimeToClose}일</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Award className="size-3" />
                        기여 점수: <span className="font-medium text-foreground">{perf.contributionScore}점</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </Card>

          {/* Contribution by Stage */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Users className="size-5" />
              단계별 기여 현황
            </h2>

            <div className="space-y-3">
              {Object.entries(stageContributions)
                .sort(([, a], [, b]) => b - a)
                .map(([stage, count]) => {
                  const maxCount = Math.max(...Object.values(stageContributions))
                  const percentage = (count / maxCount) * 100

                  return (
                    <div key={stage}>
                      <div className="flex items-center justify-between text-sm mb-1">
                        <span>{stageLabels[stage] || stage}</span>
                        <span className="font-medium">{count}건</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div
                          className="bg-primary h-2 rounded-full transition-all"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
            </div>
          </Card>
        </div>
      )}

      {/* Recent Completed Deals */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar className="size-5" />
          최근 완료된 거래
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left p-2 font-medium">매물</th>
                <th className="text-left p-2 font-medium">구매자</th>
                <th className="text-right p-2 font-medium">거래가</th>
                <th className="text-right p-2 font-medium">수수료</th>
                <th className="text-center p-2 font-medium">정산</th>
                <th className="text-center p-2 font-medium">기여자</th>
                <th className="text-center p-2 font-medium">완료일</th>
              </tr>
            </thead>
            <tbody>
              {performanceDeals.slice(0, 10).map((deal) => {
                const info = getDealInfo(deal.matchId)
                const settledAmount =
                  deal.commissionSettlements?.reduce(
                    (sum, s) => sum + s.amount,
                    0
                  ) || 0
                const isFullySettled = settledAmount >= (deal.commission || 0)

                return (
                  <tr key={deal.id} className="border-b hover:bg-muted/50">
                    <td className="p-2">
                      <div className="font-medium">
                        {info?.property
                          ? (info.property.unitType || '매물')
                          : '-'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {''}
                      </div>
                    </td>
                    <td className="p-2">{info?.buyerContact?.name || '-'}</td>
                    <td className="p-2 text-right font-medium">
                      {formatPrice(deal.agreedPrice)}
                    </td>
                    <td className="p-2 text-right text-primary font-medium">
                      {formatPrice(deal.commission)}
                    </td>
                    <td className="p-2 text-center">
                      {isFullySettled ? (
                        <Badge
                          variant="default"
                          className="bg-green-600 text-xs"
                        >
                          완료
                        </Badge>
                      ) : settledAmount > 0 ? (
                        <Badge variant="outline" className="text-xs">
                          일부
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="text-xs text-muted-foreground"
                        >
                          대기
                        </Badge>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      <div className="flex -space-x-1 justify-center">
                        {deal.contributions
                          ?.slice(0, 3)
                          .map((contribution, idx) => (
                            <Avatar
                              key={idx}
                              className="size-6 border-2 border-background"
                            >
                              <AvatarFallback className="text-xs">
                                {contribution.userName[0]}
                              </AvatarFallback>
                            </Avatar>
                          ))}
                        {(deal.contributions?.length || 0) > 3 && (
                          <div className="size-6 rounded-full bg-muted flex items-center justify-center text-xs border-2 border-background">
                            +{(deal.contributions?.length || 0) - 3}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="p-2 text-center text-muted-foreground text-xs">
                      {deal.completedAt
                        ? new Date(deal.completedAt).toLocaleDateString('ko-KR', {
                            month: 'short',
                            day: 'numeric',
                          })
                        : '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 직원 비교 모달 */}
      <Dialog open={showCompareModal} onOpenChange={setShowCompareModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GitCompare className="size-5" />
              직원 실적 비교
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* 선택된 직원 헤더 */}
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${selectedUsers.length}, 1fr)` }}>
              {selectedUsers.map((userId) => {
                const perf = userPerformance.find((p) => p.user.id === userId)
                if (!perf) return null

                return (
                  <div key={userId} className="text-center p-4 bg-muted rounded-lg">
                    <Avatar className="size-16 mx-auto mb-2">
                      <AvatarFallback className="text-xl">{perf.user.name[0]}</AvatarFallback>
                    </Avatar>
                    <div className="font-medium">{perf.user.name}</div>
                    <Badge variant="outline" className="mt-1">
                      {perf.user.role === 'manager' ? '관리자' : '직원'}
                    </Badge>
                  </div>
                )
              })}
            </div>

            {/* 비교 지표 테이블 */}
            <div className="space-y-2">
              {[
                { label: '담당 거래', key: 'assignedDeals', suffix: '건', highlight: true },
                { label: '진행 중 거래', key: 'activeDeals', suffix: '건' },
                { label: '기여 거래', key: 'contributedDeals', suffix: '건' },
                { label: '총 수수료', key: 'totalCommission', format: 'price', highlight: true },
                { label: '평균 거래가', key: 'avgDealSize', format: 'price' },
                { label: '전환율', key: 'conversionRate', suffix: '%', highlight: true },
                { label: '평균 소요일', key: 'avgTimeToClose', suffix: '일' },
                { label: '신규 매물', key: 'newProperties', suffix: '건' },
                { label: '신규 고객', key: 'newBuyers', suffix: '건' },
                { label: '기여 점수', key: 'contributionScore', suffix: '점' },
              ].map((metric) => {
                const values = selectedUsers.map((userId) => {
                  const perf = userPerformance.find((p) => p.user.id === userId)
                  return perf ? (perf as any)[metric.key] : 0
                })
                const maxValue = Math.max(...values)
                const minValue = Math.min(...values)

                return (
                  <div
                    key={metric.key}
                    className={`grid gap-4 p-3 rounded ${
                      metric.highlight ? 'bg-muted/50' : ''
                    }`}
                    style={{ gridTemplateColumns: `120px repeat(${selectedUsers.length}, 1fr)` }}
                  >
                    <div className="text-sm font-medium">{metric.label}</div>
                    {selectedUsers.map((userId, idx) => {
                      const value = values[idx]
                      const isMax = value === maxValue && maxValue !== minValue
                      const isMin = value === minValue && maxValue !== minValue

                      return (
                        <div
                          key={userId}
                          className={`text-center font-bold ${
                            isMax
                              ? 'text-green-600'
                              : isMin
                                ? 'text-red-600'
                                : ''
                          }`}
                        >
                          {metric.format === 'price'
                            ? formatPrice(value)
                            : `${value}${metric.suffix || ''}`}
                          {isMax && <ArrowUpRight className="size-3 inline ml-1" />}
                          {isMin && <ArrowDownRight className="size-3 inline ml-1" />}
                        </div>
                      )
                    })}
                  </div>
                )
              })}
            </div>

            {/* 비교 종료 버튼 */}
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowCompareModal(false)
                  setCompareMode(false)
                  setSelectedUsers([])
                }}
              >
                비교 종료
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: '/performance',
    component: PerformancePage,
    getParentRoute: () => parentRoute,
  })
