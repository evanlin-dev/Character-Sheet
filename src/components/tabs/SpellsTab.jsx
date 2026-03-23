import { useState, useMemo, useEffect } from "react";
import { useCharacter } from "src/context/CharacterContext";
import {
  calcMod,
  formatMod,
  getSpellDC,
  getSpellAttackBonus,
} from "src/utils/calculations.js";
import { checkDataLoaded, openDB, STORE_NAME } from "src/utils/db";
import { processEntries, cleanText } from "src/utils/dndEntries";
import {
  ModalOverlay,
  ModalBox,
  ModalTitle,
  CloseBtn,
} from "src/styles/shared";
import RichTextModal from "src/components/RichTextModal";

const extractDmg = (desc) => {
  if (!desc) return null;
  const text = desc.replace(/<[^>]+>/g, ' ');
  const m = text.match(/\b(\d+d\d+(?:\s*[+\-]\s*\d+)?)\s+(\w+)\s+damage/i);
  if (m) return `${m[1].replace(/\s+/g, '')} ${m[2].toLowerCase()}`;
  const m2 = text.match(/\b(\d+d\d+(?:\s*[+\-]\s*\d+)?)\b/);
  if (m2) return m2[1].replace(/\s+/g, '');
  return null;
};

function SpellRow({ spell, index, showPrepared, onUpdate, onDelete, dc, atk, onCast }) {
  const [showNotes, setShowNotes] = useState(false);

  let atkType = spell.attackType || "";
  let saveAb = spell.saveAbility || "";
  if (!atkType && !saveAb && spell.description) {
      const descLower = spell.description.toLowerCase();
      if (/\b(ranged|melee)\s+spell\s+attack/i.test(descLower)) {
          atkType = "spell";
      } else {
          const saveMatch = descLower.match(/\b(strength|dexterity|constitution|intelligence|wisdom|charisma)\s+saving throw/i);
          if (saveMatch) {
              const map = { strength:'str', dexterity:'dex', constitution:'con', intelligence:'int', wisdom:'wis', charisma:'cha' };
              saveAb = map[saveMatch[1].toLowerCase()] || "";
          }
      }
  }
  const dmg = extractDmg(spell.description);

  useEffect(() => {
    if (showNotes) {
      window.__modalCount = (window.__modalCount || 0) + 1;
      document.body.classList.add('modal-open');
      return () => {
        window.__modalCount = Math.max(0, (window.__modalCount || 0) - 1);
        if (window.__modalCount === 0) document.body.classList.remove('modal-open');
      };
    }
  }, [showNotes]);

  return (
    <div
      className="spell-row"
      style={{
        display: "grid",
        gridTemplateColumns:
          "20px 20px 30px 1fr 70px 70px 20px 20px 20px 45px 30px 24px",
        gap: 4,
        alignItems: "center",
        padding: "4px 8px",
        borderBottom: "1px dashed var(--gold)",
        marginBottom: 2,
      }}
    >
      <span
        style={{
          textAlign: "center",
          cursor: "pointer",
          color: "var(--ink-light)",
          fontSize: "0.85rem",
        }}
        onClick={() => onDelete(index)}
      >
        ✕
      </span>
      {showPrepared ? (
        <input
          type="checkbox"
          checked={spell.prepared || false}
          onChange={(e) => onUpdate({ ...spell, prepared: e.target.checked })}
          title="Prepared"
        />
      ) : (
        <span />
      )}
      <input
        type="text"
        className="spell-lvl"
        value={spell.level !== undefined ? spell.level : ""}
        onChange={(e) => onUpdate({ ...spell, level: e.target.value })}
        placeholder="Lvl"
        style={{ textAlign: "center", fontSize: "0.85rem" }}
      />
      <div className="spell-name-cell">
        <input
          type="text"
          className="spell-name"
          value={spell.name || ""}
          onChange={(e) => onUpdate({ ...spell, name: e.target.value })}
          placeholder="Spell name"
          style={{ fontWeight: 600, fontSize: "0.9rem" }}
        />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 2, marginTop: 2 }}>
          {atkType && <span className="spell-roll-tag spell-roll-atk">Hit {formatMod(atk)}</span>}
          {!atkType && saveAb && <span className="spell-roll-tag spell-roll-save">{saveAb.toUpperCase().substring(0,3)} {dc}</span>}
          {dmg && <span className="spell-roll-tag" style={{ background: 'color-mix(in srgb, var(--red) 10%, var(--parchment))', color: 'var(--red-dark)', borderColor: 'color-mix(in srgb, var(--red) 30%, var(--gold))' }}>{dmg}</span>}
          {spell.ritual && <span className="msv-tag" title="Ritual">R</span>}
          {spell.concentration && <span className="msv-tag msv-tag-conc" title="Concentration">C</span>}
          {spell.material && <span className="msv-tag msv-tag-mat" title="Material Component">M</span>}
        </div>
      </div>
      <input
        type="text"
        className="spell-time"
        value={spell.time || ""}
        onChange={(e) => onUpdate({ ...spell, time: e.target.value })}
        placeholder="1 Action"
        style={{ fontSize: "0.8rem" }}
      />
      <input
        type="text"
        className="spell-range"
        value={spell.range || ""}
        onChange={(e) => onUpdate({ ...spell, range: e.target.value })}
        placeholder="60 ft"
        style={{ fontSize: "0.8rem" }}
      />
      <input
        type="checkbox"
        className="spell-ritual"
        checked={spell.ritual || false}
        onChange={(e) => onUpdate({ ...spell, ritual: e.target.checked })}
        title="Ritual"
      />
      <input
        type="checkbox"
        className="spell-conc"
        checked={spell.concentration || false}
        onChange={(e) =>
          onUpdate({ ...spell, concentration: e.target.checked })
        }
        title="Concentration"
      />
      <input
        type="checkbox"
        className="spell-mat"
        checked={spell.material || false}
        onChange={(e) => onUpdate({ ...spell, material: e.target.checked })}
        title="Material"
      />
      <button
        className="btn btn-primary"
        onClick={() => onCast(spell)}
        style={{ padding: "2px 4px", fontSize: "0.7rem", height: "22px" }}
      >
        Cast
      </button>
      <button
        className="skill-info-btn"
        onClick={() => setShowNotes(true)}
        title="View/Edit Description"
        style={{
          textAlign: "center",
          cursor: "pointer",
          fontSize: "0.85rem",
          background: "none",
          border: "none",
          color: spell.description ? "var(--ink)" : "var(--ink-light)",
        }}
      >
        📝
      </button>
      <span />

      {showNotes && (
        <RichTextModal
          title={`${spell.name || "Spell"} Description`}
          value={spell.description || ""}
          onChange={(val) => onUpdate({ ...spell, description: val })}
          onClose={() => setShowNotes(false)}
        />
      )}
    </div>
  );
}

