#!/usr/bin/env python3
"""
Research Bridge - Direct SQLite access to Memora database
Bypass MCP when server is down or unstable
"""

import sqlite3
import json
import sys
import argparse
from pathlib import Path
from datetime import datetime

DB_PATH = Path("/Users/Ravi/Apps/Qualitative Analyst/publish-site/.memora/memories.db")

def get_connection():
    """Get SQLite connection to isolated Memora database"""
    if not DB_PATH.exists():
        raise FileNotFoundError(f"Memora database not found at {DB_PATH}")
    return sqlite3.connect(DB_PATH)

def create_memory(content: str, tags: list = None, metadata: dict = None):
    """
    Create a memory directly in SQLite
    
    Args:
        content: Memory content text
        tags: Optional list of tags
        metadata: Optional metadata dictionary
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    # Insert memory
    cursor.execute("""
        INSERT INTO memories (content, metadata, tags, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?)
    """, (
        content,
        json.dumps(metadata or {}),
        json.dumps(tags or []),
        datetime.utcnow().isoformat(),
        datetime.utcnow().isoformat()
    ))
    
    memory_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return memory_id

def delete_by_tag(tag: str):
    """
    Delete all memories with a specific tag
    
    Args:
        tag: Tag name to filter by
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    # Find memory IDs with this tag in JSON array
    # Heuristic: search for the tag in the JSON string
    cursor.execute("""
        SELECT id FROM memories 
        WHERE tags LIKE ?
    """, (f'%"{tag}"%',))
    memory_ids = [row[0] for row in cursor.fetchall()]
    
    if not memory_ids:
        conn.close()
        return 0
    
    # Delete memories
    placeholders = ','.join('?' * len(memory_ids))
    cursor.execute(f"""
        DELETE FROM memories WHERE id IN ({placeholders})
    """, memory_ids)
    
    conn.commit()
    count = len(memory_ids)
    conn.close()
    
    return count

def search(query: str, limit: int = 10):
    """
    Simple text search in memories
    
    Args:
        query: Search term
        limit: Maximum results
    """
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("""
        SELECT id, content, created_at
        FROM memories
        WHERE content LIKE ?
        ORDER BY updated_at DESC
        LIMIT ?
    """, (f"%{query}%", limit))
    
    results = []
    for row in cursor.fetchall():
        results.append({
            "id": row[0],
            "content": row[1][:200] + "..." if len(row[1]) > 200 else row[1],
            "created_at": row[2]
        })
    
    conn.close()
    return results

def stats():
    """Get database statistics"""
    conn = get_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT COUNT(*) FROM memories")
    memory_count = cursor.fetchone()[0]
    
    conn.close()
    
    return {
        "memories": memory_count,
        "database": str(DB_PATH)
    }

def main():
    parser = argparse.ArgumentParser(description="Research Bridge - Direct Memora access")
    subparsers = parser.add_subparsers(dest="command", help="Command to run")
    
    # Search command
    search_parser = subparsers.add_parser("search", help="Search memories")
    search_parser.add_argument("query", help="Search query")
    search_parser.add_argument("--limit", type=int, default=10, help="Max results")
    
    # Stats command
    subparsers.add_parser("stats", help="Database statistics")
    
    args = parser.parse_args()
    
    if args.command == "search":
        results = search(args.query, args.limit)
        print(json.dumps(results, indent=2))
    elif args.command == "stats":
        stats_data = stats()
        print(json.dumps(stats_data, indent=2))
    else:
        parser.print_help()

if __name__ == "__main__":
    main()
