/**
 * Comparison Insights Panel
 * Displays analytical insights and key metrics for compared accounts
 */

"use client"

import { AccountComparisonData } from "@/types/leads"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Award, BarChart3, Minus } from "lucide-react"

interface ComparisonInsightsPanelProps {
  data: AccountComparisonData[]
}

export function ComparisonInsightsPanel({
  data,
}: ComparisonInsightsPanelProps) {
  if (!data || data.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            Sélectionnez au moins un compte pour voir les insights
          </p>
        </CardContent>
      </Card>
    )
  }

  // Find best performers
  const bestTotal = data.reduce((max, curr) =>
    curr.totalPV > max.totalPV ? curr : max
  )
  const bestDailyAvg = data.reduce((max, curr) =>
    curr.dailyAvg > max.dailyAvg ? curr : max
  )
  const bestTrend = data.reduce((max, curr) =>
    curr.weeklyTrend > max.weeklyTrend ? curr : max
  )

  const getTrendIcon = (trend: number) => {
    if (trend > 5) return <TrendingUp className="h-4 w-4 text-green-500" />
    if (trend < -5) return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Minus className="h-4 w-4 text-muted-foreground" />
  }

  const getTrendColor = (trend: number) => {
    if (trend > 5) return "text-green-500"
    if (trend < -5) return "text-red-500"
    return "text-muted-foreground"
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Meilleur Volume
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bestTotal.accountName}</div>
            <p className="text-xs text-muted-foreground">
              {bestTotal.totalPV} leads PV
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Meilleure Moyenne
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bestDailyAvg.accountName}</div>
            <p className="text-xs text-muted-foreground">
              {bestDailyAvg.dailyAvg.toFixed(1)} leads/jour
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Meilleure Tendance
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bestTrend.accountName}</div>
            <p className={`text-xs ${getTrendColor(bestTrend.weeklyTrend)}`}>
              {bestTrend.weeklyTrend > 0 ? "+" : ""}
              {bestTrend.weeklyTrend.toFixed(1)}% vs semaine précédente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Comparaison Détaillée</CardTitle>
          <CardDescription>
            Métriques comparatives pour les comptes sélectionnés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Compte</th>
                  <th className="text-right py-3 px-4 font-medium">Total PV</th>
                  <th className="text-right py-3 px-4 font-medium">
                    Moyenne/Jour
                  </th>
                  <th className="text-right py-3 px-4 font-medium">
                    Tendance 7j
                  </th>
                  <th className="text-right py-3 px-4 font-medium">
                    Jours Actifs
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.map((account) => (
                  <tr key={account.accountName} className="border-b">
                    <td className="py-3 px-4 font-medium">
                      <div className="flex items-center gap-2">
                        {account.accountName}
                        {account.accountName === bestTotal.accountName && (
                          <Badge variant="secondary" className="text-xs">
                            Top
                          </Badge>
                        )}
                      </div>
                    </td>
                    <td className="text-right py-3 px-4">
                      {account.totalPV}
                    </td>
                    <td className="text-right py-3 px-4">
                      {account.dailyAvg.toFixed(1)}
                    </td>
                    <td className="text-right py-3 px-4">
                      <div className="flex items-center justify-end gap-2">
                        {getTrendIcon(account.weeklyTrend)}
                        <span className={getTrendColor(account.weeklyTrend)}>
                          {account.weeklyTrend > 0 ? "+" : ""}
                          {account.weeklyTrend.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4">
                      {account.timeSeriesData.length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights Clés</CardTitle>
          <CardDescription>
            Analyse comparative des performances
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            {data.length > 1 && (
              <>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>
                    <strong>{bestTotal.accountName}</strong> génère le plus de
                    leads avec{" "}
                    <strong className="text-primary">{bestTotal.totalPV}</strong>{" "}
                    leads PV au total
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>
                    <strong>{bestDailyAvg.accountName}</strong> a la meilleure
                    moyenne quotidienne avec{" "}
                    <strong className="text-primary">
                      {bestDailyAvg.dailyAvg.toFixed(1)}
                    </strong>{" "}
                    leads/jour
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground">•</span>
                  <span>
                    <strong>{bestTrend.accountName}</strong> montre la meilleure
                    tendance hebdomadaire avec{" "}
                    <strong className={getTrendColor(bestTrend.weeklyTrend)}>
                      {bestTrend.weeklyTrend > 0 ? "+" : ""}
                      {bestTrend.weeklyTrend.toFixed(1)}%
                    </strong>{" "}
                    vs la semaine précédente
                  </span>
                </li>
              </>
            )}
            {data.length === 1 && (
              <li className="flex items-start gap-2">
                <span className="text-muted-foreground">•</span>
                <span>
                  Sélectionnez plusieurs comptes pour obtenir une analyse
                  comparative
                </span>
              </li>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
