import { useState, useMemo, useEffect } from "react";
import { useCharacter } from "src/context/CharacterContext";
import { openDB, STORE_NAME } from "src/utils/db";
import { processEntries, cleanText } from "src/utils/dndEntries";
import { ModalOverlay, ModalBox, ModalTitle, CloseBtn } from "src/styles/shared";
import RichTextModal from "src/components/RichTextModal";
import { formatPrerequisites } from "src/utils/creatorLogic";
import { schoolMap } from "src/components/SpellTable";
import { TokenImage } from "src/components/FluffImage";
import { getGlobalSourcePriority, replaceAtkTags } from "src/utils/formatHelpers";

function CreatureDetails({ creature }) {
  const [previewSpell, setPreviewSpell] = useState(null);
  const [previewFeat, setPreviewFeat] = useState(null);

  const formatLinks = (rawHtml) => {
    let processed = rawHtml || "";
    const spellMapList = [];
    const featMapList = [];
    if (typeof processed === 'string') {
      processed = processed.replace(/\{@spell ([^|}]+)(?:\|[^}]*)?\}/gi, (match, spellName) => {
          spellMapList.push(spellName);
          return `__SPELL_LINK_${spellMapList.length - 1}__`;
      });
      processed = processed.replace(/\{@feat ([^|}]+)(?:\|[^}]*)?\}/gi, (match, featName) => {
          featMapList.push(featName);
          return `__FEAT_LINK_${featMapList.length - 1}__`;
      });
      processed = cleanText ? cleanText(processed) : processed;
      spellMapList.forEach((spellName, i) => {
          processed = processed.replace(`__SPELL_LINK_${i}__`, `<span class="spell-link" style="color: var(--red-dark); font-weight: bold; cursor: pointer; border-bottom: 1px dashed var(--red-dark);" data-spell="${spellName.replace(/"/g, '&quot;')}">${spellName}</span>`);
      });
      featMapList.forEach((featName, i) => {
          processed = processed.replace(`__FEAT_LINK_${i}__`, `<span class="feat-link" style="color: var(--red-dark); font-weight: bold; cursor: pointer; border-bottom: 1px dashed var(--red-dark);" data-feat="${featName.replace(/"/g, '&quot;')}">${featName}</span>`);
      });
    } else {
      processed = cleanText ? cleanText(processed) : processed;
    }
    return processed;
  };

  const handlePreviewClick = async (e) => {
    if (e.target.classList.contains('spell-link') || e.target.classList.contains('feat-link')) {
      const isSpell = e.target.classList.contains('spell-link');
      const name = isSpell ? e.target.getAttribute('data-spell') : e.target.getAttribute('data-feat');
      
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const data = await new Promise((resolve) => {
        const req = store.get("currentData");
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      });

      if (data) {
         let match = null;
         data.forEach(file => {
           if (!file.name.toLowerCase().endsWith(".json")) return;
           try {
             const json = JSON.parse(file.content);
             const arr = isSpell ? (json.spell || json.spells || json.data) : json.feat;
             if (Array.isArray(arr)) {
               const found = arr.filter(x => x.name && x.name.toLowerCase() === name.toLowerCase());
               found.forEach(f => {
                 if (!match) {
                   match = f;
                 } else {
                   const fPrio = getGlobalSourcePriority(f.source);
                   const mPrio = getGlobalSourcePriority(match.source);
                   if (fPrio > mPrio) match = f;
                 }
               });
             }
           } catch(err) {}
         });
         if (match) {
           if (isSpell) setPreviewSpell(match);
           else setPreviewFeat(match);
         }
      }
    }
  };

  const processEntryList = (list, tag) => {
    if (!Array.isArray(list)) return "";
    let html = "";
    list.forEach(entry => {
      if (!entry?.name) return;

      let cleanedName = entry.name.replace(/\{@recharge\s*([^}]*)\}/gi, (_, p1) => p1 ? `(Recharge ${p1}-6)` : `(Recharge 6)`);
      const rawDesc = processEntries ? processEntries(entry.entries || entry.entry || []) : '';

      let preCleaned = rawDesc.replace(/\{@recharge\s*([^}]*)\}/gi, (_, p1) => p1 ? `(Recharge ${p1}-6)` : `(Recharge 6)`);
      preCleaned = replaceAtkTags(preCleaned);
      preCleaned = preCleaned.replace(/\{@h\}/gi, '<i>Hit:</i> ');
      preCleaned = preCleaned.replace(/\{@damage\s+([^|}]+)[^}]*\}/gi, '$1');
      preCleaned = preCleaned.replace(/\{@dice\s+([^|}]+)[^}]*\}/gi, '$1');
      preCleaned = preCleaned.replace(/\{@hit\s+([^|}]+)[^}]*\}/gi, '+$1');
      preCleaned = preCleaned.replace(/\{@dc\s+([^|}]+)[^}]*\}/gi, 'DC $1');

      let cleanedDesc = formatLinks(preCleaned);
      cleanedDesc = cleanedDesc.replace(/\{@[a-zA-Z]+\s+([^|}]+)[^}]*\}/g, '$1');

      html += `<strong>${tag ? `[${tag}] ` : ''}${cleanedName}:</strong> ${cleanedDesc}<br/><br/>`;
    });
    return html;
  };

  const hp = typeof creature.hp === 'object' ? (creature.hp.average || creature.hp.min || 1) : (parseInt(creature.hp) || 1);
  const acEntry = Array.isArray(creature.ac) ? creature.ac[0] : creature.ac;
  const ac = typeof acEntry === 'object' ? (acEntry.ac || acEntry.value || 10) : (parseInt(acEntry) || 10);
  const spd = creature.speed?.walk || creature.speed;
  const speed = typeof spd === 'object' ? (spd.number ? `${spd.number} ft` : '') : (spd ? `${spd} ft` : '');
  
  const typeStrRaw = typeof creature.type === 'object' ? creature.type.type : creature.type;
  const typeStr = typeof typeStrRaw === 'string' ? typeStrRaw.charAt(0).toUpperCase() + typeStrRaw.slice(1) : typeStrRaw;
  const crStr = typeof creature.cr === 'object' ? creature.cr.cr : creature.cr;

  const formatMod = (score) => {
    const mod = Math.floor((score - 10) / 2);
    return mod >= 0 ? `+${mod}` : `${mod}`;
  };

  const abilityScoresHtml = `
    <div style="display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; margin: 12px 0; font-family: 'Cinzel', serif;">
      ${['str', 'dex', 'con', 'int', 'wis', 'cha'].map(attr => {
        const score = creature[attr] || 10;
              const modStr = formatMod(score);
              let saveStr = modStr;
              if (creature.save && creature.save[attr] !== undefined) {
                const rawSave = creature.save[attr];
                saveStr = (typeof rawSave === 'number' && rawSave >= 0) ? `+${rawSave}` : rawSave;
              }
            return `<div style="display: flex; flex-direction: column; align-items: center; background: var(--parchment); border: 1px solid var(--gold); border-radius: 6px; padding: 6px 2px;"><strong style="color: var(--red-dark); text-transform: uppercase; font-size: 0.9rem;">${attr}</strong><span style="font-size: 1.2rem; font-weight: bold; color: var(--ink); padding: 2px 0;">${score}</span><span style="font-size: 0.75rem; color: var(--ink-light); line-height: 1.2; text-align: center;">Mod: ${modStr}<br/>Save: ${saveStr}</span></div>`;
      }).join('')}
    </div>
  `;

  let savesHtml = "";
  if (creature.save) {
    savesHtml = `<strong>Saving Throws:</strong> ${Object.keys(creature.save).filter(k => k !== 'choose').map(k => `${k.toUpperCase()} ${creature.save[k]}`).join(', ')}<br/>`;
  }

  let skillsHtml = "";
  if (creature.skill) {
    skillsHtml = `<strong>Skills:</strong> ${Object.keys(creature.skill).map(k => `${k.charAt(0).toUpperCase() + k.slice(1)} ${creature.skill[k]}`).join(', ')}<br/>`;
  }

  let sensesStr = creature.senses ? (Array.isArray(creature.senses) ? creature.senses.join(', ') : creature.senses) + ", " : "";
  sensesStr += `Passive Perception ${creature.passive || 10}`;
  let sensesHtml = `<strong>Senses:</strong> ${sensesStr}<br/>`;

  let langHtml = `<strong>Languages:</strong> ${creature.languages ? (Array.isArray(creature.languages) ? creature.languages.join(', ') : creature.languages) : "—"}<br/>`;

  let fluffHtml = "";
  if (creature._fluff && creature._fluff.entries) {
    const parsedFluff = processEntries ? processEntries(creature._fluff.entries) : '';
    const cleanedFluff = formatLinks(parsedFluff);
    fluffHtml = `<div style="font-style: italic; color: var(--ink-light); margin-bottom: 12px; padding-bottom: 8px; border-bottom: 1px solid var(--gold);">${cleanedFluff}</div>`;
  }

  const notesHtml = [
    fluffHtml,
    abilityScoresHtml,
    savesHtml,
    skillsHtml,
    sensesHtml,
    langHtml,
    '<br/>',
    processEntryList(creature.trait, ''),
    processEntryList(creature.action, 'Action'),
    processEntryList(creature.bonus, 'Bonus Action'),
    processEntryList(creature.reaction, 'Reaction'),
    processEntryList(creature.legendary, 'Legendary Action')
  ].filter(Boolean).join('');

  return (
    <div>
      <TokenImage baseObj={creature} name={creature.name} source={creature.source} />
      <h2 style={{ fontFamily: "'Cinzel', serif", color: "var(--red-dark)", marginTop: 0, marginBottom: 8 }}>{creature.name}</h2>
      <div style={{ fontSize: "0.85rem", color: "var(--ink-light)", marginBottom: 12, paddingBottom: 8, borderBottom: "1px dashed var(--gold)" }}>
        <span>AC: {ac}</span> &bull; <span>HP: {hp}</span> &bull; <span>Speed: {speed}</span><br />
        <span>Type: {typeStr || "Unknown"}</span> &bull; <span>CR: {crStr || "?"}</span>
      </div>
      <div
        className="rendered-desc"
        onClick={handlePreviewClick}
        style={{ fontSize: "0.9rem", lineHeight: 1.5, color: "var(--ink)" }}
        dangerouslySetInnerHTML={{ __html: notesHtml || '<em style="color:var(--ink-light)">No additional details.</em>' }}
      />
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
            <div style={{ marginTop: 10, fontSize: "0.9rem", lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: formatLinks(processEntries(previewSpell.entries)) }} />
            {previewSpell.entriesHigherLevel && (
              <div style={{ marginTop: 10, borderTop: "1px dashed var(--gold)", paddingTop: 8, fontSize: "0.9rem" }} dangerouslySetInnerHTML={{ __html: formatLinks(processEntries(previewSpell.entriesHigherLevel)) }} />
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
            <div style={{ marginTop: 10, fontSize: "0.9rem", lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: formatLinks(processEntries(previewFeat.entries || previewFeat.entry)) }} />
          </ModalBox>
        </ModalOverlay>
      )}
    </div>
  );
}

