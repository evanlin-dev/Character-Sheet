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

function SpellRow({ spell, index, showPrepared, onUpdate, onDelete, dc, atk }) {
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

  return (
    <div
      className="spell-row"
      style={{
        display: "grid",
        gridTemplateColumns:
          "20px 20px 40px 1fr 80px 80px 20px 20px 20px 40px 24px",
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
        {atkType && <span className="spell-roll-tag spell-roll-atk">Hit {formatMod(atk)}</span>}
        {!atkType && saveAb && <span className="spell-roll-tag spell-roll-save">{saveAb.toUpperCase().substring(0,3)} {dc}</span>}
        {dmg && <span className="spell-roll-tag" style={{ background: 'color-mix(in srgb, var(--red) 10%, var(--parchment))', color: 'var(--red-dark)', borderColor: 'color-mix(in srgb, var(--red) 30%, var(--gold))' }}>{dmg}</span>}
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
          "20px 20px 40px 1fr 80px 80px 20px 20px 20px 40px 24px",
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

export default function SpellsTab() {
  const { character, update } = useCharacter();
  const spellSlots = character.spellSlotsData || [];
  const cantrips = character.cantripsList || [];
  const prepared = character.preparedSpellsList || [];
  const known = character.spellsList || [];

  const [cantripSearch, setCantripSearch] = useState(false);
  const [knownSearch, setKnownSearch] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  useEffect(() => {
    checkDataLoaded().then(setDataLoaded);
  }, []);

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

  return (
    <div>
      <div className="grid grid-2" style={{ marginBottom: 16 }}>
        <div className="field">
          <label className="field-label">Spellcasting Ability</label>
          <select
            value={character.spellAbility || "int"}
            onChange={(e) => update({ spellAbility: e.target.value })}
          >
            <option value="int">Intelligence</option>
            <option value="wis">Wisdom</option>
            <option value="cha">Charisma</option>
          </select>
        </div>
        <div className="field">
          <label className="field-label">Spell Save DC</label>
          <input type="text" value={spellDC} readOnly />
        </div>
        <div className="field">
          <label className="field-label">Spell Modifier</label>
          <input type="text" value={formatMod(spellMod)} readOnly />
        </div>
        <div className="field">
          <label className="field-label">Spell Attack Bonus</label>
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
    </div>
  );
}
