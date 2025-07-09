import { GoogleGenerativeAI } from "@google/generative-ai";
import * as vscode from "vscode";

export interface CodeReviewResult {
    suggestions: string[];
    bugs: string[];
    bestPractices: string[];
    performance: string[];
    security: string[];
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

        const prompt = `
        Analyze this ${language} code and provide:
        1. Code suggestions for improvement
        2. Potential bugs or issues
        3. Best practices recommendations
        4. Performance optimizations
        5. Security concerns

        Code:
        ${code}

        Please format your response as JSON with the following structure:
        {
            "suggestions": ["suggestion1", "suggestion2", "suggestion3", "suggestion4", "suggestion5"],
            "bugs": ["bug1", "bug2", "bug3", "bug4", "bug5"],
            "bestPractices": ["practice1", "practice2", "practice3", "practice4", "practice5"],
            "performance": ["perf1", "perf2", "perf3", "perf4", "perf5"],
            "security": ["sec1", "sec2", "sec3", "sec4", "sec5"]
        }
        `;

        const maxRetries: number = 3;
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                const result = await this.model.generateContent(prompt);
                const response = result.response;
                const text = response.text();

                console.log(`Gemini response: ${text}`);
                
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (jsonMatch) {
                    const parsed = JSON.parse(jsonMatch[0]);
                
                    const result = {
                        suggestions: parsed.suggestions || [],
                        bugs: parsed.bugs || [],
                        bestPractices: parsed.bestPractices || [],
                        performance: parsed.performance || [],
                        security: parsed.security || [],
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
}