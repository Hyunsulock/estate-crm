import React, { useState, useMemo } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Home,
  User,
  Eye,
  EyeOff,
  ExternalLink,
  Crown,
  X,
  TrendingUp,
  TrendingDown,
  Unlink,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  MoreHorizontal,
  Pencil,
  Copy,
  CheckCircle2,
} from 'lucide-react'
import type { Property, NaverAd, Match, BuyerRequirement, Contact } from '@/types'
import {
  formatPrice,
  getDaysAgo,
  getVerificationColorClass,
  typeLabels,
  transactionLabels,
  statusConfig,
  naverAdStatusLabels,
  matchStageLabels,
} from '../utils'

type SortField = 'status' | 'transactionType' | 'type' | 'unitType' | 'buildingName' | 'dongName' | 'unitName' | 'area' | 'price' | 'ownerName' | 'hasTenant' | 'moveInDate' | 'infoVerifiedAt' | 'assignedTo'
type SortDirection = 'asc' | 'desc'

interface PropertiesTableProps {
  properties: Property[]
  isPremium: boolean
  expandedPropertyId: string | null
  setExpandedPropertyId: (id: string | null) => void
  onSelectProperty: (property: Property) => void
  onToggleHide: (id: string, isHidden: boolean) => void
  onUnlinkAd: (adId: string) => void
  onVerifyInfo?: (id: string) => void
  getUserName: (userId: string) => string
  getMatchesForProperty: (propertyId: string) => Match[]
  getAdsForProperty: (propertyId: string) => NaverAd[]
  buyerRequirements: BuyerRequirement[]
  contacts: Contact[]
}

interface SortableHeaderProps {
  field: SortField
  currentField: SortField | null
  direction: SortDirection
  onSort: (field: SortField) => void
  children: React.ReactNode
  className?: string
}

function SortableHeader({ field, currentField, direction, onSort, children, className = '' }: SortableHeaderProps) {
  const isActive = currentField === field

  return (
    <th
      className={`p-2 font-medium cursor-pointer hover:bg-muted/80 select-none transition-colors ${className}`}
      onClick={() => onSort(field)}
    >
      <div className="flex items-center gap-1">
        <span>{children}</span>
        <span className="inline-flex">
          {isActive ? (
            direction === 'asc' ? (
              <ArrowUp className="size-3.5 text-primary" />
            ) : (
              <ArrowDown className="size-3.5 text-primary" />
            )
          ) : (
            <ArrowUpDown className="size-3.5 text-muted-foreground/50" />
          )}
        </span>
      </div>
    </th>
  )
}

