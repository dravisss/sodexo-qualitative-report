import os
import re
import sys
import argparse
from pathlib import Path
from typing import List, Dict, Any

# Add the project root to sys.path to allow importing mcp_memora modules if needed
# But for now we will rely on standard library and specific mcp calls if we can,
# or just print instructions for the agent to use tool calls. 
# ACTUALLY: The agent runs this script. The script needs to use the memora tool.
# Since we are running INSIDE the agent's environment, we can't directly call 'mcp_memora_memory_create'.
# We need to use the 'memora_client' or similar if available, OR we output instructions.
# HOWEVER, for a skill script, it's best if it iterates and calls the tools directly 
# OR if it uses a library that bridges to the MCP.

# Start of standard skill pattern for Python scripts in this environment:
# We will simulate the tool calls by printing JSON if we were an agent, 
# BUT `run_command` executes in a shell. It doesn't have access to the agent's tools directly.
# SOLUTION: We will use the `mcp-cli` or `curl` if available? No.
# OPTION B: This script generates a JSON plan of what to index, and we rely on the agent to execute it? No, too slow.

# OPTION C: We assume this script is being run by an agent that CANNOT inject tool calls into a subprocess.
# WAIT. The `sodexo-memory-index` is a SKILL. 
# Skills in this environment usually run via `run_command`. 
# If I need to call Memora, I have to use the `mcp` CLI or similar availability.
# Checking available tools... `mcp_memora_memory_create` is a tool available to ME (the agent).
# The user wants a SKILL. A skill usually wraps complex logic. 
# If I write a python script, I need it to be able to talk to Memora.

# Let's check if we can use `python -m mcp_memora ...`? Unlikely.
# 
# INNOVATION: I will create a script that OUTPUTS the memories to be created in a JSON format,
# and then I (Antigravity) will read that output and batch-create them.
# OR, better yet, I will write a script that USES the `httpx` or `requests` to talk to the local Memora server if I knew the port.
# 
# RE-READING CONTEXT:
# The user usually runs skills via me. 
# "Skills are folders of instructions...".
# New plan: I will implement the logic in Python to PARSE the files and construct the Memory Objects.
# Then, since I cannot easily call the MCP tool from the subprocess, I will make the script
# output a JSON list of operations.
# THEN, I will recommend running this script and piping it to a tool? No.
#
# Actually, looking at `orchestrator.md`, it seems other skills use `bridge.py` or similar.
# I will use a simple "print to stdout" approach for now, and if I need to actually execute,
# I might need to ask the user or use a known bridge.
#
# WAIT! The prompt says: "Skills are folders of instructions... If a skill seems relevant... view_file SKILL.md... follow instructions".
# It doesn't say the SCRIPT runs the tools. *I* run the tools.
# So the Python script helps me *prepare* the data.
# 
# Let's make `index_sodexo.py` a helper that:
# 1. Scans the files.
# 2. Generates a list of "Memory Actions" (Delete by tag, Create memory).
# 3. Prints them as JSON.
# 
# Then I (the agent) will run: `python index_sodexo.py > ops.json`
# And then I will read `ops.json` and execute the calls using `mcp_memora_memory_create_batch`.
# 
# CORRECTION: The user asked for a SKILL. 
# In the `orchestrator.md`, skills like `extrair-claims` seem to be instructions for ME.
# 
# BUT, the user also mentioned "automated skill".
# I'll implement `index_sodexo.py` to be run by ME (The Agent) via `run_command`.
# I will try to make it self-contained if possible, but simplest is:
# Script -> JSON Output -> Agent Tool Call.

import json

PROJECT_ROOT = "/Users/Ravi/Apps/Qualitative Analyst/publish-site"

def parse_frontmatter(content):
    match = re.search(r'^---\n(.*?)\n---', content, re.DOTALL)
    if match:
        return match.group(1)
    return ""

def parse_title(content):
    match = re.search(r'^#\s+(.*)', content)
    if match:
        return match.group(1).strip()
    return "Untitled"

def clean_tag(tag):
    return re.sub(r'[^a-zA-Z0-9_\-]', '', tag).lower()

