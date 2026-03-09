import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  ExternalLink,
  Link2,
  Unlink,
  TrendingUp,
  Sparkles,
  Check,
  X,
  AlertCircle,
} from 'lucide-react'
import type { Property, PropertyFull, NaverAd, NaverAdMatchSuggestion } from '@/types'
import { formatPrice, transactionLabels, naverAdStatusLabels } from '../utils'

interface NaverAdTabProps {
  naverAds: NaverAd[]
  matchSuggestions: NaverAdMatchSuggestion[]
  properties: Property[]
  selectedNaverAd: NaverAd | null
  setSelectedNaverAd: (ad: NaverAd | null) => void
  getPropertyName: (propertyId: string) => string
  getSuggestionsForAd: (adId: string) => NaverAdMatchSuggestion[]
  onLinkAd: (adId: string, propertyId: string) => void
  onUnlinkAd: (adId: string) => void
  onAcceptSuggestion: (adId: string, propertyId: string) => void
  onDismissSuggestion: (adId: string, propertyId: string) => void
  isLinking: boolean
  isUnlinking: boolean
  isAccepting: boolean
  isDismissing: boolean
}

export function NaverAdTab({
  naverAds,
  matchSuggestions,
  properties,
  selectedNaverAd,
  setSelectedNaverAd,
  getPropertyName,
  getSuggestionsForAd,
  onLinkAd,
  onUnlinkAd,
  onAcceptSuggestion,
  onDismissSuggestion,
  isLinking,
  isUnlinking,
  isAccepting,
  isDismissing,
}: NaverAdTabProps) {
  return (
    <div className="space-y-4">
      {/* 네이버 광고 통계 */}
      <div className="grid grid-cols-5 gap-3">
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">전체 광고</div>
          <div className="text-xl font-bold">{naverAds.length}</div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">게시중</div>
          <div className="text-xl font-bold text-green-600">
            {naverAds.filter((ad) => ad.status === 'active').length}
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">매칭됨</div>
          <div className="text-xl font-bold text-blue-600">
            {naverAds.filter((ad) => ad.matchedPropertyId).length}
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">미매칭</div>
          <div className="text-xl font-bold text-orange-600">
            {naverAds.filter((ad) => !ad.matchedPropertyId).length}
          </div>
        </Card>
        <Card className="p-3">
          <div className="text-xs text-muted-foreground">매칭 제안</div>
          <div className="text-xl font-bold text-amber-600">
            {matchSuggestions.length}
          </div>
        </Card>
      </div>

      {/* 매칭 제안 알림 */}
      {matchSuggestions.length > 0 && (
        <Card className="p-4 border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="size-5 text-amber-600" />
            <h3 className="font-medium">자동 매칭 제안</h3>
            <Badge variant="secondary">{matchSuggestions.length}건</Badge>
          </div>
          <div className="space-y-2">
            {matchSuggestions.slice(0, 3).map((suggestion) => {
              const ad = naverAds.find((a) => a.id === suggestion.naverAdId)
              if (!ad) return null
              return (
                <div key={`${suggestion.naverAdId}-${suggestion.propertyId}`} className="flex items-center justify-between p-2 bg-white dark:bg-background rounded border">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{ad.articleName}</span>
                      <span className="text-muted-foreground">→</span>
                      <span className="text-sm">{getPropertyName(suggestion.propertyId)}</span>
                    </div>
                    <div className="flex gap-1 mt-1">
                      {suggestion.matchReasons.map((reason, i) => (
                        <Badge key={i} variant="outline" className="text-xs">{reason}</Badge>
                      ))}
                      <Badge variant="secondary" className="text-xs">
                        신뢰도 {Math.round(suggestion.confidence * 100)}%
                      </Badge>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onAcceptSuggestion(suggestion.naverAdId, suggestion.propertyId)}
                      disabled={isAccepting}
                    >
                      <Check className="size-4 text-green-600" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDismissSuggestion(suggestion.naverAdId, suggestion.propertyId)}
                      disabled={isDismissing}
                    >
                      <X className="size-4 text-red-600" />
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* 네이버 광고 목록 */}
      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="text-left p-2 font-medium w-[80px]">상태</th>
                <th className="text-left p-2 font-medium">광고명</th>
                <th className="text-left p-2 font-medium w-[120px]">건물명</th>
                <th className="text-center p-2 font-medium w-[60px]">거래</th>
                <th className="text-right p-2 font-medium w-[100px]">가격</th>
                <th className="text-center p-2 font-medium w-[80px]">랭킹</th>
                <th className="text-left p-2 font-medium w-[150px]">매칭 매물</th>
                <th className="text-center p-2 font-medium w-[80px]">작업</th>
              </tr>
            </thead>
            <tbody>
              {naverAds.map((ad) => {
                const statusInfo = naverAdStatusLabels[ad.status] || { label: ad.status, color: '' }
                const suggestions = getSuggestionsForAd(ad.id)
                return (
                  <tr key={ad.id} className="border-b hover:bg-muted/30">
                    <td className="p-2">
                      <span className={`text-xs font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className="p-2">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{ad.articleName}</span>
                        <a
                          href={`https://land.naver.com/article/${ad.articleNo}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-primary"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink className="size-3" />
                        </a>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {ad.dong && `${ad.dong} `}{ad.floor && `${ad.floor}층`} · {ad.area}평
                      </div>
                    </td>
                    <td className="p-2 text-sm">{ad.buildingName}</td>
                    <td className="p-2 text-center">
                      <Badge variant="outline" className="text-xs">
                        {transactionLabels[ad.transactionType]}
                      </Badge>
                    </td>
                    <td className="p-2 text-right">
                      <span className="font-medium text-primary">{formatPrice(ad.price)}</span>
                      {ad.monthlyRent && (
                        <span className="text-muted-foreground text-xs block">
                          /{formatPrice(ad.monthlyRent)}
                        </span>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <TrendingUp className="size-3 text-muted-foreground" />
                        <span className={`text-xs font-medium ${ad.rank && ad.rank <= 10 ? 'text-green-600' : ad.rank && ad.rank <= 20 ? 'text-blue-600' : 'text-muted-foreground'}`}>
                          {ad.rank || '-'}/{ad.totalAdsInArea || '-'}
                        </span>
                      </div>
                    </td>
                    <td className="p-2">
                      {ad.matchedPropertyId ? (
                        <div className="flex items-center gap-1">
                          <Link2 className="size-3 text-green-600" />
                          <span className="text-xs text-green-600 font-medium">
                            {getPropertyName(ad.matchedPropertyId)}
                          </span>
                        </div>
                      ) : suggestions.length > 0 ? (
                        <div className="flex items-center gap-1">
                          <AlertCircle className="size-3 text-amber-600" />
                          <span className="text-xs text-amber-600">
                            {suggestions.length}개 제안
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">미매칭</span>
                      )}
                    </td>
                    <td className="p-2 text-center">
                      {ad.matchedPropertyId ? (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onUnlinkAd(ad.id)}
                          disabled={isUnlinking}
                          title="연결 해제"
                        >
                          <Unlink className="size-4 text-red-600" />
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setSelectedNaverAd(ad)}
                          title="매물 연결"
                        >
                          <Link2 className="size-4" />
                        </Button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* 네이버 광고 매물 연결 모달 */}
      <Dialog open={!!selectedNaverAd} onOpenChange={(open) => !open && setSelectedNaverAd(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="size-5" />
              매물 연결
            </DialogTitle>
          </DialogHeader>
          {selectedNaverAd && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <div className="text-sm font-medium">{selectedNaverAd.articleName}</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {selectedNaverAd.buildingName} · {transactionLabels[selectedNaverAd.transactionType]} · {formatPrice(selectedNaverAd.price)}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">연결할 매물 선택</label>
                <div className="max-h-[300px] overflow-y-auto space-y-1">
                  {properties
                    .filter((p) => !p.isHidden && p.status === 'available')
                    .map((property) => (
                      <button
                        key={property.id}
                        className="w-full p-2 text-left rounded border hover:bg-muted transition-colors flex items-center justify-between"
                        onClick={() => onLinkAd(selectedNaverAd.id, property.id)}
                        disabled={isLinking}
                      >
                        <div>
                          <div className="text-sm font-medium">
                            {(() => {
                              const pf = property as unknown as PropertyFull
                              return `${pf.buildingName || ''} ${pf.dongName || ''} ${pf.unitName || ''}`.trim() || '매물'
                            })()}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {transactionLabels[property.transactionType]} · {formatPrice(property.price)}
                          </div>
                        </div>
                        <Check className="size-4 text-muted-foreground" />
                      </button>
                    ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
