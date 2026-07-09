const { createApp } = require('./src/app');
const { conectarBanco, pool } = require('./src/config/database');
const { executarMigracoes } = require('./src/config/migrations');

const PORT = Number(process.env.PORT) || 3000;

async function iniciarServidor() {
    try {
        await conectarBanco();
        await executarMigracoes();
        console.log('Banco de dados PostgreSQL e migracoes concluidas.');
    } catch (dbError) {
        console.warn('\n⚠️  ATENCAO: Nao foi possivel conectar ao banco de dados PostgreSQL:', dbError.message);
        console.warn('O servidor Express iniciara normalmente servindo o frontend moderno em modo demonstracao.\n');
    }

    const app = createApp();
    const server = app.listen(PORT, () => {
        console.log(`Servidor rodando em http://localhost:${PORT}`);
    });

    const encerrar = () => {
        server.close(async () => {
            await pool.end();
            process.exit(0);
        });
    };

    process.on('SIGINT', encerrar);
    process.on('SIGTERM', encerrar);

    return server;
}

if (require.main === module) {
    iniciarServidor().catch((error) => {
        console.error('Erro ao iniciar o servidor:', error.message);
        process.exit(1);
    });
}

module.exports = { iniciarServidor };
