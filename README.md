# 🌱 EcoCampus — Marketplace de Economia Circular Universitária

> Plataforma web/mobile (PWA) que conecta estudantes universitários para **vender**,
> **comprar** ou **doar** materiais acadêmicos — livros, apostilas, jalecos,
> calculadoras, componentes eletrônicos e mais. Foco em **sustentabilidade**,
> **reutilização** e **redução de desperdício** dentro do campus.

**Projeto desenvolvido para o Processo Seletivo Vortex 2026.**

---

## 🔗 Links

- **Repositório**: https://github.com/NandoHeck/EcoCampus
- **Frontend (produção)**: _a definir após deploy no Netlify_
- **API (produção)**: _a definir após deploy no Render_
- **Healthcheck**: `<URL_API>/api/health`

> Enquanto o deploy não estiver publicado, todas as instruções abaixo permitem
> subir a plataforma completa localmente em menos de 1 minuto.

---

## ✨ Funcionalidades

### Núcleo
- 🔐 **Autenticação** — cadastro, login, logout, persistência de sessão via token.
- 📢 **CRUD completo de anúncios** — criar, listar, filtrar, ver detalhes, editar e excluir.
- 🔎 **Busca com debounce** (320ms) por título, descrição e categoria.
- 🧭 **Filtros combinados** — categoria + tipo (venda/doação) + ordenação (recentes / mais vistos / preço).
- ❤️ **Sistema de favoritos** — salvar anúncios para acessar depois.
- 👤 **Perfil editável** — dados, foto (com preview em tempo real e opção de remover), abas "meus anúncios / favoritos / editar".
- 🏆 **Dashboard** — estatísticas, categorias populares, destaques (mais vistos), recentes.
- 🌐 **Landing page persuasiva** — hero, benefícios, como funciona, categorias, depoimentos, FAQ, CTA, footer.

### PWA
- 📱 **Instalável** em Android, iOS e desktop.
- 🌩️ **Funciona offline** — service worker com múltiplas estratégias de cache.
- 🔄 **Auto-update** — usuário recebe toast "nova versão disponível" quando há novo deploy.
- 🎯 **Shortcuts** — atalhos para "Explorar", "Anunciar" e "Favoritos" ao segurar o ícone.

### UX/UI
- Design System próprio (Nexus) — dark navy + acento amarelo, superfícies glass.
- Skeleton loading, empty states, error states, toasts, modais de confirmação.
- Microinterações: ripple em botões, hover lift, sonar animation, shimmer, fade-slide.
- Bottom navigation em mobile, navbar responsiva em desktop.
- Feedback visual global de online/offline.

---

## 📸 Screenshots

_Adicione aqui prints reais após rodar a aplicação._

| Landing | Dashboard | Detalhe do anúncio |
|---|---|---|
| _screenshot_ | _screenshot_ | _screenshot_ |

| Mobile — bottom nav | PWA instalável | Modo offline |
|---|---|---|
| _screenshot_ | _screenshot_ | _screenshot_ |

---

## 🧱 Stack e tecnologias

### Frontend
- **HTML5** semântico
- **CSS3** — Custom properties, grid, flexbox, mobile-first, backdrop-filter
- **JavaScript ES6+** — módulos nativos, sem bundler
- **PWA** — Web App Manifest + Service Worker
- **Iconify** (`iconify-icon` web component) — biblioteca de ícones
- **Inter** (Google Fonts) — tipografia

### Backend
- **Node.js** ≥ 18
- **Express** 4.19 — framework HTTP
- **helmet** 7.1 — cabeçalhos de segurança (X-Frame-Options, HSTS, X-Content-Type-Options etc.)
- **express-rate-limit** 7.4 — proteção contra brute-force (10 tentativas/15min em auth, 300 req/15min geral)
- **cors** 2.8 — Cross-Origin Resource Sharing
- **better-sqlite3** 11.7 — banco relacional embarcado (optional dependency com fallback automático para JSON)
- Persistência dual: **SQLite** em produção, **JSON File** como fallback local
- Autenticação **stateless** via token custom (`<userId>.<hash>`) — SHA-256 + salt
- Arquitetura em camadas — **Clean Architecture** (domain / application / infrastructure / presentation)