export function PropertiesTable({
  properties,
  isPremium,
  expandedPropertyId,
  setExpandedPropertyId,
  onSelectProperty,
  onToggleHide,
  onUnlinkAd,
  onVerifyInfo,
  getUserName,
  getMatchesForProperty,
  getAdsForProperty,
  buyerRequirements,
  contacts,
}: PropertiesTableProps) {
  const navigate = useNavigate()
  const [sortField, setSortField] = useState<SortField | null>(null)
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const sortedProperties = useMemo(() => {
    if (!sortField) return properties

    const statusOrder = ['available', 'reserved', 'contracted', 'closed', 'hidden']
    const transactionOrder = ['sale', 'lease', 'monthly']
    const typeOrder = ['apartment', 'officetel', 'villa', 'commercial', 'office', 'land', 'other']

    return [...properties].sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case 'status':
          comparison = statusOrder.indexOf(a.status) - statusOrder.indexOf(b.status)
          break
        case 'transactionType':
          comparison = transactionOrder.indexOf(a.transactionType) - transactionOrder.indexOf(b.transactionType)
          break
        case 'type':
          comparison = typeOrder.indexOf(a.type) - typeOrder.indexOf(b.type)
          break
        case 'unitType':
          comparison = (a.unitType || '').localeCompare(b.unitType || '', 'ko')
          break
        case 'buildingName': {
          const aFull = a as typeof a & { buildingName?: string }
          const bFull = b as typeof b & { buildingName?: string }
          comparison = (aFull.buildingName || '').localeCompare(bFull.buildingName || '', 'ko')
          break
        }
        case 'dongName': {
          const aFull = a as typeof a & { dongName?: string }
          const bFull = b as typeof b & { dongName?: string }
          comparison = (aFull.dongName || '').localeCompare(bFull.dongName || '', 'ko')
          break
        }
        case 'unitName': {
          const aFull = a as typeof a & { unitName?: string }
          const bFull = b as typeof b & { unitName?: string }
          comparison = (aFull.unitName || '').localeCompare(bFull.unitName || '', 'ko')
          break
        }
        case 'area':
          comparison = (a.area || 0) - (b.area || 0)
          break
        case 'price':
          comparison = (a.price || 0) - (b.price || 0)
          break
        case 'ownerName':
          comparison = (a.ownerName || '').localeCompare(b.ownerName || '', 'ko')
          break
        case 'hasTenant':
          comparison = (a.hasTenant ? 1 : 0) - (b.hasTenant ? 1 : 0)
          break
        case 'moveInDate':
          // 즉시 > 날짜 > 협의 순서
          const moveInOrder = { immediate: 0, date: 1, negotiable: 2 }
          comparison = (moveInOrder[a.moveInType || 'negotiable'] || 2) - (moveInOrder[b.moveInType || 'negotiable'] || 2)
          break
        case 'infoVerifiedAt':
          const aDate = a.infoVerifiedAt ? new Date(a.infoVerifiedAt).getTime() : 0
          const bDate = b.infoVerifiedAt ? new Date(b.infoVerifiedAt).getTime() : 0
          comparison = bDate - aDate // 최신순이 기본
          break
        case 'assignedTo':
          comparison = getUserName(a.assignedTo).localeCompare(getUserName(b.assignedTo), 'ko')
          break
        default:
          comparison = 0
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })
  }, [properties, sortField, sortDirection, getUserName])

  const getBuyerName = (buyerReqId: string) => {
    const req = buyerRequirements.find((r) => r.id === buyerReqId)
    if (!req) return '알 수 없음'
    const contact = contacts.find((c) => c.id === req.contactId)
    return contact?.name || '알 수 없음'
  }

  // 가격 변동 표시 헬퍼 (uses priceChangePercent from Property)
  const getPriceChange = (property: Property) => {
    if (property.priceChangePercent === undefined || property.priceChangePercent === null) return null
    return {
      change: property.priceChangePercent,
      isUp: property.priceChangePercent > 0,
      isDown: property.priceChangePercent < 0,
    }
  }

  // 연락처 복사
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <TooltipProvider>
    <Card className="flex-1 min-h-0 overflow-hidden flex flex-col p-0">
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm border-collapse">
          <thead className="bg-muted border-b sticky top-0 z-10">
            <tr>
              <SortableHeader
                field="status"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
                className="text-left w-[70px]"
              >
                상태
              </SortableHeader>
              <SortableHeader
                field="transactionType"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
                className="text-left w-[70px]"
              >
                거래
              </SortableHeader>
              <SortableHeader
                field="type"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
                className="text-left w-[65px]"
              >
                유형
              </SortableHeader>
              <SortableHeader
                field="buildingName"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
                className="text-left w-[170px]"
              >
                매물명
              </SortableHeader>
              <SortableHeader
                field="unitType"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
                className="text-center w-[60px]"
              >
                타입
              </SortableHeader>
              <SortableHeader
                field="dongName"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
                className="text-center w-[55px]"
              >
                동
              </SortableHeader>
              <SortableHeader
                field="unitName"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
                className="text-center w-[65px]"
              >
                호
              </SortableHeader>
              <SortableHeader
                field="area"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
                className="text-right w-[60px]"
              >
                면적
              </SortableHeader>
              <SortableHeader
                field="price"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
                className="text-right w-[120px]"
              >
                가격
              </SortableHeader>
              <SortableHeader
                field="ownerName"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
                className="text-left w-[170px]"
              >
                소유주
              </SortableHeader>
              <SortableHeader
                field="hasTenant"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
                className="text-center w-[65px]"
              >
                세입
              </SortableHeader>
              <SortableHeader
                field="moveInDate"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
                className="text-center w-[60px]"
              >
                입주
              </SortableHeader>
              <th className="text-left p-2 font-medium">메모</th>
              <SortableHeader
                field="infoVerifiedAt"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
                className="text-center w-[65px]"
              >
                확인
              </SortableHeader>
              <SortableHeader
                field="assignedTo"
                currentField={sortField}
                direction={sortDirection}
                onSort={handleSort}
                className="text-center w-[65px]"
              >
                담당
              </SortableHeader>
              <th className="text-center p-2 font-medium w-[70px]">{isPremium ? '매칭' : '매칭'}</th>
              <th className="text-center p-2 font-medium w-[36px]"></th>
            </tr>
          </thead>
          <tbody>
            {sortedProperties.map((property) => (
              <React.Fragment key={property.id}>
                <tr
                  className={cn(
                    "border-b hover:bg-muted/30 cursor-pointer transition-colors",
                    property.isHidden && "opacity-50 bg-muted/20"
                  )}
                  onClick={() => onSelectProperty(property)}
                >
                  <td className="px-2 py-1.5">
                    <Badge
                      variant={statusConfig[property.status].variant}
                      className="text-xs"
                    >
                      {statusConfig[property.status].label}
                    </Badge>
                  </td>
                  <td className="px-2 py-1.5">
                    <Badge variant="outline" className="text-xs">
                      {transactionLabels[property.transactionType]}
                    </Badge>
                  </td>
                  <td className="px-2 py-1.5 text-muted-foreground text-xs">
                    {typeLabels[property.type]}
                  </td>
                  <td className="px-2 py-1.5">
                    {(() => {
                      const pFull = property as typeof property & { buildingName?: string }
                      return (
                        <div className="flex items-center gap-1">
                          <Home className="size-3 text-muted-foreground flex-shrink-0" />
                          <span className="font-medium truncate" title={pFull.buildingName || ''}>{pFull.buildingName || '-'}</span>
                        </div>
                      )
                    })()}
                  </td>
                  <td className="px-2 py-1.5 text-center text-muted-foreground text-xs">
                    {property.unitType || '-'}
                  </td>
                  <td className="px-2 py-1.5 text-center text-muted-foreground">
                    {(property as typeof property & { dongName?: string }).dongName || '-'}
                  </td>
                  <td className="px-2 py-1.5 text-center font-medium">
                    {(property as typeof property & { unitName?: string }).unitName || '-'}
                  </td>
                  <td className="px-2 py-1.5 text-right text-muted-foreground">
                    {property.area ? `${property.area}` : '-'}
                  </td>
                  <td className="px-2 py-1.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className="font-medium text-primary">
                        {formatPrice(property.price)}
                        {property.monthlyRent && (
                          <span className="text-muted-foreground font-normal">/{formatPrice(property.monthlyRent)}</span>
                        )}
                      </span>
                      {(() => {
                        const priceChange = getPriceChange(property)
                        if (!priceChange) return null
                        return (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <span className={`inline-flex items-center ${priceChange.isDown ? 'text-blue-500' : priceChange.isUp ? 'text-red-500' : ''}`}>
                                {priceChange.isDown ? <TrendingDown className="size-3" /> : priceChange.isUp ? <TrendingUp className="size-3" /> : null}
                              </span>
                            </TooltipTrigger>
                            <TooltipContent>
                              <span>{priceChange.change >= 0 ? '+' : ''}{priceChange.change.toFixed(1)}%</span>
                            </TooltipContent>
                          </Tooltip>
                        )
                      })()}
                    </div>
                  </td>
                  <td className="px-2 py-1.5">
                    <div className="flex items-center gap-1.5 text-xs">
                      <span>{property.ownerName}</span>
                      {property.ownerPhone && (
                        <span className="text-muted-foreground">{property.ownerPhone}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    {property.hasTenant ? (
                      <Badge variant="secondary" className="text-xs">
                        있음
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground text-xs">없음</span>
                    )}
                  </td>
                  <td className="px-2 py-1.5 text-center text-xs">
                    <span
                      className={
                        property.moveInType === 'immediate'
                          ? 'text-green-600 font-medium'
                          : property.moveInType === 'negotiable'
                            ? 'text-muted-foreground'
                            : ''
                      }
                    >
                      {property.moveInDate}
                    </span>
                  </td>
                  <td className="px-2 py-1.5">
                    {property.memo ? (
                      <span className="text-xs text-muted-foreground truncate block" title={property.memo}>
                        {property.memo}
                      </span>
                    ) : (
                      <span className="text-xs text-muted-foreground/50">-</span>
                    )}
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <span className={`text-xs ${getVerificationColorClass(property.infoVerifiedAt)}`}>
                      {getDaysAgo(property.infoVerifiedAt)}
                    </span>
                  </td>
                  <td className="px-2 py-1.5 text-center text-xs text-muted-foreground">
                    {getUserName(property.assignedTo)}
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    {(() => {
                      const propertyMatches = getMatchesForProperty(property.id)
                      const propertyAds = isPremium ? getAdsForProperty(property.id) : []
                      const hasMatches = propertyMatches.length > 0
                      const hasAds = propertyAds.length > 0

                      if (!hasMatches && !hasAds) {
                        return <span className="text-xs text-muted-foreground">-</span>
                      }

                      return (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-6 px-1.5 gap-1"
                          onClick={(e) => {
                            e.stopPropagation()
                            setExpandedPropertyId(
                              expandedPropertyId === property.id ? null : property.id
                            )
                          }}
                        >
                          {hasMatches && (
                            <span className="inline-flex items-center gap-0.5">
                              <User className="size-3 text-blue-500" />
                              <span className="text-xs">{propertyMatches.length}</span>
                            </span>
                          )}
                          {hasMatches && hasAds && <span className="text-muted-foreground">/</span>}
                          {hasAds && (
                            <span className="inline-flex items-center gap-0.5">
                              <Crown className="size-3 text-amber-500" />
                              <span className="text-xs">{propertyAds.length}</span>
                            </span>
                          )}
                          {expandedPropertyId === property.id ? (
                            <X className="size-3 ml-0.5" />
                          ) : (
                            <ExternalLink className="size-3 ml-0.5" />
                          )}
                        </Button>
                      )
                    })()}
                  </td>
                  <td className="px-2 py-1.5 text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={(e) => e.stopPropagation()}
                          className="h-8 w-8"
                        >
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">메뉴 열기</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-[160px]">
                        <DropdownMenuItem onClick={() => onSelectProperty(property)}>
                          <Pencil className="size-4 mr-2" />
                          상세보기/수정
                        </DropdownMenuItem>
                        {property.ownerPhone && (
                          <DropdownMenuItem onClick={() => copyToClipboard(property.ownerPhone || '')}>
                            <Copy className="size-4 mr-2" />
                            연락처 복사
                          </DropdownMenuItem>
                        )}
                        {onVerifyInfo && (
                          <DropdownMenuItem onClick={() => onVerifyInfo(property.id)}>
                            <CheckCircle2 className="size-4 mr-2" />
                            정보확인 갱신
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => onToggleHide(property.id, !property.isHidden)}
                        >
                          {property.isHidden ? (
                            <>
                              <Eye className="size-4 mr-2" />
                              숨김 해제
                            </>
                          ) : (
                            <>
                              <EyeOff className="size-4 mr-2" />
                              숨기기
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
                {/* 상세 펼침 행 (매칭 + 광고) */}
                {expandedPropertyId === property.id && (
                  <ExpandedRow
                    property={property}
                    isPremium={isPremium}
                    getMatchesForProperty={getMatchesForProperty}
                    getAdsForProperty={getAdsForProperty}
                    buyerRequirements={buyerRequirements}
                    contacts={contacts}
                    getBuyerName={getBuyerName}
                    onUnlinkAd={onUnlinkAd}
                    navigate={navigate}
                  />
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {/* 정렬 상태 표시 */}
      {sortField && (
        <div className="px-3 py-2 border-t bg-muted/30 text-xs text-muted-foreground flex items-center gap-2">
          <span>정렬:</span>
          <Badge variant="secondary" className="text-xs font-normal">
            {sortField === 'status' && '상태'}
            {sortField === 'transactionType' && '거래유형'}
            {sortField === 'type' && '매물유형'}
            {sortField === 'buildingName' && '매물명'}
            {sortField === 'dongName' && '동'}
            {sortField === 'unitName' && '호수'}
            {sortField === 'area' && '면적'}
            {sortField === 'price' && '가격'}
            {sortField === 'ownerName' && '소유주'}
            {sortField === 'hasTenant' && '세입자'}
            {sortField === 'moveInDate' && '입주'}
            {sortField === 'infoVerifiedAt' && '정보확인'}
            {sortField === 'assignedTo' && '담당자'}
            {sortDirection === 'asc' ? ' ↑' : ' ↓'}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            className="h-5 px-1.5 text-xs"
            onClick={() => {
              setSortField(null)
              setSortDirection('asc')
            }}
          >
            <X className="size-3 mr-0.5" />
            초기화
          </Button>
        </div>
      )}
    </Card>
    </TooltipProvider>
  )
}

interface ExpandedRowProps {
  property: Property
  isPremium: boolean
  getMatchesForProperty: (propertyId: string) => Match[]
  getAdsForProperty: (propertyId: string) => NaverAd[]
  buyerRequirements: BuyerRequirement[]
  contacts: Contact[]
  getBuyerName: (buyerReqId: string) => string
  onUnlinkAd: (adId: string) => void
  navigate: ReturnType<typeof useNavigate>
}

function ExpandedRow({
  property,
  isPremium,
  getMatchesForProperty,
  getAdsForProperty,
  buyerRequirements,
  contacts,
  getBuyerName,
  onUnlinkAd,
  navigate,
}: ExpandedRowProps) {
  const propertyMatches = getMatchesForProperty(property.id)
  const propertyAds = getAdsForProperty(property.id)

  const getNodeStatus = (match: Match, nodeType: string): 'completed' | 'current' | 'pending' | 'failed' => {
    const stageOrder = ['suggested', 'buyerContacted', 'viewing', 'negotiating', 'dealCreated']
    const currentIndex = stageOrder.indexOf(match.stage)

    if (match.stage === 'closed') {
      return 'failed'
    }

    switch (nodeType) {
      case 'stage':
        return 'current'
      case 'interest':
        if (match.buyerInterest === 'interested') return 'completed'
        if (match.buyerInterest === 'notInterested') return 'failed'
        return currentIndex >= 1 ? 'current' : 'pending'
      case 'viewing':
        if (match.viewedAt) return 'completed'
        if (match.viewingDate) return 'current'
        return 'pending'
      case 'feedback':
        if (match.viewingFeedback === 'interested') return 'completed'
        if (match.viewingFeedback === 'notInterested') return 'failed'
        if (match.viewedAt) return 'current'
        return 'pending'
      case 'owner':
        if (match.ownerResponse === 'interested') return 'completed'
        if (match.ownerResponse === 'notInterested') return 'failed'
        if (match.ownerContacted) return 'current'
        return 'pending'
      case 'deal':
        if (match.stage === 'dealCreated') return 'completed'
        return currentIndex >= 4 ? 'current' : 'pending'
      default:
        return 'pending'
    }
  }

  const statusStyles: Record<string, string> = {
    completed: 'bg-green-500 border-green-500 text-white',
    current: 'bg-blue-500 border-blue-500 text-white',
    pending: 'bg-gray-200 border-gray-300 text-gray-500',
    failed: 'bg-red-500 border-red-500 text-white',
  }

  const lineStyles: Record<string, string> = {
    completed: 'bg-green-500',
    current: 'bg-blue-300',
    pending: 'bg-gray-300',
    failed: 'bg-red-300',
  }

  return (
    <tr className="bg-muted/30">
      <td colSpan={isPremium ? 17 : 16} className="p-0">
        <div className="p-3 space-y-4">
          {/* 구매고객 매칭 섹션 */}
          {propertyMatches.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-400">
                <User className="size-4" />
                연결된 구매고객 매칭 ({propertyMatches.length}건)
              </div>
              <div className="space-y-2">
                {propertyMatches.map((match) => {
                  const stageInfo = matchStageLabels[match.stage] || { label: match.stage, color: '' }
                  const buyerReq = buyerRequirements.find(b => b.id === match.buyerReqId)
                  const buyerContact = buyerReq ? contacts.find(c => c.id === buyerReq.contactId) : null

                  return (
                    <div
                      key={match.id}
                      className="flex items-center py-3 px-4 bg-white dark:bg-background rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                      onDoubleClick={() => navigate({ to: '/matches', search: { matchId: match.id } })}
                      title="더블클릭하여 매칭 상세보기"
                    >
                      {/* 구매자 정보 */}
                      <div className="flex items-center gap-4 min-w-[320px] mr-6">
                        <span className="font-semibold text-base">
                          {buyerContact?.name || getBuyerName(match.buyerReqId)}
                        </span>
                        {buyerContact?.phone && (
                          <span className="text-sm text-muted-foreground">
                            {buyerContact.phone}
                          </span>
                        )}
                        <span className="text-sm text-muted-foreground">
                          {buyerReq?.budgetMin || buyerReq?.budgetMax ? (
                            <>
                              {buyerReq.budgetMin ? formatPrice(buyerReq.budgetMin) : '0'}
                              {' ~ '}
                              {buyerReq.budgetMax ? formatPrice(buyerReq.budgetMax) : '무제한'}
                            </>
                          ) : '-'}
                        </span>
                      </div>

                      {/* 파이프라인 */}
                      <div className="flex items-center flex-1">
                        <div className={`w-[80px] py-1.5 rounded text-sm font-semibold border text-center ${statusStyles[getNodeStatus(match, 'stage')]}`}>
                          {stageInfo.label}
                        </div>
                        <div className={`w-5 h-1 ${lineStyles[getNodeStatus(match, 'stage')]}`} />

                        <div className={`w-[60px] py-1.5 rounded text-sm font-semibold border text-center ${statusStyles[getNodeStatus(match, 'interest')]}`}>
                          {match.buyerInterest === 'interested' ? '관심' : match.buyerInterest === 'notInterested' ? '비관심' : '관심?'}
                        </div>
                        <div className={`w-5 h-1 ${lineStyles[getNodeStatus(match, 'interest')]}`} />

                        <div className={`w-[85px] py-1.5 rounded text-sm font-semibold border text-center ${statusStyles[getNodeStatus(match, 'viewing')]}`}>
                          {match.viewedAt
                            ? `${new Date(match.viewedAt).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })} 완료`
                            : match.viewingDate
                            ? `${new Date(match.viewingDate).toLocaleDateString('ko-KR', { month: 'numeric', day: 'numeric' })} 예정`
                            : '일정?'}
                        </div>
                        <div className={`w-5 h-1 ${lineStyles[getNodeStatus(match, 'viewing')]}`} />

                        <div className={`w-[65px] py-1.5 rounded text-sm font-semibold border text-center ${statusStyles[getNodeStatus(match, 'feedback')]}`}>
                          {match.viewingFeedback === 'interested' ? '긍정' : match.viewingFeedback === 'notInterested' ? '부정' : '피드백?'}
                        </div>
                        <div className={`w-5 h-1 ${lineStyles[getNodeStatus(match, 'feedback')]}`} />

                        <div className={`w-[80px] py-1.5 rounded text-sm font-semibold border text-center ${statusStyles[getNodeStatus(match, 'owner')]}`}>
                          {match.ownerResponse === 'interested' ? '동의' : match.ownerResponse === 'notInterested' ? '거절' : match.ownerContacted ? '협의중' : '판매자'}
                        </div>
                        <div className={`w-5 h-1 ${lineStyles[getNodeStatus(match, 'owner')]}`} />

                        <div className={`w-[60px] py-1.5 rounded text-sm font-semibold border text-center ${statusStyles[getNodeStatus(match, 'deal')]}`}>
                          거래
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* 네이버 광고 섹션 */}
          {isPremium && propertyAds.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-amber-700 dark:text-amber-400">
                <Crown className="size-4" />
                연결된 네이버 광고
              </div>
              <div className="space-y-2">
                {propertyAds.map((ad) => {
                  const statusInfo = naverAdStatusLabels[ad.status] || { label: ad.status, color: '' }
                  return (
                    <div
                      key={ad.id}
                      className="flex items-center gap-4 p-2 bg-white dark:bg-background rounded border text-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium ${statusInfo.color}`}>
                            {statusInfo.label}
                          </span>
                          <span className="font-medium">{ad.articleName}</span>
                          <a
                            href={`https://land.naver.com/article/${ad.articleNo}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-muted-foreground hover:text-primary"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <ExternalLink className="size-3" />
                          </a>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {ad.buildingName} · {ad.dong} {ad.floor} · {formatPrice(ad.price)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <TrendingUp className="size-3" />
                          <span>랭킹:</span>
                        </div>
                        <span className={`font-medium ${ad.rank && ad.rank <= 10 ? 'text-green-600' : ad.rank && ad.rank <= 20 ? 'text-blue-600' : 'text-muted-foreground'}`}>
                          {ad.rank || '-'}/{ad.totalAdsInArea || '-'}
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7"
                        onClick={(e) => {
                          e.stopPropagation()
                          onUnlinkAd(ad.id)
                        }}
                      >
                        <Unlink className="size-3 mr-1 text-red-500" />
                        <span className="text-xs">연결해제</span>
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  )
}
