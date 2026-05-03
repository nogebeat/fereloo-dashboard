# Étape 1 : Build
FROM node:20-alpine AS build

WORKDIR /app

# Installation des dépendances
COPY package.json package-lock.json* ./
RUN npm install

# Copie du code source
COPY . .

# VARIABLES HARDCODÉES POUR LA PRODUCTION
ENV VITE_API_URL=https://api.fereloo.com
ENV VITE_CLERK_PUBLISHABLE_KEY=pk_test_bXVzaWNhbC1rb2FsYS00MC5jbGVyay5hY2NvdW50cy5kZXYk

# Lancement du build
RUN npm run build

# CETTE LIGNE VA NOUS DIRE DANS LES LOGS DOKPLOY OÙ SONT LES FICHIERS
RUN find . -name "index.html"

# Étape 2 : Production avec Nginx
FROM nginx:stable-alpine

# Nettoyage
RUN rm -rf /usr/share/nginx/html/*

# Copie flexible (prend ce qui existe)
# On crée les dossiers sources pour éviter les erreurs si certains manquent
RUN mkdir -p /tmp/empty
COPY --from=build /app/.output/public/ /usr/share/nginx/html/ || true
COPY --from=build /app/dist/client/ /usr/share/nginx/html/ || true
COPY --from=build /app/dist/ /usr/share/nginx/html/ || true

# Sécurité : si le dossier est toujours vide, Nginx donnera un 403.
# On vérifie s'il y a un index.html, sinon on crée un fichier de test explicite
RUN if [ ! -f /usr/share/nginx/html/index.html ]; then \
    echo "L'application n'a pas été copiée au bon endroit. Vérifiez les logs de build pour trouver le chemin de index.html" > /usr/share/nginx/html/index.html; \
    fi

# Config Nginx pour SPA
RUN printf "server { \n\
    listen 80; \n\
    location / { \n\
        root /usr/share/nginx/html; \n\
        index index.html index.htm; \n\
        try_files \$uri \$uri/ /index.html; \n\
    } \n\
}" > /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
