import { Fragment, useMemo, useState } from "react";

import { fmtFull } from "../utils/helpers";
import { CAT_META } from "../utils/constants";

const PER_PAGE = 8;

export default function Transactions({ txs, role, onEdit, onDelete, S }) {
  const [search, setSearch] = useState("");
  const [fType, setFType] = useState("");
  const [fCat, setFCat] = useState("");
  const [sortKey, setSortKey] = useState("date");
  const [sortDir, setSortDir] = useState(-1);
  const [page, setPage] = useState(1);

  const cats = useMemo(() => [...new Set(txs.map((tx) => tx.cat))].sort(), [txs]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    const rows = txs.filter((tx) => {
      const matchesSearch =
        !term ||
        tx.desc.toLowerCase().includes(term) ||
        tx.cat.toLowerCase().includes(term);
      const matchesType = !fType || tx.type === fType;
      const matchesCategory = !fCat || tx.cat === fCat;
      return matchesSearch && matchesType && matchesCategory;
    });

    rows.sort((a, b) => {
      if (sortKey === "date") return sortDir * (new Date(a.date) - new Date(b.date));
      if (sortKey === "amount") return sortDir * (a.amount - b.amount);
      if (sortKey === "desc") return sortDir * a.desc.localeCompare(b.desc);
      if (sortKey === "cat") return sortDir * a.cat.localeCompare(b.cat);
      if (sortKey === "type") return sortDir * a.type.localeCompare(b.type);
      return 0;
    });

    return rows;
  }, [fCat, fType, search, sortDir, sortKey, txs]);

  const pages = Math.ceil(filtered.length / PER_PAGE) || 1;
  const currentPage = Math.min(page, pages);
  const slice = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const toggleSort = (key) => {
    if (sortKey === key) setSortDir((value) => value * -1);
    else {
      setSortKey(key);
      setSortDir(-1);
    }
    setPage(1);
  };

  return (
    <div>
      <div style={S.txControls}>
        <div style={S.searchWrap}>
          <span
            style={{
              position: "absolute",
              left: 10,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-text-tertiary)",
              fontSize: 14,
            }}
          >
            ⌕
          </span>
          <input
            style={S.searchInput}
            placeholder="Search transactions..."
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
          />
        </div>

        <select
          value={fType}
          onChange={(event) => {
            setFType(event.target.value);
            setPage(1);
          }}
          style={{ minWidth: 120 }}
        >
          <option value="">All types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
          <option value="transfer">Transfer</option>
        </select>

        <select
          value={fCat}
          onChange={(event) => {
            setFCat(event.target.value);
            setPage(1);
          }}
          style={{ minWidth: 140 }}
        >
          <option value="">All categories</option>
          {cats.map((cat) => (
            <option key={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead>
            <tr>
              {[
                ["desc", "Description"],
                ["amount", "Amount"],
                ["cat", "Category"],
                ["type", "Type"],
                ["date", "Date"],
              ].map(([field, label]) => (
                <th key={field} style={S.th(sortKey === field)} onClick={() => toggleSort(field)}>
                  {label} {sortKey === field ? (sortDir === -1 ? "↓" : "↑") : ""}
                </th>
              ))}
              {role === "admin" && <th style={S.th(false)}>Actions</th>}
            </tr>
          </thead>

          <tbody>
            {!slice.length ? (
              <tr>
                <td
                  colSpan={role === "admin" ? 6 : 5}
                  style={{ ...S.td, textAlign: "center", color: "var(--color-text-tertiary)", padding: "40px 0" }}
                >
                  No transactions found
                </td>
              </tr>
            ) : (
              slice.map((tx, index) => {
                const meta = CAT_META[tx.cat] || CAT_META.Other;
                const isPositive = tx.type === "income";

                return (
                  <tr
                    key={tx.id}
                    style={{
                      animation: `row-enter 260ms ease ${Math.min(index * 35, 210)}ms both`,
                    }}
                  >
                    <td style={S.td}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div
                          style={{
                            width: 34,
                            height: 34,
                            borderRadius: 10,
                            background: meta.bg,
                            color: meta.color,
                            display: "grid",
                            placeItems: "center",
                            fontSize: 11,
                            fontWeight: 700,
                            flexShrink: 0,
                          }}
                        >
                          {meta.icon}
                        </div>
                        <span style={{ fontWeight: 600 }}>{tx.desc}</span>
                      </div>
                    </td>

                    <td style={S.td}>
                      <span
                        style={{
                          color: isPositive ? "#3b6d11" : "#a32d2d",
                          fontFamily: "ui-monospace, SFMono-Regular, monospace",
                          fontWeight: 700,
                        }}
                      >
                        {isPositive ? "+" : "-"}
                        {fmtFull(tx.amount)}
                      </span>
                    </td>

                    <td style={S.td}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: 4,
                          padding: "2px 8px",
                          borderRadius: 20,
                          fontSize: 11,
                          background: meta.bg,
                          color: meta.color,
                          fontWeight: 700,
                        }}
                      >
                        {tx.cat}
                      </span>
                    </td>

                    <td style={S.td}>
                      <span style={S.badge(tx.type)}>{tx.type}</span>
                    </td>

                    <td style={S.td}>
                      <span style={{ fontFamily: "ui-monospace, SFMono-Regular, monospace", fontSize: 12, color: "var(--color-text-secondary)" }}>
                        {new Date(tx.date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </td>

                    {role === "admin" && (
                      <td style={S.td}>
                        <div style={{ display: "flex", gap: 6 }}>
                          <button onClick={() => onEdit(tx)}>Edit</button>
                          <button
                            onClick={() => onDelete(tx.id)}
                            style={{ background: "rgba(226,75,74,0.1)", color: "#a32d2d" }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12, flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>
          Showing {filtered.length ? (currentPage - 1) * PER_PAGE + 1 : 0}-{Math.min(currentPage * PER_PAGE, filtered.length)} of {filtered.length}
        </span>

        <div style={{ display: "flex", gap: 4 }}>
          <button disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>
            Prev
          </button>

          {Array.from({ length: pages }, (_, index) => index + 1)
            .filter((value) => value === 1 || value === pages || Math.abs(value - currentPage) <= 1)
            .map((value, index, values) => (
              <Fragment key={value}>
                {index > 0 && values[index - 1] !== value - 1 && (
                  <button disabled style={{ cursor: "default" }}>
                    ...
                  </button>
                )}
                <button
                  onClick={() => setPage(value)}
                  style={
                    value === currentPage
                      ? {
                          background: "rgba(186,117,23,0.12)",
                          color: "#ba7517",
                          border: "1px solid rgba(186,117,23,0.3)",
                          borderRadius: 8,
                          padding: "4px 10px",
                        }
                      : {}
                  }
                >
                  {value}
                </button>
              </Fragment>
            ))}

          <button disabled={currentPage === pages} onClick={() => setPage(currentPage + 1)}>
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
