const STATUS_LABEL = { pending: "Pendente", in_progress: "Em andamento", done: "Concluída" };
const STATUS_ICON  = { pending: "⏳", in_progress: "🔄", done: "✅" };

export default function Sidebar({ categories, total, activeCat, filterStatus, onFilterAll, onFilterStatus, onFilterCat, onNewCat }) {
  return (
    <aside className="tf-sidebar">
      <button
        className={`tf-sidebar-item ${activeCat === null && !filterStatus ? "active" : ""}`}
        onClick={onFilterAll}
      >
        <span>📋 Todas</span>
        <span className="tf-sidebar-badge">{total}</span>
      </button>

      {["pending", "in_progress", "done"].map(s => (
        <button key={s}
          className={`tf-sidebar-item ${filterStatus === s && activeCat === null ? "active" : ""}`}
          onClick={() => onFilterStatus(s)}
        >
          <span>{STATUS_ICON[s]} {STATUS_LABEL[s]}</span>
        </button>
      ))}

      <div className="tf-sidebar-section">Categorias</div>
      {categories.map(c => (
        <button key={c.id}
          className={`tf-sidebar-item ${activeCat === c.id ? "active" : ""}`}
          onClick={() => onFilterCat(c.id)}
        >
          <span className="tf-sidebar-inner">
            <span className="tf-cat-dot" style={{ background: c.color }} />
            {c.name}
          </span>
        </button>
      ))}

      <button className="tf-btn tf-btn-dashed" onClick={onNewCat}>+ Nova categoria</button>
    </aside>
  );
}
