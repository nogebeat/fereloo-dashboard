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

# Build de l'application TanStack Start
RUN npm run build

# 3. Exposition du port 80
EXPOSE 80

# 4. Lancement dynamique du serveur
# TanStack Start peut générer soit .output/server/index.mjs (Nitro)
# soit dist/server/server.js (Vinxi direct)
CMD ["sh", "-c", "if [ -d .output ]; then node .output/server/index.mjs; else node dist/server/server.js; fi"]
