import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Phone,
  User,
  Save,
  RefreshCw,
  TrendingUp,
  Crown,
  Sparkles,
  Check,
  Pencil,
  Calendar,
  MessageSquare,
  Users,
  MapPin,
  Plus,
  Banknote,
  ClipboardList,
} from 'lucide-react'
import type { Property, PropertyFull, PropertyType, TransactionType, PropertyStatus, User as UserType, NaverAd, Match, BuyerRequirement, Contact, Consultation, RealTransaction, MarketPrice, ConsultationResult } from '@/types'
import {
  formatPrice,
  getDaysAgo,
  getVerificationColorClass,
  typeLabels,
  transactionLabels,
  statusConfig,
} from '../utils'

interface PropertyDetailModalProps {
  property: Property | null
  isOpen: boolean
  onClose: () => void
  users: UserType[]
  isPremium: boolean
  naverAds: NaverAd[]
  matches: Match[]
  buyerRequirements: BuyerRequirement[]
  contacts: Contact[]
  consultations: Consultation[]
  realTransactions: RealTransaction[]
  marketPrices: MarketPrice[]
  onSave: (id: string, updates: Partial<Property>) => void
  onVerifyInfo: (id: string) => void
  onSaveOwner: (data: { name: string; phone: string; phone2?: string }) => Promise<{ id: string }>
  onCreateConsultation: (data: {
    contactId: string
    propertyId?: string
    date: Date
    content: string
    result: ConsultationResult
    nextContactDate?: Date
    desiredPrice?: number
    createdBy: string
  }) => void
  isSaving: boolean
}

