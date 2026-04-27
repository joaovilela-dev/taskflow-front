import { useState, useEffect, useCallback } from "react";

const API = "http://localhost:8000";

// ── helpers ──────────────────────────────────────────────────────────────────
const api = async (path, opts = {}, token) => {
  const res = await fetch(`${API}${path}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || "Erro desconhecido");
  return data;
};

const STATUS_LABEL = { pending: "Pendente", in_progress: "Em andamento", done: "Concluída" };
const STATUS_NEXT  = { pending: "in_progress", in_progress: "done", done: "pending" };
const PRIORITY_LABEL = { low: "Baixa", medium: "Média", high: "Alta" };

// ── CSS injetado ──────────────────────────────────────────────────────────────
const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@400;500&family=Fraunces:ital,opsz,wght@0,9..144,300;0,9..144,700;1,9..144,300&display=swap');

*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

:root {
  --ink: #0e0e12;
  --paper: #f5f3ee;
  --cream: #ede9e0;
  --border: #d8d2c5;
  --accent: #c8502a;
  --accent2: #2a6cc8;
  --muted: #8a8278;
  --mono: 'DM Mono', monospace;
  --serif: 'Fraunces', serif;
}

body { background: var(--paper); color: var(--ink); font-family: var(--mono); }

/* ── AUTH ── */
.auth-wrap {
  min-height: 100vh;
  display: grid;
  grid-template-columns: 1fr 1fr;
}
.auth-left {
  background: var(--ink);
  color: var(--paper);
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 80px;
  position: relative;
  overflow: hidden;
}
.auth-left::before {
  content: '';
  position: absolute;
  width: 500px; height: 500px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(200,80,42,.25) 0%, transparent 70%);
  top: -100px; left: -100px;
}
.auth-brand {
  font-family: var(--serif);
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 16px;
  position: relative;
}
.auth-brand span { color: var(--accent); font-style: italic; }
.auth-tagline {
  font-size: .8rem;
  color: rgba(245,243,238,.5);
  line-height: 1.7;
  max-width: 300px;
  position: relative;
}
.auth-features {
  margin-top: 48px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
}
.auth-feat {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: .75rem;
  color: rgba(245,243,238,.6);
}
.auth-feat::before {
  content: '';
  width: 6px; height: 6px;
  border-radius: 50%;
  background: var(--accent);
  flex-shrink: 0;
}

.auth-right {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 80px;
  background: var(--paper);
}
.auth-title {
  font-family: var(--serif);
  font-size: 2rem;
  font-weight: 300;
  margin-bottom: 32px;
  color: var(--ink);
}
.auth-tabs {
  display: flex;
  gap: 0;
  margin-bottom: 32px;
  border: 1px solid var(--border);
  border-radius: 6px;
  overflow: hidden;
  width: fit-content;
}
.auth-tab {
  padding: 8px 20px;
  font-family: var(--mono);
  font-size: .75rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  background: transparent;
  color: var(--muted);
  transition: all .2s;
}
.auth-tab.active {
  background: var(--ink);
  color: var(--paper);
}

.field { margin-bottom: 16px; }
.field label {
  display: block;
  font-size: .7rem;
  font-weight: 500;
  color: var(--muted);
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: .08em;
}
.field input {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--cream);
  font-family: var(--mono);
  font-size: .85rem;
  color: var(--ink);
  outline: none;
  transition: border-color .2s;
}
.field input:focus { border-color: var(--ink); }

.btn-primary {
  width: 100%;
  padding: 13px;
  background: var(--ink);
  color: var(--paper);
  border: none;
  border-radius: 6px;
  font-family: var(--mono);
  font-size: .82rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity .2s;
  margin-top: 8px;
}
.btn-primary:hover { opacity: .85; }
.btn-primary:disabled { opacity: .5; cursor: not-allowed; }

.error-msg {
  background: rgba(200,80,42,.1);
  border: 1px solid rgba(200,80,42,.3);
  color: var(--accent);
  padding: 10px 14px;
  border-radius: 6px;
  font-size: .78rem;
  margin-bottom: 16px;
}

/* ── APP SHELL ── */
.app-shell { min-height: 100vh; display: flex; flex-direction: column; }

.topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  height: 60px;
  border-bottom: 1px solid var(--border);
  background: var(--paper);
  position: sticky;
  top: 0;
  z-index: 100;
}
.topbar-brand {
  font-family: var(--serif);
  font-size: 1.4rem;
  font-weight: 700;
}
.topbar-brand span { color: var(--accent); font-style: italic; }
.topbar-right { display: flex; align-items: center; gap: 16px; }
.user-chip {
  font-size: .72rem;
  color: var(--muted);
  padding: 4px 10px;
  border: 1px solid var(--border);
  border-radius: 99px;
}
.btn-logout {
  font-family: var(--mono);
  font-size: .72rem;
  padding: 6px 14px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  color: var(--muted);
  cursor: pointer;
  transition: all .2s;
}
.btn-logout:hover { border-color: var(--accent); color: var(--accent); }

.main-content {
  display: grid;
  grid-template-columns: 240px 1fr;
  flex: 1;
}

/* ── SIDEBAR ── */
.sidebar {
  border-right: 1px solid var(--border);
  padding: 28px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.sidebar-section {
  font-size: .65rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: .1em;
  color: var(--muted);
  padding: 0 8px;
  margin: 16px 0 6px;
}
.sidebar-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 10px;
  border-radius: 6px;
  font-size: .78rem;
  cursor: pointer;
  transition: background .15s;
  border: none;
  background: transparent;
  color: var(--ink);
  width: 100%;
  text-align: left;
}
.sidebar-item:hover { background: var(--cream); }
.sidebar-item.active { background: var(--ink); color: var(--paper); }
.sidebar-count {
  font-size: .65rem;
  padding: 2px 7px;
  border-radius: 99px;
  background: rgba(0,0,0,.08);
}
.sidebar-item.active .sidebar-count { background: rgba(255,255,255,.15); }

.cat-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.sidebar-item-inner { display: flex; align-items: center; gap: 8px; }

.btn-new-cat {
  margin-top: 8px;
  padding: 8px 10px;
  border: 1px dashed var(--border);
  border-radius: 6px;
  background: transparent;
  font-family: var(--mono);
  font-size: .75rem;
  color: var(--muted);
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: all .2s;
}
.btn-new-cat:hover { border-color: var(--ink); color: var(--ink); }

/* ── TASKS AREA ── */
.tasks-area { padding: 32px; overflow-y: auto; }
.tasks-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 28px;
}
.tasks-title {
  font-family: var(--serif);
  font-size: 1.8rem;
  font-weight: 300;
}
.btn-add-task {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  background: var(--ink);
  color: var(--paper);
  border: none;
  border-radius: 6px;
  font-family: var(--mono);
  font-size: .78rem;
  font-weight: 500;
  cursor: pointer;
  transition: opacity .2s;
}
.btn-add-task:hover { opacity: .85; }

.filters {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}
.filter-chip {
  padding: 5px 12px;
  border: 1px solid var(--border);
  border-radius: 99px;
  font-family: var(--mono);
  font-size: .72rem;
  cursor: pointer;
  background: transparent;
  color: var(--muted);
  transition: all .2s;
}
.filter-chip:hover { border-color: var(--ink); color: var(--ink); }
.filter-chip.active { background: var(--ink); color: var(--paper); border-color: var(--ink); }

/* ── TASK CARD ── */
.tasks-list { display: flex; flex-direction: column; gap: 10px; }
.task-card {
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 18px 20px;
  background: white;
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 16px;
  align-items: start;
  transition: border-color .2s, box-shadow .2s;
  animation: slideIn .25s ease both;
}
@keyframes slideIn {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: none; }
}
.task-card:hover { border-color: var(--ink); box-shadow: 2px 2px 0 var(--ink); }
.task-card.done { opacity: .55; }

.task-title {
  font-size: .9rem;
  font-weight: 500;
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.task-card.done .task-title { text-decoration: line-through; }
.task-meta { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; }
.tag {
  font-size: .65rem;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 4px;
  letter-spacing: .04em;
}
.tag-status-pending    { background: #fef3c7; color: #92400e; }
.tag-status-in_progress{ background: #dbeafe; color: #1e40af; }
.tag-status-done       { background: #d1fae5; color: #065f46; }
.tag-priority-low      { background: #f3f4f6; color: #6b7280; }
.tag-priority-medium   { background: #fef9c3; color: #713f12; }
.tag-priority-high     { background: #fee2e2; color: #991b1b; }
.tag-cat {
  display: flex; align-items: center; gap: 4px;
  font-size: .65rem; color: var(--muted);
}

.task-actions { display: flex; gap: 6px; align-items: center; }
.btn-icon {
  width: 30px; height: 30px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  font-size: .8rem;
  display: flex; align-items: center; justify-content: center;
  transition: all .15s;
}
.btn-icon:hover { border-color: var(--ink); background: var(--cream); }
.btn-icon.danger:hover { border-color: var(--accent); background: rgba(200,80,42,.05); }

.btn-status {
  font-family: var(--mono);
  font-size: .65rem;
  font-weight: 500;
  padding: 4px 10px;
  border: 1px solid var(--border);
  border-radius: 99px;
  background: transparent;
  cursor: pointer;
  transition: all .15s;
  white-space: nowrap;
}
.btn-status:hover { border-color: var(--accent2); color: var(--accent2); }

.empty-state {
  text-align: center;
  padding: 80px 0;
  color: var(--muted);
}
.empty-icon { font-size: 3rem; margin-bottom: 12px; opacity: .4; }
.empty-text { font-size: .85rem; }

/* ── MODAL ── */
.modal-overlay {
  position: fixed; inset: 0;
  background: rgba(14,14,18,.5);
  backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center;
  z-index: 200;
  animation: fadeIn .2s ease;
}
@keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
.modal {
  background: var(--paper);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 32px;
  width: 100%;
  max-width: 480px;
  animation: slideUp .2s ease;
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(16px); }
  to   { opacity: 1; transform: none; }
}
.modal-title {
  font-family: var(--serif);
  font-size: 1.4rem;
  font-weight: 300;
  margin-bottom: 24px;
}
.modal-actions {
  display: flex; gap: 10px; margin-top: 24px; justify-content: flex-end;
}
.btn-secondary {
  padding: 9px 18px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  font-family: var(--mono);
  font-size: .78rem;
  cursor: pointer;
  color: var(--muted);
  transition: all .2s;
}
.btn-secondary:hover { border-color: var(--ink); color: var(--ink); }

select {
  width: 100%;
  padding: 11px 14px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--cream);
  font-family: var(--mono);
  font-size: .83rem;
  color: var(--ink);
  outline: none;
  appearance: none;
  cursor: pointer;
  transition: border-color .2s;
}
select:focus { border-color: var(--ink); }

textarea {
  width: 100%;
  padding: 11px 14px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--cream);
  font-family: var(--mono);
  font-size: .83rem;
  color: var(--ink);
  outline: none;
  resize: vertical;
  min-height: 80px;
  transition: border-color .2s;
}
textarea:focus { border-color: var(--ink); }

.pagination {
  display: flex; align-items: center; gap: 12px;
  justify-content: center; margin-top: 32px;
}
.page-info { font-size: .75rem; color: var(--muted); }
.btn-page {
  padding: 6px 14px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: transparent;
  font-family: var(--mono);
  font-size: .75rem;
  cursor: pointer;
  transition: all .15s;
}
.btn-page:hover:not(:disabled) { border-color: var(--ink); }
.btn-page:disabled { opacity: .35; cursor: not-allowed; }

.loading { text-align: center; padding: 60px; color: var(--muted); font-size: .85rem; }
`;

// ── COMPONENTS ───────────────────────────────────────────────────────────────

function StyleInjector() {
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = STYLES;
    document.head.appendChild(el);
    return () => document.head.removeChild(el);
  }, []);
  return null;
}

