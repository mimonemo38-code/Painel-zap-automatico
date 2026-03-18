require('dotenv').config()
const express = require('express')
const cors = require('cors')
const path = require('path')
const fs = require('fs')
const planilhaService = require('./services/planilhaService')
const apiRoutes = require('./routes/api')

const app = express()
const PORT = process.env.PORT || 3000

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.static(__dirname))

// Criar diretórios necessários
const dirs = ['uploads', 'data', 'logs']
dirs.forEach(dir => {
  const dirPath = path.join(__dirname, dir)
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true })
  }
})

// Rotas
app.use('/api', apiRoutes)

// Servir HTML principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'zapauto.html'))
})

// Ao iniciar o servidor, SEMPRE tentar carregar planilha
const PLANILHA_PATH = planilhaService.PLANILHA_PATH
if (fs.existsSync(PLANILHA_PATH)) {
  planilhaService.carregarPlanilha(PLANILHA_PATH)
    .then(() => console.log('✅ Planilha restaurada ao iniciar'))
    .catch(e => console.warn('⚠ Erro ao restaurar planilha:', e.message))
} else {
  console.log('💡 Nenhuma planilha encontrada. Envie uma via dashboard.')
}

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`🚀 MRP Bot rodando em http://localhost:${PORT}`)
  console.log(`📊 Ambiente: ${process.env.NODE_ENV || 'development'}`)
})
