import { useState, useEffect } from "react";
import { Input, Chip } from "@heroui/react";
import { openDB, STORE_NAME } from "src/utils/db";
import { processEntries } from "src/utils/dndEntries";

// ─── Built-in fallback rules ────────────────────────────────────────────────
// Always shown even without imported data

const BUILTIN = [
  {
    name: "Conditions",
    source: "Core",
    entries: [
      { type: "entries", name: "Blinded", entries: ["Can't see. Auto-fails sight checks. Attackers have advantage; creature has disadvantage on attacks."] },
      { type: "entries", name: "Charmed", entries: ["Can't attack the charmer or target them with harmful effects. Charmer has advantage on social checks with the creature."] },
      { type: "entries", name: "Deafened", entries: ["Can't hear. Auto-fails hearing checks."] },
      {
        type: "entries", name: "Exhaustion", entries: [{
          type: "table", caption: "Exhaustion Levels", colLabels: ["Level", "Effect"],
          rows: [["1", "Disadvantage on ability checks"], ["2", "Speed halved"], ["3", "Disadvantage on attacks & saves"], ["4", "HP max halved"], ["5", "Speed = 0"], ["6", "Death"]],
        }],
      },
      { type: "entries", name: "Frightened", entries: ["Disadvantage on ability checks and attacks while source is in sight. Can't move closer to source."] },
      { type: "entries", name: "Grappled", entries: ["Speed = 0. Ends if grappler is incapacitated or creature is moved out of reach."] },
      { type: "entries", name: "Incapacitated", entries: ["Can't take actions or reactions."] },
      { type: "entries", name: "Invisible", entries: ["Can't be seen without magic. Heavily obscured for hiding. Attackers have disadvantage; creature has advantage on attacks."] },
      { type: "entries", name: "Paralyzed", entries: ["Incapacitated. Can't move or speak. Auto-fails Str/Dex saves. Attackers have advantage. Hits within 5 ft are critical."] },
      { type: "entries", name: "Petrified", entries: ["Transformed to stone. Incapacitated, unaware, weight ×10. Advantage on attacks against it. Auto-fails Str/Dex saves. Resistance to all damage. Immune to poison/disease."] },
      { type: "entries", name: "Poisoned", entries: ["Disadvantage on attack rolls and ability checks."] },
      { type: "entries", name: "Prone", entries: ["Only movement is crawling (costs double) unless it stands (half speed). Disadvantage on attacks. Melee attackers within 5 ft have advantage; ranged attackers have disadvantage."] },
      { type: "entries", name: "Restrained", entries: ["Speed = 0. Attackers have advantage. Creature has disadvantage on attacks and Dex saves."] },
      { type: "entries", name: "Stunned", entries: ["Incapacitated, can't move, can speak only falteringly. Auto-fails Str/Dex saves. Attackers have advantage."] },
      { type: "entries", name: "Unconscious", entries: ["Incapacitated, can't move/speak, unaware. Drops held items, falls prone. Auto-fails Str/Dex saves. Attackers have advantage. Hits within 5 ft are critical."] },
    ],
  },
  {
    name: "Cover",
    source: "Core",
    entries: [{
      type: "table", caption: "Cover", colLabels: ["Type", "Benefit"],
      rows: [["Half (wall to waist)", "+2 AC and Dex saves"], ["¾ (wall to shoulder)", "+5 AC and Dex saves"], ["Full", "Can't be targeted"]],
    }],
  },
  {
    name: "Concentration",
    source: "Core",
    entries: [
      "Only one concentration spell at a time. Casting another ends the current one.",
      { type: "list", items: [
        "Taking damage → Con save DC 10 or half damage taken (whichever is higher).",
        "Incapacitated or killed → concentration ends automatically.",
        "DM can rule that environmental hazards also require a save.",
      ]},
    ],
  },
  {
    name: "Spellcasting",
    source: "Core",
    entries: [
      { type: "entries", name: "Components", entries: [{ type: "list", items: ["V — verbal (must be able to speak)", "S — somatic (must have a free hand)", "M — material (consumed only if the spell says so)"]}]},
      { type: "entries", name: "Spell Attack Roll", entries: ["Spell attack bonus = proficiency bonus + spellcasting ability modifier."]},
      { type: "entries", name: "Saving Throw DC", entries: ["Spell save DC = 8 + proficiency bonus + spellcasting ability modifier."]},
    ],
  },
  {
    name: "Actions in Combat",
    source: "Core",
    entries: [{ type: "list", items: [
      "Attack — one attack (or more with Extra Attack).",
      "Cast a Spell — action cost varies by spell.",
      "Dash — gain extra movement equal to speed.",
      "Disengage — movement doesn't provoke opportunity attacks.",
      "Dodge — attackers have disadvantage; Dex saves have advantage. Requires you can see attacker.",
      "Help — give an ally advantage on their next ability check or attack (if within 5 ft).",
      "Hide — Dex (Stealth) check.",
      "Ready — prepare an action for a trigger, using your reaction when triggered.",
      "Search — Wis (Perception) or Int (Investigation) check.",
      "Use an Object — interact with a second object (first is free).",
    ]}],
  },
  {
    name: "Bonus Action & Reaction",
    source: "Core",
    entries: [
      { type: "entries", name: "Bonus Action", entries: ["Only one per turn. Only usable if a feature, spell, or ability grants it."] },
      { type: "entries", name: "Reaction", entries: ["One per round (resets at start of your turn). Used for opportunity attacks, readied actions, and class features like Shield or Uncanny Dodge."] },
      { type: "entries", name: "Opportunity Attack", entries: ["Triggered when a hostile creature you can see leaves your reach. Use your reaction to make one melee attack."] },
    ],
  },
  {
    name: "Movement & Position",
    source: "Core",
    entries: [{ type: "list", items: [
      "You can split your movement before and after actions.",
      "Difficult terrain costs 1 extra foot per foot moved.",
      "Crawling costs 1 extra foot per foot (prone).",
      "Climbing/swimming costs 1 extra foot (unless a speed applies).",
      "High jump: 3 + Str modifier feet (running), half that standing.",
      "Long jump: Str score in feet (running), half that standing.",
    ]}],
  },
  {
    name: "Grappling & Shoving",
    source: "Core",
    entries: [
      { type: "entries", name: "Grapple", entries: ["Attack action, one free hand. Contested: your Str (Athletics) vs target's Str (Athletics) or Dex (Acrobatics). Success → target is Grappled. Can drag/carry grappled creature at half speed."] },
      { type: "entries", name: "Shove", entries: ["Attack action. Contested: your Str (Athletics) vs target's Str (Athletics) or Dex (Acrobatics). Choose to knock Prone or push 5 ft away. Target must be no more than one size larger."] },
    ],
  },
  {
    name: "Death & Dying",
    source: "Core",
    entries: [
      "At 0 HP a creature falls unconscious and must make death saving throws.",
      { type: "list", items: [
        "Roll a d20 at the start of each turn (no modifiers).",
        "10 or higher = success. 3 successes → stable (unconscious at 0 HP).",
        "9 or lower = failure. 3 failures → dead.",
        "Roll of 1 = 2 failures. Roll of 20 = regain 1 HP.",
        "Taking any damage while at 0 HP = 1 death save failure; a critical hit = 2 failures.",
        "Healing (any amount) ends the condition and restores that many HP.",
      ]},
    ],
  },
  {
    name: "Resting",
    source: "Core",
    entries: [
      { type: "entries", name: "Short Rest (1 hour)", entries: ["Spend one or more Hit Dice (d + Con modifier, minimum 0). Recover features that recharge on a short rest."] },
      { type: "entries", name: "Long Rest (8 hours)", entries: ["Regain all HP. Regain up to half your total Hit Dice (minimum 1). Recover features that recharge on a long rest. Requires 6 hours sleep. Can only benefit once per 24 hours."] },
    ],
  },
  {
    name: "Ability Checks & Saves",
    source: "Core",
    entries: [
      { type: "table", caption: "Difficulty Classes", colLabels: ["Difficulty", "DC"],
        rows: [["Very Easy", "5"], ["Easy", "10"], ["Medium", "15"], ["Hard", "20"], ["Very Hard", "25"], ["Nearly Impossible", "30"]],
      },
      { type: "entries", name: "Advantage / Disadvantage", entries: ["Roll two d20s. Take the higher (advantage) or lower (disadvantage). They cancel out if you have both."] },
      { type: "entries", name: "Passive Perception", entries: ["10 + Wis (Perception) modifier. Used when not actively searching."] },
    ],
  },
  {
    name: "Two-Weapon Fighting",
    source: "Core",
    entries: [
      "When you Attack with a light melee weapon in one hand, use a bonus action to attack with a different light melee weapon in the other hand.",
      "Don't add your ability modifier to the bonus attack damage (unless negative).",
    ],
  },
  {
    name: "Flanking (Optional)",
    source: "Optional",
    entries: ["When you and an ally are on opposite sides of an enemy, you both have advantage on melee attacks against it."],
  },
];

