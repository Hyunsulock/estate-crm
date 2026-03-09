import { Card } from '@/components/ui/card'
import type { Property } from '@/types'

interface PropertyStatsProps {
  properties: Property[]
  filteredCount: number
}

export function PropertyStats({ properties, filteredCount }: PropertyStatsProps) {
  return (
    <div className="grid grid-cols-6 gap-3">
      <Card className="p-3">
        <div className="text-xs text-muted-foreground">전체</div>
        <div className="text-xl font-bold">{properties.length}</div>
      </Card>
      <Card className="p-3">
        <div className="text-xs text-muted-foreground">활성</div>
        <div className="text-xl font-bold text-green-600">
          {properties.filter((p) => p.status === 'available').length}
        </div>
      </Card>
      <Card className="p-3">
        <div className="text-xs text-muted-foreground">거래중</div>
        <div className="text-xl font-bold text-blue-600">
          {properties.filter((p) => p.status === 'in_progress').length}
        </div>
      </Card>
      <Card className="p-3">
        <div className="text-xs text-muted-foreground">예약중</div>
        <div className="text-xl font-bold text-orange-600">
          {properties.filter((p) => p.status === 'reserved').length}
        </div>
      </Card>
      <Card className="p-3">
        <div className="text-xs text-muted-foreground">계약완료</div>
        <div className="text-xl font-bold">
          {properties.filter((p) => p.status === 'contracted').length}
        </div>
      </Card>
      <Card className="p-3">
        <div className="text-xs text-muted-foreground">검색결과</div>
        <div className="text-xl font-bold text-primary">{filteredCount}</div>
      </Card>
    </div>
  )
}
