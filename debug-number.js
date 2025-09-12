// Script para testar especificamente o número que não está recebendo mensagens
// Execute com: node debug-number.js

const testNumber = async () => {
    const baseURL = 'http://localhost:3000';
    const number = '5551999353392'; // Seu número que não está recebendo
    
    try {
        console.log('🔍 Testando número:', number);
        console.log('='.repeat(50));
        
        // 1. Verificar status da API
        console.log('\n1. Verificando status da API...');
        const statusResponse = await fetch(`${baseURL}/status`);
        const status = await statusResponse.json();
        console.log('Status:', status);
        
        if (status.status !== 'connected') {
            console.log('❌ API não está conectada. Execute npm start primeiro.');
            return;
        }
        
        // 2. Verificar informações do cliente
        console.log('\n2. Informações do cliente WhatsApp...');
        const clientResponse = await fetch(`${baseURL}/client-info`);
        const clientInfo = await clientResponse.json();
        console.log('Cliente:', clientInfo);
        
        // 3. Verificar se o número está registrado
        console.log('\n3. Verificando se o número está registrado...');
        const checkResponse = await fetch(`${baseURL}/check-number`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ number: number })
        });
        const checkResult = await checkResponse.json();
        console.log('Verificação do número:', checkResult);
        
        if (!checkResult.isRegistered) {
            console.log('❌ Número não está registrado no WhatsApp!');
            console.log('Verifique se o número está correto e tem WhatsApp ativo.');
            return;
        }
        
        // 4. Listar alguns chats para ver se há conversa existente
        console.log('\n4. Verificando chats existentes...');
        const chatsResponse = await fetch(`${baseURL}/chats`);
        const chatsResult = await chatsResponse.json();
        console.log('Chats encontrados:', chatsResult.totalChats);
        
        // Procurar por chat com esse número
        const targetChat = chatsResult.recentChats?.find(chat => 
            chat.id.includes(number.replace(/\D/g, ''))
        );
        
        if (targetChat) {
            console.log('✅ Chat existente encontrado:', targetChat);
        } else {
            console.log('⚠️ Nenhum chat existente encontrado com esse número');
        }
        
        // 5. Tentar enviar mensagem de teste
        console.log('\n5. Enviando mensagem de teste...');
        const messageResponse = await fetch(`${baseURL}/send-message`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                number: number,
                message: `Teste de debug - ${new Date().toLocaleTimeString()}`
            })
        });
        
        const messageResult = await messageResponse.json();
        console.log('Resultado do envio:', messageResult);
        
        // 6. Análise final
        console.log('\n' + '='.repeat(50));
        console.log('📊 ANÁLISE FINAL:');
        console.log('='.repeat(50));
        
        if (messageResult.success) {
            console.log('✅ Mensagem foi enviada pela API');
            console.log(`📱 Número formatado: ${messageResult.formattedNumber}`);
            console.log(`📬 Status de entrega: ${messageResult.ackDescription}`);
            
            if (messageResult.ackStatus === 1) {
                console.log('⚠️  Mensagem enviada ao servidor, mas pode não ter chegado ao destinatário');
                console.log('💡 Possíveis causas:');
                console.log('   - Número não tem WhatsApp ativo');
                console.log('   - Número bloqueou mensagens de desconhecidos');
                console.log('   - Problema de conectividade do destinatário');
                console.log('   - WhatsApp do destinatário não está funcionando');
            } else if (messageResult.ackStatus >= 2) {
                console.log('✅ Mensagem foi entregue com sucesso!');
            }
        } else {
            console.log('❌ Falha no envio:', messageResult.error);
        }
        
    } catch (error) {
        console.error('❌ Erro durante o teste:', error.message);
    }
};

// Verificar se fetch está disponível
if (typeof fetch === 'undefined') {
    console.log('❌ Este script requer Node.js 18+ ou instale node-fetch');
    process.exit(1);
}

testNumber();