/**
 * Leads Service - Centralized Supabase queries for Facebook leads
 * Handles data fetching, filtering, and client-side aggregations
 */

import { supabase } from "./supabase"
import {
  FacebookLead,
  LeadStats,
  AccountStats,
  ActivityStats,
  DateStats,
  HeatmapData,
  LeadsFilters,
  ACTIVITY_COLORS,
} from "@/types/leads"
import { format, parseISO } from "date-fns"

const TABLE_NAME = "NEW-FACEBOOK"

export class LeadsService {
  /**
   * Fetch raw leads with applied filters
   */
  private static async fetchLeads(
    filters: LeadsFilters
  ): Promise<FacebookLead[]> {
    let query = supabase.from(TABLE_NAME).select("*")

    // Date filters
    if (filters.dateFrom) {
      query = query.gte("date_collecte", filters.dateFrom)
    }
    if (filters.dateTo) {
      query = query.lte("date_collecte", filters.dateTo)
    }

    // Account filter
    if (filters.compte && filters.compte !== "Tous") {
      query = query.eq("compte", filters.compte)
    }

    // Activity filter
    if (filters.activité && filters.activité !== "Toutes") {
      query = query.eq("activité", filters.activité)
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
    const accountMap = new Map<
      string,
      { count: number; activities: { PV: number; PAC: number; ITE: number } }
    >()
    leads.forEach((lead) => {
      const account = lead.compte
      const activity = lead.activité

      if (!accountMap.has(account)) {
        accountMap.set(account, {
          count: 0,
          activities: { PV: 0, PAC: 0, ITE: 0 },
        })
      }

      const accountData = accountMap.get(account)!
      accountData.count++

      // Count activities
      if (activity === "PV") accountData.activities.PV++
      else if (activity === "PAC") accountData.activities.PAC++
      else if (activity === "ITE") accountData.activities.ITE++
    })

    // Convert to AccountStats array
    const byAccount: AccountStats[] = Array.from(accountMap.entries())
      .map(([name, data]) => ({
        name,
        count: data.count,
        percentage: total > 0 ? (data.count / total) * 100 : 0,
        activities: data.activities,
      }))
      .sort((a, b) => b.count - a.count)

    // Group by activity
    const activityMap = new Map<string, number>()
    leads.forEach((lead) => {
      const activity = lead.activité
      activityMap.set(activity, (activityMap.get(activity) || 0) + 1)
    })

    const byActivity: ActivityStats[] = Array.from(activityMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: total > 0 ? (count / total) * 100 : 0,
        color: ACTIVITY_COLORS[name] || "#64748b",
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

    // Top account and activity
    const topAccount =
      byAccount.length > 0
        ? { name: byAccount[0].name, percentage: byAccount[0].percentage }
        : { name: "N/A", percentage: 0 }

    const topActivity =
      byActivity.length > 0
        ? { name: byActivity[0].name, percentage: byActivity[0].percentage }
        : { name: "N/A", percentage: 0 }

    return {
      total,
      byAccount,
      byActivity,
      byDate,
      topAccount,
      topActivity,
      activeAccounts: accountMap.size,
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
   * Get list of unique accounts for dropdown
   */
  static async getAccounts(): Promise<string[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("compte")
      .order("compte")

    if (error) {
      console.error("Error fetching accounts:", error)
      throw new Error(`Failed to fetch accounts: ${error.message}`)
    }

    if (!data) return []

    // Get unique accounts
    const accounts = Array.from(
      new Set(data.map((item: any) => item.compte as string))
    )

    return accounts
  }

  /**
   * Get list of unique activities for dropdown
   */
  static async getActivities(): Promise<string[]> {
    const { data, error } = await supabase
      .from(TABLE_NAME)
      .select("activité")
      .order("activité")

    if (error) {
      console.error("Error fetching activities:", error)
      throw new Error(`Failed to fetch activities: ${error.message}`)
    }

    if (!data) return []

    // Get unique activities
    const activities = Array.from(
      new Set(data.map((item: any) => item.activité as string))
    )

    return activities
  }
}
