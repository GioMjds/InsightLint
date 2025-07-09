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
            webviewProvider
        )
    );

    // Register commands
    const startReviewCommand = vscode.commands.registerCommand(
        "insightlint.startReview",
        async () => {
            const language = languageDetector.getCurrentLanguage();
            if (!language) {
                vscode.window.showErrorMessage(
                "Please open a supported programming language file"
            );
            return;
        }

        webviewProvider.showLoading();

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
    });

    const showPanelCommand = vscode.commands.registerCommand(
        "insightlint.showPanel",
        async () => {
            await vscode.commands.executeCommand(
                "workbench.view.extension.insightlint"
            );
            await vscode.commands.executeCommand("insightlint.reviewPanel.focus");
        }
    );

    // Auto-trigger on file changes (optional)
    const onDidChangeActiveTextEditor = vscode.window.onDidChangeActiveTextEditor(() => {
      // You can add auto-analysis logic here if needed
    });

    context.subscriptions.push(
        startReviewCommand,
        showPanelCommand,
        onDidChangeActiveTextEditor
    );
}

export function deactivate() {}