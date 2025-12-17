/**
 * Skeleton loading components for Leads Analytics
 * Provides elegant loading states matching the actual UI structure
 */

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Skeleton for KPI cards
 * Used in the 2x3 grid of key metrics
 */
export function KpiCardSkeleton() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-8 w-20 mb-2" />
        <Skeleton className="h-3 w-32" />
      </CardContent>
    </Card>
  )
}

/**
 * Skeleton for chart containers
 * Matches the ChartWrapper component structure
 */
export function ChartSkeleton({ height = "h-80" }: { height?: string }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-40 mb-2" />
        <Skeleton className="h-4 w-64" />
      </CardHeader>
      <CardContent>
        <Skeleton className={`w-full ${height}`} />
      </CardContent>
    </Card>
  )
}

/**
 * Skeleton for the detailed accounts table
 */
export function TableSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-80" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Table header */}
          <div className="flex justify-between border-b pb-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-12" />
          </div>
          {/* Table rows */}
          {Array.from({ length: rows }).map((_, i) => (
            <div key={i} className="flex justify-between border-b py-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-12" />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/**
 * Complete loading state for the KPI grid
 * Renders 6 KPI card skeletons in a 2x3 grid
 */
export function KpiGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <KpiCardSkeleton key={i} />
      ))}
    </div>
  )
}

/**
 * Skeleton for the overview tab (2 charts side by side)
 */
export function OverviewTabSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <ChartSkeleton />
      <ChartSkeleton />
    </div>
  )
}

/**
 * Skeleton for the evolution tab (2 full-width charts)
 */
export function EvolutionTabSkeleton() {
  return (
    <div className="space-y-4">
      <ChartSkeleton />
      <ChartSkeleton />
    </div>
  )
}

/**
 * Skeleton for the accounts tab (chart + table)
 */
export function AccountsTabSkeleton() {
  return (
    <div className="space-y-4">
      <ChartSkeleton />
      <TableSkeleton rows={3} />
    </div>
  )
}

/**
 * Skeleton for the heatmap tab
 */
export function HeatmapTabSkeleton() {
  return <ChartSkeleton height="h-96" />
}
