import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['tests/**/*.test.ts'],
		coverage: {
			provider: 'v8',
			reporter: ['text', 'cobertura', 'json-summary'],
			reportsDirectory: 'coverage',
			include: ['src/**/*.ts'],
			exclude: ['src/extension.ts', 'src/test/**']
		}
	}
});
