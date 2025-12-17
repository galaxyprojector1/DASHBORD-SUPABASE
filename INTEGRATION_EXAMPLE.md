# Phase 6A - Intégration Table & Export

## Fichiers créés

### 1. `src/components/leads/data-table.tsx` (398 lignes)
Table interactive avec TanStack React Table incluant:
- Tri multi-colonnes sur Date, Compte, Nom, Activité
- Pagination configurable (10/25/50/100 lignes par page)
- Navigation complète (première/précédente/suivante/dernière page)
- Badges colorés pour comptes (INVF/INVC3/INVC4) et activités (PV/ITE/PAC)
- Affichage formaté des dates en français
- Design responsive avec Tailwind CSS et shadcn/ui

### 2. `src/components/leads/export-actions.tsx` (371 lignes)
Composants d'export avec deux options:
- **ExportActions**: Export CSV (papaparse) + PDF screenshot (html2canvas + jspdf)
- **ExportFullPDF**: Export PDF complet formaté avec toutes les données en tableau multi-pages
- États de chargement avec spinners
- Noms de fichiers horodatés automatiquement

### 3. `src/components/leads/README.md` (271 lignes)
Documentation complète incluant:
- Description des fonctionnalités
- Props TypeScript documentées
- Exemples d'utilisation
- Guide de personnalisation
- Instructions d'intégration

---

## Exemple d'intégration dans `src/app/dashboard/leads/page.tsx`

Pour ajouter la table détaillée avec exports à la page leads existante, ajouter cet onglet après "heatmap":

```tsx
// Ajouter les imports
import { LeadsDataTable } from "@/components/leads/data-table"
import { ExportActions } from "@/components/leads/export-actions"

// Dans le composant, ajouter un state pour les leads bruts
const [rawLeads, setRawLeads] = useState<FacebookLead[]>([])

// Dans le useEffect, charger les leads bruts en parallèle
useEffect(() => {
  async function loadData() {
    setLoading(true)
    setError(null)

    try {
      const [statsData, timeSeriesTotal, timeSeriesSplit, heatmap, leads] =
        await Promise.all([
          LeadsService.getLeadStats(filters),
          LeadsService.getTimeSeriesData(filters, false),
          LeadsService.getTimeSeriesData(filters, true),
          LeadsService.getHeatmapData(filters),
          LeadsService.fetchLeads(filters), // NOUVEAU
        ])

      setStats(statsData)
      setTimeSeriesData(timeSeriesTotal)
      setTimeSeriesByAccount(timeSeriesSplit)
      setHeatmapData(heatmap)
      setRawLeads(leads) // NOUVEAU
    } catch (err: any) {
      console.error("[Leads] Error loading data:", err)
      setError(`Erreur: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  loadData()
}, [filters])

// Modifier la TabsList pour ajouter l'onglet Table
<TabsList className="grid w-full grid-cols-5">
  <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
  <TabsTrigger value="evolution">Évolution</TabsTrigger>
  <TabsTrigger value="accounts">Par Compte</TabsTrigger>
  <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
  <TabsTrigger value="table">Tableau</TabsTrigger> {/* NOUVEAU */}
</TabsList>

// Ajouter le nouveau TabsContent après "heatmap"
<TabsContent value="table" className="space-y-4">
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <div>
        <CardTitle>Tableau détaillé des Leads</CardTitle>
        <CardDescription>
          Tous les leads avec tri, pagination et export
        </CardDescription>
      </div>
      <ExportActions
        data={rawLeads}
        disabled={loading}
        tableElementId="leads-table"
      />
    </CardHeader>
    <CardContent>
      <div id="leads-table">
        <LeadsDataTable data={rawLeads} loading={loading} />
      </div>
    </CardContent>
  </Card>
</TabsContent>
```

---

## Page standalone alternative

Pour créer une page dédiée à la table (par exemple `src/app/dashboard/leads/table/page.tsx`):

```tsx
"use client"

