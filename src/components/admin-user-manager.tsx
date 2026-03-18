"use client";

import { useMemo, useState } from "react";

type RoleValue = "CUSTOMER" | "ADMIN" | "AFFILIATE" | "RESELLER";
type PlanValue = "DAYS_30" | "DAYS_90" | "LIFETIME";

type UserRow = {
  id: string;
  email: string;
  name: string | null;
  role: RoleValue;
  licensesCount: number;
};

const roleOptions: Array<{ value: RoleValue; label: string }> = [
  { value: "CUSTOMER", label: "Usuário" },
  { value: "ADMIN", label: "Admin" },
  { value: "AFFILIATE", label: "Influencer" },
  { value: "RESELLER", label: "Revendedor" },
];

const planOptions: Array<{ value: PlanValue; label: string }> = [
  { value: "DAYS_30", label: "30 dias" },
  { value: "DAYS_90", label: "90 dias" },
  { value: "LIFETIME", label: "Vitalícia" },
];

function generateKeyValue() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const group = () =>
    Array.from({ length: 4 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
  return `VKS-${group()}-${group()}-${group()}-${group()}`;
}

function ManagerModal({
  title,
  open,
  onClose,
  children,
}: {
  title: string;
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div
      className="modal-overlay"
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.72)", zIndex: 80, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}
    >
      <div
        className="modal-card"
        onClick={(event) => event.stopPropagation()}
        style={{ width: "100%", maxWidth: 460, borderRadius: 18, background: "linear-gradient(180deg, rgba(10,12,20,.98), rgba(8,9,16,.98))", border: "1px solid rgba(255,255,255,.08)", boxShadow: "0 25px 80px rgba(0,0,0,.45)", padding: 22 }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 18 }}>
          <h3 style={{ margin: 0, fontSize: 28 }}>{title}</h3>
          <button type="button" onClick={onClose} className="ghost-button" style={{ minWidth: 38, height: 38, padding: 0 }}>×</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function AdminUserManager({ users }: { users: UserRow[] }) {
  const [createOpen, setCreateOpen] = useState(false);
  const [licenseOpenFor, setLicenseOpenFor] = useState<UserRow | null>(null);
  const [feedback, setFeedback] = useState<string>("");

  const [createData, setCreateData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "CUSTOMER" as RoleValue,
    plan: "LIFETIME" as PlanValue,
    userKey: "",
    deviceIds: "",
    createLicense: true,
  });

  const [licenseData, setLicenseData] = useState({
    plan: "LIFETIME" as PlanValue,
    userKey: "",
    deviceIds: "",
  });

  const [submittingCreate, setSubmittingCreate] = useState(false);
  const [submittingLicense, setSubmittingLicense] = useState(false);

  const usersWithoutLicense = useMemo(() => users.filter((user) => user.licensesCount === 0), [users]);

  function updateCreate(field: keyof typeof createData, value: string | boolean) {
    setCreateData((current) => ({ ...current, [field]: value as never }));
  }

  function updateLicense(field: keyof typeof licenseData, value: string) {
    setLicenseData((current) => ({ ...current, [field]: value }));
  }

  async function handleCreateUser(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFeedback("");

    if (createData.password !== createData.confirmPassword) {
      setFeedback("As senhas não conferem.");
      return;
    }

    setSubmittingCreate(true);

    try {
      const response = await fetch("/api/admin/users/manual", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createData),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Não foi possível criar o usuário.");

      setFeedback("Usuário criado com sucesso.");
      window.location.reload();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Erro ao criar usuário.");
    } finally {
      setSubmittingCreate(false);
    }
  }

  async function handleAddLicense(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!licenseOpenFor) return;
    setFeedback("");
    setSubmittingLicense(true);

    try {
      const response = await fetch("/api/admin/users/add-license", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: licenseOpenFor.id,
          ...licenseData,
        }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Não foi possível adicionar a key.");

      setFeedback("Key adicionada com sucesso.");
      window.location.reload();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Erro ao adicionar key.");
    } finally {
      setSubmittingLicense(false);
    }
  }

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <button type="button" className="primary-button" onClick={() => setCreateOpen(true)}>
          + Adicionar usuário
        </button>
        <span className="muted" style={{ fontSize: 13 }}>
          {usersWithoutLicense.length} conta(s) sem licença ativa.
        </span>
      </div>

      <ManagerModal title="Adicionar Usuário" open={createOpen} onClose={() => setCreateOpen(false)}>
        <form onSubmit={handleCreateUser} style={{ display: "grid", gap: 12 }}>
          <div className="field">
            <label>Nome</label>
            <input className="input" value={createData.name} onChange={(e) => updateCreate("name", e.target.value)} placeholder="Nome do cliente" />
          </div>

          <div className="field">
            <label>Email</label>
            <input className="input" type="email" required value={createData.email} onChange={(e) => updateCreate("email", e.target.value)} placeholder="cliente@email.com" />
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div className="field">
              <label>Senha</label>
              <input className="input" type="password" required value={createData.password} onChange={(e) => updateCreate("password", e.target.value)} />
            </div>
            <div className="field">
              <label>Confirmar Senha</label>
              <input className="input" type="password" required value={createData.confirmPassword} onChange={(e) => updateCreate("confirmPassword", e.target.value)} />
            </div>
          </div>

          <div className="field">
            <label>Tipo de Conta</label>
            <select className="input" value={createData.role} onChange={(e) => updateCreate("role", e.target.value)}>
              {roleOptions.map((role) => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 14 }}>
            <input type="checkbox" checked={createData.createLicense} onChange={(e) => updateCreate("createLicense", e.target.checked)} />
            Criar e vincular key agora
          </label>

          {createData.createLicense ? (
            <>
              <div className="field">
                <label>Plano da key</label>
                <select className="input" value={createData.plan} onChange={(e) => updateCreate("plan", e.target.value)}>
                  {planOptions.map((plan) => (
                    <option key={plan.value} value={plan.value}>{plan.label}</option>
                  ))}
                </select>
              </div>

              <div className="field">
                <label>User Key</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}>
                  <input className="input" value={createData.userKey} onChange={(e) => updateCreate("userKey", e.target.value.toUpperCase())} placeholder="Opcional" />
                  <button type="button" className="secondary-button" onClick={() => updateCreate("userKey", generateKeyValue())}>
                    Gerar Key
                  </button>
                </div>
              </div>

              <div className="field">
                <label>Device IDs</label>
                <input className="input" value={createData.deviceIds} onChange={(e) => updateCreate("deviceIds", e.target.value)} placeholder="Múltiplos IDs separados por vírgula" />
              </div>
            </>
          ) : null}

          {feedback ? <div className="muted" style={{ color: "#ffb4b4" }}>{feedback}</div> : null}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
            <button type="button" className="ghost-button" onClick={() => setCreateOpen(false)}>Cancelar</button>
            <button type="submit" className="primary-button" disabled={submittingCreate}>
              {submittingCreate ? "Salvando..." : "Adicionar Usuário"}
            </button>
          </div>
        </form>
      </ManagerModal>

      <ManagerModal title={`Adicionar Key${licenseOpenFor ? ` • ${licenseOpenFor.email}` : ""}`} open={!!licenseOpenFor} onClose={() => setLicenseOpenFor(null)}>
        <form onSubmit={handleAddLicense} style={{ display: "grid", gap: 12 }}>
          <div className="field">
            <label>Plano da key</label>
            <select className="input" value={licenseData.plan} onChange={(e) => updateLicense("plan", e.target.value)}>
              {planOptions.map((plan) => (
                <option key={plan.value} value={plan.value}>{plan.label}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>User Key</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}>
              <input className="input" value={licenseData.userKey} onChange={(e) => updateLicense("userKey", e.target.value.toUpperCase())} placeholder="Opcional" />
              <button type="button" className="secondary-button" onClick={() => updateLicense("userKey", generateKeyValue())}>
                Gerar Key
              </button>
            </div>
          </div>

          <div className="field">
            <label>Device IDs</label>
            <input className="input" value={licenseData.deviceIds} onChange={(e) => updateLicense("deviceIds", e.target.value)} placeholder="IDs separados por vírgula" />
          </div>

          {feedback ? <div className="muted" style={{ color: "#ffb4b4" }}>{feedback}</div> : null}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
            <button type="button" className="ghost-button" onClick={() => setLicenseOpenFor(null)}>Cancelar</button>
            <button type="submit" className="primary-button" disabled={submittingLicense}>
              {submittingLicense ? "Salvando..." : "Adicionar Key"}
            </button>
          </div>
        </form>
      </ManagerModal>

      <div style={{ display: "none" }}>
        {usersWithoutLicense.map((user) => (
          <button key={user.id} onClick={() => setLicenseOpenFor(user)} />
        ))}
      </div>
    </>
  );
}

