/**
 * Leads Filters - Filter controls for leads analytics
 */

"use client"

import { useState, useEffect } from "react"
import { LeadsFilters } from "@/types/leads"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { Separator } from "@/components/ui/separator"
import { Filter, RotateCcw } from "lucide-react"
import { format, subDays, startOfMonth, endOfMonth, subMonths } from "date-fns"

interface LeadsFiltersProps {
  onApply: (filters: LeadsFilters) => void
  initialFilters?: LeadsFilters
}

export function LeadsFiltersComponent({
  onApply,
  initialFilters,
}: LeadsFiltersProps) {
  const [filters, setFilters] = useState<LeadsFilters>(
    initialFilters || {
      dateFrom: null,
      dateTo: null,
      comptes: [],
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
      comptes: [],
      search: "",
    }
    setFilters(resetFilters)
    onApply(resetFilters)
  }

  const handleApply = () => {
    onApply(filters)
  }

  const handlePreset = (preset: string) => {
    const now = new Date()
    const formatDate = (d: Date) => format(d, "yyyy-MM-dd")

    let dateFrom = ""
    let dateTo = formatDate(now)

    switch (preset) {
      case "7d":
        dateFrom = formatDate(subDays(now, 7))
        break
      case "30d":
        dateFrom = formatDate(subDays(now, 30))
        break
      case "thisMonth":
        dateFrom = formatDate(startOfMonth(now))
        dateTo = formatDate(endOfMonth(now))
        break
      case "lastMonth":
        const lastMonth = subMonths(now, 1)
        dateFrom = formatDate(startOfMonth(lastMonth))
        dateTo = formatDate(endOfMonth(lastMonth))
        break
    }

    setFilters({ ...filters, dateFrom, dateTo })
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
      <CardContent className="space-y-6">
        {/* Account Filter - Toggle Group */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Comptes (3 actifs)</label>
          <ToggleGroup
            type="multiple"
            value={filters.comptes}
            onValueChange={(value) => setFilters({ ...filters, comptes: value })}
            className="justify-start flex-wrap"
          >
            <ToggleGroupItem value="INVF" variant="outline">
              INVF <Badge variant="secondary" className="ml-2">3429</Badge>
            </ToggleGroupItem>
            <ToggleGroupItem value="INVC3" variant="outline">
              INVC3 <Badge variant="secondary" className="ml-2">1735</Badge>
            </ToggleGroupItem>
            <ToggleGroupItem value="INVC4" variant="outline">
              INVC4 <Badge variant="secondary" className="ml-2">1063</Badge>
            </ToggleGroupItem>
          </ToggleGroup>
        </div>

        <Separator />

        {/* Date Presets */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Période rapide</label>
          <div className="grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePreset("7d")}
            >
              7 derniers jours
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePreset("30d")}
            >
              30 derniers jours
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePreset("thisMonth")}
            >
              Ce mois
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePreset("lastMonth")}
            >
              Mois dernier
            </Button>
          </div>
        </div>

        <Separator />

        {/* Custom Date Range */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Dates personnalisées</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-muted-foreground">Du</label>
              <Input
                type="date"
                value={filters.dateFrom || ""}
                onChange={(e) =>
                  setFilters({ ...filters, dateFrom: e.target.value || null })
                }
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground">Au</label>
              <Input
                type="date"
                value={filters.dateTo || ""}
                onChange={(e) =>
                  setFilters({ ...filters, dateTo: e.target.value || null })
                }
              />
            </div>
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
