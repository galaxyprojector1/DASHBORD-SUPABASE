/**
 * Leads Analytics Dashboard - Main page
 * Comprehensive analytics interface for Facebook leads
 */

"use client"

// Force dynamic rendering to ensure fresh data on each request
export const dynamic = 'force-dynamic'

import { useState } from "react"
import { LeadsFilters } from "@/types/leads"
import { useLeadsData, useAccountComparison } from "@/hooks/useLeads"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LeadsFiltersComponent } from "@/components/leads/leads-filters"
import { LeadsDataTable } from "@/components/leads/data-table"
import { ExportActions } from "@/components/leads/export-actions"
import { ChartWrapper } from "@/components/charts/chart-wrapper"
import { LeadsByAccountChart } from "@/components/charts/leads-by-account-chart"
import { LeadsTimelineChart } from "@/components/charts/leads-timeline-chart"
import { LeadsHeatmap } from "@/components/charts/leads-heatmap"
import { AccountComparisonChart } from "@/components/charts/account-comparison-chart"
import { ComparisonInsightsPanel } from "@/components/charts/comparison-insights-panel"
import { Badge } from "@/components/ui/badge"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import {
  Users,
  TrendingUp,
  Activity,
  Building2,
  ArrowUpIcon,
  ArrowDownIcon,
  Calendar,
} from "lucide-react"
import { format, parseISO } from "date-fns"
import { fr } from "date-fns/locale"
import {
  KpiGridSkeleton,
  OverviewTabSkeleton,
  EvolutionTabSkeleton,
  AccountsTabSkeleton,
  HeatmapTabSkeleton,
} from "@/components/leads/skeletons"

