import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Button,
  Card, CardBody, CardHeader,
  Chip,
  Checkbox,
  Divider,
  Input,
  Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure,
  Select, SelectItem,
  Table, TableHeader, TableColumn, TableBody, TableRow, TableCell,
  Tooltip,
} from "@heroui/react";
import Sidebar, { SidebarBtn } from "src/components/Sidebar";
import { processEntries, cleanText } from "src/utils/dndEntries";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DEFAULT_DM_DATA = { players: [], sessions: [], sessionCounter: 0 };

function useDMData() {
  const [data, setData] = useState(() => {
    try {
      const saved = localStorage.getItem("dmScreenData");
      return saved ? { ...DEFAULT_DM_DATA, ...JSON.parse(saved) } : { ...DEFAULT_DM_DATA };
    } catch { return { ...DEFAULT_DM_DATA }; }
  });
  useEffect(() => { localStorage.setItem("dmScreenData", JSON.stringify(data)); }, [data]);
  return [data, setData];
}

// ─── Stats Modal ───────────────────────────────────────────────────────────────

function StatsModal({ isOpen, onClose, rolls }) {
  const totals = {};
  let totalRolls = 0, totalSum = 0, nat20 = 0, nat1 = 0;
  Object.entries(rolls || {}).forEach(([val, bucket]) => {
    const v = parseInt(val);
    Object.entries(bucket).forEach(([player, count]) => {
      totals[player] = (totals[player] || 0) + count;
      totalRolls += count;
      totalSum += v * count;
      if (v === 20) nat20 += count;
      if (v === 1) nat1 += count;
    });
  });
  const avg = totalRolls > 0 ? (totalSum / totalRolls).toFixed(1) : "—";
  const sorted = Object.entries(totals).sort((a, b) => b[1] - a[1]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        {(close) => (
          <>
            <ModalHeader className="font-cinzel" style={{ color: "var(--red-dark)" }}>
              Session Statistics
            </ModalHeader>
            <ModalBody>
              <div className="flex justify-center gap-6 text-sm mb-4">
                <span>Nat 20s: <strong className="text-green-600">{nat20}</strong></span>
                <span>Nat 1s: <strong className="text-red-700">{nat1}</strong></span>
                <span>Avg Roll: <strong>{avg}</strong></span>
              </div>
              {sorted.length === 0 ? (
                <p className="text-center italic text-sm" style={{ color: "var(--ink-light)" }}>No rolls recorded.</p>
              ) : (
                <Table aria-label="Roll stats" removeWrapper>
                  <TableHeader>
                    <TableColumn className="font-cinzel text-xs">Player</TableColumn>
                    <TableColumn className="font-cinzel text-xs text-right">Total Rolls</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {sorted.map(([p, c]) => (
                      <TableRow key={p}>
                        <TableCell className="font-semibold">{p}</TableCell>
                        <TableCell className="text-right font-bold">{c}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={close}>Close</Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

// ─── MVP Modal ─────────────────────────────────────────────────────────────────

function MVPModal({ isOpen, onClose, logs }) {
  const dmgMap = {};
  let totalDmg = 0, highestHit = 0;
  (logs || []).forEach((log) => {
    if (!log.includes("(Hit)")) return;
    const match = log.match(/<strong>([^<]+)<\/strong>[^f]*for (\d+) damage/);
    if (match) {
      const player = match[1];
      const dmg = parseInt(match[2]) || 0;
      dmgMap[player] = (dmgMap[player] || 0) + dmg;
      totalDmg += dmg;
      if (dmg > highestHit) highestHit = dmg;
    }
  });
  const sorted = Object.entries(dmgMap).sort((a, b) => b[1] - a[1]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalContent>
        {(close) => (
          <>
            <ModalHeader className="font-cinzel" style={{ color: "var(--red-dark)" }}>
              ⚔ Battle MVP Tracker
            </ModalHeader>
            <ModalBody>
              <div className="flex justify-center gap-6 text-sm mb-4">
                <span>Total Damage: <strong style={{ color: "var(--red-dark)" }}>{totalDmg}</strong></span>
                <span>Highest Hit: <strong>{highestHit}</strong></span>
              </div>
              {sorted.length === 0 ? (
                <p className="text-center italic text-sm" style={{ color: "var(--ink-light)" }}>No combat data yet.</p>
              ) : (
                <Table aria-label="MVP stats" removeWrapper>
                  <TableHeader>
                    <TableColumn className="font-cinzel text-xs">Player</TableColumn>
                    <TableColumn className="font-cinzel text-xs text-right">Damage</TableColumn>
                    <TableColumn className="font-cinzel text-xs text-right">Share</TableColumn>
                  </TableHeader>
                  <TableBody>
                    {sorted.map(([p, d]) => (
                      <TableRow key={p}>
                        <TableCell className="font-semibold">{p}</TableCell>
                        <TableCell className="text-right font-bold" style={{ color: "var(--red-dark)" }}>{d}</TableCell>
                        <TableCell className="text-right text-sm" style={{ color: "var(--ink-light)" }}>
                          {totalDmg > 0 ? Math.round((d / totalDmg) * 100) : 0}%
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={close}>Close</Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

// ─── Initiative Tracker ────────────────────────────────────────────────────────

function InitiativeTracker({ session, players, monsters, onUpdate }) {
  const [newName, setNewName] = useState("");
  const [newInit, setNewInit] = useState("");
  const [useMonster, setUseMonster] = useState(false);
  const initiative = session.initiative || [];

  const addEntry = () => {
    if (!newName || !newInit) return;
    const updated = [...initiative, { name: newName, val: parseInt(newInit) || 0 }];
    updated.sort((a, b) => b.val - a.val);
    onUpdate({ ...session, initiative: updated });
    setNewName("");
    setNewInit("");
  };

  return (
    <Card shadow="sm" className="mb-3">
      <CardHeader className="pb-2 flex justify-between items-center">
        <span className="font-cinzel text-sm font-bold" style={{ color: "var(--ink)" }}>Initiative Order</span>
        <Button
          size="sm" variant="flat" color="danger"
          onPress={() => { if (window.confirm("Clear all initiative?")) onUpdate({ ...session, initiative: [] }); }}
        >
          Clear
        </Button>
      </CardHeader>
      <Divider />
      <CardBody className="pt-2 gap-2">
        <div className="flex flex-col gap-1 min-h-[40px]">
          {initiative.length === 0
            ? <p className="text-xs italic text-center py-1" style={{ color: "var(--ink-light)" }}>No entries. Add below.</p>
            : initiative.map((entry, i) => (
                <div key={i} className="flex items-center justify-between px-3 py-1.5 rounded-lg"
                  style={{ background: "rgba(255,255,255,0.8)", border: "1px solid var(--gold)" }}>
                  <span className="font-semibold text-sm">{entry.name}</span>
                  <div className="flex items-center gap-2">
                    <Chip size="sm" variant="flat" style={{ background: "var(--red)", color: "white" }}>
                      {entry.val}
                    </Chip>
                    <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => onUpdate({ ...session, initiative: initiative.filter((_, j) => j !== i) })}>
                      ×
                    </Button>
                  </div>
                </div>
              ))
          }
        </div>
        <div className="flex gap-2 mt-1">
          <Select
            size="sm"
            placeholder={useMonster ? "Select Monster" : "Select Player"}
            selectedKeys={newName ? new Set([newName]) : new Set()}
            onSelectionChange={(keys) => setNewName([...keys][0] || "")}
            className="flex-1"
          >
            {(useMonster ? (monsters || []) : players).map(n => (
              <SelectItem key={n}>{n}</SelectItem>
            ))}
          </Select>
          <Tooltip content={useMonster ? "Switch to players" : "Switch to monsters"}>
            <Button isIconOnly size="sm" variant="bordered" onPress={() => { setUseMonster(!useMonster); setNewName(""); }}>
              {useMonster ? "P" : "M"}
            </Button>
          </Tooltip>
          <Input
            size="sm" type="number" placeholder="Init"
            value={newInit} onValueChange={setNewInit}
            className="w-16"
            onKeyDown={(e) => e.key === "Enter" && addEntry()}
          />
          <Button size="sm" variant="bordered" onPress={addEntry}>Add</Button>
        </div>
      </CardBody>
    </Card>
  );
}

// ─── Dice Rolls ────────────────────────────────────────────────────────────────

function DiceRolls({ session, players, onUpdate, onShowStats }) {
  const [rollPlayer, setRollPlayer] = useState("");
  const [rollValue, setRollValue] = useState("");
  const rolls = session.rolls || {};

  const addRoll = () => {
    if (!rollPlayer || !rollValue) return;
    const val = parseInt(rollValue);
    if (val < 1 || val > 20) return;
    const key = String(val);
    const current = rolls[key] || {};
    onUpdate({ ...session, rolls: { ...rolls, [key]: { ...current, [rollPlayer]: (current[rollPlayer] || 0) + 1 } } });
    setRollValue("");
  };

  return (
    <Card shadow="sm">
      <CardHeader className="pb-2 flex justify-between items-center">
        <span className="font-cinzel text-sm font-bold" style={{ color: "var(--ink)" }}>Dice Rolls (d20)</span>
        <Button size="sm" variant="flat" onPress={onShowStats}>Stats</Button>
      </CardHeader>
      <Divider />
      <CardBody className="pt-2">
        <div className="grid grid-cols-10 gap-1 mb-3">
          {Array.from({ length: 20 }, (_, i) => 20 - i).map((val) => {
            const bucket = rolls[String(val)] || {};
            const entries = Object.entries(bucket);
            const isNat20 = val === 20;
            const isNat1 = val === 1;
            return (
              <div key={val} className="rounded-lg text-center overflow-hidden"
                style={{
                  border: `1px solid ${isNat20 ? "#16a34a" : isNat1 ? "#dc2626" : "var(--gold)"}`,
                  background: isNat20 ? "#f0fdf4" : isNat1 ? "#fef2f2" : "white",
                  minHeight: 52,
                }}>
                <div className="text-xs font-bold py-0.5 border-b"
                  style={{
                    color: isNat20 ? "#16a34a" : isNat1 ? "#dc2626" : "var(--ink)",
                    borderColor: isNat20 ? "#bbf7d0" : isNat1 ? "#fecaca" : "#f0f0f0",
                  }}>
                  {val}
                </div>
                <div className="flex flex-wrap gap-0.5 justify-center p-0.5">
                  {entries.map(([player, count]) => (
                    <Tooltip key={player} content={`${player}: ${count} roll(s) — click to remove`} size="sm">
                      <span
                        className="cursor-pointer rounded px-0.5 text-[0.5rem] leading-4 font-cinzel"
                        style={{ background: "var(--parchment-dark)", border: "1px solid var(--gold-dark)", display: "inline-block" }}
                        onClick={() => {
                          if (!window.confirm(`Remove ${player}'s roll of ${val}?`)) return;
                          const newBucket = { ...bucket };
                          if (newBucket[player] > 1) newBucket[player]--;
                          else delete newBucket[player];
                          const newRolls = { ...rolls };
                          if (Object.keys(newBucket).length === 0) delete newRolls[String(val)];
                          else newRolls[String(val)] = newBucket;
                          onUpdate({ ...session, rolls: newRolls });
                        }}
                      >
                        {player}{count > 1 ? ` ×${count}` : ""}
                      </span>
                    </Tooltip>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
        <div className="flex gap-2">
          <Select
            size="sm" placeholder="Select Player"
            selectedKeys={rollPlayer ? new Set([rollPlayer]) : new Set()}
            onSelectionChange={(keys) => setRollPlayer([...keys][0] || "")}
            className="flex-1"
          >
            {players.map(p => <SelectItem key={p}>{p}</SelectItem>)}
          </Select>
          <Input
            size="sm" type="number" placeholder="1–20"
            value={rollValue} onValueChange={setRollValue}
            className="w-20"
            min={1} max={20}
            onKeyDown={(e) => e.key === "Enter" && addRoll()}
          />
          <Button size="sm" variant="bordered" onPress={addRoll}>Add</Button>
        </div>
      </CardBody>
    </Card>
  );
}

// ─── Monsters List ─────────────────────────────────────────────────────────────

function MonstersList({ session, onUpdate }) {
  const [monsterInput, setMonsterInput] = useState("");
  const monsters = session.monsters || [];

  const addMonster = () => {
    if (!monsterInput.trim()) return;
    onUpdate({ ...session, monsters: [...monsters, monsterInput.trim()] });
    setMonsterInput("");
  };

  return (
    <Card shadow="sm" className="mb-3">
      <CardHeader className="pb-2 flex justify-between items-center">
        <span className="font-cinzel text-sm font-bold" style={{ color: "var(--ink)" }}>Monsters</span>
        <Button
          size="sm" variant="flat" color="danger"
          onPress={() => { if (window.confirm("Clear all monsters?")) onUpdate({ ...session, monsters: [] }); }}
        >
          Clear
        </Button>
      </CardHeader>
      <Divider />
      <CardBody className="pt-2 gap-2">
        <div className="flex flex-wrap gap-1.5 min-h-[28px]">
          {monsters.length === 0
            ? <p className="text-xs italic" style={{ color: "var(--ink-light)" }}>No monsters added.</p>
            : monsters.map((m, i) => (
                <Chip
                  key={i}
                  onClose={() => onUpdate({ ...session, monsters: monsters.filter((_, j) => j !== i) })}
                  variant="bordered"
                  size="sm"
                  className="font-semibold"
                >
                  {m}
                </Chip>
              ))
          }
        </div>
        <div className="flex gap-2">
          <Input
            size="sm" placeholder="Monster name"
            value={monsterInput} onValueChange={setMonsterInput}
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && addMonster()}
          />
          <Button size="sm" variant="bordered" onPress={addMonster}>Add</Button>
        </div>
      </CardBody>
    </Card>
  );
}

// ─── Battle Log ────────────────────────────────────────────────────────────────

function BattleLog({ session, players, onUpdate, onShowMVP }) {
  const [logPlayer, setLogPlayer] = useState("");
  const [logAction, setLogAction] = useState("attacked");
  const [logMonster, setLogMonster] = useState("");
  const [logOutcome, setLogOutcome] = useState("succeed");
  const [logDamage, setLogDamage] = useState("");
  const logs = session.logs || [];
  const monsters = session.monsters || [];

  const addLog = () => {
    if (!logPlayer) return;
    const dmg = logDamage && logOutcome === "succeed"
      ? ` for <span style="color:var(--red-dark);font-weight:bold;">${logDamage}</span> damage`
      : "";
    const entry = `<strong>${logPlayer}</strong> ${logAction} <em>${logMonster || "???"}</em> ${logOutcome === "succeed" ? "(Hit)" : "(Miss)"}${dmg}`;
    onUpdate({ ...session, logs: [...logs, entry] });
    setLogDamage("");
  };

  return (
    <Card shadow="sm">
      <CardHeader className="pb-2 flex justify-between items-center">
        <span className="font-cinzel text-sm font-bold" style={{ color: "var(--ink)" }}>Battle Log</span>
        <div className="flex gap-2">
          <Button size="sm" variant="flat" onPress={onShowMVP}>⚔ MVP</Button>
          <Button
            size="sm" variant="flat" color="danger"
            onPress={() => { if (window.confirm("Clear all battle logs?")) onUpdate({ ...session, logs: [] }); }}
          >
            Clear
          </Button>
        </div>
      </CardHeader>
      <Divider />
      <CardBody className="pt-2 gap-3">
        <div className="overflow-y-auto rounded-lg p-2" style={{ maxHeight: 180, border: "1px solid var(--gold)", background: "white" }}>
          {logs.length === 0
            ? <p className="text-xs italic" style={{ color: "var(--ink-light)" }}>No entries yet.</p>
            : logs.map((log, i) => (
                <div key={i} className="flex items-center justify-between py-1"
                  style={{ borderBottom: i < logs.length - 1 ? "1px dashed var(--gold)" : "none" }}>
                  <span className="text-sm flex-1" dangerouslySetInnerHTML={{ __html: log }} />
                  <Button
                    isIconOnly size="sm" variant="light" color="danger"
                    onPress={() => onUpdate({ ...session, logs: logs.filter((_, j) => j !== i) })}
                    className="ml-2 flex-shrink-0 min-w-6 h-6 w-6"
                  >
                    ×
                  </Button>
                </div>
              ))
          }
        </div>
        <div className="flex flex-wrap gap-2">
          <Select
            size="sm" placeholder="Player"
            selectedKeys={logPlayer ? new Set([logPlayer]) : new Set()}
            onSelectionChange={(keys) => setLogPlayer([...keys][0] || "")}
            className="flex-1 min-w-[110px]"
          >
            {players.map(p => <SelectItem key={p}>{p}</SelectItem>)}
          </Select>
          <Select
            size="sm"
            selectedKeys={new Set([logAction])}
            onSelectionChange={(keys) => setLogAction([...keys][0] || "attacked")}
            className="w-44"
          >
            <SelectItem key="attacked">attacked</SelectItem>
            <SelectItem key="was attacked by">was attacked by</SelectItem>
          </Select>
          <Select
            size="sm" placeholder="Target"
            selectedKeys={logMonster ? new Set([logMonster]) : new Set()}
            onSelectionChange={(keys) => setLogMonster([...keys][0] || "")}
            className="flex-1 min-w-[110px]"
          >
            {monsters.map(m => <SelectItem key={m}>{m}</SelectItem>)}
          </Select>
          <Select
            size="sm"
            selectedKeys={new Set([logOutcome])}
            onSelectionChange={(keys) => setLogOutcome([...keys][0] || "succeed")}
            className="w-36"
          >
            <SelectItem key="succeed">Hit</SelectItem>
            <SelectItem key="fail">Miss</SelectItem>
          </Select>
          <Input
            size="sm" type="number" placeholder="Damage"
            value={logDamage} onValueChange={setLogDamage}
            className="w-24"
          />
          <Button size="sm" color="primary" onPress={addLog}>Log</Button>
        </div>
      </CardBody>
    </Card>
  );
}

// ─── Session ───────────────────────────────────────────────────────────────────

function Session({ session, players, onUpdate, onDelete }) {
  const [collapsed, setCollapsed] = useState(false);
  const [title, setTitle] = useState(session.title);
  const [editing, setEditing] = useState(false);
  const { isOpen: statsOpen, onOpen: onStatsOpen, onClose: onStatsClose } = useDisclosure();
  const { isOpen: mvpOpen, onOpen: onMVPOpen, onClose: onMVPClose } = useDisclosure();

  const handleRename = () => {
    if (editing) { onUpdate({ ...session, title }); setEditing(false); }
    else setEditing(true);
  };

  return (
    <Card shadow="md" className="mb-5" style={{ border: "2px solid var(--gold)", background: "var(--parchment-dark)" }}>
      <CardHeader
        className="flex justify-between items-center"
        style={{ borderBottom: "1px solid var(--gold)", paddingBottom: 10 }}
      >
        {editing ? (
          <Input
            value={title} onValueChange={setTitle}
            onBlur={handleRename}
            onKeyDown={(e) => e.key === "Enter" && handleRename()}
            autoFocus size="sm" variant="underlined"
            classNames={{ input: "font-cinzel font-bold text-lg" }}
          />
        ) : (
          <h2
            className="font-cinzel font-bold text-lg cursor-pointer m-0"
            style={{ color: "var(--ink)" }}
            title="Click to rename"
            onClick={handleRename}
          >
            {session.title}
          </h2>
        )}
        <div className="flex gap-2">
          <Button size="sm" variant="bordered" isIconOnly onPress={() => setCollapsed(!collapsed)}>
            {collapsed ? "+" : "−"}
          </Button>
          <Button
            size="sm" variant="bordered" color="danger" isIconOnly
            onPress={() => { if (window.confirm("Delete this session?")) onDelete(); }}
          >
            ×
          </Button>
        </div>
      </CardHeader>

      {!collapsed && (
        <CardBody className="gap-4">
          <div className="grid grid-cols-2 gap-4">
            <DiceRolls session={session} players={players} onUpdate={onUpdate} onShowStats={onStatsOpen} />
            <div>
              <MonstersList session={session} onUpdate={onUpdate} />
              <InitiativeTracker session={session} players={players} monsters={session.monsters || []} onUpdate={onUpdate} />
            </div>
          </div>
          <BattleLog session={session} players={players} onUpdate={onUpdate} onShowMVP={onMVPOpen} />
        </CardBody>
      )}

      <StatsModal isOpen={statsOpen} onClose={onStatsClose} rolls={session.rolls} />
      <MVPModal isOpen={mvpOpen} onClose={onMVPClose} logs={session.logs} />
    </Card>
  );
}

// ─── Shop Generator ────────────────────────────────────────────────────────────

const DB_NAME = "DndDataDB";
const STORE_NAME = "files";
const DB_VERSION = 7;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onblocked = () => console.warn("IndexedDB blocked.");
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (db.objectStoreNames.contains(STORE_NAME)) db.deleteObjectStore(STORE_NAME);
      db.createObjectStore(STORE_NAME);
    };
  });
}

const RARITIES = ["Common", "Uncommon", "Rare", "Very Rare", "Legendary", "Artifact"];
const TYPE_MAP = {
  HA: "Heavy Armor", MA: "Medium Armor", LA: "Light Armor", S: "Shield",
  M: "Melee Weapon", R: "Ranged Weapon", A: "Ammunition", RD: "Rod", ST: "Staff",
  WD: "Wand", RG: "Ring", P: "Potion", SC: "Scroll", W: "Wondrous Item",
  G: "Adventuring Gear", INS: "Instrument", $: "Treasure",
};
const RARITY_COLORS = {
  common: "default", uncommon: "success", rare: "primary",
  "very rare": "secondary", legendary: "warning", artifact: "danger",
};

function ShopGuideModal({ isOpen, onClose }) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="sm">
      <ModalContent>
        {(close) => (
          <>
            <ModalHeader className="font-cinzel" style={{ color: "var(--red-dark)" }}>Shop Guide</ModalHeader>
            <ModalBody>
              <h4 className="font-cinzel text-sm font-bold mb-2">Pricing by Rarity</h4>
              <Table aria-label="Pricing" removeWrapper>
                <TableHeader>
                  <TableColumn className="text-xs font-cinzel">Rarity</TableColumn>
                  <TableColumn className="text-xs font-cinzel text-right">Price Range</TableColumn>
                </TableHeader>
                <TableBody>
                  {[
                    ["Common", "50–100 gp"], ["Uncommon", "101–500 gp"],
                    ["Rare", "501–5,000 gp"], ["Very Rare", "5,001–50,000 gp"],
                    ["Legendary", "50,001+ gp"],
                  ].map(([r, p]) => (
                    <TableRow key={r}>
                      <TableCell className="text-sm">{r}</TableCell>
                      <TableCell className="text-sm text-right" style={{ color: "var(--ink-light)" }}>{p}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Divider className="my-3" />
              <h4 className="font-cinzel text-sm font-bold mb-2">Common Weights</h4>
              <ul className="text-sm space-y-1 pl-4" style={{ listStyleType: "disc" }}>
                <li><strong>Potion:</strong> 0.5 lb</li>
                <li><strong>Scroll:</strong> Negligible</li>
                <li><strong>Wand / Rod:</strong> 1–2 lbs</li>
                <li><strong>Weapon / Armor:</strong> See PHB</li>
              </ul>
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={close}>Close</Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}

function ShopGenerator() {
  const [hasData, setHasData] = useState(false);
  const [selectedRarities, setSelectedRarities] = useState(new Set(["common", "uncommon"]));
  const [itemCount, setItemCount] = useState("10");
  const [magicEnabled, setMagicEnabled] = useState(true);
  const [magicOnly, setMagicOnly] = useState(false);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedItems, setExpandedItems] = useState(new Set());
  const { isOpen: guideOpen, onOpen: onGuideOpen, onClose: onGuideClose } = useDisclosure();

  useEffect(() => {
    (async () => {
      try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, "readonly");
        const req = tx.objectStore(STORE_NAME).get("currentData");
        req.onsuccess = () => setHasData(!!req.result);
        req.onerror = () => setHasData(false);
      } catch { setHasData(false); }
    })();
  }, []);

  const toggleRarity = (r) => {
    setSelectedRarities((prev) => {
      const next = new Set(prev);
      if (next.has(r)) next.delete(r); else next.add(r);
      return next;
    });
  };

  const generate = async () => {
    setLoading(true);
    try {
      const db = await openDB();
      const data = await new Promise((res, rej) => {
        const req = db.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).get("currentData");
        req.onsuccess = () => res(req.result);
        req.onerror = () => rej(req.error);
      });
      if (!data) { setResults([]); setLoading(false); return; }

      const parsedData = [];
      data.forEach((file) => {
        if (file.name.toLowerCase().endsWith(".json")) {
          try { parsedData.push(JSON.parse(file.content)); } catch {}
        }
      });

      let allItems = [];
      parsedData.forEach((json) => {
        [json.item, json.items, json.baseitem, json.baseitems, json.magicvariant, json.magicvariants, json.variant]
          .forEach((arr) => { if (Array.isArray(arr)) arr.forEach((i) => { if (i.name) allItems.push(i); }); });
      });

      const filtered = allItems.filter((item) => {
        const r = (item.rarity || "None").toLowerCase();
        const isMundane = r === "none" || r === "unknown";
        if (!magicEnabled && !isMundane) return false;
        if (magicOnly && isMundane) return false;
        return selectedRarities.has(isMundane ? "common" : r);
      });

      const unique = Array.from(new Map(filtered.map((i) => [i.name, i])).values());
      if (unique.length === 0) { setResults([]); setLoading(false); return; }

      const picked = [];
      for (let i = 0; i < Math.min(parseInt(itemCount) || 10, 50); i++) {
        const item = unique[Math.floor(Math.random() * unique.length)];
        const rarityRaw = item.rarity || "Common";
        const rarity = rarityRaw.toLowerCase().split(" ").map((s) => s.charAt(0).toUpperCase() + s.slice(1)).join(" ");
        let itemType = item.wondrous ? "Wondrous Item" : TYPE_MAP[item.type] || item.type || "Item";
        const price = item.value ? (typeof item.value === "string" ? item.value : item.value + " gp") : "";
        let desc = "";
        if (item.entries) desc = processEntries(item.entries);
        if (!desc && item.inherits?.entries) desc = processEntries(item.inherits.entries);
        if (!desc && item.description) desc = item.description;
        if (!desc && item.desc) desc = processEntries(item.desc);
        if (!desc && item.text) desc = item.text;
        picked.push({ id: Math.random().toString(36).slice(2), name: item.name, rarity, itemType, price, desc: cleanText(desc) });
      }
      setResults(picked);
    } catch (e) { console.error(e); setResults([]); }
    setLoading(false);
  };

  if (!hasData) return null;

  return (
    <Card shadow="md" className="mb-8" style={{ border: "2px solid var(--gold)" }}>
      <CardHeader className="flex items-center gap-3" style={{ borderBottom: "1px solid var(--gold)" }}>
        <h2 className="font-cinzel font-bold text-base m-0 flex-1" style={{ color: "var(--ink)" }}>
          🛒 Random Shop Generator
        </h2>
        <Tooltip content="Pricing & weight guide">
          <Button isIconOnly size="sm" variant="bordered" onPress={onGuideOpen}>?</Button>
        </Tooltip>
      </CardHeader>
      <CardBody className="gap-4">
        {/* Filters row */}
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <p className="font-cinzel text-xs font-bold mb-2" style={{ color: "var(--ink-light)" }}>RARITY</p>
            <div className="flex flex-wrap gap-1.5">
              {RARITIES.map((r) => {
                const key = r.toLowerCase();
                const active = selectedRarities.has(key);
                return (
                  <Chip
                    key={r}
                    variant={active ? "solid" : "bordered"}
                    color={active ? (RARITY_COLORS[key] || "default") : "default"}
                    className="cursor-pointer select-none transition-all"
                    onClick={() => toggleRarity(key)}
                  >
                    {r}
                  </Chip>
                );
              })}
            </div>
          </div>

          <div className="w-24">
            <Input
              size="sm" type="number" label="Count" labelPlacement="outside"
              value={itemCount} onValueChange={(v) => setItemCount(String(Math.min(50, Math.max(1, parseInt(v) || 1))))}
              min={1} max={50}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Checkbox
              isSelected={magicEnabled}
              onValueChange={(v) => { setMagicEnabled(v); if (!v) setMagicOnly(false); }}
              size="sm"
            >
              <span className="font-cinzel text-xs">Include Magic Items</span>
            </Checkbox>
            <Checkbox
              isSelected={magicOnly}
              onValueChange={(v) => { setMagicOnly(v); if (v) setMagicEnabled(true); }}
              size="sm"
            >
              <span className="font-cinzel text-xs">Magic Items Only</span>
            </Checkbox>
          </div>

          <div className="flex gap-2">
            <Button color="primary" onPress={generate} isLoading={loading} size="sm">
              Generate
            </Button>
            <Button variant="bordered" onPress={() => setResults([])} size="sm">Clear</Button>
          </div>
        </div>

        {/* Results grid */}
        {results.length === 0 && !loading
          ? <p className="text-center italic text-sm py-4" style={{ color: "var(--ink-light)" }}>Generate items to see results.</p>
          : (
            <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))" }}>
              {results.map((item) => {
                const rarityKey = item.rarity.toLowerCase();
                const expanded = expandedItems.has(item.id);
                return (
                  <Card key={item.id} shadow="sm" isPressable onPress={() => {
                    const next = new Set(expandedItems);
                    if (next.has(item.id)) next.delete(item.id); else next.add(item.id);
                    setExpandedItems(next);
                  }}>
                    <CardBody className="gap-2 p-3">
                      <div>
                        <p className="font-bold text-sm" style={{ color: "var(--ink)" }}>{item.name}</p>
                        <div className="flex items-center gap-1 mt-1 flex-wrap">
                          <Chip size="sm" variant="flat" color={RARITY_COLORS[rarityKey] || "default"}>
                            {item.rarity}
                          </Chip>
                          <span className="text-xs" style={{ color: "var(--ink-light)" }}>{item.itemType}</span>
                        </div>
                      </div>
                      {expanded && item.desc && (
                        <div
                          className="text-xs overflow-y-auto"
                          style={{ maxHeight: 160, lineHeight: 1.4, color: "var(--ink)", borderTop: "1px dashed var(--gold)", paddingTop: 8 }}
                          dangerouslySetInnerHTML={{ __html: item.desc }}
                        />
                      )}
                      <div className="flex justify-between items-center mt-auto pt-1">
                        <span className="font-bold text-sm" style={{ color: "var(--red-dark)" }}>{item.price}</span>
                        <span className="text-xs" style={{ color: "var(--ink-light)" }}>{expanded ? "▲ Hide" : "▼ Details"}</span>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          )
        }
      </CardBody>
      <ShopGuideModal isOpen={guideOpen} onClose={onGuideClose} />
    </Card>
  );
}

// ─── Main DMScreenPage ─────────────────────────────────────────────────────────

export default function DMScreenPage() {
  const [dmData, setDmData] = useDMData();
  const [newPlayer, setNewPlayer] = useState("");

  const addPlayer = () => {
    if (!newPlayer.trim() || dmData.players.includes(newPlayer.trim())) return;
    setDmData((d) => ({ ...d, players: [...d.players, newPlayer.trim()] }));
    setNewPlayer("");
  };

  const removePlayer = (name) => setDmData((d) => ({ ...d, players: d.players.filter((p) => p !== name) }));
  const addSession = () => {
    const counter = dmData.sessionCounter + 1;
    setDmData((d) => ({
      ...d, sessionCounter: counter,
      sessions: [...d.sessions, { id: Date.now(), title: `Session ${counter}`, rolls: {}, initiative: [], monsters: [], logs: [] }],
    }));
  };
  const updateSession = (id, ns) => setDmData((d) => ({ ...d, sessions: d.sessions.map((s) => (s.id === id ? ns : s)) }));
  const deleteSession = (id) => setDmData((d) => ({ ...d, sessions: d.sessions.filter((s) => s.id !== id) }));

  const exportData = () => {
    const blob = new Blob([JSON.stringify(dmData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = Object.assign(document.createElement("a"), { href: url, download: "dm_screen_data.json" });
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  const importData = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try { setDmData({ ...DEFAULT_DM_DATA, ...JSON.parse(ev.target.result) }); }
      catch { alert("Invalid JSON file."); }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  return (
    <>
      <Sidebar>
        {(closeSidebar) => (
          <>
            <SidebarBtn onClick={closeSidebar}>
              <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>Character Sheet</Link>
            </SidebarBtn>
            <SidebarBtn onClick={() => { exportData(); closeSidebar(); }}>Export Data</SidebarBtn>
            <SidebarBtn onClick={() => {
              const input = document.createElement("input");
              input.type = "file"; input.accept = ".json"; input.onchange = importData; input.click();
              closeSidebar();
            }}>Import Data</SidebarBtn>
            <SidebarBtn
              onClick={() => { if (window.confirm("Reset all DM data?")) setDmData({ ...DEFAULT_DM_DATA }); closeSidebar(); }}
              style={{ color: "var(--red-dark)", borderColor: "var(--red)" }}
            >
              Reset Data
            </SidebarBtn>
          </>
        )}
      </Sidebar>

      <div className="character-sheet dm-mode" style={{ maxWidth: 1200 }}>
        <div className="header">
          <h1>DM Screen</h1>
          <Link to="/" className="dm-screen-button">Character Sheet</Link>
          <div className="subtitle">Dungeon Master</div>
        </div>

        {/* Players Panel */}
        <Card shadow="sm" className="mb-6" style={{ border: "2px solid var(--gold)" }}>
          <CardHeader style={{ borderBottom: "1px solid var(--gold)" }}>
            <h3 className="font-cinzel font-bold text-base m-0" style={{ color: "var(--ink)" }}>Players</h3>
          </CardHeader>
          <CardBody className="gap-3">
            <div className="flex flex-wrap gap-2">
              {dmData.players.length === 0
                ? <p className="text-sm italic" style={{ color: "var(--ink-light)" }}>No players added yet.</p>
                : dmData.players.map((p) => (
                    <Chip
                      key={p}
                      onClose={() => removePlayer(p)}
                      variant="bordered"
                      size="md"
                      className="font-cinzel font-semibold"
                      style={{ borderColor: "var(--gold)" }}
                    >
                      {p}
                    </Chip>
                  ))
              }
            </div>
            <div className="flex gap-3">
              <Input
                size="sm" placeholder="Player name"
                value={newPlayer} onValueChange={setNewPlayer}
                className="flex-1 max-w-xs"
                onKeyDown={(e) => e.key === "Enter" && addPlayer()}
              />
              <Button size="sm" variant="bordered" onPress={addPlayer}>Add Player</Button>
            </div>
          </CardBody>
        </Card>

        {/* Shop Generator */}
        <ShopGenerator />

        {/* Sessions */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-cinzel font-bold m-0" style={{ color: "var(--ink)", fontSize: "1.1rem" }}>Sessions</h2>
          <Button color="primary" onPress={addSession} size="sm">+ New Session</Button>
        </div>

        {dmData.sessions.length === 0 && (
          <p className="text-center italic text-sm mb-8" style={{ color: "var(--ink-light)" }}>
            No sessions yet. Click "New Session" to start tracking.
          </p>
        )}

        {dmData.sessions.map((session) => (
          <Session
            key={session.id}
            session={session}
            players={dmData.players}
            onUpdate={(ns) => updateSession(session.id, ns)}
            onDelete={() => deleteSession(session.id)}
          />
        ))}
      </div>
    </>
  );
}
