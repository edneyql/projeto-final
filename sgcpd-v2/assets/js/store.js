// assets/js/store.js
const K = {
  v: 'sgcpd_schema_version',
  users: 'sgcpd_users',
  curUser: 'sgcpd_current_user',
  projects: 'sgcpd_projects',
  curProject: 'sgcpd_current_project',
  categories: 'sgcpd_categories',
  notes: 'sgcpd_notes'
};
const vNow = 3;

function get(k, def){ try{ const x=localStorage.getItem(k); return x?JSON.parse(x):(def??null);}catch{ return def??null; } }
function set(k, v){ localStorage.setItem(k, JSON.stringify(v)); }
const newid = () => crypto.randomUUID();

function avatarFor(name='?'){
  const seed = [...name].reduce((a,c)=>a+c.charCodeAt(0),0);
  const hue = seed % 360;
  const initial = (name.trim()[0]||'?').toUpperCase();
  return { hue, initial };
}

const Store = {
  init(){
    const v = get(K.v, 0);
    if (v < vNow){
      set(K.users, get(K.users, []));
      set(K.projects, get(K.projects, []));
      set(K.categories, get(K.categories, {}));
      set(K.notes, get(K.notes, []));
      set(K.v, vNow);
    }
    if (!this.getCurrentUser()){
      const u = { id:newid(), name:'Convidado', email:'convidado@local', avatar:avatarFor('Convidado') };
      const all = this.listUsers(); all.push(u); set(K.users, all); set(K.curUser, u.id);
    }
  },

  /* Users */
  listUsers(){ return get(K.users, []); },
  getCurrentUser(){ const id = get(K.curUser, null); return this.listUsers().find(u=>u.id===id)||null; },
  setCurrentUser(id){ set(K.curUser, id); },
  upsertUser(u){
    if (!u.avatar) u.avatar = avatarFor(u.name);
    const all=this.listUsers(); const i=all.findIndex(x=>x.id===u.id);
    if(i>=0) all[i]=u; else all.push(u);
    set(K.users, all); return u.id;
  },
  deleteUser(id){
    const cur = get(K.curUser, null);
    set(K.users, this.listUsers().filter(u=>u.id!==id));
    if (cur === id){
      const first = this.listUsers()[0]; set(K.curUser, first? first.id : null);
    }
  },
  userById(id){ return this.listUsers().find(x=>x.id===id)||null; },
  userNameById(id){ return this.userById(id)?.name ?? '—'; },

  /* Projects */
  listProjects(){ return get(K.projects, []); },
  getCurrentProject(){ const id = get(K.curProject, null); return this.listProjects().find(p=>p.id===id)||null; },
  setCurrentProject(id){ set(K.curProject, id); },
  upsertProject(name, ownerId){
    const p = { id:newid(), name, ownerId: ownerId || this.getCurrentUser()?.id || null };
    const all = this.listProjects(); all.push(p); set(K.projects, all);
    const cats = get(K.categories, {}); cats[p.id] = cats[p.id] || []; set(K.categories, cats);
    return p.id;
  },

  /* Categories */
  listCategories(projectId){
    const cats=get(K.categories, {});
    return (cats[projectId]||[]).map(c => typeof c === 'string' ? { name: c, color: '#4f4f8f' } : c);
  },
  upsertCategory({name, color}, projectId){
    const cats=get(K.categories, {}); cats[projectId]=cats[projectId]||[];
    // Se já existe, atualiza cor
    const idx = cats[projectId].findIndex(c => (typeof c === 'string' ? c : c.name) === name);
    if(idx >= 0) {
      cats[projectId][idx] = { name, color };
    } else {
      cats[projectId].push({ name, color });
    }
    set(K.categories, cats);
  },

  /* Notes */
  listNotes(projectId){ return get(K.notes, []).filter(n=>n.projectId===projectId); },
  upsertNote(n){
    const all=get(K.notes, []);
    const i=all.findIndex(x=>x.id===n.id);
    if(i>=0) all[i]=n; else all.push(n);
    set(K.notes, all);
  },
  deleteNote(id){ set(K.notes, get(K.notes, []).filter(n=>n.id!==id)); }
};

export default Store;