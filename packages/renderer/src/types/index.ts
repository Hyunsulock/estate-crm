// 사용자 역할
export type UserRole = 'manager' | 'user'

// 사용자 인터페이스
export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  avatar?: string
  createdAt: Date
}

// 연락처 역할 (소유자, 매수자, 매도자, 임대인, 임차인)
export type ContactRole = 'owner' | 'buyer' | 'seller' | 'landlord' | 'tenant'

// 연락처 인터페이스 (기존 Customer 대체 - 통합 관리)
// 역할(roles)은 관계 테이블에서 도출: Ownership 있으면 owner, BuyerRequirement 있으면 buyer
export interface Contact {
  id: string
  name: string
  phone: string
  phone2?: string
  email?: string
  notes?: string
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

// 건물 유형
export type BuildingType = 'apartment' | 'officetel' | 'villa' | 'house' | 'commercial' | 'land' | 'living_accommodation'

// 건물 인터페이스
export interface Building {
  id: string
  type: BuildingType
  name: string        // "래미안자이"

  // 주소 필터링용
  city?: string       // '서울시'
  district?: string   // '강동구'
  dong?: string       // '고덕동'
  address?: string    // 도로명주소 전체

  // 부가정보
  totalUnits?: number // 총 세대수
  builtYear?: number  // 준공년도

  createdAt: Date
  updatedAt: Date
}

// 동 인터페이스
export interface Dong {
  id: string
  buildingId: string
  name: string        // "102동", 빌라는 "1동" 기본값
  createdAt: Date
}

// 호 인터페이스
export interface Unit {
  id: string
  buildingId: string
  dongId: string | null  // 단독주택은 null
  name: string           // "1002호"
  area?: number          // 평수 (알고 있다면)
  createdAt: Date
  updatedAt: Date
}

// 소유 상태
export type OwnershipStatus = 'active' | 'sold'

// 소유관계 인터페이스 (Contact ↔ Unit N:M 관계)
export interface Ownership {
  id: string
  contactId: string
  unitId: string
  status: OwnershipStatus
  startDate?: Date
  endDate?: Date
  shareRatio?: number    // 지분율 (%)
  isResident?: boolean   // 본인 거주 여부
  memo?: string
  createdAt: Date
  updatedAt: Date
}

// 상담 결과
export type ConsultationResult = 'interested' | 'rejected' | 'pending' | 'priceInquiry' | 'callback' | 'other'

// 상담 유형
export type ConsultationType = 'call' | 'visit' | 'message' | 'email' | 'other'

// 상담 인터페이스
export interface Consultation {
  id: string
  contactId: string            // 누구와 상담했나 (구매자 or 소유주)

  // 컨텍스트 연결
  ownershipId?: string         // 기존 호환성 (소유권 관련)
  propertyId?: string          // 어떤 매물 관련?
  matchId?: string             // 어떤 매칭 관련? (협상 추적용)

  // 상담 내용
  type?: ConsultationType      // 상담 유형
  date: Date
  content: string              // 상담 내용/메모 (협상 내용 포함)
  result: ConsultationResult

  // 후속 조치
  nextContactDate?: Date
  desiredPrice?: number        // 희망 가격 (협상 중 기록용)

  createdBy: string            // User ID
  createdAt: Date
}

// ============ 구매고객 관리 ============

// 구매고객 상태
export type BuyerStatus = 'active' | 'matched' | 'completed' | 'inactive'

// 긴급도
export type BuyerUrgency = 'urgent' | 'normal' | 'flexible'

// 구매고객 희망조건 인터페이스
export interface BuyerRequirement {
  id: string
  contactId: string              // Contact 연결

  // 거래 유형
  transactionType: TransactionType  // 매매/전세/월세

  // 희망 조건
  areas: string[]                // 희망 지역 ["강남구", "서초구"]
  propertyTypes: PropertyType[]  // ["apartment", "officetel"]
  budgetMin?: number             // 최소 예산
  budgetMax?: number             // 최대 예산
  monthlyRentMax?: number        // 월세 최대 (월세인 경우)
  areaMin?: number               // 희망 면적 최소 (평)
  areaMax?: number               // 희망 면적 최대 (평)

  // 기타 조건
  preferences?: string           // "역세권, 학군 좋은 곳, 신축"
  mustConditions?: string[]      // 필수 조건 태그
  preferConditions?: string[]    // 선호 조건 태그
  moveInDeadline?: Date          // 입주 희망 시기

  // 상태 관리
  urgency: BuyerUrgency          // 급함/보통/여유
  status: BuyerStatus            // 활성/매칭됨/거래완료/비활성

  // 담당자
  assignedTo: string             // 담당자 User ID

  // 메모
  memo?: string

  // 마지막 연락
  lastContactDate?: Date
  nextContactDate?: Date

