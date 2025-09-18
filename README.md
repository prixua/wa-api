# WhatsApp API Node.js

![Docker Pulls](https://img.shields.io/docker/pulls/prixua/whatsapp-api)
![Docker Image Size](https://img.shields.io/docker/image-size/prixua/whatsapp-api/latest)
![GitHub](https://img.shields.io/github/license/prixua/wa-api)

API REST em Node.js para envio de mensagens via WhatsApp usando a biblioteca `whatsapp-web.js`.

## 🚀 Funcionalidades

- ✅ Envio de mensagens via API REST
- ✅ Autenticação automática com QR Code
- ✅ Validação de números do WhatsApp
- ✅ Verificação de status de entrega
- ✅ Listagem de chats recentes
- ✅ Informações do cliente conectado
- ✅ Logs detalhados com emoji
- ✅ Health check integrado
- ✅ Container Docker otimizado
- ✅ Tratamento de erros robusto

## 🐳 Quick Start com Docker (Recomendado)

### Versão Oficial do Docker Hub

A maneira mais rápida de usar a API é através da imagem oficial no Docker Hub:

```bash
# Baixar e executar a versão oficial
docker run -d -p 3500:3500 --name whatsapp-api prixua/whatsapp-api:latest

# Com persistência de sessão (recomendado)
docker run -d -p 3500:3500 \
  -v $(pwd)/.wwebjs_auth:/app/.wwebjs_auth \
  --name whatsapp-api \
  prixua/whatsapp-api:latest
```

**Verificar logs e QR Code:**
```bash
docker logs whatsapp-api
```

**Verificar status:**
```bash
curl http://localhost:3500/status
```

### Especificações da Imagem Docker

- **🏷️ Imagem**: `prixua/whatsapp-api:latest`
- **📦 Tamanho**: ~2GB
- **🔧 Base**: Node.js 18 slim + Chromium
- **🚀 Porta**: 3500
- **🔒 Usuário**: nodejs (não-root)
- **❤️ Health Check**: Incluído

## 📋 Pré-requisitos

### Para Docker:
- Docker instalado
- Porta 3500 disponível

### Para execução local:
- Node.js 18+ instalado
- WhatsApp instalado no celular
- Conexão com internet

## 🛠️ Instalação Local (Desenvolvimento)

1. Clone o repositório:
```bash
git clone https://github.com/prixua/wa-api.git
cd wa-api
```

2. Instale as dependências:
```bash
npm install
```

3. Execute:
```bash
npm start
```

## 🎯 Como usar

### 1. Autenticação WhatsApp

Após iniciar a aplicação (Docker ou local), será exibido um QR Code nos logs:

```bash
# Para Docker
docker logs whatsapp-api

# Para execução local  
npm start
```

**Passos para conectar:**
1. Abra o WhatsApp no seu celular
2. Vá em **Configurações** > **Aparelhos conectados**
3. Toque em **Conectar um aparelho**
4. Escaneie o QR Code exibido nos logs

### 2. Verificar status da conexão

```bash
GET http://localhost:3500/status
```

**Resposta:**
```json
{
  "status": "connected",
  "timestamp": "2025-09-15T14:03:14.732Z"
}
```

## 📡 Endpoints da API

### 📋 Resumo dos Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/status` | Verificar status da conexão |
| GET | `/client-info` | Informações do cliente WhatsApp |
| GET | `/chats` | Listar chats recentes |
| POST | `/send-message` | Enviar mensagem |
| POST | `/check-number` | Verificar se número tem WhatsApp |
| POST | `/logout` | Desconectar sessão |
| POST | `/reconnect` | Gerar novo QR Code |
| GET | `/k8s/helloworld` | Endpoint de teste, retorna "Hello World" |

### Enviar Mensagem

**POST** `/send-message`

**Body (JSON):**
```json
{
  "number": "5511999999999",
  "message": "Sua mensagem aqui"
}
```

**Exemplo de uso:**

```bash
curl -X POST http://localhost:3500/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999",
    "message": "Olá! Esta é uma mensagem de teste."
  }'
```

**Resposta de sucesso:**
```json
{
  "success": true,
  "messageId": "3EB0B431C8B31F7C95E8",
  "timestamp": "2025-09-15T14:03:14.732Z",
  "to": "5511999999999",
  "message": "Olá! Esta é uma mensagem de teste."
}
```

**Resposta de erro:**
```json
{
  "success": false,
  "error": "Número não está registrado no WhatsApp"
}
```

### Verificar Status

**GET** `/status`

Retorna o status da conexão com WhatsApp.

### Informações do Cliente

**GET** `/client-info`

Retorna informações do WhatsApp conectado.

## 📱 Formato de Números

A API aceita números nos seguintes formatos:

- `11999999999` (será adicionado código do país 55)
- `5511999999999` (formato completo)
- `+5511999999999` (com símbolo +)
- `(11) 99999-9999` (com formatação, será limpo automaticamente)

## 🔧 Configurações

### Porta do servidor

Por padrão a API roda na porta 3500. Para alterar, defina a variável de ambiente `PORT`:

```bash
# Para Docker
docker run -d -p 8080:8080 -e PORT=8080 --name whatsapp-api prixua/whatsapp-api:latest

# Para execução local
PORT=8080 npm start
```

### Sessão WhatsApp

A sessão é salva automaticamente na pasta `.wwebjs_auth/`. Para resetar a conexão, delete esta pasta e execute novamente.

## 🐳 Docker Compose (Produção)

Para ambiente de produção, use Docker Compose:

```yaml
version: '3.8'
services:
  whatsapp-api:
    image: prixua/whatsapp-api:latest
    container_name: whatsapp-api
    ports:
      - "3500:3500"
    volumes:
      - ./data/.wwebjs_auth:/app/.wwebjs_auth
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:3500/status"]
      interval: 30s
      timeout: 3s
      retries: 3
      start_period: 5s
```

**Executar:**
```bash
docker-compose up -d
```

## 🔧 Gerenciamento de Containers

```bash
# Verificar status
docker ps | grep whatsapp-api

# Ver logs em tempo real
docker logs -f whatsapp-api

# Parar container
docker stop whatsapp-api

# Reiniciar container
docker restart whatsapp-api

# Remover container
docker rm whatsapp-api

# Atualizar para versão mais recente
docker pull prixua/whatsapp-api:latest
docker stop whatsapp-api
docker rm whatsapp-api
docker run -d -p 3500:3500 --name whatsapp-api prixua/whatsapp-api:latest
```

## ❌ Possíveis Erros

| Erro | Descrição | Solução |
|------|-----------|---------|
| `WhatsApp não está conectado` | Cliente não autenticado | Escaneie o QR Code novamente |
| `Número não está registrado no WhatsApp` | Número inválido | Verifique se o número tem WhatsApp |
| `Número e mensagem são obrigatórios` | Campos obrigatórios não enviados | Inclua `number` e `message` no JSON |

## 🏗️ Estrutura do Projeto

```
poc-wa/
├── index.js          # Arquivo principal da aplicação
├── package.json      # Dependências e scripts
├── .gitignore        # Arquivos ignorados pelo Git
├── README.md         # Este arquivo
└── .wwebjs_auth/     # Sessão do WhatsApp (criado automaticamente)
```

## 🔒 Segurança

- A API não possui autenticação implementada
- Para produção, adicione autenticação (JWT, API Key, etc.)
- Configure CORS adequadamente para seu domínio
- Use HTTPS em produção

## 📝 Exemplo de Integração

### PHP

```php
<?php
$data = [
    'number' => '5511999999999',
    'message' => 'Mensagem do PHP'
];

$curl = curl_init();
curl_setopt_array($curl, [
    CURLOPT_URL => 'http://localhost:3500/send-message',
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($data),
    CURLOPT_HTTPHEADER => ['Content-Type: application/json']
]);

$response = curl_exec($curl);
curl_close($curl);

$result = json_decode($response, true);
echo $result['success'] ? 'Enviado!' : 'Erro: ' . $result['error'];
?>
```

### Python

```python
import requests

data = {
    'number': '5511999999999',
    'message': 'Mensagem do Python'
}

response = requests.post(
    'http://localhost:3500/send-message',
    json=data
)

result = response.json()
print('Enviado!' if result['success'] else f"Erro: {result['error']}")
```

### JavaScript/Fetch

```javascript
const sendMessage = async (number, message) => {
    try {
        const response = await fetch('http://localhost:3500/send-message', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ number, message })
        });
        
        const result = await response.json();
        
        if (result.success) {
            console.log('Mensagem enviada:', result.messageId);
        } else {
            console.error('Erro:', result.error);
        }
    } catch (error) {
        console.error('Erro na requisição:', error);
    }
};

// Usar a função
sendMessage('5511999999999', 'Olá do JavaScript!');
```

## 🐛 Debug

Para debug adicional, ative os logs do puppeteer:

```javascript
// No index.js, adicione na configuração do client:
puppeteer: {
    headless: false, // Mostra o navegador
    devtools: true   // Abre DevTools
}
```

## 📞 Suporte e Troubleshooting

### Problemas Comuns

| Problema | Solução |
|----------|---------|
| Container não inicia | Verifique se a porta 3500 está livre |
| QR Code não aparece | Aguarde alguns segundos e verifique os logs |
| Sessão não persiste | Monte o volume `.wwebjs_auth` corretamente |
| Performance ruim | Configure limites de CPU/memória |

### Debug

- Verifique se o WhatsApp Web funciona normalmente no navegador
- Certifique-se de que não há outra sessão ativa do WhatsApp Web
- Em caso de erro persistente, delete a pasta `.wwebjs_auth/` e tente novamente

### Comandos Úteis

```bash
# Ver logs detalhados
docker logs --details whatsapp-api

# Verificar health check
docker inspect whatsapp-api --format='{{.State.Health.Status}}'

# Monitorar recursos
docker stats whatsapp-api

# Entrar no container
docker exec -it whatsapp-api /bin/bash
```

## 🔗 Links Úteis

- **🐳 Docker Hub**: [prixua/whatsapp-api](https://hub.docker.com/r/prixua/whatsapp-api)
- **📚 Documentação whatsapp-web.js**: [Guide](https://wwebjs.dev/)
- **🐛 Issues**: [GitHub Issues](https://github.com/prixua/wa-api/issues)
- **📖 WhatsApp Business API**: [Oficial](https://developers.facebook.com/docs/whatsapp)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## ⭐ Se este projeto foi útil, dê uma estrela!

[![GitHub stars](https://img.shields.io/github/stars/prixua/wa-api.svg?style=social&label=Star)](https://github.com/prixua/wa-api)

## 📄 Licença

MIT License