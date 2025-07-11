const vscode = acquireVsCodeApi();

const contentEl = document.getElementById("content");
const statsBarEl = document.getElementById("stats-bar");
const statusIndicator = document.getElementById("status-indicator");

let hasApiKey = false;

window.addEventListener("message", (event) => {
  const message = event.data;

  if (message.type === "apiKeyStatus") {
    hasApiKey = message.hasApiKey;
    updateUI();
  }

  switch (message.type) {
    case "updateReview":
      updateReviewContent(message.data);
      break;
    case "showLoading":
      showLoading();
      break;
    case "hideLoading":
      hideLoading();
      break;
  }
});

function updateUI() {
    if (!hasApiKey) {
        showApiKeySetup();
    } else {
        showMainInterface();
    }
}

function showApiKeySetup() {
    statusIndicator.textContent = "Setup Required";
    statusIndicator.style.background = "var(--warning)";

    contentEl.innerHTML = `
        <div class="setup-container">
            <div class="setup-icon">⚙️</div>
            <h2>Setup Required</h2>
            <p>To use InsightLint AI, you need to configure your Gemini API key.</p>
            
            <div class="api-key-form">
                <div class="form-group">
                    <label class="form-label" for="apiKeyInput">Gemini API Key:</label>
                    <input 
                        type="password" 
                        id="apiKeyInput" 
                        class="form-input" 
                        placeholder="Enter your Gemini API key..."
                        autocomplete="off"
                    >
                    <div class="form-help">
                        Your API key will be securely stored in VS Code settings.
                    </div>
                </div>
                
                <div class="button-group">
                    <button class="review-button" onclick="saveApiKey()">
                        <span class="button-icon">💾</span>
                        Save API Key
                    </button>
                    <button class="secondary-button" onclick="openSettings()">
                        <span class="button-icon">⚙️</span>
                        Open Settings
                    </button>
                </div>
            </div>

            <div class="warning-box">
                <h4>🔐 How to get your API key:</h4>
                <p>1. Go to <strong>Google AI Studio</strong> (https://aistudio.google.com/)</p>
                <p>2. Sign in with your Google account</p>
                <p>3. Click on "Get API Key" and create a new key</p>
                <p>4. Copy the key and paste it above</p>
            </div>
        </div>
    `;
    
    statsBarEl.innerHTML = "";
}

function showMainInterface() {
    statusIndicator.textContent = "Ready";
    statusIndicator.style.background = "var(--success)";

    contentEl.innerHTML = `
        <div class="welcome-card">
            <div class="ai-icon">🧠</div>
            <h2>AI Code Review</h2>
            <p>Click the button below to start analyzing your current code file</p>
            <button id="reviewButton" class="review-button" onclick="startCodeReview()">
                <span class="button-icon">🔍</span>
                Start Code Review
            </button>
        </div>
    `;
}

function saveApiKey() {
    const apiKeyInput = document.getElementById("apiKeyInput");
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
        // Show error feedback
        apiKeyInput.style.borderColor = "var(--danger)";
        setTimeout(() => {
            apiKeyInput.style.borderColor = "";
        }, 2000);
        return;
    }
    
    vscode.postMessage({
        type: "setApiKey",
        apiKey: apiKey
    });
    
    // Clear the input for security
    apiKeyInput.value = "";
}

function openSettings() {
    vscode.postMessage({
        type: "openSettings"
    });
}

// Add event listener for the review button
function startCodeReview() {
    if (!hasApiKey) {
        showApiKeySetup();
        return;
    }
    
    vscode.postMessage({
        type: "startReview",
    });
}

function showLoading() {
    if (!hasApiKey) {
        return;
    }
    
    statusIndicator.textContent = "Analyzing...";
    statusIndicator.style.background = "var(--warning)";

    // Update button state
    const reviewButton = document.getElementById("reviewButton");
    if (reviewButton) {
        reviewButton.disabled = true;
        reviewButton.className = "review-button loading";
        reviewButton.innerHTML = '<span class="button-icon">⏳</span>Analyzing...';
    }

    contentEl.innerHTML = `
        <div class="loading-container">
            <div class="spinner"></div>
            <p>AI is reviewing your code...</p>
            <div class="hint">This may take a few seconds</div>
        </div>
      `;
    statsBarEl.innerHTML = "";
}

function hideLoading() {
    if (!hasApiKey) {
        return;
    }
    
    statusIndicator.textContent = "Analysis Complete";
    statusIndicator.style.background = "var(--success)";

    const reviewButton = document.getElementById("reviewButton");
    if (reviewButton) {
        reviewButton.disabled = false;
        reviewButton.className = "review-button";
        reviewButton.innerHTML = '<span class="button-icon">🔍</span>Start Code Review';
    }
}

