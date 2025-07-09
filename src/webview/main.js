const vscode = acquireVsCodeApi();

const contentEl = document.getElementById("content");
const statsBarEl = document.getElementById("stats-bar");
const statusIndicator = document.getElementById("status-indicator");

window.addEventListener("message", (event) => {
  const message = event.data;

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

// Add event listener for the review button
function startCodeReview() {
    vscode.postMessage({
        type: "startReview",
    });
}

function showLoading() {
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

    // Update content
    contentEl.innerHTML = `
          <div class="results-header">
              <h3>Analysis Results</h3>
              <button id="reviewButton" class="review-button compact" onclick="startCodeReview()">
                  <span class="button-icon">🔍</span>
                  Re-analyze
              </button>
          </div>
          ${createSection("Potential Bugs", data.bugs)}
          ${createSection("Suggestions", data.suggestions)}
          ${createSection("Performance", data.performance)}
          ${createSection("Security", data.security)}
          ${createSection("Best Practices", data.bestPractices)}
      `;

    addMarkdownStyles();
}

function createSection(title, items) {
    if (items.length === 0) {
        return "";
    }

    const itemsHtml = items.map((item) => `
        <div class="item">
            <div class="item-content">${item}</div>
        </div>
    `).join("");

    return `
          <div class="section">
              <div class="section-header">
                  <span class="icon">${title.split(" ")[0]}</span>
                  ${title} (${items.length})
              </div>
              ${itemsHtml}
          </div>
      `;
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