  createdAt: Date
  updatedAt: Date
}

// 구매고객 상담 인터페이스
export interface BuyerConsultation {
  id: string
  requirementId: string          // BuyerRequirement ID
  date: Date
  content: string
  // 추천 매물 ID들 (이 상담에서 안내한 매물)
  recommendedPropertyIds?: string[]
  // 다음 연락 예정
  nextContactDate?: Date
  createdBy: string              // User ID
  createdAt: Date
}

// ============ 매칭 관리 ============

// 매칭 단계 (5단계 파이프라인)
// 흐름: 추천 → 구매자연락 → 방문 → 판매자연락 → 조건협의 → 거래전환
// - buyerInterest: 구매자 연락 시 관심 체크 (관심 있어야 방문 진행)
// - viewingDate/viewedAt: 방문 예정/완료 상태 구분
// - viewingFeedback: 방문 후 관심 체크 (관심 있어야 판매자 연락)
// - ownerResponse: 판매자 동의 체크 (동의해야 조건 협의 진행)
export type MatchStage =
  | 'suggested'        // 추천됨
  | 'buyerContacted'   // 구매자 연락함 (buyerInterest로 관심 체크)
  | 'viewing'          // 방문 (viewingDate: 예정, viewedAt: 완료)
  | 'ownerContacted'   // 판매자 연락함 (ownerResponse로 동의 체크)
  | 'negotiating'      // 조건 협의중
  | 'dealCreated'      // 거래로 전환
  | 'closed'           // 종료

// 관심도
export type Interest = 'interested' | 'notInterested' | 'pending'

// 매칭 인터페이스
export interface Match {
  id: string

  // 연결
  buyerReqId: string           // BuyerRequirement ID
  propertyId: string           // Property ID

  // 진행 상태
  stage: MatchStage

  // 구매자 반응
  buyerInterest?: Interest
  buyerNote?: string

  // 방문
  viewingDate?: Date           // 방문 예정일
  viewedAt?: Date              // 실제 방문일
  viewingFeedback?: Interest   // 방문 후 반응
  viewingNote?: string

  // 판매자 반응
  ownerContacted: boolean
  ownerResponse?: Interest
  ownerNote?: string
  ownerAskingPrice?: number

  // Deal 전환
  dealId?: string

  // 종료
  closedAt?: Date
  closedReason?: string        // "구매자 무관심", "판매자 거절", "거래 완료"

  // 담당자
  assignedTo: string

  createdAt: Date
  updatedAt: Date
}

// 방문 인터페이스 (다중 방문 지원)
export interface Viewing {
  id: string
  matchId: string              // Match 연결

  // 일정
  scheduledAt: Date            // 예정 시간
  visitedAt?: Date             // 실제 방문 시간

  // 피드백
  feedback?: Interest          // 방문 후 반응
  note?: string                // 방문 후 메모

  // 일정 연동
  calendarEventId?: string     // CalendarEvent 연결

  // 참석자
  attendees?: string[]         // 참석 User IDs

  createdAt: Date
  updatedAt: Date
}

// ============ 하위 호환성을 위한 타입 별칭 ============
// TODO: 점진적으로 Contact으로 마이그레이션 후 제거
export type CustomerType = 'buyer' | 'seller' | 'landlord' | 'tenant'
export type CustomerStatus = 'active' | 'inactive' | 'potential'
export interface ContactInfo {
  id: string
  type: 'mobile' | 'home' | 'work' | 'fax'
  number: string
  isPrimary: boolean
}
export interface Customer {
  id: string
  name: string
  contacts: ContactInfo[]
  email?: string
  type: CustomerType[]
  status: CustomerStatus
  address?: string
  notes?: string
  tags: string[]
  assignedTo: string
  relatedCustomers: string[]
  createdAt: Date
  updatedAt: Date
}

// 매물 타입
export type PropertyType =
  | 'apartment'
  | 'officetel'
  | 'villa'
  | 'house'
  | 'commercial'
  | 'land'

// 거래 유형
export type TransactionType = 'sale' | 'lease' | 'monthly'

// 매물 상태
export type PropertyStatus =
  | 'available'    // 거래가능
  | 'in_progress'  // 거래중
  | 'reserved'     // 예약중
  | 'contracted'   // 계약완료
  | 'cancelled'    // 취소

// ============ 시세 트래킹 ============

// 가격 변동 사유 (소유자 호가 변경)
export type PriceChangeReason = 'initial' | 'negotiation' | 'market_adjustment' | 'owner_request'

// 가격 변동 이력 (소유자 호가)
export interface PriceHistory {
  id: string
  propertyId: string
  price: number             // 만원
  date: Date
  reason?: PriceChangeReason
  updatedBy?: string        // User ID
  createdAt: Date
}

// ============ 시세/실거래가 정보 ============

// 실거래가 정보 (국토부 실거래가 기반)
export interface RealTransaction {
  id: string
  buildingName: string        // 단지명
  dong?: string               // 동
  area: number                // 전용면적 (㎡)
  floor: number               // 층
  price: number               // 거래가격 (원)
  transactionType: TransactionType
  transactionDate: Date       // 거래일
  registrationDate?: Date     // 등기일
}

// 시세 정보 (KB시세, 호갱노노 등 참고)
export interface MarketPrice {
  id: string
  buildingName: string        // 단지명
  area: number                // 전용면적 (㎡)
  transactionType: TransactionType
  // 시세 범위
  lowPrice: number            // 하한가
  highPrice: number           // 상한가
  avgPrice: number            // 평균가
  // 변동 추이
  changeFromLastMonth?: number      // 전월 대비 변동 (원)
  changePercentFromLastMonth?: number // 전월 대비 변동률 (%)
  // 기준일
  baseDate: Date
  source?: string             // 출처 (KB, 호갱노노 등)
}

// ============ 매물 사진/도면 관리 ============

// 미디어 타입
export type PropertyMediaType = 'photo' | 'floorPlan' | 'document'

// 매물 미디어 인터페이스
export interface PropertyMedia {
  id: string
  propertyId: string
  type: PropertyMediaType
  url: string
  fileName: string
  caption?: string
  order: number
  isMain?: boolean
  uploadedBy: string  // User ID
  uploadedAt: Date
}

// 확인 상태 (시트 K컬럼 매핑)
export type CheckStatus = 'unverified' | 'verified' | 'in_contract' | 'hold' | 'done'

// 입주 유형
export type MoveInType = 'immediate' | 'date' | 'negotiable'

// 매물 인터페이스 (실시간 매물 관리)
export interface Property {
  id: string

