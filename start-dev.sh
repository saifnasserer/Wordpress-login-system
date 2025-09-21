#!/bin/bash

# WordPress Custom Auth Pages - Development Server
# This script starts a PHP development server for live editing

echo "🚀 Starting WordPress Custom Auth Pages Development Server..."
echo ""
echo "📁 Project Directory: $(pwd)"
echo "🌐 Server URL: http://localhost:8000"
echo ""
echo "📋 Available Pages:"
echo "   • Login: http://localhost:8000/login/"
echo "   • Register: http://localhost:8000/register/"
echo "   • Profile: http://localhost:8000/profile/"
echo ""
echo "💡 Live Editing:"
echo "   • Edit files in: page-templates/"
echo "   • Edit styles in: assets/css/"
echo "   • Edit scripts in: assets/js/"
echo "   • Changes will be reflected immediately!"
echo ""
echo "🛑 Press Ctrl+C to stop the server"
echo ""

# Start PHP development server
php -S localhost:8000 dev-server.php
