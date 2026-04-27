import { useState } from "react";
import apiClient from "../services/api";

const STATUS_LABEL = { pending: "Pendente", in_progress: "Em andamento", done: "Concluída" };
const PRIORITY_LABEL = { low: "Baixa", medium: "Média", high: "Alta" };

export default function TaskModal({ task, categories, token, onSave, onClose, toast }) {
  const [form, setForm] = useState({
    title:       task?.title       || "",
    description: task?.description || "",
    status:      task?.status      || "pending",
    priority:    task?.priority    || "medium",
    category_id: task?.category_id || "",
  });
  const [loading, setLoading] = useState(false);
  const [errors,  setErrors]  = useState({});

  const set = k => e => {
    setForm(f => ({ ...f, [k]: e.target.value }));
    setErrors(e => ({ ...e, [k]: "" }));
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = "Título é obrigatório";
    return e;
  };

  const save = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      const body = { ...form, category_id: form.category_id || null };
      if (task) {
        await apiClient.put(`/tasks/${task.id}`, body, token);
        toast("Tarefa atualizada!", "success");
      } else {
        await apiClient.post("/tasks", body, token);
        toast("Tarefa criada!", "success");
      }
      onSave();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tf-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="tf-modal">
        <h3 className="tf-modal-title">{task ? "Editar tarefa" : "Nova tarefa"}</h3>

        <div className="tf-field">
          <label>Título</label>
          <input className="tf-input" value={form.title} onChange={set("title")} placeholder="O que precisa ser feito?" autoFocus />
          {errors.title && <div className="tf-field-error">{errors.title}</div>}
        </div>

        <div className="tf-field">
          <label>Descrição</label>
          <textarea className="tf-textarea" value={form.description} onChange={set("description")} placeholder="Detalhes opcionais..." />
        </div>

        <div className="tf-two-col">
          <div className="tf-field">
            <label>Status</label>
            <select className="tf-select" value={form.status} onChange={set("status")}>
              {Object.entries(STATUS_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
          <div className="tf-field">
            <label>Prioridade</label>
            <select className="tf-select" value={form.priority} onChange={set("priority")}>
              {Object.entries(PRIORITY_LABEL).map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          </div>
        </div>

        <div className="tf-field">
          <label>Categoria</label>
          <select className="tf-select" value={form.category_id} onChange={set("category_id")}>
            <option value="">Sem categoria</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div className="tf-modal-actions">
          <button className="tf-btn" onClick={onClose}>Cancelar</button>
          <button className="tf-btn tf-btn-primary" onClick={save} disabled={loading}>
            {loading ? "Salvando..." : "Salvar"}
          </button>
        </div>
      </div>
    </div>
  );
}
