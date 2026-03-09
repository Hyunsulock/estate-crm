import { useEffect, useRef, useState } from 'react'

// Kakao Maps 타입 선언
declare global {
  interface Window {
    kakao: any
  }
}

/**
 * 카카오맵 단순 테스트 컴포넌트
 * 공식 예제와 동일하게 autoload 없이 구현
 */
export function KakaoMapTest() {
  const mapRef = useRef<HTMLDivElement>(null)
  const [status, setStatus] = useState('초기화 중...')

  useEffect(() => {
    // 이미 로드되어 있으면 바로 지도 생성
    if (window.kakao && window.kakao.maps) {
      setStatus('카카오맵 이미 로드됨, 지도 생성 중...')
      createMap()
      return
    }

    const KAKAO_APP_KEY = import.meta.env.VITE_KAKAO_MAP_KEY
    console.log('[KakaoMapTest] API Key:', KAKAO_APP_KEY)
    setStatus(`API 키 확인: ${KAKAO_APP_KEY ? KAKAO_APP_KEY.substring(0, 8) + '...' : '없음'}`)

    // 스크립트가 이미 있는지 확인
    const existingScript = document.querySelector('script[src*="dapi.kakao.com"]')
    if (existingScript) {
      setStatus('기존 스크립트 발견, 대기 중...')
      const checkInterval = setInterval(() => {
        if (window.kakao && window.kakao.maps) {
          clearInterval(checkInterval)
          createMap()
        }
      }, 100)
      return () => clearInterval(checkInterval)
    }

    // 스크립트 로드 (autoload 없이 - 공식 예제처럼)
    const script = document.createElement('script')
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=ed5edf1f33fd9c7312e6ea897c41006b`
    script.async = true

    setStatus('스크립트 로드 중...')

    script.onload = () => {
      console.log('[KakaoMapTest] Script onload, kakao:', window.kakao)
      setStatus('스크립트 로드 완료, 지도 생성 중...')

      // autoload 없이 로드하면 바로 사용 가능
      setTimeout(() => {
        createMap()
      }, 100)
    }

    script.onerror = (e) => {
      console.error('[KakaoMapTest] Script error:', e)
      setStatus('스크립트 로드 실패! 콘솔 확인 필요')
    }

    document.head.appendChild(script)

    function createMap() {
      if (!mapRef.current) {
        setStatus('맵 컨테이너 없음')
        return
      }

      if (!window.kakao || !window.kakao.maps) {
        setStatus('kakao.maps 객체 없음')
        return
      }

      try {
        const mapOption = {
          center: new window.kakao.maps.LatLng(33.450701, 126.570667), // 제주도
          level: 3,
        }

        const map = new window.kakao.maps.Map(mapRef.current, mapOption)
        console.log('[KakaoMapTest] Map created:', map)
        setStatus('지도 생성 성공!')
      } catch (err) {
        console.error('[KakaoMapTest] Map creation error:', err)
        setStatus(`지도 생성 실패: ${err}`)
      }
    }
  }, [])

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">카카오맵 테스트</h2>
      <div className="mb-4 p-2 bg-gray-100 rounded">
        <strong>상태:</strong> {status}
      </div>
      <div
        ref={mapRef}
        style={{ width: '100%', height: '400px', border: '1px solid #ccc' }}
      />
    </div>
  )
}
