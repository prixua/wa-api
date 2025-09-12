# WhatsApp API Node.js

API em Node.js para envio de mensagens via WhatsApp usando a biblioteca `whatsapp-web.js`.

## 🚀 Funcionalidades

- ✅ Envio de mensagens via API REST
- ✅ Autenticação automática com QR Code
- ✅ Validação de números do WhatsApp
- ✅ Logs detalhados
- ✅ Tratamento de erros
- ✅ Status da conexão

## 📋 Pré-requisitos

- Node.js 16+ instalado
- WhatsApp instalado no celular
- Conexão com internet

## 🛠️ Instalação

1. Clone ou baixe o projeto
2. Instale as dependências:

```bash
npm install
```

## 🎯 Como usar

### 1. Iniciar a aplicação

```bash
npm start
```

Ou para desenvolvimento com auto-reload:

```bash
npm run dev
```

### 2. Autenticação WhatsApp

Na primeira execução, será exibido um QR Code no terminal. Escaneie com seu WhatsApp:

1. Abra o WhatsApp no seu celular
2. Vá em **Configurações** > **Aparelhos conectados**
3. Toque em **Conectar um aparelho**
4. Escaneie o QR Code exibido no terminal

### 3. Verificar status da conexão

```bash
GET http://localhost:3000/status
```

Resposta:
```json
{
  "status": "connected",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 📡 Endpoints da API

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
curl -X POST http://localhost:3000/send-message \
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
  "timestamp": "2024-01-15T10:30:00.000Z",
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

Por padrão a API roda na porta 3000. Para alterar, defina a variável de ambiente `PORT`:

```bash
PORT=8080 npm start
```

### Sessão WhatsApp

A sessão é salva automaticamente na pasta `.wwebjs_auth/`. Para resetar a conexão, delete esta pasta e execute novamente.

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
    CURLOPT_URL => 'http://localhost:3000/send-message',
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
    'http://localhost:3000/send-message',
    json=data
)

result = response.json()
print('Enviado!' if result['success'] else f"Erro: {result['error']}")
```

### JavaScript/Fetch

```javascript
const sendMessage = async (number, message) => {
    try {
        const response = await fetch('http://localhost:3000/send-message', {
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

## 📞 Suporte

- Verifique se o WhatsApp Web funciona normalmente no navegador
- Certifique-se de que não há outra sessão ativa do WhatsApp Web
- Em caso de erro persistente, delete a pasta `.wwebjs_auth/` e tente novamente

## 📄 Licença

MIT License