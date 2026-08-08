# 🌱 EcoCampus — Marketplace de Economia Circular Universitária

Plataforma completa (frontend + backend) que conecta estudantes universitários interessados
em **vender**, **comprar** ou **doar** materiais acadêmicos — livros, apostilas, jalecos,
calculadoras, componentes eletrônicos e mais. Foco em **sustentabilidade**, **reutilização**
e **redução de desperdício** dentro do campus.

Construído seguindo integralmente o **Nexus Design System** presente em
`design_system/design-system.html` (mesmos tokens, tipografia, cores, sombras, animações e componentes).

---

## 🧱 Stack

| Camada     | Tecnologia                                                        |
| ---------- | ------------------------------------------------------------------ |
| Frontend   | **HTML5** + **CSS3** + **JavaScript ES6+ (modules)** — sem frameworks |
| Ícones     | [iconify-icon](https://iconify.design/) (CDN, mesmo do DS)         |
| Fontes     | Inter (Google Fonts, mesma do DS)                                  |
| Backend    | **Node.js + Express** com Clean Architecture                       |
| Persistência | **Arquivo JSON** (`backend/data/db.json`)                        |
| HTTP client | Fetch API                                                         |

---

## 📁 Estrutura de pastas

```
├── index.html                    # Landing Page
├── pages/                        # Todas as páginas internas
│   ├── login.html
│   ├── cadastro.html
│   ├── dashboard.html
│   ├── anuncios.html             # Listagem
│   ├── anuncio.html              # Detalhes
│   ├── criar-anuncio.html
│   ├── editar-anuncio.html
│   ├── perfil.html
│   ├── favoritos.html
│   └── 404.html
├── css/
│   ├── style.css                 # Tokens, base, componentes, layout
│   ├── pages.css                 # Estilos específicos das páginas
│   └── responsive.css            # Media queries mobile-first
├── js/
│   ├── app.js                    # Bootstrap (navbar, bottom-nav, ripple, reveal)
│   ├── api.js                    # Cliente HTTP (Fetch)
│   ├── auth.js                   # Sessão / login / registro
│   ├── storage.js                # Wrapper localStorage
│   ├── ui.js                     # Toast, modal, cards, skeleton, sanitização
│   └── pages/                    # Um script por página
│       ├── landing.js
│       ├── auth.js
│       ├── dashboard.js
│       ├── anuncios.js
│       ├── anuncio.js
│       ├── criar-anuncio.js
│       ├── editar-anuncio.js
│       ├── perfil.js
│       └── favoritos.js
├── backend/
│   ├── package.json
│   ├── server.js                 # Express + bootstrap Clean Architecture
│   ├── data/db.json              # Persistência (gerado no primeiro run)
│   └── src/
│       ├── config/               # Configs de ambiente
│       ├── domain/               # Entities + interfaces de repositório
│       ├── application/use-cases/# Regras de aplicação (ads, users, favorites)
│       ├── infrastructure/       # JsonDatabase, repositórios concretos, seed
│       ├── presentation/         # Routes, controllers, middlewares
│       └── shared/               # Errors, utils (id, validator)
├── design_system/
│   └── design-system.html        # Design System de referência (não modificar)
├── package.json                  # Raiz (aponta pro backend)
└── README.md
```

---

## 🚀 Como executar

**Requisito**: Node.js ≥ 18.

```bash
# 1) Instalar dependências (raiz instala automaticamente o backend)
npm install

# 2) Iniciar o servidor (serve frontend + API na mesma porta)
npm start
```

Acesse:

- **Frontend**: http://localhost:3333/
- **API**:      http://localhost:3333/api
- **Healthcheck**: http://localhost:3333/api/health

O servidor Express serve o frontend estático diretamente da raiz do projeto,
então uma única porta cobre tudo. Também aplica o fallback para `pages/404.html`
em qualquer rota GET não encontrada.

### Modo dev (auto-reload)

```bash
npm run dev
```

### (Re)popular dados de exemplo

```bash
npm run seed
```

---

## 🔐 Login de teste

Após o primeiro run, o seed cria três usuários:

| E-mail                   | Senha       |
| ------------------------ | ----------- |
| `demo@ecocampus.edu`     | `demo1234`  |
| `bruno@ecocampus.edu`    | `bruno1234` |
| `camila@ecocampus.edu`   | `camila1234`|

Ou crie a sua conta em `/pages/cadastro.html`.

---

## 🧩 Funcionalidades

- ✅ Landing Page persuasiva (hero, benefícios, como funciona, categorias, depoimentos, FAQ, CTA, footer)
- ✅ Autenticação (cadastro, login, logout, persistência de sessão via localStorage)
- ✅ Dashboard com estatísticas, categorias populares, destaques, recentes, pesquisa e filtros
- ✅ Listagem completa com busca por texto, categoria, tipo e ordenação
- ✅ Detalhes do anúncio (view count, imagem, meta, ações e relacionados)
- ✅ CRUD completo de anúncios (criar, editar, excluir)
- ✅ Sistema de favoritos (adicionar/remover em qualquer ponto)
- ✅ Perfil do usuário com abas (meus anúncios, favoritos, editar dados)
- ✅ Página 404 personalizada
- ✅ Bottom navigation em mobile, navbar responsiva
- ✅ Toasts, modais de confirmação, skeleton loading, empty/error states
- ✅ Microinterações: ripple, hover lift, sonar, shimmer, fadeSlideIn, scroll reveal
- ✅ Responsividade mobile-first (breakpoints 400/520/720/900/1200)
- ✅ Acessibilidade (WCAG 2.2): focus visible, aria-labels, contraste, teclado, HTML semântico
- ✅ Segurança: sanitização de strings, escape HTML, validação client+server, prevenção XSS

---

## 🌐 API REST

Base URL: `/api`

### Health
- `GET /health` — status do servidor

### Usuários e autenticação
- `POST /users/register` — cria usuário `{ name, email, password, university?, course? }`
- `POST /users/login` — autentica `{ email, password }` → `{ user, token }`
- `GET /users/me` — usuário autenticado (Bearer token)
- `GET /users/:id` — perfil público
- `PUT /users/:id` — atualiza perfil (dono, Bearer)
- `GET /users/:id/ads` — anúncios do usuário
- `GET /users/:id/favorites` — anúncios favoritos do usuário
- `POST /users/:id/favorites` — adiciona `{ adId }`
- `DELETE /users/:id/favorites/:adId` — remove

### Anúncios
- `GET /ads` — lista com filtros (`?search=`, `?category=`, `?type=sale|donation`, `?sortBy=recent|views|price-asc|price-desc`, `?limit=`)
- `GET /ads/:id` — detalhe (incrementa views)
- `POST /ads` — cria (Bearer)
- `PUT /ads/:id` — atualiza (dono, Bearer)
- `DELETE /ads/:id` — remove (dono, Bearer)

Autenticação por header:

```
Authorization: Bearer <userId>.<hash>
```

Todos os corpos e respostas são em **JSON** com o envelope `{ data, error }`.

---

## 🎨 Design System

Este projeto usa **exclusivamente** os tokens definidos em `design_system/design-system.html`:

- Cores: `--bg-deep #15296f`, `--bg-royal #1e3a8a`, `--bg-glow #3055d8`,
  `--accent #facc15`, `--accent-hi #fde047`, `--ink #fff`, `--muted #aab6da`,
  `--blue-100 #dbeafe`, glass fills e hairlines com transparência.
- Tipografia: **Inter** (300 a 800), escala 60/40/28/20/18/16/14/13.
- Componentes: `.btn-primary`, `.btn-ghost`, `.badge`, `.card`, `.tag`, `.form-input`,
  `.stat-card`, `.state`, `.spinner`, `.toast`, `.modal`, `.skeleton`.
- Animações: `fadeSlideIn`, `sonar`, `float`, `pulse-slow`, `shimmer`, `gradient`
  com o easing signature `cubic-bezier(.16,1,.3,1)`.

**Nenhuma cor, sombra, tipografia ou token novo foi introduzido.**

---

## ✅ Testes manuais

1. **Fluxo de cadastro**: `/pages/cadastro.html` — preencher, validar, ver toast de sucesso, ser redirecionado para dashboard.
2. **Fluxo de login**: `/pages/login.html` — logar com `demo@ecocampus.edu / demo1234`.
3. **Explorar**: dashboard mostra estatísticas dinâmicas, categorias populares, destaques (mais vistos) e recentes.
4. **Busca**: digitar "cálculo" → resultados filtrados via debounce.
5. **Filtro por tipo**: selecionar "Doação" no dropdown → só doações aparecem.
6. **Detalhe**: clicar em um card → detalhe abre, view incrementa, relacionados aparecem.
7. **Favoritar**: coração no card → toast + persistência.
8. **Criar anúncio**: `/pages/criar-anuncio.html` — preencher, alternar Doação/Venda, ver preview de imagem, publicar → redireciona para detalhe.
9. **Editar**: no seu anúncio, botão "Editar" → alterar título e salvar → toast + redirect.
10. **Excluir**: modal de confirmação → item some da lista.
11. **Favoritos**: `/pages/favoritos.html` — remover coração → card desaparece com animação.
12. **Perfil**: abas navegáveis via hash (`#meus-anuncios`, `#favoritos`, `#editar`) — editar nome atualiza navbar.
13. **Responsivo**: DevTools em 375px → bottom nav aparece, navbar links some, filtros empilham.
14. **404**: acessar qualquer URL inexistente → página 404 personalizada.
15. **Sem conexão**: parar o backend → toasts de erro aparecem.

---

## 🧠 Decisões arquiteturais

- **Clean Architecture no backend**: separação clara entre `domain` (regras puras), `application` (use-cases), `infrastructure` (persistência) e `presentation` (HTTP).
- **JSON File como persistência**: escolhido para deploy trivial e reprodutibilidade. Trocar por SQLite/Postgres é apenas implementar uma nova classe que estenda `IAdRepository` / `IUserRepository`.
- **Autenticação stateless simples**: token `<userId>.<hash>` com verificação server-side. Suficiente para o escopo acadêmico do projeto; para produção plena, recomendaria JWT + refresh tokens.
- **JS puro no frontend com ES Modules**: sem build step, sem transpiler. Cada página tem seu próprio entrypoint em `js/pages/`, que reutiliza módulos compartilhados (`api.js`, `auth.js`, `ui.js`, `app.js`).
- **Design System como fonte única de verdade visual**: todos os componentes seguem os tokens do `design-system.html` — nada foi inventado.

---

## 📜 Licença

Uso educacional. Feito com propósito circular.
