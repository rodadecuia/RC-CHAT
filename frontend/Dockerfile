# Estágio 1: Instalar dependências
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm install

# Estágio 2: Ambiente de desenvolvimento
FROM node:20-alpine
WORKDIR /app
# Copia as dependências instaladas do estágio anterior
COPY --from=deps /app/node_modules ./node_modules
# Copia o resto do código da aplicação
COPY . .

# Expõe a porta do Vite e inicia o servidor de desenvolvimento
EXPOSE 5173
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
