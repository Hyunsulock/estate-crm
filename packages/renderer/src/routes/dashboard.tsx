import { createRoute, Link } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { Bar, BarChart, Pie, PieChart, Cell, XAxis, CartesianGrid } from 'recharts'
import {
  customersApi,
  propertiesApi,
  dealsApi,
  eventsApi,
  usersApi,
  matchesApi,
  buyerRequirementsApi,
  contactsApi,
  consultationsApi,
  buyerConsultationsApi,
} from '@/api'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { DashboardSkeleton } from '@/components/skeletons'
import {
  Users,
  Building2,
  FileText,
  CalendarDays,
  TrendingUp,
  DollarSign,
  Search,
  MessageSquare,
  Phone,
  ArrowRight,
  Clock,
} from 'lucide-react'
import type { RootRoute } from '@tanstack/react-router'
import type { DealStage } from '@/types'

// 차트 설정
const monthlyDealsConfig = {
  deals: { label: '거래 수', color: 'hsl(var(--chart-1))' },
} satisfies ChartConfig

const transactionTypeConfig = {
  매매: { label: '매매', color: 'hsl(var(--chart-1))' },
  전세: { label: '전세', color: 'hsl(var(--chart-2))' },
  월세: { label: '월세', color: 'hsl(var(--chart-3))' },
} satisfies ChartConfig