### DevTools
- **sharp** (dev) — geração dos ícones PNG do PWA a partir dos SVGs
- **git** + convenção Conventional Commits

### Deploy
- **Render** — backend (Blueprint via `render.yaml`)
- **Netlify** — frontend estático (config em `netlify.toml`)

---

## 🏛️ Arquitetura

```
┌──────────────── CLIENTE (Browser / PWA instalado) ────────────────┐
│                                                                    │
│   Pages HTML  ←→  JS ES modules  ←→  Service Worker  ←→  Manifest │
│                                                                    │
└─────────────────────────────┬──────────────────────────────────────┘
                              │ fetch (JSON) + Bearer token
                              ▼
┌──────────────── EXPRESS API (backend/) ──────────────────────────┐
│                                                                    │
│   Routes  →  Controllers  →  Use Cases  →  Repositories           │
│   (presentation)    │        (application)   (infrastructure)     │
│                     │                                              │
│                     └──→ Middlewares: auth, errorHandler, CORS    │
│                                                                    │
└─────────────────────────────┬──────────────────────────────────────┘
                              ▼
                     ┌────────────────────┐
                     │  backend/data/     │
                     │    db.json         │
                     └────────────────────┘
```

**Por que essa arquitetura**
- **Frontend sem framework**: aceitação explícita do requisito ("HTML5/CSS3/JavaScript"), sem custo de bundler/build, código transparente e defensável em entrevista.
- **Clean Architecture no backend**: separação `domain` (entidades puras) / `application` (regras de aplicação) / `infrastructure` (persistência) / `presentation` (HTTP). Facilita troca de banco (SQLite → JSON → Postgres) sem tocar em regras.
- **Persistência JSON**: cumpre o requisito ("estruturas de dados / instâncias voláteis"), zero-config e reprodutível em qualquer máquina.

---

## 📋 Pré-requisitos

| Ferramenta | Versão mínima |
|---|---|
| Node.js | 18.0 (recomendado 20+) |
| npm | 9 |
| git | 2.30 |
| Navegador moderno | Chrome/Edge 100+, Firefox 100+, Safari 15+ |

Sem necessidade de banco externo, Docker ou toolchains adicionais.

---

## 🚀 Como executar

### 1. Clonar

```bash
git clone https://github.com/NandoHeck/EcoCampus.git
cd EcoCampus
```

### 2. Instalar dependências

```bash
npm install
```

> O `postinstall` da raiz já instala automaticamente as dependências do backend.

### 3. (opcional) Copiar variáveis de ambiente

```bash
cp .env.example .env
```

Ajuste os valores conforme necessário. O projeto funciona sem `.env` — os defaults do `backend/src/config/env.js` cobrem o modo local.

### 4. Iniciar

```bash
npm start
```

Você verá:

```
🌱 EcoCampus rodando em http://localhost:3333
   Frontend: http://localhost:3333/
   API:      http://localhost:3333/api
```

O **Express serve tanto a API quanto o frontend estático na mesma porta**.
Acesse **http://localhost:3333/** no navegador.

### 5. (opcional) Repovoar dados de exemplo

```bash
npm run seed
```

Cria 3 usuários demo e 10 anúncios de exemplo.

### 6. (opcional) Regenerar ícones do PWA

```bash
npm run icons
```

Regenera os PNGs a partir dos SVGs em `img/`. Roda apenas se você alterar o design dos ícones.

---

## 🔐 Login demo

Após o primeiro `npm start`, o seed cria automaticamente:

| E-mail | Senha |
|---|---|
| `demo@ecocampus.edu` | `demo1234` |
| `bruno@ecocampus.edu` | `bruno1234` |
| `camila@ecocampus.edu` | `camila1234` |

Ou crie a sua conta em `/pages/cadastro.html`.

---

## ⚙️ Variáveis de ambiente

Ver `.env.example` na raiz. Todas são **opcionais em desenvolvimento** (defaults sensatos).

