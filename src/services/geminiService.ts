import { GoogleGenerativeAI } from "@google/generative-ai";
import * as vscode from "vscode";

export interface CodeIssue {
    message: string;
    line?: number;
    column?: number;
    severity: 'error' | 'warning' | 'info';
    code?: string;
}

export interface CodeReviewResult {
    suggestions: CodeIssue[];
    bugs: CodeIssue[];
    bestPractices: CodeIssue[];
    performance: CodeIssue[];
    security: CodeIssue[];
}

export class GeminiService {
    private genAI: GoogleGenerativeAI | null = null;
    private model: any = null;

    constructor() {
        this.initialize();
    }

    private initialize() {
        const config = vscode.workspace.getConfiguration("insightlint");
        const apiKey = config.get<string>("geminiApiKey");

        if (apiKey) {
            this.genAI = new GoogleGenerativeAI(apiKey);
            this.model = this.genAI.getGenerativeModel({ model: 'models/gemini-2.5-flash' });
        }
    }

    async reviewCode(code: string, language: string): Promise<CodeReviewResult> {
        if (!this.model) {
            throw new Error("Gemini model is not initialized. Please check your API key.");
        }

        const numberedCode = this.addLineNumbers(code);

        const prompt = `
        Analyze this ${language} code and provide specific feedback with line numbers where applicable.
        
        Code with line numbers:
        ${numberedCode}

        Please provide:
        1. Code suggestions for improvement (with specific line numbers)
        2. Potential bugs or issues (with specific line numbers)
        3. Best practices recommendations (with specific line numbers)
        4. Performance optimizations (with specific line numbers)
        5. Security concerns (with specific line numbers)

        For each issue, please specify:
        - The exact line number where the issue occurs
        - A clear description of the issue
        - Suggested fix or improvement
        - Severity level (error, warning, or info)

        Please format your response as JSON with the following structure:
        {
            "suggestions": [
                {
                    "message": "Description of the suggestion with fix",
                    "line": 5,
                    "severity": "info",
                    "code": "problematic code snippet"
                }
            ],
            "bugs": [
                {
                    "message": "Description of the bug and how to fix it",
                    "line": 10,
                    "severity": "error",
                    "code": "buggy code snippet"
                }
            ],
            "bestPractices": [
                {
                    "message": "Best practice recommendation",
                    "line": 15,
                    "severity": "warning",
                    "code": "code that could be improved"
                }
            ],
            "performance": [
                {
                    "message": "Performance optimization suggestion",
                    "line": 20,
                    "severity": "info",
                    "code": "code that could be optimized"
                }
            ],
            "security": [
                {
                    "message": "Security concern and fix",
                    "line": 25,
                    "severity": "error",
                    "code": "potentially vulnerable code"
                }
            ]
        }

        Important: 
        - Always include line numbers when referencing specific code
        - Use the exact line numbers from the numbered code provided
        - If an issue spans multiple lines, reference the starting line
        - Provide practical, actionable suggestions
        - Include relevant code snippets in the "code" field
        `;

        const maxRetries: number = 3;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const result = await this.model.generateContent(prompt);
                const response = result.response;
                const text = response.text();
                
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                
                    const result: CodeReviewResult = {
                        suggestions: this.parseIssues(parsed.suggestions || []),
                        bugs: this.parseIssues(parsed.bugs || []),
                        bestPractices: this.parseIssues(parsed.bestPractices || []),
                        performance: this.parseIssues(parsed.performance || []),
                        security: this.parseIssues(parsed.security || []),
                    };

                    return result;
                }

                throw new Error("Invalid response format from Gemini model. Expected JSON.");
            } catch (error) {
                throw new Error(`Error during code review: ${error}`);
            }
        }
        throw new Error(`Code review failed after multiple attempts.`);
    }

    private addLineNumbers(code: string): string {
        const lines = code.split('\n');
        return lines.map((line, index) => `${index + 1}: ${line}`).join('\n');
    }

    private parseIssues(issues: any[]): CodeIssue[] {
        return issues.map(issue => ({
            message: issue.message,
            line: issue.line,
            column: issue.column,
            severity: issue.severity || 'info',
            code: issue.code || '',
        }));
    }
}