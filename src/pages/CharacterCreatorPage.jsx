import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { processEntries, cleanText } from "src/utils/dndEntries";
import FluffImage from "src/components/FluffImage";
import { skillsMap } from "src/data/constants";
import "src/styles/CharacterCreatorPage.css";

// Prioritize XPHB > PHB > other sources; used to deduplicate lists
function sourcePriority(s) {
  if (s === "XPHB") return 0;
  if (s === "PHB") return 1;
  if (s === "EFA") return 2;
  if (s === "TCE") return 3;
  return 4;
}
function dedup(arr) {
  const map = new Map();
  arr.forEach((item) => {
    const existing = map.get(item.name);
    if (
      !existing ||
      sourcePriority(item.source) < sourcePriority(existing.source)
    ) {
      map.set(item.name, item);
    }
  });
  return [...map.values()];
}

function getBestMatch(arr, name) {
  const matches = arr.filter((x) => x.name === name);
  if (!matches.length) return null;
  return matches.sort(
    (a, b) => sourcePriority(a.source) - sourcePriority(b.source),
  )[0];
}

function resolveFeatureWithCopy(candidates, dbCollections, targetSource) {
  if (!candidates || candidates.length === 0) return null;
  let selected = null;
  if (targetSource)
    selected = candidates.find((f) => f.source === targetSource);
  if (!selected) selected = candidates.find((f) => f.source === "XPHB");
  if (
    selected &&
    !selected.entries &&
    !selected.entry &&
    !selected.description &&
    !selected._copy
  ) {
    const better = candidates.find(
      (f) =>
        (f.entries || f.entry || f.description || f._copy) &&
        (!targetSource || f.source === targetSource),
    );
    if (better) selected = better;
    else {
      const anyBetter = candidates.find(
        (f) => f.entries || f.entry || f.description || f._copy,
      );
      if (anyBetter) selected = anyBetter;
    }
  }
  if (!selected)
    selected =
      candidates.find((f) => f.source === "PHB") ||
      candidates.sort(
        (a, b) => sourcePriority(a.source) - sourcePriority(b.source),
      )[0];

  if (
    selected &&
    (!selected.entries ||
      (Array.isArray(selected.entries) &&
        selected.entries.length === 1 &&
        typeof selected.entries[0] === "string")) &&
    selected._copy
  ) {
    const copyName = selected._copy.name;
    const copySource = selected._copy.source || selected.source;
    let original = null;
    for (const col of dbCollections) {
      if (!col) continue;
      original = col.find(
        (o) =>
          o.name === copyName &&
          (o.source === copySource || !selected._copy.source) &&
          (o.entries || o.entry),
      );
      if (original) break;
    }
    if (original)
      selected = {
        ...original,
        ...selected,
        entries: original.entries || original.entry,
      };
  }
  return selected;
}

function resolveBackgroundWithCopy(bg, allBackgrounds) {
  if (!bg) return null;
  let current = bg;
  let depth = 0;
  let resolvedEntries = current.entries ? JSON.parse(JSON.stringify(current.entries)) : null;
  let resolvedSkills = current.skillProficiencies;
  let resolvedTools = current.toolProficiencies;
  let resolvedLangs = current.languageProficiencies;
  let resolvedEquip = current.startingEquipment;
  
  while (current._copy && depth < 5) {
      const original = allBackgrounds.find(b => b.name === current._copy.name && (b.source === current._copy.source || !current._copy.source));
      if (!original) break;
      
      if (!resolvedEntries && original.entries) {
          resolvedEntries = JSON.parse(JSON.stringify(original.entries));
      }
      if (!resolvedSkills && original.skillProficiencies) resolvedSkills = original.skillProficiencies;
      if (!resolvedTools && original.toolProficiencies) resolvedTools = original.toolProficiencies;
      if (!resolvedLangs && original.languageProficiencies) resolvedLangs = original.languageProficiencies;
      if (!resolvedEquip && original.startingEquipment) resolvedEquip = original.startingEquipment;

      if (current._copy._mod && current._copy._mod.entries && resolvedEntries) {
          const mods = Array.isArray(current._copy._mod.entries) ? current._copy._mod.entries : [current._copy._mod.entries];
          mods.forEach(mod => {
              if (mod.mode === 'replaceArr' && mod.replace !== undefined) {
                  let idx = -1;
                  if (typeof mod.replace === 'string') {
                      idx = resolvedEntries.findIndex(e => e.name === mod.replace);
                  } else if (typeof mod.replace === 'object' && mod.replace.index !== undefined) {
                      idx = mod.replace.index;
                  }
                  if (idx !== -1) {
                      const items = Array.isArray(mod.items) ? mod.items : [mod.items];
                      resolvedEntries.splice(idx, 1, ...items);
                  }
              } else if (mod.mode === 'insertArr' && mod.index !== undefined) {
                  const items = Array.isArray(mod.items) ? mod.items : [mod.items];
                  resolvedEntries.splice(mod.index, 0, ...items);
              }
          });
      }
      
      current = original;
      depth++;
  }
  
  return { 
      ...bg, 
      entries: resolvedEntries || bg.entries,
      skillProficiencies: resolvedSkills || bg.skillProficiencies,
      toolProficiencies: resolvedTools || bg.toolProficiencies,
      languageProficiencies: resolvedLangs || bg.languageProficiencies,
      startingEquipment: resolvedEquip || bg.startingEquipment
  };
}

const DB_NAME = "DndDataDB";
const STORE_NAME = "files";
const DB_VERSION = 7;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onblocked = () =>
      alert("Database upgrade blocked. Please close other tabs.");
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (db.objectStoreNames.contains(STORE_NAME))
        db.deleteObjectStore(STORE_NAME);
      db.createObjectStore(STORE_NAME);
    };
  });
}

const TABS = [
  "class",
  "race",
  "abilities",
  "background",
  "bgextra",
  "equipment",
  "spells",
  "feats",
  "review",
];
const TAB_LABELS = {
  class: "1. Class",
  race: "2. Species",
  abilities: "3. Abilities",
  background: "4. Background",
  bgextra: "5. Bg. Extra",
  equipment: "6. Equipment",
  spells: "7. Spells",
  feats: "8. Feats",
  review: "9. Review",
};

const STANDARD_ARRAY = [15, 14, 13, 12, 10, 8];
const ABILITY_NAMES = [
  "Strength",
  "Dexterity",
  "Constitution",
  "Intelligence",
  "Wisdom",
  "Charisma",
];
const ABILITY_KEYS = ["str", "dex", "con", "int", "wis", "cha"];
const PB_COSTS = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };
const MAX_POINTS = 27;

function calcMod(score) {
  return Math.floor((score - 10) / 2);
}
function formatMod(mod) {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}
function getPB(level) {
  return Math.ceil(level / 4) + 1;
}

// Renders HTML from processEntries
function EntryHTML({ html, style }) {
  return (
    <div dangerouslySetInnerHTML={{ __html: cleanText(html) }} style={style} />
  );
}

// ── Data Loading Hook ─────────────────────────────────────────────────────────
function useCreatorData() {
  const [data, setData] = useState({
    classes: [],
    classFeatures: [],
    subclasses: [],
    subclassFeatures: [],
    spells: [],
    optionalFeatures: [],
    feats: [],
    backgrounds: [],
    backgroundFluff: [],
    species: [],
    raceFluff: [],
    subraces: [],
    deities: [],
    items: [],
    classFluff: [],
    subclassFluff: [],
  });
  const [loading, setLoading] = useState(true);
  const [noData, setNoData] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const db = await openDB();
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          setNoData(true);
          setLoading(false);
          return;
        }
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const files = await new Promise((resolve, reject) => {
          const req = store.get("currentData");
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });
        if (!files || !files.length) {
          setNoData(true);
          setLoading(false);
          return;
        }

        const parsed = {
          classes: [],
          classFeatures: [],
          subclasses: [],
          subclassFeatures: [],
          spells: [],
          optionalFeatures: [],
          feats: [],
          backgrounds: [],
          backgroundFluff: [],
          species: [],
          raceFluff: [],
          subraces: [],
          deities: [],
          items: [],
          classFluff: [],
          subclassFluff: [],
        };

        // Build spell class map
        const spellClassMap = {};
        const processBookEntries = (entries, currentClass = null) => {
          if (!entries || !Array.isArray(entries)) return;
          entries.forEach((entry) => {
            if (!entry) return;
            let className = currentClass;
            if (
              entry.name &&
              typeof entry.name === "string" &&
              entry.name.endsWith(" Spells")
            ) {
              className = entry.name.replace(" Spells", "").trim();
            }
            if (className && entry.items && Array.isArray(entry.items)) {
              entry.items.forEach((item) => {
                const itemStr =
                  typeof item === "string" ? item : item.name || "";
                const match = /\{@spell ([^}|]+)/.exec(itemStr);
                if (match) {
                  const n = match[1].toLowerCase().trim();
                  if (!spellClassMap[n]) spellClassMap[n] = new Set();
                  spellClassMap[n].add(className);
                }
              });
            }
            if (entry.entries) processBookEntries(entry.entries, className);
          });
        };

        files.forEach((file) => {
          if (!file.name.toLowerCase().endsWith(".json")) return;
          try {
            const json = JSON.parse(file.content);
            if (json.data && Array.isArray(json.data))
              processBookEntries(json.data);
          } catch {}
        });

        files.forEach((file) => {
          if (!file.name.toLowerCase().endsWith(".json")) return;
          try {
            const json = JSON.parse(file.content);
            if (json.classFeature)
              for (const i of json.classFeature) parsed.classFeatures.push(i);
            if (json.subclass)
              for (const i of json.subclass) parsed.subclasses.push(i);
            if (json.subclassFeature)
              for (const i of json.subclassFeature)
                parsed.subclassFeatures.push(i);
            if (json.class) for (const i of json.class) parsed.classes.push(i);
            if (json.optionalfeature)
              for (const i of json.optionalfeature)
                parsed.optionalFeatures.push(i);
            if (json.feat) for (const i of json.feat) parsed.feats.push(i);
            if (json.background)
              for (const b of json.background) parsed.backgrounds.push(b);
            if (json.classFluff)
              for (const f of json.classFluff) parsed.classFluff.push(f);
            if (json.subclassFluff)
              for (const f of json.subclassFluff) parsed.subclassFluff.push(f);
            if (json.backgroundFluff) {
              const isInline = !!(
                json.background && json.background.length > 0
              );
              for (const f of json.backgroundFluff)
                parsed.backgroundFluff.push({ ...f, _inline: isInline });
            }
            if (json.race) for (const r of json.race) parsed.species.push(r);
            if (json.raceFluff) {
              const isInline = !!(json.race && json.race.length > 0);
              for (const f of json.raceFluff)
                parsed.raceFluff.push({ ...f, _inline: isInline });
            }
            if (json.subrace)
              for (const s of json.subrace) parsed.subraces.push(s);
            if (json.deity) for (const d of json.deity) parsed.deities.push(d);

            [json.item, json.items, json.baseitem, json.baseitems].forEach(
              (arr) => {
                if (Array.isArray(arr))
                  for (const i of arr) {
                    if (i.name) parsed.items.push(i);
                  }
              },
            );

            const spellArr =
              json.spell ||
              json.spells ||
              (json.data && json.data.some?.((s) => s.school || s.time)
                ? json.data
                : null);
            if (spellArr && Array.isArray(spellArr)) {
              for (const s of spellArr) {
                if (!s.name || typeof s.level !== "number") continue;
                const mapped = spellClassMap[s.name.toLowerCase().trim()];
                if (mapped) {
                  if (!s.classes) s.classes = { fromClassList: [] };
                  else if (Array.isArray(s.classes)) {
                    s.classes = {
                      fromClassList: s.classes.map((c) =>
                        typeof c === "string" ? { name: c } : c,
                      ),
                    };
                  }
                  if (!s.classes.fromClassList) s.classes.fromClassList = [];
                  mapped.forEach((c) => {
                    if (!s.classes.fromClassList.some((cl) => cl.name === c)) {
                      s.classes.fromClassList.push({ name: c, source: "PHB" });
                    }
                  });
                }
                s._normalizedClasses = new Set();
                const addC = (c) => {
                  if (!c) return;
                  s._normalizedClasses.add(
                    (typeof c === "string" ? c : c.name).toLowerCase().trim(),
                  );
                };
                if (s.classes) {
                  if (Array.isArray(s.classes)) s.classes.forEach(addC);
                  if (s.classes.fromClassList)
                    s.classes.fromClassList.forEach(addC);
                  if (s.classes.fromClassListVariant)
                    s.classes.fromClassListVariant.forEach(addC);
                }
                if (json.data === spellArr) {
                  if (s.school || s.time) parsed.spells.push(s);
                } else parsed.spells.push(s);
              }
            }
          } catch {}
        });

        console.log("All Optional Features:", parsed.optionalFeatures);
        setData(parsed);
      } catch (e) {
        console.error("Failed to load creator data:", e);
        setNoData(true);
      }
      setLoading(false);
    }
    load();
  }, []);

  return { data, loading, noData };
}

