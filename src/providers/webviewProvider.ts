import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import { CodeReviewResult } from "../services/geminiService";

export class WebViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = "insightlint.reviewPanel";

    private _view?: vscode.WebviewView;
    private _currentResults?: CodeReviewResult;
    private _isLoading: boolean = false;
    private _currentFileName?: string;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public get view(): vscode.WebviewView | undefined {
        return this._view;
    }

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

        webviewView.webview.onDidReceiveMessage((message) => {
            switch (message.type) {
                case "startReview":
                    vscode.commands.executeCommand("insightlint.startReview");
                    break;
                case "openSettings":
                    vscode.commands.executeCommand("workbench.action.openSettings", "insightlint.geminiApiKey");
                    break;
                case "setApiKey":
                    this.setApiKey(message.apiKey);
                    break;
                case "webViewReady":
                    this.onWebViewReady();
                    break;
            }
        });

        this.checkApiKey();
    }

    private async setApiKey(apiKey?: string) {
        if (!apiKey || apiKey.trim() === "") {
            vscode.window.showErrorMessage("Please enter a valid Gemini API Key.");
            return;
        }

        try {
            const config = vscode.workspace.getConfiguration("insightlint");
            await config.update("geminiApiKey", apiKey, vscode.ConfigurationTarget.Global);
            vscode.window.showInformationMessage("Gemini API Key updated successfully.");
            this.checkApiKey();
        } catch (error) {
            vscode.window.showErrorMessage(`Failed to update API Key: ${error}`);
        }
    }
    
    private onWebViewReady() {
        this.checkApiKey();

        if (this._currentResults) {
            this.updateContent(this._currentResults);
        } else if (this._isLoading) {
            this.showLoading();
        }
    }

    private checkApiKey() {
        const config = vscode.workspace.getConfiguration("insightlint");
        const apiKey = config.get<string>("geminiApiKey");

        if (this._view) {
            this._view.webview.postMessage({
                type: "apiKeyStatus",
                hasApiKey: !!(apiKey && apiKey.trim() !== "")
            });
        }
    }

    public async updateContent(reviewResult: CodeReviewResult) {
        this._currentResults = reviewResult;
        this._isLoading = false;

        if (this._view) {
            this._view.webview.postMessage({
                type: "updateReview",
                data: reviewResult,
            });
        } else {
            console.error("View not available when trying to update content");
        }
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        const webviewDir = vscode.Uri.joinPath(this._extensionUri, "src", "webview");
        const indexPath = path.join(webviewDir.fsPath, "index.html");
        let html = fs.readFileSync(indexPath, "utf8");

        const fixUri = (file: string) =>
            webview.asWebviewUri(vscode.Uri.joinPath(webviewDir, file));
        html = html.replace(/(src|href)="main\.(js|css)"/g, (match, attr, ext) => {
            return `${attr}="${fixUri(`main.${ext}`)}"`;
        });

        return html;
    }

    public showLoading(filename?: string) {
        this._isLoading = true;
        this._currentResults = undefined;
        this._currentFileName = filename;

        if (this._view) {
            this._view.webview.postMessage({
                type: "showLoading",
                filename: filename
            });
        }
    }

    public hideLoading() {
        this._isLoading = false;

        if (this._view) {
            this._view.webview.postMessage({
                type: "hideLoading"
            });
        }
    }

    public clearResults() {
        this._currentResults = undefined;
        this._isLoading = false;
    }
}