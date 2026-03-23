import { useState, useEffect } from "react";
import { Card, CardHeader, CardBody, Button, Input, Textarea, Divider, Chip } from "@heroui/react";
import { createClient } from "@supabase/supabase-js";
import { Link } from "react-router-dom";

// Supabase schema: see docs/SCHEMAS.md — requires the npcs column on the rooms table.

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ABILITY_KEYS = ["str", "dex", "con", "int", "wis", "cha"];
function calcMod(score) { return Math.floor((score - 10) / 2); }
function fmt(mod) { return mod >= 0 ? `+${mod}` : `${mod}`; }

// D&D 5e saving throw proficiencies by class
const CLASS_SAVE_PROFS = {
  Barbarian: ["str", "con"],
  Bard: ["dex", "cha"],
  Cleric: ["wis", "cha"],
  Druid: ["int", "wis"],
  Fighter: ["str", "con"],
  Monk: ["str", "dex"],
  Paladin: ["wis", "cha"],
  Ranger: ["str", "dex"],
  Rogue: ["dex", "int"],
  Sorcerer: ["con", "cha"],
  Warlock: ["wis", "cha"],
  Wizard: ["int", "wis"],
  Artificer: ["con", "int"],
  "Blood Hunter": ["int", "wis"],
};

// Skill → ability mapping
const SKILL_ABILITY = {
  acrobatics: "dex", animal_handling: "wis", arcana: "int", athletics: "str",
  deception: "cha", history: "int", insight: "wis", intimidation: "cha",
  investigation: "int", medicine: "wis", nature: "int", perception: "wis",
  performance: "cha", persuasion: "cha", religion: "int", sleight_of_hand: "dex",
  stealth: "dex", survival: "wis",
};

// ── Simple NPC card (manually created, old format) ──────────────────────────
function SimpleNpcCard({ npc, onUpdate, onDelete, onToggleEdit }) {
  return (
    <Card shadow="sm" style={{ border: "1px solid var(--gold)" }}>
      {npc.isEditing ? (
        <CardBody className="gap-4 pt-4">
          <Input size="sm" labelPlacement="outside" label="Name" value={npc.name} onValueChange={(v) => onUpdate(npc.id, { name: v })} />
          <div className="flex gap-2">
            <Input size="sm" labelPlacement="outside" label="Race" value={npc.race || ""} onValueChange={(v) => onUpdate(npc.id, { race: v })} />
            <Input size="sm" labelPlacement="outside" label="Role/Occupation" value={npc.role || ""} onValueChange={(v) => onUpdate(npc.id, { role: v })} />
          </div>
          <div className="flex gap-2">
            <Input size="sm" type="number" labelPlacement="outside" label="AC" value={String(npc.ac || 10)} onValueChange={(v) => onUpdate(npc.id, { ac: parseInt(v) || 0 })} />
            <Input size="sm" type="number" labelPlacement="outside" label="HP" value={String(npc.hp || 10)} onValueChange={(v) => onUpdate(npc.id, { hp: parseInt(v) || 0 })} />
          </div>
          <Textarea size="sm" labelPlacement="outside" label="Notes" value={npc.notes || ""} onValueChange={(v) => onUpdate(npc.id, { notes: v })} rows={3} />
          <div className="flex justify-end gap-2 mt-2">
            <Button size="sm" color="danger" variant="light" onPress={() => onDelete(npc.id)}>Delete</Button>
            <Button size="sm" color="success" onPress={() => onToggleEdit(npc.id)}>Save</Button>
          </div>
        </CardBody>
      ) : (
        <>
          <CardHeader className="flex justify-between items-start pb-2">
            <div>
              <h3 className="font-cinzel font-bold text-lg text-red-800 m-0 leading-none">{npc.name}</h3>
              <div className="text-xs text-default-500 mt-1">{npc.race} {npc.role ? `- ${npc.role}` : ""}</div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="flat" onPress={() => onToggleEdit(npc.id)}>Edit</Button>
              <Button size="sm" color="danger" variant="light" onPress={() => onDelete(npc.id)}>Delete</Button>
            </div>
          </CardHeader>
          <Divider style={{ backgroundColor: "var(--gold-light)" }} />
          <CardBody className="gap-2 text-sm pt-2">
            <div className="flex gap-4 mb-1">
              <div><strong>AC:</strong> {npc.ac}</div>
              <div><strong>HP:</strong> {npc.hp}</div>
            </div>
            <div className="whitespace-pre-wrap text-default-700 bg-default-50 p-2 rounded border border-default-200 min-h-[60px]">
              {npc.notes || <em className="text-default-400">No notes.</em>}
            </div>
          </CardBody>
        </>
      )}
    </Card>
  );
}

