# Define a imagem base
FROM node:20-alpine

# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de dependência
COPY package.json package-lock.json* ./

# Define o ambiente para desenvolvimento para garantir que as devDependencies sejam instaladas
ENV NODE_ENV=development

# Instala todas as dependências (incluindo devDependencies)
RUN npm install

# Copia o resto do código da aplicação
COPY . .

# Expõe a porta que o Express vai usar
EXPOSE 3000

# Comando para iniciar a aplicação em modo de desenvolvimento
CMD [ "npm", "run", "dev" ]