export function CreatureSearchModal({ onSelect, onClose }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [monsters, setMonsters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCreature, setSelectedCreature] = useState(null);
  const [visibleCount, setVisibleCount] = useState(50);

  useEffect(() => {
    setVisibleCount(50);
  }, [searchQuery]);

  useEffect(() => {
    window.__modalCount = (window.__modalCount || 0) + 1;
    document.body.classList.add('modal-open');
    return () => {
      window.__modalCount = Math.max(0, (window.__modalCount || 0) - 1);
      if (window.__modalCount === 0) document.body.classList.remove('modal-open');
    };
  }, []);

  useEffect(() => {
    async function loadMonsters() {
      try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const data = await new Promise((resolve) => {
          const req = store.get("currentData");
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => resolve(null);
        });

        if (data) {
          const loadedMonsters = [];
          const loadedFluff = [];
          data.forEach((file) => {
            if (!file.name.toLowerCase().endsWith(".json")) return;
            try {
              const json = JSON.parse(file.content);
              if (json.monster) loadedMonsters.push(...json.monster);
              if (json.monsterFluff) loadedFluff.push(...json.monsterFluff);
              if (json.fluff && json.fluff.monster) loadedFluff.push(...json.fluff.monster);
            } catch (e) {}
          });

          const fluffMap = new Map();
          loadedFluff.forEach(f => {
            if (f.name) {
              fluffMap.set(`${f.name.toLowerCase()}|${f.source || 'MM'}`, f);
              fluffMap.set(f.name.toLowerCase(), f);
            }
          });

          const monMap = new Map();
          const exactMap = new Map();
          loadedMonsters.forEach((m) => {
            if (!m?.name) return;
            const key = m.name.toLowerCase();
            const exactKey = `${key}_${(m.source || 'MM').toLowerCase()}`;
            
            const f = fluffMap.get(`${key}|${m.source}`) || fluffMap.get(key);
            if (f) m._fluff = f;

            exactMap.set(exactKey, m);

            if (!monMap.has(key)) monMap.set(key, m);
            else {
              const ex = monMap.get(key);
              if (m.source === "MM" && ex.source !== "MM") monMap.set(key, m);
            }
          });

          const resolveCopy = (m, depth = 0) => {
            if (depth > 5) return m; // avoid infinite loops
            if (!m._copy) return m;
            const baseKey = `${m._copy.name.toLowerCase()}_${(m._copy.source || 'MM').toLowerCase()}`;
            let base = exactMap.get(baseKey) || monMap.get(m._copy.name.toLowerCase());
            if (!base) return m;
            
            base = resolveCopy(base, depth + 1);
            
            let resolvedBase = JSON.parse(JSON.stringify(base));
            if (m._copy._mod && m._copy._mod["*"]) {
              const mod = m._copy._mod["*"];
              if (mod.mode === "replaceTxt" && mod.replace) {
                try {
                  let flags = mod.flags || "";
                  if (!flags.includes("g")) flags += "g";
                  const regex = new RegExp(mod.replace, flags);
                  const applyReplacement = (obj) => {
                    if (typeof obj === 'string') return obj.replace(regex, mod.with || "");
                    if (Array.isArray(obj)) return obj.map(applyReplacement);
                    if (obj && typeof obj === 'object') {
                      const res = {};
                      for (const k in obj) res[k] = applyReplacement(obj[k]);
                      return res;
                    }
                    return obj;
                  };
                  resolvedBase = applyReplacement(resolvedBase);
                } catch(e) {}
              }
            }
            
            return { ...resolvedBase, ...m };
          };

          const resolvedMonsters = [];
          monMap.forEach((m) => {
            resolvedMonsters.push(resolveCopy(m));
          });

          const sorted = resolvedMonsters.sort((a, b) =>
            a.name.localeCompare(b.name)
          );
          setMonsters(sorted);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadMonsters();
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery) return monsters;
    return monsters
      .filter((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [monsters, searchQuery]);

  const displayedMonsters = useMemo(() => {
    return filtered.slice(0, visibleCount);
  }, [filtered, visibleCount]);

  const handleScroll = (e) => {
    const bottom = e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 200;
    if (bottom && visibleCount < filtered.length) {
      setVisibleCount((v) => v + 50);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalBox $maxWidth="900px" style={{ width: "95vw", height: "85vh", display: "flex", flexDirection: "column", padding: 20 }} onClick={(e) => e.stopPropagation()}>
        <style>{`
          .creature-split { display: flex; flex: 1; overflow: hidden; gap: 16px; flex-direction: row; }
          .creature-left { flex: 1; overflow-y: auto; border-right: 1px solid var(--gold); padding-right: 8px; }
          .creature-right { flex: 1.5; overflow-y: auto; padding-left: 8px; padding-right: 16px; }
          @media (max-width: 768px) {
            .creature-split { flex-direction: column; gap: 8px; }
            .creature-left { border-right: none; border-bottom: 2px solid var(--gold); padding-right: 0; padding-bottom: 12px; flex: none; height: 40%; max-height: 250px; }
            .creature-right { padding-left: 0; padding-right: 0; padding-top: 4px; flex: 1; }
          }
        `}</style>
        <CloseBtn onClick={onClose}>&times;</CloseBtn>
        <ModalTitle style={{ marginTop: 0 }}>Search Creatures</ModalTitle>
        <input
          type="text"
          placeholder="Search monsters..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: "100%", padding: "8px 12px", marginBottom: "12px", border: "1px solid var(--gold)", borderRadius: "4px", fontSize: "1rem" }}
          autoFocus
        />
        
        <div className="creature-split">
          <div className="creature-left" onScroll={handleScroll}>
            {loading ? (
              <em style={{ color: "var(--ink-light)" }}>Loading...</em>
            ) : displayedMonsters.length === 0 ? (
              <em style={{ color: "var(--ink-light)" }}>No results found.</em>
            ) : (
              displayedMonsters.map((m, idx) => {
                const cr = m.cr ? (typeof m.cr === "object" ? m.cr.cr : m.cr) : "?";
                const isSelected = selectedCreature === m;
                return (
                  <div
                    key={idx}
                    onClick={() => {
                      console.log("Viewing Creature:", m);
                      setSelectedCreature(m);
                    }}
                    style={{
                      padding: "8px 12px",
                      borderBottom: "1px dashed rgba(201, 173, 106, 0.3)",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      background: isSelected ? "var(--parchment-dark)" : "transparent",
                      transition: "background 0.15s"
                    }}
                  >
                    <span style={{ display: "flex", flexDirection: "column" }}>
                      <strong style={{ color: isSelected ? "var(--red-dark)" : "var(--ink)", fontSize: "0.95rem" }}>{m.name}</strong>
                      <span style={{ color: "var(--ink-light)", fontSize: "0.75rem" }}>[CR {cr}] {m.source || ""}</span>
                    </span>
                    <button
                      className="btn btn-primary"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelect(m);
                      }}
                      style={{ padding: "4px 10px", fontSize: "0.8rem" }}
                    >
                      Add
                    </button>
                  </div>
                );
              })
            )}
          </div>
          
          <div className="creature-right">
            {selectedCreature ? (
              <CreatureDetails creature={selectedCreature} />
            ) : (
              <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ink-light)", fontStyle: "italic" }}>
                Select a creature to view details
              </div>
            )}
          </div>
        </div>
      </ModalBox>
    </ModalOverlay>
  );
}

function SummonCard({ summon, index, onUpdate, onDelete, showAddToCombat }) {
  const hp = parseInt(summon.hp) || 0;
  const maxHp = parseInt(summon.maxHp) || 1;
  const hpPct = Math.min(100, Math.max(0, (hp / maxHp) * 100));
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  const adjustHp = (delta) => {
    const newHp = Math.max(0, Math.min(maxHp, hp + delta));
    onUpdate({ ...summon, hp: newHp });
  };

  const formatText = (text) => {
    if (!text) return "<em style='color:var(--ink-light)'>Click to edit notes...</em>";
    return text.replace(/\n/g, "<br>").replace(/\*\*(.*?)\*\*/g, "<b>$1</b>").replace(/\*(.*?)\*/g, "<i>$1</i>");
  };

  return (
    <div
      style={{
        background: "white",
        border: "2px solid var(--gold)",
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        position: "relative",
      }}
    >
      <button
        className="delete-feature-btn"
        onClick={() => onDelete(index)}
        style={{ position: "absolute", top: 8, right: 8, margin: 0 }}
      >
        &times;
      </button>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 8,
          marginBottom: 12,
        }}
      >
        <div className="field">
          <label className="field-label">Name</label>
          <input
            type="text"
            value={summon.name || ""}
            onChange={(e) => onUpdate({ ...summon, name: e.target.value })}
            placeholder="Creature name"
          />
        </div>
        <div className="field">
          <label className="field-label">Type / CR</label>
          <input
            type="text"
            value={summon.type || ""}
            onChange={(e) => onUpdate({ ...summon, type: e.target.value })}
            placeholder="Beast, CR 1/4"
          />
        </div>
      </div>

      <div style={{ marginBottom: 8 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: 4,
          }}
        >
          <span
            style={{
              fontFamily: "'Cinzel',serif",
              fontSize: "0.75rem",
              color: "var(--ink-light)",
            }}
          >
            HP
          </span>
          <span style={{ fontFamily: "'Cinzel',serif", fontSize: "0.75rem" }}>
            {hp} / {maxHp}
          </span>
        </div>
        <div
          style={{
            height: 8,
            background: "var(--parchment-dark)",
            borderRadius: 4,
            overflow: "hidden",
            marginBottom: 6,
          }}
        >
          <div
            style={{
              height: "100%",
              background:
                hpPct > 50 ? "var(--red)" : hpPct > 25 ? "#e67e22" : "#c0392b",
              width: `${hpPct}%`,
              transition: "width 0.3s",
            }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button className="hp-btn" onClick={() => adjustHp(-1)}>
            -
          </button>
          <input
            type="number"
            value={summon.hp || 0}
            onChange={(e) =>
              onUpdate({ ...summon, hp: parseInt(e.target.value) || 0 })
            }
            style={{ width: 60, textAlign: "center" }}
          />
          <button className="hp-btn" onClick={() => adjustHp(1)}>
            +
          </button>
          <span style={{ color: "var(--ink-light)" }}>/</span>
          <input
            type="number"
            value={summon.maxHp || 0}
            onChange={(e) =>
              onUpdate({ ...summon, maxHp: parseInt(e.target.value) || 0 })
            }
            style={{ width: 60, textAlign: "center" }}
            title="Max HP"
          />
        </div>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
          marginBottom: 8,
        }}
      >
        <div className="field">
          <label className="field-label">AC</label>
          <input
            type="number"
            value={summon.ac || ""}
            onChange={(e) => onUpdate({ ...summon, ac: e.target.value })}
            placeholder="AC"
          />
        </div>
        <div className="field">
          <label className="field-label">Speed</label>
          <input
            type="text"
            value={summon.speed || ""}
            onChange={(e) => onUpdate({ ...summon, speed: e.target.value })}
            placeholder="30 ft"
          />
        </div>
        <div className="field">
          <label className="field-label">Initiative</label>
          <input
            type="text"
            value={summon.initiative || ""}
            onChange={(e) =>
              onUpdate({ ...summon, initiative: e.target.value })
            }
            placeholder="+3"
          />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: "6px", margin: "12px 0", fontFamily: "'Cinzel', serif" }}>
        {["str", "dex", "con", "int", "wis", "cha"].map((ab) => {
          const score = summon[ab] ?? 10;
          const mod = Math.floor((score - 10) / 2);
          const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
          
          let saveStr = modStr;
          if (summon.save && summon.save[ab] !== undefined) {
            const rawSave = summon.save[ab];
            saveStr = (typeof rawSave === 'number' && rawSave >= 0) ? `+${rawSave}` : rawSave;
          }

          return (
            <div key={ab} style={{ display: "flex", flexDirection: "column", alignItems: "center", background: "var(--parchment)", border: "1px solid var(--gold)", borderRadius: "6px", padding: "6px 2px" }}>
              <strong style={{ color: "var(--red-dark)", textTransform: "uppercase", fontSize: "0.9rem" }}>{ab}</strong>
              <input 
                type="number" 
                min="1" max="30" 
                value={score} 
                onChange={(e) => {
                  const newScore = parseInt(e.target.value) || 10;
                  onUpdate({ ...summon, [ab]: newScore });
                }}
                style={{ width: "100%", textAlign: "center", fontSize: "1.2rem", fontWeight: "bold", color: "var(--ink)", background: "transparent", border: "none", padding: "2px 0", fontFamily: "inherit" }}
              />
              <span style={{ fontSize: "0.75rem", color: "var(--ink-light)", lineHeight: "1.2", textAlign: "center" }}>
                Mod: {modStr}<br/>
                Save: {saveStr}
              </span>
            </div>
          );
        })}
      </div>

      <div className="field">
        <label className="field-label">Notes / Abilities</label>
        <div
          className="rendered-desc"
          onClick={() => setIsEditingNotes(true)}
          style={{ cursor: "pointer", minHeight: "60px", background: "rgba(255,255,255,0.5)", padding: 8, border: "1px solid var(--gold)", borderRadius: 4 }}
          dangerouslySetInnerHTML={{ __html: formatText(summon.notes) }}
        />
      </div>
      {showAddToCombat && (
        <button
          className="add-feature-btn"
          style={{ marginTop: 8, background: 'var(--red-dark)', color: '#fff', borderColor: 'var(--red-dark)' }}
          onClick={() => {
            const name = summon.name || 'Creature';
            const existing = JSON.parse(localStorage.getItem('combatTrackerEntries') || '[]');
            existing.push({ name, hp: summon.hp || 0, maxHp: summon.maxHp || 0, ac: summon.ac || 0, initiative: parseInt(summon.initiative) || 0, type: 'summon' });
            localStorage.setItem('combatTrackerEntries', JSON.stringify(existing));
            alert(`${name} added to combat tracker.`);
          }}
        >
          + Add to Combat
        </button>
      )}
      {isEditingNotes && (
        <RichTextModal
          title={`${summon.name || "Creature"} Notes`}
          value={summon.notes || ""}
          onChange={(val) => onUpdate({ ...summon, notes: val })}
          onClose={() => setIsEditingNotes(false)}
        />
      )}
    </div>
  );
}

