import * as vscode from 'vscode';
import { CodeReviewResult } from '../services/geminiService';
import { MarkdownHelper } from '../utils/helpers';

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

    public async updateContent(reviewResult: CodeReviewResult) {
        if (this._view) {
            const processedResult = this.processMarkdownContent(reviewResult);

            this._view.webview.postMessage({
                type: "updateReview",
                data: processedResult
            });
        } else {
            console.error("View not available when trying to update content");
        }
    }

    private processMarkdownContent(reviewResult: CodeReviewResult) {
        return {
            suggestions: reviewResult.suggestions.map(s => MarkdownHelper.markdownToHtml(s)),
            bugs: reviewResult.bugs.map(b => MarkdownHelper.markdownToHtml(b)),
            bestPractices: reviewResult.bestPractices.map(bp => MarkdownHelper.markdownToHtml(bp)),
            performance: reviewResult.performance.map(p => MarkdownHelper.markdownToHtml(p)),
            security: reviewResult.security.map(s => MarkdownHelper.markdownToHtml(s))
        };
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const stylesUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src', 'webview', 'main.css'));
        const scriptUri = webview.asWebviewUri(vscode.Uri.joinPath(this._extensionUri, 'src', 'webview', 'main.js'));

        console.log(`Styles URI: ${stylesUri.toString()}`);
        console.log(`Script URI: ${scriptUri.toString()}`);

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

    public showLoading() {
        if (this._view) {
            this._view.webview.postMessage({
                type: "showLoading"
            });
        }
    }

    public hideLoading() {
        if (this._view) {
            this._view.webview.postMessage({
                type: "hideLoading"
            });
        }
    }
}