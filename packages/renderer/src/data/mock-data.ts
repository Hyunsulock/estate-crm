import { faker } from '@faker-js/faker'
import type {
  User,
  Customer,
  Property,
  Deal,
  DealContribution,
  CommissionSettlement,
  CommissionSettlementStatus,
  CalendarEvent,
  ContactInfo,
  CustomerType,
  PropertyType,
  TransactionType,
  DealStage,
  EventType,
  NetworkGroup,
  NetworkPost,
  Contact,
  Building,
  Dong,
  Unit,
  Ownership,
  Consultation,
  ConsultationResult,
  BuyerRequirement,
  BuyerConsultation,
  Match,
  MatchStage,
  Contract,
  ContractStatus,
  ActivityLog,
  ActivityType,
  Office,
  NaverAd,
  NaverAdMatchSuggestion,
  ContractTemplate,
  ChecklistItem,
  CheckStatus,
  MoveInType,
  RealTransaction,
  MarketPrice,
  BuildingRegistry,
  UnitRegistry,
  FieldVisit,
  FieldVisitStatus,
  PropertyLocation,
  Task,
  TaskPriority,
  TaskStatus,
  TaskCategory,
  TaskSource,
} from '@/types'

// 한국식 이름 생성 (간단한 버전)
const koreanLastNames = ['김', '이', '박', '최', '정', '강', '조', '윤', '장', '임']
const koreanFirstNames = [
  '민수',
  '지훈',
  '성민',
  '현우',
  '준호',
  '서연',
  '지은',
  '수빈',
  '민지',
  '하은',
]

function generateKoreanName(): string {
  const lastName = faker.helpers.arrayElement(koreanLastNames)
  const firstName = faker.helpers.arrayElement(koreanFirstNames)
  return `${lastName}${firstName}`
}

// 서울 지역명
const seoulDistricts = [
  '강남구',
  '서초구',
  '송파구',
  '강동구',
  '마포구',
  '용산구',
  '성동구',
  '광진구',
  '강서구',
  '양천구',
  '영등포구',
  '동작구',
  '관악구',
  '강북구',
  '성북구',
  '노원구',
  '도봉구',
  '은평구',
  '서대문구',
  '종로구',
  '중구',
]

// 서울 동 이름 (구별 대표 동)
const seoulDongs: Record<string, string[]> = {
  '강남구': ['역삼동', '삼성동', '대치동', '청담동', '논현동', '압구정동'],
  '서초구': ['서초동', '반포동', '잠원동', '방배동'],
  '송파구': ['잠실동', '문정동', '가락동', '송파동', '풍납동'],
  '강동구': ['고덕동', '명일동', '암사동', '둔촌동', '성내동'],
  '마포구': ['상암동', '합정동', '연남동', '망원동'],
  '용산구': ['이태원동', '한남동', '용산동'],
  '성동구': ['성수동', '옥수동', '금호동'],
  '광진구': ['자양동', '구의동', '화양동'],
  '강서구': ['마곡동', '등촌동', '화곡동'],
  '양천구': ['목동', '신정동', '신월동'],
  '영등포구': ['여의도동', '영등포동', '당산동'],
  '동작구': ['사당동', '노량진동', '흑석동'],
  '관악구': ['신림동', '봉천동'],
  '강북구': ['미아동', '번동', '수유동'],
  '성북구': ['성북동', '돈암동', '길음동'],
  '노원구': ['상계동', '중계동', '하계동'],
  '도봉구': ['도봉동', '창동', '방학동'],
  '은평구': ['응암동', '역촌동', '불광동'],
  '서대문구': ['연희동', '홍은동', '남가좌동'],
  '종로구': ['종로동', '혜화동', '평창동'],
  '중구': ['명동', '을지로동', '필동'],
}

// Mock Users
export function generateMockUsers(count: number = 5): User[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `user-${i + 1}`,
    name: generateKoreanName(),
    email: faker.internet.email(),
    phone: `010-${faker.string.numeric(4)}-${faker.string.numeric(4)}`,
    role: i === 0 ? ('manager' as const) : ('user' as const),
    avatar: faker.image.avatar(),
    createdAt: faker.date.past(),
  }))
}

// Mock Contacts
function generateContactInfo(): ContactInfo[] {
  const contacts: ContactInfo[] = [
    {
      id: faker.string.uuid(),
      type: 'mobile',
      number: `010-${faker.string.numeric(4)}-${faker.string.numeric(4)}`,
      isPrimary: true,
    },
  ]

  if (faker.datatype.boolean()) {
    contacts.push({
      id: faker.string.uuid(),
      type: faker.helpers.arrayElement(['home', 'work'] as const),
      number: `02-${faker.string.numeric(4)}-${faker.string.numeric(4)}`,
      isPrimary: false,
    })
  }

  return contacts
}

// Mock Customers
export function generateMockCustomers(count: number = 50): Customer[] {
  const types: CustomerType[] = ['buyer', 'seller', 'landlord', 'tenant']

  return Array.from({ length: count }, (_, i) => ({
    id: `customer-${i + 1}`,
    name: generateKoreanName(),
    contacts: generateContactInfo(),
    email: faker.datatype.boolean() ? faker.internet.email() : undefined,
    type: [faker.helpers.arrayElement(types)],
    status: faker.helpers.arrayElement(['active', 'inactive', 'potential'] as const),
    address: faker.datatype.boolean()
      ? `서울시 ${faker.helpers.arrayElement(seoulDistricts)} ${faker.location.street()}`
      : undefined,
    notes: faker.datatype.boolean() ? faker.lorem.sentences(2) : undefined,
    tags: faker.helpers.arrayElements(
      ['VIP', '투자자', '급매', '장기고객', '재방문'],
      faker.number.int({ min: 0, max: 3 }),
    ),
    assignedTo: `user-${faker.number.int({ min: 1, max: 5 })}`,
    relatedCustomers: [],
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  }))
}

// 매물명 (아파트/오피스텔)
const propertyNames = [
  '고덕그라시움',
  '래미안자이',
  '힐스테이트',
  '아크로리버파크',
  '반포자이',
  '타워팰리스',
  '삼성래미안',
  '대치아이파크',
  '잠실엘스',
  '잠실리센츠',
  '롯데캐슬',
  '푸르지오',
  '더샵',
  'e편한세상',
  '센트럴파크',
  '파크리오',
  '헬리오시티',
  '둔촌주공',
  '강남더샵',
  '반포래미안',
]

// Mock Properties (실시간 매물)
export function generateMockProperties(count: number = 30, units?: Unit[]): Property[] {
  const transactionTypes: TransactionType[] = ['sale', 'lease', 'monthly']
  const directions = ['남향', '남동향', '남서향', '동향', '서향', '북향']

  return Array.from({ length: count }, (_, i) => {
    const transactionType = faker.helpers.arrayElement(transactionTypes)
    const propertyType = faker.helpers.weightedArrayElement([
      { value: 'apartment' as const, weight: 5 },
      { value: 'officetel' as const, weight: 3 },
      { value: 'villa' as const, weight: 2 },
      { value: 'house' as const, weight: 1 },
      { value: 'commercial' as const, weight: 1 },
      { value: 'land' as const, weight: 0.5 },
    ])

    const hasTenant = faker.datatype.boolean({ probability: 0.4 })
    const floor = faker.number.int({ min: 1, max: 30 })
    const totalFloors = faker.number.int({ min: floor, max: 35 })

    // 세입자 계약 만료일 (세입자가 있는 경우)
    const tenantLeaseEndDate = hasTenant
      ? faker.date.between({
          from: new Date(),
          to: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * 2),
        })
      : undefined

    // 세입자 만료일 문자열 형식
    const tenantLeaseEnd = tenantLeaseEndDate
      ? `${tenantLeaseEndDate.getFullYear()}년 ${tenantLeaseEndDate.getMonth() + 1}월`
      : undefined

    // 입주 가능일 생성
    const generateMoveIn = (): { moveInDate: string; moveInType: MoveInType } => {
      if (hasTenant && tenantLeaseEndDate) {
        const month = tenantLeaseEndDate.getMonth() + 1
        const period = faker.helpers.arrayElement(['초', '중순', '말'])
        return {
          moveInDate: `${month}월 ${period}`,
          moveInType: 'date' as const,
        }
      }

      const type = faker.helpers.weightedArrayElement([
        { value: 'immediate' as const, weight: 4 },
        { value: 'date' as const, weight: 4 },
        { value: 'negotiable' as const, weight: 2 },
      ])

      if (type === 'immediate') {
        return {
          moveInDate: '즉시',
          moveInType: 'immediate' as const,
        }
      } else if (type === 'negotiable') {
        return {
          moveInDate: '협의',
          moveInType: 'negotiable' as const,
        }
      } else {
        const futureDate = faker.date.between({
          from: new Date(),
          to: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        })
        const month = futureDate.getMonth() + 1
        const label = faker.helpers.arrayElement([
          `${month}월`,
          `${month}월 초`,
          `${month}월 중순`,
          `${month}월 말`,
          `${month}월 이후`,
        ])
        return {
          moveInDate: label,
          moveInType: 'date' as const,
        }
      }
    }

    const moveInInfo = generateMoveIn()

    // unitId: 전달된 units에서 매칭하거나 기본 ID 생성
    const unitId = units && units.length > i
      ? units[i % units.length].id
      : `unit-building-${(i % 15) + 1}-${faker.number.int({ min: 1, max: 10 })}`

    // 초기 가격
    const initialPrice = transactionType === 'sale'
      ? faker.number.int({ min: 30000, max: 200000 })
      : faker.number.int({ min: 5000, max: 50000 })

    const price = transactionType === 'sale'
      ? faker.number.int({ min: 30000, max: 200000 })
      : faker.number.int({ min: 5000, max: 50000 })

    const priceChangePercent = initialPrice > 0
      ? Math.round(((price - initialPrice) / initialPrice) * 100 * 10) / 10
      : undefined

    return {
      id: `property-${i + 1}`,

      // 위치 연결 (필수)
      unitId,

      // 거래 정보
      type: propertyType,
      transactionType,
      status: faker.helpers.weightedArrayElement([
        { value: 'available' as const, weight: 6 },
        { value: 'in_progress' as const, weight: 2 },
        { value: 'reserved' as const, weight: 1 },
        { value: 'contracted' as const, weight: 0.7 },
        { value: 'cancelled' as const, weight: 0.3 },
      ]),

      // 면적/구조
      unitType: propertyType === 'apartment' || propertyType === 'officetel'
        ? faker.helpers.arrayElement(['59A', '59B', '74A', '74B', '84A', '84B', '84C', '102A', '102B', '114A'])
        : undefined,
      area: faker.number.int({ min: 15, max: 60 }),
      supplyArea: faker.number.int({ min: 20, max: 85 }),
      floor: propertyType !== 'land' ? floor : undefined,
      totalFloors: propertyType !== 'land' && propertyType !== 'house' ? totalFloors : undefined,
      direction: faker.helpers.arrayElement(directions),

      // 가격 정보 (만원)
      price,
      monthlyRent:
        transactionType === 'monthly'
          ? faker.number.int({ min: 50, max: 300 })
          : undefined,
      initialPrice,
      priceChangePercent,

      // 소유주 정보
      ownerName: generateKoreanName(),
      ownerPhone: `010-${faker.string.numeric(4)}-${faker.string.numeric(4)}`,
      ownerPhone2: faker.datatype.boolean({ probability: 0.3 })
        ? `02-${faker.string.numeric(4)}-${faker.string.numeric(4)}`
        : undefined,

      // 세입자/입주 정보
      hasTenant,
      tenantDeposit: hasTenant
        ? faker.number.int({ min: 1000, max: 30000 })
        : undefined,
      tenantRent: hasTenant
        ? faker.number.int({ min: 30, max: 200 })
        : undefined,
      tenantLeaseEnd,
      moveInDate: moveInInfo.moveInDate,
      moveInType: moveInInfo.moveInType,

      // 관리
      assignedTo: `user-${faker.number.int({ min: 1, max: 5 })}`,
      memo: faker.datatype.boolean({ probability: 0.3 })
        ? faker.helpers.arrayElement([
            '급매, 가격 협의 가능',
            '인테리어 상태 좋음',
            '조망권 좋음',
            '주인 직접 거래 희망',
            '빠른 거래 희망',
            '리모델링 필요',
          ])
        : undefined,
      tags: faker.helpers.arrayElements(
        ['급매', '신축', '역세권', '학군', '주차', '리모델링', '남향', '고층', '로얄층'],
        faker.number.int({ min: 0, max: 3 }),
      ),

      // 정보 확인일 (최근 1~30일)
      infoVerifiedAt: faker.date.recent({ days: 30 }),

      // 확인 상태
      checkStatus: faker.helpers.weightedArrayElement([
        { value: 'unverified' as CheckStatus, weight: 3 },
        { value: 'verified' as CheckStatus, weight: 5 },
        { value: 'in_contract' as CheckStatus, weight: 1 },
        { value: 'hold' as CheckStatus, weight: 0.5 },
        { value: 'done' as CheckStatus, weight: 0.5 },
      ]),

      // 광고 정보
      adRank: faker.datatype.boolean({ probability: 0.4 })
        ? `${faker.number.int({ min: 1, max: 30 })}/${faker.number.int({ min: 30, max: 80 })}`
        : undefined,
      adPrice: faker.datatype.boolean({ probability: 0.3 })
        ? price + faker.number.int({ min: -2000, max: 2000 })
        : undefined,
      adListedAt: faker.datatype.boolean({ probability: 0.3 })
        ? faker.date.recent({ days: 30 })
        : undefined,

      // 기타
      isSharedInNetwork: faker.datatype.boolean({ probability: 0.3 }),
      isHidden: false,

      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    }
  })
}