function SpellListHeader({ showPrepared }) {
  return (
    <div
      className="spell-list-header"
      style={{
        display: "grid",
        gridTemplateColumns:
          "20px 20px 30px 1fr 70px 70px 20px 20px 20px 45px 30px 24px",
        gap: 4,
        padding: "4px 8px",
        fontFamily: "'Cinzel',serif",
        fontSize: "0.65rem",
        color: "var(--ink-light)",
      }}
    >
      <span></span>
      {showPrepared ? <span>Prep</span> : <span></span>}
      <span>Lvl</span>
      <span>Name</span>
      <span>Time</span>
      <span>Range</span>
      <span title="Ritual">R</span>
      <span title="Concentration">C</span>
      <span title="Material">M</span>
      <span style={{ textAlign: "center" }}>Cast</span>
      <span title="Notes / Description" style={{ textAlign: "center" }}>📝</span>
      <span></span>
    </div>
  );
}

function SpellSlot({ slot, index, onUpdate, onDelete }) {
  const usePips = slot.total <= 10;
  const toggleSlot = (i) => {
    const newUsed = i < slot.used ? i : i + 1;
    onUpdate({ ...slot, used: newUsed });
  };

  return (
    <div
      className="spell-slot-row"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 8,
        padding: "8px 12px",
        background: "white",
        border: "1px solid var(--gold)",
        borderRadius: 6,
        marginBottom: 6,
        flexWrap: "wrap",
      }}
    >
      <span
        style={{
          fontFamily: "'Cinzel',serif",
          fontWeight: 700,
          minWidth: 60,
          fontSize: "0.85rem",
        }}
      >
        Level {slot.level}
      </span>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          flexWrap: "wrap",
        }}
      >
        <span style={{ fontSize: "0.75rem", color: "var(--ink-light)" }}>
          Slots:
        </span>
        <input
          type="number"
          value={slot.total}
          min="0"
          max="20"
          onChange={(e) =>
            onUpdate({ ...slot, total: parseInt(e.target.value) || 0 })
          }
          style={{
            width: 40,
            textAlign: "center",
            fontSize: "0.85rem",
            fontWeight: 600,
          }}
          title="Total slots"
        />
      </div>
      <div
        style={{
          display: "flex",
          gap: 4,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        {usePips ? (
          Array.from({ length: slot.total }).map((_, i) => (
            <div
              key={i}
              className={`resource-slot${i < (slot.used || 0) ? " used" : ""}`}
              onClick={() => toggleSlot(i)}
              style={{ width: 20, height: 20 }}
            />
          ))
        ) : (
          <>
            <button
              className="mini-btn"
              onClick={() =>
                onUpdate({ ...slot, used: Math.max(0, (slot.used || 0) - 1) })
              }
            >
              −
            </button>
            <span
              style={{
                fontFamily: "'Cinzel',serif",
                fontSize: "0.9rem",
                minWidth: 30,
                textAlign: "center",
              }}
            >
              {slot.used || 0}/{slot.total}
            </span>
            <button
              className="mini-btn"
              onClick={() =>
                onUpdate({
                  ...slot,
                  used: Math.min(slot.total, (slot.used || 0) + 1),
                })
              }
            >
              +
            </button>
          </>
        )}
      </div>
      <button
        className="delete-feature-btn"
        style={{
          marginLeft: "auto",
          width: 20,
          height: 20,
          fontSize: "0.75rem",
        }}
        onClick={() => onDelete(index)}
      >
        ✕
      </button>
    </div>
  );
}