function FeatureSection({ title, features }) {
  const [open, setOpen] = useState({});
  if (!features?.length) return null;
  return (
    <div className="mt-2">
      <div className="font-cinzel font-bold text-xs uppercase tracking-wide mb-1" style={{ color: "var(--ink-light)" }}>{title}</div>
      <div className="flex flex-col gap-1">
        {features.map((f, i) => (
          <div key={i} className="rounded border border-default-200 bg-default-50 overflow-hidden">
            <button
              className="w-full text-left px-3 py-1.5 flex justify-between items-center text-sm font-semibold"
              style={{ color: "var(--ink)", background: "none", border: "none", cursor: "pointer" }}
              onClick={() => setOpen((o) => ({ ...o, [i]: !o[i] }))}
            >
              <span>{f.title}</span>
              <span className="text-default-400 text-xs">{open[i] ? "▲" : "▼"}</span>
            </button>
            {open[i] && f.desc && (
              <div
                className="px-3 pb-2 text-xs leading-relaxed"
                style={{ color: "var(--ink)", borderTop: "1px dashed var(--gold-light)" }}
                dangerouslySetInnerHTML={{ __html: f.desc }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Full character NPC card (created via character creator) ──────────────────
function CharacterNpcCard({ npc, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  const subLabel = npc.charSubclass ? `${npc.charSubclass} ${npc.charClass}` : npc.charClass;
  const infoLine = [npc.race, subLabel, npc.level ? `Level ${npc.level}` : ""].filter(Boolean).join(" · ");

  const allSpells = [...(npc.cantripsList || []), ...(npc.preparedSpellsList || []), ...(npc.spellsList || [])];
  const cantrips = allSpells.filter((s) => s.level === 0);
  const levSpells = allSpells.filter((s) => s.level > 0);
  const pb = npc.profBonus ?? 0;
  const saveProfs = CLASS_SAVE_PROFS[npc.charClass] || [];
  const saves = ABILITY_KEYS.map((k) => ({
    key: k,
    mod: calcMod(npc[k] ?? 10) + (saveProfs.includes(k) ? pb : 0),
    prof: saveProfs.includes(k),
  }));
  const skillChecks = Object.entries(SKILL_ABILITY).map(([sk, ab]) => ({
    name: sk.replace(/_/g, " "),
    mod: calcMod(npc[ab] ?? 10) + (npc.skillProficiency?.[sk] ? pb : 0),
    prof: !!npc.skillProficiency?.[sk],
  })).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <Card shadow="sm" style={{ border: "2px solid var(--gold)", background: "white" }}>
      <CardHeader className="flex justify-between items-start pb-2" style={{ borderBottom: "1px solid var(--gold-light)" }}>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-cinzel font-bold text-lg m-0 leading-none" style={{ color: "var(--red-dark)" }}>{npc.charName}</h3>
            <Chip size="sm" variant="flat" color="default" className="text-xs">NPC</Chip>
          </div>
          <div className="text-xs text-default-500 mt-1">{infoLine}</div>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button size="sm" variant="flat" onPress={() => setExpanded((e) => !e)}>
            {expanded ? "Collapse" : "Details"}
          </Button>
          <Button size="sm" color="danger" variant="light" onPress={() => onDelete(npc.id)}>Delete</Button>
        </div>
      </CardHeader>

      <CardBody className="gap-3 pt-3">
        {/* Core stats */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div><strong>AC</strong> {npc.baseAC ?? 10}</div>
          <div><strong>HP</strong> {npc.maxHp ?? npc.hp ?? "—"}</div>
          <div><strong>Speed</strong> {npc.speed ?? 30} ft</div>
          {npc.profBonus && <div><strong>Prof</strong> +{npc.profBonus}</div>}
        </div>

        {/* Ability scores */}
        <div className="grid grid-cols-6 gap-1 text-center">
          {ABILITY_KEYS.map((k) => (
            <div key={k} className="flex flex-col items-center bg-default-50 rounded p-1 border border-default-200">
              <span className="font-bold uppercase text-default-500" style={{ fontSize: "0.6rem" }}>{k}</span>
              <span className="font-bold text-sm" style={{ color: "var(--ink)" }}>{npc[k] ?? 10}</span>
              <span className="text-default-400 text-xs">{fmt(calcMod(npc[k] ?? 10))}</span>
            </div>
          ))}
        </div>

        {/* Saving throws */}
        <div>
          <div className="font-cinzel font-bold text-xs uppercase tracking-wide mb-1" style={{ color: "var(--ink-light)" }}>Saving Throws</div>
          <div className="grid grid-cols-6 gap-1 text-center text-xs">
            {saves.map(({ key, mod, prof }) => (
              <div key={key} className={`flex flex-col items-center rounded p-1 border ${prof ? "border-primary-300 bg-primary-50" : "border-default-200 bg-default-50"}`}>
                <span className="font-bold uppercase text-default-500" style={{ fontSize: "0.6rem" }}>{key}</span>
                <span className={`font-bold text-sm ${prof ? "text-primary-600" : ""}`} style={prof ? {} : { color: "var(--ink)" }}>{fmt(mod)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Skill checks */}
        <div>
          <div className="font-cinzel font-bold text-xs uppercase tracking-wide mb-1" style={{ color: "var(--ink-light)" }}>Skills</div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs">
            {skillChecks.map(({ name, mod, prof }) => (
              <div key={name} className="flex justify-between items-center">
                <span className={`capitalize ${prof ? "font-semibold text-primary-600" : "text-default-600"}`}>{name}</span>
                <span className={`font-mono ${prof ? "font-bold text-primary-600" : "text-default-500"}`}>{fmt(mod)}</span>
              </div>
            ))}
          </div>
        </div>

        {expanded && (
          <>
            {/* Spell slots */}
            {npc.spellSlotsData?.length > 0 && (
              <div className="flex flex-wrap gap-2 text-xs mt-1">
                <span className="font-bold text-default-600">Spell Slots:</span>
                {npc.spellSlotsData.map((slot) => (
                  <span key={slot.level} className="bg-default-100 rounded px-2 py-0.5 border border-default-200">
                    L{slot.level}: {slot.total}
                  </span>
                ))}
              </div>
            )}

            {/* Cantrips */}
            {cantrips.length > 0 && (
              <div className="text-xs">
                <span className="font-bold text-default-600">Cantrips: </span>
                {cantrips.map((s) => s.name).join(", ")}
              </div>
            )}

            {/* Leveled spells */}
            {levSpells.length > 0 && (
              <div className="text-xs">
                <span className="font-bold text-default-600">Spells: </span>
                {levSpells.map((s) => `${s.name} (${s.level})`).join(", ")}
              </div>
            )}

            {/* Features by category */}
            <FeatureSection title="Class & Subclass Features" features={npc.classFeatures} />
            <FeatureSection title="Species Features" features={npc.raceFeatures} />
            <FeatureSection title="Background Features" features={npc.backgroundFeatures} />
            <FeatureSection title="Feats" features={npc.feats} />
          </>
        )}
      </CardBody>
    </Card>
  );
}

// ── Main NPCManager ──────────────────────────────────────────────────────────

export default function NPCManager({ roomId }) {
  const [npcs, setNpcs] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Load — from Supabase if in a room, localStorage otherwise
  useEffect(() => {
    if (roomId) {
      supabase.from("rooms").select("npcs").eq("id", roomId).single().then(({ data }) => {
        setNpcs(data?.npcs || []);
        setLoaded(true);
      });
    } else {
      try {
        const saved = localStorage.getItem("dnd_npcs_global");
        setNpcs(saved ? JSON.parse(saved) : []);
      } catch { setNpcs([]); }
      setLoaded(true);
    }
  }, [roomId]);

  // Save — debounced to Supabase when in a room, immediate to localStorage otherwise
  useEffect(() => {
    if (!loaded) return;
    if (!roomId) {
      localStorage.setItem("dnd_npcs_global", JSON.stringify(npcs));
      return;
    }
    const timer = setTimeout(() => {
      supabase.from("rooms").update({ npcs }).eq("id", roomId);
    }, 1000);
    return () => clearTimeout(timer);
  }, [npcs, roomId, loaded]);

  const addSimpleNpc = () => {
    setNpcs([{ id: Date.now().toString(), name: "New NPC", race: "", role: "", ac: 10, hp: 10, notes: "", isEditing: true }, ...npcs]);
  };

  const updateNpc = (id, updates) => {
    setNpcs(npcs.map((n) => (n.id === id ? { ...n, ...updates } : n)));
  };

  const deleteNpc = (id) => {
    if (window.confirm("Delete this NPC?")) setNpcs(npcs.filter((n) => n.id !== id));
  };

  const toggleEdit = (id) => {
    setNpcs(npcs.map((n) => (n.id === id ? { ...n, isEditing: !n.isEditing } : n)));
  };

  const filtered = npcs.filter((n) =>
    (n.charName || n.name || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center gap-4">
        <Input
          size="sm"
          placeholder="Search NPCs..."
          value={searchTerm}
          onValueChange={setSearchTerm}
          className="max-w-xs"
        />
        <div className="flex gap-2">
          <Button
            as={Link}
            to="/create"
            color="secondary"
            variant="flat"
            className="font-cinzel font-bold"
          >
            + From Creator
          </Button>
          <Button color="primary" onPress={addSimpleNpc} className="font-cinzel font-bold">
            + Quick NPC
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((npc) =>
          npc.isNpc || npc.charClass !== undefined ? (
            <CharacterNpcCard key={npc.id} npc={npc} onDelete={deleteNpc} />
          ) : (
            <SimpleNpcCard key={npc.id} npc={npc} onUpdate={updateNpc} onDelete={deleteNpc} onToggleEdit={toggleEdit} />
          )
        )}
        {filtered.length === 0 && (
          <div className="col-span-full text-center p-8 text-default-400 italic">
            No NPCs yet. Use "+ From Creator" to build a full NPC or "+ Quick NPC" for a simple one.
          </div>
        )}
      </div>
    </div>
  );
}
