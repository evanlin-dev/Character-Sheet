import { useState, useEffect, useMemo, useRef } from "react";
import { useCharacter } from "src/context/CharacterContext";
import { openDB, STORE_NAME, checkDataLoaded } from "src/utils/db";
import { processEntries, cleanText } from "src/utils/dndEntries";
import { formatPrerequisites } from "src/utils/creatorLogic";
import { getGlobalSourcePriority } from "src/utils/formatHelpers";
import { ModalOverlay, ModalBox, ModalTitle, CloseBtn } from "src/styles/shared";
import RichTextModal from "src/components/RichTextModal";

// ── Persistent collapse state ─────────────────────────────────────────────────

function useSectionCollapse(field, defaultVal = false) {
  const key = `feat_section_collapse_${field}`;
  const [collapsed, setCollapsed] = useState(() => {
    const v = localStorage.getItem(key);
    return v !== null ? v === "true" : defaultVal;
  });
  const toggle = () =>
    setCollapsed((v) => {
      localStorage.setItem(key, String(!v));
      return !v;
    });
  return [collapsed, toggle];
}

// ── Feat search modal ─────────────────────────────────────────────────────────

function renderFeatDesc(feat) {
  let html = "";
  const entries = feat.entries || feat.entry;
  if (entries) html += processEntries(Array.isArray(entries) ? entries : [entries]);
  if (feat.additionalEntries) html += "<br/><br/>" + processEntries(feat.additionalEntries);
  return cleanText(html);
}

