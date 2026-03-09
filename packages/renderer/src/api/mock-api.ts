import { mockData, delay, generateDefaultChecklist } from '@/data/mock-data'
import type {
  Customer,
  Property,
  Deal,
  CalendarEvent,
  User,
  NetworkGroup,
  NetworkPost,
  Contact,
  Building,
  Dong,
  Unit,
  Ownership,
  Consultation,
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
  CommissionBreakdown,
  TransactionType,
  ChecklistItem,
  RealTransaction,
  MarketPrice,
  BuildingRegistry,
  UnitRegistry,
  FieldVisit,
  PropertyLocation,
  PricePerPyeongResult,
  YieldResult,
  LoanResult,
  PropertyType,
  TaxResult,
  RegisteredComplex,
  AISearchUsage,
  AISearchResult,
  AISearchQuota,
  Task,
  TaskStatus,
} from '@/types'

// Users API
export const usersApi = {
  getAll: async (): Promise<User[]> => {
    await delay()
    return mockData.users
  },
  getById: async (id: string): Promise<User | undefined> => {
    await delay()
    return mockData.users.find((user) => user.id === id)
  },
  getCurrent: async (): Promise<User> => {
    await delay()
    // 현재 사용자는 첫 번째 사용자 (manager)로 가정
    return mockData.users[0]
  },
}