// Mock Deals (매칭에서 전환된 거래)
export function generateMockDeals(count: number = 15, users?: User[]): Deal[] {
  return Array.from({ length: count }, (_, i) => {
    const stage = faker.helpers.weightedArrayElement([
      { value: 'selection' as const, weight: 2 },
      { value: 'deposit' as const, weight: 3 },
      { value: 'contract' as const, weight: 3 },
      { value: 'completed' as const, weight: 4 },
      { value: 'closed' as const, weight: 2 },
      { value: 'cancelled' as const, weight: 1 },
    ])

    const isCompleted = stage === 'completed'
    const isClosed = stage === 'closed'
    const hasDeposit = ['deposit', 'contract', 'completed', 'closed'].includes(stage)
    const hasContract = ['contract', 'completed', 'closed'].includes(stage)

    const commission = faker.number.int({ min: 100, max: 1000 }) * 10000
    const commissionFromBuyer = Math.round(commission * 0.5)
    const commissionFromSeller = commission - commissionFromBuyer

    // 기여 기록 생성 (completed 또는 closed인 경우)
    const generateContributions = (): DealContribution[] => {
      if (!['completed', 'closed', 'contract', 'deposit'].includes(stage)) return []

      const contributions: DealContribution[] = []
      const stageActions: { stage: DealStage | MatchStage; actions: string[] }[] = [
        { stage: 'suggested', actions: ['매물 추천', '구매고객 분석'] },
        { stage: 'buyerContacted', actions: ['구매자 상담', '조건 협의'] },
        { stage: 'viewing', actions: ['방문 안내', '현장 설명'] },
        { stage: 'ownerContacted', actions: ['판매자 연락', '조건 전달'] },
        { stage: 'negotiating', actions: ['가격 협상', '조건 조율'] },
        { stage: 'selection', actions: ['최종 합의', '거래 조건 확정'] },
        { stage: 'deposit', actions: ['가계약 진행', '계약금 확인'] },
        { stage: 'contract', actions: ['본계약 작성', '계약서 확인'] },
        { stage: 'completed', actions: ['잔금 처리', '거래 완료 확인'] },
      ]

      stageActions.slice(0, faker.number.int({ min: 3, max: 6 })).forEach(({ stage: s, actions }) => {
        const userId = `user-${faker.number.int({ min: 1, max: 5 })}`
        const user = users?.find(u => u.id === userId)
        contributions.push({
          userId,
          userName: user?.name || generateKoreanName(),
          stage: s,
          action: faker.helpers.arrayElement(actions),
          contributedAt: faker.date.recent({ days: 60 }),
        })
      })

      return contributions
    }

    // 정산 내역 생성 (closed인 경우)
    const generateSettlements = (): CommissionSettlement[] => {
      if (!isClosed) return []

      const settlements: CommissionSettlement[] = []

      if (faker.datatype.boolean({ probability: 0.9 })) {
        settlements.push({
          id: `settlement-${i}-buyer`,
          amount: commissionFromBuyer,
          paidBy: 'buyer',
          paidAt: faker.date.recent({ days: 30 }),
          method: faker.helpers.arrayElement(['계좌이체', '현금', '카드']),
        })
      }

      if (faker.datatype.boolean({ probability: 0.9 })) {
        settlements.push({
          id: `settlement-${i}-seller`,
          amount: commissionFromSeller,
          paidBy: 'seller',
          paidAt: faker.date.recent({ days: 30 }),
          method: faker.helpers.arrayElement(['계좌이체', '현금', '카드']),
        })
      }

      return settlements
    }

    const settlements = generateSettlements()
    const totalSettled = settlements.reduce((sum, s) => sum + s.amount, 0)
    const settlementStatus: CommissionSettlementStatus =
      totalSettled >= commission ? 'completed' :
      totalSettled > 0 ? 'partial' : 'pending'

    return {
      id: `deal-${i + 1}`,
      matchId: `match-${i + 1}`,

      stage,

      agreedPrice: faker.number.int({ min: 30000, max: 200000 }),
      agreedConditions: faker.datatype.boolean({ probability: 0.5 })
        ? faker.helpers.arrayElement([
            '입주 청소 후 인도',
            '에어컨 3대 포함',
            '잔금일 협의 가능',
            '세입자 퇴거 후 인도',
          ])
        : undefined,

      depositAmount: hasDeposit
        ? faker.number.int({ min: 500, max: 3000 })
        : undefined,
      depositPaidAt: hasDeposit ? faker.date.recent({ days: 30 }) : undefined,

      contractDate: hasContract ? faker.date.soon({ days: 14 }) : undefined,
      contractSignedAt: isCompleted || isClosed ? faker.date.recent({ days: 14 }) : undefined,

      completionDate: isCompleted || isClosed ? faker.date.recent({ days: 30 }) : undefined,
      completedAt: isCompleted || isClosed ? faker.date.recent({ days: 7 }) : undefined,

      closedAt: isClosed ? faker.date.recent({ days: 14 }) : undefined,
      closedBy: isClosed ? `user-${faker.number.int({ min: 1, max: 5 })}` : undefined,

      commission,
      commissionFromBuyer,
      commissionFromSeller,

      commissionSettlements: settlements.length > 0 ? settlements : undefined,
      settlementStatus: isClosed ? settlementStatus : undefined,

      contributions: generateContributions(),

      isJointBrokerage: faker.datatype.boolean({ probability: 0.3 }),
      partnerBroker: faker.datatype.boolean({ probability: 0.3 })
        ? `${generateKoreanName()} 공인중개사`
        : undefined,
      partnerCommission: faker.datatype.boolean({ probability: 0.3 })
        ? Math.round(commission * 0.5)
        : undefined,

      assignedTo: [`user-${faker.number.int({ min: 1, max: 5 })}`],

      notes: faker.datatype.boolean({ probability: 0.4 })
        ? faker.lorem.sentences(1)
        : undefined,

      createdAt: faker.date.past({ years: 0.3 }),
      updatedAt: faker.date.recent({ days: 7 }),
    }
  })
}

// Mock Calendar Events
export function generateMockEvents(count: number = 40): CalendarEvent[] {
  const eventTypes: EventType[] = ['meeting', 'viewing', 'contract', 'deadline', 'other']

  return Array.from({ length: count }, (_, i) => {
    const start = faker.date.between({
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    })
    const end = new Date(start.getTime() + faker.number.int({ min: 30, max: 180 }) * 60 * 1000)

    return {
      id: `event-${i + 1}`,
      title: faker.helpers.arrayElement([
        '고객 상담',
        '매물 안내',
        '계약서 작성',
        '잔금 처리',
        '현장 방문',
        '고객 미팅',
      ]),
      description: faker.datatype.boolean() ? faker.lorem.sentences(1) : undefined,
      type: faker.helpers.arrayElement(eventTypes),
      start,
      end,
      allDay: faker.datatype.boolean({ probability: 0.1 }),
      customerId: faker.datatype.boolean()
        ? `customer-${faker.number.int({ min: 1, max: 50 })}`
        : undefined,
      propertyId: faker.datatype.boolean()
        ? `property-${faker.number.int({ min: 1, max: 30 })}`
        : undefined,
      dealId: faker.datatype.boolean()
        ? `deal-${faker.number.int({ min: 1, max: 20 })}`
        : undefined,
      assignedTo: [`user-${faker.number.int({ min: 1, max: 5 })}`],
      location: faker.datatype.boolean()
        ? `${faker.helpers.arrayElement(seoulDistricts)} ${faker.location.street()}`
        : undefined,
      reminderBefore: faker.helpers.arrayElement([0, 15, 30, 60, 1440]),
      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    }
  })
}

