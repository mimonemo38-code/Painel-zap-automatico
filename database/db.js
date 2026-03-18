const path = require('path')
const fs = require('fs')

// Se rodando em serverless (Vercel), sqlite3 pode não estar disponível.
let db = null
let usingSqlite = true

try {
  const sqlite3 = require('sqlite3').verbose()

  // Criar diretório data se não existir
  const dataDir = path.join(__dirname, '../data')
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true })
  }

  const dbPath = path.join(dataDir, 'mrp.db')
  db = new sqlite3.Database(dbPath)

  // Inicializar tabelas
  db.serialize(() => {
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

    db.run(`
      CREATE TABLE IF NOT EXISTS config (
        chave TEXT PRIMARY KEY,
        valor TEXT
      )
    `)

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
} catch (err) {
  usingSqlite = false
  console.warn('SQLite não disponível; usando armazenamento em memória. Erro:', err.message)

  const inMemory = {
    mensagens_log: [],
    contatos: [],
    config: [],
    alertas: []
  }

  db = {
    prepare: (sql) => {
      if (sql.includes('FROM mensagens_log')) {
        return { all: () => inMemory.mensagens_log, run: () => ({ changes: 0 }) }
      }
      if (sql.includes('FROM contatos')) {
        return { all: () => inMemory.contatos, run: () => ({ changes: 0 }) }
      }
      if (sql.includes('FROM config')) {
        return { all: () => inMemory.config, run: () => ({ changes: 0 }) }
      }
      if (sql.includes('FROM alertas')) {
        return { all: () => inMemory.alertas, run: () => ({ changes: 0 }) }
      }
      return { all: () => [], run: () => ({ changes: 0 }) }
    }
  }
}

module.exports = db
