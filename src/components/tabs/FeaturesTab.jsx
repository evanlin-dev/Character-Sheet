import { useState } from "react";
import { useCharacter } from "src/context/CharacterContext";

function FeatureItem({ item, onUpdate, onDelete }) {
  return (
    <div
      className="feature-box"
      style={{ position: "relative", marginBottom: 8 }}
    >
      <button
        className="delete-feature-btn"
        onClick={onDelete}
        style={{ position: "absolute", top: 4, right: 4, margin: 0 }}
      >
        &times;
      </button>
      <input
        type="text"
        className="feature-title"
        value={item.title || ""}
        onChange={(e) => onUpdate({ ...item, title: e.target.value })}
        placeholder="Feature name..."
        style={{ fontWeight: "bold", marginBottom: 4 }}
      />
      <textarea
        className="feature-desc"
        value={item.desc || ""}
        onChange={(e) => onUpdate({ ...item, desc: e.target.value })}
        placeholder="Description..."
      />
    </div>
  );
}

function FeatureSection({ title, field, addLabel, visible }) {
  const { character, update } = useCharacter();
  if (!visible) return null;
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
    <div className="feature-section" style={{ marginBottom: 24 }}>
      <h3
        className="section-title"
        style={{ fontSize: "1rem", marginBottom: 8 }}
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
      </div>
      <button className="add-feature-btn" onClick={addItem}>
        {addLabel}
      </button>
    </div>
  );
}

const FILTERS = [
  { key: "all", label: "All" },
  { key: "class", label: "Class" },
  { key: "background", label: "Background" },
  { key: "species", label: "Species" },
  { key: "feats", label: "Feats" },
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
        visible={filter === "all" || filter === "feats"}
      />
    </div>
  );
}
