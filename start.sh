#!/bin/bash

# Function to handle process cleanup on exit
cleanup() {
    echo "🛑 Shutting down servers..."
    kill $(jobs -p) 2>/dev/null
}

# Set up cleanup on script exit
trap cleanup EXIT

echo "🚀 Starting NanaYaw servers..."

# Start backend server in background
echo "🔧 Starting backend server..."
cd backend
npm run dev &
cd ..

# Wait a bit for backend to initialize
sleep 3

# Start frontend with iOS simulator
echo "📱 Starting frontend with iOS simulator..."
npx expo start --ios

# Keep script running until user interrupts
wait