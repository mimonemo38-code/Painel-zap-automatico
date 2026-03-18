const XLSX = require('xlsx')
const fs = require('fs')
const path = require('path')

const PLANILHA_PATH = path.join(__dirname, '../uploads/planilha_atual.xlsx')
const PLANILHA_BACKUP = path.join(__dirname, '../uploads/planilha_backup.xlsx')

let dados = {
  sd4: [],
  solicitar: [],
  ultimoCarregamento: null,
  versao: 0
}

async function carregarPlanilha(filepath) {
  try {
    console.log(`📂 Lendo planilha: ${filepath}`)
    
    if (!fs.existsSync(filepath)) {
      throw new Error('Arquivo não encontrado')
    }

    const wb = XLSX.readFile(filepath, { cellDates: false })
    console.log('📋 Abas encontradas:', wb.SheetNames)

    // Processar aba SD4
    const wsSD4 = wb.Sheets['SD4']
    if (!wsSD4) throw new Error('Aba "SD4" não encontrada na planilha')

    const rawSD4 = XLSX.utils.sheet_to_json(wsSD4, { header: 1, defval: '' })
    console.log('📊 SD4 cabeçalho (linha 1):', rawSD4[0])
    console.log('📊 SD4 primeira linha de dados:', rawSD4[1])
    console.log('📊 SD4 total de linhas:', rawSD4.length)

    // Processar aba Solicitar
    const wsSolic = wb.Sheets['Solicitar']
    if (!wsSolic) throw new Error('Aba "Solicitar" não encontrada na planilha')

    const rawSolic = XLSX.utils.sheet_to_json(wsSolic, { header: 1, defval: '' })
    console.log('📊 Solicitar linha 1 (cabeçalho):', rawSolic[0])
    console.log('📊 Solicitar linha 2 (datas semanas):', rawSolic[1])
    console.log('📊 Solicitar linha 3 (primeiro dado):', rawSolic[2])
    console.log('📊 Solicitar total de linhas:', rawSolic.length)

    // IMPORTANTE: construir novosDados ANTES de atribuir a dados
    const novosDados = {
      sd4: processarSD4(rawSD4),
      solicitar: processarSolicitar(rawSolic),
      ultimoCarregamento: new Date().toISOString(),
      versao: (dados.versao || 0) + 1
    }

    // ✅ ATRIBUIÇÃO ATÔMICA: só acontece se tudo deu certo
    dados = novosDados

    console.log(`✅ Planilha carregada! SD4: ${dados.sd4.length} linhas, Solicitar: ${dados.solicitar.length} linhas`)
    return true
  } catch (e) {
    console.error('❌ Erro ao carregar planilha:', e.message)
    throw e
  }
}

function processarSD4(raw) {
  const linhas = []
  const header = raw[0] || []

  for (let i = 1; i < raw.length; i++) {
    const linha = raw[i]
    if (!linha || !linha[0]) continue // pular linhas vazias

    linhas.push({
      material: linha[0],
      estoque: linha[1],
      numeroPC: linha[2],
      previsaoChegada: linha[3],
      fornecedor: linha[4],
      // ... outros campos conforme sua planilha
    })
  }

  return linhas
}

function processarSolicitar(raw) {
  const linhas = []
  const header = raw[0] || []

  for (let i = 2; i < raw.length; i++) { // começa em 2 porque linha 1 é data
    const linha = raw[i]
    if (!linha || !linha[0]) continue

    linhas.push({
      semana: raw[1] ? raw[1][0] : '',
      material: linha[0],
      qty: linha[1],
      op: linha[2],
      cliente: linha[3],
      // ... outros campos
    })
  }

  return linhas
}

async function carregarPlanilhaTeste(filepath) {
  // Lê sem salvar em memória, apenas valida
  const wb = XLSX.readFile(filepath, { cellDates: false })
  const wsSD4 = wb.Sheets['SD4']
  const rawSD4 = XLSX.utils.sheet_to_json(wsSD4, { header: 1, defval: '' })
  
  return {
    sd4: processarSD4(rawSD4),
    solicitar: processarSolicitar(XLSX.utils.sheet_to_json(wb.Sheets['Solicitar'], { header: 1, defval: '' }))
  }
}

function getDados() {
  return dados
}

function resetarDados() {
  dados = { sd4: [], solicitar: [], ultimoCarregamento: null, versao: 0 }
}

// Log de saúde a cada 5 minutos
setInterval(() => {
  const { sd4, solicitar } = getDados()
  console.log(`💓 Saúde: SD4=${sd4.length} linhas | Solicitar=${solicitar.length} linhas`)
  if (sd4.length === 0 && solicitar.length === 0) {
    console.error('🚨 PLANILHA VAZIA NA MEMÓRIA!')
  }
}, 5 * 60 * 1000)

module.exports = {
  carregarPlanilha,
  carregarPlanilhaTeste,
  getDados,
  resetarDados,
  PLANILHA_PATH,
  PLANILHA_BACKUP
}
