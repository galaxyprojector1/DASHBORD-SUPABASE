/**
 * Leads Heatmap - Custom heatmap showing account × date matrix
 */

"use client"

import { HeatmapData } from "@/types/leads"
import { format, parseISO } from "date-fns"

interface LeadsHeatmapProps {
  data: HeatmapData[]
}

export function LeadsHeatmap({ data }: LeadsHeatmapProps) {
  // Group data by account and date
  const accounts = Array.from(new Set(data.map((item) => item.account)))
  const dates = Array.from(new Set(data.map((item) => item.date))).sort()

  // Create a map for quick lookups
  const valueMap = new Map<string, number>()
  data.forEach((item) => {
    const key = `${item.account}|${item.date}`
    valueMap.set(key, item.value)
  })

  // Find max value for color scaling
  const maxValue = Math.max(...data.map((item) => item.value), 1)

  // Get color based on value intensity
  const getColor = (value: number) => {
    const intensity = value / maxValue
    // Blue gradient from light to dark
    if (intensity === 0) return "bg-gray-100 dark:bg-gray-800"
    if (intensity < 0.25) return "bg-blue-200 dark:bg-blue-900"
    if (intensity < 0.5) return "bg-blue-400 dark:bg-blue-700"
    if (intensity < 0.75) return "bg-blue-600 dark:bg-blue-500"
    return "bg-blue-800 dark:bg-blue-300"
  }

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[800px]">
        {/* Header with dates */}
        <div className="flex mb-2">
          <div className="w-24 flex-shrink-0" />
          <div className="flex-1 flex gap-1">
            {dates.map((date) => (
              <div
                key={date}
                className="flex-1 text-xs text-center text-muted-foreground"
              >
                {format(parseISO(date), "dd MMM")}
              </div>
            ))}
          </div>
        </div>

        {/* Heatmap rows */}
        {accounts.map((account) => (
          <div key={account} className="flex items-center mb-1">
            <div className="w-24 flex-shrink-0 text-sm font-medium pr-2">
              {account}
            </div>
            <div className="flex-1 flex gap-1">
              {dates.map((date) => {
                const key = `${account}|${date}`
                const value = valueMap.get(key) || 0
                return (
                  <div
                    key={date}
                    className={`flex-1 h-12 rounded ${getColor(value)}
                      flex items-center justify-center text-xs font-medium
                      hover:ring-2 hover:ring-primary transition-all cursor-pointer
                      ${value > 0 ? "text-white dark:text-gray-900" : "text-muted-foreground"}`}
                    title={`${account} - ${format(parseISO(date), "dd MMM")}: ${value} leads`}
                  >
                    {value > 0 ? value : ""}
                  </div>
                )
              })}
            </div>
          </div>
        ))}

        {/* Legend */}
        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <span>Moins</span>
          <div className="flex gap-1">
            <div className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-800" />
            <div className="w-6 h-6 rounded bg-blue-200 dark:bg-blue-900" />
            <div className="w-6 h-6 rounded bg-blue-400 dark:bg-blue-700" />
            <div className="w-6 h-6 rounded bg-blue-600 dark:bg-blue-500" />
            <div className="w-6 h-6 rounded bg-blue-800 dark:bg-blue-300" />
          </div>
          <span>Plus</span>
        </div>
      </div>
    </div>
  )
}
