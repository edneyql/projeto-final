const $ = (id) => document.getElementById(id);
import Store from './store.js';
const UI = {
  toast(msg, time=2500) {
    let el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.style.position = 'fixed';
      el.style.right = '36px';
      el.style.bottom = '36px';
      el.style.left = 'auto';
      el.style.transform = 'none';
      el.style.background = '#181e29';
      el.style.color = '#fff';
      el.style.padding = '12px 28px';
      el.style.borderRadius = '8px';
      el.style.fontSize = '1.05rem';
      el.style.zIndex = '2147483647';
      el.style.boxShadow = '0 2px 12px rgba(0,0,0,.18)';
      el.style.opacity = '0';
      el.style.transition = 'opacity 0.2s';
      el.style.width = 'auto';
      el.style.minWidth = '120px';
      el.style.maxWidth = '360px';
      el.style.textAlign = 'left';
      el.style.pointerEvents = 'none';
      el.style.margin = '0';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.style.opacity = '1';
    clearTimeout(UI.toastTimer);
    UI.toastTimer = setTimeout(() => {
      el.style.opacity = '0';
    }, time);
  },
  avatarHTML(user, size=24) {
    if (!user) return `<span class="avatar" style="width:${size}px;height:${size}px;background:#ccc;border-radius:50%;display:inline-block;"></span>`;
    const hue = user.avatar?.hue || 220;
    const initial = user.avatar?.initial || (user.name ? user.name[0].toUpperCase() : '?');
    return `<span class="avatar" style="width:${size}px;height:${size}px;border-radius:50%;background:hsl(${hue} 70% 48%);color:#fff;display:inline-flex;align-items:center;justify-content:center;font-size:${size*0.6}px;font-weight:700;box-shadow:inset 0 -2px 0 rgba(0,0,0,.12);">${initial}</span>`;
  },
  toastTimer: null,
  categoryIndex: {},
  // ...existing code...
  renderNotesFiltered(notes){
    const ul=$('note-list'); if(!ul) return;
    ul.innerHTML = notes.length ? notes.map(n => {
      const cat = Store.listCategories(Store.getCurrentProject().id).find(c => c.name === n.category);
      return `<li data-id="${n.id}" style="position:relative;">
        <div class="note-card-actions">
          <button class="btn btn-outline" data-edit="${n.id}"><span class="material-symbols-outlined">edit</span></button>
          <button class="btn btn-outline" data-delete="${n.id}"><span class="material-symbols-outlined">delete</span></button>
        </div>
        <div class="note-title">${n.title}</div>
        <div class="note-meta">
          <span class="cat-badge" style="background:${cat?.color||'#4f4f8f'};color:#fff;">
            <span class="material-symbols-outlined" style="font-size:18px;vertical-align:middle;">label</span> ${cat?.name||n.category||'sem categoria'}
          </span>
          <span class="chip chip-status ${n.status}">${n.status}</span>
          ${this.priorityChip(n.priority)}
          ${this.dueChip(n.dueDate)}
          <span class="chip">${this.avatarHTML(Store.userById(n.userId),18)} ${Store.userNameById(n.userId)}</span>
        </div>
        <p>${n.content}</p>
      </li>`;
    }).join('') : '<li><em>Nenhuma nota encontrada</em></li>';
  },
  renderBoardFiltered(notes){
    const root=$('board'); if(!root) return;
    const cols=[{key:'todo',title:'A fazer'},{key:'doing',title:'Em progresso'},{key:'done',title:'Concluída'}];
    root.innerHTML = cols.map(c => {
      const inCol = notes.filter(n => n.status === c.key);
      return `<section class="column" data-status="${c.key}">
        <div class="col-header">${c.title} (${inCol.length})</div>
        <div class="col-body" data-status="${c.key}">
          ${inCol.map(n => {
            const cat = Store.listCategories(Store.getCurrentProject().id).find(ca => ca.name === n.category);
            return `<article class="card" draggable="true" data-id="${n.id}">
              <div class="note-title">${n.title}</div>
              <div class="note-meta">
                <span class="cat-badge" style="background:${cat?.color||'#4f4f8f'};color:#fff;">
                  <span class="material-symbols-outlined" style="font-size:18px;vertical-align:middle;">label</span> ${cat?.name||n.category||'sem categoria'}
                </span>
                ${this.priorityChip(n.priority)}
                ${this.dueChip(n.dueDate)}
                <span class="chip">${this.avatarHTML(Store.userById(n.userId),18)} ${Store.userNameById(n.userId)}</span>
              </div>
              <p>${n.content}</p>
            </article>`;
          }).join('')}
        </div>
      </section>`;
    }).join('');
  },

  /* ---------- Menus do header ---------- */
  renderProjectMenu(){
    const proj = Store.getCurrentProject();
    const all  = Store.listProjects();
    const nameEl = $('current-project-name');
    if (nameEl) nameEl.textContent = proj ? proj.name : 'Selecione um projeto';

    const listEl = $('project-menu-list');
    if (!listEl) return;

    listEl.innerHTML = all.map(p=>{
      const owner = Store.userById(p.ownerId);
      return `
        <div class="menu-item" data-project="${p.id}">
          ${this.avatarHTML(owner,24)}
          <div>
            <div>${p.name}</div>
            <div class="proj-meta">${owner?owner.name:'—'} • ${Store.listNotes(p.id).length} notas</div>
          </div>
        </div>`;
    }).join('') || '<div class="menu-item">Sem projetos</div>';
  },

  renderUserMenu(){
    const user = Store.getCurrentUser();
    const all  = Store.listUsers();

    // Atualiza também o botão do topo (para garantir o avatar visível)
    const btn = $('user-menu-btn');
    if (btn) {
      btn.innerHTML = `
        ${this.avatarHTML(user,20)}
        <span id="current-user-name">${user?user.name:'Convidado'}</span>
        <span class="material-symbols-outlined chev">expand_more</span>`;
    }

    const listEl = $('user-menu-list');
    if (!listEl) return;

    listEl.innerHTML = all.map(u=>`
      <div class="menu-item" data-user="${u.id}">
        ${this.avatarHTML(u,24)}
        <div><div>${u.name}</div><div class="proj-meta">${u.email}</div></div>
      </div>`).join('');
  },

  /* ---------- Galeria de projetos (cards estilo Figma) ---------- */
  renderProjectsGrid(){
    const grid=$('project-grid'); if(!grid) return;
    const all=Store.listProjects();

    grid.innerHTML = all.map(p=>{
      const owner=Store.userById(p.ownerId);
      return `
      <article class="proj-card" data-open-project="${p.id}">
        <div class="proj-card-top">
          <div class="proj-card-main">
            <div class="proj-icon"><span class="material-symbols-outlined">folder</span></div>
            <h3 class="proj-title">${p.name}</h3>
          </div>
          <div class="proj-actions">
            <button class="icon-btn" title="Editar" data-edit-project="${p.id}"><span class="material-symbols-outlined">edit</span></button>
            <button class="icon-btn" title="Excluir" data-delete-project="${p.id}"><span class="material-symbols-outlined">delete</span></button>
          </div>
        </div>
        <div class="proj-owner">
          ${this.avatarHTML(owner,24)} <span>${owner?owner.name:'—'}</span>
        </div>
      </article>`;
    }).join('') || '<p class="muted">Nenhum projeto ainda. Crie o primeiro.</p>';
  },

  /* ---------- Categorias (chips coloridas) ---------- */
  renderCategories(projectId){
    const list=$('category-list'), selectCat=$('note-category'), filterCat=$('filter-category');
    const cats=Store.listCategories(projectId);

    if(list){
      list.innerHTML = cats.length
        ? cats.map((c,i)=>
          `<li class="cat-row">
            <label class="cat-check">
              <input type="checkbox" class="cat-filter" value="${c.name}" />
              <span class="cat-badge" style="background:${c.color};color:#fff;">
                <span class="material-symbols-outlined" style="font-size:18px;vertical-align:middle;">label</span> ${c.name}
              </span>
            </label>
            <div class="cat-actions">
              <button class="cat-btn" title="Editar" data-edit-cat="${c.name}"><span class="material-symbols-outlined">edit</span></button>
              <button class="cat-btn" title="Excluir" data-del-cat="${c.name}"><span class="material-symbols-outlined">delete</span></button>
            </div>
          </li>`).join('')
        : '<li class="muted">Nenhuma categoria</li>';
    }
    if(filterCat){
      filterCat.innerHTML = ['<option value="">Todas as categorias</option>']
        .concat(cats.map(c=>`<option value="${c.name}">${c.name}</option>`)).join('');
    }
    if(selectCat){
      selectCat.innerHTML = cats.map(c=>`<option value="${c.name}">${c.name}</option>`).join('');
    }
  },
  catClass(name){ const i=this.categoryIndex?.[name]; return (i===0||i)?`chip chip-cat c${i}`:'chip chip-cat c0'; },

  /* ---------- Notas ---------- */
  priorityChip(p='normal'){
    const map={ low:'Baixa', normal:'Normal', high:'Alta' };
    const cls={ low:'prio-low', normal:'prio-normal', high:'prio-high' }[p]||'prio-normal';
    return `<span class="chip ${cls}">${map[p]||'Normal'}</span>`;
  },
  dueChip(d){ if(!d) return ''; return `<span class="chip chip-date"><span class="material-symbols-outlined">event</span>${new Date(d).toLocaleDateString()}</span>`; },

  renderNotes(projectId,{q='',category='',status=''}={}){
    const ul=$('note-list'); if(!ul) return;
    let notes=Store.listNotes(projectId);
    if(q) notes=notes.filter(n=>(n.title+n.content).toLowerCase().includes(q.toLowerCase()));

    ul.innerHTML = notes.length ? notes.map(n => {
      const cat = Store.listCategories(Store.getCurrentProject().id).find(c => c.name === n.category);
      return `<li data-id="${n.id}" style="position:relative;">
        <div class="note-card-actions">
          <button class="btn btn-outline" data-edit="${n.id}"><span class="material-symbols-outlined">edit</span></button>
          <button class="btn btn-outline" data-delete="${n.id}"><span class="material-symbols-outlined">delete</span></button>
        </div>
        <div class="note-title">${n.title}</div>
        <div class="note-meta">
          <span class="cat-badge" style="background:${cat?.color||'#4f4f8f'};color:#fff;">
            <span class="material-symbols-outlined" style="font-size:18px;vertical-align:middle;">label</span> ${cat?.name||n.category||'sem categoria'}
          </span>
          <span class="chip chip-status ${n.status}">${n.status}</span>
          ${this.priorityChip(n.priority)}
          ${this.dueChip(n.dueDate)}
          <span class="chip">
            <span style="display:inline-flex;align-items:center;justify-content:center;width:24px;height:24px;min-width:24px;min-height:24px;border-radius:999px;font-size:.95em;line-height:1;background:hsl(${Store.userById(n.userId)?.avatar?.hue||220} 70% 48%);color:#fff;font-weight:700;box-shadow:inset 0 -2px 0 rgba(0,0,0,.12);margin-right:5px;">
              ${Store.userById(n.userId)?.avatar?.initial||'U'}
            </span>
            ${Store.userNameById(n.userId)}
          </span>
        </div>
        <p>${n.content}</p>
      </li>`;
    }).join('') : '<li><em>Nenhuma nota encontrada</em></li>';
  },

  renderBoard(projectId,{q='',category=''}={}){
    const root=$('board'); if(!root) return;
    let notes=Store.listNotes(projectId);
    if(q) notes=notes.filter(n=>(n.title+n.content).toLowerCase().includes(q.toLowerCase()));
    const cols=[{key:'todo',title:'A fazer'},{key:'doing',title:'Em progresso'},{key:'done',title:'Concluída'}];
    root.innerHTML = cols.map(c => {
      const inCol = notes.filter(n => n.status === c.key);
      return `<section class="column" data-status="${c.key}">
        <div class="col-header">${c.title} (${inCol.length})</div>
        <div class="col-body" data-status="${c.key}">
          ${inCol.map(n => {
            const cat = Store.listCategories(Store.getCurrentProject().id).find(ca => ca.name === n.category);
            return `<article class="card" draggable="true" data-id="${n.id}">
              <div class="note-title">${n.title}</div>
              <div class="note-meta">
                <span class="cat-badge" style="background:${cat?.color||'#4f4f8f'};color:#fff;">
                  <span class="material-symbols-outlined" style="font-size:18px;vertical-align:middle;">label</span> ${cat?.name||n.category||'sem categoria'}
                </span>
                ${this.priorityChip(n.priority)}
                ${this.dueChip(n.dueDate)}
                <span class="chip">${this.avatarHTML(Store.userById(n.userId),18)} ${Store.userNameById(n.userId)}</span>
              </div>
              <p>${n.content}</p>
              <div class="actions end" style="margin-top:6px;">
                <button class="btn btn-outline" data-edit="${n.id}"><span class="material-symbols-outlined">edit</span> Editar</button>
                <button class="btn btn-outline" data-delete="${n.id}"><span class="material-symbols-outlined">delete</span> Excluir</button>
              </div>
            </article>`;
          }).join('')}
        </div>
      </section>`;
    }).join('');
  },

  /* ---------- Modal Gerenciar usuários (grid amplo) ---------- */
  renderUsersManage(){
    const wrap = $('users-manage-list'); if(!wrap) return;
    const users = Store.listUsers();
    const cur = Store.getCurrentUser()?.id;
    wrap.innerHTML = users.map(u=>`
      <div class="user-row">
        <div class="user-left">
          ${this.avatarHTML(u,32)}
          <div class="user-info">
            <strong>${u.name}</strong>
            <div class="proj-meta">${u.email}</div>
          </div>
        </div>
        <div class="user-actions">
          <button class="icon-btn" title="Editar" data-edit-user="${u.id}">
            <span class="material-symbols-outlined">edit</span>
          </button>
          ${u.id===cur
            ? '<span class="badge badge-current">Atual</span>'
            : `<button class="icon-btn" title="Excluir" data-del-user="${u.id}">
                <span class="material-symbols-outlined">delete</span>
              </button>`}
        </div>
      </div>`).join('');
  }
};

export default UI;