import hljs from "highlight.js";
import { marked } from "marked";
import * as vscode from "vscode";

export class MarkdownHelper {
    static markdownToHtml(markdown: string): string {
        marked.use({
            renderer: {
                code(token: any) {
                    const code = token.text;
                    const lang = token.lang;
                    if (lang && hljs.getLanguage(lang)) {
                        try {
                            return `<pre><code class="hljs language-${lang}">${
                                hljs.highlight(code, { language: lang }).value
                            }</code></pre>`;
                        } catch (__) {
                            return `<pre><code class="hljs">${code}</code></pre>`;
                        }
                    }
                    return `<pre><code class="hljs">${
                        hljs.highlightAuto(code).value
                    }</code></pre>`;
                },
            },
            breaks: true,
            gfm: true,
        });

        const processedMarkdown = markdown
            .replace(/\n\s*\n/g, "\n\n")
            .replace(/\n{3,}/g, "\n\n");

        return marked(processedMarkdown) as string;
    }

    static async renderMarkdown(markdown: string): Promise<string> {
        const markdownString = new vscode.MarkdownString(markdown);
        markdownString.supportHtml = true;
        markdownString.isTrusted = true;

        const rendered = await vscode.commands.executeCommand(
            "markdown.api.render",
            markdownString
        );

        return rendered as string;
    }

    static createMarkdownString(markdown: string): vscode.MarkdownString {
        const markdownString = new vscode.MarkdownString(markdown);
        markdownString.supportHtml = true;
        markdownString.isTrusted = true;
        return markdownString;
    }
}