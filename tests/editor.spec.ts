import { expect, test } from '@playwright/test'

test('full mode advanced editor tabs are hidden by default', async ({
  page,
}) => {
  await page.goto('/')

  await expect(page.getByRole('button', { name: 'main.dm' })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'boot.dm' })).toHaveCount(0)

  await page.getByRole('button', { name: 'Settings' }).click()
  await page.getByLabel('Show advanced editor tabs').check()

  await expect(page.getByRole('button', { name: 'main.dm' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'boot.dm' })).toBeVisible()
})

test('editor paste expands tabs to the configured tab size', async ({
  page,
}) => {
  await page.goto('/')
  await expect(page.locator('.monaco-editor').first()).toBeVisible()

  const tabSizeInput = page.getByLabel('Tab size')
  const tabSize = Number(await tabSizeInput.inputValue())
  const expectedIndent = ' '.repeat(tabSize)

  const editor = page.locator('.monaco-editor').first()
  await editor.click()
  await page.keyboard.press('ControlOrMeta+A')

  const pastedText = '\tfoo\n\tbar'
  const editorInput = page.getByRole('textbox', { name: 'Editor content' })
  await editorInput.evaluate((input, text) => {
    const data = new DataTransfer()
    data.setData('text/plain', text)
    input.dispatchEvent(
      new ClipboardEvent('paste', {
        bubbles: true,
        cancelable: true,
        clipboardData: data,
      })
    )
  }, pastedText)

  const editorValue = await page.evaluate(() => {
    const monaco = (
      window as {
        monaco?: {
          editor?: { getModels: () => Array<{ getValue: () => string }> }
        }
      }
    ).monaco
    const model = monaco?.editor?.getModels()?.[0]
    if (!model) {
      throw new Error('Monaco model not found')
    }

    return model.getValue().replace(/\r/g, '').trimEnd()
  })

  const expectedValue = `${expectedIndent}foo\n${expectedIndent}bar`
  const toCodePoints = (value: string) =>
    Array.from(value, (char) => char.charCodeAt(0)).join(',')

  expect(toCodePoints(editorValue)).toBe(toCodePoints(expectedValue))
})
