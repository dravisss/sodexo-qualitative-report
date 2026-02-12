import os
import re
import json
import argparse
import unicodedata
from pathlib import Path

# Configurações de caminhos
BASE_DIR = Path("/Users/Ravi/Apps/Qualitative Analyst/publish-site")
INTERVENCOES_DIR = BASE_DIR / "intervencoes"
REFINED_DIR = BASE_DIR / "Refined"

def find_interventions(intervention_id):
    """Localiza todos os arquivos que mencionam o ID da intervenção."""
    print(f"Buscando menções para {intervention_id}...")
    results = []
    
    # Arquivos Markdown no projeto
    for md_file in BASE_DIR.rglob("*.md"):
        if ".gemini" in str(md_file) or "node_modules" in str(md_file):
            continue
            
        with open(md_file, "r", encoding="utf-8") as f:
            for i, line in enumerate(f, 1):
                if intervention_id in line:
                    results.append({
                        "file": str(md_file.relative_to(BASE_DIR)),
                        "line": i,
                        "content": line.strip()
                    })
    return results

def parse_fields(content):
    """Extrai campos Tensão, Descrição, Objetivo e Impacto do conteúdo markdown."""
    fields = {}
    patterns = {
        "tensao": r"\*\*Tensão:\*\*\s*(.*?)(?=\n\*\*|\n####|\n###|\n---| \Z)",
        "descricao": r"\*\*Descrição:\*\*\s*(.*?)(?=\n\*\*|\n####|\n###|\n---| \Z)",
        "objetivo": r"\*\*Objetivo:\*\*\s*(.*?)(?=\n\*\*|\n####|\n###|\n---| \Z)",
        "impacto": r"\*\*Impacto:\*\*\s*(.*?)(?=\n\*\*|\n####|\n###|\n---| \Z)"
    }
    # Fallback para formatos sem negrito ou com hífen (comum nos dossiês)
    fallback_patterns = {
        "tensao": r"[*-] Tensão:\s*(.*?)(?=\n[*-]|\n##|\Z)",
        "descricao": r"[*-] Descrição:\s*(.*?)(?=\n[*-]|\n##|\Z)",
        "objetivo": r"[*-] Objetivo:\s*(.*?)(?=\n[*-]|\n##|\Z)",
        "impacto": r"[*-] Impacto(?: esperado)?:\s*(.*?)(?=\n[*-]|\n##|\Z)"
    }
    
    for key, pattern in patterns.items():
        match = re.search(pattern, content, re.IGNORECASE | re.DOTALL)
        if match:
            fields[key] = match.group(1).strip()
        else:
            match = re.search(fallback_patterns[key], content, re.IGNORECASE | re.DOTALL)
            if match:
                fields[key] = match.group(1).strip()
    return fields

def slugify(text):
    """Converte texto para kebab-case (slug)."""
    text = text.replace('/', '-')
    text = unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('ascii')
    text = re.sub(r'[^\w\s-]', '', text).lower()
    return re.sub(r'[-\s]+', '-', text).strip('-')

def extract_content(intervention_id):
    """Extrai os blocos de conteúdo da intervenção nos principais arquivos."""
    data = {"id": intervention_id, "fields": {}}
    
    # 08-plano-de-intervencao-estrategica.md
    plano_file = REFINED_DIR / "08-plano-de-intervencao-estrategica.md"
    if plano_file.exists():
        with open(plano_file, "r", encoding="utf-8") as f:
            content = f.read()
            # Procura por H4 com o ID e captura o título
            pattern = rf"#### ({intervention_id} — (.*?))\n(.*?)(?=\n#### I-|\n---|\Z)"
            match = re.search(pattern, content, re.DOTALL)
            if match:
                data["plano_title"] = match.group(2).strip()
                data["plano_header"] = match.group(1).strip()
                data["plano_fields"] = parse_fields(match.group(3))

    # Dossiê
    for dossie in INTERVENCOES_DIR.glob(f"{intervention_id}-*.md"):
        if "argumentario" not in dossie.name:
            with open(dossie, "r", encoding="utf-8") as f:
                content = f.read()
                data["dossie_fields"] = parse_fields(content)
                data["dossie_path"] = str(dossie.relative_to(BASE_DIR))
                # Extrai título interno (primeira linha #)
                title_match = re.match(r"# (.*?)\n", content)
                if title_match:
                    data["dossie_title_internal"] = title_match.group(1).strip()
                data["dossie_filename"] = dossie.name

    # Argumentário
    for arg in INTERVENCOES_DIR.glob(f"{intervention_id}-*.argumentario.md"):
        with open(arg, "r", encoding="utf-8") as f:
            content = f.read()
            data["arg_path"] = str(arg.relative_to(BASE_DIR))
            data["arg_filename"] = arg.name
            # Extrai título interno (# Argumentário — ID — Título)
            title_match = re.match(r"# Argumentário — (I-\d+) — (.*?)\n", content)
            if title_match:
                data["arg_title_internal"] = title_match.group(2).strip()

    return data