// ─── Component ───────────────────────────────────────────────────────────────

export default function DMRulesTab() {
  const [rules, setRules] = useState(BUILTIN);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState(BUILTIN[0]);
  const [sources, setSources] = useState(["All", "Core", "Optional"]);
  const [activeSource, setActiveSource] = useState("All");

  useEffect(() => {
    (async () => {
      try {
        const db = await openDB();
        const data = await new Promise((resolve) => {
          const req = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get("currentData");
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => resolve(null);
        });
        if (!data) return;
        const extra = [];
        data.forEach((file) => {
          if (!file.name.toLowerCase().endsWith(".json")) return;
          try {
            const json = JSON.parse(file.content);
            (json.variantrule || []).forEach((r) => {
              if (r.name && r.entries) extra.push(r);
            });
          } catch {}
        });
        if (extra.length === 0) return;
        const combined = [...BUILTIN, ...extra];
        const srcSet = new Set(combined.map((r) => r.source).filter(Boolean));
        setSources(["All", ...srcSet]);
        setRules(combined);
      } catch {}
    })();
  }, []);

  const filtered = rules.filter((r) => {
    const matchSearch = !search || r.name.toLowerCase().includes(search.toLowerCase());
    const matchSrc = activeSource === "All" || r.source === activeSource;
    return matchSearch && matchSrc;
  });

  return (
    <div className="flex gap-4 h-full" style={{ minHeight: 0 }}>
      {/* ── Left list ── */}
      <div className="flex flex-col gap-2 shrink-0" style={{ width: 260 }}>
        <Input
          size="sm"
          placeholder="Search rules…"
          value={search}
          onValueChange={setSearch}
          isClearable
          onClear={() => setSearch("")}
        />
        {sources.length > 3 && (
          <div className="flex flex-wrap gap-1">
            {["All", "Core", "Optional"].concat(
              sources.filter((s) => s !== "All" && s !== "Core" && s !== "Optional")
            ).slice(0, 10).map((src) => (
              <Chip
                key={src}
                size="sm"
                variant={activeSource === src ? "solid" : "bordered"}
                color={activeSource === src ? "primary" : "default"}
                className="cursor-pointer select-none"
                onClick={() => setActiveSource(src)}
              >
                {src}
              </Chip>
            ))}
          </div>
        )}
        <div className="flex flex-col gap-0.5 overflow-y-auto flex-1" style={{ maxHeight: "calc(100vh - 300px)" }}>
          {filtered.map((r, i) => (
            <button
              key={`${r.name}|${r.source}|${i}`}
              onClick={() => setSelected(r)}
              className={`text-left px-3 py-2 rounded text-sm transition-colors ${
                selected === r
                  ? "bg-red-800 text-white"
                  : "hover:bg-default-100 text-default-700"
              }`}
            >
              <div className="font-semibold truncate leading-tight">{r.name}</div>
              {r.source && r.source !== "Core" && (
                <div className={`text-xs truncate ${selected === r ? "text-red-200" : "text-default-400"}`}>
                  {r.source}{r.page ? ` · p.${r.page}` : ""}
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Right: rule content ── */}
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: "calc(100vh - 220px)" }}>
        {!selected ? (
          <div className="flex items-center justify-center h-48 text-default-400 italic text-sm">
            Select a rule to view.
          </div>
        ) : (
          <div className="rounded-lg p-5" style={{ border: "2px solid var(--gold)", background: "white" }}>
            <h2 className="font-cinzel font-bold text-xl mb-1" style={{ color: "var(--red-dark)" }}>
              {selected.name}
            </h2>
            {selected.source && selected.source !== "Core" && (
              <div className="text-xs text-default-400 mb-3">
                {selected.source}{selected.page ? ` · p.${selected.page}` : ""}
              </div>
            )}
            <div
              className="text-sm leading-relaxed"
              style={{ color: "var(--ink)" }}
              dangerouslySetInnerHTML={{ __html: processEntries(selected.entries) }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
