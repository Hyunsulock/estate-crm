import { useState } from 'react'
import { createRoute } from '@tanstack/react-router'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tasksApi, usersApi } from '@/api'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Checkbox } from '@/components/ui/checkbox'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { TableSkeleton } from '@/components/skeletons'
import { toast } from 'sonner'
import {
  Plus,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  MoreHorizontal,
  Trash2,
  Edit,
  ArrowRight,
  XCircle,
  Building2,
  Search,
  Link2,
  FileText,
  FileSignature,
  MessageSquare,
  MapPin,
  Settings,
  HelpCircle,
  List,
  LayoutGrid,
  Layers,
  ListOrdered,
  Megaphone,
  Phone,
  ClipboardList,
  Calendar,
  X,
  User,
} from 'lucide-react'
import { format, isToday, isTomorrow, isPast, formatDistanceToNow } from 'date-fns'
import { ko } from 'date-fns/locale'
import type { RootRoute } from '@tanstack/react-router'
import type { Task, TaskPriority, TaskStatus, TaskCategory, User as UserType } from '@/types'

// 우선순위 설정 - 노션 스타일 파스텔 색상
const priorityConfig: Record<TaskPriority, { label: string; color: string; icon: React.ReactNode }> = {
  urgent: { label: '긴급', color: 'bg-red-100 text-red-700', icon: <AlertCircle className="size-3" /> },
  high: { label: '높음', color: 'bg-orange-100 text-orange-700', icon: <Clock className="size-3" /> },
  medium: { label: '중간', color: 'bg-yellow-100 text-yellow-700', icon: <Circle className="size-3" /> },
  low: { label: '낮음', color: 'bg-gray-100 text-gray-600', icon: <Circle className="size-3" /> },
}

// 상태 설정
const statusConfig: Record<TaskStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: '대기', color: 'bg-gray-100 text-gray-700', icon: <Circle className="size-4" /> },
  in_progress: { label: '진행중', color: 'bg-blue-100 text-blue-700', icon: <Clock className="size-4" /> },
  completed: { label: '완료', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="size-4" /> },
  cancelled: { label: '취소', color: 'bg-red-100 text-red-700', icon: <XCircle className="size-4" /> },
}

// 카테고리 설정
const categoryConfig: Record<TaskCategory, { label: string; icon: React.ReactNode; color: string }> = {
  property: { label: '매물', icon: <Building2 className="size-3" />, color: 'bg-blue-100 text-blue-700' },
  buyer: { label: '구매고객', icon: <Search className="size-3" />, color: 'bg-green-100 text-green-700' },
  match: { label: '매칭', icon: <Link2 className="size-3" />, color: 'bg-purple-100 text-purple-700' },
  deal: { label: '거래', icon: <FileText className="size-3" />, color: 'bg-amber-100 text-amber-700' },
  contract: { label: '계약', icon: <FileSignature className="size-3" />, color: 'bg-indigo-100 text-indigo-700' },
  consultation: { label: '상담', icon: <MessageSquare className="size-3" />, color: 'bg-cyan-100 text-cyan-700' },
  viewing: { label: '방문', icon: <MapPin className="size-3" />, color: 'bg-rose-100 text-rose-700' },
  admin: { label: '관리', icon: <Settings className="size-3" />, color: 'bg-gray-100 text-gray-700' },
  other: { label: '기타', icon: <HelpCircle className="size-3" />, color: 'bg-slate-100 text-slate-700' },
  advertisement: { label: '광고작업', icon: <Megaphone className="size-3" />, color: 'bg-orange-100 text-orange-700' },
  call: { label: '전화작업', icon: <Phone className="size-3" />, color: 'bg-teal-100 text-teal-700' },
  document: { label: '서류작업', icon: <ClipboardList className="size-3" />, color: 'bg-yellow-100 text-yellow-700' },
  verify: { label: '확인작업', icon: <CheckCircle2 className="size-3" />, color: 'bg-emerald-100 text-emerald-700' },
}

// 뷰 타입: 타입별, 칸반, 전체, 상태별
type ViewMode = 'category' | 'board' | 'list' | 'status'

// 보드 뷰 컬럼 설정 - 노션 스타일
const boardColumns: { status: TaskStatus; title: string; dotColor: string; bgColor: string; columnBg: string }[] = [
  { status: 'pending', title: '플래닝', dotColor: 'bg-gray-400', bgColor: 'bg-gray-100 text-gray-700', columnBg: 'bg-gray-50' },
  { status: 'in_progress', title: '진행 중', dotColor: 'bg-amber-400', bgColor: 'bg-amber-100 text-amber-700', columnBg: 'bg-amber-50/50' },
  { status: 'completed', title: '완료', dotColor: 'bg-green-500', bgColor: 'bg-green-100 text-green-700', columnBg: 'bg-green-50/50' },
]