function FeatSearchModal({ onAdd, onClose }) {
  const [feats, setFeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(null);
  const listRef = useRef(null);

  useEffect(() => {
    async function load() {
      try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const data = await new Promise((res) => {
          const req = store.get("currentData");
          req.onsuccess = () => res(req.result);
          req.onerror = () => res(null);
        });
        if (!data) return;

        const raw = [];
        data.forEach((file) => {
          if (!file.name.toLowerCase().endsWith(".json")) return;
          try {
            const json = JSON.parse(file.content);
            if (json.feat) raw.push(...json.feat);
            if (json.feats) raw.push(...json.feats);
          } catch {}
        });

        // deduplicate by name, prefer higher source priority
        const unique = new Map();
        raw.forEach((f) => {
          if (!f?.name) return;
          const id = f.name.toLowerCase();
          const ex = unique.get(id);
          if (!ex || getGlobalSourcePriority(f.source) > getGlobalSourcePriority(ex.source)) {
            unique.set(id, f);
          }
        });

        setFeats(Array.from(unique.values()).sort((a, b) => a.name.localeCompare(b.name)));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!search.trim()) return feats;
    const q = search.toLowerCase();
    return feats.filter((f) => f.name.toLowerCase().includes(q));
  }, [feats, search]);

  // Reset list scroll when search changes
  useEffect(() => {
    if (listRef.current) listRef.current.scrollTop = 0;
    setSelected(null);
  }, [search]);

  const descHtml = selected ? renderFeatDesc(selected) : "";

  const handleAdd = () => {
    if (!selected) return;
    onAdd({ title: selected.name, desc: descHtml });
    onClose();
  };

  return (
    <ModalOverlay onClick={onClose} $zIndex={1200}>
      <ModalBox
        $maxWidth="780px"
        onClick={(e) => e.stopPropagation()}
        style={{ display: "flex", flexDirection: "column", maxHeight: "85vh" }}
      >
        <CloseBtn onClick={onClose}>&times;</CloseBtn>
        <ModalTitle>Search Feats</ModalTitle>

        <div style={{ display: "flex", gap: 0, flex: 1, overflow: "hidden", borderTop: "1px solid var(--gold-light)", marginTop: 8 }}>
          {/* ── Left: list ── */}
          <div style={{ width: 240, display: "flex", flexDirection: "column", borderRight: "1px solid var(--gold-light)", flexShrink: 0 }}>
            <div style={{ padding: "10px 12px 8px" }}>
              <input
                type="text"
                placeholder="Search feats…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                style={{
                  width: "100%", padding: "6px 10px", borderRadius: 4,
                  border: "1px solid var(--gold)", fontSize: "0.9rem",
                  fontFamily: "Crimson Text, serif",
                }}
              />
            </div>
            <div ref={listRef} style={{ flex: 1, overflowY: "auto", paddingBottom: 8 }}>
              {loading ? (
                <div style={{ padding: "16px 12px", color: "var(--ink-light)", fontStyle: "italic", fontSize: "0.85rem" }}>Loading…</div>
              ) : filtered.length === 0 ? (
                <div style={{ padding: "16px 12px", color: "var(--ink-light)", fontStyle: "italic", fontSize: "0.85rem" }}>No feats found.</div>
              ) : (
                filtered.map((feat) => (
                  <div
                    key={feat.name + (feat.source || "")}
                    onClick={() => setSelected(feat)}
                    style={{
                      padding: "7px 14px",
                      cursor: "pointer",
                      fontSize: "0.88rem",
                      background: selected?.name === feat.name ? "var(--parchment-dark)" : "transparent",
                      borderLeft: `3px solid ${selected?.name === feat.name ? "var(--red-dark)" : "transparent"}`,
                      color: "var(--ink)",
                    }}
                    onMouseEnter={(e) => { if (selected?.name !== feat.name) e.currentTarget.style.background = "rgba(0,0,0,0.04)"; }}
                    onMouseLeave={(e) => { if (selected?.name !== feat.name) e.currentTarget.style.background = "transparent"; }}
                  >
                    {feat.name}
                    {feat.source && (
                      <span style={{ fontSize: "0.72rem", color: "var(--ink-light)", marginLeft: 6 }}>{feat.source}</span>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ── Right: description ── */}
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px" }}>
            {!selected ? (
              <div style={{ color: "var(--ink-light)", fontStyle: "italic", marginTop: 8 }}>
                Select a feat to view its description.
              </div>
            ) : (
              <>
                <h2 style={{ fontFamily: "Cinzel, serif", color: "var(--red-dark)", marginTop: 0, marginBottom: 6, fontSize: "1.15rem" }}>
                  {selected.name}
                </h2>
                <div style={{ fontSize: "0.82rem", color: "var(--ink-light)", marginBottom: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {selected.source && <span>Source: {selected.source}</span>}
                  {selected.category && (
                    <span>
                      {selected.category === "O" || selected.category === "Origin" ? "Origin Feat"
                        : selected.category === "G" ? "General Feat"
                        : selected.category === "EB" ? "Epic Boon"
                        : selected.category}
                    </span>
                  )}
                  {selected.prerequisite && (
                    <span style={{ color: "var(--red)" }}>Requires: {formatPrerequisites(selected)}</span>
                  )}
                </div>
                {selected.ability && (
                  <div style={{ marginBottom: 10, padding: "6px 10px", background: "rgba(255,255,255,0.5)", border: "1px solid var(--gold-light)", borderRadius: 4, fontSize: "0.88rem" }}>
                    <strong>Ability Score Increase: </strong>
                    {selected.ability.map((a, i) => {
                      if (a.choose?.from) return `Choose ${a.choose.count || 1} from ${a.choose.from.join(", ").toUpperCase()}`;
                      return Object.entries(a).filter(([k]) => k !== "choose").map(([k, v]) => `${k.toUpperCase()} +${v}`).join(", ");
                    }).join("; ")}
                  </div>
                )}
                {descHtml ? (
                  <div
                    className="rendered-desc"
                    style={{ fontSize: "0.92rem", lineHeight: 1.65, color: "var(--ink)" }}
                    dangerouslySetInnerHTML={{ __html: descHtml }}
                  />
                ) : (
                  <p style={{ color: "var(--ink-light)", fontStyle: "italic" }}>No description available.</p>
                )}
              </>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, padding: "12px 16px 4px", borderTop: "1px solid var(--gold-light)" }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button
            className="btn"
            disabled={!selected}
            onClick={handleAdd}
            style={{ opacity: selected ? 1 : 0.5, cursor: selected ? "pointer" : "default" }}
          >
            Add to Sheet
          </button>
        </div>
      </ModalBox>
    </ModalOverlay>
  );
}

// ── Individual feature item ───────────────────────────────────────────────────

function FeatureItem({ item, onUpdate, onDelete }) {
  const [isEditing, setIsEditing] = useState(false);
  const collapsed = item.collapsed || false;

  useEffect(() => {
    if (isEditing) {
      window.__modalCount = (window.__modalCount || 0) + 1;
      document.body.classList.add('modal-open');
      return () => {
        window.__modalCount = Math.max(0, (window.__modalCount || 0) - 1);
        if (window.__modalCount === 0) document.body.classList.remove('modal-open');
      };
    }
  }, [isEditing]);

  return (
    <div className="feature-box" style={{ position: "relative", marginBottom: 8 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: collapsed ? 0 : 4 }}>
        <button
          onClick={() => onUpdate({ ...item, collapsed: !collapsed })}
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.75rem", color: "var(--ink-light)", padding: "0 2px", lineHeight: 1, flexShrink: 0 }}
          title={collapsed ? "Expand" : "Collapse"}
        >
          {collapsed ? "▶" : "▼"}
        </button>
        <input
          type="text"
          className="feature-title"
          value={item.title || ""}
          onChange={(e) => onUpdate({ ...item, title: e.target.value })}
          placeholder="Feature name..."
          style={{ fontWeight: "bold", marginBottom: 0, flex: 1 }}
        />
        <button
          className="skill-info-btn"
          onClick={() => setIsEditing(true)}
          title="View/Edit Description"
          style={{ background: "none", border: "none", cursor: "pointer", fontSize: "0.85rem", padding: "0 4px", color: item.desc ? "var(--ink)" : "var(--ink-light)" }}
        >
          📝
        </button>
        <button className="delete-feature-btn" onClick={onDelete} style={{ position: "static", margin: 0, flexShrink: 0 }}>&times;</button>
      </div>
      {!collapsed && (
        <div
          className="feature-desc rendered-desc"
          onClick={() => setIsEditing(true)}
          style={{ cursor: "pointer", minHeight: "40px" }}
          dangerouslySetInnerHTML={{ __html: item.desc || "<span style='opacity: 0.5; font-style: italic;'>Click to edit description...</span>" }}
        />
      )}
      {isEditing && (
        <RichTextModal
          title={`${item.title || "Feature"} Description`}
          value={item.desc || ""}
          onChange={(val) => onUpdate({ ...item, desc: val })}
          onClose={() => setIsEditing(false)}
        />
      )}
    </div>
  );
}

// ── Feature section ───────────────────────────────────────────────────────────

function FeatureSection({ title, field, addLabel, visible, enableSearch = false }) {
  const { character, update } = useCharacter();
  const [collapsed, toggleCollapsed] = useSectionCollapse(field);
  const [showSearch, setShowSearch] = useState(false);
  const [hasData, setHasData] = useState(false);

  useEffect(() => {
    if (enableSearch) checkDataLoaded().then(setHasData);
  }, [enableSearch]);

  if (!visible) return null;
  const items = character[field] || [];

  const updateItem = (index, newItem) =>
    update({ [field]: items.map((item, i) => (i === index ? newItem : item)) });

  const deleteItem = (index) =>
    update({ [field]: items.filter((_, i) => i !== index) });

  const addItem = () =>
    update({ [field]: [...items, { title: "", desc: "" }] });

  const addFromSearch = (feat) =>
    update({ [field]: [...items, { title: feat.title, desc: feat.desc }] });

  return (
    <div className="feature-section" style={{ marginBottom: 24 }}>
      <h3
        className="section-title"
        style={{ fontSize: "1rem", marginBottom: 8, cursor: "pointer", userSelect: "none", display: "flex", alignItems: "center", gap: 8 }}
        onClick={toggleCollapsed}
      >
        <span style={{ fontSize: "0.8rem", color: "var(--ink-light)" }}>{collapsed ? "▶" : "▼"}</span>
        {title}
        <span style={{ fontSize: "0.75rem", color: "var(--ink-light)", fontFamily: "Crimson Text, serif", fontWeight: "normal" }}>
          ({items.length})
        </span>
      </h3>
      {!collapsed && (
        <>
          <div>
            {items.map((item, i) => (
              <FeatureItem
                key={i}
                item={item}
                onUpdate={(newItem) => updateItem(i, newItem)}
                onDelete={() => deleteItem(i)}
              />
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button className="add-feature-btn" onClick={addItem}>
              {addLabel}
            </button>
            {enableSearch && hasData && (
              <button
                className="add-feature-btn"
                onClick={() => setShowSearch(true)}
                style={{ background: "var(--parchment-dark)" }}
              >
                🔍 Search Feats
              </button>
            )}
          </div>
        </>
      )}

      {showSearch && (
        <FeatSearchModal
          onAdd={addFromSearch}
          onClose={() => setShowSearch(false)}
        />
      )}
    </div>
  );
}

// ── Main tab ──────────────────────────────────────────────────────────────────

const FILTERS = [
  { key: "all",        label: "All"        },
  { key: "class",      label: "Class"      },
  { key: "background", label: "Background" },
  { key: "species",    label: "Species"    },
  { key: "feats",      label: "Feats"      },
];

export default function FeaturesTab() {
  const [filter, setFilter] = useState("all");

  return (
    <div>
      <div className="mobile-spell-filter-row" style={{ marginBottom: 16 }}>
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`msv-filter-btn${filter === f.key ? " active" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <FeatureSection
        title="Class Features"
        field="classFeatures"
        addLabel="+ Add Feature"
        visible={filter === "all" || filter === "class"}
      />
      <FeatureSection
        title="Species Features"
        field="raceFeatures"
        addLabel="+ Add Feature"
        visible={filter === "all" || filter === "species"}
      />
      <FeatureSection
        title="Background Features"
        field="backgroundFeatures"
        addLabel="+ Add Feature"
        visible={filter === "all" || filter === "background"}
      />
      <FeatureSection
        title="Feats"
        field="feats"
        addLabel="+ Add Feat"
        enableSearch
        visible={filter === "all" || filter === "feats"}
      />
    </div>
  );
}
