import * as vscode from "vscode";

export class languageDetector {
    static getSupportedLanguages(): string[] {
        // List of supported languages for the extension
        // This list can be expanded based on the languages you want to support
        // Ensure that the languages are in lowercase to match VS Code's language identifiers
        const supportedLanguages = [
            "javascript",
            "typescript",
            "python",
            "java",
            "csharp",
            "cpp",
            "go",
            "ruby",
            "php",
            "swift",
            "kotlin",
            "rust",
            "dart"
        ];

        return supportedLanguages;
    }

    static isSupported(languageId: string): boolean {
        return this.getSupportedLanguages().includes(languageId);
    }

    static getCurrentLanguage(): string | null {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            return null; // No active editor
        }

        const languageId = activeEditor.document.languageId;
        return this.isSupported(languageId) ? languageId : null;
    }

    static getCurrentCode(): string | null {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            return null; // No active editor
        }

        const selection = activeEditor.selection;
        if (selection.isEmpty) {
            return activeEditor.document.getText(); // Return entire document if no selection
        }
        return activeEditor.document.getText(selection); // Return selected text
    }
}