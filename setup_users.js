
const { pool } = require('./src/config/database');
const crypto = require('crypto');

async function setupUsers() {
    try {
        console.log("Adicionando colunas de usuario...");
        await pool.query('ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS usuario VARCHAR(60) UNIQUE');
        await pool.query('ALTER TABLE profissionais ADD COLUMN IF NOT EXISTS senha_hash VARCHAR(255)');
        
        console.log("Definindo usuarios e senhas...");
        const res = await pool.query('SELECT id, nome, usuario FROM profissionais WHERE usuario IS NULL');
        if (res.rows.length > 0) {
            const defaultPassword = '123456';
            
            for (const p of res.rows) {
                const salt = crypto.randomBytes(16).toString('hex');
                const hash = crypto.scryptSync(defaultPassword, salt, 64).toString('base64url');
                const hashString = `scrypt$${salt}$${hash}`;
                
                let defaultUser = p.nome.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
                if (p.nome.toLowerCase().includes('leo')) defaultUser = 'leo';
                else if (p.nome.toLowerCase().includes('gustavo')) defaultUser = 'gustavo';
                else if (p.nome.toLowerCase().includes('derick')) defaultUser = 'derick';
                
                await pool.query('UPDATE profissionais SET usuario = $1, senha_hash = $2 WHERE id = $3', [defaultUser, hashString, p.id]);
                console.log(`Usuario configurado: ${defaultUser} / 123456`);
            }
        } else {
            console.log("Nenhum profissional sem usuario encontrado (ja configurados).");
        }
        
        console.log("Finalizado.");
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
setupUsers();
