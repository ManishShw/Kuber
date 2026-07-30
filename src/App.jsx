import { useState, useEffect, useCallback, useRef } from "react";

import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import Overview from "./components/Overview";
import Transactions from "./components/Transactions";
import Insights from "./components/Insights";
import TxModal from "./components/TxModal";
import Toast from "./components/Toast";
import { SEED, SEED_VERSION } from "./utils/constants";

const S = {
  app: {
    display: "flex",
    minHeight: "100vh",
    fontFamily: "ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif",
    fontSize: 14,
    background:
      "radial-gradient(circle at top left, rgba(186,117,23,0.08), transparent 30%), var(--color-background-primary)",
  },
  sidebar: () => ({
    width: 220,
    flexShrink: 0,
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid var(--color-border-tertiary)",
    background: "var(--color-background-secondary)",
    position: "sticky",
    top: 0,
    height: "100vh",
    overflowY: "auto",
  }),
  mobileSidebar: (open) => ({
    width: 260,
    maxWidth: "82vw",
    display: "flex",
    flexDirection: "column",
    borderRight: "1px solid var(--color-border-tertiary)",
    background: "var(--color-background-secondary)",
    position: "fixed",
    inset: "0 auto 0 0",
    height: "100vh",
    overflowY: "auto",
    zIndex: 80,
    boxShadow: "var(--shadow-strong)",
    transform: `translateX(${open ? "0" : "-100%"})`,
    transition: "transform 0.25s ease",
  }),
  drawerScrim: (open) => ({
    position: "fixed",
    inset: 0,
    background: "rgba(17, 20, 24, 0.42)",
    opacity: open ? 1 : 0,
    pointerEvents: open ? "auto" : "none",
    transition: "opacity 0.25s ease",
    zIndex: 70,
  }),
  main: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0 },
  topbar: {
    height: 56,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "0 20px",
    borderBottom: "1px solid var(--color-border-tertiary)",
    background: "color-mix(in srgb, var(--color-background-secondary) 90%, transparent)",
    backdropFilter: "blur(14px)",
    position: "sticky",
    top: 0,
    zIndex: 10,
  },
  content: { padding: 20, flex: 1 },
  pageStage: {
    animation: "page-enter 280ms ease",
    transformOrigin: "top center",
  },
  logoRow: {
    padding: "18px 16px 14px",
    borderBottom: "1px solid var(--color-border-tertiary)",
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  logoMark: {
    width: 32,
    height: 32,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  logoText: { fontWeight: 700, fontSize: 17, letterSpacing: "0.01em" },
  navSection: { padding: "12px 8px" },
  navLabel: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.1em",
    textTransform: "uppercase",
    color: "var(--color-text-tertiary)",
    padding: "4px 8px 6px",
  },
  navItem: (active) => ({
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "8px 10px",
    borderRadius: 8,
    cursor: "pointer",
    fontSize: 13,
    fontWeight: 600,
    color: active ? "#ba7517" : "var(--color-text-secondary)",
    background: active ? "rgba(186,117,23,0.1)" : "transparent",
    border: active ? "1px solid rgba(186,117,23,0.2)" : "1px solid transparent",
    marginBottom: 2,
    transition: "all 0.15s ease",
  }),
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
    gap: 12,
    marginBottom: 20,
  },
  card: {
    background: "var(--color-background-primary)",
    border: "1px solid var(--color-border-tertiary)",
    borderRadius: 16,
    padding: 18,
    boxShadow: "var(--shadow-soft)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
  },
  cardLabel: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.08em",
    color: "var(--color-text-tertiary)",
    marginBottom: 6,
  },
  cardValue: {
    fontSize: 26,
    fontWeight: 700,
    letterSpacing: "-0.02em",
    lineHeight: 1.1,
    marginBottom: 6,
  },
  cardChange: { fontSize: 12, display: "flex", alignItems: "center", gap: 4 },
  panel: {
    background: "var(--color-background-primary)",
    border: "1px solid var(--color-border-tertiary)",
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    boxShadow: "var(--shadow-soft)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
  },
  panelHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    gap: 12,
    flexWrap: "wrap",
  },
  panelTitle: { fontSize: 15, fontWeight: 700, marginBottom: 2 },
  panelSub: { fontSize: 12, color: "var(--color-text-tertiary)" },
  tabs: {
    display: "flex",
    gap: 3,
    background: "var(--color-background-secondary)",
    borderRadius: 10,
    padding: 3,
  },
  tab: (active) => ({
    fontSize: 12,
    fontWeight: 600,
    padding: "4px 10px",
    borderRadius: 8,
    cursor: "pointer",
    color: active ? "var(--color-text-primary)" : "var(--color-text-secondary)",
    background: active ? "var(--color-background-primary)" : "transparent",
    border: "none",
    boxShadow: active ? "var(--shadow-soft)" : "none",
  }),
  txControls: { display: "flex", gap: 8, marginBottom: 14, flexWrap: "wrap" },
  searchWrap: { position: "relative", flex: 1, minWidth: 180 },
  searchInput: { width: "100%", paddingLeft: 32, boxSizing: "border-box" },
  tableWrap: {
    overflow: "auto",
    borderRadius: 12,
    border: "1px solid var(--color-border-tertiary)",
    background: "var(--color-background-primary)",
    animation: "page-enter 320ms ease",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: (sorted) => ({
    padding: "10px 14px",
    textAlign: "left",
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: "0.06em",
    textTransform: "uppercase",
    color: sorted ? "#ba7517" : "var(--color-text-tertiary)",
    background: "var(--color-background-secondary)",
    borderBottom: "1px solid var(--color-border-tertiary)",
    whiteSpace: "nowrap",
    cursor: "pointer",
    userSelect: "none",
  }),
  td: {
    padding: "12px 14px",
    borderBottom: "1px solid var(--color-border-tertiary)",
    verticalAlign: "middle",
  },
  badge: (type) => {
    const colors = {
      income: ["rgba(59,109,17,0.12)", "#3b6d11"],
      expense: ["rgba(226,75,74,0.12)", "#a32d2d"],
      transfer: ["rgba(24,95,165,0.12)", "#185fa5"],
    };
    const [bg, fg] = colors[type] || colors.transfer;
    return {
      display: "inline-flex",
      alignItems: "center",
      padding: "2px 8px",
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 700,
      background: bg,
      color: fg,
      textTransform: "capitalize",
    };
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 17, 21, 0.55)",
    zIndex: 200,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    animation: "fade-in 180ms ease",
  },
  modal: {
    background: "var(--color-background-primary)",
    border: "1px solid var(--color-border-secondary)",
    borderRadius: 18,
    padding: 24,
    width: "min(460px, 92vw)",
    boxSizing: "border-box",
    boxShadow: "var(--shadow-strong)",
    animation: "modal-pop 220ms ease",
  },
  formGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 },
  formField: { display: "flex", flexDirection: "column", gap: 5 },
  formLabel: {
    fontSize: 11,
    fontWeight: 700,
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    color: "var(--color-text-secondary)",
  },
  fab: {
    position: "fixed",
    bottom: 24,
    right: 24,
    width: 52,
    height: 52,
    borderRadius: 14,
    background: "linear-gradient(135deg, #ba7517, #d69339)",
    color: "#fff",
    fontSize: 28,
    fontWeight: 400,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    zIndex: 100,
    border: "none",
    boxShadow: "0 8px 24px rgba(186,117,23,0.35)",
    transition: "transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease",
  },
  toast: (show) => ({
    position: "fixed",
    bottom: 20,
    left: "50%",
    transform: `translateX(-50%) translateY(${show ? 0 : 12}px)`,
    background: "var(--color-background-secondary)",
    border: "1px solid var(--color-border-secondary)",
    borderRadius: 10,
    padding: "10px 18px",
    fontSize: 13,
    zIndex: 300,
    opacity: show ? 1 : 0,
    transition: "all 0.25s ease",
    pointerEvents: "none",
    display: "flex",
    alignItems: "center",
    gap: 8,
    whiteSpace: "nowrap",
    boxShadow: "var(--shadow-soft)",
  }),
  mobileMenuBtn: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    width: 36,
    height: 36,
    padding: 0,
    fontSize: 18,
  },
};

