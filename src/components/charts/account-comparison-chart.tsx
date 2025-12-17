/**
 * Account Comparison Chart
 * Displays comparative metrics between selected accounts
 */

"use client"

import { AccountComparisonData } from "@/types/leads"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { ACCOUNT_COLORS } from "@/types/leads"

interface AccountComparisonChartProps {
  data: AccountComparisonData[]
}

export function AccountComparisonChart({
  data,
}: AccountComparisonChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="h-[400px] flex items-center justify-center text-muted-foreground">
        Aucune donnée de comparaison disponible
      </div>
    )
  }

  // Merge all time series data into a single dataset
  // Format: [{ date: "2024-01-01", INVF: 10, INVC3: 5, INVC4: 8 }, ...]
  const allDates = new Set<string>()
  data.forEach((account) => {
    account.timeSeriesData.forEach((point) => {
      allDates.add(point.date)
    })
  })

  const mergedData = Array.from(allDates)
    .sort()
    .map((date) => {
      const dataPoint: any = { date }
      data.forEach((account) => {
        const point = account.timeSeriesData.find((p) => p.date === date)
        dataPoint[account.accountName] = point ? point.count : 0
      })
      return dataPoint
    })

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={mergedData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="date"
          className="text-xs"
          tickFormatter={(value) => {
            const date = new Date(value)
            return `${date.getDate()}/${date.getMonth() + 1}`
          }}
        />
        <YAxis className="text-xs" />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
          labelFormatter={(value) => {
            const date = new Date(value)
            return date.toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
            })
          }}
        />
        <Legend />
        {data.map((account, index) => (
          <Line
            key={account.accountName}
            type="monotone"
            dataKey={account.accountName}
            stroke={ACCOUNT_COLORS[index % ACCOUNT_COLORS.length]}
            strokeWidth={2}
            dot={{ r: 3 }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  )
}
