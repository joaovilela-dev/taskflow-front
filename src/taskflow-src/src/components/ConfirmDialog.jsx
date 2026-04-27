export default function ConfirmDialog({ title, description, confirmLabel = "Confirmar", danger = false, onConfirm, onCancel }) {
  return (
    <div className="tf-overlay" onClick={onCancel}>
      <div className="tf-modal tf-confirm-modal" onClick={e => e.stopPropagation()}>
        <h3 className="tf-modal-title">{title}</h3>
        {description && <p className="tf-confirm-desc">{description}</p>}
        <div className="tf-modal-actions">
          <button className="tf-btn" onClick={onCancel}>Cancelar</button>
          <button
            className={`tf-btn ${danger ? "tf-btn-danger" : "tf-btn-primary"}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
