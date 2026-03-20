import { useCharacter } from "src/context/CharacterContext";

const fields = [
  ["languages", "Languages Spoken", "Common, Elvish..."],
  ["personality", "Personality Traits", "Describe your character..."],
  ["ideals", "Ideals", "Beliefs..."],
  ["bonds", "Bonds", "Connections..."],
  ["flaws", "Flaws", "Weaknesses..."],
  ["deity", "Deity", "Deity..."],
  ["notes", "Additional Notes", "Other info..."],
];

export default function NotesTab() {
  const { character, update } = useCharacter();

  return (
    <div className="vertical-list">
      {fields.map(([field, label, placeholder]) => (
        <div key={field} className="field">
          <label className="field-label">{label}</label>
          <textarea
            value={character[field] || ""}
            onChange={(e) => update({ [field]: e.target.value })}
            placeholder={placeholder}
          />
        </div>
      ))}
    </div>
  );
}