| Variável | Default | Descrição |
|---|---|---|
| `PORT` | `3333` | Porta HTTP. Em produção, definida pela plataforma. |
| `HOST` | `0.0.0.0` | Bind host. Obrigatório em containers. |
| `CORS_ORIGIN` | `*` | Origem permitida em CORS. Restrinja em produção. |
| `PASSWORD_SALT` | `ecocampus_salt_v1` | Salt do hash SHA-256. **Nunca use o default em produção.** |
| `DB_DRIVER` | `sqlite` | `sqlite` (default) ou `json`. Fallback automático para JSON se `better-sqlite3` não puder ser carregado. |
| `DB_PATH_SQLITE` | `backend/data/ecocampus.db` | Caminho do arquivo SQLite. |
| `DB_PATH_JSON` | `backend/data/db.json` | Caminho do arquivo JSON (usado como fallback). |

---

## 🌐 API REST

Base: `/api`. Todas requisições e respostas em JSON.

### Envelope de resposta

**Sucesso**
```json
{ "data": { ... } }
```

**Erro**
```json
{ "error": { "code": "NotFoundError", "message": "...", "details": null } }
```

### Endpoints

| Método | Path | Descrição | Auth |
|---|---|---|---|
| GET | `/api/health` | Healthcheck | ❌ |
| POST | `/api/users/register` | Criar conta | ❌ |
| POST | `/api/users/login` | Autenticar | ❌ |
| GET | `/api/users/me` | Usuário logado | ✅ |
| GET | `/api/users/:id` | Perfil público | ❌ |
| PUT | `/api/users/:id` | Atualizar perfil (dono) | ✅ |
| GET | `/api/users/:id/ads` | Anúncios do usuário | ❌ |
| GET | `/api/users/:id/favorites` | Favoritos do usuário | ❌ |
| POST | `/api/users/:id/favorites` | Adicionar favorito `{adId}` | ✅ |
| DELETE | `/api/users/:id/favorites/:adId` | Remover favorito | ✅ |
| GET | `/api/ads` | Listar anúncios | ❌ |
| GET | `/api/ads/:id` | Detalhe (incrementa views) | ❌ |
| POST | `/api/ads` | Criar anúncio | ✅ |
| PUT | `/api/ads/:id` | Atualizar (dono) | ✅ |
| DELETE | `/api/ads/:id` | Excluir (dono) | ✅ |

**Filtros de listagem** (query string em `GET /api/ads`):
- `search=texto` — busca em título, descrição e categoria
- `category=Livros` — categoria exata
- `type=sale` ou `donation`
- `sortBy=recent | views | price-asc | price-desc`
- `limit=N`

**Autenticação**: header `Authorization: Bearer <userId>.<hash>` recebido no login/register.

### Exemplos com curl

```bash
# Login
curl -X POST http://localhost:3333/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"demo@ecocampus.edu","password":"demo1234"}'

# Listar doações de livros
curl "http://localhost:3333/api/ads?category=Livros&type=donation"

# Criar anúncio (substituir <TOKEN>)
curl -X POST http://localhost:3333/api/ads \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"title":"Cálculo I","description":"Livro em ótimo estado.","category":"Livros","type":"sale","price":50}'
```

---

## 📱 PWA

O EcoCampus é um **Progressive Web App instalável** com suporte a operação offline.

### Como instalar

**Desktop (Chrome/Edge)**: um ícone de "Instalar" aparece na barra de endereço.
**Android (Chrome)**: menu ⋮ → "Instalar app" ou "Adicionar à tela inicial".
**iOS (Safari)**: botão Compartilhar → "Adicionar à Tela de Início".
**Interno**: um botão "Instalar app" aparece no perfil quando o navegador expõe o evento `beforeinstallprompt`.

### O que funciona offline

- Todas as **páginas já visitadas** (cache-first no app shell)
- **Anúncios já carregados** — retornam do cache com header `X-EcoCampus-Cache: HIT`
- **Página `offline.html`** de fallback com reload automático ao voltar online

### Estratégias de cache (implementadas em `sw.js`)

| Recurso | Estratégia |
|---|---|
| App shell (HTML/CSS/JS/ícones) | **Cache-first** (precache no install) |
| Navegação (páginas) | **Network-first** → cache → `offline.html` |
| API GET | **Network-first** → cache (permite ver dados antigos offline) |
| API POST/PUT/DELETE | **Nunca cacheado** — sempre rede |
| Fontes/CDN externos | **Stale-while-revalidate** |

