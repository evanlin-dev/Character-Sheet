import { useState, useRef, useCallback, useMemo } from "react";
import styled from "styled-components";
import { useCharacter } from "src/context/CharacterContext";
import {
  calcMod,
  formatMod,
  getSkillTotal,
  getSaveTotal,
  getSpellDC,
  getSpellAttackBonus,
  getWeightCapacity,
  getTotalWeight,
} from "src/utils/calculations";
import {
  skillsMap,
  masteryDescriptions,
  weaponPropertyDescriptions,
} from "src/data/constants";
import { ModalOverlay, ModalBox, ModalTitle, CloseBtn, Row, CinzelHeading } from "src/styles/shared";
import { SpellSearchModal } from "src/components/tabs/SpellsTab";
import { EncumbranceChartModal, ItemSearchModal } from "src/components/tabs/EquipmentTab";
import { AutoSpellItem } from "src/components/ActionEconomy";

// ─── Local styled primitives ──────────────────────────────────────────────────

/** Ability score card */
const StatCard = styled.div`
  text-align: center;
  border: 1px solid var(--gold);
  border-radius: 6px;
  padding: 6px 4px;
  background: rgba(255, 255, 255, 0.5);
`;

const StatName = styled.div`
  font-size: 0.65rem;
  font-family: "Cinzel", serif;
  color: var(--red-dark);
`;

const StatValueInput = styled.input.attrs({ type: "number" })`
  width: 100%;
  text-align: center;
  background: none;
  border: none;
  font-weight: 700;
  font-size: 1.2rem;
  color: var(--ink);
  -moz-appearance: textfield;
  appearance: textfield;
  &::-webkit-outer-spin-button,
  &::-webkit-inner-spin-button { -webkit-appearance: none; margin: 0; }
`;

const ModInput = styled.input.attrs({ readOnly: true })`
  width: 100%;
  text-align: center;
  background: rgba(0, 0, 0, 0.05);
  border: 1px solid var(--gold);
  border-radius: 4px;
  font-size: 0.85rem;
  padding: 2px 0;
  color: var(--ink);
`;

/** Proficiency/toggle micro-button base */
const MicroBtn = styled.button`
  flex-shrink: 0;
  cursor: pointer;
  padding: 0;
  font-size: 0.6rem;
  font-family: "Cinzel", serif;
  font-weight: 700;
  background: ${({ $active }) => ($active ? "var(--red)" : "transparent")};
  border: 2px solid ${({ $active }) => ($active ? "var(--red)" : "var(--gold)")};
  color: ${({ $active }) => ($active ? "#fff" : "var(--ink-light)")};
`;

const ProfBtn = styled(MicroBtn)`
  width: ${({ $sm }) => ($sm ? "16px" : "18px")};
  height: ${({ $sm }) => ($sm ? "16px" : "18px")};
  border-radius: 50%;
`;

const ExpBtn = styled(MicroBtn)`
  width: ${({ $sm }) => ($sm ? "16px" : "18px")};
  height: ${({ $sm }) => ($sm ? "16px" : "18px")};
  border-radius: ${({ $sm }) => ($sm ? "2px" : "3px")};
  background: ${({ $active }) => ($active ? "var(--red-dark)" : "transparent")};
  border-color: ${({ $active }) => ($active ? "var(--red-dark)" : "var(--gold)")};
`;

const AdvBtn = styled.button`
  flex-shrink: 0;
  cursor: pointer;
  font-size: ${({ $sm }) => ($sm ? "0.6rem" : "0.65rem")};
  font-family: "Cinzel", serif;
  font-weight: 700;
  padding: 1px ${({ $sm }) => ($sm ? "3px" : "5px")};
  border-radius: ${({ $sm }) => ($sm ? "2px" : "3px")};
  border: 1px solid ${({ $active }) => ($active ? "var(--red)" : "var(--gold)")};
  background: ${({ $active }) => ($active ? "var(--red)" : "transparent")};
  color: ${({ $active }) => ($active ? "#fff" : "var(--ink-light)")};
`;

/** Row with a subtle bottom border for saves/skills */
const ListRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ $gap }) => $gap ?? "6px"};
  padding: ${({ $padding }) => $padding ?? "4px 6px"};
  border-bottom: 1px solid rgba(201, 173, 106, 0.3);
`;

const ModValue = styled.span`
  font-weight: 700;
  min-width: ${({ $minW }) => $minW ?? "28px"};
  text-align: right;
  font-size: ${({ $size }) => $size ?? "0.9rem"};
`;

/** Generic item card (actions, features, etc.) */
const ItemCard = styled.div`
  background: rgba(255, 255, 255, 0.5);
  border: 1px solid var(--gold);
  border-radius: 4px;
  padding: 8px 12px;
  margin-bottom: 6px;
`;

const ItemTitle = styled.strong`
  font-family: "Cinzel", serif;
  font-size: 0.9rem;
  color: var(--red-dark);
`;

const ItemDesc = styled.div`
  margin-top: 4px;
  font-size: 0.85rem;
  color: var(--ink);
  line-height: 1.4;
