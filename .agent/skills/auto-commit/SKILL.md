---
name: auto-commit
description: Realiza um commit automático das mudanças atuais no repositório git. Útil para salvar progresso após modificações relevantes.
---

# Skill — Auto-Commit

## Quando usar

- **Sempre** após realizar uma modificação relevante no código ou conteúdo, especialmente antes de iniciar uma nova tarefa ou experimento.
- Quando o usuário solicitar explicitamente para "salvar", "comitar" ou "fazer um checkpoint".
- Após refatorações ou correções de bugs, para garantir um ponto de retorno seguro.

## Como usar

Execute o script python diretamente:

```bash
python3 .agent/skills/auto-commit/scripts/commit.py "Sua mensagem de commit aqui"
```

### Argumentos

- `message` (opcional): Uma mensagem descritiva para o commit.
    - **Recomendado**: Use mensagens semânticas convencionais (ex: `feat: adiciona nova skill`, `fix: corrige erro de verificação`).
    - **Padrão**: Se não fornecida, o script usará um timestamp (`Auto-commit: YYYY-MM-DD HH:MM:SS`).

## Exemplos

**Comitar com mensagem específica (Prefira este):**
```bash
python3 .agent/skills/auto-commit/scripts/commit.py "feat: implementa nova estrutura de skills"
```

**Comitar com mensagem automática (Timestamp):**
```bash
python3 .agent/skills/auto-commit/scripts/commit.py
```

## Notas

- O script executa `git add .` automaticamente antes do commit, incluindo todos os arquivos novos e modificados.
- Se não houver mudanças (`git status --porcelain` vazio), o script não fará nada e avisará "No changes to commit.".
