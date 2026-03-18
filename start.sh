#!/bin/bash

# MRP Bot — Start Script

echo "🚀 Iniciando MRP Bot..."
echo ""

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado"
    exit 1
fi

# Instalar dependencies se package-lock.json não existe
if [ ! -d "node_modules" ]; then
    echo "📦 Instalando dependências..."
    npm install
    echo ""
fi

# Criar diretórios necessários
mkdir -p data uploads logs

# Verificar .env
if [ ! -f ".env" ]; then
    echo "⚠️  .env não encontrado. Usando valores padrão."
fi

# Iniciar servidor
echo "✅ Servidor iniciando..."
echo "📍 Acesse: http://localhost:3000"
echo ""
npm start
