#!/bin/bash

# ML Service Start Script
# This script activates the virtual environment and starts the ML service

echo "Starting ML service..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Virtual environment not found. Running install script..."
    ./install.sh
fi

# Activate virtual environment
source venv/bin/activate

# Start the service
echo "ML service running on http://localhost:5001"
python api.py
