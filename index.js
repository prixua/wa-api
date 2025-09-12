const express = require('express');
const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors());

let clientReady = false;
let whatsappClient = null;

// Função para descrever status de entrega
function getAckDescription(ack) {
    switch(ack) {
        case 0: return 'Erro';
        case 1: return 'Enviado ao servidor';
        case 2: return 'Recebido pelo destinatário';
        case 3: return 'Lido pelo destinatário';
        case 4: return 'Tocado (apenas áudio)';
        default: return 'Status desconhecido';
    }
}

// Configuração do cliente WhatsApp
const client = new Client({
    authStrategy: new LocalAuth({
        clientId: 'whatsapp-api-session'
    }),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu'
        ]
    }
});

// Eventos do WhatsApp Client
client.on('qr', (qr) => {
    console.log('📱 QR Code gerado! Escaneie com seu WhatsApp:');
    qrcode.generate(qr, { small: true });
    console.log('🔗 Você também pode escanear o QR code acima.');
});

client.on('ready', () => {
    console.log('✅ WhatsApp Client está pronto!');
    clientReady = true;
    whatsappClient = client;
});

client.on('authenticated', () => {
    console.log('🔐 Autenticado com sucesso!');
});

client.on('auth_failure', (msg) => {
    console.error('❌ Falha na autenticação:', msg);
    clientReady = false;
});

client.on('disconnected', (reason) => {
    console.log('📵 Cliente desconectado:', reason);
    clientReady = false;
});

// Eventos de mensagem para debugging
client.on('message_ack', (msg, ack) => {
    console.log(`📬 Status da mensagem ${msg.id.id}: ${getAckDescription(ack)}`);
});

client.on('message_create', (msg) => {
    if (msg.fromMe) {
        console.log(`📤 Mensagem criada: ${msg.body} para ${msg.to}`);
    }
});

// Inicializar cliente WhatsApp
console.log('🚀 Iniciando cliente WhatsApp...');
client.initialize();

// Função para formatar número de telefone
function formatPhoneNumber(number) {
    console.log(`🔧 Formatando número original: ${number}`);
    
    // Remove caracteres não numéricos
    let cleanNumber = number.replace(/\D/g, '');
    console.log(`🔧 Número limpo: ${cleanNumber}`);
    
    // Se não começar com código do país, adiciona código do Brasil (55)
    if (!cleanNumber.startsWith('55') && cleanNumber.length === 11) {
        cleanNumber = '55' + cleanNumber;
        console.log(`🔧 Adicionado código do país: ${cleanNumber}`);
    }
    
    // Adiciona @c.us no final para WhatsApp
    const formattedNumber = cleanNumber + '@c.us';
    console.log(`🔧 Número final formatado: ${formattedNumber}`);
    
    return formattedNumber;
}

/**
 * @route GET /status
 * @description Verifica o status da conexão com o WhatsApp.
 * @returns {Object} Status da conexão e timestamp.
 *
 * @example
 * curl http://localhost:3000/status
 */
