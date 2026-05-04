import { useState } from "react";
import apiClient from "../services/api";

export default function AuthScreen({ onLogin }) {
  const [tab,     setTab]     = useState("login");
  const [form,    setForm]    = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const submit = async () => {
    setError(""); setLoading(true);
    try {
      const path = tab === "login" ? "/auth/login" : "/auth/register";
      const body = tab === "login"
        ? { email: form.email, password: form.password }
        : { name: form.name, email: form.email, password: form.password };
      const data = await apiClient.post(path, body);
      onLogin(data.access_token, data.user);
    } catch (e) {
  const msg = typeof e.message === "string" ? e.message : "Erro ao realizar operação";
  setError(msg);
} finally {
      setLoading(false);
    }
  };

  const onKey = e => e.key === "Enter" && submit();

  return (
    <div className="tf-auth">
      <div className="tf-auth-left">
        <div className="tf-auth-brand">Task<em>Flow</em></div>
        <p className="tf-auth-tagline">Organize seu trabalho com clareza. Foco no que importa.</p>
        <div className="tf-auth-feats">
          {["Autenticação JWT segura", "Tarefas com prioridade e status", "Categorias personalizadas", "Dark mode & toasts"].map(f => (
            <div key={f} className="tf-auth-feat">{f}</div>
          ))}
        </div>
      </div>

      <div className="tf-auth-right">
        <h2 className="tf-auth-title">{tab === "login" ? "Bem-vindo de volta" : "Criar conta"}</h2>

        <div className="tf-auth-tabs">
          <button className={`tf-auth-tab ${tab === "login" ? "active" : ""}`} onClick={() => { setTab("login"); setError(""); }}>Login</button>
          <button className={`tf-auth-tab ${tab === "register" ? "active" : ""}`} onClick={() => { setTab("register"); setError(""); }}>Registro</button>
        </div>

        {error && <div className="tf-error-banner">{error}</div>}

        {tab === "register" && (
          <div className="tf-field">
            <label>Nome</label>
            <input className="tf-input" value={form.name} onChange={set("name")} placeholder="João Silva" onKeyDown={onKey} />
          </div>
        )}

        <div className="tf-field">
          <label>E-mail</label>
          <input className="tf-input" type="email" value={form.email} onChange={set("email")} placeholder="joao@email.com" onKeyDown={onKey} />
        </div>

        <div className="tf-field">
          <label>Senha</label>
          <input className="tf-input" type="password" value={form.password} onChange={set("password")}
            placeholder={tab === "register" ? "Mín. 8 chars, 1 maiúscula, 1 número" : "••••••••"} onKeyDown={onKey} />
        </div>

        <button className="tf-btn tf-btn-primary" style={{ width: "100%", justifyContent: "center", marginTop: 8 }} onClick={submit} disabled={loading}>
          {loading ? "Aguarde..." : tab === "login" ? "Entrar" : "Criar conta"}
        </button>
      </div>
    </div>
  );
}
