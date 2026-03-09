import { createRoute, type AnyRoute } from '@tanstack/react-router'
import { useEffect, useState } from 'react'
import {
  Link2,
  Search,
  Filter,
  Plus,
  MoreVertical,
  Eye,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  User,
  Building2,
  ChevronRight,
  ChevronDown,
  GitBranch,
  MessageSquare,
  Pencil,
  Save,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'
import { matchesApi, buyerRequirementsApi, propertiesApi, contactsApi } from '@/api'
import type { Match, MatchStage, BuyerRequirement, Property, Contact } from '@/types'

// 단계 라벨 및 색상 (구매자관심/판매자동의는 단계가 아니라 체크포인트)
// 방문 단계는 viewingDate(예정)와 viewedAt(완료)로 상태 구분
const stageConfig: Record<MatchStage, { label: string; color: string; bgColor: string }> = {
  suggested: { label: '추천됨', color: 'text-gray-600', bgColor: 'bg-gray-100' },
  buyerContacted: { label: '구매자 관심', color: 'text-blue-600', bgColor: 'bg-blue-100' },
  viewing: { label: '방문', color: 'text-purple-600', bgColor: 'bg-purple-100' },
  ownerContacted: { label: '판매자 동의', color: 'text-orange-600', bgColor: 'bg-orange-100' },
  negotiating: { label: '조건 협의', color: 'text-yellow-600', bgColor: 'bg-yellow-100' },
  dealCreated: { label: '거래 전환', color: 'text-green-600', bgColor: 'bg-green-100' },
  closed: { label: '종료', color: 'text-red-600', bgColor: 'bg-red-100' },
}

// 단계 순서 반환
function getStageOrder(stage: MatchStage): number {
  const order: Record<MatchStage, number> = {
    suggested: 0,
    buyerContacted: 1,
    viewing: 2,
    ownerContacted: 3,
    negotiating: 4,
    dealCreated: 5,
    closed: -1,
  }
  return order[stage]
}

// 칸반 보드 단계 (5단계 파이프라인)
// 방문 단계는 viewingDate(예정)/viewedAt(완료)로 상태 구분
const kanbanStages: MatchStage[] = [
  'suggested',
  'buyerContacted',
  'viewing',
  'ownerContacted',
  'negotiating',
]

// 금액 포맷팅
function formatPrice(price: number): string {
  if (price >= 100000000) {
    const uk = Math.floor(price / 100000000)
    const man = Math.floor((price % 100000000) / 10000)
    return man > 0 ? `${uk}억 ${man.toLocaleString()}만` : `${uk}억`
  } else if (price >= 10000) {
    return `${Math.floor(price / 10000).toLocaleString()}만`
  }
  return price.toLocaleString()
}

// 관심도 아이콘
function InterestIcon({ interest }: { interest?: 'interested' | 'notInterested' | 'pending' }) {
  if (interest === 'interested') {
    return <CheckCircle className="size-4 text-green-500" />
  }
  if (interest === 'notInterested') {
    return <XCircle className="size-4 text-red-500" />
  }
  return <Clock className="size-4 text-gray-400" />
}

// 매칭 카드 컴포넌트
function MatchCard({
  match,
  property,
  buyerContact,
  onStageChange,
  onDoubleClick,
}: {
  match: Match
  property?: Property
  buyerContact?: Contact
  onStageChange: (matchId: string, newStage: MatchStage) => void
  onDoubleClick?: () => void
}) {
  return (
    <Card
      className="mb-3 hover:shadow-md transition-shadow cursor-pointer"
      onDoubleClick={onDoubleClick}
      title="더블클릭하여 상세보기"
    >
      <CardContent className="p-4">
        {/* 구매자 정보 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <User className="size-4 text-muted-foreground" />
            <span className="font-medium text-sm">
              {buyerContact?.name || '알 수 없음'}
            </span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon-sm">
                <MoreVertical className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Phone className="size-4 mr-2" />
                구매자 연락
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Calendar className="size-4 mr-2" />
                방문 예약
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Eye className="size-4 mr-2" />
                상세 보기
              </DropdownMenuItem>
              {match.stage !== 'dealCreated' && match.stage !== 'closed' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-green-600"
                    onClick={() => onStageChange(match.id, 'dealCreated')}
                  >
                    <CheckCircle className="size-4 mr-2" />
                    거래로 전환
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => onStageChange(match.id, 'closed')}
                  >
                    <XCircle className="size-4 mr-2" />
                    종료
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* 매물 정보 */}
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="size-4 text-muted-foreground" />
          <span className="text-sm truncate">
            {property ? (property.unitType || '매물') : '매물 정보 없음'}
          </span>
        </div>

        {/* 가격 */}
        {property && (
          <div className="text-sm font-semibold text-primary mb-3">
            {formatPrice(property.price)}
            {property.monthlyRent && ` / ${formatPrice(property.monthlyRent)}`}
          </div>
        )}

        {/* 상태 표시 */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* 구매자 반응 */}
          {match.buyerInterest && (
            <div className="flex items-center gap-1 text-xs">
              <InterestIcon interest={match.buyerInterest} />
              <span>구매자</span>
            </div>
          )}

          {/* 방문 여부 */}
          {match.viewedAt && (
            <Badge variant="outline" className="text-xs">
              방문완료
            </Badge>
          )}

          {/* 방문 예정 */}
          {match.viewingDate && !match.viewedAt && (
            <Badge variant="outline" className="text-xs bg-purple-50">
              {new Date(match.viewingDate).toLocaleDateString('ko-KR', {
                month: 'short',
                day: 'numeric',
              })} 방문
            </Badge>
          )}

          {/* 판매자 반응 */}
          {match.ownerContacted && (
            <div className="flex items-center gap-1 text-xs">
              <InterestIcon interest={match.ownerResponse} />
              <span>판매자</span>
            </div>
          )}
        </div>

        {/* 메모 */}
        {(match.buyerNote || match.viewingNote) && (
          <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
            {match.buyerNote || match.viewingNote}
          </p>
        )}
      </CardContent>
    </Card>
  )
}

// 칸반 컬럼
function KanbanColumn({
  stage,
  matches,
  buyerReqs,
  properties,
  contacts,
  onStageChange,
  onMatchSelect,
}: {
  stage: MatchStage
  matches: Match[]
  buyerReqs: BuyerRequirement[]
  properties: Property[]
  contacts: Contact[]
  onStageChange: (matchId: string, newStage: MatchStage) => void
  onMatchSelect: (match: Match) => void
}) {
  const config = stageConfig[stage]
  const stageMatches = matches.filter((m) => m.stage === stage)

  return (
    <div className="flex-shrink-0 w-72">
      <div className={cn('rounded-t-lg px-3 py-2', config.bgColor)}>
        <div className="flex items-center justify-between">
          <span className={cn('font-medium text-sm', config.color)}>
            {config.label}
          </span>
          <Badge variant="secondary" className="text-xs">
            {stageMatches.length}
          </Badge>
        </div>
      </div>
      <div className="bg-muted/30 rounded-b-lg p-2 min-h-[calc(100vh-280px)] max-h-[calc(100vh-280px)] overflow-y-auto">
        {stageMatches.map((match) => {
          const buyerReq = buyerReqs.find((r) => r.id === match.buyerReqId)
          const property = properties.find((p) => p.id === match.propertyId)
          const buyerContact = buyerReq
            ? contacts.find((c) => c.id === buyerReq.contactId)
            : undefined

          return (
            <MatchCard
              key={match.id}
              match={match}
              property={property}
              buyerContact={buyerContact}
              onStageChange={onStageChange}
              onDoubleClick={() => onMatchSelect(match)}
            />
          )
        })}
        {stageMatches.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8">
            매칭 없음
          </div>
        )}
      </div>
    </div>
  )
}