  // 위치 연결 (필수) — unit → dong → building으로 주소/단지 정보 접근
  unitId: string

  // 거래 정보
  type: PropertyType        // 매물 타입
  transactionType: TransactionType  // 거래 유형
  status: PropertyStatus    // 거래 상태

  // 면적/구조
  unitType?: string         // 타입 (ex: 82A, 100A)
  area?: number             // 전용면적 (평)
  supplyArea?: number       // 공급면적 (평)
  floor?: number            // 층수
  totalFloors?: number      // 전체 층수
  direction?: string        // 남향, 남동향 등

  // 가격 정보 (만원)
  price: number             // 매매가 또는 보증금
  monthlyRent?: number      // 월세 (해당되는 경우)
  initialPrice?: number     // 최초 등록 가격
  priceChangePercent?: number // 최초 대비 변동률 (%)

  // 소유주 정보
  ownerName: string         // 소유주 이름
  ownerPhone: string        // 소유주 연락처
  ownerPhone2?: string      // 소유주 연락처2
  ownerId?: string          // Contact ID (연결된 경우)

  // 세입자/입주 정보
  hasTenant: boolean        // 세입자 여부
  tenantDeposit?: number    // 세입자 보증금 (만원)
  tenantRent?: number       // 세입자 월세 (만원)
  tenantLeaseEnd?: string   // 세입자 계약 만료일 (ex: "2025년 3월")
  moveInDate?: string       // 입주 가능일 표시용 (ex: "즉시", "2월 중순", "협의")
  moveInType: MoveInType    // 즉시 | 날짜지정 | 협의

  // 관리
  assignedTo: string        // 담당자 User ID
  memo?: string             // 메모
  tags: string[]            // 태그
  infoVerifiedAt?: Date     // 정보 확인일 (중요!)
  isHidden: boolean         // 숨기기 여부 (목록에서 숨김)

  // 확인 상태 (시트 K컬럼 매핑)
  checkStatus: CheckStatus

  // 광고 정보 (내가 올린 네이버 광고)
  adRank?: string           // '16/47' (내 랭킹/전체)
  adPrice?: number          // 광고에 올린 가격 (만원)
  adListedAt?: Date         // 광고 등록일
  priceCompare?: string     // '(나)23.5/23 ▼0.5[신](0일전)'
  floorExposed?: boolean    // 층 노출 여부
  naverArticleNo?: string   // 네이버 매물번호

  // 외부 데이터 연결
  feedId?: string           // ExternalFeed ID

  // 네트워크
  isSharedInNetwork: boolean // 네트워크 그룹에 공유 여부

  createdAt: Date
  updatedAt: Date
}

// 거래 단계 (매칭에서 전환 후)
export type DealStage =
  | 'selection'      // 최종 선택 & 합의
  | 'deposit'        // 가계약금
  | 'contract'       // 본계약
  | 'completed'      // 완료
  | 'closed'         // 거래 종료 (정산 완료, 보관용)
  | 'cancelled'      // 취소

// 거래 기여 기록 (누가 언제 어떤 단계에서 기여했는지)
export interface DealContribution {
  userId: string               // 기여자 ID
  userName: string             // 기여자 이름 (표시용)
  stage: MatchStage | DealStage  // 기여한 단계
  action: string               // 수행한 작업 (예: "구매자 상담", "방문 안내", "계약서 작성")
  contributedAt: Date          // 기여 시점
  note?: string                // 메모
}

// 수수료 정산 상태
export type CommissionSettlementStatus = 'pending' | 'partial' | 'completed'

// 수수료 정산 내역
export interface CommissionSettlement {
  id: string
  amount: number               // 정산 금액
  paidBy: 'buyer' | 'seller'   // 지급자 (매수인/매도인)
  paidAt: Date                 // 지급일
  method?: string              // 결제 방법 (계좌이체, 현금 등)
  note?: string
}

// 거래 인터페이스 (Match에서 전환)
export interface Deal {
  id: string
  matchId: string              // Match에서 연결

