/**
 * React Query hooks for leads data
 * Centralized data fetching with proper caching and error handling
 */

import { useQuery } from "@tanstack/react-query"
import { LeadsService } from "@/lib/leads-service"
import {
  LeadStats,
  DateStats,
  HeatmapData,
  FacebookLead,
  LeadsFilters,
} from "@/types/leads"

/**
 * Hook to fetch lead statistics with filters
 */
export function useLeadStats(filters: LeadsFilters) {
  return useQuery<LeadStats, Error>({
    queryKey: ["leadStats", filters],
    queryFn: async () => {
      try {
        return await LeadsService.getLeadStats(filters)
      } catch (error) {
        console.error("Error fetching lead stats:", error)
        throw error instanceof Error
          ? error
          : new Error("Failed to fetch lead stats")
      }
    },
  })
}

/**
 * Hook to fetch time series data with filters
 */
export function useLeadsTimeSeries(
  filters: LeadsFilters,
  splitByAccount = false
) {
  return useQuery<DateStats[], Error>({
    queryKey: ["leadsTimeSeries", filters, splitByAccount],
    queryFn: async () => {
      try {
        return await LeadsService.getTimeSeriesData(filters, splitByAccount)
      } catch (error) {
        console.error("Error fetching time series data:", error)
        throw error instanceof Error
          ? error
          : new Error("Failed to fetch time series data")
      }
    },
  })
}

/**
 * Hook to fetch heatmap data with filters
 */
export function useLeadsHeatmap(filters: LeadsFilters) {
  return useQuery<HeatmapData[], Error>({
    queryKey: ["leadsHeatmap", filters],
    queryFn: async () => {
      try {
        return await LeadsService.getHeatmapData(filters)
      } catch (error) {
        console.error("Error fetching heatmap data:", error)
        throw error instanceof Error
          ? error
          : new Error("Failed to fetch heatmap data")
      }
    },
  })
}

/**
 * Hook to fetch all leads with filters
 */
export function useAllLeads(filters: LeadsFilters) {
  return useQuery<FacebookLead[], Error>({
    queryKey: ["allLeads", filters],
    queryFn: async () => {
      try {
        return await LeadsService.fetchLeads(filters)
      } catch (error) {
        console.error("Error fetching all leads:", error)
        throw error instanceof Error
          ? error
          : new Error("Failed to fetch all leads")
      }
    },
  })
}