app.get('/status', (req, res) => {
    res.json({
        status: clientReady ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

/**
 * @route POST /send-message
 * @description Envia uma mensagem para um número de WhatsApp.
 * @body {string} number - Número de telefone (com DDD, pode ser sem o 55).
 * @body {string} message - Mensagem a ser enviada.
 * @returns {Object} Detalhes do envio da mensagem.
 *
 * @example
 * curl -X POST http://localhost:3000/send-message \
 *   -H "Content-Type: application/json" \
 *   -d '{"number": "11999999999", "message": "Olá!"}'
 */
app.post('/send-message', async (req, res) => {
    try {
        const { number, message } = req.body;

        // Validações
        if (!number || !message) {
            return res.status(400).json({
                success: false,
                error: 'Número e mensagem são obrigatórios'
            });
        }

        if (!clientReady) {
            return res.status(503).json({
                success: false,
                error: 'WhatsApp não está conectado. Verifique o QR code.'
            });
        }

        // Formatar número
        const formattedNumber = formatPhoneNumber(number);
        
        console.log(`📤 Tentando enviar mensagem...`);
        console.log(`📱 Para: ${formattedNumber}`);
        console.log(`💬 Mensagem: ${message}`);

        // Verificar se o número é válido no WhatsApp
        console.log(`🔍 Verificando se o número está registrado no WhatsApp...`);
        const isRegistered = await whatsappClient.isRegisteredUser(formattedNumber);
        console.log(`✅ Número registrado: ${isRegistered}`);
        
        if (!isRegistered) {
            console.log(`❌ Número ${formattedNumber} não está registrado no WhatsApp`);
            return res.status(400).json({
                success: false,
                error: 'Número não está registrado no WhatsApp',
                formattedNumber: formattedNumber
            });
        }

        // Verificar se existe um chat com esse contato
        console.log(`🔍 Verificando chat existente...`);
        try {
            const chat = await whatsappClient.getChatById(formattedNumber);
            console.log(`💬 Chat encontrado: ${chat.name || 'Sem nome'}`);
        } catch (chatError) {
            console.log(`⚠️ Chat não encontrado, mas tentando enviar mesmo assim...`);
        }

        // Enviar mensagem
        console.log(`📤 Enviando mensagem agora...`);
        const result = await whatsappClient.sendMessage(formattedNumber, message);
        
        console.log(`✅ Mensagem enviada!`);
        console.log(`📨 ID da mensagem: ${result.id.id}`);
        console.log(`📨 Status: ${result.ack}`); // 0=erro, 1=enviado, 2=recebido, 3=lido
        
        res.json({
            success: true,
            messageId: result.id.id,
            timestamp: new Date().toISOString(),
            to: number,
            formattedNumber: formattedNumber,
            message: message,
            ackStatus: result.ack,
            ackDescription: getAckDescription(result.ack)
        });

    } catch (error) {
        console.error('❌ Erro ao enviar mensagem:', error);
        res.status(500).json({
            success: false,
            error: 'Erro interno do servidor',
            details: error.message
        });
    }
});

/**
 * @route GET /client-info
 * @description Retorna informações do cliente WhatsApp autenticado.
 * @returns {Object} Informações do cliente (nome, número, plataforma).
 *
 * @example
 * curl http://localhost:3000/client-info
 */
app.get('/client-info', async (req, res) => {
    try {
        if (!clientReady) {
            return res.status(503).json({
                success: false,
                error: 'WhatsApp não está conectado'
            });
        }

        const info = whatsappClient.info;
        res.json({
            success: true,
            clientInfo: {
                name: info.pushname,
                number: info.wid.user,
                platform: info.platform
            }
        });
    } catch (error) {
        console.error('❌ Erro ao obter informações:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route GET /chats
 * @description Lista os 10 chats mais recentes do WhatsApp.
 * @returns {Object} Lista de chats recentes.
 *
 * @example
 * curl http://localhost:3000/chats
 */
app.get('/chats', async (req, res) => {
    try {
        if (!clientReady) {
            return res.status(503).json({
                success: false,
                error: 'WhatsApp não está conectado'
            });
        }

        const chats = await whatsappClient.getChats();
        const chatList = chats.slice(0, 10).map(chat => ({
            id: chat.id._serialized,
            name: chat.name,
            isGroup: chat.isGroup,
            lastMessage: chat.lastMessage ? {
                body: chat.lastMessage.body?.substring(0, 50) + '...',
                timestamp: chat.lastMessage.timestamp
            } : null
        }));

        res.json({
            success: true,
            totalChats: chats.length,
            recentChats: chatList
        });
    } catch (error) {
        console.error('❌ Erro ao obter chats:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route POST /check-number
 * @description Verifica se um número está registrado no WhatsApp.
 * @body {string} number - Número de telefone a ser verificado.
 * @returns {Object} Status de registro do número.
 *
 * @example
 * curl -X POST http://localhost:3000/check-number \
 *   -H "Content-Type: application/json" \
 *   -d '{"number": "11999999999"}'
 */
app.post('/check-number', async (req, res) => {
    try {
        const { number } = req.body;

        if (!number) {
            return res.status(400).json({
                success: false,
                error: 'Número é obrigatório'
            });
        }

        if (!clientReady) {
            return res.status(503).json({
                success: false,
                error: 'WhatsApp não está conectado'
            });
        }

        const formattedNumber = formatPhoneNumber(number);
        const isRegistered = await whatsappClient.isRegisteredUser(formattedNumber);
        
        res.json({
            success: true,
            number: number,
            formattedNumber: formattedNumber,
            isRegistered: isRegistered
        });

    } catch (error) {
        console.error('❌ Erro ao verificar número:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route POST /reconnect
 * @description Destroi a sessão atual do WhatsApp e reinicializa o cliente, gerando um novo QR Code para autenticação.
 * @returns {Object} Mensagem de sucesso e timestamp.
 *
 * @example
 * // Requisição usando curl:
 * curl -X POST http://localhost:3000/reconnect
 */
app.post('/reconnect', async (req, res) => {
    try {
        console.log('🔄 Solicitação de reconexão recebida...');
        
        if (clientReady && whatsappClient) {
            console.log('📱 Destruindo cliente atual...');
            await whatsappClient.destroy();
            clientReady = false;
            whatsappClient = null;
        }
        
        console.log('🚀 Reinicializando cliente WhatsApp...');
        
        // Reinicializar o cliente
        setTimeout(() => {
            client.initialize();
        }, 2000);
        
        res.json({
            success: true,
            message: 'Processo de reconexão iniciado. Novo QR Code será gerado em breve.',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Erro ao reconectar:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * @route POST /logout
 * @description Faz logout do WhatsApp, desconectando a sessão atual. Após o logout, use /reconnect para gerar um novo QR Code.
 * @returns {Object} Mensagem de sucesso e timestamp.
 *
 * @example
 * // Requisição usando curl:
 * curl -X POST http://localhost:3000/logout
 */
app.post('/logout', async (req, res) => {
    try {
        console.log('🚪 Solicitação de logout recebida...');
        
        if (clientReady && whatsappClient) {
            console.log('📱 Fazendo logout do WhatsApp...');
            await whatsappClient.logout();
            clientReady = false;
            whatsappClient = null;
        }
        
        res.json({
            success: true,
            message: 'Logout realizado com sucesso. Execute /reconnect para gerar novo QR Code.',
            timestamp: new Date().toISOString()
        });
        
    } catch (error) {
        console.error('❌ Erro ao fazer logout:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Middleware de tratamento de erro
app.use((err, req, res, next) => {
    console.error('❌ Erro não tratado:', err);
    res.status(500).json({
        success: false,
        error: 'Erro interno do servidor'
    });
});

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🌐 Servidor rodando na porta ${PORT}`);
    console.log(`📡 API disponível em: http://localhost:${PORT}`);
    console.log('');
    console.log('� Endpoints disponíveis:');
    console.log(`   GET  /status           - Verificar status da conexão`);
    console.log(`   GET  /client-info      - Informações do cliente WhatsApp`);
    console.log(`   GET  /chats            - Listar chats recentes`);
    console.log(`   POST /send-message     - Enviar mensagem`);
    console.log(`   POST /check-number     - Verificar se número tem WhatsApp`);
    console.log(`   POST /logout           - Desconectar sessão e limpar autenticação`);
    console.log(`   POST /reconnect        - Gerar novo QR Code e reconectar`);
    console.log('');
    console.log('🔧 Para debug do seu número, execute: node debug-number.js');
});

// Graceful shutdown
process.on('SIGINT', async () => {
    console.log('🛑 Encerrando aplicação...');
    if (whatsappClient) {
        await whatsappClient.destroy();
    }
    process.exit(0);
});