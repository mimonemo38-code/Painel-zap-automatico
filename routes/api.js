const express = require('express')
const router = express.Router()
const fs = require('fs')
const path = require('path')
const multer = require('multer')
const db = require('../database/db')
const planilhaService = require('../services/planilhaService')

// Configurar upload
const uploadDir = path.join(__dirname, '../uploads')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const upload = multer({ dest: uploadDir })

// ============ STATUS ============

// BUG 1 FIX: Endpoint corrigido para interpretar corretamente a Evolution API
router.get('/whatsapp/status', async (req, res) => {
  try {
    const r = await fetch(
      `${process.env.EVOLUTION_BASE}/instance/connectionState/${process.env.EVOLUTION_INSTANCE}`,
      { headers: { 'apikey': process.env.EVOLUTION_KEY } }
    )
    const data = await r.json()
    console.log('Evolution status raw:', JSON.stringify(data))

    // Evolution API retorna: { instance: { instanceName, state } }
    // state pode ser: "open" = conectado, "close" = desconectado, "connecting"
    const state = data?.instance?.state || data?.state || data?.status || ''
    const connected = state === 'open' || state === 'connected'

    res.json({
      ok: true,
      data: {
        connected,
        state,
        raw: data  // mandar o raw para debug
      }
    })
  } catch (err) {
    res.json({ ok: false, data: { connected: false, state: 'error', error: err.message } })
  }
})

// ============ TESTE DE MENSAGEM ============

// FUNCIONALIDADE NOVA 1: Enviar mensagem de teste
router.post('/whatsapp/enviar-teste', async (req, res) => {
  const { numero, texto } = req.body
  if (!numero || !texto) {
    return res.json({ ok: false, error: 'numero e texto obrigatórios' })
  }

  try {
    const r = await fetch(
      `${process.env.EVOLUTION_BASE}/message/sendText/${process.env.EVOLUTION_INSTANCE}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': process.env.EVOLUTION_KEY
        },
        body: JSON.stringify({ number: numero, text: texto })
      }
    )
    const data = await r.json()
    console.log('Teste envio:', JSON.stringify(data))

    if (data.key || data.id || data.messageId) {
      res.json({ ok: true, data: { messageId: data.key?.id || data.id, status: 'enviado' } })
    } else {
      res.json({ ok: false, error: JSON.stringify(data) })
    }
  } catch (err) {
    res.json({ ok: false, error: err.message })
  }
})

// ============ PLANILHA ============

// BUG 2 FIX: Upload com validação antes de substituir
router.post('/planilha/upload', upload.single('planilha'), async (req, res) => {
  const DEST = planilhaService.PLANILHA_PATH
  const BACKUP = planilhaService.PLANILHA_BACKUP

  try {
    if (!req.file) {
      return res.json({ ok: false, error: 'Nenhum arquivo enviado' })
    }

    const tempPath = req.file.path

    // 1. Tentar ler e processar o novo arquivo ANTES de substituir o atual
    console.log('📂 Validando planilha nova...')
    const novosDados = await planilhaService.carregarPlanilhaTeste(tempPath)
    console.log('✅ Planilha validada com sucesso')

    // 2. Só se leu com sucesso: fazer backup do atual e substituir
    if (fs.existsSync(DEST)) {
      fs.copyFileSync(DEST, BACKUP)  // backup do anterior
      console.log('💾 Backup criado')
    }
    fs.renameSync(tempPath, DEST)  // mover novo para definitivo
    console.log('📁 Arquivo movido para local definitivo')

    // 3. Agora sim carregar em memória
    await planilhaService.carregarPlanilha(DEST)

    res.json({
      ok: true,
      data: {
        sd4: novosDados.sd4.length,
        solicitar: novosDados.solicitar.length,
        mensagem: 'Planilha carregada com sucesso'
      }
    })
  } catch (err) {
    console.error('❌ Erro upload planilha:', err.message)
    // Se deu erro: manter planilha anterior intacta
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
    res.json({ ok: false, error: `Erro ao processar planilha: ${err.message}` })
  }
})

// Status da planilha
router.get('/spreadsheet/status', (req, res) => {
  const dados = planilhaService.getDados()
  res.json({
    ok: true,
    data: {
      sd4: dados.sd4.length,
      solicitar: dados.solicitar.length,
      ultimoCarregamento: dados.ultimoCarregamento,
      versao: dados.versao
    }
  })
})

// Recarregar planilha
router.post('/planilha/recarregar', async (req, res) => {
  try {
    await planilhaService.carregarPlanilha(planilhaService.PLANILHA_PATH)
    const dados = planilhaService.getDados()
    res.json({
      ok: true,
      data: {
        sd4: dados.sd4.length,
        solicitar: dados.solicitar.length
      }
    })
  } catch (err) {
    res.json({ ok: false, error: err.message })
  }
})

// ============ LOG DE MENSAGENS EM TEMPO REAL ============

// FUNCIONALIDADE NOVA 2: Retorna apenas logs mais novos que o ID informado (para polling incremental)
router.get('/logs/live', (req, res) => {
  const after = parseInt(req.query.after || '0')
  try {
    const logs = db.prepare(
      'SELECT * FROM mensagens_log WHERE id > ? ORDER BY id ASC LIMIT 50'
    ).all(after)
    res.json({ ok: true, data: logs })
  } catch (err) {
    res.json({ ok: false, error: err.message })
  }
})

// Simular mensagem no log (para teste)
router.post('/logs/simular', (req, res) => {
  const { numero, mensagem, tipo, resposta } = req.body
  try {
    db.prepare(`
      INSERT INTO mensagens_log (numero, mensagem_recebida, tipo_consulta, resposta_enviada, tempo_ms)
      VALUES (?, ?, ?, ?, ?)
    `).run(numero || '5511999999999', mensagem || 'Teste', tipo || 'MATERIAL', resposta || 'OK', Math.random() * 500)
    res.json({ ok: true })
  } catch (err) {
    res.json({ ok: false, error: err.message })
  }
})

// ============ OUTROS ENDPOINTS ============

router.get('/ping', (req, res) => {
  res.json({ ok: true, pong: true })
})

router.get('/api/status', async (req, res) => {
  try {
    const waStatus = await fetch(
      `${process.env.EVOLUTION_BASE}/instance/connectionState/${process.env.EVOLUTION_INSTANCE}`,
      { headers: { 'apikey': process.env.EVOLUTION_KEY } }
    ).then(r => r.json())

    const planilhaData = planilhaService.getDados()

    res.json({
      ok: true,
      data: {
        whatsapp: {
          connected: waStatus?.instance?.state === 'open' || waStatus?.state === 'open',
          state: waStatus?.instance?.state || waStatus?.state || 'unknown'
        },
        planilha: {
          carregada: planilhaData.sd4.length > 0,
          sd4: planilhaData.sd4.length,
          solicitar: planilhaData.solicitar.length
        }
      }
    })
  } catch (err) {
    res.json({ ok: false, error: err.message })
  }
})

module.exports = router
