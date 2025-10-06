// Função para limpar localStorage e reinicializar dados padrão
function resetAppData() {
  localStorage.clear();
  Store.init();
  // Adiciona usuário padrão
  const userId = Store.upsertUser({
    id: crypto.randomUUID(),
    name: 'Eddy',
    email: 'eddy@gmail.com',
    avatar: { hue: 260, initial: 'E' }
  });
  Store.setCurrentUser(userId);
  // Adiciona projeto padrão
  const projId = Store.upsertProject('Projeto exemplo', userId);
  Store.setCurrentProject(projId);
  // Adiciona categorias padrão
  ['Trabalho','Pessoal','Estudos'].forEach(c=>Store.upsertCategory({name:c, color:'#4f4f8f'}, projId));
  // Adiciona nota exemplo
  Store.upsertNote({
    id: crypto.randomUUID(),
    projectId: projId,
    userId: userId,
    title: 'Bem-vindo!',
    category: 'Estudos',
    status: 'todo',
    content: 'Primeira nota de exemplo.',
    priority: 'normal',
    dueDate: ''
  });
  renderApp();
  UI.toast('Dados restaurados!');
}

// Botão para restaurar dados
window.addEventListener('DOMContentLoaded', () => {
  const btn = document.createElement('button');
  btn.textContent = 'Restaurar dados';
  btn.style.position = 'fixed';
  btn.style.bottom = '90px';
  btn.style.right = '24px';
  btn.style.zIndex = '9999';
  btn.style.padding = '7px 14px';
  btn.style.background = '#f3f3f3';
  btn.style.color = '#444';
  btn.style.border = '1px solid #ddd';
  btn.style.borderRadius = '7px';
  btn.style.fontSize = '0.97rem';
  btn.style.boxShadow = '0 1px 4px rgba(16,24,40,.08)';
  btn.onclick = resetAppData;
  document.body.appendChild(btn);
});
import Store from './store.js';
import UI from './ui.js';
import { requireText } from './validators.js';

const $ = (id) => document.getElementById(id);
const on = (id, evt, fn) => { const el=$(id); if(el) el.addEventListener(evt, fn); return el; };

const PREF_VIEW_KEY='sgcpd_pref_view';
let currentView = localStorage.getItem(PREF_VIEW_KEY) || 'board';
let editingNoteId = null;
let editingUserId = null;
const STATUS_LABEL = { todo:'A fazer', doing:'Em progresso', done:'Concluída' };

// Helpers
function ensureCategories(projectId){
  if (Store.listCategories(projectId).length === 0){
    ['Trabalho','Pessoal','Estudos'].forEach(c=>Store.upsertCategory(c, projectId));
  }
}
function migrateAllProjectsCategories(){
  Store.listProjects().forEach(p=>ensureCategories(p.id));
}
function fillAssigneeSelect(){
  const sel=$('note-assignee'); if(!sel) return;
  const users=Store.listUsers(); const me=Store.getCurrentUser();
  sel.innerHTML = users.map(u=>`<option value="${String(u.id)}" ${me&&String(u.id)===String(me.id)?'selected':''}>${u.name}</option>`).join('');
}
function fillUserFilter(){
  const sel=$('filter-user'); if(!sel) return;
  const users=Store.listUsers();
  sel.innerHTML = `<option value="__all">Todos</option><option value="__me">Só eu</option>` +
    users.map(u=>`<option value="${String(u.id)}">${u.name}</option>`).join('');
}
function getFilters(){ return {
  q:$('q')?.value||'',
  // Usa apenas checkboxes de categoria para filtro
  categories: Array.from(document.querySelectorAll('.cat-filter:checked')).map(cb=>cb.value),
  status:$('filter-status')?.value||'',
  who:$('filter-user')?.value||'__all'
};}
function applyUserFilter(notes, who){
  if(who==='__all') return notes;
  const me=Store.getCurrentUser();
  if(who==='__me') return notes.filter(n=>n.userId===me?.id);
  return notes.filter(n=>n.userId===who);
}

// Modal de confirmação
function confirmModal(message, danger=false){
  return new Promise((resolve)=>{
    $('confirm-message').textContent = message;
    const dlg=$('modal-confirm');
    const ok=$('confirm-ok'), cancel=$('confirm-cancel');
    ok.classList.toggle('btn-danger', !!danger);

    const onok=()=>{ cleanup(); resolve(true); };
    const oncancel=()=>{ cleanup(); resolve(false); };
    function cleanup(){ ok.removeEventListener('click',onok); cancel.removeEventListener('click',oncancel); dlg.close(); }

    ok.addEventListener('click', onok);
    cancel.addEventListener('click', oncancel);
    dlg.showModal();
  });
}

