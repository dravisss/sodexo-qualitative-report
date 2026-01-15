/**
 * Report Reader - Article Configuration
 * Manifest of all articles with titles and paths
 */

const ARTICLES = [
    {
        id: '00',
        title: 'Mapa de Conteúdo',
        subtitle: 'Visão geral do relatório',
        path: './Refined/00-Map-of-Content.md',
        icon: '📋'
    },
    {
        id: '01',
        title: 'Arquitetura de Incentivos',
        subtitle: 'Análise sistêmica do lucro',
        path: './Refined/01-analise-sistemica-incentivos-lucro.md',
        icon: '💰'
    },
    {
        id: '02',
        title: 'Riscos Psicossociais',
        subtitle: 'Custo humano mapeado',
        path: './Refined/02-mapeamento-riscos-psicossociais-custo-humano.md',
        icon: '🧠'
    },
    {
        id: '03',
        title: 'Gestão de Pessoas',
        subtitle: 'Travamento rescisório',
        path: './Refined/03-analise-gestao-pessoas-travamento-rescisorio.md',
        icon: '👥'
    },
    {
        id: '04',
        title: 'Panorama Macroeconômico',
        subtitle: 'Trabalho em serviços',
        path: './Refined/04-panorama-macroeconomico-trabalho-servicos.md',
        icon: '📊'
    },
    {
        id: '05',
        title: 'Dossiês Operacionais',
        subtitle: 'Estudo comparativo',
        path: './Refined/05-dossies-operacionais-estudo-comparativo.md',
        icon: '🏭'
    },
    {
        id: '11',
        title: 'Visão Sistêmica',
        subtitle: 'A dinâmica oculta dos ciclos',
        path: './Refined/11-visao-sistemica-dos-ciclos.md',
        icon: '🔄'
    },
    {
        id: '06',
        title: 'Resumo Executivo',
        subtitle: 'Para o Board',
        path: './Refined/06-resumo-executivo-board.md',
        icon: '📑'
    },
    {
        id: '07',
        title: 'Painel de Risco',
        subtitle: 'Consolidado',
        path: './Refined/07-painel-risco-consolidado.md',
        icon: '⚠️'
    },
    {
        id: '08',
        title: 'Plano de Intervenção',
        subtitle: 'Estratégia completa',
        path: './Refined/08-plano-de-intervencao-estrategica.md',
        icon: '🎯'
    }
];

// Report metadata
const REPORT_META = {
    title: 'Análise Qualitativa Sodexo',
    subtitle: 'Tensões Sistêmicas e Intervenções',
    version: '1.0',
    date: '2026-01-14'
};

export { ARTICLES, REPORT_META };
