# Evidências — Cajamar e Guarulhos

Esta pasta consolida **todas as evidências** usadas para fundamentar as intervenções do `Refined/08-plano-de-intervencao-estrategica.md`, com escopo em **Cajamar** e **Guarulhos**.

## Estrutura

- `banco/`
  - Export do Postgres (Neon/Netlify) com submissões do roteiro e respostas normalizadas.
- `blobs/`
  - Downloads de arquivos enviados via formulário (Netlify Blobs) e referenciados na tabela `attachments`.
- `pdfs/`
  - PDFs e anexos recebidos por e-mail (inseridos manualmente pelo usuário).
- `indice/`
  - Inventários e índices de rastreabilidade (o que existe, de onde veio, e para qual intervenção pode servir).

## Convenções de rastreabilidade (recomendadas)

- Cada evidência deve ser rastreável para:
  - `unit_slug` (ex.: `cajamar`, `gru-food`, `gru-fm`)
  - `submission_id` (quando vier do banco)
  - `field_id` (quando vier do formulário)
  - `blob_key` (quando vier do Netlify Blobs)

## Status atual

- Export do banco realizado em `banco/`.
- Inventário do banco em `indice/inventario-banco.md`.
- Blobs: pendente download (depende de acesso via Netlify runtime/CLI).
- PDFs: pendente inserção manual pelo usuário.
