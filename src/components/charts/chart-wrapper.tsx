/**
 * Chart Wrapper - Reusable container for all charts
 * Handles loading and error states
 */

import { ReactNode } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface ChartWrapperProps {
  title: string
  description?: string
  loading?: boolean
  error?: string | null
  children: ReactNode
}

export function ChartWrapper({
  title,
  description,
  loading = false,
  error = null,
  children,
}: ChartWrapperProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-[300px]">
            <p className="text-sm text-destructive">{error}</p>
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  )
}
