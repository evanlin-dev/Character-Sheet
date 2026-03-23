import { useState } from "react";
import { createPortal } from "react-dom";
import { useCharacter } from "src/context/CharacterContext";
import RichTextModal from "src/components/RichTextModal";
import { CastSpellModal } from "src/components/tabs/SpellsTab";
import {
  getSpellDC,
  getSpellAttackBonus,
  formatMod,
} from "src/utils/calculations";

const extractDmg = (desc) => {
  if (!desc) return null;
  const text = desc.replace(/<[^>]+>/g, " ");
  const m = text.match(/\b(\d+d\d+(?:\s*[+\-]\s*\d+)?)\s+(\w+)\s+damage/i);
  if (m) return `${m[1].replace(/\s+/g, "")} ${m[2].toLowerCase()}`;
  const m2 = text.match(/\b(\d+d\d+(?:\s*[+\-]\s*\d+)?)\b/);
  if (m2) return m2[1].replace(/\s+/g, "");
  return null;
};

export function AutoSpellItem({ s, dc, atkStr, onCast }) {
  const [expanded, setExpanded] = useState(false);
  const dmg = extractDmg(s.description);
  let hitdc = null;
  if (s.attackType)
    hitdc = (
      <span
        style={{
          background: "#d4edda",
          color: "#155724",
          padding: "1px 6px",
          borderRadius: 10,
          fontSize: "0.65rem",
          fontWeight: "bold",
        }}
      >
        Hit {atkStr}
      </span>
    );
  else if (s.saveAbility)
    hitdc = (
      <span
        style={{
          background: "#fff3cd",
          color: "#856404",
          padding: "1px 6px",
          borderRadius: 10,
          fontSize: "0.65rem",
          fontWeight: "bold",
        }}
      >
        {s.saveAbility.toUpperCase().substring(0, 3)} {dc}
      </span>
    );

  return (
    <div
      className="feature-box"
      style={{
        padding: "6px 10px",
        marginBottom: 8,
        background: "var(--parchment-dark)",
        cursor: "pointer",
      }}
      onClick={() => setExpanded(!expanded)}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 2,
            minWidth: 0,
          }}
        >
          <strong
            style={{
              fontFamily: "Cinzel, serif",
              fontSize: "0.85rem",
              color: "var(--ink)",
            }}
          >
            {s.name}
          </strong>
          <span style={{ fontSize: "0.7rem", color: "var(--ink-light)" }}>
            {s.level === 0 ? "Cantrip" : `Lv ${s.level}`}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            gap: 4,
            flexWrap: "wrap",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          {s.range && (
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: "bold",
                background: "rgba(0,0,0,0.08)",
                padding: "1px 6px",
                borderRadius: 10,
              }}
            >
              {s.range}
            </span>
          )}
          {dmg && (
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: "bold",
                background: "rgba(139,46,46,0.1)",
                color: "var(--red-dark)",
                padding: "1px 6px",
                borderRadius: 10,
              }}
            >
              {dmg}
            </span>
          )}
          {hitdc}
          {s.ritual && (
            <span
              style={{
                fontSize: "0.65rem",
                fontWeight: "bold",
                background: "rgba(212,165,116,0.2)",
                color: "var(--gold-dark)",
                padding: "1px 6px",
                borderRadius: 10,
              }}
            >
              Ritual
            </span>
          )}
          {onCast && (
            <button
              className="btn btn-primary"
              style={{ padding: "2px 6px", fontSize: "0.65rem", height: "20px", marginLeft: 4 }}
              onClick={(e) => { e.stopPropagation(); onCast(s); }}
            >
              Cast
            </button>
          )}
          <span
            style={{
              color: "var(--ink-light)",
              fontSize: "0.75rem",
              marginLeft: 4,
            }}
          >
            {expanded ? "▴" : "▾"}
          </span>
        </div>
      </div>
      {expanded && s.description && (
        <div
          style={{
            marginTop: 8,
            paddingTop: 8,
            borderTop: "1px dashed var(--gold)",
            fontSize: "0.85rem",
            lineHeight: 1.4,
          }}
          dangerouslySetInnerHTML={{
            __html: s.description
              .replace(/\n/g, "<br>")
              .replace(/\*\*(.*?)\*\*/g, "<b>$1</b>"),
          }}
        />
      )}
    </div>
  );
}

