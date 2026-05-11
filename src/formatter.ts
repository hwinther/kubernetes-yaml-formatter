import * as YAML from 'yaml';

export interface BetterYamlConfig {
	indentSeq?: boolean;
	directives?: boolean | null;
	lineWidth?: number;
	flowCollectionPadding?: boolean;
	commentString?: string | null;
	documentVersion?: '1.1' | '1.2';
}

export function indent(spaces: number, text: string): string {
	const pad = ' '.repeat(spaces);
	return text.replaceAll('\n', '\n' + pad);
}

export function formatYaml(
	text: string,
	tabSize: number,
	config: BetterYamlConfig,
	rangeFormatting: boolean
): string {
	const options: YAML.ToStringOptions = {
		indent: tabSize,
		indentSeq: config.indentSeq,
		directives: rangeFormatting ? null : config.directives,
		lineWidth: config.lineWidth,
		flowCollectionPadding: config.flowCollectionPadding,
	};
	const prefix = config.commentString;
	if (prefix !== null && prefix !== undefined) {
		options.commentString = (comment: string) => prefix + comment;
	}
	const docOptions: YAML.DocumentOptions = {};
	if (config.documentVersion !== undefined) {
		docOptions.version = config.documentVersion;
	}
	return YAML.parseAllDocuments(text, docOptions)
		.map(doc => YAML.stringify(doc, options))
		.join('') || text;
}
