/**
 * Leads by Account Chart - Stacked bar chart showing PV/PAC/ITE per account
 * Most important chart per user priority
 */

"use client"

import { AccountStats, ACTIVITY_COLORS } from "@/types/leads"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface LeadsByAccountChartProps {
  data: AccountStats[]
}

export function LeadsByAccountChart({ data }: LeadsByAccountChartProps) {
  // Transform data for stacked bar chart
  const chartData = data.map((account) => ({
    name: account.name,
    PV: account.activities.PV,
    PAC: account.activities.PAC,
    ITE: account.activities.ITE,
    total: account.count,
  }))

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="name"
          className="text-sm"
          tick={{ fill: "currentColor" }}
        />
        <YAxis className="text-sm" tick={{ fill: "currentColor" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
          labelStyle={{ color: "hsl(var(--popover-foreground))" }}
        />
        <Legend />
        <Bar
          dataKey="PV"
          stackId="a"
          fill={ACTIVITY_COLORS.PV}
          radius={[0, 0, 0, 0]}
        />
        <Bar
          dataKey="PAC"
          stackId="a"
          fill={ACTIVITY_COLORS.PAC}
          radius={[0, 0, 0, 0]}
        />
        <Bar
          dataKey="ITE"
          stackId="a"
          fill={ACTIVITY_COLORS.ITE}
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
