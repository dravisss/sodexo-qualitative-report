# STATUS — Memória Operacional

## Objetivo

Este arquivo é uma **fonte de verdade operacional** para reduzir reinícios entre conversas.
Ele registra:

- o que já foi feito
- o que está em andamento
- decisões tomadas
- prioridades e próximos passos

## Como usar no início de uma conversa

1. Leia `overview.md` para recuperar tese/vocabulário.
2. Leia `plan-investigacao.md` para recuperar o plano e o checklist das fases.
3. Leia este arquivo para recuperar fase atual, prioridades e pendências.

## Estado atual

- Fase atual: FASE 6 (Checagem Final e Consolidação) — **CICLO DE INVESTIGAÇÃO CONCLUÍDO**
- Entregáveis Finais Consolidados:
  - Matriz de Intervenções: `matriz-intervencoes.md` (36 intervenções auditadas)
  - Argumentários Executivos (Top 3): I-03, I-19, I-21 (em `intervencoes/*.argumentario.md`)
  - Análise de Armadilhas Contratuais: Leroy Merlin e União Química (em `evidencias/notas/CONTRATOS/`)
  - Relatório de Consolidação Final: `relatorio-consolidacao-final.md`
- Auditoria de Rastreabilidade: Concluída com 100% de conformidade nos dossiês I-01 a I-36.
- Próximos Passos (Transição para Execução):
  1. Apresentação do Argumentário I-19 (Fundo de Renovação) para destravar travamento rescisório.
  2. Ativação da Mesa de Infraestrutura (I-03) com base nos fundos de comodato mapeados.
  3. Piloto de Revisão de Quadro (I-21) em Guarulhos FM (turnover 119%).
- Intervenções priorizadas (top 5):
  - I-03 (mesa compartilhada para correção de infraestrutura) — dossiê padronizado
  - I-04 (notificação contratual de manutenção — Cajamar) — dossiê padronizado
  - I-09 (auditoria técnica de fluxo e recursos) — dossiê padronizado
  - I-29 (SLA de atendimento para solicitações de RH) — dossiê padronizado
  - I-30 (auditoria de folha trimestral) — dossiê padronizado
- Lote 2 concluído (torniquete / saúde / ergonomia):
  - I-01 (compra centralizada de uniformes e proteção) — dossiê padronizado
  - I-02 (desvincular cesta básica de atestados médicos) — dossiê padronizado
  - I-05 (orçamento focado em eliminar esforço físico) — dossiê padronizado
  - I-06 (liberação remunerada para casos agudos) — dossiê padronizado
  - I-08 (proteção ergonômica para veteranos) — dossiê padronizado
- Lote 3 concluído (estrutura operacional e ritos):
  - I-07 (rodízio de tarefas pesadas) — dossiê padronizado
  - I-14 (protocolo de passagem de turno) — dossiê padronizado
  - I-21 (revisão do quadro pela demanda real) — dossiê padronizado
  - I-22 (verba carimbada para reparos essenciais) — dossiê padronizado
  - I-25 (fim do cargo ASG/OSG faz-tudo) — dossiê padronizado
- Lote 4 concluído (incentivos/PLR/assiduidade e travamento):
  - I-13 (abertura dos números e limites para o time) — dossiê padronizado
  - I-20 (saída voluntária sem punir quem fica) — dossiê padronizado
  - I-26 (revisão dos deflatores de rotatividade na PLR) — dossiê padronizado
  - I-27 (gatilho progressivo da PLR) — dossiê padronizado
  - I-28 (desconto proporcional para faltas) — dossiê padronizado
- Lote 5 concluído (ritos operacionais e estoque):
  - I-10 (calendário fixo de celebrações) — dossiê padronizado
  - I-11 (banco de folgas emergenciais) — dossiê padronizado
  - I-12 (canal mensal de escuta) — dossiê padronizado
  - I-15 (reserva carimbada por turno) — dossiê padronizado
  - I-16 (turno de pré-preparo) — dossiê padronizado
  - I-17 (improviso como alerta de falha) — dossiê padronizado
  - I-18 (fundo de alimentação e estoque) — dossiê padronizado
- Lote 6 concluído (atração e reposicionamento):
  - I-23 (pacote benefícios transição) — dossiê padronizado
  - I-24 (liderança técnica) — dossiê padronizado
  - I-31 (processo seletivo real) — dossiê padronizado
  - I-32 (fretado e escalas) — dossiê padronizado
  - I-33 (novo pacote benefícios) — dossiê padronizado
  - I-34 (plano de carreira automático) — dossiê padronizado
  - I-35 (ajuste salarial local) — dossiê padronizado
  - I-36 (equalização próprios/terceiros) — dossiê padronizado