export function AddKeyButton({ user }: { user: UserRow }) {
  const [open, setOpen] = useState(false);
  const [plan, setPlan] = useState<PlanValue>("LIFETIME");
  const [userKey, setUserKey] = useState("");
  const [deviceIds, setDeviceIds] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const response = await fetch("/api/admin/users/add-license", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, plan, userKey, deviceIds }),
      });

      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data?.error || "Não foi possível adicionar a key.");

      setMessage("Key adicionada com sucesso.");
      window.location.reload();
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Erro ao adicionar key.");
      setLoading(false);
    }
  }

  return (
    <>
      <button type="button" className="secondary-button" onClick={() => setOpen(true)}>
        {user.licensesCount > 0 ? "Nova Key" : "Adicionar Key"}
      </button>

      <ManagerModal title={`Adicionar Key • ${user.email}`} open={open} onClose={() => setOpen(false)}>
        <form onSubmit={submit} style={{ display: "grid", gap: 12 }}>
          <div className="field">
            <label>Plano da key</label>
            <select className="input" value={plan} onChange={(e) => setPlan(e.target.value as PlanValue)}>
              {planOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>

          <div className="field">
            <label>User Key</label>
            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10 }}>
              <input className="input" value={userKey} onChange={(e) => setUserKey(e.target.value.toUpperCase())} placeholder="Opcional" />
              <button type="button" className="secondary-button" onClick={() => setUserKey(generateKeyValue())}>Gerar Key</button>
            </div>
          </div>

          <div className="field">
            <label>Device IDs</label>
            <input className="input" value={deviceIds} onChange={(e) => setDeviceIds(e.target.value)} placeholder="IDs separados por vírgula" />
          </div>

          {message ? <div className="muted" style={{ color: "#ffb4b4" }}>{message}</div> : null}

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 6 }}>
            <button type="button" className="ghost-button" onClick={() => setOpen(false)}>Cancelar</button>
            <button type="submit" className="primary-button" disabled={loading}>
              {loading ? "Salvando..." : "Adicionar Key"}
            </button>
          </div>
        </form>
      </ManagerModal>
    </>
  );
}
