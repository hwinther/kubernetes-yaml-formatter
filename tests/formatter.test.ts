import { describe, expect, it } from 'vitest';
import { BetterYamlConfig, formatYaml, indent } from '../src/formatter';

describe('indent', () => {
	it('prefixes every newline with the requested padding', () => {
		expect(indent(2, 'a\nb\nc')).toBe('a\n  b\n  c');
	});

	it('is a no-op when spaces is zero', () => {
		expect(indent(0, 'a\nb')).toBe('a\nb');
	});

	it('leaves single-line text unchanged', () => {
		expect(indent(4, 'hello')).toBe('hello');
	});
});

describe('formatYaml', () => {
	const defaults: BetterYamlConfig = {};

	it('keeps sequences flush with their parent by default (kubectl style)', () => {
		const input = 'spec:\n  containers:\n  - name: nginx\n    image: nginx:latest\n';
		const output = formatYaml(input, 2, { ...defaults, indentSeq: false }, false);
		expect(output).toBe(input);
	});

	it('indents sequences when indentSeq is true', () => {
		const input = 'spec:\n  containers:\n  - name: nginx\n';
		const output = formatYaml(input, 2, { ...defaults, indentSeq: true }, false);
		expect(output).toContain('  containers:\n    - name: nginx');
	});

	it('respects custom tab size', () => {
		const output = formatYaml('a:\n  b: 1\n', 4, defaults, false);
		expect(output).toBe('a:\n    b: 1\n');
	});

	it('emits the document-start marker when directives is true', () => {
		const output = formatYaml('a: 1\n', 2, { ...defaults, directives: true }, false);
		expect(output.startsWith('---\n')).toBe(true);
	});

	it('rangeFormatting overrides directives to suppress the document marker', () => {
		const output = formatYaml('a: 1\n', 2, { ...defaults, directives: true }, true);
		expect(output.startsWith('---')).toBe(false);
	});

	it('uses commentString as the full comment-line prefix (replacing the default #)', () => {
		const input = '# a comment\nfoo: 1\n';
		const output = formatYaml(input, 2, { ...defaults, commentString: '!! ' }, false);
		expect(output).toContain('!!  a comment');
		expect(output.startsWith('#')).toBe(false);
	});

	it('preserves multi-document YAML', () => {
		const input = 'a: 1\n---\nb: 2\n';
		const output = formatYaml(input, 2, defaults, false);
		expect(output).toContain('a: 1');
		expect(output).toContain('b: 2');
		expect(output).toMatch(/\.\.\.|---/);
	});

	it('falls back to original text when input is parser-empty (comment only)', () => {
		const input = '# nothing but a comment\n';
		const output = formatYaml(input, 2, defaults, false);
		expect(output).toBe(input);
	});

	it('throws on malformed YAML', () => {
		expect(() => formatYaml('a: : :\n', 2, defaults, false)).toThrow();
	});

	it('honors flowCollectionPadding: false', () => {
		const input = 'arr: [1,2,3]\n';
		const output = formatYaml(input, 2, { ...defaults, flowCollectionPadding: false }, false);
		expect(output).toContain('[1, 2, 3]');
		expect(output).not.toContain('[ 1');
	});

	it('honors flowCollectionPadding: true', () => {
		const input = 'arr: [1,2,3]\n';
		const output = formatYaml(input, 2, { ...defaults, flowCollectionPadding: true }, false);
		expect(output).toContain('[ 1, 2, 3 ]');
	});
});
