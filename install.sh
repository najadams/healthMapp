#!/bin/bash

echo "🚀 Installing NanaYaw dependencies..."

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
npm install

# Install backend dependencies
echo "📦 Installing backend dependencies..."
cd backend
npm install
cd ..

echo "✅ All dependencies installed successfully!"