const STATUS_LABEL = { pending: "Pendente", in_progress: "Em andamento", done: "Concluída" };
const STATUS_NEXT  = { pending: "in_progress", in_progress: "done", done: "pending" };
const PRIORITY_LABEL = { low: "Baixa", medium: "Média", high: "Alta" };

export default function TaskCard({ task, onAdvance, onEdit, onDelete }) {
  return (
    <div className={`tf-task-card ${task.status === "done" ? "done" : ""}`}>
      <div>
        <div className="tf-task-title">{task.title}</div>
        <div className="tf-task-meta">
          <span className={`tf-tag tf-tag-${task.status}`}>{STATUS_LABEL[task.status]}</span>
          <span className={`tf-tag tf-tag-${task.priority}`}>{PRIORITY_LABEL[task.priority]}</span>
          {task.category && (
            <span className="tf-tag-cat">
              <span className="tf-cat-dot" style={{ background: task.category.color }} />
              {task.category.name}
            </span>
          )}
        </div>
        {task.description && <p className="tf-task-desc">{task.description}</p>}
      </div>
      <div className="tf-task-actions">
        <button className="tf-btn-status" onClick={() => onAdvance(task)}>
          → {STATUS_LABEL[STATUS_NEXT[task.status]]}
        </button>
        <button className="tf-btn tf-btn-icon" onClick={() => onEdit(task)}>Editar</button>
        <button className="tf-btn tf-btn-icon tf-btn-danger" onClick={() => onDelete(task)}>Excluir</button>
      </div>
    </div>
  );
}
