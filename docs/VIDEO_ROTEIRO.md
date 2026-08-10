# 🎥 Roteiro do vídeo de submissão — EcoCampus (Vortex 2026)

**Duração alvo**: 5:45 a 5:59 (nunca ultrapasse 6:00)
**Ferramenta recomendada**: [Loom](https://www.loom.com/) (grava tela + rosto + mic em uma tomada, gera URL pública instantânea).
Alternativa gratuita: OBS Studio + upload no YouTube não-listado.

---

## 🧪 Checklist ANTES de gravar (10 min)

### Preparo do ambiente
- [ ] **Feche tudo** exceto o essencial. Deixe abertas só:
  1. Chrome com **3 abas** já carregadas:
     - Aba 1: `https://ecocampu.netlify.app/` (landing em desktop)
     - Aba 2: `https://ecocampus-api-9b6m.onrender.com/api` (endpoints da API em JSON)
     - Aba 3: `https://github.com/NandoHeck/EcoCampus` (repo aberto no README)
  2. **VS Code** aberto na raiz do projeto, com estes arquivos em abas:
     - `index.html`
     - `backend/server.js`
     - `backend/src/createApp.js`
     - `backend/src/application/use-cases/ads/CreateAd.js`
     - `backend/src/infrastructure/persistence/SqliteAdRepository.js`
     - `sw.js`
     - `js/app.js`
     - `README.md` (na seção do Diário de Bordo)
  3. **Terminal** no VS Code com o backend rodando (`npm start` — ou pode confiar no Render).
- [ ] **Celular** com o site aberto (Chrome Android), pronto pra "Adicionar à tela inicial" ao vivo.
- [ ] Alternativa se não tiver celular: DevTools do Chrome no modo Device (Ctrl+Shift+M → iPhone 12 Pro).
- [ ] **Zoom do editor**: aumente pra ~140% (Ctrl + até ficar legível em 720p/1080p).

### Preparo do backend
- [ ] Acorde o Render **5 min antes** de gravar. Cole no navegador:
  `https://ecocampus-api-9b6m.onrender.com/api/health`
  Se demorar 30s, é o cold start. Espere retornar `{"status":"ok"}`. Se necessário, acesse a landing e faça login pra "esquentar".
- [ ] **Login demo funcionando**: teste `demo@ecocampus.edu` / `demo1234` na landing.

### Preparo pessoal
- [ ] Água ao lado.
- [ ] Câmera limpa, luz iluminando o rosto de frente.
- [ ] Faça **1 gravação de teste de 30s** pra checar áudio e enquadramento.
- [ ] Grave em **1080p** se possível (Loom permite se você é logado).

### Ensaio
- [ ] Ensaie o pitch (0:00-1:00) **em voz alta 2 vezes** antes de gravar. É a parte mais decorada.
- [ ] Ensaie a transição VS Code → Demo → Explicação. As trocas de tela são o momento mais fácil de perder tempo.

---

## 📜 ROTEIRO CRONOMETRADO

> ⏱️ Legenda: **[tela]** = o que aparece na tela · **[fala]** = o que você fala · **[ação]** = o que fazer

---

### 🟢 BLOCO 1 — Pitch e Visão Geral (0:00 → 1:00) · 1 minuto

**[0:00-0:10] — Abertura**

[tela] Sua câmera em foco (rosto), fundo neutro.

[fala] _"Olá! Sou o Nando, estudante e desenvolvedor, e este é o EcoCampus — meu projeto para o Processo Seletivo Vortex 2026."_

**[0:10-0:35] — Problema + solução (25s)**

[tela] Transição pro Chrome, aba 1 (`https://ecocampu.netlify.app`). Landing page à mostra.

[fala] _"O EcoCampus é um marketplace de economia circular universitária. A ideia veio de um problema real: todo semestre, milhares de estudantes descartam livros, apostilas, jalecos e equipamentos que ainda têm vida útil, enquanto calouros gastam caro pra comprar essas mesmas coisas novas."_

[ação] Deslize a landing suavemente enquanto fala (mostrando hero, categorias, depoimentos).

[fala continuando] _"A plataforma conecta estudantes que querem vender, comprar ou doar materiais acadêmicos dentro do próprio campus. Menos desperdício, mais circulação, mais economia."_

**[0:35-0:55] — Diferenciais técnicos (20s)**

[fala] _"Tecnicamente, é uma aplicação web instalável como PWA, feita em HTML, CSS e JavaScript puros no frontend, com backend Node/Express seguindo Clean Architecture, persistência SQLite e 41 testes automatizados. Está publicada em Netlify e Render."_

**[0:55-1:00] — Ponte pra demo**

[fala] _"Vou mostrar funcionando agora."_

---

### 🟡 BLOCO 2 — Demonstração Prática (1:00 → 3:00) · 2 minutos

**[1:00-1:20] — Landing e navegação (20s)**

[tela] Landing em desktop.

[ação] Scroll suave pela landing: hero → como funciona → categorias → depoimentos → CTA.

[fala] _"Landing page persuasiva, totalmente responsiva. Hero, benefícios, passo-a-passo, categorias, depoimentos reais, FAQ e CTA final."_

[ação] Clique em **"Começar agora"** → vai pro cadastro.

**[1:20-1:40] — Login com demo (20s)**

[ação] No cadastro, clique em "Entre agora" → vai pro login.

[fala] _"Vou usar uma conta demo criada pelo seed automático."_

[ação] Digite: `demo@ecocampus.edu` / `demo1234`. Login → dashboard aparece.

[fala] _"Dashboard com estatísticas em tempo real, categorias populares, anúncios em destaque e recentes."_

**[1:40-2:15] — CRUD real: criar anúncio (35s)**

[ação] Clique em **"Anunciar item"** (botão amarelo topo).

[fala] _"Vou criar um anúncio real ao vivo."_

[ação] Preencha rápido:
- Tipo: **Venda**
- Título: `Livro de Física - Halliday`
- Categoria: **Livros**
- Preço: `40`
- URL da imagem: cole `https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=800`
- Descrição: `Volume 2, ótimo estado, usado 1 semestre.`

[fala enquanto preenche] _"Validação em tempo real, contador de caracteres, preview da imagem, alternância entre venda e doação que ajusta o preço automaticamente."_

[ação] Clique **Publicar** → toast de sucesso → redireciona pra tela do anúncio.

[fala] _"Publicou, incrementou views, aparece na listagem."_

**[2:15-2:40] — Mobile + PWA install (25s)**

[ação] **Opção A — celular real**: pegue o celular, mostre `ecocampu.netlify.app` no Chrome Android. Menu ⋮ → **"Instalar app"** ou **"Adicionar à tela inicial"**.

[ação] **Opção B — DevTools**: Ctrl+Shift+M → escolha **iPhone 12 Pro** → recarregue. Mostre a bottom-nav aparecer.

[fala] _"No mobile temos bottom navigation nativa. O ícone de instalar aparece na barra do Chrome — instalando, o app vai pra tela inicial com ícone próprio e abre em standalone, sem barra de endereço, igual app nativo."_

[ação] Se conseguiu instalar: mostre o ícone azul/amarelo na home do celular, abra o app instalado, mostre rodando standalone.

**[2:40-2:55] — Offline test (15s)**

[ação] Volte pro Chrome desktop → **DevTools → Network → marque "Offline"** → recarregue a landing.

[fala] _"Testando offline: o Service Worker cacheou a shell, então mesmo sem internet a página continua funcionando. Se eu tentar acessar uma página nunca visitada, cai numa página de offline personalizada."_

**[2:55-3:00] — Ponte pro código**

[fala] _"Agora vou pro código pra explicar como isso funciona."_

---

### 🔵 BLOCO 3 — Explicação Técnica do Código (3:00 → 5:00) · 2 minutos

⚠️ **Este é o bloco mais denso.** Não tente explicar tudo — foco em 3 coisas: **estrutura**, **1 rota do backend**, **service worker**.

**[3:00-3:20] — Estrutura do projeto (20s)**

[tela] VS Code aberto, painel lateral mostrando as pastas.

[fala] _"A estrutura separa frontend na raiz, backend numa pasta própria e Clean Architecture dentro do backend."_

[ação] Expanda `backend/src/`:
- Clique rápido em `domain/` — "entidades e interfaces de repositório"
- `application/use-cases/` — "regras de aplicação"
- `infrastructure/persistence/` — "SQLite e JSON, ambos implementando as mesmas interfaces"
- `presentation/` — "routes, controllers e middlewares HTTP"

[fala] _"Essa separação me permitiu adicionar SQLite depois sem tocar em nenhuma regra de negócio — só criei dois arquivos novos implementando as interfaces existentes."_

**[3:20-3:55] — Trace de uma rota (35s)**

[ação] Abra **`backend/src/presentation/routes/adRoutes.js`**.

[fala] _"Aqui defino que POST em /api/ads exige autenticação e chama o controller."_

[ação] Ctrl+Click em `adController.create` → abre **`AdController.js`**.

[fala] _"O controller só valida o input HTTP, chama o use case e devolve resposta."_

[ação] Ctrl+Click em `this.createAd.execute` → abre **`CreateAd.js`**.

[fala] _"O use case tem toda a regra: valida os campos com meus helpers, checa se o tipo é doação para forçar preço zero, e chama o repository."_

[ação] Ctrl+Click em `this.adRepository.create` → abre **`SqliteAdRepository.js`**.

[fala] _"O repository executa o SQL usando prepared statements do better-sqlite3 — o que previne SQL injection nativamente."_

**[3:55-4:45] — Service Worker (50s) — o trecho que impressiona**

[ação] Abra **`sw.js`** na raiz.

[fala] _"O Service Worker tem 4 estratégias de cache diferentes por tipo de recurso, e uma regra crítica: mutações nunca são cacheadas."_

[ação] Vá até a linha do `if (request.method !== 'GET') return;` (perto do `fetch` handler).

[fala] _"Aqui: qualquer POST, PUT ou DELETE passa direto, sem interceptação. Isso garante que criar ou apagar anúncios sempre vai pro servidor."_

[ação] Role até o `handleShell` (cache-first).

[fala] _"O app shell — CSS, JS, ícones — usa cache-first: se está em cache, serve imediato; senão, busca da rede e guarda pra próxima. Isso deixa o app abrindo instantâneo em revisitas."_

[ação] Role até o `handleApi` (network-first).

[fala] _"A API usa network-first: tenta rede primeiro pra ter dados frescos, mas se cair, serve o que estiver em cache. Por isso os anúncios já vistos continuam disponíveis offline."_

[ação] Role até o `handleNavigation` (com offline.html fallback).

[fala] _"E se o usuário tenta acessar uma página nunca visitada sem conexão, cai no offline.html — que auto-recarrega quando a conexão volta."_

**[4:45-5:00] — Testes rodando (15s)**

[ação] Terminal no VS Code → digite `npm test` → mostre saída.

[fala] _"41 testes automatizados de integração — cobrem CRUD, autenticação, autorização, favoritos e validações — todos passando em 600ms, sem dependência externa nenhuma, só node --test built-in."_

---

### 🟣 BLOCO 4 — Uso Prático de IA (5:00 → 6:00) · 1 minuto

**[5:00-5:15] — Introdução ao Diário (15s)**

[tela] VS Code com `README.md` aberto, rolando até a seção **"🤖 Diário de Bordo da IA"**.

[fala] _"Documentei todo o uso de IA num Diário de Bordo dentro do README. Usei Claude Code como ferramenta principal, e minha regra foi: nunca aceitar código sem entender."_

**[5:15-5:40] — Prompt marcante (25s)**

[ação] Role até "Prompt 3 — Auditoria técnica pré-implementação".

[fala] _"O prompt mais importante que fiz foi este: uma auditoria técnica ANTES de implementar. Pedi que a IA classificasse cada requisito da banca, identificasse gaps, comparasse 3 stacks alternativas e me desse um plano de execução por fases. Só comecei a codar depois de aprovar o plano — isso evitou retrabalho enorme."_

**[5:40-5:55] — Caso de erro da IA (15s)**

[ação] Role até "Momentos em que a IA errou → Caso 2 — Fallback de avatar gerando fotos aleatórias".

[fala] _"E aqui um caso onde a IA errou: gerou avatares aleatórios como default do perfil, inclusive com fotos de gêneros errados. Só percebi usando o próprio produto — a Júlia dos depoimentos era um homem. Refatorei pra placeholder de bonequinho estilo WhatsApp e troquei as fotos fixas dos depoimentos por endpoints determinísticos que respeitam gênero."_

**[5:55-6:00] — Fechamento**

[fala] _"Obrigado pela avaliação. Código no GitHub, app no Netlify, links na descrição."_

**[CORTE em 5:59 no máximo]**

---

## 🛑 O que NÃO fazer

- ❌ Ler texto no monitor em silêncio. Cada segundo em silêncio é um segundo perdido.
- ❌ Explicar TUDO. Escolha 3 coisas e explique bem.
- ❌ Passar do minuto 6:00. O edital diz "estrita". Perde-se pontos.
- ❌ Mostrar erros na tela ("ai desculpa, deixa eu abrir"). Ensaie transições.
- ❌ Ficar com aba do Facebook/WhatsApp aparecendo. Feche tudo antes.
- ❌ Falar "acho que", "não sei bem". Seja assertivo — se errar, corrija na hora ("na verdade é X").

---

## 🎯 Perguntas que a banca PODE fazer (se assistir múltiplas vezes)

**Sobre arquitetura**
- "Por que HTML puro e não React?"
  > _Aceito pelo requisito. Sem build step, código transparente, mais fácil de defender em entrevista, e evita bônus caro (TypeScript) em troca de bônus mais rentáveis como PWA offline e testes._

- "Por que Clean Architecture num projeto pequeno?"
  > _Facilita troca de infra. Foi exatamente o caso: comecei com persistência JSON, depois adicionei SQLite. Zero mudança em domínio ou aplicação — só criei 2 arquivos novos implementando as interfaces._

**Sobre segurança**
- "Por que token custom em vez de JWT?"
  > _O requisito aceita "auth básica ou separação por IDs". Meu token é `<userId>.<hash>` com verificação server-side. Suficiente para o escopo, sem dependência de biblioteca. Para produção real, JWT + refresh seria melhor._

- "Por que SHA-256 e não bcrypt?"
  > _Simplicidade. SHA-256 + salt server-side é aceitável para o escopo. Para produção com senhas de usuários reais, bcrypt/argon2 é o padrão. Está documentado no README como decisão consciente._

**Sobre PWA**
- "O que acontece se eu criar um anúncio offline?"
  > _Falha com toast de erro. Não implementei background sync porque escaparia do escopo. Anúncios só são criáveis online — mas listagem de anúncios já vistos continua funcionando offline via cache do SW._

- "Como o SW se atualiza?"
  > _No `install`, um novo SW fica em `waiting`. O `js/app.js` detecta via `updatefound` e mostra um toast "Nova versão disponível → Atualizar". Ao clicar, envia `postMessage SKIP_WAITING`, o SW ativa e a página recarrega automaticamente via `controllerchange`._

**Sobre testes**
- "Como isolou os testes?"
  > _Cada suite cria um Express em porta aleatória com banco JSON temporário em `os.tmpdir()`. Rate-limit desligado. Cleanup do arquivo no `afterAll`. Nenhum teste compartilha estado com outro._

---

## 🆘 Plano B se algo der errado durante a gravação

- **Se o Render estiver dormindo e cold start atrasar**: abra o site na frente e diga _"Como esperado no plano free do Render, a primeira request após 15min de inatividade tem um cold start — está documentado no README"_. Passa naturalidade.
- **Se travar em algum lugar**: pause 1 segundo, respire, corte pra frente. Loom permite regravar apenas o trecho.
- **Se ultrapassar 6:00 na gravação**: EDITE. Corte partes menos essenciais. Ferramentas: Loom (edição básica gratuita), CapCut, DaVinci Resolve.

---

## 📤 Upload

**Recomendação**: **Loom** — é o padrão de mercado para vídeos técnicos, gera URL pública em 1 clique, thumbnail com sua cara, e a banca pode ver o tempo total antes de assistir.

**Alternativas**:
- **YouTube não-listado** — melhor qualidade, mas pede setup de canal.
- **Google Drive** — funciona mas UX ruim (autoplay estranho, thumbnail feia).
- **Vimeo grátis** — bom, mas tem limite mensal de upload.

Depois de subir, cole o link na descrição do formulário de submissão.

---

## ✅ Checklist final antes de submeter o vídeo

- [ ] Duração ≤ 6:00 (idealmente 5:45-5:59)
- [ ] Áudio audível (não mudo, não abafado)
- [ ] Todos os 4 blocos presentes e cronometrados
- [ ] Site em produção funcionando durante toda a gravação
- [ ] Link do vídeo é público (teste em janela anônima)
- [ ] Link do vídeo colado no formulário de submissão
- [ ] README.md atualizado com links de produção
- [ ] Repo público no GitHub
