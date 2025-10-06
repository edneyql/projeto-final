# SGCPD — Sistema de Gerenciamento de Conteúdo Pessoal Dinâmico

Aplicação **front-end (HTML/CSS/JS)** para organizar **notas** por **projeto**, com **usuários**, **categorias/tags**, **busca e filtros**, visualização em **Lista** e **Quadro (Kanban)** com **drag & drop**, e **persistência em `localStorage`**.

> **Disciplina:** Desenvolvedor Front-End — Prof. MSc. Reinaldo de Souza Júnior  
> **Entrega no AVA:** **.txt** com a **URL do GitHub** e os **nomes completos** dos integrantes.  
> **Este README** cumpre a documentação pedida no PDF.

---

## 1) Requisitos do PDF (e como foram atendidos)

### Requisitos funcionais mínimos
- **CRUD de Usuários**: adicionar/remover pelo **modal “Gerenciar Usuários”**; indicação do **Usuário Atual** (badge).  
- **CRUD de Projetos**: criar/editar/excluir; **escolha do responsável** no cadastro/edição; grid/lista exibem **nome e avatar** do responsável.  
- **CRUD de Conteúdo (Notas)**: **Nova nota / Abrir (visualizar/editar) / Excluir**. Campos: **título, conteúdo, categoria, responsável, prioridade e data**.  
- **Categorias/Tags**: por **projeto** (criar/remover no sidebar); cada nota pode ter **1 categoria**; categorias mostradas como **chips**.  
- **Busca e Filtros**: busca por **texto** (título+conteúdo); filtros por **Categoria**, **Status** (A fazer / Em progresso / Concluída) e **Responsável** (Todos / Só eu / usuário).  
- **Duas visualizações**: **Lista** e **Quadro (Kanban)**; **drag & drop** entre colunas com persistência do `status`.

### Requisitos não funcionais
- **Usabilidade/UX**: interface limpa, componentes consistentes (cards, chips, modais), **avatares neutros**, feedback via **toasts**.  
- **Responsividade**: CSS responsivo (grid/flex + breakpoints).  
- **Manutenibilidade**: código **modular** em ES Modules (camadas `store`, `ui`, `app`).  
- **Sem backend**: persistência em **`localStorage`** (adequado ao escopo da disciplina).

---

## 2) Tecnologias e organização do código

- **HTML5** (semântico; uso de `<dialog>` para modais).  
- **CSS3** (layout responsivo; tokens de cor/borda/sombra; componentes reutilizáveis: botões, chips, cards, modais).  
- **JavaScript ES Modules**:
  - `store.js` → **camada de dados**: modelos, CRUD e persistência (`localStorage`).  
  - `ui.js` → **renderização**: HTML dinâmico (listas, Kanban, chips, avatares).  
  - `app.js` → **orquestração**: eventos de UI, filtros, modais, drag & drop, alternância lista/quadro.

```
/index.html
/assets/css/styles.css
/assets/js/store.js
/assets/js/ui.js
/assets/js/app.js
```

---

## 3) Modelo de dados (simplificado)

- **User**  
  `{ id, name, email, avatar }`
- **Project**  
  `{ id, title, ownerId, createdAt }`
- **Categories** (por projeto)  
  `{ [projectId]: string[] }`
- **Note**  
  `{ id, projectId, userId, title, category, status, content, priority, dueDate }`

**Chaves `localStorage`**  
`sgcpd_schema_version`, `sgcpd_users`, `sgcpd_current_user`,  
`sgcpd_projects`, `sgcpd_current_project`,  
`sgcpd_categories`, `sgcpd_notes`, `sgcpd_pref_view`.

---

## 4) Como executar

**Rápido:** abrir `index.html` no navegador.  
Se o navegador bloquear ES Modules via `file://`, usar um servidor simples (ex.: **VS Code Live Server**).  
Também funciona em **GitHub Pages** (deploy da branch principal).

---

## 5) Como usar (fluxo em 7 passos)

1. **Usuários:** abra o modal **“Gerenciar Usuários”** para adicionar/remover. O **Atual** aparece com badge.  
2. **Projetos:** crie um projeto e **escolha o responsável** (usuário). Projetos mostram **avatar + nome** do responsável.  
3. **Categorias:** no **sidebar**, clique em **“+ Categoria”** para criar chips por **projeto**; remova pelo “×”.  
4. **Nova nota:** clique em **“Nova nota”** → preencha **título, conteúdo, categoria, responsável, prioridade e data**.  
5. **Abrir/Editar nota:** clique no **título** ou no botão **“Abrir”**; ajustes no mesmo modal.  
6. **Lista/Quadro:** alterne a visualização; no **Kanban**, **arraste** entre colunas para mudar o `status`.  
7. **Busca/Filtros:** busque por **texto** e filtre por **Categoria/Status/Responsável**; tudo persiste no navegador.

---

## 6) Como foi implementado (explicação objetiva)

- **Persistência local**: `store.js` centraliza o estado; toda ação de CRUD atualiza o `localStorage`.  
  - Seeds na primeira execução: **Convidado**, **Projeto padrão**, categorias base (**Trabalho/Pessoal/Estudos**).  
- **Renderização**: `ui.js` gera as **listas de notas**, **chips** de categoria e o **Kanban** (3 colunas).  
  - Categorias viram **chips coloridos** (paleta cíclica) e entram em **selects** de filtro/nota.  
  - Avatares usam **fundo neutro** (melhor contraste com as tags).  
- **Orquestração**: `app.js` conecta tudo:  
  - **Filtros** aplicados em memória sobre as notas do projeto atual.  
  - **Modais** com `<dialog>` (nota, projeto, usuários).  
  - **Drag & drop**: `dragstart` nos cards e `drop` nas colunas; altera `status` e persiste.  
  - **Toasts**: confirmam salvar, mover, excluir, etc.  
  - **Preferência de view** (lista/quadro) salva em `sgcpd_pref_view`.

---

## 7) Critérios do PDF — checklist de conferência

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
6. **Mover** no **Kanban** e recarregar a página para ver persistência.

---

## 9) Limitações e próximos passos

- Persistência apenas local (sem sync multi-dispositivo).  
- Evoluções: editor rich-text/Markdown, ordenação por prioridade/data, lembretes, exportar/importar JSON, tema dark.

---

## 10) Autoria

- **Nome Completo 1 — Matrícula**  
- **Nome Completo 2 — Matrícula**  
- **Nome Completo 3 — Matrícula**  
- **Nome Completo 4 — Matrícula**

> **Submissão no AVA:** enviar **.txt** com **URL do GitHub** + **nomes completos** (apenas um integrante envia).
