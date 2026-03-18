require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const planilhaService = require('../services/planilhaService')
const apiRoutes = require('../routes/api')

const app = express()

// Middleware
app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb', extended: true }))

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, '..')))

// Criar diretórios necessários se estiver localmente
const dirs = ['uploads', 'data', 'logs']
if (process.env.NODE_ENV !== 'production') {
  dirs.forEach(dir => {
    const dirPath = path.join(__dirname, '..', dir)
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true })
    }
  })
}

// Rotas
app.use('/api', apiRoutes)

// Servir HTML principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'zapauto.html'))
})

// Tentarodalir planilha ao iniciar (apenas em desenvolvimento)
if (process.env.NODE_ENV !== 'production') {
  const PLANILHA_PATH = planilhaService.PLANILHA_PATH
  if (fs.existsSync(PLANILHA_PATH)) {
    planilhaService.carregarPlanilha(PLANILHA_PATH)
      .then(() => console.log('✅ Planilha restaurada ao iniciar'))
      .catch(e => console.warn('⚠ Erro ao restaurar planilha:', e.message))
  }
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

module.exports = app
