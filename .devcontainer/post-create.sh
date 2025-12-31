#!/bin/bash
set -e

echo "🚀 Setting up development environment..."

# Install Claude Code
echo "📦 Installing Claude Code..."
if ! command -v claude &> /dev/null; then
    npm install -g @anthropic-ai/claude-code
    echo "✅ Claude Code installed successfully"
else
    echo "✅ Claude Code already installed"
fi

# Install Graphite CLI
echo "📦 Installing Graphite CLI..."
if ! command -v gt &> /dev/null; then
    npm install -g @withgraphite/graphite-cli@stable
    echo "✅ Graphite CLI installed successfully"
else
    echo "✅ Graphite CLI already installed"
fi

# Install project dependencies
echo "📦 Installing project dependencies..."
npm install

echo "🎉 Development environment setup complete!"
echo ""
echo "Available tools:"
echo "  - claude: Claude Code CLI"
echo "  - gt: Graphite CLI"
