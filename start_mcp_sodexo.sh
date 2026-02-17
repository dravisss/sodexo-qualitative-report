#!/bin/bash
# Force the database path from the script to guarantee it loads the project DB
export MEMORA_DB_PATH="/Users/Ravi/Apps/Qualitative Analyst/publish-site/.memora/memories.db"
export MEMORA_ALLOW_ANY_TAG=1
export PYTHONUNBUFFERED=1

# Log for verification
echo "Starting Memora Sodexo Brain at $(date) with DB: $MEMORA_DB_PATH" >> "/Users/Ravi/Apps/Qualitative Analyst/publish-site/.memora/server.log"

# Execute with explicit arguments so there is no ambiguity about the port
exec /Users/Ravi/.local/bin/memora-mcp-server --transport stdio --no-graph 2>> "/Users/Ravi/Apps/Qualitative Analyst/publish-site/.memora/server.log"
