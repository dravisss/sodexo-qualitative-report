import os
import re
import json
import argparse
import unicodedata
from pathlib import Path
import shutil
from datetime import datetime

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

def remove_intervention(target_id):
    """
    Remove uma intervenção, arquiva seus arquivos, renumera as subsequentes
    e atualiza o Plano #08.
    """
    if not re.match(r"^I-\d+$", target_id):
        print(f"Erro: ID inválido '{target_id}'. Use formato I-XX (ex: I-05).")
        return

    print(f" iniciada remoção da intervenção {target_id}...")
    
    # 1. Preparar Arquivo
    timestamp = datetime.now().strftime("%Y-%m-%d_%H-%M-%S")
    archive_dir = BASE_DIR / "_archive" / "intervencoes" / f"{timestamp}_removed_{target_id}"
    archive_dir.mkdir(parents=True, exist_ok=True)
    
    # 2. Arquivar arquivos da intervenção alvo
    print(f"-> Arquivando arquivos de {target_id} em {archive_dir}...")
    target_files = list(INTERVENCOES_DIR.glob(f"{target_id}-*.md"))
    if not target_files:
        print(f"Aviso: Nenhum arquivo encontrado para {target_id}. Continuando renumeração...")
    
    for f in target_files:
        shutil.move(str(f), str(archive_dir / f.name))
        print(f"  - Arquivado: {f.name}")

    # 3. Identificar e Renumerar Subsequentes
    # Lista todas as intervenções para encontrar as que precisam descer 1 degrau
    all_files = list(INTERVENCOES_DIR.glob("I-*.md"))
    subsequent_map = {} # {old_id: new_id}
    
    target_num = int(target_id.split("-")[1])
    
    # Encontra IDs maiores que o target
    # Usamos um set para não duplicar (dossie + argumentario tem mesmo ID)
    ids_to_process = set()
    for f in all_files:
        match = re.search(r"(I-(\d+))", f.name)
        if match:
            pid = match.group(1)
            pnum = int(match.group(2))
            if pnum > target_num:
                ids_to_process.add((pnum, pid))
    
    # Ordena crescente para renomear em ordem (I-06 -> I-05, depois I-07 -> I-06)
    # Isso evita colisão de nomes se fizéssemos reverso
    sorted_ids = sorted(list(ids_to_process))
    
    print(f"-> Renumerando {len(sorted_ids)} intervenções subsequentes...")
    
    for pnum, old_id in sorted_ids:
        new_num = pnum - 1
        new_id = f"I-{new_num:02d}"
        subsequent_map[old_id] = new_id
        print(f"  - Processando {old_id} -> {new_id}")
        
        # Renomear arquivos e atualizar conteúdo
        files = list(INTERVENCOES_DIR.glob(f"{old_id}-*.md"))
        for file_path in files:
            # 3.1 Atualizar Conteúdo Interno
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Atualiza Header (# I-XX ...)
            content = re.sub(rf"# {old_id}", f"# {new_id}", content)
            # Atualiza Header Argumentário (# Argumentário — I-XX ...)
            content = re.sub(rf"# Argumentário — {old_id}", f"# Argumentário — {new_id}", content)
            # Atualiza Metadados (Intervenção: I-XX)
            content = re.sub(rf"Intervenção: `{old_id}`", f"Intervenção: `{new_id}`", content)
            content = re.sub(rf"Intervenção: {old_id}", f"Intervenção: {new_id}", content)
            
            with open(file_path, "w", encoding="utf-8") as f:
                f.write(content)
                
            # 3.2 Renomear Arquivo
            new_name = file_path.name.replace(old_id, new_id)
            new_path = file_path.parent / new_name
            file_path.rename(new_path)
            print(f"    - Renomeado: {file_path.name} -> {new_name}")

    # 4. Atualizar Plano #08
    plano_file = REFINED_DIR / "08-plano-de-intervencao-estrategica.md"
    if plano_file.exists():
        print(f"-> Atualizando Plano #08...")
        with open(plano_file, "r", encoding="utf-8") as f:
            content = f.read()
        
        # 4.1 Remover bloco da intervenção deletada
        # Regex: #### I-XX ... (até o próximo #### ou ---)
        # O padrão tenta pegar o bloco inteiro.
        # Atenção: re.DOTALL é necessário.
        
        # Bloco com #### I-XX ...
        block_pattern = rf"#### {target_id} — .*?\n(.*?)(?=\n#### I-|\n---| \Z)"
        # A remoção segura precisa incluir o cabeçalho.
        full_block_pattern = rf"\n*#### {target_id} — .*?(?=\n#### I-|\n---| \Z)"
        
        if re.search(full_block_pattern, content, re.DOTALL):
            content = re.sub(full_block_pattern, "", content, count=1, flags=re.DOTALL)
            print(f"  - Bloco {target_id} removido.")
        else:
            print(f"  - Aviso: Bloco {target_id} não encontrado no Plano #08.")

        # 4.2 Renumerar Headers subsequentes
        # Como já temos o map subsequent_map (old->new), aplicamos as substituições
        # Importante: Fazer isso de forma segura para não substituir texto errado.
        # Focamos em "#### I-XX"
        
        for old_id, new_id in subsequent_map.items():
            pattern = rf"#### {old_id}"
            if re.search(pattern, content):
                content = re.sub(pattern, f"#### {new_id}", content)
                # Opcional: Tentar substituir referências textuais "ver I-XX"
                # Risco: Pode pegar algo que não deve. Vamos nos ater aos headers por segurança garantida.
        
        with open(plano_file, "w", encoding="utf-8") as f:
            f.write(content)
            
    print("Remoção e renumeração concluídas com sucesso!")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Sync Manager para Intervenções Sodexo")
    subparsers = parser.add_subparsers(dest="command")
    
    subparsers.add_parser("find").add_argument("id")
    subparsers.add_parser("extract").add_argument("id")
    subparsers.add_parser("audit")
    
    remove_parser = subparsers.add_parser("remove")
    remove_parser.add_argument("id", help="ID da intervenção a remover (ex: I-05)")
    
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
    elif args.command == "remove":
        remove_intervention(args.id)
