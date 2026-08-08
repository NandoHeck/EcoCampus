# 🚀 Deploy — Backend no Render + Frontend no Netlify

## Parte 1 — Subir o código para o GitHub

```bash
# Na raiz do projeto (já está inicializado por este script)
git remote add origin https://github.com/SEU_USUARIO/ecocampus.git
git branch -M main
git push -u origin main
```

Se ainda não criou o repositório: https://github.com/new  → nome `ecocampus` → **privado ou público** → **NÃO** marque "Add README" nem gitignore (o repo local já tem).

---

## Parte 2 — Backend no Render (Blueprint)

1. Acesse **https://dashboard.render.com/** e faça login (crie conta se não tiver — dá pra usar GitHub).
2. Clique em **"New +"** → **"Blueprint"**.
3. Conecte sua conta do GitHub e escolha o repositório `ecocampus`.
4. O Render detecta o `render.yaml` automaticamente e mostra o serviço `ecocampus-api`.
5. Clique em **"Apply"**. O primeiro build leva 2–3 minutos.
6. Quando ficar verde ("Live"), copie a URL — algo como
   `https://ecocampus-api.onrender.com`

**Teste rápido**: abra `https://ecocampus-api.onrender.com/api/health`
→ deve retornar `{"status":"ok",...}`

> ⚠️ **Plano free**: o serviço "dorme" após 15 min sem tráfego. A primeira
> requisição depois do sleep leva ~30s (cold start). E o disco é efêmero — o
> `db.json` zera a cada deploy/restart, e o seed roda de novo.

---

## Parte 3 — Frontend no Netlify

### 3.1 — Apontar o frontend para o backend em produção

Edite **cada HTML da pasta `/` e `/pages/`** e adicione uma linha no `<head>`:

```html
<meta name="ecocampus-api" content="https://ecocampus-api.onrender.com/api">
```

Coloque logo depois do `<title>`. Substitua pela URL real que o Render te deu.

Ou, se preferir uma linha só: dentro do `<head>` de cada HTML, adicione:

```html
<script>window.__ECOCAMPUS_API__ = "https://ecocampus-api.onrender.com/api";</script>
```

### 3.2 — Subir para o Netlify

**Método rápido (drag-and-drop)**:
1. Vá em https://app.netlify.com/drop
2. Arraste a **pasta raiz do projeto**.
3. Pronto — URL tipo `https://random-name.netlify.app`.

**Método com GitHub (recomendado, deploy automático)**:
1. https://app.netlify.com/ → "Add new site" → "Import an existing project".
2. Conecte GitHub, escolha o repo.
3. Build settings: **deixe vazio**. Publish directory: `.` (o `netlify.toml` já configura isso).
4. Deploy.

### 3.3 — Ajustar CORS (opcional, recomendado)

Depois que tiver a URL do Netlify, restrinja o CORS do backend:

1. No painel do Render → seu serviço → **Environment** → edite `CORS_ORIGIN`.
2. Valor: `https://seu-site.netlify.app` (a URL exata que o Netlify deu).
3. Save → o serviço reinicia sozinho.

Agora só o seu Netlify pode consumir a API.

---

## ✅ Verificação final

1. Abra o site do Netlify.
2. Clique em "Entrar" → tente logar com `demo@ecocampus.edu / demo1234`.
3. Se o backend estiver "dormindo", pode demorar 30s na primeira request.
4. Faça um cadastro novo e crie um anúncio → confere se aparece na listagem.

---

## Troubleshooting

| Erro | Causa | Solução |
|---|---|---|
| **CORS blocked** no console | `CORS_ORIGIN` do Render não bate com URL do Netlify | Corrigir env var no Render (com https:// e sem barra no fim) |
| **HTTP 502 / demora 30s** | Backend hibernou (plano free) | Normal. Espere a primeira request "acordar" o serviço |
| **404 em todos endpoints** | `<meta name="ecocampus-api">` esquecido | Adicionar em todos os HTMLs |
| **Dados sumiram** | Deploy/restart zerou o `db.json` | Esperado no plano free. Migrar para Postgres/SQLite persistente |
| **Login demo não funciona** | `PASSWORD_SALT` mudou entre deploys | Sim: o seed usa o salt atual. Rode `npm run seed` remotamente ou apague o db |

---

## Custos

- **Render free**: $0/mês, com sleep de 15min e disco efêmero.
- **Render Starter**: $7/mês, sem sleep, disco persistente.
- **Netlify free**: $0/mês, 100GB banda, sem sleep.
