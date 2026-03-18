# Deploy no Vercel

## 🚀 Instruções de Deployment

### Opção 1: Via Dashboard Vercel (Recomendado)

1. Acesse https://vercel.com
2. Faça login com sua conta GitHub
3. Clique em "New Project"
4. Selecione o repositório `Painel-zap-automatico`
5. Configure as variáveis de ambiente:
   - `EVOLUTION_BASE`: URL da sua Evolution API
   - `EVOLUTION_INSTANCE`: Nome da instância
   - `EVOLUTION_KEY`: API Key

6. Clique em "Deploy"

### Opção 2: Via CLI Vercel

```bash
# Instalar Vercel CLI
npm install -g vercel

# Fazer login
vercel login

# Deploy
vercel --prod
```

### Opção 3: GitHub Integration

O Vercel sincroniza automaticamente com GitHub:
1. Faça push para a branch `main`
2. Vercel detecta a mudança
3. Build automático
4. Deploy automático

## 🔐 Variáveis de Ambiente

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `EVOLUTION_BASE` | URL da Evolution API | `https://evolution-api-7q5z.onrender.com` |
| `EVOLUTION_INSTANCE` | Nome da instância | `GU` |
| `EVOLUTION_KEY` | API Key | `F9E4642A272E-4460-B862...` |
| `BOT_NOME` | Nome do bot | `MRP Bot` |
| `BOT_VERSION` | Versão | `1.0.0` |

## 📊 URLs de Produção

Após o deploy, você terá:
- **Dashboard**: `https://seu-projeto.vercel.app/`
- **API**: `https://seu-projeto.vercel.app/api/`
- **Health Check**: `https://seu-projeto.vercel.app/health`

## 🧪 Testar após Deploy

```bash
# Verificar saúde
curl https://seu-projeto.vercel.app/health

# Testar API
curl https://seu-projeto.vercel.app/api/ping

# Status WhatsApp
curl https://seu-projeto.vercel.app/api/whatsapp/status
```

## 📝 Notas Importantes

- Vercel roda em serverless functions
- Tempo máximo de execução: 60 segundos
- Banco de dados SQLite não persiste automaticamente
- Uploads de planilhas serão em `/tmp` (temporário)

## ⚠️ Limitações no Vercel

1. **Sistema de Arquivos**: `/tmp` é apagado entre deploys
   - Solução: Integrar com AWS S3, Supabase ou outro storage

2. **Banco de Dados**: SQLite não funciona bem em serverless
   - Solução: Usar PostgreSQL ou MongoDB

3. **Uploads**: Devem ser salvos em storage externo
   - Supabase Storage, AWS S3, ou similar

## 🔄 Migrações Recomendadas

Para produção com Vercel:
1. Trocar SQLite por PostgreSQL (Supabase recomendado)
2. Usar Supabase Storage ou S3 para arquivos
3. Adicionar autenticação (JWT)
4. Implementar rate limiting

## 📞 Suporte

Para mais informações, acesse:
- https://vercel.com/docs
- https://github.com/mimonemo38-code/Painel-zap-automatico