// 마감일 필터 옵션
type DueDateFilter = 'all' | 'overdue' | 'today' | 'week' | 'none'

function TasksPage() {
  const queryClient = useQueryClient()
  const [viewMode, setViewMode] = useState<ViewMode>('category')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  // 필터 상태
  const [statusFilter, setStatusFilter] = useState<TaskStatus | 'all'>('all')
  const [assigneeFilter, setAssigneeFilter] = useState<string | 'all'>('all')
  const [dueDateFilter, setDueDateFilter] = useState<DueDateFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<TaskCategory | 'all'>('all')
  const [showOnlyMyTasks, setShowOnlyMyTasks] = useState(false)

  // 선택 상태 (리스트 뷰용)
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set())

  // 데이터 조회
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: tasksApi.getAll,
  })

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: usersApi.getAll,
  })

  const { data: currentUser } = useQuery({
    queryKey: ['currentUser'],
    queryFn: usersApi.getCurrent,
  })

  // Mutations
  const createTaskMutation = useMutation({
    mutationFn: tasksApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setIsCreateModalOpen(false)
      toast.success('업무가 생성되었습니다')
    },
    onError: () => {
      toast.error('업무 생성에 실패했습니다')
    },
  })

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<Task> }) =>
      tasksApi.update(id, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      setEditingTask(null)
      toast.success('업무가 수정되었습니다')
    },
  })

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: TaskStatus }) =>
      tasksApi.update(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('상태가 변경되었습니다')
    },
  })

  const deleteTaskMutation = useMutation({
    mutationFn: tasksApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] })
      toast.success('업무가 삭제되었습니다')
    },
  })

  const getUserName = (userId: string) => {
    const user = users.find((u) => u.id === userId)
    return user?.name || '알 수 없음'
  }

  const formatDueDate = (date: Date | undefined) => {
    if (!date) return null
    const d = new Date(date)
    if (isToday(d)) return '오늘'
    if (isTomorrow(d)) return '내일'
    if (isPast(d)) return `${formatDistanceToNow(d, { locale: ko })} 지남`
    return format(d, 'M월 d일', { locale: ko })
  }

  const isDueSoon = (date: Date | undefined) => {
    if (!date) return false
    const d = new Date(date)
    return isToday(d) || isTomorrow(d)
  }

  const isOverdue = (task: Task) => {
    if (!task.dueDate || task.status === 'completed' || task.status === 'cancelled') return false
    return isPast(new Date(task.dueDate))
  }

  // 마감일 필터 체크
  const matchesDueDateFilter = (task: Task) => {
    if (dueDateFilter === 'all') return true
    if (dueDateFilter === 'none') return !task.dueDate
    if (!task.dueDate) return false

    const dueDate = new Date(task.dueDate)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (dueDateFilter === 'overdue') {
      return isPast(dueDate) && task.status !== 'completed' && task.status !== 'cancelled'
    }
    if (dueDateFilter === 'today') {
      return isToday(dueDate)
    }
    if (dueDateFilter === 'week') {
      const weekFromNow = new Date(today)
      weekFromNow.setDate(weekFromNow.getDate() + 7)
      return dueDate >= today && dueDate <= weekFromNow
    }
    return true
  }

  // 필터링된 tasks
  const filteredTasks = tasks.filter((task) => {
    // 취소된 업무는 기본적으로 숨김
    if (task.status === 'cancelled') return false

    // 내 작업만 보기
    if (showOnlyMyTasks && currentUser && task.assignedTo !== currentUser.id) return false

    // 상태 필터
    if (statusFilter !== 'all' && task.status !== statusFilter) return false

    // 담당자 필터
    if (assigneeFilter !== 'all' && task.assignedTo !== assigneeFilter) return false

    // 마감일 필터
    if (!matchesDueDateFilter(task)) return false

    // 카테고리 필터
    if (categoryFilter !== 'all' && task.category !== categoryFilter) return false

    return true
  })

  // 필터 초기화
  const resetFilters = () => {
    setStatusFilter('all')
    setAssigneeFilter('all')
    setDueDateFilter('all')
    setCategoryFilter('all')
    setShowOnlyMyTasks(false)
  }

  const hasActiveFilters = statusFilter !== 'all' || assigneeFilter !== 'all' || dueDateFilter !== 'all' || categoryFilter !== 'all' || showOnlyMyTasks

  // 선택 관련 함수들
  const toggleTaskSelection = (taskId: string) => {
    setSelectedTasks((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(taskId)) {
        newSet.delete(taskId)
      } else {
        newSet.add(taskId)
      }
      return newSet
    })
  }

  const toggleAllSelection = () => {
    if (selectedTasks.size === filteredTasks.length) {
      setSelectedTasks(new Set())
    } else {
      setSelectedTasks(new Set(filteredTasks.map((t) => t.id)))
    }
  }

  const clearSelection = () => {
    setSelectedTasks(new Set())
  }

  // 일괄 상태 변경
  const bulkUpdateStatus = async (status: TaskStatus) => {
    for (const taskId of selectedTasks) {
      await updateStatusMutation.mutateAsync({ id: taskId, status })
    }
    clearSelection()
    toast.success(`${selectedTasks.size}개 업무의 상태가 변경되었습니다`)
  }

  // 일괄 삭제
  const bulkDelete = async () => {
    for (const taskId of selectedTasks) {
      await deleteTaskMutation.mutateAsync(taskId)
    }
    clearSelection()
    toast.success(`${selectedTasks.size}개 업무가 삭제되었습니다`)
  }

  const hasSelection = selectedTasks.size > 0
  const isAllSelected = filteredTasks.length > 0 && selectedTasks.size === filteredTasks.length

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">업무 관리</h1>
          <p className="text-muted-foreground text-sm">
            할 일을 관리하고 팀원에게 업무를 할당하세요
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* View Switcher */}
          <div className="flex items-center gap-1 border rounded-lg p-1">
            <Button
              variant={viewMode === 'category' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('category')}
              className="gap-1.5"
            >
              <Layers className="size-4" />
              작업별
            </Button>
            <Button
              variant={viewMode === 'status' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('status')}
              className="gap-1.5"
            >
              <ListOrdered className="size-4" />
              상태별
            </Button>
            <Button
              variant={viewMode === 'board' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('board')}
              className="gap-1.5"
            >
              <LayoutGrid className="size-4" />
              보드
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="gap-1.5"
            >
              <List className="size-4" />
              전체
            </Button>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="size-4 mr-2" />
            업무 추가
          </Button>
        </div>
      </div>

      {/* 필터 바 - 노션 스타일 */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* 내 작업 토글 */}
        <div className="flex items-center gap-2 px-3 py-1.5 border rounded-md">
          <Switch
            id="my-tasks"
            checked={showOnlyMyTasks}
            onCheckedChange={setShowOnlyMyTasks}
            className="scale-75"
          />
          <label
            htmlFor="my-tasks"
            className="text-xs font-medium cursor-pointer select-none"
          >
            내 작업
          </label>
        </div>

        <div className="w-px h-6 bg-border" />

        {/* 상태 필터 */}
        <Select
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as TaskStatus | 'all')}
        >
          <SelectTrigger className="w-auto h-8 gap-1.5 text-xs border-dashed">
            <Circle className="size-3" />
            상태
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 상태</SelectItem>
            {Object.entries(statusConfig).map(([key, { label, icon }]) => (
              <SelectItem key={key} value={key}>
                <span className="flex items-center gap-2">
                  {icon}
                  {label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 담당자 필터 */}
        <Select
          value={assigneeFilter}
          onValueChange={(v) => setAssigneeFilter(v)}
        >
          <SelectTrigger className="w-auto h-8 gap-1.5 text-xs border-dashed">
            <User className="size-3" />
            담당자
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 담당자</SelectItem>
            {users.map((user) => (
              <SelectItem key={user.id} value={user.id}>
                <span className="flex items-center gap-2">
                  <Avatar className="size-4">
                    <AvatarFallback className="text-[8px]">{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  {user.name}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 마감일 필터 */}
        <Select
          value={dueDateFilter}
          onValueChange={(v) => setDueDateFilter(v as DueDateFilter)}
        >
          <SelectTrigger className="w-auto h-8 gap-1.5 text-xs border-dashed">
            <Calendar className="size-3" />
            마감일
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체</SelectItem>
            <SelectItem value="overdue">지연됨</SelectItem>
            <SelectItem value="today">오늘</SelectItem>
            <SelectItem value="week">이번 주</SelectItem>
            <SelectItem value="none">마감일 없음</SelectItem>
          </SelectContent>
        </Select>

        {/* 카테고리 필터 */}
        <Select
          value={categoryFilter}
          onValueChange={(v) => setCategoryFilter(v as TaskCategory | 'all')}
        >
          <SelectTrigger className="w-auto h-8 gap-1.5 text-xs border-dashed">
            <Layers className="size-3" />
            카테고리
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">전체 카테고리</SelectItem>
            {Object.entries(categoryConfig).map(([key, { label, icon }]) => (
              <SelectItem key={key} value={key}>
                <span className="flex items-center gap-2">
                  {icon}
                  {label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* + 필터 버튼 (추후 확장용) */}
        <Button variant="ghost" size="sm" className="h-8 gap-1.5 text-xs text-muted-foreground border-dashed border">
          <Plus className="size-3" />
          필터
        </Button>

        {/* 필터 초기화 */}
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={resetFilters}
            className="h-8 gap-1.5 text-xs text-muted-foreground"
          >
            <X className="size-3" />
            필터 초기화
          </Button>
        )}

        {/* 결과 개수 */}
        <span className="text-xs text-muted-foreground ml-auto">
          {filteredTasks.length}개 업무
        </span>
      </div>

      {/* 보드 뷰 - 노션 스타일 칸반 */}
      {viewMode === 'board' && (
        <div className="flex flex-col gap-4">
          {isLoading ? (
            <TableSkeleton columns={3} rows={3} />
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {boardColumns.map((column) => {
                const columnTasks = filteredTasks.filter((task) => task.status === column.status)

                return (
                  <div key={column.status} className="flex flex-col">
                    {/* 컬럼 헤더 - 노션 스타일 */}
                    <div className="flex items-center justify-between mb-3">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-sm font-medium ${column.bgColor}`}>
                        <span className={`size-2 rounded-full ${column.dotColor}`} />
                        {column.title}
                      </div>
                      <div className="flex items-center gap-0.5">
                        <Button variant="ghost" size="icon-sm" className="size-6 text-muted-foreground">
                          <MoreHorizontal className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          className="size-6 text-muted-foreground"
                          onClick={() => setIsCreateModalOpen(true)}
                        >
                          <Plus className="size-4" />
                        </Button>
                      </div>
                    </div>

                    {/* 태스크 카드 목록 - 배경 박스로 감싸기 */}
                    <div className={`rounded-xl p-3 ${column.columnBg}`}>
                      <div className="space-y-3">
                        {columnTasks.map((task) => (
                          <KanbanCard
                            key={task.id}
                            task={task}
                            onEdit={setEditingTask}
                            onStatusChange={(id: string, status: TaskStatus) => updateStatusMutation.mutate({ id, status })}
                            onDelete={(id: string) => deleteTaskMutation.mutate(id)}
                            isOverdue={isOverdue}
                            currentStatus={column.status}
                          />
                        ))}

                        {/* 새 프로젝트 추가 버튼 */}
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-muted-foreground hover:bg-white/50 h-auto py-2"
                          onClick={() => setIsCreateModalOpen(true)}
                        >
                          <Plus className="size-4 mr-2" />
                          새 프로젝트
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

      {/* 상태별 리스트 뷰 - 노션 스타일 */}
      {viewMode === 'status' && (
        <div>
          {isLoading ? (
            <TableSkeleton columns={7} rows={5} />
          ) : (
            boardColumns.filter(col => col.status !== 'cancelled').map((column) => {
              const columnTasks = filteredTasks.filter((task) => task.status === column.status)
              const completedInColumn = columnTasks.filter(t => t.status === 'completed').length

              return (
                <StatusTaskTable
                  key={column.status}
                  column={column}
                  tasks={columnTasks}
                  onRowClick={setEditingTask}
                  onEdit={setEditingTask}
                  onStatusChange={(id, status) => updateStatusMutation.mutate({ id, status })}
                  onDelete={(id) => deleteTaskMutation.mutate(id)}
                  getUserName={getUserName}
                  formatDueDate={formatDueDate}
                  isOverdue={isOverdue}
                  isDueSoon={isDueSoon}
                  completedCount={completedInColumn}
                  totalCount={columnTasks.length}
                />
              )
            })
          )}
        </div>
      )}

      {/* 카테고리별 리스트 뷰 - 노션 스타일 */}
      {viewMode === 'category' && (
        <div>
          {isLoading ? (
            <TableSkeleton columns={7} rows={5} />
          ) : (
            Object.entries(categoryConfig).map(([categoryKey, categoryData]) => {
              const categoryTasks = filteredTasks.filter((task) => task.category === categoryKey)

              if (categoryTasks.length === 0) return null

              return (
                <CategoryTaskTable
                  key={categoryKey}
                  categoryData={categoryData}
                  tasks={categoryTasks}
                  onRowClick={setEditingTask}
                  onEdit={setEditingTask}
                  onStatusChange={(id, status) => updateStatusMutation.mutate({ id, status })}
                  onDelete={(id) => deleteTaskMutation.mutate(id)}
                  getUserName={getUserName}
                  formatDueDate={formatDueDate}
                  isOverdue={isOverdue}
                  isDueSoon={isDueSoon}
                />
              )
            })
          )}
        </div>
      )}

      {/* 전체 리스트 뷰 - 노션 스타일 */}
      {viewMode === 'list' && (
        <div>
          {/* 일괄 작업 바 */}
          {hasSelection && (
            <div className="flex items-center gap-2 mb-3 p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <span className="text-sm font-medium text-blue-700">
                {selectedTasks.size}개 선택됨
              </span>
              <div className="flex items-center gap-1 ml-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => bulkUpdateStatus('in_progress')}
                >
                  <Clock className="size-3 mr-1" />
                  진행중
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => bulkUpdateStatus('completed')}
                >
                  <CheckCircle2 className="size-3 mr-1" />
                  완료
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={bulkDelete}
                >
                  <Trash2 className="size-3 mr-1" />
                  삭제
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={clearSelection}
                >
                  <X className="size-3 mr-1" />
                  선택 취소
                </Button>
              </div>
            </div>
          )}

          {isLoading ? (
            <TableSkeleton columns={8} rows={10} />
          ) : (
            <table className="w-full">
              <thead>
                <NotionTableHeader
                  showCategory={true}
                  showCheckbox={true}
                  isAllSelected={isAllSelected}
                  onToggleAll={toggleAllSelection}
                />
              </thead>
              <tbody>
                {filteredTasks.map((task, idx) => (
                  <NotionTableRow
                    key={task.id}
                    task={task}
                    index={idx + 1}
                    onRowClick={setEditingTask}
                    onEdit={setEditingTask}
                    onStatusChange={(id, status) => updateStatusMutation.mutate({ id, status })}
                    onDelete={(id) => deleteTaskMutation.mutate(id)}
                    getUserName={getUserName}
                    formatDueDate={formatDueDate}
                    isOverdue={isOverdue}
                    isDueSoon={isDueSoon}
                    showCategory={true}
                    showCheckbox={true}
                    isSelected={selectedTasks.has(task.id)}
                    onToggleSelect={toggleTaskSelection}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Create/Edit Modal */}
      <TaskFormModal
        isOpen={isCreateModalOpen || !!editingTask}
        onClose={() => {
          setIsCreateModalOpen(false)
          setEditingTask(null)
        }}
        task={editingTask}
        users={users}
        currentUser={currentUser}
        onSubmit={(data) => {
          if (editingTask) {
            updateTaskMutation.mutate({ id: editingTask.id, updates: data })
          } else {
            createTaskMutation.mutate(data as Omit<Task, 'id' | 'createdAt' | 'updatedAt'>)
          }
        }}
        isLoading={createTaskMutation.isPending || updateTaskMutation.isPending}
      />
    </div>
  )
}

// 노션 스타일 테이블 헤더
interface NotionTableHeaderProps {
  showCategory?: boolean
  showCheckbox?: boolean
  isAllSelected?: boolean
  onToggleAll?: () => void
}

function NotionTableHeader({
  showCategory = true,
  showCheckbox = false,
  isAllSelected = false,
  onToggleAll,
}: NotionTableHeaderProps) {
  return (
    <tr className="border-b text-xs text-muted-foreground">
      {showCheckbox && (
        <th className="py-2 px-3 w-[40px]">
          <Checkbox
            checked={isAllSelected}
            onCheckedChange={onToggleAll}
            onClick={(e) => e.stopPropagation()}
          />
        </th>
      )}
      <th className="text-left py-2 px-3 font-medium w-[50px]">No</th>
      <th className="text-left py-2 px-3 font-medium">작업</th>
      <th className="text-left py-2 px-3 font-medium w-[90px]">상태</th>
      <th className="text-left py-2 px-3 font-medium w-[80px]">담당자</th>
      <th className="text-left py-2 px-3 font-medium w-[100px]">마감일</th>
      <th className="text-left py-2 px-3 font-medium w-[70px]">우선순위</th>
      {showCategory && <th className="text-left py-2 px-3 font-medium w-[110px]">카테고리</th>}
      <th className="w-[40px]"></th>
    </tr>
  )
}

// 노션 스타일 테이블 행
interface NotionTableRowProps {
  task: Task
  index: number
  onRowClick: (task: Task) => void
  onEdit: (task: Task) => void
  onStatusChange: (id: string, status: TaskStatus) => void
  onDelete: (id: string) => void
  getUserName: (userId: string) => string
  formatDueDate: (date: Date | undefined) => string | null
  isOverdue: (task: Task) => boolean
  isDueSoon: (date: Date | undefined) => boolean
  showCategory?: boolean
  showCheckbox?: boolean
  isSelected?: boolean
  onToggleSelect?: (taskId: string) => void
}

function NotionTableRow({
  task,
  index,
  onRowClick,
  onEdit,
  onStatusChange,
  onDelete,
  getUserName,
  formatDueDate,
  isOverdue,
  isDueSoon,
  showCategory = true,
  showCheckbox = false,
  isSelected = false,
  onToggleSelect,
}: NotionTableRowProps) {
  return (
    <tr
      className={`border-b hover:bg-muted/30 transition-colors cursor-pointer text-sm ${
        isOverdue(task) ? 'bg-red-50/50' : ''
      } ${isSelected ? 'bg-blue-50/50' : ''}`}
      onClick={() => onRowClick(task)}
    >
      {/* 체크박스 */}
      {showCheckbox && (
        <td className="py-2 px-3">
          <Checkbox
            checked={isSelected}
            onCheckedChange={() => onToggleSelect?.(task.id)}
            onClick={(e) => e.stopPropagation()}
          />
        </td>
      )}
      {/* No */}
      <td className="py-2 px-3 text-muted-foreground">{index}</td>

      {/* 작업 */}
      <td className="py-2 px-3">
        <div className="flex items-center gap-2">
          <FileText className="size-4 text-muted-foreground flex-shrink-0" />
          <span className={task.status === 'completed' ? 'line-through text-muted-foreground' : ''}>
            {task.title}
          </span>
        </div>
      </td>

      {/* 상태 */}
      <td className="py-2 px-3">
        <Badge className={`${statusConfig[task.status].color} text-xs gap-1`}>
          <span className="size-1.5 rounded-full bg-current" />
          {statusConfig[task.status].label}
        </Badge>
      </td>

      {/* 담당자 */}
      <td className="py-2 px-3">
        <div className="flex items-center gap-1.5">
          <Avatar className="size-5">
            <AvatarFallback className="text-[10px]">{getUserName(task.assignedTo).charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground truncate">{getUserName(task.assignedTo)}</span>
        </div>
      </td>

      {/* 마감일 */}
      <td className="py-2 px-3">
        {task.dueDate ? (
          <span className={`text-xs ${
            isOverdue(task) ? 'text-red-600 font-medium' : isDueSoon(task.dueDate) ? 'text-orange-600' : 'text-muted-foreground'
          }`}>
            {formatDueDate(task.dueDate)}
          </span>
        ) : (
          <span className="text-muted-foreground">-</span>
        )}
      </td>

      {/* 우선순위 */}
      <td className="py-2 px-3">
        <Badge className={`${priorityConfig[task.priority].color} text-xs`}>
          {priorityConfig[task.priority].label}
        </Badge>
      </td>

      {/* 카테고리 */}
      {showCategory && (
        <td className="py-2 px-3">
          <Badge className={`${categoryConfig[task.category].color} text-xs gap-1`}>
            {categoryConfig[task.category].icon}
            {categoryConfig[task.category].label}
          </Badge>
        </td>
      )}

      {/* 액션 */}
      <td className="py-2 px-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
            <Button variant="ghost" size="icon-sm" className="size-6">
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(task) }}>
              <Edit className="size-4 mr-2" />수정
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange(task.id, 'in_progress') }}>
              <ArrowRight className="size-4 mr-2" />진행중으로 변경
            </DropdownMenuItem>
            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange(task.id, 'completed') }}>
              <CheckCircle2 className="size-4 mr-2" />완료로 변경
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-red-600" onClick={(e) => { e.stopPropagation(); onDelete(task.id) }}>
              <Trash2 className="size-4 mr-2" />삭제
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  )
}

// StatusTaskTable Component - 노션 스타일 상태별 테이블
interface StatusTaskTableProps {
  column: { status: TaskStatus; title: string; dotColor: string; bgColor: string; columnBg: string }
  tasks: Task[]
  onRowClick: (task: Task) => void
  onEdit: (task: Task) => void
  onStatusChange: (id: string, status: TaskStatus) => void
  onDelete: (id: string) => void
  getUserName: (userId: string) => string
  formatDueDate: (date: Date | undefined) => string | null
  isOverdue: (task: Task) => boolean
  isDueSoon: (date: Date | undefined) => boolean
  completedCount: number
  totalCount: number
}

function StatusTaskTable({
  column,
  tasks,
  onRowClick,
  onEdit,
  onStatusChange,
  onDelete,
  getUserName,
  formatDueDate,
  isOverdue,
  isDueSoon,
  completedCount,
  totalCount,
}: StatusTaskTableProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)

  return (
    <div className="mb-6">
      {/* 그룹 헤더 - 노션 스타일 */}
      <div
        className="flex items-center gap-2 py-2 cursor-pointer hover:bg-muted/30 rounded"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <span className={`transition-transform ${isCollapsed ? '' : 'rotate-90'}`}>▶</span>
        {statusConfig[column.status].icon}
        <span className="font-medium">{column.title}</span>
        <span className="text-muted-foreground text-sm">{tasks.length}</span>
      </div>

      {/* 테이블 */}
      {!isCollapsed && (
        <>
          <table className="w-full">
            <thead>
              <NotionTableHeader showCategory={true} />
            </thead>
            <tbody>
              {tasks.map((task, idx) => (
                <NotionTableRow
                  key={task.id}
                  task={task}
                  index={idx + 1}
                  onRowClick={onRowClick}
                  onEdit={onEdit}
                  onStatusChange={onStatusChange}
                  onDelete={onDelete}
                  getUserName={getUserName}
                  formatDueDate={formatDueDate}
                  isOverdue={isOverdue}
                  isDueSoon={isDueSoon}
                  showCategory={true}
                />
              ))}
            </tbody>
          </table>

          {/* 완료 카운트 */}
          <div className="text-center text-xs text-muted-foreground py-2">
            완료 {completedCount}/{totalCount}
          </div>
        </>
      )}
    </div>
  )
}

// CategoryTaskTable Component - 노션 스타일 카테고리별 테이블
interface CategoryTaskTableProps {
  categoryData: { label: string; icon: React.ReactNode; color: string }
  tasks: Task[]
  onRowClick: (task: Task) => void
  onEdit: (task: Task) => void
  onStatusChange: (id: string, status: TaskStatus) => void
  onDelete: (id: string) => void
  getUserName: (userId: string) => string
  formatDueDate: (date: Date | undefined) => string | null
  isOverdue: (task: Task) => boolean
  isDueSoon: (date: Date | undefined) => boolean
}

function CategoryTaskTable({
  categoryData,
  tasks,
  onRowClick,
  onEdit,
  onStatusChange,
  onDelete,
  getUserName,
  formatDueDate,
  isOverdue,
  isDueSoon,
}: CategoryTaskTableProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const completedCount = tasks.filter(t => t.status === 'completed').length

  return (
    <div className="mb-6">
      {/* 그룹 헤더 - 노션 스타일 */}
      <div
        className="flex items-center gap-2 py-2 cursor-pointer hover:bg-muted/30 rounded"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <span className={`transition-transform ${isCollapsed ? '' : 'rotate-90'}`}>▶</span>
        {categoryData.icon}
        <span className="font-medium">{categoryData.label}</span>
        <span className="text-muted-foreground text-sm">{tasks.length}</span>
      </div>

      {/* 테이블 */}
      {!isCollapsed && (
        <>
          <table className="w-full">
            <thead>
              <NotionTableHeader showCategory={false} />
            </thead>
            <tbody>
              {tasks.map((task, idx) => (
                <NotionTableRow
                  key={task.id}
                  task={task}
                  index={idx + 1}
                  onRowClick={onRowClick}
                  onEdit={onEdit}
                  onStatusChange={onStatusChange}
                  onDelete={onDelete}
                  getUserName={getUserName}
                  formatDueDate={formatDueDate}
                  isOverdue={isOverdue}
                  isDueSoon={isDueSoon}
                  showCategory={false}
                />
              ))}
            </tbody>
          </table>

          {/* 완료 카운트 */}
          <div className="text-center text-xs text-muted-foreground py-2">
            완료 {completedCount}/{tasks.length}
          </div>
        </>
      )}
    </div>
  )
}

// 노션 스타일 칸반 카드 컴포넌트
interface KanbanCardProps {
  task: Task
  onEdit: (task: Task) => void
  onStatusChange: (id: string, status: TaskStatus) => void
  onDelete: (id: string) => void
  isOverdue: (task: Task) => boolean
  currentStatus: TaskStatus
}

function KanbanCard({
  task,
  onEdit,
  onStatusChange,
  onDelete,
  isOverdue,
  currentStatus,
}: KanbanCardProps) {
  // 날짜 포맷
  const formatDateRange = (date: Date | undefined) => {
    if (!date) return null
    const d = new Date(date)
    return format(d, 'yyyy년 M월 d일', { locale: ko })
  }

  return (
    <div
      className={`bg-white border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all group ${
        isOverdue(task) ? 'border-red-200 bg-red-50/30' : 'border-gray-200'
      }`}
      onClick={() => onEdit(task)}
    >
      {/* 카테고리 아이콘 + 제목 + 액션 */}
      <div className="flex items-start gap-2 mb-3">
        <span className="text-lg mt-0.5">{categoryConfig[task.category].icon}</span>
        <h4 className={`flex-1 font-medium text-sm leading-tight ${
          task.status === 'completed' ? 'line-through text-muted-foreground' : ''
        }`}>
          {task.title}
        </h4>
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon-sm"
            className="size-6"
            onClick={(e) => { e.stopPropagation(); onEdit(task) }}
          >
            <Edit className="size-3" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon-sm" className="size-6">
                <MoreHorizontal className="size-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {currentStatus !== 'pending' && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange(task.id, 'pending') }}>
                  <Circle className="size-4 mr-2" />
                  대기로 변경
                </DropdownMenuItem>
              )}
              {currentStatus !== 'in_progress' && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange(task.id, 'in_progress') }}>
                  <ArrowRight className="size-4 mr-2" />
                  진행중으로 변경
                </DropdownMenuItem>
              )}
              {currentStatus !== 'completed' && (
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onStatusChange(task.id, 'completed') }}>
                  <CheckCircle2 className="size-4 mr-2" />
                  완료로 변경
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600" onClick={(e) => { e.stopPropagation(); onDelete(task.id) }}>
                <Trash2 className="size-4 mr-2" />
                삭제
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* 날짜 */}
      {task.dueDate && (
        <p className={`text-xs mb-3 ${isOverdue(task) ? 'text-red-600' : 'text-muted-foreground'}`}>
          {formatDateRange(task.dueDate)}
        </p>
      )}

      {/* 우선순위 배지 */}
      <div className="mb-3">
        <Badge className={`${priorityConfig[task.priority].color} text-xs`}>
          {priorityConfig[task.priority].label}
        </Badge>
      </div>

      {/* 진행률 바 (완료 상태면 100%) */}
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">
          {task.status === 'completed' ? '100.00' : task.status === 'in_progress' ? '50.00' : '0.00'}%
        </span>
        <div className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              task.status === 'completed' ? 'bg-green-500 w-full' :
              task.status === 'in_progress' ? 'bg-amber-400 w-1/2' :
              'bg-gray-300 w-0'
            }`}
          />
        </div>
      </div>
    </div>
  )
}

// Task Form Modal Component
interface TaskFormModalProps {
  isOpen: boolean
  onClose: () => void
  task: Task | null
  users: UserType[]
  currentUser: UserType | undefined
  onSubmit: (data: Partial<Task>) => void
  isLoading: boolean
}

function TaskFormModal({
  isOpen,
  onClose,
  task,
  users,
  currentUser,
  onSubmit,
  isLoading,
}: TaskFormModalProps) {
  const [title, setTitle] = useState(task?.title || '')
  const [description, setDescription] = useState(task?.description || '')
  const [category, setCategory] = useState<TaskCategory>(task?.category || 'other')
  const [priority, setPriority] = useState<TaskPriority>(task?.priority || 'medium')
  const [assignedTo, setAssignedTo] = useState(task?.assignedTo || currentUser?.id || '')
  const [dueDate, setDueDate] = useState(
    task?.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : ''
  )

  // Reset form when task changes
  const resetForm = () => {
    setTitle(task?.title || '')
    setDescription(task?.description || '')
    setCategory(task?.category || 'other')
    setPriority(task?.priority || 'medium')
    setAssignedTo(task?.assignedTo || currentUser?.id || '')
    setDueDate(task?.dueDate ? format(new Date(task.dueDate), 'yyyy-MM-dd') : '')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) {
      toast.error('제목을 입력해주세요')
      return
    }

    onSubmit({
      title,
      description: description || undefined,
      category,
      priority,
      status: task?.status || 'pending',
      assignedTo,
      assignedBy: currentUser?.id,
      source: task?.source || 'manual',
      dueDate: dueDate ? new Date(dueDate) : undefined,
    })
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose()
          resetForm()
        }
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{task ? '업무 수정' : '새 업무 추가'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">제목 *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="업무 제목을 입력하세요"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="description">설명</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="상세 설명을 입력하세요"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>카테고리</Label>
                <Select value={category} onValueChange={(v) => setCategory(v as TaskCategory)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(categoryConfig).map(([key, { label, icon }]) => (
                      <SelectItem key={key} value={key}>
                        <span className="flex items-center gap-2">
                          {icon}
                          {label}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label>우선순위</Label>
                <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(priorityConfig).map(([key, { label }]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>담당자</Label>
                <Select value={assignedTo} onValueChange={setAssignedTo}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {users.map((user) => (
                      <SelectItem key={user.id} value={user.id}>
                        {user.name} {user.id === currentUser?.id && '(나)'}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="dueDate">마감일</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? '저장 중...' : task ? '수정' : '추가'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default (parentRoute: RootRoute) =>
  createRoute({
    path: '/tasks',
    component: TasksPage,
    getParentRoute: () => parentRoute,
  })
