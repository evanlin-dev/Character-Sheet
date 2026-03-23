import { useState, useMemo } from "react";

export const schoolMap = {
  a: "Abjuration",
  c: "Conjuration",
  d: "Divination",
  e: "Enchantment",
  v: "Evocation",
  i: "Illusion",
  n: "Necromancy",
  t: "Transmutation",
};

export const getTimeStr = (s) =>
  s.time
    ? s.time.map((t) => `${t.number} ${t.unit}${t.condition ? "*" : ""}`).join("/").trim()
    : "—";

export const getRangeStr = (s) => {
  if (!s.range) return "—";
  if (s.range.type === "point" && s.range.distance) {
    const d = s.range.distance;
    if (d.type === "self") return "Self";
    if (d.type === "touch") return "Touch";
    if (d.type === "unlimited") return "Unlimited";
    if (d.amount) return `${d.amount} ${d.type}`;
    return d.type || "—";
  }
  return s.range.type || "—";
};

export default function SpellTable({
  spells,
  selectedSpells,
  onToggleSpell,
  onSetDetail,
  showSource = true,
  appendBody = null,
}) {
  const [sortConfig, setSortConfig] = useState({ key: "level", dir: "asc" });

  const levelsPresent = useMemo(() => {
    return [...new Set(spells.map((s) => s.level))].sort((a, b) => a - b);
  }, [spells]);

  const getSortedForLevel = (lvl) => {
    return spells
      .filter((s) => s.level === lvl)
      .sort((a, b) => {
        let key = sortConfig.key === "level" ? "name" : sortConfig.key;
        const getVal = (s, key) => {
          if (key === "name") return s.name.toLowerCase();
          if (key === "school") return s.school || "";
          if (key === "time") return getTimeStr(s);
          if (key === "conc") return s.duration && s.duration.some((d) => d.concentration) ? 0 : 1;
          if (key === "ritual") return s.meta && s.meta.ritual ? 0 : 1;
          if (key === "mat") return s.components && (s.components.m || s.components.M) ? 0 : 1;
          if (key === "range") return getRangeStr(s);
          if (key === "source") return s.source || "";
          return "";
        };
        let va = getVal(a, key);
        let vb = getVal(b, key);
        let cmp = typeof va === "number" ? va - vb : String(va).localeCompare(String(vb));
        if (cmp === 0 && key !== "name") cmp = a.name.localeCompare(b.name);
        return sortConfig.dir === "asc" ? cmp : -cmp;
      });
  };

  const handleSort = (key) => {
    if (sortConfig.key === key) {
      if (sortConfig.dir === "asc") {
        setSortConfig({ key, dir: "desc" });
      } else {
        setSortConfig({ key: "level", dir: "asc" }); // Reset to normal
      }
    } else {
      setSortConfig({ key, dir: "asc" });
    }
  };

  const thStyle = {
    padding: "6px 8px",
    cursor: "pointer",
    userSelect: "none",
    color: "var(--ink-light)",
    textAlign: "left",
    borderBottom: "2px solid var(--gold)",
  };

  const renderTh = (label, key, style = {}) => (
    <th
      style={{
        ...thStyle,
        ...style,
        color: sortConfig.key === key ? "var(--ink)" : "var(--ink-light)",
      }}
      onClick={() => handleSort(key)}
    >
      {label} {sortConfig.key === key ? (sortConfig.dir === "asc" ? "↑" : "↓") : ""}
    </th>
  );

  const colSpan = showSource ? 9 : 8;

  return (
    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
      <thead style={{ position: "sticky", top: 0, background: "var(--parchment)", zIndex: 1, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
        <tr>
          {renderTh("Lvl", "level")}
          {renderTh("Name", "name")}
          {renderTh("Time", "time")}
          {renderTh("School", "school")}
          {renderTh("R", "ritual", { textAlign: "center", width: 20 })}
          {renderTh("C", "conc", { textAlign: "center", width: 20 })}
          {renderTh("M", "mat", { textAlign: "center", width: 20 })}
          {renderTh("Range", "range")}
          {showSource && renderTh("Source", "source")}
        </tr>
      </thead>
      {spells.length === 0 ? (
        <tbody>
          <tr>
            <td colSpan={colSpan} style={{ padding: 10, textAlign: "center", fontStyle: "italic", color: "var(--ink-light)" }}>
              No spells found.
            </td>
          </tr>
        </tbody>
      ) : (
        levelsPresent.map((lvl) => (
          <tbody key={lvl}>
            <tr>
              <td
                colSpan={colSpan}
                style={{
                  padding: "6px 8px",
                  background: "var(--parchment-dark)",
                  color: "var(--ink)",
                  fontWeight: "bold",
                  borderTop: "2px solid var(--gold)",
                  borderBottom: "1px solid var(--gold)",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                {lvl === 0 ? "Cantrips" : `Level ${lvl}`}
              </td>
            </tr>
            {getSortedForLevel(lvl).map((s, i) => {
              const isSel = selectedSpells?.has(s.name);
              const isRitual = !!(s.meta && s.meta.ritual);
              const isConc = !!(s.duration && s.duration.some((d) => d.concentration));
              const hasMat = !!(s.components && (s.components.m || s.components.M));
              return (
                <tr
                  key={s.name + (s.source || "")}
                  onClick={() => {
                    onToggleSpell && onToggleSpell(s.name);
                    if (onSetDetail) onSetDetail(s);
                  }}
                  onMouseEnter={() => { if (onSetDetail) onSetDetail(s); }}
                  style={{ cursor: "pointer", borderBottom: "1px solid rgba(212,175,55,0.2)", background: isSel ? "var(--red)" : i % 2 === 0 ? "rgba(255,255,255,0.4)" : "transparent", color: isSel ? "white" : "var(--ink)" }}
                >
                  <td style={{ padding: "4px 8px", whiteSpace: "nowrap" }}>{s.level === 0 ? "C" : s.level}</td>
                  <td style={{ padding: "4px 8px", fontWeight: 600 }}>{s.name}</td>
                  <td style={{ padding: "4px 8px", whiteSpace: "nowrap" }}>{getTimeStr(s)}</td>
                  <td style={{ padding: "4px 8px", whiteSpace: "nowrap" }}>{schoolMap[s.school?.toLowerCase()] || s.school}</td>
                  <td style={{ padding: "4px 8px", textAlign: "center" }}>{isRitual ? "✦" : ""}</td>
                  <td style={{ padding: "4px 8px", textAlign: "center" }}>{isConc ? "●" : ""}</td>
                  <td style={{ padding: "4px 8px", textAlign: "center" }}>{hasMat ? "◆" : ""}</td>
                  <td style={{ padding: "4px 8px", whiteSpace: "nowrap" }}>{getRangeStr(s)}</td>
                  {showSource && <td style={{ padding: "4px 8px", whiteSpace: "nowrap", fontSize: "0.75rem", opacity: 0.7 }}>{s.source || ""}</td>}
                </tr>
              );
            })}
          </tbody>
        ))
      )}
      {appendBody}
    </table>
  );
}