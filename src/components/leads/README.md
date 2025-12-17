# Leads Components - Documentation

## Composants créés

### 1. `data-table.tsx` - Table des Leads avec TanStack React Table

**Fonctionnalités:**
- Tri multi-colonnes (Date, Compte, Nom, Activité)
- Pagination (10/25/50/100 lignes par page)
- Navigation avec boutons (première/précédente/suivante/dernière page)
- Affichage formaté des dates (format français)
- Badges colorés pour Comptes et Activités
- Design responsive avec Tailwind CSS

**Colonnes:**
- Date (avec heure)
- Compte (badge coloré INVF/INVC3/INVC4)
- Nom complet
- Email
- Téléphone
- Activité (badge coloré PV/ITE/PAC)

**Props:**
```typescript
interface DataTableProps {
  data: FacebookLead[]      // Array de leads à afficher
  loading?: boolean         // État de chargement (optionnel)
}
```

**Utilisation:**
```tsx
import { LeadsDataTable } from "@/components/leads/data-table"
import { FacebookLead } from "@/types/leads"

function MyLeadsPage() {
  const [leads, setLeads] = useState<FacebookLead[]>([])
  const [loading, setLoading] = useState(true)

  return (
    <LeadsDataTable
      data={leads}
      loading={loading}
    />
  )
}
```

---

### 2. `export-actions.tsx` - Boutons d'Export CSV/PDF

**Fonctionnalités:**
- Export CSV avec papaparse (UTF-8 BOM pour Excel)
- Export PDF screenshot de la table avec html2canvas + jspdf
- Export PDF complet (toutes les données formatées)
- États de chargement pendant l'export
- Noms de fichiers horodatés

**Composants:**

#### `ExportActions` - Export standard (CSV + PDF screenshot)
```typescript
interface ExportActionsProps {
  data: FacebookLead[]           // Données à exporter
  disabled?: boolean             // Désactiver les boutons (optionnel)
  tableElementId?: string        // ID de la table pour screenshot PDF (défaut: "leads-table")
}
```

**Utilisation:**
```tsx
import { ExportActions } from "@/components/leads/export-actions"

function MyLeadsPage() {
  const [leads, setLeads] = useState<FacebookLead[]>([])

  return (
    <div>
      {/* Boutons d'export */}
      <ExportActions
        data={leads}
        tableElementId="my-table-id"
      />

      {/* Table avec ID pour le screenshot PDF */}
      <div id="my-table-id">
        <LeadsDataTable data={leads} />
      </div>
    </div>
  )
}
```

#### `ExportFullPDF` - Export PDF complet formaté
Crée un PDF multi-pages avec toutes les données formatées en tableau.

```tsx
import { ExportFullPDF } from "@/components/leads/export-actions"

<ExportFullPDF data={leads} />
```

---

## Exemple d'intégration complète

```tsx
"use client"

import { useState, useEffect } from "react"
import { LeadsDataTable } from "@/components/leads/data-table"
import { ExportActions } from "@/components/leads/export-actions"
import { LeadsService } from "@/lib/leads-service"
import { FacebookLead, LeadsFilters } from "@/types/leads"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function LeadsTablePage() {
  const [leads, setLeads] = useState<FacebookLead[]>([])
  const [loading, setLoading] = useState(true)

  const filters: LeadsFilters = {
    dateFrom: null,
    dateTo: null,
    comptes: [],
    search: ""
  }

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
  }, [])

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Liste des Leads</CardTitle>
          <ExportActions
            data={leads}
            disabled={loading}
            tableElementId="leads-table"
          />
        </CardHeader>
        <CardContent>
          <div id="leads-table">
            <LeadsDataTable data={leads} loading={loading} />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## Dépendances requises

Toutes les dépendances sont déjà installées dans le projet:

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

## Personnalisation

### Couleurs des badges

Les couleurs sont définies dans `data-table.tsx`:

```typescript
// Comptes
const ACCOUNT_COLORS: Record<string, string> = {
  INVF: "bg-blue-500",
  INVC3: "bg-violet-500",
  INVC4: "bg-pink-500",
}

// Activités
const ACTIVITY_COLORS: Record<string, string> = {
  PV: "bg-blue-500",
  ITE: "bg-orange-500",
  PAC: "bg-emerald-500",
}
```

### Options de pagination

Modifiables dans le composant `data-table.tsx`:

```typescript
const [pagination, setPagination] = useState<PaginationState>({
  pageIndex: 0,
  pageSize: 25,  // Taille par défaut
})

// Options disponibles: 10, 25, 50, 100
```

### Tri par défaut

```typescript
const [sorting, setSorting] = useState<SortingState>([
  { id: "date_collecte", desc: true }, // Plus récents d'abord
])
```

---

## Notes techniques

1. **TypeScript**: Tous les composants sont typés avec TypeScript
2. **"use client"**: Les deux composants utilisent des hooks React (nécessaire pour Next.js App Router)
3. **Responsive**: Design adaptatif avec Tailwind CSS
4. **Performance**: TanStack React Table optimise le rendu des grandes tables
5. **Export CSV**: UTF-8 BOM ajouté pour compatibilité Excel
6. **Export PDF**: Supporte la pagination automatique si la table dépasse une page A4

---

## Intégration dans la page Leads existante

Pour ajouter la table et les exports à `src/app/dashboard/leads/page.tsx`, ajouter un nouvel onglet dans les Tabs:

```tsx
<TabsContent value="table" className="space-y-4">
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>Tableau détaillé des Leads</CardTitle>
      <ExportActions data={leads} tableElementId="leads-table" />
    </CardHeader>
    <CardContent>
      <div id="leads-table">
        <LeadsDataTable data={leads} loading={loading} />
      </div>
    </CardContent>
  </Card>
</TabsContent>
```

Et modifier la TabsList:

```tsx
<TabsList className="grid w-full grid-cols-5">
  <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
  <TabsTrigger value="evolution">Évolution</TabsTrigger>
  <TabsTrigger value="accounts">Par Compte</TabsTrigger>
  <TabsTrigger value="heatmap">Heatmap</TabsTrigger>
  <TabsTrigger value="table">Tableau</TabsTrigger>
</TabsList>
```