export function SpellSearchModal({ onSelect, onClose, isCantrip }) {
  const [search, setSearch] = useState("");
  const [spells, setSpells] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.__modalCount = (window.__modalCount || 0) + 1;
    document.body.classList.add('modal-open');
    return () => {
      window.__modalCount = Math.max(0, (window.__modalCount || 0) - 1);
      if (window.__modalCount === 0) document.body.classList.remove('modal-open');
    };
  }, []);

  useEffect(() => {
    async function loadSpells() {
      try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const data = await new Promise((resolve, reject) => {
          const req = store.get("currentData");
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });

        if (!data) {
          setSpells([]);
          setLoading(false);
          return;
        }

        const rawSpells = [];
        data.forEach((file) => {
          if (!file.name.toLowerCase().endsWith(".json")) return;
          try {
            const json = JSON.parse(file.content);
            const arr = json.spell || json.spells || json.data;
            if (Array.isArray(arr)) {
              arr.forEach((s) => {
                if (s.name && typeof s.level === "number") {
                  if (isCantrip && s.level !== 0) return;
                  if (!isCantrip && s.level === 0) return;
                  rawSpells.push(s);
                }
              });
            }
          } catch (e) {}
        });

        // Deduplicate (XPHB > PHB > Others)
        const spellMap = new Map();
        rawSpells.forEach((s) => {
          if (!spellMap.has(s.name)) {
            spellMap.set(s.name, s);
          } else {
            const existing = spellMap.get(s.name);
            if (s.source === "XPHB") spellMap.set(s.name, s);
            else if (s.source === "PHB" && existing.source !== "XPHB") {
              spellMap.set(s.name, s);
            }
          }
        });

        // Format descriptions and metadata
        const formattedSpells = Array.from(spellMap.values())
          .map((s) => {
            let time =
              s.time && s.time[0]
                ? `${s.time[0].number} ${s.time[0].unit}`
                : "";
            let range = s.range
              ? s.range.distance
                ? `${s.range.distance.amount ? s.range.distance.amount + " " : ""}${s.range.distance.type}`
                : s.range.type
              : "";

            let desc = processEntries(s.entries);
            if (s.entriesHigherLevel)
              desc += "<br><br>" + processEntries(s.entriesHigherLevel);
            desc = cleanText(desc);

            const rawMat = s.components && (s.components.m || s.components.M);
            let material = false;
            if (rawMat) {
              material = true;
              let matText =
                typeof rawMat === "object" ? rawMat.text || "" : rawMat;
              if (matText)
                desc = `**Materials:** ${matText.charAt(0).toUpperCase() + matText.slice(1)}\n\n${desc}`;
            }
            
            let attackType = "";
            if (s.spellAttack && s.spellAttack.length > 0) {
              attackType = "spell";
            }
            let saveAbility = "";
            if (s.savingThrow && s.savingThrow.length > 0) {
              saveAbility = s.savingThrow[0];
            }

            const SCHOOL_FULL = {
              A: "Abjuration",
              C: "Conjuration",
              D: "Divination",
              E: "Enchantment",
              V: "Evocation",
              I: "Illusion",
              N: "Necromancy",
              T: "Transmutation",
            };

            return {
              name: s.name,
              level: s.level,
              time,
              range,
              school: SCHOOL_FULL[s.school] || s.school || "",
              ritual: s.meta?.ritual || false,
              concentration: s.duration?.[0]?.concentration || false,
              material,
              description: desc,
              attackType,
              saveAbility,
            };
          })
          .sort((a, b) => a.name.localeCompare(b.name));

        setSpells(formattedSpells);
      } catch (e) {
        console.error("Failed to load spells", e);
      } finally {
        setLoading(false);
      }
    }

    loadSpells();
  }, [isCantrip]);

  const filteredSpells = useMemo(() => {
    const q = search.toLowerCase();
    return spells.filter((s) => s.name.toLowerCase().includes(q));
  }, [search, spells]);

  return (
    <ModalOverlay onClick={onClose}>
      <ModalBox
        $maxWidth="520px"
        style={{ maxHeight: "85vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <CloseBtn onClick={onClose}>&times;</CloseBtn>
        <ModalTitle>Search {isCantrip ? "Cantrips" : "Spells"}</ModalTitle>
        <input
          type="text"
          placeholder="Search..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            padding: "8px 10px",
            marginBottom: 12,
            fontSize: "1rem",
          }}
          autoFocus
        />
        <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
          {loading ? (
            <em style={{ color: "var(--ink-light)" }}>
              Loading spells from database...
            </em>
          ) : filteredSpells.length === 0 ? (
            <em style={{ color: "var(--ink-light)" }}>No spells found.</em>
          ) : (
            filteredSpells.map((spell) => (
              <div
                key={spell.name}
                onClick={() => onSelect(spell)}
                style={{
                  padding: "10px 12px",
                  cursor: "pointer",
                  borderBottom: "1px solid var(--gold)",
                  background: "rgba(255,255,255,0.5)",
                  display: "flex",
                  flexDirection: "column",
                  gap: 4,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                  }}
                >
                  <span style={{ fontWeight: "bold" }}>{spell.name}</span>
                  <span
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--ink-light)",
                      textAlign: "right",
                    }}
                  >
                    {spell.level === 0 ? "Cantrip" : `Level ${spell.level}`}
                    {spell.school && ` · ${spell.school}`}
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: "8px 16px",
                    fontSize: "0.8rem",
                    color: "var(--ink-light)",
                    alignItems: "center",
                  }}
                >
                  {spell.time && (
                    <span>
                      <strong style={{ color: "var(--ink)" }}>Time:</strong>{" "}
                      {spell.time}
                    </span>
                  )}
                  {spell.range && (
                    <span>
                      <strong style={{ color: "var(--ink)" }}>Range:</strong>{" "}
                      {spell.range}
                    </span>
                  )}
                  <span style={{ display: "flex", gap: 4 }}>
                    {spell.attackType && <span className="spell-roll-tag spell-roll-atk" style={{fontSize: "0.6rem", padding: "1px 4px"}}>Atk</span>}
                    {!spell.attackType && spell.saveAbility && <span className="spell-roll-tag spell-roll-save" style={{fontSize: "0.6rem", padding: "1px 4px"}}>{spell.saveAbility.toUpperCase().substring(0,3)} Save</span>}
                    {extractDmg(spell.description) && <span className="spell-roll-tag" style={{fontSize: "0.6rem", padding: "1px 4px", background: 'color-mix(in srgb, var(--red) 10%, var(--parchment))', color: 'var(--red-dark)', borderColor: 'color-mix(in srgb, var(--red) 30%, var(--gold))'}}>{extractDmg(spell.description)}</span>}
                  </span>
                  <span
                    style={{
                      display: "flex",
                      gap: 6,
                      marginLeft: "auto",
                      fontWeight: "bold",
                      color: "var(--red-dark)",
                    }}
                  >
                    {spell.ritual && <span title="Ritual">R</span>}
                    {spell.concentration && (
                      <span title="Concentration">C</span>
                    )}
                    {spell.material && <span title="Material">M</span>}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </ModalBox>
    </ModalOverlay>
  );
}

