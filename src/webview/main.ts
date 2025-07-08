declare const acquireVsCodeApi: () => any;

interface ReviewData {
    suggestions: string[];
    bugs: string[];
    bestPractices: string[];
    performance: string[];
    security: string[];
}

interface ReviewMessage {
    type: string;
    data: ReviewData;
}

let isLoading: boolean = false;

window.addEventListener('message', (event: MessageEvent) => {
    const message = event.data as ReviewMessage;
    
    switch (message.type) {
        case 'updateReview':
            updateReviewContent(message.data);
            break;
        case 'showLoading':
            showLoading();
            break;
        case 'hideLoading':
            hideLoading();
            break;
    }
});

function showLoading(): void {
    isLoading = true;
    const content = document.getElementById('content');
    if (content) {
        content.innerHTML = `
            <div class="loading">
                <p>🔄 Analyzing code...</p>
            </div>
        `;
    }
}

function hideLoading(): void {
    isLoading = false;
}

function updateReviewContent(data: ReviewData): void {
    hideLoading();
    const content = document.getElementById('content');
    if (!content) {
        return;
    }

    const hasResults = data.suggestions.length > 0 || 
                    data.bugs.length > 0 || 
                    data.bestPractices.length > 0 || 
                    data.performance.length > 0 || 
                    data.security.length > 0;
    
    if (!hasResults) {
        content.innerHTML = `
            <div class="welcome">
                <p>✅ No issues found in your code!</p>
            </div>
        `;
        return;
    }

    content.innerHTML = `
        ${createSection('🐛 Bugs & Issues', data.bugs, 'bug-item')}
        ${createSection('💡 Suggestions', data.suggestions, 'suggestion-item')}
        ${createSection('🚀 Performance', data.performance, 'suggestion-item')}
        ${createSection('🔒 Security', data.security, 'security-item')}
        ${createSection('✨ Best Practices', data.bestPractices, 'suggestion-item')}
    `;
}

function createSection(title: string, items: string[], itemClass: string): string {
    if (items.length === 0) {
        return '';
    }
    
    const itemsHtml = items.map(item => 
        `<div class="item ${itemClass}">${item}</div>`
    ).join('');
    
    return `
        <div class="section">
            <h3>${title}</h3>
            ${itemsHtml}
        </div>
    `;
}