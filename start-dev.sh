#!/bin/bash

echo "Starting Career Roadmap App Development Environment..."
echo

# Function to start a service in background
start_service() {
    local name=$1
    local command=$2
    echo "Starting $name..."
    $command &
    echo "$name started with PID: $!"
    echo
}

# Start all services
start_service "Node.js Backend" "cd backend && npm start"
start_service "Flask AI Service" "cd backend/service && python application.py"
start_service "React Frontend" "cd frontend && npm start"

echo "All services are starting..."
echo "Frontend: http://localhost:3000"
echo "Backend: http://localhost:5000"
echo "AI Service: http://localhost:5001"
echo
echo "Press Ctrl+C to stop all services"

# Wait for user to stop
wait
