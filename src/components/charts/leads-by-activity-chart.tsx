/**
 * Leads by Activity Chart - Pie chart showing distribution of activities
 */

"use client"

import { ActivityStats } from "@/types/leads"
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts"

interface LeadsByActivityChartProps {
  data: ActivityStats[]
}

export function LeadsByActivityChart({ data }: LeadsByActivityChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percentage }) =>
            `${name} (${percentage.toFixed(1)}%)`
          }
          outerRadius={100}
          fill="#8884d8"
          dataKey="count"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--popover))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "var(--radius)",
          }}
          formatter={(value: number, name: string, props: any) => [
            `${value} leads (${props.payload.percentage.toFixed(1)}%)`,
            name,
          ]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
