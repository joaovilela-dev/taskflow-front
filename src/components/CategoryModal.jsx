import { useState } from "react";
import apiClient from "../services/api";

export default function CategoryModal({ token, onSave, onClose, toast }) {
  const [name,    setName]    = useState("");
  const [color,   setColor]   = useState("#2a6cc8");
  const [loading, setLoading] = useState(false);

  const save = async () => {
    if (!name.trim()) { toast("Nome é obrigatório", "error"); return; }
    setLoading(true);
    try {
      await apiClient.post("/categories", { name, color }, token);
      toast(`Categoria "${name}" criada!`, "success");
      onSave();
    } catch (err) {
      toast(err.message, "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="tf-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="tf-modal" style={{ maxWidth: 380 }}>
        <h3 className="tf-modal-title">Nova categoria</h3>

        <div className="tf-field">
          <label>Nome</label>
          <input className="tf-input" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Trabalho, Pessoal..." autoFocus />
        </div>

        <div className="tf-field">
          <label>Cor</label>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              type="color" value={color} onChange={e => setColor(e.target.value)}
              style={{ width: 42, height: 42, border: "1px solid var(--border)", borderRadius: 6, padding: 2, background: "var(--cream)", cursor: "pointer", flexShrink: 0 }}
            />
            <input className="tf-input" value={color} onChange={e => setColor(e.target.value)} placeholder="#2a6cc8" />
          </div>
        </div>

        <div className="tf-modal-actions">
          <button className="tf-btn" onClick={onClose}>Cancelar</button>
          <button className="tf-btn tf-btn-primary" onClick={save} disabled={loading}>
            {loading ? "Criando..." : "Criar"}
          </button>
        </div>
      </div>
    </div>
  );
}
