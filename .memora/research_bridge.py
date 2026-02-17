import sqlite3
import json
import os
import sys
from datetime import datetime

DB_PATH = "/Users/Ravi/Apps/Qualitative Analyst/publish-site/.memora/memories.db"

def search(query, tags=None):
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        words = query.lower().split()
        cursor.execute("SELECT id, content, tags FROM memories")
        all_memories = cursor.fetchall()
        
        results = []
        for id_mem, content, tags_json in all_memories:
            content_lower = content.lower()
            if all(word in content_lower for word in words):
                if tags:
                    mem_tags = json.loads(tags_json)
                    if not any(t in mem_tags for t in tags):
                        continue
                results.append((id_mem, content, tags_json))
        return results

def create_memory(content, tags=None, metadata=None):
    tags = tags or []
    metadata = metadata or {}
    now = datetime.now().isoformat()
    tags_json = json.dumps(tags)
    meta_json = json.dumps(metadata)
    
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute(
            "INSERT INTO memories (content, tags, metadata, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
            (content, tags_json, meta_json, now, now)
        )
        # We need to simulate the embedding/indexing for hybrid search if we were using Memora server,
        # but for direct SQLite bridge, we just persist the data.
        return cursor.lastrowid

def delete_by_tag(tag):
    count = 0
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id, tags FROM memories")
        rows = cursor.fetchall()
        for id_mem, tags_json in rows:
            tags = json.loads(tags_json)
            if tag in tags:
                cursor.execute("DELETE FROM memories WHERE id = ?", (id_mem,))
                count += 1
    return count

def stats():
    with sqlite3.connect(DB_PATH) as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM memories")
        count = cursor.fetchone()[0]
        return {"total": count}

if __name__ == "__main__":
    if len(sys.argv) < 2:
        sys.exit(1)
    
    cmd = sys.argv[1]
    if cmd == "stats":
        print(json.dumps(stats()))
    elif cmd == "search":
        q = sys.argv[2]
        tags = sys.argv[3].split(",") if len(sys.argv) > 3 else None
        results = search(q, tags)
        for r in results:
            print(f"ID: {r[0]} | Tags: {r[2]}")
            print(f"Content: {r[1][:500]}...")
            print("-" * 40)
    elif cmd == "delete_tag":
        tag = sys.argv[2]
        deleted = delete_by_tag(tag)
        print(f"Deleted {deleted} memories with tag {tag}")
    elif cmd == "create":
        # Expecting JSON string for complexity
        data = json.loads(sys.argv[2])
        mid = create_memory(data["content"], data.get("tags"), data.get("metadata"))
        print(f"Created memory ID: {mid}")