export function PropertyDetailModal({
  property,
  isOpen,
  onClose,
  users,
  isPremium,
  naverAds,
  matches,
  buyerRequirements,
  contacts,
  consultations,
  realTransactions,
  marketPrices,
  onSave,
  onVerifyInfo,
  onSaveOwner,
  onCreateConsultation,
  isSaving,
}: PropertyDetailModalProps) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [editForm, setEditForm] = useState<Partial<Property>>({})
  const [savedOwnerId, setSavedOwnerId] = useState<string | null>(null)
  const [isOwnerSaved, setIsOwnerSaved] = useState(false)
  const [showConsultationDialog, setShowConsultationDialog] = useState(false)
  const [showQuickConsultation, setShowQuickConsultation] = useState(false)
  const [quickConsultationContent, setQuickConsultationContent] = useState('')
  const [quickConsultationResult, setQuickConsultationResult] = useState<ConsultationResult>('pending')
  const [consultationForm, setConsultationForm] = useState({
    content: '',
    result: 'pending' as ConsultationResult,
    nextContactDate: '',
    desiredPrice: '',
  })

  // 모달이 열릴 때 폼 초기화
  useEffect(() => {
    if (isOpen && property) {
      setIsEditMode(false)
      setEditForm({
        type: property.type,
        transactionType: property.transactionType,
        status: property.status,
        area: property.area,
        price: property.price,
        monthlyRent: property.monthlyRent,
        ownerName: property.ownerName,
        ownerPhone: property.ownerPhone,
        ownerPhone2: property.ownerPhone2,
        hasTenant: property.hasTenant,
        tenantDeposit: property.tenantDeposit,
        tenantRent: property.tenantRent,
        tenantLeaseEnd: property.tenantLeaseEnd,
        moveInDate: property.moveInDate,
        moveInType: property.moveInType,
        memo: property.memo,
        assignedTo: property.assignedTo,
        direction: property.direction,
        unitType: property.unitType,
        floor: property.floor,
      })
      setSavedOwnerId(property.ownerId || null)
      setIsOwnerSaved(!!property.ownerId || (!property.ownerName && !property.ownerPhone))
    }
  }, [isOpen, property])

  const handleEnterEditMode = () => {
    setIsEditMode(true)
  }

  const handleCancelEdit = () => {
    if (property) {
      setEditForm({
        type: property.type,
        transactionType: property.transactionType,
        status: property.status,
        area: property.area,
        price: property.price,
        monthlyRent: property.monthlyRent,
        ownerName: property.ownerName,
        ownerPhone: property.ownerPhone,
        ownerPhone2: property.ownerPhone2,
        hasTenant: property.hasTenant,
        tenantDeposit: property.tenantDeposit,
        tenantRent: property.tenantRent,
        tenantLeaseEnd: property.tenantLeaseEnd,
        moveInDate: property.moveInDate,
        moveInType: property.moveInType,
        memo: property.memo,
        assignedTo: property.assignedTo,
        direction: property.direction,
        unitType: property.unitType,
        floor: property.floor,
      })
      setSavedOwnerId(property.ownerId || null)
      setIsOwnerSaved(!!property.ownerId || (!property.ownerName && !property.ownerPhone))
    }
    setIsEditMode(false)
  }

  const handleSave = () => {
    if (!property) return

    if (editForm.ownerName && editForm.ownerPhone && !isOwnerSaved) {
      alert('소유주 정보를 먼저 저장해주세요.')
      return
    }

    onSave(property.id, {
      ...editForm,
      ownerId: savedOwnerId || property.ownerId,
      infoVerifiedAt: new Date(),
      updatedAt: new Date(),
    })
    setIsEditMode(false)
  }

  const handleVerifyInfo = () => {
    if (!property) return
    onVerifyInfo(property.id)
  }

  const handleSaveOwner = async () => {
    if (!editForm.ownerName || !editForm.ownerPhone) {
      alert('소유주 이름과 연락처를 모두 입력해주세요.')
      return
    }

    try {
      const newContact = await onSaveOwner({
        name: editForm.ownerName,
        phone: editForm.ownerPhone,
        phone2: editForm.ownerPhone2,
      })
      setSavedOwnerId(newContact.id)
      setIsOwnerSaved(true)
    } catch (error) {
      // 에러 처리는 mutation에서 함
    }
  }

  const handleCreateConsultation = () => {
    if (!property) return
    onCreateConsultation({
      contactId: property.ownerId || '',
      propertyId: property.id,
      date: new Date(),
      content: consultationForm.content,
      result: consultationForm.result,
      nextContactDate: consultationForm.nextContactDate ? new Date(consultationForm.nextContactDate) : undefined,
      desiredPrice: consultationForm.desiredPrice ? Number(consultationForm.desiredPrice) * 10000 : undefined,
      createdBy: 'user-1',
    })
    setShowConsultationDialog(false)
    setConsultationForm({
      content: '',
      result: 'pending',
      nextContactDate: '',
      desiredPrice: '',
    })
  }

  const handleQuickConsultation = () => {
    if (!property || !quickConsultationContent.trim()) return
    onCreateConsultation({
      contactId: property.ownerId || '',
      propertyId: property.id,
      date: new Date(),
      content: quickConsultationContent,
      result: quickConsultationResult,
      createdBy: 'user-1',
    })
    setShowQuickConsultation(false)
    setQuickConsultationContent('')
    setQuickConsultationResult('pending')
  }

  const handleClose = () => {
    onClose()
    setIsEditMode(false)
  }

  if (!property) return null

  // Cast to PropertyFull for joined fields (buildingName, dongName, unitName, address)
  const pFull = property as PropertyFull
  const linkedAd = naverAds.find(ad => ad.matchedPropertyId === property.id)
  const propertyMatches = matches.filter(m => m.propertyId === property.id)
  const buildingMarketPrices = marketPrices.filter(
    m => m.buildingName === pFull.buildingName && m.transactionType === property.transactionType
  )
  const buildingTransactions = realTransactions.filter(
    t => t.buildingName === pFull.buildingName && t.transactionType === property.transactionType
  ).slice(0, 5)
  const marketPrice = buildingMarketPrices[0]
  const ownerConsultations = consultations.slice(0, 3)

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className={isEditMode ? "max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" : "max-w-[1400px] max-h-[90vh] overflow-hidden flex flex-col"}>
          {!isEditMode ? (
            /* ========== 상세보기 모드 ========== */
            <>
              {/* Hero Header - 매물 핵심 정보 + 상세 + 입주 정보 */}
              <div className="shrink-0 -mx-6 -mt-6 px-6 pt-6 pb-5 bg-gradient-to-br from-primary/5 via-primary/3 to-transparent border-b">
                {/* 1행: 배지들 */}
                <div className="flex items-center gap-1.5 mb-2">
                  <Badge variant={statusConfig[property.status]?.variant || 'default'} className="text-xs">
                    {statusConfig[property.status]?.label}
                  </Badge>
                  <Badge variant="outline" className="text-xs bg-background">
                    {transactionLabels[property.transactionType]}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {typeLabels[property.type]}
                  </Badge>
                </div>
                {/* 2행: 매물명 + 호수 + 수정 버튼 */}
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold tracking-tight">
                    {pFull.buildingName || ''} {pFull.dongName || ''} {pFull.unitName || ''}
                  </h2>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 px-2 text-xs gap-1 border-muted-foreground/40 text-muted-foreground hover:text-primary hover:border-primary"
                    onClick={handleEnterEditMode}
                  >
                    <Pencil className="size-3" />
                    수정
                  </Button>
                </div>
                {/* 3행: 주소 + 면적 */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <MapPin className="size-3.5" />
                  <span>{pFull.address || '주소 미등록'}</span>
                  <span className="text-muted-foreground/50">|</span>
                  <span>{property.area}평</span>
                </div>
                {/* 4행: 가격 */}
                <div className="text-xl font-bold text-primary mb-1">
                  {formatPrice(property.price)}
                  {property.transactionType === 'monthly' && property.monthlyRent && (
                    <span className="text-muted-foreground font-normal text-lg ml-1">
                      / 월 {formatPrice(property.monthlyRent)}
                    </span>
                  )}
                </div>
                {/* 5행: 매물 상세 정보 */}
                <div className="flex items-center gap-4 pt-2 border-t border-primary/10 text-sm">
                  {/* 담당자 */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">담당</span>
                    <span className="font-medium">{users.find(u => u.id === property.assignedTo)?.name || '-'}</span>
                  </div>
                  <span className="text-muted-foreground/30">|</span>
                  {/* 정보확인 */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">정보확인</span>
                    <span className={`text-xs flex items-center gap-1 px-1.5 py-0.5 rounded-full ${
                      getVerificationColorClass(property.infoVerifiedAt).includes('green')
                        ? 'bg-green-50 text-green-700'
                        : getVerificationColorClass(property.infoVerifiedAt).includes('yellow')
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'bg-red-50 text-red-700'
                    }`}>
                      <Calendar className="size-3" />
                      {getDaysAgo(property.infoVerifiedAt)}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-5 w-5 p-0 text-muted-foreground hover:text-green-600 hover:bg-green-50"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleVerifyInfo()
                      }}
                      title="정보 확인 완료"
                    >
                      <RefreshCw className="size-3" />
                    </Button>
                  </div>
                  <span className="text-muted-foreground/30">|</span>
                  {/* 입주가능 */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-muted-foreground">입주</span>
                    <span className="font-medium">
                      {property.moveInType === 'immediate' ? '즉시' :
                       property.moveInType === 'negotiable' ? '협의' :
                       property.moveInDate || '-'}
                    </span>
                  </div>
                  {/* 메모 */}
                  {property.memo && (
                    <>
                      <span className="text-muted-foreground/30">|</span>
                      <div className="flex items-center gap-1.5 max-w-[300px]">
                        <span className="text-muted-foreground">메모</span>
                        <span className="font-medium truncate">{property.memo}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Content - 한 페이지에 모든 정보 표시 */}
              <ScrollArea className="flex-1 -mx-6 px-6">
                <div className="grid grid-cols-3 gap-4 py-5">
                  {/* 1열: 광고 상태 + 세입자 정보 */}
                  <div className="space-y-4">
                    {/* 광고 상태 */}
                    {isPremium && (
                      <Card className="p-4 hover:shadow-md transition-shadow">
                        <h3 className="font-semibold flex items-center gap-2 mb-3 text-sm">
                          <div className="size-6 rounded-md bg-yellow-500/10 flex items-center justify-center">
                            <Crown className="size-3.5 text-yellow-500" />
                          </div>
                          광고 상태
                        </h3>
                        {linkedAd ? (
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-medium">네이버 부동산</span>
                              <Badge variant="default" className="bg-green-500 text-xs">연결됨</Badge>
                            </div>
                            <div className="text-xs text-muted-foreground bg-muted/50 rounded-md p-2 line-clamp-2">
                              {linkedAd.articleName}
                            </div>
                            <div className="flex items-center justify-between text-xs">
                              <span className={`px-2 py-0.5 rounded-full ${
                                linkedAd.status === 'active'
                                  ? 'bg-green-50 text-green-700'
                                  : linkedAd.status === 'paused'
                                  ? 'bg-yellow-50 text-yellow-700'
                                  : 'bg-gray-100 text-gray-500'
                              }`}>
                                {linkedAd.status === 'active' ? '광고중' : linkedAd.status === 'paused' ? '일시중지' : '종료'}
                              </span>
                              {linkedAd.viewCount > 100 && (
                                <span className="flex items-center gap-1 text-yellow-600">
                                  <Sparkles className="size-3" />
                                  인기
                                </span>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="text-center py-4 text-sm text-muted-foreground bg-muted/30 rounded-lg">
                            연결된 광고 없음
                          </div>
                        )}
                      </Card>
                    )}

                    {/* 세입자 정보 */}
                    <Card className="p-4 hover:shadow-md transition-shadow">
                      <h3 className="font-semibold flex items-center gap-2 mb-3 text-sm">
                        <div className="size-6 rounded-md bg-cyan-500/10 flex items-center justify-center">
                          <ClipboardList className="size-3.5 text-cyan-500" />
                        </div>
                        세입자 정보
                        {property.hasTenant && (
                          <Badge variant="default" className="ml-auto bg-cyan-500 text-[10px] px-1.5">있음</Badge>
                        )}
                      </h3>
                      {property.hasTenant ? (
                        <div className="space-y-3">
                          <div className="grid grid-cols-2 gap-2">
                            <div className="p-2.5 bg-cyan-50/50 rounded-lg">
                              <div className="text-[10px] text-muted-foreground mb-0.5">보증금</div>
                              <div className="font-semibold text-sm text-cyan-700">
                                {property.tenantDeposit ? formatPrice(property.tenantDeposit) : '-'}
                              </div>
                            </div>
                            <div className="p-2.5 bg-cyan-50/50 rounded-lg">
                              <div className="text-[10px] text-muted-foreground mb-0.5">월세</div>
                              <div className="font-semibold text-sm text-cyan-700">
                                {property.tenantRent ? formatPrice(property.tenantRent) : '-'}
                              </div>
                            </div>
                          </div>
                          <div className="p-2.5 bg-muted/30 rounded-lg">
                            <div className="text-[10px] text-muted-foreground mb-0.5">계약 만료일</div>
                            <div className="font-medium text-sm">
                              {property.tenantLeaseEnd || '미정'}
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full h-8 text-xs gap-1.5 hover:bg-cyan-50 hover:text-cyan-700 hover:border-cyan-200"
                          >
                            <User className="size-3" />
                            세입자 상세 보기
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center py-5 text-sm text-muted-foreground bg-muted/30 rounded-lg">
                          <ClipboardList className="size-6 mx-auto mb-2 text-muted-foreground/50" />
                          세입자 없음
                        </div>
                      )}
                    </Card>
                  </div>

                  {/* 2열: 매칭 현황 + 시세/실거래가 */}
                  <div className="space-y-4">
                    {/* 소유주 정보 */}
                    <Card className="p-4 hover:shadow-md transition-shadow">
                      <h3 className="font-semibold flex items-center gap-2 mb-3 text-sm">
                        <div className="size-6 rounded-md bg-violet-500/10 flex items-center justify-center">
                          <User className="size-3.5 text-violet-500" />
                        </div>
                        소유주 정보
                      </h3>
                      {property.ownerName ? (
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-2.5 bg-gradient-to-r from-violet-50/50 to-transparent rounded-lg">
                            <div className="size-11 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">
                              {property.ownerName[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-base">{property.ownerName}</div>
                              <div className="text-sm text-muted-foreground truncate">
                                {property.ownerPhone}
                              </div>
                            </div>
                          </div>
                          <Button size="sm" variant="outline" className="w-full h-9 gap-2 hover:bg-violet-50 hover:text-violet-700 hover:border-violet-200 transition-colors">
                            <Phone className="size-4" />
                            전화걸기
                          </Button>
                        </div>
                      ) : (
                        <div className="text-center py-5 text-sm text-muted-foreground bg-muted/30 rounded-lg">
                          소유주 정보 없음
                        </div>
                      )}
                    </Card>

                    {/* 상담 내역 */}
                    <Card className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold flex items-center gap-2 text-sm">
                          <div className="size-6 rounded-md bg-emerald-500/10 flex items-center justify-center">
                            <MessageSquare className="size-3.5 text-emerald-500" />
                          </div>
                          상담 내역
                          {ownerConsultations.length > 0 && (
                            <span className="text-xs text-muted-foreground font-normal">({ownerConsultations.length})</span>
                          )}
                        </h3>
                        <Button
                          size="sm"
                          variant={showQuickConsultation ? "secondary" : "ghost"}
                          className="h-7 w-7 p-0 hover:bg-emerald-50 hover:text-emerald-600"
                          onClick={() => setShowQuickConsultation(!showQuickConsultation)}
                          title="빠른 추가"
                        >
                          <Plus className="size-4" />
                        </Button>
                      </div>

                      {/* 빠른 상담 추가 인라인 폼 */}
                      {showQuickConsultation && (
                        <div className="mb-3 p-3 bg-emerald-50/50 rounded-lg border border-emerald-100 space-y-2.5">
                          <Select
                            value={quickConsultationResult}
                            onValueChange={(value) => setQuickConsultationResult(value as ConsultationResult)}
                          >
                            <SelectTrigger className="h-8 text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pending">대기</SelectItem>
                              <SelectItem value="interested">관심</SelectItem>
                              <SelectItem value="priceInquiry">가격문의</SelectItem>
                              <SelectItem value="callback">재연락</SelectItem>
                              <SelectItem value="rejected">비관심</SelectItem>
                              <SelectItem value="other">기타</SelectItem>
                            </SelectContent>
                          </Select>
                          <textarea
                            className="w-full h-16 px-2.5 py-2 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-300"
                            placeholder="상담 내용을 입력하세요..."
                            value={quickConsultationContent}
                            onChange={(e) => setQuickConsultationContent(e.target.value)}
                            autoFocus
                          />
                          <div className="flex justify-end gap-1.5">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-xs px-2.5"
                              onClick={() => {
                                setShowQuickConsultation(false)
                                setQuickConsultationContent('')
                                setQuickConsultationResult('pending')
                              }}
                            >
                              취소
                            </Button>
                            <Button
                              size="sm"
                              className="h-7 text-xs px-3 bg-emerald-500 hover:bg-emerald-600"
                              onClick={handleQuickConsultation}
                              disabled={!quickConsultationContent.trim()}
                            >
                              <Save className="size-3 mr-1" />
                              저장
                            </Button>
                          </div>
                        </div>
                      )}

                      {ownerConsultations.length > 0 ? (
                        <div className="space-y-2">
                          {ownerConsultations.slice(0, 3).map((consultation, index) => {
                            const resultStyles: Record<string, string> = {
                              interested: 'bg-green-50 text-green-700 border-green-200',
                              rejected: 'bg-red-50 text-red-700 border-red-200',
                              callback: 'bg-blue-50 text-blue-700 border-blue-200',
                              priceInquiry: 'bg-orange-50 text-orange-700 border-orange-200',
                              pending: 'bg-gray-50 text-gray-600 border-gray-200',
                              other: 'bg-gray-50 text-gray-600 border-gray-200',
                            }
                            return (
                              <div
                                key={consultation.id}
                                className={`p-2.5 rounded-lg border transition-colors hover:bg-muted/30 ${
                                  index === 0 ? 'bg-muted/50' : 'bg-background'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1.5">
                                  <Badge
                                    variant="outline"
                                    className={`text-[10px] px-1.5 py-0 border ${resultStyles[consultation.result] || resultStyles.other}`}
                                  >
                                    {consultation.result === 'interested' ? '관심' :
                                     consultation.result === 'rejected' ? '비관심' :
                                     consultation.result === 'callback' ? '재연락' :
                                     consultation.result === 'priceInquiry' ? '가격문의' :
                                     consultation.result === 'pending' ? '대기' : '기타'}
                                  </Badge>
                                  <span className="text-[10px] text-muted-foreground">
                                    {new Date(consultation.date).toLocaleDateString('ko-KR')}
                                  </span>
                                </div>
                                {consultation.content && (
                                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{consultation.content}</p>
                                )}
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-5 text-sm text-muted-foreground bg-muted/30 rounded-lg">
                          상담 내역 없음
                        </div>
                      )}
                    </Card>
                  </div>

                  {/* 3열: 시세/실거래가 + 호가 변동 */}
                  <div className="space-y-4">
                    <Card className="p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold flex items-center gap-2 text-sm">
                          <div className="size-6 rounded-md bg-rose-500/10 flex items-center justify-center">
                            <Users className="size-3.5 text-rose-500" />
                          </div>
                          매칭 현황
                        </h3>
                        {propertyMatches.length > 0 && (
                          <Badge variant="secondary" className="text-xs font-medium">
                            {propertyMatches.length}건
                          </Badge>
                        )}
                      </div>
                      {propertyMatches.length > 0 ? (
                        <div className="space-y-2">
                          {propertyMatches.slice(0, 5).map((match, index) => {
                            const buyerReq = buyerRequirements.find(b => b.id === match.buyerReqId)
                            const buyerContact = buyerReq ? contacts.find(c => c.id === buyerReq.contactId) : null
                            const stageLabels: Record<string, { label: string; color: string; bgColor: string }> = {
                              suggested: { label: '제안', color: 'text-gray-700', bgColor: 'bg-gray-100' },
                              contacted: { label: '연락', color: 'text-blue-700', bgColor: 'bg-blue-100' },
                              viewing: { label: '방문', color: 'text-purple-700', bgColor: 'bg-purple-100' },
                              interested: { label: '관심', color: 'text-green-700', bgColor: 'bg-green-100' },
                              negotiating: { label: '협상', color: 'text-amber-700', bgColor: 'bg-amber-100' },
                              dealCreated: { label: '거래', color: 'text-primary', bgColor: 'bg-primary/10' },
                              rejected: { label: '거절', color: 'text-red-700', bgColor: 'bg-red-100' },
                            }
                            const stage = stageLabels[match.stage] || { label: match.stage, color: 'text-gray-700', bgColor: 'bg-gray-100' }
                            const avatarColors = [
                              'from-rose-400 to-pink-500',
                              'from-blue-400 to-indigo-500',
                              'from-emerald-400 to-teal-500',
                              'from-amber-400 to-orange-500',
                              'from-purple-400 to-violet-500',
                            ]

                            return (
                              <div
                                key={match.id}
                                className="flex items-center justify-between p-2.5 rounded-lg border hover:bg-muted/30 transition-colors"
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className={`size-9 rounded-full bg-gradient-to-br ${avatarColors[index % avatarColors.length]} flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-sm`}>
                                    {buyerContact?.name?.[0] || '?'}
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-medium text-sm truncate">{buyerContact?.name || '고객'}</div>
                                    <div className="text-xs text-muted-foreground truncate">
                                      예산 {formatPrice(buyerReq?.budgetMax || 0)}
                                    </div>
                                  </div>
                                </div>
                                <Badge className={`${stage.bgColor} ${stage.color} border-0 text-[10px] px-2 py-0.5 font-medium`}>
                                  {stage.label}
                                </Badge>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-sm text-muted-foreground bg-muted/30 rounded-lg">
                          <Users className="size-8 mx-auto mb-2 text-muted-foreground/50" />
                          매칭된 고객 없음
                        </div>
                      )}
                    </Card>

                    {/* 시세/실거래가 */}
                    <Card className="p-4 hover:shadow-md transition-shadow">
                      <h3 className="font-semibold flex items-center gap-2 mb-3 text-sm">
                        <div className="size-6 rounded-md bg-sky-500/10 flex items-center justify-center">
                          <TrendingUp className="size-3.5 text-sky-500" />
                        </div>
                        시세/실거래가
                      </h3>
                      {marketPrice ? (
                        <div className="space-y-3">
                          {/* 시세 정보 */}
                          <div className="p-3 bg-gradient-to-r from-sky-50/80 to-transparent rounded-lg border border-sky-100">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-sm font-medium text-sky-900">시세</span>
                              {marketPrice.changePercentFromLastMonth !== undefined && (
                                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                                  marketPrice.changePercentFromLastMonth >= 0
                                    ? 'bg-red-100 text-red-700'
                                    : 'bg-blue-100 text-blue-700'
                                }`}>
                                  {marketPrice.changePercentFromLastMonth >= 0 ? '▲' : '▼'}
                                  {Math.abs(marketPrice.changePercentFromLastMonth).toFixed(1)}%
                                </span>
                              )}
                            </div>
                            <div className="text-xl font-bold text-sky-700">{formatPrice(marketPrice.avgPrice)}</div>
                            <div className="text-xs text-muted-foreground mt-1">
                              {formatPrice(marketPrice.lowPrice)} ~ {formatPrice(marketPrice.highPrice)}
                            </div>
                          </div>
                          {/* 시세 대비 */}
                          {(() => {
                            const diff = property.price - marketPrice.avgPrice
                            const diffPercent = (diff / marketPrice.avgPrice) * 100
                            return (
                              <div className={`text-sm p-2.5 rounded-lg font-medium text-center ${
                                diffPercent > 5
                                  ? 'bg-red-50 text-red-700 border border-red-100'
                                  : diffPercent < -5
                                  ? 'bg-blue-50 text-blue-700 border border-blue-100'
                                  : 'bg-green-50 text-green-700 border border-green-100'
                              }`}>
                                시세 대비 {diffPercent >= 0 ? '+' : ''}{diffPercent.toFixed(1)}%
                                <span className="font-normal ml-1">
                                  ({diffPercent > 5 ? '고가' : diffPercent < -5 ? '저가' : '적정'})
                                </span>
                              </div>
                            )
                          })()}
                        </div>
                      ) : (
                        <div className="text-center py-5 text-sm text-muted-foreground bg-muted/30 rounded-lg">
                          시세 정보 없음
                        </div>
                      )}

                      {buildingTransactions.length > 0 && (
                        <>
                          <Separator className="my-3" />
                          <div>
                            <div className="text-xs font-medium text-muted-foreground mb-2 flex items-center gap-1">
                              최근 실거래
                              <Badge variant="outline" className="text-[9px] px-1.5 py-0 ml-1">
                                {buildingTransactions.length}건
                              </Badge>
                            </div>
                            <div className="space-y-1.5">
                              {buildingTransactions.slice(0, 3).map((tx, index) => (
                                <div
                                  key={tx.id}
                                  className={`flex justify-between items-center text-xs p-2 rounded-md transition-colors ${
                                    index === 0 ? 'bg-muted/70' : 'bg-muted/30 hover:bg-muted/50'
                                  }`}
                                >
                                  <span className="text-muted-foreground">
                                    {new Date(tx.transactionDate).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}
                                  </span>
                                  <span className="font-semibold">{formatPrice(tx.price)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </>
                      )}
                    </Card>

                    {/* 호가 변동 */}
                    {property.priceChangePercent !== undefined && property.priceChangePercent !== null && (
                      <Card className="p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold flex items-center gap-2 text-sm">
                            <div className="size-6 rounded-md bg-orange-500/10 flex items-center justify-center">
                              <Banknote className="size-3.5 text-orange-500" />
                            </div>
                            호가 변동
                          </h3>
                          <Badge
                            className={`text-[10px] px-2 py-0.5 ${
                              property.priceChangePercent < 0
                                ? 'bg-blue-100 text-blue-700'
                                : property.priceChangePercent > 0
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                            }`}
                          >
                            {property.priceChangePercent >= 0 ? '+' : ''}
                            {property.priceChangePercent.toFixed(1)}%
                          </Badge>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex justify-between items-center p-2 rounded-md text-xs bg-orange-50 border border-orange-100">
                            <span className="text-muted-foreground">현재가</span>
                            <span className="font-semibold text-orange-700">{formatPrice(property.price)}</span>
                          </div>
                          {property.initialPrice && (
                            <div className="flex justify-between items-center p-2 rounded-md text-xs bg-muted/30">
                              <span className="text-muted-foreground">최초 등록가</span>
                              <span className="font-semibold">{formatPrice(property.initialPrice)}</span>
                            </div>
                          )}
                        </div>
                      </Card>
                    )}
                  </div>
                </div>
              </ScrollArea>

              {/* Footer - 미니멀하게 */}
              <div className="pt-3 mt-2 border-t shrink-0 flex justify-end">
                <Button variant="ghost" size="sm" onClick={handleClose} className="text-muted-foreground hover:text-foreground">
                  닫기
                </Button>
              </div>
            </>
          ) : (
            /* ========== 수정 모드 ========== */
            <>
              <DialogHeader className="pb-4 border-b shrink-0">
                <DialogTitle className="flex items-center gap-2">
                  <Pencil className="size-5 text-primary" />
                  매물 정보 수정
                  <Badge variant="outline" className="ml-2 font-normal">
                    {pFull.buildingName || ''} {pFull.dongName || ''} {pFull.unitName || ''}
                  </Badge>
                </DialogTitle>
              </DialogHeader>

              <ScrollArea className="flex-1 -mx-6 px-6">
                <div className="space-y-6 py-4">
                  {/* 기본 정보 */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">기본 정보</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">상태</label>
                        <Select
                          value={editForm.status}
                          onValueChange={(value) => setEditForm({ ...editForm, status: value as PropertyStatus })}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(statusConfig).map(([key, { label }]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">거래유형</label>
                        <Select
                          value={editForm.transactionType}
                          onValueChange={(value) => setEditForm({ ...editForm, transactionType: value as TransactionType })}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(transactionLabels).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">매물유형</label>
                        <Select
                          value={editForm.type}
                          onValueChange={(value) => setEditForm({ ...editForm, type: value as PropertyType })}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(typeLabels).map(([key, label]) => (
                              <SelectItem key={key} value={key}>{label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* 매물 위치 정보 (읽기 전용 - 건물/동/호 구조에서 제공) */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">건물명</label>
                        <Input
                          value={pFull.buildingName || ''}
                          disabled
                          className="h-9 bg-muted/50"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">동</label>
                        <Input
                          value={pFull.dongName || ''}
                          disabled
                          className="h-9 bg-muted/50"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">호수</label>
                        <Input
                          value={pFull.unitName || ''}
                          disabled
                          className="h-9 bg-muted/50"
                        />
                      </div>
                    </div>

                    {/* 면적/가격 */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">면적 (평)</label>
                        <Input
                          type="number"
                          value={editForm.area || ''}
                          onChange={(e) => setEditForm({ ...editForm, area: e.target.value ? Number(e.target.value) : undefined })}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">
                          {editForm.transactionType === 'sale' ? '매매가 (만원)' : '보증금 (만원)'}
                        </label>
                        <Input
                          type="number"
                          value={editForm.price ? editForm.price / 10000 : ''}
                          onChange={(e) => setEditForm({ ...editForm, price: e.target.value ? Number(e.target.value) * 10000 : 0 })}
                          className="h-9"
                        />
                      </div>
                      {editForm.transactionType === 'monthly' && (
                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground">월세 (만원)</label>
                          <Input
                            type="number"
                            value={editForm.monthlyRent ? editForm.monthlyRent / 10000 : ''}
                            onChange={(e) => setEditForm({ ...editForm, monthlyRent: e.target.value ? Number(e.target.value) * 10000 : undefined })}
                            className="h-9"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* 소유주 정보 */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-muted-foreground">소유주 정보</h4>
                      {isOwnerSaved && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <Check className="h-3 w-3" />
                          저장됨
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">
                          이름 <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={editForm.ownerName || ''}
                          onChange={(e) => {
                            setEditForm({ ...editForm, ownerName: e.target.value })
                            setIsOwnerSaved(false)
                          }}
                          disabled={isOwnerSaved}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">
                          연락처 <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={editForm.ownerPhone || ''}
                          onChange={(e) => {
                            setEditForm({ ...editForm, ownerPhone: e.target.value })
                            setIsOwnerSaved(false)
                          }}
                          placeholder="010-0000-0000"
                          disabled={isOwnerSaved}
                          className="h-9"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">연락처2</label>
                        <Input
                          value={editForm.ownerPhone2 || ''}
                          onChange={(e) => {
                            setEditForm({ ...editForm, ownerPhone2: e.target.value })
                            setIsOwnerSaved(false)
                          }}
                          placeholder="선택사항"
                          disabled={isOwnerSaved}
                          className="h-9"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant={isOwnerSaved ? "outline" : "default"}
                        onClick={handleSaveOwner}
                        disabled={isOwnerSaved || !editForm.ownerName || !editForm.ownerPhone}
                      >
                        {isOwnerSaved ? (
                          <>
                            <Check className="h-3 w-3 mr-1" />
                            소유주 저장 완료
                          </>
                        ) : (
                          '소유주 저장'
                        )}
                      </Button>
                      {!isOwnerSaved && editForm.ownerName && editForm.ownerPhone && (
                        <span className="text-xs text-orange-600">
                          매물 저장 전 소유주를 먼저 저장해주세요
                        </span>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* 세입자/입주 정보 */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">세입자/입주 정보</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">세입자 여부</label>
                        <Select
                          value={editForm.hasTenant ? 'yes' : 'no'}
                          onValueChange={(value) => setEditForm({ ...editForm, hasTenant: value === 'yes' })}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="no">없음</SelectItem>
                            <SelectItem value="yes">있음</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">입주유형</label>
                        <Select
                          value={editForm.moveInType || 'immediate'}
                          onValueChange={(value) => setEditForm({ ...editForm, moveInType: value as 'immediate' | 'date' | 'negotiable' })}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="immediate">즉시</SelectItem>
                            <SelectItem value="date">날짜지정</SelectItem>
                            <SelectItem value="negotiable">협의</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">입주가능일</label>
                        <Input
                          value={editForm.moveInDate || ''}
                          onChange={(e) => setEditForm({ ...editForm, moveInDate: e.target.value })}
                          placeholder="예: 즉시, 3월 중순"
                          className="h-9"
                        />
                      </div>
                    </div>
                    {editForm.hasTenant && (
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground">세입자 보증금 (만원)</label>
                          <Input
                            type="number"
                            value={editForm.tenantDeposit ? editForm.tenantDeposit / 10000 : ''}
                            onChange={(e) => setEditForm({ ...editForm, tenantDeposit: e.target.value ? Number(e.target.value) * 10000 : undefined })}
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground">세입자 월세 (만원)</label>
                          <Input
                            type="number"
                            value={editForm.tenantRent ? editForm.tenantRent / 10000 : ''}
                            onChange={(e) => setEditForm({ ...editForm, tenantRent: e.target.value ? Number(e.target.value) * 10000 : undefined })}
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs text-muted-foreground">계약만료</label>
                          <Input
                            value={editForm.tenantLeaseEnd || ''}
                            onChange={(e) => setEditForm({ ...editForm, tenantLeaseEnd: e.target.value })}
                            placeholder="예: 2025년 3월"
                            className="h-9"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* 담당자/메모 */}
                  <div className="space-y-4">
                    <h4 className="text-sm font-medium text-muted-foreground">관리 정보</h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">담당자</label>
                        <Select
                          value={editForm.assignedTo || ''}
                          onValueChange={(value) => setEditForm({ ...editForm, assignedTo: value })}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {users.map((user) => (
                              <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs text-muted-foreground">
                          정보확인일
                          <span className={`ml-2 ${getVerificationColorClass(property.infoVerifiedAt)}`}>
                            ({getDaysAgo(property.infoVerifiedAt)})
                          </span>
                        </label>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full h-9"
                          onClick={handleVerifyInfo}
                          disabled={isSaving}
                        >
                          <RefreshCw className="size-4 mr-2" />
                          정보 확인 갱신
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs text-muted-foreground">메모</label>
                      <textarea
                        className="w-full h-20 px-3 py-2 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                        value={editForm.memo || ''}
                        onChange={(e) => setEditForm({ ...editForm, memo: e.target.value })}
                        placeholder="메모를 입력하세요"
                      />
                    </div>
                  </div>
                </div>
              </ScrollArea>

              <DialogFooter className="pt-4 border-t shrink-0">
                <Button variant="outline" onClick={handleCancelEdit}>
                  취소
                </Button>
                <Button onClick={handleSave} disabled={isSaving}>
                  <Save className="size-4 mr-2" />
                  {isSaving ? '저장 중...' : '저장'}
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* 상담 추가 다이얼로그 */}
      <Dialog open={showConsultationDialog} onOpenChange={setShowConsultationDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="size-5" />
              상담 내역 추가
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">상담 결과</label>
              <Select
                value={consultationForm.result}
                onValueChange={(value) => setConsultationForm({ ...consultationForm, result: value as ConsultationResult })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">대기</SelectItem>
                  <SelectItem value="interested">관심</SelectItem>
                  <SelectItem value="priceInquiry">가격문의</SelectItem>
                  <SelectItem value="callback">재연락</SelectItem>
                  <SelectItem value="rejected">비관심</SelectItem>
                  <SelectItem value="other">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">상담 내용</label>
              <textarea
                className="w-full h-24 px-3 py-2 rounded-md border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="상담 내용을 입력하세요"
                value={consultationForm.content}
                onChange={(e) => setConsultationForm({ ...consultationForm, content: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">희망 가격 (만원)</label>
              <Input
                type="number"
                placeholder="희망 가격을 입력하세요"
                value={consultationForm.desiredPrice}
                onChange={(e) => setConsultationForm({ ...consultationForm, desiredPrice: e.target.value })}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium">다음 연락 예정일</label>
              <Input
                type="date"
                value={consultationForm.nextContactDate}
                onChange={(e) => setConsultationForm({ ...consultationForm, nextContactDate: e.target.value })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConsultationDialog(false)}>
              취소
            </Button>
            <Button onClick={handleCreateConsultation} disabled={isSaving}>
              <Save className="size-4 mr-2" />
              {isSaving ? '저장 중...' : '저장'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
