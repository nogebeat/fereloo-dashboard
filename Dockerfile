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
# NITRO_HOST est crucial pour que le serveur accepte les connexions externes
ENV NITRO_HOST=0.0.0.0
ENV HOST=0.0.0.0

# Build de l'application TanStack Start
RUN npm run build

# On liste les fichiers pour debug si ça crash encore
RUN ls -R .output/server || ls -R dist/server || echo "Pas de dossier server trouvé"

# 3. Exposition du port 80
EXPOSE 80

# 4. Lancement dynamique du serveur
# On essaie de lancer le serveur Nitro s'il existe, sinon on cherche le serveur Vinxi
CMD ["sh", "-c", "if [ -f .output/server/index.mjs ]; then node .output/server/index.mjs; elif [ -f dist/server/server.js ]; then node dist/server/server.js; else echo 'ERREUR: Aucun serveur trouvé'; ls -R; exit 1; fi"]
