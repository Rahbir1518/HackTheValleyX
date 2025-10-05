#!/bin/bash
# Render build script for audio processing dependencies

echo "Installing system dependencies..."
# Render provides these by default, but let's be explicit
pip install --upgrade pip

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Build complete!"