function FeatureItem({ item, onUpdate, onDelete }) {
  const [showNotes, setShowNotes] = useState(false);

  const formatText = (text) => {
    if (!text)
      return "<em style='color:var(--ink-light)'>Click to add description...</em>";
    return text.replace(/\*\*(.*?)\*\*/g, "<b>$1</b>").replace(/\n/g, "<br>");
  };

  return (
    <div
      className="feature-box"
      style={{ position: "relative", marginBottom: 8 }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 4,
        }}
      >
        <input
          type="text"
          className="feature-title"
          value={item.title || ""}
          onChange={(e) => onUpdate({ ...item, title: e.target.value })}
          placeholder="Action name..."
          style={{
            fontWeight: "bold",
            width: "calc(100% - 48px)",
            marginBottom: 0,
          }}
        />
        <div style={{ display: "flex", gap: 4 }}>
          <button
            className="skill-info-btn"
            onClick={() => setShowNotes(true)}
            title="View/Edit Description"
            style={{
              position: "relative",
              margin: 0,
              width: 22,
              height: 22,
              fontSize: "0.8rem",
            }}
          >
            📝
          </button>
          <button
            className="delete-feature-btn"
            onClick={onDelete}
            style={{ position: "relative", margin: 0 }}
          >
            &times;
          </button>
        </div>
      </div>
      <div
        className="feature-desc-display"
        onClick={() => setShowNotes(true)}
        style={{
          fontSize: "0.9rem",
          color: "var(--ink)",
          lineHeight: 1.4,
          cursor: "pointer",
          minHeight: 20,
        }}
        dangerouslySetInnerHTML={{ __html: formatText(item.desc) }}
      />
      {showNotes && (
        <RichTextModal
          title={item.title || "Action Details"}
          value={item.desc || ""}
          onChange={(val) => onUpdate({ ...item, desc: val })}
          onClose={() => setShowNotes(false)}
        />
      )}
    </div>
  );
}

function ActionGroup({ title, field, addLabel, autoSpells = [], dc, atkStr, onCast }) {
  const { character, update } = useCharacter();
  const items = character[field] || [];

  const updateItem = (index, newItem) => {
    update({ [field]: items.map((item, i) => (i === index ? newItem : item)) });
  };

  const deleteItem = (index) => {
    update({ [field]: items.filter((_, i) => i !== index) });
  };

  const addItem = () => {
    update({ [field]: [...items, { title: "", desc: "" }] });
  };

  return (
    <div>
      <h3
        className="section-title"
        style={{
          fontSize: "1.1rem",
          margin: "0 0 10px 0",
          borderBottom: "none",
          paddingBottom: 0,
        }}
      >
        {title}
      </h3>
      <div>
        {items.map((item, i) => (
          <FeatureItem
            key={i}
            item={item}
            onUpdate={(newItem) => updateItem(i, newItem)}
            onDelete={() => deleteItem(i)}
          />
        ))}
        {autoSpells.length > 0 && (
          <div style={{ marginTop: 12 }}>
            {autoSpells.map((s, i) => (
              <AutoSpellItem key={i} s={s} dc={dc} atkStr={atkStr} onCast={onCast} />
            ))}
          </div>
        )}
      </div>
      <button
        className="add-feature-btn"
        style={{ marginTop: 8 }}
        onClick={addItem}
      >
        {addLabel}
      </button>
    </div>
  );
}

export default function ActionEconomy({ initiativeList = [], socket = null, roomId = null, myName = "" }) {
  const { character, update } = useCharacter();
  const [castSpellTarget, setCastSpellTarget] = useState(null);

  const allSpells = [
    ...(character.preparedSpellsList || []),
    ...(character.spellsList || []),
    ...(character.cantripsList || []),
  ];

  const groups = { action: [], bonus: [], reaction: [], other: [] };

  allSpells.forEach((s) => {
    if (!s.name) return;
    const time = (s.time || "").toLowerCase();
    let cat = "other";
    if (time.includes("bonus")) cat = "bonus";
    else if (time.includes("reaction")) cat = "reaction";
    else if (time.includes("action")) cat = "action";

    groups[cat].push(s);
  });

  const dc = getSpellDC(character);
  const atkRaw = getSpellAttackBonus(character);
  const atkStr = formatMod(atkRaw);

  return (
    <div className="sheet-section">
      <h2 className="section-title">Action Economy</h2>
      <div className="grid grid-4">
        <ActionGroup
          title="Actions"
          field="actions"
          addLabel="+ Add Action"
          autoSpells={groups.action}
          dc={dc}
          atkStr={atkStr}
          onCast={(s) => setCastSpellTarget(s)}
        />
        <ActionGroup
          title="Bonus Actions"
          field="bonusActions"
          addLabel="+ Add Bonus Action"
          autoSpells={groups.bonus}
          dc={dc}
          atkStr={atkStr}
          onCast={(s) => setCastSpellTarget(s)}
        />
        <ActionGroup
          title="Reactions"
          field="reactions"
          addLabel="+ Add Reaction"
          autoSpells={groups.reaction}
          dc={dc}
          atkStr={atkStr}
          onCast={(s) => setCastSpellTarget(s)}
        />
        <ActionGroup
          title="Other"
          field="otherActions"
          addLabel="+ Add Other"
          autoSpells={groups.other}
          dc={dc}
          atkStr={atkStr}
          onCast={(s) => setCastSpellTarget(s)}
        />
      </div>
      {castSpellTarget && createPortal(
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
      , document.body)}
    </div>
  );
}

export { FeatureItem };