### Verificação

```
Chrome DevTools → Application:
  ├─ Manifest       → deve listar nome, ícones, start_url, theme_color
  ├─ Service Workers → deve estar "activated and running"
  └─ Cache Storage  → 3 caches (shell, runtime, api)

Lighthouse → aba PWA:
  ✓ Installable
  ✓ PWA optimized
```

---

## 🧪 Testes

### Testes manuais (checklist)

1. **Auth**: cadastro com senha < 6 → erro inline. Login demo → toast + redirect.
2. **Dashboard**: 4 stat cards, categorias, destaques e recentes populados.
3. **Busca**: digitar "cálculo" → debounce 320ms → filtra.
4. **Filtro**: "Doação" no dropdown → só doações.
5. **Detalhe**: clicar em card → detalhe abre, views incrementa.
6. **Favoritar**: coração → toast + aparece em `/pages/favoritos.html`.
7. **CRUD**: criar (doação zera preço), editar (formulário populado), excluir (modal confirmação).
8. **Perfil**: editar avatar → preview ao vivo → salvar → navbar atualiza.
9. **Mobile**: DevTools 375px → bottom-nav aparece, navbar links some.
10. **404**: acessar `/rota-inexistente` → página 404 personalizada.

### Testes de PWA

1. **Lighthouse PWA** ≥ 80 pontos.
2. **DevTools → Application → Manifest** verde.
3. **Offline**: DevTools → Network Offline → navegar em páginas visitadas continua funcionando.
4. **Update**: alterar `VERSION` em `sw.js`, redeployar → toast "Nova versão disponível" aparece.

### Testes automatizados

**Ferramenta**: `node --test` (built-in do Node 18+, zero dependência externa).

```bash
npm test              # roda todas as suites
npm run test:watch    # roda em watch mode (dev)
```

**Cobertura (41 testes, ~600ms)**:

| Suite | Tipo | O que testa |
|---|---|---|
| `users.test.js` | Integração | health, register (sucesso/duplicado/inválido), login (sucesso/senha errada), auth middleware, update de perfil |
| `ads.test.js` | Integração | CRUD completo, filtros (categoria/tipo/busca), autorização (dono vs não-dono), incremento de views |
| `favorites.test.js` | Integração | add/remove/list favoritos, autorização, adId inexistente |
| `validator.test.js` | Unitário | assertRequired, assertEmail, assertLength, assertEnum, sanitizeString |

**Isolamento**: cada suite cria um servidor Express em porta aleatória com persistência em arquivo JSON temporário (limpo ao final). Rate-limit desativado nos testes. Sem interferência entre suites — podem rodar em paralelo.

**Extração da `createApp`**: para permitir testes de integração sem tocar em `server.js`, a criação do Express foi extraída para `src/createApp.js` (recebe repositórios por injeção). Isso segue o padrão comum em Node/Express testing.

---

## 🚢 Deploy

Instruções completas passo-a-passo em [`DEPLOY.md`](./DEPLOY.md).

**Resumo**:
1. **Backend no Render** — Blueprint via `render.yaml` (plano free).
2. **Frontend no Netlify** — drag-and-drop ou GitHub connect (config em `netlify.toml`).
3. Após deploy da API, adicionar em cada HTML no `<head>`:
   ```html
   <meta name="ecocampus-api" content="https://<sua-api>.onrender.com/api">
   ```
4. Restringir CORS no Render para o domínio do Netlify.

⚠️ **Limitações do plano free**:
- Render dorme após 15min de inatividade — cold start de ~30s na primeira request.
- Disco efêmero — o `db.json` zera a cada restart (o seed rerroda automaticamente).

---

## 🧠 Decisões técnicas

