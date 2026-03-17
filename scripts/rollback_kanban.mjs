
import fs from 'fs';

const BACKUP_FILE = './backups/kanban/kanban_state_before_migration.json';
const API_URL = 'https://relatoriosdx.netlify.app/.netlify/functions/kanban-state';

async function rollback() {
    console.log("🔄 Iniciando Rollback do Kanban...");
    
    if (!fs.existsSync(BACKUP_FILE)) {
        console.error("❌ Erro: Arquivo de backup não encontrado em " + BACKUP_FILE);
        process.exit(1);
    }

    const backupData = JSON.parse(fs.readFileSync(BACKUP_FILE, 'utf8'));

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(backupData)
        });

        if (response.ok) {
            console.log("✅ Rollback concluído com sucesso! O estado anterior foi restaurado no Netlify.");
        } else {
            const errorText = await response.text();
            console.error("❌ Falha no Rollback:", response.status, errorText);
        }
    } catch (error) {
        console.error("❌ Erro de conexão durante o Rollback:", error);
    }
}

rollback();