// Views
function show(view){
  $('view-projects')?.setAttribute('hidden','');
  $('view-app')?.setAttribute('hidden','');
  if(view==='projects') $('view-projects')?.removeAttribute('hidden');
  else $('view-app')?.removeAttribute('hidden');
}
const goProjects = ()=>{
  show('projects');
  UI.renderProjectMenu();
  UI.renderUserMenu();
  UI.renderProjectsGrid();
  const proj = Store.getCurrentProject();
  if (proj) UI.renderCategories(proj.id);
};
const goApp = ()=>{ show('app'); renderApp(); };

// Seeds
function seedIfEmpty(){
  if(Store.listProjects().length===0){
    const pid = Store.upsertProject('Projeto padrão', Store.getCurrentUser()?.id);
    Store.setCurrentProject(pid);
  }
  migrateAllProjectsCategories();
  const proj=Store.getCurrentProject(); if(!proj) return;
  if(Store.listNotes(proj.id).length===0){
    const me = Store.getCurrentUser();
    Store.upsertNote({
      id: crypto.randomUUID(),
      projectId: proj.id,
      userId: me?.id,
      title: 'Bem-vindo!',
      category: 'Estudos',
      status: 'todo',
      content: 'Primeira nota de exemplo.',
      priority: 'normal',
      dueDate: ''
    });
  }
}

// Renderização principal
function renderApp(){
  const proj=Store.getCurrentProject(); if(!proj){ goProjects(); return; }
  ensureCategories(proj.id);
  UI.renderProjectMenu(); UI.renderUserMenu(); UI.renderCategories(proj.id);
  // Salva valor atual do filtro de responsável
  let prevWho = $('filter-user')?.value || '__all';
  fillAssigneeSelect(); fillUserFilter();
  // Restaura valor anterior do filtro de responsável (não sobrescreve seleção do usuário)
  if ($('filter-user')) $('filter-user').value = prevWho;

  const filters = getFilters();
  if(currentView==='list'){
    $('note-list')?.classList.remove('hidden');
    $('board')?.classList.add('hidden');
    UI.renderNotes(Store.getCurrentProject().id, filters);
  }else{
    $('note-list')?.classList.add('hidden');
    $('board')?.classList.remove('hidden');
    UI.renderBoard(Store.getCurrentProject().id, filters);
  }

  $('view-list')?.setAttribute('aria-selected', String(currentView==='list'));
  $('view-board')?.setAttribute('aria-selected', String(currentView==='board'));
}

// Modais
function openProjectModal(){
  const sel=$('project-owner'); if(sel){
    const users=Store.listUsers(); const me=Store.getCurrentUser();
    sel.innerHTML = users.map(u=>`<option value="${u.id}" ${me&&u.id===me.id?'selected':''}>${u.name}</option>`).join('');
  }
  $('project-name').value='';
  $('modal-project')?.showModal();
}
function openUsersManage(){ UI.renderUsersManage(); $('modal-users-manage')?.showModal(); }
let editingCategoryName = null;
function openCategoryModal(cat) {
  $('form-category')?.reset();
  if (cat) {
    $('category-name').value = cat.name;
    $('category-color').value = cat.color || '#4f4f8f';
    editingCategoryName = cat.name;
  } else {
    $('category-name').value = '';
    $('category-color').value = '#4f4f8f';
    editingCategoryName = null;
  }
  $('modal-category')?.showModal();
}

