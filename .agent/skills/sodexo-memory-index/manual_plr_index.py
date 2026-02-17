#!/usr/bin/env python3
"""
Manual indexing of today's critical PLR Forensic findings
"""
import sys
from pathlib import Path

# Add current directory to path
sys.path.insert(0, str(Path(__file__).parent))
from research_bridge import create_memory

# Memory 1: Overview of Forensic Analysis
create_memory(
    content="""Análise Forense dos Deflatores de PLR (FY26)

Documento executivo que desconstrui 7 falhas sistêmicas nos deflatores de PLR da Sodexo, baseado em citações diretas de REB_EMP_21, REB_OPE_15 e REB_OPE_08.

**Arquivo:** evidencias/notas/PLR/PLR_Analise_Critica_Incentivos.analise.md

**7 Categorias Identificadas:**
1. Pacto de Silêncio + Cegueira Estrutural (DTA)
2. Limbo do Turnover (GU)
3. Responsabilidade sem Autoridade (PcD)
4. Sinergia Invisível (Absenteísmo vs Cesta Básica)
5. Abismo Financeiro (Gatilho 95%)
6. Contágio de Risco (Loteria do Chefe)
7. Martírio da Base (Metas Fantasmas)

Cada falha demonstra como os deflatores, ao tentar controlar riscos, criaram incentivos para escondê-los.""",
    tags=["sodexo", "plr", "deflatores", "analise-critica", "i-26", "i-02"],
    metadata={"source": "PLR_Analise_Critica_Incentivos.analise.md", "type": "forensic-analysis", "date": "2026-02-12"}
)

# Memory 2: DTA - Pacto de Silêncio
create_memory(
    content="""Deflator DTA: O "Pacto de Silêncio" e a Cegueira Estrutural

**A Regra (REB_OPE_15, Item 6.3.1 e REB_OPE_08, Item 4.4.4.1):**
"A DTA confirmada em qualquer centro de lucro... deflaciona o direito ao pagamento de PLR em 100% de todos os colaboradores..."

**Dupla Falha:**
1. **Cegueira Estrutural:** Pune o CPF do cozinheiro pelo defeito do CNPJ (infraestrutura). Se a geladeira quebra e causa o problema, a equipe paga a conta.
2. **Incentivo à Ocultação:** Diante de risco (ex: temperatura inadequada por falha de equipamento), a equipe tem incentivo racional para NÃO reportar o incidente, transformando riscos controláveis em catástrofes.

**Implicação:** Punição nuclear (100%) sobre risco muitas vezes estrutural cria pact of silence e mata a cultura de reporte de near-miss.""",
    tags=["sodexo", "plr", "dta", "seguranca-alimentar", "deflatores", "risco-operacional"],
    metadata={"deflator": "DTA", "penalty": "100%", "policy": "REB_OPE_15, REB_OPE_08"}
)

# Memory 3: Limbo do Turnover (GU)
create_memory(
    content="""Limbo do Turnover: A Divergência Vertical entre Liderança e GUs

**Para a Liderança (REB_EMP_21, Item 4.2.2.2):**
Meta evoluiu para "Regrettable Turnover". O Diretor é incentivado a reter talentos-chave, mas pode demitir baixo desempenho sem penalidade.

**Para o Gerente de Unidade (REB_OPE_08, Item 4.4.4.4):**
A regra permanece no passado. "Turnover Total" atua como deflator de até -10%.

**Efeito Prático:**
O Diretor cobra "renovação da equipe" (qualidade), mas o Gerente sabe que cada demissão (mesmo de funcionário tóxico) custa 10% do seu bônus.

**Resultado:** O GU mantém quadros medíocres para proteger o CPF (Bônus), sabotando a estratégia do CNPJ (Qualidade/Produtividade).

**Implicação para I-26:** Gerentes de Unidade não estão nem na política de "Regrettable" nem protegidos. Estão num limbo que incentiva mediocridade.""",
    tags=["sodexo", "plr", "turnover", "i-26", "gerente-unidade", "deflatores", "desalinhamento"],
    metadata={"deflator": "Turnover Total", "penalty": "10%", "policy": "REB_OPE_08", "intervention": "I-26"}
)

# Memory 4: Abismo Financeiro (Cliff Effect)
create_memory(
    content="""Abismo Financeiro: O Gatilho "Tudo ou Nada" de 95%

**A Regra (REB_OPE_08, Item 4.4.1):**
"O 'gatilho' deste nível corresponde a 95% do atingimento da meta... sendo utilizada a progressão linear de 0 (zero) a 100%..."

**O Dilema:**
Se o GU entregar 94,9% do lucro prometido, ele recebe ZERO. Se entregar 100%, recebe o Target.

**Falha (Short-termism):**
Esse "abismo" cria incentivo desesperado no fechamento do ano fiscal. Um gerente próximo da linha de corte (ex: 93%) tem incentivo racional para "queimar o futuro" para salvar o presente:
- Cancelar manutenções preventivas
- Demitir equipe crucial para reduzir folha no último mês
- Segurar notas fiscais

O gatilho binário destrói valor a longo prazo em troca de meta artificial de curto prazo.""",
    tags=["sodexo", "plr", "cliff-effect", "short-termism", "deflatores", "gerente-unidade"],
    metadata={"trigger": "95%", "penalty": "All-or-Nothing", "policy": "REB_OPE_08"}
)