| Decisão | Justificativa |
|---|---|
| **HTML/CSS/JS puro** (sem React/Vue) | Aceito pelo requisito. Sem build step, código transparente e defensável em entrevista. |
| **Clean Architecture no backend** | Permitiu adicionar SQLite depois sem tocar em uma única regra de negócio — bastou criar `SqliteAdRepository`/`SqliteUserRepository` implementando as mesmas interfaces `IAdRepository`/`IUserRepository`. |
| **Persistência dual (SQLite + JSON fallback)** | SQLite via `better-sqlite3` como default (bônus "banco real" + persistência estável em produção). Se o binário nativo não estiver disponível localmente (Node novo sem prebuild), cai automaticamente para JSON com warning — o dev não precisa instalar Visual Studio Build Tools. |
| **Token custom em vez de JWT** | O requisito aceita "autenticação básica ou separação por IDs". Token `<userId>.<hash>` é auditável, mais simples e cumpre o objetivo. |
| **SHA-256 + salt em vez de bcrypt** | Trade-off de simplicidade. Bcrypt seria melhor para produção real; SHA-256+salt é aceitável para o escopo acadêmico e não adiciona dependência. |
| **Iconify via CDN** | Milhares de ícones sem impacto no bundle. Cacheado pelo SW. |
| **Ícones PWA via `sharp` em build-time** | PNGs commitados no repo — Netlify serve estático sem rodar scripts. |
| **Service Worker escrito à mão** (sem Workbox) | Código legível de ~150 linhas, sem dependência gigante, fácil de explicar. |

---

## ⚠️ Limitações conhecidas

- **Cold start** do Render free (~30s na primeira request após 15min de inatividade).
- **`db.json` efêmero** em produção free — a base é recriada pelo seed a cada restart.
- **Sem upload real de imagens** — o campo `imageUrl` aceita URLs de imagens externas (Unsplash, Imgur etc). Upload real exigiria S3/Cloudinary.
- **Sem sistema de mensagens** entre usuários — negociação acontece fora da plataforma (por e-mail/contato manual).
- **Sem TypeScript no frontend** — bônus não implementado a favor de tempo em PWA e Diário.

---

## 🗺️ Próximos passos

- [ ] Upload real de imagens (Cloudinary free tier).
- [ ] Sistema de notificações in-app.
- [ ] GitHub Actions rodando `npm test` a cada push.
- [ ] Migração para Postgres real (Neon/Supabase) se o projeto crescer.
- [ ] Refresh tokens + JWT com expiração.

---

## 📁 Estrutura do repositório

```
EcoCampus/
├── index.html                      # Landing Page
├── manifest.webmanifest            # PWA manifest
├── sw.js                           # Service Worker
├── offline.html                    # Fallback offline
├── pages/                          # Páginas internas
│   ├── login.html, cadastro.html, dashboard.html
│   ├── anuncios.html, anuncio.html
│   ├── criar-anuncio.html, editar-anuncio.html
│   ├── perfil.html, favoritos.html, 404.html
├── css/
│   ├── style.css                   # Tokens do Design System, componentes, layout
│   ├── pages.css                   # Estilos específicos de página
│   └── responsive.css              # Media queries mobile-first
├── js/
│   ├── app.js                      # Bootstrap comum (navbar, SW, prompts PWA)
│   ├── api.js                      # Cliente HTTP (fetch)
│   ├── auth.js                     # Sessão
│   ├── storage.js                  # Wrapper localStorage
│   ├── ui.js                       # Toast, modal, cards, avatares, sanitização
│   └── pages/                      # Um script por página
├── img/                            # Ícones PWA + SVGs base
├── scripts/generate-icons.js       # Gerador de PNGs (via sharp)
├── backend/
│   ├── server.js                   # Bootstrap Express + Clean Architecture
│   ├── data/db.json                # Persistência (auto-criada)
│   └── src/
│       ├── config/env.js
│       ├── domain/                 # Entities + interfaces de repositório
│       ├── application/use-cases/  # Regras de aplicação
│       ├── infrastructure/         # JsonDatabase, repositórios, seed
│       ├── presentation/           # Routes, controllers, middlewares
│       └── shared/                 # Errors + utils
├── design_system/                  # Design System de referência (Nexus)
├── docs/                           # Documentação adicional (screenshots etc)
├── .env.example
├── .gitignore
├── render.yaml                     # Blueprint Render
├── netlify.toml                    # Config Netlify
├── DEPLOY.md                       # Passo-a-passo de deploy
├── package.json
└── README.md
```

---

## 🤖 Diário de Bordo da IA

