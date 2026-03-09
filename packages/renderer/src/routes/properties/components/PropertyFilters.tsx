import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Search, X, Eye, EyeOff, Map, List, SlidersHorizontal } from 'lucide-react'
import type { FilterState } from '../hooks/usePropertyFilters'
import type { PropertyType, PropertyStatus } from '@/types'
import { typeLabels, statusConfig } from '../utils'

interface PropertyFiltersProps {
  filters: FilterState
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>
  showFilters: boolean
  setShowFilters: (show: boolean) => void
  showHidden: boolean
  setShowHidden: (show: boolean) => void
  activeFilterCount: number
  resetFilters: () => void
  hiddenCount: number
  viewMode: 'list' | 'map'
  setViewMode: (mode: 'list' | 'map') => void
}

export function PropertyFilters({
  filters,
  setFilters,
  showFilters,
  setShowFilters,
  showHidden,
  setShowHidden,
  activeFilterCount,
  resetFilters,
  hiddenCount,
  viewMode,
  setViewMode,
}: PropertyFiltersProps) {
  return (
    <Card className="p-4">
      <div className="flex gap-4 items-center">
        {/* 거래 유형 퀵 필터 - ToggleGroup 사용 */}
        <ToggleGroup
          type="single"
          value={filters.transactionType}
          onValueChange={(value) => {
            if (value) setFilters({ ...filters, transactionType: value as FilterState['transactionType'] })
          }}
          className="bg-muted p-1 rounded-lg"
        >
          <ToggleGroupItem value="all" className="text-xs px-3 data-[state=on]:bg-background data-[state=on]:shadow-sm">
            전체
          </ToggleGroupItem>
          <ToggleGroupItem value="sale" className="text-xs px-3 data-[state=on]:bg-background data-[state=on]:shadow-sm">
            매매
          </ToggleGroupItem>
          <ToggleGroupItem value="lease" className="text-xs px-3 data-[state=on]:bg-background data-[state=on]:shadow-sm">
            전세
          </ToggleGroupItem>
          <ToggleGroupItem value="monthly" className="text-xs px-3 data-[state=on]:bg-background data-[state=on]:shadow-sm">
            월세
          </ToggleGroupItem>
        </ToggleGroup>

        {/* 상태 필터 - Select 컴포넌트 사용 */}
        <Select
          value={filters.status}
          onValueChange={(value) => setFilters({ ...filters, status: value as PropertyStatus | 'all' })}
        >
          <SelectTrigger className="w-[130px] h-9">
            <SelectValue placeholder="상태 선택" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">상태: 전체</SelectItem>
            {Object.entries(statusConfig).map(([key, { label }]) => (
              <SelectItem key={key} value={key}>{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 검색 */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="매물명, 동/호, 소유주, 전화번호 검색..."
            value={filters.searchQuery}
            onChange={(e) => setFilters({ ...filters, searchQuery: e.target.value })}
            className="pl-9 h-9"
          />
        </div>

        {/* 상세 필터 토글 */}
        <Button
          variant={showFilters ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="gap-1.5"
        >
          <SlidersHorizontal className="size-4" />
          필터
          {activeFilterCount > 0 && (
            <Badge variant="default" className="ml-1 px-1.5 py-0 text-xs rounded-full">
              {activeFilterCount}
            </Badge>
          )}
        </Button>

        {/* 숨긴 매물 보기 토글 */}
        <Button
          variant={showHidden ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => setShowHidden(!showHidden)}
          className="gap-1.5"
        >
          {showHidden ? (
            <>
              <Eye className="size-4" />
              <span className="hidden sm:inline">숨김</span>
              <Badge variant="destructive" className="px-1.5 py-0 text-xs rounded-full">
                {hiddenCount}
              </Badge>
            </>
          ) : (
            <>
              <EyeOff className="size-4" />
              <span className="hidden sm:inline">숨김</span>
            </>
          )}
        </Button>

        {/* 뷰 모드 토글 - ToggleGroup 사용 */}
        <ToggleGroup
          type="single"
          value={viewMode}
          onValueChange={(value) => {
            if (value) setViewMode(value as 'list' | 'map')
          }}
          className="border rounded-lg"
        >
          <ToggleGroupItem value="list" className="px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
            <List className="size-4 mr-1" />
            <span className="hidden sm:inline text-xs">목록</span>
          </ToggleGroupItem>
          <ToggleGroupItem value="map" className="px-3 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground">
            <Map className="size-4 mr-1" />
            <span className="hidden sm:inline text-xs">지도</span>
          </ToggleGroupItem>
        </ToggleGroup>
      </div>

      {/* 상세 필터 패널 */}
      {showFilters && (
        <div className="mt-4 pt-4 border-t">
          <div className="grid grid-cols-6 gap-4">
            {/* 매물 유형 */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">유형</Label>
              <Select
                value={filters.propertyType}
                onValueChange={(value) => setFilters({ ...filters, propertyType: value as PropertyType | 'all' })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {Object.entries(typeLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 면적 범위 */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">면적 (평)</Label>
              <div className="flex gap-1 items-center">
                <Input
                  type="number"
                  placeholder="최소"
                  className="h-8 text-sm"
                  value={filters.areaMin || ''}
                  onChange={(e) => setFilters({ ...filters, areaMin: e.target.value ? Number(e.target.value) : undefined })}
                />
                <span className="text-muted-foreground text-xs">~</span>
                <Input
                  type="number"
                  placeholder="최대"
                  className="h-8 text-sm"
                  value={filters.areaMax || ''}
                  onChange={(e) => setFilters({ ...filters, areaMax: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
            </div>

            {/* 가격 범위 */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">가격 (억)</Label>
              <div className="flex gap-1 items-center">
                <Input
                  type="number"
                  placeholder="최소"
                  className="h-8 text-sm"
                  value={filters.priceMin || ''}
                  onChange={(e) => setFilters({ ...filters, priceMin: e.target.value ? Number(e.target.value) : undefined })}
                />
                <span className="text-muted-foreground text-xs">~</span>
                <Input
                  type="number"
                  placeholder="최대"
                  className="h-8 text-sm"
                  value={filters.priceMax || ''}
                  onChange={(e) => setFilters({ ...filters, priceMax: e.target.value ? Number(e.target.value) : undefined })}
                />
              </div>
            </div>

            {/* 입주일 유형 */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">입주</Label>
              <Select
                value={filters.moveInType}
                onValueChange={(value) => setFilters({ ...filters, moveInType: value as 'all' | 'immediate' | 'date' | 'negotiable' })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  <SelectItem value="immediate">즉시</SelectItem>
                  <SelectItem value="date">날짜지정</SelectItem>
                  <SelectItem value="negotiable">협의</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 입주 가능 월 */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">입주 가능 (월까지)</Label>
              <Select
                value={filters.moveInMonth?.toString() || 'all'}
                onValueChange={(value) => setFilters({ ...filters, moveInMonth: value === 'all' ? undefined : Number(value) })}
              >
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="전체" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">전체</SelectItem>
                  {Array.from({ length: 12 }, (_, i) => (
                    <SelectItem key={i + 1} value={(i + 1).toString()}>{i + 1}월</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 필터 초기화 */}
            <div className="flex items-end">
              <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 text-muted-foreground hover:text-foreground">
                <X className="size-4 mr-1" />
                초기화
              </Button>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}
