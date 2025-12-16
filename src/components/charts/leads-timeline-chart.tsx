/**
 * Leads Timeline Chart - Line chart showing evolution over time
 * Supports two modes: total or split by account
 */

"use client"

import { DateStats, ACCOUNT_COLORS } from "@/types/leads"
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
import { format, parseISO } from "date-fns"

interface LeadsTimelineChartProps {
  data: DateStats[]
  splitByAccount?: boolean
}

export function LeadsTimelineChart({
  data,
  splitByAccount = false,
}: LeadsTimelineChartProps) {
  // Format dates for display
  const chartData = data.map((item) => ({
    ...item,
    displayDate: format(parseISO(item.date), "dd MMM"),
  }))

  // If split by account, get all unique accounts
  const accounts = splitByAccount
    ? Array.from(
        new Set(
          data.flatMap((item) =>
            item.byAccount ? Object.keys(item.byAccount) : []
          )
        )
      )
    : []

  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis
          dataKey="displayDate"
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

        {!splitByAccount ? (
          // Single line for total
          <Line
            type="monotone"
            dataKey="count"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
            name="Total Leads"
          />
        ) : (
          // Multiple lines for each account
          accounts.map((account, index) => (
            <Line
              key={account}
              type="monotone"
              dataKey={(item: DateStats) =>
                item.byAccount?.[account] || 0
              }
              stroke={ACCOUNT_COLORS[index % ACCOUNT_COLORS.length]}
              strokeWidth={2}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
              name={account}
            />
          ))
        )}
      </LineChart>
    </ResponsiveContainer>
  )
}