// Mock Network Groups
export function generateMockNetworkGroups(count: number = 5): NetworkGroup[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `group-${i + 1}`,
    name:
      i === 0
        ? '강남구 부동산 협회'
        : i === 1
          ? '서초 공인중개사 네트워크'
          : i === 2
            ? '송파 매물 공유 그룹'
            : `${faker.helpers.arrayElement(seoulDistricts)} 중개사 모임`,
    description: faker.lorem.sentences(2),
    ownerId: 'office-1',
    memberIds: Array.from(
      { length: faker.number.int({ min: 3, max: 8 }) },
      (_, j) => `office-${j + 1}`,
    ),
    isPrivate: faker.datatype.boolean({ probability: 0.3 }),
    createdAt: faker.date.past(),
  }))
}

// Mock Network Posts
export function generateMockNetworkPosts(count: number = 30): NetworkPost[] {
  return Array.from({ length: count }, (_, i) => {
    const postType = faker.helpers.arrayElement(['property', 'requirement'] as const)
    const isProperty = postType === 'property'

    return {
      id: `post-${i + 1}`,
      groupId: `group-${faker.number.int({ min: 1, max: 5 })}`,
      authorId: `office-${faker.number.int({ min: 1, max: 8 })}`,
      type: postType,
      propertyId: isProperty ? `property-${faker.number.int({ min: 1, max: 30 })}` : undefined,
      title: isProperty
        ? `[매물공유] ${faker.helpers.arrayElement(seoulDistricts)} ${faker.helpers.arrayElement(['아파트', '오피스텔', '빌라'])} ${faker.helpers.arrayElement(['매매', '전세', '월세'])}`
        : `[구해요] ${faker.helpers.arrayElement(seoulDistricts)} ${faker.helpers.arrayElement(['아파트', '오피스텔'])} ${faker.helpers.arrayElement(['매수', '전세'])} 희망`,
      content: faker.lorem.sentences(faker.number.int({ min: 2, max: 4 })),
      requirements: !isProperty
        ? {
            area: faker.helpers.arrayElement(seoulDistricts),
            priceMin: faker.number.int({ min: 20000, max: 50000 }),
            priceMax: faker.number.int({ min: 60000, max: 150000 }),
            propertyType: faker.helpers.arrayElement(['apartment', 'officetel'] as const),
            transactionType: faker.helpers.arrayElement(['sale', 'lease'] as const),
          }
        : undefined,
      images: isProperty
        ? Array.from({ length: faker.number.int({ min: 1, max: 3 }) }, () =>
            faker.image.urlLoremFlickr({ category: 'building' }),
          )
        : [],
      createdAt: faker.date.recent({ days: 30 }),
      updatedAt: faker.date.recent({ days: 7 }),
    }
  })
}

// ============ 잠재고객 관리 Mock 데이터 ============

// 아파트 이름
const apartmentNames = [
  '래미안자이',
  '힐스테이트',
  '아크로리버파크',
  '반포자이',
  '타워팰리스',
  '삼성래미안',
  '대치아이파크',
  '잠실엘스',
  '잠실리센츠',
  '롯데캐슬',
  '푸르지오',
  '자이',
  '아이파크',
  'e편한세상',
  '더샵',
]

// 오피스텔/생숙 이름
const officetelNames = [
  '강남역삼성타워',
  '테헤란로센터빌',
  '역삼아이타워',
  '선릉역타워',
  '삼성동오피스텔',
  '청담동타워',
  '압구정타워',
  '신사동오피스텔',
]

// Mock Contacts (새로운 통합 연락처)
export function generateMockContacts(count: number = 100): Contact[] {
  return Array.from({ length: count }, (_, i) => ({
    id: `contact-${i + 1}`,
    name: generateKoreanName(),
    phone: `010-${faker.string.numeric(4)}-${faker.string.numeric(4)}`,
    phone2: faker.datatype.boolean({ probability: 0.3 })
      ? `02-${faker.string.numeric(4)}-${faker.string.numeric(4)}`
      : undefined,
    email: faker.datatype.boolean({ probability: 0.4 }) ? faker.internet.email() : undefined,
    notes: faker.datatype.boolean({ probability: 0.3 }) ? faker.lorem.sentences(1) : undefined,
    tags: faker.helpers.arrayElements(
      ['VIP', '투자자', '급매관심', '장기고객', '재연락필요'],
      faker.number.int({ min: 0, max: 2 }),
    ),
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent(),
  }))
}

// Mock Buildings
export function generateMockBuildings(count: number = 15): Building[] {
  return Array.from({ length: count }, (_, i) => {
    const type = faker.helpers.weightedArrayElement([
      { value: 'apartment' as const, weight: 5 },
      { value: 'officetel' as const, weight: 3 },
      { value: 'villa' as const, weight: 2 },
      { value: 'house' as const, weight: 1 },
      { value: 'living_accommodation' as const, weight: 1 },
    ])

    const name =
      type === 'apartment'
        ? faker.helpers.arrayElement(apartmentNames)
        : type === 'officetel' || type === 'living_accommodation'
          ? faker.helpers.arrayElement(officetelNames)
          : type === 'villa'
            ? `${faker.helpers.arrayElement(seoulDistricts)} 빌라`
            : `${faker.helpers.arrayElement(seoulDistricts)} 단독주택`

    const district = faker.helpers.arrayElement(seoulDistricts)
    const dongList = seoulDongs[district] || ['동']
    const dong = faker.helpers.arrayElement(dongList)

    return {
      id: `building-${i + 1}`,
      type,
      name: `${name}${type === 'apartment' || type === 'officetel' ? '' : ` ${faker.number.int({ min: 1, max: 99 })}`}`,

      // 주소 필터링용
      city: '서울시',
      district,
      dong,
      address: `서울시 ${district} ${faker.location.street()} ${faker.number.int({ min: 1, max: 999 })}`,

      // 부가정보
      totalUnits: type === 'apartment'
        ? faker.number.int({ min: 500, max: 3000 })
        : type === 'officetel'
          ? faker.number.int({ min: 100, max: 500 })
          : type === 'villa'
            ? faker.number.int({ min: 10, max: 30 })
            : undefined,
      builtYear: faker.number.int({ min: 1995, max: 2024 }),

      createdAt: faker.date.past(),
      updatedAt: faker.date.recent(),
    }
  })
}

// Mock Dongs
export function generateMockDongs(buildings: Building[]): Dong[] {
  const dongs: Dong[] = []

  buildings.forEach((building) => {
    if (building.type === 'house') {
      return
    }

    const dongCount =
      building.type === 'apartment'
        ? faker.number.int({ min: 2, max: 5 })
        : building.type === 'villa'
          ? 1
          : faker.number.int({ min: 1, max: 2 })

    for (let i = 0; i < dongCount; i++) {
      dongs.push({
        id: `dong-${building.id}-${i + 1}`,
        buildingId: building.id,
        name: building.type === 'villa' ? '1동' : `${100 + i + 1}동`,
        createdAt: faker.date.past(),
      })
    }
  })

  return dongs
}

// Mock Units
export function generateMockUnits(buildings: Building[], dongs: Dong[]): Unit[] {
  const units: Unit[] = []

  buildings.forEach((building) => {
    if (building.type === 'house') {
      units.push({
        id: `unit-${building.id}-main`,
        buildingId: building.id,
        dongId: null,
        name: '본채',
        area: faker.number.int({ min: 30, max: 80 }),
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      })
      return
    }

    const buildingDongs = dongs.filter((d) => d.buildingId === building.id)

    buildingDongs.forEach((dong) => {
      const unitCount =
        building.type === 'apartment'
          ? faker.number.int({ min: 5, max: 10 })
          : building.type === 'villa'
            ? faker.number.int({ min: 4, max: 8 })
            : faker.number.int({ min: 8, max: 15 })

      for (let i = 0; i < unitCount; i++) {
        const floor = faker.number.int({ min: 1, max: 25 })
        const ho = faker.number.int({ min: 1, max: 4 })

        units.push({
          id: `unit-${dong.id}-${i + 1}`,
          buildingId: building.id,
          dongId: dong.id,
          name: `${floor}0${ho}호`,
          area: faker.datatype.boolean({ probability: 0.6 })
            ? faker.number.int({ min: 15, max: 60 })
            : undefined,
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
        })
      }
    })
  })

  return units
}

// Mock Ownerships
export function generateMockOwnerships(contacts: Contact[], units: Unit[]): Ownership[] {
  const ownerships: Ownership[] = []
  const ownerContacts = contacts.slice(0, Math.floor(contacts.length * 0.5))

  units.forEach((unit, index) => {
    if (faker.datatype.boolean({ probability: 0.85 })) {
      const contact = faker.helpers.arrayElement(ownerContacts)
      const isJointOwnership = faker.datatype.boolean({ probability: 0.1 })

      ownerships.push({
        id: `ownership-${index + 1}`,
        contactId: contact.id,
        unitId: unit.id,
        status: faker.helpers.weightedArrayElement([
          { value: 'active' as const, weight: 9 },
          { value: 'sold' as const, weight: 1 },
        ]),
        startDate: faker.datatype.boolean({ probability: 0.5 }) ? faker.date.past({ years: 5 }) : undefined,
        endDate: undefined,
        shareRatio: isJointOwnership ? 50 : undefined,
        isResident: faker.datatype.boolean({ probability: 0.4 }),
        memo: faker.datatype.boolean({ probability: 0.2 }) ? faker.lorem.sentence() : undefined,
        createdAt: faker.date.past(),
        updatedAt: faker.date.recent(),
      })

      if (isJointOwnership) {
        const anotherContact = faker.helpers.arrayElement(
          ownerContacts.filter((c) => c.id !== contact.id),
        )
        ownerships.push({
          id: `ownership-${index + 1}-joint`,
          contactId: anotherContact.id,
          unitId: unit.id,
          status: 'active',
          shareRatio: 50,
          isResident: false,
          createdAt: faker.date.past(),
          updatedAt: faker.date.recent(),
        })
      }
    }
  })

  return ownerships
}