import { useState, useEffect } from "react"
import { LeadsDataTable } from "@/components/leads/data-table"
import { ExportActions, ExportFullPDF } from "@/components/leads/export-actions"
import { LeadsFiltersComponent } from "@/components/leads/leads-filters"
import { LeadsService } from "@/lib/leads-service"
import { FacebookLead, LeadsFilters } from "@/types/leads"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function LeadsTablePage() {
  const [leads, setLeads] = useState<FacebookLead[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState<LeadsFilters>({
    dateFrom: null,
    dateTo: null,
    comptes: [],
    search: "",
  })

  useEffect(() => {
    async function loadLeads() {
      setLoading(true)
      try {
        const data = await LeadsService.fetchLeads(filters)
        setLeads(data)
      } catch (error) {
        console.error("Error loading leads:", error)
      } finally {
        setLoading(false)
      }
    }
    loadLeads()
  }, [filters])

  const handleApplyFilters = (newFilters: LeadsFilters) => {
    setFilters(newFilters)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Tableau des Leads</h2>
        <p className="text-muted-foreground">
          Consultation détaillée avec tri, pagination et export
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
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>Liste des Leads</CardTitle>
                  <CardDescription>
                    {leads.length} lead{leads.length > 1 ? "s" : ""} trouvé{leads.length > 1 ? "s" : ""}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <ExportActions
                    data={leads}
                    disabled={loading}
                    tableElementId="leads-table"
                  />
                  <Separator orientation="vertical" className="h-8" />
                  <ExportFullPDF data={leads} disabled={loading} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div id="leads-table">
                <LeadsDataTable data={leads} loading={loading} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
```

---

## Fonctionnalités techniques

### Table (TanStack React Table)
- **Tri**: Cliquer sur les en-têtes de colonnes (Date, Compte, Nom, Activité)
- **Pagination**: Sélection du nombre de lignes (10/25/50/100)
- **Navigation**: Boutons première/précédente/suivante/dernière page
- **État vide**: Message "Aucun résultat" si aucune donnée
- **État de chargement**: Message "Chargement des données..."

### Export CSV (papaparse)
- Format: UTF-8 avec BOM pour Excel
- Colonnes: Date, Heure, Compte, Nom, Email, Téléphone, Code Postal, Activité, Source, Formulaire ID
- Nom fichier: `leads_export_YYYY-MM-DD_HH-mm-ss.csv`

### Export PDF Screenshot (html2canvas + jspdf)
- Capture la table visible à l'écran
- Format: A4 portrait
- Pagination automatique si > 1 page
- Nom fichier: `leads_export_YYYY-MM-DD_HH-mm-ss.pdf`

### Export PDF Complet
- Génère un PDF avec toutes les données (pas de limite)
- Format: A4 paysage
- En-têtes répétés sur chaque page
- Lignes alternées (gris/blanc)
- Footer avec numéro de page et total
- Nom fichier: `leads_full_export_YYYY-MM-DD_HH-mm-ss.pdf`

---

## Dépendances (déjà installées)

```json
{
  "@tanstack/react-table": "^8.21.3",
  "papaparse": "^5.5.3",
  "@types/papaparse": "^5.5.2",
  "jspdf": "^3.0.4",
  "html2canvas": "^1.4.1",
  "date-fns": "^4.1.0"
}
```

---

## Types TypeScript utilisés

Tous les types sont importés depuis `@/types/leads`:

```typescript
import { FacebookLead, LeadsFilters } from "@/types/leads"

// FacebookLead structure (déjà défini)
interface FacebookLead {
  compte: string
  activité: string
  nom: string
  code_postal: string | null
  email: string | null
  tel: string | null
  date_collecte: string
  PARIS_Heure: string | null
  formulaire_id: string | null
  source: string | null
  données_brutes: any | null
}
```

---

## Personnalisation rapide

### Changer les couleurs des badges

Dans `data-table.tsx`, lignes 18-29:

```typescript
const ACCOUNT_COLORS: Record<string, string> = {
  INVF: "bg-blue-500",      // Modifier ici
  INVC3: "bg-violet-500",   // Modifier ici
  INVC4: "bg-pink-500",     // Modifier ici
}

const ACTIVITY_COLORS: Record<string, string> = {
  PV: "bg-blue-500",        // Modifier ici
  ITE: "bg-orange-500",     // Modifier ici
  PAC: "bg-emerald-500",    // Modifier ici
}
```

### Changer la pagination par défaut

Dans `data-table.tsx`, ligne 52:

```typescript
const [pagination, setPagination] = useState<PaginationState>({
  pageIndex: 0,
  pageSize: 25,  // Modifier ici (10, 25, 50, ou 100)
})
```

### Changer le tri par défaut

Dans `data-table.tsx`, ligne 48:

```typescript
const [sorting, setSorting] = useState<SortingState>([
  { id: "date_collecte", desc: true }, // Modifier id et desc
])
```

Colonnes triables: `date_collecte`, `compte`, `nom`, `activité`

---

## Statut

✅ `data-table.tsx` - Table complète avec tri/pagination
✅ `export-actions.tsx` - Export CSV/PDF complet
✅ Documentation complète
✅ Types TypeScript
✅ Design cohérent shadcn/ui + Tailwind
✅ Responsive
✅ Toutes dépendances installées

**Prêt à l'intégration immédiate.**
