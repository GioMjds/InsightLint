const vscode = acquireVsCodeApi();

let isLoading = false;

console.log("Webview script loaded");
window.onerror = function(message, source, lineno, colno, error) {
    console.error("Error in webview:", message, "at", source, lineno, colno, error);
};

window.addEventListener('message', (event) => {
    const message = event.data;
    
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

function showLoading() {
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

function hideLoading() {
    isLoading = false;
}

function updateReviewContent(data) {
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

function createSection(title, items, itemClass) {
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