- Evidências (estado):
  - MoC consolidada e atualizada: `evidencias/indice/moc.md`
  - Blobs (Netlify) — download e saídas derivadas:
    - Download: scripts agora preferem HTTP via `/api/download-blob?key=...` (site `relatoriosdx.netlify.app`) e validam XLSX com `unzip -t` (re-download automático se inválido). Pastas legadas/corrompidas foram isoladas em `evidencias/blobs/_legacy_corrupt/`.
    - Quadro/Salários (PDFs blob): cópias na raiz `evidencias/blobs/` estavam malformadas para extração (pdfinfo/pdftotext). Foram rebaixadas cópias íntegras via `/api/download-blob?key=...`, substituídas na raiz, e gerados textos extraídos auditáveis:
      - `evidencias/pdfs/text/blobs/FOLHA GERAL COLABORADORES JAN 2026.pdf.txt`
      - `evidencias/pdfs/text/blobs/Geral - Contratados por Centro de Custo.PDF.txt`
      - Cross-check atualizado: `evidencias/indice/cross-check-lacunas.report.md` (lacuna E resolvida)
    - XLSX→CSV (SAP):
      - Real: `evidencias/blobs/csv/sap/Dados_SAP_Real_Jan25-Dez25/`
      - Budget: `evidencias/blobs/csv/sap/Dados_SAP_Budget_FY25_-_FY26/`
      - Real x Budget (EPI/Unif): `evidencias/blobs/csv/sap/Dados_SAP_Real_x_Budget_EPI_e_Unif_FY25/`
    - XLSX→CSV (soffice consolidado): `evidencias/blobs/csv/_xlsx_to_csv_soffice.consolidado.json` (erros=0 para XLSX canônicos)
    - Descrições de cargo (PDF→JSON via Gemini):
      - JSONs por arquivo: `evidencias/blobs/gemini/descricao-cargos-fy26/*.pdf.json`
      - Consolidado: `evidencias/blobs/gemini/descricao-cargos-fy26/_consolidado.json`
  - Banco (Postgres export): `evidencias/banco/submissions_normalized.json` (3 submissions) + relatórios de atualização em `evidencias/indice/atualizacao-inventario.report.{md,json}`
  - PDFs (contratos) — indexados no MoC; extração de cláusulas por unidade ainda pode ser aprofundada:
    - Leroy Merlin (Cajamar) — propostas/aditivos
    - União Química (Guarulhos Food/FM) — contrato/propostas/aditivos

## FASE 3.2 — Entregáveis consolidados (apontamento de saída)

- Notas-mãe (fonte de verdade da digestão por tema):
  - `evidencias/notas/00-nota-mae-plr.analise.md`
  - `evidencias/notas/00-nota-mae-contratos-leroy-merlin.analise.md`
  - `evidencias/notas/00-nota-mae-contratos-uniao-quimica.analise.md`
  - `evidencias/notas/00-nota-mae-quadro-custos-sap.analise.md`
  - `evidencias/notas/00-nota-mae-rescisao-travamento.analise.md`
- Mapas de ligação (ponte para FASE 4):
  - `evidencias/indice/fase3.2-mapas-de-ligacao.md`
- Cross-check de lacunas (estado atual):
  - `evidencias/indice/cross-check-lacunas.report.md`

## FASE 3.2 — Definition of Done (DoD)

- DoD atingido quando:
  - existem notas-mãe por tema central (PLR; contratos Leroy; contratos UQ; quadro/custos/SAP; rescisão)
  - existe mapa de ligação para colagem em dossiês (FASE 4)
  - existe cross-check com lacunas classificadas como: resolvida / pendente (no acervo) / fora do acervo

## Handoff para FASE 4 (piloto recomendado)

- Status: Lote 1 e Lote 2 concluídos no padrão board-friendly
- Dossiês concluídos e padronizados:
  - `intervencoes/I-03-mesa-compartilhada-para-correcao-de-infraestrutura.md`
  - `intervencoes/I-04-notificacao-contratual-de-manutencao-cajamar.md`
  - `intervencoes/I-09-auditoria-tecnica-de-fluxo-e-recursos.md`
  - `intervencoes/I-29-sla-de-atendimento-para-solicitacoes-de-rh.md`
  - `intervencoes/I-30-auditoria-de-folha-trimestral.md`
- Lote 2 concluído e padronizado:
  - `intervencoes/I-01-compra-centralizada-de-uniformes-e-protecao.md`
  - `intervencoes/I-02-desvincular-cesta-basica-de-atestados-medicos.md`
  - `intervencoes/I-05-orcamento-focado-em-eliminar-esforco-fisico.md`
  - `intervencoes/I-06-liberacao-remunerada-para-casos-agudos.md`
  - `intervencoes/I-08-protecao-ergonomica-para-veteranos.md`
