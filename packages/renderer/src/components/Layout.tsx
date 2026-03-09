import { useState, useMemo } from 'react'
import { Link, useRouterState } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { usersApi } from '@/api'
import {
  CalendarDays,
  Building2,
  FileText,
  FileSignature,
  Home,
  Network,
  Settings,
  Search,
  MapPin,
  Link2,
  ChevronLeft,
  ChevronRight,
  Users,
  BarChart3,
  Calculator,
  Map,
  Sparkles,
  ListTodo,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Button } from './ui/button'

interface LayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: '대시보드', href: '/', icon: Home },
  { name: 'AI 검색', href: '/ai-search', icon: Sparkles },
  { name: '업무 관리', href: '/tasks', icon: ListTodo },
  { name: '매물 관리', href: '/properties', icon: Building2 },
  { name: '구매고객 관리', href: '/buyers', icon: Search },
  { name: '잠재고객 관리', href: '/customers', icon: MapPin },
  { name: '매칭 관리', href: '/matches', icon: Link2 },
  { name: '거래 관리', href: '/deals', icon: FileText },
  { name: '계약서 관리', href: '/contracts', icon: FileSignature },
  { name: '일정 관리', href: '/calendar', icon: CalendarDays },
  { name: '네트워크 그룹', href: '/network', icon: Network },
  { name: '부동산 계산기', href: '/calculator', icon: Calculator },
  { name: '지도 테스트', href: '/map-test', icon: Map },
  { name: '설정', href: '/settings', icon: Settings },
  { name: '거래 실적', href: '/performance', icon: BarChart3, adminOnly: true },
  { name: '직원 활동 관리', href: '/staff', icon: Users, adminOnly: true },
]

export function Layout({ children }: LayoutProps) {
  const router = useRouterState()
  const currentPath = router.location.pathname
  const [collapsed, setCollapsed] = useState(false)

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: usersApi.getCurrent,
  })

  const isManager = currentUser?.role === 'manager'

  // 관리자가 아니면 adminOnly 메뉴 필터링
  const filteredNavigation = useMemo(() => {
    return navigation.filter((item) => !item.adminOnly || isManager)
  }, [isManager])

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside
        className={cn(
          'border-r bg-card flex flex-col transition-all duration-300 ease-in-out',
          collapsed ? 'w-16' : 'w-64',
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center border-b px-4">
          <div
            className={cn(
              'flex items-center',
              collapsed ? 'justify-center w-full' : 'px-2',
            )}
          >
            <Building2 className="size-6 text-primary flex-shrink-0" />
            {!collapsed && (
              <span className="font-bold text-lg ml-2 whitespace-nowrap">
                Estate CRM
              </span>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto overflow-x-hidden">
          {filteredNavigation.map((item) => {
            const isActive = currentPath === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                title={collapsed ? item.name : undefined}
                className={cn(
                  'flex items-center rounded-md text-sm font-medium transition-colors',
                  collapsed
                    ? 'justify-center px-2 py-2.5'
                    : 'gap-3 px-3 py-2',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
                )}
              >
                {item.icon && <item.icon className="size-5 flex-shrink-0" />}
                {!collapsed && (
                  <span className="whitespace-nowrap">{item.name}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Collapse Button */}
        <div className="p-2 border-t">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'w-full flex items-center justify-center',
              collapsed ? 'px-2' : 'px-3',
            )}
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <>
                <ChevronLeft className="size-4 mr-2" />
                <span className="text-xs">접기</span>
              </>
            )}
          </Button>
        </div>

        {/* User Profile */}
        <div className={cn('p-4 border-t', collapsed && 'p-2')}>
          <div
            className={cn(
              'flex items-center',
              collapsed ? 'justify-center' : 'gap-3',
            )}
          >
            <Avatar className={collapsed ? 'size-8' : undefined}>
              <AvatarImage src="https://github.com/shadcn.png" />
              <AvatarFallback>관</AvatarFallback>
            </Avatar>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">관리자</p>
                  <p className="text-xs text-muted-foreground truncate">
                    admin@estate.com
                  </p>
                </div>
                <Button variant="ghost" size="icon-sm">
                  <Settings className="size-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto p-6">
        {children}
      </main>
    </div>
  )
}
