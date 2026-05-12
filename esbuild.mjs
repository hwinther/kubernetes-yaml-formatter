import * as esbuild from 'esbuild';

const watch = process.argv.includes('--watch');
const production = process.argv.includes('--production');

const common = {
	bundle: true,
	entryPoints: ['src/extension.ts'],
	external: ['vscode'],
	logLevel: 'info',
	minify: production,
	sourcemap: !production ? true : 'linked',
	sourcesContent: false,
	tsconfig: 'tsconfig.json'
};

const desktop = {
	...common,
	outfile: 'dist/desktop/extension.js',
	platform: 'node',
	target: 'node22',
	format: 'cjs'
};

const web = {
	...common,
	outfile: 'dist/web/extension.js',
	platform: 'browser',
	target: 'es2022',
	format: 'cjs',
	mainFields: ['browser', 'module', 'main']
};

if (watch) {
	const [desktopCtx, webCtx] = await Promise.all([
		esbuild.context(desktop),
		esbuild.context(web)
	]);
	await Promise.all([desktopCtx.watch(), webCtx.watch()]);
	console.log('Watching for changes...');
} else {
	await Promise.all([esbuild.build(desktop), esbuild.build(web)]);
}