const LEGACY_SEED_SIGNATURES = [
  "1|Monthly Salary|85000|income|Salary|2026-03-28",
  "2|Freelance Web Project|22000|income|Freelance|2026-03-20",
  "3|Amazon Shopping|3200|expense|Shopping|2026-03-18",
  "4|Food Delivery|890|expense|Food & Dining|2026-03-17",
  "5|Netflix|499|expense|Entertainment|2026-03-15",
  "6|Uber Rides|1200|expense|Transport|2026-03-14",
  "7|Electricity Bill|2100|expense|Utilities|2026-03-12",
  "8|Mutual Fund SIP|10000|expense|Investment|2026-03-10",
  "9|Grocery Basket|3500|expense|Food & Dining|2026-03-09",
  "10|Monthly Salary|85000|income|Salary|2026-02-28",
  "11|Freelance Logo Design|8000|income|Freelance|2026-02-22",
  "12|Flipkart Order|5600|expense|Shopping|2026-02-20",
  "13|Doctor Visit|800|expense|Healthcare|2026-02-15",
  "14|Udemy Course|1299|expense|Education|2026-02-10",
  "15|Family Restaurant|2800|expense|Food & Dining|2026-02-08",
  "16|Petrol|1500|expense|Transport|2026-02-05",
  "17|Monthly Salary|85000|income|Salary|2026-01-30",
  "18|Internet Bill|899|expense|Utilities|2026-01-25",
  "19|Book Purchase|650|expense|Education|2026-01-20",
  "20|Dividend Income|4200|income|Investment|2026-01-15",
  "21|Gym Membership|2000|expense|Healthcare|2026-01-10",
  "22|Monthly Salary|85000|income|Salary|2025-12-30",
  "23|Year-end Bonus|30000|income|Salary|2025-12-28",
  "24|Holiday Shopping|12000|expense|Shopping|2025-12-22",
  "25|New Year Party|5000|expense|Entertainment|2025-12-31",
  "26|Monthly Salary|85000|income|Salary|2026-04-02",
  "27|Freelance Dashboard Revamp|18000|income|Freelance|2026-04-04",
  "28|BigBasket Groceries|2860|expense|Food & Dining|2026-04-05",
  "29|Metro Card Recharge|1200|expense|Transport|2026-04-03",
  "30|Electricity Bill|2240|expense|Utilities|2026-04-01",
  "31|Weekend Movie|760|expense|Entertainment|2026-04-05",
  "32|Mutual Fund SIP|10000|expense|Investment|2026-04-04",
  "33|Pharmacy Purchase|680|expense|Healthcare|2026-04-02",
];

