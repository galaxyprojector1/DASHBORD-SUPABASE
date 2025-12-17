/**
 * Leads by Account Chart - Simple bar chart showing PV leads per account
 */

"use client"

import { AccountStats } from "@/types/leads"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

interface LeadsByAccountChartProps {
  data: AccountStats[]
}

export function LeadsByAccountChart({ data }: LeadsByAccountChartProps) {
  // Transform data for bar chart - PV only
  const chartData = data.map((account) => ({
    name: account.name,
    leads: account.pvCount,
  }))

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} className="stroke-muted" />
        <XAxis
          dataKey="name"
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
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
          labelStyle={{ color: "hsl(var(--popover-foreground))" }}
          cursor={{ fill: "hsl(var(--muted))" }}
        />
        <Bar
          dataKey="leads"
          fill="hsl(var(--primary))"
          radius={[8, 8, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
