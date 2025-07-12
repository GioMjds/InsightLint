import * as vscode from "vscode";
import { WebViewProvider } from "./providers/webviewProvider";
import { CodeAnalyzer } from "./services/codeAnalyzer";
import { languageDetector } from "./utils/languageDetector";

export function activate(context: vscode.ExtensionContext) {
    const webviewProvider = new WebViewProvider(context.extensionUri);
    const codeAnalyzer = new CodeAnalyzer();

    // Register webview provider
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(
            WebViewProvider.viewType,
            webviewProvider,
            {
                webviewOptions: {
                    retainContextWhenHidden: true,
                }
            }
        )
    );

    // Register commands
    const startReviewCommand = vscode.commands.registerCommand(
        "insightlint.startReview",
        async () => {
            const config = vscode.workspace.getConfiguration("insightlint");
            const apiKey = config.get<string>("geminiApiKey");

            if (!apiKey || apiKey.trim() === "") {
                vscode.window.showWarningMessage(
                    "Gemini API key is not configured. Please set it up in the InsightLint panel.",
                    "Open Settings"
                ).then((selection) => {
                    if (selection === "Open Settings") {
                        vscode.commands.executeCommand("workbench.action.openSettings", "insightlint.geminiApiKey");
                    }
                });
                return;
            }

            const language = languageDetector.getCurrentLanguage();
            if (!language) {
                vscode.window.showErrorMessage(
                    "Please open a supported programming language file"
                );
                return;
            }

            const activeEditor = vscode.window.activeTextEditor;
            const filename = activeEditor?.document.fileName
                ? activeEditor.document.fileName.split("\\").pop() || ""
                : "";
        
            webviewProvider.showLoading(filename);
        
            try {
                const result = await codeAnalyzer.analyzeCurrentFile();
                if (result) {
                    webviewProvider.updateContent(result);
                
                    await vscode.commands.executeCommand(
                        "workbench.view.extension.insightlint"
                    );
                    await vscode.commands.executeCommand("insightlint.reviewPanel.focus");
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Code analysis failed: ${error}`);
            } finally {
                webviewProvider.hideLoading();
            }
        }
    );

    const showPanelCommand = vscode.commands.registerCommand(
        "insightlint.showPanel",
        async () => {
            await vscode.commands.executeCommand(
                "workbench.view.extension.insightlint"
            );
            await vscode.commands.executeCommand("insightlint.reviewPanel.focus");
        }
    );

    const clearResultsCommand = vscode.commands.registerCommand(
        'insightlint.clearResults',
        async () => {
            webviewProvider.clearResults();
        }
    );

    const onDidChangeConfiguration = vscode.workspace.onDidChangeConfiguration((event) => {
        if (event.affectsConfiguration("insightlint.geminiApiKey")) {
            const config = vscode.workspace.getConfiguration("insightlint");
            const apiKey = config.get<string>("geminiApiKey");
            
            if (webviewProvider.view) {
                webviewProvider.view.webview.postMessage({
                    type: "apiKeyStatus",
                    hasApiKey: !!(apiKey && apiKey.trim())
                });
            }
        }
    });

    // Auto-trigger on file changes (optional)
    const onDidChangeActiveTextEditor = vscode.window.onDidChangeActiveTextEditor(() => {
      // You can add auto-analysis logic here if needed
    });

    context.subscriptions.push(
        startReviewCommand,
        showPanelCommand,
        clearResultsCommand,
        onDidChangeActiveTextEditor,
        onDidChangeConfiguration
    );
}

export function deactivate() {}