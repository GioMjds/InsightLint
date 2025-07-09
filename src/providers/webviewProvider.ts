import * as vscode from "vscode";
import { CodeReviewResult } from "../services/geminiService";
import { MarkdownHelper } from "../utils/helpers";

export class WebViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = "insightlint.reviewPanel";

    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        token: vscode.CancellationToken
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this._extensionUri, "src", "webview"),
            ],
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage((message) => {
            switch (message.type) {
                case "startReview":
                    vscode.commands.executeCommand("insightlint.startReview");
                    break;
            }
        });
    }

    public async updateContent(reviewResult: CodeReviewResult) {
        if (this._view) {
            const processedResult = this.processMarkdownContent(reviewResult);

            this._view.webview.postMessage({
                type: "updateReview",
                data: processedResult,
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

        return `<!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>InsightLint AI Review</title>
                    <link href="${stylesUri}" rel="stylesheet">
                    <style>
                        /* Add theme variables for consistent styling */
                        :root {
                            --primary: #4361ee;
                            --success: #06d6a0;
                            --warning: #ffd166;
                            --danger: #ef476f;
                            --info: #118ab2;
                            --card-bg: rgba(255, 255, 255, 0.05);
                            --border-radius: 8px;
                            --transition: all 0.3s ease;
                        }
                        
                        /* Button styling */
                        .review-button {
                            background: linear-gradient(135deg, var(--primary), var(--info));
                            color: white;
                            border: none;
                            padding: 12px 24px;
                            border-radius: var(--border-radius);
                            font-size: 0.9rem;
                            font-weight: 600;
                            cursor: pointer;
                            transition: var(--transition);
                            display: inline-flex;
                            align-items: center;
                            gap: 8px;
                            margin: 15px 0;
                            box-shadow: 0 2px 8px rgba(67, 97, 238, 0.3);
                        }
                        
                        .review-button:hover {
                            transform: translateY(-2px);
                            box-shadow: 0 4px 16px rgba(67, 97, 238, 0.4);
                        }
                        
                        .review-button:active {
                            transform: translateY(0);
                        }
                        
                        .review-button:disabled {
                            opacity: 0.6;
                            cursor: not-allowed;
                            transform: none;
                        }
                        
                        .button-icon {
                            font-size: 1.1em;
                        }
                        
                        .review-button.loading {
                            background: var(--warning);
                            cursor: not-allowed;
                        }
                        
                        .review-button.loading .button-icon {
                            animation: spin 1s linear infinite;
                        }
                        
                        .review-button.compact {
                            padding: 8px 16px;
                            font-size: 0.8rem;
                            margin: 0;
                        }
                        
                        .results-header {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 20px;
                            padding: 0 4px;
                        }
                        
                        .results-header h3 {
                            margin: 0;
                            font-size: 1.1rem;
                            font-weight: 600;
                        }
                    </style>
                </head>
                <body>
                    <div id="app">
                        <header>
                            <div class="header-content">
                                <h1>✨ InsightLint AI</h1>
                                <p class="subtitle">AI-powered code insights</p>
                            </div>
                            <div class="status-pill" id="status-indicator">Ready</div>
                        </header>
                        
                        <main id="content">
                            <div class="welcome-card">
                                <div class="ai-icon">🧠</div>
                                <h2>AI Code Review</h2>
                                <p>Click the button below to start analyzing your current code file</p>
                                <button id="reviewButton" class="review-button" onclick="startCodeReview()">
                                    <span class="button-icon">🔍</span>
                                    Start Code Review
                                </button>
                            </div>
                        </main>
                        
                        <div class="stats-bar" id="stats-bar"></div>
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