// 리스트 뷰 행
function MatchListRow({
  match,
  property,
  buyerContact,
  onDoubleClick,
}: {
  match: Match
  property?: Property
  buyerContact?: Contact
  onDoubleClick?: () => void
}) {
  const stageInfo = stageConfig[match.stage]

  return (
    <tr className="hover:bg-muted/50 cursor-pointer" onDoubleClick={onDoubleClick} title="더블클릭하여 상세보기">
      <td className="p-3">
        <Badge className={cn('text-xs', stageInfo.bgColor, stageInfo.color)}>
          {stageInfo.label}
        </Badge>
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          <User className="size-4 text-muted-foreground" />
          <span className="font-medium">{buyerContact?.name || '-'}</span>
        </div>
        {buyerContact?.phone && (
          <span className="text-xs text-muted-foreground">{buyerContact.phone}</span>
        )}
      </td>
      <td className="p-3">
        {property ? (
          <div>
            <span className="font-medium">
              {property.unitType || '매물'}
            </span>
            <div className="text-xs text-muted-foreground">
              {formatPrice(property.price)}
              {property.monthlyRent && ` / ${formatPrice(property.monthlyRent)}`}
            </div>
          </div>
        ) : (
          '-'
        )}
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          <InterestIcon interest={match.buyerInterest} />
          <span className="text-sm">
            {match.buyerInterest === 'interested'
              ? '관심'
              : match.buyerInterest === 'notInterested'
                ? '무관심'
                : '대기'}
          </span>
        </div>
      </td>
      <td className="p-3">
        {match.viewingDate ? (
          <div className="text-sm">
            {new Date(match.viewingDate).toLocaleDateString('ko-KR')}
            {match.viewedAt && (
              <Badge variant="outline" className="ml-2 text-xs">
                완료
              </Badge>
            )}
          </div>
        ) : (
          '-'
        )}
      </td>
      <td className="p-3">
        <div className="flex items-center gap-2">
          {match.ownerContacted ? (
            <>
              <InterestIcon interest={match.ownerResponse} />
              <span className="text-sm">
                {match.ownerResponse === 'interested'
                  ? '동의'
                  : match.ownerResponse === 'notInterested'
                    ? '거절'
                    : '대기'}
              </span>
            </>
          ) : (
            <span className="text-sm text-muted-foreground">미연락</span>
          )}
        </div>
      </td>
      <td className="p-3">
        <Button variant="ghost" size="icon-sm">
          <MoreVertical className="size-4" />
        </Button>
      </td>
    </tr>
  )
}

// 스테이지별 드롭다운 옵션 정의
type StageOption = {
  label: string
  action: 'progress' | 'close'  // progress: 다음 단계로, close: 종료
  interest?: 'interested' | 'notInterested'  // 관심 여부
}

const stageOptions: Partial<Record<MatchStage, StageOption[]>> = {
  suggested: [
    { label: '추천 완료', action: 'progress' },
  ],
  buyerContacted: [
    { label: '관심 있음 → 방문 진행', action: 'progress', interest: 'interested' },
    { label: '관심 없음 → 종료', action: 'close', interest: 'notInterested' },
  ],
  viewing: [
    { label: '방문 완료 → 판매자 협의', action: 'progress', interest: 'interested' },
    { label: '방문 후 관심 없음 → 종료', action: 'close', interest: 'notInterested' },
  ],
  ownerContacted: [
    { label: '판매자 동의 → 조건 협의', action: 'progress', interest: 'interested' },
    { label: '판매자 거절 → 종료', action: 'close', interest: 'notInterested' },
  ],
  negotiating: [
    { label: '협의 완료 → 거래 전환', action: 'progress' },
    { label: '협의 결렬 → 종료', action: 'close' },
  ],
  dealCreated: [
    { label: '거래 완료', action: 'progress' },
  ],
}