export default function SummonsTab({ initiativeList = [], socket = null, roomId = null, myName = "" }) {
  const { character, update } = useCharacter();
  const summons = character.summonsData || [];

  const [isModalOpen, setIsModalOpen] = useState(false);

  const updateSummon = (index, newSummon) => {
    update({
      summonsData: summons.map((s, i) => (i === index ? newSummon : s)),
    });
  };

  const deleteSummon = (index) => {
    update({ summonsData: summons.filter((_, i) => i !== index) });
  };

  const handleImportMonster = (m) => {
      let ac = 10;
      if (m.ac) {
          const acEntry = Array.isArray(m.ac) ? m.ac[0] : m.ac;
          ac = typeof acEntry === 'object' ? (acEntry.ac || acEntry.value || 10) : (parseInt(acEntry) || 10);
      }

      let hp = 10;
      if (m.hp) {
          hp = typeof m.hp === 'object' ? (m.hp.average || m.hp.min || 1) : (parseInt(m.hp) || 1);
      }

      let speed = '30 ft';
      if (m.speed) {
          const spd = m.speed.walk || m.speed;
          speed = typeof spd === 'object' ? (spd.number ? `${spd.number} ft` : '') : (spd ? `${spd} ft` : '');
      }

      let typeStr = '';
      if (m.type) {
          let rawType = typeof m.type === 'object' ? m.type.type : m.type;
          typeStr = typeof rawType === 'string' ? rawType.charAt(0).toUpperCase() + rawType.slice(1) : rawType;
      }
      let crStr = '';
      if (m.cr) {
          crStr = typeof m.cr === 'object' ? m.cr.cr : m.cr;
      }
      let typeAndCr = [typeStr, crStr ? `CR ${crStr}` : ''].filter(Boolean).join(', ');

      let notes = [];
      const processEntryList = (list, tag) => {
          if (!Array.isArray(list)) return;
          list.forEach(entry => {
              if (!entry?.name) return;
              let cleanedName = entry.name.replace(/\{@recharge\s*([^}]*)\}/gi, (_, p1) => p1 ? `(Recharge ${p1}-6)` : `(Recharge 6)`);
              const rawDesc = processEntries ? processEntries(entry.entries || entry.entry || []) : '';
              
              let preCleaned = rawDesc.replace(/\{@recharge\s*([^}]*)\}/gi, (_, p1) => p1 ? `(Recharge ${p1}-6)` : `(Recharge 6)`);
              preCleaned = replaceAtkTags(preCleaned);
              preCleaned = preCleaned.replace(/\{@h\}/gi, '*Hit:* ');
              preCleaned = preCleaned.replace(/\{@damage\s+([^|}]+)[^}]*\}/gi, '$1');
              preCleaned = preCleaned.replace(/\{@dice\s+([^|}]+)[^}]*\}/gi, '$1');
              preCleaned = preCleaned.replace(/\{@hit\s+([^|}]+)[^}]*\}/gi, '+$1');
              preCleaned = preCleaned.replace(/\{@dc\s+([^|}]+)[^}]*\}/gi, 'DC $1');

              let cleanedDesc = cleanText ? cleanText(preCleaned) : preCleaned;
              cleanedDesc = cleanedDesc.replace(/\{@[a-zA-Z]+\s+([^|}]+)[^}]*\}/g, '$1');

              notes.push(`**${tag ? `[${tag}] ` : ''}${cleanedName}:** ${cleanedDesc}`);
          });
      };

      processEntryList(m.trait, '');
      processEntryList(m.action, 'Action');
      processEntryList(m.bonus, 'Bonus Action');
      processEntryList(m.reaction, 'Reaction');
      processEntryList(m.legendary, 'Legendary Action');

      const newSummon = {
          name: m.name || '',
          type: typeAndCr,
          hp: hp,
          maxHp: hp,
          ac: ac,
          speed: speed,
          initiative: m.dex ? (m.dex - 10 >= 0 ? `+${Math.floor((m.dex - 10) / 2)}` : `${Math.floor((m.dex - 10) / 2)}`) : "+0",
          notes: notes.join('\n\n'),
          str: m.str || 10,
          dex: m.dex || 10,
          con: m.con || 10,
          int: m.int || 10,
          wis: m.wis || 10,
          cha: m.cha || 10,
          save: m.save || null
      };

      update({ summonsData: [...summons, newSummon] });
      setIsModalOpen(false);
  };

  const addSummon = () => {
    update({
      summonsData: [
        ...summons,
        {
          name: "",
          type: "",
          hp: 10,
          maxHp: 10,
          ac: 12,
          speed: "30 ft",
          initiative: "+0",
          notes: "",
          str: 10,
          dex: 10,
          con: 10,
          int: 10,
          wis: 10,
          cha: 10,
        },
      ],
    });
  };

  return (
    <div>
      {summons.length === 0 && (
        <div
          style={{
            textAlign: "center",
            color: "var(--ink-light)",
            fontStyle: "italic",
            padding: "16px 0",
          }}
        >
          No creatures tracked. Add one below.
        </div>
      )}
      {summons.map((s, i) => (
        <SummonCard
          key={i}
          summon={s}
          index={i}
          onUpdate={(ns) => updateSummon(i, ns)}
          onDelete={deleteSummon}
          showAddToCombat={!!roomId}
        />
      ))}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button className="add-feature-btn" style={{ flex: 1 }} onClick={addSummon}>
          + Add Blank
        </button>
        <button className="add-feature-btn" style={{ flex: 1 }} onClick={() => setIsModalOpen(true)}>
          🔍 Search Creatures
        </button>
      </div>

      {isModalOpen && (
        <CreatureSearchModal onSelect={handleImportMonster} onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
}
