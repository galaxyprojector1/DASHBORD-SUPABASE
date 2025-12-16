/**
 * Leads Filters - Filter controls for leads analytics
 */

"use client"

import { useState, useEffect } from "react"
import { LeadsFilters } from "@/types/leads"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Filter, RotateCcw } from "lucide-react"

interface LeadsFiltersProps {
  accounts: string[]
  activities: string[]
  onApply: (filters: LeadsFilters) => void
  initialFilters?: LeadsFilters
}

export function LeadsFiltersComponent({
  accounts,
  activities,
  onApply,
  initialFilters,
}: LeadsFiltersProps) {
  const [filters, setFilters] = useState<LeadsFilters>(
    initialFilters || {
      dateFrom: null,
      dateTo: null,
      compte: "Tous",
      activité: "Toutes",
      search: "",
    }
  )

  // Update local state when initial filters change
  useEffect(() => {
    if (initialFilters) {
      setFilters(initialFilters)
    }
  }, [initialFilters])

  const handleReset = () => {
    const resetFilters: LeadsFilters = {
      dateFrom: null,
      dateTo: null,
      compte: "Tous",
      activité: "Toutes",
      search: "",
    }
    setFilters(resetFilters)
    onApply(resetFilters)
  }

  const handleApply = () => {
    onApply(filters)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Filter className="h-5 w-5" />
          Filtres
        </CardTitle>
        <CardDescription>
          Affinez votre analyse des leads
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Account Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Compte Facebook</label>
          <Select
            value={filters.compte || "Tous"}
            onValueChange={(value) =>
              setFilters({ ...filters, compte: value === "Tous" ? null : value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un compte" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Tous">Tous les comptes</SelectItem>
              {accounts.map((account) => (
                <SelectItem key={account} value={account}>
                  {account}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Activity Filter */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Activité</label>
          <Select
            value={filters.activité || "Toutes"}
            onValueChange={(value) =>
              setFilters({ ...filters, activité: value === "Toutes" ? null : value })
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une activité" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Toutes">Toutes les activités</SelectItem>
              {activities.map((activity) => (
                <SelectItem key={activity} value={activity}>
                  {activity}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Période</label>
          <div className="space-y-2">
            <Input
              type="date"
              value={filters.dateFrom || ""}
              onChange={(e) =>
                setFilters({ ...filters, dateFrom: e.target.value || null })
              }
              placeholder="Date de début"
            />
            <Input
              type="date"
              value={filters.dateTo || ""}
              onChange={(e) =>
                setFilters({ ...filters, dateTo: e.target.value || null })
              }
              placeholder="Date de fin"
            />
          </div>
        </div>

        {/* Search */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Recherche</label>
          <Input
            type="text"
            value={filters.search}
            onChange={(e) =>
              setFilters({ ...filters, search: e.target.value })
            }
            placeholder="Nom ou email..."
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          <Button onClick={handleApply} className="flex-1">
            <Filter className="h-4 w-4 mr-2" />
            Appliquer
          </Button>
          <Button onClick={handleReset} variant="outline">
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