> Seção obrigatória — demonstra o uso consciente de IA generativa durante o desenvolvimento,
> as decisões humanas por trás de cada aceite, e os momentos em que a IA errou e precisou
> ser corrigida com pensamento crítico.

### 🛠️ Ferramentas utilizadas

| Ferramenta | Propósito principal |
|---|---|
| **Claude Code (Anthropic — Opus 4.7)** | Ferramenta principal. Usada para arquitetura, scaffolding, geração de componentes, revisão de código, debug e documentação. Rodando via CLI (terminal integrado ao VS Code). |
| **GitHub Copilot** | Sugestões inline de autocomplete e refactors pontuais durante a edição. |
| **ChatGPT (GPT-5)** | Consultas rápidas sobre APIs específicas e brainstorm de UX. |

### 🎯 Como usei IA neste projeto

- **Arquitetura antes de código** — antes de qualquer implementação de peso, pedi auditorias técnicas que classificassem requisitos (obrigatório/bônus/implícito), listassem riscos e propusessem stacks alternativas.
- **Scaffolding de estrutura** — geração do esqueleto Clean Architecture do backend (domain/application/infrastructure/presentation) a partir de um contrato definido por mim.
- **UI a partir de Design System fixo** — o design system Nexus foi meu constraint principal. A IA foi instruída explicitamente a não inventar cores/tokens.
- **Debug interativo** — situações reais como "HTTP 405 ao criar conta" foram diagnosticadas em conjunto com a IA, mas sempre com verificação manual da correção proposta.
- **Documentação** — rascunho inicial do README foi gerado, mas revisado, editado e refinado manualmente antes do commit.

---

### 📝 Prompts complexos utilizados (exemplos reais)

#### Prompt 1 — Especificação inicial completa do projeto

**Contexto**: primeira interação do projeto. Precisava de um scaffold completo (backend + frontend + docs) que respeitasse 100% um Design System pré-existente. Estruturei o prompt com XML tags para forçar organização.

```
<role>
Engenheiro Staff/Sênior. Full Stack + Clean Architecture + Design Systems + WCAG 2.2.
Nunca use pseudocódigo, TODOs, placeholders. Todo código deve ser executável.
</role>

<objective>
Desenvolver Marketplace de Economia Circular Universitária.
</objective>

<designSystem>
Utilize EXCLUSIVAMENTE o Design System em @design_system/design-system.html
- Não criar novas cores.
- Não alterar tipografia.
- Não alterar tokens.
</designSystem>

<techStack>
Frontend: SÓ HTML5, CSS3, JS ES6+. Proibido React, Vue, Angular, Tailwind, jQuery.
Backend: escolher UMA opção entre Node/Express, FastAPI, Spring Boot etc.
</techStack>

<features>
Auth completo, CRUD de anúncios, categorias, dashboard, favoritos, busca com filtros.
</features>

<pages>
Landing, Login, Cadastro, Dashboard, Listagem, Detalhes, Criar, Editar, Perfil, Favoritos, 404.
</pages>

<qualityRequirements>
1. Definir arquitetura antes de codar.
2. Explicar organização das pastas.
3. Explicar o fluxo da aplicação.
4. Explicar a comunicação Frontend ↔ Backend.
5. Explicar o modelo de dados.
</qualityRequirements>

<outputRules>
Se atingir limite de contexto, interrompa apenas no final de um arquivo e continue
automaticamente na resposta seguinte sem repetir conteúdo.
</outputRules>
```

**Resultado**: scaffold completo em uma única iteração (58 arquivos). Revisei manualmente cada arquivo antes de aceitar. Detectei duas coisas que precisei corrigir: (1) `<a>` aninhado em `<a>` no navbar quando o usuário não estava logado, (2) uso de `i.pravatar.cc` como fallback de avatar gerando fotos aleatórias entre requisições.

**Aprendizado**: prompts com estrutura XML forte + regras explícitas de "não faça X" produzem código muito mais alinhado do que descrições genéricas.

---

#### Prompt 2 — Debug de HTTP 405 durante testes locais

**Contexto**: tentei criar uma conta no navegador e a request retornava HTTP 405. Não sabia se o erro era no fetch, no backend, ou na configuração.

```
Prompt (real):
"pq quando eu tento criar uma conta ou tentar ver os itens da erro http 405"
```

