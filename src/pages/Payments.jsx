// src/pages/Payments.jsx
import { useState } from "react";
import Avatar from "../components/ui/Avatar";
import Badge from "../components/ui/Badge";
import Modal from "../components/ui/Modal";
import { SearchBar, Btn, Card, PageHeader } from "../components/ui/Form";
import api from "../services/api";

const today = () => new Date().toISOString().split("T")[0];
const fmt = v => "$" + Number(v || 0).toLocaleString();

const TYPES    = ["Tuition Fee","Exam Fee","Library Fee","Lab Fee","Activity Fee","Transport","Other"];
const METHODS  = ["Cash","Bank Transfer","Card","Cheque","Online"];
const STATUSES = ["Paid","Pending","Unpaid"];

const inp = {
  width: "100%", boxSizing: "border-box",
  background: "var(--input)", border: "1px solid var(--border)",
  borderRadius: 8, padding: "9px 12px", fontSize: 13,
  color: "var(--text)", outline: "none"
};
const lbl = { fontSize: 12, fontWeight: 700, color: "var(--sub)", textTransform: "uppercase", display: "block", marginBottom: 5 };

const BLANK = { studentId: "", amount: "", discount: "0", type: "Tuition Fee", method: "Cash", dueDate: today(), status: "Paid", remarks: "" };

