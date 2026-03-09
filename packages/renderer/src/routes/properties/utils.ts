import type { PropertyType, TransactionType, PropertyStatus } from '@/types'

// 매물 타입 한글 매핑
export const typeLabels: Record<PropertyType, string> = {
  apartment: '아파트',
  officetel: '오피스텔',
  villa: '빌라',
  house: '단독주택',
  commercial: '상가',
  land: '토지',
}

// 거래 유형 한글 매핑
export const transactionLabels: Record<TransactionType, string> = {
  sale: '매매',
  lease: '전세',
  monthly: '월세',
}

// 상태 한글 매핑 및 색상
export const statusConfig: Record<
  PropertyStatus,
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  available: { label: '활성', variant: 'default' },
  in_progress: { label: '거래중', variant: 'secondary' },
  reserved: { label: '예약중', variant: 'outline' },
  contracted: { label: '계약완료', variant: 'outline' },
  cancelled: { label: '취소', variant: 'destructive' },
}

// 네이버 광고 상태 라벨
export const naverAdStatusLabels: Record<string, { label: string; color: string }> = {
  active: { label: '게시중', color: 'text-green-600' },
  paused: { label: '일시중지', color: 'text-yellow-600' },
  expired: { label: '만료', color: 'text-gray-500' },
  pending: { label: '대기중', color: 'text-blue-600' },
}

// 매칭 단계 라벨
export const matchStageLabels: Record<string, { label: string; color: string }> = {
  suggested: { label: '추천됨', color: 'text-blue-600' },
  buyerContacted: { label: '구매자연락', color: 'text-purple-600' },
  viewing: { label: '방문', color: 'text-indigo-600' },
  ownerContacted: { label: '판매자연락', color: 'text-cyan-600' },
  negotiating: { label: '협상중', color: 'text-orange-600' },
  dealCreated: { label: '거래전환', color: 'text-green-600' },
  closed: { label: '종료', color: 'text-gray-500' },
}

// 가격 포맷팅
export function formatPrice(price: number): string {
  const billion = Math.floor(price / 100000000)
  const million = Math.floor((price % 100000000) / 10000)

  if (billion > 0 && million > 0) {
    return `${billion}억 ${million.toLocaleString()}만`
  } else if (billion > 0) {
    return `${billion}억`
  } else {
    return `${million.toLocaleString()}만`
  }
}

// 정보 확인일 경과일 계산
export function getDaysAgo(date: Date | undefined): string {
  if (!date) return '미확인'
  const now = new Date()
  const d = new Date(date)
  const diff = Math.floor((now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return '오늘'
  if (diff === 1) return '어제'
  return `${diff}일전`
}

// 정보 확인일 색상 클래스
export function getVerificationColorClass(date: Date | undefined): string {
  if (!date) return 'text-red-600'
  const timestamp = new Date(date).getTime()
  const now = Date.now()
  const sevenDays = 7 * 24 * 60 * 60 * 1000
  const fourteenDays = 14 * 24 * 60 * 60 * 1000

  if (timestamp > now - sevenDays) {
    return 'text-green-600'
  } else if (timestamp > now - fourteenDays) {
    return 'text-yellow-600'
  }
  return 'text-red-600'
}
