# MRP Bot — Dashboard WhatsApp

## 📋 Correções e Melhorias Implementadas

### ✅ BUG 1 — API DIZENDO DESCONECTADA
**Corrigido:**
- Endpoint `GET /api/whatsapp/status` agora interpreta corretamente a resposta da Evolution API
- Backend (`routes/api.js`): Verifica `data?.instance?.state` e aceita valores `"open"` ou `"connected"`
- Frontend (`zapauto.html`): Função `pollStatus()` agora aceita tanto `r?.data?.connected` quanto `r?.data?.state === 'open'`

### ✅ BUG 2 — PLANILHA CARREGADA MAS NÃO FUNCIONA
**Corrigido:**
- `planilhaService.js`: Dados só são atribuídos após leitura com sucesso (atribuição atômica)
- Log de saúde a cada 5 minutos: mostra número de linhas em memória
- `POST /api/planilha/upload`: Valida nova planilha ANTES de substituir a atual, com backup automático
- Ao iniciar servidor: tenta restaurar planilha anterior se existir

### 🆕 FUNCIONALIDADE NOVA 1 — ENVIAR MENSAGEM DE TESTE
**Adicionado:**
- Seção "Teste de Mensagem" na tela de Configurações
- Campo para número com DDI (ex: 5511999999999)
- Campo para mensagem de teste
- Botão "Enviar" que chama `POST /api/whatsapp/enviar-teste`
- Botão "Preencher com teste padrão" com mensagem modelo
- Resultado formatado com ✅ sucesso ou ❌ erro
- Endpoint backend: `POST /api/whatsapp/enviar-teste`

### 🆕 FUNCIONALIDADE NOVA 2 — LOG DE MENSAGENS EM TEMPO REAL
**Adicionado:**
- Seção "Log de Mensagens em Tempo Real" na tela de Configurações
- Console verde (#00c97a) mostrando logs ao vivo
- Botões: "Iniciar" / "Parar" / "Limpar"
- Polling a cada 2 segundos buscando novos logs
- Exibe: hora, número, nome, mensagem recebida, tipo de consulta, tempo ms, resposta enviada
- Endpoint backend: `GET /api/logs/live?after=<id>` para polling incremental
- Auto-scroll para o final dos logs

## 📁 Estrutura de Arquivos

```
.
├── zapauto.html                 # Frontend (interface + JS)
├── server.js                    # Servidor Express principal
├── package.json                 # Dependências Node.js
├── .env                         # Variáveis de ambiente
├── routes/
│   └── api.js                   # Todas as rotas da API
├── services/
│   └── planilhaService.js       # Lógica de carregamento de planilhas
├── database/
│   └── db.js                    # Inicialização SQLite3
├── uploads/                     # Planilhas enviadas
├── data/                        # Banco de dados SQLite
└── logs/                        # Arquivos de log
```

## 🚀 Como Usar

### 1. Instalar Dependências
```bash
npm install
```

### 2. Configurar Variáveis de Ambiente
Editar `.env`:
```
PORT=3000
EVOLUTION_BASE=http://localhost:8080
EVOLUTION_INSTANCE=MRP_BOT
EVOLUTION_KEY=sua-api-key-aqui
```

### 3. Iniciar o Servidor
```bash
npm start
```

O dashboard estará disponível em `http://localhost:3000`

## 🔧 API Endpoints

### WhatsApp
- `GET /api/whatsapp/status` — Status de conexão
- `POST /api/whatsapp/enviar-teste` — Enviar mensagem de teste
  - Body: `{ numero: "5511999999999", texto: "Olá!" }`

### Planilhas
- `POST /api/planilha/upload` — Upload de nova planilha
- `GET /api/spreadsheet/status` — Status da planilha carregada
- `POST /api/planilha/recarregar` — Recarregar do disco

### Logs
- `GET /api/logs/live?after=<id>` — Buscar logs mais recentes (polling)
- `POST /api/logs/simular` — Simular mensagem no log (teste)

### Sistema
- `GET /ping` — Verificar se servidor está online
- `GET /api/status` — Status completo (WhatsApp + Planilha)

## 📝 Notas Importantes

- **Design preservado**: Nenhuma alteração em cores, fontes, layout ou classes CSS
- **Planilha persistente**: Arquivo `uploads/planilha_atual.xlsx` nunca é deletado automaticamente
- **Backup automático**: Cada upload cria backup em `uploads/planilha_backup.xlsx`
- **Logs em memória**: Logs são salvos em banco SQLite e consultados via polling
- **Health check**: Serviço de planilha faz log a cada 5 minutos
- **Restauração automática**: Na inicialização, tenta carregar planilha anterior se existir

## 🔍 Debug

### Ver logs do servidor
O servidor exibe logs detalhados:
```
✅ Planilha restaurada ao iniciar
💓 Saúde: SD4=150 linhas | Solicitar=42 linhas
📩 [14:32:15] 5511999999999 (João)
   ↳ "Consultar 12345"
   ↳ Tipo: MATERIAL | 234ms
```

### Testar endpoint de status
```bash
curl http://localhost:3000/api/whatsapp/status
```

### Simular log para teste
```bash
curl -X POST http://localhost:3000/api/logs/simular \
  -H "Content-Type: application/json" \
  -d '{"numero":"5511999999999","mensagem":"Teste","tipo":"MATERIAL"}'
```

## ⚠️ Troubleshooting

**"PLANILHA VAZIA NA MEMÓRIA"**
- Significa nenhuma planilha foi carregada
- Envie uma via dashboard ou aguarde inicialização

**"Erro ao processar planilha"**
- Verifique se o arquivo tem abas "SD4" e "Solicitar"
- Planilha anterior permanece intacta, tente novamente

**"Sem resposta do servidor"**
- Verifique se `EVOLUTION_BASE` e `EVOLUTION_KEY` estão corretos
- API Evolution pode estar offline
