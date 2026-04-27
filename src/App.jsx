import { useState } from "react";
import "./styles/global.css";

import apiClient from "./services/api";

import { useTheme }      from "./hooks/useTheme";
import { useToast }      from "./hooks/useToast";
import { useConfirm }    from "./hooks/useConfirm";
import { useDebounce }   from "./hooks/useDebounce";
import { useTasks }      from "./hooks/useTasks";
import { useCategories } from "./hooks/useCategories";

import AuthScreen     from "./components/AuthScreen";
import Sidebar        from "./components/Sidebar";
import TaskCard       from "./components/TaskCard";
import TaskModal      from "./components/TaskModal";
import CategoryModal  from "./components/CategoryModal";
import Toast          from "./components/Toast";

const STATUS_LABEL   = { pending: "Pendente", in_progress: "Em andamento", done: "Concluída" };
const STATUS_NEXT    = { pending: "in_progress", in_progress: "done", done: "pending" };
const PRIORITY_LABEL = { low: "Baixa", medium: "Média", high: "Alta" };

export default function App() {
  const { theme, toggle: toggleTheme } = useTheme();
  const { toasts, toast }              = useToast();
  const { confirm, ConfirmNode }       = useConfirm();

  const [token, setToken] = useState(() => localStorage.getItem("tf_token") || "");
  const [user,  setUser]  = useState(() => { try { return JSON.parse(localStorage.getItem("tf_user") || "null"); } catch { return null; } });

  const [filter,    setFilter]    = useState({ status: "", priority: "" });
  const [activeCat, setActiveCat] = useState(null);
  const [page,      setPage]      = useState(1);
  const [search,    setSearch]    = useState("");
  const [modal,     setModal]     = useState(null);
  const [editTask,  setEditTask]  = useState(null);

  const debouncedSearch = useDebounce(search, 300);

  const { tasks, loading, error, total, totalPages, reload } = useTasks({ token, page, filter, activeCat, search: debouncedSearch });
  const { categories, reloadCategories }                     = useCategories(token);

  const login = (tok, usr) => {
    setToken(tok); setUser(usr);
    localStorage.setItem("tf_token", tok);
    localStorage.setItem("tf_user", JSON.stringify(usr));
  };

  const logout = () => {
    setToken(""); setUser(null);
    localStorage.removeItem("tf_token");
    localStorage.removeItem("tf_user");
    toast("Até logo! 👋", "success");
  };

  const setFilterKey = (k, v) => {
    setFilter(f => ({ ...f, [k]: f[k] === v ? "" : v }));
    setPage(1);
  };

  const handleFilterAll    = () => { setActiveCat(null); setFilter({ status: "", priority: "" }); setPage(1); setSearch(""); };
  const handleFilterStatus = s  => { setFilter(f => ({ ...f, status: f.status === s ? "" : s })); setActiveCat(null); setPage(1); };
  const handleFilterCat    = id => { setActiveCat(a => a === id ? null : id); setFilter({ status: "", priority: "" }); setPage(1); };

  const handleAdvance = async task => {
    try {
      await apiClient.put(`/tasks/${task.id}`, { status: STATUS_NEXT[task.status] }, token);
      toast(`Status → ${STATUS_LABEL[STATUS_NEXT[task.status]]}`, "success");
      reload();
    } catch (err) { toast(err.message, "error"); }
  };

  const handleDelete = async task => {
    const ok = await confirm({ title: "Remover tarefa?", description: `"${task.title}" será excluída permanentemente.`, confirmLabel: "Excluir", danger: true });
    if (!ok) return;
    try {
      await apiClient.delete(`/tasks/${task.id}`, token);
      toast("Tarefa removida", "success");
      reload();
    } catch (err) { toast(err.message, "error"); }
  };

  const filterLabel = () => {
    if (activeCat !== null) return categories.find(c => c.id === activeCat)?.name || "Categoria";
    if (filter.status) return STATUS_LABEL[filter.status];
    return "Todas as tarefas";
  };

  if (!token) return <AuthScreen onLogin={login} />;

  return (
    <>
      <div className="tf-app">
        {/* Topbar */}
        <header className="tf-topbar">
          <div className="tf-brand">Task<em>Flow</em></div>
          <div className="tf-topbar-right">
            <button className="tf-btn tf-btn-theme" onClick={toggleTheme}>{theme === "dark" ? "☀️" : "🌙"}</button>
            <span className="tf-user-chip">👤 {user?.name}</span>
            <button className="tf-btn" style={{ fontSize: ".7rem", padding: "5px 11px" }} onClick={logout}>Sair</button>
          </div>
        </header>

        <div className="tf-main">
          {/* Sidebar */}
          <Sidebar
            categories={categories}
            total={total}
            activeCat={activeCat}
            filterStatus={filter.status}
            onFilterAll={handleFilterAll}
            onFilterStatus={handleFilterStatus}
            onFilterCat={handleFilterCat}
            onNewCat={() => setModal("category")}
          />

          {/* Conteúdo principal */}
          <main className="tf-content">
            <div className="tf-page-header">
              <h1 className="tf-page-title">{filterLabel()}</h1>
              <button className="tf-btn tf-btn-primary" onClick={() => { setEditTask(null); setModal("task"); }}>
                + Nova tarefa
              </button>
            </div>

            {/* Busca */}
            <div className="tf-search-row">
              <span className="tf-search-icon">🔍</span>
              <input className="tf-search" placeholder="Buscar tarefas..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
            </div>

            {/* Filtros */}
            <div className="tf-filters">
              <span className="tf-filter-label">Prioridade:</span>
              {["low", "medium", "high"].map(p => (
                <button key={p} className={`tf-chip ${filter.priority === p ? "active" : ""}`} onClick={() => setFilterKey("priority", p)}>
                  {PRIORITY_LABEL[p]}
                </button>
              ))}
            </div>

            {/* Banner de erro */}
            {error && (
              <div className="tf-error-banner">
                <span>⚠️ {error}</span>
                <button className="tf-btn" style={{ fontSize: ".68rem", padding: "3px 9px" }} onClick={reload}>Tentar novamente</button>
              </div>
            )}

            {/* Lista de tarefas */}
            {loading ? (
              <div className="tf-loading">Carregando...</div>
            ) : tasks.length === 0 ? (
              <div className="tf-empty">
                <div className="tf-empty-icon">📭</div>
                <div className="tf-empty-text">{search ? `Nenhum resultado para "${search}".` : "Nenhuma tarefa aqui ainda."}</div>
              </div>
            ) : (
              <div className="tf-task-list">
                {tasks.map(t => (
                  <TaskCard key={t.id} task={t} onAdvance={handleAdvance} onEdit={t => { setEditTask(t); setModal("edit"); }} onDelete={handleDelete} />
                ))}
              </div>
            )}

            {/* Paginação */}
            {totalPages > 1 && (
              <div className="tf-pagination">
                <button className="tf-btn" disabled={page === 1} onClick={() => setPage(p => p - 1)}>← Anterior</button>
                <span className="tf-page-info">página {page} de {totalPages}</span>
                <button className="tf-btn" disabled={page >= totalPages} onClick={() => setPage(p => p + 1)}>Próxima →</button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modais */}
      {(modal === "task" || modal === "edit") && (
        <TaskModal task={modal === "edit" ? editTask : null} categories={categories} token={token} toast={toast} onSave={() => { setModal(null); reload(); }} onClose={() => setModal(null)} />
      )}
      {modal === "category" && (
        <CategoryModal token={token} toast={toast} onSave={() => { setModal(null); reloadCategories(); }} onClose={() => setModal(null)} />
      )}

      {ConfirmNode}
      <Toast toasts={toasts} />
    </>
  );
}
