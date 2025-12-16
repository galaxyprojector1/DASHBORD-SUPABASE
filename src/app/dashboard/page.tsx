"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Database, Activity, TrendingUp } from "lucide-react"

export default function DashboardPage() {
  const stats = [
    {
      title: "Total Users",
      value: "2,543",
      description: "+12% from last month",
      icon: Users,
      color: "text-blue-600"
    },
    {
      title: "Database Records",
      value: "12,234",
      description: "+8% from last month",
      icon: Database,
      color: "text-green-600"
    },
    {
      title: "Active Sessions",
      value: "573",
      description: "Real-time data",
      icon: Activity,
      color: "text-orange-600"
    },
    {
      title: "Growth Rate",
      value: "+23%",
      description: "This quarter",
      icon: TrendingUp,
      color: "text-purple-600"
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
          <p className="text-muted-foreground">
            Welcome to your Supabase dashboard
          </p>
        </div>
        <Badge variant="outline" className="text-sm">
          Connected to Supabase
        </Badge>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Start</CardTitle>
          <CardDescription>
            Configure your environment variables to connect to your Supabase database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              1. Create a <code className="bg-muted px-1 py-0.5 rounded">.env.local</code> file
            </p>
            <p className="text-sm text-muted-foreground">
              2. Add your Supabase URL and API key
            </p>
            <p className="text-sm text-muted-foreground">
              3. Restart the development server
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
