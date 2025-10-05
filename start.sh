#!/bin/bash
# Startup script for Render - copies base audio to /tmp

echo "Starting Mimicoo backend..."

# Copy base.wav to /tmp if it exists
if [ -f "audio/base.wav" ]; then
    echo "Copying base.wav to /tmp..."
    cp audio/base.wav /tmp/base.wav
    echo "Base audio ready at /tmp/base.wav"
else
    echo "Warning: audio/base.wav not found"
fi

# Start the FastAPI server
echo "Starting uvicorn server..."
uvicorn src.main:app --host 0.0.0.0 --port $PORT
