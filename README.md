# JOTT — Sistema de Gerenciamento de Conteúdo Pessoal Dinâmico

Aplicação **front‑end (HTML/CSS/JS)** para organizar **notas** por **projeto**, com **usuários**, **categorias/tags**, **busca e filtros**, visualização em **Lista** e **Quadro (Kanban)** com **drag & drop**, e **persistência em `localStorage`**.

> **Disciplina:** Desenvolvedor Front-End — Prof. MSc. Reinaldo de Souza Júnior  
> **Entrega no AVA:** enviar um **.txt** com a **URL do GitHub** e os **nomes completos** dos integrantes.  
> **Este README** segue estritamente a estrutura e os pontos pedidos no PDF.

---

## 1) Requisitos

### Requisitos funcionais mínimos
- **CRUD de Usuários**: adicionar/remover no modal **“Gerenciar Usuários”**; indicação do **Usuário Atual** (badge).
- **CRUD de Projetos**: criar/editar/excluir; **escolha do responsável** (usuário) no cadastro/edição; listagens exibem **nome e avatar** do responsável.
- **CRUD de Conteúdo (Notas)**: **Nova nota / Abrir (visualizar/editar) / Excluir**. Campos: **título, conteúdo, categoria, responsável, prioridade, data**.
- **Categorias/Tags**: por **projeto** (criar/remover no sidebar). Cada nota pode ter **1 categoria**; categorias exibidas como **chips**.
- **Busca e Filtros**: busca por **texto** (título+conteúdo); filtros por **Categoria**, **Status** (*A fazer*, *Em progresso*, *Concluída*) e **Responsável** (*Todos* / *Só eu* / usuário).
- **Duas visualizações**: **Lista** e **Quadro (Kanban)**; **drag & drop** entre colunas com persistência do **status**.

### Requisitos não funcionais
- **Usabilidade/UX**: interface limpa; componentes consistentes (cards, chips, modais); **avatares com fundo neutro**; feedback por **toasts**.
- **Responsividade**: CSS com grid/flex + breakpoints.
- **Manutenibilidade**: código **modular** (ES Modules) em três camadas (**store**, **ui**, **app**).
- **Sem backend**: persistência em **`localStorage`** (coerente ao escopo da disciplina).

---

## 2) Tecnologias e organização do código

- **HTML5** (semântico; uso de `<dialog>` para modais).
- **CSS3** (layout responsivo; tokens simples de cor/borda/sombra; componentes: botões, chips, cards, modais).
- **JavaScript ES Modules**:
  - `store.js` → **camada de dados** (modelos, CRUD e persistência em `localStorage`).
  - `ui.js` → **renderização** (listas, Kanban, chips, avatares).
  - `app.js` → **orquestração** (eventos de UI, filtros, modais, drag & drop, alternância Lista/Quadro).

**Estrutura**

```
/index.html
/assets/css/styles.css
/assets/js/store.js
/assets/js/ui.js
/assets/js/app.js
```

---

## 3) Modelo de dados

- **User**  
  `{ id, name, email, avatar }`

- **Project**  
  `{ id, title, ownerId, createdAt }`

- **Categories** (por projeto)  
  `{ [projectId]: string[] }`

- **Note**  
  `{ id, projectId, userId, title, category, status, content, priority, dueDate }`

**Chaves de persistência (`localStorage`)**  
`sgcpd_schema_version`, `sgcpd_users`, `sgcpd_current_user`,  
`sgcpd_projects`, `sgcpd_current_project`,  
`sgcpd_categories`, `sgcpd_notes`, `sgcpd_pref_view`.

---

## 4) Como executar

**Rápido:** abra `index.html` no navegador.  
Se o navegador bloquear ES Modules via `file://`, utilize um servidor simples (ex.: **VS Code Live Server**).  
Opcional: **GitHub Pages** (deploy direto da branch principal).

---

## 5) Como usar

1. **Usuários**: abra o modal **“Gerenciar Usuários”** e adicione/remova; o **Atual** aparece com badge.
2. **Projetos**: crie um projeto e **defina o responsável** (usuário). As listagens mostram **avatar + nome** do responsável.
3. **Categorias**: no **sidebar**, clique em **“+ Categoria”** para criar chips por projeto; remova pelo **“×”**.
4. **Nova nota**: clique em **“Nova nota”** e preencha **título, conteúdo, categoria, responsável, prioridade e data**.
5. **Abrir/Editar nota**: clique no **título** ou no botão **“Abrir”** para visualizar e alterar.
6. **Lista/Quadro**: alterne a visualização; no **Kanban**, **arraste** entre colunas para atualizar o `status`.
7. **Busca/Filtros**: pesquise por **texto** e filtre por **Categoria/Status/Responsável**. Tudo persiste no navegador.

---

## 6) Como foi implementado

- **Persistência local** (`store.js`): centraliza o estado; qualquer ação de CRUD atualiza o `localStorage`.
  - **Seeds** na primeira execução: usuário **Convidado**, projeto **“Projeto padrão”**, categorias base (**Trabalho / Pessoal / Estudos**).
- **Renderização** (`ui.js`): gera **listas de notas**, **chips de categoria** e o **Kanban** (3 colunas).
  - Categorias → **chips coloridos** (paleta cíclica) e opções nos **selects** de filtro/nota.
  - Avatares → **fundo neutro** para melhor legibilidade.
- **Orquestração** (`app.js`):
  - **Filtros** aplicados em memória nas notas do projeto atual.
  - **Modais** com `<dialog>` (nota, projeto, usuários).
  - **Drag & drop**: `dragstart` nos cards, `drop` nas colunas; atualiza `status` e persiste.
  - **Toasts**: sucesso/feedback em ações (salvar, mover, excluir).
  - Preferência de **view** (Lista/Quadro) salva em `sgcpd_pref_view`.

---

## 7) Critérios do PDF — checklist

- **Funcionalidade (50%)**  
  ✅ CRUD Usuários / Projetos (com responsável) / Notas (abrir/editar)  
  ✅ Categorias por projeto + seleção na nota  
  ✅ Busca e filtros (texto, categoria, status, responsável)  
  ✅ Lista e Quadro (Kanban) com **drag & drop** + persistência

- **Design e Usabilidade (20%)**  
  ✅ Interface limpa, componentes consistentes, **avatares neutros**, **toasts**, modais claros

- **Responsividade (20%)**  
  ✅ Layout adaptável (grid/flex + breakpoints)

- **Documentação (10%)**  
  ✅ README com execução, uso, o que foi feito, tecnologias e explicação de implementação

---

## 8) Testes manuais recomendados

1. Criar **usuário** e ver “Atual” no modal.  
2. Criar **projeto** com **responsável**; editar título; excluir um projeto.  
3. Criar **categorias** no sidebar; remover e checar impacto nas notas.  
4. Criar **notas** variadas (categoria/usuário/priority/dueDate); **abrir/editar** e salvar.  
5. **Filtrar** por texto/categoria/status/responsável.  
6. **Mover** no **Kanban** e recarregar a página para conferir persistência.

---

## 9) Limitações e próximos passos

- Persistência local (sem sincronização entre dispositivos).  
- Próximas evoluções: editor rich‑text/Markdown, ordenação por prioridade/data, lembretes, exportar/importar JSON, tema dark.

---

## 10) Autoria

- **Edney Lincoln de Queiroz Lourenço — 2025200225**  
- **Nayara Maria Costa De Mesquita — 2025200253**
