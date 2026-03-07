#!/bin/bash

# ML Service Installation Script with Virtual Environment
# This script creates a virtual environment and installs all required Python packages

echo "Setting up ML service with virtual environment..."

# Create virtual environment if it doesn't exist
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate

# Upgrade pip
echo "Upgrading pip..."
pip install --upgrade pip

# Install dependencies
echo "Installing ML service dependencies..."
pip install flask flask-cors joblib pandas numpy scikit-learn xgboost python-dotenv

echo ""
echo "✅ Installation complete!"
echo ""
echo "To start the ML service:"
echo "  1. Activate virtual environment: source venv/bin/activate"
echo "  2. Run the service: python api.py"
echo ""
echo "Or use the start script: ./start.sh"
