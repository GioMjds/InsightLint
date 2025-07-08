import * as vscode from 'vscode';
import { CodeReviewResult } from '../services/geminiService';

export class WebViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'insightlint.reviewPanel';

    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView, 
        context: vscode.WebviewViewResolveContext,
        token: vscode.CancellationToken
    )  {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this._extensionUri, 'src', 'webview')
            ]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    }

    public updateContent(reviewResult: CodeReviewResult) {
        if (this._view) {
            this._view.webview.postMessage({
                type: "updateReview",
                data: reviewResult
            });
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const stylesUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src', 'webview', 'main.css'));
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'out', 'webview', 'main.js'));

        return `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <link href="${stylesUri}" rel="stylesheet">
                    <title>Code Review</title>
                </head>
                <body>
                    <div id="app">
                        <h2>Code Review Results</h2>
                        <div id="content">
                            <p>Run code analysis to see results</p>
                        </div>
                    </div>
                    <script src="${scriptUri}"></script>
                </body>
                </html>
        `;
    }
}