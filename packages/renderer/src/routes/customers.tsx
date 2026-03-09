import { createRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import {
  buildingsApi,
  dongsApi,
  unitsApi,
  ownershipsApi,
  contactsApi,
  consultationsApi,
  usersApi,
} from '@/api'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import {
  Plus,
  Search,
  Phone,
  Building2,
  Home,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  User,
  MessageSquare,
  Calendar,
  MapPin,
  FileText,
  ArrowLeft,
  LayoutList,
  FolderTree,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { RootRoute } from '@tanstack/react-router'
import type {
  Building,
  BuildingType,
  Unit,
  Ownership,
  ConsultationResult,
} from '@/types'

// 건물 유형 한글 매핑
const buildingTypeLabels: Record<BuildingType, string> = {
  apartment: '아파트',
  officetel: '오피스텔',
  villa: '빌라',
  house: '단독주택',
  commercial: '상가',
  land: '토지',
  living_accommodation: '생활숙박시설',
}

// 상담 결과 한글 매핑
const consultationResultLabels: Record<ConsultationResult, string> = {
  interested: '관심있음',
  rejected: '거절',
  pending: '보류',
  priceInquiry: '가격문의',
  callback: '재연락요청',
  other: '기타',
}

// 건물 아이콘 컴포넌트
function BuildingIcon({ type }: { type: BuildingType }) {
  switch (type) {
    case 'apartment':
    case 'officetel':
    case 'living_accommodation':
      return <Building2 className="size-4" />
    case 'villa':
    case 'house':
      return <Home className="size-4" />
    default:
      return <Building2 className="size-4" />
  }
}

function CustomersPage() {
  const queryClient = useQueryClient()
  const [buildingSearchQuery, setBuildingSearchQuery] = useState('')
  const [unitSearchQuery, setUnitSearchQuery] = useState('')
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null)
  const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null)
  const [selectedDongFilter, setSelectedDongFilter] = useState<string>('all')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [buildingGroupBy, setBuildingGroupBy] = useState<'none' | 'region' | 'type'>('none')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())

  // 모달 상태
  const [showAddBuildingModal, setShowAddBuildingModal] = useState(false)
  const [showAddDongModal, setShowAddDongModal] = useState(false)
  const [showAddUnitModal, setShowAddUnitModal] = useState(false)
  const [showAddOwnerModal, setShowAddOwnerModal] = useState(false)
  const [showAddConsultationModal, setShowAddConsultationModal] = useState(false)

  // 새 데이터 폼 상태
  const [newBuilding, setNewBuilding] = useState({
    type: 'apartment' as BuildingType,
    name: '',
    address: '',
  })
  const [newDong, setNewDong] = useState({ name: '' })
  const [newUnit, setNewUnit] = useState({ name: '', area: '', dongId: '' })
  const [newOwner, setNewOwner] = useState({ name: '', phone: '', phone2: '' })
  const [newConsultation, setNewConsultation] = useState({
    content: '',
    result: 'pending' as ConsultationResult,
    nextContactDate: '',
    desiredPrice: '',
  })
  const [selectedOwnershipForConsultation, setSelectedOwnershipForConsultation] =
    useState<Ownership | null>(null)

  // 데이터 쿼리
  const { data: buildings = [] } = useQuery({
    queryKey: ['buildings'],
    queryFn: buildingsApi.getAll,
  })

  const { data: dongs = [] } = useQuery({
    queryKey: ['dongs'],
    queryFn: dongsApi.getAll,
  })

  const { data: units = [] } = useQuery({
    queryKey: ['units'],
    queryFn: unitsApi.getAll,
  })

  const { data: ownerships = [] } = useQuery({
    queryKey: ['ownerships'],
    queryFn: ownershipsApi.getAll,
  })

  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: contactsApi.getAll,
  })

  const { data: consultations = [] } = useQuery({
    queryKey: ['consultations'],
    queryFn: consultationsApi.getAll,
  })

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
  })

  // Mutations
  const createBuildingMutation = useMutation({
    mutationFn: buildingsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['buildings'] })
      setShowAddBuildingModal(false)
      setNewBuilding({ type: 'apartment', name: '', address: '' })
    },
  })

  const createDongMutation = useMutation({
    mutationFn: dongsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dongs'] })
      setShowAddDongModal(false)
      setNewDong({ name: '' })
    },
  })

  const createUnitMutation = useMutation({
    mutationFn: unitsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['units'] })
      setShowAddUnitModal(false)
      setNewUnit({ name: '', area: '', dongId: '' })
    },
  })

  const createContactMutation = useMutation({
    mutationFn: contactsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contacts'] })
    },
  })

  const createOwnershipMutation = useMutation({
    mutationFn: ownershipsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ownerships'] })
      setShowAddOwnerModal(false)
      setNewOwner({ name: '', phone: '', phone2: '' })
    },
  })

  const createConsultationMutation = useMutation({
    mutationFn: consultationsApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consultations'] })
      setShowAddConsultationModal(false)
      setNewConsultation({
        content: '',
        result: 'pending',
        nextContactDate: '',
        desiredPrice: '',
      })
      setSelectedOwnershipForConsultation(null)
    },
  })

  // 주소에서 지역(구/동) 추출
  const extractRegion = (address: string): string => {
    // "서울시 강남구 대치동" -> "강남구 대치동"
    const match = address.match(/([가-힣]+구)\s*([가-힣]+동)?/)
    if (match) {
      return match[2] ? `${match[1]} ${match[2]}` : match[1]
    }
    // 구가 없으면 시/군 단위로
    const cityMatch = address.match(/([가-힣]+[시군])/)
    return cityMatch ? cityMatch[1] : '기타'
  }

  // 건물 검색 필터링
  const filteredBuildings = useMemo(() => {
    if (!buildingSearchQuery) return buildings
    const q = buildingSearchQuery.toLowerCase()
    return buildings.filter(
      (b) =>
        b.name.toLowerCase().includes(q) || (b.address?.toLowerCase().includes(q) ?? false),
    )
  }, [buildings, buildingSearchQuery])

  // 그룹화된 건물 목록
  const groupedBuildings = useMemo(() => {
    const filtered = filteredBuildings

    if (buildingGroupBy === 'none') {
      return null // 그룹화 없음
    }

    const groups: Record<string, Building[]> = {}

    filtered.forEach((building) => {
      let groupKey: string

      if (buildingGroupBy === 'region') {
        groupKey = extractRegion(building.address || '')
      } else {
        groupKey = buildingTypeLabels[building.type]
      }

      if (!groups[groupKey]) {
        groups[groupKey] = []
      }
      groups[groupKey].push(building)
    })

    // 정렬된 그룹 반환
    return Object.entries(groups).sort((a, b) => a[0].localeCompare(b[0], 'ko'))
  }, [filteredBuildings, buildingGroupBy])

  // 그룹 토글
  const toggleGroup = (groupKey: string) => {
    const newExpanded = new Set(expandedGroups)
    if (newExpanded.has(groupKey)) {
      newExpanded.delete(groupKey)
    } else {
      newExpanded.add(groupKey)
    }
    setExpandedGroups(newExpanded)
  }

  // 선택된 건물의 동 목록
  const selectedBuildingDongs = useMemo(() => {
    if (!selectedBuilding) return []
    return dongs.filter((d) => d.buildingId === selectedBuilding.id)
  }, [selectedBuilding, dongs])

  // 선택된 건물의 호수 목록 (동 필터 + 검색 적용)
  const filteredUnits = useMemo(() => {
    if (!selectedBuilding) return []

    let buildingUnits = units.filter((u) => u.buildingId === selectedBuilding.id)

    // 동 필터
    if (selectedDongFilter !== 'all') {
      buildingUnits = buildingUnits.filter((u) => u.dongId === selectedDongFilter)
    }

    // 검색 필터
    if (unitSearchQuery) {
      const q = unitSearchQuery.toLowerCase()
      buildingUnits = buildingUnits.filter((u) => {
        // 호수명 검색
        if (u.name.toLowerCase().includes(q)) return true

        // 소유자명/전화번호 검색
        const unitOwnerships = ownerships.filter(
          (o) => o.unitId === u.id && o.status === 'active',
        )
        for (const ownership of unitOwnerships) {
          const contact = contacts.find((c) => c.id === ownership.contactId)
          if (
            contact?.name.toLowerCase().includes(q) ||
            contact?.phone.includes(q)
          ) {
            return true
          }
        }
        return false
      })
    }

    return buildingUnits
  }, [
    selectedBuilding,
    units,
    selectedDongFilter,
    unitSearchQuery,
    ownerships,
    contacts,
  ])

  // 선택된 호수의 소유자 정보 가져오기
  const selectedUnitOwners = useMemo(() => {
    if (!selectedUnit) return []
    return ownerships
      .filter((o) => o.unitId === selectedUnit.id && o.status === 'active')
      .map((o) => ({
        ownership: o,
        contact: contacts.find((c) => c.id === o.contactId),
      }))
      .filter((o) => o.contact)
  }, [selectedUnit, ownerships, contacts])

  // 선택된 호수의 상담 기록 가져오기
  const selectedUnitConsultations = useMemo(() => {
    if (!selectedUnit) return []
    const ownershipIds = ownerships
      .filter((o) => o.unitId === selectedUnit.id)
      .map((o) => o.id)
    return consultations
      .filter((c) => c.ownershipId && ownershipIds.includes(c.ownershipId))
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [selectedUnit, ownerships, consultations])

  // 호수의 소유자 정보 가져오기 (리스트용)
  const getUnitOwners = (unitId: string) => {
    return ownerships
      .filter((o) => o.unitId === unitId && o.status === 'active')
      .map((o) => contacts.find((c) => c.id === o.contactId))
      .filter(Boolean)
  }

  // 건물 선택 핸들러
  const handleBuildingClick = (building: Building) => {
    setSelectedBuilding(building)
    setSelectedUnit(null)
    setSelectedDongFilter('all')
    setUnitSearchQuery('')
  }

  // 호수 클릭 핸들러
  const handleUnitClick = (unit: Unit) => {
    setSelectedUnit(unit)
  }

  // 뒤로가기 (호수 상세 → 호수 목록)
  const handleBackToList = () => {
    setSelectedUnit(null)
  }

  // 건물 추가 핸들러
  const handleAddBuilding = () => {
    if (!newBuilding.name || !newBuilding.address) return
    createBuildingMutation.mutate(newBuilding)
  }

  // 동 추가 핸들러
  const handleAddDong = () => {
    if (!newDong.name || !selectedBuilding) return
    createDongMutation.mutate({
      buildingId: selectedBuilding.id,
      name: newDong.name,
    })
  }

  // 호수 추가 핸들러
  const handleAddUnit = () => {
    if (!newUnit.name || !selectedBuilding) return
    createUnitMutation.mutate({
      buildingId: selectedBuilding.id,
      dongId: newUnit.dongId || null,
      name: newUnit.name,
      area: newUnit.area ? Number(newUnit.area) : undefined,
    })
  }

  // 소유자 추가 핸들러
  const handleAddOwner = async () => {
    if (!newOwner.name || !newOwner.phone || !selectedUnit) return

    const contact = await createContactMutation.mutateAsync({
      name: newOwner.name,
      phone: newOwner.phone,
      phone2: newOwner.phone2 || undefined,
      tags: [],
    })

    createOwnershipMutation.mutate({
      contactId: contact.id,
      unitId: selectedUnit.id,
      status: 'active',
    })
  }

  // 상담 기록 추가 핸들러
  const handleAddConsultation = () => {
    if (!newConsultation.content || !selectedOwnershipForConsultation) return

    createConsultationMutation.mutate({
      contactId: selectedOwnershipForConsultation.contactId,
      ownershipId: selectedOwnershipForConsultation.id,
      date: new Date(),
      content: newConsultation.content,
      result: newConsultation.result,
      nextContactDate: newConsultation.nextContactDate
        ? new Date(newConsultation.nextContactDate)
        : undefined,
      desiredPrice: newConsultation.desiredPrice
        ? Number(newConsultation.desiredPrice) * 10000
        : undefined,
      createdBy: users[0]?.id || 'user-1',
    })
  }

  // 담당자 이름 가져오기
  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    return user?.name || '미지정'
  }

  // 가격 포맷팅
  const formatPrice = (price: number) => {
    if (price >= 100000000) {
      return `${(price / 100000000).toFixed(1)}억`
    }
    return `${(price / 10000).toLocaleString()}만원`
  }

  return (
    <div className="flex h-[calc(100vh-3rem)] -m-6">
      {/* Secondary Sidebar - Building List */}
      <aside
        className={cn(
          'border-r bg-card flex flex-col transition-all duration-300 ease-in-out',
          sidebarCollapsed ? 'w-12' : 'w-64',
        )}
      >
        {/* Sidebar Header */}
        <div className="h-14 flex items-center justify-between px-3 border-b">
          {!sidebarCollapsed && (
            <div className="flex items-center gap-2">
              <Building2 className="size-5 text-primary" />
              <span className="font-semibold">건물 목록</span>
            </div>
          )}
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className={sidebarCollapsed ? 'mx-auto' : ''}
          >
            {sidebarCollapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </Button>
        </div>

        {/* Search & Group Options */}
        {!sidebarCollapsed && (
          <div className="p-2 border-b space-y-2">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="건물명/주소 검색..."
                value={buildingSearchQuery}
                onChange={(e) => setBuildingSearchQuery(e.target.value)}
                className="pl-8 h-8 text-sm"
              />
            </div>
            {/* 그룹화 옵션 */}
            <div className="flex gap-1">
              <Button
                variant={buildingGroupBy === 'none' ? 'secondary' : 'ghost'}
                size="sm"
                className="flex-1 h-7 text-xs"
                onClick={() => setBuildingGroupBy('none')}
              >
                <LayoutList className="size-3 mr-1" />
                전체
              </Button>
              <Button
                variant={buildingGroupBy === 'region' ? 'secondary' : 'ghost'}
                size="sm"
                className="flex-1 h-7 text-xs"
                onClick={() => {
                  setBuildingGroupBy('region')
                  // 모든 그룹 펼치기
                  if (groupedBuildings) {
                    setExpandedGroups(new Set(groupedBuildings.map(([key]) => key)))
                  }
                }}
              >
                <MapPin className="size-3 mr-1" />
                지역
              </Button>
              <Button
                variant={buildingGroupBy === 'type' ? 'secondary' : 'ghost'}
                size="sm"
                className="flex-1 h-7 text-xs"
                onClick={() => {
                  setBuildingGroupBy('type')
                  // 모든 그룹 펼치기
                  if (groupedBuildings) {
                    setExpandedGroups(new Set(groupedBuildings.map(([key]) => key)))
                  }
                }}
              >
                <FolderTree className="size-3 mr-1" />
                유형
              </Button>
            </div>
          </div>
        )}

        {/* Building List */}
        <ScrollArea className="flex-1">
          {sidebarCollapsed ? (
            <div className="p-1 space-y-1">
              {buildings.slice(0, 15).map((building) => (
                <Button
                  key={building.id}
                  variant={selectedBuilding?.id === building.id ? 'secondary' : 'ghost'}
                  size="icon-sm"
                  className="w-full"
                  title={building.name}
                  onClick={() => {
                    handleBuildingClick(building)
                    setSidebarCollapsed(false)
                  }}
                >
                  <BuildingIcon type={building.type} />
                </Button>
              ))}
              {buildings.length > 15 && (
                <div className="text-xs text-center text-muted-foreground py-1">
                  +{buildings.length - 15}
                </div>
              )}
            </div>
          ) : buildingGroupBy === 'none' ? (
            // 그룹화 없음 - 플랫 리스트
            <div className="p-2 space-y-0.5">
              {filteredBuildings.map((building) => (
                <div
                  key={building.id}
                  className={cn(
                    'flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer text-sm',
                    selectedBuilding?.id === building.id && 'bg-accent',
                  )}
                  onClick={() => handleBuildingClick(building)}
                >
                  <BuildingIcon type={building.type} />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{building.name}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {building.address || ''}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 shrink-0">
                    {buildingTypeLabels[building.type].slice(0, 2)}
                  </Badge>
                </div>
              ))}
              {filteredBuildings.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-8">
                  검색 결과가 없습니다
                </div>
              )}
            </div>
          ) : (
            // 그룹화된 리스트
            <div className="p-2 space-y-1">
              {groupedBuildings?.map(([groupKey, groupBuildings]) => (
                <div key={groupKey}>
                  {/* 그룹 헤더 */}
                  <div
                    className="flex items-center gap-1.5 p-1.5 rounded-md hover:bg-accent cursor-pointer text-sm font-medium"
                    onClick={() => toggleGroup(groupKey)}
                  >
                    {expandedGroups.has(groupKey) ? (
                      <ChevronDown className="size-3.5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="size-3.5 text-muted-foreground" />
                    )}
                    <span className="flex-1">{groupKey}</span>
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {groupBuildings.length}
                    </Badge>
                  </div>

                  {/* 그룹 내 건물들 */}
                  {expandedGroups.has(groupKey) && (
                    <div className="ml-3 space-y-0.5">
                      {groupBuildings.map((building) => (
                        <div
                          key={building.id}
                          className={cn(
                            'flex items-center gap-2 p-2 rounded-md hover:bg-accent cursor-pointer text-sm',
                            selectedBuilding?.id === building.id && 'bg-accent',
                          )}
                          onClick={() => handleBuildingClick(building)}
                        >
                          <BuildingIcon type={building.type} />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{building.name}</div>
                            <div className="text-xs text-muted-foreground truncate">
                              {buildingGroupBy === 'region'
                                ? buildingTypeLabels[building.type]
                                : extractRegion(building.address || '')}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {groupedBuildings?.length === 0 && (
                <div className="text-sm text-muted-foreground text-center py-8">
                  검색 결과가 없습니다
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Add Building Button */}
        {!sidebarCollapsed && (
          <div className="p-2 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setShowAddBuildingModal(true)}
            >
              <Plus className="size-4 mr-1" />
              건물 추가
            </Button>
          </div>
        )}
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {selectedUnit ? (
          // Unit Detail View
          <div className="flex-1 overflow-auto p-6">
            {/* Back Button & Header */}
            <div className="flex items-center gap-4 mb-6">
              <Button variant="ghost" size="sm" onClick={handleBackToList}>
                <ArrowLeft className="size-4 mr-1" />
                목록으로
              </Button>
            </div>

            <div className="space-y-6">
              <Card className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">
                      {selectedBuilding?.name}{' '}
                      {dongs.find((d) => d.id === selectedUnit.dongId)?.name || ''}{' '}
                      {selectedUnit.name}
                    </h2>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="size-3" />
                      {selectedBuilding?.address}
                    </p>
                  </div>
                  <Button variant="outline">
                    <FileText className="size-4 mr-2" />
                    매물 등록
                  </Button>
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-6">
                {/* Unit Info */}
                <Card className="p-4">
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <Home className="size-4" />
                    기본 정보
                  </h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">유형</span>
                      <span>
                        {buildingTypeLabels[selectedBuilding?.type || 'apartment']}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">면적</span>
                      <span>{selectedUnit.area ? `${selectedUnit.area}평` : '미등록'}</span>
                    </div>
                  </div>
                </Card>

                {/* Owners */}
                <Card className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium flex items-center gap-2">
                      <User className="size-4" />
                      소유자 ({selectedUnitOwners.length}명)
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddOwnerModal(true)}
                    >
                      <Plus className="size-4 mr-1" />
                      추가
                    </Button>
                  </div>
                  {selectedUnitOwners.length === 0 ? (
                    <p className="text-sm text-muted-foreground">등록된 소유자가 없습니다</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedUnitOwners.map(({ ownership, contact }) => (
                        <div
                          key={ownership.id}
                          className="p-3 border rounded-lg flex items-center justify-between"
                        >
                          <div>
                            <p className="font-medium">{contact?.name}</p>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              <Phone className="size-3" />
                              {contact?.phone}
                              {contact?.phone2 && ` / ${contact.phone2}`}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {ownership.shareRatio && (
                              <Badge variant="outline">{ownership.shareRatio}%</Badge>
                            )}
                            {ownership.isResident && <Badge variant="secondary">본인거주</Badge>}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedOwnershipForConsultation(ownership)
                                setShowAddConsultationModal(true)
                              }}
                            >
                              <MessageSquare className="size-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>

              {/* Consultations */}
              <Card className="p-4">
                <h3 className="font-medium mb-3 flex items-center gap-2">
                  <MessageSquare className="size-4" />
                  상담 기록 ({selectedUnitConsultations.length}건)
                </h3>
                {selectedUnitConsultations.length === 0 ? (
                  <p className="text-sm text-muted-foreground">상담 기록이 없습니다</p>
                ) : (
                  <div className="space-y-3">
                    {selectedUnitConsultations.map((consultation) => {
                      const ownership = ownerships.find(
                        (o) => o.id === consultation.ownershipId,
                      )
                      const contact = contacts.find((c) => c.id === ownership?.contactId)

                      return (
                        <div key={consultation.id} className="p-3 border rounded-lg">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">
                                  {contact?.name || '알 수 없음'}
                                </span>
                                <Badge variant="outline" className="text-xs">
                                  {consultationResultLabels[consultation.result]}
                                </Badge>
                              </div>
                              <p className="text-sm">{consultation.content}</p>
                              {consultation.desiredPrice && (
                                <p className="text-sm text-muted-foreground mt-1">
                                  희망가: {formatPrice(consultation.desiredPrice)}
                                </p>
                              )}
                            </div>
                            <div className="text-xs text-muted-foreground text-right ml-4">
                              <p className="flex items-center gap-1 justify-end">
                                <Calendar className="size-3" />
                                {new Date(consultation.date).toLocaleDateString()}
                              </p>
                              {consultation.nextContactDate && (
                                <p className="mt-1 text-blue-600">
                                  재연락:{' '}
                                  {new Date(consultation.nextContactDate).toLocaleDateString()}
                                </p>
                              )}
                              <p className="mt-1">담당: {getUserName(consultation.createdBy)}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </Card>
            </div>
          </div>
        ) : selectedBuilding ? (
          // Building Unit List View
          <>
            {/* Header */}
            <div className="p-4 border-b bg-card">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-xl font-semibold">{selectedBuilding.name}</h2>
                  <p className="text-sm text-muted-foreground flex items-center gap-1">
                    <MapPin className="size-3" />
                    {selectedBuilding.address}
                  </p>
                </div>
                <div className="flex gap-2">
                  {selectedBuilding.type !== 'house' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowAddDongModal(true)}
                    >
                      <Plus className="size-4 mr-1" />
                      동 추가
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddUnitModal(true)}
                  >
                    <Plus className="size-4 mr-1" />
                    호 추가
                  </Button>
                </div>
              </div>

              {/* Filters */}
              <div className="flex gap-3">
                {/* 동 필터 */}
                {selectedBuilding.type !== 'house' && selectedBuildingDongs.length > 0 && (
                  <Select
                    value={selectedDongFilter}
                    onValueChange={setSelectedDongFilter}
                  >
                    <SelectTrigger className="w-32 h-8">
                      <SelectValue placeholder="동 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">전체 동</SelectItem>
                      {selectedBuildingDongs.map((dong) => (
                        <SelectItem key={dong.id} value={dong.id}>
                          {dong.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}

                {/* 검색 */}
                <div className="relative flex-1 max-w-xs">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="호수, 소유자명, 전화번호 검색..."
                    value={unitSearchQuery}
                    onChange={(e) => setUnitSearchQuery(e.target.value)}
                    className="pl-8 h-8"
                  />
                </div>

                <div className="text-sm text-muted-foreground flex items-center">
                  총 {filteredUnits.length}개 호수
                </div>
              </div>
            </div>

            {/* Unit List */}
            <ScrollArea className="flex-1">
              <div className="p-4">
                {filteredUnits.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <Home className="size-12 mx-auto mb-3 opacity-30" />
                    <p>
                      {unitSearchQuery
                        ? '검색 결과가 없습니다'
                        : '등록된 호수가 없습니다'}
                    </p>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {filteredUnits.map((unit) => {
                      const dong = dongs.find((d) => d.id === unit.dongId)
                      const owners = getUnitOwners(unit.id)

                      return (
                        <div
                          key={unit.id}
                          className="flex items-center gap-4 p-3 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                          onClick={() => handleUnitClick(unit)}
                        >
                          <div className="flex items-center gap-2 min-w-[120px]">
                            <Home className="size-4 text-muted-foreground" />
                            <span className="font-medium">
                              {dong?.name} {unit.name}
                            </span>
                          </div>

                          {unit.area && (
                            <Badge variant="outline" className="shrink-0">
                              {unit.area}평
                            </Badge>
                          )}

                          <div className="flex-1 min-w-0">
                            {owners.length > 0 ? (
                              <div className="flex items-center gap-4 text-sm">
                                {owners.slice(0, 2).map((owner) => (
                                  <div
                                    key={owner?.id}
                                    className="flex items-center gap-2 text-muted-foreground"
                                  >
                                    <User className="size-3" />
                                    <span>{owner?.name}</span>
                                    <span className="text-xs">{owner?.phone}</span>
                                  </div>
                                ))}
                                {owners.length > 2 && (
                                  <span className="text-xs text-muted-foreground">
                                    +{owners.length - 2}명
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-sm text-muted-foreground">
                                소유자 미등록
                              </span>
                            )}
                          </div>

                          <ChevronRight className="size-4 text-muted-foreground shrink-0" />
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </ScrollArea>
          </>
        ) : (
          // Empty State
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center text-muted-foreground">
              <Building2 className="size-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium mb-1">건물을 선택하세요</h3>
              <p className="text-sm">왼쪽에서 건물을 선택하면 호수 목록이 표시됩니다</p>
            </div>
          </div>
        )}
      </main>

      {/* Add Building Modal */}
      <Dialog open={showAddBuildingModal} onOpenChange={setShowAddBuildingModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>건물 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>건물 유형</Label>
              <Select
                value={newBuilding.type}
                onValueChange={(v) =>
                  setNewBuilding({ ...newBuilding, type: v as BuildingType })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="apartment">아파트</SelectItem>
                  <SelectItem value="officetel">오피스텔</SelectItem>
                  <SelectItem value="villa">빌라</SelectItem>
                  <SelectItem value="house">단독주택</SelectItem>
                  <SelectItem value="commercial">상가</SelectItem>
                  <SelectItem value="land">토지</SelectItem>
                  <SelectItem value="living_accommodation">생활숙박시설</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>건물명</Label>
              <Input
                placeholder="예: 래미안자이"
                value={newBuilding.name}
                onChange={(e) => setNewBuilding({ ...newBuilding, name: e.target.value })}
              />
            </div>
            <div>
              <Label>주소</Label>
              <Input
                placeholder="예: 서울시 강남구 대치동 123-45"
                value={newBuilding.address}
                onChange={(e) =>
                  setNewBuilding({ ...newBuilding, address: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddBuildingModal(false)}>
              취소
            </Button>
            <Button onClick={handleAddBuilding}>추가</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Dong Modal */}
      <Dialog open={showAddDongModal} onOpenChange={setShowAddDongModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>동 추가 - {selectedBuilding?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>동 이름</Label>
              <Input
                placeholder="예: 101동"
                value={newDong.name}
                onChange={(e) => setNewDong({ ...newDong, name: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDongModal(false)}>
              취소
            </Button>
            <Button onClick={handleAddDong}>추가</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Unit Modal */}
      <Dialog open={showAddUnitModal} onOpenChange={setShowAddUnitModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>호수 추가 - {selectedBuilding?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedBuilding?.type !== 'house' && selectedBuildingDongs.length > 0 && (
              <div>
                <Label>동 선택</Label>
                <Select
                  value={newUnit.dongId}
                  onValueChange={(v) => setNewUnit({ ...newUnit, dongId: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="동을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedBuildingDongs.map((dong) => (
                      <SelectItem key={dong.id} value={dong.id}>
                        {dong.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div>
              <Label>호수</Label>
              <Input
                placeholder="예: 1001호"
                value={newUnit.name}
                onChange={(e) => setNewUnit({ ...newUnit, name: e.target.value })}
              />
            </div>
            <div>
              <Label>면적 (평, 선택)</Label>
              <Input
                type="number"
                placeholder="예: 32"
                value={newUnit.area}
                onChange={(e) => setNewUnit({ ...newUnit, area: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddUnitModal(false)}>
              취소
            </Button>
            <Button onClick={handleAddUnit}>추가</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Owner Modal */}
      <Dialog open={showAddOwnerModal} onOpenChange={setShowAddOwnerModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>소유자 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>이름</Label>
              <Input
                placeholder="소유자 이름"
                value={newOwner.name}
                onChange={(e) => setNewOwner({ ...newOwner, name: e.target.value })}
              />
            </div>
            <div>
              <Label>전화번호</Label>
              <Input
                placeholder="010-0000-0000"
                value={newOwner.phone}
                onChange={(e) => setNewOwner({ ...newOwner, phone: e.target.value })}
              />
            </div>
            <div>
              <Label>추가 전화번호 (선택)</Label>
              <Input
                placeholder="02-0000-0000"
                value={newOwner.phone2}
                onChange={(e) => setNewOwner({ ...newOwner, phone2: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddOwnerModal(false)}>
              취소
            </Button>
            <Button onClick={handleAddOwner}>추가</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Consultation Modal */}
      <Dialog open={showAddConsultationModal} onOpenChange={setShowAddConsultationModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>상담 기록 추가</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>상담 내용</Label>
              <Textarea
                placeholder="상담 내용을 입력하세요"
                value={newConsultation.content}
                onChange={(e) =>
                  setNewConsultation({ ...newConsultation, content: e.target.value })
                }
              />
            </div>
            <div>
              <Label>결과</Label>
              <Select
                value={newConsultation.result}
                onValueChange={(v) =>
                  setNewConsultation({
                    ...newConsultation,
                    result: v as ConsultationResult,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="interested">관심있음</SelectItem>
                  <SelectItem value="rejected">거절</SelectItem>
                  <SelectItem value="pending">보류</SelectItem>
                  <SelectItem value="priceInquiry">가격문의</SelectItem>
                  <SelectItem value="callback">재연락요청</SelectItem>
                  <SelectItem value="other">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>다음 연락일 (선택)</Label>
              <Input
                type="date"
                value={newConsultation.nextContactDate}
                onChange={(e) =>
                  setNewConsultation({
                    ...newConsultation,
                    nextContactDate: e.target.value,
                  })
                }
              />
            </div>
            <div>
              <Label>희망 가격 (만원, 선택)</Label>
              <Input
                type="number"
                placeholder="예: 50000 (5억)"
                value={newConsultation.desiredPrice}
                onChange={(e) =>
                  setNewConsultation({
                    ...newConsultation,
                    desiredPrice: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddConsultationModal(false)}>
              취소
            </Button>
            <Button onClick={handleAddConsultation}>추가</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: '/customers',
    component: CustomersPage,
    getParentRoute: () => parentRoute,
  })
