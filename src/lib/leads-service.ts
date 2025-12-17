/**
 * Leads Service - Centralized Supabase queries for Facebook leads
 * Handles data fetching, filtering, and client-side aggregations
 */

import { createClient } from "@/lib/supabase/client"
import {
  FacebookLead,
  LeadStats,
  AccountStats,
  DateStats,
  HeatmapData,
  LeadsFilters,
  AccountComparisonData,
} from "@/types/leads"
import { format, parseISO } from "date-fns"

const TABLE_NAME = "NEW-FACEBOOK"

export class LeadsService {
  /**
   * Fetch raw leads with applied filters
   */
  static async fetchLeads(
    filters: LeadsFilters
  ): Promise<FacebookLead[]> {
    const supabase = createClient()

    // HARDCODED: Only 3 active accounts + PV activity
    let query = supabase
      .from(TABLE_NAME)
      .select("*")
      .in("compte", ["INVF", "INVC3", "INVC4"])
      .eq("activité", "PV")

    // Date filters (compare dates, not timestamps)
    if (filters.dateFrom) {
      // Start of day: dateFrom 00:00:00
      query = query.gte("date_collecte", `${filters.dateFrom}T00:00:00`)
    }
    if (filters.dateTo) {
      // End of day: dateTo 23:59:59
      query = query.lte("date_collecte", `${filters.dateTo}T23:59:59`)
    }

    // Account filter (if specific among the 3)
    if (filters.comptes.length > 0 && filters.comptes.length < 3) {
      query = query.in("compte", filters.comptes)
    }

    // Search filter (name or email)
    if (filters.search) {
      query = query.or(
        `nom.ilike.%${filters.search}%,email.ilike.%${filters.search}%`
      )
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching leads:", error)
      throw new Error(`Failed to fetch leads: ${error.message}`)
    }

    return (data as FacebookLead[]) || []
  }

