/**
 * Leads Analytics Dashboard - Main page
 * Comprehensive analytics interface for Facebook leads
 */

"use client"

import { useState, useEffect } from "react"
import { LeadsService } from "@/lib/leads-service"
import {
  LeadStats,
  DateStats,
  HeatmapData,
  LeadsFilters,
} from "@/types/leads"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LeadsFiltersComponent } from "@/components/leads/leads-filters"
import { ChartWrapper } from "@/components/charts/chart-wrapper"
import { LeadsByAccountChart } from "@/components/charts/leads-by-account-chart"
import { LeadsByActivityChart } from "@/components/charts/leads-by-activity-chart"
import { LeadsTimelineChart } from "@/components/charts/leads-timeline-chart"
import { LeadsHeatmap } from "@/components/charts/leads-heatmap"
import {
  Users,
  TrendingUp,
  Activity,
  Building2,
  Loader2,
} from "lucide-react"

export default function LeadsAnalyticsPage() {
  // State
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState<LeadStats | null>(null)
  const [timeSeriesData, setTimeSeriesData] = useState<DateStats[]>([])
  const [timeSeriesByAccount, setTimeSeriesByAccount] = useState<DateStats[]>([])
  const [heatmapData, setHeatmapData] = useState<HeatmapData[]>([])

  // Filter options
  const [accounts, setAccounts] = useState<string[]>([])
  const [activities, setActivities] = useState<string[]>([])

  // Active filters
  const [filters, setFilters] = useState<LeadsFilters>({
    dateFrom: null,
    dateTo: null,
    compte: null,
    activité: null,
    search: "",
  })

  // Load filter options on mount
  useEffect(() => {
    async function loadFilterOptions() {
      try {
        const [accountsList, activitiesList] = await Promise.all([
          LeadsService.getAccounts(),
          LeadsService.getActivities(),
        ])
        setAccounts(accountsList)
        setActivities(activitiesList)
      } catch (err: any) {
        console.error("Error loading filter options:", err)
      }
    }
    loadFilterOptions()
  }, [])

  // Load data when filters change
  useEffect(() => {
    async function loadData() {
      setLoading(true)
      setError(null)

      try {
        // Parallel loading for performance
        const [statsData, timeSeriesTotal, timeSeriesSplit, heatmap] =
          await Promise.all([
            LeadsService.getLeadStats(filters),
            LeadsService.getTimeSeriesData(filters, false),
            LeadsService.getTimeSeriesData(filters, true),
            LeadsService.getHeatmapData(filters),
          ])

        setStats(statsData)
        setTimeSeriesData(timeSeriesTotal)
        setTimeSeriesByAccount(timeSeriesSplit)
        setHeatmapData(heatmap)
      } catch (err: any) {
        console.error("Error loading data:", err)
        setError(err.message || "Une erreur est survenue")
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [filters])

  // Handle filter changes
  const handleApplyFilters = (newFilters: LeadsFilters) => {
    setFilters(newFilters)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Leads Analytics</h2>
        <p className="text-muted-foreground">
          Analyse complète des leads Facebook (Table: NEW-FACEBOOK)
        </p>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Sidebar Filters */}
        <div className="lg:col-span-1">
          <LeadsFiltersComponent
            accounts={accounts}
            activities={activities}
            onApply={handleApplyFilters}
            initialFilters={filters}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-destructive text-center">{error}</p>
              </CardContent>
            </Card>
          )}

          {/* Data Display */}
          {!loading && !error && stats && (
            <>
              {/* KPI Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Leads
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.total}</div>
                    <p className="text-xs text-muted-foreground">
                      Leads collectés
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Compte Principal
                    </CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.topAccount.name}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stats.topAccount.percentage.toFixed(1)}% des leads
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Activité Principale
                    </CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.topActivity.name}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {stats.topActivity.percentage.toFixed(1)}% des leads
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Comptes Actifs
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.activeAccounts}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Comptes générant des leads
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Tabs */}
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                  <TabsTrigger value="evolution">Évolution</TabsTrigger>
                  <TabsTrigger value="accounts">Par Compte</TabsTrigger>
                  <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <ChartWrapper
                      title="Leads par Compte"
                      description="Distribution des leads par compte Facebook (PV/PAC/ITE)"
                    >
                      <LeadsByAccountChart data={stats.byAccount} />
                    </ChartWrapper>

                    <ChartWrapper
                      title="Leads par Activité"
                      description="Répartition des types d'activité"
                    >
                      <LeadsByActivityChart data={stats.byActivity} />
                    </ChartWrapper>
                  </div>

                  <ChartWrapper
                    title="Évolution des Leads (30 derniers jours)"
                    description="Tendance des leads collectés au fil du temps"
                  >
                    <LeadsTimelineChart
                      data={timeSeriesData.slice(-30)}
                      splitByAccount={false}
                    />
                  </ChartWrapper>
                </TabsContent>

                {/* Evolution Tab */}
                <TabsContent value="evolution" className="space-y-4">
                  <ChartWrapper
                    title="Évolution Totale"
                    description="Total des leads au fil du temps"
                  >
                    <LeadsTimelineChart
                      data={timeSeriesData}
                      splitByAccount={false}
                    />
                  </ChartWrapper>

                  <ChartWrapper
                    title="Évolution par Compte"
                    description="Comparaison de l'évolution de chaque compte"
                  >
                    <LeadsTimelineChart
                      data={timeSeriesByAccount}
                      splitByAccount={true}
                    />
                  </ChartWrapper>
                </TabsContent>

                {/* Accounts Tab */}
                <TabsContent value="accounts" className="space-y-4">
                  <ChartWrapper
                    title="Performance des Comptes"
                    description="Analyse détaillée par compte Facebook"
                  >
                    <LeadsByAccountChart data={stats.byAccount} />
                  </ChartWrapper>

                  <Card>
                    <CardHeader>
                      <CardTitle>Détails par Compte</CardTitle>
                      <CardDescription>
                        Statistiques complètes pour chaque compte
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="text-left py-2 px-4 font-medium">
                                Compte
                              </th>
                              <th className="text-right py-2 px-4 font-medium">
                                Total
                              </th>
                              <th className="text-right py-2 px-4 font-medium">
                                PV
                              </th>
                              <th className="text-right py-2 px-4 font-medium">
                                PAC
                              </th>
                              <th className="text-right py-2 px-4 font-medium">
                                ITE
                              </th>
                              <th className="text-right py-2 px-4 font-medium">
                                %
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {stats.byAccount.map((account) => (
                              <tr key={account.name} className="border-b">
                                <td className="py-2 px-4 font-medium">
                                  {account.name}
                                </td>
                                <td className="text-right py-2 px-4">
                                  {account.count}
                                </td>
                                <td className="text-right py-2 px-4">
                                  {account.activities.PV}
                                </td>
                                <td className="text-right py-2 px-4">
                                  {account.activities.PAC}
                                </td>
                                <td className="text-right py-2 px-4">
                                  {account.activities.ITE}
                                </td>
                                <td className="text-right py-2 px-4">
                                  {account.percentage.toFixed(1)}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Heatmap Tab */}
                <TabsContent value="heatmap">
                  <ChartWrapper
                    title="Heatmap Compte × Date"
                    description="Visualisation de l'activité par compte et par jour"
                  >
                    <LeadsHeatmap data={heatmapData} />
                  </ChartWrapper>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
