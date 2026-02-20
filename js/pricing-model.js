/**
 * Pricing Model Constants and Formulas
 * Based on Sodexo Internal Documents (Feb 2026)
 */

export const PRICING_CONSTANTS = {
    // Fonte: REB_OPE_15 (Seção 6.1) - Soma de INSS, FGTS, Férias, 13º e Provisões
    ENCARGOS_SOCIAIS: 1.6576, 

    UNITS: {
        CAJAMAR: {
            id: 'BR014545',
            name: 'Cajamar (Food)',
            headcount: 24, // Fonte: table_0.md
            currentTurnover: 0.575, // 57.5% ao ano
            avgSalary: 1907, // Piso Auxiliar
            cestaBasica: 248.25, // Fonte: SAP Real (Calculado: Gasto Total / HC)
            valeTransporte: 80.62,
            uniformesBudget: 2000,
            uniformesReal: 2564
        },
        GRU_FOOD: {
            id: 'BR012302',
            name: 'Guarulhos (Food)',
            headcount: 24,
            currentTurnover: 0.415,
            avgSalary: 2007,
            cestaBasica: 248.25,
            valeTransporte: 120.00
        },
        GRU_FM: {
            id: 'BR016517',
            name: 'Guarulhos (FM)',
            headcount: 57,
            currentTurnover: 1.192, // 119.2% ao ano
            avgSalary: 1754,
            cestaBasica: 248.25,
            valeTransporte: 150.00
        }
    },
    BENCHMARKS: {
        MERCADO_LIVRE_FLOOR: 2100, // Referência de mercado local (Cajamar) - A VALIDAR
        FRETADO_UNITARIO: 350.00,
        // Fonte: Simulação Aviso Prévio Indenizado.csv (Linha 2 - Colaborador 5 anos)
        RESCISAO_VETERANO_AVG: 17237.00, 
        RESCISAO_ONBOARDING: 2500.00,
        UPGRADE_SAUDE: 150.00
    }
};

export const FORMULAS = {
    // I-01: Custo de Uniformes/EPI centralizado
    // Lógica: Diferença entre o real praticado e o necessário para kit completo
    I01: (unit) => (unit.headcount * 150) / 12,

    // I-20: ROI de Rescisão (Economia de Turnover)
    // Lógica: (Delta Turnover * HC) * Custo Médio Rescisão.
    // Retorna a economia mensal estimada.
    TURN_SAVINGS: (unit, targetTurnover) => {
        const reduction = Math.max(0, unit.currentTurnover - targetTurnover);
        const annualSavedCPFs = reduction * unit.headcount;
        const totalSaved = annualSavedCPFs * PRICING_CONSTANTS.BENCHMARKS.RESCISAO_VETERANO_AVG;
        return totalSaved / 12;
    },

    // I-41: Ajuste Salarial Territorial
    // Lógica: (Piso Mercado - Piso Atual) * Multiplicador de Encargos * Headcount
    I41: (unit, customFloor) => {
        const marketFloor = customFloor || PRICING_CONSTANTS.BENCHMARKS.MERCADO_LIVRE_FLOOR;
        const delta = Math.max(0, marketFloor - unit.avgSalary);
        return delta * PRICING_CONSTANTS.ENCARGOS_SOCIAIS * unit.headcount;
    }
};