// Mock Consultations
export function generateMockConsultations(ownerships: Ownership[], users: User[]): Consultation[] {
  const results: ConsultationResult[] = ['interested', 'rejected', 'pending', 'priceInquiry', 'callback', 'other']
  const consultations: Consultation[] = []

  const selectedOwnerships = faker.helpers.arrayElements(
    ownerships.filter((o) => o.status === 'active'),
    Math.min(30, ownerships.length),
  )

  selectedOwnerships.forEach((ownership, index) => {
    const consultCount = faker.number.int({ min: 1, max: 3 })

    for (let i = 0; i < consultCount; i++) {
      const date = faker.date.recent({ days: 90 })

      consultations.push({
        id: `consultation-${index + 1}-${i + 1}`,
        contactId: ownership.contactId,
        ownershipId: ownership.id,
        date,
        content: faker.helpers.arrayElement([
          '전화 상담 - 매도 의사 문의',
          '방문 상담 - 시세 안내',
          '전화 상담 - 가격 협의',
          '재연락 요청',
          '관심 있음, 추후 연락 예정',
          '현재 매도 의사 없음',
          '가격 문의 - 시세보다 높게 희망',
          '임대 중이라 당분간 매도 어려움',
        ]),
        result: faker.helpers.arrayElement(results),
        nextContactDate: faker.datatype.boolean({ probability: 0.4 })
          ? faker.date.future({ years: 0.5 })
          : undefined,
        desiredPrice: faker.datatype.boolean({ probability: 0.3 })
          ? faker.number.int({ min: 50000, max: 200000 })
          : undefined,
        createdBy: faker.helpers.arrayElement(users).id,
        createdAt: date,
      })
    }
  })

  return consultations
}

// ============ 구매고객 Mock 데이터 ============

// Mock BuyerRequirements (구매고객 희망조건)
export function generateMockBuyerRequirements(contacts: Contact[], users: User[], count: number = 25): BuyerRequirement[] {
  const buyerContacts = contacts.slice(Math.floor(contacts.length * 0.4))
  const propertyTypes: PropertyType[] = ['apartment', 'officetel', 'villa', 'house']

  // 조건 태그 목록
  const mustConditionTags = ['역세권', '학군우수', '주차2대이상', '신축5년이내', '남향', '엘리베이터']
  const preferConditionTags = ['조용한환경', '공원인접', '대형마트인근', '고층', '리모델링완료', '풀옵션', '반려동물가능']

  return Array.from({ length: count }, (_, i) => {
    const transactionType = faker.helpers.weightedArrayElement([
      { value: 'sale' as const, weight: 5 },
      { value: 'lease' as const, weight: 3 },
      { value: 'monthly' as const, weight: 2 },
    ])

    const budgetBase = transactionType === 'sale'
      ? faker.number.int({ min: 30000, max: 150000 })
      : faker.number.int({ min: 5000, max: 50000 })

    const budgetMin = budgetBase
    const budgetMax = budgetBase + faker.number.int({ min: 10000, max: 50000 })

    return {
      id: `buyer-req-${i + 1}`,
      contactId: faker.helpers.arrayElement(buyerContacts).id,
      transactionType,
      areas: faker.helpers.arrayElements(seoulDistricts, faker.number.int({ min: 1, max: 3 })),
      propertyTypes: faker.helpers.arrayElements(propertyTypes, faker.number.int({ min: 1, max: 2 })),
      budgetMin,
      budgetMax,
      monthlyRentMax: transactionType === 'monthly'
        ? faker.number.int({ min: 50, max: 200 })
        : undefined,
      areaMin: faker.datatype.boolean({ probability: 0.7 })
        ? faker.number.int({ min: 15, max: 30 })
        : undefined,
      areaMax: faker.datatype.boolean({ probability: 0.5 })
        ? faker.number.int({ min: 35, max: 60 })
        : undefined,
      preferences: faker.datatype.boolean({ probability: 0.6 })
        ? faker.helpers.arrayElements(
            ['역세권', '학군', '신축', '주차편리', '조용한곳', '고층', '남향', '리모델링OK'],
            faker.number.int({ min: 1, max: 3 }),
          ).join(', ')
        : undefined,
      mustConditions: faker.helpers.arrayElements(
        mustConditionTags,
        faker.number.int({ min: 0, max: 3 }),
      ),
      preferConditions: faker.helpers.arrayElements(
        preferConditionTags,
        faker.number.int({ min: 0, max: 4 }),
      ),
      moveInDeadline: faker.datatype.boolean({ probability: 0.5 })
        ? faker.date.future({ years: 0.5 })
        : undefined,
      urgency: faker.helpers.weightedArrayElement([
        { value: 'urgent' as const, weight: 2 },
        { value: 'normal' as const, weight: 5 },
        { value: 'flexible' as const, weight: 3 },
      ]),
      status: faker.helpers.weightedArrayElement([
        { value: 'active' as const, weight: 6 },
        { value: 'matched' as const, weight: 2 },
        { value: 'completed' as const, weight: 1 },
        { value: 'inactive' as const, weight: 1 },
      ]),
      assignedTo: faker.helpers.arrayElement(users).id,
      memo: faker.datatype.boolean({ probability: 0.3 })
        ? faker.helpers.arrayElement([
            '급하게 찾고 있음, 조건 맞으면 바로 계약 가능',
            '투자 목적, 수익률 중시',
            '실거주, 학군 최우선',
            '부모님 모시고 살 예정, 넓은 평수 선호',
            '신혼부부, 대출 가능 여부 확인 필요',
            '재계약 안되서 급하게 이사',
          ])
        : undefined,
      lastContactDate: faker.datatype.boolean({ probability: 0.7 })
        ? faker.date.recent({ days: 30 })
        : undefined,
      nextContactDate: faker.datatype.boolean({ probability: 0.4 })
        ? faker.date.future({ years: 0.3 })
        : undefined,
      createdAt: faker.date.past({ years: 0.5 }),
      updatedAt: faker.date.recent({ days: 14 }),
    }
  })
}

// Mock BuyerConsultations (구매고객 상담 기록)
export function generateMockBuyerConsultations(
  requirements: BuyerRequirement[],
  users: User[],
): BuyerConsultation[] {
  const consultations: BuyerConsultation[] = []

  const activeRequirements = requirements.filter((r) => r.status === 'active' || r.status === 'matched')

  activeRequirements.forEach((req, index) => {
    const consultCount = faker.number.int({ min: 1, max: 4 })

    for (let i = 0; i < consultCount; i++) {
      const date = faker.date.recent({ days: 60 })

      consultations.push({
        id: `buyer-consult-${index + 1}-${i + 1}`,
        requirementId: req.id,
        date,
        content: faker.helpers.arrayElement([
          '매물 3건 안내, 고덕그라시움 관심',
          '래미안자이 방문 예정 잡음',
          '예산 조정 - 1억 상향 가능',
          '힐스테이트 계약 진행 논의',
          '방문 후 검토 중, 재연락 예정',
          '조건에 맞는 매물 없어서 대기',
          '다른 지역도 검토하겠다고 함',
          '월세로 전환 고려 중',
        ]),
        recommendedPropertyIds: faker.datatype.boolean({ probability: 0.5 })
          ? Array.from(
              { length: faker.number.int({ min: 1, max: 3 }) },
              () => `property-${faker.number.int({ min: 1, max: 30 })}`,
            )
          : undefined,
        nextContactDate: faker.datatype.boolean({ probability: 0.4 })
          ? faker.date.future({ years: 0.3 })
          : undefined,
        createdBy: faker.helpers.arrayElement(users).id,
        createdAt: date,
      })
    }
  })

  return consultations
}

// ============ 매칭 관리 Mock 데이터 ============

// Mock Matches (구매고객-매물 매칭)
export function generateMockMatches(
  buyerRequirements: BuyerRequirement[],
  properties: Property[],
  users: User[],
  count: number = 40,
): Match[] {
  const activeRequirements = buyerRequirements.filter(
    (r) => r.status === 'active' || r.status === 'matched',
  )

  const availableProperties = properties.filter(
    (p) => p.status === 'available' || p.status === 'in_progress',
  )

  const matches: Match[] = []
  const usedPairs = new Set<string>()

  for (let i = 0; i < count; i++) {
    const buyerReq = faker.helpers.arrayElement(activeRequirements)
    const property = faker.helpers.arrayElement(availableProperties)

    const pairKey = `${buyerReq.id}-${property.id}`
    if (usedPairs.has(pairKey)) continue
    usedPairs.add(pairKey)

    const stage = faker.helpers.weightedArrayElement([
      { value: 'suggested' as const, weight: 3 },
      { value: 'buyerContacted' as const, weight: 3 },
      { value: 'viewing' as const, weight: 5 },
      { value: 'ownerContacted' as const, weight: 2 },
      { value: 'negotiating' as const, weight: 1.5 },
      { value: 'dealCreated' as const, weight: 0.5 },
      { value: 'closed' as const, weight: 2 },
    ])

    const isClosed = stage === 'closed'
    const isViewingStage = stage === 'viewing'
    const hasViewing = ['viewing', 'ownerContacted', 'negotiating', 'dealCreated'].includes(stage)
    const isViewed = ['ownerContacted', 'negotiating', 'dealCreated'].includes(stage) ||
                     (isViewingStage && faker.datatype.boolean({ probability: 0.5 }))
    const hasOwnerContact = ['ownerContacted', 'negotiating', 'dealCreated'].includes(stage)

    matches.push({
      id: `match-${i + 1}`,
      buyerReqId: buyerReq.id,
      propertyId: property.id,
      stage,

      buyerInterest: stage !== 'suggested'
        ? faker.helpers.weightedArrayElement([
            { value: 'interested' as const, weight: 5 },
            { value: 'pending' as const, weight: 2 },
            { value: 'notInterested' as const, weight: 1 },
          ])
        : undefined,
      buyerNote: stage !== 'suggested' && faker.datatype.boolean({ probability: 0.4 })
        ? faker.helpers.arrayElement([
            '가격이 좀 높다고 함',
            '위치 마음에 들어함',
            '평수가 작다고 함',
            '관심 있음, 방문 원함',
            '다른 매물도 보고 싶다고 함',
          ])
        : undefined,

      viewingDate: hasViewing
        ? faker.date.between({
            from: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            to: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          })
        : undefined,
      viewedAt: isViewed ? faker.date.recent({ days: 14 }) : undefined,
      viewingFeedback: isViewed
        ? faker.helpers.weightedArrayElement([
            { value: 'interested' as const, weight: 5 },
            { value: 'pending' as const, weight: 2 },
            { value: 'notInterested' as const, weight: 1 },
          ])
        : undefined,
      viewingNote: isViewed && faker.datatype.boolean({ probability: 0.5 })
        ? faker.helpers.arrayElement([
            '내부 상태 양호',
            '리모델링 필요하다고 함',
            '조망 마음에 들어함',
            '층수가 낮아서 고민중',
            '바로 계약하고 싶다고 함',
          ])
        : undefined,

      ownerContacted: hasOwnerContact,
      ownerResponse: hasOwnerContact
        ? (['negotiating', 'dealCreated'].includes(stage)
            ? 'interested'
            : faker.helpers.weightedArrayElement([
                { value: 'interested' as const, weight: 4 },
                { value: 'pending' as const, weight: 2 },
                { value: 'notInterested' as const, weight: 1 },
              ]))
        : undefined,
      ownerNote: hasOwnerContact && faker.datatype.boolean({ probability: 0.4 })
        ? faker.helpers.arrayElement([
            '급매 아님, 천천히 진행',
            '가격 협의 가능',
            '이번달 내 계약 희망',
            '세입자 퇴거 후 진행',
          ])
        : undefined,
      ownerAskingPrice: hasOwnerContact && faker.datatype.boolean({ probability: 0.6 })
        ? property.price + faker.number.int({ min: -5000, max: 5000 })
        : undefined,

      dealId: stage === 'dealCreated' ? `deal-${i + 1}` : undefined,

      closedAt: isClosed ? faker.date.recent({ days: 30 }) : undefined,
      closedReason: isClosed
        ? faker.helpers.arrayElement([
            '구매자 무관심',
            '판매자 거절',
            '가격 협의 실패',
            '다른 매물 계약',
            '구매자 조건 변경',
          ])
        : undefined,

      assignedTo: faker.helpers.arrayElement(users).id,
      createdAt: faker.date.past({ years: 0.3 }),
      updatedAt: faker.date.recent({ days: 7 }),
    })
  }

  return matches
}