def audit():
    """Identifica inconsistências de IDs e desvios de conteúdo (drift)."""
    print("Iniciando auditoria profunda (IDs + Conteúdo)...")
    
    def get_ids_from_file(path, pattern):
        if not path.exists(): return set()
        with open(path, "r", encoding="utf-8") as f:
            return set(re.findall(pattern, f.read()))

    ids_plano = get_ids_from_file(REFINED_DIR / "08-plano-de-intervencao-estrategica.md", r"#### (I-\d+)")
    
    ids_dossies = set()
    ids_argumentarios = set()
    for f in INTERVENCOES_DIR.glob("I-*.md"):
        parts = f.name.split("-")
        if len(parts) >= 2:
            base_id = f"{parts[0]}-{parts[1].split('.')[0]}"
            if "argumentario" in f.name: ids_argumentarios.add(base_id)
            else: ids_dossies.add(base_id)

    all_ids = ids_plano | ids_dossies | ids_argumentarios
    
    inconsistencies = []
    drift = []
    
    for pid in sorted(all_ids):
        # 1. Checagem de Existência
        exists_status = {
            "id": pid,
            "in_plano_08": pid in ids_plano,
            "has_dossie": pid in ids_dossies,
            "has_argumentario": pid in ids_argumentarios
        }
        if not all(exists_status.values()):
            inconsistencies.append(exists_status)
            continue
            
        # 2. Checagem de Conteúdo (Drift)
        content_data = extract_content(pid)
        plano_f = content_data.get("plano_fields", {})
        dossie_f = content_data.get("dossie_fields", {})
        
        diffs = {}
        # Checagem de Título
        p_title = content_data.get("plano_title", "")
        d_title_int = content_data.get("dossie_title_internal", "")
        d_filename = content_data.get("dossie_filename", "")
        
        if p_title:
            # Verifica dossiê
            if d_title_int and p_title not in d_title_int and d_title_int not in p_title:
                diffs["dossie_titulo_interno"] = {"plano": p_title, "dossie": d_title_int}
            
            expected_dossie_slug = f"{pid}-{slugify(p_title)}.md"
            if d_filename and d_filename != expected_dossie_slug:
                diffs["dossie_filename"] = {"expected": expected_dossie_slug, "current": d_filename}

            # Verifica argumentário
            arg_title_int = content_data.get("arg_title_internal", "")
            arg_filename = content_data.get("arg_filename", "")
            if arg_title_int and p_title != arg_title_int:
                diffs["arg_titulo_interno"] = {"plano": p_title, "arg": arg_title_int}
            
            expected_arg_slug = f"{pid}-{slugify(p_title)}.argumentario.md"
            if arg_filename and arg_filename != expected_arg_slug:
                diffs["arg_filename"] = {"expected": expected_arg_slug, "current": arg_filename}

        for field in ["tensao", "objetivo", "impacto", "descricao"]:
            p_val = plano_f.get(field, "").strip()
            d_val = dossie_f.get(field, "").strip()
            if p_val and d_val and p_val != d_val:
                # Find first mismatch
                first_diff = "N/A"
                for i in range(min(len(p_val), len(d_val))):
                    if p_val[i] != d_val[i]:
                        first_diff = f"Idx {i}: P='{p_val[i]}' ({hex(ord(p_val[i]))}) vs D='{d_val[i]}' ({hex(ord(d_val[i]))})"
                        break
                if first_diff == "N/A":
                    first_diff = f"Length mismatch: P={len(p_val)} vs D={len(d_val)}"
                
                diffs[field] = {
                    "plano": p_val[:50] + "...",
                    "dossie": d_val[:50] + "...",
                    "divergence": first_diff
                }
        
        if diffs:
            drift.append({"id": pid, "diffs": diffs})
            
    return {"inconsistencies": inconsistencies, "drift": drift}

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Sync Manager para Intervenções Sodexo")
    subparsers = parser.add_subparsers(dest="command")
    
    subparsers.add_parser("find").add_argument("id")
    subparsers.add_parser("extract").add_argument("id")
    subparsers.add_parser("audit")
    
    args = parser.parse_args()
    
    if args.command == "find":
        print(json.dumps(find_interventions(args.id), indent=2))
    elif args.command == "extract":
        print(json.dumps(extract_content(args.id), indent=2))
    elif args.command == "audit":
        res = audit()
        if not res["inconsistencies"] and not res["drift"]:
            print("Tudo 100% sincronizado (IDs e Conteúdo)!")
        else:
            print(json.dumps(res, indent=2))
