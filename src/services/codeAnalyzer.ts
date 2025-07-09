import { GeminiService, CodeReviewResult } from "./geminiService";
import { languageDetector } from "../utils/languageDetector";
import * as vscode from "vscode";

export class CodeAnalyzer {
    private geminiService: GeminiService;

    constructor() {
        this.geminiService = new GeminiService();
    }

    async analyzeCurrentFile(): Promise<CodeReviewResult | null> {
        const language = languageDetector.getCurrentLanguage();
        const code = languageDetector.getCurrentCode();

        if (!language || !code) {
            vscode.window.showErrorMessage("No supported language file is active.");
            return null;
        }

        try {
            const progress = vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                cancellable: false
            }, async (progress) => {
                progress.report({ message: "Analyzing code..." });
                return await this.geminiService.reviewCode(code, language);
            });

            const result = await progress;
            vscode.window.showInformationMessage("Code analysis completed successfully!");
            return result;
        } catch (error) {
            vscode.window.showErrorMessage(`Analysis failed: ${error}`);
            return null;
        }
    }
}