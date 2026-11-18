# MeuEstudos — Frontend

Aplicação React para organizar grupos de estudo, convites e tópicos, integrada à
API .NET **MeuEstudos**.

O fluxo cobre autenticação JWT, convites pendentes, criação e seleção de grupos,
lista de membros com status, convite por e-mail (somente o dono) e um checklist
interativo de tópicos de estudo.

## Stack

- React 19 (JavaScript puro, sem TypeScript)
- Vite 8
- Tailwind CSS v4
- axios
- lucide-react
- oxlint

## Funcionalidades

- **Autenticação:** login e cadastro com JWT, sessão persistida no `localStorage`.
- **Dashboard:** convites pendentes, meus grupos e criação rápida de grupo.
- **Detalhe do grupo:** título, descrição, dono e membros com status
  `Aceito`, `Pendente` ou `Recusado`.
- **Convite por e-mail:** exibido apenas para o dono; a API também bloqueia
  não-donos.
- **Rotina de estudos:** criação de tópicos com descrição e data prevista, e
  conclusão/desconclusão por qualquer membro aceito.
- **UX:** loading por ação, banners de erro/sucesso e layout responsivo.
- **Privacidade:** o dono vê todos os status; os demais membros veem apenas
  membros com convite aceito.

## Pré-requisitos

- Node.js 20+ e npm.
- .NET 10 SDK.
- PostgreSQL 16 (o repositório do backend traz um `docker-compose.yml`).
- O repositório do backend como pasta irmã:
  `../meu-estudos-backend`.

## 1. Subir o backend

```bash
cd ../meu-estudos-backend
docker compose up -d
dotnet run --project MeuEstudos.Api --launch-profile http
```

A API fica em `http://localhost:5123`. O banco é inicializado pelo `init.sql` na
primeira subida do container; para recriar do zero, use
`docker compose down -v && docker compose up -d`.

A configuração de desenvolvimento (conexão e JWT) está em
`MeuEstudos.Api/appsettings.Development.json`.

## 2. Subir o frontend

```bash
cd meu-estudo-frontend
npm install
cp .env.example .env   # opcional; o padrão já aponta para localhost:5123
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

> **Atenção:** se o caminho do projeto contiver `#` (por exemplo, `.../C#/...`),
> o servidor de desenvolvimento do Vite falha ao servir `/@vite/client` e a tela
> fica em branco. Nesse caso, mova/renomeie a pasta (ex.: `C#` → `CSharp`) ou
> use `npm start` (build + preview), que funciona no caminho atual.

## Variáveis de ambiente

| Variável | Padrão | Descrição |
|---|---|---|
| `VITE_API_URL` | `http://localhost:5123/api` | URL base da API |

Veja `.env.example`. Se o backend rodar em outra porta/host, ajuste a variável
**e** o CORS em `MeuEstudos.Api/Program.cs`.

## Scripts

| Comando | O que faz |
|---|---|
| `npm run dev` | Vite em modo desenvolvimento (HMR) |
| `npm start` | Build de produção + preview em `http://localhost:5173` |
| `npm run build` | Gera `dist/` |
| `npm run preview` | Serve `dist/` (porta padrão 4173; use `-- --port 5173` com a API) |
| `npm run lint` | oxlint |

## Estrutura

```text
src/
  components/          Componentes de UI do dashboard
    DashboardHeader.jsx
    ConvitesPendentes.jsx
    ListaGrupos.jsx
    FormNovoGrupo.jsx
    DetalheGrupo.jsx
    ListaTopicos.jsx
    StatusBadge.jsx
    FeedbackBanner.jsx
  context/
    AuthContext.jsx    Sessão global (usuario, token, login, registrar, logout)
  pages/
    AuthPage.jsx       Login e cadastro
    Dashboard.jsx      Orquestra grupos, convites e ações
  services/
    api.js             axios, URL base, Bearer, tratamento de 401
    authService.js     login/registrar
    grupoService.js    grupos, convites e tópicos
  styles/
    ui.js              Classes compartilhadas (campos, botões, cartões)
  utils/
    datas.js           Formatação de datas pt-BR
  App.jsx              AuthProvider + AuthPage/Dashboard
  main.jsx
  index.css
```

## Contrato da API

Todas as rotas exigem `Authorization: Bearer <token>`.

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/api/auth/login` | `{ email, senha }` → `{ token, usuario }` |
| `POST` | `/api/auth/registrar` | `{ nome, email, senha }` → `{ token, usuario }` |
| `GET` | `/api/grupos` | Grupos do usuário (dono ou membro aceito) |
| `POST` | `/api/grupos` | `{ titulo, descricao? }` |
| `GET` | `/api/grupos/convites` | Convites pendentes do usuário |
| `POST` | `/api/grupos/{id}/convites` | `{ email }` (somente dono) |
| `PATCH` | `/api/grupos/{id}/convites/responder` | `{ aceitar }` |
| `POST` | `/api/grupos/{id}/topicos` | `{ titulo, descricao?, dataPrevista? }` |
| `PATCH` | `/api/grupos/{id}/topicos/{topicoId}/concluir` | Alterna a conclusão |

Erros seguem `{ "erro": "mensagem" }`; a UI exibe essa mensagem nos banners.

## Sessão e permissões

- O JWT e o usuário ficam em `localStorage` (`token` e `usuario`).
- Respostas **401** limpam a sessão e recarregam a página.
- Um usuário sem sessão vê a tela de login/cadastro; com sessão, vê o dashboard.
- O dono é identificado por `donoId`; apenas ele vê o formulário de convite.
- `membros` contém os convidados; o dono aparece em `donoNome` e na linha
  "Dono:" do grupo.

## Limitações conhecidas

- Sem paginação, atualizações em tempo real, edição ou exclusão de grupos (a
  API não expõe essas operações).
- Sem suíte de testes automatizados no repositório; a validação de
  desenvolvimento foi feita com build, lint e fluxos E2E.
- `npm run dev` depende de um caminho sem `#` (veja a seção de HMR).

## Troubleshooting

- **Tela em branco no `npm run dev`:** caminho com `#`; use `npm start` ou
  renomeie a pasta.
- **Erro de CORS:** confirme que o frontend está em `http://localhost:5173` e a
  API em `http://localhost:5123` (ou ajuste o CORS no backend).
- **401 inesperado:** a sessão foi limpa; faça login novamente.
- **Banco indisponível:** verifique `docker compose ps` e a porta 5432.