function updateReviewContent(data) {
    hideLoading();

    const hasResults =
        data.suggestions.length > 0 ||
        data.bugs.length > 0 ||
        data.bestPractices.length > 0 ||
        data.performance.length > 0 ||
        data.security.length > 0;

    if (!hasResults) {
        contentEl.innerHTML = `
            <div class="welcome-card">
                <div class="ai-icon">🎉</div>
                <h2>Perfect Code!</h2>
                <p>No issues found in your code</p>
                <button id="reviewButton" class="review-button" onclick="startCodeReview()">
                    <span class="button-icon">🔍</span>
                    Start New Review
                </button>
                <div class="hint">AI detected no improvements needed</div>
            </div>
        `;
        statsBarEl.innerHTML = "";
        return;
    }

    // Update content with line numbers
    contentEl.innerHTML = `
        <div class="results-header">
            <h3>Analysis Results</h3>
            <button id="reviewButton" class="review-button compact" onclick="startCodeReview()">
                <span class="button-icon">🔍</span>
                Re-analyze
            </button>
        </div>
        ${createSectionWithLines("🐛 Potential Bugs", data.bugs)}
        ${createSectionWithLines("💡 Suggestions", data.suggestions)}
        ${createSectionWithLines("⚡ Performance", data.performance)}
        ${createSectionWithLines("🔒 Security", data.security)}
        ${createSectionWithLines("✨ Best Practices", data.bestPractices)}
    `;

    addCodeIssueStyles();
}

function createSectionWithLines(title, items) {
    if (items.length === 0) {
        return "";
    }

    const itemsHtml = items.map((item, index) => {
        const severityClass = item.severity || 'info';
        const lineInfo = item.line ? `Line ${item.line}` : '';
        const codeSnippet = item.code ? `<div class="code-snippet">${escapeHtml(item.code)}</div>` : '';
        
        return `
            <div class="issue-item ${severityClass}">
                <div class="issue-header" key="${index}">
                    <div class="issue-severity ${severityClass}">
                        ${getSeverityIcon(item.severity)}
                    </div>
                    <div class="issue-meta">
                        ${lineInfo ? `<span class="line-number">${lineInfo}</span>` : ''}
                        <span class="severity-label">${(item.severity || 'info').toUpperCase()}</span>
                    </div>
                </div>
                <div class="issue-content">
                    <div class="issue-message">${item.message}</div>
                    ${codeSnippet}
                </div>
            </div>
        `;
    }).join("");

    return `
        <div class="section">
            <div class="section-header">
                <span class="section-title">${title}</span>
                <span class="section-count">${items.length}</span>
            </div>
            <div class="section-content">
                ${itemsHtml}
            </div>
        </div>
    `;
}

