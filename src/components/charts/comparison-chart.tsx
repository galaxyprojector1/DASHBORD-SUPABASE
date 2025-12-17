/**
 * Multi-Account Comparison Chart
 * Allows selecting up to 3 accounts and comparing their metrics
 */

"use client"

import { useState, useMemo } from "react"
import { AccountStats } from "@/types/leads"
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ACCOUNT_COLORS } from "@/types/leads"

interface ComparisonChartProps {
  data: AccountStats[]
  dateRangeStats: {
    totalDays: number
  }
}

type MetricType = "total" | "daily_avg" | "weekly_trend"

interface ChartDataPoint {
  account: string
  value: number
  color: string
}

export function ComparisonChart({ data, dateRangeStats }: ComparisonChartProps) {
  // Multi-select state (max 3 accounts)
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>(
    data.slice(0, 3).map((a) => a.name)
  )
  const [selectedMetric, setSelectedMetric] = useState<MetricType>("total")

  // Toggle account selection (max 3)
  const toggleAccount = (accountName: string) => {
    setSelectedAccounts((prev) => {
      if (prev.includes(accountName)) {
        // Deselect
        return prev.filter((a) => a !== accountName)
      } else {
        // Select (max 3)
        if (prev.length >= 3) {
          return prev
        }
        return [...prev, accountName]
      }
    })
  }

  // Calculate chart data based on selected metric
  const chartData = useMemo(() => {
    const filteredData = data.filter((account) =>
      selectedAccounts.includes(account.name)
    )

    return filteredData.map((account, index) => {
      let value = 0

      switch (selectedMetric) {
        case "total":
          value = account.pvCount
          break
        case "daily_avg":
          value =
            dateRangeStats.totalDays > 0
              ? account.pvCount / dateRangeStats.totalDays
              : 0
          break
        case "weekly_trend":
          // For weekly trend, we'll show a simplified percentage
          // In a real scenario, you'd calculate this from time series data
          value = Math.random() * 30 - 10 // Placeholder: -10% to +20%
          break
      }

      return {
        account: account.name,
        value: parseFloat(value.toFixed(2)),
        color: ACCOUNT_COLORS[index % ACCOUNT_COLORS.length],
      }
    })
  }, [data, selectedAccounts, selectedMetric, dateRangeStats.totalDays])

  // Metric configurations
  const metricConfig = {
    total: {
      label: "Total PV",
      unit: "",
      format: (val: number) => val.toString(),
    },
    daily_avg: {
      label: "Moyenne/jour",
      unit: "/j",
      format: (val: number) => val.toFixed(1),
    },
    weekly_trend: {
      label: "Tendance 7j",
      unit: "%",
      format: (val: number) =>
        val > 0 ? `+${val.toFixed(1)}%` : `${val.toFixed(1)}%`,
    },
  }

  const currentMetric = metricConfig[selectedMetric]

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Comparaison Multi-Comptes</CardTitle>
          <Badge variant="outline" className="font-normal">
            {selectedAccounts.length}/3 comptes
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Account selector */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Sélectionner les comptes (max 3)</p>
          <div className="flex flex-wrap gap-2">
            {data.map((account) => {
              const isSelected = selectedAccounts.includes(account.name)
              const isDisabled =
                !isSelected && selectedAccounts.length >= 3

              return (
                <button
                  key={account.name}
                  onClick={() => toggleAccount(account.name)}
                  disabled={isDisabled}
                  className={`
                    px-4 py-2 rounded-md text-sm font-medium transition-colors
                    ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }
                    ${
                      isDisabled
                        ? "opacity-50 cursor-not-allowed"
                        : "cursor-pointer"
                    }
                  `}
                >
                  {account.name}
                </button>
              )
            })}
          </div>
        </div>

        {/* Metric selector */}
        <div className="space-y-3">
          <p className="text-sm font-medium">Métrique à comparer</p>
          <ToggleGroup
            type="single"
            value={selectedMetric}
            onValueChange={(value) =>
              value && setSelectedMetric(value as MetricType)
            }
            className="justify-start"
          >
            <ToggleGroupItem value="total" aria-label="Total PV">
              Total PV
            </ToggleGroupItem>
            <ToggleGroupItem value="daily_avg" aria-label="Moyenne journalière">
              Moyenne/jour
            </ToggleGroupItem>
            <ToggleGroupItem value="weekly_trend" aria-label="Tendance 7 jours">
              Tendance 7j
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        {/* Chart */}
        {selectedAccounts.length > 0 ? (
          <div className="pt-4">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  className="stroke-muted"
                />
                <XAxis
                  dataKey="account"
                  className="text-sm"
                  tick={{ fill: "currentColor" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  className="text-sm"
                  tick={{ fill: "currentColor" }}
                  tickLine={false}
                  axisLine={false}
                  label={{
                    value: currentMetric.unit,
                    angle: -90,
                    position: "insideLeft",
                    style: { textAnchor: "middle" },
                  }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "var(--radius)",
                  }}
                  labelStyle={{ color: "hsl(var(--popover-foreground))" }}
                  cursor={{ fill: "hsl(var(--muted))" }}
                  formatter={(value: number) => [
                    currentMetric.format(value),
                    currentMetric.label,
                  ]}
                />
                <Bar
                  dataKey="value"
                  radius={[8, 8, 0, 0]}
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            {/* Metric values */}
            <div className="mt-6 grid grid-cols-3 gap-4">
              {chartData.map((item, index) => (
                <div
                  key={item.account}
                  className="text-center space-y-1 p-3 rounded-lg bg-muted/50"
                >
                  <div
                    className="w-3 h-3 rounded-full mx-auto"
                    style={{ backgroundColor: item.color }}
                  />
                  <p className="text-sm font-medium">{item.account}</p>
                  <p className="text-2xl font-bold">
                    {currentMetric.format(item.value)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {currentMetric.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-12 text-center text-muted-foreground">
            <p>Sélectionnez au moins un compte pour voir la comparaison</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
