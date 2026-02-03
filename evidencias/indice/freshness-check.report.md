# Freshness check — inventário vs formulário

Gerado em: 2026-01-30T16:51:15Z

## Export atual (hash + timestamps)

| Artefato | Count | max_updated_at | max_created_at | sha256 |
|---|---:|---|---|---|
| submissions.json | 3 | 2026-01-29T17:31:00.095Z | 2026-01-17T23:10:11.100Z | `ca34759aa790af200b665578f47a80fcd7c502ff70c52eb5e0bc8c29e9136738` |
| answers.json | 15137 | 2026-01-29T17:31:00.505Z | 2026-01-28T19:09:37.461Z | `f4f380531d8fe75fe5c97df568304edabb797aa8181d59fe9ffb24bfde5112a9` |
| attachments.json | 23 |  | 2026-01-28T19:09:34.858Z | `9044a92161fcd284ffae5dec3e3fa56fcb2ccf342c8d805f406d9ed41d2b2787` |

## Delta vs snapshot anterior (_previous)

Report fonte: `evidencias/indice/atualizacao-inventario.report.json` (gerado em 2026-01-30T16:50:46.960Z)

| Item | prev_total | next_total | added | changed | removed |
|---|---:|---:|---:|---:|---:|
| submissions | 3 | 3 | 0 | 0 | 0 |
| answers | 15137 | 15137 | 0 | 0 | 0 |
| attachments_records | 23 | 23 | 0 | 0 | 0 |

## Interpretação

- Se `added/changed/removed` estiverem todos em 0, o inventário local está alinhado com o export mais recente no momento da execução.
- Para provar “mais atual”, rode novamente este relatório em outro momento e compare `sha256` + `max_updated_at`.