// ============ 계약서 Mock 데이터 ============

// Mock Contracts (계약서)
export function generateMockContracts(
  deals: Deal[],
  properties: Property[],
  contacts: Contact[],
  matches: Match[],
  buyerRequirements: BuyerRequirement[],
): Contract[] {
  const contractableDeals = deals.filter(d => ['contract', 'completed'].includes(d.stage))

  return contractableDeals.map((deal, i) => {
    const match = matches.find(m => m.dealId === deal.id)
    const property = match ? properties.find(p => p.id === match.propertyId) : undefined
    const buyerReq = match ? buyerRequirements.find(br => br.id === match.buyerReqId) : undefined

    const buyerContact = buyerReq ? contacts.find(c => c.id === buyerReq.contactId) : undefined
    const ownerContacts = contacts.slice(0, Math.floor(contacts.length * 0.5))
    const sellerContact = faker.helpers.arrayElement(ownerContacts)

    const transactionType = property?.transactionType || faker.helpers.arrayElement(['sale', 'lease', 'monthly'] as TransactionType[])
    const totalPrice = deal.agreedPrice || property?.price || faker.number.int({ min: 30000, max: 150000 })

    const status: ContractStatus = deal.stage === 'completed'
      ? faker.helpers.arrayElement(['balancePaid', 'registered'] as ContractStatus[])
      : faker.helpers.weightedArrayElement([
          { value: 'draft' as const, weight: 1 },
          { value: 'signed' as const, weight: 2 },
          { value: 'depositPaid' as const, weight: 3 },
        ])

    const contractDate = faker.date.recent({ days: 60 })
    const balanceDate = faker.date.soon({ days: 60, refDate: contractDate })
    const moveInDate = faker.date.soon({ days: 14, refDate: balanceDate })

    const depositAmount = Math.round(totalPrice * 0.1)
    const balanceAmount = totalPrice - depositAmount

    const monthlyRent = transactionType === 'monthly'
      ? faker.number.int({ min: 50, max: 200 })
      : undefined

    const leaseStartDate = transactionType !== 'sale' ? moveInDate : undefined
    const leaseEndDate = leaseStartDate
      ? new Date(leaseStartDate.getTime() + 365 * 24 * 60 * 60 * 1000 * 2)
      : undefined

    return {
      id: `contract-${i + 1}`,
      dealId: deal.id,
      propertyId: property?.id || `property-${i + 1}`,
      transactionType,

      buyerContactId: buyerContact?.id || `contact-${faker.number.int({ min: 1, max: 50 })}`,
      sellerContactId: sellerContact.id,

      totalPrice,
      monthlyRent,

      depositAmount,
      depositDate: contractDate,
      depositPaidAt: ['depositPaid', 'balancePaid', 'registered'].includes(status)
        ? faker.date.soon({ days: 3, refDate: contractDate })
        : undefined,

      middlePayment: faker.datatype.boolean({ probability: 0.3 })
        ? Math.round(totalPrice * 0.2)
        : undefined,
      middlePaymentDate: faker.datatype.boolean({ probability: 0.3 })
        ? faker.date.between({ from: contractDate, to: balanceDate })
        : undefined,
      middlePaymentPaidAt: undefined,

      balanceAmount,
      balanceDate,
      balancePaidAt: ['balancePaid', 'registered'].includes(status)
        ? faker.date.soon({ days: 3, refDate: balanceDate })
        : undefined,

      contractDate,
      moveInDate,

      leaseStartDate,
      leaseEndDate,

      specialTerms: faker.datatype.boolean({ probability: 0.6 })
        ? faker.helpers.arrayElement([
            '입주 시 내부 청소 완료 후 인도',
            '에어컨 3대 포함하여 거래',
            '주차 1대 포함',
            '잔금 시 실측 후 면적 차이 정산',
            '현 시설 상태 그대로 인도 (하자 없음 확인)',
            '세입자 퇴거 후 명도 완료 상태로 인도',
          ])
        : undefined,

      status,

      commission: deal.commission || Math.round(totalPrice * 0.004),
      commissionRate: 0.4,

      isJointBrokerage: deal.isJointBrokerage,
      partnerBrokerName: deal.partnerBroker,
      partnerBrokerPhone: deal.partnerBroker
        ? `010-${faker.string.numeric(4)}-${faker.string.numeric(4)}`
        : undefined,
      partnerCommission: deal.isJointBrokerage && deal.commission
        ? Math.round(deal.commission / 2)
        : undefined,

      attachments: [],

      assignedTo: deal.assignedTo[0] || 'user-1',

      notes: faker.datatype.boolean({ probability: 0.3 })
        ? faker.lorem.sentence()
        : undefined,

      createdAt: contractDate,
      updatedAt: faker.date.recent({ days: 7 }),
    }
  })
}

// Mock Activity Logs (직원 활동 로그)
export function generateMockActivityLogs(
  users: User[],
  properties: Property[],
  buyerRequirements: BuyerRequirement[],
  matches: Match[],
  buildings: Building[],
): ActivityLog[] {
  const activityTypes: {
    type: ActivityType
    targetType?: ActivityLog['targetType']
    descriptions: string[]
  }[] = [
    {
      type: 'property_create',
      targetType: 'property',
      descriptions: ['매물을 등록했습니다', '새로운 매물을 추가했습니다'],
    },
    {
      type: 'property_update',
      targetType: 'property',
      descriptions: [
        '매물 정보를 수정했습니다',
        '매물 가격을 변경했습니다',
        '매물 상태를 변경했습니다',
        '정보 확인일을 갱신했습니다',
      ],
    },
    {
      type: 'property_hide',
      targetType: 'property',
      descriptions: ['매물을 숨김 처리했습니다'],
    },
    {
      type: 'buyer_create',
      targetType: 'buyer',
      descriptions: ['구매고객을 등록했습니다', '새로운 구매고객을 추가했습니다'],
    },
    {
      type: 'buyer_update',
      targetType: 'buyer',
      descriptions: [
        '구매고객 정보를 수정했습니다',
        '구매고객 상태를 변경했습니다',
        '구매고객 요구사항을 수정했습니다',
      ],
    },
    {
      type: 'match_create',
      targetType: 'match',
      descriptions: ['매칭을 생성했습니다', '구매고객에게 매물을 추천했습니다'],
    },
    {
      type: 'match_update',
      targetType: 'match',
      descriptions: [
        '매칭 상태를 변경했습니다',
        '임장을 예약했습니다',
        '임장을 완료했습니다',
        '집주인 연락을 완료했습니다',
      ],
    },
    {
      type: 'deal_create',
      targetType: 'deal',
      descriptions: ['거래를 생성했습니다'],
    },
    {
      type: 'deal_update',
      targetType: 'deal',
      descriptions: ['거래 상태를 변경했습니다', '거래를 진행했습니다'],
    },
    {
      type: 'contract_create',
      targetType: 'contract',
      descriptions: ['계약서를 생성했습니다'],
    },
    {
      type: 'contract_update',
      targetType: 'contract',
      descriptions: [
        '계약서를 수정했습니다',
        '계약금 입금을 확인했습니다',
        '잔금 입금을 확인했습니다',
      ],
    },
    {
      type: 'consultation_create',
      targetType: 'consultation',
      descriptions: ['상담 기록을 추가했습니다', '소유주와 상담을 진행했습니다'],
    },
    {
      type: 'building_create',
      targetType: 'building',
      descriptions: ['건물을 등록했습니다', '새로운 건물을 추가했습니다'],
    },
    {
      type: 'owner_create',
      descriptions: ['소유자를 등록했습니다'],
    },
    {
      type: 'login',
      descriptions: ['로그인했습니다'],
    },
  ]

  const logs: ActivityLog[] = []

  for (let i = 0; i < 200; i++) {
    const user = faker.helpers.arrayElement(users)
    const activityConfig = faker.helpers.arrayElement(activityTypes)
    const description = faker.helpers.arrayElement(activityConfig.descriptions)

    let targetId: string | undefined
    let targetName: string | undefined

    if (activityConfig.targetType === 'property' && properties.length > 0) {
      const property = faker.helpers.arrayElement(properties)
      targetId = property.id
      targetName = `매물 ${property.id}`
    } else if (activityConfig.targetType === 'buyer' && buyerRequirements.length > 0) {
      const buyer = faker.helpers.arrayElement(buyerRequirements)
      targetId = buyer.id
      targetName = buyer.id
    } else if (activityConfig.targetType === 'match' && matches.length > 0) {
      const match = faker.helpers.arrayElement(matches)
      targetId = match.id
    } else if (activityConfig.targetType === 'building' && buildings.length > 0) {
      const building = faker.helpers.arrayElement(buildings)
      targetId = building.id
      targetName = building.name
    }

    logs.push({
      id: `activity-${i + 1}`,
      userId: user.id,
      type: activityConfig.type,
      description,
      targetType: activityConfig.targetType,
      targetId,
      targetName,
      createdAt: faker.date.recent({ days: 30 }),
    })
  }

  return logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
}

