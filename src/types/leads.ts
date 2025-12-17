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
  pvCount: number
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
  byDate: DateStats[]
  topAccount: {
    name: string
    count: number
    percentage: number
  }
  activeAccounts: number
  dailyAverage: number
  totalDays: number
  bestDay: {
    date: string
    count: number
  }
  weeklyTrend: number
}

// Filter state
export interface LeadsFilters {
  dateFrom: string | null // YYYY-MM-DD
  dateTo: string | null // YYYY-MM-DD
  comptes: string[] // Array of selected accounts
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

// Account comparison data
export interface AccountComparisonData {
  accountName: string
  totalPV: number
  dailyAvg: number
  weeklyTrend: number
  timeSeriesData: DateStats[]
}
