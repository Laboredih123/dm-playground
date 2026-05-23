import { useIsMobile } from '../hooks/useIsMobile'
import { useLayoutModeSetting } from '../settings/localSettings'
import { resolveLayoutMode } from './layoutTypes'

export function useResolvedLayoutMode() {
  const [layoutMode] = useLayoutModeSetting()
  const isMobileDevice = useIsMobile()

  return resolveLayoutMode(layoutMode, isMobileDevice)
}
