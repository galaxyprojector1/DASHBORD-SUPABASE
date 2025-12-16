/**
 * Type definitions for Facebook Leads Analytics
 * Table: NEW-FACEBOOK (6388 leads)
 */

// Raw Facebook Lead structure from Supabase
export interface FacebookLead {
  compte: string
  activité: string
  nom: string
  code_postal: string | null
  email: string | null
  tel: string | null
  date_collecte: string // ISO date string
  PARIS_Heure: string | null
  formulaire_id: string | null
  source: string | null
  données_brutes: any | null
}

// Statistics by account
export interface AccountStats {
  name: string
  count: number
  percentage: number
  activities: {
    PV: number
    PAC: number
    ITE: number
  }
}

// Statistics by activity type
export interface ActivityStats {
  name: string
  count: number
  percentage: number
  color: string
}

// Time series data point
export interface DateStats {
  date: string // Format: YYYY-MM-DD
  count: number
  byAccount?: {
    [accountName: string]: number
  }
}

// Heatmap data structure (account × date)
export interface HeatmapData {
  account: string
  date: string // Format: YYYY-MM-DD
  value: number
}

// Complete lead statistics
export interface LeadStats {
  total: number
  byAccount: AccountStats[]
  byActivity: ActivityStats[]
  byDate: DateStats[]
  topAccount: {
    name: string
    percentage: number
  }
  topActivity: {
    name: string
    percentage: number
  }
  activeAccounts: number
}

// Filter state
export interface LeadsFilters {
  dateFrom: string | null // YYYY-MM-DD
  dateTo: string | null // YYYY-MM-DD
  compte: string | null // "Tous" or specific account
  activité: string | null // "Toutes" or PV/PAC/ITE
  search: string // Search in name/email
}

// Activity color mapping
export const ACTIVITY_COLORS: Record<string, string> = {
  PV: "#3b82f6", // blue-500
  ITE: "#f97316", // orange-500
  PAC: "#10b981", // emerald-500
}

// Account color mapping for charts
export const ACCOUNT_COLORS: string[] = [
  "#3b82f6", // blue-500
  "#8b5cf6", // violet-500
  "#ec4899", // pink-500
  "#f59e0b", // amber-500
  "#10b981", // emerald-500
  "#06b6d4", // cyan-500
]
