/**
 * Insights Panel - Comparative insights and recommendations
 * Analyzes account performance and provides actionable insights
 */

"use client"

import { useMemo } from "react"
import { AccountStats } from "@/types/leads"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  TrendingUp,
  TrendingDown,
  Award,
  AlertTriangle,
  Target,
} from "lucide-react"

interface InsightsPanelProps {
  data: AccountStats[]
  dateRangeStats: {
    totalDays: number
    dailyAverage: number
    weeklyTrend: number
  }
}

interface Insight {
  type: "success" | "warning" | "info"
  title: string
  description: string
  icon: React.ReactNode
  metric?: string
}

export function InsightsPanel({ data, dateRangeStats }: InsightsPanelProps) {
  const insights = useMemo(() => {
    const results: Insight[] = []

    if (data.length === 0) {
      return results
    }

    // Sort accounts by performance
    const sortedAccounts = [...data].sort((a, b) => b.pvCount - a.pvCount)
    const bestAccount = sortedAccounts[0]
    const worstAccount = sortedAccounts[sortedAccounts.length - 1]

    // 1. Best performing account
    results.push({
      type: "success",
      title: "Meilleur compte",
      description: `${bestAccount.name} génère ${bestAccount.pvCount} PV (${bestAccount.percentage.toFixed(1)}% du total)`,
      icon: <Award className="h-5 w-5" />,
      metric: `${bestAccount.pvCount} PV`,
    })

    // 2. Performance gap analysis
    if (data.length > 1) {
      const gap = bestAccount.pvCount - worstAccount.pvCount
      const gapPercentage = (
        (gap / bestAccount.pvCount) *
        100
      ).toFixed(0)

      if (gap > bestAccount.pvCount * 0.3) {
        results.push({
          type: "warning",
          title: "Écart de performance important",
          description: `${gapPercentage}% d'écart entre ${bestAccount.name} et ${worstAccount.name}. Analyser les différences de stratégie.`,
          icon: <AlertTriangle className="h-5 w-5" />,
          metric: `${gap} PV`,
        })
      }
    }

    // 3. Daily average analysis
    const avgPerAccount = dateRangeStats.dailyAverage / data.length
    const topPerformers = data.filter(
      (account) => account.pvCount / dateRangeStats.totalDays > avgPerAccount
    )

    if (topPerformers.length > 0) {
      results.push({
        type: "info",
        title: "Performances au-dessus de la moyenne",
        description: `${topPerformers.length} compte(s) dépassent la moyenne de ${avgPerAccount.toFixed(1)} PV/jour`,
        icon: <TrendingUp className="h-5 w-5" />,
        metric: `${topPerformers.map((a) => a.name).join(", ")}`,
      })
    }

    // 4. Weekly trend insight
    if (dateRangeStats.weeklyTrend !== 0) {
      const isPositive = dateRangeStats.weeklyTrend > 0

      results.push({
        type: isPositive ? "success" : "warning",
        title: isPositive ? "Tendance positive" : "Tendance négative",
        description: `${isPositive ? "Croissance" : "Baisse"} de ${Math.abs(dateRangeStats.weeklyTrend).toFixed(1)}% sur les 7 derniers jours`,
        icon: isPositive ? (
          <TrendingUp className="h-5 w-5" />
        ) : (
          <TrendingDown className="h-5 w-5" />
        ),
        metric: `${isPositive ? "+" : ""}${dateRangeStats.weeklyTrend.toFixed(1)}%`,
      })
    }

    // 5. Recommendation based on distribution
    const distribution = data.map(
      (account) => (account.pvCount / dateRangeStats.totalDays) * 100
    )
    const variance =
      distribution.reduce((sum, val) => sum + Math.pow(val - avgPerAccount, 2), 0) /
      distribution.length

    if (variance > 50) {
      results.push({
        type: "info",
        title: "Distribution inégale",
        description: `Les performances varient significativement entre comptes. Considérer une uniformisation des stratégies.`,
        icon: <Target className="h-5 w-5" />,
      })
    }

    return results
  }, [data, dateRangeStats])

  // Recommendations based on insights
  const recommendations = useMemo(() => {
    const recs: string[] = []

    if (data.length === 0) {
      return recs
    }

    const sortedAccounts = [...data].sort((a, b) => b.pvCount - a.pvCount)
    const bestAccount = sortedAccounts[0]
    const avgPerAccount = dateRangeStats.dailyAverage / data.length

    // Recommendation 1: Optimize underperformers
    const underPerformers = data.filter(
      (account) => account.pvCount / dateRangeStats.totalDays < avgPerAccount * 0.7
    )

    if (underPerformers.length > 0) {
      recs.push(
        `Optimiser ${underPerformers.map((a) => a.name).join(", ")} en appliquant les meilleures pratiques de ${bestAccount.name}`
      )
    }

    // Recommendation 2: Scale top performers
    if (bestAccount.percentage > 40) {
      recs.push(
        `Augmenter le budget de ${bestAccount.name} qui génère ${bestAccount.percentage.toFixed(0)}% des leads`
      )
    }

    // Recommendation 3: Weekly trend action
    if (dateRangeStats.weeklyTrend < -10) {
      recs.push(
        "La tendance est négative. Réviser les créatives et le ciblage rapidement"
      )
    } else if (dateRangeStats.weeklyTrend > 10) {
      recs.push(
        "La tendance est positive. Capitaliser en augmentant les budgets"
      )
    }

    // Recommendation 4: Consistency
    if (data.length > 1) {
      const dailyAverages = data.map(
        (account) => account.pvCount / dateRangeStats.totalDays
      )
      const maxDaily = Math.max(...dailyAverages)
      const minDaily = Math.min(...dailyAverages)

      if (maxDaily > minDaily * 2) {
        recs.push(
          "Rééquilibrer les performances entre comptes pour plus de stabilité"
        )
      }
    }

    return recs
  }, [data, dateRangeStats])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Insights et Recommandations</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Insights */}
        <div className="space-y-3">
          <h3 className="text-sm font-semibold uppercase text-muted-foreground">
            Analyses
          </h3>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <Card
                key={index}
                className={`
                  border-l-4
                  ${
                    insight.type === "success"
                      ? "border-l-green-500 bg-green-50/50 dark:bg-green-950/20"
                      : insight.type === "warning"
                        ? "border-l-orange-500 bg-orange-50/50 dark:bg-orange-950/20"
                        : "border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                  }
                `}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div
                      className={`
                      mt-0.5
                      ${
                        insight.type === "success"
                          ? "text-green-600 dark:text-green-400"
                          : insight.type === "warning"
                            ? "text-orange-600 dark:text-orange-400"
                            : "text-blue-600 dark:text-blue-400"
                      }
                    `}
                    >
                      {insight.icon}
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-sm">
                          {insight.title}
                        </p>
                        {insight.metric && (
                          <Badge
                            variant={
                              insight.type === "success"
                                ? "default"
                                : insight.type === "warning"
                                  ? "destructive"
                                  : "secondary"
                            }
                          >
                            {insight.metric}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {insight.description}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        {recommendations.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold uppercase text-muted-foreground">
              Recommandations
            </h3>
            <div className="space-y-2">
              {recommendations.map((rec, index) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-3 rounded-lg bg-muted/50"
                >
                  <div className="flex-shrink-0 mt-0.5">
                    <div className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                      {index + 1}
                    </div>
                  </div>
                  <p className="text-sm flex-1">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Summary stats */}
        <div className="pt-4 border-t grid grid-cols-3 gap-4">
          <div className="text-center space-y-1">
            <p className="text-xs text-muted-foreground">Comptes actifs</p>
            <p className="text-2xl font-bold">{data.length}</p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs text-muted-foreground">Moyenne/jour</p>
            <p className="text-2xl font-bold">
              {dateRangeStats.dailyAverage.toFixed(1)}
            </p>
          </div>
          <div className="text-center space-y-1">
            <p className="text-xs text-muted-foreground">Tendance 7j</p>
            <p
              className={`text-2xl font-bold ${
                dateRangeStats.weeklyTrend > 0
                  ? "text-green-600"
                  : dateRangeStats.weeklyTrend < 0
                    ? "text-red-600"
                    : ""
              }`}
            >
              {dateRangeStats.weeklyTrend > 0 ? "+" : ""}
              {dateRangeStats.weeklyTrend.toFixed(1)}%
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
