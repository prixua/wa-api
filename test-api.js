// Exemplo de teste da API WhatsApp
// Execute este arquivo com: node test-api.js

const testAPI = async () => {
    const baseURL = 'http://localhost:3000';
    
    try {
        // 1. Verificar status
        console.log('🔍 Verificando status da API...');
        const statusResponse = await fetch(`${baseURL}/status`);
        const status = await statusResponse.json();
        console.log('Status:', status);
        
        if (status.status !== 'connected') {
            console.log('❌ WhatsApp não está conectado. Execute a aplicação principal primeiro.');
            return;
        }
        
        // 2. Obter informações do cliente
        console.log('\n📱 Obtendo informações do cliente...');
        const clientResponse = await fetch(`${baseURL}/client-info`);
        const clientInfo = await clientResponse.json();
        console.log('Cliente:', clientInfo);
        
        // 3. Enviar mensagem de teste
        console.log('\n📤 Enviando mensagem de teste...');
        
        // ALTERE ESTE NÚMERO PARA UM NÚMERO VÁLIDO
        const testNumber = '5511999999999'; // Substitua pelo seu número
        const testMessage = 'Olá! Esta é uma mensagem de teste da API WhatsApp. 🚀';
        
        const messageResponse = await fetch(`${baseURL}/send-message`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                number: testNumber,
                message: testMessage
            })
        });
        
        const messageResult = await messageResponse.json();
        console.log('Resultado do envio:', messageResult);
        
        if (messageResult.success) {
            console.log('✅ Mensagem enviada com sucesso!');
        } else {
            console.log('❌ Falha no envio:', messageResult.error);
        }
        
    } catch (error) {
        console.error('❌ Erro ao testar API:', error.message);
        console.log('Certifique-se de que a aplicação principal está rodando (npm start)');
    }
};

// Verificar se fetch está disponível (Node.js 18+)
if (typeof fetch === 'undefined') {
    console.log('❌ Este script requer Node.js 18+ ou instale node-fetch');
    console.log('Para Node.js < 18, instale: npm install node-fetch');
    process.exit(1);
}

// Executar teste
testAPI();