// 진행 상태 노드 컴포넌트
function ProgressNode({
  label,
  status,
  isLast,
  stage,
  onOptionSelect,
  onStageClick,
}: {
  label: string
  status: 'completed' | 'current' | 'pending' | 'failed' | 'soldToOthers'
  isLast?: boolean
  stage: MatchStage
  onOptionSelect?: (option: StageOption) => void
  onStageClick?: () => void  // 현재가 아닌 노드 클릭 시 해당 단계로 이동
}) {
  const statusStyles = {
    completed: 'bg-green-500 border-green-500 text-white',
    current: 'bg-blue-500 border-blue-500 text-white animate-pulse',
    pending: 'bg-gray-200 border-gray-300 text-gray-500',
    failed: 'bg-red-500 border-red-500 text-white',
    soldToOthers: 'bg-orange-500 border-orange-500 text-white',  // 매물이 다른 사람에게 거래됨
  }

  const lineStyles = {
    completed: 'bg-green-500',
    current: 'bg-blue-300',
    pending: 'bg-gray-300',
    failed: 'bg-red-300',
    soldToOthers: 'bg-orange-300',
  }

  const options = stageOptions[stage]

  // 실패/타인거래 상태면 클릭 불가
  if (status === 'failed' || status === 'soldToOthers') {
    return (
      <div className="flex items-center">
        <div
          className={cn(
            'px-2 py-1 rounded text-xs font-medium border whitespace-nowrap',
            statusStyles[status],
          )}
        >
          {label}
        </div>
        {!isLast && (
          <div className={cn('w-4 h-0.5', lineStyles[status])} />
        )}
      </div>
    )
  }

  // 현재 상태가 아닌 경우: 클릭하면 해당 단계로 바로 이동
  if (status !== 'current') {
    return (
      <div className="flex items-center">
        <button
          onClick={(e) => {
            e.stopPropagation()
            onStageClick?.()
          }}
          className={cn(
            'px-2 py-1 rounded text-xs font-medium border whitespace-nowrap transition-all',
            'hover:ring-2 hover:ring-offset-1 hover:ring-primary/50 hover:scale-105',
            statusStyles[status],
          )}
          title={`${label} 단계로 변경`}
        >
          {label}
        </button>
        {!isLast && (
          <div className={cn('w-4 h-0.5', lineStyles[status])} />
        )}
      </div>
    )
  }

  // 현재 상태: 드롭다운 옵션 표시
  // 옵션이 없으면 클릭 불가
  if (!options) {
    return (
      <div className="flex items-center">
        <div
          className={cn(
            'px-2 py-1 rounded text-xs font-medium border whitespace-nowrap',
            statusStyles[status],
          )}
        >
          {label}
        </div>
        {!isLast && (
          <div className={cn('w-4 h-0.5', lineStyles[status])} />
        )}
      </div>
    )
  }

  return (
    <div className="flex items-center">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            onClick={(e) => e.stopPropagation()}
            className={cn(
              'px-2 py-1 rounded text-xs font-medium border whitespace-nowrap transition-all',
              'hover:ring-2 hover:ring-offset-1 hover:ring-primary/50 hover:scale-105',
              statusStyles[status],
            )}
          >
            {label}
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
          {options.map((option, idx) => (
            <DropdownMenuItem
              key={idx}
              onClick={() => onOptionSelect?.(option)}
              className={cn(
                option.action === 'close' && 'text-red-600 focus:text-red-600',
                option.action === 'progress' && option.interest === 'interested' && 'text-green-600 focus:text-green-600',
              )}
            >
              {option.action === 'progress' ? (
                <CheckCircle className="size-4 mr-2" />
              ) : (
                <XCircle className="size-4 mr-2" />
              )}
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      {!isLast && (
        <div className={cn('w-4 h-0.5', lineStyles[status])} />
      )}
    </div>
  )
}

// 매물별 진행 파이프라인
function MatchProgressLine({
  match,
  property,
  onDoubleClick,
  onOptionSelect,
  onStageChange,
}: {
  match: Match
  property?: Property
  onDoubleClick?: () => void
  onOptionSelect?: (matchId: string, stage: MatchStage, option: StageOption) => void
  onStageChange?: (matchId: string, newStage: MatchStage) => void
}) {
  // 매물이 다른 사람에게 거래됨 (contracted 상태이고 이 매칭이 dealCreated가 아닌 경우)
  const isPropertySoldToOthers = property?.status === 'contracted' && match.stage !== 'dealCreated'

  // 진행 상태 결정 (상세 모달과 동일한 로직)
  const getNodeStatus = (
    nodeStage: MatchStage,
  ): 'completed' | 'current' | 'pending' | 'failed' | 'soldToOthers' => {
    const currentOrder = getStageOrder(match.stage)
    const nodeOrder = getStageOrder(nodeStage)

    // 매물이 다른 사람에게 거래된 경우
    if (isPropertySoldToOthers) {
      if (nodeOrder < currentOrder) return 'completed'
      if (nodeOrder === currentOrder) return 'soldToOthers'
      return 'pending'
    }

    // 종료된 경우
    if (match.stage === 'closed') {
      if (match.buyerInterest === 'notInterested') return nodeOrder <= 1 ? 'failed' : 'pending'
      if (match.viewingFeedback === 'notInterested') return nodeOrder <= 2 ? 'failed' : 'pending'
      if (match.ownerResponse === 'notInterested') return nodeOrder <= 3 ? 'failed' : 'pending'
      return 'failed'
    }

    if (nodeOrder < currentOrder) return 'completed'
    if (nodeOrder === currentOrder) return 'current'
    return 'pending'
  }

  return (
    <div className="flex items-center gap-1 py-2 cursor-pointer hover:bg-muted/50 rounded" onDoubleClick={onDoubleClick} title="더블클릭하여 상세보기">
      {/* 매물 정보 */}
      <div className="w-48 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Building2 className="size-4 text-muted-foreground" />
          <div className="min-w-0">
            <div className={cn(
              "text-sm font-medium truncate",
              isPropertySoldToOthers && "text-orange-600"
            )}>
              {property ? (property.unitType || '매물') : '매물 없음'}
              {isPropertySoldToOthers && <span className="text-xs ml-1">(거래완료)</span>}
            </div>
            {property && (
              <div className="text-xs text-muted-foreground">
                {formatPrice(property.price)}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 진행 파이프라인 - stageConfig와 일치 */}
      <div className="flex items-center flex-1 overflow-x-auto">
        <ProgressNode
          label={stageConfig.suggested.label}
          status={getNodeStatus('suggested')}
          stage="suggested"
          onOptionSelect={(option) => onOptionSelect?.(match.id, 'suggested', option)}
          onStageClick={() => onStageChange?.(match.id, 'suggested')}
        />
        <ProgressNode
          label={stageConfig.buyerContacted.label}
          status={getNodeStatus('buyerContacted')}
          stage="buyerContacted"
          onOptionSelect={(option) => onOptionSelect?.(match.id, 'buyerContacted', option)}
          onStageClick={() => onStageChange?.(match.id, 'buyerContacted')}
        />
        <ProgressNode
          label={stageConfig.viewing.label}
          status={getNodeStatus('viewing')}
          stage="viewing"
          onOptionSelect={(option) => onOptionSelect?.(match.id, 'viewing', option)}
          onStageClick={() => onStageChange?.(match.id, 'viewing')}
        />
        <ProgressNode
          label={stageConfig.ownerContacted.label}
          status={getNodeStatus('ownerContacted')}
          stage="ownerContacted"
          onOptionSelect={(option) => onOptionSelect?.(match.id, 'ownerContacted', option)}
          onStageClick={() => onStageChange?.(match.id, 'ownerContacted')}
        />
        <ProgressNode
          label={stageConfig.negotiating.label}
          status={getNodeStatus('negotiating')}
          stage="negotiating"
          onOptionSelect={(option) => onOptionSelect?.(match.id, 'negotiating', option)}
          onStageClick={() => onStageChange?.(match.id, 'negotiating')}
        />
        <ProgressNode
          label={stageConfig.dealCreated.label}
          status={getNodeStatus('dealCreated')}
          stage="dealCreated"
          isLast
          onOptionSelect={(option) => onOptionSelect?.(match.id, 'dealCreated', option)}
          onStageClick={() => onStageChange?.(match.id, 'dealCreated')}
        />
      </div>
    </div>
  )
}

// 구매고객별 매칭 다이어그램
function BuyerMatchDiagram({
  buyerReq,
  buyerContact,
  matches,
  properties,
  onMatchSelect,
  onOptionSelect,
  onStageChange,
}: {
  buyerReq: BuyerRequirement
  buyerContact?: Contact
  matches: Match[]
  properties: Property[]
  onMatchSelect: (match: Match) => void
  onOptionSelect: (matchId: string, stage: MatchStage, option: StageOption) => void
  onStageChange: (matchId: string, newStage: MatchStage) => void
}) {
  const [expanded, setExpanded] = useState(true)
  const buyerMatches = matches.filter((m) => m.buyerReqId === buyerReq.id)

  // 매칭 상태별 정렬: 진행중 > 거래전환 > 종료
  const sortedMatches = [...buyerMatches].sort((a, b) => {
    const order: Record<MatchStage, number> = {
      negotiating: 0,
      ownerContacted: 1,
      viewing: 2,
      buyerContacted: 3,
      suggested: 4,
      dealCreated: 5,
      closed: 6,
    }
    return order[a.stage] - order[b.stage]
  })

  const activeCount = buyerMatches.filter((m) => !['closed', 'dealCreated'].includes(m.stage)).length
  const dealCount = buyerMatches.filter((m) => m.stage === 'dealCreated').length
  const closedCount = buyerMatches.filter((m) => m.stage === 'closed').length

  if (buyerMatches.length === 0) return null

  return (
    <Card className="mb-4">
      <CardContent className="p-4">
        {/* 구매고객 헤더 */}
        <div
          className="flex items-center gap-3 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <Button variant="ghost" size="icon-sm" className="shrink-0">
            {expanded ? (
              <ChevronDown className="size-4" />
            ) : (
              <ChevronRight className="size-4" />
            )}
          </Button>

          <div className="flex items-center gap-2 min-w-0">
            <User className="size-5 text-primary shrink-0" />
            <div>
              <span className="font-semibold text-lg">{buyerContact?.name || '알 수 없음'}</span>
              {buyerContact?.phone && (
                <span className="text-sm text-muted-foreground ml-2">{buyerContact.phone}</span>
              )}
            </div>
          </div>

          {/* 요약 뱃지 */}
          <div className="flex items-center gap-2 ml-auto">
            <Badge variant="secondary" className="text-xs">
              매칭 {buyerMatches.length}
            </Badge>
            {activeCount > 0 && (
              <Badge className="bg-blue-100 text-blue-700 text-xs">
                진행중 {activeCount}
              </Badge>
            )}
            {dealCount > 0 && (
              <Badge className="bg-green-100 text-green-700 text-xs">
                거래 {dealCount}
              </Badge>
            )}
            {closedCount > 0 && (
              <Badge variant="outline" className="text-xs text-muted-foreground">
                종료 {closedCount}
              </Badge>
            )}
          </div>
        </div>

        {/* 희망 조건 요약 */}
        {expanded && (
          <div className="ml-9 mt-2 mb-3 text-sm text-muted-foreground">
            {buyerReq.areas?.join(', ')} | {buyerReq.propertyTypes?.map((t) =>
              t === 'apartment' ? '아파트' : t === 'officetel' ? '오피스텔' : t === 'villa' ? '빌라' : t
            ).join(', ')} |
            {buyerReq.budgetMin && buyerReq.budgetMax && (
              <> {formatPrice(buyerReq.budgetMin)} ~ {formatPrice(buyerReq.budgetMax)}</>
            )}
          </div>
        )}

        {/* 매칭 파이프라인들 */}
        {expanded && (
          <div className="ml-6 border-l-2 border-gray-200 pl-4 mt-3">
            {sortedMatches.map((match, index) => {
              const property = properties.find((p) => p.id === match.propertyId)
              const isLast = index === sortedMatches.length - 1

              return (
                <div key={match.id} className="relative">
                  {/* 브랜치 연결선 */}
                  <div className="absolute -left-4 top-4 w-4 h-0.5 bg-gray-200" />
                  {!isLast && (
                    <div className="absolute -left-4 top-4 bottom-0 w-0.5 bg-gray-200" />
                  )}

                  <MatchProgressLine match={match} property={property} onDoubleClick={() => onMatchSelect(match)} onOptionSelect={onOptionSelect} onStageChange={onStageChange} />
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default function MatchesRoute(parentRoute: AnyRoute) {
  return createRoute({
    getParentRoute: () => parentRoute,
    path: '/matches',
    component: MatchesPage,
  })
}

function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [buyerReqs, setBuyerReqs] = useState<BuyerRequirement[]>([])
  const [properties, setProperties] = useState<Property[]>([])
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'buyer'>('buyer')
  const [filterStage, setFilterStage] = useState<string>('all')
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
  const [editingNotes, setEditingNotes] = useState(false)
  const [noteForm, setNoteForm] = useState({
    buyerNote: '',
    viewingNote: '',
    ownerNote: '',
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [matchesData, buyerReqsData, propertiesData, contactsData] = await Promise.all([
          matchesApi.getAll(),
          buyerRequirementsApi.getAll(),
          propertiesApi.getAll(),
          contactsApi.getAll(),
        ])
        setMatches(matchesData)
        setBuyerReqs(buyerReqsData)
        setProperties(propertiesData)
        setContacts(contactsData)
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // 스테이지 옵션 선택 핸들러
  const handleOptionSelect = async (matchId: string, currentStage: MatchStage, option: StageOption) => {
    try {
      const match = matches.find((m) => m.id === matchId)
      if (!match) return

      let updates: Partial<Match> = {}

      if (option.action === 'close') {
        // 종료 처리
        updates.stage = 'closed'
        // 어느 단계에서 종료되었는지 기록
        if (currentStage === 'buyerContacted') {
          updates.buyerInterest = 'notInterested'
        } else if (currentStage === 'viewing') {
          updates.viewingFeedback = 'notInterested'
        } else if (currentStage === 'ownerContacted') {
          updates.ownerResponse = 'notInterested'
        }
      } else {
        // 다음 단계로 진행
        const nextStageMap: Partial<Record<MatchStage, MatchStage>> = {
          suggested: 'buyerContacted',
          buyerContacted: 'viewing',
          viewing: 'ownerContacted',
          ownerContacted: 'negotiating',
          negotiating: 'dealCreated',
        }
        const nextStage = nextStageMap[currentStage]
        if (nextStage) {
          updates.stage = nextStage
          // 관심/동의 기록
          if (currentStage === 'buyerContacted' && option.interest === 'interested') {
            updates.buyerInterest = 'interested'
          } else if (currentStage === 'viewing' && option.interest === 'interested') {
            updates.viewingFeedback = 'interested'
            updates.viewedAt = new Date()
          } else if (currentStage === 'ownerContacted' && option.interest === 'interested') {
            updates.ownerResponse = 'interested'
          }
        }
      }

      const updatedMatch = { ...match, ...updates }
      await matchesApi.update(matchId, updatedMatch)
      setMatches((prev) =>
        prev.map((m) => (m.id === matchId ? updatedMatch : m)),
      )
    } catch (error) {
      console.error('Failed to update match:', error)
    }
  }

  // 단계 직접 변경 핸들러 (현재가 아닌 노드 클릭 시)
  const handleStageChange = async (matchId: string, newStage: MatchStage) => {
    try {
      const match = matches.find((m) => m.id === matchId)
      if (!match) return

      const updatedMatch = { ...match, stage: newStage }
      await matchesApi.update(matchId, updatedMatch)
      setMatches((prev) =>
        prev.map((m) => (m.id === matchId ? updatedMatch : m)),
      )
    } catch (error) {
      console.error('Failed to update stage:', error)
    }
  }

  // 메모 편집 시작
  const handleStartEditNotes = () => {
    if (selectedMatch) {
      setNoteForm({
        buyerNote: selectedMatch.buyerNote || '',
        viewingNote: selectedMatch.viewingNote || '',
        ownerNote: selectedMatch.ownerNote || '',
      })
      setEditingNotes(true)
    }
  }

  // 메모 저장
  const handleSaveNotes = async () => {
    if (!selectedMatch) return
    try {
      const updatedMatch = {
        ...selectedMatch,
        buyerNote: noteForm.buyerNote || undefined,
        viewingNote: noteForm.viewingNote || undefined,
        ownerNote: noteForm.ownerNote || undefined,
      }
      await matchesApi.update(selectedMatch.id, updatedMatch)
      setMatches((prev) =>
        prev.map((m) => (m.id === selectedMatch.id ? updatedMatch : m)),
      )
      setSelectedMatch(updatedMatch)
      setEditingNotes(false)
    } catch (error) {
      console.error('Failed to save notes:', error)
    }
  }

  // 검색 및 필터링
  const filteredMatches = matches.filter((match) => {
    // 단계 필터
    if (filterStage !== 'all' && match.stage !== filterStage) {
      return false
    }

    // 검색어 필터
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      const buyerReq = buyerReqs.find((r) => r.id === match.buyerReqId)
      const property = properties.find((p) => p.id === match.propertyId)
      const buyerContact = buyerReq
        ? contacts.find((c) => c.id === buyerReq.contactId)
        : undefined

      const matchesSearch =
        buyerContact?.name.toLowerCase().includes(q) ||
        buyerContact?.phone.includes(q) ||
        (property?.unitType || '').toLowerCase().includes(q) ||
        property?.ownerName.toLowerCase().includes(q)

      if (!matchesSearch) return false
    }

    return true
  })

  // 통계
  const stats = {
    total: matches.length,
    active: matches.filter((m) => !['closed', 'dealCreated'].includes(m.stage)).length,
    viewing: matches.filter((m) => m.stage === 'viewing').length,
    negotiating: matches.filter((m) => m.stage === 'negotiating').length,
    converted: matches.filter((m) => m.stage === 'dealCreated').length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Link2 className="size-6" />
            매칭 관리
          </h1>
          <p className="text-muted-foreground mt-1">
            구매고객과 매물 간의 매칭을 관리합니다
          </p>
        </div>
        <Button>
          <Plus className="size-4 mr-2" />
          새 매칭
        </Button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">전체 매칭</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">진행 중</div>
            <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">방문</div>
            <div className="text-2xl font-bold text-purple-600">{stats.viewing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">협의 중</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.negotiating}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">거래 전환</div>
            <div className="text-2xl font-bold text-green-600">{stats.converted}</div>
          </CardContent>
        </Card>
      </div>

      {/* 필터 및 뷰 모드 */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4 flex-1">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="구매자명, 전화번호, 매물명으로 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={filterStage} onValueChange={setFilterStage}>
            <SelectTrigger className="w-40">
              <Filter className="size-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">전체 단계</SelectItem>
              {Object.entries(stageConfig).map(([key, { label }]) => (
                <SelectItem key={key} value={key}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as 'kanban' | 'list' | 'buyer')}>
          <TabsList>
            <TabsTrigger value="buyer">
              <GitBranch className="size-4 mr-1" />
              고객별
            </TabsTrigger>
            <TabsTrigger value="kanban">칸반</TabsTrigger>
            <TabsTrigger value="list">리스트</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* 고객별 다이어그램 뷰 */}
      {viewMode === 'buyer' && (
        <div className="space-y-4">
          {buyerReqs
            .filter((req) => {
              // 매칭이 있는 고객만 표시
              const hasMatches = filteredMatches.some((m) => m.buyerReqId === req.id)
              if (!hasMatches) return false

              // 검색어 필터
              if (searchQuery) {
                const q = searchQuery.toLowerCase()
                const contact = contacts.find((c) => c.id === req.contactId)
                return (
                  contact?.name.toLowerCase().includes(q) ||
                  contact?.phone.includes(q)
                )
              }
              return true
            })
            .map((req) => {
              const contact = contacts.find((c) => c.id === req.contactId)
              return (
                <BuyerMatchDiagram
                  key={req.id}
                  buyerReq={req}
                  buyerContact={contact}
                  matches={filteredMatches}
                  properties={properties}
                  onMatchSelect={setSelectedMatch}
                  onOptionSelect={handleOptionSelect}
                  onStageChange={handleStageChange}
                />
              )
            })}
          {buyerReqs.filter((req) => filteredMatches.some((m) => m.buyerReqId === req.id)).length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              매칭 데이터가 없습니다
            </div>
          )}
        </div>
      )}

      {/* 칸반 뷰 */}
      {viewMode === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {kanbanStages.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              matches={filteredMatches}
              buyerReqs={buyerReqs}
              properties={properties}
              contacts={contacts}
              onStageChange={handleStageChange}
              onMatchSelect={setSelectedMatch}
            />
          ))}
        </div>
      )}

      {/* 리스트 뷰 */}
      {viewMode === 'list' && (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium text-sm">단계</th>
                  <th className="text-left p-3 font-medium text-sm">구매자</th>
                  <th className="text-left p-3 font-medium text-sm">매물</th>
                  <th className="text-left p-3 font-medium text-sm">구매자 반응</th>
                  <th className="text-left p-3 font-medium text-sm">방문 예정</th>
                  <th className="text-left p-3 font-medium text-sm">판매자 반응</th>
                  <th className="text-left p-3 font-medium text-sm w-12"></th>
                </tr>
              </thead>
              <tbody>
                {filteredMatches.map((match) => {
                  const buyerReq = buyerReqs.find((r) => r.id === match.buyerReqId)
                  const property = properties.find((p) => p.id === match.propertyId)
                  const buyerContact = buyerReq
                    ? contacts.find((c) => c.id === buyerReq.contactId)
                    : undefined

                  return (
                    <MatchListRow
                      key={match.id}
                      match={match}
                      property={property}
                      buyerContact={buyerContact}
                      onDoubleClick={() => setSelectedMatch(match)}
                    />
                  )
                })}
              </tbody>
            </table>
            {filteredMatches.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">
                매칭 데이터가 없습니다
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 매칭 상세보기 다이얼로그 */}
      {selectedMatch && (
        <Dialog open={!!selectedMatch} onOpenChange={() => setSelectedMatch(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle className="text-xl">매칭 상세 정보</DialogTitle>
            </DialogHeader>
            {(() => {
              const buyerReq = buyerReqs.find((r) => r.id === selectedMatch.buyerReqId)
              const property = properties.find((p) => p.id === selectedMatch.propertyId)
              const buyerContact = buyerReq ? contacts.find((c) => c.id === buyerReq.contactId) : undefined

              return (
                <div className="space-y-6">
                  {/* 단계별 진행 박스 - 현재 단계 클릭 시 옵션 선택, 다른 단계 클릭 시 이동 */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="font-semibold text-base mb-2">진행 단계</h3>
                    <p className="text-xs text-muted-foreground mb-4">현재 단계 클릭 시 옵션 선택, 다른 단계 클릭 시 해당 단계로 이동</p>
                    <div className="flex items-center justify-between">
                      {(['suggested', 'buyerContacted', 'viewing', 'ownerContacted', 'negotiating', 'dealCreated'] as MatchStage[]).map((stage, index, arr) => {
                        const config = stageConfig[stage]
                        const isCompleted = getStageOrder(selectedMatch.stage) > getStageOrder(stage)
                        const isCurrent = selectedMatch.stage === stage
                        const isClosed = selectedMatch.stage === 'closed'
                        const options = stageOptions[stage]

                        // 종료 상태면 클릭 불가
                        if (isClosed) {
                          return (
                            <div key={stage} className="flex items-center">
                              <div className="flex flex-col items-center">
                                <div
                                  className={cn(
                                    'w-[70px] h-8 flex items-center justify-center rounded text-xs font-medium border-2',
                                    'bg-gray-200 text-gray-500 border-gray-300'
                                  )}
                                >
                                  {config.label}
                                </div>
                              </div>
                              {index < arr.length - 1 && (
                                <div className="w-4 h-0.5 mx-1 bg-gray-300" />
                              )}
                            </div>
                          )
                        }

                        // 현재 상태가 아닌 경우: 클릭하면 해당 단계로 바로 이동
                        if (!isCurrent) {
                          return (
                            <div key={stage} className="flex items-center">
                              <div className="flex flex-col items-center">
                                <button
                                  onClick={() => {
                                    handleStageChange(selectedMatch.id, stage)
                                    setSelectedMatch({ ...selectedMatch, stage })
                                  }}
                                  className={cn(
                                    'w-[70px] h-8 flex items-center justify-center rounded text-xs font-medium border-2 transition-all cursor-pointer',
                                    'hover:ring-2 hover:ring-offset-1 hover:ring-primary/50',
                                    isCompleted ? `${config.bgColor} ${config.color} border-transparent hover:opacity-80` :
                                    'bg-gray-100 text-gray-400 border-gray-200 hover:bg-gray-200 hover:text-gray-600'
                                  )}
                                  title={`${config.label} 단계로 변경`}
                                >
                                  {config.label}
                                </button>
                              </div>
                              {index < arr.length - 1 && (
                                <div className={cn(
                                  'w-4 h-0.5 mx-1',
                                  isCompleted ? 'bg-green-400' : 'bg-gray-300'
                                )} />
                              )}
                            </div>
                          )
                        }

                        // 현재 상태: 드롭다운 옵션 표시 (옵션이 없으면 클릭 불가)
                        if (!options) {
                          return (
                            <div key={stage} className="flex items-center">
                              <div className="flex flex-col items-center">
                                <div
                                  className={cn(
                                    'w-[70px] h-8 flex items-center justify-center rounded text-xs font-medium border-2',
                                    `${config.bgColor} ${config.color} border-current ring-2 ring-offset-1`
                                  )}
                                >
                                  {config.label}
                                </div>
                              </div>
                              {index < arr.length - 1 && (
                                <div className="w-4 h-0.5 mx-1 bg-gray-300" />
                              )}
                            </div>
                          )
                        }

                        return (
                          <div key={stage} className="flex items-center">
                            <div className="flex flex-col items-center">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <button
                                    className={cn(
                                      'w-[70px] h-8 flex items-center justify-center rounded text-xs font-medium border-2 transition-all cursor-pointer',
                                      'hover:ring-2 hover:ring-offset-1 hover:ring-primary/50',
                                      `${config.bgColor} ${config.color} border-current ring-2 ring-offset-1`
                                    )}
                                  >
                                    {config.label}
                                  </button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="center">
                                  {options.map((option, idx) => (
                                    <DropdownMenuItem
                                      key={idx}
                                      onClick={() => {
                                        handleOptionSelect(selectedMatch.id, stage, option)
                                        // 상태 즉시 업데이트
                                        if (option.action === 'close') {
                                          setSelectedMatch({ ...selectedMatch, stage: 'closed' })
                                        } else {
                                          const nextStageMap: Partial<Record<MatchStage, MatchStage>> = {
                                            suggested: 'buyerContacted',
                                            buyerContacted: 'viewing',
                                            viewing: 'ownerContacted',
                                            ownerContacted: 'negotiating',
                                            negotiating: 'dealCreated',
                                          }
                                          const nextStage = nextStageMap[stage]
                                          if (nextStage) {
                                            setSelectedMatch({ ...selectedMatch, stage: nextStage })
                                          }
                                        }
                                      }}
                                      className={cn(
                                        option.action === 'close' && 'text-red-600 focus:text-red-600',
                                        option.action === 'progress' && option.interest === 'interested' && 'text-green-600 focus:text-green-600',
                                      )}
                                    >
                                      {option.action === 'progress' ? (
                                        <CheckCircle className="size-4 mr-2" />
                                      ) : (
                                        <XCircle className="size-4 mr-2" />
                                      )}
                                      {option.label}
                                    </DropdownMenuItem>
                                  ))}
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            {index < arr.length - 1 && (
                              <div className="w-4 h-0.5 mx-1 bg-gray-300" />
                            )}
                          </div>
                        )
                      })}
                    </div>
                    {selectedMatch.stage === 'closed' && (
                      <div className="mt-3 text-center">
                        <Badge variant="destructive">종료됨</Badge>
                      </div>
                    )}
                  </div>

                  {/* 단계별 코멘트 */}
                  <div className="bg-amber-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-base flex items-center gap-2">
                        <MessageSquare className="size-5" />
                        단계별 메모
                      </h3>
                      {!editingNotes ? (
                        <Button variant="ghost" size="sm" onClick={handleStartEditNotes}>
                          <Pencil className="size-4 mr-1" />
                          수정
                        </Button>
                      ) : (
                        <Button variant="default" size="sm" onClick={handleSaveNotes}>
                          <Save className="size-4 mr-1" />
                          저장
                        </Button>
                      )}
                    </div>

                    {editingNotes ? (
                      <div className="space-y-4">
                        <div>
                          <label className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="bg-blue-100 text-blue-700">구매자</Badge>
                          </label>
                          <Textarea
                            placeholder="구매자 관련 메모..."
                            value={noteForm.buyerNote}
                            onChange={(e) => setNoteForm({ ...noteForm, buyerNote: e.target.value })}
                            className="bg-white"
                            rows={2}
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="bg-purple-100 text-purple-700">방문</Badge>
                          </label>
                          <Textarea
                            placeholder="방문 관련 메모..."
                            value={noteForm.viewingNote}
                            onChange={(e) => setNoteForm({ ...noteForm, viewingNote: e.target.value })}
                            className="bg-white"
                            rows={2}
                          />
                        </div>
                        <div>
                          <label className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className="bg-orange-100 text-orange-700">판매자</Badge>
                          </label>
                          <Textarea
                            placeholder="판매자 관련 메모..."
                            value={noteForm.ownerNote}
                            onChange={(e) => setNoteForm({ ...noteForm, ownerNote: e.target.value })}
                            className="bg-white"
                            rows={2}
                          />
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setEditingNotes(false)}>
                          취소
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3 text-sm">
                        {selectedMatch.buyerNote && (
                          <div className="flex gap-2">
                            <Badge variant="outline" className="shrink-0 bg-blue-100 text-blue-700">구매자</Badge>
                            <span>{selectedMatch.buyerNote}</span>
                          </div>
                        )}
                        {selectedMatch.viewingNote && (
                          <div className="flex gap-2">
                            <Badge variant="outline" className="shrink-0 bg-purple-100 text-purple-700">방문</Badge>
                            <span>{selectedMatch.viewingNote}</span>
                          </div>
                        )}
                        {selectedMatch.ownerNote && (
                          <div className="flex gap-2">
                            <Badge variant="outline" className="shrink-0 bg-orange-100 text-orange-700">판매자</Badge>
                            <span>{selectedMatch.ownerNote}</span>
                          </div>
                        )}
                        {selectedMatch.closedReason && (
                          <div className="flex gap-2">
                            <Badge variant="outline" className="shrink-0 bg-red-100 text-red-700">종료</Badge>
                            <span>{selectedMatch.closedReason}</span>
                          </div>
                        )}
                        {!selectedMatch.buyerNote && !selectedMatch.viewingNote && !selectedMatch.ownerNote && !selectedMatch.closedReason && (
                          <p className="text-muted-foreground">등록된 메모가 없습니다</p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* 구매자 정보 */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                      <User className="size-5" />
                      구매자 정보
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">이름:</span>
                        <span className="ml-2 font-medium">{buyerContact?.name || '-'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">연락처:</span>
                        <span className="ml-2 font-medium">{buyerContact?.phone || '-'}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">예산:</span>
                        <span className="ml-2 font-medium">
                          {buyerReq?.budgetMin ? formatPrice(buyerReq.budgetMin) : '0'} ~ {buyerReq?.budgetMax ? formatPrice(buyerReq.budgetMax) : '무제한'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">희망 지역:</span>
                        <span className="ml-2 font-medium">{buyerReq?.areas?.join(', ') || '-'}</span>
                      </div>
                    </div>
                    {selectedMatch.buyerInterest && (
                      <div className="mt-3 pt-3 border-t">
                        <span className="text-muted-foreground">구매자 반응:</span>
                        <span className={`ml-2 font-medium ${
                          selectedMatch.buyerInterest === 'interested' ? 'text-green-600' :
                          selectedMatch.buyerInterest === 'notInterested' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {selectedMatch.buyerInterest === 'interested' ? '관심' :
                           selectedMatch.buyerInterest === 'notInterested' ? '비관심' : '대기'}
                        </span>
                      </div>
                    )}
                    {selectedMatch.buyerNote && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        메모: {selectedMatch.buyerNote}
                      </div>
                    )}
                  </div>

                  {/* 매물 정보 */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                      <Building2 className="size-5" />
                      매물 정보
                    </h3>
                    {property ? (
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">매물명:</span>
                          <span className="ml-2 font-medium">{property.unitType || '매물'}</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">가격:</span>
                          <span className="ml-2 font-medium text-primary">
                            {formatPrice(property.price)}
                            {property.monthlyRent && ` / ${formatPrice(property.monthlyRent)}`}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">면적:</span>
                          <span className="ml-2 font-medium">{property.area}㎡</span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">소유자:</span>
                          <span className="ml-2 font-medium">{property.ownerName}</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-muted-foreground">매물 정보 없음</p>
                    )}
                    {selectedMatch.ownerContacted && (
                      <div className="mt-3 pt-3 border-t">
                        <span className="text-muted-foreground">판매자 반응:</span>
                        <span className={`ml-2 font-medium ${
                          selectedMatch.ownerResponse === 'interested' ? 'text-green-600' :
                          selectedMatch.ownerResponse === 'notInterested' ? 'text-red-600' : 'text-gray-600'
                        }`}>
                          {selectedMatch.ownerResponse === 'interested' ? '동의' :
                           selectedMatch.ownerResponse === 'notInterested' ? '거절' : '대기'}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 방문 정보 */}
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                      <Calendar className="size-5" />
                      방문 정보
                    </h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">방문 예정:</span>
                        <span className="ml-2 font-medium">
                          {selectedMatch.viewingDate
                            ? new Date(selectedMatch.viewingDate).toLocaleDateString('ko-KR')
                            : '-'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">방문 완료:</span>
                        <span className="ml-2 font-medium">
                          {selectedMatch.viewedAt
                            ? new Date(selectedMatch.viewedAt).toLocaleDateString('ko-KR')
                            : '-'}
                        </span>
                      </div>
                    </div>
                    {selectedMatch.viewingNote && (
                      <div className="mt-2 text-sm text-muted-foreground">
                        방문 메모: {selectedMatch.viewingNote}
                      </div>
                    )}
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex gap-3 pt-4 border-t">
                    <Button variant="outline" className="flex-1" onClick={() => setSelectedMatch(null)}>
                      닫기
                    </Button>
                    {selectedMatch.stage !== 'dealCreated' && selectedMatch.stage !== 'closed' && (
                      <>
                        <Button
                          className="flex-1 bg-green-600 hover:bg-green-700"
                          onClick={() => {
                            handleStageChange(selectedMatch.id, 'dealCreated')
                            setSelectedMatch(null)
                          }}
                        >
                          <CheckCircle className="size-4 mr-2" />
                          거래로 전환
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          onClick={() => {
                            handleStageChange(selectedMatch.id, 'closed')
                            setSelectedMatch(null)
                          }}
                        >
                          <XCircle className="size-4 mr-2" />
                          종료
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              )
            })()}
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
