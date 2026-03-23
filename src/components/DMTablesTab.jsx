import { useState, useEffect } from "react";
import { Input, Button, Card, CardBody, CardHeader } from "@heroui/react";
import { openDB, STORE_NAME } from "src/utils/db";
import { cleanText } from "src/utils/dndEntries";

function cleanCell(cell) {
  if (cell == null) return "";
  if (typeof cell === "object") {
    if (cell.roll != null) {
      if (cell.roll.exact != null) return String(cell.roll.exact);
      return `${cell.roll.min}–${cell.roll.max}`;
    }
    return "";
  }
  return cleanText(String(cell));
}

export default function DMTablesTab() {
  const [tables, setTables] = useState([]);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const [rollResult, setRollResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const db = await openDB();
        const data = await new Promise((resolve) => {
          const req = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get("currentData");
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => resolve(null);
        });
        if (data) {
          const all = [];
          const seen = new Set();
          data.forEach((file) => {
            if (!file.name.toLowerCase().endsWith(".json")) return;
            try {
              const json = JSON.parse(file.content);
              (json.table || []).forEach((t) => {
                if (!t.name || !t.rows) return;
                const key = `${t.name}|${t.source}`;
                if (seen.has(key)) return;
                seen.add(key);
                all.push(t);
              });
            } catch {}
          });
          all.sort((a, b) => a.name.localeCompare(b.name));
          setTables(all);
          if (all.length) setSelected(all[0]);
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  const filtered = tables.filter(
    (t) => !search || t.name.toLowerCase().includes(search.toLowerCase())
  );

  const roll = (table) => {
    if (!table?.rows?.length) return;
    const idx = Math.floor(Math.random() * table.rows.length);
    const row = table.rows[idx];
    const result = row.length > 1 ? row[row.length - 1] : row[0];
    setRollResult({ idx, text: cleanCell(result) });
  };

  return (
    <div className="flex gap-4 h-full" style={{ minHeight: 0 }}>
      {/* ── Left list ── */}
      <div className="flex flex-col gap-2 shrink-0" style={{ width: 260 }}>
        <Input
          size="sm"
          placeholder="Search tables…"
          value={search}
          onValueChange={(v) => { setSearch(v); setRollResult(null); }}
          isClearable
          onClear={() => setSearch("")}
        />
        {loading && <p className="text-xs italic text-center text-default-400 mt-4">Loading…</p>}
        {!loading && tables.length === 0 && (
          <p className="text-xs italic text-center text-default-400 mt-4">No tables found in imported data.</p>
        )}
        <div className="flex flex-col gap-0.5 overflow-y-auto flex-1" style={{ maxHeight: "calc(100vh - 260px)" }}>
          {filtered.map((t, i) => (
            <button
              key={`${t.name}|${t.source}|${i}`}
              onClick={() => { setSelected(t); setRollResult(null); }}
              className={`text-left px-3 py-2 rounded text-sm transition-colors ${
                selected === t
                  ? "bg-red-800 text-white"
                  : "hover:bg-default-100 text-default-700"
              }`}
            >
              <div className="font-semibold truncate leading-tight">{t.name}</div>
              {t.source && (
                <div className={`text-xs truncate ${selected === t ? "text-red-200" : "text-default-400"}`}>
                  {t.source}{t.page ? ` · p.${t.page}` : ""}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: "calc(100vh - 220px)" }}>
        {!selected ? (
          <div className="flex items-center justify-center h-48 text-default-400 italic text-sm">
            Select a table to view.
          </div>
        ) : (
          <Card shadow="sm" style={{ border: "2px solid var(--gold)" }}>
            <CardHeader
              className="flex justify-between items-center gap-4"
              style={{ borderBottom: "1px solid var(--gold)" }}
            >
              <div className="flex-1 min-w-0">
                <h2 className="font-cinzel font-bold text-base m-0 truncate" style={{ color: "var(--ink)" }}>
                  {selected.caption || selected.name}
                </h2>
                {selected.source && (
                  <span className="text-xs text-default-400">
                    {selected.source}{selected.page ? ` · p.${selected.page}` : ""}
                  </span>
                )}
              </div>
              <Button
                color="primary"
                size="sm"
                className="font-cinzel font-bold shrink-0"
                onPress={() => roll(selected)}
              >
                🎲 Roll
              </Button>
            </CardHeader>
            <CardBody className="p-4 gap-4">
              {/* Roll result banner */}
              {rollResult && (
                <div
                  className="rounded-lg p-3 text-center"
                  style={{ background: "rgba(212,175,55,0.15)", border: "2px solid var(--gold)" }}
                >
                  <div className="text-xs font-cinzel font-bold mb-1" style={{ color: "var(--ink-light)" }}>
                    RESULT
                  </div>
                  <div
                    className="font-bold text-sm"
                    style={{ color: "var(--ink)" }}
                    dangerouslySetInnerHTML={{ __html: rollResult.text }}
                  />
                </div>
              )}

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm border-collapse">
                  {selected.colLabels?.length > 0 && (
                    <thead>
                      <tr style={{ borderBottom: "2px solid var(--gold)" }}>
                        {selected.colLabels.map((label, i) => (
                          <th
                            key={i}
                            className="text-left py-1.5 px-2 font-cinzel text-xs"
                            style={{ color: "var(--ink-light)" }}
                          >
                            {cleanText(String(label))}
                          </th>
                        ))}
                      </tr>
                    </thead>
                  )}
                  <tbody>
                    {(selected.rows || []).map((row, ri) => {
                      const isResult = rollResult?.idx === ri;
                      return (
                        <tr
                          key={ri}
                          onClick={() => {
                            const result = row.length > 1 ? row[row.length - 1] : row[0];
                            setRollResult({ idx: ri, text: cleanCell(result) });
                          }}
                          className="cursor-pointer transition-colors"
                          style={{
                            background: isResult
                              ? "rgba(212,175,55,0.25)"
                              : ri % 2 === 0 ? "transparent" : "rgba(0,0,0,0.02)",
                            borderBottom: "1px solid rgba(212,175,55,0.3)",
                            fontWeight: isResult ? 600 : "normal",
                          }}
                        >
                          {row.map((cell, ci) => (
                            <td
                              key={ci}
                              className="py-1.5 px-2"
                              dangerouslySetInnerHTML={{ __html: cleanCell(cell) }}
                            />
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </div>
  );
}