function AuthScreen({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setError(""); setLoading(true);
    try {
      const path = tab === "login" ? "/auth/login" : "/auth/register";
      const body = tab === "login"
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };
      const data = await api(path, { method: "POST", body: JSON.stringify(body) });
      onLogin(data.access_token, data.user);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const onKey = (e) => e.key === "Enter" && submit();

  return (
    <div className="auth-wrap">
      <div className="auth-left">
        <div className="auth-brand">Task<span>Flow</span></div>
        <p className="auth-tagline">Organize seu trabalho com clareza. Foco no que importa.</p>
        <div className="auth-features">
          {["Autenticação JWT segura", "Tarefas com prioridade e status", "Categorias personalizadas", "Filtros e paginação"].map(f => (
            <div key={f} className="auth-feat">{f}</div>
          ))}
        </div>
      </div>
      <div className="auth-right">
        <h2 className="auth-title">{tab === "login" ? "Bem-vindo de volta" : "Criar conta"}</h2>
        <div className="auth-tabs">
          <button className={`auth-tab ${tab === "login" ? "active" : ""}`} onClick={() => { setTab("login"); setError(""); }}>Login</button>
          <button className={`auth-tab ${tab === "register" ? "active" : ""}`} onClick={() => { setTab("register"); setError(""); }}>Registro</button>
        </div>
        {error && <div className="error-msg">{error}</div>}
        {tab === "register" && (
          <div className="field">
            <label>Nome</label>
            <input value={form.name} onChange={set("name")} placeholder="João Silva" onKeyDown={onKey} />
          </div>
        )}
        <div className="field">
          <label>E-mail</label>
          <input type="email" value={form.email} onChange={set("email")} placeholder="joao@email.com" onKeyDown={onKey} />
        </div>
        <div className="field">
          <label>Senha</label>
          <input type="password" value={form.password} onChange={set("password")} placeholder={tab === "register" ? "Mín. 8 chars, 1 maiúscula, 1 número" : "••••••••"} onKeyDown={onKey} />
        </div>
        <button className="btn-primary" onClick={submit} disabled={loading}>
          {loading ? "Aguarde..." : tab === "login" ? "Entrar" : "Criar conta"}
        </button>
      </div>
    </div>
  );
}

function TaskModal({ task, categories, token, onSave, onClose }) {
  const [form, setForm] = useState({
    title: task?.title || "",
    description: task?.description || "",
    status: task?.status || "pending",
    priority: task?.priority || "medium",
    category_id: task?.category_id || "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async () => {
    if (!form.title.trim()) { setError("Título obrigatório"); return; }
    setLoading(true); setError("");
    try {
      const body = { ...form, category_id: form.category_id || null };
      if (task) {
        await api(`/tasks/${task.id}`, { method: "PUT", body: JSON.stringify(body) }, token);
      } else {
        await api("/tasks", { method: "POST", body: JSON.stringify(body) }, token);
      }
      onSave();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h3 className="modal-title">{task ? "Editar tarefa" : "Nova tarefa"}</h3>
        {error && <div className="error-msg">{error}</div>}
        <div className="field">
          <label>Título</label>
          <input value={form.title} onChange={set("title")} placeholder="O que precisa ser feito?" autoFocus />
        </div>
        <div className="field">
          <label>Descrição</label>
          <textarea value={form.description} onChange={set("description")} placeholder="Detalhes opcionais..." />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div className="field">
            <label>Status</label>
            <select value={form.status} onChange={set("status")}>
              <option value="pending">Pendente</option>
              <option value="in_progress">Em andamento</option>
              <option value="done">Concluída</option>
            </select>
          </div>
          <div className="field">
            <label>Prioridade</label>
            <select value={form.priority} onChange={set("priority")}>
              <option value="low">Baixa</option>
              <option value="medium">Média</option>
              <option value="high">Alta</option>
            </select>
          </div>
        </div>
        <div className="field">
          <label>Categoria</label>
          <select value={form.category_id} onChange={set("category_id")}>
            <option value="">Sem categoria</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" style={{ width: "auto" }} onClick={save} disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}

function CategoryModal({ token, onSave, onClose }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("#2a6cc8");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    if (!name.trim()) { setError("Nome obrigatório"); return; }
    setLoading(true);
    try {
      await api("/categories", { method: "POST", body: JSON.stringify({ name, color }) }, token);
      onSave();
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <h3 className="modal-title">Nova categoria</h3>
        {error && <div className="error-msg">{error}</div>}
        <div className="field">
          <label>Nome</label>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Trabalho, Pessoal..." autoFocus />
        </div>
        <div className="field">
          <label>Cor</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
              style={{ width: 44, height: 44, border: "1px solid var(--border)", borderRadius: 6, padding: 2, background: "var(--cream)", cursor: "pointer" }} />
            <input value={color} onChange={(e) => setColor(e.target.value)}
              style={{ flex: 1 }} className="field input" placeholder="#2a6cc8" />
          </div>
        </div>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Cancelar</button>
          <button className="btn-primary" style={{ width: "auto" }} onClick={save} disabled={loading}>
            {loading ? "Salvando..." : "Criar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [token, setToken]       = useState(() => localStorage.getItem("tf_token") || "");
  const [user, setUser]         = useState(() => { try { return JSON.parse(localStorage.getItem("tf_user") || "null"); } catch { return null; } });
  const [tasks, setTasks]       = useState([]);
  const [categories, setCats]   = useState([]);
  const [loading, setLoading]   = useState(false);
  const [filter, setFilter]     = useState({ status: "", priority: "", category_id: "" });
  const [page, setPage]         = useState(1);
  const [total, setTotal]       = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [modal, setModal]       = useState(null); // null | 'task' | 'edit' | 'category'
  const [editTask, setEditTask] = useState(null);
  const [activeCat, setActiveCat] = useState(null);

  const PER_PAGE = 10;

  const login = (tok, usr) => {
    setToken(tok); setUser(usr);
    localStorage.setItem("tf_token", tok);
    localStorage.setItem("tf_user", JSON.stringify(usr));
  };

  const logout = () => {
    setToken(""); setUser(null);
    localStorage.removeItem("tf_token");
    localStorage.removeItem("tf_user");
  };

  const loadCats = useCallback(async () => {
    if (!token) return;
    try { setCats(await api("/categories", {}, token)); } catch {}
  }, [token]);

  const loadTasks = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, per_page: PER_PAGE });
      if (filter.status)      params.set("status", filter.status);
      if (filter.priority)    params.set("priority", filter.priority);
      if (activeCat !== null) params.set("category_id", activeCat);
      const data = await api(`/tasks?${params}`, {}, token);
      setTasks(data.items);
      setTotal(data.total);
      setTotalPages(data.total_pages);
    } catch {} finally { setLoading(false); }
  }, [token, page, filter, activeCat]);

  useEffect(() => { loadCats(); }, [loadCats]);
  useEffect(() => { loadTasks(); }, [loadTasks]);

  const deleteTask = async (id) => {
    if (!confirm("Remover essa tarefa?")) return;
    await api(`/tasks/${id}`, { method: "DELETE" }, token);
    loadTasks();
  };

  const advanceStatus = async (task) => {
    const next = STATUS_NEXT[task.status];
    await api(`/tasks/${task.id}`, { method: "PUT", body: JSON.stringify({ status: next }) }, token);
    loadTasks();
  };

  const setFilterKey = (k, v) => {
    setFilter((f) => ({ ...f, [k]: f[k] === v ? "" : v }));
    setPage(1);
  };

  if (!token) return <><StyleInjector /><AuthScreen onLogin={login} /></>;

  const filterLabel = () => {
    if (activeCat !== null) return categories.find(c => c.id === activeCat)?.name || "Categoria";
    return "Todas as tarefas";
  };

  return (
    <>
      <StyleInjector />
      <div className="app-shell">
        {/* TOPBAR */}
        <header className="topbar">
          <div className="topbar-brand">Task<span>Flow</span></div>
          <div className="topbar-right">
            <span className="user-chip">👤 {user?.name}</span>
            <button className="btn-logout" onClick={logout}>Sair</button>
          </div>
        </header>

        <div className="main-content">
          {/* SIDEBAR */}
          <aside className="sidebar">
            <button
              className={`sidebar-item ${activeCat === null && !filter.status ? "active" : ""}`}
              onClick={() => { setActiveCat(null); setFilter({ status: "", priority: "", category_id: "" }); setPage(1); }}
            >
              <span>📋 Todas</span>
              <span className="sidebar-count">{total}</span>
            </button>

            {["pending", "in_progress", "done"].map(s => (
              <button key={s}
                className={`sidebar-item ${filter.status === s && activeCat === null ? "active" : ""}`}
                onClick={() => { setActiveCat(null); setFilterKey("status", s); }}
              >
                <span>{s === "pending" ? "⏳" : s === "in_progress" ? "🔄" : "✅"} {STATUS_LABEL[s]}</span>
              </button>
            ))}

            <div className="sidebar-section">Categorias</div>
            {categories.map(c => (
              <button key={c.id}
                className={`sidebar-item ${activeCat === c.id ? "active" : ""}`}
                onClick={() => { setActiveCat(activeCat === c.id ? null : c.id); setFilter({ status: "", priority: "", category_id: "" }); setPage(1); }}
              >
                <span className="sidebar-item-inner">
                  <span className="cat-dot" style={{ background: c.color }} />
                  {c.name}
                </span>
              </button>
            ))}
            <button className="btn-new-cat" onClick={() => setModal("category")}>+ Nova categoria</button>
          </aside>

          {/* TASKS */}
          <main className="tasks-area">
            <div className="tasks-header">
              <h1 className="tasks-title">{filterLabel()}</h1>
              <button className="btn-add-task" onClick={() => { setEditTask(null); setModal("task"); }}>
                + Nova tarefa
              </button>
            </div>

            {/* FILTERS */}
            <div className="filters">
              <span style={{ fontSize: ".72rem", color: "var(--muted)", alignSelf: "center" }}>Prioridade:</span>
              {["low", "medium", "high"].map(p => (
                <button key={p} className={`filter-chip ${filter.priority === p ? "active" : ""}`}
                  onClick={() => setFilterKey("priority", p)}>
                  {PRIORITY_LABEL[p]}
                </button>
              ))}
            </div>

            {/* LIST */}
            {loading ? (
              <div className="loading">Carregando...</div>
            ) : tasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <div className="empty-text">Nenhuma tarefa aqui ainda.</div>
              </div>
            ) : (
              <div className="tasks-list">
                {tasks.map(t => (
                  <div key={t.id} className={`task-card ${t.status === "done" ? "done" : ""}`}>
                    <div>
                      <div className="task-title">{t.title}</div>
                      <div className="task-meta">
                        <span className={`tag tag-status-${t.status}`}>{STATUS_LABEL[t.status]}</span>
                        <span className={`tag tag-priority-${t.priority}`}>{PRIORITY_LABEL[t.priority]}</span>
                        {t.category && (
                          <span className="tag-cat">
                            <span className="cat-dot" style={{ background: t.category.color }} />
                            {t.category.name}
                          </span>
                        )}
                      </div>
                      {t.description && (
                        <p style={{ fontSize: ".78rem", color: "var(--muted)", marginTop: 8 }}>{t.description}</p>
                      )}
                    </div>
                    <div className="task-actions">
                      <button className="btn-status" onClick={() => advanceStatus(t)}>
                        → {STATUS_LABEL[STATUS_NEXT[t.status]]}
                      </button>
                      <button className="btn-icon" title="Editar" onClick={() => { setEditTask(t); setModal("edit"); }}>✏️</button>
                      <button className="btn-icon danger" title="Remover" onClick={() => deleteTask(t.id)}>🗑</button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PAGINATION */}
            {totalPages > 1 && (
              <div className="pagination">
                <button className="btn-page" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Anterior</button>
                <span className="page-info">página {page} de {totalPages}</span>
                <button className="btn-page" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}>Próxima →</button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* MODALS */}
      {(modal === "task" || modal === "edit") && (
        <TaskModal
          task={modal === "edit" ? editTask : null}
          categories={categories}
          token={token}
          onSave={() => { setModal(null); loadTasks(); }}
          onClose={() => setModal(null)}
        />
      )}
      {modal === "category" && (
        <CategoryModal
          token={token}
          onSave={() => { setModal(null); loadCats(); }}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