# Memory 5: Metas Fantasmas (Base Operacional)
create_memory(
    content="""Martírio da Base: Metas Fantasmas e Punição Nuclear (Operacional)

Para o colaborador operacional (cozinheiro, auxiliar), a regra REB_OPE_15 combina metas inatingíveis com punições desproporcionais:

**1. Metas Fantasmas (30% do Bônus Fora de Controle):**
- Regra (REB_OPE_15, Item 6.1.c.2 e 6.1.d): 10% da PLR depende da "Retenção da Diretoria" e 20% depende do "UOP% da Diretoria".
- Realidade: Um auxiliar de limpeza em Cajamar está tendo seu bônus decidido pela taxa de retenção de contratos de um Diretor que ele sequer conhece, operando em outras cidades.
- Falha: Desconexão total entre esforço e recompensa. O colaborador não pode influenciar essas métricas. Isso não é incentivo, é loteria.

**2. Guilhotina do Desperdício (Waste Watch):**
- Regra (REB_OPE_15, Item 6.1.b): "Redução < 50% do baseline = 0%. Redução >= 50% = 10% da meta"
- Efeito: Desencoraja esforço incremental. Se a equipe reduzir "apenas" 40% (hercúleo), ganha ZERO.

**3. Armadilha do Absenteísmo (110 horas):**
- Regra (REB_OPE_15, Nota **): "Colaboradores com 110 horas ou mais de faltas... perdem em 100% o valor de PLR"
- Risco: Incentiva presenteísmo (vir doente) para não cruzar a linha fatal das 110h, colocando segurança alimentar em risco.""",
    tags=["sodexo", "plr", "operacional", "deflatores", "metas-fantasmas", "base"],
    metadata={"policy": "REB_OPE_15", "audience": "base-operacional"}
)

# Memory 6: Sinergia Cesta + PLR
create_memory(
    content="""Sinergia Invisível: Absenteísmo vs Cesta Básica

**A Regra (REB_OPE_15, Item 6.1.a):**
A PLR Operacional paga +20% de bônus por "Zero Faltas Injustificadas".

**A Oportunidade (Implicação para I-02):**
Esta regra já remunera a presença de forma robusta. Isso torna OBSOLETA a necessidade da Cesta Básica atuar como "fiscal de atestados" (Intervenção I-02). 

**Lógica:**
- A PLR já faz o papel de incentivo financeiro à frequência
- Liberando a Cesta Básica para ser um benefício puramente social/nutricional
- Reduzindo o presenteísmo de doentes (que vêm trabalhar para não perder a cesta, contaminando a cozinha)

**Implicação:** Há redundância entre dois instrumentos (PLR + Cesta). Podemos simplificar.""",
    tags=["sodexo", "plr", "cesta-basica", "i-02", "absenteismo", "sinergia"],
    metadata={"intervention": "I-02", "policy": "REB_OPE_15", "synergy": "PLR-Cesta"}
)

# Memory 7: Contágio de Risco (GO Dependency)
create_memory(
    content="""Contágio de Risco: A Loteria do Chefe (Multiplicador GO)

**A Regra (REB_OPE_08, Item 4.4.3, Multiplicador Nível II):**
"Caso o Gestor imediato... atinja o resultado... o colaborador terá uma premiação suplementar..."

**A Realidade:**
O esforço extra do GU (Superação) só é pago se o Chefe (GO) também bater a meta.

**A Falha:**
Um GU de alta performance ("Star Performer") pode ficar sem seu multiplicador simplesmente porque OUTRAS unidades da região foram mal, derrubando a meta do GO.

**Efeito:**
Isso mata a meritocracia individual. O GU sente que seu esforço marginal é inútil ("Por que vou me matar de trabalhar se o bônus depende da unidade vizinha que é um caos?"). Transforma engajamento em cinismo.

**Implicação:** Dependency chain quebra a relação esforço-recompensa individual.""",
    tags=["sodexo", "plr", "gerente-unidade", "multiplicador", "deflatores", "meritocracia"],
    metadata={"policy": "REB_OPE_08", "multiplier": "Nivel II", "dependency": "GO"}
)

print("✅ 7 memórias críticas indexadas com sucesso!")
print("Total de memórias sobre análise forense de PLR: 7")
print("\nTags utilizadas:")
print("- sodexo, plr, deflatores, analise-critica")
print("- i-26, i-02 (intervenções relacionadas)")
print("- dta, turnover, cesta-basica, seguranca-alimentar")
print("- gerente-unidade, operacional, base")
