#!/bin/bash
# ============================================
# NEXUS-AGENT - Script de instalación
# ============================================

echo "🚀 Instalando NEXUS-AGENT..."

# Instalar Node.js si no está
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# Instalar pnpm si no está
if ! command -v pnpm &> /dev/null; then
    npm install -g pnpm
fi

# Instalar dependencias
echo "📦 Instalando dependencias..."
pnpm install

# Configurar .env si no existe
if [ ! -f .env ]; then
    cp .env.example .env
    echo ""
    echo "⚠️  IMPORTANTE: Edita el archivo .env con tu HF_API_KEY"
    echo "   nano .env"
    echo ""
fi

echo "✅ Instalación completa!"
echo ""
echo "Próximos pasos:"
echo "1. Edita .env y agrega tu HF_API_KEY"
echo "2. Ejecuta: pnpm dev"
echo "3. Abre: http://localhost:3000"
