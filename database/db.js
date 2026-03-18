const sqlite3 = require('sqlite3').verbose()
const path = require('path')
const fs = require('fs')

// Criar diretório data se não existir
const dataDir = path.join(__dirname, '../data')
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

const dbPath = path.join(dataDir, 'mrp.db')
const db = new sqlite3.Database(dbPath)

// Inicializar tabelas
db.serialize(() => {
  // Tabela de mensagens log
  db.run(`
    CREATE TABLE IF NOT EXISTS mensagens_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero TEXT NOT NULL,
      nome TEXT,
      mensagem_recebida TEXT,
      tipo_consulta TEXT,
      resposta_enviada TEXT,
      tempo_ms INTEGER,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Tabela de contatos
  db.run(`
    CREATE TABLE IF NOT EXISTS contatos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero TEXT UNIQUE NOT NULL,
      nome TEXT,
      perfil TEXT,
      permissoes TEXT,
      alertas_ativo BOOLEAN DEFAULT 1,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)

  // Tabela de config
  db.run(`
    CREATE TABLE IF NOT EXISTS config (
      chave TEXT PRIMARY KEY,
      valor TEXT
    )
  `)

  // Tabela de alertas
  db.run(`
    CREATE TABLE IF NOT EXISTS alertas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero TEXT,
      material TEXT,
      tipo TEXT,
      ativo BOOLEAN DEFAULT 1,
      criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
})

module.exports = db