`;

const VIEWS = [
  { id: "stats", label: "Ability Scores & Skills" },
  { id: "actions", label: "Actions" },
  { id: "inventory", label: "Inventory" },
  { id: "spells", label: "Spells" },
  { id: "features", label: "Features & Traits" },
  { id: "defenses", label: "Speed & Defenses" },
  { id: "proficiencies", label: "Proficiencies" },
  { id: "notes", label: "Notes" },
  { id: "summons", label: "Summons & Creatures" },
];

const ABILITIES = ["str", "dex", "con", "int", "wis", "cha"];
const ABILITY_LABELS = {
  str: "STR",
  dex: "DEX",
  con: "CON",
  int: "INT",
  wis: "WIS",
  cha: "CHA",
};
const SAVE_LABELS = {
  str: "Strength",
  dex: "Dexterity",
  con: "Constitution",
  int: "Intelligence",
  wis: "Wisdom",
  cha: "Charisma",
};
const SKILL_LABELS = {
  athletics: "Athletics",
  acrobatics: "Acrobatics",
  sleight_of_hand: "Sleight of Hand",
  stealth: "Stealth",
  arcana: "Arcana",
  history: "History",
  investigation: "Investigation",
  nature: "Nature",
  religion: "Religion",
  animal_handling: "Animal Handling",
  insight: "Insight",
  medicine: "Medicine",
  perception: "Perception",
  survival: "Survival",
  deception: "Deception",
  intimidation: "Intimidation",
  performance: "Performance",
  persuasion: "Persuasion",
};

function HpModal({ char, update, onClose }) {
  const [amount, setAmount] = useState("");

  const applyChange = (type) => {
    const val = parseInt(amount);
    if (isNaN(val) || val < 0) return;
    let cur = parseInt(char.hp) || 0;
    let max = parseInt(char.maxHp) || 1;
    let temp = parseInt(char.tempHp) || 0;
    if (type === "heal") {
      cur = Math.min(cur + val, max);
      update({ hp: cur });
    } else if (type === "damage") {
      let dmg = val;
      if (temp > 0) {
        const absorbed = Math.min(temp, dmg);
        temp -= absorbed;
        dmg -= absorbed;
        update({ tempHp: temp });
      }
      cur = Math.max(cur - dmg, 0);
      update({ hp: cur });
    } else if (type === "temp") {
      update({ tempHp: val });
    }
    setAmount("");
  };

  return (
    <div
      className="info-modal-overlay"
      style={{
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "fixed",
        inset: 0,
        zIndex: 1100,
      }}
    >
      <div
        className="info-modal-content"
        style={{
          maxWidth: 350,
          textAlign: "center",
          background: "var(--parchment)",
          border: "2px solid var(--gold)",
          padding: 20,
          borderRadius: 6,
        }}
      >
        <button
          className="close-modal-btn"
          onClick={onClose}
          style={{ position: "absolute", top: 10, right: 10 }}
        >
          ×
        </button>
        <h3 style={{ fontFamily: "Cinzel, serif", color: "var(--red-dark)" }}>
          Manage HP
        </h3>
        <div
          style={{
            marginBottom: 10,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 10,
          }}
        >
          <span style={{ fontWeight: 700 }}>Max HP:</span>
          <input
            type="number"
            value={char.maxHp || ""}
            onChange={(e) => update({ maxHp: parseInt(e.target.value) || 0 })}
            style={{
              width: 80,
              textAlign: "center",
              border: "1px solid var(--gold)",
              borderRadius: 4,
              padding: 4,
              fontWeight: 700,
              fontSize: "1.2rem",
            }}
          />
        </div>
        <div style={{ marginBottom: 15 }}>
          <input
            type="number"
            placeholder="Amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && applyChange("damage")}
            style={{
              fontSize: "2rem",
              width: "100%",
              textAlign: "center",
              border: "2px solid var(--gold)",
              borderRadius: 8,
              padding: 10,
              fontWeight: 700,
              color: "var(--red-dark)",
            }}
          />
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <button
            className="btn"
            style={{
              background: "#8b0000",
              borderColor: "#500",
              color: "#fff",
            }}
            onClick={() => applyChange("damage")}
          >
            Damage
          </button>
          <button
            className="btn"
            style={{
              background: "#2d6a4f",
              borderColor: "#1b4332",
              color: "#fff",
            }}
            onClick={() => applyChange("heal")}
          >
            Heal
          </button>
        </div>
        <button
          className="btn"
          style={{ width: "100%" }}
          onClick={() => applyChange("temp")}
        >
          Set Temp HP
        </button>
      </div>
    </div>
  );
}

// ── Mobile Header ─────────────────────────────────────────────────────────────
export function MobileHeader({
  char,
  update,
  onOpenHp,
  onShortRest,
  onLongRest,
  onMoreInfo,
  onOpenCondition,
}) {
  const hp = parseInt(char.hp) || 0;
  const temp = parseInt(char.tempHp) || 0;
  const dexMod = calcMod(parseInt(char.dex) || 10);
  const initiative =
    char.initiative !== undefined ? char.initiative : formatMod(dexMod);
  const concentration = char.concentrationSpell || "";

  const toggleDeathSave = (type, idx) => {
    const subKey = type === "success" ? "successes" : "failures";
    const saves = {
      ...(char.deathSaves || {
        successes: [false, false, false],
        failures: [false, false, false],
      }),
    };
    const arr = [...(saves[subKey] || [false, false, false])];
    arr[idx] = !arr[idx];
    update({ deathSaves: { ...saves, [subKey]: arr } });
  };

  return (
    <div 
      id="mobile-sync-header"
      style={{ 
        display: "flex", 
        flexDirection: "column", 
        flexShrink: 0, 
        gap: 10, 
        background: "var(--parchment-dark)", 
        border: "2px solid var(--gold)", 
        borderRadius: 8, 
        padding: 12, 
        margin: "16px 16px 16px 16px", 
        boxShadow: "0 4px 12px var(--shadow)" 
      }}
    >
      <input
        type="text"
        className="mh-name"
        placeholder="Character Name"
        value={char.charName || ""}
        onChange={(e) => update({ charName: e.target.value })}
      />
      <div className="mh-class-info">
        <input
          type="text"
          placeholder="Race"
          value={char.race || ""}
          onChange={(e) => update({ race: e.target.value })}
        />
        <input
          type="text"
          placeholder="Class"
          value={char.charClass || ""}
          onChange={(e) => update({ charClass: e.target.value })}
        />
        <input
          type="text"
          placeholder="Subclass"
          value={char.charSubclass || ""}
          onChange={(e) => update({ charSubclass: e.target.value })}
        />
        <span>Lvl</span>
        <input
          type="number"
          id="mh-level"
          placeholder="1"
          value={char.level || ""}
          onChange={(e) => update({ level: parseInt(e.target.value) || 1 })}
        />
        {onMoreInfo && (
          <button
            className="mh-more-btn"
            onClick={onMoreInfo}
            title="More info"
          >
            ⋮
          </button>
        )}
      </div>
      <div className="mh-stats-row" style={{ marginBottom: 8 }}>
        <div className="mh-ac-box">
          <span className="mh-label">AC</span>
          <input
            type="number"
            value={char.baseAC || ""}
            onChange={(e) => update({ baseAC: parseInt(e.target.value) || 0 })}
          />
        </div>
        <div className="mh-init-box">
          <span className="mh-label">Init</span>
          <input
            type="text"
            value={initiative}
            onChange={(e) => update({ initiative: e.target.value })}
          />
        </div>
        <div className="mh-heroic">
          <input
            type="checkbox"
            id="mh-heroicInspiration"
            checked={!!char.heroicInspiration}
            onChange={(e) => update({ heroicInspiration: e.target.checked })}
          />
          <label htmlFor="mh-heroicInspiration">Insp.</label>
        </div>
      </div>
      <div className="mh-stats-row">
        {hp > 0 ? (
          <div
            className="mh-hp-box"
            onClick={onOpenHp}
            style={{ cursor: "pointer" }}
          >
            <span className="mh-label">HP</span>
            <div style={{ pointerEvents: "none" }}>
              {hp}
              {temp > 0 && (
                <span style={{ color: "#2d6a4f", fontSize: "0.9rem" }}>
                  {" "}
                  (+{temp})
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="mh-death-saves-box" style={{ display: "flex" }}>
            <div className="mh-ds-tracker">
              <span style={{ color: "var(--ink)" }}>S</span>
              {[0, 1, 2].map((i) => (
                <input
                  key={i}
                  type="checkbox"
                  checked={!!(char.deathSaves?.successes || [])[i]}
                  onChange={() => toggleDeathSave("success", i)}
                />
              ))}
            </div>
            <div className="mh-ds-tracker">
              <span style={{ color: "var(--red)" }}>F</span>
              {[0, 1, 2].map((i) => (
                <input
                  key={i}
                  type="checkbox"
                  checked={!!(char.deathSaves?.failures || [])[i]}
                  onChange={() => toggleDeathSave("failure", i)}
                />
              ))}
            </div>
          </div>
        )}
        <div
          className="mh-conditions-box"
          id="mh-cond-wrapper"
          style={{ flex: 1 }}
          onClick={onOpenCondition}
        >
          <input
            type="text"
            placeholder="Conditions"
            value={
              Array.isArray(char.activeConditions)
                ? char.activeConditions.join(", ")
                : char.activeConditions || ""
            }
            readOnly
            style={{ pointerEvents: "none" }}
          />
        </div>
      </div>
      <Row $gap="6px" style={{ marginTop: 6 }}>
        <button className="rest-btn rest-btn-sr" style={{ flex: 1, padding: "6px 4px" }} onClick={onShortRest}>Short Rest ▸</button>
        <button className="rest-btn rest-btn-lr" style={{ flex: 1, padding: "6px 4px" }} onClick={onLongRest}>Long Rest ▸</button>
      </Row>
      {concentration && (
        <div
          className="mh-conc-banner"
          style={{ display: "flex", cursor: "pointer" }}
          onClick={() => update({ concentrationSpell: "" })}
        >
          <span className="mh-conc-icon">◉</span>
          <span className="mh-conc-label">Concentrating:</span>
          <span className="mh-conc-name">{concentration}</span>
          <span className="mh-conc-drop">✕</span>
        </div>
      )}
    </div>
  );
}

// ── Scores View ───────────────────────────────────────────────────────────────
function ScoresView({ char, update }) {
  return (
    <div className="app-view-content">
      <h2 className="section-title">Ability Scores</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 6, marginBottom: 16 }}>
        {ABILITIES.map((ab) => {
          const score = parseInt(char[ab]) || 10;
          const mod = calcMod(score);
          return (
            <StatCard key={ab}>
              <StatName>{ABILITY_LABELS[ab]}</StatName>
              <StatValueInput
                value={char[ab] !== undefined ? char[ab] : 10}
                onChange={(e) => update({ [ab]: e.target.value.replace(/^0+(?=\d)/, "") })}
              />
              <ModInput value={formatMod(mod)} />
            </StatCard>
          );
        })}
      </div>
    </div>
  );
}

// ── Saves & Skills View ────────────────────────────────────────────────────────
function SavesSkillsView({ char, update }) {
  const toggleSaveProf = (ab) => {
    const isProf = char.saveProficiency?.[ab] || false;
    if (!isProf) {
      update({
        saveProficiency: { ...(char.saveProficiency || {}), [ab]: true },
      });
    } else {
      update({
        saveProficiency: { ...(char.saveProficiency || {}), [ab]: false },
        saveExpertise: { ...(char.saveExpertise || {}), [ab]: false },
      });
    }
  };

  const toggleSaveExp = (ab) => {
    const isExp = char.saveExpertise?.[ab] || false;
    update({ saveExpertise: { ...(char.saveExpertise || {}), [ab]: !isExp } });
  };

  const toggleSaveAdv = (ab) => {
    const cur = char.saveAdvantage?.[ab] || false;
    update({ saveAdvantage: { ...(char.saveAdvantage || {}), [ab]: !cur } });
  };

  const toggleSkillProf = (skill) => {
    const isProf = char.skillProficiency?.[skill] || false;
    if (!isProf) {
      update({
        skillProficiency: { ...(char.skillProficiency || {}), [skill]: true },
      });
    } else {
      update({
        skillProficiency: { ...(char.skillProficiency || {}), [skill]: false },
        skillExpertise: { ...(char.skillExpertise || {}), [skill]: false },
      });
    }
  };

  const toggleSkillExp = (skill) => {
    const isExp = char.skillExpertise?.[skill] || false;
    update({
      skillExpertise: { ...(char.skillExpertise || {}), [skill]: !isExp },
    });
  };

  const toggleSkillAdv = (skill) => {
    const cur = char.skillAdvantage?.[skill] || false;
    update({
      skillAdvantage: { ...(char.skillAdvantage || {}), [skill]: !cur },
    });
  };

  return (
    <div className="app-view-content">
      <h2 className="section-title">Saving Throws</h2>
      <div style={{ marginBottom: 16 }}>
        {ABILITIES.map((ab) => {
          const total = getSaveTotal(char, ab);
          const isProf = char.saveProficiency?.[ab] || false;
          const isExp = char.saveExpertise?.[ab] || false;
          const hasAdv = char.saveAdvantage?.[ab] || false;
          return (
            <ListRow key={ab}>
              <ProfBtn $active={isProf} onClick={() => toggleSaveProf(ab)} />
              {isProf && <ExpBtn $active={isExp} onClick={() => toggleSaveExp(ab)}>E</ExpBtn>}
              <span style={{ flex: 1, fontSize: "0.9rem" }}>{SAVE_LABELS[ab]}</span>
              <AdvBtn $active={hasAdv} onClick={() => toggleSaveAdv(ab)}>Adv</AdvBtn>
              <ModValue>{formatMod(total)}</ModValue>
            </ListRow>
          );
        })}
      </div>

      <h2 className="section-title">Skills</h2>
      <div className="mobile-skills-grid">
        {Object.keys(skillsMap).sort().map((skill) => {
          const total = getSkillTotal(char, skill);
          const isProf = char.skillProficiency?.[skill] || false;
          const isExp = char.skillExpertise?.[skill] || false;
          const hasAdv = char.skillAdvantage?.[skill] || false;
          return (
            <ListRow key={skill} $gap="4px" $padding="3px 4px" style={{ breakInside: "avoid" }}>
              <ProfBtn $sm $active={isProf} onClick={() => toggleSkillProf(skill)} />
              {isProf && <ExpBtn $sm $active={isExp} onClick={() => toggleSkillExp(skill)}>E</ExpBtn>}
              <span style={{ flex: 1, fontSize: "0.75rem", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {SKILL_LABELS[skill] || skill}
                <span style={{ color: "var(--ink-light)", fontSize: "0.65rem" }}> ({ABILITY_LABELS[skillsMap[skill]]})</span>
              </span>
              <AdvBtn $sm $active={hasAdv} onClick={() => toggleSkillAdv(skill)}>A</AdvBtn>
              <ModValue $minW="24px" $size="0.8rem">{formatMod(total)}</ModValue>
            </ListRow>
          );
        })}
      </div>
    </div>
  );
}

function WeaponActionCard({ weapon }) {
  const [expanded, setExpanded] = useState(false);

  const notes = weapon.notes || '';

  // Parse mastery
  const masteryMatch = notes.match(/Mastery:\s*(\w+)/i);
  const masteryName = masteryMatch ? masteryMatch[1] : '';
  const masteryDesc = masteryName ? (masteryDescriptions[masteryName] || '') : '';
  
  // Parse properties
  const notesWithoutMastery = notes.replace(/,?\s*Mastery:\s*\w+/gi, '').trim().replace(/^,\s*/, '');
  const _propLookup = p => weaponPropertyDescriptions[p.toLowerCase().split('(')[0]];
  
  const propertyNames = notesWithoutMastery.split(/,\s*/).map(p => p.trim()).filter(Boolean);
  const matchedProperties = propertyNames.filter(p => _propLookup(p));
  const unmatchedNotes = propertyNames.filter(p => !_propLookup(p)).join(', ').trim();

  const hasDetail = masteryDesc || matchedProperties.length > 0 || unmatchedNotes;

  return (
    <div
      style={{
        background: "rgba(255, 255, 255, 0.5)",
        border: "1px solid var(--gold)",
        borderRadius: 4,
        marginBottom: 6,
        fontSize: '0.9rem',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr auto auto',
          gap: 8,
          alignItems: 'center',
          padding: '8px 12px',
          cursor: hasDetail ? 'pointer' : 'default',
        }}
        onClick={() => hasDetail && setExpanded(!expanded)}
      >
        <span style={{ fontWeight: 'bold', color: 'var(--red-dark)' }}>{weapon.name}</span>
        <span style={{ fontWeight: 'bold' }}>{weapon.atk}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>{weapon.damage}</span>
          {hasDetail && <span style={{ color: "var(--ink-light)", fontSize: "0.8rem", transform: expanded ? 'rotate(180deg)' : '' }}>▾</span>}
        </div>
      </div>
      {hasDetail && expanded && (
        <div style={{ borderTop: '1px solid rgba(201, 173, 106, 0.3)', padding: '8px 12px', fontSize: '0.85rem' }}>
          {unmatchedNotes && <div style={{ marginBottom: 8 }}>{unmatchedNotes}</div>}
          {masteryName && (
            <div style={{ marginBottom: 8 }}>
              <strong style={{ fontFamily: "'Cinzel', serif", color: 'var(--ink)' }}>{masteryName}:</strong> {masteryDesc}
            </div>
          )}
          {matchedProperties.map(p => (
            <div key={p} style={{ marginBottom: 8 }}>
              <strong style={{ fontFamily: "'Cinzel', serif", color: 'var(--ink)' }}>{p.split('(')[0]}:</strong> {_propLookup(p)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function WeaponActions({ char }) {
  const weapons = char.weapons || [];
  if (weapons.length === 0) return null;

  return (
    <div style={{ marginBottom: 16 }}>
      <h2 className="section-title">Weapon Attacks</h2>
      {weapons.map((w, i) => (
        <WeaponActionCard key={i} weapon={w} />
      ))}
    </div>
  );
}


// ── Actions View ──────────────────────────────────────────────────────────────
function ActionsView({ char }) {
  const dc = getSpellDC(char);
  const atkRaw = getSpellAttackBonus(char);
  const atkStr = formatMod(atkRaw);

  const renderList = (items, emptyMsg) => {
    const validItems = items?.filter(item => item.title) || [];
    if (validItems.length === 0)
      return <em style={{ color: "var(--ink-light)", fontSize: "0.9rem" }}>{emptyMsg}</em>;
    
    return validItems.map((item, i) => (
      <ItemCard key={i}>
        <ItemTitle>{item.title}</ItemTitle>
        {item.desc && (
          <ItemDesc dangerouslySetInnerHTML={{ __html: item.desc }} />
        )}
      </ItemCard>
    ));
  };

  const allSpells = [
    ...(char.preparedSpellsList || []),
    ...(char.cantripsList || []),
  ];

  const groups = { action: [], bonus: [], reaction: [], other: [] };

  allSpells.forEach((s) => {
    if (!s.name) return;
    const time = (s.time || "").toLowerCase();
    let cat = "other";
    if (time.includes("bonus")) cat = "bonus";
    else if (time.includes("reaction")) cat = "reaction";
    else if (time.includes("action")) cat = "action";

    let atkType = s.attackType || "";
    let saveAb = s.saveAbility || "";
    if (!atkType && !saveAb && s.description) {
        const descLower = s.description.toLowerCase();
        if (/\b(ranged|melee)\s+spell\s+attack/i.test(descLower)) atkType = "spell";
        else {
            const saveMatch = descLower.match(/\b(strength|dexterity|constitution|intelligence|wisdom|charisma)\s+saving throw/i);
            if (saveMatch) saveAb = { strength:'str', dexterity:'dex', constitution:'con', intelligence:'int', wisdom:'wis', charisma:'cha' }[saveMatch[1].toLowerCase()] || "";
        }
    }

    groups[cat].push({...s, attackType: atkType, saveAbility: saveAb, atkType: atkType, saveAb: saveAb});
  });

  const renderAutoSpells = (spells) => {
    if (!spells || spells.length === 0) return null;
    return (
      <div style={{ marginTop: 12 }}>
        {spells.map((s, i) => (
          <AutoSpellItem key={i} s={s} dc={dc} atkStr={atkStr} />
        ))}
      </div>
    );
  };

  return (
    <div className="app-view-content">
      <WeaponActions char={char} />

      <h2 className="section-title" style={{ marginTop: 16 }}>Actions</h2>
      {renderList(char.actions, "No actions added.")}
      {renderAutoSpells(groups.action)}

      <h2 className="section-title" style={{ marginTop: 16 }}>
        Bonus Actions
      </h2>
      {renderList(char.bonusActions, "No bonus actions added.")}
      {renderAutoSpells(groups.bonus)}

      <h2 className="section-title" style={{ marginTop: 16 }}>
        Reactions
      </h2>
      {renderList(char.reactions, "No reactions added.")}
      {renderAutoSpells(groups.reaction)}

      <h2 className="section-title" style={{ marginTop: 16 }}>
        Other (Rituals, Long Casts)
      </h2>
      {renderList(char.otherActions, "No other actions added.")}
      {renderAutoSpells(groups.other)}
    </div>
  );
}

// ── Inventory View ────────────────────────────────────────────────────────────
function InventoryView({ char, update }) {
  const { openModal } = useCharacter();
  const [chartOpen, setChartOpen] = useState(false);
  const [itemSearchOpen, setItemSearchOpen] = useState(false);
  const [searchTargetList, setSearchTargetList] = useState("inventory");
  const [draggedItem, setDraggedItem] = useState(null);

  const inventory = char.inventory || [];
  const componentPouch = char.componentPouch || [];

  const isSpellcaster = () => {
    const cls = (char.charClass || "").toLowerCase();
    const sub = (char.charSubclass || "").toLowerCase();
    const spellcastingClasses = [
      "artificer", "bard", "cleric", "druid", "paladin", "ranger", "sorcerer", "warlock", "wizard", "blood hunter",
    ];
    if (spellcastingClasses.some((c) => cls.includes(c))) return true;
    if (sub.includes("eldritch knight") || sub.includes("arcane trickster")) return true;
    if (char.spellSlotsData && char.spellSlotsData.length > 0) return true;
    return false;
  };
  
  const addItemFromSearch = (item) => {
    if (searchTargetList === "componentPouch") {
      update({
        componentPouch: [
          ...componentPouch,
          { name: item.name, qty: 1, weight: item.weight, equipped: false, description: item.description },
        ],
      });
    } else {
      update({
        inventory: [
          ...inventory,
          { name: item.name, qty: 1, weight: item.weight, equipped: false, description: item.description },
        ],
      });
    }
    setItemSearchOpen(false);
  };

  const updateItem = (listKey, idx, patch) => {
    const arr = [...(char[listKey] || [])];
    arr[idx] = { ...arr[idx], ...patch };
    update({ [listKey]: arr });
  };

  const removeItem = (listKey, idx) => {
    const arr = [...(char[listKey] || [])];
    arr.splice(idx, 1);
    update({ [listKey]: arr });
  };

  const handleDragStart = (e, listKey, idx) => {
    setDraggedItem({ listKey, idx, type: 'mouse' });
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", idx);
    }
  };

  const handleDragOver = (e, listKey, idx) => {
    e.preventDefault();
    if (draggedItem && (draggedItem.overIdx !== idx || draggedItem.overList !== listKey)) {
      setDraggedItem({ ...draggedItem, overIdx: idx, overList: listKey });
    }
  };

  const handleDrop = (e, targetListKey, targetIdx) => {
    e.preventDefault();
    if (!draggedItem) return;
    if (draggedItem.listKey === targetListKey && draggedItem.idx !== targetIdx) {
      const arr = [...(char[targetListKey] || [])];
      const [moved] = arr.splice(draggedItem.idx, 1);
      arr.splice(targetIdx, 0, moved);
      update({ [targetListKey]: arr });
    }
    setDraggedItem(null);
  };

  const handleTouchStart = (e, listKey, idx) => {
    setDraggedItem({ listKey, idx, type: 'touch' });
  };

  const handleTouchMove = (e) => {
    if (!draggedItem || draggedItem.type !== 'touch') return;
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropTarget = el?.closest('[data-drag-idx]');
    if (dropTarget) {
      const overIdx = parseInt(dropTarget.dataset.dragIdx);
      const overList = dropTarget.dataset.dragList;
      if (overIdx !== draggedItem.overIdx || overList !== draggedItem.overList) {
        setDraggedItem(prev => ({ ...prev, overIdx, overList }));
      }
    }
  };

  const handleTouchEnd = (e) => {
    if (draggedItem && draggedItem.type === 'touch') {
      if (draggedItem.overIdx !== undefined && draggedItem.overList === draggedItem.listKey && draggedItem.idx !== draggedItem.overIdx) {
        const arr = [...(char[draggedItem.listKey] || [])];
        const [moved] = arr.splice(draggedItem.idx, 1);
        arr.splice(draggedItem.overIdx, 0, moved);
        update({ [draggedItem.listKey]: arr });
      }
    }
    setDraggedItem(null);
  };

  const renderItemRow = (item, idx, listKey, showEquip = true) => {
    const isOver = draggedItem?.overIdx === idx && draggedItem?.overList === listKey;
    const isDragged = draggedItem?.idx === idx && draggedItem?.listKey === listKey;

    return (
      <div
        key={`${listKey}-${idx}`}
        data-drag-idx={idx}
        data-drag-list={listKey}
        draggable
        onDragStart={(e) => handleDragStart(e, listKey, idx)}
        onDragOver={(e) => handleDragOver(e, listKey, idx)}
        onDrop={(e) => handleDrop(e, listKey, idx)}
        style={{
          display: "grid",
          gridTemplateColumns: showEquip ? "18px 20px 1fr 32px 36px 20px" : "18px 1fr 32px 36px 20px",
          gap: 6,
          marginBottom: 6,
          alignItems: "center",
          opacity: isDragged ? 0.5 : 1,
          border: isOver ? '2px dashed var(--red)' : '1px solid var(--gold)',
          background: "white",
          padding: "4px 6px",
          borderRadius: 4,
        }}
      >
        <div
          style={{ cursor: "grab", fontSize: "1.1rem", color: "var(--ink-light)", userSelect: "none", touchAction: "none", textAlign: "center", lineHeight: 1 }}
          onTouchStart={(e) => handleTouchStart(e, listKey, idx)}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          ☰
        </div>
        {showEquip && (
          <input
            type="checkbox"
            checked={item.equipped || false}
            onChange={(e) => updateItem(listKey, idx, { equipped: e.target.checked })}
            style={{ width: 14, height: 14, margin: "0 auto", cursor: "pointer" }}
          />
        )}
        <input
          value={item.name || ""}
          onChange={(e) => updateItem(listKey, idx, { name: e.target.value })}
          placeholder="Item name"
          style={{
            border: "none",
            background: "transparent",
            fontSize: "0.85rem",
            fontWeight: 600,
            padding: "2px 0",
          }}
        />
        <input
          type="number"
          value={item.qty ?? 1}
          onChange={(e) => updateItem(listKey, idx, { qty: e.target.value.replace(/^0+(?=\d)/, "") })}
          style={{
            textAlign: "center",
            border: "1px solid var(--gold)",
            borderRadius: 3,
            fontSize: "0.8rem",
            padding: "2px 0",
          }}
          title="Qty"
        />
        <input
          type="number"
          value={item.weight ?? 0}
          onChange={(e) => updateItem(listKey, idx, { weight: e.target.value.replace(/^0+(?=\d)/, "") })}
          style={{
            textAlign: "center",
            border: "1px solid var(--gold)",
            borderRadius: 3,
            fontSize: "0.8rem",
            padding: "2px 0",
          }}
          title="Wt"
        />
        <button
          onClick={() => removeItem(listKey, idx)}
          style={{
            background: "none",
            border: "none",
            color: "var(--red)",
            cursor: "pointer",
            fontSize: "1.2rem",
            lineHeight: 1,
            padding: 0,
            textAlign: "center",
          }}
        >
          ×
        </button>
      </div>
    );
  };

  const allItemsForWeight = [...inventory];
  const totalWeight = getTotalWeight(inventory, []);
  const capacity = getWeightCapacity(char);
  const pct = Math.min(100, Math.round((totalWeight / capacity) * 100));
  const isEncumbered = totalWeight > capacity;

  const CURRENCY = [
    { key: "pp", label: "PP" },
    { key: "gp", label: "GP" },
    { key: "ep", label: "EP" },
    { key: "sp", label: "SP" },
    { key: "cp", label: "CP" },
  ];

  const equippedItems = inventory.map((item, i) => ({ item, i })).filter(x => x.item.equipped);
  const backpackItems = inventory.map((item, i) => ({ item, i })).filter(x => !x.item.equipped);

  return (
      <div className="app-view-content">
        {/* Currency */}
        <h2 className="section-title">Currency</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 6, marginBottom: 16 }}>
          {CURRENCY.map(({ key, label }) => (
            <StatCard key={key} style={{ padding: "6px 4px" }}>
              <StatName>{label}</StatName>
              <StatValueInput
                value={char[key] ?? 0}
                onChange={(e) => update({ [key]: parseInt(e.target.value) || 0 })}
              />
            </StatCard>
          ))}
        </div>

        {/* Currency Actions */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
          <button className="btn btn-secondary" style={{ flex: 1, padding: "6px 0", fontSize: "0.8rem" }} onClick={() => openModal("currency")}>Exchange</button>
          <button className="btn btn-secondary" style={{ flex: 1, padding: "6px 0", fontSize: "0.8rem" }} onClick={() => openModal("splitMoney")}>Split</button>
          <button className="btn btn-secondary" style={{ flex: 1, padding: "6px 0", fontSize: "0.8rem" }} onClick={() => openModal("manageMoney")}>Manage</button>
        </div>

        {/* Carry weight */}
        <div style={{ marginBottom: 16, padding: "8px 10px", background: "rgba(255,255,255,0.5)", border: "1px solid var(--gold)", borderRadius: 6 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8rem", marginBottom: 4 }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontFamily: "Cinzel, serif", fontWeight: 700, color: isEncumbered ? "var(--red)" : "var(--ink-light)" }}>
              Carry Weight
              <button 
                className="skill-info-btn" 
                style={{ position: 'relative', top: 'auto', left: 'auto', margin: 0, width: 16, height: 16, fontSize: '0.65rem' }} 
                onClick={() => setChartOpen(true)}
              >
                ?
              </button>
            </span>
            <span style={{ fontWeight: 700, color: isEncumbered ? "var(--red)" : "var(--ink)" }}>
              {totalWeight} / {capacity} lb
            </span>
          </div>
          <div style={{ background: "rgba(0,0,0,0.1)", borderRadius: 4, height: 6, overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: isEncumbered ? "var(--red)" : "var(--gold)", borderRadius: 4, transition: "width 0.3s" }} />
          </div>
          <div style={{ fontSize: "0.8rem", fontStyle: "italic", opacity: 0.8, marginTop: 6, textAlign: "right" }}>
            Max Drag/Lift: {capacity * 2} lbs
          </div>
        </div>

        {/* Equipped Section */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <h2 className="section-title" style={{ margin: 0 }}>Equipped</h2>
          </div>
          {equippedItems.length === 0 && <em style={{ color: "var(--ink-light)", fontSize: "0.85rem" }}>None.</em>}
          {equippedItems.map(x => renderItemRow(x.item, x.i, "inventory", true))}
        </div>

        {/* Backpack Section */}
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <h2 className="section-title" style={{ margin: 0 }}>Backpack</h2>
            <button className="btn" style={{ padding: "2px 10px", fontSize: "0.75rem" }} onClick={() => { setSearchTargetList("inventory"); setItemSearchOpen(true); }}>
              Search Item
            </button>
          </div>
          {backpackItems.length === 0 && <em style={{ color: "var(--ink-light)", fontSize: "0.85rem" }}>Empty.</em>}
          {backpackItems.map(x => renderItemRow(x.item, x.i, "inventory", true))}
        </div>

        {/* Component Pouch Section */}
        {isSpellcaster() && (
          <div style={{ marginBottom: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <h2 className="section-title" style={{ margin: 0 }}>Component Pouch</h2>
              <button className="btn" style={{ padding: "2px 10px", fontSize: "0.75rem" }} onClick={() => { setSearchTargetList("componentPouch"); setItemSearchOpen(true); }}>
                Search Item
              </button>
            </div>
            {componentPouch.length === 0 && <em style={{ color: "var(--ink-light)", fontSize: "0.85rem" }}>Empty.</em>}
            {componentPouch.map((item, i) => renderItemRow(item, i, "componentPouch", false))}
          </div>
        )}

        {chartOpen && (
          <EncumbranceChartModal
            allItems={allItemsForWeight}
            maxWeight={capacity}
            totalWeight={totalWeight}
            onClose={() => setChartOpen(false)}
          />
        )}

        {itemSearchOpen && (
          <ItemSearchModal
            onSelect={addItemFromSearch}
            onClose={() => setItemSearchOpen(false)}
          />
        )}
      </div>
    );
}

// ── Manage Spells Modal ───────────────────────────────────────────────────────
function ManageSpellsModal({ char, update, onClose }) {
  const [searchModal, setSearchModal] = useState(null);

  const dc = getSpellDC(char);
  const atkRaw = getSpellAttackBonus(char);
  const atkStr = formatMod(atkRaw);

  const LISTS = [
    { key: "cantripsList",       label: "Cantrips",       defaultLevel: 0, showPrepared: false },
    { key: "preparedSpellsList", label: "Prepared Spells", defaultLevel: 1, showPrepared: true  },
    { key: "spellsList",         label: "Known Spells",    defaultLevel: 1, showPrepared: true  },
  ];

  const updateSpell = (listKey, idx, patch) => {
    if (patch.prepared !== undefined) {
      const newSpell = { ...(char[listKey] || [])[idx], ...patch };
      if (patch.prepared && listKey === "spellsList") {
        update({
          spellsList: (char.spellsList || []).filter((_, i) => i !== idx),
          preparedSpellsList: [...(char.preparedSpellsList || []), newSpell],
        });
        return;
      } else if (!patch.prepared && listKey === "preparedSpellsList") {
        update({
          preparedSpellsList: (char.preparedSpellsList || []).filter((_, i) => i !== idx),
          spellsList: [...(char.spellsList || []), newSpell],
        });
        return;
      }
    }
    const list = char[listKey] || [];
    update({ [listKey]: list.map((s, i) => i === idx ? { ...s, ...patch } : s) });
  };
  const deleteSpell = (listKey, idx) =>
    update({ [listKey]: (char[listKey] || []).filter((_, i) => i !== idx) });

  const handleSelectSpell = (spell) => {
    if (!searchModal) return;
    const { key, defaultLevel, showPrepared } = searchModal;
    const newSpell = {
      level: spell.level !== undefined ? spell.level : defaultLevel,
      name: spell.name,
      time: spell.time,
      range: spell.range,
      ritual: spell.ritual || false,
      concentration: spell.concentration || false,
      material: spell.material || false,
      description: spell.description || "",
      attackType: spell.attackType || "",
      saveAbility: spell.saveAbility || "",
      prepared: showPrepared && key === 'preparedSpellsList',
    };
    update({ [key]: [...(char[key] || []), newSpell] });
    setSearchModal(null);
  };

  return (
    <>
      <ModalOverlay onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
        <ModalBox $maxWidth="520px" style={{ maxHeight: "85vh" }}>
          <CloseBtn onClick={onClose}>&times;</CloseBtn>
          <ModalTitle>Manage Spells</ModalTitle>

          {LISTS.map(({ key, label, defaultLevel, showPrepared }) => {
            const list = char[key] || [];
            return (
              <div key={key} style={{ marginBottom: 20 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <CinzelHeading as="h3" style={{ color: "var(--red-dark)", fontSize: "0.85rem", border: "none", paddingBottom: 0, margin: 0 }}>{label}</CinzelHeading>
                  <button className="btn" style={{ padding: "2px 10px", fontSize: "0.75rem" }} onClick={() => setSearchModal({ key, defaultLevel, showPrepared })}>
                    {defaultLevel === 0 ? "Search Cantrips" : "Search Spells"}
                  </button>
                </div>
                {list.length === 0 && <em style={{ color: "var(--ink-light)", fontSize: "0.8rem" }}>None.</em>}
                {list.map((spell, idx) => {
                  let atkType = spell.attackType || "";
                  let saveAb = spell.saveAbility || "";
                  if (!atkType && !saveAb && spell.description) {
                      const descLower = spell.description.toLowerCase();
                      if (/\b(ranged|melee)\s+spell\s+attack/i.test(descLower)) atkType = "spell";
                      else {
                          const saveMatch = descLower.match(/\b(strength|dexterity|constitution|intelligence|wisdom|charisma)\s+saving throw/i);
                          if (saveMatch) saveAb = { strength:'str', dexterity:'dex', constitution:'con', intelligence:'int', wisdom:'wis', charisma:'cha' }[saveMatch[1].toLowerCase()] || "";
                      }
                  }
                  const dmg = extractDmg(spell.description);
                  return (
                    <div key={idx} style={{ display: "grid", gridTemplateColumns: "32px 1fr 44px auto", gap: 4, alignItems: "center", marginBottom: 4 }}>
                    <input
                      type="number"
                      value={spell.level ?? ""}
                      onChange={(e) => updateSpell(key, idx, { level: parseInt(e.target.value) || 0 })}
                      style={{ textAlign: "center", border: "1px solid var(--gold)", borderRadius: 3, fontSize: "0.85rem", padding: "3px 0", background: "white" }}
                      placeholder="Lv"
                      title="Level"
                    />
                    <div style={{ display: "flex", alignItems: "center", gap: 4, minWidth: 0, flexWrap: "wrap" }}>
                      <input
                        value={spell.name || ""}
                        onChange={(e) => updateSpell(key, idx, { name: e.target.value })}
                        placeholder="Spell name"
                        style={{ border: "none", borderBottom: "1px solid var(--gold)", background: "transparent", fontSize: "0.9rem", fontWeight: 600, padding: "3px 0", flex: "1 1 50px", minWidth: 0 }}
                      />
                      {atkType && <span className="spell-roll-tag spell-roll-atk" style={{fontSize: "0.6rem", padding: "1px 4px"}}>Hit {atkStr}</span>}
                      {!atkType && saveAb && <span className="spell-roll-tag spell-roll-save" style={{fontSize: "0.6rem", padding: "1px 4px"}}>{saveAb.toUpperCase().substring(0,3)} {dc}</span>}
                      {dmg && <span className="spell-roll-tag" style={{fontSize: "0.6rem", padding: "1px 4px", background: 'color-mix(in srgb, var(--red) 10%, var(--parchment))', color: 'var(--red-dark)', borderColor: 'color-mix(in srgb, var(--red) 30%, var(--gold))'}}>{dmg}</span>}
                    </div>
                    {showPrepared ? (
                      <label style={{ display: "flex", alignItems: "center", gap: 4, fontSize: "0.75rem", cursor: "pointer", justifyContent: "center" }}>
                        <input type="checkbox" checked={spell.prepared || false} onChange={(e) => updateSpell(key, idx, { prepared: e.target.checked })} />
                        Prep
                      </label>
                    ) : <span />}
                    <button onClick={() => deleteSpell(key, idx)} style={{ background: "none", border: "none", color: "var(--red)", cursor: "pointer", fontSize: "1rem", padding: "0 4px" }}>×</button>
                  </div>
                );})}
                <div style={{ borderBottom: "1px solid var(--gold)", marginTop: 8 }} />
              </div>
            );
          })}
        </ModalBox>
      </ModalOverlay>

      {searchModal && (
        <SpellSearchModal
          isCantrip={searchModal.defaultLevel === 0}
          onSelect={handleSelectSpell}
          onClose={() => setSearchModal(null)}
        />
      )}
    </>
  );
}

const extractDmg = (desc) => {
  if (!desc) return null;
  const text = desc.replace(/<[^>]+>/g, ' ');
  const m = text.match(/\b(\d+d\d+(?:\s*[+\-]\s*\d+)?)\s+(\w+)\s+damage/i);
  if (m) return `${m[1].replace(/\s+/g, '')} ${m[2].toLowerCase()}`;
  const m2 = text.match(/\b(\d+d\d+(?:\s*[+\-]\s*\d+)?)\b/);
  if (m2) return m2[1].replace(/\s+/g, '');
  return null;
};

// ── Spells View ───────────────────────────────────────────────────────────────
function SpellsView({ char, update }) {
  const [showManage, setShowManage] = useState(false);
  const [infoSpell, setInfoSpell] = useState(null);
  const [draggedSpell, setDraggedSpell] = useState(null);
  const [filter, setFilter] = useState("All");

  const dc = getSpellDC(char);
  const atk = getSpellAttackBonus(char);
  const mod = calcMod(parseInt(char[char.spellAbility || "int"]) || 10);
  const ABILITY_NAMES = { str: "STR", dex: "DEX", con: "CON", int: "INT", wis: "WIS", cha: "CHA" };

  const slots = char.spellSlotsData || [];

  const toggleSlotPip = (lvlIdx, pipIdx) => {
    update({ spellSlotsData: slots.map((s, i) => {
      if (i !== lvlIdx) return s;
      const used = s.used || 0;
      return { ...s, used: pipIdx < used ? pipIdx : pipIdx + 1 };
    })});
  };

  const changeSlotTotal = (lvlIdx, delta) => {
    update({ spellSlotsData: slots.map((s, i) => {
      if (i !== lvlIdx) return s;
      const newTotal = Math.max(0, Math.min(20, (s.total || 0) + delta));
      return { ...s, total: newTotal, used: Math.min(s.used || 0, newTotal) };
    })});
  };

  const deleteSlot = (lvlIdx) =>
    update({ spellSlotsData: slots.filter((_, i) => i !== lvlIdx) });

  const addSlotLevel = () => {
    const existing = slots.map(s => s.level);
    let lvl = 1;
    while (existing.includes(lvl)) lvl++;
    if (lvl <= 9) update({ spellSlotsData: [...slots, { level: lvl, total: 1, used: 0 }] });
  };

  const handleDragStart = (e, listKey, idx) => {
    setDraggedSpell({ listKey, idx, type: 'mouse' });
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = "move";
      e.dataTransfer.setData("text/plain", idx);
    }
  };

  const handleDragOver = (e, listKey, idx) => {
    e.preventDefault();
    if (draggedSpell && draggedSpell.overIdx !== idx) {
      setDraggedSpell({ ...draggedSpell, overIdx: idx });
    }
  };

  const handleDrop = (e, targetListKey, targetIdx) => {
    e.preventDefault();
    if (!draggedSpell) return;
    if (draggedSpell.listKey === targetListKey) {
      const list = [...(char[targetListKey] || [])];
      const [moved] = list.splice(draggedSpell.idx, 1);
      list.splice(targetIdx, 0, moved);
      update({ [targetListKey]: list });
    }
    setDraggedSpell(null);
  };

  const handleTouchStart = (e, listKey, idx) => {
    setDraggedSpell({ listKey, idx, type: 'touch' });
  };

  const handleTouchMove = (e, listKey) => {
    if (!draggedSpell || draggedSpell.type !== 'touch') return;
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    const dropTarget = el?.closest('[data-drag-idx]');
    if (dropTarget) {
      const overIdx = parseInt(dropTarget.dataset.dragIdx);
      if (overIdx !== draggedSpell.overIdx) {
        setDraggedSpell(prev => ({ ...prev, overIdx }));
      }
    }
  };

  const handleTouchEnd = (e, listKey) => {
    if (draggedSpell && draggedSpell.type === 'touch') {
      if (draggedSpell.overIdx !== undefined && draggedSpell.idx !== draggedSpell.overIdx && draggedSpell.listKey === listKey) {
        const list = [...(char[listKey] || [])];
        const [moved] = list.splice(draggedSpell.idx, 1);
        list.splice(draggedSpell.overIdx, 0, moved);
        update({ [listKey]: list });
      }
    }
    setDraggedSpell(null);
  };

  const renderSpellCard = (s, i, listKey) => {
    const dmg = extractDmg(s.description);
    
    let atkType = s.attackType || "";
    let saveAb = s.saveAbility || "";
    if (!atkType && !saveAb && s.description) {
        const descLower = s.description.toLowerCase();
        if (/\b(ranged|melee)\s+spell\s+attack/i.test(descLower)) atkType = "spell";
        else {
            const saveMatch = descLower.match(/\b(strength|dexterity|constitution|intelligence|wisdom|charisma)\s+saving throw/i);
            if (saveMatch) saveAb = { strength:'str', dexterity:'dex', constitution:'con', intelligence:'int', wisdom:'wis', charisma:'cha' }[saveMatch[1].toLowerCase()] || "";
        }
    }

    const pillStyle = {
      background: 'var(--parchment)',
      border: '1px solid var(--gold)',
      borderRadius: '12px',
      padding: '2px 8px',
      color: 'var(--ink-light)',
      whiteSpace: 'nowrap'
    };

    const dmgPillStyle = {
      ...pillStyle,
      background: 'color-mix(in srgb, var(--red) 10%, var(--parchment))',
      borderColor: 'color-mix(in srgb, var(--red) 30%, var(--gold))',
      color: 'var(--red-dark)',
      fontWeight: 'bold'
    };

    const hitdcPillStyle = {
      ...pillStyle,
      fontWeight: 'bold',
      ...(atkType 
          ? { background: '#d4edda', color: '#155724', borderColor: '#c3e6cb' }
          : { background: '#fff3cd', color: '#856404', borderColor: '#ffc107' })
    };

    let rollPill = null;
    if (atkType) rollPill = <span style={hitdcPillStyle}>Hit {formatMod(atk)}</span>;
    else if (saveAb) rollPill = <span style={hitdcPillStyle}>{saveAb.toUpperCase().substring(0,3)} {dc}</span>;

    const isOver = draggedSpell?.listKey === listKey && draggedSpell?.overIdx === i;
    const isDragged = draggedSpell?.listKey === listKey && draggedSpell?.idx === i;

    return (
      <div 
        key={i} 
        className="msv-spell-card" 
        style={{ 
          position: 'relative', 
          padding: '10px',
          opacity: isDragged ? 0.5 : 1,
          border: isOver ? '2px dashed var(--red)' : undefined
        }}
        data-drag-idx={i}
        draggable
        onDragStart={(e) => handleDragStart(e, listKey, i)}
        onDragOver={(e) => handleDragOver(e, listKey, i)}
        onDrop={(e) => handleDrop(e, listKey, i)}
      >
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div 
                  style={{ cursor: 'grab', fontSize: '1.2rem', color: 'var(--ink-light)', paddingRight: 4, userSelect: 'none', lineHeight: 1, touchAction: 'none' }}
                  onTouchStart={(e) => handleTouchStart(e, listKey, i)}
                  onTouchMove={(e) => handleTouchMove(e, listKey)}
                  onTouchEnd={(e) => handleTouchEnd(e, listKey)}
                >
                  ☰
                </div>
                <span className="msv-spell-level-badge">{s.level === 0 ? 'C' : s.level}</span>
                <strong style={{ color: 'var(--red-dark)', fontSize: '0.95rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{s.name || <em style={{color:'var(--ink-light)'}}>Unnamed</em>}</strong>
              </div>
              <div style={{ fontSize: '0.75rem', marginTop: 6, display: 'flex', flexWrap: 'wrap', gap: '6px', alignItems: 'center' }}>
                {s.time && <span style={pillStyle}>{s.time}</span>}
                {s.range && <span style={pillStyle}>{s.range}</span>}
                {dmg && <span style={dmgPillStyle}>{dmg}</span>}
              {rollPill}
              </div>
              <div style={{ display: 'flex', gap: 4, marginTop: 6, flexWrap: 'wrap' }}>
                {s.ritual && <span className="msv-tag">R</span>}
                {s.concentration && <span className="msv-tag msv-tag-conc">C</span>}
                {s.material && <span className="msv-tag msv-tag-mat">M</span>}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <button className="msv-info-btn" style={{ width: 26, height: 26, fontSize: '0.9rem', marginTop: 4 }} onClick={() => setInfoSpell(s)}>?</button>
            </div>
         </div>
      </div>
    );
  };

  const prepLevels = (char.preparedSpellsList || []).map(s => parseInt(s.level) || 1).filter(l => l > 0);
  const maxLevel = prepLevels.length ? Math.max(...prepLevels) : 0;
  const hasCantrips = (char.cantripsList || []).length > 0;

  const allSpells = [
    ...(char.cantripsList || []).map((s, i) => ({ ...s, _idx: i, _listKey: 'cantripsList' })),
    ...(char.preparedSpellsList || []).map((s, i) => ({ ...s, _idx: i, _listKey: 'preparedSpellsList' }))
  ];

  const filters = [{ key: "All", label: "All" }];
  if (hasCantrips) filters.push({ key: "0", label: "Cantrips" });
  const ordinals = ["", "1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "9th"];
  for (let i = 1; i <= maxLevel; i++) {
    if (prepLevels.includes(i)) {
      filters.push({ key: String(i), label: ordinals[i] || `${i}th` });
    }
  }

  if (allSpells.some(s => s.ritual)) filters.push({ key: "Ritual", label: "Ritual" });
  if (allSpells.some(s => s.concentration)) filters.push({ key: "Concentration", label: "Conc." });
  if (allSpells.some(s => s.material)) filters.push({ key: "Material", label: "Mat." });

  const filteredSpells = allSpells.filter(s => {
    if (filter === "All") return true;
    if (filter === "0") return s.level === 0;
    if (filter === "Ritual") return s.ritual;
    if (filter === "Concentration") return s.concentration;
    if (filter === "Material") return s.material;
    return String(s.level) === filter;
  });

  const cantripsToShow = filteredSpells.filter(s => s._listKey === 'cantripsList');
  const prepToShow = filteredSpells.filter(s => s._listKey === 'preparedSpellsList');

  return (
    <div className="app-view-content">
      {/* Spell stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>
        {[
          { label: "Save DC", value: dc },
          { label: `Atk (${ABILITY_NAMES[char.spellAbility || "int"]})`, value: formatMod(atk) },
          { label: "Modifier", value: formatMod(mod) },
        ].map(({ label, value }) => (
          <StatCard key={label} style={{ padding: "8px 6px" }}>
            <StatName style={{ fontSize: "0.6rem", lineHeight: 1.2 }}>{label}</StatName>
            <div style={{ fontWeight: 700, fontSize: "1.3rem", color: "var(--red-dark)", textAlign: "center" }}>{value}</div>
          </StatCard>
        ))}
      </div>

      <button className="btn" style={{ width: "100%", marginBottom: 14, padding: "8px", fontSize: "0.85rem" }} onClick={() => setShowManage(true)}>
        Manage Spells
      </button>

      {/* Spell Slots */}
      <h2 className="section-title">Spell Slots</h2>
      {slots.map((slot, lvlIdx) => {
        const usePips = slot.total <= 8;
        return (
          <div key={lvlIdx} style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8, padding: "6px 10px", background: "rgba(255,255,255,0.5)", border: "1px solid var(--gold)", borderRadius: 4 }}>
            <span style={{ fontFamily: "Cinzel, serif", fontSize: "0.85rem", color: "var(--red-dark)", minWidth: 34 }}>Lv{slot.level}</span>

            {/* total +/- */}
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              <button className="mini-btn" onClick={() => changeSlotTotal(lvlIdx, -1)} style={{ width: 18, height: 18, fontSize: "0.8rem" }}>−</button>
              <span style={{ fontFamily: "Cinzel, serif", fontSize: "0.75rem", minWidth: 16, textAlign: "center" }}>{slot.total}</span>
              <button className="mini-btn" onClick={() => changeSlotTotal(lvlIdx, 1)} style={{ width: 18, height: 18, fontSize: "0.8rem" }}>+</button>
            </div>

            {/* usage pips or counter */}
            <div style={{ display: "flex", gap: 4, flex: 1, flexWrap: "wrap", alignItems: "center" }}>
              {usePips
                ? Array.from({ length: slot.total }, (_, i) => (
                    <button key={i} onClick={() => toggleSlotPip(lvlIdx, i)}
                      style={{ width: 20, height: 20, borderRadius: "50%", border: "2px solid var(--gold)", background: i < (slot.used || 0) ? "var(--gold)" : "transparent", cursor: "pointer", padding: 0 }} />
                  ))
                : <>
                    <button className="mini-btn" onClick={() => changeSlotTotal(lvlIdx, 0) || update({ spellSlotsData: slots.map((s, i) => i === lvlIdx ? { ...s, used: Math.max(0, (s.used||0)-1) } : s) })}>−</button>
                    <span style={{ fontFamily: "Cinzel, serif", fontSize: "0.85rem", minWidth: 36, textAlign: "center" }}>{slot.used || 0}/{slot.total}</span>
                    <button className="mini-btn" onClick={() => update({ spellSlotsData: slots.map((s, i) => i === lvlIdx ? { ...s, used: Math.min(s.total, (s.used||0)+1) } : s) })}>+</button>
                  </>
              }
            </div>

            <button onClick={() => deleteSlot(lvlIdx)} style={{ background: "none", border: "none", color: "var(--ink-light)", cursor: "pointer", fontSize: "1rem", padding: "0 2px", flexShrink: 0 }}>×</button>
          </div>
        );
      })}
      <button className="add-feature-btn" onClick={addSlotLevel}>+ Add Spell Level</button>

      {/* Spell lists (read-only summary) */}
      <div className="actions-filter-bar" style={{ marginTop: 16, marginBottom: 16 }}>
        {filters.map((f) => (
          <button
            key={f.key}
            className={`act-filter-pill${filter === f.key ? " active" : ""}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
          </button>
        ))}
      </div>

      {(filter === "All" || cantripsToShow.length > 0) && (
        <div style={{ marginBottom: 16 }}>
          <h2 className="section-title" style={{ marginTop: 0 }}>Cantrips</h2>
          {cantripsToShow.length === 0 && <em style={{ color: "var(--ink-light)", fontSize: "0.85rem" }}>No cantrips.</em>}
          {cantripsToShow.map((s) => renderSpellCard(s, s._idx, s._listKey))}
        </div>
      )}

      {(filter === "All" || prepToShow.length > 0) && (
        <div style={{ marginBottom: 16 }}>
          <h2 className="section-title" style={{ marginTop: 0 }}>Prepared / Known Spells</h2>
          {prepToShow.length === 0 && <em style={{ color: "var(--ink-light)", fontSize: "0.85rem" }}>No spells.</em>}
          {prepToShow.map((s) => renderSpellCard(s, s._idx, s._listKey))}
        </div>
      )}

      {showManage && <ManageSpellsModal char={char} update={update} onClose={() => setShowManage(false)} />}

      {infoSpell && (
        <ModalOverlay onClick={() => setInfoSpell(null)}>
          <ModalBox $maxWidth="400px" onClick={e => e.stopPropagation()} style={{ maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <CloseBtn onClick={() => setInfoSpell(null)}>&times;</CloseBtn>
            <ModalTitle>{infoSpell.name || 'Spell Details'}</ModalTitle>
            <div style={{ fontSize: '0.85rem', color: 'var(--ink-light)', marginBottom: 12, flexShrink: 0 }}>
              {infoSpell.level === 0 ? 'Cantrip' : `Level ${infoSpell.level}`}
              {infoSpell.time && ` · ${infoSpell.time}`}
              {infoSpell.range && ` · ${infoSpell.range}`}
            </div>
            <div style={{ fontSize: '0.9rem', lineHeight: 1.5, overflowY: 'auto', flex: 1, paddingRight: 4 }} dangerouslySetInnerHTML={{__html: (infoSpell.description || '').replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')}} />
          </ModalBox>
        </ModalOverlay>
      )}
    </div>
  );
}

// ── Features View ─────────────────────────────────────────────────────────────
function FeaturesView({ char }) {
  const [expanded, setExpanded] = useState({});
  const [filter, setFilter] = useState("All");

  const GROUPS = [
    { key: "Class", title: "Class Features", items: char.classFeatures || [] },
    { key: "Background", title: "Background Features", items: char.backgroundFeatures || [] },
    { key: "Species", title: "Species Features", items: char.raceFeatures || [] },
    { key: "Feat", title: "Feats", items: char.feats || [] },
  ];

  const FILTERS = ["All", "Class", "Background", "Species", "Feat"];

  const toggleExpand = (id) => setExpanded(p => ({ ...p, [id]: !p[id] }));

  return (
    <div className="app-view-content">
      <h2 className="section-title">Features & Traits</h2>

      <div className="actions-filter-bar" style={{ marginBottom: 16 }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`act-filter-pill${filter === f ? " active" : ""}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {GROUPS.every((g) => g.items.length === 0) && filter === "All" && (
        <em style={{ color: "var(--ink-light)" }}>No features added.</em>
      )}

      {GROUPS.filter((g) => filter === "All" || filter === g.key).map((g) => {
        if (g.items.length === 0) {
          if (filter !== "All") {
            return (
              <em key={g.key} style={{ color: "var(--ink-light)" }}>
                No {g.title.toLowerCase()} added.
              </em>
            );
          }
          return null;
        }

        return (
          <div key={g.key} style={{ marginBottom: 16 }}>
            {filter === "All" && (
              <h3
                className="section-title"
                style={{
                  fontSize: "1rem",
                  marginTop: 0,
                  marginBottom: 8,
                  border: "none",
                  padding: 0,
                }}
              >
                {g.title}
              </h3>
            )}
            {g.items.map((f, i) => {
              const uid = `${g.key}-${i}`;
              return (
                <div
                  key={uid}
                  style={{
                    background: "rgba(255,255,255,0.5)",
                    border: "1px solid var(--gold)",
                    borderRadius: 4,
                    marginBottom: 6,
                  }}
                >
                  <div
                    style={{
                      padding: "8px 12px",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      cursor: "pointer",
                    }}
                    onClick={() => toggleExpand(uid)}
                  >
                    <strong
                      style={{
                        fontFamily: "Cinzel, serif",
                        fontSize: "0.85rem",
                        color: "var(--red-dark)",
                      }}
                    >
                      {f.title}
                    </strong>
                    <span
                      style={{ color: "var(--ink-light)", fontSize: "0.8rem" }}
                    >
                      {expanded[uid] ? "▴" : "▾"}
                    </span>
                  </div>
                  {expanded[uid] && f.desc && (
                    <div
                      style={{
                        padding: "0 12px 10px",
                        fontSize: "0.85rem",
                        lineHeight: 1.5,
                      }}
                      dangerouslySetInnerHTML={{ __html: f.desc }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ── Defenses View ─────────────────────────────────────────────────────────────
function DefensesView({ char, update }) {
  return (
    <div className="app-view-content">
      <h2 className="section-title">Speed & Defenses</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 16 }}>
        {[
          { label: "Speed (ft)", key: "speed" },
          { label: "AC", key: "baseAC" },
          { label: "Initiative", key: "initiative" },
        ].map(({ label, key }) => (
          <StatCard key={key} style={{ padding: "8px 6px" }}>
            <StatName>{label}</StatName>
            <StatValueInput
              value={char[key] || 0}
              onChange={(e) => update({ [key]: parseInt(e.target.value) || 0 })}
            />
          </StatCard>
        ))}
      </div>

      {[
        { title: "Resistances", key: "resistances" },
        { title: "Immunities", key: "immunities" },
        { title: "Vulnerabilities", key: "vulnerabilities" },
      ].map(({ title, key }) => (
        <div key={key} style={{ marginBottom: 14 }}>
          <h2 className="section-title" style={{ marginBottom: 6 }}>{title}</h2>
          <textarea
            value={char[key] || ""}
            onChange={(e) => update({ [key]: e.target.value })}
            placeholder={`Enter ${title.toLowerCase()}…`}
            style={{ width: "100%", minHeight: 56, padding: "6px 8px", border: "1px solid var(--gold)", borderRadius: 6, background: "rgba(255,255,255,0.6)", fontFamily: "Crimson Text, serif", fontSize: "0.95rem", resize: "vertical" }}
          />
        </div>
      ))}
    </div>
  );
}

// ── Proficiencies View ────────────────────────────────────────────────────────
function ProficienciesView({ char, update }) {
  const FIELDS = [
    { label: "Weapon Proficiencies", key: "weaponProfs" },
    { label: "Armor Training", key: "armorProfs" },
    { label: "Tool Proficiencies", key: "toolProfs" },
    { label: "Languages", key: "languages" },
  ];

  return (
    <div className="app-view-content">
      <h2 className="section-title">Proficiencies & Training</h2>
      {FIELDS.map(({ label, key }) => (
        <div key={key} style={{ marginBottom: 14 }}>
          <CinzelHeading as="h3" style={{ color: "var(--red-dark)", fontSize: "0.85rem" }}>{label}</CinzelHeading>
          <textarea
            value={char[key] || ""}
            onChange={(e) => update({ [key]: e.target.value })}
            placeholder={`Enter ${label.toLowerCase()}…`}
            style={{ width: "100%", minHeight: 56, padding: "6px 8px", border: "1px solid var(--gold)", borderRadius: 6, background: "rgba(255,255,255,0.6)", fontFamily: "Crimson Text, serif", fontSize: "0.95rem", resize: "vertical" }}
          />
        </div>
      ))}
    </div>
  );
}

// ── Notes View ────────────────────────────────────────────────────────────────
function NotesView({ char, update }) {
  return (
    <div className="app-view-content">
      <h2 className="section-title">Notes & Personality</h2>
      {[
        { label: "Personality Traits", key: "personality" },
        { label: "Ideals", key: "ideals" },
        { label: "Bonds", key: "bonds" },
        { label: "Flaws", key: "flaws" },
        { label: "Notes", key: "notes" },
      ].map(({ label, key }) => (
        <div key={key} style={{ marginBottom: 14 }}>
          <label
            style={{
              display: "block",
              fontFamily: "Cinzel, serif",
              fontSize: "0.85rem",
              color: "var(--red-dark)",
              marginBottom: 4,
            }}
          >
            {label}
          </label>
          <textarea
            rows={3}
            value={char[key] || ""}
            onChange={(e) => update({ [key]: e.target.value })}
            style={{
              width: "100%",
              border: "1px solid var(--gold)",
              borderRadius: 4,
              padding: "6px 10px",
              background: "rgba(255,255,255,0.8)",
              fontFamily: "inherit",
              fontSize: "0.9rem",
              resize: "vertical",
            }}
          />
        </div>
      ))}
    </div>
  );
}

// ── Summons View ──────────────────────────────────────────────────────────────
function SummonsView({ char }) {
  return (
    <div className="app-view-content">
      <h2 className="section-title">Summons & Creatures</h2>
      {!(char.summonsData || []).length && (
        <em style={{ color: "var(--ink-light)" }}>No summons.</em>
      )}
      {(char.summonsData || []).map((summon, i) => (
        <div
          key={i}
          style={{
            background: "rgba(255,255,255,0.5)",
            border: "1px solid var(--gold)",
            borderRadius: 6,
            padding: 12,
            marginBottom: 10,
          }}
        >
          <strong
            style={{ fontFamily: "Cinzel, serif", color: "var(--red-dark)" }}
          >
            {summon.name}
          </strong>
          <div
            style={{
              display: "flex",
              gap: 12,
              marginTop: 6,
              fontSize: "0.85rem",
            }}
          >
            <span>
              HP: {summon.hp || 0}/{summon.maxHp || 0}
            </span>
            <span>AC: {summon.ac || 0}</span>
            {summon.speed && <span>Speed: {summon.speed}ft</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── View Selector Modal ───────────────────────────────────────────────────────
function ViewSelectorModal({ currentView, onSelect, onClose }) {
  return (
    <div
      className="info-modal-overlay"
      style={{
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "fixed",
        inset: 0,
        zIndex: 1050,
      }}
    >
      <div
        className="info-modal-content"
        style={{
          background: "var(--parchment)",
          border: "2px solid var(--gold)",
          padding: 20,
          width: 320,
          borderRadius: 6,
          position: "relative",
        }}
      >
        <button
          className="close-modal-btn"
          onClick={onClose}
          style={{ position: "absolute", top: 10, right: 10 }}
        >
          ×
        </button>
        <h3
          style={{
            fontFamily: "Cinzel, serif",
            color: "var(--red-dark)",
            textAlign: "center",
            marginTop: 0,
          }}
        >
          Switch View
        </h3>
        <div
          style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}
        >
          <button
            onClick={() => onSelect("legacy")}
            className="btn"
            style={{
              gridColumn: "1 / -1",
              fontStyle: "italic",
              color: "var(--ink-light)",
            }}
          >
            Full Sheet (Legacy)
          </button>
          {VIEWS.map((v) => (
            <button
              key={v.id}
              onClick={() => onSelect(v.id)}
              className={`btn${currentView === v.id ? " btn-primary" : ""}`}
              style={{ padding: "10px 8px", fontSize: "0.9rem" }}
            >
              {v.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Main MobileAppView ────────────────────────────────────────────────────────
export default function MobileAppView({
  onExit,
  initialView = "stats",
  onShortRest,
  onLongRest,
}) {
  const { character: char, update, openModal } = useCharacter();
  const [currentView, setCurrentView] = useState(initialView);
  const [showViewSelector, setShowViewSelector] = useState(false);

  // Sync when parent changes the requested view (e.g. nav modal re-selection)
  const prevInitialView = useRef(initialView);
  if (prevInitialView.current !== initialView) {
    prevInitialView.current = initialView;
    setCurrentView(initialView);
  }
  const [showHpModal, setShowHpModal] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const viewOrder = VIEWS.map((v) => v.id);

  const switchView = useCallback(
    (viewId) => {
      if (viewId === "legacy") {
        onExit();
        return;
      }
      setCurrentView(viewId);
      setShowViewSelector(false);
    },
    [onExit],
  );

  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };
  const handleTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    const cur = viewOrder.indexOf(currentView);
    if (cur === -1) return;
    if (dx < 0 && cur < viewOrder.length - 1) switchView(viewOrder[cur + 1]);
    else if (dx > 0 && cur > 0) switchView(viewOrder[cur - 1]);
  };

  return (
    <div
      id="app-views-container"
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        background: "var(--parchment)",
        overflow: "hidden",
      }}
    >
      <MobileHeader
        char={char}
        update={update}
        onOpenHp={() => setShowHpModal(true)}
        onShortRest={onShortRest}
        onLongRest={onLongRest}
        onMoreInfo={() => openModal('mobileMore')}
        onOpenCondition={() => openModal('condition')}
      />

      {/* View navigation bar */}
      <div
        style={{
          display: "flex",
          overflow: "auto",
          background: "var(--parchment-dark)",
          borderBottom: "1px solid var(--gold)",
          flexShrink: 0,
          scrollbarWidth: "none",
        }}
      >
        {VIEWS.map((v) => (
          <button
            key={v.id}
            onClick={() => switchView(v.id)}
            style={{
              padding: "8px 12px",
              background: "none",
              border: "none",
              borderBottom: `2px solid ${currentView === v.id ? "var(--red)" : "transparent"}`,
              color:
                currentView === v.id ? "var(--red-dark)" : "var(--ink-light)",
              cursor: "pointer",
              fontFamily: "Cinzel, serif",
              fontSize: "0.8rem",
              fontWeight: currentView === v.id ? 700 : "normal",
              whiteSpace: "nowrap",
              flexShrink: 0,
              transition: "all 0.15s",
            }}
          >
            {v.label}
          </button>
        ))}
        <button
          onClick={onExit}
          style={{
            padding: "8px 12px",
            background: "none",
            border: "none",
            color: "var(--ink-light)",
            cursor: "pointer",
            fontFamily: "Cinzel, serif",
            fontSize: "0.8rem",
            whiteSpace: "nowrap",
            flexShrink: 0,
            marginLeft: "auto",
            borderLeft: "1px solid var(--gold)",
          }}
        >
          Full Sheet
        </button>
      </div>

      {/* View content */}
      <div
        className="app-view"
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "16px",
          display: "block",
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {currentView === "stats" && (
          <>
            <ScoresView char={char} update={update} />
            <SavesSkillsView char={char} update={update} />
          </>
        )}
        {currentView === "actions" && <ActionsView char={char} />}
        {currentView === "inventory" && (
          <InventoryView char={char} update={update} />
        )}
        {currentView === "spells" && <SpellsView char={char} update={update} />}
        {currentView === "features" && <FeaturesView char={char} />}
        {currentView === "defenses" && (
          <DefensesView char={char} update={update} />
        )}
        {currentView === "proficiencies" && <ProficienciesView char={char} update={update} />}
        {currentView === "notes" && <NotesView char={char} update={update} />}
        {currentView === "summons" && <SummonsView char={char} />}
      </div>

      {showViewSelector && (
        <ViewSelectorModal
          currentView={currentView}
          onSelect={switchView}
          onClose={() => setShowViewSelector(false)}
        />
      )}
      {showHpModal && (
        <HpModal
          char={char}
          update={update}
          onClose={() => setShowHpModal(false)}
        />
      )}
    </div>
  );
}