export default function LeadsAnalyticsPage() {
  // Active filters
  const [filters, setFilters] = useState<LeadsFilters>({
    dateFrom: null,
    dateTo: null,
    comptes: [],
    search: "",
  })

  // Selected accounts for comparison
  const [selectedAccounts, setSelectedAccounts] = useState<string[]>(["INVF", "INVC3", "INVC4"])

  // Fetch all data with React Query
  const {
    stats,
    timeSeriesTotal,
    timeSeriesSplit,
    heatmap,
    allLeads,
    isLoading,
    isError,
    error,
  } = useLeadsData(filters)

  // Fetch comparison data
  const comparison = useAccountComparison(selectedAccounts, filters)

  // Handle filter changes
  const handleApplyFilters = (newFilters: LeadsFilters) => {
    setFilters(newFilters)
  }

  // Handle account selection for comparison
  const handleAccountSelection = (value: string[]) => {
    setSelectedAccounts(value)
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
            onApply={handleApplyFilters}
            initialFilters={filters}
          />
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Loading State */}
          {isLoading && (
            <>
              <KpiGridSkeleton />
              <OverviewTabSkeleton />
            </>
          )}

          {/* Error State */}
          {isError && !isLoading && (
            <Card>
              <CardContent className="pt-6">
                <p className="text-destructive text-center">
                  Erreur: {error instanceof Error ? error.message : "Une erreur est survenue"}. Vérifiez la console pour plus de détails.
                </p>
              </CardContent>
            </Card>
          )}

          {/* Data Display */}
          {!isLoading && !isError && stats.data && (
            <>
              {/* KPI Cards - 6 cards in 2x3 grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* KPI 1: Total Leads */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Leads
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.data.total}</div>
                    <p className="text-xs text-muted-foreground">
                      Leads PV collectés
                    </p>
                  </CardContent>
                </Card>

                {/* KPI 2: Top Account */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Compte Principal
                    </CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.data.topAccount.name}
                    </div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-muted-foreground">
                        {stats.data.topAccount.percentage.toFixed(1)}% des leads
                      </p>
                      <Badge variant="secondary">{stats.data.topAccount.count}</Badge>
                    </div>
                  </CardContent>
                </Card>

                {/* KPI 3: Daily Average */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Moyenne / Jour
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.data.dailyAverage.toFixed(0)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Sur {stats.data.totalDays} jours actifs
                    </p>
                  </CardContent>
                </Card>

                {/* KPI 4: Best Day */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Meilleur Jour
                    </CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.data.bestDay.count}</div>
                    <p className="text-xs text-muted-foreground">
                      {stats.data.bestDay.date
                        ? format(parseISO(stats.data.bestDay.date), "dd MMMM yyyy", {
                            locale: fr,
                          })
                        : "N/A"}
                    </p>
                  </CardContent>
                </Card>

                {/* KPI 5: Active Accounts */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Comptes Actifs
                    </CardTitle>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {stats.data.activeAccounts}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Comptes générant des leads
                    </p>
                  </CardContent>
                </Card>

                {/* KPI 6: Weekly Trend */}
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Tendance 7j
                    </CardTitle>
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold flex items-center gap-2">
                      {stats.data.weeklyTrend > 0 ? "+" : ""}
                      {stats.data.weeklyTrend.toFixed(1)}%
                      {stats.data.weeklyTrend > 0 ? (
                        <ArrowUpIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <ArrowDownIcon className="h-4 w-4 text-red-500" />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      vs semaine précédente
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Charts Tabs */}
              <Tabs defaultValue="overview" className="space-y-4">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
                  <TabsTrigger value="comparison">Comparaison</TabsTrigger>
                  <TabsTrigger value="evolution">Évolution</TabsTrigger>
                  <TabsTrigger value="accounts">Par Compte</TabsTrigger>
                  <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
                  <TabsTrigger value="details">Détails</TabsTrigger>
                </TabsList>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-4">
                  {timeSeriesTotal.isLoading ? (
                    <OverviewTabSkeleton />
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ChartWrapper
                        title="Leads par Compte"
                        description="Distribution PV uniquement (INVF, INVC3, INVC4)"
                      >
                        <LeadsByAccountChart data={stats.data.byAccount} />
                      </ChartWrapper>

                      <ChartWrapper
                        title="Évolution 30j"
                        description="Tendance récente des leads PV"
                      >
                        <LeadsTimelineChart
                          data={timeSeriesTotal.data?.slice(-30) || []}
                          splitByAccount={false}
                        />
                      </ChartWrapper>
                    </div>
                  )}
                </TabsContent>

                {/* Comparison Tab */}
                <TabsContent value="comparison" className="space-y-4">
                  {/* Account Selection */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Sélection des Comptes</CardTitle>
                      <CardDescription>
                        Choisissez les comptes à comparer
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ToggleGroup
                        type="multiple"
                        value={selectedAccounts}
                        onValueChange={handleAccountSelection}
                        className="justify-start"
                      >
                        <ToggleGroupItem value="INVF" aria-label="Toggle INVF">
                          INVF
                        </ToggleGroupItem>
                        <ToggleGroupItem value="INVC3" aria-label="Toggle INVC3">
                          INVC3
                        </ToggleGroupItem>
                        <ToggleGroupItem value="INVC4" aria-label="Toggle INVC4">
                          INVC4
                        </ToggleGroupItem>
                      </ToggleGroup>
                      <p className="text-xs text-muted-foreground mt-2">
                        {selectedAccounts.length} compte(s) sélectionné(s)
                      </p>
                    </CardContent>
                  </Card>

                  {/* Comparison Chart */}
                  {comparison.isLoading ? (
                    <Card>
                      <CardContent className="pt-6">
                        <div className="h-[400px] flex items-center justify-center">
                          <p className="text-muted-foreground">Chargement des données de comparaison...</p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      <ChartWrapper
                        title="Évolution Comparative"
                        description="Comparaison de l'évolution des comptes sélectionnés"
                      >
                        <AccountComparisonChart data={comparison.data || []} />
                      </ChartWrapper>

                      {/* Insights Panel */}
                      <ComparisonInsightsPanel data={comparison.data || []} />
                    </>
                  )}
                </TabsContent>

                {/* Evolution Tab */}
                <TabsContent value="evolution" className="space-y-4">
                  {timeSeriesTotal.isLoading || timeSeriesSplit.isLoading ? (
                    <EvolutionTabSkeleton />
                  ) : (
                    <>
                      <ChartWrapper
                        title="Évolution Totale"
                        description="Total des leads au fil du temps"
                      >
                        <LeadsTimelineChart
                          data={timeSeriesTotal.data || []}
                          splitByAccount={false}
                        />
                      </ChartWrapper>

                      <ChartWrapper
                        title="Évolution par Compte"
                        description="Comparaison de l'évolution de chaque compte"
                      >
                        <LeadsTimelineChart
                          data={timeSeriesSplit.data || []}
                          splitByAccount={true}
                        />
                      </ChartWrapper>
                    </>
                  )}
                </TabsContent>

                {/* Accounts Tab */}
                <TabsContent value="accounts" className="space-y-4">
                  {stats.isLoading ? (
                    <AccountsTabSkeleton />
                  ) : (
                    <>
                      <ChartWrapper
                        title="Performance des Comptes"
                        description="Analyse détaillée par compte Facebook"
                      >
                        <LeadsByAccountChart data={stats.data.byAccount} />
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
                                    Total PV
                                  </th>
                                  <th className="text-right py-2 px-4 font-medium">
                                    %
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {stats.data.byAccount.map((account) => (
                                  <tr key={account.name} className="border-b">
                                    <td className="py-2 px-4 font-medium">
                                      {account.name}
                                    </td>
                                    <td className="text-right py-2 px-4">
                                      {account.pvCount}
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
                    </>
                  )}
                </TabsContent>

                {/* Heatmap Tab */}
                <TabsContent value="heatmap">
                  {heatmap.isLoading ? (
                    <HeatmapTabSkeleton />
                  ) : (
                    <ChartWrapper
                      title="Heatmap Compte × Date"
                      description="Visualisation de l'activité par compte et par jour"
                    >
                      <LeadsHeatmap data={heatmap.data || []} />
                    </ChartWrapper>
                  )}
                </TabsContent>

                {/* Details Tab */}
                <TabsContent value="details">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>Table Détaillée des Leads</CardTitle>
                          <CardDescription>
                            Liste complète avec tous les champs disponibles
                          </CardDescription>
                        </div>
                        <ExportActions
                          data={allLeads.data || []}
                          disabled={allLeads.isLoading}
                        />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <LeadsDataTable
                        data={allLeads.data || []}
                        loading={allLeads.isLoading}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
