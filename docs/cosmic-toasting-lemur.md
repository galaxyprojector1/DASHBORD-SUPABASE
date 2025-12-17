# Plan d'Exécution: Dashboard Leads Analytics - Phases 6-8

## Phase 6: Table Détaillée avec Tri/Pagination/Export CSV

### Objectifs
- Créer une table interactive avec toutes les données des leads
- Implémenter tri multi-colonnes avec @tanstack/react-table
- Ajouter pagination performante
- Export CSV avec papaparse
- Export PDF avec jspdf + html2canvas

### Fichiers à créer
1. `src/components/leads/data-table.tsx` - Table principale avec TanStack Table
2. `src/components/leads/export-actions.tsx` - Boutons d'export CSV/PDF

### Modifications
- `src/app/dashboard/leads/page.tsx` - Ajouter onglet "Détails" avec la table

### Dépendances à installer
```bash
npm install @tanstack/react-table papaparse @types/papaparse
npm install jspdf html2canvas
```

---

## Phase 7: Tab Comparaison avec Chart Comparatif 3 Comptes

### Objectifs
- Créer un onglet "Comparaison" dans l'interface
- Permettre sélection de 3 comptes max
- Afficher chart comparatif side-by-side
- Métriques: Total PV, Moyenne/jour, Tendance 7j

### Fichiers à créer
1. `src/components/charts/comparison-chart.tsx` - Chart comparaison multi-comptes
2. `src/components/leads/insights-panel.tsx` - Insights comparatifs

### Modifications
- `src/app/dashboard/leads/page.tsx` - Ajouter onglet "Comparaison"
- `src/lib/leads-service.ts` - Ajouter méthodes de comparaison

---

## Phase 8: React Query + Skeleton Loaders + Optimisations

### Objectifs
- Migrer vers React Query pour gestion état serveur
- Remplacer `Loader2` spinner par skeleton loaders
- Cache intelligent avec staleTime/cacheTime
- Prefetching des données fréquentes
- Optimistic updates

### Fichiers à créer
1. `src/components/ui/skeleton.tsx` - Composant skeleton (via shadcn)
2. `src/app/providers.tsx` - QueryClientProvider wrapper
3. `src/hooks/use-leads-data.ts` - Custom hooks React Query

### Modifications
- `src/app/layout.tsx` - Wrapper avec QueryClientProvider
- `src/app/dashboard/leads/page.tsx` - Utiliser hooks React Query
- Tous les composants de charts - Skeleton loaders

### Configuration React Query
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5min
      cacheTime: 10 * 60 * 1000, // 10min
      refetchOnWindowFocus: false,
    },
  },
})
```

---

## Checklist Complète

### Installation
- [ ] npm install @tanstack/react-table papaparse jspdf html2canvas
- [ ] npm install @types/papaparse
- [ ] npx shadcn@latest add skeleton

### Phase 6
- [ ] Créer `data-table.tsx` avec tri/pagination
- [ ] Créer `export-actions.tsx` avec CSV/PDF export
- [ ] Ajouter onglet "Détails" dans page.tsx
- [ ] Intégrer composants dans l'UI

### Phase 7
- [ ] Créer `comparison-chart.tsx` avec sélecteur 3 comptes
- [ ] Créer `insights-panel.tsx` pour insights
- [ ] Ajouter onglet "Comparaison" dans page.tsx
- [ ] Ajouter méthodes service pour comparaison

### Phase 8
- [ ] Créer `providers.tsx` avec QueryClient
- [ ] Créer hooks `use-leads-data.ts`
- [ ] Wrapper app avec Providers
- [ ] Remplacer tous les `useState` par `useQuery`
- [ ] Remplacer `Loader2` par `Skeleton`
- [ ] Tester cache et refetch

### Tests & Déploiement
- [ ] npm run build (vérifier pas d'erreurs)
- [ ] Tester en local toutes les fonctionnalités
- [ ] Commit avec message détaillé
- [ ] Push origin main

---

## Architecture des Agents (Swarm de 7)

1. **Agent Installation** - Installe toutes les dépendances
2. **Agent Phase 6A** - data-table.tsx + export-actions.tsx
3. **Agent Phase 6B** - Intégration table dans page.tsx
4. **Agent Phase 7A** - comparison-chart.tsx + insights
5. **Agent Phase 7B** - Service comparaison + intégration UI
6. **Agent Phase 8A** - React Query setup (providers, hooks)
7. **Agent Phase 8B** - Migration complète + skeletons

Tous les agents travaillent en parallèle sur des fichiers différents.
