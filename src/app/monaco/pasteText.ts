import type * as Monaco from 'monaco-editor'

function getInsertionRange(editor: Monaco.editor.IStandaloneCodeEditor) {
  const selection = editor.getSelection()
  if (selection) {
    return selection
  }

  const position = editor.getPosition()
  if (!position) {
    return null
  }

  return {
    startLineNumber: position.lineNumber,
    startColumn: position.column,
    endLineNumber: position.lineNumber,
    endColumn: position.column,
  }
}

function collapseSelectionToOffset(
  editor: Monaco.editor.IStandaloneCodeEditor,
  offset: number
) {
  const model = editor.getModel()
  if (!model) {
    return
  }

  const position = model.getPositionAt(offset)
  editor.setSelection({
    selectionStartLineNumber: position.lineNumber,
    selectionStartColumn: position.column,
    positionLineNumber: position.lineNumber,
    positionColumn: position.column,
  })
  editor.revealPositionInCenterIfOutsideViewport(position)
}

export function normalizePastedText(text: string, tabSize: number) {
  const spaces = ' '.repeat(Math.max(1, Math.min(8, tabSize)))
  return text.includes('\t') ? text.replace(/\t/g, spaces) : text
}

export function insertPastedText(
  editor: Monaco.editor.IStandaloneCodeEditor,
  text: string,
  tabSize: number,
  source = 'paste'
) {
  const model = editor.getModel()
  const range = getInsertionRange(editor)
  if (!model || !range) {
    return false
  }

  const normalizedText = normalizePastedText(text, tabSize)
  const startOffset = model.getOffsetAt({
    lineNumber: range.startLineNumber,
    column: range.startColumn,
  })

  editor.pushUndoStop()
  editor.executeEdits(source, [
    {
      range,
      text: normalizedText,
      forceMoveMarkers: true,
    },
  ])
  collapseSelectionToOffset(editor, startOffset + normalizedText.length)
  editor.pushUndoStop()
  editor.focus()

  return true
}