// Eventos principais
function bindEvents(){
  on('nav-projects','click', ()=>{ goProjects(); });

  on('view-list','click', ()=>{ currentView='list'; localStorage.setItem(PREF_VIEW_KEY,'list'); renderApp(); });
  on('view-board','click', ()=>{ currentView='board'; localStorage.setItem(PREF_VIEW_KEY,'board'); renderApp(); });

  on('q','input', renderApp);
  // Filtro de categoria agora só por checkbox
  document.getElementById('category-list')?.addEventListener('change', (e) => {
    if(e.target.classList.contains('cat-filter')) {
      renderApp();
    }
  });
  on('filter-status','change', renderApp);
  on('filter-user','change', renderApp);

  // Categoria
  on('btn-add-category','click', () => openCategoryModal());
  on('save-category','click', (e)=>{
    try{
      const name=$('category-name')?.value?.trim(); requireText(name,'Nome da categoria');
      const color=$('category-color')?.value||'#4f4f8f';
      const proj=Store.getCurrentProject();
      if(editingCategoryName && editingCategoryName !== name) {
        // Renomear: remover antiga
        let cats = Store.listCategories(proj.id).filter(c => c.name !== editingCategoryName);
        cats.push({name, color});
        // Limpa todas e reinsere as restantes
        let all = Store.listCategories(proj.id).filter(()=>false);
        cats.forEach(c=>Store.upsertCategory(c, proj.id));
      } else {
        Store.upsertCategory({name, color}, proj.id);
      }
      $('modal-category')?.close();
      UI.renderCategories(proj.id);
      renderApp();
      UI.toast(editingCategoryName ? 'Categoria atualizada.' : 'Categoria adicionada.');
      editingCategoryName = null;
    }catch(err){ e.preventDefault(); UI.toast(err.message); }
  });
  // Edição/Exclusão de categoria
  document.getElementById('category-list')?.addEventListener('click', async (e) => {
    const editBtn = e.target.closest('[data-edit-cat]');
    const delBtn = e.target.closest('[data-del-cat]');
    const proj = Store.getCurrentProject();
    if(editBtn) {
      const name = editBtn.dataset.editCat;
      const cat = Store.listCategories(proj.id).find(c=>c.name===name);
      if(cat) openCategoryModal(cat);
      return;
    }
    if(delBtn) {
      const name = delBtn.dataset.delCat;
      if(confirm('Deseja realmente excluir esta categoria?')) {
        let cats = Store.listCategories(proj.id).filter(c => c.name !== name);
        // Limpa todas e reinsere as restantes
        let all = Store.listCategories(proj.id).filter(()=>false);
        cats.forEach(c=>Store.upsertCategory(c, proj.id));
        UI.renderCategories(proj.id);
        renderApp();
        UI.toast('Categoria excluída.');
      }
      return;
    }
  });

  // Menus do header
  on('project-menu-btn','click', (e)=>{ e.stopPropagation(); UI.renderProjectMenu(); $('project-menu').hidden=!$('project-menu').hidden; $('user-menu').hidden=true; });
  on('user-menu-btn','click', (e)=>{ e.stopPropagation(); UI.renderUserMenu(); $('user-menu').hidden=!$('user-menu').hidden; $('project-menu').hidden=true; });
  document.addEventListener('click', ()=>{ $('project-menu').hidden=true; $('user-menu').hidden=true; });

  $('project-menu')?.addEventListener('click',(e)=>{
    const it=e.target.closest('[data-project]'); if(!it) return;
    Store.setCurrentProject(it.dataset.project); $('project-menu').hidden=true; seedIfEmpty(); goApp();
  });

  on('menu-new-project','click', (e)=>{ e.stopPropagation(); openProjectModal(); });
  on('btn-new-project','click', openProjectModal);
  on('save-project','click', (e)=>{
    try{
      const name=$('project-name')?.value, owner=$('project-owner')?.value;
      requireText(name,'Nome do projeto');
      if (editingProjectId) {
        // Edição
        let all = Store.listProjects();
        let proj = all.find(p=>p.id === editingProjectId);
        if(proj){
          proj.name = name.trim();
          proj.ownerId = owner;
          localStorage.setItem('sgcpd_projects', JSON.stringify(all));
          Store.setCurrentProject(proj.id);
          migrateAllProjectsCategories();
          $('modal-project')?.close(); goProjects(); renderApp(); UI.toast('Projeto atualizado.');
        }
        editingProjectId = null;
      } else {
        // Criação
        const id=Store.upsertProject(name.trim(), owner); Store.setCurrentProject(id);
        migrateAllProjectsCategories();
        $('modal-project')?.close(); goProjects(); renderApp(); UI.toast('Projeto criado.');
      }
    }catch(err){ e.preventDefault(); UI.toast(err.message); }
  });

  let editingProjectId = null;
  // (Removido bloco duplicado do evento 'project-grid')
  $('project-grid')?.addEventListener('click',(e)=>{
    const card=e.target.closest('[data-open-project]');
    const editBtn = e.target.closest('[data-edit-project]');
    const delBtn = e.target.closest('[data-delete-project]');
    if(editBtn) {
      const projId = editBtn.dataset.editProject;
      const proj = Store.listProjects().find(p=>p.id === projId);
      if(proj) {
        editingProjectId = proj.id;
        const sel = $('project-owner');
        if(sel){
          const users=Store.listUsers();
          sel.innerHTML = users.map(u=>`<option value="${u.id}" ${proj.ownerId===u.id?'selected':''}>${u.name}</option>`).join('');
        }
        $('project-name').value = proj.name;
        $('modal-project').showModal();
      }
      return;
    }
    if(delBtn) {
      const projId = delBtn.dataset.deleteProject;
      const ok = confirm('Deseja realmente excluir este projeto?');
      if(ok){
        let all = Store.listProjects().filter(p=>p.id !== projId);
        localStorage.setItem('sgcpd_projects', JSON.stringify(all));
        // Remove notas e categorias do projeto
        let allNotes = Store.listProjects().flatMap(p=>Store.listNotes(p.id)).filter(n=>n.projectId !== projId);
        localStorage.setItem('sgcpd_notes', JSON.stringify(allNotes));
        let cats = JSON.parse(localStorage.getItem('sgcpd_categories')||'{}');
        delete cats[projId];
        localStorage.setItem('sgcpd_categories', JSON.stringify(cats));
        Store.setCurrentProject(all.length ? all[0].id : null);
        goProjects();
        UI.toast('Projeto excluído.');
      }
      return;
    }
    if(card) {
      Store.setCurrentProject(card.dataset.openProject); seedIfEmpty();
      const proj = Store.getCurrentProject();
      if (proj) UI.renderCategories(proj.id);
      goApp();
    }
  });

  // Salvar projeto (criação ou edição)
  // (já tratado acima, não precisa duplicar)

  // Usuários
  $('user-menu')?.addEventListener('click',(e)=>{
    const it=e.target.closest('[data-user]'); if(!it) return;
    Store.setCurrentUser(it.dataset.user); $('user-menu').hidden=true; goProjects(); renderApp();
  });
  on('menu-new-user','click',(e)=>{ e.stopPropagation(); editingUserId=null; $('form-user')?.reset(); $('modal-user')?.showModal(); });
  on('menu-manage-users','click',(e)=>{ e.stopPropagation(); openUsersManage(); });

  on('save-user','click',(e)=>{
    try{
      const name=$('user-name')?.value, email=$('user-email')?.value;
      requireText(name,'Nome'); requireText(email,'Email');
      const id = editingUserId ?? crypto.randomUUID();
      Store.upsertUser({ id, name, email });
      if(!editingUserId) Store.setCurrentUser(id);
      $('modal-user')?.close(); UI.renderUserMenu(); UI.renderUsersManage(); renderApp(); UI.toast(editingUserId?'Usuário atualizado.':'Usuário criado.');
      editingUserId=null;
    }catch(err){ e.preventDefault(); UI.toast(err.message); }
  });

  $('modal-users-manage')?.addEventListener('click', async (e)=>{
    const del=e.target.closest('[data-del-user]'); const edit=e.target.closest('[data-edit-user]');
    if(del){
      const id=del.dataset.delUser;
      const ok = await confirmModal('Deseja realmente excluir este usuário?', true);
      if(ok){ Store.deleteUser(id); UI.renderUsersManage(); UI.renderUserMenu(); renderApp(); UI.toast('Usuário excluído.'); }
    }
    if(edit){
      const u = Store.userById(edit.dataset.editUser); if(!u) return;
      editingUserId = u.id;
      $('user-name').value=u.name; $('user-email').value=u.email;
      $('modal-user').showModal();
    }
  });
  on('btn-add-user-manage','click', ()=>{ $('modal-users-manage').close(); editingUserId=null; $('form-user')?.reset(); $('modal-user').showModal(); });

  // Nota
  on('btn-open-note-modal','click', ()=>{
  $('form-note')?.reset();
  const proj=Store.getCurrentProject();
  if(proj) {
    // Garante pelo menos uma categoria
    if(Store.listCategories(proj.id).length === 0) {
      Store.upsertCategory({name:'Geral', color:'#4f4f8f'}, proj.id);
    }
    UI.renderCategories(proj.id);
    // Preenche o select de categoria
    const cats = Store.listCategories(proj.id);
    const sel = $('note-category');
    if(sel) sel.innerHTML = cats.map(c=>`<option value="${c.name}">${c.name}</option>`).join('');
    if(sel && cats.length) sel.value = cats[0].name;
  }
  fillAssigneeSelect(); editingNoteId=null;
  $('note-status').value='todo';
  $('note-assignee').value = Store.getCurrentUser()?.id || '';
  $('note-priority') && ($('note-priority').value='normal');
  $('modal-note')?.showModal();
  });

  document.querySelectorAll('[data-close]')?.forEach(b=>b.addEventListener('click',()=>$(b.dataset.close)?.close()));

  on('save-note','click',(e)=>{
    try{
  const title=$('note-title')?.value, category=$('note-category')?.value,
    assignee=String($('note-assignee')?.value), status=$('note-status')?.value,
    content=$('note-content')?.value, priority=$('note-priority')?.value || 'normal',
    dueDate=$('note-due')?.value || '';
      requireText(title,'Título'); requireText(content,'Conteúdo');
    const currentProj=Store.getCurrentProject(); const id=editingNoteId ?? crypto.randomUUID();
    Store.upsertNote({ id, projectId:currentProj.id, userId:assignee, title, category, status, content, priority, dueDate });
    $('modal-note')?.close();
    if (currentProj) UI.renderCategories(currentProj.id);
    renderApp(); UI.toast(editingNoteId?'Nota atualizada.':'Nota criada.'); editingNoteId=null;
    }catch(err){ e.preventDefault(); UI.toast(err.message); }
  });

  // Editar/Excluir nota
  document.body.addEventListener('click', async (e)=>{
    const btn=e.target.closest('button'); if(!btn) return;
    if(btn.dataset.delete){
      const ok = await confirmModal('Excluir esta nota?', true);
      if(ok){ Store.deleteNote(btn.dataset.delete); renderApp(); UI.toast('Nota excluída.'); }
      return;
    }
    if(btn.dataset.edit){
      const proj=Store.getCurrentProject(); const n=Store.listNotes(proj.id).find(x=>x.id===btn.dataset.edit); if(!n) return;
      if(proj) UI.renderCategories(proj.id);
      $('note-title').value=n.title||''; $('note-category').value=n.category||''; $('note-status').value=n.status||'todo'; $('note-content').value=n.content||'';
      fillAssigneeSelect(); $('note-assignee').value=n.userId||Store.getCurrentUser()?.id;
      $('note-priority') && ($('note-priority').value = n.priority || 'normal');
      $('note-due') && ($('note-due').value = n.dueDate || '');
      editingNoteId=n.id; $('modal-note').showModal();
    }
  });

  // Drag and Drop do quadro
  const board=$('board');
  if(board){
    board.addEventListener('dragstart',e=>{ const card=e.target.closest('.card'); if(!card) return; e.dataTransfer.setData('text/plain',card.dataset.id); e.dataTransfer.effectAllowed='move'; });
    board.addEventListener('dragover',e=>{ const col=e.target.closest('.col-body'); if(!col) return; e.preventDefault(); col.classList.add('drop-target'); });
    board.addEventListener('dragleave',e=>{ const col=e.target.closest('.col-body'); if(col) col.classList.remove('drop-target'); });
    board.addEventListener('drop',e=>{
      const col=e.target.closest('.col-body'); if(!col) return; e.preventDefault(); col.classList.remove('drop-target');
      const id=e.dataTransfer.getData('text/plain'); const status=col.dataset.status;
      const proj=Store.getCurrentProject(); const note=Store.listNotes(proj.id).find(n=>n.id===id); if(!note) return;
      note.status=status; Store.upsertNote(note); renderApp(); UI.toast(`Nota movida para ${STATUS_LABEL[status]||status}.`);
    });
  }
}

// Inicialização
function start(){
  Store.init();
  migrateAllProjectsCategories(); // garante tags nos projetos antigos
  bindEvents();
  // Seleciona automaticamente o primeiro projeto existente, se houver
  const allProjects = Store.listProjects();
  if (!Store.getCurrentProject() && allProjects.length > 0) {
    Store.setCurrentProject(allProjects[0].id);
  }
  goProjects();
  if(Store.getCurrentProject()){ seedIfEmpty(); renderApp(); }
}
document.addEventListener('DOMContentLoaded', start);