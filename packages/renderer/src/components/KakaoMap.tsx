import { useEffect, useRef, useState } from 'react'
import type { Property, PropertyLocation } from '@/types'

// Kakao Maps 타입 선언
declare global {
  interface Window {
    kakao: any
  }
}

interface KakaoMapProps {
  properties: Property[]
  locations: PropertyLocation[]
  onPropertyClick?: (propertyId: string) => void
  selectedPropertyId?: string
  center?: { lat: number; lng: number }
  zoom?: number
  className?: string
}

// 매물 유형별 마커 색상
const propertyTypeColors: Record<string, string> = {
  apartment: '#3B82F6', // blue
  officetel: '#8B5CF6', // purple
  villa: '#10B981', // green
  house: '#F59E0B', // amber
  commercial: '#EF4444', // red
  land: '#6B7280', // gray
}

// 거래 유형별 라벨
const transactionTypeLabels: Record<string, string> = {
  sale: '매매',
  lease: '전세',
  monthly: '월세',
}

export function KakaoMap({
  properties,
  locations,
  onPropertyClick,
  selectedPropertyId,
  center = { lat: 37.5172, lng: 127.0473 }, // 강남구 기본
  zoom = 5,
  className = '',
}: KakaoMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [markers, setMarkers] = useState<any[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 카카오맵 스크립트 로드
  useEffect(() => {
    const KAKAO_APP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY || 'YOUR_KAKAO_APP_KEY'

    if (KAKAO_APP_KEY === 'YOUR_KAKAO_APP_KEY') {
      setError('카카오맵 API 키가 설정되지 않았습니다. VITE_KAKAO_MAP_KEY 환경변수를 설정해주세요.')
      return
    }

    // 이미 완전히 로드되어 있으면 스킵
    if (window.kakao?.maps?.LatLng) {
      console.log('[KakaoMap] Already fully loaded')
      setIsLoaded(true)
      return
    }

    // 스크립트가 이미 있는지 확인
    const existingScript = document.querySelector('script[src*="dapi.kakao.com"]')

    if (existingScript) {
      // 스크립트가 이미 로드 중이면 주기적으로 확인
      const checkKakao = setInterval(() => {
        if (window.kakao?.maps?.LatLng) {
          clearInterval(checkKakao)
          console.log('[KakaoMap] Loaded via existing script')
          setIsLoaded(true)
        } else if (window.kakao?.maps?.load) {
          clearInterval(checkKakao)
          window.kakao.maps.load(() => {
            console.log('[KakaoMap] Initialized via load()')
            setIsLoaded(true)
          })
        }
      }, 100)

      setTimeout(() => {
        clearInterval(checkKakao)
        if (!isLoaded) {
          setError('카카오맵 로드 시간이 초과되었습니다.')
        }
      }, 5000)
      return
    }

    // 새 스크립트 로드 (autoload=false 사용)
    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&autoload=false`
    script.async = true

    script.onload = () => {
      console.log('[KakaoMap] Script loaded')
      if (window.kakao?.maps?.load) {
        window.kakao.maps.load(() => {
          console.log('[KakaoMap] Maps API initialized via load()')
          setIsLoaded(true)
        })
      } else {
        setError('카카오맵 초기화에 실패했습니다.')
      }
    }

    script.onerror = () => {
      setError('카카오맵 스크립트 로드에 실패했습니다.')
    }

    document.head.appendChild(script)
  }, [])

  // 지도 초기화
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !window.kakao) return

    const options = {
      center: new window.kakao.maps.LatLng(center.lat, center.lng),
      level: zoom,
    }

    const newMap = new window.kakao.maps.Map(mapRef.current, options)
    setMap(newMap)

    // 지도 컨트롤 추가
    const zoomControl = new window.kakao.maps.ZoomControl()
    newMap.addControl(zoomControl, window.kakao.maps.ControlPosition.RIGHT)

    const mapTypeControl = new window.kakao.maps.MapTypeControl()
    newMap.addControl(mapTypeControl, window.kakao.maps.ControlPosition.TOPRIGHT)
  }, [isLoaded, center.lat, center.lng, zoom])

  // 마커 생성 및 업데이트
  useEffect(() => {
    if (!map || !window.kakao) return

    // 기존 마커 제거
    markers.forEach((marker) => marker.setMap(null))

    const newMarkers: any[] = []

    locations.forEach((location) => {
      const property = properties.find((p) => p.id === location.propertyId)
      if (!property) return

      const position = new window.kakao.maps.LatLng(location.latitude, location.longitude)

      // 커스텀 오버레이 내용
      const isSelected = selectedPropertyId === property.id
      const color = propertyTypeColors[property.type] || '#6B7280'
      const priceText = formatPrice(property.price)
      const typeLabel = transactionTypeLabels[property.transactionType] || ''

      // 마커 이미지 (원형)
      const markerSize = isSelected ? 40 : 32
      const markerImage = new window.kakao.maps.MarkerImage(
        `data:image/svg+xml,${encodeURIComponent(`
          <svg xmlns="http://www.w3.org/2000/svg" width="${markerSize}" height="${markerSize}" viewBox="0 0 ${markerSize} ${markerSize}">
            <circle cx="${markerSize / 2}" cy="${markerSize / 2}" r="${markerSize / 2 - 2}" fill="${color}" stroke="white" stroke-width="2"/>
            <circle cx="${markerSize / 2}" cy="${markerSize / 2}" r="${markerSize / 4}" fill="white"/>
          </svg>
        `)}`,
        new window.kakao.maps.Size(markerSize, markerSize),
        { offset: new window.kakao.maps.Point(markerSize / 2, markerSize / 2) }
      )

      // 마커 생성
      const marker = new window.kakao.maps.Marker({
        position,
        map,
        image: markerImage,
        title: property.ownerName,
      })

      // 인포윈도우 내용
      const infoContent = `
        <div style="padding: 10px; min-width: 180px; font-family: sans-serif;">
          <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px;">${property.ownerName}</div>
          <div style="font-size: 12px; color: #666; margin-bottom: 4px;">${property.unitType || ''}</div>
          <div style="display: flex; gap: 4px; margin-bottom: 4px;">
            <span style="background: ${color}; color: white; padding: 2px 6px; border-radius: 4px; font-size: 11px;">${typeLabel}</span>
            <span style="background: #f3f4f6; padding: 2px 6px; border-radius: 4px; font-size: 11px;">${property.area || '-'}㎡</span>
          </div>
          <div style="font-weight: bold; color: ${color}; font-size: 15px;">${priceText}</div>
        </div>
      `

      const infowindow = new window.kakao.maps.InfoWindow({
        content: infoContent,
        removable: true,
      })

      // 클릭 이벤트
      window.kakao.maps.event.addListener(marker, 'click', () => {
        // 다른 인포윈도우 닫기
        newMarkers.forEach((m) => {
          if (m.infowindow) m.infowindow.close()
        })
        infowindow.open(map, marker)
        onPropertyClick?.(property.id)
      })

      // 선택된 매물이면 인포윈도우 열기
      if (isSelected) {
        infowindow.open(map, marker)
      }

      marker.infowindow = infowindow
      newMarkers.push(marker)
    })

    setMarkers(newMarkers)

    // 마커가 있으면 지도 범위 조정
    if (newMarkers.length > 0 && locations.length > 1) {
      const bounds = new window.kakao.maps.LatLngBounds()
      locations.forEach((loc) => {
        bounds.extend(new window.kakao.maps.LatLng(loc.latitude, loc.longitude))
      })
      map.setBounds(bounds)
    }
  }, [map, properties, locations, selectedPropertyId, onPropertyClick])

  // 금액 포맷팅
  function formatPrice(price: number): string {
    if (price >= 100000000) {
      const uk = Math.floor(price / 100000000)
      const man = Math.floor((price % 100000000) / 10000)
      return man > 0 ? `${uk}억 ${man.toLocaleString()}만` : `${uk}억`
    } else if (price >= 10000) {
      return `${Math.floor(price / 10000).toLocaleString()}만`
    }
    return `${price.toLocaleString()}원`
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-center p-8">
          <div className="text-gray-500 mb-2">지도를 표시할 수 없습니다</div>
          <div className="text-sm text-gray-400">{error}</div>
          <div className="mt-4 text-xs text-gray-400">
            카카오 개발자 센터에서 API 키를 발급받아<br />
            .env 파일에 VITE_KAKAO_MAP_KEY를 설정해주세요.
          </div>
        </div>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
        <div className="text-gray-500">지도 로딩 중...</div>
      </div>
    )
  }

  return (
    <div className={`relative ${className}`}>
      <div ref={mapRef} className="w-full h-full rounded-lg" />

      {/* 범례 */}
      <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur rounded-lg p-3 shadow-lg text-xs">
        <div className="font-semibold mb-2">매물 유형</div>
        <div className="space-y-1">
          {Object.entries(propertyTypeColors).map(([type, color]) => (
            <div key={type} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: color }}
              />
              <span>
                {type === 'apartment' && '아파트'}
                {type === 'officetel' && '오피스텔'}
                {type === 'villa' && '빌라'}
                {type === 'house' && '단독주택'}
                {type === 'commercial' && '상가'}
                {type === 'land' && '토지'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 매물 수 표시 */}
      <div className="absolute top-4 left-4 bg-white/90 backdrop-blur rounded-lg px-3 py-2 shadow-lg">
        <span className="font-semibold">{locations.length}</span>
        <span className="text-gray-500 text-sm ml-1">개 매물</span>
      </div>
    </div>
  )
}
