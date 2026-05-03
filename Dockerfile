FROM node:20-alpine

WORKDIR /app

# 1. Installation des dépendances
COPY package.json package-lock.json* ./
RUN npm install

# 2. Copie du code et build
COPY . .

# VARIABLES POUR LA PRODUCTION
ENV VITE_API_URL=https://api.fereloo.com
ENV VITE_CLERK_PUBLISHABLE_KEY=pk_test_bXVzaWNhbC1rb2FsYS00MC5jbGVyay5hY2NvdW50cy5kZXYk
ENV NODE_ENV=production
ENV PORT=80
# Forcer le preset Node Server pour TanStack Start / Nitro
ENV NITRO_PRESET=node-server
ENV NITRO_HOST=0.0.0.0
ENV HOST=0.0.0.0

# Build de l'application TanStack Start
RUN npm run build

# Debug : On liste les fichiers générés
RUN ls -R .output/server || ls -R dist/server || echo "Aucun serveur trouvé"

# 3. Exposition du port 80
EXPOSE 80

# 4. Lancement
# On priorise .output/server/index.mjs car c'est le standard Nitro pour node-server
CMD ["sh", "-c", "if [ -f .output/server/index.mjs ]; then node .output/server/index.mjs; elif [ -f dist/server/server.js ]; then node dist/server/server.js; else echo 'ERREUR: Aucun fichier serveur trouvé'; ls -R; exit 1; fi"]
