#!/bin/bash

# Find and kill any existing server processes
echo "Stopping any existing server processes..."
pkill -f "python -m src.main" || echo "No existing processes found"

# Wait a moment to ensure processes are terminated
sleep 2

# Create logs directory if it doesn't exist
mkdir -p logs

# Start the server
echo "Starting new server..."
python -m src.main > logs/server.log 2>&1 &

# Wait a moment for the server to start
sleep 2

# Check if the server is running
if pgrep -f "python -m src.main" > /dev/null; then
    echo "Server is now running in the background. Logs are in logs/server.log"
    echo "You can check the logs with: tail -f logs/server.log"
else
    echo "Failed to start the server. Check logs/server.log for details."
fi 