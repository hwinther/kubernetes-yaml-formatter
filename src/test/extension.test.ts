import * as assert from 'node:assert'
import * as vscode from 'vscode'

// Runs inside a real VS Code (npm test, via @vscode/test-cli) against the bundled extension in
// dist/, so it catches what the vitest unit tests can't: activation, the provider registration and
// API changes between @types/vscode and the VS Code that runs it.

const EXTENSION_ID = 'hwinther.yet-another-better-yaml-formatter'
const OPTIONS: vscode.FormattingOptions = { tabSize: 2, insertSpaces: true }

async function openYaml(content: string): Promise<vscode.TextDocument> {
  return vscode.workspace.openTextDocument({ language: 'yaml', content })
}

async function apply(document: vscode.TextDocument, edits: vscode.TextEdit[] | undefined): Promise<string> {
  assert.ok(edits && edits.length > 0, 'the formatter returned no edits')
  const edit = new vscode.WorkspaceEdit()
  edit.set(document.uri, edits)
  assert.ok(await vscode.workspace.applyEdit(edit), 'the edits did not apply')
  return document.getText()
}

suite('Extension', () => {
  suiteSetup(async () => {
    const extension = vscode.extensions.getExtension(EXTENSION_ID)
    assert.ok(extension, `${EXTENSION_ID} is not installed in the test instance`)
    await extension.activate()
  })

  test('activates', () => {
    assert.strictEqual(vscode.extensions.getExtension(EXTENSION_ID)?.isActive, true)
  })

  test('formats a whole YAML document', async () => {
    const document = await openYaml('a:\n    b: 1\nlist:\n    - x\n')
    const edits = await vscode.commands.executeCommand<vscode.TextEdit[]>(
      'vscode.executeFormatDocumentProvider',
      document.uri,
      OPTIONS,
    )
    assert.strictEqual(await apply(document, edits), 'a:\n  b: 1\nlist:\n- x\n')
  })

  test('formats a range and keeps its indentation', async () => {
    const document = await openYaml('top:\n  inner:\n      c: 2\n')
    const range = new vscode.Range(1, 2, 2, 10)
    const edits = await vscode.commands.executeCommand<vscode.TextEdit[]>(
      'vscode.executeFormatRangeProvider',
      document.uri,
      range,
      OPTIONS,
    )
    assert.strictEqual(await apply(document, edits), 'top:\n  inner:\n    c: 2\n')
  })
})