  stage: DealStage

  // 합의 내용
  agreedPrice?: number         // 합의 금액
  agreedConditions?: string    // 합의 조건

  // 가계약
  depositAmount?: number       // 가계약금
  depositPaidAt?: Date

  // 본계약
  contractDate?: Date          // 본계약 예정일
  contractSignedAt?: Date

  // 완료
  completionDate?: Date        // 잔금일
  completedAt?: Date

  // 거래 종료
  closedAt?: Date              // 종료 처리일
  closedBy?: string            // 종료 처리자 User ID

  // 중개수수료
  commission?: number          // 총 수수료
  commissionFromBuyer?: number // 매수인측 수수료
  commissionFromSeller?: number // 매도인측 수수료

  // 수수료 정산
  commissionSettlements?: CommissionSettlement[]  // 정산 내역
  settlementStatus?: CommissionSettlementStatus   // 정산 상태

  // 기여 추적
  contributions?: DealContribution[]  // 기여 기록

  // 체크리스트
  checklist?: ChecklistItem[]  // 거래 진행 체크리스트

  // 공동중개
  isJointBrokerage: boolean
  partnerBroker?: string
  partnerCommission?: number   // 상대 중개사 수수료

  // 담당자
  assignedTo: string[]

  notes?: string

  createdAt: Date
  updatedAt: Date
}

// 일정 타입
export type EventType = 'meeting' | 'viewing' | 'contract' | 'deadline' | 'other'

// 일정 인터페이스
export interface CalendarEvent {
  id: string
  title: string
  description?: string
  type: EventType
  start: Date
  end: Date
  allDay: boolean
  customerId?: string // 관련 고객 ID
  propertyId?: string // 관련 매물 ID
  dealId?: string // 관련 거래 ID
  taskId?: string // 연결된 업무 ID (Option B: 업무-일정 양방향 연결)
  matchId?: string // 관련 매칭 ID (방문 일정 등)
  viewingId?: string // 연결된 방문 ID (Viewing 양방향 연결)
  assignedTo: string[] // 참석자 User IDs
  location?: string
  reminderBefore?: number // 알림 시간 (분 단위)
  createdAt: Date
  updatedAt: Date
}

// 네트워크 그룹 인터페이스
export interface NetworkGroup {
  id: string
  name: string
  description?: string
  ownerId: string // 방장 (부동산 사무소 ID)
  memberIds: string[] // 멤버 부동산 사무소 IDs
  isPrivate: boolean
  createdAt: Date
}

// 네트워크 게시글 타입
export type NetworkPostType = 'property' | 'requirement'

// 네트워크 게시글 인터페이스
export interface NetworkPost {
  id: string
  groupId: string
  authorId: string // 작성자 사무소 ID
  type: NetworkPostType
  propertyId?: string // 매물 공유인 경우
  title: string
  content: string
  requirements?: {
    area?: string // 지역
    priceMin?: number
    priceMax?: number
    propertyType?: PropertyType
    transactionType?: TransactionType
  }
  images: string[]
  createdAt: Date
  updatedAt: Date
}

// ============ 거래 체크리스트 ============

// 체크리스트 항목
export interface ChecklistItem {
  id: string
  label: string
  checked: boolean
  checkedAt?: Date
  checkedBy?: string  // User ID
}

// 거래 체크리스트
export interface DealChecklist {
  id: string
  dealId: string
  items: ChecklistItem[]
}

// ============ 계약서 관리 ============

// 계약서 상태
export type ContractStatus =
  | 'draft'           // 작성중
  | 'signed'          // 계약완료
  | 'depositPaid'     // 계약금 입금
  | 'balancePaid'     // 잔금 완료
  | 'registered'      // 등기/전입 완료
  | 'cancelled'       // 해약

// 계약서 템플릿
export interface ContractTemplate {
  id: string
  name: string
  transactionType: TransactionType
  propertyType?: PropertyType
  content: string      // 템플릿 본문
  isDefault?: boolean
  createdAt: Date
}

// 중개수수료 산정 내역
export interface CommissionBreakdown {
  transactionType: TransactionType
  transactionAmount: number
  rate: number          // 적용 요율 (%)
  buyerFee: number      // 매수인 부담
  sellerFee: number     // 매도인 부담
  totalFee: number      // 총 수수료
  vatAmount?: number    // 부가세 (선택)
}

// 계약서 인터페이스
export interface Contract {
  id: string

  // 연결
  dealId: string               // Deal에서 연결
  propertyId: string           // 매물

  // 거래 유형
  transactionType: TransactionType  // 매매/전세/월세

  // 당사자 정보
  buyerContactId: string       // 매수인/임차인
  sellerContactId: string      // 매도인/임대인

  // 금액 정보
  totalPrice: number           // 총 거래금액 (매매가/보증금)
  monthlyRent?: number         // 월세 (해당시)

  // 계약금/중도금/잔금
  depositAmount: number        // 계약금
  depositDate?: Date           // 계약금 지급일
  depositPaidAt?: Date         // 계약금 입금 확인일

