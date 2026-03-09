import { useState, useMemo } from 'react'
import type { Property, PropertyType, TransactionType, PropertyStatus } from '@/types'

export interface FilterState {
  transactionType: TransactionType | 'all'
  propertyType: PropertyType | 'all'
  status: PropertyStatus | 'all'
  searchQuery: string
  areaMin?: number
  areaMax?: number
  priceMin?: number
  priceMax?: number
  moveInType: 'all' | 'immediate' | 'date' | 'negotiable'
  moveInMonth?: number
}

const initialFilters: FilterState = {
  transactionType: 'all',
  propertyType: 'all',
  status: 'all',
  searchQuery: '',
  moveInType: 'all',
}

export function usePropertyFilters(properties: Property[]) {
  const [filters, setFilters] = useState<FilterState>(initialFilters)
  const [showFilters, setShowFilters] = useState(false)
  const [showHidden, setShowHidden] = useState(false)

  const filteredProperties = useMemo(() => {
    return properties.filter((property) => {
      // 숨김 필터
      if (!showHidden && property.isHidden) {
        return false
      }
      if (showHidden && !property.isHidden) {
        return false
      }

      // 거래 유형 필터
      if (filters.transactionType !== 'all' && property.transactionType !== filters.transactionType) {
        return false
      }

      // 매물 유형 필터
      if (filters.propertyType !== 'all' && property.type !== filters.propertyType) {
        return false
      }

      // 상태 필터
      if (filters.status !== 'all' && property.status !== filters.status) {
        return false
      }

      // 면적 범위 필터
      if (filters.areaMin && (!property.area || property.area < filters.areaMin)) {
        return false
      }
      if (filters.areaMax && (!property.area || property.area > filters.areaMax)) {
        return false
      }

      // 가격 범위 필터 (억 단위로 입력)
      if (filters.priceMin && property.price < filters.priceMin * 100000000) {
        return false
      }
      if (filters.priceMax && property.price > filters.priceMax * 100000000) {
        return false
      }

      // 입주일 유형 필터
      if (filters.moveInType !== 'all' && property.moveInType !== filters.moveInType) {
        return false
      }

      // 입주 가능 월 필터 (moveInDate is now a display string like "즉시", "2월 중순")
      // Skip month-based filtering since moveInDate is no longer a parseable date

      // 검색어 필터
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase()
        // PropertyFull view provides buildingName, dongName, unitName
        const pFull = property as typeof property & { buildingName?: string; dongName?: string; unitName?: string }
        return (
          (pFull.buildingName || '').toLowerCase().includes(query) ||
          (pFull.dongName || '').toLowerCase().includes(query) ||
          (pFull.unitName || '').toLowerCase().includes(query) ||
          property.ownerName.toLowerCase().includes(query) ||
          property.ownerPhone.includes(query) ||
          property.tags.some((tag) => tag.toLowerCase().includes(query)) ||
          (property.unitType || '').toLowerCase().includes(query)
        )
      }

      return true
    })
  }, [properties, filters, showHidden])

  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.transactionType !== 'all') count++
    if (filters.propertyType !== 'all') count++
    if (filters.status !== 'all') count++
    if (filters.areaMin || filters.areaMax) count++
    if (filters.priceMin || filters.priceMax) count++
    if (filters.moveInType !== 'all') count++
    if (filters.moveInMonth) count++
    return count
  }, [filters])

  const resetFilters = () => {
    setFilters(initialFilters)
  }

  const updateFilter = <K extends keyof FilterState>(key: K, value: FilterState[K]) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  return {
    filters,
    setFilters,
    showFilters,
    setShowFilters,
    showHidden,
    setShowHidden,
    filteredProperties,
    activeFilterCount,
    resetFilters,
    updateFilter,
  }
}