// ============ 사무소 & 네이버 광고 Mock 데이터 (프리미엄) ============

// Mock Office (현재 사무소 - 프리미엄 구독 상태)
export function generateMockOffice(): Office {
  return {
    id: 'office-1',
    name: '강남중앙공인중개사사무소',
    plan: 'premium',
    planExpiresAt: faker.date.future({ years: 1 }),
    createdAt: faker.date.past({ years: 2 }),
    updatedAt: faker.date.recent(),
  }
}

// Mock NaverAds (네이버 부동산 광고 목록)
export function generateMockNaverAds(properties: Property[], count: number = 25): NaverAd[] {
  return Array.from({ length: count }, (_, i) => {
    const status = faker.helpers.weightedArrayElement([
      { value: 'active' as const, weight: 6 },
      { value: 'paused' as const, weight: 1 },
      { value: 'expired' as const, weight: 2 },
      { value: 'pending' as const, weight: 1 },
    ])

    const transactionType = faker.helpers.arrayElement(['sale', 'lease', 'monthly'] as const)
    const buildingName = faker.helpers.arrayElement(propertyNames)
    const dong = `${faker.number.int({ min: 101, max: 115 })}동`
    const floor = faker.number.int({ min: 1, max: 25 })
    const area = faker.number.int({ min: 40, max: 150 })

    const shouldMatch = faker.datatype.boolean({ probability: 0.4 })
    const matchedProperty = shouldMatch ? faker.helpers.arrayElement(properties) : undefined

    const startDate = faker.date.recent({ days: 60 })
    const endDate = new Date(startDate.getTime() + 30 * 24 * 60 * 60 * 1000)

    return {
      id: `naver-ad-${i + 1}`,
      articleNo: `${faker.number.int({ min: 2400000000, max: 2499999999 })}`,
      articleName: `${buildingName} ${dong} ${floor}층`,
      status,

      buildingName,
      dong,
      floor: `${floor}층`,
      area,
      supplyArea: Math.round(area * 1.3),

      transactionType,
      price: transactionType === 'sale'
        ? faker.number.int({ min: 30000, max: 200000 })
        : faker.number.int({ min: 5000, max: 50000 }),
      monthlyRent: transactionType === 'monthly'
        ? faker.number.int({ min: 50, max: 300 })
        : undefined,

      address: `서울시 ${faker.helpers.arrayElement(seoulDistricts)} ${faker.location.street()} ${faker.number.int({ min: 1, max: 999 })}`,
      roadAddress: `서울시 ${faker.helpers.arrayElement(seoulDistricts)} ${faker.location.street()}로 ${faker.number.int({ min: 1, max: 200 })}`,

      viewCount: faker.number.int({ min: 50, max: 5000 }),
      favoriteCount: faker.number.int({ min: 0, max: 100 }),
      inquiryCount: faker.number.int({ min: 0, max: 30 }),

      rank: faker.number.int({ min: 1, max: 50 }),
      totalAdsInArea: faker.number.int({ min: 20, max: 80 }),

      startDate,
      endDate,

      matchedPropertyId: matchedProperty?.id,
      matchConfidence: matchedProperty ? faker.number.int({ min: 60, max: 100 }) : undefined,
      matchedAt: matchedProperty ? faker.date.recent({ days: 7 }) : undefined,

      lastSyncAt: faker.date.recent({ days: 1 }),

      createdAt: startDate,
      updatedAt: faker.date.recent({ days: 3 }),
    }
  })
}

// Mock NaverAd Match Suggestions (자동 매칭 제안)
export function generateMockNaverAdMatchSuggestions(
  naverAds: NaverAd[],
  properties: Property[],
): NaverAdMatchSuggestion[] {
  const suggestions: NaverAdMatchSuggestion[] = []

  const unmatchedAds = naverAds.filter((ad) => !ad.matchedPropertyId && ad.status === 'active')

  unmatchedAds.forEach((ad) => {
    const candidateProperties = properties.filter((p) => {
      const typeMatch = p.transactionType === ad.transactionType
      const priceDiff = Math.abs(p.price - ad.price) / Math.max(p.price, ad.price)
      const priceMatch = priceDiff < 0.2

      return typeMatch && priceMatch
    })

    candidateProperties.slice(0, 2).forEach((property) => {
      const matchReasons: string[] = []

      if (property.transactionType === ad.transactionType) {
        matchReasons.push('거래유형 일치')
      }
      const priceDiff = Math.abs(property.price - ad.price) / Math.max(property.price, ad.price)
      if (priceDiff < 0.1) {
        matchReasons.push('가격 일치')
      } else if (priceDiff < 0.2) {
        matchReasons.push('가격 유사')
      }
      if (property.area && ad.area && Math.abs(property.area - ad.area) < 10) {
        matchReasons.push('면적 유사')
      }

      if (matchReasons.length >= 2) {
        suggestions.push({
          naverAdId: ad.id,
          propertyId: property.id,
          confidence: Math.min(95, 50 + matchReasons.length * 15),
          matchReasons,
          createdAt: faker.date.recent({ days: 1 }),
        })
      }
    })
  })

  return suggestions
}

// ============ 시세/실거래가 Mock 데이터 ============

// Mock Real Transactions (실거래가)
export function generateMockRealTransactions(buildings: Building[]): RealTransaction[] {
  const transactions: RealTransaction[] = []

  buildings.forEach((building) => {
    const transactionCount = faker.number.int({ min: 3, max: 8 })

    for (let i = 0; i < transactionCount; i++) {
      const transactionType = faker.helpers.weightedArrayElement([
        { value: 'sale' as const, weight: 4 },
        { value: 'lease' as const, weight: 4 },
        { value: 'monthly' as const, weight: 2 },
      ])

      const basePrice = transactionType === 'sale'
        ? faker.number.int({ min: 50000, max: 200000 })
        : faker.number.int({ min: 10000, max: 80000 })

      transactions.push({
        id: `real-tx-${building.name}-${i + 1}`,
        buildingName: building.name,
        dong: faker.helpers.arrayElement(['101동', '102동', '103동', '104동', '105동']),
        area: faker.helpers.arrayElement([59, 74, 84, 99, 114, 134]),
        floor: faker.number.int({ min: 1, max: 30 }),
        price: basePrice,
        transactionType,
        transactionDate: faker.date.between({
          from: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000),
          to: new Date(),
        }),
        registrationDate: faker.datatype.boolean({ probability: 0.7 })
          ? faker.date.recent({ days: 60 })
          : undefined,
      })
    }
  })

  return transactions.sort((a, b) =>
    new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
  )
}

// Mock Market Prices (시세 정보)
export function generateMockMarketPrices(buildings: Building[]): MarketPrice[] {
  const marketPrices: MarketPrice[] = []

  buildings.forEach((building) => {
    const areas = [59, 74, 84, 99, 114]

    areas.forEach((area) => {
      const saleAvg = faker.number.int({ min: 80000, max: 250000 })
      const saleVariance = Math.round(saleAvg * 0.05)

      marketPrices.push({
        id: `market-${building.name}-${area}-sale`,
        buildingName: building.name,
        area,
        transactionType: 'sale',
        lowPrice: saleAvg - saleVariance,
        highPrice: saleAvg + saleVariance,
        avgPrice: saleAvg,
        changeFromLastMonth: faker.number.int({ min: -5000, max: 5000 }),
        changePercentFromLastMonth: faker.number.float({ min: -3, max: 3, fractionDigits: 1 }),
        baseDate: new Date(),
        source: faker.helpers.arrayElement(['KB시세', '호갱노노', '네이버부동산']),
      })

      const leaseAvg = Math.round(saleAvg * faker.number.float({ min: 0.4, max: 0.6 }))
      const leaseVariance = Math.round(leaseAvg * 0.05)

      marketPrices.push({
        id: `market-${building.name}-${area}-lease`,
        buildingName: building.name,
        area,
        transactionType: 'lease',
        lowPrice: leaseAvg - leaseVariance,
        highPrice: leaseAvg + leaseVariance,
        avgPrice: leaseAvg,
        changeFromLastMonth: faker.number.int({ min: -3000, max: 3000 }),
        changePercentFromLastMonth: faker.number.float({ min: -5, max: 5, fractionDigits: 1 }),
        baseDate: new Date(),
        source: faker.helpers.arrayElement(['KB시세', '호갱노노', '네이버부동산']),
      })
    })
  })

  return marketPrices
}

// ============ 건축물대장 Mock 데이터 ============

// 서울 주요 좌표 (위도, 경도)
const seoulCoordinates: Record<string, { lat: number; lng: number }> = {
  '강남구': { lat: 37.5172, lng: 127.0473 },
  '서초구': { lat: 37.4837, lng: 127.0324 },
  '송파구': { lat: 37.5145, lng: 127.1059 },
  '강동구': { lat: 37.5301, lng: 127.1238 },
  '마포구': { lat: 37.5663, lng: 126.9014 },
  '용산구': { lat: 37.5326, lng: 126.9906 },
  '성동구': { lat: 37.5633, lng: 127.0371 },
  '광진구': { lat: 37.5385, lng: 127.0823 },
  '강서구': { lat: 37.5509, lng: 126.8495 },
  '양천구': { lat: 37.5170, lng: 126.8666 },
  '영등포구': { lat: 37.5264, lng: 126.8963 },
  '동작구': { lat: 37.5124, lng: 126.9393 },
  '관악구': { lat: 37.4783, lng: 126.9516 },
  '강북구': { lat: 37.6396, lng: 127.0257 },
  '성북구': { lat: 37.5894, lng: 127.0167 },
  '노원구': { lat: 37.6542, lng: 127.0568 },
  '도봉구': { lat: 37.6688, lng: 127.0471 },
  '은평구': { lat: 37.6176, lng: 126.9227 },
  '서대문구': { lat: 37.5791, lng: 126.9368 },
  '종로구': { lat: 37.5735, lng: 126.9790 },
  '중구': { lat: 37.5641, lng: 126.9979 },
}

