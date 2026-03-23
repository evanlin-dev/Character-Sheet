import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { processEntries as originalProcessEntries, cleanText } from "src/utils/dndEntries";
import FluffImage from "src/components/FluffImage";
import { skillsMap } from "src/data/constants";
import "src/styles/CharacterCreatorPage.css";
import { ModalOverlay, ModalBox, ModalTitle, CloseBtn } from "src/styles/shared";
import {
  dedup,
  getBestMatch,
  resolveFeatureWithCopy,
  resolveBackgroundWithCopy,
  resolveRaceWithCopy,
  capitalizeSkill,
  resolveFluffWithCopy,
  formatPrerequisites,
  extractOptionSets,
  extractChoiceLists,
} from "src/utils/creatorLogic";
import { useCreatorData } from "src/utils/useCreatorData";
import FeatureChoices from "src/components/FeatureChoices";
import { getGlobalSourcePriority, replaceAtkTags } from "src/utils/formatHelpers";
import SpellTable, { schoolMap, getTimeStr, getRangeStr } from "src/components/SpellTable";

const TABS = [
  "class",
  "race",
  "background",
  "bgextra",
  "equipment",
  "spells",
  "feats",
  "abilities",
  "review",
];
const TAB_LABELS = {
  class: "1. Class",
  race: "2. Species",
  background: "3. Background",
  bgextra: "4. Bg. Extra",
  equipment: "5. Equipment",
  spells: "6. Spells",
  feats: "7. Feats",
  abilities: "8. Abilities",
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

const sanitizeTableCells = (obj) => {
  if (Array.isArray(obj)) return obj.map(sanitizeTableCells);
  if (obj && typeof obj === "object") {
    if (obj.type === "cell" && obj.roll && !obj.entry) {
      if (obj.roll.exact !== undefined) {
        return String(obj.roll.exact);
      } else if (obj.roll.min !== undefined && obj.roll.max !== undefined) {
        return obj.roll.min === obj.roll.max ? String(obj.roll.min) : `${obj.roll.min}-${obj.roll.max}`;
      }
    }
    const res = {};
    for (const k in obj) res[k] = sanitizeTableCells(obj[k]);
    return res;
  }
  return obj;
};
const processEntries = (entries) => originalProcessEntries(sanitizeTableCells(entries));

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
  const handleClick = (e) => {
    if (e.target.classList.contains('spell-link')) {
      const spellName = e.target.getAttribute('data-spell');
      document.dispatchEvent(new CustomEvent('preview-spell', { detail: spellName }));
    }
    if (e.target.classList.contains('feat-link')) {
      const featName = e.target.getAttribute('data-feat');
      document.dispatchEvent(new CustomEvent('preview-feat', { detail: featName }));
    }
  };

  const toTitleCase = (str) => {
    const lowers = ["a", "an", "and", "as", "at", "but", "by", "for", "from", "in", "into", "near", "nor", "of", "on", "onto", "or", "the", "to", "with"];
    return str.split(" ").map((w, i) => {
      if (i !== 0 && lowers.includes(w.toLowerCase())) return w.toLowerCase();
      return w.split(/([/-])/).map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join('');
    }).join(" ");
  };

  let processed = html || "";
  const spellMapList = [];
  const featMapList = [];
  if (typeof processed === 'string') {
    processed = processed.replace(/\{@spell ([^|}]+)(?:\|[^}]*)?\}/gi, (match, spellName) => {
        spellMapList.push({ orig: spellName, title: toTitleCase(spellName) });
        return `__SPELL_LINK_${spellMapList.length - 1}__`;
    });
    processed = processed.replace(/\{@feat ([^|}]+)(?:\|[^}]*)?\}/gi, (match, featName) => {
        featMapList.push({ orig: featName, title: toTitleCase(featName) });
        return `__FEAT_LINK_${featMapList.length - 1}__`;
    });

    processed = processed.replace(/\{@recharge\s*([^}]*)\}/gi, (_, p1) => p1 ? `(Recharge ${p1}-6)` : `(Recharge 6)`);
    processed = replaceAtkTags(processed);
    processed = processed.replace(/\{@h\}/gi, '<em>Hit:</em> ');
    processed = processed.replace(/\{@damage\s+([^|}]+)[^}]*\}/gi, '$1');
    processed = processed.replace(/\{@dice\s+([^|}]+)[^}]*\}/gi, '$1');
    processed = processed.replace(/\{@hit\s+([^|}]+)[^}]*\}/gi, '+$1');
    processed = processed.replace(/\{@dc\s+([^|}]+)[^}]*\}/gi, 'DC $1');

    processed = cleanText(processed);
    spellMapList.forEach((spellItem, i) => {
        processed = processed.replace(`__SPELL_LINK_${i}__`, `<span class="spell-link" style="color: var(--red-dark); font-weight: bold; cursor: pointer; border-bottom: 1px dashed var(--red-dark);" data-spell="${spellItem.orig.replace(/"/g, '&quot;')}">${spellItem.title}</span>`);
    });
    featMapList.forEach((featItem, i) => {
        processed = processed.replace(`__FEAT_LINK_${i}__`, `<span class="feat-link" style="color: var(--red-dark); font-weight: bold; cursor: pointer; border-bottom: 1px dashed var(--red-dark);" data-feat="${featItem.orig.replace(/"/g, '&quot;')}">${featItem.title}</span>`);
    });
  } else {
    processed = cleanText(processed);
  }

  return (
    <div onClick={handleClick} dangerouslySetInnerHTML={{ __html: processed }} style={style} />
  );
}