def extract_analysis_note(file_path):
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Metadata extraction
    filename = os.path.basename(file_path)
    title = parse_title(content)
    
    # Extract sections
    summary = ""
    match_sum = re.search(r'## O que o documento é.*?\n(.*?)(?=\n##|$)', content, re.DOTALL)
    if match_sum:
        summary = match_sum.group(1).strip()
        
    gaps = ""
    match_gaps = re.search(r'## Lacunas acionáveis.*?\n(.*?)(?=\n##|$)', content, re.DOTALL)
    if match_gaps:
        gaps = match_gaps.group(1).strip()
        
    connections = ""
    match_conn = re.search(r'## Conexões.*?\n(.*?)(?=\n##|$)', content, re.DOTALL)
    if match_conn:
        connections = match_conn.group(1).strip()

    # Themes (Metadata)
    themes = []
    match_meta = re.search(r'## Metadados.*?Tema:(.*?)\n', content, re.DOTALL)
    if match_meta:
        themes = [t.strip() for t in match_meta.group(1).split(',')]

    # Construct the rich memory
    memory_content = f"Análise de Evidência: {title}\nArquivo: {filename}\n\n### Resumo\n{summary}\n\n### Lacunas\n{gaps}\n\n### Conexões Identificadas\n{connections}"
    
    tags = ["sodexo", "analise", "document-analysis"]
    tags.extend([clean_tag(t) for t in themes if len(t) < 20])
    
    return {
        "content": memory_content,
        "tags": tags,
        "metadata": {"source": filename, "type": "analysis-note"}
    }

def extract_claims_from_analysis(file_path):
    with open(file_path, 'r') as f:
        content = f.read()
    
    if "Texto extraído (vazio)" in content or len(content) < 200:
        return []

    # Get the parent title for context
    parent_title = parse_title(content)
    base_file = os.path.basename(file_path)

    claims = []
    # More robust section finding: find header and take until next ##
    sections = re.split(r'\n## ', content)
    for section in sections:
        if section.startswith("Claims extraídas"):
            # This is our section. Now split by ### Claim
            raw_claims = re.split(r'\n### Claim', "\n" + section)
            for raw in raw_claims:
                cleaned_raw = raw.strip()
                if not cleaned_raw or cleaned_raw.startswith("Claims extraídas"):
                    continue
                
                lines = cleaned_raw.split('\n')
                header_line = lines[0].strip()
                title = header_line.strip('0123456789 -–:') 
                body = "\n".join(lines[1:]).strip()
                
                # Enriched content to link back to parent
                memory_content = f"Claim identified in {parent_title}:\n{title}\n\n{body}\n\nEvidence source: {base_file}"
                
                claims.append({
                    "content": memory_content,
                    "tags": ["sodexo", "claim", "evidencia"]
                })
    return claims

def extract_interventions(file_path):
    with open(file_path, 'r') as f:
        content = f.read()
        
    filename = os.path.basename(file_path)
    intervention_id = filename.split('-')[0] + '-' + filename.split('-')[1] # I-XX
    
    title = parse_title(content)
    
    # Extract Context/Problem
    # Heuristics for sections
    context = ""
    match = re.search(r'## (Contexto|Problema|Diagnóstico).*?\n(.*?)(?=##|$)', content, re.DOTALL)
    if match:
        context = match.group(2).strip()
    
    memory_content = f"Intervenção: {title} ({intervention_id})\n\n{context}"
    
    return [{
        "content": memory_content,
        "tags": ["sodexo", "intervencao", intervention_id]
    }]

def extract_moc_entries(file_path):
    with open(file_path, 'r') as f:
        content = f.read()
    
    entries = []
    # Identify tables (looking for |---| or similar separators)
    # We want tables in "Banco", "SAP" and "PDFs" sections
    sections = re.split(r'\n## ', content)
    
    for section in sections:
        header_match = re.match(r'^(.*?)\n', section)
        if not header_match: continue
        header = header_match.group(1).strip()
        
        # Simple markdown table parser for rows
        lines = section.split('\n')
        for line in lines:
            if '|' in line and not re.search(r'[-:|]{3,}', line) and not line.strip().startswith('| Field ID') and not line.strip().startswith('| Arquivo'):
                # Heuristic: if it has multiple columns and looks like data
                cols = [c.strip() for c in line.split('|') if c.strip()]
                if len(cols) >= 2:
                    entry_content = f"MoC entry: {cols[0]}\nSection: {header}\nDetails: {' | '.join(cols[1:])}"
                    
                    # Tagging logic: try to find I-XX patterns in the row
                    tags = ["sodexo", "moc-entry", "evidencia"]
                    interv_matches = re.findall(r'I-\d{2}', line)
                    for im in interv_matches:
                        tags.append(im.lower())
                    
                    entries.append({
                        "content": entry_content,
                        "tags": tags,
                        "metadata": {"source": "moc.md", "section": header}
                    })
    return entries

