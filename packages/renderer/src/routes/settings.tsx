import { createRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Settings,
  User,
  Palette,
  Database,
  Download,
  Upload,
  Save,
  Moon,
  Sun,
  Trash2,
  CheckCircle,
  Crown,
  Sparkles,
  BarChart3,
  Link2,
  ExternalLink,
  Check,
  X,
  Loader2,
} from 'lucide-react'
import type { RootRoute } from '@tanstack/react-router'
import { usersApi, officeApi } from '@/api'
import type { SubscriptionPlan } from '@/types'

type SettingsTab = 'profile' | 'subscription' | 'theme' | 'data'

// 플랜별 기능 정의
const planFeatures = {
  free: {
    name: '무료',
    price: '0원',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    features: [
      { name: '매물 관리', included: true },
      { name: '고객 관리', included: true },
      { name: '매칭 관리', included: true },
      { name: '거래/계약 관리', included: true },
      { name: '일정 관리', included: true },
      { name: '네이버 광고 매칭', included: false },
      { name: '광고 분석', included: false },
      { name: 'AI 검색', included: false },
    ],
  },
  deluxe: {
    name: '디럭스',
    price: '29,000원/월',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    features: [
      { name: '매물 관리', included: true },
      { name: '고객 관리', included: true },
      { name: '매칭 관리', included: true },
      { name: '거래/계약 관리', included: true },
      { name: '일정 관리', included: true },
      { name: '네이버 광고 매칭', included: true },
      { name: '광고 분석', included: true },
      { name: 'AI 검색', included: false },
    ],
  },
  premium: {
    name: '프리미엄',
    price: '49,000원/월',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    features: [
      { name: '매물 관리', included: true },
      { name: '고객 관리', included: true },
      { name: '매칭 관리', included: true },
      { name: '거래/계약 관리', included: true },
      { name: '일정 관리', included: true },
      { name: '네이버 광고 매칭', included: true },
      { name: '광고 분석', included: true },
      { name: 'AI 검색 (월 100회)', included: true },
    ],
  },
}

