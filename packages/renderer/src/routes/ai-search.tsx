import { createRoute } from '@tanstack/react-router'
import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Sparkles,
  Search,
  Building2,
  User,
  Loader2,
  Crown,
  Coins,
  ExternalLink,
  Download,
  Check,
  Users,
  Zap,
  AlertCircle,
} from 'lucide-react'
import type { RootRoute } from '@tanstack/react-router'
import { aiSearchApi, buyerRequirementsApi, contactsApi, officeApi } from '@/api'
import type { AISearchResult, BuyerRequirement } from '@/types'

function AISearchPage() {
  const queryClient = useQueryClient()
  const [query, setQuery] = useState('')
  const [includeNaverSearch, setIncludeNaverSearch] = useState(true)
  const [searchResults, setSearchResults] = useState<AISearchResult[]>([])
  const [hasSearched, setHasSearched] = useState(false)
  const [showAutoMatchDialog, setShowAutoMatchDialog] = useState(false)
  const [selectedBuyerReq, setSelectedBuyerReq] = useState<BuyerRequirement | null>(null)

  // 프리미엄 확인
  const { data: isPremium = false } = useQuery({
    queryKey: ['office', 'isPremium'],
    queryFn: officeApi.isPremium,
  })

  // 토큰 쿼터 조회
  const { data: quota } = useQuery({
    queryKey: ['aiSearch', 'quota'],
    queryFn: () => aiSearchApi.getQuota('current-user'),
    enabled: isPremium,
  })

  // 등록된 단지 목록
  const { data: complexes = [] } = useQuery({
    queryKey: ['aiSearch', 'complexes'],
    queryFn: aiSearchApi.getRegisteredComplexes,
    enabled: isPremium,
  })

  // 구매고객 요구사항 목록
  const { data: buyerRequirements = [] } = useQuery({
    queryKey: ['buyerRequirements'],
    queryFn: buyerRequirementsApi.getAll,
    enabled: isPremium,
  })

  // 연락처 목록 (고객 이름 표시용)
  const { data: contacts = [] } = useQuery({
    queryKey: ['contacts'],
    queryFn: contactsApi.getAll,
  })

  // 검색 뮤테이션
  const searchMutation = useMutation({
    mutationFn: aiSearchApi.search,
    onSuccess: (data) => {
      setSearchResults(data.results)
      setHasSearched(true)
      queryClient.invalidateQueries({ queryKey: ['aiSearch', 'quota'] })
    },
  })

  // 자동 매칭 검색 뮤테이션
  const autoMatchMutation = useMutation({
    mutationFn: aiSearchApi.autoMatchSearch,
    onSuccess: (data) => {
      setSearchResults(data.results)
      setHasSearched(true)
      setShowAutoMatchDialog(false)
      setSelectedBuyerReq(null)
      queryClient.invalidateQueries({ queryKey: ['aiSearch', 'quota'] })
    },
  })

  // 결과 저장 뮤테이션
  const saveMutation = useMutation({
    mutationFn: aiSearchApi.saveResult,
    onSuccess: (savedResult) => {
      setSearchResults((prev) =>
        prev.map((r) => (r.id === savedResult.id ? savedResult : r))
      )
    },
  })

  const handleSearch = () => {
    if (!query.trim() || !isPremium) return

    searchMutation.mutate({
      query,
      includeNaverSearch,
      userId: 'current-user',
    })
  }

  const handleAutoMatch = (buyerReq: BuyerRequirement) => {
    setSelectedBuyerReq(buyerReq)
    setShowAutoMatchDialog(true)
  }

  const confirmAutoMatch = () => {
    if (!selectedBuyerReq) return

    autoMatchMutation.mutate({
      buyerReqId: selectedBuyerReq.id,
      userId: 'current-user',
    })
  }

  const getContactName = (contactId: string) => {
    return contacts.find((c) => c.id === contactId)?.name || '이름 없음'
  }

  const formatPrice = (price: number) => {
    if (price >= 10000) {
      const uk = Math.floor(price / 10000)
      const man = price % 10000
      return man > 0 ? `${uk}억 ${man}만` : `${uk}억`
    }
    return `${price}만`
  }

  const transactionLabels: Record<string, string> = {
    sale: '매매',
    lease: '전세',
    monthly: '월세',
  }

  // 비프리미엄 사용자 화면
  if (!isPremium) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Sparkles className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI 검색</h1>
            <p className="text-muted-foreground">프리미엄 기능</p>
          </div>
        </div>

        <Card className="border-amber-200 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <Crown className="size-12 text-amber-500" />
              <div>
                <h2 className="text-xl font-bold mb-2">프리미엄 전용 기능입니다</h2>
                <p className="text-muted-foreground mb-4">
                  AI 검색은 프리미엄 구독자만 사용할 수 있습니다.
                  프리미엄 구독을 통해 네이버 부동산 매물을 자동으로 검색하고,
                  고객 요구사항에 맞는 매물을 찾아보세요.
                </p>
                <ul className="space-y-2 mb-4">
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="size-4 text-green-500" />
                    네이버 부동산 매물 자동 검색
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="size-4 text-green-500" />
                    고객 요구사항 기반 자동 매칭
                  </li>
                  <li className="flex items-center gap-2 text-sm">
                    <Check className="size-4 text-green-500" />
                    월 100회 검색 토큰 제공
                  </li>
                </ul>
                <Button className="bg-gradient-to-r from-amber-500 to-orange-500">
                  <Crown className="size-4 mr-2" />
                  프리미엄 구독하기
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg">
            <Sparkles className="size-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">AI 검색</h1>
            <p className="text-muted-foreground">네이버 부동산 매물을 자동으로 검색합니다</p>
          </div>
        </div>

        {/* 토큰 현황 */}
        {quota && (
          <Card className="px-4 py-2">
            <div className="flex items-center gap-3">
              <Coins className="size-5 text-amber-500" />
              <div>
                <div className="text-sm text-muted-foreground">이번 달 검색 토큰</div>
                <div className="font-bold">
                  <span className="text-primary">{quota.remainingTokens}</span>
                  <span className="text-muted-foreground font-normal"> / {quota.totalTokens}</span>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* 등록된 단지 현황 */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Building2 className="size-4" />
                등록된 주요 단지
              </CardTitle>
              <CardDescription>네이버 검색 대상 단지 (최소 5개 필요)</CardDescription>
            </div>
            <Badge variant={complexes.length >= 5 ? 'default' : 'destructive'}>
              {complexes.length}개 등록
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {complexes.map((complex) => (
              <Badge key={complex.id} variant="secondary" className="py-1">
                {complex.name}
              </Badge>
            ))}
            {complexes.length < 5 && (
              <Badge variant="outline" className="py-1 border-dashed text-muted-foreground">
                + {5 - complexes.length}개 더 등록 필요
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 검색 입력 */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
                <Input
                  placeholder="예: 강남역 근처 30평대 전세 5억 이하"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  className="pl-10 h-12 text-lg"
                  disabled={complexes.length < 5}
                />
              </div>
              <Button
                onClick={handleSearch}
                disabled={searchMutation.isPending || !query.trim() || complexes.length < 5}
                className="h-12 px-6 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {searchMutation.isPending ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <>
                    <Sparkles className="size-5 mr-2" />
                    검색
                  </>
                )}
              </Button>
            </div>

            {/* 네이버 검색 토글 */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <ExternalLink className="size-4 text-green-600" />
                </div>
                <div>
                  <Label htmlFor="naver-search" className="font-medium">
                    네이버 매물과 함께 검색
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    등록된 단지의 네이버 부동산 매물을 함께 검색합니다 (토큰 2개 사용)
                  </p>
                </div>
              </div>
              <Switch
                id="naver-search"
                checked={includeNaverSearch}
                onCheckedChange={setIncludeNaverSearch}
              />
            </div>

            {complexes.length < 5 && (
              <div className="flex items-center gap-2 text-sm text-orange-600">
                <AlertCircle className="size-4" />
                검색을 사용하려면 최소 5개의 주요 단지를 등록해야 합니다.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 고객 자동 매칭 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="size-4" />
            고객 맞춤 자동 검색
          </CardTitle>
          <CardDescription>
            구매고객의 요구사항에 맞는 매물을 네이버에서 자동으로 찾습니다 (토큰 3개 사용)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {buyerRequirements.length > 0 ? (
            <div className="space-y-2">
              {buyerRequirements.slice(0, 5).map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <User className="size-4 text-blue-600" />
                    </div>
                    <div>
                      <div className="font-medium">{getContactName(req.contactId)}</div>
                      <div className="text-sm text-muted-foreground">
                        {transactionLabels[req.transactionType]} ·{' '}
                        {formatPrice(req.budgetMin || 0)} ~ {formatPrice(req.budgetMax || 0)} ·{' '}
                        {req.areaMin}~{req.areaMax}평
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAutoMatch(req)}
                    disabled={autoMatchMutation.isPending || complexes.length < 5}
                  >
                    <Zap className="size-4 mr-1" />
                    매물 찾기
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              등록된 구매고객이 없습니다
            </div>
          )}
        </CardContent>
      </Card>

      {/* 검색 결과 */}
      {hasSearched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold flex items-center gap-2">
              <Search className="size-4" />
              검색 결과
              <span className="text-muted-foreground font-normal">({searchResults.length}건)</span>
            </h2>
          </div>

          {searchResults.length > 0 ? (
            <div className="grid gap-3">
              {searchResults.map((result) => (
                <Card key={result.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Building2 className="size-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{result.articleName}</span>
                            <Badge variant="outline" className="text-xs">
                              {transactionLabels[result.transactionType]}
                            </Badge>
                            {result.matchScore && result.matchScore >= 80 && (
                              <Badge className="text-xs bg-green-500">
                                매칭 {result.matchScore}%
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {result.complexName} · {result.area}㎡ · {result.floor}층 · {result.direction}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-lg font-bold text-primary">
                              {formatPrice(result.price)}
                            </span>
                            {result.monthlyRent && (
                              <span className="text-muted-foreground">
                                / {result.monthlyRent}만
                              </span>
                            )}
                          </div>
                          {result.matchReasons && result.matchReasons.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {result.matchReasons.map((reason) => (
                                <Badge key={reason} variant="secondary" className="text-xs">
                                  {reason}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => window.open(`https://land.naver.com/article/${result.naverArticleNo}`, '_blank')}
                        >
                          <ExternalLink className="size-4 mr-1" />
                          네이버
                        </Button>
                        {result.isSaved ? (
                          <Button variant="secondary" size="sm" disabled>
                            <Check className="size-4 mr-1" />
                            저장됨
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => saveMutation.mutate(result.id)}
                            disabled={saveMutation.isPending}
                          >
                            <Download className="size-4 mr-1" />
                            저장
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <Search className="size-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-medium mb-1">검색 결과가 없습니다</h3>
                <p className="text-sm text-muted-foreground">
                  다른 검색어로 시도해보세요
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 기능 안내 (검색 전) */}
      {!hasSearched && (
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Search className="size-5 text-purple-500" />
                자연어 검색
              </CardTitle>
              <CardDescription>
                "강남역 30평 전세 5억" 처럼 자연어로 검색하세요
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <ExternalLink className="size-5 text-green-500" />
                네이버 연동
              </CardTitle>
              <CardDescription>
                등록된 단지의 네이버 부동산 매물을 자동 검색
              </CardDescription>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Users className="size-5 text-blue-500" />
                고객 매칭
              </CardTitle>
              <CardDescription>
                고객 요구사항에 맞는 매물을 자동으로 찾아줍니다
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      )}

      {/* 자동 매칭 확인 다이얼로그 */}
      <Dialog open={showAutoMatchDialog} onOpenChange={setShowAutoMatchDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="size-5 text-amber-500" />
              고객 맞춤 매물 검색
            </DialogTitle>
            <DialogDescription>
              이 고객의 요구사항에 맞는 매물을 네이버에서 검색합니다.
            </DialogDescription>
          </DialogHeader>

          {selectedBuyerReq && (
            <div className="p-4 bg-muted rounded-lg space-y-2">
              <div className="font-medium">{getContactName(selectedBuyerReq.contactId)}</div>
              <div className="text-sm text-muted-foreground space-y-1">
                <div>거래유형: {transactionLabels[selectedBuyerReq.transactionType]}</div>
                <div>예산: {formatPrice(selectedBuyerReq.budgetMin || 0)} ~ {formatPrice(selectedBuyerReq.budgetMax || 0)}</div>
                <div>면적: {selectedBuyerReq.areaMin}~{selectedBuyerReq.areaMax}평</div>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Coins className="size-4 text-amber-500" />
            이 검색은 토큰 3개를 사용합니다.
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAutoMatchDialog(false)}>
              취소
            </Button>
            <Button
              onClick={confirmAutoMatch}
              disabled={autoMatchMutation.isPending}
              className="bg-gradient-to-r from-purple-500 to-pink-500"
            >
              {autoMatchMutation.isPending ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="size-4 mr-2" />
              )}
              검색 시작
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function AISearchRoute(parentRoute: RootRoute) {
  return createRoute({
    path: '/ai-search',
    component: AISearchPage,
    getParentRoute: () => parentRoute,
  })
}
