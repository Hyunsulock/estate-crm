import { createRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useState, useMemo } from 'react'
import { networkGroupsApi, networkPostsApi, propertiesApi } from '@/api'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  Search,
  Users,
  Lock,
  Globe,
  MessageSquare,
  Home,
  Bell,
  TrendingUp,
  LayoutGrid,
  Table as TableIcon,
  Filter,
  Download,
} from 'lucide-react'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import type { RootRoute } from '@tanstack/react-router'
import type { NetworkPost, NetworkPostType, PropertyType, TransactionType } from '@/types'

type ViewMode = 'card' | 'table'

function NetworkPage() {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('card')
  const [postTypeFilter, setPostTypeFilter] = useState<NetworkPostType | 'all'>('all')
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<PropertyType | 'all'>('all')
  const [priceRangeFilter, setPriceRangeFilter] = useState<string>('all')

  const { data: groups = [], isLoading: groupsLoading } = useQuery({
    queryKey: ['networkGroups'],
    queryFn: networkGroupsApi.getAll,
  })

  const { data: allPosts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['networkPosts'],
    queryFn: networkPostsApi.getAll,
  })

  const { data: properties = [] } = useQuery({
    queryKey: ['properties'],
    queryFn: propertiesApi.getAll,
  })

  // 매물 타입 한글 매핑
  const propertyTypeLabels: Record<PropertyType, string> = {
    apartment: '아파트',
    officetel: '오피스텔',
    villa: '빌라',
    house: '단독주택',
    commercial: '상가',
    land: '토지',
  }

  // 거래 유형 한글 매핑
  const transactionLabels: Record<TransactionType, string> = {
    sale: '매매',
    lease: '전세',
    monthly: '월세',
  }

  // 게시글 타입별 설정
  const postTypeConfig: Record<
    NetworkPostType,
    { label: string; icon: typeof Home; color: string; bgColor: string }
  > = {
    property: {
      label: '매물공유',
      icon: Home,
      color: 'text-blue-700 dark:text-blue-300',
      bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    },
    requirement: {
      label: '구해요',
      icon: TrendingUp,
      color: 'text-green-700 dark:text-green-300',
      bgColor: 'bg-green-100 dark:bg-green-900/30',
    },
  }

  // 가격 포맷팅
  const formatPrice = (price: number) => {
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

  // 시간 포맷팅
  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - new Date(date).getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return '방금 전'
    if (diffMins < 60) return `${diffMins}분 전`
    if (diffHours < 24) return `${diffHours}시간 전`
    return `${diffDays}일 전`
  }

  // 필터링된 게시글
  const filteredPosts = useMemo(() => {
    let result = allPosts

    // 그룹 필터
    if (selectedGroupId) {
      result = result.filter((post) => post.groupId === selectedGroupId)
    }

    // 검색 필터
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (post) =>
          post.title.toLowerCase().includes(query) ||
          post.content.toLowerCase().includes(query),
      )
    }

    // 게시글 타입 필터
    if (postTypeFilter !== 'all') {
      result = result.filter((post) => post.type === postTypeFilter)
    }

    // 매물 타입 필터 (매물공유 게시글에만 적용)
    if (propertyTypeFilter !== 'all') {
      result = result.filter((post) => {
        if (post.type !== 'property' || !post.propertyId) return false
        const property = properties.find((p) => p.id === post.propertyId)
        return property?.type === propertyTypeFilter
      })
    }

    // 가격대 필터
    if (priceRangeFilter !== 'all') {
      result = result.filter((post) => {
        let price = 0
        if (post.type === 'property' && post.propertyId) {
          const property = properties.find((p) => p.id === post.propertyId)
          price = property?.price || 0
        } else if (post.requirements?.priceMin) {
          price = post.requirements.priceMin
        }

        const priceInBillion = price / 100000000

        switch (priceRangeFilter) {
          case '0-5':
            return priceInBillion < 5
          case '5-10':
            return priceInBillion >= 5 && priceInBillion < 10
          case '10-20':
            return priceInBillion >= 10 && priceInBillion < 20
          case '20+':
            return priceInBillion >= 20
          default:
            return true
        }
      })
    }

    return result
  }, [
    allPosts,
    selectedGroupId,
    searchQuery,
    postTypeFilter,
    propertyTypeFilter,
    priceRangeFilter,
    properties,
  ])

  // 테이블 컬럼 정의
  const columnHelper = createColumnHelper<NetworkPost>()

  const columns = useMemo(
    () => [
      columnHelper.accessor('type', {
        header: '타입',
        cell: (info) => {
          const config = postTypeConfig[info.getValue()]
          return (
            <Badge className={`${config.bgColor} ${config.color} border-0`}>
              {config.label}
            </Badge>
          )
        },
        size: 100,
      }),
      columnHelper.accessor('title', {
        header: '제목',
        cell: (info) => <div className="font-medium">{info.getValue()}</div>,
        size: 300,
      }),
      columnHelper.display({
        id: 'propertyInfo',
        header: '매물 정보',
        cell: ({ row }) => {
          const post = row.original
          if (post.type === 'property' && post.propertyId) {
            const property = properties.find((p) => p.id === post.propertyId)
            if (property) {
              return (
                <div className="text-sm">
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {propertyTypeLabels[property.type]}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {transactionLabels[property.transactionType]}
                    </Badge>
                  </div>
                  <div className="mt-1 text-muted-foreground">{property.area}평</div>
                </div>
              )
            }
          }
          return <span className="text-muted-foreground text-sm">-</span>
        },
        size: 200,
      }),
      columnHelper.display({
        id: 'price',
        header: '가격',
        cell: ({ row }) => {
          const post = row.original
          if (post.type === 'property' && post.propertyId) {
            const property = properties.find((p) => p.id === post.propertyId)
            if (property) {
              return (
                <div className="font-semibold text-primary">
                  {formatPrice(property.price)}
                </div>
              )
            }
          } else if (post.requirements?.priceMin && post.requirements?.priceMax) {
            return (
              <div className="text-sm text-muted-foreground">
                {formatPrice(post.requirements.priceMin)} ~{' '}
                {formatPrice(post.requirements.priceMax)}
              </div>
            )
          }
          return <span className="text-muted-foreground text-sm">-</span>
        },
        size: 150,
      }),
      columnHelper.display({
        id: 'location',
        header: '지역',
        cell: ({ row }) => {
          const post = row.original
          if (post.type === 'property' && post.propertyId) {
            const property = properties.find((p) => p.id === post.propertyId)
            if (property) {
              return (
                <div className="text-sm truncate max-w-[200px]">{property.unitType || ''}</div>
              )
            }
          } else if (post.requirements?.area) {
            return <div className="text-sm">{post.requirements.area}</div>
          }
          return <span className="text-muted-foreground text-sm">-</span>
        },
        size: 200,
      }),
      columnHelper.accessor('groupId', {
        header: '그룹',
        cell: (info) => {
          const group = groups.find((g) => g.id === info.getValue())
          return <div className="text-sm truncate max-w-[150px]">{group?.name || '-'}</div>
        },
        size: 150,
      }),
      columnHelper.accessor('createdAt', {
        header: '등록일',
        cell: (info) => (
          <div className="text-sm text-muted-foreground">
            {formatTimeAgo(info.getValue())}
          </div>
        ),
        size: 100,
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: () => (
          <div className="flex gap-1">
            <Button variant="ghost" size="sm">
              상세
            </Button>
            <Button size="sm">문의</Button>
          </div>
        ),
        size: 150,
      }),
    ],
    [columnHelper, properties, groups, postTypeConfig, propertyTypeLabels, transactionLabels],
  )

  const table = useReactTable({
    data: filteredPosts,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  } as any)

  // 엑셀 내보내기
  const handleExportToExcel = () => {
    const csvContent = [
      ['타입', '제목', '매물타입', '거래유형', '가격', '지역', '그룹', '등록일'],
      ...filteredPosts.map((post) => {
        const property = post.propertyId
          ? properties.find((p) => p.id === post.propertyId)
          : null
        const group = groups.find((g) => g.id === post.groupId)

        return [
          postTypeConfig[post.type].label,
          post.title,
          property ? propertyTypeLabels[property.type] : '-',
          property ? transactionLabels[property.transactionType] : '-',
          property
            ? formatPrice(property.price)
            : post.requirements?.priceMin
              ? `${formatPrice(post.requirements.priceMin)} ~ ${formatPrice(post.requirements.priceMax || 0)}`
              : '-',
          property
            ? (property.unitType || '')
            : post.requirements?.area || '-',
          group?.name || '-',
          new Date(post.createdAt).toLocaleDateString('ko-KR'),
        ]
      }),
    ]
      .map((row) => row.join(','))
      .join('\n')

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `네트워크_게시글_${new Date().toISOString().split('T')[0]}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 통계
  const totalGroups = groups.length
  const totalPosts = allPosts.length
  const propertyPosts = allPosts.filter((p) => p.type === 'property').length
  const requirementPosts = allPosts.filter((p) => p.type === 'requirement').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">네트워크 그룹</h1>
          <p className="text-muted-foreground mt-1">
            부동산 간 매물을 공유하고 실시간으로 매칭하세요
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Plus className="size-4 mr-2" />
            그룹 생성
          </Button>
          <Button>
            <Plus className="size-4 mr-2" />
            게시글 작성
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">참여 그룹</div>
          <div className="text-2xl font-bold mt-1">{totalGroups}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">전체 게시글</div>
          <div className="text-2xl font-bold mt-1">{totalPosts}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">매물 공유</div>
          <div className="text-2xl font-bold mt-1">{propertyPosts}</div>
        </Card>
        <Card className="p-4">
          <div className="text-sm text-muted-foreground">구해요</div>
          <div className="text-2xl font-bold mt-1">{requirementPosts}</div>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        {/* Groups Sidebar */}
        <div className="space-y-4">
          <Card className="p-4">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Users className="size-4" />
              내 그룹
            </h2>

            {groupsLoading ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">로딩 중...</p>
              </div>
            ) : groups.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-sm text-muted-foreground">참여 중인 그룹이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedGroupId(null)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedGroupId === null
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  }`}
                >
                  <div className="font-medium">전체 게시글</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    모든 그룹의 게시글
                  </div>
                </button>

                {groups.map((group) => {
                  const groupPosts = allPosts.filter((p) => p.groupId === group.id)
                  const isSelected = selectedGroupId === group.id

                  return (
                    <button
                      key={group.id}
                      onClick={() => setSelectedGroupId(group.id)}
                      className={`w-full text-left p-3 rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'hover:bg-accent'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{group.name}</div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs flex items-center gap-1">
                              {group.isPrivate ? (
                                <Lock className="size-3" />
                              ) : (
                                <Globe className="size-3" />
                              )}
                              {group.memberIds.length}명
                            </span>
                            <span className="text-xs">·</span>
                            <span className="text-xs">{groupPosts.length}개</span>
                          </div>
                        </div>
                        {groupPosts.length > 0 && (
                          <Badge variant="secondary" className="text-xs">
                            {groupPosts.length}
                          </Badge>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Posts Feed */}
        <div className="space-y-4">
          {/* Filters & View Toggle */}
          <Card className="p-4">
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="게시글 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              {/* Filters Row */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-2">
                  <Filter className="size-4 text-muted-foreground" />
                  <span className="text-sm font-medium">필터:</span>
                </div>

                {/* Post Type Filter */}
                <select
                  value={postTypeFilter}
                  onChange={(e) => setPostTypeFilter(e.target.value as any)}
                  className="px-3 py-1.5 text-sm border rounded-md bg-background"
                >
                  <option value="all">모든 타입</option>
                  <option value="property">매물공유</option>
                  <option value="requirement">구해요</option>
                </select>

                {/* Property Type Filter */}
                <select
                  value={propertyTypeFilter}
                  onChange={(e) => setPropertyTypeFilter(e.target.value as any)}
                  className="px-3 py-1.5 text-sm border rounded-md bg-background"
                >
                  <option value="all">모든 매물 타입</option>
                  <option value="apartment">아파트</option>
                  <option value="officetel">오피스텔</option>
                  <option value="villa">빌라</option>
                  <option value="house">단독주택</option>
                  <option value="commercial">상가</option>
                  <option value="land">토지</option>
                </select>

                {/* Price Range Filter */}
                <select
                  value={priceRangeFilter}
                  onChange={(e) => setPriceRangeFilter(e.target.value)}
                  className="px-3 py-1.5 text-sm border rounded-md bg-background"
                >
                  <option value="all">모든 가격대</option>
                  <option value="0-5">5억 이하</option>
                  <option value="5-10">5억 ~ 10억</option>
                  <option value="10-20">10억 ~ 20억</option>
                  <option value="20+">20억 이상</option>
                </select>

                <div className="ml-auto flex gap-2">
                  {/* Export Button */}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExportToExcel}
                    disabled={filteredPosts.length === 0}
                  >
                    <Download className="size-4 mr-2" />
                    Excel 내보내기
                  </Button>

                  {/* View Toggle */}
                  <div className="flex border rounded-md">
                    <Button
                      variant={viewMode === 'card' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('card')}
                      className="rounded-r-none"
                    >
                      <LayoutGrid className="size-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'table' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setViewMode('table')}
                      className="rounded-l-none"
                    >
                      <TableIcon className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Active Filters Count */}
              {(postTypeFilter !== 'all' ||
                propertyTypeFilter !== 'all' ||
                priceRangeFilter !== 'all') && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{filteredPosts.length}개의 게시글</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPostTypeFilter('all')
                      setPropertyTypeFilter('all')
                      setPriceRangeFilter('all')
                    }}
                  >
                    필터 초기화
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Posts List - Card View */}
          {viewMode === 'card' && (
            <>
              {postsLoading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">로딩 중...</p>
                </div>
              ) : filteredPosts.length === 0 ? (
                <Card className="p-12">
                  <div className="text-center">
                    <MessageSquare className="size-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">
                      {searchQuery || postTypeFilter !== 'all' || propertyTypeFilter !== 'all' || priceRangeFilter !== 'all'
                        ? '필터 조건에 맞는 게시글이 없습니다'
                        : '게시글이 없습니다'}
                    </p>
                  </div>
                </Card>
              ) : (
                <div className="space-y-4">
                  {filteredPosts.map((post) => {
                    const config = postTypeConfig[post.type]
                    const Icon = config.icon
                    const property = post.propertyId
                      ? properties.find((p) => p.id === post.propertyId)
                      : null
                    const group = groups.find((g) => g.id === post.groupId)

                    return (
                      <Card
                        key={post.id}
                        className="p-6 hover:shadow-md transition-shadow"
                      >
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${config.bgColor}`}>
                              <Icon className={`size-5 ${config.color}`} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <Badge
                                  className={`${config.bgColor} ${config.color} border-0`}
                                >
                                  {config.label}
                                </Badge>
                                {group && (
                                  <span className="text-sm text-muted-foreground">
                                    {group.name}
                                  </span>
                                )}
                              </div>
                              <h3 className="font-semibold mt-1">{post.title}</h3>
                            </div>
                          </div>
                          <Button variant="ghost" size="icon-sm">
                            <Bell className="size-4" />
                          </Button>
                        </div>

                        {/* Content */}
                        <p className="text-sm text-muted-foreground mb-4">{post.content}</p>

                        {/* Property Info (if property post) */}
                        {property && (
                          <div className="p-4 rounded-lg bg-muted mb-4">
                            <div className="flex items-start gap-4">
                              <div className="size-20 rounded bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/20 dark:to-blue-800/20 flex items-center justify-center flex-shrink-0">
                                <Home className="size-8 text-muted-foreground" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="outline" className="text-xs">
                                    {propertyTypeLabels[property.type]}
                                  </Badge>
                                  <Badge variant="secondary" className="text-xs">
                                    {transactionLabels[property.transactionType]}
                                  </Badge>
                                </div>
                                <p className="text-sm font-medium truncate">
                                  {property.unitType || ''}
                                </p>
                                <p className="text-xs text-muted-foreground truncate mt-1">
                                  {property.unitType || ''}
                                </p>
                                <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                                  <span>{property.area}평</span>
                                  <span className="font-semibold text-primary">
                                    {formatPrice(property.price)}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Requirements Info (if requirement post) */}
                        {post.requirements && (
                          <div className="p-4 rounded-lg bg-muted mb-4">
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <span className="text-muted-foreground">지역:</span>{' '}
                                <span className="font-medium">{post.requirements.area}</span>
                              </div>
                              {post.requirements.propertyType && (
                                <div>
                                  <span className="text-muted-foreground">유형:</span>{' '}
                                  <span className="font-medium">
                                    {propertyTypeLabels[post.requirements.propertyType]}
                                  </span>
                                </div>
                              )}
                              {post.requirements.transactionType && (
                                <div>
                                  <span className="text-muted-foreground">거래:</span>{' '}
                                  <span className="font-medium">
                                    {transactionLabels[post.requirements.transactionType]}
                                  </span>
                                </div>
                              )}
                              {post.requirements.priceMin && post.requirements.priceMax && (
                                <div>
                                  <span className="text-muted-foreground">가격:</span>{' '}
                                  <span className="font-medium">
                                    {formatPrice(post.requirements.priceMin)} ~{' '}
                                    {formatPrice(post.requirements.priceMax)}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-4 border-t">
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(post.createdAt)}
                          </span>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              상세보기
                            </Button>
                            <Button size="sm">
                              <MessageSquare className="size-3.5 mr-1.5" />
                              문의하기
                            </Button>
                          </div>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </>
          )}

          {/* Posts List - Table View */}
          {viewMode === 'table' && (
            <Card className="overflow-hidden">
              {postsLoading ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">로딩 중...</p>
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="p-12 text-center">
                  <MessageSquare className="size-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">
                    {searchQuery || postTypeFilter !== 'all' || propertyTypeFilter !== 'all' || priceRangeFilter !== 'all'
                      ? '필터 조건에 맞는 게시글이 없습니다'
                      : '게시글이 없습니다'}
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-muted/50">
                      {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <th
                              key={header.id}
                              className="px-4 py-3 text-left text-sm font-medium"
                              style={{ width: header.getSize() }}
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext(),
                                  )}
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody className="divide-y">
                      {table.getRowModel().rows.map((row) => (
                        <tr
                          key={row.id}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id} className="px-4 py-3 text-sm">
                              {flexRender(
                                cell.column.columnDef.cell,
                                cell.getContext(),
                              )}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: '/network',
    component: NetworkPage,
    getParentRoute: () => parentRoute,
  })
