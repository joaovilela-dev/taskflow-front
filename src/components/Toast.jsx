export default function Toast({ toasts }) {
  return (
    <div className="tf-toast-stack">
      {toasts.map(t => (
        <div key={t.id} className={`tf-toast tf-toast-${t.type} ${t.exiting ? "exit" : ""}`}>
          <span>{t.type === "success" ? "✓" : "✕"}</span>
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
