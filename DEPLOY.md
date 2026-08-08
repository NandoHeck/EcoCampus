# 🚀 Deploy — Guia passo-a-passo

Backend no **Render** (Node.js) + Frontend no **Netlify** (estático PWA).

Tempo estimado: **15–20 minutos**.

---

## Parte 1 — Backend no Render

### 1.1 Criar conta e Blueprint

1. Acesse **https://dashboard.render.com/** (pode logar com GitHub).
2. Clique em **"New +"** (canto superior direito) → **"Blueprint"**.
3. **"Connect a repository"** → autorize o Render a acessar seu GitHub.
4. Selecione o repositório **`NandoHeck/EcoCampus`**.
5. O Render detecta automaticamente o `render.yaml` e mostra o serviço `ecocampus-api` com plano free.
6. Clique em **"Apply"**.
7. Aguarde o build (2–3 minutos). Status vai de "Building" → "Deploying" → **"Live"** (verde).

### 1.2 Copiar a URL

Na página do serviço, no topo, aparece algo como:
```
https://ecocampus-api.onrender.com
```
Copie essa URL. **Guarde ela — vai ser usada em duas etapas.**

### 1.3 Testar o backend

Abra em outra aba:
```
https://ecocampus-api.onrender.com/api/health
```
Deve retornar: `{"status":"ok","ts":"..."}`

Se demorar ~30s na primeira request, é o **cold start** do plano free (normal). Depois fica rápido.

---

## Parte 2 — Apontar o Frontend para o Backend em produção

No seu terminal, na raiz do projeto:

```bash
npm run set-api https://ecocampus-api.onrender.com/api
```

> Substitua pela URL exata que o Render te deu. O script atualiza a
> `<meta name="ecocampus-api">` em todos os 12 HTMLs de uma vez.

Faça commit e push:

```bash
git add .
git commit -m "config: point frontend to production API"
git push
```

---

## Parte 3 — Frontend no Netlify

### 3.1 Método rápido — Drag & Drop

1. Acesse **https://app.netlify.com/drop**
2. Arraste a **pasta raiz** do projeto (`Economia Circular agora vai/`) para a área indicada.
3. Aguarde ~30s. O site sobe com URL aleatória tipo `https://amazing-name-abc123.netlify.app`.
4. (Opcional) Renomeie em **Site settings → Change site name**.

### 3.2 Método com GitHub (recomendado — deploy automático a cada push)

1. Acesse **https://app.netlify.com/** → **"Add new site"** → **"Import an existing project"**.
2. **"Deploy with GitHub"** → autorize → selecione `NandoHeck/EcoCampus`.
3. Configurações:
   - **Branch**: `main`
   - **Base directory**: _(deixe vazio)_
   - **Build command**: _(deixe vazio)_
   - **Publish directory**: `.`
   > O `netlify.toml` na raiz já configura todos os headers e redirects.
4. **"Deploy site"** → aguarde 30s → status "Published".
5. Anote a URL (ex.: `https://ecocampus.netlify.app`).

---

## Parte 4 — Restringir CORS (segurança)

Com a URL do Netlify em mãos, restrinja o backend a aceitar apenas dela:

1. No painel do Render → seu serviço `ecocampus-api` → **Environment** (menu lateral).
2. Encontre a variável `CORS_ORIGIN` (valor atual: `*`).
3. Edite para o **domínio exato** do Netlify:
   ```
   https://ecocampus.netlify.app
   ```
   ⚠️ Sem barra no final, com `https://`.
4. **Save changes** → o serviço reinicia sozinho (~30s).

---

## Parte 5 — Atualizar o README com os links reais

Edite `README.md` na seção **"🔗 Links"** no topo:

```markdown
- **Repositório**: https://github.com/NandoHeck/EcoCampus
- **Frontend (produção)**: https://ecocampus.netlify.app
- **API (produção)**: https://ecocampus-api.onrender.com
- **Healthcheck**: https://ecocampus-api.onrender.com/api/health
```

Commit e push:

```bash
git add README.md
git commit -m "docs: add production URLs to README"
git push
```

---

## ✅ Verificação final

1. Abra o site do Netlify no celular.
2. Chrome Android: menu ⋮ → **"Instalar app"** → app aparece na tela inicial.
3. Faça login: `demo@ecocampus.edu` / `demo1234` (pode demorar 30s se o backend acordar).
4. Crie um anúncio → confirma que aparece na listagem.
5. DevTools → Network → **Offline** → recarregue → app continua funcionando (SW ativo).

---

## ⚠️ Limitações do plano free

| Serviço | Limite | Impacto |
|---|---|---|
| Render | Dorme após 15min sem tráfego | Cold start ~30s na primeira request |
| Render | Disco efêmero | `db.json`/`data.db` zera a cada restart; seed rerroda |
| Netlify | 100GB banda/mês, sem sleep | Nenhum para uso normal |

**Se quiser persistência real** (recomendado só se for demo importante):
- Render **Starter plan ($7/mês)**: sem sleep + adicionar `disk:` no `render.yaml`.
- Ou migrar para **PostgreSQL grátis** (Neon, Supabase) — requer refactor do backend.

---

## 🆘 Troubleshooting

| Erro | Causa | Solução |
|---|---|---|
| `CORS blocked` no console | `CORS_ORIGIN` no Render não bate | Corrigir env var (com `https://`, sem barra final) |
| `HTTP 502` ou timeout | Backend hibernou | Normal no plano free; espere 30s |
| Login demo não funciona | `PASSWORD_SALT` mudou entre deploys | Não vai mudar — o Render fixa o salt uma única vez |
| Site não instala | Faltando HTTPS ou manifest inválido | Ambos já resolvidos; se acontecer, verificar DevTools → Application → Manifest |
| Dados sumiram | Restart zerou disco | Comportamento esperado do plano free; a base é recriada pelo seed |

---

## Custos totais

- Frontend: **$0/mês** (Netlify free tier)
- Backend: **$0/mês** (Render free tier) — ou **$7/mês** (Starter, sem sleep + disco persistente)
- Domínio custom (opcional): **$10–15/ano**