// Customers API
export const customersApi = {
  getAll: async (): Promise<Customer[]> => {
    await delay()
    return mockData.customers
  },
  getById: async (id: string): Promise<Customer | undefined> => {
    await delay()
    return mockData.customers.find((customer) => customer.id === id)
  },
  create: async (customer: Omit<Customer, 'id' | 'createdAt' | 'updatedAt'>): Promise<Customer> => {
    await delay()
    const newCustomer: Customer = {
      ...customer,
      id: `customer-${mockData.customers.length + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockData.customers.push(newCustomer)
    return newCustomer
  },
  update: async (id: string, updates: Partial<Customer>): Promise<Customer> => {
    await delay()
    const index = mockData.customers.findIndex((c) => c.id === id)
    if (index === -1) throw new Error('Customer not found')
    mockData.customers[index] = {
      ...mockData.customers[index],
      ...updates,
      updatedAt: new Date(),
    }
    return mockData.customers[index]
  },
  delete: async (id: string): Promise<void> => {
    await delay()
    const index = mockData.customers.findIndex((c) => c.id === id)
    if (index === -1) throw new Error('Customer not found')
    mockData.customers.splice(index, 1)
  },
}

// Properties API
export const propertiesApi = {
  getAll: async (): Promise<Property[]> => {
    await delay()
    return mockData.properties
  },
  getById: async (id: string): Promise<Property | undefined> => {
    await delay()
    return mockData.properties.find((property) => property.id === id)
  },
  create: async (property: Omit<Property, 'id' | 'createdAt' | 'updatedAt'>): Promise<Property> => {
    await delay()
    const newProperty: Property = {
      ...property,
      id: `property-${mockData.properties.length + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockData.properties.push(newProperty)
    return newProperty
  },
  update: async (id: string, updates: Partial<Property>): Promise<Property> => {
    await delay()
    const index = mockData.properties.findIndex((p) => p.id === id)
    if (index === -1) throw new Error('Property not found')
    mockData.properties[index] = {
      ...mockData.properties[index],
      ...updates,
      updatedAt: new Date(),
    }
    return mockData.properties[index]
  },
  delete: async (id: string): Promise<void> => {
    await delay()
    const index = mockData.properties.findIndex((p) => p.id === id)
    if (index === -1) throw new Error('Property not found')
    mockData.properties.splice(index, 1)
  },
}

// Deals API
export const dealsApi = {
  getAll: async (): Promise<Deal[]> => {
    await delay()
    return mockData.deals
  },
  getById: async (id: string): Promise<Deal | undefined> => {
    await delay()
    return mockData.deals.find((deal) => deal.id === id)
  },
  create: async (deal: Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>): Promise<Deal> => {
    await delay()
    const newDeal: Deal = {
      ...deal,
      id: `deal-${mockData.deals.length + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockData.deals.push(newDeal)
    return newDeal
  },
  update: async (id: string, updates: Partial<Deal>): Promise<Deal> => {
    await delay()
    const index = mockData.deals.findIndex((d) => d.id === id)
    if (index === -1) throw new Error('Deal not found')
    mockData.deals[index] = {
      ...mockData.deals[index],
      ...updates,
      updatedAt: new Date(),
    }
    return mockData.deals[index]
  },
  delete: async (id: string): Promise<void> => {
    await delay()
    const index = mockData.deals.findIndex((d) => d.id === id)
    if (index === -1) throw new Error('Deal not found')
    mockData.deals.splice(index, 1)
  },
}

// Calendar Events API
export const eventsApi = {
  getAll: async (): Promise<CalendarEvent[]> => {
    await delay()
    return mockData.events
  },
  getById: async (id: string): Promise<CalendarEvent | undefined> => {
    await delay()
    return mockData.events.find((event) => event.id === id)
  },
  getByDateRange: async (start: Date, end: Date): Promise<CalendarEvent[]> => {
    await delay()
    return mockData.events.filter(
      (event) => event.start >= start && event.start <= end,
    )
  },
  create: async (
    event: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<CalendarEvent> => {
    await delay()
    const newEvent: CalendarEvent = {
      ...event,
      id: `event-${mockData.events.length + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockData.events.push(newEvent)
    return newEvent
  },
  update: async (id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent> => {
    await delay()
    const index = mockData.events.findIndex((e) => e.id === id)
    if (index === -1) throw new Error('Event not found')
    mockData.events[index] = {
      ...mockData.events[index],
      ...updates,
      updatedAt: new Date(),
    }
    return mockData.events[index]
  },
  delete: async (id: string): Promise<void> => {
    await delay()
    const index = mockData.events.findIndex((e) => e.id === id)
    if (index === -1) throw new Error('Event not found')
    mockData.events.splice(index, 1)
  },
}

// Network Groups API
export const networkGroupsApi = {
  getAll: async (): Promise<NetworkGroup[]> => {
    await delay()
    return mockData.networkGroups
  },
  getById: async (id: string): Promise<NetworkGroup | undefined> => {
    await delay()
    return mockData.networkGroups.find((group) => group.id === id)
  },
  create: async (group: Omit<NetworkGroup, 'id' | 'createdAt'>): Promise<NetworkGroup> => {
    await delay()
    const newGroup: NetworkGroup = {
      ...group,
      id: `group-${mockData.networkGroups.length + 1}`,
      createdAt: new Date(),
    }
    mockData.networkGroups.push(newGroup)
    return newGroup
  },
  joinGroup: async (groupId: string, officeId: string): Promise<NetworkGroup> => {
    await delay()
    const group = mockData.networkGroups.find((g) => g.id === groupId)
    if (!group) throw new Error('Group not found')
    if (!group.memberIds.includes(officeId)) {
      group.memberIds.push(officeId)
    }
    return group
  },
  leaveGroup: async (groupId: string, officeId: string): Promise<void> => {
    await delay()
    const group = mockData.networkGroups.find((g) => g.id === groupId)
    if (!group) throw new Error('Group not found')
    group.memberIds = group.memberIds.filter((id) => id !== officeId)
  },
}

// Network Posts API
export const networkPostsApi = {
  getAll: async (): Promise<NetworkPost[]> => {
    await delay()
    return mockData.networkPosts
  },
  getByGroupId: async (groupId: string): Promise<NetworkPost[]> => {
    await delay()
    return mockData.networkPosts.filter((post) => post.groupId === groupId)
  },
  getById: async (id: string): Promise<NetworkPost | undefined> => {
    await delay()
    return mockData.networkPosts.find((post) => post.id === id)
  },
  create: async (
    post: Omit<NetworkPost, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<NetworkPost> => {
    await delay()
    const newPost: NetworkPost = {
      ...post,
      id: `post-${mockData.networkPosts.length + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockData.networkPosts.push(newPost)
    return newPost
  },
  delete: async (id: string): Promise<void> => {
    await delay()
    const index = mockData.networkPosts.findIndex((p) => p.id === id)
    if (index === -1) throw new Error('Post not found')
    mockData.networkPosts.splice(index, 1)
  },
  // 매칭 알림 시뮬레이션
  findMatches: async (postId: string): Promise<NetworkPost[]> => {
    await delay()
    const post = mockData.networkPosts.find((p) => p.id === postId)
    if (!post) return []

    // 간단한 매칭 로직: 같은 그룹에서 반대 타입의 게시글 찾기
    if (post.type === 'property') {
      // 매물이면 요구사항 게시글 중 조건 맞는 것 찾기
      return mockData.networkPosts.filter(
        (p) =>
          p.groupId === post.groupId &&
          p.type === 'requirement' &&
          p.id !== postId,
      )
    } else {
      // 요구사항이면 매물 게시글 중 조건 맞는 것 찾기
      return mockData.networkPosts.filter(
        (p) =>
          p.groupId === post.groupId &&
          p.type === 'property' &&
          p.id !== postId,
      )
    }
  },
}

// ============ 잠재고객 관리 API ============

// Contacts API (통합 연락처)
export const contactsApi = {
  getAll: async (): Promise<Contact[]> => {
    await delay()
    return mockData.contacts
  },
  getById: async (id: string): Promise<Contact | undefined> => {
    await delay()
    return mockData.contacts.find((contact) => contact.id === id)
  },
  search: async (query: string): Promise<Contact[]> => {
    await delay()
    const q = query.toLowerCase()
    return mockData.contacts.filter(
      (contact) =>
        contact.name.toLowerCase().includes(q) ||
        contact.phone.includes(q) ||
        contact.phone2?.includes(q) ||
        contact.email?.toLowerCase().includes(q),
    )
  },
  create: async (contact: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contact> => {
    await delay()
    const newContact: Contact = {
      ...contact,
      id: `contact-${mockData.contacts.length + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockData.contacts.push(newContact)
    return newContact
  },
  update: async (id: string, updates: Partial<Contact>): Promise<Contact> => {
    await delay()
    const index = mockData.contacts.findIndex((c) => c.id === id)
    if (index === -1) throw new Error('Contact not found')
    mockData.contacts[index] = {
      ...mockData.contacts[index],
      ...updates,
      updatedAt: new Date(),
    }
    return mockData.contacts[index]
  },
  delete: async (id: string): Promise<void> => {
    await delay()
    const index = mockData.contacts.findIndex((c) => c.id === id)
    if (index === -1) throw new Error('Contact not found')
    mockData.contacts.splice(index, 1)
  },
}

// Buildings API
export const buildingsApi = {
  getAll: async (): Promise<Building[]> => {
    await delay()
    return mockData.buildings
  },
  getById: async (id: string): Promise<Building | undefined> => {
    await delay()
    return mockData.buildings.find((building) => building.id === id)
  },
  search: async (query: string): Promise<Building[]> => {
    await delay()
    const q = query.toLowerCase()
    return mockData.buildings.filter(
      (building) =>
        building.name.toLowerCase().includes(q) ||
        (building.address?.toLowerCase().includes(q) ?? false),
    )
  },
  create: async (building: Omit<Building, 'id' | 'createdAt' | 'updatedAt'>): Promise<Building> => {
    await delay()
    const newBuilding: Building = {
      ...building,
      id: `building-${mockData.buildings.length + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockData.buildings.push(newBuilding)
    return newBuilding
  },
  update: async (id: string, updates: Partial<Building>): Promise<Building> => {
    await delay()
    const index = mockData.buildings.findIndex((b) => b.id === id)
    if (index === -1) throw new Error('Building not found')
    mockData.buildings[index] = {
      ...mockData.buildings[index],
      ...updates,
      updatedAt: new Date(),
    }
    return mockData.buildings[index]
  },
  delete: async (id: string): Promise<void> => {
    await delay()
    const index = mockData.buildings.findIndex((b) => b.id === id)
    if (index === -1) throw new Error('Building not found')
    mockData.buildings.splice(index, 1)
  },
}

// Dongs API
export const dongsApi = {
  getAll: async (): Promise<Dong[]> => {
    await delay()
    return mockData.dongs
  },
  getByBuildingId: async (buildingId: string): Promise<Dong[]> => {
    await delay()
    return mockData.dongs.filter((dong) => dong.buildingId === buildingId)
  },
  getById: async (id: string): Promise<Dong | undefined> => {
    await delay()
    return mockData.dongs.find((dong) => dong.id === id)
  },
  create: async (dong: Omit<Dong, 'id' | 'createdAt'>): Promise<Dong> => {
    await delay()
    const newDong: Dong = {
      ...dong,
      id: `dong-${dong.buildingId}-${Date.now()}`,
      createdAt: new Date(),
    }
    mockData.dongs.push(newDong)
    return newDong
  },
  delete: async (id: string): Promise<void> => {
    await delay()
    const index = mockData.dongs.findIndex((d) => d.id === id)
    if (index === -1) throw new Error('Dong not found')
    mockData.dongs.splice(index, 1)
  },
}

// Units API
export const unitsApi = {
  getAll: async (): Promise<Unit[]> => {
    await delay()
    return mockData.units
  },
  getByDongId: async (dongId: string): Promise<Unit[]> => {
    await delay()
    return mockData.units.filter((unit) => unit.dongId === dongId)
  },
  getByBuildingId: async (buildingId: string): Promise<Unit[]> => {
    await delay()
    return mockData.units.filter((unit) => unit.buildingId === buildingId)
  },
  getById: async (id: string): Promise<Unit | undefined> => {
    await delay()
    return mockData.units.find((unit) => unit.id === id)
  },
  create: async (unit: Omit<Unit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Unit> => {
    await delay()
    const newUnit: Unit = {
      ...unit,
      id: `unit-${unit.dongId || unit.buildingId}-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockData.units.push(newUnit)
    return newUnit
  },
  update: async (id: string, updates: Partial<Unit>): Promise<Unit> => {
    await delay()
    const index = mockData.units.findIndex((u) => u.id === id)
    if (index === -1) throw new Error('Unit not found')
    mockData.units[index] = {
      ...mockData.units[index],
      ...updates,
      updatedAt: new Date(),
    }
    return mockData.units[index]
  },
  delete: async (id: string): Promise<void> => {
    await delay()
    const index = mockData.units.findIndex((u) => u.id === id)
    if (index === -1) throw new Error('Unit not found')
    mockData.units.splice(index, 1)
  },
}

// Ownerships API
export const ownershipsApi = {
  getAll: async (): Promise<Ownership[]> => {
    await delay()
    return mockData.ownerships
  },
  getByUnitId: async (unitId: string): Promise<Ownership[]> => {
    await delay()
    return mockData.ownerships.filter((o) => o.unitId === unitId && o.status === 'active')
  },
  getByContactId: async (contactId: string): Promise<Ownership[]> => {
    await delay()
    return mockData.ownerships.filter((o) => o.contactId === contactId)
  },
  getById: async (id: string): Promise<Ownership | undefined> => {
    await delay()
    return mockData.ownerships.find((o) => o.id === id)
  },
  create: async (ownership: Omit<Ownership, 'id' | 'createdAt' | 'updatedAt'>): Promise<Ownership> => {
    await delay()
    const newOwnership: Ownership = {
      ...ownership,
      id: `ownership-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockData.ownerships.push(newOwnership)
    return newOwnership
  },
  update: async (id: string, updates: Partial<Ownership>): Promise<Ownership> => {
    await delay()
    const index = mockData.ownerships.findIndex((o) => o.id === id)
    if (index === -1) throw new Error('Ownership not found')
    mockData.ownerships[index] = {
      ...mockData.ownerships[index],
      ...updates,
      updatedAt: new Date(),
    }
    return mockData.ownerships[index]
  },
  // 소유권 이전 (매도)
  transferOwnership: async (id: string): Promise<Ownership> => {
    await delay()
    const index = mockData.ownerships.findIndex((o) => o.id === id)
    if (index === -1) throw new Error('Ownership not found')
    mockData.ownerships[index] = {
      ...mockData.ownerships[index],
      status: 'sold',
      endDate: new Date(),
      updatedAt: new Date(),
    }
    return mockData.ownerships[index]
  },
}

// Consultations API
export const consultationsApi = {
  getAll: async (): Promise<Consultation[]> => {
    await delay()
    return mockData.consultations
  },
  getByOwnershipId: async (ownershipId: string): Promise<Consultation[]> => {
    await delay()
    return mockData.consultations
      .filter((c) => c.ownershipId === ownershipId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  },
  getById: async (id: string): Promise<Consultation | undefined> => {
    await delay()
    return mockData.consultations.find((c) => c.id === id)
  },
  // 다음 연락 예정 목록
  getUpcoming: async (): Promise<Consultation[]> => {
    await delay()
    const now = new Date()
    return mockData.consultations
      .filter((c) => c.nextContactDate && new Date(c.nextContactDate) >= now)
      .sort((a, b) => new Date(a.nextContactDate!).getTime() - new Date(b.nextContactDate!).getTime())
  },
  create: async (consultation: Omit<Consultation, 'id' | 'createdAt'>): Promise<Consultation> => {
    await delay()
    const newConsultation: Consultation = {
      ...consultation,
      id: `consultation-${Date.now()}`,
      createdAt: new Date(),
    }
    mockData.consultations.push(newConsultation)
    return newConsultation
  },
  update: async (id: string, updates: Partial<Consultation>): Promise<Consultation> => {
    await delay()
    const index = mockData.consultations.findIndex((c) => c.id === id)
    if (index === -1) throw new Error('Consultation not found')
    mockData.consultations[index] = {
      ...mockData.consultations[index],
      ...updates,
    }
    return mockData.consultations[index]
  },
  delete: async (id: string): Promise<void> => {
    await delay()
    const index = mockData.consultations.findIndex((c) => c.id === id)
    if (index === -1) throw new Error('Consultation not found')
    mockData.consultations.splice(index, 1)
  },
}

// 통합 검색 API
export const searchApi = {
  // 건물명, 주소, 소유자명, 전화번호로 통합 검색
  // 결과는 호 단위 flat 리스트로 반환
  search: async (query: string): Promise<{
    unit: Unit
    building: Building
    dong: Dong | null
    owners: { contact: Contact; ownership: Ownership }[]
  }[]> => {
    await delay()
    const q = query.toLowerCase().trim()
    if (!q) return []

    const results: {
      unit: Unit
      building: Building
      dong: Dong | null
      owners: { contact: Contact; ownership: Ownership }[]
    }[] = []

    // 건물명/주소로 검색
    const matchedBuildings = mockData.buildings.filter(
      (b) => b.name.toLowerCase().includes(q) || (b.address?.toLowerCase().includes(q) ?? false),
    )

    // 소유자명/전화번호로 검색
    const matchedContacts = mockData.contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.phone2?.includes(q),
    )

    // 매칭된 소유관계 찾기
    const matchedOwnershipsByContact = mockData.ownerships.filter(
      (o) => o.status === 'active' && matchedContacts.some((c) => c.id === o.contactId),
    )

    // 건물로 검색된 경우: 해당 건물의 모든 호수 추가
    matchedBuildings.forEach((building) => {
      const buildingUnits = mockData.units.filter((u) => u.buildingId === building.id)
      buildingUnits.forEach((unit) => {
        const dong = unit.dongId ? mockData.dongs.find((d) => d.id === unit.dongId) || null : null
        const unitOwnerships = mockData.ownerships.filter(
          (o) => o.unitId === unit.id && o.status === 'active',
        )
        const owners = unitOwnerships.map((ownership) => ({
          contact: mockData.contacts.find((c) => c.id === ownership.contactId)!,
          ownership,
        })).filter((o) => o.contact)

        results.push({ unit, building, dong, owners })
      })
    })

    // 소유자로 검색된 경우: 해당 소유자의 호수 추가 (중복 제거)
    matchedOwnershipsByContact.forEach((ownership) => {
      const unit = mockData.units.find((u) => u.id === ownership.unitId)
      if (!unit) return

      // 이미 추가된 호수인지 확인
      if (results.some((r) => r.unit.id === unit.id)) return

      const building = mockData.buildings.find((b) => b.id === unit.buildingId)
      if (!building) return

      const dong = unit.dongId ? mockData.dongs.find((d) => d.id === unit.dongId) || null : null
      const unitOwnerships = mockData.ownerships.filter(
        (o) => o.unitId === unit.id && o.status === 'active',
      )
      const owners = unitOwnerships.map((o) => ({
        contact: mockData.contacts.find((c) => c.id === o.contactId)!,
        ownership: o,
      })).filter((o) => o.contact)

      results.push({ unit, building, dong, owners })
    })

    return results
  },
}

// ============ 구매고객 관리 API ============

// BuyerRequirements API
export const buyerRequirementsApi = {
  getAll: async (): Promise<BuyerRequirement[]> => {
    await delay()
    return mockData.buyerRequirements
  },
  getById: async (id: string): Promise<BuyerRequirement | undefined> => {
    await delay()
    return mockData.buyerRequirements.find((r) => r.id === id)
  },
  getByContactId: async (contactId: string): Promise<BuyerRequirement[]> => {
    await delay()
    return mockData.buyerRequirements.filter((r) => r.contactId === contactId)
  },
  getActive: async (): Promise<BuyerRequirement[]> => {
    await delay()
    return mockData.buyerRequirements.filter((r) => r.status === 'active')
  },
  getUrgent: async (): Promise<BuyerRequirement[]> => {
    await delay()
    return mockData.buyerRequirements.filter(
      (r) => r.status === 'active' && r.urgency === 'urgent',
    )
  },
  create: async (
    requirement: Omit<BuyerRequirement, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<BuyerRequirement> => {
    await delay()
    const newRequirement: BuyerRequirement = {
      ...requirement,
      id: `buyer-req-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockData.buyerRequirements.push(newRequirement)
    return newRequirement
  },
  update: async (
    id: string,
    updates: Partial<BuyerRequirement>,
  ): Promise<BuyerRequirement> => {
    await delay()
    const index = mockData.buyerRequirements.findIndex((r) => r.id === id)
    if (index === -1) throw new Error('BuyerRequirement not found')
    mockData.buyerRequirements[index] = {
      ...mockData.buyerRequirements[index],
      ...updates,
      updatedAt: new Date(),
    }
    return mockData.buyerRequirements[index]
  },
  delete: async (id: string): Promise<void> => {
    await delay()
    const index = mockData.buyerRequirements.findIndex((r) => r.id === id)
    if (index === -1) throw new Error('BuyerRequirement not found')
    mockData.buyerRequirements.splice(index, 1)
  },
  // 매칭 매물 찾기 (조건에 맞는 매물 검색)
  findMatchingProperties: async (id: string): Promise<Property[]> => {
    await delay()
    const requirement = mockData.buyerRequirements.find((r) => r.id === id)
    if (!requirement) return []

    return mockData.properties.filter((p) => {
      // 상태가 활성인 매물만
      if (p.status !== 'available') return false

      // 거래 유형 일치
      if (p.transactionType !== requirement.transactionType) return false

      // 매물 유형 일치
      if (!requirement.propertyTypes.includes(p.type)) return false

      // 예산 범위 확인
      if (requirement.budgetMin && p.price < requirement.budgetMin) return false
      if (requirement.budgetMax && p.price > requirement.budgetMax) return false

      // 면적 범위 확인
      if (requirement.areaMin && p.area && p.area < requirement.areaMin) return false
      if (requirement.areaMax && p.area && p.area > requirement.areaMax) return false

      // 월세 최대 확인
      if (
        requirement.monthlyRentMax &&
        p.monthlyRent &&
        p.monthlyRent > requirement.monthlyRentMax
      ) {
        return false
      }

      return true
    })
  },
}

// BuyerConsultations API
export const buyerConsultationsApi = {
  getAll: async (): Promise<BuyerConsultation[]> => {
    await delay()
    return mockData.buyerConsultations
  },
  getByRequirementId: async (requirementId: string): Promise<BuyerConsultation[]> => {
    await delay()
    return mockData.buyerConsultations
      .filter((c) => c.requirementId === requirementId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  },
  getById: async (id: string): Promise<BuyerConsultation | undefined> => {
    await delay()
    return mockData.buyerConsultations.find((c) => c.id === id)
  },
  create: async (
    consultation: Omit<BuyerConsultation, 'id' | 'createdAt'>,
  ): Promise<BuyerConsultation> => {
    await delay()
    const newConsultation: BuyerConsultation = {
      ...consultation,
      id: `buyer-consult-${Date.now()}`,
      createdAt: new Date(),
    }
    mockData.buyerConsultations.push(newConsultation)

    // 관련 requirement의 lastContactDate 업데이트
    const reqIndex = mockData.buyerRequirements.findIndex(
      (r) => r.id === consultation.requirementId,
    )
    if (reqIndex !== -1) {
      mockData.buyerRequirements[reqIndex].lastContactDate = consultation.date
      if (consultation.nextContactDate) {
        mockData.buyerRequirements[reqIndex].nextContactDate = consultation.nextContactDate
      }
      mockData.buyerRequirements[reqIndex].updatedAt = new Date()
    }

    return newConsultation
  },
  update: async (
    id: string,
    updates: Partial<BuyerConsultation>,
  ): Promise<BuyerConsultation> => {
    await delay()
    const index = mockData.buyerConsultations.findIndex((c) => c.id === id)
    if (index === -1) throw new Error('BuyerConsultation not found')
    mockData.buyerConsultations[index] = {
      ...mockData.buyerConsultations[index],
      ...updates,
    }
    return mockData.buyerConsultations[index]
  },
  delete: async (id: string): Promise<void> => {
    await delay()
    const index = mockData.buyerConsultations.findIndex((c) => c.id === id)
    if (index === -1) throw new Error('BuyerConsultation not found')
    mockData.buyerConsultations.splice(index, 1)
  },
}

// ============ 매칭 관리 API ============

// Matches API
export const matchesApi = {
  getAll: async (): Promise<Match[]> => {
    await delay()
    return mockData.matches
  },
  getById: async (id: string): Promise<Match | undefined> => {
    await delay()
    return mockData.matches.find((m) => m.id === id)
  },
  getByBuyerReqId: async (buyerReqId: string): Promise<Match[]> => {
    await delay()
    return mockData.matches.filter((m) => m.buyerReqId === buyerReqId)
  },
  getByPropertyId: async (propertyId: string): Promise<Match[]> => {
    await delay()
    return mockData.matches.filter((m) => m.propertyId === propertyId)
  },
  getByStage: async (stage: MatchStage): Promise<Match[]> => {
    await delay()
    return mockData.matches.filter((m) => m.stage === stage)
  },
  getActive: async (): Promise<Match[]> => {
    await delay()
    return mockData.matches.filter(
      (m) => m.stage !== 'closed' && m.stage !== 'dealCreated',
    )
  },
  getWithViewingScheduled: async (): Promise<Match[]> => {
    await delay()
    return mockData.matches.filter(
      (m) => m.stage === 'viewing' && m.viewingDate,
    )
  },
  create: async (match: Omit<Match, 'id' | 'createdAt' | 'updatedAt'>): Promise<Match> => {
    await delay()
    const newMatch: Match = {
      ...match,
      id: `match-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockData.matches.push(newMatch)
    return newMatch
  },
  update: async (id: string, updates: Partial<Match>): Promise<Match> => {
    await delay()
    const index = mockData.matches.findIndex((m) => m.id === id)
    if (index === -1) throw new Error('Match not found')
    mockData.matches[index] = {
      ...mockData.matches[index],
      ...updates,
      updatedAt: new Date(),
    }
    return mockData.matches[index]
  },
  // 단계 변경
  updateStage: async (id: string, stage: MatchStage): Promise<Match> => {
    await delay()
    const index = mockData.matches.findIndex((m) => m.id === id)
    if (index === -1) throw new Error('Match not found')
    mockData.matches[index] = {
      ...mockData.matches[index],
      stage,
      updatedAt: new Date(),
    }
    return mockData.matches[index]
  },
  // 방문 예약
  scheduleViewing: async (id: string, viewingDate: Date): Promise<Match> => {
    await delay()
    const index = mockData.matches.findIndex((m) => m.id === id)
    if (index === -1) throw new Error('Match not found')
    mockData.matches[index] = {
      ...mockData.matches[index],
      stage: 'viewing',
      viewingDate,
      updatedAt: new Date(),
    }
    return mockData.matches[index]
  },
  // 방문 완료 기록
  recordViewing: async (
    id: string,
    feedback: 'interested' | 'notInterested' | 'pending',
    note?: string,
  ): Promise<Match> => {
    await delay()
    const index = mockData.matches.findIndex((m) => m.id === id)
    if (index === -1) throw new Error('Match not found')
    mockData.matches[index] = {
      ...mockData.matches[index],
      stage: 'ownerContacted',
      viewedAt: new Date(),
      viewingFeedback: feedback,
      viewingNote: note,
      updatedAt: new Date(),
    }
    return mockData.matches[index]
  },
  // 거래로 전환
  convertToDeal: async (id: string, dealId: string): Promise<Match> => {
    await delay()
    const index = mockData.matches.findIndex((m) => m.id === id)
    if (index === -1) throw new Error('Match not found')
    mockData.matches[index] = {
      ...mockData.matches[index],
      stage: 'dealCreated',
      dealId,
      updatedAt: new Date(),
    }
    return mockData.matches[index]
  },
  // 매칭 종료
  close: async (id: string, reason: string): Promise<Match> => {
    await delay()
    const index = mockData.matches.findIndex((m) => m.id === id)
    if (index === -1) throw new Error('Match not found')
    mockData.matches[index] = {
      ...mockData.matches[index],
      stage: 'closed',
      closedAt: new Date(),
      closedReason: reason,
      updatedAt: new Date(),
    }
    return mockData.matches[index]
  },
  delete: async (id: string): Promise<void> => {
    await delay()
    const index = mockData.matches.findIndex((m) => m.id === id)
    if (index === -1) throw new Error('Match not found')
    mockData.matches.splice(index, 1)
  },
}

// ============ 계약서 관리 API ============

// Contracts API
export const contractsApi = {
  getAll: async (): Promise<Contract[]> => {
    await delay()
    return mockData.contracts
  },
  getById: async (id: string): Promise<Contract | undefined> => {
    await delay()
    return mockData.contracts.find((c) => c.id === id)
  },
  getByDealId: async (dealId: string): Promise<Contract | undefined> => {
    await delay()
    return mockData.contracts.find((c) => c.dealId === dealId)
  },
  getByPropertyId: async (propertyId: string): Promise<Contract[]> => {
    await delay()
    return mockData.contracts.filter((c) => c.propertyId === propertyId)
  },
  getByStatus: async (status: ContractStatus): Promise<Contract[]> => {
    await delay()
    return mockData.contracts.filter((c) => c.status === status)
  },
  getActive: async (): Promise<Contract[]> => {
    await delay()
    return mockData.contracts.filter((c) => c.status !== 'cancelled')
  },
  // 잔금일 임박 계약 조회
  getUpcomingBalance: async (days: number = 30): Promise<Contract[]> => {
    await delay()
    const now = new Date()
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000)
    return mockData.contracts.filter(
      (c) =>
        c.balanceDate &&
        !c.balancePaidAt &&
        new Date(c.balanceDate) >= now &&
        new Date(c.balanceDate) <= futureDate,
    )
  },
  create: async (contract: Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>): Promise<Contract> => {
    await delay()
    const newContract: Contract = {
      ...contract,
      id: `contract-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockData.contracts.push(newContract)
    return newContract
  },
  update: async (id: string, updates: Partial<Contract>): Promise<Contract> => {
    await delay()
    const index = mockData.contracts.findIndex((c) => c.id === id)
    if (index === -1) throw new Error('Contract not found')
    mockData.contracts[index] = {
      ...mockData.contracts[index],
      ...updates,
      updatedAt: new Date(),
    }
    return mockData.contracts[index]
  },
  // 상태 변경
  updateStatus: async (id: string, status: ContractStatus): Promise<Contract> => {
    await delay()
    const index = mockData.contracts.findIndex((c) => c.id === id)
    if (index === -1) throw new Error('Contract not found')
    mockData.contracts[index] = {
      ...mockData.contracts[index],
      status,
      updatedAt: new Date(),
    }
    return mockData.contracts[index]
  },
  // 계약금 입금 확인
  confirmDeposit: async (id: string): Promise<Contract> => {
    await delay()
    const index = mockData.contracts.findIndex((c) => c.id === id)
    if (index === -1) throw new Error('Contract not found')
    mockData.contracts[index] = {
      ...mockData.contracts[index],
      depositPaidAt: new Date(),
      status: 'depositPaid',
      updatedAt: new Date(),
    }
    return mockData.contracts[index]
  },
  // 중도금 입금 확인
  confirmMiddlePayment: async (id: string): Promise<Contract> => {
    await delay()
    const index = mockData.contracts.findIndex((c) => c.id === id)
    if (index === -1) throw new Error('Contract not found')
    mockData.contracts[index] = {
      ...mockData.contracts[index],
      middlePaymentPaidAt: new Date(),
      updatedAt: new Date(),
    }
    return mockData.contracts[index]
  },
  // 잔금 입금 확인
  confirmBalance: async (id: string): Promise<Contract> => {
    await delay()
    const index = mockData.contracts.findIndex((c) => c.id === id)
    if (index === -1) throw new Error('Contract not found')
    mockData.contracts[index] = {
      ...mockData.contracts[index],
      balancePaidAt: new Date(),
      status: 'balancePaid',
      updatedAt: new Date(),
    }
    return mockData.contracts[index]
  },
  // 등기/전입 완료
  markRegistered: async (id: string): Promise<Contract> => {
    await delay()
    const index = mockData.contracts.findIndex((c) => c.id === id)
    if (index === -1) throw new Error('Contract not found')
    mockData.contracts[index] = {
      ...mockData.contracts[index],
      status: 'registered',
      updatedAt: new Date(),
    }
    return mockData.contracts[index]
  },
  // 계약 취소
  cancel: async (id: string): Promise<Contract> => {
    await delay()
    const index = mockData.contracts.findIndex((c) => c.id === id)
    if (index === -1) throw new Error('Contract not found')
    mockData.contracts[index] = {
      ...mockData.contracts[index],
      status: 'cancelled',
      updatedAt: new Date(),
    }
    return mockData.contracts[index]
  },
  delete: async (id: string): Promise<void> => {
    await delay()
    const index = mockData.contracts.findIndex((c) => c.id === id)
    if (index === -1) throw new Error('Contract not found')
    mockData.contracts.splice(index, 1)
  },
}

// ============ 직원 활동 로그 API ============

// Activity Logs API (관리자 전용)
export const activityLogsApi = {
  getAll: async (): Promise<ActivityLog[]> => {
    await delay()
    return mockData.activityLogs
  },
  getByUserId: async (userId: string): Promise<ActivityLog[]> => {
    await delay()
    return mockData.activityLogs.filter((log) => log.userId === userId)
  },
  getByType: async (type: ActivityType): Promise<ActivityLog[]> => {
    await delay()
    return mockData.activityLogs.filter((log) => log.type === type)
  },
  getByDateRange: async (startDate: Date, endDate: Date): Promise<ActivityLog[]> => {
    await delay()
    return mockData.activityLogs.filter(
      (log) =>
        new Date(log.createdAt) >= startDate && new Date(log.createdAt) <= endDate,
    )
  },
  // 최근 활동 조회 (페이지네이션)
  getRecent: async (limit: number = 50, offset: number = 0): Promise<{
    logs: ActivityLog[]
    total: number
  }> => {
    await delay()
    const sorted = [...mockData.activityLogs].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    return {
      logs: sorted.slice(offset, offset + limit),
      total: mockData.activityLogs.length,
    }
  },
  // 직원별 활동 통계
  getStatsByUser: async (): Promise<{
    userId: string
    userName: string
    totalActivities: number
    activityBreakdown: { type: ActivityType; count: number }[]
  }[]> => {
    await delay()
    const userStats = new Map<string, {
      total: number
      breakdown: Map<ActivityType, number>
    }>()

    mockData.activityLogs.forEach((log) => {
      if (!userStats.has(log.userId)) {
        userStats.set(log.userId, { total: 0, breakdown: new Map() })
      }
      const stats = userStats.get(log.userId)!
      stats.total++
      stats.breakdown.set(log.type, (stats.breakdown.get(log.type) || 0) + 1)
    })

    return Array.from(userStats.entries()).map(([userId, stats]) => {
      const user = mockData.users.find((u) => u.id === userId)
      return {
        userId,
        userName: user?.name || '알 수 없음',
        totalActivities: stats.total,
        activityBreakdown: Array.from(stats.breakdown.entries()).map(([type, count]) => ({
          type,
          count,
        })),
      }
    })
  },
  // 활동 로그 추가 (내부용)
  create: async (log: Omit<ActivityLog, 'id' | 'createdAt'>): Promise<ActivityLog> => {
    await delay()
    const newLog: ActivityLog = {
      ...log,
      id: `activity-${Date.now()}`,
      createdAt: new Date(),
    }
    mockData.activityLogs.unshift(newLog) // 최신순으로 앞에 추가
    return newLog
  },
}

// ============ 사무소 API ============

// Office API (구독 플랜 관리)
export const officeApi = {
  getCurrent: async (): Promise<Office> => {
    await delay()
    return mockData.office
  },
  isPremium: async (): Promise<boolean> => {
    await delay()
    const office = mockData.office
    return office.plan === 'premium' && (!office.planExpiresAt || new Date(office.planExpiresAt) > new Date())
  },
  isDeluxeOrHigher: async (): Promise<boolean> => {
    await delay()
    const office = mockData.office
    return (office.plan === 'deluxe' || office.plan === 'premium') &&
           (!office.planExpiresAt || new Date(office.planExpiresAt) > new Date())
  },
  updatePlan: async (plan: 'free' | 'deluxe' | 'premium'): Promise<Office> => {
    await delay()
    mockData.office.plan = plan
    if (plan !== 'free') {
      // 유료 플랜은 1년 후 만료
      const expiresAt = new Date()
      expiresAt.setFullYear(expiresAt.getFullYear() + 1)
      mockData.office.planExpiresAt = expiresAt
    } else {
      mockData.office.planExpiresAt = undefined
    }
    mockData.office.updatedAt = new Date()
    return mockData.office
  },
  connectNaverAccount: async (naverId: string): Promise<Office> => {
    await delay()
    mockData.office.naverAccount = {
      naverId,
      isConnected: true,
      connectedAt: new Date(),
      lastSyncAt: new Date(),
    }
    mockData.office.updatedAt = new Date()
    return mockData.office
  },
  disconnectNaverAccount: async (): Promise<Office> => {
    await delay()
    if (mockData.office.naverAccount) {
      mockData.office.naverAccount.isConnected = false
    }
    mockData.office.updatedAt = new Date()
    return mockData.office
  },
}

// ============ 네이버 광고 API (디럭스 이상) ============

// NaverAds API
export const naverAdsApi = {
  getAll: async (): Promise<NaverAd[]> => {
    await delay()
    return mockData.naverAds
  },
  getById: async (id: string): Promise<NaverAd | undefined> => {
    await delay()
    return mockData.naverAds.find((ad) => ad.id === id)
  },
  getActive: async (): Promise<NaverAd[]> => {
    await delay()
    return mockData.naverAds.filter((ad) => ad.status === 'active')
  },
  getMatched: async (): Promise<NaverAd[]> => {
    await delay()
    return mockData.naverAds.filter((ad) => ad.matchedPropertyId)
  },
  getUnmatched: async (): Promise<NaverAd[]> => {
    await delay()
    return mockData.naverAds.filter((ad) => !ad.matchedPropertyId && ad.status === 'active')
  },
  // 광고 통계 조회
  getStats: async (): Promise<{
    total: number
    active: number
    matched: number
    unmatched: number
    totalViews: number
    totalInquiries: number
  }> => {
    await delay()
    const ads = mockData.naverAds
    const active = ads.filter((ad) => ad.status === 'active')
    const matched = ads.filter((ad) => ad.matchedPropertyId)
    return {
      total: ads.length,
      active: active.length,
      matched: matched.length,
      unmatched: active.filter((ad) => !ad.matchedPropertyId).length,
      totalViews: ads.reduce((sum, ad) => sum + ad.viewCount, 0),
      totalInquiries: ads.reduce((sum, ad) => sum + ad.inquiryCount, 0),
    }
  },
  // 매물과 연결
  linkToProperty: async (adId: string, propertyId: string): Promise<NaverAd> => {
    await delay()
    const index = mockData.naverAds.findIndex((ad) => ad.id === adId)
    if (index === -1) throw new Error('NaverAd not found')
    mockData.naverAds[index] = {
      ...mockData.naverAds[index],
      matchedPropertyId: propertyId,
      matchConfidence: 100, // 수동 매칭은 100%
      matchedAt: new Date(),
      updatedAt: new Date(),
    }
    return mockData.naverAds[index]
  },
  // 매물 연결 해제
  unlinkFromProperty: async (adId: string): Promise<NaverAd> => {
    await delay()
    const index = mockData.naverAds.findIndex((ad) => ad.id === adId)
    if (index === -1) throw new Error('NaverAd not found')
    mockData.naverAds[index] = {
      ...mockData.naverAds[index],
      matchedPropertyId: undefined,
      matchConfidence: undefined,
      matchedAt: undefined,
      updatedAt: new Date(),
    }
    return mockData.naverAds[index]
  },
  // 동기화 (네이버에서 데이터 갱신)
  sync: async (): Promise<{ synced: number; lastSyncAt: Date }> => {
    await delay(1000) // 동기화는 시간이 좀 걸림
    const now = new Date()
    mockData.naverAds.forEach((ad) => {
      ad.lastSyncAt = now
      // 조회수/문의수 약간 증가 시뮬레이션
      ad.viewCount += Math.floor(Math.random() * 20)
      ad.inquiryCount += Math.random() > 0.8 ? 1 : 0
    })
    return { synced: mockData.naverAds.length, lastSyncAt: now }
  },
}

// 네이버 광고 매칭 제안 API
export const naverAdMatchSuggestionsApi = {
  getAll: async (): Promise<NaverAdMatchSuggestion[]> => {
    await delay()
    return mockData.naverAdMatchSuggestions
  },
  getByAdId: async (adId: string): Promise<NaverAdMatchSuggestion[]> => {
    await delay()
    return mockData.naverAdMatchSuggestions.filter((s) => s.naverAdId === adId)
  },
  getByPropertyId: async (propertyId: string): Promise<NaverAdMatchSuggestion[]> => {
    await delay()
    return mockData.naverAdMatchSuggestions.filter((s) => s.propertyId === propertyId)
  },
  // 제안 수락 (매칭 확정)
  accept: async (naverAdId: string, propertyId: string): Promise<NaverAd> => {
    await delay()
    // 광고에 매물 연결
    const adIndex = mockData.naverAds.findIndex((ad) => ad.id === naverAdId)
    if (adIndex === -1) throw new Error('NaverAd not found')
    mockData.naverAds[adIndex] = {
      ...mockData.naverAds[adIndex],
      matchedPropertyId: propertyId,
      matchConfidence: 100,
      matchedAt: new Date(),
      updatedAt: new Date(),
    }
    // 해당 제안들 제거
    mockData.naverAdMatchSuggestions = mockData.naverAdMatchSuggestions.filter(
      (s) => s.naverAdId !== naverAdId,
    )
    return mockData.naverAds[adIndex]
  },
  // 제안 거부
  dismiss: async (naverAdId: string, propertyId: string): Promise<void> => {
    await delay()
    mockData.naverAdMatchSuggestions = mockData.naverAdMatchSuggestions.filter(
      (s) => !(s.naverAdId === naverAdId && s.propertyId === propertyId),
    )
  },
}

// ============ 계약서 템플릿 API ============

// Contract Templates API
export const contractTemplatesApi = {
  getAll: async (): Promise<ContractTemplate[]> => {
    await delay()
    return mockData.contractTemplates
  },
  getById: async (id: string): Promise<ContractTemplate | undefined> => {
    await delay()
    return mockData.contractTemplates.find((t) => t.id === id)
  },
  getByTransactionType: async (transactionType: TransactionType): Promise<ContractTemplate[]> => {
    await delay()
    return mockData.contractTemplates.filter((t) => t.transactionType === transactionType)
  },
  getDefault: async (transactionType: TransactionType): Promise<ContractTemplate | undefined> => {
    await delay()
    return mockData.contractTemplates.find(
      (t) => t.transactionType === transactionType && t.isDefault,
    )
  },
}

// ============ 중개수수료 계산 API ============

// 법정 중개수수료 요율표 (2021년 개정)
const COMMISSION_RATES = {
  sale: [
    { max: 50000000, rate: 0.6, limit: 250000 },           // 5천만 미만: 0.6%, 한도 25만
    { max: 200000000, rate: 0.5, limit: 800000 },          // 2억 미만: 0.5%, 한도 80만
    { max: 600000000, rate: 0.4, limit: null },            // 6억 미만: 0.4%
    { max: 900000000, rate: 0.5, limit: null },            // 9억 미만: 0.5%
    { max: Infinity, rate: 0.9, limit: null },              // 9억 이상: 0.9% (협의)
  ],
  lease: [
    { max: 50000000, rate: 0.5, limit: 200000 },           // 5천만 미만: 0.5%, 한도 20만
    { max: 100000000, rate: 0.4, limit: 300000 },          // 1억 미만: 0.4%, 한도 30만
    { max: 600000000, rate: 0.3, limit: null },            // 6억 미만: 0.3%
    { max: Infinity, rate: 0.8, limit: null },              // 6억 이상: 0.8% (협의)
  ],
  monthly: [
    // 월세는 보증금 + (월세 × 100)으로 환산 후 전세 기준 적용
    { max: 50000000, rate: 0.5, limit: 200000 },
    { max: 100000000, rate: 0.4, limit: 300000 },
    { max: 600000000, rate: 0.3, limit: null },
    { max: Infinity, rate: 0.8, limit: null },
  ],
}

// Commission Calculation API
export const commissionApi = {
  // 수수료 계산
  calculate: async (
    transactionType: TransactionType,
    transactionAmount: number,
    monthlyRent?: number,
  ): Promise<CommissionBreakdown> => {
    await delay(100)

    // 월세인 경우 환산금액 계산
    let calculatedAmount = transactionAmount
    if (transactionType === 'monthly' && monthlyRent) {
      calculatedAmount = transactionAmount + (monthlyRent * 100)
    }

    const rates = COMMISSION_RATES[transactionType]
    let applicableRate = rates[rates.length - 1] // 기본값: 최고 구간

    for (const bracket of rates) {
      if (calculatedAmount < bracket.max) {
        applicableRate = bracket
        break
      }
    }

    let totalFee = Math.round(calculatedAmount * (applicableRate.rate / 100))

    // 한도 적용
    if (applicableRate.limit && totalFee > applicableRate.limit) {
      totalFee = applicableRate.limit
    }

    // 매수인/매도인 각각 부담 (동일 분할)
    const buyerFee = Math.round(totalFee / 2)
    const sellerFee = totalFee - buyerFee

    return {
      transactionType,
      transactionAmount: calculatedAmount,
      rate: applicableRate.rate,
      buyerFee,
      sellerFee,
      totalFee,
      vatAmount: Math.round(totalFee * 0.1), // 부가세 10%
    }
  },

  // 요율표 조회
  getRates: async (transactionType: TransactionType) => {
    await delay(50)
    return COMMISSION_RATES[transactionType]
  },
}

// ============ 거래 체크리스트 API ============

// Deal Checklist API
export const dealChecklistApi = {
  // 거래에 대한 체크리스트 조회 (없으면 기본값 생성)
  getByDealId: async (dealId: string): Promise<ChecklistItem[]> => {
    await delay()
    const deal = mockData.deals.find((d) => d.id === dealId)
    if (!deal) throw new Error('Deal not found')

    // 체크리스트가 없으면 기본값 반환
    if (!deal.checklist || deal.checklist.length === 0) {
      return generateDefaultChecklist()
    }
    return deal.checklist
  },

  // 체크리스트 항목 토글
  toggleItem: async (dealId: string, itemId: string, userId: string): Promise<ChecklistItem[]> => {
    await delay()
    const dealIndex = mockData.deals.findIndex((d) => d.id === dealId)
    if (dealIndex === -1) throw new Error('Deal not found')

    const deal = mockData.deals[dealIndex]

    // 체크리스트가 없으면 기본값으로 초기화
    if (!deal.checklist || deal.checklist.length === 0) {
      deal.checklist = generateDefaultChecklist()
    }

    const itemIndex = deal.checklist.findIndex((item) => item.id === itemId)
    if (itemIndex === -1) throw new Error('Checklist item not found')

    const item = deal.checklist[itemIndex]
    deal.checklist[itemIndex] = {
      ...item,
      checked: !item.checked,
      checkedAt: !item.checked ? new Date() : undefined,
      checkedBy: !item.checked ? userId : undefined,
    }

    deal.updatedAt = new Date()
    return deal.checklist
  },

  // 체크리스트 전체 업데이트
  update: async (dealId: string, checklist: ChecklistItem[]): Promise<ChecklistItem[]> => {
    await delay()
    const dealIndex = mockData.deals.findIndex((d) => d.id === dealId)
    if (dealIndex === -1) throw new Error('Deal not found')

    mockData.deals[dealIndex].checklist = checklist
    mockData.deals[dealIndex].updatedAt = new Date()
    return checklist
  },

  // 체크리스트 진행률 조회
  getProgress: async (dealId: string): Promise<{ completed: number; total: number; percentage: number }> => {
    await delay()
    const deal = mockData.deals.find((d) => d.id === dealId)
    if (!deal) throw new Error('Deal not found')

    const checklist = deal.checklist || generateDefaultChecklist()
    const total = checklist.length
    const completed = checklist.filter((item) => item.checked).length
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

    return { completed, total, percentage }
  },
}

// ============ 시세/실거래가 API ============

// Real Transaction API (실거래가)
export const realTransactionsApi = {
  // 건물명으로 실거래 내역 조회
  getByBuildingName: async (buildingName: string): Promise<RealTransaction[]> => {
    await delay()
    return mockData.realTransactions.filter((t) => t.buildingName === buildingName)
  },
  // 전체 조회
  getAll: async (): Promise<RealTransaction[]> => {
    await delay()
    return mockData.realTransactions
  },
  // 최근 실거래 (최근 N건)
  getRecent: async (limit: number = 10): Promise<RealTransaction[]> => {
    await delay()
    return mockData.realTransactions.slice(0, limit)
  },
}

// Market Price API (시세 정보)
export const marketPricesApi = {
  // 건물명으로 시세 조회
  getByBuildingName: async (buildingName: string): Promise<MarketPrice[]> => {
    await delay()
    return mockData.marketPrices.filter((m) => m.buildingName === buildingName)
  },
  // 건물명 + 면적 + 거래유형으로 시세 조회
  getByBuildingAndArea: async (
    buildingName: string,
    area: number,
    transactionType: TransactionType,
  ): Promise<MarketPrice | undefined> => {
    await delay()
    return mockData.marketPrices.find(
      (m) =>
        m.buildingName === buildingName &&
        m.area === area &&
        m.transactionType === transactionType,
    )
  },
  // 전체 조회
  getAll: async (): Promise<MarketPrice[]> => {
    await delay()
    return mockData.marketPrices
  },
}

// ============ 건축물대장 API ============

// Building Registry API (건축물대장 연동)
export const buildingRegistryApi = {
  // 주소로 건축물대장 검색
  searchByAddress: async (address: string): Promise<BuildingRegistry[]> => {
    await delay(500) // 외부 API 호출 시뮬레이션
    const q = address.toLowerCase()
    return mockData.buildingRegistries.filter(
      (r) =>
        r.address.toLowerCase().includes(q) ||
        r.roadAddress.toLowerCase().includes(q) ||
        r.buildingName.toLowerCase().includes(q),
    )
  },

  // 건물명으로 검색
  searchByName: async (name: string): Promise<BuildingRegistry[]> => {
    await delay(500)
    const q = name.toLowerCase()
    return mockData.buildingRegistries.filter((r) =>
      r.buildingName.toLowerCase().includes(q),
    )
  },

  // 전체 조회
  getAll: async (): Promise<BuildingRegistry[]> => {
    await delay()
    return mockData.buildingRegistries
  },

  // 건물의 호별 정보 조회
  getUnits: async (buildingName: string): Promise<UnitRegistry[]> => {
    await delay()
    const registry = mockData.buildingRegistries.find(
      (r) => r.buildingName === buildingName,
    )
    if (!registry) return []

    const registryIndex = mockData.buildingRegistries.indexOf(registry)
    return mockData.unitRegistries.filter(
      (u) => u.buildingRegistryId === `registry-${registryIndex}`,
    )
  },

  // 특정 동/호 정보 조회
  getUnit: async (
    buildingName: string,
    dong: string,
    ho: string,
  ): Promise<UnitRegistry | undefined> => {
    await delay()
    const registry = mockData.buildingRegistries.find(
      (r) => r.buildingName === buildingName,
    )
    if (!registry) return undefined

    const registryIndex = mockData.buildingRegistries.indexOf(registry)
    return mockData.unitRegistries.find(
      (u) =>
        u.buildingRegistryId === `registry-${registryIndex}` &&
        u.dong === dong &&
        u.ho === ho,
    )
  },
}

// ============ 임장(Field Visit) API ============

// Field Visit API (임장 관리)
export const fieldVisitsApi = {
  // 전체 조회
  getAll: async (): Promise<FieldVisit[]> => {
    await delay()
    return mockData.fieldVisits
  },

  // ID로 조회
  getById: async (id: string): Promise<FieldVisit | undefined> => {
    await delay()
    return mockData.fieldVisits.find((v) => v.id === id)
  },

  // 매물별 임장 기록 조회
  getByPropertyId: async (propertyId: string): Promise<FieldVisit[]> => {
    await delay()
    return mockData.fieldVisits.filter((v) => v.propertyId === propertyId)
  },

  // 매칭별 임장 기록 조회
  getByMatchId: async (matchId: string): Promise<FieldVisit[]> => {
    await delay()
    return mockData.fieldVisits.filter((v) => v.matchId === matchId)
  },

  // 예정된 임장 조회 (오늘 이후)
  getScheduled: async (): Promise<FieldVisit[]> => {
    await delay()
    const now = new Date()
    return mockData.fieldVisits.filter(
      (v) => v.status === 'scheduled' && new Date(v.scheduledDate) >= now,
    )
  },

  // 오늘 임장 일정
  getToday: async (): Promise<FieldVisit[]> => {
    await delay()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return mockData.fieldVisits.filter((v) => {
      const visitDate = new Date(v.scheduledDate)
      return visitDate >= today && visitDate < tomorrow
    })
  },

  // 완료된 임장 조회
  getCompleted: async (): Promise<FieldVisit[]> => {
    await delay()
    return mockData.fieldVisits.filter((v) => v.status === 'completed')
  },

  // 임장 생성
  create: async (
    visit: Omit<FieldVisit, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<FieldVisit> => {
    await delay()
    const newVisit: FieldVisit = {
      ...visit,
      id: `field-visit-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockData.fieldVisits.push(newVisit)
    return newVisit
  },

  // 임장 수정
  update: async (id: string, updates: Partial<FieldVisit>): Promise<FieldVisit> => {
    await delay()
    const index = mockData.fieldVisits.findIndex((v) => v.id === id)
    if (index === -1) throw new Error('Field visit not found')
    mockData.fieldVisits[index] = {
      ...mockData.fieldVisits[index],
      ...updates,
      updatedAt: new Date(),
    }
    return mockData.fieldVisits[index]
  },

  // 임장 완료 처리
  complete: async (
    id: string,
    feedback?: string,
    rating?: number,
  ): Promise<FieldVisit> => {
    await delay()
    const index = mockData.fieldVisits.findIndex((v) => v.id === id)
    if (index === -1) throw new Error('Field visit not found')
    mockData.fieldVisits[index] = {
      ...mockData.fieldVisits[index],
      status: 'completed',
      visitedAt: new Date(),
      feedback,
      rating,
      updatedAt: new Date(),
    }
    return mockData.fieldVisits[index]
  },

  // 임장 취소
  cancel: async (id: string): Promise<FieldVisit> => {
    await delay()
    const index = mockData.fieldVisits.findIndex((v) => v.id === id)
    if (index === -1) throw new Error('Field visit not found')
    mockData.fieldVisits[index] = {
      ...mockData.fieldVisits[index],
      status: 'cancelled',
      updatedAt: new Date(),
    }
    return mockData.fieldVisits[index]
  },

  // 임장 삭제
  delete: async (id: string): Promise<void> => {
    await delay()
    const index = mockData.fieldVisits.findIndex((v) => v.id === id)
    if (index === -1) throw new Error('Field visit not found')
    mockData.fieldVisits.splice(index, 1)
  },
}

// Property Location API (매물 위치)
export const propertyLocationsApi = {
  // 전체 조회
  getAll: async (): Promise<PropertyLocation[]> => {
    await delay()
    return mockData.propertyLocations
  },

  // 매물 ID로 위치 조회
  getByPropertyId: async (propertyId: string): Promise<PropertyLocation | undefined> => {
    await delay()
    return mockData.propertyLocations.find((l) => l.propertyId === propertyId)
  },

  // 여러 매물 위치 조회
  getByPropertyIds: async (propertyIds: string[]): Promise<PropertyLocation[]> => {
    await delay()
    return mockData.propertyLocations.filter((l) =>
      propertyIds.includes(l.propertyId),
    )
  },

  // 범위 내 매물 조회
  getInBounds: async (
    minLat: number,
    maxLat: number,
    minLng: number,
    maxLng: number,
  ): Promise<PropertyLocation[]> => {
    await delay()
    return mockData.propertyLocations.filter(
      (l) =>
        l.latitude >= minLat &&
        l.latitude <= maxLat &&
        l.longitude >= minLng &&
        l.longitude <= maxLng,
    )
  },
}

// ============ 부동산 계산기 API ============

// 평수 변환 상수
const SQM_TO_PYEONG = 0.3025 // 1㎡ = 0.3025평

// Calculator API (부동산 계산기)
export const calculatorApi = {
  // 평단가 계산
  calculatePricePerPyeong: async (
    totalPrice: number,
    areaSqm: number,
  ): Promise<PricePerPyeongResult> => {
    await delay(100)
    const areaPyeong = areaSqm * SQM_TO_PYEONG
    const pricePerSqm = Math.round(totalPrice / areaSqm)
    const pricePerPyeong = Math.round(totalPrice / areaPyeong)

    return {
      totalPrice,
      areaSqm,
      areaPyeong: Math.round(areaPyeong * 100) / 100,
      pricePerSqm,
      pricePerPyeong,
    }
  },

  // 면적 변환 (㎡ ↔ 평)
  convertArea: async (
    value: number,
    from: 'sqm' | 'pyeong',
  ): Promise<{ sqm: number; pyeong: number }> => {
    await delay(50)
    if (from === 'sqm') {
      return {
        sqm: value,
        pyeong: Math.round(value * SQM_TO_PYEONG * 100) / 100,
      }
    } else {
      return {
        sqm: Math.round(value / SQM_TO_PYEONG * 100) / 100,
        pyeong: value,
      }
    }
  },

  // 수익률 계산
  calculateYield: async (params: {
    purchasePrice: number
    monthlyRent?: number
    deposit?: number
    monthlyExpenses?: number
    currentPrice?: number
  }): Promise<YieldResult> => {
    await delay(100)
    const { purchasePrice, monthlyRent = 0, deposit = 0, monthlyExpenses = 0, currentPrice } = params

    // 연간 임대 수익 (월세 × 12)
    const annualRent = monthlyRent * 12

    // 연간 비용
    const annualExpenses = monthlyExpenses * 12

    // 순 연간 수익
    const netAnnualIncome = annualRent - annualExpenses

    // 실제 투자금 (매입가 - 보증금)
    const actualInvestment = purchasePrice - deposit

    // 총 수익률 (연간 임대 수익 / 매입가)
    const grossYield = purchasePrice > 0 ? (annualRent / purchasePrice) * 100 : 0

    // 순 수익률 (순 연간 수익 / 실제 투자금)
    const netYield = actualInvestment > 0 ? (netAnnualIncome / actualInvestment) * 100 : 0

    // 시세 차익
    const capitalGain = currentPrice ? currentPrice - purchasePrice : undefined

    // 총 수익률 (시세 차익 포함)
    const totalReturn = capitalGain !== undefined && purchasePrice > 0
      ? ((netAnnualIncome + capitalGain) / purchasePrice) * 100
      : undefined

    return {
      purchasePrice,
      currentPrice,
      monthlyRent,
      deposit,
      monthlyExpenses,
      annualRent,
      annualExpenses,
      netAnnualIncome,
      grossYield: Math.round(grossYield * 100) / 100,
      netYield: Math.round(netYield * 100) / 100,
      capitalGain,
      totalReturn: totalReturn ? Math.round(totalReturn * 100) / 100 : undefined,
    }
  },

  // 대출 계산
  calculateLoan: async (params: {
    propertyPrice: number
    downPayment: number
    interestRate: number
    loanTermYears: number
    repaymentType: 'equalPrincipal' | 'equalPayment' | 'bullet'
  }): Promise<LoanResult> => {
    await delay(100)
    const { propertyPrice, downPayment, interestRate, loanTermYears, repaymentType } = params

    const loanAmount = propertyPrice - downPayment
    const monthlyRate = interestRate / 100 / 12
    const totalMonths = loanTermYears * 12
    const ltvRatio = (loanAmount / propertyPrice) * 100

    let monthlyPayment: number
    let totalInterest: number
    const schedule: { month: number; principal: number; interest: number; balance: number }[] = []

    if (repaymentType === 'bullet') {
      // 만기일시상환: 매월 이자만 납부, 만기에 원금 일시 상환
      monthlyPayment = Math.round(loanAmount * monthlyRate)
      totalInterest = monthlyPayment * totalMonths

      // 상환 스케줄 (첫 12개월)
      for (let i = 1; i <= Math.min(12, totalMonths); i++) {
        schedule.push({
          month: i,
          principal: i === totalMonths ? loanAmount : 0,
          interest: monthlyPayment,
          balance: i === totalMonths ? 0 : loanAmount,
        })
      }
    } else if (repaymentType === 'equalPrincipal') {
      // 원금균등상환: 매월 동일한 원금 + 잔액 기준 이자
      const monthlyPrincipal = loanAmount / totalMonths
      totalInterest = 0
      let balance = loanAmount

      for (let i = 1; i <= totalMonths; i++) {
        const interest = balance * monthlyRate
        totalInterest += interest

        if (i <= 12) {
          schedule.push({
            month: i,
            principal: Math.round(monthlyPrincipal),
            interest: Math.round(interest),
            balance: Math.round(balance - monthlyPrincipal),
          })
        }

        balance -= monthlyPrincipal
      }

      // 첫 달 상환금 (가장 큼)
      monthlyPayment = Math.round(monthlyPrincipal + loanAmount * monthlyRate)
      totalInterest = Math.round(totalInterest)
    } else {
      // 원리금균등상환: 매월 동일한 금액 상환
      if (monthlyRate === 0) {
        monthlyPayment = Math.round(loanAmount / totalMonths)
        totalInterest = 0
      } else {
        monthlyPayment = Math.round(
          loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
          (Math.pow(1 + monthlyRate, totalMonths) - 1)
        )
        totalInterest = monthlyPayment * totalMonths - loanAmount
      }

      // 상환 스케줄 (첫 12개월)
      let balance = loanAmount
      for (let i = 1; i <= Math.min(12, totalMonths); i++) {
        const interest = Math.round(balance * monthlyRate)
        const principal = monthlyPayment - interest
        balance -= principal

        schedule.push({
          month: i,
          principal,
          interest,
          balance: Math.max(0, Math.round(balance)),
        })
      }
    }

    return {
      propertyPrice,
      downPayment,
      loanAmount,
      interestRate,
      loanTermYears,
      repaymentType,
      monthlyPayment,
      totalInterest,
      totalRepayment: loanAmount + totalInterest,
      ltvRatio: Math.round(ltvRatio * 10) / 10,
      schedule,
    }
  },

  // 취득세 계산
  calculateAcquisitionTax: async (params: {
    propertyPrice: number
    propertyType: PropertyType
    isFirstHome: boolean
    numberOfHomes?: number // 현재 보유 주택 수
  }): Promise<TaxResult> => {
    await delay(100)
    const { propertyPrice, propertyType, isFirstHome, numberOfHomes = 0 } = params

    let acquisitionTaxRate: number

    // 주택 취득세율 (2024년 기준, 간소화)
    if (propertyType === 'apartment' || propertyType === 'villa' || propertyType === 'house') {
      if (isFirstHome && propertyPrice <= 600000000) {
        // 6억 이하 1주택: 1%
        acquisitionTaxRate = 1.0
      } else if (isFirstHome && propertyPrice <= 900000000) {
        // 9억 이하 1주택: 1~3%
        acquisitionTaxRate = 1.0 + (propertyPrice - 600000000) / 300000000 * 2.0
      } else if (numberOfHomes >= 2) {
        // 다주택자: 8% (조정지역) 또는 12%
        acquisitionTaxRate = 8.0
      } else {
        // 기타: 1~3%
        acquisitionTaxRate = propertyPrice <= 600000000 ? 1.0 : 3.0
      }
    } else if (propertyType === 'officetel') {
      // 오피스텔: 4%
      acquisitionTaxRate = 4.0
    } else {
      // 상가/토지: 4%
      acquisitionTaxRate = 4.0
    }

    const acquisitionTax = Math.round(propertyPrice * (acquisitionTaxRate / 100))
    const educationTax = Math.round(acquisitionTax * 0.1) // 지방교육세 10%
    const specialTax = propertyPrice > 600000000 ? Math.round(acquisitionTax * 0.2) : 0 // 농특세 (6억 초과)

    return {
      propertyPrice,
      propertyType,
      isFirstHome,
      acquisitionTaxRate: Math.round(acquisitionTaxRate * 100) / 100,
      acquisitionTax,
      educationTax,
      specialTax,
      totalTax: acquisitionTax + educationTax + specialTax,
    }
  },
}

// ============ AI 검색 API (프리미엄 기능) ============

// Mock 데이터: 등록된 주요 단지
const registeredComplexes: RegisteredComplex[] = [
  {
    id: 'complex-1',
    name: '래미안 강남 포레스트',
    address: '서울시 강남구 역삼동 123',
    complexId: 'naver-complex-001',
    propertyType: 'apartment',
    totalUnits: 500,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'complex-2',
    name: '힐스테이트 서초',
    address: '서울시 서초구 서초동 456',
    complexId: 'naver-complex-002',
    propertyType: 'apartment',
    totalUnits: 800,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'complex-3',
    name: '아크로리버파크',
    address: '서울시 서초구 반포동 789',
    complexId: 'naver-complex-003',
    propertyType: 'apartment',
    totalUnits: 1200,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'complex-4',
    name: '잠실 엘스',
    address: '서울시 송파구 잠실동 100',
    complexId: 'naver-complex-004',
    propertyType: 'apartment',
    totalUnits: 2000,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
  {
    id: 'complex-5',
    name: '더샵 스타시티',
    address: '서울시 광진구 자양동 200',
    complexId: 'naver-complex-005',
    propertyType: 'apartment',
    totalUnits: 1500,
    isActive: true,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
  },
]

// Mock 데이터: AI 검색 사용 내역
const aiSearchUsages: AISearchUsage[] = []

// Mock 데이터: AI 검색 결과
const aiSearchResults: AISearchResult[] = []

// AI 검색 쿼터
const aiSearchQuotas: Map<string, AISearchQuota> = new Map()

export const aiSearchApi = {
  // 등록된 단지 목록 조회
  getRegisteredComplexes: async (): Promise<RegisteredComplex[]> => {
    await delay()
    return registeredComplexes.filter((c) => c.isActive)
  },

  // 단지 등록
  registerComplex: async (complex: Omit<RegisteredComplex, 'id' | 'createdAt' | 'updatedAt'>): Promise<RegisteredComplex> => {
    await delay()
    const newComplex: RegisteredComplex = {
      ...complex,
      id: `complex-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    registeredComplexes.push(newComplex)
    return newComplex
  },

  // 단지 삭제 (비활성화)
  deactivateComplex: async (id: string): Promise<void> => {
    await delay()
    const complex = registeredComplexes.find((c) => c.id === id)
    if (complex) {
      complex.isActive = false
      complex.updatedAt = new Date()
    }
  },

  // 현재 월 쿼터 조회
  getQuota: async (userId: string): Promise<AISearchQuota> => {
    await delay()
    const month = new Date().toISOString().slice(0, 7) // YYYY-MM
    const key = `${userId}-${month}`

    if (!aiSearchQuotas.has(key)) {
      // 프리미엄 사용자 확인 (임시로 true로 설정)
      const isPremium = true
      aiSearchQuotas.set(key, {
        userId,
        month,
        totalTokens: isPremium ? 100 : 0,
        usedTokens: 0,
        remainingTokens: isPremium ? 100 : 0,
        isPremium,
      })
    }

    return aiSearchQuotas.get(key)!
  },

  // 토큰 사용
  useTokens: async (userId: string, tokens: number): Promise<AISearchQuota> => {
    await delay()
    const quota = await aiSearchApi.getQuota(userId)

    if (quota.remainingTokens < tokens) {
      throw new Error('토큰이 부족합니다.')
    }

    quota.usedTokens += tokens
    quota.remainingTokens -= tokens

    return quota
  },

  // AI 검색 실행 (네이버 매물 검색 시뮬레이션)
  search: async (params: {
    query: string
    includeNaverSearch: boolean
    userId: string
  }): Promise<{ usage: AISearchUsage; results: AISearchResult[] }> => {
    await delay(1500) // 검색 시뮬레이션

    const { query, includeNaverSearch, userId } = params

    // 토큰 사용 (네이버 검색 포함시 2토큰, 아니면 1토큰)
    const tokensToUse = includeNaverSearch ? 2 : 1
    await aiSearchApi.useTokens(userId, tokensToUse)

    // 검색 결과 생성 (시뮬레이션)
    const results: AISearchResult[] = []

    if (includeNaverSearch) {
      // 네이버 검색 결과 시뮬레이션
      const complexes = registeredComplexes.filter((c) => c.isActive)

      complexes.forEach((complex, idx) => {
        // 각 단지에서 랜덤하게 1-3개 매물 생성
        const count = Math.floor(Math.random() * 3) + 1
        for (let i = 0; i < count; i++) {
          const transactionTypes: TransactionType[] = ['sale', 'lease', 'monthly']
          const transactionType = transactionTypes[Math.floor(Math.random() * 3)]

          results.push({
            id: `result-${Date.now()}-${idx}-${i}`,
            searchUsageId: '',
            naverArticleNo: `${100000 + idx * 100 + i}`,
            complexName: complex.name,
            articleName: `${complex.name} ${Math.floor(Math.random() * 20) + 1}동 ${Math.floor(Math.random() * 30) + 1}층`,
            transactionType,
            propertyType: complex.propertyType,
            price: transactionType === 'sale'
              ? (Math.floor(Math.random() * 100000) + 50000)
              : (Math.floor(Math.random() * 50000) + 10000),
            monthlyRent: transactionType === 'monthly' ? Math.floor(Math.random() * 200) + 50 : undefined,
            area: Math.floor(Math.random() * 50) + 20,
            floor: `${Math.floor(Math.random() * 25) + 1}`,
            direction: ['남향', '동향', '서향', '남동향', '남서향'][Math.floor(Math.random() * 5)],
            address: complex.address,
            matchScore: Math.floor(Math.random() * 30) + 70,
            matchReasons: ['가격 적합', '면적 적합', '위치 적합'].slice(0, Math.floor(Math.random() * 3) + 1),
            isSaved: false,
            createdAt: new Date(),
          })
        }
      })
    }

    // 사용 내역 저장
    const usage: AISearchUsage = {
      id: `usage-${Date.now()}`,
      userId,
      searchType: 'manual',
      query,
      tokensUsed: tokensToUse,
      resultsCount: results.length,
      savedCount: 0,
      createdAt: new Date(),
    }
    aiSearchUsages.push(usage)

    // 결과에 사용 내역 ID 설정
    results.forEach((r) => {
      r.searchUsageId = usage.id
    })
    aiSearchResults.push(...results)

    return { usage, results }
  },

  // 구매고객 요구사항 기반 자동 매칭 검색
  autoMatchSearch: async (params: {
    buyerReqId: string
    userId: string
  }): Promise<{ usage: AISearchUsage; results: AISearchResult[] }> => {
    await delay(2000) // 자동 매칭 검색 시뮬레이션

    const { buyerReqId, userId } = params

    // 토큰 사용 (자동 매칭은 3토큰)
    await aiSearchApi.useTokens(userId, 3)

    // 구매고객 요구사항 조회 (mock)
    const buyerReq = mockData.buyerRequirements.find((r) => r.id === buyerReqId)
    if (!buyerReq) {
      throw new Error('구매고객 요구사항을 찾을 수 없습니다.')
    }

    // 매칭 검색 결과 생성 (시뮬레이션)
    const results: AISearchResult[] = []
    const complexes = registeredComplexes.filter((c) => c.isActive)

    complexes.forEach((complex, idx) => {
      // 요구사항에 맞는 매물 생성
      const transactionType = buyerReq.transactionType || 'sale'
      const price = Math.floor((buyerReq.budgetMin || 0) + Math.random() * ((buyerReq.budgetMax || 100000) - (buyerReq.budgetMin || 0)))
      const area = Math.floor((buyerReq.areaMin || 20) + Math.random() * ((buyerReq.areaMax || 50) - (buyerReq.areaMin || 20)))

      results.push({
        id: `result-${Date.now()}-${idx}`,
        searchUsageId: '',
        naverArticleNo: `${200000 + idx}`,
        complexName: complex.name,
        articleName: `${complex.name} ${Math.floor(Math.random() * 20) + 1}동`,
        transactionType,
        propertyType: complex.propertyType,
        price,
        monthlyRent: transactionType === 'monthly' ? Math.floor(Math.random() * 200) + 50 : undefined,
        area,
        floor: `${Math.floor(Math.random() * 25) + 1}`,
        direction: '남향',
        address: complex.address,
        matchedBuyerReqId: buyerReqId,
        matchScore: Math.floor(Math.random() * 20) + 80, // 80-100점
        matchReasons: ['예산 범위 내', '면적 조건 충족', '희망 지역'],
        isSaved: false,
        createdAt: new Date(),
      })
    })

    // 사용 내역 저장
    const usage: AISearchUsage = {
      id: `usage-${Date.now()}`,
      userId,
      searchType: 'auto_match',
      buyerReqId,
      tokensUsed: 3,
      resultsCount: results.length,
      savedCount: 0,
      createdAt: new Date(),
    }
    aiSearchUsages.push(usage)

    results.forEach((r) => {
      r.searchUsageId = usage.id
    })
    aiSearchResults.push(...results)

    return { usage, results }
  },

  // 검색 결과를 내 매물로 저장
  saveResult: async (resultId: string): Promise<AISearchResult> => {
    await delay()
    const result = aiSearchResults.find((r) => r.id === resultId)
    if (!result) {
      throw new Error('검색 결과를 찾을 수 없습니다.')
    }

    // 매물 생성 (시뮬레이션)
    result.isSaved = true
    result.savedPropertyId = `property-${Date.now()}`

    // 사용 내역 업데이트
    const usage = aiSearchUsages.find((u) => u.id === result.searchUsageId)
    if (usage) {
      usage.savedCount += 1
    }

    return result
  },

  // 검색 사용 내역 조회
  getUsageHistory: async (userId: string): Promise<AISearchUsage[]> => {
    await delay()
    return aiSearchUsages
      .filter((u) => u.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },
}

// ============ 업무(Task) 관리 API ============

export const tasksApi = {
  // 전체 조회
  getAll: async (): Promise<Task[]> => {
    await delay()
    return [...mockData.tasks].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  // 담당자별 조회
  getByAssignee: async (userId: string): Promise<Task[]> => {
    await delay()
    return mockData.tasks
      .filter((t) => t.assignedTo === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  // 상태별 조회
  getByStatus: async (status: TaskStatus): Promise<Task[]> => {
    await delay()
    return mockData.tasks
      .filter((t) => t.status === status)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  // 단일 조회
  getById: async (id: string): Promise<Task | undefined> => {
    await delay()
    return mockData.tasks.find((t) => t.id === id)
  },

  // 생성
  create: async (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> => {
    await delay()
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    mockData.tasks.push(newTask)
    return newTask
  },

  // 수정
  update: async (id: string, updates: Partial<Task>): Promise<Task> => {
    await delay()
    const index = mockData.tasks.findIndex((t) => t.id === id)
    if (index === -1) throw new Error('Task not found')
    mockData.tasks[index] = {
      ...mockData.tasks[index],
      ...updates,
      updatedAt: new Date(),
    }
    return mockData.tasks[index]
  },

  // 상태 변경
  updateStatus: async (id: string, status: TaskStatus): Promise<Task> => {
    await delay()
    const index = mockData.tasks.findIndex((t) => t.id === id)
    if (index === -1) throw new Error('Task not found')

    const updates: Partial<Task> = {
      status,
      updatedAt: new Date(),
    }

    // 완료 상태로 변경시 완료 시간 기록
    if (status === 'completed') {
      updates.completedAt = new Date()
      updates.completedBy = mockData.users[0]?.id // 현재 사용자
    }

    mockData.tasks[index] = {
      ...mockData.tasks[index],
      ...updates,
    }
    return mockData.tasks[index]
  },

  // 담당자 변경 (재할당)
  reassign: async (id: string, newAssigneeId: string): Promise<Task> => {
    await delay()
    const index = mockData.tasks.findIndex((t) => t.id === id)
    if (index === -1) throw new Error('Task not found')
    mockData.tasks[index] = {
      ...mockData.tasks[index],
      assignedTo: newAssigneeId,
      updatedAt: new Date(),
    }
    return mockData.tasks[index]
  },

  // 삭제
  delete: async (id: string): Promise<void> => {
    await delay()
    const index = mockData.tasks.findIndex((t) => t.id === id)
    if (index === -1) throw new Error('Task not found')
    mockData.tasks.splice(index, 1)
  },

  // 오늘 마감 업무 조회
  getDueToday: async (): Promise<Task[]> => {
    await delay()
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    return mockData.tasks.filter((t) => {
      if (!t.dueDate || t.status === 'completed' || t.status === 'cancelled') return false
      const dueDate = new Date(t.dueDate)
      dueDate.setHours(0, 0, 0, 0)
      return dueDate >= today && dueDate < tomorrow
    })
  },

  // 지연된 업무 조회
  getOverdue: async (): Promise<Task[]> => {
    await delay()
    const now = new Date()

    return mockData.tasks.filter((t) => {
      if (!t.dueDate || t.status === 'completed' || t.status === 'cancelled') return false
      return new Date(t.dueDate) < now
    })
  },
}
