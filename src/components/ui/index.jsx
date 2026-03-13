// ─── Button ───────────────────────────────────────────────────────────────────
export const Button = ({ onClick, icon, children, variant = "primary", size = "md", disabled = false, type = "button" }) => {
  const base = "inline-flex items-center gap-2 font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed";
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2 text-sm", lg: "px-5 py-2.5 text-sm" };
  const variants = {
    primary: "bg-gray-900 text-white hover:bg-gray-700 dark:bg-white dark:text-gray-900 dark:hover:bg-gray-100",
    ghost:   "border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800",
    danger:  "border border-red-200 text-red-600 hover:bg-red-50",
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${sizes[size]} ${variants[variant]}`}>
      {icon && <Svg d={icon} s={size === "sm" ? 13 : 15} />}
      {children}
    </button>
  );
};

// ─── SVG icon shortcut ────────────────────────────────────────────────────────
export const Svg = ({ d, s = 18, className = "" }) => (
  <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" className={`flex-shrink-0 ${className}`}>
    {(d || "").split(" M").map((seg, i) => <path key={i} d={i === 0 ? seg : "M" + seg} />)}
  </svg>
);

// ─── Badge ────────────────────────────────────────────────────────────────────
export const Badge = ({ status }) => {
  const map = {
    Active:    "bg-green-50  text-green-700  ring-green-200",
    Inactive:  "bg-red-50    text-red-700    ring-red-200",
    Paid:      "bg-green-50  text-green-700  ring-green-200",
    Pending:   "bg-yellow-50 text-yellow-700 ring-yellow-200",
    Overdue:   "bg-red-50    text-red-700    ring-red-200",
    Permanent: "bg-blue-50   text-blue-700   ring-blue-200",
    Contract:  "bg-purple-50 text-purple-700 ring-purple-200",
    "Part-time": "bg-orange-50 text-orange-700 ring-orange-200",
  };
  const cls = map[status] || "bg-gray-100 text-gray-600 ring-gray-200";
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ring-1 ring-inset ${cls}`}>{status}</span>;
};

// ─── Avatar ───────────────────────────────────────────────────────────────────
export const Avatar = ({ name, size = 36 }) => {
  const ini = (name || "?").split(" ").map(w => w[0]).join("").substring(0, 2).toUpperCase();
  return (
    <div
      className="rounded-full bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-semibold flex items-center justify-center flex-shrink-0"
      style={{ width: size, height: size, fontSize: size < 36 ? 11 : 13 }}
    >
      {ini}
    </div>
  );
};

// ─── Modal ────────────────────────────────────────────────────────────────────
export const Modal = ({ open, onClose, title, children, size = "md" }) => {
  if (!open) return null;
  const maxW = { sm: "max-w-md", md: "max-w-xl", lg: "max-w-3xl", xl: "max-w-5xl" }[size];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,.5)" }}>
      <div className={`w-full ${maxW} bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl flex flex-col max-h-[90vh]`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
          <h3 className="font-bold text-base text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
            <Svg d="M18 6L6 18M6 6l12 12" s={18} />
          </button>
        </div>
        <div className="overflow-y-auto flex-1 p-6">{children}</div>
      </div>
    </div>
  );
};