  middlePayment?: number       // 중도금
  middlePaymentDate?: Date     // 중도금 지급일
  middlePaymentPaidAt?: Date   // 중도금 입금 확인일

  balanceAmount: number        // 잔금
  balanceDate?: Date           // 잔금 지급일 (잔금일)
  balancePaidAt?: Date         // 잔금 입금 확인일

  // 일정
  contractDate: Date           // 계약일
  moveInDate?: Date            // 입주일

  // 기간 (전세/월세)
  leaseStartDate?: Date        // 임대 시작일
  leaseEndDate?: Date          // 임대 종료일

  // 특약 사항
  specialTerms?: string

  // 상태
  status: ContractStatus

  // 중개수수료
  commission?: number
  commissionRate?: number      // 수수료율 (%)
  commissionBreakdown?: CommissionBreakdown  // 수수료 산정 내역

  // 공동중개
  isJointBrokerage: boolean
  partnerBrokerName?: string
  partnerBrokerPhone?: string
  partnerCommission?: number   // 상대방 수수료

  // 파일 첨부
  attachments?: string[]       // 계약서 스캔본 등

  // 템플릿
  templateId?: string          // 사용된 템플릿 ID

  // 담당자
  assignedTo: string

  notes?: string

  createdAt: Date
  updatedAt: Date
}

// ============ 활동 로그 ============

// 활동 유형
export type ActivityType =
  | 'property_create'      // 매물 등록
  | 'property_update'      // 매물 수정
  | 'property_hide'        // 매물 숨기기
  | 'buyer_create'         // 구매고객 등록
  | 'buyer_update'         // 구매고객 수정
  | 'match_create'         // 매칭 생성
  | 'match_update'         // 매칭 상태 변경
  | 'deal_create'          // 거래 생성
  | 'deal_update'          // 거래 상태 변경
  | 'contract_create'      // 계약서 생성
  | 'contract_update'      // 계약서 수정
  | 'consultation_create'  // 상담 기록 추가
  | 'building_create'      // 건물 등록
  | 'owner_create'         // 소유자 등록
  | 'login'                // 로그인
  | 'logout'               // 로그아웃

// 활동 로그 인터페이스
export interface ActivityLog {
  id: string
  userId: string           // 활동 수행자
  type: ActivityType       // 활동 유형
  description: string      // 활동 설명
  targetType?: 'property' | 'buyer' | 'match' | 'deal' | 'contract' | 'building' | 'consultation'
  targetId?: string        // 대상 ID
  targetName?: string      // 대상 이름 (표시용)
  metadata?: Record<string, unknown>  // 추가 정보
  createdAt: Date
}

// ============ 구독 플랜 ============

// 구독 플랜 종류: 무료 / 디럭스 / 프리미엄
export type SubscriptionPlan = 'free' | 'deluxe' | 'premium'

// 네이버 계정 연동 정보
export interface NaverAccountInfo {
  naverId: string          // 네이버 아이디
  isConnected: boolean     // 연동 상태
  connectedAt?: Date       // 연동 일시
  lastSyncAt?: Date        // 마지막 동기화 시간
}

// 사무소/구독 정보
export interface Office {
  id: string
  name: string             // 사무소명
  plan: SubscriptionPlan   // 구독 플랜
  planExpiresAt?: Date     // 플랜 만료일
  naverAccount?: NaverAccountInfo  // 네이버 계정 연동 정보
  createdAt: Date
  updatedAt: Date
}

// ============ 네이버 부동산 광고 연동 (디럭스 이상) ============

// 네이버 광고 상태
export type NaverAdStatus =
  | 'active'      // 광고 중
  | 'paused'      // 일시 중지
  | 'expired'     // 만료됨
  | 'pending'     // 승인 대기

// 네이버 부동산 광고 인터페이스
export interface NaverAd {
  id: string

  // 광고 정보
  articleNo: string        // 네이버 매물번호
  articleName: string      // 매물명
  status: NaverAdStatus    // 광고 상태

  // 매물 기본 정보
  buildingName: string     // 건물명/단지명
  dong?: string            // 동
  floor?: string           // 층
  area: number             // 전용면적 (㎡)
  supplyArea?: number      // 공급면적 (㎡)

  // 거래 정보
  transactionType: TransactionType
  price: number            // 매매가/보증금
  monthlyRent?: number     // 월세

  // 주소
  address: string          // 지번 주소
  roadAddress?: string     // 도로명 주소

  // 광고 성과
  viewCount: number        // 조회수
  favoriteCount: number    // 관심 등록수
  inquiryCount: number     // 문의수

  // 랭킹 정보
  rank?: number            // 현재 순위
  totalAdsInArea?: number  // 해당 지역 전체 광고 수

  // 광고 기간
  startDate: Date          // 광고 시작일
  endDate: Date            // 광고 종료일

  // 매칭 정보
  matchedPropertyId?: string  // 연결된 내부 매물 ID
  matchConfidence?: number    // 매칭 신뢰도 (0-100)
  matchedAt?: Date            // 매칭된 시간

