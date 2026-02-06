#!/bin/bash
echo "==================================================="
echo "  Hyperion SAST - Production Server (v1.5)"
echo "==================================================="
echo ""
echo "Starting server on 0.0.0.0:8000..."
echo "Access from other machines using your IP address."
echo ""
# Ensure dependencies are installed (optional, but good practice)
# pip install -r requirements.txt

python3 -m uvicorn main:app --host 0.0.0.0 --port 8000
