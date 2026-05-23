import type * as Monaco from 'monaco-editor'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { insertPastedText } from '../monaco/pasteText'

interface MobileEditorClipboardActions {
  canCopy: boolean
  canPaste: boolean
  copySupported: boolean
  pasteSupported: boolean
  bindEditor: (editor: Monaco.editor.IStandaloneCodeEditor | null) => void
  copySelection: () => Promise<void>
  pasteClipboard: () => Promise<void>
}

function getClipboardSupport() {
  if (typeof navigator === 'undefined') {
    return {
      copySupported: false,
      pasteSupported: false,
    }
  }

  return {
    copySupported: typeof navigator.clipboard?.writeText === 'function',
    pasteSupported: typeof navigator.clipboard?.readText === 'function',
  }
}

function getSelectionText(editor: Monaco.editor.IStandaloneCodeEditor) {
  const model = editor.getModel()
  const selection = editor.getSelection()

  if (!model || !selection || selection.isEmpty()) {
    return ''
  }

  return model.getValueInRange(selection)
}

export function useMobileEditorClipboardActions(
  enabled: boolean,
  tabSize: number
): MobileEditorClipboardActions {
  const editorRef = useRef<Monaco.editor.IStandaloneCodeEditor | null>(null)
  const selectionListenerRef = useRef<Monaco.IDisposable | null>(null)
  const [hasEditor, setHasEditor] = useState(false)
  const [hasSelection, setHasSelection] = useState(false)
  const { copySupported, pasteSupported } = getClipboardSupport()

  const bindEditor = useCallback(
    (editor: Monaco.editor.IStandaloneCodeEditor | null) => {
      selectionListenerRef.current?.dispose()
      selectionListenerRef.current = null
      editorRef.current = editor
      setHasEditor(editor !== null)
      setHasSelection(Boolean(editor?.getSelection()?.isEmpty() === false))

      if (!editor || !enabled) {
        return
      }

      selectionListenerRef.current = editor.onDidChangeCursorSelection(
        (event) => {
          setHasSelection(!event.selection.isEmpty())
        }
      )
    },
    [enabled]
  )

  const copySelection = useCallback(async () => {
    if (!enabled || !copySupported) {
      return
    }

    const editor = editorRef.current
    if (!editor) {
      return
    }

    const text = getSelectionText(editor)
    if (!text) {
      return
    }

    await navigator.clipboard.writeText(text)
  }, [copySupported, enabled])

  const pasteClipboard = useCallback(async () => {
    if (!enabled || !pasteSupported) {
      return
    }

    const editor = editorRef.current
    if (!editor) {
      return
    }

    const text = await navigator.clipboard.readText()
    if (typeof text !== 'string') {
      return
    }

    insertPastedText(editor, text, tabSize, 'mobile-clipboard')
  }, [enabled, pasteSupported, tabSize])

  useEffect(() => {
    return () => {
      selectionListenerRef.current?.dispose()
      selectionListenerRef.current = null
    }
  }, [])

  return useMemo(
    () => ({
      canCopy: enabled && copySupported && hasSelection,
      canPaste: enabled && pasteSupported && hasEditor,
      copySupported,
      pasteSupported,
      bindEditor,
      copySelection,
      pasteClipboard,
    }),
    [
      bindEditor,
      copySelection,
      copySupported,
      enabled,
      hasEditor,
      hasSelection,
      pasteClipboard,
      pasteSupported,
    ]
  )
}
