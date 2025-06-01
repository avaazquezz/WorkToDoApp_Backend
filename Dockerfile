# Usar una imagen oficial de Node.js como base
FROM node:18

# Establecer el directorio de trabajo dentro del contenedor
WORKDIR /usr/src/app

# Copiar los archivos de la aplicación
COPY package*.json ./
COPY . .

# Copiar el archivo .env al contenedor
COPY .env .env

# Instalar las dependencias
RUN npm install

# Exponer el puerto en el que corre la aplicación
EXPOSE 3000

# Comando para iniciar la aplicación
CMD ["node", "index.js"]
