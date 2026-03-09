import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

interface CardSkeletonProps {
  showHeader?: boolean
  showDescription?: boolean
  lines?: number
}

export function CardSkeleton({
  showHeader = true,
  showDescription = false,
  lines = 2,
}: CardSkeletonProps) {
  return (
    <Card>
      {showHeader && (
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-[120px]" />
          {showDescription && <Skeleton className="h-4 w-[200px] mt-1" />}
        </CardHeader>
      )}
      <CardContent className="space-y-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-4"
            style={{ width: `${Math.max(40, 100 - i * 20)}%` }}
          />
        ))}
      </CardContent>
    </Card>
  )
}

export function StatCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <Skeleton className="h-4 w-[100px]" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-[80px] mb-1" />
        <Skeleton className="h-3 w-[140px]" />
      </CardContent>
    </Card>
  )
}
