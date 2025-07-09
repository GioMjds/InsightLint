# InsightLint 🧠

An AI-powered code review assistant that helps you write better code. InsightLint analyzes your code and provides intelligent suggestions for improvements, bug detection, and best practices.

## What it does

Ever wished you had a coding buddy who could spot issues you miss? That's InsightLint! It uses Google's Gemini AI to review your code and give you feedback on:

- **🐛 Potential bugs** - Catches issues before they become problems
- **💡 Code suggestions** - Ideas to make your code cleaner and more readable
- **⚡ Performance tips** - Ways to make your code run faster
- **🔒 Security concerns** - Spots potential security vulnerabilities
- **📋 Best practices** - Helps you follow coding standards

## Getting Started

1. **Install the extension** from the VS Code marketplace
2. **Get a Gemini API key** from [Google AI Studio](https://aistudio.google.com/app/apikey)
3. **Configure the extension** by adding your API key to VS Code settings:
   - Open Settings (Ctrl+,)
   - Search for "InsightLint"
   - Paste your API key in the "Gemini API Key" field

## How to use it

### Option 1: Use the sidebar panel (recommended)

- Click the InsightLint icon in the activity bar
- Open any code file you want to review
- Click the "Start Code Review" button

### Option 2: Command palette

- Open any code file
- Press `Ctrl+Shift+P` (or `Cmd+Shift+P` on Mac)
- Type "InsightLint: Start Code Review"

### Option 3: Right-click menu

- Right-click anywhere in your code
- Select "Start Code Review" from the context menu

## Supported Languages

InsightLint works with a wide variety of programming languages and frameworks:

### Core Programming Languages

- **JavaScript** (.js) & **TypeScript** (.ts)
- **Python** (.py)
- **Java** (.java)
- **C#** (.cs)
- **C++** (.cpp)
- **Go** (.go)
- **Rust** (.rs)
- **Ruby** (.rb)
- **PHP** (.php)
- **Swift** (.swift)
- **Kotlin** (.kt)
- **Dart** (.dart)

### Web Technologies

- **HTML** (.html)
- **CSS** (.css, .scss, .less)
- **React** (.jsx, .tsx)
- **Vue.js** (.vue)
- **Svelte** (.svelte)
- **Astro** (.astro)

### Template Languages

- **Handlebars** (.hbs)
- **Pug** (.pug)
- **Twig** (.twig)
- **Liquid** (.liquid)
- **EJS** (.ejs)

### Other Formats

- **JSON** (.json)
- **XML** (.xml)
- **YAML** (.yaml, .yml)
- **Markdown** (.md)
- **Shell Scripts** (.sh)
- **PowerShell** (.ps1)
- **Perl** (.pl)
- **R** (.r)
- **Objective-C** (.m)

_The AI is smart enough to understand context and provide relevant suggestions for each language!_

## What makes it special

- **Smart analysis** - Uses advanced AI to understand your code context
- **Beautiful interface** - Clean, modern UI that fits right into VS Code
- **Instant feedback** - Get results in seconds, not minutes
- **Non-intrusive** - Works alongside your existing workflow

## Settings

- `insightlint.geminiApiKey`: Your Gemini API key (required)
- `insightlint.useSecondarySideBar`: Show panel in secondary sidebar (default: true)

## Privacy & Security

Your code is sent to Google's Gemini API for analysis. Please review Google's privacy policy and terms of service. We don't store or log your code - it's only used for generating the review.

## Feedback & Issues

Found a bug or have a suggestion? I'd love to hear from you! This is a passion project and I'm always looking to improve it.

## Contributing

Want to help make InsightLint even better? I'd welcome your contributions! Here's how you can get involved:

### 🐛 Report Issues

- Found a bug? [Open an issue](https://github.com/your-username/insightlint/issues) with details about what happened
- Include your VS Code version, operating system, and steps to reproduce
- Screenshots are always helpful!

### 💡 Suggest Features

- Have an idea for a new feature? [Start a discussion](https://github.com/your-username/insightlint/discussions)
- Explain what you'd like to see and why it would be useful
- I'm especially interested in ideas for new languages or analysis types

### 🔧 Code Contributions

Ready to dive into the code? Here's how to get started:

1. **Fork the repository** and clone it locally
2. **Install dependencies**: `npm install`
3. **Run in development**: `npm run watch`
4. **Test your changes**: Press F5 to launch a new VS Code window with your extension
5. **Make your changes** and test thoroughly
6. **Submit a pull request** with a clear description of what you've changed

### 🎯 Good First Issues

Looking for something to work on? These are great places to start:

- Add support for a new programming language
- Improve error messages and user feedback
- Add more configuration options
- Enhance the UI/UX
- Write tests (yes, I know I need more of these!)

### 📝 Development Setup

```bash
# Clone the repo
git clone https://github.com/your-username/insightlint.git
cd insightlint

# Install dependencies
npm install

# Start development mode
npm run watch

# Open in VS Code
code .
```

### 🤝 Code Guidelines

- Use TypeScript for type safety
- Follow existing code style and patterns
- Add comments for complex logic
- Test your changes manually before submitting
- Keep commits focused and descriptive

### 💬 Get in Touch

- Questions about contributing? Feel free to reach out!
- Not sure where to start? I'm happy to help you find something to work on
- Want to discuss a big change? Let's chat about it first

Remember: Every contribution matters, whether it's code, documentation, bug reports, or just spreading the word!

## What's Next

- [ ] Customizable review criteria and severity levels
- [ ] Integration with popular linters (ESLint, Pylint, etc.)
- [ ] Team collaboration features and shared configurations
- [ ] Performance improvements for large codebases
- [ ] More detailed explanations for suggestions
- [ ] Support for custom AI prompts and templates

---

_Built with ❤️ for developers who care about code quality_