export default function SpellsTab({ initiativeList = [], socket = null, roomId = null, myName = "" }) {
  const { character, update } = useCharacter();
  const spellSlots = character.spellSlotsData || [];
  const cantrips = character.cantripsList || [];
  const prepared = character.preparedSpellsList || [];
  const known = character.spellsList || [];

  const [cantripSearch, setCantripSearch] = useState(false);
  const [knownSearch, setKnownSearch] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [castSpellTarget, setCastSpellTarget] = useState(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [spellInfoModal, setSpellInfoModal] = useState(null); // 'dc' | 'mod' | 'atk' | null

  useEffect(() => {
    checkDataLoaded().then(setDataLoaded);
  }, []);

  useEffect(() => {
    if (showFilterModal) {
      window.__modalCount = (window.__modalCount || 0) + 1;
      document.body.classList.add('modal-open');
      return () => {
        window.__modalCount = Math.max(0, (window.__modalCount || 0) - 1);
        if (window.__modalCount === 0) document.body.classList.remove('modal-open');
      };
    }
  }, [showFilterModal]);

  const spellFromDB = (spell) => ({
    level: spell.level,
    name: spell.name,
    time: spell.time,
    range: spell.range,
    ritual: spell.ritual || false,
    concentration: spell.concentration || false,
    material: spell.material || false,
    description: spell.description || "",
    attackType: spell.attackType || "",
    saveAbility: spell.saveAbility || "",
  });

  console.log(character, update);

  const addCantripFromDB = (spell) => {
    update({ cantripsList: [...cantrips, spellFromDB(spell)] });
    setCantripSearch(false);
  };

  const addKnownFromDB = (spell) => {
    update({ spellsList: [...known, spellFromDB(spell)] });
    setKnownSearch(false);
  };

  const spellDC = getSpellDC(character);
  const spellAtk = getSpellAttackBonus(character);
  const spellMod = calcMod(
    parseInt(character[character.spellAbility || "int"]) || 10,
  );

  const updateSlots = (index, newSlot) => {
    update({
      spellSlotsData: spellSlots.map((s, i) => (i === index ? newSlot : s)),
    });
  };

  const deleteSlot = (index) => {
    update({ spellSlotsData: spellSlots.filter((_, i) => i !== index) });
  };

  const addSlotLevel = () => {
    const existing = spellSlots.map((s) => s.level);
    let lvl = 1;
    while (existing.includes(lvl)) lvl++;
    if (lvl <= 9) {
      update({
        spellSlotsData: [...spellSlots, { level: lvl, total: 1, used: 0 }],
      });
    }
  };

  const updateCantrip = (index, newSpell) =>
    update({
      cantripsList: cantrips.map((s, i) => (i === index ? newSpell : s)),
    });
  const deleteCantrip = (index) =>
    update({ cantripsList: cantrips.filter((_, i) => i !== index) });
  const addCantrip = () =>
    update({
      cantripsList: [
        ...cantrips,
        {
          level: 0,
          name: "",
          time: "",
          range: "",
          ritual: false,
          concentration: false,
          material: false,
          description: "",
          attackType: "",
          saveAbility: "",
        },
      ],
    });

  const updatePrepared = (index, newSpell) => {
    if (!newSpell.prepared) {
      update({ preparedSpellsList: prepared.filter((_, i) => i !== index), spellsList: [...known, newSpell] });
    } else {
      update({ preparedSpellsList: prepared.map((s, i) => (i === index ? newSpell : s)) });
    }
  };
  const deletePrepared = (index) =>
    update({ preparedSpellsList: prepared.filter((_, i) => i !== index) });

  const updateKnown = (index, newSpell) => {
    if (newSpell.prepared) {
      update({ spellsList: known.filter((_, i) => i !== index), preparedSpellsList: [...prepared, newSpell] });
    } else {
      update({ spellsList: known.map((s, i) => (i === index ? newSpell : s)) });
    }
  };
  const deleteKnown = (index) =>
    update({ spellsList: known.filter((_, i) => i !== index) });
  const addKnown = () =>
    update({
      spellsList: [
        ...known,
        {
          level: 1,
          name: "",
          time: "",
          range: "",
          ritual: false,
          concentration: false,
          material: false,
          description: "",
          attackType: "",
          saveAbility: "",
        },
      ],
    });

  const abilityName = { int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma' }[character.spellAbility || 'int'];
  const pb = parseInt(character.profBonus) || 2;
  const spellInfos = {
    dc:  {
      label: 'Spell Save DC',
      formula: `8 + Proficiency Bonus + ${abilityName} Modifier`,
      calc: `8 + ${pb} + ${formatMod(spellMod)} = ${spellDC}`,
      usedFor: 'The DC enemies must beat when making saving throws against your spells (e.g. Fireball, Hold Person, Hypnotic Pattern). Higher means harder to resist.',
    },
    mod: {
      label: 'Spell Modifier',
      formula: `${abilityName} Modifier`,
      calc: `${formatMod(spellMod)}`,
      usedFor: 'Added to spell damage rolls for certain spells (e.g. Shillelagh), and used to calculate Spell Save DC and Spell Attack Bonus.',
    },
    atk: {
      label: 'Spell Attack Bonus',
      formula: `Proficiency Bonus + ${abilityName} Modifier`,
      calc: `${pb} + ${formatMod(spellMod)} = ${formatMod(spellAtk)}`,
      usedFor: 'Added to attack rolls for spells that require a spell attack (e.g. Fire Bolt, Scorching Ray, Eldritch Blast). Compare against the target\'s AC.',
    },
  };

  const InfoBtn = ({ id }) => (
    <span
      className="skill-info-btn"
      style={{ width: 14, height: 14, fontSize: '0.6rem', cursor: 'pointer', marginLeft: 4, verticalAlign: 'middle' }}
      onClick={() => setSpellInfoModal(id)}
      title="How is this calculated?"
    >?</span>
  );

  return (
    <div>
      {/* Spell stat info modal */}
      {spellInfoModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}
          onClick={() => setSpellInfoModal(null)}>
          <div style={{ background: 'var(--parchment)', border: '2px solid var(--gold)', borderRadius: 10, padding: '24px 28px', maxWidth: 380, width: '90vw', position: 'relative', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}
            onClick={e => e.stopPropagation()}>
            <button className="close-modal-btn" onClick={() => setSpellInfoModal(null)} style={{ position: 'absolute', top: 10, right: 12 }}>&times;</button>
            <h3 style={{ fontFamily: 'Cinzel, serif', color: 'var(--red-dark)', marginBottom: 16, fontSize: '1.1rem' }}>{spellInfos[spellInfoModal].label}</h3>
            <div style={{ marginBottom: 12 }}>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.7rem', color: 'var(--ink-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Formula</div>
              <div style={{ fontFamily: 'Crimson Text, serif', fontSize: '1rem', color: 'var(--ink)' }}>{spellInfos[spellInfoModal].formula}</div>
            </div>
            <div style={{ marginBottom: 12, background: 'white', border: '1px solid var(--gold)', borderRadius: 6, padding: '8px 12px', fontFamily: 'Cinzel, serif', fontWeight: 700, fontSize: '1.1rem', textAlign: 'center', color: 'var(--ink)' }}>
              {spellInfos[spellInfoModal].calc}
            </div>
            <div>
              <div style={{ fontFamily: 'Cinzel, serif', fontSize: '0.7rem', color: 'var(--ink-light)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Used For</div>
              <div style={{ fontFamily: 'Crimson Text, serif', fontSize: '1rem', color: 'var(--ink)', lineHeight: 1.5 }}>{spellInfos[spellInfoModal].usedFor}</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-2" style={{ marginBottom: 16 }}>
        <div className="field">
          <label className="field-label">Spellcasting Ability</label>
          <select value={character.spellAbility || "int"} onChange={(e) => update({ spellAbility: e.target.value })}>
            <option value="int">Intelligence</option>
            <option value="wis">Wisdom</option>
            <option value="cha">Charisma</option>
          </select>
        </div>
        <div className="field">
          <label className="field-label">Spell Save DC <InfoBtn id="dc" /></label>
          <input type="text" value={spellDC} readOnly />
        </div>
        <div className="field">
          <label className="field-label">Spell Modifier <InfoBtn id="mod" /></label>
          <input type="text" value={formatMod(spellMod)} readOnly />
        </div>
        <div className="field">
          <label className="field-label">Spell Attack Bonus <InfoBtn id="atk" /></label>
          <input type="text" value={formatMod(spellAtk)} readOnly />
        </div>
      </div>

      <div className="tab-columns">
        <div className="sheet-section-col">
          <h3 className="section-title">Spell Slots</h3>
          {spellSlots.map((slot, i) => (
            <SpellSlot
              key={i}
              slot={slot}
              index={i}
              onUpdate={(s) => updateSlots(i, s)}
              onDelete={deleteSlot}
            />
          ))}
          <button className="add-feature-btn" onClick={addSlotLevel}>
            + Add Spell Level
          </button>
        </div>

        <div className="sheet-section-col">
          <h3 className="section-title">Cantrips (Level 0)</h3>
          <SpellListHeader showPrepared={false} />
          {cantrips.map((spell, i) => (
            <SpellRow
              key={i}
              spell={spell}
              index={i}
              showPrepared={false}
              onUpdate={(s) => updateCantrip(i, s)}
              onDelete={deleteCantrip}
              dc={spellDC}
              atk={spellAtk}
              onCast={(s) => setCastSpellTarget(s)}
            />
          ))}
          <div style={{ display: "flex", gap: 8 }}>
            <button className="add-feature-btn" onClick={addCantrip}>
              + Add Custom
            </button>
            {dataLoaded && (
              <button
                className="add-feature-btn"
                onClick={() => setCantripSearch(true)}
              >
                + Search DB
              </button>
            )}
          </div>
        </div>

        <div className="sheet-section-col">
          <h3 className="section-title" style={{ marginTop: 24 }}>
            Prepared Spells
          </h3>
          <SpellListHeader showPrepared={true} />
          <div
            className="spell-list-container"
            style={{
              minHeight: 40,
              border: "1px dashed var(--gold)",
              borderRadius: 4,
              padding: 4,
            }}
          >
            {prepared.map((spell, i) => (
              <SpellRow
                key={i}
                spell={spell}
                index={i}
                showPrepared={true}
                onUpdate={(s) => updatePrepared(i, s)}
                onDelete={deletePrepared}
                dc={spellDC}
                atk={spellAtk}
                onCast={(s) => setCastSpellTarget(s)}
              />
            ))}
          </div>
        </div>

        <div className="sheet-section-col">
          <h3 className="section-title" style={{ marginTop: 24 }}>
            Known Spells
          </h3>
          <SpellListHeader showPrepared={true} />
          {known.map((spell, i) => (
            <SpellRow
              key={i}
              spell={spell}
              index={i}
              showPrepared={true}
              onUpdate={(s) => updateKnown(i, s)}
              onDelete={deleteKnown}
              dc={spellDC}
              atk={spellAtk}
              onCast={(s) => setCastSpellTarget(s)}
            />
          ))}
          <div style={{ display: "flex", gap: 8 }}>
            <button className="add-feature-btn" onClick={addKnown}>
              + Add Custom
            </button>
            {dataLoaded && (
              <button
                className="add-feature-btn"
                onClick={() => setKnownSearch(true)}
              >
                + Search DB
              </button>
            )}
          </div>
        </div>
      </div>

      {cantripSearch && (
        <SpellSearchModal
          isCantrip={true}
          onSelect={addCantripFromDB}
          onClose={() => setCantripSearch(false)}
        />
      )}
      {knownSearch && (
        <SpellSearchModal
          isCantrip={false}
          onSelect={addKnownFromDB}
          onClose={() => setKnownSearch(false)}
        />
      )}
      {castSpellTarget && (
        <CastSpellModal
          spell={castSpellTarget}
          char={character}
          update={update}
          onClose={() => setCastSpellTarget(null)}
          initiativeList={initiativeList}
          socket={socket}
          roomId={roomId}
          myName={myName}
        />
      )}
    </div>
  );
}

export function CastSpellModal({ spell, char, update, onClose, initiativeList = [], socket = null, roomId = null, myName = "" }) {
  const slots = char.spellSlotsData || [];
  const availableSlots = slots.filter(s => s.level >= spell.level && s.total > 0);
  const defaultLevel = availableSlots.find(s => (s.used || 0) < s.total)?.level || spell.level;
  const [selectedLevel, setSelectedLevel] = useState(spell.level > 0 ? defaultLevel : 0);
  const [selectedTargets, setSelectedTargets] = useState([]);
  const [step, setStep] = useState(1);
  const [attackRoll, setAttackRoll] = useState("");
  const [damageRoll, setDamageRoll] = useState("");
  const isAttack = !!spell.attackType;

  useEffect(() => {
    window.__modalCount = (window.__modalCount || 0) + 1;
    document.body.classList.add('modal-open');
    return () => {
      window.__modalCount = Math.max(0, (window.__modalCount || 0) - 1);
      if (window.__modalCount === 0) document.body.classList.remove('modal-open');
    };
  }, []);

  let higherLevelText = null;
  if (spell.description) {
     const match = spell.description.match(/(?:<b>|\*\*|<strong>)?At Higher Levels[.:]?(?:<\/b>|\*\*|<\/strong>)?(?:\s*|<br\s*\/?>)*(.*)/is);
     if (match && match[1]) {
         higherLevelText = match[1].trim();
     }
  }

  const toggleTarget = (id) => {
    setSelectedTargets(prev => 
      prev.includes(id) ? prev.filter(n => n !== id) : [...prev, id]
    );
  };

  const handleCast = () => {
    const updates = {};
    if (spell.level > 0 && selectedLevel > 0) {
      const updatedSlots = slots.map(s => {
        if (s.level === parseInt(selectedLevel)) {
          return { ...s, used: Math.min(s.total, (s.used || 0) + 1) };
        }
        return s;
      });
      updates.spellSlotsData = updatedSlots;
    }
    if (spell.concentration) updates.concentrationSpell = spell.name;
    
    if (Object.keys(updates).length > 0) update(updates);

    if (socket && roomId && myName) {
      const targetNames = selectedTargets.map(id => initiativeList.find(i => i.id === id)?.name).filter(Boolean);
      const targetStr = targetNames.length > 0 ? ` on ${targetNames.join(", ")}` : "";
      let rollStr = "";
      if (isAttack) {
        if (attackRoll) rollStr += ` [Atk: ${attackRoll}]`;
        if (damageRoll) rollStr += ` [Dmg: ${damageRoll}]`;
      }
      const lvlStr = spell.level > 0 ? ` at Level ${selectedLevel}` : ``;
      const text = `${myName} cast ${spell.name}${lvlStr}${targetStr}!${rollStr}`;
      socket.emit("send_action", {
        room: roomId,
        action: "chat",
        sender: "System",
        text: text,
        timestamp: new Date().toLocaleTimeString()
      });
    }

    onClose();
  };

  return (
    <ModalOverlay onClick={(e) => { if (e.target === e.currentTarget) onClose(); }} style={{ zIndex: 1200 }}>
      <ModalBox onClick={e => e.stopPropagation()} $maxWidth="320px">
        <CloseBtn onClick={onClose}>&times;</CloseBtn>
        <ModalTitle>Cast {spell.name}</ModalTitle>
        {step === 1 && (
          <>
            {spell.level > 0 ? (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--ink)' }}>Cast at Level:</label>
                <div style={{ position: "relative" }}>
                  <select className="styled-select" style={{ width: '100%', fontSize: '1rem', padding: '8px', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none' }} value={selectedLevel} onChange={e => setSelectedLevel(parseInt(e.target.value))}>
                    {availableSlots.map(s => {
                      const isUpcast = s.level > spell.level;
                      const bonusStr = (isUpcast && higherLevelText) ? " ✨" : "";
                      return (
                        <option key={s.level} value={s.level} disabled={(s.used || 0) >= s.total}>
                          Level {s.level} {isUpcast ? `(Upcast${bonusStr})` : `(Base)`} — {s.total - (s.used || 0)}/{s.total} slots left
                        </option>
                      );
                    })}
                  </select>
                  {availableSlots.length > 1 && (
                    <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none", color: "var(--ink)", fontSize: "0.8rem" }}>
                      ▼
                    </div>
                  )}
                </div>
            {selectedLevel > spell.level && higherLevelText && (
              <div style={{ marginTop: 8, padding: '8px 10px', background: 'rgba(212,165,116,0.15)', border: '1px dashed var(--gold)', borderRadius: 4, fontSize: '0.85rem', color: 'var(--ink)' }}>
                 <strong style={{ color: 'var(--red-dark)' }}>Upcast Bonus:</strong> <span dangerouslySetInnerHTML={{ __html: higherLevelText }} />
              </div>
            )}
                {availableSlots.every(s => (s.used || 0) >= s.total) && (
                  <div style={{ color: 'var(--red)', fontSize: '0.85rem', marginTop: 6, fontWeight: 'bold' }}>No spell slots available for this level!</div>
                )}
              </div>
            ) : (
              <p style={{ fontSize: '0.95rem', marginBottom: 16, color: 'var(--ink)' }}>Cast this cantrip?</p>
            )}
            
            {initiativeList && initiativeList.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', marginBottom: 8, fontSize: '0.9rem', color: 'var(--ink)' }}>Targets (Optional):</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', maxHeight: '160px', overflowY: 'auto', padding: '4px' }}>
                  {initiativeList.map(item => {
                    const isSelected = selectedTargets.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => toggleTarget(item.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          padding: '6px 12px',
                          background: isSelected ? 'var(--red)' : 'rgba(255,255,255,0.6)',
                          color: isSelected ? '#fff' : 'var(--ink)',
                          border: `1px solid ${isSelected ? 'var(--red-dark)' : 'var(--gold)'}`,
                          borderRadius: '16px',
                          fontSize: '0.85rem',
                          fontWeight: isSelected ? 'bold' : 'normal',
                          cursor: 'pointer',
                          userSelect: 'none',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                        }}
                      >
                        {item.name}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {spell.concentration && (
              <p style={{ fontSize: '0.85rem', color: 'var(--red-dark)', fontStyle: 'italic', marginBottom: 16 }}>
                Requires Concentration. This will end any active concentration.
              </p>
            )}
            
            {isAttack ? (
              <button className="btn btn-primary" style={{ width: '100%', padding: '10px' }} onClick={() => setStep(2)} disabled={spell.level > 0 && availableSlots.every(s => (s.used || 0) >= s.total)}>
                Next
              </button>
            ) : (
              <button className="btn btn-primary" style={{ width: '100%', padding: '10px' }} onClick={handleCast} disabled={spell.level > 0 && availableSlots.every(s => (s.used || 0) >= s.total)}>
                Confirm Cast
              </button>
            )}
          </>
        )}

        {step === 2 && (
          <>
            <div style={{ marginBottom: 12 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: '0.9rem', color: 'var(--ink)' }}>Attack Roll (Total):</label>
              <input type="number" style={{ width: '100%', padding: '8px', fontSize: '1rem', border: '1px solid var(--gold)', borderRadius: 4 }} value={attackRoll} onChange={e => setAttackRoll(e.target.value)} autoFocus />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', marginBottom: 4, fontSize: '0.9rem', color: 'var(--ink)' }}>Damage Roll (Total):</label>
              <input type="number" style={{ width: '100%', padding: '8px', fontSize: '1rem', border: '1px solid var(--gold)', borderRadius: 4 }} value={damageRoll} onChange={e => setDamageRoll(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-secondary" style={{ flex: 1, padding: '10px' }} onClick={() => setStep(1)}>
                Back
              </button>
              <button className="btn btn-primary" style={{ flex: 1, padding: '10px' }} onClick={handleCast}>
                Confirm Cast
              </button>
            </div>
          </>
        )}
      </ModalBox>
    </ModalOverlay>
  );
}
