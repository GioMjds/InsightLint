import * as vscode from "vscode";

export class languageDetector {
    static getSupportedLanguages(): string[] {
        // List of supported languages for the extension
        // This list can be expanded based on the languages you want to support
        // Ensure that the languages are in lowercase to match VS Code's language identifiers
        const supportedLanguages = [
            // Programming languages
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
            "dart",
            "html",
            "css",
            "scss",
            "less",
            "json",
            "xml",
            "markdown",
            "yaml",
            "shellscript",
            "powershell",
            "perl",
            "r",
            "objective-c",
            "objective-cpp",

            // Frameworks & libraries (VS Code language IDs)
            "vue",        // Vue.js
            "svelte",     // Svelte
            "astro",      // Astro
            "angular",    // Angular (usually HTML/TS, but some extensions use 'angular')
            "react",      // React (not a language, but some extensions use 'react')
            "nextjs",     // Next.js (not a language, but some extensions use 'nextjs')
            "solid",      // SolidJS
            "ember",      // Ember.js
            "handlebars", // Handlebars (used in Ember)
            "ejs",        // Embedded JavaScript templates
            "pug",        // Pug/Jade templates
            "twig",       // Twig templates
            "liquid",     // Liquid templates
            "hbs",        // Handlebars short id

            // Other web-related
            "typescriptreact", // .tsx files (React)
            "javascriptreact", // .jsx files (React)
        ];

        return supportedLanguages;
    }

    static isSupported(languageId: string): boolean {
        return this.getSupportedLanguages().includes(languageId);
    }

    static getCurrentLanguage(): string | null {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            return null;
        }

        const languageId = activeEditor.document.languageId;
        return this.isSupported(languageId) ? languageId : null;
    }

    static getCurrentCode(): string | null {
        const activeEditor = vscode.window.activeTextEditor;
        if (!activeEditor) {
            return null;
        }

        const selection = activeEditor.selection;
        if (selection.isEmpty) {
            return activeEditor.document.getText();
        }
        return activeEditor.document.getText(selection);
    }
}