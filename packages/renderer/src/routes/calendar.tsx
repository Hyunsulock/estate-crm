import { createRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { eventsApi, customersApi, propertiesApi, usersApi } from '@/api'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  User,
} from 'lucide-react'
import type { RootRoute } from '@tanstack/react-router'
import type { EventType } from '@/types'

function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

  const { data: events = [], isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: eventsApi.getAll,
  })

  const { data: customers = [] } = useQuery({
    queryKey: ['customers'],
    queryFn: customersApi.getAll,
  })

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: propertiesApi.getAll,
  })

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
  })

  // 이벤트 타입 한글 매핑 및 색상
  const eventTypeConfig: Record<
    EventType,
    { label: string; color: string; bgColor: string }
  > = {
    meeting: { label: '고객미팅', color: 'text-blue-600', bgColor: 'bg-blue-100 dark:bg-blue-900/20' },
    viewing: { label: '매물안내', color: 'text-green-600', bgColor: 'bg-green-100 dark:bg-green-900/20' },
    contract: { label: '계약', color: 'text-purple-600', bgColor: 'bg-purple-100 dark:bg-purple-900/20' },
    deadline: { label: '기한', color: 'text-red-600', bgColor: 'bg-red-100 dark:bg-red-900/20' },
    other: { label: '기타', color: 'text-gray-600', bgColor: 'bg-gray-100 dark:bg-gray-900/20' },
  }

  // 헬퍼 함수
  const getCustomerName = (customerId: string | undefined) => {
    if (!customerId) return null
    const customer = customers.find((c) => c.id === customerId)
    return customer?.name
  }

  const getPropertyAddress = (propertyId: string | undefined) => {
    if (!propertyId) return null
    const property = properties.find((p) => p.id === propertyId)
    return property?.unitType || ''
  }

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    return user?.name || '미지정'
  }

  // 달력 생성 함수
  const generateCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const prevLastDay = new Date(year, month, 0)

    const firstDayOfWeek = firstDay.getDay()
    const lastDayOfWeek = lastDay.getDay()

    const days: (Date | null)[] = []

    // 이전 달 날짜들
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      days.push(new Date(year, month - 1, prevLastDay.getDate() - i))
    }

    // 현재 달 날짜들
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i))
    }

    // 다음 달 날짜들
    for (let i = 1; i <= 6 - lastDayOfWeek; i++) {
      days.push(new Date(year, month + 1, i))
    }

    return days
  }

  // 특정 날짜의 이벤트 가져오기
  const getEventsForDate = (date: Date) => {
    return events.filter((event) => {
      const eventDate = new Date(event.start)
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      )
    })
  }

  // 선택된 날짜의 이벤트
  const selectedDateEvents = getEventsForDate(selectedDate).sort(
    (a, b) => new Date(a.start).getTime() - new Date(b.start).getTime(),
  )

  // 날짜 비교
  const isSameDay = (date1: Date, date2: Date) => {
    return (
      date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate()
    )
  }

  const isToday = (date: Date) => {
    return isSameDay(date, new Date())
  }

  const isCurrentMonth = (date: Date) => {
    return date.getMonth() === currentDate.getMonth()
  }

  // 이전/다음 달
  const goToPrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const goToToday = () => {
    const today = new Date()
    setCurrentDate(today)
    setSelectedDate(today)
  }

  // 시간 포맷팅
  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const calendarDays = generateCalendar()
  const weekDays = ['일', '월', '화', '수', '목', '금', '토']

  // 통계
  const todayEvents = getEventsForDate(new Date()).length
  const thisMonthEvents = events.filter((e) => {
    const eventDate = new Date(e.start)
    return (
      eventDate.getFullYear() === currentDate.getFullYear() &&
      eventDate.getMonth() === currentDate.getMonth()
    )
  }).length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">일정 관리</h1>
          <p className="text-muted-foreground mt-1">중요한 일정을 관리하고 확인하세요</p>
        </div>
        <Button>
          <Plus className="size-4 mr-2" />
          일정 추가
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">오늘 일정</div>
          <div className="text-2xl font-bold mt-1">{todayEvents}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">이번 달 일정</div>
          <div className="text-2xl font-bold mt-1">{thisMonthEvents}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">고객 미팅</div>
          <div className="text-2xl font-bold mt-1">
            {events.filter((e) => e.type === 'meeting').length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">매물 안내</div>
          <div className="text-2xl font-bold mt-1">
            {events.filter((e) => e.type === 'viewing').length}
          </div>
        </Card>
      </div>

      {/* Calendar Grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
        {/* Calendar */}
        <Card className="p-6">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">
              {currentDate.getFullYear()}년 {currentDate.getMonth() + 1}월
            </h2>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                오늘
              </Button>
              <Button variant="outline" size="icon-sm" onClick={goToPrevMonth}>
                <ChevronLeft className="size-4" />
              </Button>
              <Button variant="outline" size="icon-sm" onClick={goToNextMonth}>
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-2">
            {/* Week days */}
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center text-sm font-medium text-muted-foreground py-2"
              >
                {day}
              </div>
            ))}

            {/* Calendar days */}
            {calendarDays.map((date, index) => {
              if (!date) return <div key={index} />

              const dayEvents = getEventsForDate(date)
              const isSelected = isSameDay(date, selectedDate)
              const isTodayDate = isToday(date)
              const isOtherMonth = !isCurrentMonth(date)

              return (
                <button
                  key={index}
                  onClick={() => setSelectedDate(date)}
                  className={`
                    min-h-[80px] p-2 rounded-lg border transition-colors
                    ${isSelected ? 'bg-primary text-primary-foreground border-primary' : 'hover:bg-accent'}
                    ${isTodayDate && !isSelected ? 'border-primary' : ''}
                    ${isOtherMonth ? 'opacity-40' : ''}
                  `}
                >
                  <div className="text-sm font-medium mb-1">{date.getDate()}</div>
                  <div className="space-y-1">
                    {dayEvents.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className={`text-xs px-1 py-0.5 rounded truncate ${
                          isSelected
                            ? 'bg-primary-foreground/20'
                            : eventTypeConfig[event.type].bgColor
                        }`}
                      >
                        {event.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-xs text-muted-foreground">
                        +{dayEvents.length - 2}
                      </div>
                    )}
                  </div>
                </button>
              )
            })}
          </div>
        </Card>

        {/* Selected Date Events */}
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon className="size-5" />
              <h2 className="text-lg font-semibold">
                {selectedDate.getMonth() + 1}월 {selectedDate.getDate()}일 일정
              </h2>
            </div>

            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">로딩 중...</p>
              </div>
            ) : selectedDateEvents.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">일정이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-3">
                {selectedDateEvents.map((event) => {
                  const config = eventTypeConfig[event.type]
                  const customerName = getCustomerName(event.customerId)
                  const propertyAddress = getPropertyAddress(event.propertyId)

                  return (
                    <div
                      key={event.id}
                      className="p-4 rounded-lg border hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge
                              className={`${config.bgColor} ${config.color} border-0`}
                            >
                              {config.label}
                            </Badge>
                            {event.allDay && (
                              <Badge variant="outline" className="text-xs">
                                종일
                              </Badge>
                            )}
                          </div>
                          <h3 className="font-medium truncate">{event.title}</h3>
                        </div>
                      </div>

                      <div className="space-y-1.5 text-sm text-muted-foreground">
                        {!event.allDay && (
                          <div className="flex items-center gap-2">
                            <Clock className="size-3.5" />
                            <span>
                              {formatTime(event.start)} - {formatTime(event.end)}
                            </span>
                          </div>
                        )}

                        {customerName && (
                          <div className="flex items-center gap-2">
                            <User className="size-3.5" />
                            <span>{customerName}</span>
                          </div>
                        )}

                        {event.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="size-3.5" />
                            <span className="truncate">{event.location}</span>
                          </div>
                        )}

                        {propertyAddress && (
                          <div className="flex items-center gap-2">
                            <MapPin className="size-3.5" />
                            <span className="truncate text-xs">
                              매물: {propertyAddress}
                            </span>
                          </div>
                        )}
                      </div>

                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-3 pt-3 border-t">
                        <span className="text-xs text-muted-foreground">
                          담당: {event.assignedTo.map((id) => getUserName(id)).join(', ')}
                        </span>
                        <Button variant="ghost" size="sm">
                          상세보기
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: '/calendar',
    component: CalendarPage,
    getParentRoute: () => parentRoute,
  })
