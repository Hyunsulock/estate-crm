import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  BarChart3,
  TrendingUp,
  Crown,
  Clock,
  AlertTriangle,
} from 'lucide-react'
import type { NaverAd } from '@/types'
import { transactionLabels } from '../utils'

interface AdAnalysisTabProps {
  naverAds: NaverAd[]
}

export function AdAnalysisTab({ naverAds }: AdAnalysisTabProps) {
  return (
    <div className="space-y-4">
      {/* 광고 성과 통계 */}
      <div className="grid grid-cols-5 gap-3">
        <Card className="p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <BarChart3 className="size-3" />
            게시중 광고
          </div>
          <div className="text-xl font-bold">
            {naverAds.filter((ad) => ad.status === 'active').length}
            <span className="text-sm text-muted-foreground font-normal ml-1">
              / {naverAds.length}
            </span>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
            <TrendingUp className="size-3" />
            평균 순위
          </div>
          <div className="text-xl font-bold">
            {naverAds.filter((ad) => ad.rank).length > 0
              ? Math.round(
                  naverAds.filter((ad) => ad.rank).reduce((sum, ad) => sum + (ad.rank || 0), 0) /
                    naverAds.filter((ad) => ad.rank).length
                )
              : '-'}
            <span className="text-sm text-muted-foreground font-normal ml-1">위</span>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 text-xs text-green-600 mb-1">
            <Crown className="size-3" />
            상위 10위
          </div>
          <div className="text-xl font-bold text-green-600">
            {naverAds.filter((ad) => ad.rank && ad.rank <= 10).length}
            <span className="text-sm font-normal ml-1">건</span>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 text-xs text-blue-600 mb-1">
            <TrendingUp className="size-3" />
            상위 20위
          </div>
          <div className="text-xl font-bold text-blue-600">
            {naverAds.filter((ad) => ad.rank && ad.rank <= 20).length}
            <span className="text-sm font-normal ml-1">건</span>
          </div>
        </Card>
        <Card className="p-3">
          <div className="flex items-center gap-2 text-xs text-orange-600 mb-1">
            <Clock className="size-3" />
            곧 만료
          </div>
          <div className="text-xl font-bold text-orange-600">
            {naverAds.filter((ad) => {
              const daysLeft = Math.ceil((new Date(ad.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              return daysLeft >= 0 && daysLeft <= 7
            }).length}
            <span className="text-sm font-normal ml-1">건</span>
          </div>
        </Card>
      </div>

      {/* 순위 분포 및 거래유형별 성과 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 순위 분포 */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <BarChart3 className="size-4" />
            순위 분포
          </h3>
          <div className="space-y-2">
            {[
              { range: '1-10위', min: 1, max: 10, color: 'bg-green-500' },
              { range: '11-20위', min: 11, max: 20, color: 'bg-blue-500' },
              { range: '21-50위', min: 21, max: 50, color: 'bg-yellow-500' },
              { range: '50위+', min: 51, max: 9999, color: 'bg-red-500' },
            ].map((tier) => {
              const count = naverAds.filter(
                (ad) => ad.rank && ad.rank >= tier.min && ad.rank <= tier.max
              ).length
              const total = naverAds.filter((ad) => ad.rank).length
              const percentage = total > 0 ? (count / total) * 100 : 0
              return (
                <div key={tier.range} className="flex items-center gap-3">
                  <span className="text-sm w-16">{tier.range}</span>
                  <div className="flex-1 h-6 bg-muted rounded overflow-hidden">
                    <div
                      className={`h-full ${tier.color} transition-all`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-12 text-right">{count}건</span>
                </div>
              )
            })}
          </div>
        </Card>

        {/* 거래유형별 성과 */}
        <Card className="p-4">
          <h3 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="size-4" />
            거래유형별 성과
          </h3>
          <div className="space-y-3">
            {(['sale', 'lease', 'monthly'] as const).map((type) => {
              const typeAds = naverAds.filter((ad) => ad.transactionType === type)
              const avgRank =
                typeAds.filter((ad) => ad.rank).length > 0
                  ? Math.round(
                      typeAds.filter((ad) => ad.rank).reduce((sum, ad) => sum + (ad.rank || 0), 0) /
                        typeAds.filter((ad) => ad.rank).length
                    )
                  : null
              return (
                <div key={type} className="flex items-center justify-between p-2 bg-muted/50 rounded">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{transactionLabels[type]}</Badge>
                    <span className="text-sm text-muted-foreground">{typeAds.length}건</span>
                  </div>
                  <div className="text-sm">
                    평균{' '}
                    <span className={`font-semibold ${avgRank && avgRank <= 20 ? 'text-green-600' : ''}`}>
                      {avgRank ? `${avgRank}위` : '-'}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      </div>

      {/* 개선 필요 광고 */}
      <Card className="p-4">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <AlertTriangle className="size-4 text-orange-500" />
          개선 필요 광고
        </h3>
        <div className="space-y-2">
          {naverAds
            .filter((ad) => {
              const daysLeft = Math.ceil((new Date(ad.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              return (ad.rank && ad.rank > 50) || (daysLeft >= 0 && daysLeft <= 7)
            })
            .slice(0, 5)
            .map((ad) => {
              const daysLeft = Math.ceil((new Date(ad.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
              const isExpiringSoon = daysLeft >= 0 && daysLeft <= 7
              const isLowRank = ad.rank && ad.rank > 50
              return (
                <div key={ad.id} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <div className="font-medium text-sm">{ad.articleName}</div>
                    <div className="text-xs text-muted-foreground">
                      {ad.buildingName} · {transactionLabels[ad.transactionType]}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isLowRank && (
                      <Badge variant="outline" className="text-red-600 border-red-200">
                        {ad.rank}위
                      </Badge>
                    )}
                    {isExpiringSoon && (
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        {daysLeft}일 후 만료
                      </Badge>
                    )}
                  </div>
                </div>
              )
            })}
          {naverAds.filter((ad) => {
            const daysLeft = Math.ceil((new Date(ad.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            return (ad.rank && ad.rank > 50) || (daysLeft >= 0 && daysLeft <= 7)
          }).length === 0 && (
            <div className="text-center py-4 text-muted-foreground text-sm">
              모든 광고가 양호한 상태입니다
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
