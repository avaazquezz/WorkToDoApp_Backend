# Usar imagen oficial de Node.js como base
FROM node:18

# Establecer directorio de trabajo
WORKDIR /usr/src/app

# Copiar archivos necesarios
COPY package*.json ./
RUN npm install

COPY . .

# Exponer el puerto de la app
EXPOSE 3001

# Comando para ejecutar la app
CMD ["npm", "start"]