- Lote 3 concluído e padronizado:
  - `intervencoes/I-07-rodizio-de-tarefas-pesadas.md`
  - `intervencoes/I-14-protocolo-de-passagem-de-turno.md`
  - `intervencoes/I-21-revisao-do-quadro-pela-demanda-real.md`
  - `intervencoes/I-22-verba-carimbada-para-reparos-essenciais.md`
  - `intervencoes/I-25-fim-do-cargo-asg-osg-faz-tudo.md`
- Lote 4 concluído e padronizado:
  - `intervencoes/I-13-abertura-dos-numeros-e-limites-para-o-time.md`
  - `intervencoes/I-20-saida-voluntaria-sem-punir-quem-fica.md`
  - `intervencoes/I-26-revisao-dos-deflatores-de-rotatividade-na-plr.md`
  - `intervencoes/I-27-gatilho-progressivo-da-plr.md`
  - `intervencoes/I-28-desconto-proporcional-para-faltas.md`
- Lote 5 concluído e padronizado:
  - `intervencoes/I-10-calendario-fixo-de-celebracoes-da-equipe.md`
  - `intervencoes/I-11-banco-de-folgas-emergenciais.md`
  - `intervencoes/I-12-canal-mensal-de-escuta-da-equipe.md`
  - `intervencoes/I-15-reserva-carimbada-por-turno.md`
  - `intervencoes/I-16-turno-de-pre-preparo-mise-en-place.md`
  - `intervencoes/I-17-improviso-como-alerta-de-falha-sistemica.md`
  - `intervencoes/I-18-fundo-de-alimentacao-do-time-e-autorregulacao-de-estoque.md`
- Cola rápida (fontes para iniciar o dossiê):
  - `evidencias/indice/fase3.2-mapas-de-ligacao.md` → seção `I-03`
  - `evidencias/notas/00-nota-mae-contratos-uniao-quimica.analise.md`
  - `evidencias/notas/00-nota-mae-contratos-leroy-merlin.analise.md`
- Lacunas relevantes a tratar como “fora do acervo” (não bloquear piloto):
  - Leroy 4º aditivo 2023: anexos (proposta/carta/planilha) não disponíveis como arquivos no repositório (`cross-check-lacunas.report.md` → item A)
  - União Química 2019: valores de “mínimo faturamento” seguem ilegíveis no OCR2 (item C)

## Decisões e convenções

- Limiar de evidência para “sustentado”: convergência de 2+ evidências independentes (ex.: banco + PDF, ou múltiplos PDFs), com claim falsificável e rastreável
- Padrão do dossiê: híbrido (auditável, mas com resumo executivo curto)
- Ordenação padrão da matriz: por risco mitigado (jurídico/contratual/INSS/operacional) e força de evidência; desempate por viabilidade
- Escopo do banco (Postgres export): `unit_slug=general` é o default/fonte de verdade atual; recorte por unidade (`cajamar`, `gru-food`, `gru-fm`) é legado e só deve ser usado quando explicitamente solicitado

## Decisões e convenções — Navegação (War Room / Hub)

- Plano (#08) é o hub de navegação de execução
- Matriz de Intervenções foi despublicada da navegação principal do leitor do relatório (permanece como artefato auditável)
- Para preservar contexto, o War Room usa páginas próprias em shell (sidebar do War Room):
  - `warroom-plano.html` (Plano/Hub renderizado dentro do War Room)
  - `warroom-matriz.html` (Matriz renderizada dentro do War Room)
- Sidebars do War Room foram ajustadas para manter o usuário no contexto War Room ao navegar:
  - `warroom.html`, `kanban.html`, `dossie.html`, `argumentario.html` apontam para `warroom-plano.html`
  - Link “Audit: Matriz” aponta para `warroom-matriz.html`

## Backlog (lacunas transversais)

- Mapear intervenções para unidades (Cajamar vs Guarulhos Food vs Guarulhos FM) de forma consistente em todos os dossiês.
- Extrair “break-even” e premissas financeiras (question_14 / contratos) e ligar a I-21 (quadro por demanda) e I-03/I-04 (mesa/infra).
- Extrair regras e thresholds de PLR (REB_OPE_08 e REB_OPE_15) e ligar explicitamente a I-26/I-27.
- Extrair evidência de custo rescisório/aviso prévio (planilhas) para sustentar I-19/I-20 e discussão de travamento rescisório.
- Consolidar um padrão de “claim” para evitar que dossiês virem apenas checklist (cada seção deve concluir algo, mesmo que seja “lacuna”).
- Continuar padronização em lotes até cobrir o conjunto de intervenções prioritárias antes de gerar matriz.

## Próximos passos imediatos

- Lote 6 (atração/reposicionamento e equalizações): I-23, I-24, I-31, I-32, I-33, I-34, I-35, I-36.
- Finalizar Lote 6 e rodar `.windsurf/workflows/gerar-matriz-a-partir-dossies.md`.