const txSignature = (tx) => [tx.id, tx.desc, tx.amount, tx.type, tx.cat, tx.date].join("|");

const isLegacySeedData = (txs) =>
  Array.isArray(txs) &&
  txs.length === LEGACY_SEED_SIGNATURES.length &&
  txs.every((tx, index) => txSignature(tx) === LEGACY_SEED_SIGNATURES[index]);

export default function App() {
  const [txs, setTxs] = useState(() => {
    try {
      const saved = localStorage.getItem("kuber_txs");
      if (!saved) {
        localStorage.setItem("kuber_seed_version", SEED_VERSION);
        return SEED;
      }

      const parsed = JSON.parse(saved);
      if (localStorage.getItem("kuber_seed_version") !== SEED_VERSION && isLegacySeedData(parsed)) {
        localStorage.setItem("kuber_seed_version", SEED_VERSION);
        return SEED;
      }

      return parsed;
    } catch {
      return SEED;
    }
  });
  const [page, setPage] = useState("dashboard");
  const [role, setRole] = useState(() => localStorage.getItem("kuber_role") || "admin");
  const [theme, setTheme] = useState(() => localStorage.getItem("kuber_theme") || "light");
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState({ show: false, msg: "", type: "success" });
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(() => window.innerWidth <= 820);
  const toastTimer = useRef(null);

  useEffect(() => {
    localStorage.setItem("kuber_txs", JSON.stringify(txs));
  }, [txs]);

  useEffect(() => {
    localStorage.setItem("kuber_role", role);
  }, [role]);

  useEffect(() => {
    localStorage.setItem("kuber_theme", theme);
    document.documentElement.setAttribute("data-color-scheme", theme);
  }, [theme]);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  useEffect(() => {
    const onResize = () => {
      const mobile = window.innerWidth <= 820;
      setIsMobile(mobile);
      if (!mobile) setIsMobileNavOpen(false);
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const showToast = useCallback((msg, type = "success") => {
    setToast({ show: true, msg, type });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      setToast((current) => ({ ...current, show: false }));
    }, 2800);
  }, []);

  const handleSave = useCallback(
    (form) => {
      if (form.id) {
        setTxs((prev) => prev.map((tx) => (tx.id === form.id ? { ...tx, ...form } : tx)));
        showToast("Transaction updated");
      } else {
        setTxs((prev) => [{ ...form, id: Date.now() }, ...prev]);
        showToast("Transaction added");
      }
      setModal(null);
    },
    [showToast],
  );

  const handleDelete = useCallback(
    (id) => {
      if (!window.confirm("Delete this transaction?")) return;
      setTxs((prev) => prev.filter((tx) => tx.id !== id));
      showToast("Transaction deleted");
    },
    [showToast],
  );

  const exportCSV = useCallback(() => {
    const headers = ["ID", "Description", "Amount", "Type", "Category", "Date"];
    const rows = txs.map((tx) => [tx.id, tx.desc, tx.amount, tx.type, tx.cat, tx.date]);
    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");

    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    link.download = "kuber-transactions.csv";
    link.click();
    URL.revokeObjectURL(link.href);
    showToast("Exported as CSV");
  }, [showToast, txs]);

  return (
    <div style={S.app}>
      {!isMobile && <Sidebar page={page} setPage={setPage} role={role} setRole={setRole} S={S} />}
      {isMobile && <div style={S.drawerScrim(isMobileNavOpen)} onClick={() => setIsMobileNavOpen(false)} />}
      {isMobile && (
        <Sidebar
          page={page}
          setPage={(nextPage) => {
            setPage(nextPage);
            setIsMobileNavOpen(false);
          }}
          role={role}
          setRole={setRole}
          S={S}
          mobile
          open={isMobileNavOpen}
          onClose={() => setIsMobileNavOpen(false)}
        />
      )}

      <div style={S.main}>
        <Topbar
          page={page}
          theme={theme}
          setTheme={setTheme}
          exportCSV={exportCSV}
          S={S}
          onOpenNav={isMobile ? () => setIsMobileNavOpen(true) : null}
        />

        <div key={page} style={{ ...S.content, ...S.pageStage }}>
          {page === "dashboard" && <Overview txs={txs} S={S} />}
          {page === "transactions" && (
            <Transactions txs={txs} role={role} onEdit={(tx) => setModal(tx)} onDelete={handleDelete} S={S} />
          )}
          {page === "insights" && <Insights txs={txs} S={S} />}
        </div>
      </div>

      {role === "admin" && (
        <button className="kuber-fab" style={S.fab} onClick={() => setModal("add")} title="Add transaction">
          +
        </button>
      )}

      {modal && (
        <TxModal editTx={modal === "add" ? null : modal} onClose={() => setModal(null)} onSave={handleSave} S={S} />
      )}

      <Toast toast={toast} S={S} />
    </div>
  );
}