function getSeverityIcon(severity) {
    switch (severity) {
        case 'error': return '🚨';
        case 'warning': return '⚠️';
        case 'info': return 'ℹ️';
        default: return '💡';
    }
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

function addCodeIssueStyles() {
    const style = document.createElement('style');
    style.textContent = `
        .issue-item {
            background: var(--card-bg);
            border-radius: var(--border-radius);
            margin-bottom: 12px;
            border-left: 4px solid var(--info);
            overflow: hidden;
            transition: var(--transition);
        }
        
        .issue-item:hover {
            transform: translateX(2px);
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        
        .issue-item.error {
            border-left-color: var(--danger);
        }
        
        .issue-item.warning {
            border-left-color: var(--warning);
        }
        
        .issue-item.info {
            border-left-color: var(--info);
        }
        
        .issue-header {
            display: flex;
            align-items: center;
            padding: 12px 16px 8px;
            background: rgba(255,255,255,0.02);
            border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        
        .issue-severity {
            margin-right: 12px;
            font-size: 1.2em;
        }
        
        .issue-meta {
            display: flex;
            align-items: center;
            gap: 12px;
            flex-grow: 1;
        }
        
        .line-number {
            background: var(--primary);
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.75em;
            font-weight: 600;
            font-family: var(--vscode-editor-font-family);
        }
        
        .severity-label {
            font-size: 0.7em;
            font-weight: 600;
            opacity: 0.7;
            letter-spacing: 0.5px;
        }
        
        .issue-content {
            padding: 12px 16px;
        }
        
        .issue-message {
            line-height: 1.6;
            margin-bottom: 8px;
            color: var(--vscode-foreground);
        }
        
        .code-snippet {
            background: var(--vscode-textCodeBlock-background);
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            padding: 8px 12px;
            font-family: var(--vscode-editor-font-family);
            font-size: 0.85em;
            line-height: 1.4;
            overflow-x: auto;
            margin-top: 8px;
            color: var(--vscode-editor-foreground);
        }
        
        .section {
            margin-bottom: 24px;
        }
        
        .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 12px;
            padding: 0 4px;
        }
        
        .section-title {
            font-size: 1.1em;
            font-weight: 600;
            color: var(--vscode-foreground);
        }
        
        .section-count {
            background: var(--primary);
            color: white;
            padding: 2px 8px;
            border-radius: 12px;
            font-size: 0.8em;
            font-weight: 600;
        }
        
        .section-content {
            padding-left: 8px;
        }
        
        .stats-bar {
            display: flex;
            gap: 20px;
            padding: 16px;
            background: var(--card-bg);
            border-radius: var(--border-radius);
            margin-top: 20px;
            border: 1px solid var(--vscode-panel-border);
        }
        
        .stats-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 4px;
        }
        
        .stats-label {
            font-size: 0.7em;
            opacity: 0.7;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .stats-value {
            font-size: 1.2em;
            font-weight: 600;
            color: var(--info);
        }
        
        .stats-value.error {
            color: var(--danger);
        }
        
        .stats-value.warning {
            color: var(--warning);
        }
        
        .stats-value.success {
            color: var(--success);
        }
    `;
    document.head.appendChild(style);
}

function addMarkdownStyles() {
    const style = document.createElement("style");
    style.textContent = `
        .item-content {
            line-height: 1.6;
            word-wrap: break-word;
        }
        
        .item-content code {
            background-color: var(--vscode-textCodeBlock-background);
            padding: 2px 6px;
            border-radius: 4px;
            font-family: var(--vscode-editor-font-family);
            font-size: 0.9em;
        }
        
        .item-content pre {
            background-color: var(--vscode-textCodeBlock-background);
            padding: 12px;
            border-radius: 4px;
            overflow-x: auto;
            line-height: 1.4;
            margin: 16px 0;
        }
        
        .item-content pre code {
            background: none;
            padding: 0;
            font-size: inherit;
        }
        
        .item-content blockquote {
            border-left: 3px solid var(--primary);
            margin: 16px 0;
            padding-left: 15px;
            color: var(--vscode-descriptionForeground);
            font-style: italic;
        }
        
        .item-content ul, 
        .item-content ol {
            padding-left: 24px;
            margin: 12px 0;
        }
        
        .item-content li {
            margin-bottom: 6px;
        }
        
        .item-content strong {
            color: var(--vscode-foreground);
            font-weight: 600;
        }
        
        .item-content em {
            font-style: italic;
        }

        .item-content p {
            margin: 12px 0;
            line-height: 1.6;
        }
        
        .item-content p:first-child {
            margin-top: 0;
        }
        
        .item-content p:last-child {
            margin-bottom: 0;
        }
        
        .item-content h1, .item-content h2, .item-content h3, 
        .item-content h4, .item-content h5, .item-content h6 {
            margin: 16px 0 8px 0;
            line-height: 1.3;
            font-weight: 600;
        }
        
        .item-content h1:first-child,
        .item-content h2:first-child,
        .item-content h3:first-child,
        .item-content h4:first-child,
        .item-content h5:first-child,
        .item-content h6:first-child {
            margin-top: 0;
        }
        
        .item-content a {
            color: var(--vscode-textLink-foreground);
            text-decoration: none;
        }
        
        .item-content a:hover {
            text-decoration: underline;
        }
        
        .item-content table {
            border-collapse: collapse;
            width: 100%;
            margin: 16px 0;
        }
        
        .item-content th, .item-content td {
            border: 1px solid var(--vscode-panel-border);
            padding: 8px 12px;
            text-align: left;
        }
        
        .item-content th {
            background-color: var(--vscode-editor-background);
            font-weight: 600;
        }
        
        .item-content hr {
            border: none;
            border-top: 1px solid var(--vscode-panel-border);
            margin: 20px 0;
        }
        
        /* Better spacing between elements */
        .item-content > *:not(:last-child) {
            margin-bottom: 12px;
        }
        
        .item-content pre + p,
        .item-content blockquote + p,
        .item-content ul + p,
        .item-content ol + p,
        .item-content table + p {
            margin-top: 16px;
        }
    `;
    document.head.appendChild(style);
}

document.addEventListener("DOMContentLoaded", () => {
    statusIndicator.textContent = "Ready";
    addMarkdownStyles();
});