// ── Ability Score Tab ─────────────────────────────────────────────────────────
function AbilitiesTab({ scores, setScores, method, setMethod, speciesBonus }) {
  const [standardAssign, setStandardAssign] = useState({});
  const [pbValues, setPbValues] = useState({
    str: 8,
    dex: 8,
    con: 8,
    int: 8,
    wis: 8,
    cha: 8,
  });

  const pointsUsed = useMemo(
    () =>
      Object.values(pbValues).reduce((sum, v) => sum + (PB_COSTS[v] || 0), 0),
    [pbValues],
  );

  useEffect(() => {
    if (method === "manual") return;
    const final = {};
    ABILITY_KEYS.forEach((k) => {
      let base = method === "pointbuy" ? pbValues[k] : standardAssign[k] || 8;
      final[k] = base + (speciesBonus?.[k] || 0);
    });
    setScores(final);
  }, [method, pbValues, standardAssign, speciesBonus]);

  const assignedValues = Object.values(standardAssign);
  const remainingArray = STANDARD_ARRAY.filter((v, i) =>
    !assignedValues.includes(v) ||
    assignedValues.indexOf(v) !== assignedValues.lastIndexOf(v)
      ? false
      : assignedValues.filter((x) => x === v).length <
        STANDARD_ARRAY.filter((x) => x === v).length,
  );

  return (
    <div className="content-pane">
      <h2>Ability Scores</h2>
      <div
        style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}
      >
        {["pointbuy", "standard", "manual"].map((m) => (
          <button
            key={m}
            className={`btn${method === m ? " btn-primary" : ""}`}
            style={{ fontSize: "0.9rem", padding: "6px 14px" }}
            onClick={() => setMethod(m)}
          >
            {m === "pointbuy"
              ? "Point Buy"
              : m === "standard"
                ? "Standard Array"
                : "Manual"}
          </button>
        ))}
      </div>

      {method === "pointbuy" && (
        <div
          style={{
            marginBottom: 12,
            background: "rgba(255,255,255,0.5)",
            border: "1px solid var(--gold)",
            padding: "8px 12px",
            borderRadius: 4,
          }}
        >
          <strong>
            Points Used: {pointsUsed} / {MAX_POINTS}
          </strong>
          <span
            style={{
              marginLeft: 8,
              color:
                pointsUsed > MAX_POINTS ? "var(--red)" : "var(--ink-light)",
              fontSize: "0.85rem",
            }}
          >
            (Range: 8–15 per stat)
          </span>
        </div>
      )}
      {method === "standard" && (
        <div
          style={{
            marginBottom: 12,
            background: "rgba(255,255,255,0.5)",
            border: "1px solid var(--gold)",
            padding: "8px 12px",
            borderRadius: 4,
          }}
        >
          <strong>Standard Array:</strong> {STANDARD_ARRAY.join(", ")}
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 12,
        }}
      >
        {ABILITY_KEYS.map((key, i) => {
          const bonus = speciesBonus?.[key] || 0;
          const base =
            method === "pointbuy"
              ? pbValues[key]
              : method === "standard"
                ? standardAssign[key] || ""
                : scores[key] || 10;
          const total =
            method === "manual" ? scores[key] : (parseInt(base) || 0) + bonus;

          return (
            <div
              key={key}
              style={{
                background: "rgba(255,255,255,0.6)",
                border: "1px solid var(--gold)",
                borderRadius: 6,
                padding: "12px",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "Cinzel, serif",
                  fontWeight: 700,
                  color: "var(--red-dark)",
                  fontSize: "0.9rem",
                  marginBottom: 8,
                }}
              >
                {ABILITY_NAMES[i]}
              </div>

              {method === "pointbuy" && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                    marginBottom: 6,
                  }}
                >
                  <button
                    className="btn"
                    style={{ padding: "2px 8px", fontSize: "1rem" }}
                    onClick={() => {
                      const v = pbValues[key];
                      if (v > 8) setPbValues((p) => ({ ...p, [key]: v - 1 }));
                    }}
                  >
                    −
                  </button>
                  <span
                    style={{
                      fontSize: "1.4rem",
                      fontWeight: 700,
                      minWidth: 30,
                    }}
                  >
                    {pbValues[key]}
                  </span>
                  <button
                    className="btn"
                    style={{ padding: "2px 8px", fontSize: "1rem" }}
                    onClick={() => {
                      const v = pbValues[key];
                      if (
                        v < 15 &&
                        pointsUsed + (PB_COSTS[v + 1] - PB_COSTS[v]) <=
                          MAX_POINTS
                      )
                        setPbValues((p) => ({ ...p, [key]: v + 1 }));
                    }}
                  >
                    +
                  </button>
                </div>
              )}
              {method === "standard" && (
                <div style={{ marginBottom: 6 }}>
                  <select
                    className="styled-select"
                    style={{ width: "100%", textAlign: "center" }}
                    value={standardAssign[key] || ""}
                    onChange={(e) => {
                      const val = parseInt(e.target.value);
                      setStandardAssign((prev) => {
                        const next = { ...prev };
                        // Remove if same value already used elsewhere
                        const used = Object.entries(next).filter(
                          ([k, v]) => k !== key && v === val,
                        );
                        if (
                          used.length >=
                          STANDARD_ARRAY.filter((v) => v === val).length
                        ) {
                          used[0] && delete next[used[0][0]];
                        }
                        if (val) next[key] = val;
                        else delete next[key];
                        return next;
                      });
                    }}
                  >
                    <option value="">—</option>
                    {STANDARD_ARRAY.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              {method === "manual" && (
                <div style={{ marginBottom: 6 }}>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={scores[key] || 10}
                    onChange={(e) =>
                      setScores((s) => ({
                        ...s,
                        [key]: parseInt(e.target.value) || 10,
                      }))
                    }
                    style={{
                      width: "100%",
                      textAlign: "center",
                      fontSize: "1.4rem",
                      fontWeight: 700,
                      border: "1px solid var(--gold)",
                      borderRadius: 4,
                      padding: "4px",
                    }}
                  />
                </div>
              )}

              {bonus !== 0 && (
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: bonus > 0 ? "var(--green, #2d6a4f)" : "var(--red)",
                  }}
                >
                  Species: {bonus > 0 ? `+${bonus}` : bonus}
                </div>
              )}
              <div
                style={{
                  marginTop: 6,
                  fontSize: "1.1rem",
                  color: "var(--ink)",
                }}
              >
                <strong>{total}</strong>{" "}
                <span
                  style={{ color: "var(--ink-light)", fontSize: "0.85rem" }}
                >
                  ({formatMod(calcMod(total))})
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Species Tab ───────────────────────────────────────────────────────────────
function SpeciesTab({
  data,
  selected,
  onSelect,
  selectedSubrace,
  onSelectSubrace,
}) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.species
      .filter(
        (r) => !r.isSidekick && r.name && r.name.toLowerCase().includes(q),
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data.species, search]);

  const unique = useMemo(
    () => dedup(filtered).sort((a, b) => a.name.localeCompare(b.name)),
    [filtered],
  );

  const speciesObj = useMemo(() => {
    if (!selected) return null;
    return getBestMatch(data.species, selected);
  }, [selected, data.species]);

  const subraces = useMemo(() => {
    if (!selected) return [];
    return data.subraces.filter(
      (s) => s.raceName === selected || s.race?.name === selected,
    );
  }, [selected, data.subraces]);

  const fluff = useMemo(() => {
    if (!speciesObj) return null;
    return (
      data.raceFluff.find(
        (f) => f.name === selected && f.source === speciesObj.source,
      ) || data.raceFluff.find((f) => f.name === selected)
    );
  }, [selected, speciesObj, data.raceFluff]);

  return (
    <div className="split-view">
      <div className="sidebar">
        <div className="sidebar-header">
          <input
            type="text"
            className="search-input"
            placeholder="Search Species..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="sidebar-list">
          {unique.map((r) => (
            <div
              key={r.name}
              className={`list-item${selected === r.name ? " selected" : ""}`}
              onClick={() => {
                onSelect(r.name);
                onSelectSubrace(null);
              }}
            >
              {r.name}
              {r.source && r.source !== "PHB" && r.source !== "XPHB" && (
                <span className="list-item-meta">{r.source}</span>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="content-pane">
        {!speciesObj ? (
          <em style={{ color: "var(--text-muted)" }}>
            Select a species from the list...
          </em>
        ) : (
          <div>
            <h2>{speciesObj.name}</h2>
            {(fluff?.entries || speciesObj?.img) && (
              <div
                style={{
                  marginBottom: 16,
                  padding: "12px 16px",
                  background: "rgba(212,165,116,0.1)",
                  border: "1px solid var(--gold)",
                  borderRadius: 4,
                }}
              >
                <FluffImage
                  fluff={fluff}
                  baseObj={speciesObj}
                  type="races"
                  name={speciesObj.name}
                  source={speciesObj.source}
                />
                {fluff?.entries && (
                  <EntryHTML
                    html={processEntries(
                      Array.isArray(fluff.entries)
                        ? fluff.entries.slice(0, 2)
                        : fluff.entries,
                    )}
                    style={{
                      fontSize: "0.9rem",
                      fontStyle: "italic",
                      color: "var(--ink)",
                      lineHeight: 1.6,
                    }}
                  />
                )}
                <div style={{ clear: "both" }} />
              </div>
            )}
            {speciesObj.speed && (
              <p>
                <strong>Speed:</strong>{" "}
                {typeof speciesObj.speed === "object"
                  ? Object.entries(speciesObj.speed)
                      .map(([k, v]) => `${k} ${v} ft.`)
                      .join(", ")
                  : `${speciesObj.speed} ft.`}
              </p>
            )}
            {speciesObj.ability && (
              <p>
                <strong>Ability Score Increase:</strong>{" "}
                {speciesObj.ability
                  .map((a) =>
                    Object.entries(a)
                      .filter(([k]) => k !== "choose")
                      .map(([k, v]) => `${k.toUpperCase()} +${v}`)
                      .join(", "),
                  )
                  .join("; ")}
              </p>
            )}
            {speciesObj.size && (
              <p>
                <strong>Size:</strong>{" "}
                {Array.isArray(speciesObj.size)
                  ? speciesObj.size.join(" or ")
                  : speciesObj.size}
              </p>
            )}
            {speciesObj.entries && (
              <div style={{ marginTop: 12 }}>
                <EntryHTML html={processEntries(speciesObj.entries)} />
              </div>
            )}

            {subraces.length > 0 && (
              <div style={{ marginTop: 20 }}>
                <h3>Subrace</h3>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  <button
                    className={`btn${!selectedSubrace ? " btn-primary" : ""}`}
                    style={{ fontSize: "0.85rem", padding: "4px 10px" }}
                    onClick={() => onSelectSubrace(null)}
                  >
                    None
                  </button>
                  {subraces.map((sub) => (
                    <button
                      key={sub.name}
                      className={`btn${selectedSubrace?.name === sub.name ? " btn-primary" : ""}`}
                      style={{ fontSize: "0.85rem", padding: "4px 10px" }}
                      onClick={() => onSelectSubrace(sub)}
                    >
                      {sub.name}
                    </button>
                  ))}
                </div>
                {selectedSubrace?.entries && (
                  <div
                    style={{
                      background: "rgba(255,255,255,0.5)",
                      border: "1px solid var(--gold)",
                      borderRadius: 4,
                      padding: 12,
                    }}
                  >
                    <strong>{selectedSubrace.name}</strong>
                    <EntryHTML
                      html={processEntries(selectedSubrace.entries)}
                      style={{ marginTop: 8 }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Feature Choice Parsers ────────────────────────────────────────────────────
function extractChoiceLists(entries) {
  const CHOICE_RE =
    /\b(choose|pick|select)\b[^.]{0,60}?\b(one|two|three|four|five|\d+)\b|one of the following|\d+\s+of the following/i;
  const results = [];
  const wordToNum = { one: 1, two: 2, three: 3, four: 4, five: 5, a: 1, an: 1 };

  function parseCount(text) {
    const m = text.match(/\b(one|two|three|four|five|a|an|\d+)\b/i);
    if (m) return wordToNum[m[1].toLowerCase()] || parseInt(m[1], 10) || 1;
    return 1;
  }

  function stripTags(str) {
    if (typeof str !== "string") return "";
    return str.replace(/\{@[a-z]+\s([^|}]+)[^}]*\}/gi, "$1");
  }

  function extractInlineItems(raw, clean) {
    if (typeof raw !== "string") return [];
    const tagMatches = [
      ...raw.matchAll(/\{@(?:skill|feat|item|race|class)\s+([^|}\s][^|}]*)/gi),
    ];
    if (tagMatches.length >= 2)
      return tagMatches.map((m) => ({ name: m[1].trim(), type: "item" }));
    const colonIdx = clean.search(/:\s*/);
    if (colonIdx !== -1) {
      const after = clean.slice(colonIdx + 1);
      const parts = after
        .split(/,\s*|\s+or\s+/i)
        .map((s) => s.replace(/[.!?]$/, "").trim())
        .filter(
          (s) =>
            s.length > 1 &&
            s.length < 60 &&
            !/\b(you|your|the|a |an |and )\b/i.test(s),
        );
      if (parts.length >= 2)
        return parts.map((name) => ({ name, type: "item" }));
    }
    return [];
  }

  function walk(arr, depth = 0) {
    if (!Array.isArray(arr) || depth > 5) return;
    for (let i = 0; i < arr.length; i++) {
      const entry = arr[i];
      if (typeof entry === "string") {
        const clean = stripTags(entry);
        if (CHOICE_RE.test(clean)) {
          const next = arr[i + 1];
          if (
            next &&
            typeof next === "object" &&
            next.type === "list" &&
            Array.isArray(next.items)
          ) {
            const namedItems = next.items.filter(
              (it) =>
                typeof it === "object" &&
                it.name &&
                it.name.length <= 50 &&
                !/[.!?]$/.test(it.name.trim()) &&
                !/\b(attack|saving throw|bonus action|reaction|spell slot)\b/i.test(
                  it.name,
                ),
            );
            if (namedItems.length >= 2)
              results.push({
                prompt: clean,
                items: namedItems,
                count: parseCount(clean),
              });
            else if (next.items.length >= 2) {
              const strItems = next.items
                .map((it) =>
                  typeof it === "string"
                    ? { name: stripTags(it), type: "item" }
                    : it,
                )
                .filter(
                  (it) =>
                    it &&
                    it.name &&
                    it.name.length <= 60 &&
                    !/[.!?]$/.test(it.name.trim()) &&
                    !/\b(attack|saving throw|bonus action|reaction|spell slot|make a|force a|take a)\b/i.test(
                      it.name,
                    ),
                );
              if (strItems.length >= 2)
                results.push({
                  prompt: clean,
                  items: strItems,
                  count: parseCount(clean),
                });
            }
          } else {
            const inlineItems = extractInlineItems(entry, clean);
            if (inlineItems.length >= 2)
              results.push({
                prompt: clean,
                items: inlineItems,
                count: parseCount(clean),
              });
          }
        }
      } else if (entry && typeof entry === "object") {
        if (entry.type === "list" && entry.name) {
          const cleanName = stripTags(entry.name);
          if (CHOICE_RE.test(cleanName) && Array.isArray(entry.items)) {
            const namedItems = entry.items.filter(
              (it) => typeof it === "object" && it.name,
            );
            if (namedItems.length >= 2)
              results.push({
                prompt: cleanName,
                items: entry.items,
                count: parseCount(cleanName),
              });
          }
        }
        if (entry.entries) walk(entry.entries, depth + 1);
        if (entry.items && entry.type !== "list") walk(entry.items, depth + 1);
      }
    }
  }

  if (Array.isArray(entries)) walk(entries, 0);
  else if (entries && typeof entries === "object") walk([entries], 0);

  const seen = new Set();
  return results.filter((r) => {
    const k = r.prompt.slice(0, 80);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

function extractOptionSets(entries) {
  const optionSets = [];
  function walk(obj) {
    if (!obj || typeof obj !== "object") return;
    if (Array.isArray(obj)) {
      obj.forEach(walk);
      return;
    }
    if (obj.type === "options") {
      const count = obj.count != null ? obj.count : 1;
      const choices = [];
      if (obj.entries) {
        obj.entries.forEach((ent) => {
          if (ent.type === "refOptionalfeature")
            choices.push({ type: "optionalfeature", uid: ent.optionalfeature });
          else if (ent.type === "refClassFeature")
            choices.push({ type: "classFeature", uid: ent.classFeature });
          else if (ent.type === "refSubclassFeature")
            choices.push({ type: "subclassFeature", uid: ent.subclassFeature });
          else if (ent.name)
            choices.push({
              type: "entries",
              name: ent.name,
              entries: ent.entries,
            });
        });
      }
      if (choices.length > 0) {
        const setId = choices
          .map((c) => c.uid || c.name || "")
          .join("|")
          .replace(/[^a-z0-9|]/gi, "")
          .substring(0, 32);
        optionSets.push({ count, choices, setId });
      }
    }
    Object.values(obj).forEach(walk);
  }
  walk(entries);
  return optionSets;
}

function formatPrerequisites(opt) {
  if (!opt || !opt.prerequisite || !Array.isArray(opt.prerequisite)) return "";
  const groupTexts = opt.prerequisite
    .map((req) => {
      const groupReqs = [];
      if (req.level) {
        if (typeof req.level === "object") {
          let lvlStr = `Lvl ${req.level.level}`;
          if (req.level.class && req.level.class.name)
            lvlStr += ` ${req.level.class.name}`;
          groupReqs.push(lvlStr);
        } else {
          groupReqs.push(`Lvl ${req.level}`);
        }
      }
      if (req.pact) groupReqs.push(`Pact: ${req.pact}`);
      if (req.patron)
        groupReqs.push(
          `Patron: ${typeof req.patron === "string" ? req.patron : req.patron.join("/")}`,
        );
      if (req.feature)
        req.feature.forEach((f) =>
          groupReqs.push(
            `Feature: ${(typeof f === "string" ? f : f.name || "").split("|")[0]}`,
          ),
        );
      if (req.spell)
        req.spell.forEach((s) => {
          if (typeof s === "string")
            groupReqs.push(`Spell: ${s.split("#")[0]}`);
          else if (s.entry) groupReqs.push(s.entry);
        });
      if (req.optionalfeature)
        req.optionalfeature.forEach((f) =>
          groupReqs.push(`Feature: ${f.split("|")[0]}`),
        );
      if (req.item) req.item.forEach((i) => groupReqs.push(i));
      if (req.otherSummary)
        groupReqs.push(req.otherSummary.entrySummary || req.otherSummary.entry);

      if (req.ability) {
        req.ability.forEach((a) => {
          if (a.choose && a.choose.from) {
            groupReqs.push(
              `Ability: ${a.choose.from.join(" or ").toUpperCase()}`,
            );
          } else {
            const abs = Object.keys(a)
              .filter((k) => k !== "choose")
              .map((k) => `${k.toUpperCase()} ${a[k]}`)
              .join(" or ");
            if (abs) groupReqs.push(abs);
          }
        });
      }
      if (req.race) {
        const races = req.race
          .map((r) => r.name + (r.subrace ? ` (${r.subrace})` : ""))
          .join(" or ");
        if (races) groupReqs.push(`Race: ${races}`);
      }
      if (req.proficiency) {
        req.proficiency.forEach((p) => {
          if (p.armor) groupReqs.push(`Armor: ${p.armor}`);
          if (p.weapon) groupReqs.push(`Weapon: ${p.weapon}`);
          if (p.weaponGroup) groupReqs.push(`Weapon Group: ${p.weaponGroup}`);
        });
      }
      if (req.spellcasting || req.spellcasting2020 || req.spellcastingFeature)
        groupReqs.push("Spellcasting Feature");
      if (req.campaign)
        groupReqs.push(`Campaign: ${req.campaign.join(" or ")}`);

      return groupReqs.join(", ");
    })
    .filter((t) => t);
  return groupTexts.length ? groupTexts.join(" OR ") : "";
}

function FeatureChoices({
  feature,
  data,
  selectedClass,
  classSource,
  selectedLevel,
  selectedOptions,
  onToggleOption,
  containerStyle,
}) {
  const optionSets = useMemo(
    () => extractOptionSets(feature.entries || feature.entry),
    [feature],
  );
  const choiceLists = useMemo(
    () => extractChoiceLists(feature.entries || feature.entry),
    [feature],
  );

  const optFeatureTypes = useMemo(() => {
    if (
      feature.name === "Ability Score Improvement" ||
      feature.name === "Epic Boon"
    )
      return [];
    const types = [];
    const entriesStr = JSON.stringify(feature.entries || feature.entry || []);
    const regex =
      /\{@filter\s+[^|]+\|\s*optionalfeatures\s*\|(?:[^}]*?)featuretype=([^}|]+)/gi;
    let match;
    while ((match = regex.exec(entriesStr)) !== null) {
      types.push(...match[1].split(";").map((t) => t.trim()));
    }
    const name = feature.name || "";
    if (name.includes("Eldritch Invocation")) types.push("EI");
    if (name.includes("Pact Boon")) types.push("PB");
    if (name.includes("Elemental Discipline")) types.push("ED");
    if (name.includes("Artificer Infusion") || name.includes("Infuse Item"))
      types.push("AI");
    if (name.includes("Maneuver")) types.push("MV", "MV:B", "MV:C2-UA");
    if (name.includes("Arcane Shot")) types.push("AS", "AS:V1-UA", "AS:V2-UA");
    if (name.includes("Rune Carver") || name.includes("Rune Magic"))
      types.push("RN");
    if (name.includes("Alchemical Formula")) types.push("AF");
    if (name.includes("Fighting Style")) {
      types.push("FS");
      if (selectedClass === "Fighter") types.push("FS:F");
      if (selectedClass === "Ranger") types.push("FS:R");
      if (selectedClass === "Paladin") types.push("FS:P");
      if (selectedClass === "Bard") types.push("FS:B");
    }
    if (name.includes("Metamagic") && feature.level <= 3) types.push("MM");
    return [...new Set(types)].map((t) => t.toLowerCase());
  }, [feature, selectedClass]);

  const dynamicOptions = useMemo(() => {
    if (!optFeatureTypes.length || !data.optionalFeatures) return [];
    const candidates = new Map();
    data.optionalFeatures.forEach((opt) => {
      if (!opt.featureType || !opt.name) return;
      const types = Array.isArray(opt.featureType)
        ? opt.featureType
        : [opt.featureType];
      if (
        types.some((t) => optFeatureTypes.includes(String(t).toLowerCase()))
      ) {
        if (!candidates.has(opt.name)) candidates.set(opt.name, []);
        candidates.get(opt.name).push(opt);
      }
    });
    const unique = [];
    candidates.forEach((opts) => {
      const selected = resolveFeatureWithCopy(
        opts,
        [data.optionalFeatures, data.classFeatures],
        classSource,
      );
      if (selected) unique.push(selected);
    });
    console.log(
      `[FeatureChoices] Fetched optional features for ${feature.name}:`,
      unique,
    );

    const cLvl = selectedLevel || 1;
    const checkPrereqs = (opt) => {
      if (!opt.prerequisite) return true;
      return opt.prerequisite.some((req) => {
        if (req.level) {
          let reqLvl =
            typeof req.level === "object" ? req.level.level : req.level;
          if (cLvl < reqLvl) return false;
        }
        if (req.pact) {
          const pactName = `Pact of the ${req.pact}`;
          if (
            !Array.from(selectedOptions || []).some((s) =>
              s.toLowerCase().includes(pactName.toLowerCase()),
            )
          )
            return false;
        }
        return true;
      });
    };
    return unique
      .filter(checkPrereqs)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [optFeatureTypes, data.optionalFeatures, selectedLevel, selectedOptions]);

  if (
    optionSets.length === 0 &&
    choiceLists.length === 0 &&
    dynamicOptions.length === 0
  )
    return null;

  const renderCheckbox = (
    key,
    label,
    descHtml,
    groupKey,
    maxCount,
    prereqHtml = "",
  ) => {
    const isChecked = selectedOptions?.has(key);
    let countInGroup = 0;
    if (groupKey && maxCount > 1) {
      for (const k of selectedOptions || []) {
        if (k.startsWith(groupKey + "|||")) countInGroup++;
      }
    }
    const disabled = !isChecked && maxCount > 1 && countInGroup >= maxCount;

    return (
      <label
        key={key}
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          padding: "8px 10px",
          background: "rgba(255,255,255,0.7)",
          border: "1px solid var(--gold)",
          borderRadius: 6,
          marginBottom: 6,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
          transition: "background 0.15s",
        }}
      >
        <input
          type={maxCount === 1 ? "radio" : "checkbox"}
          checked={isChecked}
          disabled={disabled}
          onChange={() => onToggleOption(key, maxCount === 1 ? groupKey : null)}
          style={{
            marginTop: 4,
            cursor: disabled ? "not-allowed" : "pointer",
            width: 16,
            height: 16,
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1 }}>
          <strong
            style={{
              color: "var(--ink)",
              fontSize: "0.95rem",
              display: "block",
            }}
          >
            {label}
          </strong>
          {prereqHtml && (
            <div
              style={{ fontSize: "0.8rem", color: "var(--red)", marginTop: 2 }}
            >
              Requires: {prereqHtml}
            </div>
          )}
          {descHtml && (
            <div
              style={{
                fontSize: "0.9rem",
                color: "var(--ink-light)",
                marginTop: 4,
                lineHeight: 1.4,
              }}
              dangerouslySetInnerHTML={{ __html: descHtml }}
            />
          )}
        </div>
      </label>
    );
  };

  return (
    <div style={containerStyle || { paddingTop: 12, paddingBottom: 4 }}>
      <div
        style={{
          fontSize: "0.95rem",
          fontWeight: "bold",
          color: "var(--red-dark)",
          marginBottom: 8,
          borderBottom: "1px solid var(--gold-dark)",
          paddingBottom: 4,
        }}
      >
        {feature.level !== undefined
          ? `Lvl ${feature.level}: ${feature.name}`
          : "Feature Choices"}
      </div>
      {optionSets.map((optSet) => (
        <div key={optSet.setId} style={{ marginBottom: 12 }}>
          <div
            style={{ fontWeight: "bold", marginBottom: 6, fontSize: "0.95rem" }}
          >
            Choose {optSet.count}:
          </div>
          {optSet.choices.map((choice) => {
            let name =
              choice.name || (choice.uid ? choice.uid.split("|")[0] : "");
            const key = `OptionSet|||${optSet.setId}|||${name}`;
            let descHtml = "";
            let prereqText = "";
            if (choice.entries)
              descHtml = cleanText(processEntries(choice.entries));
            if (data.optionalFeatures) {
              const cands = [
                ...(data.optionalFeatures?.filter((f) => f.name === name) ||
                  []),
                ...(data.classFeatures?.filter((f) => f.name === name) || []),
              ];
              const found = resolveFeatureWithCopy(
                cands,
                [data.optionalFeatures, data.classFeatures],
                classSource,
              );
              if (found) {
                if (!descHtml)
                  descHtml = cleanText(
                    processEntries(found.entries || found.entry),
                  );
                prereqText = formatPrerequisites(found);
              }
            }
            return renderCheckbox(
              key,
              name,
              descHtml,
              `OptionSet|||${optSet.setId}`,
              optSet.count,
              prereqText,
            );
          })}
        </div>
      ))}
      {choiceLists.map((list, idx) => {
        const groupKey = `ChoiceList|||${feature.name}|||${feature.level || 0}|||${idx}`;
        return (
          <div key={groupKey} style={{ marginBottom: 12 }}>
            <div
              style={{
                fontWeight: "bold",
                marginBottom: 6,
                fontSize: "0.95rem",
              }}
            >
              {cleanText(list.prompt)}
            </div>
            {list.items.map((item, itemIdx) => {
              const name =
                typeof item === "string"
                  ? item
                  : item.name || `Option ${itemIdx + 1}`;
              const key = `${groupKey}|||${name}`;
              let descHtml = "";
              if (typeof item === "object" && (item.entries || item.entry))
                descHtml = cleanText(
                  processEntries(item.entries || item.entry),
                );
              return renderCheckbox(key, name, descHtml, groupKey, list.count);
            })}
          </div>
        );
      })}
      {dynamicOptions.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div
            style={{ fontWeight: "bold", marginBottom: 6, fontSize: "0.95rem" }}
          >
            Available Options:
          </div>
          {dynamicOptions.map((opt) => {
            const key = `DynamicOpt|||${feature.name}|||${opt.name}`;
            const descHtml = cleanText(
              processEntries(opt.entries || opt.entry),
            );
            const prereqText = formatPrerequisites(opt);
            return renderCheckbox(
              key,
              opt.name,
              descHtml,
              `DynamicOpt|||${feature.name}`,
              99,
              prereqText,
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Class Tab ─────────────────────────────────────────────────────────────────
function ClassTab({
  data,
  selectedClass,
  onSelectClass,
  selectedLevel,
  onSelectLevel,
  selectedSubclass,
  onSelectSubclass,
  selectedClassSkills,
  onSelectClassSkills,
  selectedOptions,
  onToggleOption,
}) {
  const validClasses = useMemo(
    () =>
      [
        ...new Set(
          data.classes.filter((c) => !c.isSidekick).map((c) => c.name),
        ),
      ].sort(),
    [data.classes],
  );

  const classObj = useMemo(() => {
    if (!selectedClass) return null;
    return getBestMatch(data.classes, selectedClass);
  }, [selectedClass, data.classes]);

  const classSource = classObj?.source || "PHB";

  const features = useMemo(() => {
    if (!selectedClass || !classSource) return [];
    const targetCls = selectedClass.trim().toLowerCase();
    const filtered = data.classFeatures
      .filter((f) => {
        const cName = f.className || f.class;
        return (
          cName?.trim().toLowerCase() === targetCls &&
          f.source === classSource &&
          !f.subclassShortName &&
          f.level <= selectedLevel
        );
      })
      .sort((a, b) => a.level - b.level);

    const featMap = new Map();
    const unique = [];
    filtered.forEach((f) => {
      let feature = f;
      if (!feature.entries && !feature.entry && feature._copy) {
        const cands = [
          feature,
          ...(data.classFeatures?.filter(
            (x) => x.name === feature._copy.name,
          ) || []),
        ];
        const resolved = resolveFeatureWithCopy(
          cands,
          [data.classFeatures],
          classSource,
        );
        if (resolved) feature = resolved;
      }
      const key = `${feature.name.trim()}|${feature.level}`;
      const hasContent = !!(feature.entries || feature.entry);
      if (!featMap.has(key)) {
        featMap.set(key, { feature, hasContent });
        unique.push(feature);
      } else if (!featMap.get(key).hasContent && hasContent) {
        const idx = unique.indexOf(featMap.get(key).feature);
        if (idx !== -1) unique[idx] = feature;
        featMap.set(key, { feature, hasContent: true });
      }
    });
    return unique;
  }, [selectedClass, classSource, selectedLevel, data.classFeatures]);

  const subclasses = useMemo(() => {
    if (!selectedClass) return [];
    const targetCls = selectedClass.trim().toLowerCase();
    const filtered = data.subclasses.filter((s) => {
      const cName = s.className || s.class;
      return cName?.trim().toLowerCase() === targetCls;
    });
    return dedup(filtered).sort((a, b) => a.name.localeCompare(b.name));
  }, [selectedClass, data.subclasses]);

  const subclassFeatures = useMemo(() => {
    if (!selectedSubclass || !selectedClass) return [];
    const targetCls = selectedClass.trim().toLowerCase();
    const targetSub = selectedSubclass.trim().toLowerCase();
    const filtered = data.subclassFeatures
      .filter((f) => {
        const cName = f.className || f.class;
        const sName = f.subclassShortName || f.subclassName || f.subclass;
        return (
          cName?.trim().toLowerCase() === targetCls &&
          sName?.trim().toLowerCase() === targetSub &&
          f.level <= selectedLevel
        );
      })
      .sort((a, b) => a.level - b.level);

    const featMap = new Map();
    const unique = [];
    filtered.forEach((f) => {
      let feature = f;
      if (!feature.entries && !feature.entry && feature._copy) {
        const cands = [
          feature,
          ...(data.subclassFeatures?.filter(
            (x) => x.name === feature._copy.name,
          ) || []),
          ...(data.classFeatures?.filter(
            (x) => x.name === feature._copy.name,
          ) || []),
        ];
        const resolved = resolveFeatureWithCopy(
          cands,
          [data.subclassFeatures, data.classFeatures],
          classSource,
        );
        if (resolved) feature = resolved;
      }
      const key = `${feature.name.trim()}|${feature.level}`;
      const hasContent = !!(feature.entries || feature.entry);
      if (!featMap.has(key)) {
        featMap.set(key, { feature, hasContent });
        unique.push(feature);
      } else if (!featMap.get(key).hasContent && hasContent) {
        const idx = unique.indexOf(featMap.get(key).feature);
        if (idx !== -1) unique[idx] = feature;
        featMap.set(key, { feature, hasContent: true });
      }
    });
    return unique;
  }, [
    selectedSubclass,
    selectedClass,
    selectedLevel,
    data.subclassFeatures,
    data.classFeatures,
  ]);

  const subclassObj = useMemo(() => {
    if (!selectedSubclass || !selectedClass) return null;
    const targetCls = selectedClass.trim().toLowerCase();
    const targetSub = selectedSubclass.trim().toLowerCase();
    const matches = data.subclasses.filter((s) => {
      const cName = s.className || s.class;
      return (
        cName?.trim().toLowerCase() === targetCls &&
        (s.shortName?.trim().toLowerCase() === targetSub ||
          s.name?.trim().toLowerCase() === targetSub)
      );
    });
    return (
      matches.sort(
        (a, b) => sourcePriority(a.source) - sourcePriority(b.source),
      )[0] || null
    );
  }, [selectedSubclass, selectedClass, data.subclasses]);

  const subclassFluff = useMemo(() => {
    if (!selectedSubclass || !selectedClass) return null;
    const targetCls = selectedClass.trim().toLowerCase();
    const targetSub = selectedSubclass.trim().toLowerCase();
    const matches =
      data.subclassFluff?.filter((f) => {
        const cName = f.className || f.class;
        return (
          cName?.trim().toLowerCase() === targetCls &&
          (f.shortName?.trim().toLowerCase() === targetSub ||
            f.name?.trim().toLowerCase() === targetSub)
        );
      }) || [];
    return (
      matches.sort(
        (a, b) => sourcePriority(a.source) - sourcePriority(b.source),
      )[0] || null
    );
  }, [selectedSubclass, selectedClass, data.subclassFluff]);

  const classFluff = useMemo(() => {
    if (!selectedClass) return null;
    return (
      data.classFluff?.find(
        (f) => f.name === selectedClass && f.source === classSource,
      ) || data.classFluff?.find((f) => f.name === selectedClass)
    );
  }, [selectedClass, classSource, data.classFluff]);

  const classTableGroups = classObj?.classTableGroups || [];

  const capitalize = (s) =>
    typeof s === "string" ? s.charAt(0).toUpperCase() + s.slice(1) : s;
  const cleanTag = (str) =>
    typeof str === "string"
      ? str.replace(/\{@\w+\s*([^}]+)?\}/g, (_, c) =>
          c ? c.split("|")[0] : "",
        )
      : String(str);

  const subclassIntro = useMemo(() => {
    if (!selectedSubclass || !selectedClass) return null;

    console.log(
      "[SubclassIntro] selectedClass:",
      selectedClass,
      "| selectedSubclass:",
      selectedSubclass,
    );

    if (subclassFluff?.entries) {
      console.log("[SubclassIntro] Found dedicated subclassFluff entries");
      const parsed = processEntries(
        Array.isArray(subclassFluff.entries)
          ? subclassFluff.entries.slice(0, 2)
          : subclassFluff.entries,
      );
      if (cleanText(parsed).trim().length > 20) return parsed;
    }

    // Fallback logic for subclasses without dedicated fluff (read from first features)
    const subNameLower = selectedSubclass.toLowerCase();
    const subFullLower = (
      subclassObj ? subclassObj.name : selectedSubclass
    ).toLowerCase();
    const targetSource = subclassObj?.source || classSource;

    const pickIntroFeature = (level) => {
      const pool = data.subclassFeatures.filter((f) => {
        const cName = f.className || f.class;
        const sName = f.subclassShortName || f.subclassName || f.subclass;
        return (
          cName?.trim().toLowerCase() === selectedClass.trim().toLowerCase() &&
          sName?.trim().toLowerCase() ===
            selectedSubclass.trim().toLowerCase() &&
          f.level === level &&
          (!targetSource || f.source === targetSource)
        );
      });
      return (
        pool.find((f) => {
          const n = f.name.toLowerCase();
          return (
            n.includes(subNameLower) ||
            n.includes(subFullLower) ||
            n.includes(selectedClass.trim().toLowerCase())
          );
        }) ||
        pool[0] ||
        null
      );
    };

    const extractParagraphs = (feature) => {
      if (!feature || !feature.entries) return [];
      const stripTags = (s) =>
        s.replace(/\{@\w+\s+([^}|]+)(?:\|[^}]*)?\}/g, (_, t) => t);
      const walk = (obj, depth = 0, out = []) => {
        if (!obj) return out;
        if (typeof obj === "string") {
          const s = stripTags(obj.trim());
          if (s.length > 20) out.push(s);
          return out;
        }
        if (Array.isArray(obj)) {
          obj.forEach((o) => walk(o, depth, out));
          return out;
        }
        if (typeof obj === "object") {
          if (
            obj.type === "quote" ||
            obj.type === "image" ||
            obj.type === "table"
          )
            return out;
          if (depth >= 1 && obj.name && obj.entries) return out;
          if (obj.entries) walk(obj.entries, depth + 1, out);
          else if (obj.entry) walk(obj.entry, depth + 1, out);
        }
        return out;
      };
      return walk(feature.entries)
        .filter((t) => t.length > 30)
        .slice(0, 2);
    };

    let introFeature = pickIntroFeature(3);
    let paragraphs = extractParagraphs(introFeature);

    if (!paragraphs.length) {
      introFeature = pickIntroFeature(2);
      paragraphs = extractParagraphs(introFeature);
    }

    if (!paragraphs.length) {
      introFeature = pickIntroFeature(1);
      paragraphs = extractParagraphs(introFeature);
    }

    console.log(
      "[SubclassIntro] Fallback introFeature selected:",
      introFeature?.name,
    );
    console.log(
      "[SubclassIntro] Extracted paragraphs:",
      paragraphs.length,
      paragraphs,
    );

    if (paragraphs.length > 0) {
      return paragraphs
        .map(
          (p, i) =>
            `<p style="margin:${i < paragraphs.length - 1 ? "0 0 8px" : "0"};">${p}</p>`,
        )
        .join("");
    }

    console.log(
      "[SubclassIntro] All extraction attempts failed to find valid description text.",
    );
    return null;
  }, [
    selectedSubclass,
    selectedClass,
    subclassObj,
    subclassFluff,
    classSource,
    data.subclassFeatures,
  ]);

  return (
    <div className="split-view equal-split">
      <div className="sidebar">
        <div style={{ padding: 10, flexShrink: 0 }}>
          <select
            className="styled-select"
            style={{ width: "100%", fontSize: "1.1em", marginBottom: 8 }}
            value={selectedClass || ""}
            onChange={(e) => {
              onSelectClass(e.target.value);
              onSelectSubclass(null);
            }}
          >
            <option value="" disabled>
              Select Class...
            </option>
            {validClasses.map((c) => {
              const obj = getBestMatch(data.classes, c);
              return (
                <option key={c} value={c}>
                  {c}
                  {obj?.source ? ` [${obj.source}]` : ""}
                </option>
              );
            })}
          </select>
        </div>

        {subclasses.length > 0 && (
          <div
            style={{
              padding: 10,
              borderTop: "1px solid var(--border-color)",
              background: "rgba(0,0,0,0.05)",
              flexShrink: 0,
            }}
          >
            <h3
              style={{
                margin: "0 0 8px",
                fontSize: "1.1em",
                color: "var(--red-dark)",
              }}
            >
              Select Subclass
            </h3>
            <select
              className="styled-select"
              style={{ width: "100%" }}
              value={selectedSubclass || ""}
              onChange={(e) => onSelectSubclass(e.target.value || null)}
            >
              <option value="">None</option>
              {subclasses.map((s) => (
                <option
                  key={s.name + (s.source || "")}
                  value={s.shortName || s.name}
                >
                  {s.name}
                  {s.source ? ` [${s.source}]` : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Core Traits */}
        {classObj && (
          <div
            style={{
              padding: 10,
              borderTop: "1px solid var(--border-color)",
              fontSize: "0.8em",
              overflowY: "auto",
              flex: 1,
              background: "var(--parchment)",
            }}
          >
            <div
              style={{
                fontSize: "0.9rem",
                lineHeight: 1.6,
                color: "var(--ink)",
              }}
            >
              {classObj.primaryAbility &&
                (() => {
                  const map = {
                    str: "Strength",
                    dex: "Dexterity",
                    con: "Constitution",
                    int: "Intelligence",
                    wis: "Wisdom",
                    cha: "Charisma",
                  };
                  const abilities = (
                    Array.isArray(classObj.primaryAbility)
                      ? classObj.primaryAbility
                      : [classObj.primaryAbility]
                  ).map((entry) =>
                    Object.keys(entry)
                      .filter((k) => map[k])
                      .map((k) => map[k])
                      .join(" or "),
                  );
                  return (
                    abilities.length > 0 && (
                      <div style={{ marginBottom: 4 }}>
                        <strong>Primary Ability:</strong> {abilities.join("; ")}
                      </div>
                    )
                  );
                })()}
              {classObj.hd &&
                (() => {
                  const faces = classObj.hd.faces || classObj.hd;
                  return (
                    <>
                      <div style={{ marginBottom: 4 }}>
                        <strong>Hit Point Die:</strong> D{faces} per{" "}
                        {selectedClass} level
                      </div>
                      <div style={{ marginBottom: 4 }}>
                        <strong>HP at Level 1:</strong> {faces} + Con. modifier
                      </div>
                      <div style={{ marginBottom: 4 }}>
                        <strong>HP per Level:</strong> D{faces} (or{" "}
                        {Math.floor(faces / 2) + 1}) + Con. modifier
                      </div>
                    </>
                  );
                })()}
              {classObj.proficiency && (
                <div style={{ marginBottom: 4 }}>
                  <strong>Saving Throws:</strong>{" "}
                  {classObj.proficiency.map(capitalize).join(", ")}
                </div>
              )}
              {classObj.startingProficiencies?.tools && (
                <div style={{ marginBottom: 4 }}>
                  <strong>Tool Proficiencies:</strong>{" "}
                  {classObj.startingProficiencies.tools
                    .map((t) =>
                      capitalize(
                        cleanTag(typeof t === "string" ? t : t.name || ""),
                      ),
                    )
                    .filter(Boolean)
                    .join(", ")}
                </div>
              )}
              {classObj.startingProficiencies?.skills &&
                (() => {
                  const skills = classObj.startingProficiencies.skills;
                  let dropIndex = 0;
                  return skills.map((sk, si) => {
                    if (typeof sk === "string") {
                      return (
                        <div key={si} style={{ marginBottom: 4 }}>
                          <strong>Skill Proficiency:</strong> {capitalize(sk)}
                        </div>
                      );
                    }
                    if (sk.choose) {
                      const count = sk.choose.count || 1;
                      const options = sk.choose.from.map(capitalize);
                      return (
                        <div key={si} style={{ marginBottom: 4 }}>
                          <strong>Skill Proficiencies:</strong> Choose {count}:{" "}
                          {options
                            .map((opt) => {
                              const ab =
                                skillsMap[
                                  opt.toLowerCase().replace(/ /g, "_")
                                ]?.toUpperCase();
                              return ab ? `${opt} (${ab})` : opt;
                            })
                            .join(", ")}
                          <div
                            style={{
                              display: "flex",
                              gap: 8,
                              flexWrap: "wrap",
                              marginTop: 6,
                              marginBottom: 10,
                            }}
                          >
                            {Array.from({ length: count }).map((_, i) => {
                              const currentIndex = dropIndex++;
                              return (
                                <select
                                  key={i}
                                  className="styled-select"
                                  style={{
                                    width: "auto",
                                    flex: 1,
                                    minWidth: 140,
                                    padding: "4px 8px",
                                    fontSize: "0.85rem",
                                  }}
                                  value={
                                    selectedClassSkills[currentIndex] || ""
                                  }
                                  onChange={(e) => {
                                    const newSkills = [...selectedClassSkills];
                                    newSkills[currentIndex] = e.target.value;
                                    onSelectClassSkills(newSkills);
                                  }}
                                >
                                  <option value="" disabled>
                                    Select Skill
                                  </option>
                                  {options.map((opt) => {
                                    const ab =
                                      skillsMap[
                                        opt.toLowerCase().replace(/ /g, "_")
                                      ]?.toUpperCase();
                                    return (
                                      <option
                                        key={opt}
                                        value={opt}
                                        disabled={
                                          selectedClassSkills.includes(opt) &&
                                          selectedClassSkills[currentIndex] !==
                                            opt
                                        }
                                      >
                                        {opt}
                                        {ab ? ` (${ab})` : ""}
                                      </option>
                                    );
                                  })}
                                </select>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                    const fixedKeys = Object.keys(sk).filter(
                      (k) => k !== "choose" && sk[k],
                    );
                    if (fixedKeys.length > 0)
                      return (
                        <div key={si} style={{ marginBottom: 4 }}>
                          <strong>Skill Proficiencies:</strong>{" "}
                          {fixedKeys.map(capitalize).join(", ")}
                        </div>
                      );
                    return null;
                  });
                })()}
              {classObj.startingProficiencies?.weapons && (
                <div style={{ marginBottom: 4 }}>
                  <strong>Weapon Proficiencies:</strong>{" "}
                  {classObj.startingProficiencies.weapons
                    .map((w) =>
                      capitalize(
                        cleanTag(
                          typeof w === "string" ? w : w.proficiency || "",
                        ),
                      ),
                    )
                    .filter(Boolean)
                    .join(", ")}
                </div>
              )}
              {classObj.startingProficiencies?.armor && (
                <div style={{ marginBottom: 4 }}>
                  <strong>Armor Training:</strong>{" "}
                  {classObj.startingProficiencies.armor
                    .map((a) =>
                      capitalize(
                        cleanTag(
                          typeof a === "string" ? a : a.proficiency || "",
                        ),
                      ),
                    )
                    .filter(Boolean)
                    .join(", ")}
                </div>
              )}

              <div style={{ marginTop: 16 }}>
                {[...features, ...subclassFeatures].map((f, i) => (
                  <FeatureChoices
                    key={`${f.name}-${f.level}-${i}`}
                    feature={f}
                    data={data}
                    selectedClass={selectedClass}
                    classSource={classSource}
                    selectedLevel={selectedLevel}
                    selectedOptions={selectedOptions}
                    onToggleOption={onToggleOption}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="content-pane">
        {!selectedClass ? (
          <em style={{ color: "var(--text-muted)" }}>
            Select a class from the list to begin...
          </em>
        ) : (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 15,
                background: "rgba(255,255,255,0.5)",
                border: "1px solid var(--border-color)",
                padding: 10,
                borderRadius: 4,
              }}
            >
              <h2
                style={{ margin: 0, border: "none", color: "var(--text-main)" }}
              >
                Class Details
              </h2>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <label style={{ fontWeight: "bold", color: "var(--gold)" }}>
                  Level:
                </label>
                <select
                  className="styled-select"
                  style={{ width: 60, textAlign: "center", fontWeight: "bold" }}
                  value={selectedLevel}
                  onChange={(e) => onSelectLevel(parseInt(e.target.value))}
                >
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((l) => (
                    <option key={l} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {(classFluff?.entries || classObj?.img) && (
              <div
                style={{
                  marginBottom: 16,
                  padding: "12px 16px",
                  background: "rgba(212,165,116,0.08)",
                  border: "1px solid var(--gold)",
                  borderRadius: 4,
                }}
              >
                <FluffImage
                  fluff={classFluff}
                  baseObj={classObj}
                  type="classes"
                  name={classObj.name}
                  source={classObj.source || classSource}
                />
                {classFluff?.entries && (
                  <EntryHTML
                    html={processEntries(
                      Array.isArray(classFluff.entries)
                        ? classFluff.entries.slice(0, 2)
                        : classFluff.entries,
                    )}
                    style={{
                      fontSize: "0.9rem",
                      fontStyle: "italic",
                      lineHeight: 1.6,
                    }}
                  />
                )}
                <div style={{ clear: "both" }} />
              </div>
            )}

            {selectedSubclass && (subclassIntro || subclassObj?.img) && (
              <div
                style={{
                  marginBottom: 16,
                  padding: "12px 16px",
                  background: "rgba(212,165,116,0.12)",
                  border: "1px solid var(--gold)",
                  borderRadius: 4,
                }}
              >
                <FluffImage
                  fluff={subclassFluff}
                  baseObj={subclassObj}
                  type="subclasses"
                  className={selectedClass}
                  subclassName={subclassObj?.name || selectedSubclass}
                  subclassShortName={selectedSubclass}
                  source={subclassObj?.source || classSource}
                />
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--ink-light)",
                    marginBottom: 6,
                  }}
                >
                  {subclassObj?.name || selectedSubclass}
                </div>
                {subclassIntro && (
                  <EntryHTML
                    html={subclassIntro}
                    style={{
                      fontSize: "0.9rem",
                      fontStyle: "italic",
                      lineHeight: 1.6,
                    }}
                  />
                )}
                <div style={{ clear: "both" }} />
              </div>
            )}

            {/* Class level table */}
            <div style={{ overflowX: "auto", marginBottom: 20 }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.75rem",
                }}
              >
                <thead>
                  <tr>
                    <th
                      style={{
                        padding: "3px 4px",
                        background: "var(--parchment-dark)",
                        color: "var(--red-dark)",
                        border: "1px solid var(--gold)",
                      }}
                    >
                      Lvl
                    </th>
                    <th
                      style={{
                        padding: "3px 4px",
                        background: "var(--parchment-dark)",
                        color: "var(--red-dark)",
                        border: "1px solid var(--gold)",
                      }}
                    >
                      PB
                    </th>
                    <th
                      style={{
                        padding: "3px 4px",
                        background: "var(--parchment-dark)",
                        color: "var(--red-dark)",
                        border: "1px solid var(--gold)",
                        textAlign: "left",
                      }}
                    >
                      Features
                    </th>
                    {classTableGroups.flatMap((g, gi) =>
                      (g.colLabels || []).map((label, li) => (
                        <th
                          key={`th-${gi}-${li}`}
                          style={{
                            padding: "3px 4px",
                            background: "var(--parchment-dark)",
                            color: "var(--red-dark)",
                            border: "1px solid var(--gold)",
                          }}
                        >
                          {cleanTag(label)}
                        </th>
                      )),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 20 }, (_, i) => i + 1).map((lvl) => {
                    const lvlFeats = [
                      ...new Set(
                        data.classFeatures
                          .filter((f) => {
                            const cName = f.className || f.class;
                            return (
                              cName?.trim().toLowerCase() ===
                                selectedClass.trim().toLowerCase() &&
                              f.source === classSource &&
                              !f.subclassShortName &&
                              f.level === lvl
                            );
                          })
                          .map((f) => f.name),
                      ),
                    ].join(", ");
                    return (
                      <tr
                        key={lvl}
                        style={{
                          background:
                            lvl === selectedLevel
                              ? "rgba(138,28,28,0.12)"
                              : lvl % 2 === 0
                                ? "var(--parchment-dark)"
                                : "transparent",
                          fontWeight: lvl === selectedLevel ? 700 : "normal",
                        }}
                      >
                        <td
                          style={{
                            padding: "2px 4px",
                            border: "1px solid var(--gold)",
                            textAlign: "center",
                          }}
                        >
                          {lvl}
                        </td>
                        <td
                          style={{
                            padding: "2px 4px",
                            border: "1px solid var(--gold)",
                            textAlign: "center",
                          }}
                        >
                          +{getPB(lvl)}
                        </td>
                        <td
                          style={{
                            padding: "2px 4px",
                            border: "1px solid var(--gold)",
                          }}
                        >
                          {lvlFeats || "—"}
                        </td>
                        {classTableGroups.flatMap((g, gi) => {
                          const rows = g.rows || g.rowsSpellProgression;
                          const row = rows?.[lvl - 1] || [];
                          return row.map((cell, ci) => {
                            let val = cell;
                            if (typeof cell === "object" && cell !== null) {
                              if (cell.type === "dice" && cell.toRoll)
                                val = cell.toRoll
                                  .map((r) => `${r.number || 1}d${r.faces}`)
                                  .join("+");
                              else if (cell.value !== undefined)
                                val = cell.value;
                            }
                            if (
                              val === null ||
                              val === undefined ||
                              val === 0 ||
                              val === ""
                            )
                              val = "—";
                            return (
                              <td
                                key={`td-${gi}-${ci}`}
                                style={{
                                  padding: "2px 4px",
                                  border: "1px solid var(--gold)",
                                  textAlign: "center",
                                }}
                              >
                                {String(val)}
                              </td>
                            );
                          });
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <h3>Features (Level 1–{selectedLevel})</h3>
            {features.map((f, i) => (
              <FeatureBlock key={`${f.name}-${f.level}-${i}`} feature={f} />
            ))}
            {subclassFeatures.length > 0 && (
              <>
                <h3>Subclass Features</h3>
                {subclassFeatures.map((f, i) => (
                  <FeatureBlock
                    key={`sub-${f.name}-${f.level}-${i}`}
                    feature={f}
                  />
                ))}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function FeatureBlock({ feature }) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className="feature-wrapper"
      style={{
        background: "rgba(255,255,255,0.5)",
        border: "1px solid var(--border-color)",
        borderRadius: 3,
        marginBottom: 8,
      }}
    >
      <div
        className="d-flex"
        style={{
          padding: "8px 12px",
          background: "rgba(0,0,0,0.03)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "pointer",
        }}
        onClick={() => setOpen((o) => !o)}
      >
        <div>
          <span
            style={{
              fontWeight: 700,
              fontFamily: "Cinzel, serif",
              fontSize: "0.9rem",
              color: "var(--red-dark)",
            }}
          >
            {feature.name}
          </span>
          <span
            style={{
              marginLeft: 8,
              fontSize: "0.8rem",
              color: "var(--ink-light)",
            }}
          >
            Lv. {feature.level}
          </span>
        </div>
        <span style={{ color: "var(--ink-light)", fontSize: "0.8rem" }}>
          {open ? "▴" : "▾"}
        </span>
      </div>
      <div style={{ display: open ? "block" : "none" }}>
        {(feature.entries || feature.entry) && (
          <div
            className="feature-content"
            style={{
              padding: "12px 12px 0",
              fontSize: "16px",
              lineHeight: 1.5,
            }}
          >
            <EntryHTML
              html={processEntries(feature.entries || feature.entry)}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ── Background Tab Helpers ───────────────────────────────────────────────────
function formatEquipItem(item) {
  if (!item) return "";
  if (typeof item === "string") {
    let text = item.replace(/\{@\w+\s+([^|}]+)[^}]*\}/g, "$1");
    text = text.split("|")[0];
    return text.charAt(0).toUpperCase() + text.slice(1);
  }
  if (item.item) {
    let name = item.displayName || item.item.split("|")[0];
    name = name.replace(/\{@\w+\s+([^|}]+)[^}]*\}/g, "$1");
    if (item.quantity && item.quantity > 1) name = `${item.quantity} ${name}`;
    return name.charAt(0).toUpperCase() + name.slice(1);
  }
  if (item.special) return item.special;
  if (item.equipmentType) {
    let name = item.equipmentType;
    if (name === "toolArtisan") name = "Artisan's Tools";
    if (name === "instrumentMusical") name = "Musical Instrument";
    if (name === "setGaming") name = "Gaming Set";
    if (name === "weaponSimpleMelee") name = "Simple Melee Weapon";
    if (name === "weaponMartial") name = "Martial Weapon";
    return `Any ${name}`;
  }
  if (item.value) return `${item.value / 100} GP`;
  return JSON.stringify(item);
}

function renderBackgroundEquipment(equipList) {
  if (!equipList) return null;
  const blocks = Array.isArray(equipList) ? equipList : [equipList];
  return blocks.map((block, idx) => {
    if (block._ || block.default) {
      const items = block._ || block.default;
      return (
        <div key={idx} style={{ marginBottom: 12 }}>
          <strong style={{ color: "var(--ink)" }}>Standard Items:</strong>
          <ul
            style={{
              paddingLeft: 20,
              margin: "4px 0",
              fontSize: "0.9rem",
              color: "var(--ink)",
            }}
          >
            {items.map((item, i) => (
              <li key={i}>{formatEquipItem(item)}</li>
            ))}
          </ul>
        </div>
      );
    } else if (block.a || block.b || block.A || block.B) {
      const optA = block.a || block.A;
      const optB = block.b || block.B;
      const optC = block.c || block.C;
      return (
        <div key={idx} style={{ marginBottom: 12 }}>
          <strong style={{ color: "var(--ink)" }}>Choice:</strong>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: 4,
              fontSize: "0.85rem",
            }}
          >
            <tbody>
              {optA && (
                <tr>
                  <td
                    style={{
                      borderTop: "1px solid var(--gold)",
                      padding: "6px 8px",
                      width: "30px",
                      fontWeight: "bold",
                      background: "rgba(255,255,255,0.4)",
                      color: "var(--red-dark)",
                    }}
                  >
                    A
                  </td>
                  <td
                    style={{
                      borderTop: "1px solid var(--gold)",
                      padding: "6px 8px",
                      color: "var(--ink)",
                    }}
                  >
                    {optA.map(formatEquipItem).join(", ")}
                  </td>
                </tr>
              )}
              {optB && (
                <tr>
                  <td
                    style={{
                      borderTop: "1px dotted var(--gold)",
                      padding: "6px 8px",
                      width: "30px",
                      fontWeight: "bold",
                      background: "rgba(255,255,255,0.4)",
                      color: "var(--red-dark)",
                    }}
                  >
                    B
                  </td>
                  <td
                    style={{
                      borderTop: "1px dotted var(--gold)",
                      padding: "6px 8px",
                      color: "var(--ink)",
                    }}
                  >
                    {optB.map(formatEquipItem).join(", ")}
                  </td>
                </tr>
              )}
              {optC && (
                <tr>
                  <td
                    style={{
                      borderTop: "1px dotted var(--gold)",
                      padding: "6px 8px",
                      width: "30px",
                      fontWeight: "bold",
                      background: "rgba(255,255,255,0.4)",
                      color: "var(--red-dark)",
                    }}
                  >
                    C
                  </td>
                  <td
                    style={{
                      borderTop: "1px dotted var(--gold)",
                      padding: "6px 8px",
                      color: "var(--ink)",
                    }}
                  >
                    {optC.map(formatEquipItem).join(", ")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      );
    } else if (typeof block === "string") {
      return (
        <div
          key={idx}
          dangerouslySetInnerHTML={{ __html: cleanText(block) }}
          style={{ fontSize: "0.9rem", marginBottom: 12 }}
        />
      );
    }
    return null;
  });
}

// ── Background Tab ────────────────────────────────────────────────────────────
function BackgroundTab({
  data,
  selected,
  onSelect,
  selectedOptions,
  onToggleOption,
}) {
  const [search, setSearch] = useState("");
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.backgrounds
      .filter((b) => b.name && b.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data.backgrounds, search]);
  const unique = useMemo(
    () => dedup(filtered).sort((a, b) => a.name.localeCompare(b.name)),
    [filtered],
  );

  const bgObj = useMemo(() => {
    if (!selected) return null;
    let match = getBestMatch(data.backgrounds, selected);
    
    match = resolveBackgroundWithCopy(match, data.backgrounds);
    
    console.log("[BackgroundTab] Resolved Background Object:", match);
    return match;
  }, [selected, data.backgrounds]);

  const fluff = useMemo(() => {
    if (!bgObj) return null;
    return (
      data.backgroundFluff.find(
        (f) => f.name === selected && f.source === bgObj.source,
      ) || data.backgroundFluff.find((f) => f.name === selected)
    );
  }, [selected, bgObj, data.backgroundFluff]);

  return (
    <div className="split-view">
      <div className="sidebar">
        <div className="sidebar-header">
          <input
            type="text"
            className="search-input"
            placeholder="Search Background..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="sidebar-list">
          {unique.map((b) => (
            <div
              key={b.name}
              className={`list-item${selected === b.name ? " selected" : ""}`}
              onClick={() => {
                console.log("[BackgroundTab] Clicked background from list:", b);
                onSelect(b.name);
              }}
            >
              {b.name}
              {b.source && b.source !== "PHB" && b.source !== "XPHB" && (
                <span className="list-item-meta">{b.source}</span>
              )}
            </div>
          ))}
        </div>
        {bgObj && bgObj.entries && (
          <FeatureChoices
            feature={{ entries: bgObj.entries, name: bgObj.name }}
            data={data}
            selectedOptions={selectedOptions}
            onToggleOption={onToggleOption}
            containerStyle={{
              padding: "10px 12px",
              borderTop: "1px solid var(--border-color)",
              background: "var(--parchment)",
              flexShrink: 0,
              maxHeight: "50%",
              overflowY: "auto",
            }}
          />
        )}
      </div>
      <div className="content-pane">
        {!bgObj ? (
          <em style={{ color: "var(--text-muted)" }}>
            Select a background from the list...
          </em>
        ) : (
          <div>
            <h2>{bgObj.name}</h2>
            {bgObj && (
              <div
                style={{
                  marginBottom: 16,
                  padding: "12px 16px",
                  background: "rgba(212,165,116,0.1)",
                  border: "1px solid var(--gold)",
                  borderRadius: 4,
                }}
              >
                <FluffImage
                  fluff={fluff}
                  baseObj={bgObj}
                  type="backgrounds"
                  name={bgObj.name}
                  source={bgObj.source}
                />
                <div
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--ink-light)",
                    marginBottom: 6,
                  }}
                >
                  {bgObj.name}
                </div>
                {fluff?.entries && (
                  <EntryHTML
                    html={processEntries(
                      Array.isArray(fluff.entries)
                        ? fluff.entries.slice(0, 2)
                        : fluff.entries,
                    )}
                    style={{
                      fontSize: "0.9rem",
                      fontStyle: "italic",
                      lineHeight: 1.6,
                    }}
                  />
                )}
                <div style={{ clear: "both" }} />
              </div>
            )}
            {bgObj.skillProficiencies && (
              <p>
                <strong>Skill Proficiencies:</strong>{" "}
                {bgObj.skillProficiencies
                  .flatMap((s) =>
                    Object.keys(s).filter(
                      (k) => k !== "choose" && s[k] === true,
                    ),
                  )
                  .join(", ")}
              </p>
            )}
            {bgObj.languageProficiencies && (
              <p>
                <strong>Languages:</strong>{" "}
                {bgObj.languageProficiencies
                  .flatMap((l) => {
                    return Object.entries(l)
                      .map(([k, v]) => {
                        if (k === "anyStandard") return `Any ${v} Standard`;
                        if (k === "any") return `Any ${v}`;
                        if (v === true) return k;
                        return null;
                      })
                      .filter(Boolean);
                  })
                  .join(", ")}
              </p>
            )}
            {bgObj.startingEquipment && (
              <div style={{ marginTop: 12 }}>
                <strong
                  style={{
                    display: "block",
                    marginBottom: 8,
                    color: "var(--red-dark)",
                    borderBottom: "1px solid var(--gold)",
                    paddingBottom: 4,
                  }}
                >
                  Starting Equipment Options
                </strong>
                {renderBackgroundEquipment(bgObj.startingEquipment)}
              </div>
            )}
            {bgObj.entries && (
              <div style={{ marginTop: 16 }}>
                <EntryHTML html={processEntries(bgObj.entries)} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Background Extras Tab ─────────────────────────────────────────────────────
function BgExtraTab({ data, selectedDeity, onSelectDeity }) {
  const [deitySearch, setDeitySearch] = useState("");
  const [showDeityModal, setShowDeityModal] = useState(false);

  const filteredDeities = useMemo(() => {
    const q = deitySearch.toLowerCase();
    return data.deities
      .filter((d) => d.name && d.name.toLowerCase().includes(q))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data.deities, deitySearch]);

  const deityObj = useMemo(() => {
    if (!selectedDeity) return null;
    return data.deities.find((d) => d.name === selectedDeity);
  }, [selectedDeity, data.deities]);

  return (
    <div className="content-pane">
      <h2>Background (Extra)</h2>
      <h3>
        Deity{" "}
        <span
          style={{
            fontWeight: "normal",
            fontSize: "0.8em",
            color: "var(--text-muted)",
          }}
        >
          (Optional)
        </span>
      </h3>
      <button
        className="styled-select"
        style={{
          width: "100%",
          textAlign: "left",
          padding: 10,
          fontSize: "1.1em",
          cursor: "pointer",
        }}
        onClick={() => setShowDeityModal(true)}
      >
        {selectedDeity || "Select Deity (Optional)"}
      </button>
      {selectedDeity && (
        <button
          className="btn"
          style={{ marginTop: 6, fontSize: "0.8rem", padding: "3px 8px" }}
          onClick={() => onSelectDeity(null)}
        >
          Clear
        </button>
      )}
      {deityObj && (
        <div
          style={{
            marginTop: 10,
            padding: 15,
            background: "rgba(255,255,255,0.5)",
            border: "1px solid var(--border-color)",
            borderRadius: 4,
          }}
        >
          <strong>{deityObj.name}</strong>
          {deityObj.pantheon && (
            <span
              style={{
                marginLeft: 8,
                color: "var(--ink-light)",
                fontSize: "0.85rem",
              }}
            >
              {deityObj.pantheon}
            </span>
          )}
          {deityObj.alignment && (
            <p style={{ margin: "4px 0" }}>
              <strong>Alignment:</strong> {deityObj.alignment.join(", ")}
            </p>
          )}
          {deityObj.domains && (
            <p style={{ margin: "4px 0" }}>
              <strong>Domains:</strong> {deityObj.domains.join(", ")}
            </p>
          )}
          {deityObj.symbol && (
            <p style={{ margin: "4px 0" }}>
              <strong>Symbol:</strong> {deityObj.symbol}
            </p>
          )}
        </div>
      )}
      {!selectedDeity && !deityObj && (
        <div
          style={{
            marginTop: 10,
            padding: 15,
            background: "rgba(255,255,255,0.5)",
            border: "1px solid var(--border-color)",
            borderRadius: 4,
            minHeight: 50,
          }}
        >
          <em style={{ color: "var(--text-muted)" }}>No deity selected.</em>
        </div>
      )}

      {showDeityModal && (
        <div
          className="info-modal-overlay"
          style={{
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            zIndex: 1000,
          }}
        >
          <div
            className="info-modal-content"
            style={{
              background: "var(--parchment)",
              border: "2px solid var(--gold)",
              padding: 20,
              width: 600,
              maxHeight: "80vh",
              overflowY: "auto",
              position: "relative",
              borderRadius: 5,
            }}
          >
            <button
              className="close-modal-btn"
              style={{
                position: "absolute",
                top: 10,
                right: 10,
                background: "none",
                border: "none",
                fontSize: 20,
                cursor: "pointer",
                color: "var(--ink-light)",
              }}
              onClick={() => setShowDeityModal(false)}
            >
              ×
            </button>
            <h3
              style={{
                textAlign: "center",
                fontFamily: "Cinzel, serif",
                color: "var(--red-dark)",
              }}
            >
              Select Deity
            </h3>
            <input
              type="text"
              className="search-input"
              placeholder="Search deities..."
              style={{ width: "100%", marginBottom: 10 }}
              value={deitySearch}
              onChange={(e) => setDeitySearch(e.target.value)}
            />
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr",
                gap: 8,
                maxHeight: "60vh",
                overflowY: "auto",
              }}
            >
              {filteredDeities.map((d) => (
                <div
                  key={d.name + (d.source || "")}
                  style={{
                    padding: "8px 12px",
                    background: "rgba(255,255,255,0.5)",
                    border: "1px solid var(--gold)",
                    borderRadius: 4,
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onClick={() => {
                    onSelectDeity(d.name);
                    setShowDeityModal(false);
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.background = "var(--parchment-dark)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.background = "rgba(255,255,255,0.5)")
                  }
                >
                  <strong>{d.name}</strong>
                  {d.pantheon && (
                    <span
                      style={{
                        marginLeft: 6,
                        color: "var(--ink-light)",
                        fontSize: "0.8rem",
                      }}
                    >
                      {d.pantheon}
                    </span>
                  )}
                  {d.domains && (
                    <span
                      style={{
                        marginLeft: 6,
                        color: "var(--ink-light)",
                        fontSize: "0.8rem",
                      }}
                    >
                      ({d.domains.slice(0, 2).join(", ")})
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Equipment Tab ─────────────────────────────────────────────────────────────
function parseEquipmentOptions(text) {
  if (!text) return null;
  const clean = cleanText(text);

  if (!/(?:Choose A or B|Choose A, B, or C)/i.test(clean)) {
    return null;
  }

  const options = [];

  const matchA = clean.match(/\(A\)\s(.*?)(?=;\s*\(?B\)?\s|;\s*or\s*\(B\)|$)/i);
  const matchB = clean.match(/\(B\)\s(.*?)(?=;\s*\(?C\)?\s|;\s*or\s*\(C\)|$)/i);
  const matchC = clean.match(/\(C\)\s(.*)$/i);

  if (matchA && matchB) {
    options.push({ id: "A", text: matchA[1].trim() });
    let textB = matchB[1].trim();
    if (textB.toLowerCase().startsWith("or "))
      textB = textB.substring(3).trim();
    options.push({ id: "B", text: textB });
    if (matchC) {
      let textC = matchC[1].trim();
      if (textC.toLowerCase().startsWith("or "))
        textC = textC.substring(3).trim();
      options.push({ id: "C", text: textC });
    }
    return options;
  }

  return null;
}

function EquipmentChoice({
  title,
  options,
  selected,
  onSelect,
  defaultContent,
}) {
  if (!options || options.length === 0) {
    return (
      <div style={{ marginBottom: 20 }}>
        <h3
          style={{
            color: "var(--red-dark)",
            borderBottom: "1px solid var(--gold)",
          }}
        >
          {title}
        </h3>
        {defaultContent}
      </div>
    );
  }

  return (
    <div style={{ marginBottom: 20 }}>
      <h3
        style={{
          color: "var(--red-dark)",
          borderBottom: "1px solid var(--gold)",
        }}
      >
        {title}
      </h3>
      <div
        style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 10 }}
      >
        {options.map((opt) => {
          const isSelected = selected === opt.id;
          return (
            <div
              key={opt.id}
              onClick={() => onSelect(opt.id)}
              style={{
                flex: 1,
                minWidth: 250,
                border: `2px solid ${isSelected ? "var(--red)" : "var(--gold)"}`,
                background: isSelected
                  ? "var(--parchment-dark)"
                  : "rgba(255,255,255,0.5)",
                padding: 15,
                borderRadius: 6,
                cursor: "pointer",
                transition: "all 0.2s",
                position: "relative",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderBottom: "1px solid var(--gold)",
                  paddingBottom: 5,
                  marginBottom: 8,
                }}
              >
                <strong
                  style={{
                    color: isSelected ? "var(--red-dark)" : "var(--ink)",
                  }}
                >
                  Option {opt.id}
                </strong>
                {isSelected && (
                  <span style={{ color: "var(--red)", fontWeight: "bold" }}>
                    ✓
                  </span>
                )}
              </div>
              <div
                style={{
                  fontSize: "0.9rem",
                  color: "var(--ink)",
                  lineHeight: 1.4,
                }}
                dangerouslySetInnerHTML={{ __html: opt.text }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function EquipmentTab({
  data,
  selectedClass,
  selectedBackground,
  equipmentChoices,
  setEquipmentChoices,
}) {
  const bgObj = useMemo(() => {
    if (!selectedBackground) return null;
    return resolveBackgroundWithCopy(getBestMatch(data.backgrounds, selectedBackground), data.backgrounds);
  }, [selectedBackground, data.backgrounds]);

  const classObj = useMemo(() => {
    if (!selectedClass) return null;
    return getBestMatch(data.classes, selectedClass);
  }, [selectedClass, data.classes]);

  const classOptions = useMemo(() => {
    if (!classObj?.startingEquipment) return null;
    if (classObj.startingEquipment.entries) {
      const text = processEntries(classObj.startingEquipment.entries);
      return parseEquipmentOptions(text);
    }
    return null;
  }, [classObj]);

  const bgOptions = useMemo(() => {
    if (!bgObj?.entries) return null;
    let equipStr = "";

    const findEquip = (arr) => {
      if (!arr) return;
      for (const item of arr) {
        if (item.name === "Equipment:" && item.entry) {
          equipStr = processEntries([item.entry]);
          return;
        }
        if (item.items) findEquip(item.items);
        if (item.entries) findEquip(item.entries);
      }
    };
    findEquip(bgObj.entries);

    if (equipStr) {
      return parseEquipmentOptions(equipStr);
    }
    return null;
  }, [bgObj]);

  const handleClassSelect = (id) =>
    setEquipmentChoices((prev) => ({ ...prev, class: id }));
  const handleBgSelect = (id) =>
    setEquipmentChoices((prev) => ({ ...prev, background: id }));

  return (
    <div className="content-pane">
      <h2>Starting Equipment</h2>
      {!classObj ? (
        <em style={{ color: "var(--text-muted)" }}>
          Please select a Class first to see starting equipment options.
        </em>
      ) : (
        <EquipmentChoice
          title="Class Equipment"
          options={classOptions}
          selected={equipmentChoices.class}
          onSelect={handleClassSelect}
          defaultContent={
            <EntryHTML html={processEntries(classObj.startingEquipment)} />
          }
        />
      )}

      {!bgObj ? (
        <em style={{ color: "var(--text-muted)" }}>
          Please select a Background first to see starting equipment options.
        </em>
      ) : (
        <EquipmentChoice
          title="Background Equipment"
          options={bgOptions}
          selected={equipmentChoices.background}
          onSelect={handleBgSelect}
          defaultContent={
            <em style={{ color: "var(--text-muted)" }}>
              Standard background items. See description.
            </em>
          }
        />
      )}
    </div>
  );
}

// ── Spells Tab ────────────────────────────────────────────────────────────────
function SpellsTab({
  data,
  selectedClass,
  selectedLevel,
  selectedSpells,
  onToggleSpell,
  scores,
}) {
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    levels: [],
    schools: [],
    components: [],
    durations: [],
  });
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [selectedSpellDetail, setSelectedSpellDetail] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: "level", dir: "asc" });

  const toggleFilter = (category, value) => {
    setFilters((prev) => {
      const next = { ...prev };
      if (next[category].includes(value)) {
        next[category] = next[category].filter((v) => v !== value);
      } else {
        next[category] = [...next[category], value];
      }
      return next;
    });
  };

  const FilterCheckbox = ({ label, category, value }) => (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        marginBottom: "6px",
        cursor: "pointer",
        fontSize: "0.9rem",
        color: "var(--ink)",
      }}
    >
      <input
        type="checkbox"
        checked={filters[category].includes(value)}
        onChange={() => toggleFilter(category, value)}
        style={{
          marginRight: "8px",
          cursor: "pointer",
          width: "16px",
          height: "16px",
          flexShrink: 0,
        }}
      />
      {label}
    </label>
  );

  const getTimeStr = (s) =>
    s.time
      ? s.time
          .map((t) => `${t.number} ${t.unit}${t.condition ? "*" : ""}`)
          .join("/")
          .trim()
      : "—";

  const getRangeStr = (s) => {
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

  const getDurationCategory = (s) => {
    if (!s.duration || s.duration.length === 0) return "Other";
    if (s.duration.some((d) => d.concentration)) return "Concentration";
    if (s.duration.some((d) => d.type === "instant")) return "Instantaneous";
    if (s.duration.some((d) => d.type === "permanent")) return "Permanent";
    if (s.duration.some((d) => d.type === "timed")) return "Time";
    return "Other";
  };

  const classObj = useMemo(() => {
    if (!selectedClass) return null;
    return getBestMatch(data.classes, selectedClass);
  }, [selectedClass, data.classes]);

  const classSpells = useMemo(() => {
    if (!selectedClass) return [];
    const cls = selectedClass.toLowerCase();
    const matched = data.spells.filter((s) => {
      if (s._normalizedClasses) return s._normalizedClasses.has(cls);
      if (!s.classes) return false;
      const check = (c) =>
        (typeof c === "string" ? c : c.name).toLowerCase() === cls;
      if (Array.isArray(s.classes)) return s.classes.some(check);
      if (s.classes.fromClassList) return s.classes.fromClassList.some(check);
      return false;
    });
    return dedup(matched).sort(
      (a, b) => a.level - b.level || a.name.localeCompare(b.name),
    );
  }, [data.spells, selectedClass]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return classSpells.filter((s) => {
      if (q && !s.name.toLowerCase().includes(q)) return false;
      if (filters.levels.length > 0 && !filters.levels.includes(s.level))
        return false;

      const school = (s.school || "").toLowerCase();
      if (filters.schools.length > 0 && !filters.schools.includes(school))
        return false;

      if (filters.components.length > 0) {
        if (filters.components.includes("V") && !s.components?.v) return false;
        if (filters.components.includes("S") && !s.components?.s) return false;
        if (
          filters.components.includes("M") &&
          !s.components?.m &&
          !s.components?.M
        )
          return false;
      }

      if (filters.durations.length > 0) {
        const dc = getDurationCategory(s);
        if (!filters.durations.includes(dc)) return false;
      }

      return true;
    });
  }, [classSpells, search, filters]);

  const maxLevel = useMemo(() => {
    if (!selectedClass) return 0;
    const fullCasters = ["Bard", "Cleric", "Druid", "Sorcerer", "Wizard"];
    if (fullCasters.includes(selectedClass))
      return Math.min(9, Math.ceil(selectedLevel / 2));
    if (selectedClass === "Warlock") {
      if (selectedLevel >= 9) return 5;
      if (selectedLevel >= 7) return 4;
      if (selectedLevel >= 5) return 3;
      if (selectedLevel >= 3) return 2;
      return 1;
    }
    const halfCasters = ["Paladin", "Ranger", "Artificer"];
    if (halfCasters.includes(selectedClass)) {
      if (selectedLevel >= 17) return 5;
      if (selectedLevel >= 13) return 4;
      if (selectedLevel >= 9) return 3;
      if (selectedLevel >= 5) return 2;
      return selectedLevel >= 2 ? 1 : 0;
    }
    return 0;
  }, [selectedClass, selectedLevel]);

  const schoolMap = {
    a: "Abjuration",
    c: "Conjuration",
    d: "Divination",
    e: "Enchantment",
    v: "Evocation",
    i: "Illusion",
    n: "Necromancy",
    t: "Transmutation",
  };

  const levelsPresent = useMemo(() => {
    return [...new Set(filtered.map((s) => s.level))].sort((a, b) => a - b);
  }, [filtered]);

  const getSortedForLevel = (lvl) => {
    return filtered
      .filter((s) => s.level === lvl)
      .sort((a, b) => {
        let key = sortConfig.key === "level" ? "name" : sortConfig.key;
        const getVal = (s, key) => {
          if (key === "name") return s.name.toLowerCase();
          if (key === "school") return s.school || "";
          if (key === "time") return getTimeStr(s);
          if (key === "conc")
            return s.duration && s.duration.some((d) => d.concentration)
              ? 0
              : 1;
          if (key === "ritual") return s.meta && s.meta.ritual ? 0 : 1;
          if (key === "mat")
            return s.components && (s.components.m || s.components.M) ? 0 : 1;
          if (key === "range") return getRangeStr(s);
          return "";
        };
        let va = getVal(a, key);
        let vb = getVal(b, key);
        let cmp =
          typeof va === "number"
            ? va - vb
            : String(va).localeCompare(String(vb));
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

  const limits = useMemo(() => {
    if (!classObj) return { cantrips: 0, spells: 0, type: "known" };

    let cantrips = 0;
    if (classObj.cantripProgression) {
      cantrips = classObj.cantripProgression[selectedLevel - 1] || 0;
    } else {
      const getColValue = (regex) => {
        if (!classObj.classTableGroups) return Infinity;
        for (const group of classObj.classTableGroups) {
          if (!group.colLabels) continue;
          const colIndex = group.colLabels.findIndex((l) => {
            const clean = l.replace(/\{@\w+\s*([^}]+)?\}/g, (m, c) =>
              c ? c.split("|")[0] : "",
            );
            return regex.test(clean);
          });
          if (colIndex !== -1 && group.rows && group.rows[selectedLevel - 1]) {
            let val = group.rows[selectedLevel - 1][colIndex];
            if (typeof val === "object" && val.value !== undefined)
              val = val.value;
            if (val === "-" || val === "\u2014") return 0;
            const parsed = parseInt(val, 10);
            return isNaN(parsed) ? Infinity : parsed;
          }
        }
        return Infinity;
      };
      cantrips = getColValue(/Cantrips/i);
      if (cantrips === Infinity) cantrips = 0;
    }

    let spells = 0;
    let type = "known";

    if (classObj.preparedSpellsProgression) {
      spells = classObj.preparedSpellsProgression[selectedLevel - 1] || 0;
      type = "prepared";
    } else if (classObj.spellsKnownProgression) {
      spells = classObj.spellsKnownProgression[selectedLevel - 1] || 0;
      type = "known";
    } else {
      const SPELLS_KNOWN_TABLE = {
        Sorcerer: [
          2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15,
          15,
        ],
        Warlock: [
          2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15,
          15,
        ],
        Bard: [
          4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22,
          22,
        ],
      };
      if (SPELLS_KNOWN_TABLE[selectedClass]) {
        spells =
          SPELLS_KNOWN_TABLE[selectedClass][selectedLevel - 1] || Infinity;
      } else {
        type = "prepared";
        const spellAbility = classObj.spellcastingAbility || "int";
        const abilityScore = scores[spellAbility] || 10;
        const abilityMod = Math.floor((abilityScore - 10) / 2);
        const halfLevel = Math.max(1, Math.floor(selectedLevel / 2));

        if (["Cleric", "Druid", "Wizard"].includes(selectedClass)) {
          spells = abilityMod + selectedLevel;
        } else if (["Paladin", "Ranger", "Artificer"].includes(selectedClass)) {
          spells = abilityMod + halfLevel;
        } else {
          spells = Infinity;
        }
        spells = Math.max(1, spells);
      }
    }
    return { cantrips, spells, type };
  }, [classObj, selectedClass, selectedLevel, scores]);

  const selectedCounts = useMemo(() => {
    let cantrips = 0;
    let leveled = 0;
    selectedSpells.forEach((name) => {
      const s = data.spells.find((x) => x.name === name);
      if (s) {
        if (s.level === 0) cantrips++;
        else leveled++;
      }
    });
    return { cantrips, leveled };
  }, [selectedSpells, data.spells]);

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
        color: sortConfig.key === key ? "var(--red-dark)" : "var(--ink-light)",
      }}
      onClick={() => handleSort(key)}
    >
      {label}{" "}
      {sortConfig.key === key ? (sortConfig.dir === "asc" ? "↑" : "↓") : ""}
    </th>
  );

  return (
    <div className="split-view spells-split-view">
      <style>{`
        .spells-split-view > .sidebar { flex: 1.5; max-width: none; }
        .spells-split-view > .content-pane { flex: 1; max-width: none; }
        @media (max-width: 700px) {
          .spells-split-view { flex-direction: column; }
          .spells-split-view > .sidebar, .spells-split-view > .content-pane { flex: none; width: 100%; }
        }
      `}</style>
      {showFilterModal && (
        <div
          className="info-modal-overlay"
          onClick={() => setShowFilterModal(false)}
          style={{
            zIndex: 2000,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
          }}
        >
          <div
            className="info-modal-content"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "var(--parchment)",
              border: "2px solid var(--gold)",
              padding: "20px",
              width: "90%",
              maxWidth: "600px",
              borderRadius: "5px",
              maxHeight: "80vh",
              overflowY: "auto",
              position: "relative",
            }}
          >
            <button
              className="close-modal-btn"
              onClick={() => setShowFilterModal(false)}
              style={{
                position: "absolute",
                top: "10px",
                right: "15px",
                background: "transparent",
                border: "none",
                fontSize: "1.5rem",
                cursor: "pointer",
                color: "var(--ink-light)",
              }}
            >
              ×
            </button>
            <h3
              style={{
                textAlign: "center",
                fontFamily: "Cinzel, serif",
                color: "var(--red-dark)",
                marginTop: 0,
                borderBottom: "1px solid var(--gold)",
                paddingBottom: "10px",
              }}
            >
              Filter Spells
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
                gap: "20px",
                marginBottom: "20px",
              }}
            >
              <div>
                <h4
                  style={{
                    borderBottom: "1px dashed var(--gold)",
                    paddingBottom: "4px",
                    marginBottom: "8px",
                  }}
                >
                  Level
                </h4>
                <FilterCheckbox label="Cantrip" category="levels" value={0} />
                {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((l) => (
                  <FilterCheckbox
                    key={l}
                    label={`Level ${l}`}
                    category="levels"
                    value={l}
                  />
                ))}
              </div>
              <div>
                <h4
                  style={{
                    borderBottom: "1px dashed var(--gold)",
                    paddingBottom: "4px",
                    marginBottom: "8px",
                  }}
                >
                  Components
                </h4>
                <FilterCheckbox
                  label="Verbal (V)"
                  category="components"
                  value="V"
                />
                <FilterCheckbox
                  label="Somatic (S)"
                  category="components"
                  value="S"
                />
                <FilterCheckbox
                  label="Material (M)"
                  category="components"
                  value="M"
                />
              </div>
              <div>
                <h4
                  style={{
                    borderBottom: "1px dashed var(--gold)",
                    paddingBottom: "4px",
                    marginBottom: "8px",
                  }}
                >
                  School
                </h4>
                {Object.entries(schoolMap).map(([k, v]) => (
                  <FilterCheckbox
                    key={k}
                    label={v}
                    category="schools"
                    value={k}
                  />
                ))}
              </div>
              <div>
                <h4
                  style={{
                    borderBottom: "1px dashed var(--gold)",
                    paddingBottom: "4px",
                    marginBottom: "8px",
                  }}
                >
                  Duration
                </h4>
                <FilterCheckbox
                  label="Instantaneous"
                  category="durations"
                  value="Instantaneous"
                />
                <FilterCheckbox
                  label="Concentration"
                  category="durations"
                  value="Concentration"
                />
                <FilterCheckbox
                  label="Time"
                  category="durations"
                  value="Time"
                />
                <FilterCheckbox
                  label="Permanent"
                  category="durations"
                  value="Permanent"
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
                borderTop: "1px solid var(--gold)",
                paddingTop: "15px",
              }}
            >
              <button
                className="btn"
                onClick={() =>
                  setFilters({
                    levels: [],
                    schools: [],
                    components: [],
                    durations: [],
                  })
                }
              >
                Clear Filters
              </button>
              <button
                className="btn btn-primary"
                onClick={() => setShowFilterModal(false)}
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="sidebar" style={{ background: "var(--parchment-dark)" }}>
        <div
          className="sidebar-header"
          style={{
            display: "flex",
            flexDirection: "row",
            gap: 6,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <h3
            style={{ margin: 0, fontSize: "1.1em", color: "var(--red-dark)" }}
          >
            Spells List
          </h3>
          <input
            type="text"
            className="search-input"
            placeholder="Search..."
            style={{ flex: 1, minWidth: "100px" }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button
            className="btn"
            style={{ padding: "6px 12px", fontSize: "0.85rem" }}
            onClick={() => setShowFilterModal(true)}
          >
            Filters{" "}
            {filters.levels.length +
              filters.schools.length +
              filters.components.length +
              filters.durations.length >
            0
              ? `(${filters.levels.length + filters.schools.length + filters.components.length + filters.durations.length})`
              : ""}
          </button>
        </div>
        <div className="sidebar-list">
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: "0.85rem",
            }}
          >
            <thead
              style={{
                position: "sticky",
                top: 0,
                background: "var(--parchment)",
                zIndex: 1,
              }}
            >
              <tr>
                {renderTh("Lvl", "level")}
                {renderTh("Name", "name")}
                {renderTh("Time", "time")}
                {renderTh("School", "school")}
                {renderTh("R", "ritual", { textAlign: "center", width: 20 })}
                {renderTh("C", "conc", { textAlign: "center", width: 20 })}
                {renderTh("M", "mat", { textAlign: "center", width: 20 })}
                {renderTh("Range", "range")}
              </tr>
            </thead>
            {!selectedClass ? (
              <tbody>
                <tr>
                  <td
                    colSpan="8"
                    style={{
                      padding: 10,
                      textAlign: "center",
                      fontStyle: "italic",
                      color: "var(--ink-light)",
                    }}
                  >
                    Select a class with spellcasting to see available spells.
                  </td>
                </tr>
              </tbody>
            ) : levelsPresent.length === 0 ? (
              <tbody>
                <tr>
                  <td
                    colSpan="8"
                    style={{
                      padding: 10,
                      textAlign: "center",
                      fontStyle: "italic",
                      color: "var(--ink-light)",
                    }}
                  >
                    No spells found.
                  </td>
                </tr>
              </tbody>
            ) : (
              levelsPresent.map((lvl) => (
                <tbody key={lvl}>
                  <tr>
                    <td
                      colSpan="8"
                      style={{
                        padding: "6px 8px",
                        background: "var(--parchment-dark)",
                        color: "var(--red-dark)",
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
                    const isSel = selectedSpells.has(s.name);
                    const isRitual = !!(s.meta && s.meta.ritual);
                    const isConc = !!(
                      s.duration && s.duration.some((d) => d.concentration)
                    );
                    const hasMat = !!(
                      s.components &&
                      (s.components.m || s.components.M)
                    );
                    return (
                      <tr
                        key={s.name + (s.source || "")}
                        onClick={() => {
                          onToggleSpell(s.name);
                          setSelectedSpellDetail(s);
                        }}
                        onMouseEnter={() => setSelectedSpellDetail(s)}
                        style={{
                          cursor: "pointer",
                          borderBottom: "1px solid rgba(212,175,55,0.2)",
                          background: isSel
                            ? "var(--red)"
                            : i % 2 === 0
                              ? "rgba(255,255,255,0.4)"
                              : "transparent",
                          color: isSel ? "white" : "var(--ink)",
                        }}
                      >
                        <td
                          style={{ padding: "4px 8px", whiteSpace: "nowrap" }}
                        >
                          {s.level === 0 ? "C" : s.level}
                        </td>
                        <td style={{ padding: "4px 8px", fontWeight: 600 }}>
                          {s.name}
                        </td>
                        <td
                          style={{ padding: "4px 8px", whiteSpace: "nowrap" }}
                        >
                          {getTimeStr(s)}
                        </td>
                        <td
                          style={{ padding: "4px 8px", whiteSpace: "nowrap" }}
                        >
                          {schoolMap[s.school?.toLowerCase()] || s.school}
                        </td>
                        <td style={{ padding: "4px 8px", textAlign: "center" }}>
                          {isRitual ? "✦" : ""}
                        </td>
                        <td style={{ padding: "4px 8px", textAlign: "center" }}>
                          {isConc ? "●" : ""}
                        </td>
                        <td style={{ padding: "4px 8px", textAlign: "center" }}>
                          {hasMat ? "◆" : ""}
                        </td>
                        <td
                          style={{ padding: "4px 8px", whiteSpace: "nowrap" }}
                        >
                          {getRangeStr(s)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              ))
            )}
          </table>
        </div>
      </div>
      <div className="content-pane">
        <div
          style={{
            background: "rgba(255,255,255,0.6)",
            border: "1px solid var(--gold)",
            borderRadius: 6,
            padding: "12px 16px",
            marginBottom: 20,
          }}
        >
          <h3 style={{ margin: "0 0 10px", color: "var(--red-dark)" }}>
            Spell Selections
          </h3>
          {!selectedClass ? (
            <em style={{ color: "var(--ink-light)", fontSize: "0.85rem" }}>
              Select a class to view limits.
            </em>
          ) : (
            <>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.9rem",
                  marginBottom: 4,
                }}
              >
                <span>Cantrips:</span>
                <strong
                  style={{
                    color:
                      selectedCounts.cantrips > limits.cantrips
                        ? "var(--red)"
                        : "var(--ink)",
                  }}
                >
                  {selectedCounts.cantrips} /{" "}
                  {limits.cantrips === Infinity ? "∞" : limits.cantrips}
                </strong>
              </div>
              {limits.cantrips !== Infinity && limits.cantrips > 0 && (
                <div
                  style={{
                    width: "100%",
                    background: "rgba(0,0,0,0.1)",
                    border: "1px solid rgba(0,0,0,0.1)",
                    height: 8,
                    borderRadius: 4,
                    overflow: "hidden",
                    marginBottom: 12,
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(100, (selectedCounts.cantrips / limits.cantrips) * 100)}%`,
                      background:
                        selectedCounts.cantrips > limits.cantrips
                          ? "var(--red)"
                          : "#3b82f6",
                      height: "100%",
                      transition: "width 0.3s",
                    }}
                  />
                </div>
              )}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontSize: "0.9rem",
                  marginBottom: 4,
                }}
              >
                <span>
                  {limits.type === "prepared"
                    ? "Max Prepared Spells"
                    : "Spells Known"}
                  :
                </span>
                <strong
                  style={{
                    color:
                      selectedCounts.leveled > limits.spells
                        ? "var(--red)"
                        : "var(--ink)",
                  }}
                >
                  {selectedCounts.leveled} /{" "}
                  {limits.spells === Infinity ? "∞" : limits.spells}
                </strong>
              </div>
              {limits.spells !== Infinity && limits.spells > 0 && (
                <div
                  style={{
                    width: "100%",
                    background: "rgba(0,0,0,0.1)",
                    border: "1px solid rgba(0,0,0,0.1)",
                    height: 8,
                    borderRadius: 4,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${Math.min(100, (selectedCounts.leveled / limits.spells) * 100)}%`,
                      background:
                        selectedCounts.leveled > limits.spells
                          ? "var(--red)"
                          : "#3b82f6",
                      height: "100%",
                      transition: "width 0.3s",
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {selectedSpellDetail && (
          <div
            style={{
              background: "rgba(255,255,255,0.6)",
              border: "1px solid var(--gold)",
              borderRadius: 6,
              padding: 16,
            }}
          >
            <h3 style={{ marginTop: 0, color: "var(--red-dark)" }}>
              {selectedSpellDetail.name}
            </h3>
            <p
              style={{
                margin: "4px 0",
                color: "var(--ink-light)",
                fontSize: "0.85rem",
              }}
            >
              {selectedSpellDetail.level === 0
                ? "Cantrip"
                : `${selectedSpellDetail.level}${["st", "nd", "rd"][selectedSpellDetail.level - 1] || "th"}-level`}
              {selectedSpellDetail.school &&
                ` ${schoolMap[selectedSpellDetail.school.toLowerCase()] || selectedSpellDetail.school}`}
              {selectedSpellDetail.meta?.ritual && " (Ritual)"}
              {selectedSpellDetail.meta?.concentration && " (Concentration)"}
            </p>
            {selectedSpellDetail.time && (
              <p style={{ margin: "4px 0", fontSize: "0.85rem" }}>
                <strong>Casting Time:</strong>{" "}
                {Array.isArray(selectedSpellDetail.time)
                  ? selectedSpellDetail.time
                      .map((t) => `${t.number} ${t.unit}`)
                      .join(", ")
                  : selectedSpellDetail.time}
              </p>
            )}
            {selectedSpellDetail.range && (
              <p style={{ margin: "4px 0", fontSize: "0.85rem" }}>
                <strong>Range:</strong>{" "}
                {typeof selectedSpellDetail.range === "object"
                  ? `${selectedSpellDetail.range.distance?.amount || ""} ${selectedSpellDetail.range.distance?.type || ""}`.trim()
                  : selectedSpellDetail.range}
              </p>
            )}
            {selectedSpellDetail.duration && (
              <p style={{ margin: "4px 0", fontSize: "0.85rem" }}>
                <strong>Duration:</strong>{" "}
                {Array.isArray(selectedSpellDetail.duration)
                  ? selectedSpellDetail.duration
                      .map((d) =>
                        d.type === "permanent"
                          ? "Until dispelled"
                          : d.type === "timed"
                            ? `${d.concentration ? "Concentration, " : ""}${d.duration?.amount || ""} ${d.duration?.type || ""}`.trim()
                            : d.type,
                      )
                      .join(", ")
                  : selectedSpellDetail.duration}
              </p>
            )}
            {selectedSpellDetail.entries && (
              <div
                style={{ marginTop: 10, fontSize: "0.9rem", lineHeight: 1.6 }}
              >
                <EntryHTML html={processEntries(selectedSpellDetail.entries)} />
              </div>
            )}
            {selectedSpellDetail.entriesHigherLevel && (
              <div
                style={{
                  marginTop: 10,
                  borderTop: "1px dashed var(--gold)",
                  paddingTop: 8,
                  fontSize: "0.9rem",
                }}
              >
                <EntryHTML
                  html={processEntries(selectedSpellDetail.entriesHigherLevel)}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Feat Picker Modal ────────────────────────────────────────────────────────
function FeatPickerModal({ feats, onClose, onSelect }) {
  const [search, setSearch] = useState("");
  const [selectedFeat, setSelectedFeat] = useState(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return feats.filter((f) => f.name.toLowerCase().includes(q));
  }, [feats, search]);

  return (
    <div
      className="info-modal-overlay"
      onClick={onClose}
      style={{
        zIndex: 1000,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
      }}
    >
      <div
        className="info-modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: "var(--parchment)",
          border: "2px solid var(--gold)",
          padding: 20,
          width: 950,
          maxWidth: "95vw",
          height: "85vh",
          display: "flex",
          flexDirection: "column",
          borderRadius: 5,
          position: "relative",
        }}
      >
        <button
          className="close-modal-btn"
          onClick={onClose}
          style={{
            position: "absolute",
            top: 10,
            right: 15,
            background: "transparent",
            border: "none",
            fontSize: "1.5rem",
            cursor: "pointer",
            color: "var(--ink-light)",
          }}
        >
          ×
        </button>
        <h3
          style={{
            textAlign: "center",
            fontFamily: "Cinzel, serif",
            color: "var(--red-dark)",
            marginTop: 0,
            borderBottom: "1px solid var(--gold)",
            paddingBottom: 10,
          }}
        >
          Select Feat
        </h3>

        <input
          type="text"
          className="search-input"
          placeholder="Search feats..."
          style={{ width: "100%", marginBottom: 10, padding: 8 }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <div
          style={{
            display: "flex",
            flex: 1,
            minHeight: 0,
            gap: "15px",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              flex: "0 0 300px",
              overflowY: "auto",
              paddingRight: "4px",
            }}
          >
            {filtered.map((f) => {
              const isSelected = selectedFeat === f;
              const category =
                f.category === "O" || f.category === "Origin"
                  ? "Origin"
                  : f.category === "G"
                    ? "General"
                    : f.category === "EB"
                      ? "Epic Boon"
                      : f.category || "";
              return (
                <div
                  key={f.name + (f.source || "")}
                  style={{
                    marginBottom: 6,
                    border: "1px solid var(--gold)",
                    borderRadius: 4,
                    background: isSelected
                      ? "var(--parchment-dark)"
                      : "rgba(255,255,255,0.5)",
                    cursor: "pointer",
                    transition: "background 0.15s",
                  }}
                  onClick={() => setSelectedFeat(f)}
                >
                  <div
                    style={{
                      padding: "8px 12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <strong
                        style={{
                          fontSize: "1.05rem",
                          color: isSelected ? "var(--red-dark)" : "var(--ink)",
                        }}
                      >
                        {f.name}
                      </strong>
                      <span
                        style={{
                          fontSize: "0.75rem",
                          opacity: 0.8,
                          background: "rgba(0,0,0,0.1)",
                          padding: "2px 4px",
                          borderRadius: 4,
                          marginLeft: 8,
                        }}
                      >
                        {category || f.source}
                      </span>
                    </div>
                    <button
                      className="btn btn-primary"
                      style={{ padding: "4px 10px", fontSize: "0.85rem" }}
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(f.name);
                      }}
                    >
                      Select
                    </button>
                  </div>
                </div>
              );
            })}
            {filtered.length === 0 && (
              <em style={{ color: "var(--text-muted)" }}>
                No feats match your search.
              </em>
            )}
          </div>

          <div
            style={{
              flex: "1",
              overflowY: "auto",
              paddingLeft: "10px",
              borderLeft: "1px solid var(--gold-light)",
            }}
          >
            {selectedFeat ? (
              <div
                style={{
                  fontSize: "0.95rem",
                  color: "var(--ink)",
                  paddingRight: "8px",
                }}
              >
                <h3
                  style={{
                    marginTop: 0,
                    color: "var(--red-dark)",
                    borderBottom: "1px solid var(--gold)",
                    paddingBottom: 6,
                  }}
                >
                  {selectedFeat.name}
                </h3>
                {formatPrerequisites(selectedFeat) && (
                  <div
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--red)",
                      fontStyle: "italic",
                      marginBottom: 8,
                    }}
                  >
                    Requires: {formatPrerequisites(selectedFeat)}
                  </div>
                )}
                {selectedFeat.ability && (
                  <div
                    style={{
                      fontSize: "0.9rem",
                      color: "var(--ink)",
                      marginBottom: 12,
                      background: "rgba(255,255,255,0.5)",
                      padding: 8,
                      borderRadius: 4,
                      border: "1px solid var(--gold-light)",
                    }}
                  >
                    <strong>Ability Score Increase:</strong>{" "}
                    {selectedFeat.ability
                      .map((a) => {
                        if (a.choose && a.choose.from)
                          return `Choose ${a.choose.count || a.choose.amount || 1} from ${a.choose.from.join(", ").toUpperCase()}`;
                        return Object.entries(a)
                          .filter(([k]) => k !== "choose")
                          .map(([k, v]) => `${k.toUpperCase()} +${v}`)
                          .join(", ");
                      })
                      .join("; ")}
                  </div>
                )}
                <div style={{ marginTop: 8, lineHeight: 1.6 }}>
                  <EntryHTML
                    html={processEntries(
                      selectedFeat.entries || selectedFeat.entry,
                    )}
                  />
                </div>
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "var(--ink-light)",
                  fontStyle: "italic",
                }}
              >
                Select a feat to view details
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Feats Tab ─────────────────────────────────────────────────────────────────
function FeatsTab({
  data,
  selectedClass,
  selectedLevel,
  selectedAsi,
  setSelectedAsi,
  extraFeats,
  setExtraFeats,
}) {
  const classObj = useMemo(
    () => getBestMatch(data.classes, selectedClass),
    [selectedClass, data.classes],
  );
  const classSource = classObj?.source || "PHB";

  const [pickerCtx, setPickerCtx] = useState(null);

  const asiFeatures = useMemo(() => {
    if (!selectedClass) return [];
    const targetCls = selectedClass.trim().toLowerCase();
    const map = new Map();
    data.classFeatures
      .filter(
        (f) =>
          f.className?.toLowerCase() === targetCls &&
          f.source === classSource &&
          !f.subclassShortName &&
          f.level <= selectedLevel &&
          (f.name === "Ability Score Improvement" || f.name === "Epic Boon"),
      )
      .forEach((f) => {
        if (!map.has(f.level)) map.set(f.level, f);
      });
    return Array.from(map.values()).sort((a, b) => a.level - b.level);
  }, [selectedClass, classSource, selectedLevel, data.classFeatures]);

  const uniqueFeats = useMemo(() => {
    const filtered = data.feats
      .filter((f) => f.name)
      .sort((a, b) => a.name.localeCompare(b.name));
    return dedup(filtered);
  }, [data.feats]);

  const addExtraFeat = () => setExtraFeats((prev) => [...prev, ""]);
  const removeExtraFeat = (index) =>
    setExtraFeats((prev) => prev.filter((_, i) => i !== index));
  const updateExtraFeat = (index, value) => {
    setExtraFeats((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  };

  const updateAsi = (level, updates) => {
    setSelectedAsi((prev) => ({
      ...prev,
      [level]: {
        ...(prev[level] || { type: "asi", stats: ["", ""] }),
        ...updates,
      },
    }));
  };

  return (
    <div
      className="content-pane"
      style={{
        padding: "20px",
        maxWidth: "800px",
        margin: "0 auto",
        width: "100%",
      }}
    >
      <h2 style={{ marginBottom: 20 }}>Feats & Ability Score Improvements</h2>

      {pickerCtx && (
        <FeatPickerModal
          feats={uniqueFeats}
          onClose={() => setPickerCtx(null)}
          onSelect={(featName) => {
            if (pickerCtx.type === "asi") {
              updateAsi(pickerCtx.level, { featName });
            } else if (pickerCtx.type === "extra") {
              updateExtraFeat(pickerCtx.idx, featName);
            }
            setPickerCtx(null);
          }}
        />
      )}

      {!selectedClass ? (
        <em style={{ color: "var(--text-muted)" }}>Select a class first.</em>
      ) : asiFeatures.length === 0 ? (
        <em style={{ color: "var(--text-muted)" }}>
          Your class doesn't grant any ASIs or Feats at this level.
        </em>
      ) : (
        asiFeatures.map((f) => {
          const choice = selectedAsi[f.level] || {
            type: "asi",
            stats: ["", ""],
          };
          return (
            <div
              key={f.level}
              style={{
                background: "rgba(255,255,255,0.6)",
                border: "1px solid var(--gold)",
                borderRadius: 6,
                padding: 16,
                marginBottom: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    color: "var(--red-dark)",
                    borderBottom: "none",
                  }}
                >
                  Level {f.level} {f.name}
                </h3>
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <button
                  className={`btn ${choice.type === "asi" ? "btn-primary" : ""}`}
                  onClick={() => updateAsi(f.level, { type: "asi" })}
                  style={{ flex: 1 }}
                >
                  Ability Score Improvement
                </button>
                <button
                  className={`btn ${choice.type === "feat" ? "btn-primary" : ""}`}
                  onClick={() => updateAsi(f.level, { type: "feat" })}
                  style={{ flex: 1 }}
                >
                  Select Feat
                </button>
              </div>
              {choice.type === "asi" ? (
                <div style={{ display: "flex", gap: 10 }}>
                  <select
                    className="styled-select"
                    style={{ flex: 1 }}
                    value={choice.stats[0] || ""}
                    onChange={(e) =>
                      updateAsi(f.level, {
                        stats: [e.target.value, choice.stats[1]],
                      })
                    }
                  >
                    <option value="" disabled>
                      -- Select Ability (+1) --
                    </option>
                    <option value="str">Strength</option>
                    <option value="dex">Dexterity</option>
                    <option value="con">Constitution</option>
                    <option value="int">Intelligence</option>
                    <option value="wis">Wisdom</option>
                    <option value="cha">Charisma</option>
                  </select>
                  <select
                    className="styled-select"
                    style={{ flex: 1 }}
                    value={choice.stats[1] || ""}
                    onChange={(e) =>
                      updateAsi(f.level, {
                        stats: [choice.stats[0], e.target.value],
                      })
                    }
                  >
                    <option value="" disabled>
                      -- Select Ability (+1) --
                    </option>
                    <option value="str">Strength</option>
                    <option value="dex">Dexterity</option>
                    <option value="con">Constitution</option>
                    <option value="int">Intelligence</option>
                    <option value="wis">Wisdom</option>
                    <option value="cha">Charisma</option>
                  </select>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    className="styled-select"
                    style={{
                      flex: 1,
                      textAlign: "left",
                      background: "rgba(255,255,255,0.8)",
                      cursor: "pointer",
                    }}
                    onClick={() =>
                      setPickerCtx({ type: "asi", level: f.level })
                    }
                  >
                    {choice.featName ? choice.featName : "-- Select Feat --"}
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}

      <h3
        style={{
          marginTop: 32,
          borderBottom: "1px solid var(--gold)",
          paddingBottom: 8,
        }}
      >
        Optional Feats
      </h3>
      {extraFeats.map((featName, idx) => (
        <div key={idx} style={{ display: "flex", gap: 10, marginBottom: 10 }}>
          <button
            className="styled-select"
            style={{
              flex: 1,
              textAlign: "left",
              background: "rgba(255,255,255,0.8)",
              cursor: "pointer",
            }}
            onClick={() => setPickerCtx({ type: "extra", idx })}
          >
            {featName ? featName : "-- Select Feat --"}
          </button>
          <button
            className="btn"
            style={{
              padding: "6px 12px",
              color: "var(--red)",
              fontWeight: "bold",
            }}
            onClick={() => removeExtraFeat(idx)}
          >
            ✕
          </button>
        </div>
      ))}
      <button className="btn" onClick={addExtraFeat} style={{ marginTop: 8 }}>
        + Add Optional Feat
      </button>
    </div>
  );
}

// ── Review Tab ────────────────────────────────────────────────────────────────
function ReviewTab({
  charName,
  setCharName,
  selectedClass,
  selectedLevel,
  selectedSpecies,
  selectedSubrace,
  selectedBackground,
  selectedDeity,
  scores,
  selectedSpells,
  selectedAsi,
  extraFeats,
  data,
}) {
  const finalScores = { ...scores };
  Object.values(selectedAsi).forEach((choice) => {
    if (choice.type === "asi") {
      if (choice.stats[0])
        finalScores[choice.stats[0]] = Math.min(
          20,
          (finalScores[choice.stats[0]] || 10) + 1,
        );
      if (choice.stats[1])
        finalScores[choice.stats[1]] = Math.min(
          20,
          (finalScores[choice.stats[1]] || 10) + 1,
        );
    }
  });

  const featFeatures = [];
  Object.values(selectedAsi).forEach((choice) => {
    if (choice.type === "feat" && choice.featName)
      featFeatures.push(choice.featName);
  });
  extraFeats.forEach((featName) => {
    if (featName) featFeatures.push(featName);
  });

  featFeatures.forEach((featName) => {
    const cands = data.feats?.filter((f) => f.name === featName) || [];
    const feat = resolveFeatureWithCopy(cands, [data.feats]);
    if (feat && feat.ability) {
      feat.ability.forEach((a) => {
        Object.entries(a).forEach(([k, v]) => {
          if (k !== "choose" && ABILITY_KEYS.includes(k)) {
            finalScores[k] = Math.min(20, (finalScores[k] || 10) + v);
          }
        });
      });
    }
  });

  const scoreDisplay = ABILITY_KEYS.map((k, i) => ({
    label: ABILITY_NAMES[i].slice(0, 3).toUpperCase(),
    value: finalScores[k] || 10,
  }));

  return (
    <div className="content-pane">
      <h2>Review Character</h2>
      <div
        style={{
          background: "rgba(255,255,255,0.5)",
          border: "1px solid var(--gold)",
          borderRadius: 6,
          padding: 16,
          marginBottom: 16,
        }}
      >
        <div className="field" style={{ marginBottom: 16 }}>
          <label
            className="field-label"
            style={{ display: "block", marginBottom: 4, fontWeight: 700 }}
          >
            Character Name *
          </label>
          <input
            type="text"
            value={charName}
            onChange={(e) => setCharName(e.target.value)}
            placeholder="Enter character name..."
            style={{
              width: "100%",
              fontSize: "1.2rem",
              padding: "8px 12px",
              border: "2px solid var(--gold)",
              borderRadius: 4,
              fontFamily: "Cinzel, serif",
              background: "rgba(255,255,255,0.9)",
            }}
          />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: 12,
          marginBottom: 16,
        }}
      >
        {[
          { label: "Class", value: selectedClass || "—" },
          { label: "Level", value: selectedLevel },
          { label: "Species", value: selectedSpecies || "—" },
          { label: "Subrace", value: selectedSubrace?.name || "—" },
          { label: "Background", value: selectedBackground || "—" },
          { label: "Deity", value: selectedDeity || "—" },
        ].map(({ label, value }) => (
          <div
            key={label}
            style={{
              background: "rgba(255,255,255,0.5)",
              border: "1px solid var(--gold)",
              borderRadius: 4,
              padding: 12,
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "Cinzel, serif",
                color: "var(--red-dark)",
                fontSize: "0.8rem",
                marginBottom: 4,
              }}
            >
              {label}
            </div>
            <div style={{ fontWeight: 700 }}>{value}</div>
          </div>
        ))}
      </div>

      <h3>Ability Scores</h3>
      <div
        style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 16 }}
      >
        {scoreDisplay.map(({ label, value }) => (
          <div
            key={label}
            style={{
              background: "rgba(255,255,255,0.5)",
              border: "1px solid var(--gold)",
              borderRadius: 4,
              padding: "8px 12px",
              textAlign: "center",
              minWidth: 60,
            }}
          >
            <div
              style={{
                fontFamily: "Cinzel, serif",
                color: "var(--red-dark)",
                fontSize: "0.75rem",
              }}
            >
              {label}
            </div>
            <div style={{ fontSize: "1.2rem", fontWeight: 700 }}>{value}</div>
            <div style={{ fontSize: "0.75rem", color: "var(--ink-light)" }}>
              {formatMod(calcMod(value))}
            </div>
          </div>
        ))}
      </div>

      {selectedSpells.size > 0 && (
        <div style={{ marginBottom: 12 }}>
          <h3>Selected Spells ({selectedSpells.size})</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {Array.from(selectedSpells).map((s) => (
              <span
                key={s}
                style={{
                  background: "rgba(255,255,255,0.6)",
                  border: "1px solid var(--gold)",
                  borderRadius: 12,
                  padding: "2px 8px",
                  fontSize: "0.85rem",
                }}
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {selectedFeats.size > 0 && (
        <div>
          <h3>Selected Feats ({selectedFeats.size})</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {Array.from(selectedFeats).map((f) => (
              <span
                key={f}
                style={{
                  background: "rgba(255,255,255,0.6)",
                  border: "1px solid var(--gold)",
                  borderRadius: 12,
                  padding: "2px 8px",
                  fontSize: "0.85rem",
                }}
              >
                {f}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main Character Creator ────────────────────────────────────────────────────
export default function CharacterCreatorPage() {
  const navigate = useNavigate();
  const { data, loading, noData } = useCreatorData();

  const [tabIndex, setTabIndex] = useState(0);

  // Selections
  const [selectedClass, setSelectedClass] = useState(null);
  const [selectedLevel, setSelectedLevel] = useState(1);
  const [selectedSubclass, setSelectedSubclass] = useState(null);
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [selectedSubrace, setSelectedSubrace] = useState(null);
  const [selectedBackground, setSelectedBackground] = useState(null);
  const [selectedDeity, setSelectedDeity] = useState(null);
  const [selectedSpells, setSelectedSpells] = useState(new Set());
  const [selectedAsi, setSelectedAsi] = useState({});
  const [extraFeats, setExtraFeats] = useState([]);
  const [charName, setCharName] = useState("");
  const [selectedClassSkills, setSelectedClassSkills] = useState([]);
  const [equipmentChoices, setEquipmentChoices] = useState({
    class: "A",
    background: "A",
  });

  // Feature Choices
  const [selectedOptions, setSelectedOptions] = useState(new Set());
  const toggleOption = useCallback((key, exclusiveGroupKey = null) => {
    setSelectedOptions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        if (exclusiveGroupKey) {
          for (const item of next) {
            if (item.startsWith(exclusiveGroupKey + "|||")) next.delete(item);
          }
        }
        next.add(key);
      }
      return next;
    });
  }, []);

  useEffect(() => {
    setSelectedClassSkills([]);
    setSelectedOptions(new Set());
  }, [selectedClass]);

  // Ability scores
  const [abilityMethod, setAbilityMethod] = useState("pointbuy");
  const [scores, setScores] = useState({
    str: 10,
    dex: 10,
    con: 10,
    int: 10,
    wis: 10,
    cha: 10,
  });

  // Species ability bonus
  const speciesBonus = useMemo(() => {
    if (!selectedSpecies) return {};
    const speciesObj = getBestMatch(data.species, selectedSpecies);
    const bonus = {};
    if (speciesObj?.ability) {
      speciesObj.ability.forEach((a) => {
        Object.entries(a).forEach(([k, v]) => {
          if (k !== "choose" && ABILITY_KEYS.includes(k))
            bonus[k] = (bonus[k] || 0) + v;
        });
      });
    }
    return bonus;
  }, [selectedSpecies, data.species]);

  const toggleSpell = useCallback((name) => {
    setSelectedSpells((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  function switchTab(idx) {
    if (idx < 0 || idx >= TABS.length) return;
    if (tabIndex === 0 && idx > 0 && !selectedClass) {
      alert("Please select a class first.");
      return;
    }
    setTabIndex(idx);
  }

  function createCharacter() {
    if (!charName.trim()) {
      alert("Please enter a character name.");
      return;
    }

    const finalScores = { ...scores };
    Object.values(selectedAsi).forEach((choice) => {
      if (choice.type === "asi") {
        if (choice.stats[0])
          finalScores[choice.stats[0]] = Math.min(
            20,
            (finalScores[choice.stats[0]] || 10) + 1,
          );
        if (choice.stats[1])
          finalScores[choice.stats[1]] = Math.min(
            20,
            (finalScores[choice.stats[1]] || 10) + 1,
          );
      }
    });

    const featFeatures = [];
    Object.values(selectedAsi).forEach((choice) => {
      if (choice.type === "feat" && choice.featName) {
        const cands =
          data.feats?.filter((f) => f.name === choice.featName) || [];
        const feat = resolveFeatureWithCopy(cands, [data.feats]);
        featFeatures.push({
          title: choice.featName,
          desc: feat
            ? cleanText(processEntries(feat.entries || feat.entry))
            : "",
          source: "feat",
        });
        if (feat && feat.ability) {
          feat.ability.forEach((a) => {
            Object.entries(a).forEach(([k, v]) => {
              if (k !== "choose" && ABILITY_KEYS.includes(k))
                finalScores[k] = Math.min(20, (finalScores[k] || 10) + v);
            });
          });
        }
      }
    });

    extraFeats.forEach((featName) => {
      if (!featName) return;
      const cands = data.feats?.filter((f) => f.name === featName) || [];
      const feat = resolveFeatureWithCopy(cands, [data.feats]);
      featFeatures.push({
        title: featName,
        desc: feat ? cleanText(processEntries(feat.entries || feat.entry)) : "",
        source: "feat",
      });
      if (feat && feat.ability) {
        feat.ability.forEach((a) => {
          Object.entries(a).forEach(([k, v]) => {
            if (k !== "choose" && ABILITY_KEYS.includes(k))
              finalScores[k] = Math.min(20, (finalScores[k] || 10) + v);
          });
        });
      }
    });

    const clsObj = getBestMatch(data.classes, selectedClass);
    const hitDie = clsObj?.hd?.faces || 8;
    const conMod = calcMod(finalScores.con || 10);
    let hp = hitDie + conMod;
    if (selectedLevel > 1)
      hp += (selectedLevel - 1) * (Math.floor(hitDie / 2) + 1 + conMod);
    hp = Math.max(1, hp);

    const pb = getPB(selectedLevel);
    const classFeatures = [];
    const targetCls = selectedClass ? selectedClass.trim().toLowerCase() : "";
    const targetSub = selectedSubclass
      ? selectedSubclass.trim().toLowerCase()
      : "";
    const classSource = clsObj?.source || "PHB";

    if (selectedClass) {
      const clsFeats = data.classFeatures.filter((f) => {
        const cName = f.className || f.class;
        return (
          cName?.trim().toLowerCase() === targetCls &&
          f.level <= selectedLevel &&
          !f.subclassShortName
        );
      });
      const featMap = new Map();
      clsFeats.forEach((f) => {
        let feature = f;
        if (!feature.entries && !feature.entry && feature._copy) {
          const cands = [
            feature,
            ...(data.classFeatures?.filter(
              (x) => x.name === feature._copy.name,
            ) || []),
          ];
          const resolved = resolveFeatureWithCopy(
            cands,
            [data.classFeatures],
            classSource,
          );
          if (resolved) feature = resolved;
        }
        const key = `${feature.name.trim()}|${feature.level}`;
        const hasContent = !!(feature.entries || feature.entry);
        if (!featMap.has(key)) featMap.set(key, { feature, hasContent });
        else if (!featMap.get(key).hasContent && hasContent)
          featMap.set(key, { feature, hasContent: true });
      });
      Array.from(featMap.values()).forEach(({ feature }) =>
        classFeatures.push({
          title: feature.name,
          desc: cleanText(processEntries(feature.entries || feature.entry)),
          source: "class",
        }),
      );
    }

    if (selectedClass && selectedSubclass) {
      const subFeats = data.subclassFeatures.filter((f) => {
        const cName = f.className || f.class;
        const sName = f.subclassShortName || f.subclassName || f.subclass;
        return (
          cName?.trim().toLowerCase() === targetCls &&
          sName?.trim().toLowerCase() === targetSub &&
          f.level <= selectedLevel
        );
      });
      const featMap = new Map();
      subFeats.forEach((f) => {
        let feature = f;
        if (!feature.entries && !feature.entry && feature._copy) {
          const cands = [
            feature,
            ...(data.subclassFeatures?.filter(
              (x) => x.name === feature._copy.name,
            ) || []),
            ...(data.classFeatures?.filter(
              (x) => x.name === feature._copy.name,
            ) || []),
          ];
          const resolved = resolveFeatureWithCopy(
            cands,
            [data.subclassFeatures, data.classFeatures],
            classSource,
          );
          if (resolved) feature = resolved;
        }
        const key = `${feature.name.trim()}|${feature.level}`;
        const hasContent = !!(feature.entries || feature.entry);
        if (!featMap.has(key)) featMap.set(key, { feature, hasContent });
        else if (!featMap.get(key).hasContent && hasContent)
          featMap.set(key, { feature, hasContent: true });
      });
      Array.from(featMap.values()).forEach(({ feature }) =>
        classFeatures.push({
          title: feature.name,
          desc: cleanText(processEntries(feature.entries || feature.entry)),
          source: "subclass",
        }),
      );
    }

    const raceFeatures = [];
    if (selectedSpecies) {
      const speciesObj = getBestMatch(data.species, selectedSpecies);
      if (speciesObj?.entries) {
        const walk = (obj) => {
          if (!obj) return;
          if (Array.isArray(obj)) {
            obj.forEach(walk);
            return;
          }
          if (typeof obj === "object" && obj.name && obj.entries) {
            raceFeatures.push({
              title: obj.name,
              desc: cleanText(processEntries(obj.entries)),
              source: "race",
            });
          }
          if (obj.entries) walk(obj.entries);
        };
        walk(speciesObj.entries);
      }
    }

    const bgFeatures = [];
    if (selectedBackground) {
      const bgObj = resolveBackgroundWithCopy(getBestMatch(data.backgrounds, selectedBackground), data.backgrounds);
      if (bgObj?.entries) {
        const walk = (obj) => {
          if (!obj) return;
          if (Array.isArray(obj)) {
            obj.forEach(walk);
            return;
          }
          if (
            typeof obj === "object" &&
            obj.name &&
            obj.entries &&
            obj.name !== selectedBackground
          ) {
            bgFeatures.push({
              title: obj.name,
              desc: cleanText(processEntries(obj.entries)),
              source: "background",
            });
          }
          if (obj.entries) walk(obj.entries);
        };
        walk(bgObj.entries);
      }
    }

    const skillProficiency = {};
    if (selectedClass) {
      const clsObj = getBestMatch(data.classes, selectedClass);
      if (clsObj?.startingProficiencies?.skills) {
        clsObj.startingProficiencies.skills.forEach((sk) => {
          if (typeof sk === "string") {
            skillProficiency[sk.toLowerCase().replace(/ /g, "_")] = true;
          } else if (sk.choose) {
            // handled by selectedClassSkills loop below
          } else {
            Object.keys(sk).forEach((k) => {
              if (k !== "choose" && sk[k] === true)
                skillProficiency[k.toLowerCase().replace(/ /g, "_")] = true;
            });
          }
        });
      }
    }
    selectedClassSkills.forEach((sk) => {
      if (sk) skillProficiency[sk.toLowerCase().replace(/ /g, "_")] = true;
    });

    selectedOptions.forEach((optKey) => {
      const parts = optKey.split("|||");
      const name = parts[parts.length - 1];
      const cands = [
        ...(data.optionalFeatures?.filter((f) => f.name === name) || []),
        ...(data.classFeatures?.filter((f) => f.name === name) || []),
        ...(data.feats?.filter((f) => f.name === name) || []),
      ];
      const resolvedFeat = resolveFeatureWithCopy(cands, [
        data.optionalFeatures,
        data.classFeatures,
        data.feats,
      ]);
      if (resolvedFeat) {
        classFeatures.push({
          title: resolvedFeat.name,
          desc: cleanText(
            processEntries(resolvedFeat.entries || resolvedFeat.entry),
          ),
          source: "choice",
        });
      } else {
        classFeatures.push({
          title: "Feature Choice",
          desc: name,
          source: "choice",
        });
      }
    });

    // Build spell slots based on class
    const spellSlotsData = (() => {
      const FULL_CASTER_SLOTS = {
        1: [[2, 0, 0, 0, 0, 0, 0, 0, 0]],
        2: [[3, 0, 0, 0, 0, 0, 0, 0, 0]],
        3: [[4, 2, 0, 0, 0, 0, 0, 0, 0]],
        4: [[4, 3, 0, 0, 0, 0, 0, 0, 0]],
        5: [[4, 3, 2, 0, 0, 0, 0, 0, 0]],
        6: [[4, 3, 3, 0, 0, 0, 0, 0, 0]],
        7: [[4, 3, 3, 1, 0, 0, 0, 0, 0]],
        8: [[4, 3, 3, 2, 0, 0, 0, 0, 0]],
        9: [[4, 3, 3, 3, 1, 0, 0, 0, 0]],
        10: [[4, 3, 3, 3, 2, 0, 0, 0, 0]],
        11: [[4, 3, 3, 3, 2, 1, 0, 0, 0]],
        12: [[4, 3, 3, 3, 2, 1, 0, 0, 0]],
        13: [[4, 3, 3, 3, 2, 1, 1, 0, 0]],
        14: [[4, 3, 3, 3, 2, 1, 1, 0, 0]],
        15: [[4, 3, 3, 3, 2, 1, 1, 1, 0]],
        16: [[4, 3, 3, 3, 2, 1, 1, 1, 0]],
        17: [[4, 3, 3, 3, 2, 1, 1, 1, 1]],
        18: [[4, 3, 3, 3, 3, 1, 1, 1, 1]],
        19: [[4, 3, 3, 3, 3, 2, 1, 1, 1]],
        20: [[4, 3, 3, 3, 3, 2, 2, 1, 1]],
      };
      const fc = ["Bard", "Cleric", "Druid", "Sorcerer", "Wizard"];
      if (!selectedClass || !fc.includes(selectedClass)) return [];
      const slots = FULL_CASTER_SLOTS[selectedLevel]?.[0] || [];
      return slots
        .map((total, i) =>
          total > 0 ? { level: i + 1, total, used: 0 } : null,
        )
        .filter(Boolean);
    })();

    const character = {
      charName: charName.trim(),
      charClass: selectedClass || "",
      charSubclass: selectedSubclass || "",
      level: selectedLevel,
      race: selectedSpecies || "",
      profBonus: `+${pb}`,
      str: finalScores.str || 10,
      dex: finalScores.dex || 10,
      con: finalScores.con || 10,
      int: finalScores.int || 10,
      wis: finalScores.wis || 10,
      cha: finalScores.cha || 10,
      hp: hp,
      maxHp: hp,
      tempHp: 0,
      baseAC: 10,
      speed: 30,
      deity: selectedDeity || "",
      classFeatures,
      raceFeatures,
      backgroundFeatures: bgFeatures,
      feats: featFeatures,
      spellSlotsData,
      skillProficiency,
      preparedSpells: Array.from(selectedSpells).map((name) => {
        const s = data.spells.find((sp) => sp.name === name);
        return {
          name,
          level: s?.level || 1,
          description: s ? cleanText(processEntries(s.entries || [])) : "",
        };
      }),
      inventory: [],
      spellAbility: getSpellAbility(selectedClass),
      activeTab: "features",
    };

    localStorage.setItem("dndCharacter", JSON.stringify(character));
    navigate("/");
  }

  function getSpellAbility(cls) {
    const map = {
      Bard: "cha",
      Cleric: "wis",
      Druid: "wis",
      Paladin: "cha",
      Ranger: "wis",
      Sorcerer: "cha",
      Warlock: "cha",
      Wizard: "int",
      Artificer: "int",
    };
    return map[cls] || "int";
  }

  const currentTab = TABS[tabIndex];

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "var(--parchment)",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: "4px solid var(--gold)",
            borderTopColor: "var(--red-dark)",
            borderRadius: "50%",
            animation: "spin 0.7s linear infinite",
          }}
        />
        <div style={{ fontFamily: "Cinzel, serif", color: "var(--red-dark)" }}>
          Loading character data...
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (noData) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100vh",
          background: "var(--parchment)",
          flexDirection: "column",
          gap: 16,
          padding: 20,
          textAlign: "center",
        }}
      >
        <h2 style={{ fontFamily: "Cinzel, serif", color: "var(--red-dark)" }}>
          No Data Found
        </h2>
        <p>The character creator requires D&D 5e data to be loaded first.</p>
        <p>
          Please visit the{" "}
          <Link to="/data" style={{ color: "var(--red)" }}>
            Data Viewer
          </Link>{" "}
          and fetch a D&D 5e data zip file via URL.
        </p>
        <Link to="/" className="btn btn-primary">
          Back to Character Sheet
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="creator-page">
        <nav className="app-nav">
          <Link
            to="/"
            style={{
              display: "flex",
              alignItems: "center",
              padding: "0 14px",
              color: "var(--ink-light)",
              fontFamily: "Cinzel, serif",
              fontSize: 13,
              textDecoration: "none",
              borderBottom: "3px solid transparent",
              flexShrink: 0,
            }}
          >
            ← Sheet
          </Link>
          {TABS.map((tab, i) => (
            <button
              key={tab}
              className={`nav-tab${tabIndex === i ? " active" : ""}`}
              onClick={() => switchTab(i)}
            >
              {TAB_LABELS[tab]}
            </button>
          ))}
        </nav>

        <div
          className="app-body"
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            position: "relative",
            background: "var(--parchment)",
          }}
        >
          {currentTab === "class" && (
            <ClassTab
              data={data}
              selectedClass={selectedClass}
              onSelectClass={setSelectedClass}
              selectedLevel={selectedLevel}
              onSelectLevel={setSelectedLevel}
              selectedSubclass={selectedSubclass}
              onSelectSubclass={setSelectedSubclass}
              selectedClassSkills={selectedClassSkills}
              onSelectClassSkills={setSelectedClassSkills}
              selectedOptions={selectedOptions}
              onToggleOption={toggleOption}
            />
          )}
          {currentTab === "race" && (
            <SpeciesTab
              data={data}
              selected={selectedSpecies}
              onSelect={setSelectedSpecies}
              selectedSubrace={selectedSubrace}
              onSelectSubrace={setSelectedSubrace}
            />
          )}
          {currentTab === "abilities" && (
            <AbilitiesTab
              scores={scores}
              setScores={setScores}
              method={abilityMethod}
              setMethod={setAbilityMethod}
              speciesBonus={speciesBonus}
            />
          )}
          {currentTab === "background" && (
            <BackgroundTab
              data={data}
              selected={selectedBackground}
              onSelect={setSelectedBackground}
              selectedOptions={selectedOptions}
              onToggleOption={toggleOption}
            />
          )}
          {currentTab === "bgextra" && (
            <BgExtraTab
              data={data}
              selectedDeity={selectedDeity}
              onSelectDeity={setSelectedDeity}
            />
          )}
          {currentTab === "equipment" && (
            <EquipmentTab
              data={data}
              selectedClass={selectedClass}
              selectedBackground={selectedBackground}
              equipmentChoices={equipmentChoices}
              setEquipmentChoices={setEquipmentChoices}
            />
          )}
          {currentTab === "spells" && (
            <SpellsTab
              data={data}
              selectedClass={selectedClass}
              selectedLevel={selectedLevel}
              selectedSpells={selectedSpells}
              onToggleSpell={toggleSpell}
              scores={scores}
            />
          )}
          {currentTab === "feats" && (
            <FeatsTab
              data={data}
              selectedClass={selectedClass}
              selectedLevel={selectedLevel}
              selectedAsi={selectedAsi}
              setSelectedAsi={setSelectedAsi}
              extraFeats={extraFeats}
              setExtraFeats={setExtraFeats}
            />
          )}
          {currentTab === "review" && (
            <ReviewTab
              charName={charName}
              setCharName={setCharName}
              selectedClass={selectedClass}
              selectedLevel={selectedLevel}
              selectedSpecies={selectedSpecies}
              selectedSubrace={selectedSubrace}
              selectedBackground={selectedBackground}
              selectedDeity={selectedDeity}
              data={data}
              scores={scores}
              selectedSpells={selectedSpells}
              selectedAsi={selectedAsi}
              extraFeats={extraFeats}
            />
          )}
        </div>

        <footer className="app-footer">
          {tabIndex > 0 ? (
            <button className="btn" onClick={() => switchTab(tabIndex - 1)}>
              Previous
            </button>
          ) : (
            <div />
          )}
          {tabIndex < TABS.length - 1 ? (
            <button
              className="btn btn-primary"
              onClick={() => switchTab(tabIndex + 1)}
            >
              Next
            </button>
          ) : (
            <button className="btn btn-primary" onClick={createCharacter}>
              Create Character
            </button>
          )}
        </footer>
      </div>
    </>
  );
}
