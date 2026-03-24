#!/bin/bash
echo "=== INICIANDO INSTALAÇÃO DO WHATSNEWS NO UBUNTU ==="
sudo apt-get update

echo "[1/4] Instalando Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo "[2/4] Instalando dependências do Chromium para o Puppeteer..."
sudo apt search libnss3
sudo apt-get install -y ca-certificates fonts-liberation libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libc6 libcairo2 libcups2 libdbus-1-3 libexpat1 libfontconfig1 libgbm1 libgcc1 libglib2.0-0 libgtk-3-0 libnspr4 libnss3 libpango-1.0-0 libpangocairo-1.0-0 libstdc++6 libx11-6 libx11-xcb1 libxcb1 libxcomposite1 libxcursor1 libxdamage1 libxext6 libxfixes3 libxi6 libxrandr2 libxrender1 libxss1 libxtst6 lsb-release wget xdg-utils

echo "[3/4] Instalando PM2 (Gerenciador de Processos)..."
sudo npm install pm2 -g

echo "[4/4] Instalando bibliotecas do projeto..."
npm install

echo "=== INSTALAÇÃO CONCLUÍDA! ==="
echo ""
echo "Agora você precisa ciar o seu arquivo .env:"
echo "Digite 'nano .env', cole as referências (GEMINI_API_KEY e WHATSAPP_GROUP_ID), aperte CTRL+O, ENTER, e CTRL+X"
echo ""
echo "Depois disso, inicie o robô digitando:"
echo "pm2 start index.js --name whatsnews"
echo "pm2 logs whatsnews"