  /**
   * Get comprehensive statistics with filters applied
   */
  static async getLeadStats(filters: LeadsFilters): Promise<LeadStats> {
    const leads = await this.fetchLeads(filters)
    const total = leads.length

    // Group by account
    const accountMap = new Map<string, { count: number; pvCount: number }>()
    leads.forEach((lead) => {
      const account = lead.compte

      if (!accountMap.has(account)) {
        accountMap.set(account, {
          count: 0,
          pvCount: 0,
        })
      }

      const accountData = accountMap.get(account)!
      accountData.count++
      accountData.pvCount++ // All leads are PV (hardcoded filter)
    })

    // Convert to AccountStats array
    const byAccount: AccountStats[] = Array.from(accountMap.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        percentage: total > 0 ? (data.count / total) * 100 : 0,
        pvCount: data.pvCount,
      }))
      .sort((a, b) => b.count - a.count)

    // Group by date
    const dateMap = new Map<string, number>()
    leads.forEach((lead) => {
      try {
        const date = format(parseISO(lead.date_collecte), "yyyy-MM-dd")
        dateMap.set(date, (dateMap.get(date) || 0) + 1)
      } catch (error) {
        console.warn("Invalid date format:", lead.date_collecte)
      }
    })

    const byDate: DateStats[] = Array.from(dateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))

    // Top account
    const topAccount =
      byAccount.length > 0
        ? {
            name: byAccount[0].name,
            count: byAccount[0].count,
            percentage: byAccount[0].percentage,
          }
        : { name: "N/A", count: 0, percentage: 0 }

    // New KPIs
    const totalDays = byDate.length
    const dailyAverage = totalDays > 0 ? total / totalDays : 0

    const bestDay =
      byDate.length > 0
        ? byDate.reduce((max, curr) => (curr.count > max.count ? curr : max))
        : { date: "", count: 0 }

    // Weekly trend (last 7 days vs previous 7 days)
    const last7Days = byDate.slice(-7)
    const prev7Days = byDate.slice(-14, -7)
    const last7Total = last7Days.reduce((sum, d) => sum + d.count, 0)
    const prev7Total = prev7Days.reduce((sum, d) => sum + d.count, 0)
    const weeklyTrend =
      prev7Total > 0 ? ((last7Total - prev7Total) / prev7Total) * 100 : 0

    return {
      total,
      byAccount,
      byDate,
      topAccount,
      activeAccounts: accountMap.size,
      dailyAverage,
      totalDays,
      bestDay,
      weeklyTrend,
    }
  }

  /**
   * Get time series data (evolution over time)
   * Optionally split by account
   */
  static async getTimeSeriesData(
    filters: LeadsFilters,
    splitByAccount = false
  ): Promise<DateStats[]> {
    const leads = await this.fetchLeads(filters)

    if (!splitByAccount) {
      // Simple aggregation by date
      const dateMap = new Map<string, number>()
      leads.forEach((lead) => {
        try {
          const date = format(parseISO(lead.date_collecte), "yyyy-MM-dd")
          dateMap.set(date, (dateMap.get(date) || 0) + 1)
        } catch (error) {
          console.warn("Invalid date format:", lead.date_collecte)
        }
      })

      return Array.from(dateMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))
    } else {
      // Aggregation by date AND account
      const dateAccountMap = new Map<
        string,
        { count: number; byAccount: Map<string, number> }
      >()

      leads.forEach((lead) => {
        try {
          const date = format(parseISO(lead.date_collecte), "yyyy-MM-dd")
          const account = lead.compte

          if (!dateAccountMap.has(date)) {
            dateAccountMap.set(date, { count: 0, byAccount: new Map() })
          }

          const dateData = dateAccountMap.get(date)!
          dateData.count++
          dateData.byAccount.set(
            account,
            (dateData.byAccount.get(account) || 0) + 1
          )
        } catch (error) {
          console.warn("Invalid date format:", lead.date_collecte)
        }
      })

      return Array.from(dateAccountMap.entries())
        .map(([date, data]) => ({
          date,
          count: data.count,
          byAccount: Object.fromEntries(data.byAccount),
        }))
        .sort((a, b) => a.date.localeCompare(b.date))
    }
  }

  /**
   * Get heatmap data (account × date matrix)
   */
  static async getHeatmapData(
    filters: LeadsFilters
  ): Promise<HeatmapData[]> {
    const leads = await this.fetchLeads(filters)

    const heatmapMap = new Map<string, number>()

    leads.forEach((lead) => {
      try {
        const date = format(parseISO(lead.date_collecte), "yyyy-MM-dd")
        const account = lead.compte
        const key = `${account}|${date}`

        heatmapMap.set(key, (heatmapMap.get(key) || 0) + 1)
      } catch (error) {
        console.warn("Invalid date format:", lead.date_collecte)
      }
    })

    return Array.from(heatmapMap.entries())
      .map(([key, value]) => {
        const [account, date] = key.split("|")
        return { account, date, value }
      })
      .sort((a, b) => {
        // Sort by account, then by date
        if (a.account !== b.account) {
          return a.account.localeCompare(b.account)
        }
        return a.date.localeCompare(b.date)
      })
  }

  /**
   * Get complete list of leads with filters applied
   * Returns all lead data for detailed table display
   */
  static async getAllLeads(filters: LeadsFilters): Promise<FacebookLead[]> {
    return this.fetchLeads(filters)
  }

  /**
   * Get list of unique accounts (hardcoded - 3 active accounts only)
   */
  static async getAccounts(): Promise<string[]> {
    return ["INVF", "INVC3", "INVC4"]
  }

  /**
   * Compare multiple accounts with detailed metrics
   */
  static async compareAccounts(
    accountNames: string[],
    filters: LeadsFilters
  ): Promise<AccountComparisonData[]> {
    // Fetch leads for all accounts
    const allLeads = await this.fetchLeads(filters)

    // Build comparison data for each account
    const comparisonResults = accountNames.map((accountName) => {
      // Filter leads for this specific account
      const accountLeads = allLeads.filter(
        (lead) => lead.compte === accountName
      )

      const totalPV = accountLeads.length

      // Build date map for time series
      const dateMap = new Map<string, number>()
      accountLeads.forEach((lead) => {
        try {
          const date = format(parseISO(lead.date_collecte), "yyyy-MM-dd")
          dateMap.set(date, (dateMap.get(date) || 0) + 1)
        } catch (error) {
          console.warn("Invalid date format:", lead.date_collecte)
        }
      })

      // Convert to time series array
      const timeSeriesData: DateStats[] = Array.from(dateMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))

      // Calculate daily average
      const totalDays = timeSeriesData.length
      const dailyAvg = totalDays > 0 ? totalPV / totalDays : 0

      // Calculate weekly trend (last 7 days vs previous 7 days)
      const last7Days = timeSeriesData.slice(-7)
      const prev7Days = timeSeriesData.slice(-14, -7)
      const last7Total = last7Days.reduce((sum, d) => sum + d.count, 0)
      const prev7Total = prev7Days.reduce((sum, d) => sum + d.count, 0)
      const weeklyTrend =
        prev7Total > 0 ? ((last7Total - prev7Total) / prev7Total) * 100 : 0

      return {
        accountName,
        totalPV,
        dailyAvg,
        weeklyTrend,
        timeSeriesData,
      }
    })

    return comparisonResults
  }
}