  // 동기화
  lastSyncAt: Date         // 마지막 동기화 시간

  createdAt: Date
  updatedAt: Date
}

// 네이버 광고 매칭 제안
export interface NaverAdMatchSuggestion {
  naverAdId: string
  propertyId: string
  confidence: number       // 매칭 신뢰도 (0-100)
  matchReasons: string[]   // 매칭 이유 ["건물명 일치", "동/호 일치", "가격 유사"]
  createdAt: Date
}

// ============ 건축물대장 연동 ============

// 건축물대장 정보 (공공데이터 API 기반)
export interface BuildingRegistry {
  // 기본 정보
  buildingName: string           // 건물명
  address: string                // 지번 주소
  roadAddress: string            // 도로명 주소

  // 건물 정보
  mainUse: string                // 주용도 (아파트, 오피스텔, 근린생활시설 등)
  buildingStructure: string      // 구조 (철근콘크리트조 등)
  roofStructure: string          // 지붕 구조
  groundFloors: number           // 지상 층수
  undergroundFloors: number      // 지하 층수

  // 면적 정보
  buildingArea: number           // 건축면적 (㎡)
  totalFloorArea: number         // 연면적 (㎡)
  landArea: number               // 대지면적 (㎡)
  floorAreaRatio: number         // 용적률 (%)
  buildingCoverageRatio: number  // 건폐율 (%)

  // 일자 정보
  approvalDate?: Date            // 사용승인일
  constructionStartDate?: Date   // 착공일
  constructionEndDate?: Date     // 준공일

  // 세대/호 정보
  totalUnits?: number            // 총 세대수
  totalParkingSpaces?: number    // 총 주차대수

  // 소유자 정보 (등기 연계)
  ownerName?: string             // 소유자명
  ownershipType?: string         // 소유권 구분 (단독, 공동 등)

  // 위치 정보
  latitude?: number              // 위도
  longitude?: number             // 경도

  // 기타
  buildingNumber?: string        // 건축물대장 번호
  managementNumber?: string      // 관리번호
}

// 호별 건축물대장 정보
export interface UnitRegistry {
  buildingRegistryId: string     // 건축물대장 ID 연결
  dong: string                   // 동
  ho: string                     // 호
  floor: number                  // 층

  // 면적 정보
  exclusiveArea: number          // 전용면적 (㎡)
  commonArea: number             // 공용면적 (㎡)
  supplyArea: number             // 공급면적 (㎡)

  // 용도
  usage: string                  // 용도 (주거, 업무 등)
}

// ============ 지도/임장 관리 ============

// 임장 상태
export type FieldVisitStatus = 'scheduled' | 'completed' | 'cancelled'

// 임장 기록
export interface FieldVisit {
  id: string
  propertyId: string             // 매물 ID
  matchId?: string               // 매칭 ID (있으면 연결)

  // 일정
  scheduledDate: Date            // 예정일
  visitedAt?: Date               // 실제 방문일
  status: FieldVisitStatus

  // 방문자
  visitorName?: string           // 방문자 (구매고객명)
  visitorPhone?: string
  buyerReqId?: string            // BuyerRequirement ID

  // 결과
  feedback?: string              // 방문 후기
  rating?: number                // 만족도 (1-5)
  photos?: string[]              // 현장 사진

  // 담당자
  assignedTo: string             // 담당 직원 ID

  // 위치
  latitude?: number
  longitude?: number

  createdAt: Date
  updatedAt: Date
}

// 매물 위치 정보 (지도 표시용)
export interface PropertyLocation {
  propertyId: string
  latitude: number
  longitude: number
  address: string
  roadAddress?: string
}

// ============ 부동산 계산기 ============

// 계산기 유형
export type CalculatorType = 'pricePerPyeong' | 'yield' | 'loan' | 'commission' | 'tax'

// 평단가 계산 결과
export interface PricePerPyeongResult {
  totalPrice: number             // 총 가격
  areaSqm: number                // 면적 (㎡)
  areaPyeong: number             // 면적 (평)
  pricePerSqm: number            // ㎡당 가격
  pricePerPyeong: number         // 평당 가격
}

// 수익률 계산 결과
export interface YieldResult {
  // 입력값
  purchasePrice: number          // 매입가
  currentPrice?: number          // 현재 시세
  monthlyRent?: number           // 월세
  deposit?: number               // 보증금
  monthlyExpenses?: number       // 월 관리비/세금 등

  // 계산 결과
  annualRent: number             // 연간 임대 수익
  annualExpenses: number         // 연간 비용
  netAnnualIncome: number        // 순 연간 수익
  grossYield: number             // 총 수익률 (%)
  netYield: number               // 순 수익률 (%)
  capitalGain?: number           // 시세 차익
  totalReturn?: number           // 총 수익률 (시세 차익 포함)
}

// 대출 계산 결과
export interface LoanResult {
  // 입력값
  propertyPrice: number          // 매물가
  downPayment: number            // 자기자본
  loanAmount: number             // 대출금
  interestRate: number           // 금리 (%)
  loanTermYears: number          // 대출기간 (년)
  repaymentType: 'equalPrincipal' | 'equalPayment' | 'bullet'  // 원금균등/원리금균등/만기일시

