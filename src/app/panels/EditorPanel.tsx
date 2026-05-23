import { useCallback, useEffect, useRef } from 'react'
import { executorService } from '../../services/ExecutorService'
import { Editor } from '../components/Editor'
import type { EditableProjectFileName } from '../editorProject/projectState'
import { embedParams } from '../embed/embedParams'
import { useRuntimeBootstrap } from '../hooks/useRuntimeBootstrap'
import {
  useShowAdvancedEditorTabsSetting,
  useThemeSetting,
} from '../settings/localSettings'
import type { ExecutorState } from '../stores/executorStore'
import useExecutorStore from '../stores/executorStore'
import useProjectStore, {
  useResolvedActiveFile,
  useVisibleFiles,
} from '../stores/projectStore'

export function EditorPanel() {
  const project = useProjectStore((s) => s.project)
  const setActiveFile = useProjectStore((s) => s.setActiveFile)
  const updateFile = useProjectStore((s) => s.updateFile)
  const [themeId] = useThemeSetting()
  const [showAdvancedEditorTabs] = useShowAdvancedEditorTabsSetting()
  const hasAutoran = useRef(false)
  const {
    bootstrapRuntime,
    canRun,
    canTriggerRun,
    isByondLoading,
    isRuntimeBootstrapping,
  } = useRuntimeBootstrap()
  const executionStatus = useExecutorStore((s: ExecutorState) => s.status)
  const visibleFiles = useVisibleFiles(
    !embedParams.isEmbed && showAdvancedEditorTabs
  )
  const resolvedActiveFile = useResolvedActiveFile(
    !embedParams.isEmbed && showAdvancedEditorTabs
  )

  useEffect(() => {
    if (embedParams.isEmbed && embedParams.autorun) {
      void bootstrapRuntime()
    }
  }, [bootstrapRuntime])

  const handleRun = useCallback(() => {
    void (async () => {
      if (!canRun) {
        const bootstrapped = await bootstrapRuntime()
        if (!bootstrapped) {
          return
        }
      }

      void executorService.executeImmediate(project)
    })()
  }, [bootstrapRuntime, canRun, project])

  useEffect(() => {
    if (!embedParams.autorun || hasAutoran.current || !canRun) {
      return
    }

    hasAutoran.current = true
    handleRun()
  }, [canRun, handleRun])

  return (
    <div className="flex h-full min-h-0 flex-col gap-3">
      <Editor
        files={visibleFiles}
        activeFileId={resolvedActiveFile}
        onActiveFileChange={setActiveFile}
        onChange={(fileName, value) => {
          updateFile(fileName as EditableProjectFileName, value)
        }}
        onRun={canTriggerRun ? handleRun : undefined}
        runDisabled={
          canTriggerRun
            ? isByondLoading ||
              isRuntimeBootstrapping ||
              executionStatus === 'running'
            : true
        }
        themeId={themeId}
      />
    </div>
  )
}