const PaymentsPage = ({ payments, setPayments, students, role }) => {
  const [modal, setModal]       = useState(false);
  const [form, setForm]         = useState(BLANK);
  const [saving, setSaving]     = useState(false);
  const [tab, setTab]           = useState("all");
  const [q, setQ]               = useState("");
  const [invoice, setInvoice]   = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  const canEdit = role === "Admin" || role === "Staff";

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const filtered = payments
    .filter(p => tab === "all" || (p.status || "").toLowerCase() === tab)
    .filter(p => `${p.student_name || ""} ${p.invoice_no || ""} ${p.type || ""}`.toLowerCase().includes(q.toLowerCase()));

  const totalPaid    = payments.filter(p => p.status === "Paid").reduce((s, p) => s + Number(p.amount || 0), 0);
  const totalPending = payments.filter(p => p.status === "Pending" || p.status === "Unpaid").reduce((s, p) => s + Number(p.amount || 0), 0);
  const avgPay = payments.filter(p => p.status === "Paid").length > 0
    ? Math.round(totalPaid / payments.filter(p => p.status === "Paid").length) : 0;

  const save = async () => {
    if (!form.studentId || !form.amount) return alert("Please select a student and enter amount.");
    setSaving(true);
    try {
      const res = await api.post("/payments", {
        studentId: form.studentId,
        amount: Number(form.amount),
        discount: Number(form.discount || 0),
        type: form.type,
        method: form.method,
        dueDate: form.dueDate,
        status: form.status,
        remarks: form.remarks
      });
      // Reload payments list
      const list = await api.get("/payments");
      setPayments(list.data);
      setModal(false);
      setForm(BLANK);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
    setSaving(false);
  };

  const updateStatus = async (id, status) => {
    setUpdatingId(id);
    try {
      await api.put(`/payments/${id}/status`, { status });
      setPayments(prev => prev.map(p => p.id === id ? { ...p, status } : p));
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
    setUpdatingId(null);
  };

  const selStudent = students.find(s => String(s.id) === String(form.studentId));

  return (
    <div>
      <PageHeader title="POS & Payment System" sub="Record and manage student payments"
        action={canEdit ? <Btn onClick={() => setModal(true)} icon="plus" label="New Payment" /> : null} />

      {/* STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 20 }}>
        {[
          { label: "Total Collected", value: fmt(totalPaid),    sub: "All paid" },
          { label: "Pending Amount",  value: fmt(totalPending), sub: payments.filter(p => p.status !== "Paid").length + " pending" },
          { label: "Transactions",    value: payments.length,   sub: "All time" },
          { label: "Avg Payment",     value: fmt(avgPay),       sub: "Per transaction" },
        ].map(s => (
          <div key={s.label} style={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, padding: "18px 20px" }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: "var(--text)" }}>{s.value}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)", marginTop: 2 }}>{s.label}</div>
            <div style={{ fontSize: 11, color: "var(--sub)", marginTop: 2 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* TABLE */}
      <Card p={0}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 18px", borderBottom: "1px solid var(--border)", gap: 12, flexWrap: "wrap" }}>
          <div style={{ display: "flex", gap: 4 }}>
            {[["all","All"],["paid","Paid"],["pending","Pending"],["unpaid","Unpaid"]].map(([k,l]) => (
              <button key={k} onClick={() => setTab(k)}
                style={{ padding: "6px 14px", borderRadius: 7, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700,
                  background: tab === k ? "var(--text)" : "var(--hover)",
                  color: tab === k ? "var(--card)" : "var(--sub)" }}>
                {l}
              </button>
            ))}
          </div>
          <SearchBar value={q} onChange={setQ} placeholder="Search payments..." />
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "var(--hover)" }}>
                {["Invoice","Student","Type","Method","Amount","Due Date","Status","Actions"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", textAlign: "left", fontSize: 11, fontWeight: 700, color: "var(--sub)", textTransform: "uppercase", whiteSpace: "nowrap" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr><td colSpan={8} style={{ padding: 32, textAlign: "center", color: "var(--sub)" }}>No records found</td></tr>
              )}
              {filtered.map((p, i) => {
                const st = p.status || "";
                const bg = st === "Paid" ? "#d1fae5" : st === "Unpaid" ? "#fee2e2" : "#fef3c7";
                const cl = st === "Paid" ? "#10b981" : st === "Unpaid" ? "#ef4444" : "#f59e0b";
                return (
                  <tr key={p.id} style={{ borderTop: "1px solid var(--border)", background: i % 2 === 0 ? "transparent" : "var(--hover)" }}>
                    <td style={{ padding: "10px 14px", fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "var(--text)", whiteSpace: "nowrap" }}>{p.invoice_no || "—"}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Avatar name={p.student_name || "?"} size={28} />
                        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{p.student_name || "—"}</span>
                      </div>
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: 13, color: "var(--sub)" }}>{p.type || "—"}</td>
                    <td style={{ padding: "10px 14px", fontSize: 13, color: "var(--sub)" }}>{p.method || "—"}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ fontFamily: "monospace", fontWeight: 700, fontSize: 13, color: "var(--text)" }}>{fmt(p.amount)}</div>
                      {Number(p.discount) > 0 && <div style={{ fontSize: 10, color: "var(--sub)" }}>Disc: {fmt(p.discount)}</div>}
                    </td>
                    <td style={{ padding: "10px 14px", fontSize: 12, color: "var(--sub)", whiteSpace: "nowrap" }}>
                      {(p.due_date || p.dueDate || "").slice(0, 10) || "—"}
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 99, background: bg, color: cl }}>{st}</span>
                    </td>
                    <td style={{ padding: "10px 14px" }}>
                      <div style={{ display: "flex", gap: 6 }}>
                        <button onClick={() => setInvoice(p)}
                          style={{ padding: "4px 10px", borderRadius: 6, border: "1px solid var(--border)", background: "var(--hover)", color: "var(--text)", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>
                          Invoice
                        </button>
                        {canEdit && st !== "Paid" && (
                          <button onClick={() => updateStatus(p.id, "Paid")} disabled={updatingId === p.id}
                            style={{ padding: "4px 10px", borderRadius: 6, border: "none", background: "#d1fae5", color: "#10b981", fontSize: 11, fontWeight: 700, cursor: "pointer" }}>
                            {updatingId === p.id ? "..." : "Mark Paid"}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* NEW PAYMENT MODAL */}
      <Modal open={modal} onClose={() => { setModal(false); setForm(BLANK); }} title="Record New Payment" size="md">
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
          <div style={{ gridColumn: "1/-1" }}>
            <label style={lbl}>Student</label>
            <select value={form.studentId} onChange={e => set("studentId", e.target.value)} style={inp}>
              <option value="">-- Select Student --</option>
              {students.map(s => (
                <option key={s.id} value={s.id}>
                  {s.firstName || s.name} {s.lastName || ""} {s.admissionNo ? `(${s.admissionNo})` : ""}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label style={lbl}>Payment Type</label>
            <select value={form.type} onChange={e => set("type", e.target.value)} style={inp}>
              {TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label style={lbl}>Method</label>
            <select value={form.method} onChange={e => set("method", e.target.value)} style={inp}>
              {METHODS.map(m => <option key={m}>{m}</option>)}
            </select>
          </div>

          <div>
            <label style={lbl}>Amount ($)</label>
            <input type="number" value={form.amount} onChange={e => set("amount", e.target.value)} placeholder="0.00" style={inp} />
          </div>

          <div>
            <label style={lbl}>Discount ($)</label>
            <input type="number" value={form.discount} onChange={e => set("discount", e.target.value)} placeholder="0" style={inp} />
          </div>

          <div>
            <label style={lbl}>Due Date</label>
            <input type="date" value={form.dueDate} onChange={e => set("dueDate", e.target.value)} style={inp} />
          </div>

          <div>
            <label style={lbl}>Status</label>
            <select value={form.status} onChange={e => set("status", e.target.value)} style={inp}>
              {STATUSES.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>

          <div style={{ gridColumn: "1/-1" }}>
            <label style={lbl}>Remarks</label>
            <textarea value={form.remarks} onChange={e => set("remarks", e.target.value)} rows={2}
              placeholder="Optional notes..." style={{ ...inp, resize: "vertical" }} />
          </div>
        </div>

        {form.amount && Number(form.amount) > 0 && (
          <div style={{ margin: "14px 0 0", padding: "12px 14px", background: "var(--hover)", borderRadius: 8, fontSize: 13 }}>
            <span style={{ color: "var(--sub)" }}>Total payable: </span>
            <strong style={{ color: "var(--text)" }}>{fmt(Number(form.amount) - Number(form.discount || 0))}</strong>
            {Number(form.discount) > 0 && <span style={{ color: "var(--sub)", marginLeft: 8 }}>(discount {fmt(form.discount)} applied)</span>}
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 18 }}>
          <Btn onClick={() => { setModal(false); setForm(BLANK); }} label="Cancel" variant="ghost" />
          <Btn onClick={save} label={saving ? "Saving..." : "Save Payment"} disabled={saving} />
        </div>
      </Modal>

      {/* INVOICE MODAL */}
      {invoice && (
        <Modal open={!!invoice} onClose={() => setInvoice(null)} title="Invoice" size="sm">
          <div style={{ fontFamily: "monospace" }}>
            <div style={{ textAlign: "center", marginBottom: 16 }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: "var(--text)" }}>INVOICE</div>
              <div style={{ fontSize: 13, color: "var(--sub)" }}>{invoice.invoice_no}</div>
            </div>
            {[
              ["Student",  invoice.student_name],
              ["Type",     invoice.type],
              ["Method",   invoice.method],
              ["Amount",   fmt(invoice.amount)],
              ["Discount", fmt(invoice.discount)],
              ["Paid",     fmt(invoice.paid)],
              ["Due Date", (invoice.due_date || "").slice(0,10)],
              ["Status",   invoice.status],
              ["Remarks",  invoice.remarks || "—"],
            ].map(([k, v]) => (
              <div key={k} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid var(--border)", fontSize: 13 }}>
                <span style={{ color: "var(--sub)", fontWeight: 600 }}>{k}</span>
                <span style={{ color: "var(--text)", fontWeight: 700 }}>{v}</span>
              </div>
            ))}
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <Btn onClick={() => window.print()} label="Print" />
          </div>
        </Modal>
      )}
    </div>
  );
};

export default PaymentsPage;