// Mock Building Registry (건축물대장)
export function generateMockBuildingRegistries(buildings: Building[]): BuildingRegistry[] {
  const registries: BuildingRegistry[] = []

  buildings.forEach((building) => {
    const district = building.district || '강남구'
    const coords = seoulCoordinates[district] || seoulCoordinates['강남구']

    const latOffset = faker.number.float({ min: -0.02, max: 0.02 })
    const lngOffset = faker.number.float({ min: -0.02, max: 0.02 })

    const mainUse = building.type === 'apartment' ? '공동주택(아파트)'
      : building.type === 'officetel' ? '업무시설(오피스텔)'
      : building.type === 'villa' ? '공동주택(다세대주택)'
      : building.type === 'house' ? '단독주택'
      : building.type === 'commercial' ? '제2종근린생활시설'
      : '토지'

    const groundFloors = building.type === 'apartment'
      ? faker.number.int({ min: 15, max: 35 })
      : building.type === 'officetel'
        ? faker.number.int({ min: 20, max: 50 })
        : building.type === 'villa'
          ? faker.number.int({ min: 4, max: 6 })
          : building.type === 'house'
            ? faker.number.int({ min: 2, max: 3 })
            : faker.number.int({ min: 5, max: 15 })

    const undergroundFloors = building.type === 'apartment' || building.type === 'officetel'
      ? faker.number.int({ min: 2, max: 5 })
      : faker.number.int({ min: 0, max: 2 })

    registries.push({
      buildingName: building.name,
      address: building.address || `서울시 ${district} ${faker.location.street()} ${faker.number.int({ min: 1, max: 999 })}`,
      roadAddress: `서울시 ${district} ${faker.location.street()}로 ${faker.number.int({ min: 1, max: 200 })}`,

      mainUse,
      buildingStructure: faker.helpers.arrayElement(['철근콘크리트조', '철골철근콘크리트조', '철골조']),
      roofStructure: faker.helpers.arrayElement(['평지붕', '경사지붕']),
      groundFloors,
      undergroundFloors,

      buildingArea: faker.number.int({ min: 1000, max: 10000 }),
      totalFloorArea: faker.number.int({ min: 10000, max: 200000 }),
      landArea: faker.number.int({ min: 5000, max: 50000 }),
      floorAreaRatio: faker.number.float({ min: 200, max: 400, fractionDigits: 1 }),
      buildingCoverageRatio: faker.number.float({ min: 15, max: 30, fractionDigits: 1 }),

      approvalDate: faker.date.between({
        from: new Date('2000-01-01'),
        to: new Date('2023-12-31'),
      }),
      constructionStartDate: faker.date.between({
        from: new Date('1998-01-01'),
        to: new Date('2021-12-31'),
      }),

      totalUnits: building.totalUnits,
      totalParkingSpaces: building.totalUnits ? Math.round(building.totalUnits * faker.number.float({ min: 1.2, max: 1.8 })) : undefined,

      latitude: coords.lat + latOffset,
      longitude: coords.lng + lngOffset,

      buildingNumber: `11${faker.string.numeric(10)}`,
      managementNumber: `${faker.string.numeric(19)}`,
    })
  })

  return registries
}

// Mock Unit Registry (호별 건축물대장)
export function generateMockUnitRegistries(buildingRegistries: BuildingRegistry[]): UnitRegistry[] {
  const unitRegistries: UnitRegistry[] = []

  buildingRegistries.forEach((registry, buildingIndex) => {
    const unitCount = faker.number.int({ min: 5, max: 15 })
    const dongs = ['101동', '102동', '103동', '104동', '105동']

    for (let i = 0; i < unitCount; i++) {
      const floor = faker.number.int({ min: 1, max: registry.groundFloors })
      const ho = faker.number.int({ min: 1, max: 4 })
      const exclusiveArea = faker.helpers.arrayElement([59.94, 74.35, 84.82, 99.17, 114.52])
      const commonArea = exclusiveArea * faker.number.float({ min: 0.2, max: 0.35 })

      unitRegistries.push({
        buildingRegistryId: `registry-${buildingIndex}`,
        dong: faker.helpers.arrayElement(dongs),
        ho: `${floor}0${ho}호`,
        floor,
        exclusiveArea,
        commonArea,
        supplyArea: exclusiveArea + commonArea,
        usage: registry.mainUse.includes('주택') ? '주거' : '업무',
      })
    }
  })

  return unitRegistries
}

// ============ 임장 (Field Visit) Mock 데이터 ============

// Mock Field Visits (임장 기록)
export function generateMockFieldVisits(
  properties: Property[],
  matches: Match[],
  buyerRequirements: BuyerRequirement[],
  contacts: Contact[],
  users: User[],
  buildings: Building[],
): FieldVisit[] {
  const fieldVisits: FieldVisit[] = []
  const statuses: FieldVisitStatus[] = ['scheduled', 'completed', 'cancelled']

  const viewingMatches = matches.filter(m =>
    ['viewing', 'ownerContacted', 'negotiating', 'dealCreated'].includes(m.stage)
  )

  viewingMatches.forEach((match, index) => {
    const property = properties.find(p => p.id === match.propertyId)
    const buyerReq = buyerRequirements.find(br => br.id === match.buyerReqId)
    const contact = buyerReq ? contacts.find(c => c.id === buyerReq.contactId) : undefined

    if (!property) return

    // unitId에서 buildingId를 추출하여 건물 정보 조회
    const building = buildings.find(b => property.unitId.includes(b.id))
    const district = building?.district || '강남구'
    const coords = seoulCoordinates[district] || seoulCoordinates['강남구']
    const latOffset = faker.number.float({ min: -0.01, max: 0.01 })
    const lngOffset = faker.number.float({ min: -0.01, max: 0.01 })

    const status: FieldVisitStatus = match.viewedAt ? 'completed'
      : match.viewingDate && new Date(match.viewingDate) > new Date() ? 'scheduled'
      : faker.helpers.arrayElement(statuses)

    fieldVisits.push({
      id: `field-visit-${index + 1}`,
      propertyId: property.id,
      matchId: match.id,

      scheduledDate: match.viewingDate || faker.date.soon({ days: 14 }),
      visitedAt: status === 'completed' ? match.viewedAt || faker.date.recent({ days: 7 }) : undefined,
      status,

      visitorName: contact?.name,
      visitorPhone: contact?.phone,
      buyerReqId: buyerReq?.id,

      feedback: status === 'completed' && faker.datatype.boolean({ probability: 0.7 })
        ? faker.helpers.arrayElement([
            '내부 상태 양호, 리모델링 불필요',
            '채광 좋고 조망 만족',
            '층간소음 우려, 재방문 필요',
            '가격 대비 컨디션 좋음',
            '주차 불편, 재고려 필요',
            '학교/마트 도보 거리, 생활 편리',
          ])
        : undefined,
      rating: status === 'completed' ? faker.number.int({ min: 2, max: 5 }) : undefined,

      assignedTo: faker.helpers.arrayElement(users).id,

      latitude: coords.lat + latOffset,
      longitude: coords.lng + lngOffset,

      createdAt: faker.date.recent({ days: 30 }),
      updatedAt: faker.date.recent({ days: 7 }),
    })
  })

  // 추가 임장 기록 (매칭 없이 직접 임장)
  const additionalCount = faker.number.int({ min: 10, max: 20 })
  for (let i = 0; i < additionalCount; i++) {
    const property = faker.helpers.arrayElement(properties)
    const building = buildings.find(b => property.unitId.includes(b.id))
    const district = building?.district || '강남구'
    const coords = seoulCoordinates[district] || seoulCoordinates['강남구']

    const status = faker.helpers.weightedArrayElement([
      { value: 'scheduled' as const, weight: 3 },
      { value: 'completed' as const, weight: 5 },
      { value: 'cancelled' as const, weight: 1 },
    ])

    fieldVisits.push({
      id: `field-visit-direct-${i + 1}`,
      propertyId: property.id,

      scheduledDate: faker.date.between({
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        to: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      }),
      visitedAt: status === 'completed' ? faker.date.recent({ days: 14 }) : undefined,
      status,

      visitorName: generateKoreanName(),
      visitorPhone: `010-${faker.string.numeric(4)}-${faker.string.numeric(4)}`,

      feedback: status === 'completed' && faker.datatype.boolean({ probability: 0.5 })
        ? faker.helpers.arrayElement([
            '관심 있음, 추가 검토 예정',
            '가격 조정 요청',
            '다른 매물과 비교 중',
          ])
        : undefined,
      rating: status === 'completed' ? faker.number.int({ min: 2, max: 5 }) : undefined,

      assignedTo: faker.helpers.arrayElement(users).id,

      latitude: coords.lat + faker.number.float({ min: -0.01, max: 0.01 }),
      longitude: coords.lng + faker.number.float({ min: -0.01, max: 0.01 }),

      createdAt: faker.date.recent({ days: 60 }),
      updatedAt: faker.date.recent({ days: 7 }),
    })
  }

  return fieldVisits.sort((a, b) =>
    new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
  )
}

// Mock Property Locations (매물 위치 정보)
export function generateMockPropertyLocations(properties: Property[], buildings: Building[]): PropertyLocation[] {
  return properties.map(property => {
    const building = buildings.find(b => property.unitId.includes(b.id))
    const district = building?.district || '강남구'
    const coords = seoulCoordinates[district] || seoulCoordinates['강남구']

    return {
      propertyId: property.id,
      latitude: coords.lat + faker.number.float({ min: -0.02, max: 0.02 }),
      longitude: coords.lng + faker.number.float({ min: -0.02, max: 0.02 }),
      address: building?.address || `서울시 ${district}`,
      roadAddress: `서울시 ${district} ${faker.location.street()}로 ${faker.number.int({ min: 1, max: 200 })}`,
    }
  })
}

// ============ 계약서 템플릿 Mock 데이터 ============

