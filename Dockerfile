# Étape 1 : Build
FROM node:20-alpine AS build

WORKDIR /app

# Installation des dépendances
COPY package.json package-lock.json* ./
RUN npm install

# Copie du code source
COPY . .

# Variables au moment du build
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
ARG VITE_CLERK_PUBLISHABLE_KEY
ENV VITE_CLERK_PUBLISHABLE_KEY=$VITE_CLERK_PUBLISHABLE_KEY

# Build de l'application TanStack Start
RUN npm run build

# Étape 2 : Runtime Node.js
FROM node:20-alpine

WORKDIR /app

# On récupère uniquement ce qui est nécessaire pour le runtime (.output contient le serveur Nitro)
COPY --from=build /app/.output ./.output
COPY --from=build /app/package.json ./package.json

# Configuration du serveur
ENV NODE_ENV=production
ENV PORT=80
EXPOSE 80

# Commande pour lancer le serveur généré par TanStack Start / Nitro
CMD ["node", ".output/server/index.mjs"]
