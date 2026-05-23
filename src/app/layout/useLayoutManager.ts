import { useCallback, useEffect } from 'react'
import useLayoutStore from '../stores/layoutStore'
import type { LayoutRoot } from './layoutTypes'
import { useResolvedLayoutMode } from './useResolvedLayoutMode'

export function useLayoutManager() {
  const layouts = useLayoutStore((s) => s.layouts)
  const loadInitialLayouts = useLayoutStore((s) => s.loadInitialLayouts)
  const updateBranchSizes = useLayoutStore((s) => s.updateBranchSizes)
  const resolvedLayoutMode = useResolvedLayoutMode()

  useEffect(() => {
    void loadInitialLayouts()
  }, [loadInitialLayouts])

  const layout: LayoutRoot | null = layouts?.[resolvedLayoutMode] ?? null

  const handleUpdateBranchSizes = useCallback(
    (branchId: number, sizes: number[]) => {
      void updateBranchSizes(resolvedLayoutMode, branchId, sizes)
    },
    [resolvedLayoutMode, updateBranchSizes]
  )

  return {
    layout,
    handleUpdateBranchSizes,
    resolvedLayoutMode,
  }
}
