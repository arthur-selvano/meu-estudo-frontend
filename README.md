# MeuEstudo — Frontend

Aplicação web (SPA) para organizar grupos de estudo: quadros Kanban colaborativos,
convites por e-mail, rotina de tópicos, perfis públicos e atualizações em tempo real.

Este repositório contém apenas o frontend. A API é o projeto .NET **MeuEstudo**,
mantido no repositório irmão `../meu-estudo-backend`.

## Sumário

- [Sobre o projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Stack](#stack)
- [Arquitetura](#arquitetura)
- [Pré-requisitos](#pré-requisitos)
- [Como rodar](#como-rodar)
- [Variáveis de ambiente](#variáveis-de-ambiente)
- [Scripts](#scripts)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Contrato da API](#contrato-da-api)
- [Modelo de dados](#modelo-de-dados)
- [Sessão, permissões e regras](#sessão-permissões-e-regras)
- [Testes](#testes)
- [Limitações conhecidas](#limitações-conhecidas)
- [Problemas comuns](#problemas-comuns)

## Sobre o projeto

O MeuEstudo ajuda estudantes a organizar o que precisam estudar e a dividir
trabalhos em grupo. Cada usuário pode criar quadros de dois tipos:

- **Organização pessoal** (`PESSOAL`): rotinas e tarefas próprias, sem convites
  nem atribuição de responsáveis.
- **Trabalho escolar/universitário** (`TRABALHO_ACADEMICO`): quadro
  compartilhado com membros convidados, divisão de responsabilidades e status
  de cada convite.

O fluxo principal é: entrar ou criar conta → ver convites pendentes e quadros →
criar um quadro → adicionar cards nas colunas → mover cards, definir
responsáveis e acompanhar prazos. Tudo em português e com layout responsivo.

## Funcionalidades

### Autenticação e sessão

- Login e cadastro com JWT.
- Sessão persistida no `localStorage` (`token` e `usuario`).
- Logout pelo cabeçalho; respostas `401` limpam a sessão automaticamente.

### Dashboard

- Convites pendentes com ações de aceitar ou recusar.
- Lista de quadros do usuário e seleção do quadro ativo.
- Criação de quadro com título, descrição e tipo.
- Estados de carregamento por ação e banners de sucesso/erro.

### Quadro Kanban

- Colunas vindas da API (`A Fazer`, `Em Andamento`, `Revisão` e `Concluído`
  nos quadros padrão), com fallback visual quando a API não as devolve.
- Criação de cards com título, descrição, data prevista, prioridade
  (`Baixa`, `Média`, `Alta`) e, em quadros acadêmicos, responsável.
- Movimentação por **drag-and-drop** e também por um seletor
  **"Mover para…"**, que serve de alternativa em telas touch e para navegação
  por teclado.
- Prazos vencidos destacados (exceto na coluna final); cards na última coluna
  aparecem como concluídos.
- Atualizações otimistas ao mover um card ou trocar o responsável, com
  reversão automática em caso de erro na API.

### Convites e membros

- Convite por e-mail, disponível apenas para o dono de quadros acadêmicos.
- A pessoa convidada aceita ou recusa o convite pelo dashboard.
- Status possíveis: `Aceito`, `Pendente` e `Recusado`.
- O dono vê todos os status; os demais membros veem apenas convidados que já
  aceitaram.
- O dono e os membros aceitos aparecem como possíveis responsáveis pelos cards.

### Perfil

- Edição de nome, bio, curso/área e instituição.
- Upload de foto (JPEG, PNG ou WebP, até 2 MB) com atualização imediata do
  avatar no cabeçalho.
- Tópicos **"Quero estudar"** e **"Posso ajudar"**: catálogo sugerido com
  possibilidade de texto livre, até 10 tópicos por lista e 40 caracteres por
  tópico.
- Perfil público acessível pelos nomes do dono e dos membros, sem expor e-mail.

### Tempo real

- Conexão com o hub SignalR `/hubs/quadro` usando o JWT da sessão.
- O evento `TopicoAtualizado` mantém o quadro sincronizado entre os membros.
- Falhas de conexão são silenciosas: as ações normais continuam funcionando.
- Reconexão automática com nova carga dos dados para recuperar eventos perdidos.

### Experiência de uso e acessibilidade

- Layout mobile-first e responsivo.
- Navbar superior com atalhos "Quadros" e "Convites" (badge de pendentes),
  ação rápida "Novo quadro" e menu do usuário (perfil e sair).
- Tema claro/escuro com persistência: a primeira visita segue o sistema e a
  escolha do usuário passa a valer nas próximas cargas, sem flash de tema.
- Toasts para o feedback de ações (criar quadro, convidar, mover card, salvar
  perfil etc.), com fechamento automático e manual; erros de formulário,
  login e carregamento continuam em banners inline.
- Modais baseados no `<dialog>` nativo (foco preso, `Esc` e restauração de foco).
- Rótulos ARIA, áreas `sr-only` e foco visível nos controles principais.
- Datas formatadas em pt-BR, sem deslocamento de fuso em campos `DateOnly`.
- A paleta é definida por tokens semânticos em `src/index.css`, com variantes
  clara (padrão) e escura (`.dark`).

## Stack

| Camada       | Tecnologia                          |
| ------------ | ----------------------------------- |
| UI           | React 19 (JavaScript, sem TypeScript) |
| Build        | Vite 8                              |
| Estilos      | Tailwind CSS 4 (`@tailwindcss/vite`) |
| HTTP         | axios                               |
| Tempo real   | `@microsoft/signalr`                |
| Ícones       | lucide-react                        |
| Lint         | oxlint                              |
| Testes       | runner nativo do Node (`node:test`) |

## Arquitetura

```text
App
└── ThemeProvider             tema claro/escuro (classe `dark` no <html>)
    └── ToastProvider         fila de toasts e viewport
        └── AuthProvider      sessão global (usuario, token, login, logout)
            └── AuthPage      login e cadastro, quando não há sessão
            └── Dashboard     navbar, convites, lista de quadros e quadro ativo
                ├── Navbar    atalhos, ação rápida, tema e menu do usuário
                ├── DetalheGrupo      membros, convite e formulário de card
                │   └── QuadroKanban  colunas, cards, drag-and-drop e responsáveis
                ├── PerfilEdicaoModal
                └── PerfilPublicoModal
```

Diretrizes do código:

- **`src/services/`** é a única camada que conhece rotas e formatos da API.
  Componentes e páginas consomem funções desse diretório, nunca `axios` direto.
- **`src/context/AuthContext.jsx`** centraliza a sessão e é a fonte de verdade
  para `usuario` e `token`.
- **`src/context/ThemeContext.jsx`** resolve o tema salvo ou do sistema e é a
  única fonte de verdade para claro/escuro. **`src/context/ToastContext.jsx`**
  concentra o feedback de ações.
- **`src/index.css`** é a única fonte de cores: tokens semânticos em `:root` e
  `.dark`, expostos ao Tailwind com `@theme inline`. Componentes não usam hex.
- **`src/utils/`** contém funções puras (datas, prioridades, tópicos, regras do
  quadro). É a parte coberta por testes automatizados.
- **`src/styles/ui.js`** reúne as classes Tailwind compartilhadas de campos,
  botões e cartões.

## Pré-requisitos

- Node.js 20+ e npm.
- .NET 10 SDK (para o backend).
- PostgreSQL 16 ou Docker com Compose (o backend traz um `docker-compose.yml`).
- O repositório do backend como pasta irmã: `../meu-estudo-backend`.

## Como rodar

### 1. Subir o backend

```bash
cd ../meu-estudo-backend
docker compose up -d
dotnet run --project MeuEstudo.Api --launch-profile http
```

A API fica em `http://localhost:5123`. O banco é inicializado pelo `init.sql` na
primeira subida do container; para recriar do zero, use:

```bash
docker compose down -v && docker compose up -d
```

A configuração de desenvolvimento (conexão e JWT) fica em
`MeuEstudo.Api/appsettings.Development.json`.

### 2. Subir o frontend

```bash
cd meu-estudo-frontend
npm install
cp .env.example .env   # opcional: o padrão já aponta para localhost:5123
npm start
```

Abra `http://localhost:5173`.

`npm start` executa `vite build` e serve o resultado com `vite preview` na porta
**5173**. Essa porta é obrigatória porque o CORS da API libera apenas
`http://localhost:5173`.

### Modo desenvolvimento (HMR)

```bash
npm run dev
```

O Vite sobe em `http://localhost:5173` com recarregamento a quente.

> **Atenção:** se o caminho do projeto contiver `#` (por exemplo, `.../C#/...`),
> o servidor de desenvolvimento do Vite falha ao servir `/@vite/client` e a tela
> fica em branco. Nesse caso, mova/renomeie a pasta (ex.: `C#` → `CSharp`) ou
> use `npm start` (build + preview), que funciona no caminho atual.

## Variáveis de ambiente

| Variável          | Padrão                      | Descrição            |
| ----------------- | --------------------------- | -------------------- |
| `VITE_API_URL`    | `http://localhost:5123/api` | URL base da API      |

Use o arquivo `.env.example` como referência. Se o backend rodar em outra
porta/host, ajuste a variável **e** o CORS em `MeuEstudo.Api/Program.cs`.

## Scripts

| Comando           | O que faz                                                        |
| ----------------- | ---------------------------------------------------------------- |
| `npm run dev`     | Vite em modo desenvolvimento (HMR) em `http://localhost:5173`    |
| `npm start`       | Build de produção + preview em `http://localhost:5173`            |
| `npm run build`   | Gera a build em `dist/`                                          |
| `npm run preview` | Serve `dist/` (porta padrão 4173; use `-- --port 5173` com a API) |
| `npm test`        | Executa os testes com `node --test src/utils/*.test.js`          |
| `npm run lint`    | Executa o oxlint                                                 |

## Estrutura do projeto

```text
src/
├── components/
│   ├── Avatar.jsx               Foto ou iniciais do usuário
│   ├── BotaoTema.jsx            Alternância claro/escuro
│   ├── ConvitesPendentes.jsx    Convites com aceitar/recusar
│   ├── DetalheGrupo.jsx         Dados do grupo, membros, convite e novo card
│   ├── FeedbackBanner.jsx       Banners inline de erro/sucesso
│   ├── FormNovoGrupo.jsx        Criação de quadro com escolha do tipo
│   ├── ListaGrupos.jsx          Lista lateral de quadros
│   ├── Modal.jsx                Modal acessível sobre <dialog>
│   ├── Navbar.jsx               Navegação, ação rápida e menu do usuário
│   ├── PerfilEdicaoModal.jsx    Edição do próprio perfil e foto
│   ├── PerfilPublicoModal.jsx   Visualização de perfil público
│   ├── PrioridadeBadge.jsx      Selo de prioridade do card
│   ├── QuadroKanban.jsx         Colunas, cards, DnD e seletores
│   ├── SeletorTopicos.jsx       Chips de tópicos com validação
│   ├── StatusBadge.jsx          Selo de status de convite
│   └── ToastViewport.jsx        Toasts de feedback de ações
├── context/
│   ├── AuthContext.jsx          Sessão global e persistência no localStorage
│   ├── ThemeContext.jsx         Tema claro/escuro e persistência
│   └── ToastContext.jsx         Fila e API de toasts
├── pages/
│   ├── AuthPage.jsx             Login e cadastro
│   └── Dashboard.jsx            Orquestra dados, ações e tempo real
├── services/
│   ├── api.js                   axios, URL base, Bearer e tratamento de 401
│   ├── authService.js           Login e cadastro
│   ├── grupoService.js          Grupos, convites, cards, mover e responsável
│   ├── perfilService.js         Perfil, perfil público e upload de foto
│   └── realtimeService.js       Conexão SignalR com o hub do quadro
├── styles/
│   └── ui.js                    Classes Tailwind compartilhadas (tokens)
├── utils/
│   ├── datas.js                 Formatação e comparação de datas pt-BR
│   ├── imagem.js                Resolve URLs relativas de imagem da API
│   ├── prioridades.js           Catálogo e estilos de prioridade
│   ├── quadro.js                Regras de colunas, ordem, participantes e merge
│   ├── quadro.test.js           Testes das regras do quadro
│   ├── tema.js                  Resolução de tema salvo/sistema
│   ├── tema.test.js             Testes das regras de tema
│   ├── toasts.js                Fila e duração de toasts
│   ├── toasts.test.js           Testes da fila de toasts
│   └── topicos.js               Catálogo e validação de tópicos
├── App.jsx                      AuthProvider + AuthPage/Dashboard
├── index.css                    Tokens de cor (claro/escuro) e entrada do Tailwind
└── main.jsx                     Bootstrap do React
```

## Contrato da API

Todas as rotas abaixo são relativas a `VITE_API_URL` e exigem
`Authorization: Bearer <token>`.

### Autenticação

| Método | Rota                   | Corpo                    | Resposta            |
| ------ | ---------------------- | ------------------------ | ------------------- |
| `POST` | `/auth/login`          | `{ email, senha }`       | `{ token, usuario }` |
| `POST` | `/auth/registrar`      | `{ nome, email, senha }` | `{ token, usuario }` |

### Grupos, convites e cards

| Método  | Rota                                      | Descrição                                        |
| ------- | ----------------------------------------- | ------------------------------------------------ |
| `GET`   | `/grupos`                                 | Quadros do usuário (dono ou membro aceito)       |
| `POST`  | `/grupos`                                 | `{ titulo, descricao?, tipo? }`                  |
| `GET`   | `/grupos/convites`                        | Convites pendentes do usuário                    |
| `POST`  | `/grupos/{grupoId}/convites`              | `{ email }` (somente o dono)                     |
| `PATCH` | `/grupos/{grupoId}/convites/responder`    | `{ aceitar }`                                    |
| `POST`  | `/grupos/{grupoId}/topicos`               | `{ titulo, colunaId, descricao?, dataPrevista?, prioridade?, responsavelId? }` |
| `PATCH` | `/topicos/{topicoId}/mover`               | `{ colunaId, ordem }`                            |
| `PATCH` | `/topicos/{topicoId}/responsavel`         | `{ responsavelId }` ou `{ responsavelId: null }` |

### Perfis

| Método | Rota                          | Descrição                                              |
| ------ | ----------------------------- | ------------------------------------------------------ |
| `GET`  | `/users/me/profile`           | Perfil completo do usuário autenticado                 |
| `PUT`  | `/users/me/profile`           | Atualiza nome, bio, curso/área, instituição e tópicos  |
| `POST` | `/users/me/profile/foto`      | Upload `multipart/form-data` no campo `foto`           |
| `GET`  | `/users/{usuarioId}/profile`  | Perfil público (sem e-mail)                            |

### Tempo real

| Recurso              | Descrição                                                         |
| -------------------- | ----------------------------------------------------------------- |
| Hub `/hubs/quadro`   | Conexão SignalR autenticada pelo token do `localStorage`          |
| `TopicoAtualizado`   | Evento com `{ grupoId, topico }`, aplicado ao estado do quadro     |

O hub fica na origem da API, sem o sufixo `/api`: com
`VITE_API_URL=http://localhost:5123/api`, a conexão vai para
`http://localhost:5123/hubs/quadro`.

### Formato de erro

Erros seguem `{ "erro": "mensagem" }`. A UI usa `mensagemDeErro` para exibir
essa mensagem nos banners.

## Modelo de dados

**GrupoEstudo**

| Campo       | Tipo                                  | Observação                    |
| ----------- | ------------------------------------- | ----------------------------- |
| `id`        | string                                |                               |
| `titulo`    | string                                |                               |
| `descricao` | string \| null                        |                               |
| `tipo`      | `PESSOAL` \| `TRABALHO_ACADEMICO`     | Quadros antigos podem omitir  |
| `donoId`    | string                                |                               |
| `donoNome`  | string                                |                               |
| `colunas`   | `ColunaKanban[]`                      | IDs reais usados pela API     |
| `membros`   | `MembroGrupo[]`                       |                               |
| `topicos`   | `TopicoEstudo[]`                      | Cards do quadro               |

**ColunaKanban:** `{ id, titulo, ordem }`

**MembroGrupo:** `{ usuarioId, nome, status }`, com
`status ∈ { Pendente, Aceito, Recusado }`.

**TopicoEstudo:** `{ id, titulo, descricao, dataPrevista, prioridade,
colunaId, ordem, responsavelId, responsavelNome, responsavelFotoUrl,
concluido, criadoPorId, criadoEm }`, com
`prioridade ∈ { BAIXA, MEDIA, ALTA }`.

**ConvitePendente:** `{ grupoId, grupoTitulo, donoId, donoNome, convidadoEm }`

**Perfil:** `{ id, nome, fotoUrl, bio, cursoOuArea, instituicao,
topicosInteresse, topicosAjuda, criadoEm }`.

## Sessão, permissões e regras

- O JWT e o usuário ficam em `localStorage` nas chaves `token` e `usuario`.
- O tema fica em `localStorage` na chave `tema`, com valores `claro` e `escuro`.
  Sem escolha salva (ou com valor inválido), o tema segue
  `prefers-color-scheme`; uma escolha explícita passa a prevalecer.
- Respostas `401` limpam a sessão e recarregam a página.
- Sem sessão, o app mostra a tela de login/cadastro; com sessão, o dashboard.
- O dono é identificado por `donoId`. Apenas ele vê o formulário de convite.
- Quadros pessoais não exibem convites nem atribuição de responsáveis.
- O dono aparece em `donoNome`, separado da lista `membros`.
- Ao mover um card ou trocar o responsável, a UI aplica a mudança de imediato e
  desfaz se a API retornar erro.
- Eventos em tempo real e respostas HTTP usam o mesmo *upsert* idempotente por
  `id`, então a ordem de chegada não duplica cards.

## Testes

```bash
npm test
```

Os testes usam o runner nativo do Node e cobrem as regras puras de
`src/utils/quadro.js` (normalização e ordenação de colunas, coluna inicial e
selecionada, agrupamento de cards, cálculo de ordem ao mover, participantes de
um quadro e aplicação de eventos em tempo real, incluindo idempotência),
`src/utils/tema.js` (preferência salva, sistema e valor inválido) e
`src/utils/toasts.js` (fila de no máximo 3 e remoção).

Não há testes de componentes no momento; a build e o lint também servem de
verificação:

```bash
npm run build
npm run lint
```

## Limitações conhecidas

- Sem paginação ou carregamento incremental de quadros e cards.
- Edição e exclusão de quadros e cards não estão implementadas no frontend.
- O tempo real cobre apenas atualizações de cards (`TopicoAtualizado`).
- O drag-and-drop usa a API nativa de HTML5; em dispositivos touch, use o
  seletor **"Mover para…"** de cada card.
- Os testes automatizados cobrem as funções de `src/utils/quadro.js`,
  `src/utils/tema.js` e `src/utils/toasts.js`; não há testes de componentes.
- `npm run dev` depende de um caminho de projeto sem `#` (veja a seção de HMR).

## Problemas comuns

- **Tela em branco no `npm run dev`:** caminho com `#`; use `npm start` ou
  renomeie a pasta.
- **Erro de CORS:** confirme o frontend em `http://localhost:5173` e a API em
  `http://localhost:5123`, ou ajuste o CORS no backend.
- **401 inesperado:** a sessão foi limpa; faça login novamente.
- **Banco indisponível:** verifique `docker compose ps` e a porta 5432.
- **Quadro não atualiza em tempo real:** confirme se o hub `/hubs/quadro` está
  acessível e se o token é válido. A falha é silenciosa por projeto; mover cards
  e recarregar a página continuam funcionando.
- **Falha ao enviar foto:** use JPEG, PNG ou WebP com até 2 MB.
