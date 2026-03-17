
import fs from 'fs';

const MIGRATED_FILE = './backups/kanban/kanban_state_after_migration_preview.json';
const API_URL = 'https://relatoriosdx.netlify.app/.netlify/functions/kanban-state';

async function deploy() {
    console.log("🚀 Aplicando Migração do Kanban no Netlify...");
    
    if (!fs.existsSync(MIGRATED_FILE)) {
        console.error("❌ Erro: Arquivo migrado não encontrado em " + MIGRATED_FILE);
        process.exit(1);
    }

    const migratedData = JSON.parse(fs.readFileSync(MIGRATED_FILE, 'utf8'));

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(migratedData)
        });

        if (response.ok) {
            console.log("✅ Migração aplicada com sucesso! Os IDs foram atualizados no Netlify.");
        } else {
            const errorText = await response.text();
            console.error("❌ Falha na aplicação:", response.status, errorText);
        }
    } catch (error) {
        console.error("❌ Erro de conexão durante a aplicação:", error);
    }
}

deploy();
