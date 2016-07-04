'use strict';
import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {
    class BrowserContentProvider implements vscode.TextDocumentContentProvider {
        provideTextDocumentContent(uri: vscode.Uri, token: vscode.CancellationToken): string {
            // TODO: detect failure to load page (e.g. google.com) and display error to user.
            return `<iframe src="${uri}" frameBorder="0" style="width: 100%; height: 100%" />`;
        }
    }
    let provider = new BrowserContentProvider();

    // Handle http:// and https://.
    let registrationHTTPS = vscode.workspace.registerTextDocumentContentProvider('https', provider);
    let registrationHTTP = vscode.workspace.registerTextDocumentContentProvider('http', provider);

    // urlIsValid returns true if url is valid; false otherwise.
    // TODO: test more robustly.
    function urlIsValid(url: string): boolean {
        if (url.startsWith("http://") || url.startsWith("https://")) {
            return true;
        }
        return false;
    }

    let disposable = vscode.commands.registerCommand('extension.openURL', () => {
        let opts: vscode.InputBoxOptions = {
            prompt: "URL",
            value: "https://",
            validateInput: (url) => {
                if (urlIsValid(url)) {
                    return null;
                }
                return "Invalid URL.";
            },
        };
        vscode.window.showInputBox(opts).then(
            (url) => {
                if (!urlIsValid(url)) {
                    return;
                }

                let uri = vscode.Uri.parse(url);

                // Determine column to place browser in.
                let col: vscode.ViewColumn;
                let ae = vscode.window.activeTextEditor;
                if (ae != undefined) {
                    col = ae.viewColumn || vscode.ViewColumn.One;
                } else {
                    col = vscode.ViewColumn.One;
                }

                return vscode.commands.executeCommand('vscode.previewHtml', uri, col).then((success) => {
                }, (reason) => {
                    vscode.window.showErrorMessage(reason);
                }
                );
            });
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}