**Como a IA respondeu**:
1. Diagnosticou que 405 = "Method Not Allowed" e que Live Server (extensão do VS Code que eu estava usando) só aceita GET — então as requests POST estavam batendo no Live Server em vez do backend Express.
2. Propôs duas soluções: rodar apenas o Express (que serve os HTMLs também) OU adaptar o `api.js` para sempre apontar para `localhost:3333` independentemente da porta do frontend.
3. Aplicou a segunda solução (mais robusta) diretamente no código.

**Minha validação**: reproduzi o cenário, confirmei que o `api.js` novo pega a porta 3333 quando estou em outra origin. Testei os dois modos (Express-only e Live Server + backend separado) — ambos funcionam.

**Aprendizado**: prompts curtos e descritivos do sintoma funcionam bem quando o modelo já tem contexto do projeto. Não precisei explicar arquitetura — a IA lembrava do `api.js` e correlacionou.

---

#### Prompt 3 — Auditoria técnica pré-implementação de PWA

**Contexto**: antes de implementar PWA + refazer README, quis uma auditoria crítica dos requisitos oficiais do processo seletivo. Precisava saber o que **realmente** faltava vs o que era exagero.

```
<system_role>
Staff/Principal Software Engineer.
Missão: auditar requisitos e identificar gaps ANTES de implementar.
</system_role>

<primary_objective>
Realizar auditoria técnica completa. NÃO implementar código ainda.
NÃO assumir que a lista fornecida está completa.
NÃO simplesmente repetir os requisitos.
NÃO dizer apenas que "está tudo certo".
Analisar como um avaliador técnico da banca.
</primary_objective>

<audit>
[24 sub-análises exigindo: classificação de requisitos, matriz de rastreabilidade,
comparação de 3 stacks alternativas, plano de execução em fases, checklist final,
priorização P0/P1/P2/P3, análise de compliance final]
</audit>

<important_constraints>
NÃO overengineering. NÃO microserviços. NÃO K8s.
Toda decisão precisa de justificativa técnica.
Considerar contexto de processo seletivo e prazo limitado.
</important_constraints>

<next_step>
NÃO escreva código ainda. Aguardar autorização explícita para implementar.
</next_step>
```

**Resultado**: documento de auditoria com 29 seções, identificando **PWA como gap crítico** (obrigatório e não implementado), Diário de Bordo como segundo gap crítico, plano de execução em 8 fases priorizadas por retorno sobre tempo, e uma matriz de rastreabilidade requisito ↔ arquivo ↔ evidência.

**Uso da auditoria**: virou o "contrato técnico" das fases seguintes. As Fases 1 (PWA) e 2 (README + Diário — esta) foram executadas seguindo a ordem P0 → P1 do plano.

**Aprendizado**: forçar a IA a fazer auditoria antes de codar economizou tempo depois. Sem essa etapa, provavelmente teria implementado PWA sem estratégias de cache diferenciadas por tipo de recurso ou sem `beforeinstallprompt`.

---

### ❌ Momentos em que a IA errou

#### Caso 1 — HTML inválido: `<a>` dentro de `<a>` no navbar

**O que aconteceu**: ao gerar a navbar do estado deslogado, a IA produziu:

```html
<a href="/pages/login.html" class="nav-links" style="display:inline-flex">
  <a href="/pages/login.html">Entrar</a>
</a>
```

Isso é **HTML inválido** — âncoras não podem ser aninhadas. O navegador tenta "corrigir" o parse na hora e o resultado visual quebra: aparecem duas âncoras separadas, o hover fica errado, e leitores de tela ficam confusos.

**Como identifiquei**: inspecionei o DOM no DevTools e vi que o Chrome tinha reestruturado o HTML de forma diferente do source. O layout estava desalinhado quando não estava logado.

**Correção**: substituí por uma única `<a>` com estilo próprio.

```html
<a href="/pages/login.html" class="nav-links__login"
   style="font-size:13.5px;color:var(--muted);padding:.4rem .8rem;
          border-radius:8px;transition:color .3s var(--ease)">
  Entrar
</a>
```

