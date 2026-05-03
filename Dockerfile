# Utilisation de Node 22 comme requis par TanStack Start
FROM node:22-alpine

WORKDIR /app

# 1. Installation des dépendances (on a besoin des devDeps pour 'vite preview')
COPY package.json package-lock.json* ./
RUN npm install

# 2. Copie du code et build
COPY . .

# VARIABLES POUR LA PRODUCTION
ENV VITE_API_URL=https://api.fereloo.com
ENV VITE_CLERK_PUBLISHABLE_KEY=pk_test_bXVzaWNhbC1rb2FsYS00MC5jbGVyay5hY2NvdW50cy5kZXYk
ENV NODE_ENV=production

# Build de l'application
RUN npm run build

# 3. Exposition du port 80
EXPOSE 80

# 4. Lancement via 'vite preview' qui est le seul mode qui a fonctionné au test local
# On force le port 80 et l'écoute sur toutes les interfaces
CMD ["npm", "run", "preview", "--", "--port", "80", "--host", "0.0.0.0"]