// ── Ability Score Tab ─────────────────────────────────────────────────────────
function AbilitiesTab({
  scores, manualScores, setManualScores, method, setMethod, speciesBonus, backgroundBonus,
  standardAssign, setStandardAssign, pbValues, setPbValues, selectedClass
}) {
  const pointsUsed = useMemo(
    () =>
      Object.values(pbValues).reduce((sum, v) => sum + (PB_COSTS[v] || 0), 0),
    [pbValues],
  );

  const assignedValues = Object.values(standardAssign);
  const remainingArray = STANDARD_ARRAY.filter((v, i) =>
    !assignedValues.includes(v) ||
    assignedValues.indexOf(v) !== assignedValues.lastIndexOf(v)
      ? false
      : assignedValues.filter((x) => x === v).length <
        STANDARD_ARRAY.filter((x) => x === v).length,
  );

  const handleRecommendStats = () => {
    if (!selectedClass) return;
    const classStatPriorities = {
      Barbarian: ["str", "con", "dex", "wis", "cha", "int"],
      Bard: ["cha", "dex", "con", "wis", "int", "str"],
      Cleric: ["wis", "con", "str", "dex", "int", "cha"],
      Druid: ["wis", "con", "dex", "int", "cha", "str"],
      Fighter: ["str", "con", "dex", "wis", "int", "cha"],
      Monk: ["dex", "wis", "con", "str", "int", "cha"],
      Paladin: ["str", "cha", "con", "wis", "dex", "int"],
      Ranger: ["dex", "wis", "con", "str", "int", "cha"],
      Rogue: ["dex", "con", "int", "wis", "cha", "str"],
      Sorcerer: ["cha", "con", "dex", "wis", "int", "str"],
      Warlock: ["cha", "con", "dex", "wis", "int", "str"],
      Wizard: ["int", "con", "dex", "wis", "cha", "str"],
      Artificer: ["int", "con", "dex", "wis", "cha", "str"],
    };

    let priority = classStatPriorities[selectedClass] || ["str", "dex", "con", "int", "wis", "cha"];
    const newAssign = {};
    const sortedArray = [...STANDARD_ARRAY].sort((a, b) => b - a); // 15, 14, 13, 12, 10, 8
    priority.forEach((ab, idx) => {
      newAssign[ab] = sortedArray[idx];
    });
    setStandardAssign(newAssign);
    setMethod("standard");
  };

  return (
    <div className="content-pane">
      <h2>Ability Scores</h2>
      <div
        style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}
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
        {selectedClass && (
          <button
            className="btn btn-secondary"
            style={{ fontSize: "0.85rem", padding: "6px 14px", marginLeft: "auto", background: "var(--gold-dark)", borderColor: "var(--gold-dark)", color: "white" }}
            onClick={handleRecommendStats}
          >
            ✨ Auto-Assign Recommended
          </button>
        )}
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
          const bgBonus = backgroundBonus?.[key] || 0;
          const base =
            method === "pointbuy"
              ? pbValues[key]
              : method === "standard"
                ? standardAssign[key] || ""
                : manualScores[key] || 10;
          const total = scores[key];

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
                    value={manualScores[key] || 10}
                    onChange={(e) =>
                      setManualScores((s) => ({
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
              {bgBonus !== 0 && (
                <div
                  style={{
                    fontSize: "0.8rem",
                    color: bgBonus > 0 ? "var(--green, #2d6a4f)" : "var(--red)",
                  }}
                >
                  Background: {bgBonus > 0 ? `+${bgBonus}` : bgBonus}
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
  speciesAsi,
  setSpeciesAsi,
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
    let match = getBestMatch(data.species, selected);
    return resolveRaceWithCopy(match, data.species);
  }, [selected, data.species]);

  const subraces = useMemo(() => {
    if (!selected) return [];
    return data.subraces.filter(
      (s) => s.raceName === selected || s.race?.name === selected,
    );
  }, [selected, data.subraces]);

  const fluff = useMemo(() => {
    if (!speciesObj) return null;
    let match = data.raceFluff?.find(
        (f) => f.name === selected && f.source === speciesObj.source,
      ) || data.raceFluff?.find((f) => f.name === selected);
    if (!match && speciesObj.fluff) match = speciesObj.fluff;
    return resolveFluffWithCopy(match, data.raceFluff || []);
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
              <div
                style={{
                  marginBottom: 16,
                  padding: fluff?.entries ? "12px 16px" : 0,
                  background: fluff?.entries ? "rgba(212,165,116,0.1)" : "transparent",
                  border: fluff?.entries ? "1px solid var(--gold)" : "none",
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

          {speciesObj && (
            <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(255,255,255,0.5)", border: "1px solid var(--gold)", borderRadius: 4 }}>
              <strong style={{ display: "block", marginBottom: 8, color: "var(--red-dark)" }}>Species Ability Score Adjustment</strong>
              <p style={{ fontSize: "0.9rem", marginBottom: 12 }}>
                Choose your ability score increases (override default species bonuses).
              </p>
              <div style={{ marginBottom: 12 }}>
                <label style={{ display: "block", fontWeight: "bold", marginBottom: 4, fontSize: "0.9rem" }}>Adjustment Method:</label>
                <select
                  className="styled-select"
                  value={speciesAsi.method}
                  onChange={(e) => setSpeciesAsi({ ...speciesAsi, method: e.target.value })}
                >
                  <option value="none">None</option>
                  <option value="default">Default (from Species)</option>
                  <option value="flat">+1 to Three Scores</option>
                  <option value="split">+2 to One, +1 to Another</option>
                </select>
              </div>
              {speciesAsi.method === "flat" && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  {[1, 2, 3].map((i) => (
                    <div key={i} style={{ flex: 1, minWidth: 120 }}>
                      <label style={{ fontSize: "0.85rem" }}>Score {i} (+1)</label>
                      <select
                        className="styled-select"
                        value={speciesAsi[`s${i}`]}
                        onChange={(e) => setSpeciesAsi({ ...speciesAsi, [`s${i}`]: e.target.value })}
                      >
                        <option value="" disabled>-- Select --</option>
                        {['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'].map(ab => (
                          <option key={ab} value={ab} disabled={
                            [1, 2, 3].filter(n => n !== i).map(n => speciesAsi[`s${n}`]).includes(ab)
                          }>{ab}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              )}
              {speciesAsi.method === "split" && (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <label style={{ fontSize: "0.85rem" }}>Score (+2)</label>
                    <select
                      className="styled-select"
                      value={speciesAsi.p2}
                      onChange={(e) => setSpeciesAsi({ ...speciesAsi, p2: e.target.value })}
                    >
                      <option value="" disabled>-- Select --</option>
                      {['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'].map(ab => (
                        <option key={ab} value={ab} disabled={speciesAsi.p1 === ab}>{ab}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1, minWidth: 120 }}>
                    <label style={{ fontSize: "0.85rem" }}>Score (+1)</label>
                    <select
                      className="styled-select"
                      value={speciesAsi.p1}
                      onChange={(e) => setSpeciesAsi({ ...speciesAsi, p1: e.target.value })}
                    >
                      <option value="" disabled>-- Select --</option>
                      {['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'].map(ab => (
                        <option key={ab} value={ab} disabled={speciesAsi.p2 === ab}>{ab}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>
        )}
      </div>
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
  selectedSpells,
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
        (a, b) => getGlobalSourcePriority(b.source) - getGlobalSourcePriority(a.source),
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
    let match = matches.sort(
      (a, b) => getGlobalSourcePriority(b.source) - getGlobalSourcePriority(a.source),
    )[0] || null;
    if (!match && subclassObj?.fluff) match = subclassObj.fluff;
    return resolveFluffWithCopy(match, data.subclassFluff || []);
  }, [selectedSubclass, selectedClass, data.subclassFluff, subclassObj]);

  const classFluff = useMemo(() => {
    if (!selectedClass) return null;
    let match = data.classFluff?.find(
        (f) => f.name === selectedClass && f.source === classSource,
      ) || data.classFluff?.find((f) => f.name === selectedClass);
    if (!match && classObj?.fluff) match = classObj.fluff;
    return resolveFluffWithCopy(match, data.classFluff || []);
  }, [selectedClass, classSource, data.classFluff, classObj]);

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
                color: "var(--ink)",
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
                    subclassSelected={selectedSubclass}
                    selectedSpells={selectedSpells}
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

              <div
                style={{
                  marginBottom: 16,
                  padding: classFluff?.entries ? "12px 16px" : 0,
                  background: classFluff?.entries ? "rgba(212,165,116,0.08)" : "transparent",
                  border: classFluff?.entries ? "1px solid var(--gold)" : "none",
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

            {selectedSubclass && (
              <div
                style={{
                  marginBottom: 16,
                  padding: subclassIntro ? "12px 16px" : 0,
                  background: subclassIntro ? "rgba(212,165,116,0.12)" : "transparent",
                  border: subclassIntro ? "1px solid var(--gold)" : "none",
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
                {subclassIntro && (
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
                )}
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
                        color: "var(--ink)",
                        border: "1px solid var(--gold)",
                      }}
                    >
                      Lvl
                    </th>
                    <th
                      style={{
                        padding: "3px 4px",
                        background: "var(--parchment-dark)",
                        color: "var(--ink)",
                        border: "1px solid var(--gold)",
                      }}
                    >
                      PB
                    </th>
                    <th
                      style={{
                        padding: "3px 4px",
                        background: "var(--parchment-dark)",
                        color: "var(--ink)",
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
                            color: "var(--ink)",
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
                                {cleanTag(val)}
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
  backgroundAsi,
  setBackgroundAsi,
  selectedSpells,
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

  const foundAbilities = useMemo(() => {
    if (!bgObj) return [];
    const allAbilities = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'];
    let found = [];
    if (bgObj.ability) {
      const codes = new Set();
      bgObj.ability.forEach(a => {
        if (a.choose?.weighted?.from) a.choose.weighted.from.forEach(c => codes.add(c));
        else if (a.choose?.from) a.choose.from.forEach(c => codes.add(c));
        Object.keys(a).forEach(k => { if (['str','dex','con','int','wis','cha'].includes(k)) codes.add(k); });
      });
      const map = { str: 'Strength', dex: 'Dexterity', con: 'Constitution', int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma' };
      codes.forEach(c => { if (map[c]) found.push(map[c]); });
    }
    if (found.length === 0 && bgObj.entries) {
      let asiEntry = null;
      const findASI = (obj) => {
        if (asiEntry) return;
        if (typeof obj === 'string') {
          if (obj.includes('Ability Scores:')) asiEntry = obj;
          return;
        }
        if (Array.isArray(obj)) { obj.forEach(findASI); return; }
        if (typeof obj === 'object' && obj !== null) {
          if ((obj.name === 'Ability Scores' || obj.name === 'Ability Scores:') && (obj.entries || obj.entry)) {
            const content = obj.entries ? (Array.isArray(obj.entries) ? obj.entries.join(' ') : obj.entries) : obj.entry;
            asiEntry = "Ability Scores: " + content;
            return;
          }
          if (obj.items) findASI(obj.items);
          if (obj.entries) findASI(obj.entries);
        }
      };
      findASI(bgObj.entries);
      if (asiEntry) {
        let text = asiEntry.replace(/{@ability\s+([^}]+)}/gi, (match, content) => {
          const code = content.split('|')[0].trim().toLowerCase();
          const map = { str: 'Strength', dex: 'Dexterity', con: 'Constitution', int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma' };
          return map[code] || content;
        });
        found = allAbilities.filter(ab => new RegExp(`\\b${ab}\\b`, 'i').test(text));
      }
    }
    return found;
  }, [bgObj]);

  const fluff = useMemo(() => {
    if (!bgObj) return null;
    let match = data.backgroundFluff?.find(
        (f) => f.name === selected && f.source === bgObj.source,
      ) || data.backgroundFluff?.find((f) => f.name === selected);
    if (!match && bgObj.fluff) match = bgObj.fluff;
    return resolveFluffWithCopy(match, data.backgroundFluff || []);
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
                  padding: fluff?.entries ? "12px 16px" : 0,
                  background: fluff?.entries ? "rgba(212,165,116,0.1)" : "transparent",
                  border: fluff?.entries ? "1px solid var(--gold)" : "none",
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
                {fluff?.entries && (
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
                )}
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
                    ).map(capitalizeSkill)
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
                        if (v === true) return capitalizeSkill(k);
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
            {bgObj && (
              <div style={{ marginTop: 16, padding: "12px 16px", background: "rgba(255,255,255,0.5)", border: "1px solid var(--gold)", borderRadius: 4 }}>
                <strong style={{ display: "block", marginBottom: 8, color: "var(--red-dark)" }}>Background Ability Score Adjustment</strong>
                <p style={{ fontSize: "0.9rem", marginBottom: 12 }}>
                  {foundAbilities.length > 0 
                    ? <>Background options: <strong>{foundAbilities.join(", ")}</strong></>
                    : "Choose your ability score increases (if using 2024 rules)."
                  }
                </p>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ display: "block", fontWeight: "bold", marginBottom: 4, fontSize: "0.9rem" }}>Adjustment Method:</label>
                  <select
                    className="styled-select"
                    value={backgroundAsi.method}
                    onChange={(e) => setBackgroundAsi({ ...backgroundAsi, method: e.target.value })}
                  >
                    <option value="none">None (2014 Rules)</option>
                    <option value="flat">+1 to Three Scores</option>
                    <option value="split">+2 to One, +1 to Another</option>
                  </select>
                </div>
                {backgroundAsi.method === "flat" && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {[1, 2, 3].map((i) => (
                      <div key={i} style={{ flex: 1, minWidth: 120 }}>
                        <label style={{ fontSize: "0.85rem" }}>Score {i} (+1)</label>
                        <select
                          className="styled-select"
                          value={backgroundAsi[`s${i}`]}
                          onChange={(e) => setBackgroundAsi({ ...backgroundAsi, [`s${i}`]: e.target.value })}
                        >
                          <option value="" disabled>-- Select --</option>
                          {(foundAbilities.length > 0 ? foundAbilities : ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma']).map(ab => (
                            <option key={ab} value={ab} disabled={
                              [1, 2, 3].filter(n => n !== i).map(n => backgroundAsi[`s${n}`]).includes(ab)
                            }>{ab}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                )}
                {backgroundAsi.method === "split" && (
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <div style={{ flex: 1, minWidth: 120 }}>
                      <label style={{ fontSize: "0.85rem" }}>Score (+2)</label>
                      <select
                        className="styled-select"
                        value={backgroundAsi.p2}
                        onChange={(e) => setBackgroundAsi({ ...backgroundAsi, p2: e.target.value })}
                      >
                        <option value="" disabled>-- Select --</option>
                        {(foundAbilities.length > 0 ? foundAbilities : ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma']).map(ab => (
                          <option key={ab} value={ab} disabled={backgroundAsi.p1 === ab}>{ab}</option>
                        ))}
                      </select>
                    </div>
                    <div style={{ flex: 1, minWidth: 120 }}>
                      <label style={{ fontSize: "0.85rem" }}>Score (+1)</label>
                      <select
                        className="styled-select"
                        value={backgroundAsi.p1}
                        onChange={(e) => setBackgroundAsi({ ...backgroundAsi, p1: e.target.value })}
                      >
                        <option value="" disabled>-- Select --</option>
                        {(foundAbilities.length > 0 ? foundAbilities : ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma']).map(ab => (
                          <option key={ab} value={ab} disabled={backgroundAsi.p2 === ab}>{ab}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}
            {bgObj && bgObj.entries && (
              <FeatureChoices
                feature={{ entries: bgObj.entries, name: bgObj.name }}
                data={data}
                selectedOptions={selectedOptions}
                onToggleOption={onToggleOption}
                selectedSpells={selectedSpells}
                containerStyle={{
                  marginTop: 16,
                  paddingTop: 16,
                  borderTop: "1px dashed var(--gold)",
                }}
              />
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

  useEffect(() => {
    if (showDeityModal) {
      window.__modalCount = (window.__modalCount || 0) + 1;
      document.body.classList.add('modal-open');
      return () => {
        window.__modalCount = Math.max(0, (window.__modalCount || 0) - 1);
        if (window.__modalCount === 0) document.body.classList.remove('modal-open');
      };
    }
  }, [showDeityModal]);

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
                    color: "var(--ink)",
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
  selectedAsi,
  extraFeats,
  activeBgFeats,
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
  const [featClassChoices, setFeatClassChoices] = useState({});

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

  const maxLevel = useMemo(() => {
    if (!selectedClass) return 0;
    const fullCasters = ["Bard", "Cleric", "Druid", "Sorcerer", "Wizard"];
    if (fullCasters.includes(selectedClass))
      return Math.min(9, Math.ceil(selectedLevel / 2));
    if (selectedClass === "Warlock") {
      if (selectedLevel >= 17) return 9;
      if (selectedLevel >= 15) return 8;
      if (selectedLevel >= 13) return 7;
      if (selectedLevel >= 11) return 6;
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
      return (selectedLevel >= 2 || selectedClass === "Artificer") ? 1 : 0;
    }
    const thirdCasters = ["Fighter", "Rogue"];
    if (thirdCasters.includes(selectedClass)) {
      if (selectedLevel >= 19) return 4;
      if (selectedLevel >= 13) return 3;
      if (selectedLevel >= 7) return 2;
      if (selectedLevel >= 3) return 1;
      return 0;
    }
    return 0;
  }, [selectedClass, selectedLevel]);

  useEffect(() => {
    window.__modalCount = (window.__modalCount || 0) + 1;
    document.body.classList.add('modal-open');
    return () => {
      window.__modalCount = Math.max(0, (window.__modalCount || 0) - 1);
      if (window.__modalCount === 0) document.body.classList.remove('modal-open');
    };
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return classSpells.filter((s) => {
      if (s.level > maxLevel) return false;
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
  }, [classSpells, search, filters, maxLevel]);

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

  const featFeatures = useMemo(() => {
    const list = [];
    Object.values(selectedAsi || {}).forEach((choice) => {
      if (choice.type === "feat" && choice.featName) list.push(choice.featName);
    });
    (extraFeats || []).forEach((featName) => {
      if (featName) list.push(featName);
    });
    (activeBgFeats || []).forEach((featName) => {
      if (featName) list.push(featName);
    });
    return list;
  }, [selectedAsi, extraFeats, activeBgFeats]);

  const featSpellBlocks = useMemo(() => {
    const blocks = [];
    featFeatures.forEach((featName) => {
      const cands = data.feats?.filter((f) => f.name === featName) || [];
      const feat = resolveFeatureWithCopy(cands, [data.feats]);
      if (!feat || !feat.additionalSpells) return;

      const options = feat.additionalSpells.filter((e) => e.name).map((e) => e.name);
      let activeOption = featClassChoices[featName];
      if (!activeOption && options.length > 0) activeOption = options[0];

      const activeEntries = options.length > 0
        ? feat.additionalSpells.filter((e) => e.name === activeOption)
        : feat.additionalSpells;

      const groups = [];
      const extract = (obj) => {
        if (!obj) return;
        if (Array.isArray(obj)) {
          obj.forEach(extract);
        } else if (typeof obj === "object" && obj !== null) {
          if (obj.choose) {
            const filterStr = typeof obj.choose === "string" ? obj.choose : obj.choose.fromFilter;
            const countNum = obj.count || 1;
            if (filterStr) {
              let matches = data.spells.filter((s) => {
                const criteria = {};
                filterStr.split("|").forEach((p) => {
                  const [k, v] = p.split("=");
                  if (k && v) criteria[k.toLowerCase().trim()] = v.toLowerCase().trim();
                });
                if (criteria.level !== undefined) {
                  const levels = criteria.level.split(";").map((l) => parseInt(l));
                  if (!levels.includes(s.level)) return false;
                }
                if (criteria.class !== undefined) {
                  const targetClasses = criteria.class.split(";").map((c) => c.trim());
                  let hasClass = false;
                  if (s._normalizedClasses) {
                    if (targetClasses.some((tc) => s._normalizedClasses.has(tc))) hasClass = true;
                  } else if (s.classes) {
                    const check = (c) => targetClasses.some((tc) => (typeof c === "string" ? c : c.name).toLowerCase().includes(tc));
                    if (Array.isArray(s.classes)) {
                      if (s.classes.some(check)) hasClass = true;
                    } else {
                      if (s.classes.fromClassList && s.classes.fromClassList.some(check)) hasClass = true;
                      if (s.classes.fromClassListVariant && s.classes.fromClassListVariant.some(check)) hasClass = true;
                    }
                  }
                  if (!hasClass) return false;
                }
                if (criteria.school !== undefined) {
                  const targetSchools = criteria.school.split(";").map((sc) => sc.toLowerCase());
                  const sSchool = (s.school || "").toLowerCase();
                  if (!targetSchools.some((ts) => sSchool === ts || sSchool.includes(ts))) return false;
                }
                return true;
              });

              const unique = new Map();
              matches.forEach((s) => {
                if (!unique.has(s.name)) unique.set(s.name, s);
                else if (s.source === "XPHB") unique.set(s.name, s);
              });
              matches = Array.from(unique.values()).sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));

              if (matches.length > 0) {
                groups.push({
                  label: `Choose ${countNum} ${filterStr.includes("level=0") ? "Cantrip" : "Spell"}${countNum > 1 ? "s" : ""}`,
                  count: countNum,
                  matches,
                });
              }
            }
          } else {
            Object.entries(obj).forEach(([k, v]) => {
              if (k === "choose" || k === "ability" || k === "name") return;
              if (Array.isArray(v)) {
                const fixedSpells = [];
                v.forEach((item) => {
                  if (typeof item === "string") {
                    const cleanName = item.split("#")[0].split("|")[0].toLowerCase().trim();
                    let cands = data.spells.filter((x) => x.name.toLowerCase() === cleanName);
                    let s = cands.find((x) => x.source === "XPHB") || cands.find((x) => x.source === "PHB") || cands[0];
                    if (s) fixedSpells.push(s);
                  } else if (typeof item === "object") {
                    extract(item);
                  }
                });

                if (fixedSpells.length > 0) {
                  const unique = new Map();
                  fixedSpells.forEach((s) => {
                    if (!unique.has(s.name)) unique.set(s.name, s);
                    else if (s.source === "XPHB") unique.set(s.name, s);
                  });
                  const deduped = Array.from(unique.values()).sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));

                  groups.push({
                    label: `Granted Spells`,
                    count: deduped.length,
                    matches: deduped,
                  });
                }
              } else if (typeof v === "object" && v !== null) {
                extract(v);
              }
            });
          }
        }
      };

      activeEntries.forEach((e) => {
        if (e.known) extract(e.known);
        if (e.prepared) extract(e.prepared);
        if (e.innate) extract(e.innate);
      });

      if (groups.length > 0) {
        blocks.push({
          featName,
          options,
          activeOption,
          groups,
        });
      }
    });
    return blocks;
  }, [featFeatures, data.feats, featClassChoices, data.spells]);

  const selectedCounts = useMemo(() => {
    let cantrips = 0;
    let leveled = 0;

    const unconsumedSpells = new Set(selectedSpells);
    const classSpellNames = new Set(classSpells.map((s) => s.name));

    if (featSpellBlocks) {
      featSpellBlocks.forEach((block) => {
        block.groups.forEach((g) => {
          g.matches.forEach((m) => {
            unconsumedSpells.delete(m.name);
          });
        });
      });
    }

    unconsumedSpells.forEach((name) => {
      if (classSpellNames.has(name)) {
        const s = data.spells.find((x) => x.name === name);
        if (s) {
          if (s.level === 0) cantrips++;
          else leveled++;
        }
      }
    });
    return { cantrips, leveled };
  }, [selectedSpells, data.spells, featSpellBlocks, classSpells]);

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
            style={{ margin: 0, fontSize: "1.1em", color: "var(--ink)" }}
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
          {(!selectedClass) ? (
            <div style={{ padding: 10, textAlign: "center", fontStyle: "italic", color: "var(--ink-light)" }}>
              Select a class with spellcasting to see available spells.
            </div>
          ) : (
            <SpellTable
              spells={filtered}
              selectedSpells={selectedSpells}
              onToggleSpell={onToggleSpell}
              onSetDetail={setSelectedSpellDetail}
              showSource={true}
              appendBody={
                <>
                  {featSpellBlocks.length > 0 && (
                    <tbody>
                      <tr>
                        <td
                          colSpan={9}
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
                          Additional Spells from Feats
                        </td>
                      </tr>
                    </tbody>
                  )}
                  {featSpellBlocks.map((block) => (
                    <tbody key={block.featName}>
                      <tr style={{ borderBottom: "1px solid rgba(212,175,55,0.2)", background: "rgba(255,255,255,0.4)" }}>
                        <td colSpan="9" style={{ padding: "6px 8px" }}>
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <strong style={{ color: "var(--ink)", fontSize: "0.95rem" }}>{block.featName}</strong>
                            {block.options.length > 1 && (
                              <select
                                className="styled-select"
                                style={{ width: "200px" }}
                                value={block.activeOption || ""}
                                onChange={(e) => setFeatClassChoices((prev) => ({ ...prev, [block.featName]: e.target.value }))}
                              >
                                {block.options.map((o) => <option key={o} value={o}>{o}</option>)}
                              </select>
                            )}
                          </div>
                        </td>
                      </tr>
                      {block.groups.map((g, i) => {
                        const selectedInGroup = g.matches.filter(m => selectedSpells.has(m.name)).length;
                        const isOver = g.label !== "Granted Spells" && selectedInGroup > g.count;
                        return g.matches.length > 0 ? [
                          <tr key={`label-${i}`}>
                            <td colSpan="9" style={{ padding: "4px 8px", background: "rgba(0,0,0,0.03)", fontStyle: "italic", color: "var(--ink-light)" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span>{g.label}</span>
                                {g.label !== "Granted Spells" && (
                                  <span style={{ color: isOver ? "var(--red)" : "inherit", fontWeight: "bold", fontSize: "0.9rem" }}>
                                    {selectedInGroup} / {g.count}
                                  </span>
                                )}
                              </div>
                            </td>
                          </tr>,
                          ...g.matches.map((s, j) => {
                            const isSel = selectedSpells.has(s.name);
                            const isRitual = !!(s.meta && s.meta.ritual);
                            const isConc = !!(s.duration && s.duration.some((d) => d.concentration));
                            const hasMat = !!(s.components && (s.components.m || s.components.M));
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
                                    : j % 2 === 0
                                      ? "rgba(255,255,255,0.4)"
                                      : "transparent",
                                  color: isSel ? "white" : "var(--ink)",
                                }}
                              >
                                <td style={{ padding: "4px 8px", whiteSpace: "nowrap" }}>{s.level === 0 ? "C" : s.level}</td>
                                <td style={{ padding: "4px 8px", fontWeight: 600 }}>{s.name}</td>
                                <td style={{ padding: "4px 8px", whiteSpace: "nowrap" }}>{getTimeStr(s)}</td>
                                <td style={{ padding: "4px 8px", whiteSpace: "nowrap" }}>{schoolMap[s.school?.toLowerCase()] || s.school}</td>
                                <td style={{ padding: "4px 8px", textAlign: "center" }}>{isRitual ? "✦" : ""}</td>
                                <td style={{ padding: "4px 8px", textAlign: "center" }}>{isConc ? "●" : ""}</td>
                                <td style={{ padding: "4px 8px", textAlign: "center" }}>{hasMat ? "◆" : ""}</td>
                                <td style={{ padding: "4px 8px", whiteSpace: "nowrap" }}>{getRangeStr(s)}</td>
                                <td style={{ padding: "4px 8px", whiteSpace: "nowrap", fontSize: "0.75rem", opacity: 0.7 }}>{s.source || ""}</td>
                              </tr>
                            );
                          })
                        ] : null;
                      })}
                    </tbody>
                  ))}
                </>
              }
            />
          )}
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
  activeBgFeats,
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
      {activeBgFeats?.length > 0 && (
        <div style={{ marginBottom: 24 }}>
          <h3 style={{ margin: "0 0 12px", color: "var(--red-dark)", borderBottom: "1px solid var(--gold)", paddingBottom: 4 }}>
            Background Feat{activeBgFeats.length > 1 ? "s" : ""}
          </h3>
          {activeBgFeats.map(featName => {
            const feat = resolveFeatureWithCopy(
              data.feats?.filter((f) => f.name === featName) || [],
              [data.feats]
            );
            return (
              <div key={featName} style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--gold)", borderRadius: 6, padding: 16, marginBottom: 12 }}>
                <strong style={{ fontSize: "1.05rem", color: "var(--red-dark)", display: "block", marginBottom: 6 }}>{featName}</strong>
                {feat && (feat.entries || feat.entry) && (
                  <div style={{ fontSize: "0.9rem", color: "var(--ink)", lineHeight: 1.5 }}>
                    <EntryHTML html={processEntries(feat.entries || feat.entry)} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

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
  activeBgFeats,
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
  activeBgFeats?.forEach((featName) => {
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

      {featFeatures.length > 0 && (
        <div>
          <h3>Selected Feats ({featFeatures.length})</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {featFeatures.map((f, idx) => (
              <span
                key={`${f}-${idx}`}
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
  const [showRandomModal, setShowRandomModal] = useState(false);
  const [randSettings, setRandSettings] = useState({ minLvl: 1, maxLvl: 20, type: 'any' });
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

    if (selectedClass && !isRandomizingRef.current) {
      const classStatPriorities = {
        Barbarian: ["str", "con", "dex", "wis", "cha", "int"],
        Bard: ["cha", "dex", "con", "wis", "int", "str"],
        Cleric: ["wis", "con", "str", "dex", "int", "cha"],
        Druid: ["wis", "con", "dex", "int", "cha", "str"],
        Fighter: ["str", "con", "dex", "wis", "int", "cha"],
        Monk: ["dex", "wis", "con", "str", "int", "cha"],
        Paladin: ["str", "cha", "con", "wis", "dex", "int"],
        Ranger: ["dex", "wis", "con", "str", "int", "cha"],
        Rogue: ["dex", "con", "int", "wis", "cha", "str"],
        Sorcerer: ["cha", "con", "dex", "wis", "int", "str"],
        Warlock: ["cha", "con", "dex", "wis", "int", "str"],
        Wizard: ["int", "con", "dex", "wis", "cha", "str"],
        Artificer: ["int", "con", "dex", "wis", "cha", "str"],
      };
      const priority = classStatPriorities[selectedClass] || ["str", "dex", "con", "int", "wis", "cha"];
      const newAssign = {};
      const sortedArray = [15, 14, 13, 12, 10, 8];
      priority.forEach((ab, idx) => {
        newAssign[ab] = sortedArray[idx];
      });
      setStandardAssign(newAssign);
      setAbilityMethod("standard");
    }
  }, [selectedClass]);

  // Ability scores
  const [abilityMethod, setAbilityMethod] = useState("standard");
  const [manualScores, setManualScores] = useState({ str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 });
  const [standardAssign, setStandardAssign] = useState({});
  const [pbValues, setPbValues] = useState({ str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 });
  const [backgroundAsi, setBackgroundAsi] = useState({ method: 'none', s1: '', s2: '', s3: '', p2: '', p1: '' });
  const [speciesAsi, setSpeciesAsi] = useState({ method: 'none', s1: '', s2: '', s3: '', p2: '', p1: '' });
  const [previewSpell, setPreviewSpell] = useState(null);
  const [previewFeat, setPreviewFeat] = useState(null);
  const isRandomizingRef = useRef(false);

  useEffect(() => {
    if (previewSpell || previewFeat) {
      window.__modalCount = (window.__modalCount || 0) + 1;
      document.body.classList.add('modal-open');
      return () => {
        window.__modalCount = Math.max(0, (window.__modalCount || 0) - 1);
        if (window.__modalCount === 0) document.body.classList.remove('modal-open');
      };
    }
  }, [previewSpell, previewFeat]);

  // Setup event listener to catch any clicked spell inside an EntryHTML block
  useEffect(() => {
    const handlePreviewSpell = (e) => {
      const spellName = e.detail;
      if (!data?.spells) return;
      const candidates = data.spells.filter(s => s.name.toLowerCase() === spellName.toLowerCase());
      const spell = candidates.sort((a, b) => getGlobalSourcePriority(b.source) - getGlobalSourcePriority(a.source))[0];
      if (spell) setPreviewSpell(spell);
    };
    const handlePreviewFeat = (e) => {
      const featName = e.detail;
      if (!data?.feats) return;
      const candidates = data.feats.filter(f => f.name.toLowerCase() === featName.toLowerCase());
      const feat = candidates.sort((a, b) => getGlobalSourcePriority(b.source) - getGlobalSourcePriority(a.source))[0];
      if (feat) setPreviewFeat(feat);
    };
    document.addEventListener('preview-spell', handlePreviewSpell);
    document.addEventListener('preview-feat', handlePreviewFeat);
    return () => {
      document.removeEventListener('preview-spell', handlePreviewSpell);
      document.removeEventListener('preview-feat', handlePreviewFeat);
    };
  }, [data.spells, data.feats]);

  // Species ability bonus
  const speciesBonus = useMemo(() => {
    const bonus = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
    if (!selectedSpecies || speciesAsi.method === 'none') return bonus;
    
    if (speciesAsi.method === 'default') {
      const speciesObj = resolveRaceWithCopy(getBestMatch(data.species, selectedSpecies), data.species);
      if (speciesObj?.ability) {
        speciesObj.ability.forEach((a) => {
          Object.entries(a).forEach(([k, v]) => {
            if (k !== "choose" && ABILITY_KEYS.includes(k))
              bonus[k] = (bonus[k] || 0) + v;
          });
        });
      }
    } else {
      const map = { 'Strength': 'str', 'Dexterity': 'dex', 'Constitution': 'con', 'Intelligence': 'int', 'Wisdom': 'wis', 'Charisma': 'cha' };
      if (speciesAsi.method === 'flat') {
        if (speciesAsi.s1 && map[speciesAsi.s1]) bonus[map[speciesAsi.s1]] += 1;
        if (speciesAsi.s2 && map[speciesAsi.s2]) bonus[map[speciesAsi.s2]] += 1;
        if (speciesAsi.s3 && map[speciesAsi.s3]) bonus[map[speciesAsi.s3]] += 1;
      } else if (speciesAsi.method === 'split') {
        if (speciesAsi.p2 && map[speciesAsi.p2]) bonus[map[speciesAsi.p2]] += 2;
        if (speciesAsi.p1 && map[speciesAsi.p1]) bonus[map[speciesAsi.p1]] += 1;
      }
    }
    return bonus;
  }, [selectedSpecies, data.species, speciesAsi]);

  const backgroundBonus = useMemo(() => {
    const bonus = { str: 0, dex: 0, con: 0, int: 0, wis: 0, cha: 0 };
    if (!selectedBackground || backgroundAsi.method === 'none') return bonus;
    const map = { 'Strength': 'str', 'Dexterity': 'dex', 'Constitution': 'con', 'Intelligence': 'int', 'Wisdom': 'wis', 'Charisma': 'cha' };
    if (backgroundAsi.method === 'flat') {
      if (backgroundAsi.s1 && map[backgroundAsi.s1]) bonus[map[backgroundAsi.s1]] += 1;
      if (backgroundAsi.s2 && map[backgroundAsi.s2]) bonus[map[backgroundAsi.s2]] += 1;
      if (backgroundAsi.s3 && map[backgroundAsi.s3]) bonus[map[backgroundAsi.s3]] += 1;
    } else if (backgroundAsi.method === 'split') {
      if (backgroundAsi.p2 && map[backgroundAsi.p2]) bonus[map[backgroundAsi.p2]] += 2;
      if (backgroundAsi.p1 && map[backgroundAsi.p1]) bonus[map[backgroundAsi.p1]] += 1;
    }
    return bonus;
  }, [selectedBackground, backgroundAsi]);

  const scores = useMemo(() => {
    const final = {};
    ABILITY_KEYS.forEach((k) => {
      let base = 10;
      if (abilityMethod === "pointbuy") base = pbValues[k];
      else if (abilityMethod === "standard") base = standardAssign[k] || 8;
      else if (abilityMethod === "manual") base = manualScores[k];
      
      final[k] = abilityMethod === "manual" ? base : (parseInt(base) || 0) + (speciesBonus?.[k] || 0) + (backgroundBonus?.[k] || 0);
    });
    return final;
  }, [abilityMethod, pbValues, standardAssign, manualScores, speciesBonus, backgroundBonus]);

  const toggleSpell = useCallback((name) => {
    setSelectedSpells((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const bgObj = useMemo(() => {
    if (!selectedBackground) return null;
    return resolveBackgroundWithCopy(getBestMatch(data.backgrounds, selectedBackground), data.backgrounds);
  }, [selectedBackground, data.backgrounds]);

  const activeBgFeats = useMemo(() => {
    if (!bgObj || !bgObj.entries) return [];
    const feats = [];
    const walk = (obj) => {
      if (!obj) return;
      if (typeof obj === "string") {
        const matches = [...obj.matchAll(/\{@feat\s+([^|}]+)[^}]*\}/gi)];
        matches.forEach((m) => feats.push(m[1].trim()));
      } else if (Array.isArray(obj)) {
        obj.forEach(walk);
      } else if (typeof obj === "object") {
        if (obj.entries) walk(obj.entries);
        if (obj.entry) walk(obj.entry);
        if (obj.items) walk(obj.items);
      }
    };
    walk(bgObj.entries);
    const uniqueFeats = [...new Set(feats)];
    if (uniqueFeats.length === 0) return [];
    
    const optionSets = extractOptionSets(bgObj.entries);
    const choiceLists = extractChoiceLists(bgObj.entries);
    
    const choiceFeats = new Set();
    optionSets.forEach(os => {
      os.choices.forEach(c => {
        if (c.type === "optionalfeature" || c.type === "entries" || c.name) {
          const name = c.name || (c.uid ? c.uid.split("|")[0] : "");
          if (name) choiceFeats.add(name);
        }
      });
    });
    choiceLists.forEach(cl => {
      cl.items.forEach(i => {
        const name = typeof i === "string" ? i : (i.name || "");
        if (name) choiceFeats.add(name);
      });
    });
    
    const result = [];
    uniqueFeats.forEach(feat => {
      if (choiceFeats.has(feat)) {
        let isSelected = false;
        selectedOptions.forEach(optKey => {
          if (optKey.endsWith(`|||${feat}`)) isSelected = true;
        });
        if (isSelected) result.push(feat);
      } else {
        result.push(feat);
      }
    });
    return result;
  }, [bgObj, selectedOptions]);

  const handleRandomize = (settings) => {
    if (loading || noData || !data) return;

    isRandomizingRef.current = true;

    // Calculate random level within range
    const min = Math.max(1, Math.min(20, settings.minLvl));
    const max = Math.max(1, Math.min(20, settings.maxLvl));
    const actualMin = Math.min(min, max);
    const actualMax = Math.max(min, max);
    const lvl = Math.floor(Math.random() * (actualMax - actualMin + 1)) + actualMin;

    // Random Name
    const firstNames = ["Aelar", "Brog", "Caeldrim", "Dorn", "Elara", "Fargrim", "Ghesh", "Halia", "Igan", "Jheri", "Kithri", "Lia", "Morgran", "Naivara", "Orsik", "Peren", "Quinn", "Rurik", "Seraphina", "Traubon", "Uthal", "Varis", "Westra", "Xander", "Yrsa", "Zook"];
    const lastNames = ["Amakiir", "Battlehammer", "Cherrycheeks", "Dankil", "Erenaeth", "Frostbeard", "Galanodel", "High-hill", "Ilphelkiir", "Jast", "Kerrhylon", "Leagallow", "Murnig", "Naïlo", "Ousstyl", "Puck", "Qireht", "Raethran", "Siannodel", "Torunn", "Ungart", "Vander", "Wildwander", "Xiloscient", "Yaeldrin", "Zylkriss"];
    setCharName(`${firstNames[Math.floor(Math.random() * firstNames.length)]} ${lastNames[Math.floor(Math.random() * lastNames.length)]}`);

    // Random Class
    let validClasses = data.classes?.filter((c) => !c.isSidekick) || [];
    if (settings.type === 'caster') {
      const CASTER_CLASSES = ["Bard", "Cleric", "Druid", "Sorcerer", "Warlock", "Wizard", "Artificer"];
      validClasses = validClasses.filter(c => CASTER_CLASSES.includes(c.name));
    } else if (settings.type === 'martial') {
      const MARTIAL_CLASSES = ["Barbarian", "Fighter", "Monk", "Paladin", "Ranger", "Rogue", "Blood Hunter"];
      validClasses = validClasses.filter(c => MARTIAL_CLASSES.includes(c.name));
    }

    let chosenClassName = null;
    if (validClasses.length > 0) {
      chosenClassName = validClasses[Math.floor(Math.random() * validClasses.length)].name;
      setSelectedClass(chosenClassName);
    } else {
      const allValid = data.classes?.filter((c) => !c.isSidekick) || [];
      if (allValid.length > 0) {
        chosenClassName = allValid[Math.floor(Math.random() * allValid.length)].name;
        setSelectedClass(chosenClassName);
      }
    }
    setSelectedLevel(lvl);

    // Random Subclass (if level >= 3 and a class was chosen)
    if (lvl >= 3 && chosenClassName) {
      const targetCls = chosenClassName.trim().toLowerCase();
      const availableSubs = data.subclasses?.filter((s) => {
        const cName = s.className || s.class;
        return cName?.trim().toLowerCase() === targetCls;
      }) || [];
      if (availableSubs.length > 0) {
        const sub = availableSubs[Math.floor(Math.random() * availableSubs.length)];
        setSelectedSubclass(sub.shortName || sub.name);
      } else {
        setSelectedSubclass(null);
      }
    } else {
      setSelectedSubclass(null);
    }

    // Random Species
    const validSpecies = data.species?.filter((r) => !r.isSidekick && r.name) || [];
    let chosenSpecies = null;
    if (validSpecies.length > 0) {
      chosenSpecies = validSpecies[Math.floor(Math.random() * validSpecies.length)];
      setSelectedSpecies(chosenSpecies.name);
    }
    
    // Random Subrace
    if (chosenSpecies && data.subraces) {
      const validSubraces = data.subraces.filter((s) => s.raceName === chosenSpecies.name || s.race?.name === chosenSpecies.name);
      if (validSubraces.length > 0) {
        setSelectedSubrace(validSubraces[Math.floor(Math.random() * validSubraces.length)]);
      } else {
        setSelectedSubrace(null);
      }
    } else {
      setSelectedSubrace(null);
    }

    // Random Background
    const validBgs = data.backgrounds?.filter(b => b.name) || [];
    if (validBgs.length > 0) {
      setSelectedBackground(validBgs[Math.floor(Math.random() * validBgs.length)].name);
    }

    // Random Ability Scores
    setAbilityMethod("standard");
    const shuffled = [...STANDARD_ARRAY].sort(() => Math.random() - 0.5);
    setStandardAssign({
      str: shuffled[0], dex: shuffled[1], con: shuffled[2],
      int: shuffled[3], wis: shuffled[4], cha: shuffled[5]
    });

    // Reset extras
    setSelectedDeity(null);
    setSelectedAsi({});
    setExtraFeats([]);

    // Randomize spells if class is a spellcaster
    (() => {
      if (!chosenClassName || !data?.spells) { setSelectedSpells(new Set()); return; }

      // Compute max spell level for this class at randomizeLevel
      const FULL   = ["Bard","Cleric","Druid","Sorcerer","Wizard"];
      const HALF   = ["Paladin","Ranger","Artificer"];
      const THIRD  = ["Fighter","Rogue"];
      let maxSL = 0;
      if (FULL.includes(chosenClassName))        maxSL = Math.min(9, Math.ceil(lvl / 2));
      else if (chosenClassName === "Warlock")    maxSL = [1,1,2,2,3,3,4,4,5,5,5,5,5,5,5,5,5,5,5,5][lvl - 1];
      else if (HALF.includes(chosenClassName))   maxSL = lvl >= 17 ? 5 : lvl >= 13 ? 4 : lvl >= 9 ? 3 : lvl >= 5 ? 2 : (lvl >= 2 || chosenClassName === "Artificer") ? 1 : 0;
      else if (THIRD.includes(chosenClassName))  maxSL = lvl >= 19 ? 4 : lvl >= 13 ? 3 : lvl >= 7 ? 2 : lvl >= 3 ? 1 : 0;

      if (maxSL === 0) { setSelectedSpells(new Set()); return; }

      const cls = chosenClassName.toLowerCase();
      const pool = data.spells.filter(s => {
        if (s._normalizedClasses) return s._normalizedClasses.has(cls);
        if (!s.classes) return false;
        const match = c => (typeof c === 'string' ? c : c.name).toLowerCase() === cls;
        if (Array.isArray(s.classes)) return s.classes.some(match);
        if (s.classes.fromClassList) return s.classes.fromClassList.some(match);
        return false;
      });

      const clsObj = data.classes?.find(c => c.name === chosenClassName);
      let cantripCount = clsObj?.cantripProgression?.[lvl - 1] || 0;
      let leveledCount = 0;
      if (clsObj?.preparedSpellsProgression)     leveledCount = Math.min(clsObj.preparedSpellsProgression[lvl - 1] || 0, 10);
      else if (clsObj?.spellsKnownProgression)   leveledCount = clsObj.spellsKnownProgression[lvl - 1] || 0;
      else {
        const TABLE = { Bard:[4,5,6,7,8,9,10,11,12,14,15,15,16,18,19,19,20,22,22,22], Warlock:[2,3,4,5,6,7,8,9,10,10,11,11,12,12,13,13,14,14,15,15], Sorcerer:[2,3,4,5,6,7,8,9,10,11,12,12,13,13,14,14,15,15,15,15] };
        leveledCount = TABLE[chosenClassName]?.[lvl - 1] ?? Math.min(lvl + 2, 8);
      }

      const pick = (arr, n) => [...arr].sort(() => Math.random() - 0.5).slice(0, n);
      const cantrips = pick(pool.filter(s => s.level === 0), cantripCount);
      const leveled  = pick(pool.filter(s => s.level > 0 && s.level <= maxSL), leveledCount);
      setSelectedSpells(new Set([...cantrips.map(s => s.name), ...leveled.map(s => s.name)]));
    })();
    setSelectedClassSkills([]);
    setSelectedOptions(new Set());
    setSpeciesAsi({ method: 'none', s1: '', s2: '', s3: '', p2: '', p1: '' });
    setBackgroundAsi({ method: 'none', s1: '', s2: '', s3: '', p2: '', p1: '' });

    // Jump to review
    setTabIndex(TABS.indexOf("review"));

    setTimeout(() => {
      isRandomizingRef.current = false;
    }, 50);
  };

  function switchTab(idx) {
    if (idx < 0 || idx >= TABS.length) return;
    if (tabIndex === 0 && idx > 0 && !selectedClass) {
      alert("Please select a class first.");
      return;
    }
    setTabIndex(idx);
  }

  function buildCharacterObject() {

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

    activeBgFeats.forEach((featName) => {
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
      const speciesObj = resolveRaceWithCopy(getBestMatch(data.species, selectedSpecies), data.species);
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

    // Species ASI Custom Feature Output
    if (speciesAsi.method !== 'default' && speciesAsi.method !== 'none') {
      let desc = '';
      if (speciesAsi.method === 'flat') {
        const parts = [speciesAsi.s1 && `+1 ${speciesAsi.s1}`, speciesAsi.s2 && `+1 ${speciesAsi.s2}`, speciesAsi.s3 && `+1 ${speciesAsi.s3}`].filter(Boolean);
        desc = parts.join(', ');
      } else if (speciesAsi.method === 'split') {
        const parts = [speciesAsi.p2 && `+2 ${speciesAsi.p2}`, speciesAsi.p1 && `+1 ${speciesAsi.p1}`].filter(Boolean);
        desc = parts.join(', ');
      }
      if (desc) raceFeatures.push({ title: "Custom Species Ability Score Adjustment", desc, source: 'race' });
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

    // Background ASI
    if (backgroundAsi.method !== 'none') {
      let desc = '';
      if (backgroundAsi.method === 'flat') {
        const parts = [backgroundAsi.s1 && `+1 ${backgroundAsi.s1}`, backgroundAsi.s2 && `+1 ${backgroundAsi.s2}`, backgroundAsi.s3 && `+1 ${backgroundAsi.s3}`].filter(Boolean);
        desc = parts.join(', ');
      } else if (backgroundAsi.method === 'split') {
        const parts = [backgroundAsi.p2 && `+2 ${backgroundAsi.p2}`, backgroundAsi.p1 && `+1 ${backgroundAsi.p1}`].filter(Boolean);
        desc = parts.join(', ');
      }
      if (desc) bgFeatures.push({ title: "Background Ability Score Adjustment", desc, source: 'background' });
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
      if (activeBgFeats.includes(name)) return;
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

    const cantripsList = [];
    const preparedSpellsList = [];
    const spellsList = [];

    const preparedClasses = ["Cleric", "Druid", "Paladin", "Wizard", "Artificer"];
    const isPreparedClass = preparedClasses.includes(selectedClass);

    Array.from(selectedSpells).forEach((name) => {
      const s = data.spells.find((sp) => sp.name === name);
      const lvl = s?.level || 0;
      const spellObj = {
        name,
        level: lvl,
        time: s?.time ? `${s.time[0]?.number || ''} ${s.time[0]?.unit || ''}`.trim() : "",
        range: s?.range ? (s.range.distance ? `${s.range.distance.amount || ""} ${s.range.distance.type}`.trim() : s.range.type) : "",
        ritual: s?.meta?.ritual || false,
        concentration: s?.duration?.[0]?.concentration || false,
        material: !!s?.components?.m || !!s?.components?.M,
        description: s ? cleanText(processEntries(s.entries || [])) : "",
        attackType: s?.spellAttack?.[0]?.toUpperCase() || "",
        saveAbility: s?.savingThrow?.[0]?.toLowerCase() || "",
        prepared: lvl > 0 ? isPreparedClass : false
      };

      if (lvl === 0) {
        cantripsList.push(spellObj);
      } else if (isPreparedClass) {
        preparedSpellsList.push(spellObj);
      } else {
        spellsList.push(spellObj);
      }
    });

    const character = {
      charName: charName.trim(),
      charClass: selectedClass || "",
      charSubclass: selectedSubclass || "",
      level: selectedLevel,
      race: selectedSpecies || "",
      profBonus: pb,
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
      cantripsList,
      preparedSpellsList,
      spellsList,
      inventory: [],
      spellAbility: getSpellAbility(selectedClass),
      activeTab: "features",
    };

    return character;
  }

  function createCharacter() {
    if (!charName.trim()) { alert("Please enter a character name."); return; }
    const character = buildCharacterObject();
    localStorage.setItem("dndCharacter", JSON.stringify(character));
    navigate("/");
  }

  function createNpc() {
    if (!charName.trim()) { alert("Please enter a name for the NPC."); return; }
    const character = buildCharacterObject();
    const npc = { ...character, id: Date.now().toString(), isNpc: true };
    try {
      const existing = JSON.parse(localStorage.getItem("dnd_npcs_global") || "[]");
      existing.unshift(npc);
      localStorage.setItem("dnd_npcs_global", JSON.stringify(existing));
    } catch { localStorage.setItem("dnd_npcs_global", JSON.stringify([npc])); }
    navigate("/npcs");
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
              selectedSpells={selectedSpells}
            />
          )}
          {currentTab === "race" && (
            <SpeciesTab
              data={data}
              selected={selectedSpecies}
              onSelect={setSelectedSpecies}
              selectedSubrace={selectedSubrace}
              onSelectSubrace={setSelectedSubrace}
              speciesAsi={speciesAsi}
              setSpeciesAsi={setSpeciesAsi}
            />
          )}
          {currentTab === "background" && (
            <BackgroundTab
              data={data}
              selected={selectedBackground}
              onSelect={setSelectedBackground}
              selectedOptions={selectedOptions}
              onToggleOption={toggleOption}
              backgroundAsi={backgroundAsi}
              setBackgroundAsi={setBackgroundAsi}
              selectedSpells={selectedSpells}
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
              selectedAsi={selectedAsi}
              extraFeats={extraFeats}
              activeBgFeats={activeBgFeats}
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
              activeBgFeats={activeBgFeats}
            />
          )}
        {currentTab === "abilities" && (
          <AbilitiesTab
            scores={scores}
            manualScores={manualScores}
            setManualScores={setManualScores}
            method={abilityMethod}
            setMethod={setAbilityMethod}
            speciesBonus={speciesBonus}
            backgroundBonus={backgroundBonus}
            standardAssign={standardAssign}
            setStandardAssign={setStandardAssign}
            pbValues={pbValues}
            setPbValues={setPbValues}
            selectedClass={selectedClass}
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
              activeBgFeats={activeBgFeats}
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <button className="btn btn-secondary" onClick={() => setShowRandomModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold' }}>
              <span style={{ fontSize: '1.2rem' }}>🎲</span> Randomize
            </button>
          </div>
          {tabIndex < TABS.length - 1 ? (
            <button
              className="btn btn-primary"
              onClick={() => switchTab(tabIndex + 1)}
            >
              Next
            </button>
          ) : (
            <>
              <button className="btn btn-secondary" onClick={createNpc}>
                Create NPC
              </button>
              <button className="btn btn-primary" onClick={createCharacter}>
                Create Character
              </button>
            </>
          )}
        </footer>
      </div>

      {previewSpell && (
        <ModalOverlay onClick={() => setPreviewSpell(null)} $zIndex={2000}>
          <ModalBox $maxWidth="500px" onClick={(e) => e.stopPropagation()}>
            <CloseBtn onClick={() => setPreviewSpell(null)}>&times;</CloseBtn>
            <ModalTitle>{previewSpell.name}</ModalTitle>
            <div style={{ color: "var(--ink-light)", fontSize: "0.85rem", marginBottom: 12 }}>
              {previewSpell.level === 0
                ? "Cantrip"
                : `${previewSpell.level}${["st", "nd", "rd"][previewSpell.level - 1] || "th"}-level`}
              {previewSpell.school &&
                ` · ${schoolMap[previewSpell.school.toLowerCase()] || previewSpell.school}`}
              {previewSpell.meta?.ritual && " (Ritual)"}
              {previewSpell.meta?.concentration && " (Concentration)"}
            {previewSpell.source && ` · ${previewSpell.source}`}
            </div>
            {previewSpell.time && (
              <div style={{ margin: "4px 0", fontSize: "0.85rem" }}>
                <strong>Casting Time:</strong>{" "}
                {Array.isArray(previewSpell.time)
                  ? previewSpell.time.map((t) => `${t.number} ${t.unit}`).join(", ")
                  : previewSpell.time}
              </div>
            )}
            {previewSpell.range && (
              <div style={{ margin: "4px 0", fontSize: "0.85rem" }}>
                <strong>Range:</strong>{" "}
                {typeof previewSpell.range === "object"
                  ? `${previewSpell.range.distance?.amount || ""} ${previewSpell.range.distance?.type || ""}`.trim()
                  : previewSpell.range}
              </div>
            )}
            {previewSpell.duration && (
              <div style={{ margin: "4px 0", fontSize: "0.85rem" }}>
                <strong>Duration:</strong>{" "}
                {Array.isArray(previewSpell.duration)
                  ? previewSpell.duration.map((d) =>
                      d.type === "permanent" ? "Until dispelled" : d.type === "timed" ? `${d.concentration ? "Concentration, " : ""}${d.duration?.amount || ""} ${d.duration?.type || ""}`.trim() : d.type,
                    ).join(", ")
                  : previewSpell.duration}
              </div>
            )}
            <div style={{ marginTop: 10, fontSize: "0.9rem", lineHeight: 1.6 }}>
              <EntryHTML html={processEntries(previewSpell.entries)} />
            </div>
            {previewSpell.entriesHigherLevel && (
              <div style={{ marginTop: 10, borderTop: "1px dashed var(--gold)", paddingTop: 8, fontSize: "0.9rem" }}>
                <EntryHTML html={processEntries(previewSpell.entriesHigherLevel)} />
              </div>
            )}
          </ModalBox>
        </ModalOverlay>
      )}

      {previewFeat && (
        <ModalOverlay onClick={() => setPreviewFeat(null)} $zIndex={2000}>
          <ModalBox $maxWidth="500px" onClick={(e) => e.stopPropagation()}>
            <CloseBtn onClick={() => setPreviewFeat(null)}>&times;</CloseBtn>
            <ModalTitle>{previewFeat.name}</ModalTitle>
            <div style={{ color: "var(--ink-light)", fontSize: "0.85rem", marginBottom: 12 }}>
              {previewFeat.category === 'O' || previewFeat.category === 'Origin' ? 'Origin Feat' : previewFeat.category === 'G' ? 'General Feat' : previewFeat.category === 'EB' ? 'Epic Boon' : 'Feat'}
              {previewFeat.source && ` · ${previewFeat.source}`}
            </div>
            {previewFeat.prerequisite && (
              <div style={{ fontSize: "0.85rem", color: "var(--red)", fontStyle: "italic", marginBottom: 8 }}>
                Requires: {formatPrerequisites(previewFeat)}
              </div>
            )}
            {previewFeat.ability && (
              <div style={{ fontSize: "0.9rem", color: "var(--ink)", marginBottom: 12, background: "rgba(255,255,255,0.5)", padding: 8, borderRadius: 4, border: "1px solid var(--gold-light)" }}>
                <strong>Ability Score Increase:</strong>{" "}
                {previewFeat.ability.map(a => {
                    if (a.choose && a.choose.from) return `Choose ${a.choose.count || a.choose.amount || 1} from ${a.choose.from.join(', ').toUpperCase()}`;
                    return Object.entries(a).filter(([k]) => k !== 'choose').map(([k, v]) => `${k.toUpperCase()} +${v}`).join(', ');
                }).join('; ')}
              </div>
            )}
            <div style={{ marginTop: 10, fontSize: "0.9rem", lineHeight: 1.6 }}>
              <EntryHTML html={processEntries(previewFeat.entries || previewFeat.entry)} />
            </div>
          </ModalBox>
        </ModalOverlay>
      )}

    {showRandomModal && (
      <ModalOverlay onClick={() => setShowRandomModal(false)} $zIndex={2000}>
        <ModalBox $maxWidth="350px" onClick={(e) => e.stopPropagation()}>
          <CloseBtn onClick={() => setShowRandomModal(false)}>&times;</CloseBtn>
          <ModalTitle>Randomize Character</ModalTitle>
          
          <div className="field" style={{ marginBottom: 12 }}>
             <span className="field-label" style={{ display: "block", marginBottom: 4 }}>Level Range</span>
             <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
               <input type="number" min={1} max={20} value={randSettings.minLvl} onChange={(e) => setRandSettings(s => ({...s, minLvl: parseInt(e.target.value) || 1}))} style={{ width: "100%", padding: "8px", borderRadius: 4, border: "1px solid var(--gold)", background: "white", fontSize: "1rem" }} />
               <span style={{ color: "var(--ink-light)" }}>to</span>
               <input type="number" min={1} max={20} value={randSettings.maxLvl} onChange={(e) => setRandSettings(s => ({...s, maxLvl: parseInt(e.target.value) || 1}))} style={{ width: "100%", padding: "8px", borderRadius: 4, border: "1px solid var(--gold)", background: "white", fontSize: "1rem" }} />
             </div>
          </div>
          
          <div className="field" style={{ marginBottom: 20 }}>
             <span className="field-label" style={{ display: "block", marginBottom: 4 }}>Class Type</span>
             <select value={randSettings.type} onChange={(e) => setRandSettings(s => ({...s, type: e.target.value}))} style={{ width: "100%", padding: "8px", borderRadius: 4, border: "1px solid var(--gold)", background: "white", fontSize: "1rem" }} className="styled-select">
               <option value="any">Any Class</option>
               <option value="caster">Spellcasters Only</option>
               <option value="martial">Martials Only</option>
             </select>
          </div>
          
          <button className="btn btn-primary" style={{ width: "100%", padding: "10px", fontSize: "1rem" }} onClick={() => { setShowRandomModal(false); handleRandomize(randSettings); }}>
            Generate Character
          </button>
        </ModalBox>
      </ModalOverlay>
    )}
    </>
  );
}
