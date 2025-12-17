/**
 * React Query hooks for Leads data
 * Provides optimized data fetching with caching and deduplication
 */

import { useQuery } from "@tanstack/react-query"
import { LeadsService } from "@/lib/leads-service"
import {
  LeadStats,
  DateStats,
  HeatmapData,
  LeadsFilters,
  FacebookLead,
  AccountComparisonData,
} from "@/types/leads"

// Query keys factory
export const leadsKeys = {
  all: ["leads"] as const,
  stats: (filters: LeadsFilters) => [...leadsKeys.all, "stats", filters] as const,
  timeSeries: (filters: LeadsFilters, splitByAccount: boolean) =>
    [...leadsKeys.all, "timeSeries", filters, splitByAccount] as const,
  heatmap: (filters: LeadsFilters) => [...leadsKeys.all, "heatmap", filters] as const,
  accounts: () => [...leadsKeys.all, "accounts"] as const,
  allLeads: (filters: LeadsFilters) => [...leadsKeys.all, "allLeads", filters] as const,
  comparison: (accountNames: string[], filters: LeadsFilters) =>
    [...leadsKeys.all, "comparison", accountNames, filters] as const,
}

/**
 * Hook to fetch lead statistics
 */
export function useLeadStats(filters: LeadsFilters) {
  return useQuery({
    queryKey: leadsKeys.stats(filters),
    queryFn: () => LeadsService.getLeadStats(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
  })
}

/**
 * Hook to fetch time series data (total or split by account)
 */
export function useTimeSeriesData(
  filters: LeadsFilters,
  splitByAccount: boolean = false
) {
  return useQuery({
    queryKey: leadsKeys.timeSeries(filters, splitByAccount),
    queryFn: () => LeadsService.getTimeSeriesData(filters, splitByAccount),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })
}

/**
 * Hook to fetch heatmap data
 */
export function useHeatmapData(filters: LeadsFilters) {
  return useQuery({
    queryKey: leadsKeys.heatmap(filters),
    queryFn: () => LeadsService.getHeatmapData(filters),
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
  })
}

/**
 * Hook to fetch available accounts
 */
export function useAccounts() {
  return useQuery({
    queryKey: leadsKeys.accounts(),
    queryFn: () => LeadsService.getAccounts(),
    staleTime: Infinity, // Accounts rarely change
    gcTime: 1000 * 60 * 60, // 1 hour
  })
}

/**
 * Hook to fetch all leads data (for detailed table)
 */
export function useAllLeads(filters: LeadsFilters) {
  return useQuery({
    queryKey: leadsKeys.allLeads(filters),
    queryFn: () => LeadsService.getAllLeads(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  })
}

/**
 * Hook to fetch account comparison data
 */
export function useAccountComparison(
  accountNames: string[],
  filters: LeadsFilters
) {
  return useQuery({
    queryKey: leadsKeys.comparison(accountNames, filters),
    queryFn: () => LeadsService.compareAccounts(accountNames, filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
    enabled: accountNames.length > 0, // Only run if accounts are selected
  })
}

/**
 * Combined hook for all leads data
 * Fetches all required data in parallel
 */
export function useLeadsData(filters: LeadsFilters) {
  const stats = useLeadStats(filters)
  const timeSeriesTotal = useTimeSeriesData(filters, false)
  const timeSeriesSplit = useTimeSeriesData(filters, true)
  const heatmap = useHeatmapData(filters)
  const allLeads = useAllLeads(filters)

  return {
    stats,
    timeSeriesTotal,
    timeSeriesSplit,
    heatmap,
    allLeads,
    isLoading:
      stats.isLoading ||
      timeSeriesTotal.isLoading ||
      timeSeriesSplit.isLoading ||
      heatmap.isLoading ||
      allLeads.isLoading,
    isError:
      stats.isError ||
      timeSeriesTotal.isError ||
      timeSeriesSplit.isError ||
      heatmap.isError ||
      allLeads.isError,
    error:
      stats.error ||
      timeSeriesTotal.error ||
      timeSeriesSplit.error ||
      heatmap.error ||
      allLeads.error,
  }
}
