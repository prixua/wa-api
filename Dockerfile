# Dockerfile otimizado para WhatsApp API
FROM node:18-slim

# Instalar dependências essenciais para Puppeteer
RUN apt-get update && apt-get install -y \
    wget \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libdrm2 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libxcomposite1 \
    libxdamage1 \
    libxrandr2 \
    xdg-utils \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Instalar Chromium (mais leve que Chrome)
RUN apt-get update && apt-get install -y \
    chromium \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Definir diretório de trabalho
WORKDIR /app

# Criar diretórios necessários
RUN mkdir -p /tmp/chrome-user-data

# Copiar arquivos de dependência primeiro (para cache Docker)
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production --no-audit --no-fund \
    && npm cache clean --force

# Copiar código da aplicação
COPY . .

# Definir variáveis de ambiente para o Puppeteer
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium
ENV NODE_ENV=production
ENV PORT=3500

# Criar usuário não-root para segurança
RUN groupadd -r nodejs && useradd -r -g nodejs nodejs \
    && chown -R nodejs:nodejs /app /tmp/chrome-user-data

# Mudar para usuário não-root
USER nodejs

# Expor a porta
EXPOSE 3500

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3500/status || exit 1

# Comando para iniciar a aplicação
CMD ["npm", "start"]