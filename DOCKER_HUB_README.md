# WhatsApp API Docker Image

![Docker Image Size](https://img.shields.io/docker/image-size/prixua/whatsapp-api/latest)
![Docker Pulls](https://img.shields.io/docker/pulls/prixua/whatsapp-api)

Uma API REST simples e eficiente para envio de mensagens via WhatsApp Web usando Node.js e whatsapp-web.js.

## 🚀 Quick Start

```bash
# Executar a API
docker run -d -p 3500:3500 --name whatsapp-api prixua/whatsapp-api:latest

# Com persistência de sessão
docker run -d -p 3500:3500 \
  -v $(pwd)/.wwebjs_auth:/app/.wwebjs_auth \
  --name whatsapp-api \
  prixua/whatsapp-api:latest
```

## 📱 Como Conectar

1. Execute o container
2. Visualize os logs para obter o QR Code:
   ```bash
   docker logs whatsapp-api
   ```
3. Escaneie o QR Code com seu WhatsApp
4. Aguarde a conexão ser estabelecida

## 🔗 Endpoints Disponíveis

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| GET | `/status` | Status da conexão |
| GET | `/client-info` | Informações do cliente |
| GET | `/chats` | Listar chats recentes |
| POST | `/send-message` | Enviar mensagem |
| POST | `/check-number` | Verificar se número tem WhatsApp |
| POST | `/logout` | Desconectar sessão |
| POST | `/reconnect` | Gerar novo QR Code |

## 📋 Exemplo de Uso

### Verificar Status
```bash
curl http://localhost:3500/status
```

### Enviar Mensagem
```bash
curl -X POST http://localhost:3500/send-message \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999",
    "message": "Olá! Esta é uma mensagem de teste."
  }'
```

### Verificar Número
```bash
curl -X POST http://localhost:3500/check-number \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999"
  }'
```

## ⚙️ Configuração Avançada

### Docker Compose

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

### Variáveis de Ambiente

| Variável | Valor Padrão | Descrição |
|----------|--------------|-----------|
| `PORT` | `3500` | Porta da API |
| `NODE_ENV` | `production` | Ambiente Node.js |
| `PUPPETEER_EXECUTABLE_PATH` | `/usr/bin/chromium` | Caminho do browser |

### Limites de Recursos

```bash
# Para ambientes com recursos limitados
docker run -d -p 3500:3500 \
  --memory=1g \
  --cpus=1 \
  --name whatsapp-api \
  prixua/whatsapp-api:latest
```

## 🔧 Troubleshooting

### Container não inicia
- Verifique os logs: `docker logs whatsapp-api`
- Certifique-se que a porta 3500 não está em uso

### QR Code não aparece
- Aguarde alguns segundos após o start
- Verifique se há mensagens de erro nos logs

### Sessão não persiste
- Monte o volume `.wwebjs_auth` corretamente
- Verifique permissões do diretório

### Performance ruim
- Configure limites de CPU/memória
- Use um SSD para melhor I/O
- Monitore com `docker stats`

## 📊 Especificações

- **Base**: Node.js 18 slim
- **Browser**: Chromium
- **Tamanho**: ~2GB
- **Arquitetura**: linux/amd64
- **Health Check**: Incluído
- **Usuário**: nodejs (não-root)

## 🔒 Segurança

- Executa como usuário não-root
- Dependências mínimas necessárias
- Health check para monitoramento
- Configurações de sandbox do Chromium

## 📚 Mais Informações

- **Repositório GitHub**: [prixua/wa-api](https://github.com/prixua/wa-api)
- **Docker Hub**: [prixua/whatsapp-api](https://hub.docker.com/r/prixua/whatsapp-api)
- **Baseado em**: [whatsapp-web.js](https://github.com/pedroslopez/whatsapp-web.js)

## 📄 Licença

MIT License - Veja o repositório GitHub para mais detalhes.

---

⭐ Se esta imagem foi útil, dê uma estrela no repositório!