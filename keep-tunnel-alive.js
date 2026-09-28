const { spawn } = require('child_process');

const PORT = 3001;
const SUBDOMAIN = 'univet-staging-teste';

function startTunnel() {
    console.log(`\n[Tunnel] Iniciando túnel para a porta ${PORT} com subdomínio ${SUBDOMAIN}...`);
    
    // Roda o localtunnel via npx
    const lt = spawn('npx', ['localtunnel', '--port', PORT, '--subdomain', SUBDOMAIN], { shell: true });

    lt.stdout.on('data', (data) => {
        console.log(`[Tunnel] ${data.toString().trim()}`);
    });

    lt.stderr.on('data', (data) => {
        console.error(`[Tunnel Error] ${data.toString().trim()}`);
    });

    lt.on('close', (code) => {
        console.log(`[Tunnel] Conexão caiu (código ${code}). Reiniciando em 3 segundos...`);
        setTimeout(startTunnel, 3000);
    });
}

startTunnel();