function DashboardPage() {
  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: usersApi.getCurrent,
  })

  const { data: customers = [], isLoading: customersLoading } = useQuery({
    queryKey: ['customers'],
    queryFn: customersApi.getAll,
  })

  const { data: properties = [], isLoading: propertiesLoading } = useQuery({
    queryKey: ['properties'],
    queryFn: propertiesApi.getAll,
  })

  const { data: deals = [], isLoading: dealsLoading } = useQuery({
    queryKey: ['deals'],
    queryFn: dealsApi.getAll,
  })

  const { data: events = [] } = useQuery({
    queryKey: ['events'],
    queryFn: eventsApi.getAll,
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

  const { data: buyerConsultations = [] } = useQuery({
    queryKey: ['buyerConsultations'],
    queryFn: buyerConsultationsApi.getAll,
  })

  const currentUserId = currentUser?.id || 'user-1'

  // 내가 기여 중인 진행 거래 (contributions에 포함되거나 담당자인 경우)
  const myActiveDeals = deals.filter((deal) => {
    if (deal.stage === 'completed' || deal.stage === 'closed' || deal.stage === 'cancelled') {
      return false
    }
    // 담당자이거나 기여자에 포함된 경우
    return (
      deal.assignedTo.includes(currentUserId) ||
      deal.contributions?.some((c) => c.userId === currentUserId)
    )
  })

  // 내가 최근 등록한 매물 (최근 7일)
  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

  const myRecentProperties = properties
    .filter(
      (p) =>
        p.assignedTo === currentUserId &&
        new Date(p.createdAt) >= sevenDaysAgo
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  // 내가 최근 등록한 구매고객 (최근 7일)
  const myRecentBuyers = buyerRequirements
    .filter(
      (b) =>
        b.assignedTo === currentUserId &&
        new Date(b.createdAt) >= sevenDaysAgo
    )
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)

  // 최근 상담 내역 (소유주 상담 + 구매고객 상담 합쳐서)
  const recentConsultations = [
    ...consultations.map((c) => ({
      ...c,
      type: 'owner' as const,
    })),
    ...buyerConsultations.map((c) => ({
      ...c,
      type: 'buyer' as const,
    })),
  ]
    .filter((c) => {
      // 현재 사용자가 생성한 상담만
      return c.createdBy === currentUserId
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5)

  // 통계 계산
  const activeCustomers = customers.filter((c) => c.status === 'active').length
  const availableProperties = properties.filter((p) => p.status === 'available').length
  const activeDeals = deals.filter(
    (d) => d.stage !== 'completed' && d.stage !== 'cancelled' && d.stage !== 'closed'
  ).length
  const completedDeals = deals.filter((d) => d.stage === 'completed' || d.stage === 'closed').length
  const todayEvents = events.filter((e) => {
    const today = new Date()
    const eventDate = new Date(e.start)
    return (
      eventDate.getFullYear() === today.getFullYear() &&
      eventDate.getMonth() === today.getMonth() &&
      eventDate.getDate() === today.getDate()
    )
  }).length

  const stats = [
    {
      title: '활성 고객',
      value: activeCustomers,
      total: customers.length,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
    },
    {
      title: '등록 매물',
      value: availableProperties,
      total: properties.length,
      icon: Building2,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
    },
    {
      title: '진행 중인 거래',
      value: activeDeals,
      total: deals.length,
      icon: FileText,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20',
    },
    {
      title: '오늘 일정',
      value: todayEvents,
      total: events.length,
      icon: CalendarDays,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
    },
  ]

  // 거래 단계별 한글 매핑
  const stageLabels: Record<DealStage, { label: string; color: string }> = {
    selection: { label: '최종선택', color: 'bg-blue-100 text-blue-700' },
    deposit: { label: '가계약', color: 'bg-yellow-100 text-yellow-700' },
    contract: { label: '본계약', color: 'bg-purple-100 text-purple-700' },
    completed: { label: '완료', color: 'bg-green-100 text-green-700' },
    closed: { label: '종료', color: 'bg-gray-100 text-gray-700' },
    cancelled: { label: '취소', color: 'bg-red-100 text-red-700' },
  }

  // 월별 거래 데이터 (최근 6개월)
  const monthlyDealsData = useMemo(() => {
    const months: { month: string; deals: number }[] = []
    const now = new Date()

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthName = date.toLocaleDateString('ko-KR', { month: 'short' })
      const count = deals.filter((deal) => {
        const dealDate = new Date(deal.createdAt)
        return (
          dealDate.getFullYear() === date.getFullYear() &&
          dealDate.getMonth() === date.getMonth()
        )
      }).length
      months.push({ month: monthName, deals: count })
    }
    return months
  }, [deals])

  // 거래 유형별 분포 데이터
  const transactionTypeData = useMemo(() => {
    const typeCounts: Record<string, number> = { 매매: 0, 전세: 0, 월세: 0 }

    deals.forEach((deal) => {
      const match = matches.find((m) => m.id === deal.matchId)
      if (match) {
        const property = properties.find((p) => p.id === match.propertyId)
        if (property) {
          const type = property.transactionType === 'sale' ? '매매'
            : property.transactionType === 'lease' ? '전세' : '월세'
          typeCounts[type]++
        }
      }
    })

    return Object.entries(typeCounts)
      .filter(([, count]) => count > 0)
      .map(([name, value]) => ({ name, value, fill: `var(--color-${name})` }))
  }, [deals, matches, properties])

  // 로딩 상태 체크
  const isLoading = customersLoading || propertiesLoading || dealsLoading

  if (isLoading) {
    return <DashboardSkeleton />
  }

  // 가격 포맷팅
  const formatPrice = (price: number | undefined) => {
    if (!price) return '-'
    const billion = Math.floor(price / 100000000)
    const million = Math.floor((price % 100000000) / 10000)
    if (billion > 0 && million > 0) return `${billion}억 ${million}만`
    if (billion > 0) return `${billion}억`
    return `${million}만`
  }

  // 날짜 포맷
  const formatDate = (date: Date) => {
    const d = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - d.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return '오늘'
    if (diffDays === 1) return '어제'
    if (diffDays < 7) return `${diffDays}일 전`
    return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
  }

  // Match에서 매물 정보 가져오기
  const getDealPropertyInfo = (matchId: string) => {
    const match = matches.find((m) => m.id === matchId)
    if (!match) return null
    const property = properties.find((p) => p.id === match.propertyId)
    const buyerReq = buyerRequirements.find((r) => r.id === match.buyerReqId)
    const buyerContact = buyerReq ? contacts.find((c) => c.id === buyerReq.contactId) : null
    return { match, property, buyerReq, buyerContact }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          안녕하세요, {currentUser?.name || '관리자'}님
        </h1>
        <p className="text-muted-foreground mt-1">오늘의 업무 현황을 확인하세요</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-3xl font-bold">{stat.value}</p>
                  <p className="text-sm text-muted-foreground">/ {stat.total}</p>
                </div>
              </div>
              <div className={`${stat.bgColor} p-3 rounded-lg`}>
                <stat.icon className={`size-6 ${stat.color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        {/* 월별 거래 추이 차트 */}
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle className="text-lg">월별 거래 추이</CardTitle>
            <CardDescription>최근 6개월간 거래 현황</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={monthlyDealsConfig} className="h-[250px] w-full">
              <BarChart accessibilityLayer data={monthlyDealsData}>
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  tickMargin={10}
                  axisLine={false}
                />
                <ChartTooltip
                  cursor={false}
                  content={<ChartTooltipContent hideLabel />}
                />
                <Bar dataKey="deals" fill="var(--color-deals)" radius={8} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* 거래 유형별 분포 차트 */}
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle className="text-lg">거래 유형 분포</CardTitle>
            <CardDescription>매매/전세/월세 비율</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={transactionTypeConfig} className="h-[250px] w-full">
              <PieChart>
                <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
                <Pie
                  data={transactionTypeData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={2}
                >
                  {transactionTypeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={transactionTypeConfig[entry.name as keyof typeof transactionTypeConfig]?.color || 'hsl(var(--chart-1))'}
                    />
                  ))}
                </Pie>
                <ChartLegend content={<ChartLegendContent nameKey="name" />} />
              </PieChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* My Active Deals */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <FileText className="size-5" />
            내 진행 중인 거래
          </h2>
          <Link to="/deals" className="text-sm text-primary hover:underline flex items-center gap-1">
            전체보기 <ArrowRight className="size-4" />
          </Link>
        </div>

        {myActiveDeals.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            진행 중인 거래가 없습니다
          </p>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {myActiveDeals.slice(0, 6).map((deal) => {
              const info = getDealPropertyInfo(deal.matchId)
              const stageInfo = stageLabels[deal.stage]

              return (
                <div
                  key={deal.id}
                  className="p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="font-medium text-sm line-clamp-1">
                      {info?.property
                        ? `${info.property.ownerName} (${info.property.unitType || info.property.type})`
                        : '매물 정보 없음'}
                    </div>
                    <Badge className={`${stageInfo.color} text-xs border-0`}>
                      {stageInfo.label}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mb-2">
                    {info?.buyerContact?.name || '-'}
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-primary font-medium text-sm">
                      <DollarSign className="size-3" />
                      {formatPrice(deal.agreedPrice)}
                    </div>
                    {deal.contributions && deal.contributions.length > 0 && (
                      <div className="flex -space-x-1">
                        {deal.contributions.slice(0, 3).map((c, idx) => (
                          <Avatar key={idx} className="size-5 border-2 border-background">
                            <AvatarFallback className="text-[10px]">
                              {c.userName[0]}
                            </AvatarFallback>
                          </Avatar>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* Recent Properties & Buyers */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* 내가 최근 등록한 매물 */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Building2 className="size-5" />
              최근 등록 매물
            </h2>
            <Link to="/properties" className="text-sm text-primary hover:underline flex items-center gap-1">
              전체보기 <ArrowRight className="size-4" />
            </Link>
          </div>

          {myRecentProperties.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              최근 7일간 등록한 매물이 없습니다
            </p>
          ) : (
            <div className="space-y-3">
              {myRecentProperties.map((property) => (
                <div
                  key={property.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                >
                  <div className="size-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Building2 className="size-5 text-green-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm line-clamp-1">
                      {property.ownerName} ({property.unitType || property.type})
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                      <span>{formatPrice(property.price)}</span>
                      <span>·</span>
                      <span>{property.area}평</span>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="size-3" />
                    {formatDate(property.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* 내가 최근 등록한 구매고객 */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Search className="size-5" />
              최근 등록 구매고객
            </h2>
            <Link to="/buyers" className="text-sm text-primary hover:underline flex items-center gap-1">
              전체보기 <ArrowRight className="size-4" />
            </Link>
          </div>

          {myRecentBuyers.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              최근 7일간 등록한 구매고객이 없습니다
            </p>
          ) : (
            <div className="space-y-3">
              {myRecentBuyers.map((buyer) => {
                const contact = contacts.find((c) => c.id === buyer.contactId)
                return (
                  <div
                    key={buyer.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="size-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Users className="size-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm line-clamp-1">
                        {contact?.name || '이름 없음'}
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>{buyer.areas.slice(0, 2).join(', ')}</span>
                        <span>·</span>
                        <span>{formatPrice(buyer.budgetMax)}</span>
                      </div>
                    </div>
                    <Badge
                      variant={buyer.urgency === 'urgent' ? 'destructive' : 'secondary'}
                      className="text-xs"
                    >
                      {buyer.urgency === 'urgent' ? '급함' : buyer.urgency === 'normal' ? '보통' : '여유'}
                    </Badge>
                  </div>
                )
              })}
            </div>
          )}
        </Card>
      </div>

      {/* Recent Consultations */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <MessageSquare className="size-5" />
            최근 상담 내역
          </h2>
        </div>

        {recentConsultations.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            최근 상담 내역이 없습니다
          </p>
        ) : (
          <div className="space-y-3">
            {recentConsultations.map((consultation) => {
              const isOwnerConsultation = consultation.type === 'owner'

              return (
                <div
                  key={consultation.id}
                  className="flex items-start gap-3 p-3 border rounded-lg"
                >
                  <div
                    className={`size-9 rounded-full flex items-center justify-center ${
                      isOwnerConsultation
                        ? 'bg-purple-100 dark:bg-purple-900/30'
                        : 'bg-blue-100 dark:bg-blue-900/30'
                    }`}
                  >
                    {isOwnerConsultation ? (
                      <Phone className="size-4 text-purple-600" />
                    ) : (
                      <MessageSquare className="size-4 text-blue-600" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          isOwnerConsultation ? 'border-purple-300' : 'border-blue-300'
                        }`}
                      >
                        {isOwnerConsultation ? '소유주 상담' : '구매고객 상담'}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {formatDate(consultation.date)}
                      </span>
                    </div>
                    <p className="text-sm line-clamp-2">{consultation.content}</p>
                    {'result' in consultation && consultation.result && (
                      <div className="mt-1">
                        <Badge variant="secondary" className="text-xs">
                          {consultation.result === 'interested'
                            ? '관심있음'
                            : consultation.result === 'rejected'
                              ? '거절'
                              : consultation.result === 'priceInquiry'
                                ? '가격문의'
                                : consultation.result === 'callback'
                                  ? '재연락'
                                  : '보류'}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>

      {/* 다가오는 일정 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <CalendarDays className="size-5" />
            다가오는 일정
          </h2>
          <Link to="/calendar" className="text-sm text-primary hover:underline flex items-center gap-1">
            전체보기 <ArrowRight className="size-4" />
          </Link>
        </div>

        {(() => {
          const now = new Date()
          const upcomingEvents = events
            .filter((e) => new Date(e.start) >= now)
            .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())
            .slice(0, 5)

          if (upcomingEvents.length === 0) {
            return (
              <p className="text-sm text-muted-foreground text-center py-8">
                다가오는 일정이 없습니다
              </p>
            )
          }

          const eventTypeStyles: Record<string, { bg: string; text: string; label: string }> = {
            viewing: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-600', label: '방문' },
            meeting: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-600', label: '미팅' },
            contract: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-600', label: '계약' },
            call: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-600', label: '전화' },
            other: { bg: 'bg-gray-100 dark:bg-gray-900/30', text: 'text-gray-600', label: '기타' },
          }

          const formatEventDate = (date: Date) => {
            const d = new Date(date)
            const today = new Date()
            const tomorrow = new Date(today)
            tomorrow.setDate(tomorrow.getDate() + 1)

            const isToday =
              d.getFullYear() === today.getFullYear() &&
              d.getMonth() === today.getMonth() &&
              d.getDate() === today.getDate()

            const isTomorrow =
              d.getFullYear() === tomorrow.getFullYear() &&
              d.getMonth() === tomorrow.getMonth() &&
              d.getDate() === tomorrow.getDate()

            const timeStr = d.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })

            if (isToday) return `오늘 ${timeStr}`
            if (isTomorrow) return `내일 ${timeStr}`
            return d.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }) + ` ${timeStr}`
          }

          return (
            <div className="space-y-3">
              {upcomingEvents.map((event) => {
                const style = eventTypeStyles[event.type] || eventTypeStyles.other

                return (
                  <div
                    key={event.id}
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className={`size-10 rounded-lg ${style.bg} flex items-center justify-center`}>
                      <CalendarDays className={`size-5 ${style.text}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="font-medium text-sm line-clamp-1">{event.title}</span>
                        <Badge variant="outline" className="text-xs">
                          {style.label}
                        </Badge>
                      </div>
                      {event.description && (
                        <p className="text-xs text-muted-foreground line-clamp-1">{event.description}</p>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground flex items-center gap-1 whitespace-nowrap">
                      <Clock className="size-3" />
                      {formatEventDate(event.start)}
                    </div>
                  </div>
                )
              })}
            </div>
          )
        })()}
      </Card>

      {/* 거래 성과 요약 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="size-5" />
            거래 성과
          </h2>
          <Link to="/performance" className="text-sm text-primary hover:underline flex items-center gap-1">
            상세보기 <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold">{completedDeals}</div>
            <div className="text-sm text-muted-foreground">완료된 거래</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold">{activeDeals}</div>
            <div className="text-sm text-muted-foreground">진행 중</div>
          </div>
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {formatPrice(
                deals
                  .filter((d) => d.stage === 'completed' || d.stage === 'closed')
                  .reduce((sum, d) => sum + (d.commission || 0), 0)
              )}
            </div>
            <div className="text-sm text-muted-foreground">총 수수료</div>
          </div>
        </div>
      </Card>
    </div>
  )
}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: '/',
    component: DashboardPage,
    getParentRoute: () => parentRoute,
  })
