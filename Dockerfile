# Etapa 1: build da aplicação
FROM node:20 as build
WORKDIR /app

# Copia package.json e package-lock.json
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia todo o código da app
COPY . .

# Gera build para produção
RUN npm run build

# Etapa 2: servidor para produção
FROM nginx:alpine
# Remove configuração default do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia build da etapa anterior para o Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Expõe porta 80
EXPOSE 80

# Comando para rodar o Nginx em foreground
CMD ["nginx", "-g", "daemon off;"]