def extract_survey_questions(file_path):
    with open(file_path, 'r') as f:
        content = f.read()
    
    questions = []
    sections = re.split(r'\n## ', content)
    for section in sections:
        if section.startswith("Banco (Postgres"):
            # This is our target table
            lines = section.split('\n')
            for line in lines:
                if '|' in line and not re.search(r'[-:|]{3,}', line) and not line.strip().startswith('| Field ID'):
                    cols = [c.strip() for c in line.split('|') if c.strip()]
                    if len(cols) >= 3:
                        # question_id | question | answer | interventions
                        q_id = cols[0]
                        q_text = cols[1]
                        answer = cols[2]
                        target_ints = cols[3] if len(cols) > 3 else ""
                        
                        tags = ["sodexo", "survey-response", q_id.lower()]
                        interv_matches = re.findall(r'I-\d{2}', target_ints)
                        for im in interv_matches:
                            tags.append(im.lower())
                        
                        questions.append({
                            "content": f"Critical Survey Response ({q_id}): {q_text}\n\nResposta: {answer}",
                            "tags": tags,
                            "metadata": {"question_id": q_id, "source": "moc.md"}
                        })
    return questions

def extract_narrative(file_path):
    with open(file_path, 'r') as f:
        content = f.read()

    filename = os.path.basename(file_path)
    base_title = parse_title(content)
    
    sections = []
    # Split by H2
    parts = re.split(r'\n## ', content)
    
    for i, part in enumerate(parts):
        if i == 0: continue # Skip preamble or h1
        
        lines = part.split('\n')
        section_title = lines[0].strip()
        body = "\n".join(lines[1:]).strip()
        
        if len(body) < 50: continue
        
        memory_content = f"Relatório: {base_title}\nSeção: {section_title}\nArquivo: {filename}\n\n{body}"
        
        sections.append({
            "content": memory_content,
            "tags": ["sodexo", "narrativa", "relatorio"]
        })
        
    return sections

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--dry-run", action="store_true")
    parser.add_argument("--direct", action="store_true", help="Push directly to SQLite using research_bridge")
    args = parser.parse_args()
    
    # Import bridge functions if --direct is used
    if args.direct:
        from pathlib import Path
        skill_dir = Path(__file__).parent
        sys.path.insert(0, str(skill_dir))
        from research_bridge import create_memory, delete_by_tag
    
    ops = []
    
    # 1. Sync Strategy: Delete old
    tags_to_clear = ["claim", "moc-entry", "survey-response", "analise", "document-analysis", "narrativa"]
    for tag in tags_to_clear:
        if args.direct:
            delete_by_tag(tag)
        else:
            ops.append({"action": "delete_by_tag", "tag": tag})
    
    # 2. MoC Tables Parser
    print("Parsing Map of Content (MoC)...", file=sys.stderr)
    moc_path = os.path.join(PROJECT_ROOT, "evidencias/indice/moc.md")
    if os.path.exists(moc_path):
        # Index all table rows
        entries = extract_moc_entries(moc_path)
        for e in entries:
            if args.direct:
                create_memory(e["content"], e.get("tags"), e.get("metadata"))
            else:
                ops.append({"action": "create", "data": e})
            
        # Index survey questions
        questions = extract_survey_questions(moc_path)
        for q in questions:
            if args.direct:
                create_memory(q["content"], q.get("tags"), q.get("metadata"))
            else:
                ops.append({"action": "create", "data": q})

    # 3. Analytic Notes (.analise.md) -> Claims AND Full Analysis content
    print("Parsing Analytic Notes (Claims & Full Content)...", file=sys.stderr)
    for root, _, files in os.walk(os.path.join(PROJECT_ROOT, "evidencias/notas")):
        for file in files:
            if file.endswith(".analise.md"):
                file_path = os.path.join(root, file)
                
                # A. Full Analysis Note (Parent)
                analysis_note = extract_analysis_note(file_path)
                if args.direct:
                    create_memory(analysis_note["content"], analysis_note.get("tags"), analysis_note.get("metadata"))
                else:
                    ops.append({"action": "create", "data": analysis_note})
                
                # B. Granular Claims (Children)
                claims = extract_claims_from_analysis(file_path)
                for c in claims:
                    if args.direct:
                        create_memory(c["content"], c.get("tags"), c.get("metadata"))
                    else:
                        ops.append({"action": "create", "data": c})

    # 4. Refined Narrative (Refined/*.md) -> Restoring report chapters
    print("Parsing Narratives (Relatório)...", file=sys.stderr)
    refined_dir = os.path.join(PROJECT_ROOT, "Refined")
    if os.path.exists(refined_dir):
        for file in os.listdir(refined_dir):
            if file.endswith(".md"):
                file_path = os.path.join(refined_dir, file)
                narratives = extract_narrative(file_path)
                for n in narratives:
                    if args.direct:
                        create_memory(n["content"], n.get("tags"), n.get("metadata"))
                    else:
                        ops.append({"action": "create", "data": n})

    # 5. Output/Execution
    if not args.direct:
        print(json.dumps(ops, indent=2))
    else:
        print("Indexação direta concluída com sucesso.", file=sys.stderr)

if __name__ == "__main__":
    main()