  // 계산 결과
  monthlyPayment: number         // 월 상환금
  totalInterest: number          // 총 이자
  totalRepayment: number         // 총 상환금
  ltvRatio: number               // LTV 비율 (%)

  // 상환 스케줄 (처음 12개월)
  schedule?: {
    month: number
    principal: number
    interest: number
    balance: number
  }[]
}

// 중개수수료 계산 결과
export interface CommissionResult {
  transactionType: TransactionType
  transactionAmount: number      // 거래금액
  rate: number                   // 요율 (%)
  maxRate: number                // 법정 상한 요율
  commission: number             // 수수료
  maxCommission: number          // 법정 상한 수수료
  vat: number                    // 부가세
  totalWithVat: number           // 수수료 + 부가세
}

// 취득세 계산 결과
export interface TaxResult {
  propertyPrice: number          // 매물가
  propertyType: PropertyType     // 매물 유형
  isFirstHome: boolean           // 1주택 여부
  acquisitionTaxRate: number     // 취득세율 (%)
  acquisitionTax: number         // 취득세
  educationTax: number           // 지방교육세
  specialTax: number             // 농어촌특별세 (해당시)
  totalTax: number               // 총 세금
}

// ============ AI 검색 (프리미엄 기능) ============

// 등록된 주요 단지 (네이버 검색 대상)
export interface RegisteredComplex {
  id: string
  name: string                   // 단지명
  address: string                // 주소
  complexId?: string             // 네이버 부동산 단지 ID
  propertyType: PropertyType     // 매물 유형
  totalUnits?: number            // 총 세대수
  isActive: boolean              // 활성화 여부
  createdAt: Date
  updatedAt: Date
}

// AI 검색 토큰 사용 내역
export interface AISearchUsage {
  id: string
  userId: string
  searchType: 'manual' | 'auto_match'  // 수동 검색 / 자동 매칭
  query?: string                 // 검색 쿼리 (수동 검색시)
  buyerReqId?: string            // 구매고객 요구사항 ID (자동 매칭시)
  tokensUsed: number             // 사용된 토큰 수
  resultsCount: number           // 검색 결과 수
  savedCount: number             // 저장된 매물 수
  createdAt: Date
}

// AI 검색 결과 (네이버에서 가져온 매물)
export interface AISearchResult {
  id: string
  searchUsageId: string          // 검색 사용 내역 ID

  // 네이버 매물 정보
  naverArticleNo: string         // 네이버 매물번호
  complexName: string            // 단지명
  articleName: string            // 매물명

  // 매물 정보
  transactionType: TransactionType
  propertyType: PropertyType
  price: number
  monthlyRent?: number
  area: number                   // 전용면적 (㎡)
  floor?: string
  direction?: string             // 향

  // 위치
  address: string

  // 매칭 정보
  matchedBuyerReqId?: string     // 매칭된 구매고객 요구사항 ID
  matchScore?: number            // 매칭 점수 (0-100)
  matchReasons?: string[]        // 매칭 이유

  // 상태
  isSaved: boolean               // 내 매물로 저장 여부
  savedPropertyId?: string       // 저장된 매물 ID

  createdAt: Date
}

// 월간 AI 검색 한도
export interface AISearchQuota {
  userId: string
  month: string                  // YYYY-MM 형식
  totalTokens: number            // 총 할당 토큰
  usedTokens: number             // 사용된 토큰
  remainingTokens: number        // 남은 토큰
  isPremium: boolean             // 프리미엄 사용자 여부
}

// ============ 업무(Task) 관리 ============

// 업무 우선순위
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low'

// 업무 상태
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'cancelled'

// 업무 카테고리
export type TaskCategory =
  | 'property'       // 매물 관련
  | 'buyer'          // 구매고객 관련
  | 'match'          // 매칭 관련
  | 'deal'           // 거래 관련
  | 'contract'       // 계약 관련
  | 'consultation'   // 상담 관련
  | 'viewing'        // 방문/임장 관련
  | 'admin'          // 관리/일반
  | 'other'          // 기타
  | 'advertisement'  // 광고작업
  | 'call'           // 전화작업
  | 'document'       // 서류작업
  | 'verify'         // 확인작업

// 업무 생성 소스
export type TaskSource = 'manual' | 'system' | 'ai'

// 업무 인터페이스
export interface Task {
  id: string

  // 기본 정보
  title: string                  // 업무 제목
  description?: string           // 상세 설명
  category: TaskCategory         // 카테고리
  priority: TaskPriority         // 우선순위
  status: TaskStatus             // 상태

  // 할당
  assignedTo: string             // 담당자 User ID
  assignedBy?: string            // 할당자 User ID (본인 할당 가능)

  // 기한
  dueDate?: Date                 // 마감일
  dueTime?: string               // 마감 시간 (ex: "14:00")

  // 연결된 항목
  propertyId?: string            // 관련 매물
  buyerReqId?: string            // 관련 구매고객
  matchId?: string               // 관련 매칭
  dealId?: string                // 관련 거래
  contractId?: string            // 관련 계약

