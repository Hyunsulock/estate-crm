import { createRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { buyerRequirementsApi, contactsApi, usersApi } from '@/api'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Plus,
  Search,
  Phone,
  User,
  X,
  Save,
  MapPin,
  AlertCircle,
} from 'lucide-react'
import type { RootRoute } from '@tanstack/react-router'
import type {
  BuyerRequirement,
  BuyerStatus,
  BuyerUrgency,
  TransactionType,
  PropertyType,
} from '@/types'

// 필터 상태 타입
interface FilterState {
  transactionType: TransactionType | 'all'
  status: BuyerStatus | 'all'
  urgency: BuyerUrgency | 'all'
  searchQuery: string
}

function BuyersPage() {
  const [selectedBuyer, setSelectedBuyer] = useState<BuyerRequirement | null>(null)
  const [filters, setFilters] = useState<FilterState>({
    transactionType: 'all',
    status: 'all',
    urgency: 'all',
    searchQuery: '',
  })

  const { data: buyers = [], isLoading } = useQuery({
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

  // 연락처 정보 가져오기
  const getContact = (contactId: string) => {
    return contacts.find((c) => c.id === contactId)
  }

  // 담당자 이름 가져오기
  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    return user?.name || '미지정'
  }

  // 필터링된 구매고객
  const filteredBuyers = useMemo(() => {
    return buyers.filter((buyer) => {
      // 거래 유형 필터
      if (filters.transactionType !== 'all' && buyer.transactionType !== filters.transactionType) {
        return false
      }

      // 상태 필터
      if (filters.status !== 'all' && buyer.status !== filters.status) {
        return false
      }

      // 긴급도 필터
      if (filters.urgency !== 'all' && buyer.urgency !== filters.urgency) {
        return false
      }

      // 검색어 필터
      if (filters.searchQuery) {
        const contact = getContact(buyer.contactId)
        const query = filters.searchQuery.toLowerCase()
        return (
          contact?.name.toLowerCase().includes(query) ||
          contact?.phone.includes(query) ||
          buyer.areas.some((a) => a.includes(query)) ||
          buyer.preferences?.toLowerCase().includes(query)
        )
      }

      return true
    })
  }, [buyers, filters, contacts])

  // 거래 유형 한글 매핑
  const transactionLabels: Record<TransactionType, string> = {
    sale: '매매',
    lease: '전세',
    monthly: '월세',
  }

  // 매물 유형 한글 매핑
  const typeLabels: Record<PropertyType, string> = {
    apartment: '아파트',
    officetel: '오피스텔',
    villa: '빌라',
    house: '단독주택',
    commercial: '상가',
    land: '토지',
  }

  // 상태 한글 매핑 및 색상
  const statusConfig: Record<
    BuyerStatus,
    { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
  > = {
    active: { label: '활성', variant: 'default' },
    matched: { label: '매칭됨', variant: 'secondary' },
    completed: { label: '거래완료', variant: 'outline' },
    inactive: { label: '비활성', variant: 'destructive' },
  }

  // 긴급도 한글 매핑 및 색상
  const urgencyConfig: Record<BuyerUrgency, { label: string; color: string }> = {
    urgent: { label: '급함', color: 'text-red-600' },
    normal: { label: '보통', color: 'text-gray-600' },
    flexible: { label: '여유', color: 'text-green-600' },
  }

  // 가격 포맷팅
  const formatPrice = (price: number) => {
    const billion = Math.floor(price / 100000000)
    const million = Math.floor((price % 100000000) / 10000)

    if (billion > 0 && million > 0) {
      return `${billion}억 ${million.toLocaleString()}만`
    } else if (billion > 0) {
      return `${billion}억`
    } else {
      return `${million.toLocaleString()}만`
    }
  }

  // 마지막 연락일 경과일 계산
  const getDaysAgo = (date: Date | undefined) => {
    if (!date) return '없음'
    const now = new Date()
    const d = new Date(date)
    const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
    if (diff === 0) return '오늘'
    if (diff === 1) return '어제'
    return `${diff}일전`
  }

  // 필터 초기화
  const resetFilters = () => {
    setFilters({
      transactionType: 'all',
      status: 'all',
      urgency: 'all',
      searchQuery: '',
    })
  }

  // 활성 필터 개수
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.transactionType !== 'all') count++
    if (filters.status !== 'all') count++
    if (filters.urgency !== 'all') count++
    return count
  }, [filters])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">구매고객 관리</h1>
          <p className="text-muted-foreground text-sm">
            매수/임차 희망 고객과 조건을 관리하세요
          </p>
        </div>
        <Button>
          <Plus className="size-4 mr-2" />
          고객 등록
        </Button>
      </div>

      {/* Quick Filters & Search */}
      <Card className="p-3">
        <div className="flex gap-3 items-center">
          {/* 거래 유형 퀵 필터 */}
          <div className="flex gap-1">
            {(['all', 'sale', 'lease', 'monthly'] as const).map((type) => (
              <Button
                key={type}
                variant={filters.transactionType === type ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilters({ ...filters, transactionType: type })}
              >
                {type === 'all' ? '전체' : transactionLabels[type]}
              </Button>
            ))}
          </div>

          {/* 상태 필터 */}
          <select
            className="h-9 px-3 rounded-md border border-input bg-background text-sm"
            value={filters.status}
            onChange={(e) =>
              setFilters({ ...filters, status: e.target.value as BuyerStatus | 'all' })
            }
          >
            <option value="all">상태: 전체</option>
            {Object.entries(statusConfig).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          {/* 긴급도 필터 */}
          <select
            className="h-9 px-3 rounded-md border border-input bg-background text-sm"
            value={filters.urgency}
            onChange={(e) =>
              setFilters({ ...filters, urgency: e.target.value as BuyerUrgency | 'all' })
            }
          >
            <option value="all">긴급도: 전체</option>
            {Object.entries(urgencyConfig).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>

          {/* 검색 */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="고객명, 전화번호, 희망지역 검색..."
              value={filters.searchQuery}
              onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
              className="pl-9"
            />
          </div>

          {/* 필터 초기화 */}
          {activeFilterCount > 0 && (
            <Button variant="ghost" size="sm" onClick={resetFilters}>
              <X className="size-4 mr-1" />
              초기화
            </Button>
          )}
        </div>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-6 gap-3">
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">전체</div>
          <div className="text-xl font-bold">{buyers.length}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">활성</div>
          <div className="text-xl font-bold text-green-600">
            {buyers.filter((b) => b.status === 'active').length}
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">급한 고객</div>
          <div className="text-xl font-bold text-red-600">
            {buyers.filter((b) => b.status === 'active' && b.urgency === 'urgent').length}
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">매칭됨</div>
          <div className="text-xl font-bold text-blue-600">
            {buyers.filter((b) => b.status === 'matched').length}
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">거래완료</div>
          <div className="text-xl font-bold">
            {buyers.filter((b) => b.status === 'completed').length}
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">검색결과</div>
          <div className="text-xl font-bold text-primary">{filteredBuyers.length}</div>
        </Card>
      </div>

      {/* Buyer Table */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      ) : filteredBuyers.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <p className="text-muted-foreground">
              {filters.searchQuery || activeFilterCount > 0
                ? '검색 결과가 없습니다'
                : '등록된 구매고객이 없습니다'}
            </p>
          </div>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left p-2 font-medium w-[70px]">상태</th>
                  <th className="text-left p-2 font-medium w-[50px]">긴급</th>
                  <th className="text-left p-2 font-medium w-[50px]">거래</th>
                  <th className="text-left p-2 font-medium w-[120px]">고객정보</th>
                  <th className="text-left p-2 font-medium w-[150px]">희망지역</th>
                  <th className="text-left p-2 font-medium w-[80px]">유형</th>
                  <th className="text-right p-2 font-medium w-[140px]">예산</th>
                  <th className="text-center p-2 font-medium w-[60px]">면적</th>
                  <th className="text-left p-2 font-medium">기타조건</th>
                  <th className="text-center p-2 font-medium w-[60px]">연락</th>
                  <th className="text-center p-2 font-medium w-[50px]">담당</th>
                </tr>
              </thead>
              <tbody>
                {filteredBuyers.map((buyer) => {
                  const contact = getContact(buyer.contactId)
                  return (
                    <tr
                      key={buyer.id}
                      className="border-b hover:bg-muted/30 cursor-pointer"
                      onClick={() => setSelectedBuyer(buyer)}
                    >
                      <td className="p-2">
                        <Badge
                          variant={statusConfig[buyer.status].variant}
                          className="text-xs"
                        >
                          {statusConfig[buyer.status].label}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <span
                          className={`text-xs font-medium ${urgencyConfig[buyer.urgency].color}`}
                        >
                          {buyer.urgency === 'urgent' && (
                            <AlertCircle className="size-3 inline mr-1" />
                          )}
                          {urgencyConfig[buyer.urgency].label}
                        </span>
                      </td>
                      <td className="p-2">
                        <Badge variant="outline" className="text-xs">
                          {transactionLabels[buyer.transactionType]}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1">
                            <User className="size-3 text-muted-foreground" />
                            <span className="text-xs font-medium">
                              {contact?.name || '알 수 없음'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Phone className="size-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {contact?.phone || '-'}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="p-2">
                        <div className="flex items-center gap-1">
                          <MapPin className="size-3 text-muted-foreground flex-shrink-0" />
                          <span
                            className="text-xs truncate max-w-[130px]"
                            title={buyer.areas.join(', ')}
                          >
                            {buyer.areas.join(', ')}
                          </span>
                        </div>
                      </td>
                      <td className="p-2">
                        <span className="text-xs text-muted-foreground">
                          {buyer.propertyTypes.map((t) => typeLabels[t]).join(', ')}
                        </span>
                      </td>
                      <td className="p-2 text-right">
                        <div className="flex flex-col items-end">
                          <span className="text-xs font-medium text-primary">
                            {buyer.budgetMin && buyer.budgetMax
                              ? `${formatPrice(buyer.budgetMin)} ~ ${formatPrice(buyer.budgetMax)}`
                              : buyer.budgetMax
                                ? `~${formatPrice(buyer.budgetMax)}`
                                : '-'}
                          </span>
                          {buyer.monthlyRentMax && (
                            <span className="text-xs text-muted-foreground">
                              월 {formatPrice(buyer.monthlyRentMax)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="p-2 text-center text-xs text-muted-foreground">
                        {buyer.areaMin || buyer.areaMax
                          ? `${buyer.areaMin || ''}~${buyer.areaMax || ''}평`
                          : '-'}
                      </td>
                      <td className="p-2">
                        {buyer.preferences ? (
                          <span
                            className="text-xs text-muted-foreground truncate block max-w-[150px]"
                            title={buyer.preferences}
                          >
                            {buyer.preferences}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground/50">-</span>
                        )}
                      </td>
                      <td className="p-2 text-center">
                        <span
                          className={`text-xs ${
                            buyer.lastContactDate &&
                            new Date(buyer.lastContactDate).getTime() >
                              Date.now() - 7 * 24 * 60 * 60 * 1000
                              ? 'text-green-600'
                              : buyer.lastContactDate &&
                                  new Date(buyer.lastContactDate).getTime() >
                                    Date.now() - 14 * 24 * 60 * 60 * 1000
                                ? 'text-yellow-600'
                                : 'text-red-600'
                          }`}
                        >
                          {getDaysAgo(buyer.lastContactDate)}
                        </span>
                      </td>
                      <td className="p-2 text-center text-xs text-muted-foreground">
                        {getUserName(buyer.assignedTo)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* 고객 상세/수정 모달 */}
      <Dialog
        open={!!selectedBuyer}
        onOpenChange={(open) => !open && setSelectedBuyer(null)}
      >
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="size-5" />
              구매고객 상세
              {selectedBuyer && (
                <Badge variant="outline" className="ml-2">
                  {getContact(selectedBuyer.contactId)?.name}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          {selectedBuyer && (
            <div className="space-y-4">
              {/* 고객 기본 정보 */}
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="text-sm font-medium mb-2">고객 정보</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <span className="text-xs text-muted-foreground">이름</span>
                    <p className="font-medium">
                      {getContact(selectedBuyer.contactId)?.name}
                    </p>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground">연락처</span>
                    <p className="font-medium">
                      {getContact(selectedBuyer.contactId)?.phone}
                    </p>
                  </div>
                </div>
              </div>

              {/* 희망 조건 */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    거래유형
                  </label>
                  <Badge variant="outline">
                    {transactionLabels[selectedBuyer.transactionType]}
                  </Badge>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">상태</label>
                  <Badge variant={statusConfig[selectedBuyer.status].variant}>
                    {statusConfig[selectedBuyer.status].label}
                  </Badge>
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  희망 지역
                </label>
                <div className="flex flex-wrap gap-1">
                  {selectedBuyer.areas.map((area) => (
                    <Badge key={area} variant="secondary">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">
                  희망 매물 유형
                </label>
                <div className="flex flex-wrap gap-1">
                  {selectedBuyer.propertyTypes.map((type) => (
                    <Badge key={type} variant="outline">
                      {typeLabels[type]}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">예산</label>
                  <p className="font-medium text-primary">
                    {selectedBuyer.budgetMin && selectedBuyer.budgetMax
                      ? `${formatPrice(selectedBuyer.budgetMin)} ~ ${formatPrice(selectedBuyer.budgetMax)}`
                      : selectedBuyer.budgetMax
                        ? `~${formatPrice(selectedBuyer.budgetMax)}`
                        : '-'}
                  </p>
                  {selectedBuyer.monthlyRentMax && (
                    <p className="text-sm text-muted-foreground">
                      월세 최대: {formatPrice(selectedBuyer.monthlyRentMax)}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    희망 면적
                  </label>
                  <p className="font-medium">
                    {selectedBuyer.areaMin || selectedBuyer.areaMax
                      ? `${selectedBuyer.areaMin || ''}~${selectedBuyer.areaMax || ''}평`
                      : '-'}
                  </p>
                </div>
              </div>

              {selectedBuyer.preferences && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    기타 조건
                  </label>
                  <p className="text-sm">{selectedBuyer.preferences}</p>
                </div>
              )}

              {selectedBuyer.mustConditions && selectedBuyer.mustConditions.length > 0 && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    필수 조건
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {selectedBuyer.mustConditions.map((cond) => (
                      <Badge key={cond} variant="destructive" className="text-xs">
                        {cond}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedBuyer.preferConditions && selectedBuyer.preferConditions.length > 0 && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    선호 조건
                  </label>
                  <div className="flex flex-wrap gap-1">
                    {selectedBuyer.preferConditions.map((cond) => (
                      <Badge key={cond} variant="secondary" className="text-xs">
                        {cond}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">긴급도</label>
                  <span className={`font-medium ${urgencyConfig[selectedBuyer.urgency].color}`}>
                    {urgencyConfig[selectedBuyer.urgency].label}
                  </span>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    마지막 연락
                  </label>
                  <p className="font-medium">{getDaysAgo(selectedBuyer.lastContactDate)}</p>
                </div>
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">
                    다음 연락 예정
                  </label>
                  <p className="font-medium">
                    {selectedBuyer.nextContactDate
                      ? new Date(selectedBuyer.nextContactDate).toLocaleDateString()
                      : '-'}
                  </p>
                </div>
              </div>

              {selectedBuyer.memo && (
                <div>
                  <label className="text-xs text-muted-foreground mb-1 block">메모</label>
                  <p className="text-sm bg-muted/30 rounded p-2">{selectedBuyer.memo}</p>
                </div>
              )}

              {/* 매칭 매물 찾기 버튼 */}
              <div className="border-t pt-4">
                <Button className="w-full" variant="secondary">
                  <Search className="size-4 mr-2" />
                  조건에 맞는 매물 찾기
                </Button>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedBuyer(null)}>
              닫기
            </Button>
            <Button>
              <Save className="size-4 mr-2" />
              수정
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: '/buyers',
    component: BuyersPage,
    getParentRoute: () => parentRoute,
  })