**Lição**: mesmo em outputs longos e majoritariamente corretos, sempre inspecionar o DOM final antes de aceitar HTML gerado por IA. E jamais confiar apenas em "parece que renderiza" — HTML inválido às vezes só quebra em navegadores específicos ou leitores de tela.

---

#### Caso 2 — Fallback de avatar gerando fotos aleatórias

**O que aconteceu**: em vários lugares (navbar, perfil, detalhe do anúncio), a IA usou por default:

```js
user.avatar || `https://i.pravatar.cc/200?u=${encodeURIComponent(user.email)}`
```

O `pravatar.cc` retorna imagens reais de pessoas aleatórias. Em teoria, `?u=email` deveria fixar a mesma imagem para o mesmo email — mas na prática, **entre páginas diferentes** algumas requisições retornavam avatares diferentes (comportamento inconsistente do serviço), e novos usuários apareciam com fotos de estranhos que não escolheram.

**Como identifiquei**: usei a plataforma real, criei uma conta nova, e a "minha foto" era um homem barbado que eu nunca vi. Ficou surreal e reportei: _"o icone do usuario esta mudando constantemente, eu quero que voce possa editar sua foto de perfil e que tbm tenha como sua foto de perfil fique sem nada, so com um bonequinho igual quando uma foto de perfil de email ou whatsapp fica"_.

**Correção**: pedi que o padrão passasse a ser um **placeholder de bonequinho** (SVG `lucide:user-round`), estilo Gmail/WhatsApp. Criei um helper `avatarBlock(url, name, size)` em `js/ui.js` que:
- Se `url` for válida → renderiza `<img>`.
- Se não → renderiza um `<div class="avatar avatar--empty">` com o ícone.
- Se o `<img>` falhar (`onerror`) → cai para o placeholder automaticamente.

Também melhorei o form de perfil com **preview ao vivo** do avatar enquanto o usuário digita a URL, botão **"Remover foto"** com modal de confirmação, e removi o `pravatar` do `RegisterUser.js` no backend (usuário nasce com `avatar: ""`).

**Lição**: quando a IA precisa preencher um "vazio de UX", ela tende a colocar **algo** em vez de refletir sobre se um placeholder explícito seria melhor. Sempre revisar se os "defaults automáticos" fazem sentido do ponto de vista do usuário — muitas vezes o ícone genérico é o comportamento certo, não uma foto aleatória.

---

### 📅 Cronograma resumido

O projeto foi desenvolvido em sessões incrementais de trabalho, com IA sendo usada de forma iterativa: primeiro auditoria → plano → implementação → validação → refinamento.

- **Setup + Design System reference**: análise do `design-system.html` fornecido como constraint.
- **Backend Clean Architecture + Frontend base**: geração do scaffold via Prompt 1 (58 arquivos em uma iteração).
- **Debug de integração (Live Server vs Express)**: correção do 405 (Prompt 2).
- **Avatar UX**: refactor do sistema de avatares para placeholder + edição.
- **Deploy prep**: `render.yaml`, `netlify.toml`, `.gitignore`, `git init` + commits estruturados.
- **Auditoria técnica pré-PWA**: 29 seções, matriz de rastreabilidade, plano em fases (Prompt 3).
- **Fase 1 — PWA**: manifest, service worker, ícones (via sharp), integração em 11 HTMLs, offline fallback.
- **Fase 2 — README + Diário**: este documento.

---

### 🧭 Princípios que segui ao usar IA

1. **Auditoria antes de código** — nunca comecei a implementar sem uma análise crítica antes.
2. **Cada aceite foi consciente** — nada foi commitado sem eu abrir o arquivo, ler o diff e entender por que funciona.
3. **Testei o que a IA disse funcionar** — cada correção passou por reprodução manual antes de eu confiar.
4. **Documentei desvios** — quando escolhi caminho diferente do sugerido, ficou registrado (nas decisões técnicas acima e nos commits).
5. **Preservei minhas restrições** — Design System, requisitos oficiais e prazo foram tratados como intocáveis, e a IA foi instruída explicitamente a respeitá-los.

---

## 📄 Licença

Uso educacional para o Processo Seletivo Vortex 2026.

---

**Feito com propósito circular por [Nando](https://github.com/NandoHeck).** 🌱