  // 일정 연동
  calendarEventId?: string       // 연결된 일정 ID

  // AI/자동 생성
  source: TaskSource             // manual: 수동, system: 시스템, ai: AI 생성
  insightId?: string             // 관련 Insight ID
  feedId?: string                // 관련 ExternalFeed ID

  // 완료 정보
  completedAt?: Date             // 완료 시간
  completedBy?: string           // 완료 처리자

  // 메모
  notes?: string

  createdAt: Date
  updatedAt: Date
}

// ============ 외부 피드 (네이버 크롤링 시트) ============

// 외부 피드 인터페이스
export interface ExternalFeed {
  id: string

  // 식별
  adType?: string              // '대표' | '중복'
  repArticleNo?: string        // 대표매물번호
  articleNo: string            // 매물번호
  realtorId?: string           // 부동산ID

  // 상태
  status?: string              // '기존' | '신규'
  dupStatus?: string           // '기존' | '신규' (중복신규)
  adStatus?: string            // 광고상태
  dupAdStatus?: string         // 중복광고상태

  // 물건 정보
  transactionType?: string     // 거래유형
  complex: string              // 단지명
  dong?: string                // 동
  ho?: string                  // 호수
  floor?: string               // '7/35', '저/25'
  unitType?: string            // '82C', '100A'
  areaM2?: number              // 전용면적 ㎡
  supplyArea?: number          // 공급면적 (평)
  direction?: string           // 방향

  // 가격 (만원 단위)
  monthlyRent?: number
  monthlyRentMin?: number
  monthlyRentMax?: number
  price: number
  priceMin?: number
  priceMax?: number

  // 확인/검증
  checkStatus?: string         // 미확인|확인|계약중|보류|완료
  confirmedAt?: string         // 확인일자 (YYYYMMDD)
  individualCheck?: string     // 개별확인
  checkResult?: string         // 확인

  // 부가정보
  features?: string            // 특징
  cpCompany?: string           // CP사
  dupOrder?: number            // 중복순서
  dupCount?: number            // 중복 수
  link?: string                // 링크
  realtorName?: string         // 부동산이름

  // 내 광고
  myAdRank?: string            // '16/47'
  floorExposed?: string        // 층노출
  priceCompare?: string        // 가격비교
  memo?: string                // 메모

  // 시스템
  sheetName: string
  sheetRow?: number
  syncedAt: Date
  createdAt: Date
}

// ============ AI/알고리즘 감지 ============

// 인사이트 유형
export type InsightType =
  | 'new_listing'         // 신규 대표매물 발견
  | 'price_change'        // 가격 변동 감지
  | 'verify_expired'      // 확인일 경과
  | 'rank_change'         // 광고 랭킹 변화
  | 'buyer_match'         // 고객 매칭
  | 'duplicate_suspect'   // 중복 매물 의심

// 인사이트 상태
export type InsightStatus = 'pending' | 'approved' | 'dismissed' | 'snoozed'

// 인사이트 인터페이스
export interface Insight {
  id: string
  type: InsightType
  status: InsightStatus

  // 관련 엔티티
  articleNo?: string           // 네이버 매물번호 (핵심 식별자)
  propertyId?: string
  feedId?: string
  buyerReqId?: string

  // type별 컨텍스트 값
  price?: number               // price_change: 감지된 가격 (만원)
  oldPrice?: number            // price_change: 이전 가격 (만원)
  rank?: string                // rank_change: 현재 랭킹
  oldRank?: string             // rank_change: 이전 랭킹
  daysSince?: number           // verify_expired: 경과일수

  // 내용
  title: string
  summary?: string
  aiAnalysis?: Record<string, unknown>  // LLM 분석 시 점수/이유 등

  // 무시/스누즈
  dismissedReason?: string
  snoozedUntil?: Date

  createdAt: Date
}

// ============ 감지 규칙 설정 ============

// 감지 규칙 액션
export type InsightRuleAction = 'auto' | 'manual' | 'off'

// 감지 규칙 인터페이스
export interface InsightRule {
  id: string
  userId: string
  insightType: string          // InsightType 값
  action: InsightRuleAction    // auto: 자동 task 생성, manual: 사용자 승인 후, off: 끄기
  config?: Record<string, unknown>  // type별 설정값
  createdAt: Date
  updatedAt: Date
}

// ============ 동기화 이력 ============

// 동기화 상태
export type SyncStatus = 'success' | 'partial' | 'error'

// 동기화 로그 인터페이스
export interface SyncLog {
  id: string
  sheetId: string
  sheetName: string
  rowsFetched: number
  rowsNew: number
  rowsChanged: number
  status: SyncStatus
  errorMsg?: string
  syncedAt: Date
}

// ============ properties_full VIEW 타입 ============

// properties_full 뷰 (매물 + 주소/단지 정보)
export interface PropertyFull extends Property {
  buildingName: string
  city?: string
  district?: string
  areaDong?: string
  buildingType: BuildingType
  address?: string
  dongName?: string
  unitName: string
  unitArea?: number
}
