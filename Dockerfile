# Verwende ein offizielles Node.js-Image als Basis
FROM node:20-alpine AS builder

# Setze das Arbeitsverzeichnis im Container
WORKDIR /app

# Kopiere die package.json und package-lock.json (oder yarn.lock)
COPY package*.json ./

# Installiere die Node.js-Abhängigkeiten
RUN npm install

# Kopiere den gesamten Quellcode
COPY . .

# Baue die TypeScript-Anwendung
RUN npm run tsc

# Stage für die finale Image (kleineres Image)
FROM node:20-alpine

WORKDIR /app

# Kopiere nur die notwendigen Dateien aus dem Builder-Image
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules/socket.io ./node_modules/socket.io
COPY --from=builder /app/package*.json ./

# Setze die Umgebungsvariable für die Node.js-Umgebung (optional, aber oft gut)
ENV NODE_ENV production

# Expose den Port, auf dem dein Server läuft
EXPOSE 3000

# Starte die Anwendung
CMD ["node", "dist/server.js"]