// Mock Contract Templates (계약서 템플릿)
export function generateMockContractTemplates(): ContractTemplate[] {
  return [
    {
      id: 'template-1',
      name: '표준 매매 계약서',
      transactionType: 'sale',
      content: `부동산 매매계약서

매도인(이하 "갑"이라 한다)과 매수인(이하 "을"이라 한다)은 아래 표시 부동산에 관하여 다음과 같이 매매계약을 체결한다.

제1조 (목적물의 표시)
소재지: {{address}}
건물: {{buildingName}} {{dong}} {{ho}}
면적: 전용 {{area}}㎡ / 공급 {{supplyArea}}㎡

제2조 (매매대금)
매매대금: 금 {{totalPrice}}원정
계약금: 금 {{depositAmount}}원정은 계약시 지불하고 영수함
잔  금: 금 {{balanceAmount}}원정은 {{balanceDate}}에 지불한다

제3조 (소유권 이전)
갑은 잔금 수령과 동시에 을에게 소유권 이전등기에 필요한 모든 서류를 교부한다.

제4조 (특약사항)
{{specialTerms}}`,
      isDefault: true,
      createdAt: new Date('2024-01-01'),
    },
    {
      id: 'template-2',
      name: '표준 전세 계약서',
      transactionType: 'lease',
      content: `부동산 임대차계약서 (전세)

임대인(이하 "갑"이라 한다)과 임차인(이하 "을"이라 한다)은 아래 표시 부동산에 관하여 다음과 같이 임대차계약을 체결한다.

제1조 (목적물의 표시)
소재지: {{address}}
건물: {{buildingName}} {{dong}} {{ho}}

제2조 (보증금 및 차임)
보증금: 금 {{totalPrice}}원정
계약금: 금 {{depositAmount}}원정은 계약시 지불
잔  금: 금 {{balanceAmount}}원정은 {{balanceDate}}에 지불

제3조 (임대차 기간)
{{leaseStartDate}}부터 {{leaseEndDate}}까지 (24개월)

제4조 (특약사항)
{{specialTerms}}`,
      isDefault: true,
      createdAt: new Date('2024-01-01'),
    },
    {
      id: 'template-3',
      name: '표준 월세 계약서',
      transactionType: 'monthly',
      content: `부동산 임대차계약서 (월세)

임대인(이하 "갑"이라 한다)과 임차인(이하 "을"이라 한다)은 아래 표시 부동산에 관하여 다음과 같이 임대차계약을 체결한다.

제1조 (목적물의 표시)
소재지: {{address}}
건물: {{buildingName}} {{dong}} {{ho}}

제2조 (보증금 및 차임)
보증금: 금 {{totalPrice}}원정
월 차임: 금 {{monthlyRent}}원정 (매월 {{paymentDay}}일 지급)

제3조 (임대차 기간)
{{leaseStartDate}}부터 {{leaseEndDate}}까지 (12개월)

제4조 (특약사항)
{{specialTerms}}`,
      isDefault: true,
      createdAt: new Date('2024-01-01'),
    },
  ]
}

// 기본 체크리스트 항목 생성
export function generateDefaultChecklist(): ChecklistItem[] {
  return [
    { id: 'check-1', label: '등기부등본 확인', checked: false },
    { id: 'check-2', label: '건축물대장 확인', checked: false },
    { id: 'check-3', label: '신분증 확인 (매도인/매수인)', checked: false },
    { id: 'check-4', label: '계약금 입금 확인', checked: false },
    { id: 'check-5', label: '특약사항 협의 완료', checked: false },
    { id: 'check-6', label: '잔금 일정 확정', checked: false },
    { id: 'check-7', label: '중도금 일정 확인 (해당시)', checked: false },
    { id: 'check-8', label: '이사 일정 협의', checked: false },
    { id: 'check-9', label: '명도 확인 (세입자 있는 경우)', checked: false },
    { id: 'check-10', label: '열쇠/비밀번호 인수인계', checked: false },
  ]
}

// 전역 mock 데이터 저장소 (새로운 잠재고객 데이터 포함)
const users = generateMockUsers()
const contacts = generateMockContacts()
const buildings = generateMockBuildings()
const dongs = generateMockDongs(buildings)
const units = generateMockUnits(buildings, dongs)
const ownerships = generateMockOwnerships(contacts, units)
const consultations = generateMockConsultations(ownerships, users)
const buyerRequirements = generateMockBuyerRequirements(contacts, users)
const buyerConsultations = generateMockBuyerConsultations(buyerRequirements, users)
const properties = generateMockProperties(30, units)
const matches = generateMockMatches(buyerRequirements, properties, users)
const deals = generateMockDeals(15, users)
const contracts = generateMockContracts(deals, properties, contacts, matches, buyerRequirements)
const activityLogs = generateMockActivityLogs(users, properties, buyerRequirements, matches, buildings)
const office = generateMockOffice()
const naverAds = generateMockNaverAds(properties)
const naverAdMatchSuggestions = generateMockNaverAdMatchSuggestions(naverAds, properties)

const contractTemplates = generateMockContractTemplates()

// 시세/실거래가 데이터
const realTransactions = generateMockRealTransactions(buildings)
const marketPrices = generateMockMarketPrices(buildings)

// 건축물대장 데이터
const buildingRegistries = generateMockBuildingRegistries(buildings)
const unitRegistries = generateMockUnitRegistries(buildingRegistries)

// 임장/위치 데이터
const fieldVisits = generateMockFieldVisits(properties, matches, buyerRequirements, contacts, users, buildings)
const propertyLocations = generateMockPropertyLocations(properties, buildings)

// 업무(Task) 데이터
function generateMockTasks(): Task[] {
  const taskTemplates = [
    { title: '고덕그라시움 101동 매물 정보 확인', category: 'property' as TaskCategory, description: '소유주 연락처 및 가격 정보 재확인 필요' },
    { title: '김민수 고객 상담 예정', category: 'consultation' as TaskCategory, description: '강남구 아파트 매수 상담' },
    { title: '래미안블레스티지 방문 안내', category: 'viewing' as TaskCategory, description: '박지영 고객 오후 3시 방문 예정' },
    { title: '계약서 작성 - 잠실엘스', category: 'contract' as TaskCategory, description: '매매 계약서 초안 작성' },
    { title: '네이버 광고 현황 체크', category: 'advertisement' as TaskCategory, description: '이번 주 광고 성과 분석' },
    { title: '신규 매물 등록 - 반포자이', category: 'property' as TaskCategory, description: '전용 84㎡ 매매 15억' },
    { title: '구매고객 희망조건 업데이트', category: 'buyer' as TaskCategory, description: '이서연 고객 예산 조정' },
    { title: '매칭 결과 전달', category: 'match' as TaskCategory, description: '추천 매물 3건 고객에게 전달' },
    { title: '잔금일 확인', category: 'deal' as TaskCategory, description: '다음 주 잔금 예정 건 확인' },
    { title: '사무실 월간 정산', category: 'admin' as TaskCategory, description: '이번 달 수수료 정산' },
    { title: '소유주 통화 - 강남파크팰리스', category: 'call' as TaskCategory, description: '가격 협상 가능 여부 확인' },
    { title: '현장 임장 - 서초동', category: 'viewing' as TaskCategory, description: '신규 매물 3건 현장 확인' },
  ]

  const tasks: Task[] = []

  taskTemplates.forEach((template, idx) => {
    const status = faker.helpers.weightedArrayElement([
      { value: 'pending' as TaskStatus, weight: 4 },
      { value: 'in_progress' as TaskStatus, weight: 3 },
      { value: 'completed' as TaskStatus, weight: 2 },
      { value: 'cancelled' as TaskStatus, weight: 0.5 },
    ])

    const priority = faker.helpers.weightedArrayElement([
      { value: 'urgent' as TaskPriority, weight: 1 },
      { value: 'high' as TaskPriority, weight: 2 },
      { value: 'medium' as TaskPriority, weight: 4 },
      { value: 'low' as TaskPriority, weight: 2 },
    ])

    const assignedTo = faker.helpers.arrayElement(users).id
    const assignedBy = faker.helpers.arrayElement(users).id

    const dueOffset = faker.number.int({ min: -3, max: 7 })
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + dueOffset)

    const createdAt = faker.date.recent({ days: 14 })

    const task: Task = {
      id: `task-${idx + 1}`,
      title: template.title,
      description: template.description,
      category: template.category,
      priority,
      status,
      assignedTo,
      assignedBy,
      dueDate,
      dueTime: faker.helpers.arrayElement(['09:00', '10:00', '14:00', '15:00', '16:00', undefined]),
      propertyId: template.category === 'property' || template.category === 'viewing'
        ? faker.helpers.arrayElement(properties).id
        : undefined,
      buyerReqId: template.category === 'buyer' || template.category === 'match'
        ? faker.helpers.arrayElement(buyerRequirements).id
        : undefined,
      source: 'manual' as TaskSource,
      completedAt: status === 'completed' ? faker.date.recent({ days: 3 }) : undefined,
      completedBy: status === 'completed' ? assignedTo : undefined,
      createdAt,
      updatedAt: faker.date.between({ from: createdAt, to: new Date() }),
    }

    tasks.push(task)
  })

  return tasks
}

const tasks = generateMockTasks()

export const mockData = {
  // 기존 데이터 (하위 호환성)
  users,
  customers: generateMockCustomers(),
  properties,
  deals,
  events: generateMockEvents(),
  networkGroups: generateMockNetworkGroups(),
  networkPosts: generateMockNetworkPosts(),
  // 새로운 잠재고객 관리 데이터
  contacts,
  buildings,
  dongs,
  units,
  ownerships,
  consultations,
  // 구매고객 관리 데이터
  buyerRequirements,
  buyerConsultations,
  // 매칭 관리 데이터
  matches,
  // 계약서 관리 데이터
  contracts,
  contractTemplates,
  // 직원 활동 로그
  activityLogs,
  // 사무소 & 네이버 광고 (프리미엄)
  office,
  naverAds,
  naverAdMatchSuggestions,
  // 시세/실거래가 데이터
  realTransactions,
  marketPrices,
  // 건축물대장 데이터
  buildingRegistries,
  unitRegistries,
  // 임장/위치 데이터
  fieldVisits,
  propertyLocations,
  // 업무 관리 데이터
  tasks,
}

// Mock API 지연 시뮬레이션
export const delay = (ms: number = 300) =>
  new Promise((resolve) => setTimeout(resolve, ms))
