---
name: checagem-de-rastreabilidade
description: Auditar rastreabilidade de claims para garantir que dossiês e matrizes sejam citáveis e verificáveis
---

# Skill — Checagem de rastreabilidade

## Objetivo

Garantir que dossiês e matrizes sejam auditáveis.

## O que checar

- Cada claim relevante tem ao menos 1 referência (path/ID).
- Referências apontam para arquivos existentes no repo.
- PDFs: incluir trecho; Banco: incluir `submission_id` e o campo; Blob: incluir `blob_key` quando houver.

## Saída

- Lista de problemas encontrados
- Sugestão de correção (onde inserir referência, ou o que precisa ser coletado)
