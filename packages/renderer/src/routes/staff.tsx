import { createRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { activityLogsApi, usersApi } from '@/api'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Search,
  Users,
  Activity,
  Building2,
  UserPlus,
  Link2,
  FileText,
  FileSignature,
  MessageSquare,
  Home,
  LogIn,
  EyeOff,
  Filter,
  TrendingUp,
  Clock,
  X,
  CalendarDays,
  BarChart3,
} from 'lucide-react'
import type { RootRoute } from '@tanstack/react-router'
import type { ActivityType, User } from '@/types'

function StaffPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedUserId, setSelectedUserId] = useState<string | 'all'>('all')
  const [selectedType, setSelectedType] = useState<ActivityType | 'all'>('all')
  const [showStats, setShowStats] = useState(true)
  const [detailUserId, setDetailUserId] = useState<string | null>(null)

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
  })

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: usersApi.getCurrent,
  })

  const { data: activityLogs = [], isLoading } = useQuery({
    queryKey: ['activityLogs'],
    queryFn: activityLogsApi.getAll,
  })

  const { data: userStats = [] } = useQuery({
    queryKey: ['activityStats'],
    queryFn: activityLogsApi.getStatsByUser,
  })

  // 활동 타입 한글 매핑 및 아이콘
  const activityConfig: Record<
    ActivityType,
    { label: string; icon: React.ReactNode; color: string }
  > = {
    property_create: {
      label: '매물 등록',
      icon: <Building2 className="size-4" />,
      color: 'text-blue-600',
    },
    property_update: {
      label: '매물 수정',
      icon: <Building2 className="size-4" />,
      color: 'text-blue-500',
    },
    property_hide: {
      label: '매물 숨김',
      icon: <EyeOff className="size-4" />,
      color: 'text-gray-500',
    },
    buyer_create: {
      label: '구매고객 등록',
      icon: <UserPlus className="size-4" />,
      color: 'text-green-600',
    },
    buyer_update: {
      label: '구매고객 수정',
      icon: <Users className="size-4" />,
      color: 'text-green-500',
    },
    match_create: {
      label: '매칭 생성',
      icon: <Link2 className="size-4" />,
      color: 'text-purple-600',
    },
    match_update: {
      label: '매칭 진행',
      icon: <Link2 className="size-4" />,
      color: 'text-purple-500',
    },
    deal_create: {
      label: '거래 생성',
      icon: <FileText className="size-4" />,
      color: 'text-orange-600',
    },
    deal_update: {
      label: '거래 진행',
      icon: <FileText className="size-4" />,
      color: 'text-orange-500',
    },
    contract_create: {
      label: '계약서 생성',
      icon: <FileSignature className="size-4" />,
      color: 'text-indigo-600',
    },
    contract_update: {
      label: '계약서 수정',
      icon: <FileSignature className="size-4" />,
      color: 'text-indigo-500',
    },
    consultation_create: {
      label: '상담 기록',
      icon: <MessageSquare className="size-4" />,
      color: 'text-cyan-600',
    },
    building_create: {
      label: '건물 등록',
      icon: <Home className="size-4" />,
      color: 'text-amber-600',
    },
    owner_create: {
      label: '소유자 등록',
      icon: <UserPlus className="size-4" />,
      color: 'text-teal-600',
    },
    login: {
      label: '로그인',
      icon: <LogIn className="size-4" />,
      color: 'text-gray-600',
    },
    logout: {
      label: '로그아웃',
      icon: <LogIn className="size-4" />,
      color: 'text-gray-400',
    },
  }

  // 필터링된 로그
  const filteredLogs = useMemo(() => {
    let logs = [...activityLogs]

    // 사용자 필터
    if (selectedUserId !== 'all') {
      logs = logs.filter((log) => log.userId === selectedUserId)
    }

    // 활동 타입 필터
    if (selectedType !== 'all') {
      logs = logs.filter((log) => log.type === selectedType)
    }

    // 검색어 필터
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      logs = logs.filter(
        (log) =>
          log.description.toLowerCase().includes(q) ||
          log.targetName?.toLowerCase().includes(q),
      )
    }

    return logs
  }, [activityLogs, selectedUserId, selectedType, searchQuery])

  // 선택된 직원의 최근 1주일 활동 요약
  const weeklyUserSummary = useMemo(() => {
    if (!detailUserId) return null

    const oneWeekAgo = new Date()
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7)

    const userLogs = activityLogs.filter(
      (log) =>
        log.userId === detailUserId &&
        new Date(log.createdAt) >= oneWeekAgo,
    )

    // 활동 타입별 카운트
    const typeCount: Record<ActivityType, number> = {} as Record<ActivityType, number>
    userLogs.forEach((log) => {
      typeCount[log.type] = (typeCount[log.type] || 0) + 1
    })

    // 일별 활동 카운트 (최근 7일)
    const dailyCount: { date: string; count: number }[] = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dateStr = date.toLocaleDateString('ko-KR', { weekday: 'short', month: 'numeric', day: 'numeric' })
      const count = userLogs.filter((log) => {
        const logDate = new Date(log.createdAt)
        return (
          logDate.getDate() === date.getDate() &&
          logDate.getMonth() === date.getMonth() &&
          logDate.getFullYear() === date.getFullYear()
        )
      }).length
      dailyCount.push({ date: dateStr, count })
    }

    // 최근 활동 5건
    const recentLogs = userLogs.slice(0, 5)

    return {
      totalActivities: userLogs.length,
      typeBreakdown: Object.entries(typeCount)
        .map(([type, count]) => ({ type: type as ActivityType, count }))
        .sort((a, b) => b.count - a.count),
      dailyCount,
      recentLogs,
    }
  }, [detailUserId, activityLogs])

  // 사용자 정보 조회 헬퍼
  const getUserById = (userId: string): User | undefined => {
    return users.find((u) => u.id === userId)
  }

  // 날짜 포맷팅
  const formatDate = (date: Date) => {
    const d = new Date(date)
    const now = new Date()
    const diff = now.getTime() - d.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) {
      return `${minutes}분 전`
    } else if (hours < 24) {
      return `${hours}시간 전`
    } else if (days < 7) {
      return `${days}일 전`
    } else {
      return d.toLocaleDateString('ko-KR', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    }
  }

  // 관리자가 아닌 경우 접근 제한
  if (currentUser && currentUser.role !== 'manager') {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="rounded-full bg-red-100 dark:bg-red-900/30 p-6">
          <EyeOff className="size-12 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-xl font-semibold">접근 권한이 없습니다</h2>
        <p className="text-muted-foreground">이 페이지는 관리자만 접근할 수 있습니다.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">직원 활동 관리</h1>
          <p className="text-muted-foreground">
            직원들의 활동 내역을 확인하고 관리합니다
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showStats ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowStats(!showStats)}
          >
            <TrendingUp className="size-4 mr-2" />
            통계
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {showStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {userStats.map((stat) => {
            const user = getUserById(stat.userId)
            const isDetailOpen = detailUserId === stat.userId
            return (
              <Card
                key={stat.userId}
                className={`p-4 cursor-pointer transition-colors ${
                  isDetailOpen
                    ? 'ring-2 ring-primary'
                    : selectedUserId === stat.userId
                      ? 'ring-2 ring-primary/50'
                      : 'hover:bg-accent/50'
                }`}
                onClick={() => {
                  setDetailUserId(isDetailOpen ? null : stat.userId)
                }}
              >
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={user?.avatar} />
                    <AvatarFallback>{stat.userName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">{stat.userName}</p>
                      {user?.role === 'manager' && (
                        <Badge variant="secondary" className="text-xs">
                          관리자
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      활동 {stat.totalActivities}건
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex flex-wrap gap-1">
                  {stat.activityBreakdown.slice(0, 3).map((breakdown) => (
                    <Badge key={breakdown.type} variant="outline" className="text-xs">
                      {activityConfig[breakdown.type]?.label || breakdown.type}{' '}
                      {breakdown.count}
                    </Badge>
                  ))}
                  {stat.activityBreakdown.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{stat.activityBreakdown.length - 3}
                    </Badge>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {/* Weekly Summary Panel */}
      {detailUserId && weeklyUserSummary && (
        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="size-10">
                <AvatarImage src={getUserById(detailUserId)?.avatar} />
                <AvatarFallback>
                  {getUserById(detailUserId)?.name.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  {getUserById(detailUserId)?.name}
                  <Badge variant="outline" className="font-normal">
                    <CalendarDays className="size-3 mr-1" />
                    최근 1주일
                  </Badge>
                </h3>
                <p className="text-sm text-muted-foreground">
                  총 {weeklyUserSummary.totalActivities}건의 활동
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={() => setDetailUserId(null)}
            >
              <X className="size-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 일별 활동 차트 */}
            <div className="md:col-span-2">
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <BarChart3 className="size-4" />
                일별 활동
              </h4>
              <div className="flex items-end gap-1 h-24">
                {weeklyUserSummary.dailyCount.map((day, idx) => {
                  const maxCount = Math.max(...weeklyUserSummary.dailyCount.map((d) => d.count), 1)
                  const height = (day.count / maxCount) * 100
                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex flex-col items-center justify-end h-20">
                        <span className="text-xs text-muted-foreground mb-1">
                          {day.count > 0 ? day.count : ''}
                        </span>
                        <div
                          className="w-full max-w-8 bg-primary/80 rounded-t transition-all"
                          style={{ height: `${Math.max(height, day.count > 0 ? 8 : 0)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                        {day.date.split(' ')[1]}
                      </span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 활동 타입별 요약 */}
            <div>
              <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Activity className="size-4" />
                활동 유형
              </h4>
              <div className="space-y-2">
                {weeklyUserSummary.typeBreakdown.length === 0 ? (
                  <p className="text-sm text-muted-foreground">활동 없음</p>
                ) : (
                  weeklyUserSummary.typeBreakdown.slice(0, 5).map((item) => {
                    const config = activityConfig[item.type]
                    return (
                      <div
                        key={item.type}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className={`flex items-center gap-1.5 ${config?.color || ''}`}>
                          {config?.icon}
                          {config?.label || item.type}
                        </span>
                        <Badge variant="secondary" className="text-xs">
                          {item.count}
                        </Badge>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          </div>

          {/* 최근 활동 */}
          {weeklyUserSummary.recentLogs.length > 0 && (
            <div className="mt-5 pt-4 border-t">
              <h4 className="text-sm font-medium mb-3">최근 활동</h4>
              <div className="space-y-2">
                {weeklyUserSummary.recentLogs.map((log) => {
                  const config = activityConfig[log.type]
                  return (
                    <div
                      key={log.id}
                      className="flex items-center gap-3 text-sm p-2 rounded-md bg-muted/30"
                    >
                      <span className={config?.color}>
                        {config?.icon}
                      </span>
                      <span className="flex-1 truncate">{log.description}</span>
                      <span className="text-xs text-muted-foreground whitespace-nowrap">
                        {formatDate(log.createdAt)}
                      </span>
                    </div>
                  )
                })}
              </div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-3"
                onClick={() => {
                  setSelectedUserId(detailUserId)
                  setDetailUserId(null)
                }}
              >
                전체 활동 보기
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="활동 내용 또는 대상 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* User Filter */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant={selectedUserId === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedUserId('all')}
            >
              전체 직원
            </Button>
            {users.map((user) => (
              <Button
                key={user.id}
                variant={selectedUserId === user.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedUserId(user.id)}
              >
                {user.name}
              </Button>
            ))}
          </div>
        </div>

        {/* Activity Type Filter */}
        <div className="mt-4 flex gap-2 flex-wrap">
          <Button
            variant={selectedType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType('all')}
          >
            <Filter className="size-4 mr-1" />
            전체
          </Button>
          {Object.entries(activityConfig).map(([type, config]) => (
            <Button
              key={type}
              variant={selectedType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType(type as ActivityType)}
              className={selectedType === type ? '' : config.color}
            >
              {config.icon}
              <span className="ml-1">{config.label}</span>
            </Button>
          ))}
        </div>
      </Card>

      {/* Activity Log List */}
      <Card>
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Activity className="size-5" />
              활동 내역
            </h3>
            <Badge variant="secondary">{filteredLogs.length}건</Badge>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">로딩 중...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            활동 내역이 없습니다.
          </div>
        ) : (
          <div className="divide-y max-h-[600px] overflow-y-auto">
            {filteredLogs.map((log) => {
              const user = getUserById(log.userId)
              const config = activityConfig[log.type]

              return (
                <div key={log.id} className="p-4 hover:bg-accent/30 transition-colors">
                  <div className="flex items-start gap-3">
                    {/* User Avatar */}
                    <Avatar className="size-9">
                      <AvatarImage src={user?.avatar} />
                      <AvatarFallback>{user?.name.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium">{user?.name || '알 수 없음'}</span>
                        <Badge
                          variant="outline"
                          className={`${config?.color || ''} border-current/30`}
                        >
                          {config?.icon}
                          <span className="ml-1">{config?.label || log.type}</span>
                        </Badge>
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="size-3" />
                          {formatDate(log.createdAt)}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{log.description}</p>
                      {log.targetName && (
                        <p className="text-sm text-muted-foreground mt-0.5">
                          대상: {log.targetName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}

const createStaffRoute = (rootRoute: RootRoute) =>
  createRoute({
    getParentRoute: () => rootRoute,
    path: '/staff',
    component: StaffPage,
  })

export default createStaffRoute
