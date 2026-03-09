import { createRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import {
  contractsApi,
  propertiesApi,
  contactsApi,
  usersApi,
  dealsApi,
  contractTemplatesApi,
  commissionApi,
} from '@/api'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Plus,
  Search,
  FileSignature,
  Building2,
  User,
  Calendar,
  DollarSign,
  CheckCircle2,
  Clock,
  AlertCircle,
  Users,
  Calculator,
  FileText,
} from 'lucide-react'
import type { RootRoute } from '@tanstack/react-router'
import type { ContractStatus, TransactionType } from '@/types'

function ContractsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<ContractStatus | 'all'>('all')
  const [showCommissionCalc, setShowCommissionCalc] = useState(false)
  const [showTemplates, setShowTemplates] = useState(false)
  const [calcTransactionType, setCalcTransactionType] = useState<TransactionType>('sale')
  const [calcAmount, setCalcAmount] = useState<number>(0)
  const [calcMonthlyRent, setCalcMonthlyRent] = useState<number>(0)

  const { data: contracts = [], isLoading } = useQuery({
    queryKey: ['contracts'],
    queryFn: contractsApi.getAll,
  })

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: propertiesApi.getAll,
  })

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: contactsApi.getAll,
  })

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
  })

  const { data: deals = [] } = useQuery({
    queryKey: ['deals'],
    queryFn: dealsApi.getAll,
  })

  // 계약서 템플릿
  const { data: templates = [] } = useQuery({
    queryKey: ['contractTemplates'],
    queryFn: contractTemplatesApi.getAll,
  })

  // 수수료 계산 결과
  const { data: commissionResult } = useQuery({
    queryKey: ['commission', calcTransactionType, calcAmount, calcMonthlyRent],
    queryFn: () =>
      commissionApi.calculate(
        calcTransactionType,
        calcAmount * 10000, // 만원 단위를 원 단위로 변환
        calcMonthlyRent ? calcMonthlyRent * 10000 : undefined,
      ),
    enabled: calcAmount > 0,
  })

  // 계약 상태 한글 매핑 및 색상
  const statusConfig: Record<
    ContractStatus,
    { label: string; color: string; bgColor: string; icon: React.ReactNode }
  > = {
    draft: {
      label: '작성중',
      color: 'text-gray-700 dark:text-gray-300',
      bgColor: 'bg-gray-100 dark:bg-gray-900/30',
      icon: <Clock className="size-4" />,
    },
    signed: {
      label: '계약완료',
      color: 'text-blue-700 dark:text-blue-300',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
      icon: <FileSignature className="size-4" />,
    },
    depositPaid: {
      label: '계약금 입금',
      color: 'text-yellow-700 dark:text-yellow-300',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
      icon: <DollarSign className="size-4" />,
    },
    balancePaid: {
      label: '잔금 완료',
      color: 'text-purple-700 dark:text-purple-300',
      bgColor: 'bg-purple-100 dark:bg-purple-900/30',
      icon: <CheckCircle2 className="size-4" />,
    },
    registered: {
      label: '등기/전입 완료',
      color: 'text-green-700 dark:text-green-300',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
      icon: <CheckCircle2 className="size-4" />,
    },
    cancelled: {
      label: '해약',
      color: 'text-red-700 dark:text-red-300',
      bgColor: 'bg-red-100 dark:bg-red-900/30',
      icon: <AlertCircle className="size-4" />,
    },
  }

  // 거래 유형 한글 매핑
  const transactionTypeLabels: Record<TransactionType, string> = {
    sale: '매매',
    lease: '전세',
    monthly: '월세',
  }

  // 관련 정보 가져오기
  const getContractInfo = (contract: typeof contracts[0]) => {
    const property = properties.find((p) => p.id === contract.propertyId)
    const buyerContact = contacts.find((c) => c.id === contract.buyerContactId)
    const sellerContact = contacts.find((c) => c.id === contract.sellerContactId)
    const deal = deals.find((d) => d.id === contract.dealId)
    const assignedUser = users.find((u) => u.id === contract.assignedTo)

    return { property, buyerContact, sellerContact, deal, assignedUser }
  }

  // 검색 및 필터링
  const filteredContracts = contracts.filter((contract) => {
    const query = searchQuery.toLowerCase()
    const info = getContractInfo(contract)

    // 상태 필터
    if (statusFilter !== 'all' && contract.status !== statusFilter) {
      return false
    }

    // 검색어 필터
    if (!query) return true

    return (
      info.property?.ownerName.toLowerCase().includes(query) ||
      info.buyerContact?.name.toLowerCase().includes(query) ||
      info.sellerContact?.name.toLowerCase().includes(query) ||
      contract.notes?.toLowerCase().includes(query)
    )
  })

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
  const completedContracts = contracts.filter((c) =>
    ['balancePaid', 'registered'].includes(c.status),
  )
  const totalCommission = completedContracts.reduce(
    (sum, c) => sum + (c.commission || 0),
    0,
  )
  const pendingContracts = contracts.filter((c) =>
    ['draft', 'signed', 'depositPaid'].includes(c.status),
  )

  // 잔금일 임박 계약 (30일 이내)
  const upcomingBalanceContracts = contracts.filter((c) => {
    if (!c.balanceDate || c.balancePaidAt) return false
    const now = new Date()
    const balanceDate = new Date(c.balanceDate)
    const diffDays = Math.ceil(
      (balanceDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
    )
    return diffDays >= 0 && diffDays <= 30
  })

  // 파이프라인 단계들
  const pipelineStatuses: ContractStatus[] = [
    'draft',
    'signed',
    'depositPaid',
    'balancePaid',
    'registered',
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <FileSignature className="size-7" />
            계약서 관리
          </h1>
          <p className="text-muted-foreground mt-1">
            계약서 작성부터 잔금/등기 완료까지 관리합니다
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowCommissionCalc(true)}>
            <Calculator className="size-4 mr-2" />
            수수료 계산기
          </Button>
          <Button variant="outline" onClick={() => setShowTemplates(true)}>
            <FileText className="size-4 mr-2" />
            계약서 템플릿
          </Button>
          <Button disabled>
            <Plus className="size-4 mr-2" />
            계약서 추가
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">전체 계약</div>
          <div className="text-2xl font-bold mt-1">{contracts.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">진행 중</div>
          <div className="text-2xl font-bold mt-1">{pendingContracts.length}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground flex items-center gap-1">
            <AlertCircle className="size-3" />
            잔금일 임박 (30일)
          </div>
          <div className="text-2xl font-bold mt-1 text-yellow-600">
            {upcomingBalanceContracts.length}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">총 수수료</div>
          <div className="text-2xl font-bold mt-1 flex items-center gap-1">
            <DollarSign className="size-5" />
            {(totalCommission / 10000).toFixed(0)}만
          </div>
        </Card>
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="매물명, 매수인, 매도인으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={statusFilter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter('all')}
            >
              전체
            </Button>
            {pipelineStatuses.map((status) => (
              <Button
                key={status}
                variant={statusFilter === status ? 'default' : 'outline'}
                size="sm"
                onClick={() => setStatusFilter(status)}
              >
                {statusConfig[status].label}
              </Button>
            ))}
          </div>
        </div>
      </Card>

      {/* Contracts List */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">로딩 중...</p>
        </div>
      ) : filteredContracts.length === 0 ? (
        <Card className="p-12 text-center">
          <FileSignature className="size-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold">계약서가 없습니다</h3>
          <p className="text-muted-foreground mt-1">
            {searchQuery || statusFilter !== 'all'
              ? '검색 조건에 맞는 계약서가 없습니다'
              : '거래가 본계약 단계로 진행되면 계약서가 생성됩니다'}
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredContracts.map((contract) => {
            const info = getContractInfo(contract)
            const config = statusConfig[contract.status]

            return (
              <Card
                key={contract.id}
                className="p-5 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="flex items-start gap-6">
                  {/* 매물 정보 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3 mb-3">
                      <Building2 className="size-5 text-muted-foreground mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-lg">
                          {info.property
                            ? `${info.property.ownerName} (${info.property.unitType || info.property.type})`
                            : '매물 정보 없음'}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">
                            {transactionTypeLabels[contract.transactionType]}
                          </Badge>
                          <Badge className={`${config.bgColor} ${config.color} border-0`}>
                            {config.icon}
                            <span className="ml-1">{config.label}</span>
                          </Badge>
                          {contract.isJointBrokerage && (
                            <Badge variant="secondary">
                              <Users className="size-3 mr-1" />
                              공동중개
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* 당사자 정보 */}
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="size-4 text-blue-500" />
                        <span className="text-muted-foreground">매수인:</span>
                        <span className="font-medium">
                          {info.buyerContact?.name || '-'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="size-4 text-green-500" />
                        <span className="text-muted-foreground">매도인:</span>
                        <span className="font-medium">
                          {info.sellerContact?.name || '-'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* 금액 정보 */}
                  <div className="text-right space-y-2 min-w-[200px]">
                    <div>
                      <div className="text-sm text-muted-foreground">거래금액</div>
                      <div className="text-xl font-bold text-primary">
                        {formatPrice(contract.totalPrice)}
                      </div>
                      {contract.monthlyRent && (
                        <div className="text-sm text-muted-foreground">
                          월세 {formatPrice(contract.monthlyRent)}
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      수수료: {formatPrice(contract.commission)}
                    </div>
                  </div>

                  {/* 일정 정보 */}
                  <div className="space-y-2 text-sm min-w-[160px]">
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4 text-muted-foreground" />
                      <span className="text-muted-foreground">계약일:</span>
                      <span>{formatDate(contract.contractDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="size-4 text-muted-foreground" />
                      <span className="text-muted-foreground">잔금일:</span>
                      <span
                        className={
                          upcomingBalanceContracts.includes(contract)
                            ? 'text-yellow-600 font-medium'
                            : ''
                        }
                      >
                        {formatDate(contract.balanceDate)}
                      </span>
                    </div>
                    {contract.moveInDate && (
                      <div className="flex items-center gap-2">
                        <Calendar className="size-4 text-muted-foreground" />
                        <span className="text-muted-foreground">입주일:</span>
                        <span>{formatDate(contract.moveInDate)}</span>
                      </div>
                    )}
                  </div>

                  {/* 담당자 */}
                  <div className="flex items-center gap-2">
                    <Avatar className="size-8">
                      <AvatarFallback className="text-xs">
                        {info.assignedUser?.name?.[0] || '?'}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm text-muted-foreground">
                      {info.assignedUser?.name || '미지정'}
                    </span>
                  </div>
                </div>

                {/* 금액 상세 (확장) */}
                <div className="mt-4 pt-4 border-t grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">계약금</div>
                    <div className="font-medium">{formatPrice(contract.depositAmount)}</div>
                    {contract.depositPaidAt && (
                      <div className="text-xs text-green-600">
                        입금 {formatDate(contract.depositPaidAt)}
                      </div>
                    )}
                  </div>
                  {contract.middlePayment && (
                    <div>
                      <div className="text-muted-foreground">중도금</div>
                      <div className="font-medium">
                        {formatPrice(contract.middlePayment)}
                      </div>
                      {contract.middlePaymentPaidAt && (
                        <div className="text-xs text-green-600">
                          입금 {formatDate(contract.middlePaymentPaidAt)}
                        </div>
                      )}
                    </div>
                  )}
                  <div>
                    <div className="text-muted-foreground">잔금</div>
                    <div className="font-medium">{formatPrice(contract.balanceAmount)}</div>
                    {contract.balancePaidAt && (
                      <div className="text-xs text-green-600">
                        입금 {formatDate(contract.balancePaidAt)}
                      </div>
                    )}
                  </div>
                  {contract.leaseStartDate && contract.leaseEndDate && (
                    <div>
                      <div className="text-muted-foreground">임대 기간</div>
                      <div className="font-medium">
                        {formatDate(contract.leaseStartDate)} ~{' '}
                        {formatDate(contract.leaseEndDate)}
                      </div>
                    </div>
                  )}
                </div>

                {/* 특약 사항 */}
                {contract.specialTerms && (
                  <div className="mt-3 p-3 bg-muted/50 rounded-md text-sm">
                    <span className="text-muted-foreground">특약: </span>
                    {contract.specialTerms}
                  </div>
                )}

                {/* 공동중개 정보 */}
                {contract.isJointBrokerage && contract.partnerBrokerName && (
                  <div className="mt-3 text-sm text-muted-foreground">
                    공동중개: {contract.partnerBrokerName} ({contract.partnerBrokerPhone})
                    {contract.partnerCommission && (
                      <span className="ml-2">
                        - 수수료 {formatPrice(contract.partnerCommission)}
                      </span>
                    )}
                  </div>
                )}
              </Card>
            )
          })}
        </div>
      )}

      {/* Cancelled Contracts Section */}
      {contracts.filter((c) => c.status === 'cancelled').length > 0 && statusFilter === 'all' && (
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <AlertCircle className="size-5 text-red-500" />
            해약된 계약
          </h3>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {contracts
              .filter((c) => c.status === 'cancelled')
              .map((contract) => {
                const info = getContractInfo(contract)

                return (
                  <Card key={contract.id} className="p-4 opacity-60">
                    <div className="space-y-2">
                      <div className="flex items-start justify-between">
                        <h4 className="font-medium text-sm line-clamp-1">
                          {info.property
                            ? `${info.property.ownerName} (${info.property.unitType || info.property.type})`
                            : '매물 정보 없음'}
                        </h4>
                        <Badge className="bg-red-100 text-red-700 border-0 text-xs">
                          해약
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {info.buyerContact?.name || '-'} / {info.sellerContact?.name || '-'}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatPrice(contract.totalPrice)}
                      </div>
                    </div>
                  </Card>
                )
              })}
          </div>
        </div>
      )}

      {/* 수수료 계산기 모달 */}
      <Dialog open={showCommissionCalc} onOpenChange={setShowCommissionCalc}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calculator className="size-5" />
              중개수수료 계산기
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {/* 거래 유형 선택 */}
            <div>
              <label className="text-sm font-medium mb-2 block">거래 유형</label>
              <div className="flex gap-2">
                {(['sale', 'lease', 'monthly'] as TransactionType[]).map((type) => (
                  <Button
                    key={type}
                    variant={calcTransactionType === type ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setCalcTransactionType(type)}
                  >
                    {transactionTypeLabels[type]}
                  </Button>
                ))}
              </div>
            </div>

            {/* 금액 입력 */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                {calcTransactionType === 'sale' ? '매매가 (만원)' : '보증금 (만원)'}
              </label>
              <Input
                type="number"
                placeholder="예: 50000 (5억)"
                value={calcAmount || ''}
                onChange={(e) => setCalcAmount(Number(e.target.value))}
              />
            </div>

            {/* 월세 입력 (월세일 경우만) */}
            {calcTransactionType === 'monthly' && (
              <div>
                <label className="text-sm font-medium mb-2 block">월세 (만원)</label>
                <Input
                  type="number"
                  placeholder="예: 100"
                  value={calcMonthlyRent || ''}
                  onChange={(e) => setCalcMonthlyRent(Number(e.target.value))}
                />
              </div>
            )}

            {/* 계산 결과 */}
            {commissionResult && calcAmount > 0 && (
              <div className="p-4 bg-muted rounded-lg space-y-3">
                <div className="text-sm text-muted-foreground">계산 결과</div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">적용 요율</span>
                    <span className="font-medium">{commissionResult.rate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">매수인 부담</span>
                    <span className="font-medium">{formatPrice(commissionResult.buyerFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">매도인 부담</span>
                    <span className="font-medium">{formatPrice(commissionResult.sellerFee)}</span>
                  </div>
                  <div className="border-t pt-2 flex justify-between">
                    <span className="font-medium">총 수수료</span>
                    <span className="font-bold text-primary">{formatPrice(commissionResult.totalFee)}</span>
                  </div>
                  {commissionResult.vatAmount && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">부가세 (10%)</span>
                      <span>{formatPrice(commissionResult.vatAmount)}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 요율표 안내 */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p className="font-medium">※ 법정 중개수수료 상한 요율 (2021년 개정)</p>
              <p>매매: 5천만↓ 0.6%, 2억↓ 0.5%, 6억↓ 0.4%, 9억↓ 0.5%</p>
              <p>임대: 5천만↓ 0.5%, 1억↓ 0.4%, 6억↓ 0.3%</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 계약서 템플릿 모달 */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="size-5" />
              계약서 템플릿
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {templates.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                등록된 템플릿이 없습니다
              </div>
            ) : (
              templates.map((template) => (
                <Card key={template.id} className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-medium flex items-center gap-2">
                        {template.name}
                        {template.isDefault && (
                          <Badge variant="secondary" className="text-xs">기본</Badge>
                        )}
                      </h4>
                      <Badge variant="outline" className="mt-1 text-xs">
                        {transactionTypeLabels[template.transactionType]}
                      </Badge>
                    </div>
                    <Button size="sm" variant="outline">
                      미리보기
                    </Button>
                  </div>
                  <div className="bg-muted/50 p-3 rounded text-xs font-mono whitespace-pre-wrap max-h-[200px] overflow-y-auto">
                    {template.content.substring(0, 500)}
                    {template.content.length > 500 && '...'}
                  </div>
                </Card>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: '/contracts',
    component: ContractsPage,
    getParentRoute: () => parentRoute,
  })