// ─── Table ────────────────────────────────────────────────────────────────────
export const Table = ({ cols, rows, actions }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200 dark:border-gray-700">
          {cols.map(c => (
            <th key={c.key} className="text-left py-3 px-4 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider whitespace-nowrap">
              {c.label}
            </th>
          ))}
          {actions && <th className="text-right py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
        {rows.map((row, i) => (
          <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
            {cols.map(c => (
              <td key={c.key} className="py-3 px-4 text-gray-700 dark:text-gray-300 align-middle">
                {c.render ? c.render(row[c.key], row) : (row[c.key] ?? "—")}
              </td>
            ))}
            {actions && (
              <td className="py-3 px-4">
                <div className="flex items-center justify-end gap-1">{actions(row)}</div>
              </td>
            )}
          </tr>
        ))}
        {rows.length === 0 && (
          <tr><td colSpan={cols.length + 1} className="py-12 text-center text-sm text-gray-400">No records found</td></tr>
        )}
      </tbody>
    </table>
  </div>
);

// ─── Card ─────────────────────────────────────────────────────────────────────
export const Card = ({ children, className = "", noPad = false }) => (
  <div className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl ${noPad ? "" : "p-5"} ${className}`}>
    {children}
  </div>
);

// ─── StatCard ─────────────────────────────────────────────────────────────────
export const StatCard = ({ label, value, sub, iconD }) => (
  <Card>
    <div className="flex justify-between mb-3">
      <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-400">
        <Svg d={iconD} s={18} />
      </div>
    </div>
    <div className="text-2xl font-bold text-gray-900 dark:text-white font-mono mb-0.5">{value}</div>
    <div className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-0.5">{label}</div>
    {sub && <div className="text-xs text-gray-400">{sub}</div>}
  </Card>
);

// ─── PageHeader ───────────────────────────────────────────────────────────────
export const PageHeader = ({ title, sub, action }) => (
  <div className="flex items-start justify-between mb-6">
    <div>
      <h1 className="text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
      {sub && <p className="text-sm text-gray-400 mt-0.5">{sub}</p>}
    </div>
    {action}
  </div>
);

// ─── SearchBar ────────────────────────────────────────────────────────────────
export const SearchBar = ({ value, onChange, placeholder }) => (
  <div className="relative">
    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
      <Svg d="M21 21l-4.35-4.35M17 11A6 6 0 105 11a6 6 0 0012 0z" s={15} />
    </div>
    <input
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder || "Search…"}
      className="pl-9 pr-4 py-2 text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/10"
    />
  </div>
);

// ─── Tabs ─────────────────────────────────────────────────────────────────────
export const Tabs = ({ tabs, active, onChange }) => (
  <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-xl w-fit mb-5">
    {tabs.map(t => (
      <button
        key={t.id}
        onClick={() => onChange(t.id)}
        className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${
          active === t.id
            ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm"
            : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        }`}
      >
        {t.label}
      </button>
    ))}
  </div>
);

// ─── Form Field ───────────────────────────────────────────────────────────────
const inputCls = "w-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900/10 dark:focus:ring-white/10";

export const Field = ({ label, type = "text", value, onChange, options, placeholder, required, span = 1 }) => (
  <div style={{ gridColumn: `span ${span}` }}>
    <label className="block text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1.5">
      {label}{required && <span className="text-red-500 ml-0.5">*</span>}
    </label>
    {type === "select" ? (
      <select value={value} onChange={e => onChange(e.target.value)} className={inputCls}>
        <option value="">— Select —</option>
        {(options || []).map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    ) : type === "textarea" ? (
      <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} rows={3} className={`${inputCls} resize-y`} />
    ) : (
      <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className={inputCls} />
    )}
  </div>
);

// ─── FormGrid ─────────────────────────────────────────────────────────────────
export const FormGrid = ({ children, cols = 2 }) => (
  <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`, gap: "14px 20px" }}>
    {children}
  </div>
);

// ─── Section label ────────────────────────────────────────────────────────────
export const SectionLabel = ({ children }) => (
  <div className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest border-b border-gray-200 dark:border-gray-700 pb-2 mt-5 mb-4">
    {children}
  </div>
);

// ─── FormActions ──────────────────────────────────────────────────────────────
export const FormActions = ({ onCancel, onSave, saveLabel = "Save" }) => (
  <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
    <Button variant="ghost" onClick={onCancel}>Cancel</Button>
    <Button onClick={onSave}>{saveLabel}</Button>
  </div>
);

// ─── Spinner ──────────────────────────────────────────────────────────────────
export const Spinner = () => (
  <div className="flex items-center justify-center py-12">
    <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-900 dark:border-t-white rounded-full animate-spin" />
  </div>
);
