import { base, ignores, node, vitest } from '@wshno/eslint-config'
import globals from 'globals'

// @wshno/eslint-config: JS/TS and SonarJS recommended with Node globals (the extension host is
// Node), the Vitest preset on the unit tests in tests/, and Mocha globals for the integration tests
// in src/test/, which run inside VS Code.
/** @type {import('eslint').Linter.Config[]} */
export default [
  ...ignores,
  ...base,
  ...node,
  ...vitest(['tests/**/*.test.ts']),
  {
    files: ['src/test/**/*.ts'],
    languageOptions: { globals: { ...globals.mocha } },
  },
  {
    rules: {
      curly: 'error',
      eqeqeq: 'error',
      'no-throw-literal': 'error',
    },
  },
  { ignores: ['out/**', '.vscode-test/**', '**/*.d.ts'] },
]
