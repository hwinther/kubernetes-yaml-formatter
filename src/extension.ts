import * as vscode from 'vscode';
import { BetterYamlConfig, formatYaml, indent } from './formatter';

const SELECTORS = ['yaml', 'helm', 'ansible', 'github-actions-workflow'];

function readConfig(conf: vscode.WorkspaceConfiguration): BetterYamlConfig {
	return {
		indentSeq: conf.get<boolean>('better-yaml.indentSeq'),
		directives: conf.get<boolean | null>('better-yaml.directives'),
		lineWidth: conf.get<number>('better-yaml.lineWidth'),
		flowCollectionPadding: conf.get<boolean>('better-yaml.flowCollectionPadding'),
		commentString: conf.get<string | null>('better-yaml.commentString'),
		documentVersion: conf.get<'1.1' | '1.2'>('better-yaml.documentOptions.version'),
	};
}

function formatWithErrorReporting(
	text: string,
	tabSize: number,
	config: BetterYamlConfig,
	rangeFormatting: boolean
): string {
	try {
		return formatYaml(text, tabSize, config, rangeFormatting);
	} catch (error) {
		console.error(`format error: ${error}`);
		vscode.window.showErrorMessage(`${error}`);
		throw error;
	}
}

export function activate(context: vscode.ExtensionContext) {
	console.log(`Congratulations, your extension "yet-another-better-yaml-formatter" is now active!`);

	context.subscriptions.push(
		vscode.workspace.onDidChangeConfiguration(ev => {
			console.debug(`onDidChangeConfiguration: ${ev}`);
		}),

		vscode.languages.registerDocumentFormattingEditProvider(SELECTORS, {
			provideDocumentFormattingEdits(document, options) {
				const txt = document.getText();
				const fullRange = new vscode.Range(document.positionAt(0), document.positionAt(txt.length));
				const config = readConfig(vscode.workspace.getConfiguration());
				const fmtTxt = formatWithErrorReporting(txt, options.tabSize, config, false);
				return [vscode.TextEdit.replace(fullRange, fmtTxt)];
			}
		}),

		vscode.languages.registerDocumentRangeFormattingEditProvider(SELECTORS, {
			provideDocumentRangeFormattingEdits(document, range, options) {
				console.log(`start ${JSON.stringify(range.start)}, end ${JSON.stringify(range.end)}`);
				const leftPadding = range.start.character;
				const txt = document.getText(range);
				const config = readConfig(vscode.workspace.getConfiguration());
				let fmtTxt = formatWithErrorReporting(txt, options.tabSize, config, true);
				if (txt.slice(-1) !== '\n') {
					fmtTxt = fmtTxt.slice(0, -1);
				}
				return [vscode.TextEdit.replace(range, indent(leftPadding, fmtTxt))];
			}
		})
	);
}

export function deactivate() { }