function SettingsPage() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [showNaverDialog, setShowNaverDialog] = useState(false)
  const [naverId, setNaverId] = useState('')

  // 프로필 상태
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    phone: '',
    avatar: '',
  })

  // 테마 상태
  const [darkMode, setDarkMode] = useState(false)

  // 사무소 정보 조회
  const { data: office } = useQuery({
    queryKey: ['office'],
    queryFn: officeApi.getCurrent,
  })

  // 플랜 변경 뮤테이션
  const updatePlanMutation = useMutation({
    mutationFn: officeApi.updatePlan,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office'] })
    },
  })

  // 네이버 계정 연동 뮤테이션
  const connectNaverMutation = useMutation({
    mutationFn: officeApi.connectNaverAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office'] })
      setShowNaverDialog(false)
      setNaverId('')
    },
  })

  // 네이버 계정 연동 해제 뮤테이션
  const disconnectNaverMutation = useMutation({
    mutationFn: officeApi.disconnectNaverAccount,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['office'] })
    },
  })

  // 현재 사용자 로드
  useEffect(() => {
    const loadUser = async () => {
      const user = await usersApi.getCurrent()
      setProfile({
        name: user.name,
        email: user.email,
        phone: user.phone,
        avatar: user.avatar || '',
      })
    }
    loadUser()

    // 테마 설정 로드
    const savedTheme = localStorage.getItem('theme')
    if (savedTheme === 'dark') {
      setDarkMode(true)
      document.documentElement.classList.add('dark')
    }
  }, [])

  // 프로필 저장
  const handleSaveProfile = async () => {
    setSaveStatus('saving')
    await new Promise((resolve) => setTimeout(resolve, 500))
    setSaveStatus('saved')
    setTimeout(() => setSaveStatus('idle'), 2000)
  }

  // 테마 토글
  const handleThemeToggle = (checked: boolean) => {
    setDarkMode(checked)
    if (checked) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  // 데이터 내보내기
  const handleExportData = () => {
    const data = {
      exportDate: new Date().toISOString(),
      contacts: [],
      properties: [],
      matches: [],
      deals: [],
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `estate-crm-backup-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // 데이터 가져오기
  const handleImportData = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const text = await file.text()
        try {
          JSON.parse(text)
          alert('데이터를 성공적으로 가져왔습니다.')
        } catch {
          alert('잘못된 파일 형식입니다.')
        }
      }
    }
    input.click()
  }

  const handleConnectNaver = () => {
    if (!naverId.trim()) return
    connectNaverMutation.mutate(naverId)
  }

  const tabs = [
    { id: 'profile' as const, label: '프로필', icon: User },
    { id: 'subscription' as const, label: '구독 관리', icon: Crown },
    { id: 'theme' as const, label: '테마', icon: Palette },
    { id: 'data' as const, label: '데이터 관리', icon: Database },
  ]

  const currentPlan = office?.plan || 'free'
  const currentPlanInfo = planFeatures[currentPlan]

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <Settings className="size-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">설정</h1>
          <p className="text-muted-foreground">애플리케이션 설정을 관리합니다</p>
        </div>
      </div>

      <div className="flex gap-6">
        {/* 사이드 탭 */}
        <Card className="w-56 h-fit">
          <CardContent className="p-2">
            <div className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted'
                  }`}
                >
                  <tab.icon className="size-4" />
                  <span className="text-sm font-medium">{tab.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 설정 내용 */}
        <div className="flex-1">
          {/* 프로필 설정 */}
          {activeTab === 'profile' && (
            <Card>
              <CardHeader>
                <CardTitle>프로필 설정</CardTitle>
                <CardDescription>개인 정보를 수정합니다</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center gap-4">
                  <Avatar className="size-20">
                    <AvatarImage src={profile.avatar} />
                    <AvatarFallback className="text-2xl">
                      {profile.name.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <Button variant="outline" size="sm">
                      사진 변경
                    </Button>
                    <p className="text-xs text-muted-foreground mt-1">
                      JPG, PNG 파일 (최대 2MB)
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="name">이름</Label>
                  <Input
                    id="name"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    placeholder="이름을 입력하세요"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    placeholder="이메일을 입력하세요"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">연락처</Label>
                  <Input
                    id="phone"
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    placeholder="010-0000-0000"
                  />
                </div>

                <Separator />

                <div className="flex justify-end">
                  <Button onClick={handleSaveProfile} disabled={saveStatus === 'saving'}>
                    {saveStatus === 'saving' ? (
                      '저장 중...'
                    ) : saveStatus === 'saved' ? (
                      <>
                        <CheckCircle className="size-4 mr-2" />
                        저장됨
                      </>
                    ) : (
                      <>
                        <Save className="size-4 mr-2" />
                        저장
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 구독 관리 */}
          {activeTab === 'subscription' && (
            <div className="space-y-4">
              {/* 현재 구독 상태 */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>현재 구독</CardTitle>
                      <CardDescription>현재 이용 중인 플랜 정보</CardDescription>
                    </div>
                    <Badge className={`${currentPlanInfo.bgColor} ${currentPlanInfo.color} text-sm px-3 py-1`}>
                      {currentPlanInfo.name}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                    <div>
                      <div className="font-semibold text-lg">{currentPlanInfo.name} 플랜</div>
                      <div className="text-muted-foreground">{currentPlanInfo.price}</div>
                      {office?.planExpiresAt && currentPlan !== 'free' && (
                        <div className="text-sm text-muted-foreground mt-1">
                          만료일: {new Date(office.planExpiresAt).toLocaleDateString('ko-KR')}
                        </div>
                      )}
                    </div>
                    {currentPlan !== 'free' && (
                      <Button variant="outline" size="sm">
                        결제 관리
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* 네이버 계정 연동 (디럭스 이상) */}
              {(currentPlan === 'deluxe' || currentPlan === 'premium') && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <ExternalLink className="size-5" />
                      네이버 부동산 연동
                    </CardTitle>
                    <CardDescription>
                      네이버 부동산 계정을 연동하여 광고 매칭 및 분석 기능을 사용하세요
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {office?.naverAccount?.isConnected ? (
                      <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-950/20 rounded-lg border border-green-200">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-green-100 rounded-full">
                            <Check className="size-5 text-green-600" />
                          </div>
                          <div>
                            <div className="font-medium">연동됨</div>
                            <div className="text-sm text-muted-foreground">
                              네이버 ID: {office.naverAccount.naverId}
                            </div>
                            {office.naverAccount.lastSyncAt && (
                              <div className="text-xs text-muted-foreground">
                                마지막 동기화: {new Date(office.naverAccount.lastSyncAt).toLocaleString('ko-KR')}
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => disconnectNaverMutation.mutate()}
                          disabled={disconnectNaverMutation.isPending}
                        >
                          연동 해제
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-gray-200 rounded-full">
                            <Link2 className="size-5 text-gray-500" />
                          </div>
                          <div>
                            <div className="font-medium">연동되지 않음</div>
                            <div className="text-sm text-muted-foreground">
                              네이버 부동산 계정을 연동하세요
                            </div>
                          </div>
                        </div>
                        <Button onClick={() => setShowNaverDialog(true)}>
                          연동하기
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* 플랜 비교 */}
              <Card>
                <CardHeader>
                  <CardTitle>플랜 비교</CardTitle>
                  <CardDescription>필요에 맞는 플랜을 선택하세요</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4">
                    {(Object.entries(planFeatures) as [SubscriptionPlan, typeof planFeatures.free][]).map(([planKey, plan]) => (
                      <div
                        key={planKey}
                        className={`p-4 rounded-lg border-2 ${
                          currentPlan === planKey
                            ? 'border-primary bg-primary/5'
                            : 'border-muted hover:border-muted-foreground/30'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {planKey === 'premium' && <Sparkles className="size-4 text-purple-500" />}
                            {planKey === 'deluxe' && <BarChart3 className="size-4 text-blue-500" />}
                            <span className={`font-bold ${plan.color}`}>{plan.name}</span>
                          </div>
                          {currentPlan === planKey && (
                            <Badge variant="secondary" className="text-xs">현재</Badge>
                          )}
                        </div>
                        <div className="text-lg font-bold mb-4">{plan.price}</div>
                        <div className="space-y-2">
                          {plan.features.map((feature) => (
                            <div key={feature.name} className="flex items-center gap-2 text-sm">
                              {feature.included ? (
                                <Check className="size-4 text-green-500" />
                              ) : (
                                <X className="size-4 text-gray-300" />
                              )}
                              <span className={feature.included ? '' : 'text-muted-foreground'}>
                                {feature.name}
                              </span>
                            </div>
                          ))}
                        </div>
                        {currentPlan !== planKey && (
                          <Button
                            className="w-full mt-4"
                            variant={planKey === 'premium' ? 'default' : 'outline'}
                            onClick={() => updatePlanMutation.mutate(planKey)}
                            disabled={updatePlanMutation.isPending}
                          >
                            {updatePlanMutation.isPending ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : planKey === 'free' ? (
                              '무료로 전환'
                            ) : (
                              '업그레이드'
                            )}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 테마 설정 */}
          {activeTab === 'theme' && (
            <Card>
              <CardHeader>
                <CardTitle>테마 설정</CardTitle>
                <CardDescription>애플리케이션 외관을 설정합니다</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {darkMode ? (
                      <Moon className="size-5 text-primary" />
                    ) : (
                      <Sun className="size-5 text-amber-500" />
                    )}
                    <div>
                      <p className="font-medium">다크 모드</p>
                      <p className="text-sm text-muted-foreground">
                        어두운 테마를 사용합니다
                      </p>
                    </div>
                  </div>
                  <Switch checked={darkMode} onCheckedChange={handleThemeToggle} />
                </div>

                <Separator />

                <div>
                  <p className="font-medium mb-3">미리보기</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        !darkMode ? 'border-primary bg-white' : 'border-muted bg-white'
                      }`}
                      onClick={() => handleThemeToggle(false)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Sun className="size-4" />
                        <span className="text-sm font-medium text-black">라이트</span>
                      </div>
                      <div className="space-y-1">
                        <div className="h-2 bg-gray-200 rounded w-full" />
                        <div className="h-2 bg-gray-200 rounded w-3/4" />
                        <div className="h-2 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                    <div
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        darkMode ? 'border-primary bg-gray-900' : 'border-muted bg-gray-900'
                      }`}
                      onClick={() => handleThemeToggle(true)}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <Moon className="size-4 text-white" />
                        <span className="text-sm font-medium text-white">다크</span>
                      </div>
                      <div className="space-y-1">
                        <div className="h-2 bg-gray-700 rounded w-full" />
                        <div className="h-2 bg-gray-700 rounded w-3/4" />
                        <div className="h-2 bg-gray-700 rounded w-1/2" />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 데이터 관리 */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>데이터 백업</CardTitle>
                  <CardDescription>
                    모든 데이터를 JSON 파일로 내보내거나 복원합니다
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-3">
                    <Button onClick={handleExportData} variant="outline" className="flex-1">
                      <Download className="size-4 mr-2" />
                      데이터 내보내기
                    </Button>
                    <Button onClick={handleImportData} variant="outline" className="flex-1">
                      <Upload className="size-4 mr-2" />
                      데이터 가져오기
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    내보내기: 연락처, 매물, 매칭, 거래 등 모든 데이터가 포함됩니다.
                    <br />
                    가져오기: 기존 데이터를 덮어씁니다. 주의해서 사용하세요.
                  </p>
                </CardContent>
              </Card>

              <Card className="border-destructive/50">
                <CardHeader>
                  <CardTitle className="text-destructive">위험 구역</CardTitle>
                  <CardDescription>
                    이 작업은 되돌릴 수 없습니다
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="destructive">
                    <Trash2 className="size-4 mr-2" />
                    모든 데이터 삭제
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>

      {/* 네이버 계정 연동 다이얼로그 */}
      <Dialog open={showNaverDialog} onOpenChange={setShowNaverDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ExternalLink className="size-5" />
              네이버 부동산 계정 연동
            </DialogTitle>
            <DialogDescription>
              네이버 부동산에서 사용하는 아이디를 입력하세요.
              광고 매칭 및 분석 기능에 사용됩니다.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="naver-id">네이버 아이디</Label>
              <Input
                id="naver-id"
                value={naverId}
                onChange={(e) => setNaverId(e.target.value)}
                placeholder="네이버 아이디를 입력하세요"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              입력하신 아이디는 네이버 부동산 광고 정보 조회에만 사용됩니다.
            </p>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNaverDialog(false)}>
              취소
            </Button>
            <Button
              onClick={handleConnectNaver}
              disabled={!naverId.trim() || connectNaverMutation.isPending}
            >
              {connectNaverMutation.isPending ? (
                <Loader2 className="size-4 animate-spin mr-2" />
              ) : (
                <Link2 className="size-4 mr-2" />
              )}
              연동하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function SettingsRoute(parentRoute: RootRoute) {
  return createRoute({
    path: '/settings',
    component: SettingsPage,
    getParentRoute: () => parentRoute,
  })
}
