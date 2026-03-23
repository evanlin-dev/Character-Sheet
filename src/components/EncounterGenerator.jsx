import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardBody,
  Button,
  Divider,
  Input,
  Checkbox,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Select,
  SelectItem,
  Tabs,
  Tab
} from "@heroui/react";
import { processEntries, cleanText } from "src/utils/dndEntries";
import { formatPrerequisites } from "src/utils/creatorLogic";
import { schoolMap } from "src/components/SpellTable";
import { openDB, STORE_NAME } from "src/utils/db";
import { ModalOverlay, ModalBox, ModalTitle, CloseBtn } from "src/styles/shared";
import { getGlobalSourcePriority, replaceAtkTags } from "src/utils/formatHelpers";

const DEFAULT_ENCOUNTERS = [{ id: "default", name: "Encounter 1", creatures: [] }];

export default function EncounterGenerator({ roomId, encounters = DEFAULT_ENCOUNTERS, onEncountersChange, onAddMonstersToInit, onBroadcastChat }) {
  const setEncounters = onEncountersChange ?? (() => {});
  const [loading, setLoading] = useState(false);
  const [activeEncounterId, setActiveEncounterId] = useState("default");
  const [count, setCount] = useState("3");
  const [crMin, setCrMin] = useState("0");
  const [crMax, setCrMax] = useState("1");
  const [allMonsters, setAllMonsters] = useState([]);
  const [customName, setCustomName] = useState("");
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMassActionOpen, setIsMassActionOpen] = useState(false);
  const [massActionData, setMassActionData] = useState({
    dmgAmount: "",
    dmgType: "fire",
    saveRequired: false,
    saveAbility: "dex",
    saveDc: "15",
    saveEffect: "half",
    selectedIds: new Set(),
  });
  const [previewSpell, setPreviewSpell] = useState(null);
  const [previewFeat, setPreviewFeat] = useState(null);

  useEffect(() => {
    loadDbMonsters();
  }, []);

  const loadDbMonsters = async () => {
    if (allMonsters.length > 0) return allMonsters;
    try {
      const { openDB, STORE_NAME } = await import("src/utils/db");
      const db = await openDB();
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const data = await new Promise((resolve) => {
        const req = store.get("currentData");
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
      });
      if (!data) return [];

      const loadedMonsters = [];
      data.forEach((file) => {
        if (!file.name.toLowerCase().endsWith(".json")) return;
        try {
          const json = JSON.parse(file.content);
          if (json.monster) loadedMonsters.push(...json.monster);
        } catch (e) {}
      });

      const valid = loadedMonsters.filter((m) => m.name);
      setAllMonsters(valid);
      return valid;
    } catch (e) {
      console.error(e);
      return [];
    }
  };

  const formatLinks = (rawHtml) => {
    let processed = rawHtml || "";
    const spellMapList = [];
    const featMapList = [];

    const toTitleCase = (str) => {
      const lowers = ["a", "an", "and", "as", "at", "but", "by", "for", "from", "in", "into", "near", "nor", "of", "on", "onto", "or", "the", "to", "with"];
      return str.split(" ").map((w, i) => {
        if (i !== 0 && lowers.includes(w.toLowerCase())) return w.toLowerCase();
        return w.split(/([/-])/).map(part => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase()).join('');
      }).join(" ");
    };

    if (typeof processed === 'string') {
      processed = processed.replace(/\{@spell ([^|}]+)(?:\|[^}]*)?\}/gi, (match, spellName) => {
          spellMapList.push({ orig: spellName, title: toTitleCase(spellName) });
          return `__SPELL_LINK_${spellMapList.length - 1}__`;
      });
      processed = processed.replace(/\{@feat ([^|}]+)(?:\|[^}]*)?\}/gi, (match, featName) => {
          featMapList.push({ orig: featName, title: toTitleCase(featName) });
          return `__FEAT_LINK_${featMapList.length - 1}__`;
      });

      processed = processed.replace(/\{@recharge\s*([^}]*)\}/gi, (_, p1) => p1 ? `(Recharge ${p1}-6)` : `(Recharge 6)`);
      processed = replaceAtkTags(processed);
      processed = processed.replace(/\{@h\}/gi, '<em>Hit:</em> ');
      processed = processed.replace(/\{@damage\s+([^|}]+)[^}]*\}/gi, '$1');
      processed = processed.replace(/\{@dice\s+([^|}]+)[^}]*\}/gi, '$1');
      processed = processed.replace(/\{@hit\s+([^|}]+)[^}]*\}/gi, '+$1');
      processed = processed.replace(/\{@dc\s+([^|}]+)[^}]*\}/gi, 'DC $1');

      processed = cleanText(processed);
      spellMapList.forEach((spellItem, i) => {
          processed = processed.replace(`__SPELL_LINK_${i}__`, `<span class="spell-link" style="color: var(--red-dark); font-weight: bold; cursor: pointer; border-bottom: 1px dashed var(--red-dark);" data-spell="${spellItem.orig.replace(/"/g, '&quot;')}">${spellItem.title}</span>`);
      });
      featMapList.forEach((featItem, i) => {
          processed = processed.replace(`__FEAT_LINK_${i}__`, `<span class="feat-link" style="color: var(--red-dark); font-weight: bold; cursor: pointer; border-bottom: 1px dashed var(--red-dark);" data-feat="${featItem.orig.replace(/"/g, '&quot;')}">${featItem.title}</span>`);
      });
    } else {
      processed = cleanText(processed);
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

  const getMonsterDesc = (m) => {
    let desc = "";
    const sections = [];
    if (m.entries) sections.push(processEntries(m.entries));
    if (m.trait)
      sections.push("<strong>Traits</strong><br/>" + processEntries(m.trait));
    if (m.spellcasting)
      sections.push(
        "<strong>Spellcasting</strong><br/>" + processEntries(m.spellcasting),
      );
    if (m.action)
      sections.push("<strong>Actions</strong><br/>" + processEntries(m.action));
    if (m.bonus)
      sections.push(
        "<strong>Bonus Actions</strong><br/>" + processEntries(m.bonus),
      );
    if (m.reaction)
      sections.push(
        "<strong>Reactions</strong><br/>" + processEntries(m.reaction),
      );
    if (m.legendary)
      sections.push(
        "<strong>Legendary Actions</strong><br/>" + processEntries(m.legendary),
      );

    desc = sections.join("<br/><br/>");
    return formatLinks(desc);
  };

  const getHp = (m) => {
    if (!m.hp) return 10;
    if (typeof m.hp === "object") return m.hp.average || m.hp.min || 10;
    return parseInt(m.hp) || 10;
  };

  const activeEncounter =
    encounters.find((e) => e.id === activeEncounterId) || encounters[0];

  const updateActiveEncounter = (updater) => {
    setEncounters((prev) =>
      prev.map((e) =>
        e.id === activeEncounterId
          ? { ...e, creatures: updater(e.creatures) }
          : e,
      ),
    );
  };

  const addNewEncounter = () => {
    const newId = Date.now().toString();
    setEncounters((prev) => [
      ...prev,
      { id: newId, name: `Encounter ${prev.length + 1}`, creatures: [] },
    ]);
    setActiveEncounterId(newId);
  };

  const removeEncounter = (id) => {
    if (encounters.length <= 1) return;
    if (window.confirm("Delete this encounter?")) {
      setEncounters((prev) => {
        const next = prev.filter((e) => e.id !== id);
        if (activeEncounterId === id) setActiveEncounterId(next[0].id);
        return next;
      });
    }
  };

  const renameEncounter = (id, newName) => {
    setEncounters((prev) =>
      prev.map((e) => (e.id === id ? { ...e, name: newName } : e)),
    );
  };

  const generate = async () => {
    setLoading(true);
    const monsters = await loadDbMonsters();
    if (monsters.length === 0) {
      setLoading(false);
      return;
    }

    const parseCR = (c) => {
      if (!c) return 0;
      let crStr = typeof c === "object" ? c.cr : String(c);
      if (crStr.includes("/")) {
        const [n, d] = crStr.split("/");
        return parseInt(n) / parseInt(d);
      }
      return parseFloat(crStr) || 0;
    };

    const max = parseCR(crMax);
    const min = parseCR(crMin);
    const filtered = monsters.filter((m) => {
      const cr = parseCR(m.cr);
      return cr >= min && cr <= max && !m.isNpc;
    });

    if (filtered.length === 0) {
      setLoading(false);
      return;
    }

    const picked = [];
    for (let i = 0; i < (parseInt(count) || 1); i++) {
      const m = filtered[Math.floor(Math.random() * filtered.length)];
      const cr = m.cr ? (typeof m.cr === "object" ? m.cr.cr : m.cr) : "0";
      const mHp = getHp(m);
      picked.push({
        id: Date.now() + Math.random(),
        name: m.name,
        cr,
        source: m.source,
        desc: getMonsterDesc(m),
        hp: mHp,
        maxHp: mHp,
        rawMonster: m,
      });
    }
    updateActiveEncounter((prev) => [...prev, ...picked]);
    setLoading(false);
  };

  const addDbMonster = (m) => {
    const cr = m.cr ? (typeof m.cr === "object" ? m.cr.cr : m.cr) : "0";
    const mHp = getHp(m);
    updateActiveEncounter((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        name: m.name,
        cr,
        source: m.source,
        desc: getMonsterDesc(m),
        hp: mHp,
        maxHp: mHp,
        rawMonster: m,
      },
    ]);
    setIsSearchOpen(false);
    setSearchQuery("");
  };

  const addCustom = () => {
    if (!customName.trim()) return;
    updateActiveEncounter((prev) => [
      ...prev,
      {
        id: Date.now() + Math.random(),
        name: customName.trim(),
        cr: "?",
        source: "Custom",
        desc: "",
        hp: 10,
        maxHp: 10,
        rawMonster: null,
      },
    ]);
    setCustomName("");
  };

  const removeMonster = (id) => {
    updateActiveEncounter((prev) => prev.filter((m) => m.id !== id));
  };

  const handleApplyMassAction = () => {
    let logs = [];
    updateActiveEncounter((prev) => {
      return prev.map((c) => {
        if (!massActionData.selectedIds.has(c.id)) return c;

        let mod = 0;
        if (massActionData.saveRequired && c.rawMonster) {
          if (
            c.rawMonster.save &&
            c.rawMonster.save[massActionData.saveAbility]
          ) {
            mod = parseInt(c.rawMonster.save[massActionData.saveAbility]) || 0;
          } else if (c.rawMonster[massActionData.saveAbility]) {
            const score =
              parseInt(c.rawMonster[massActionData.saveAbility]) || 10;
            mod = Math.floor((score - 10) / 2);
          }
        }

        let passed = false;
        let roll = 0;
        if (massActionData.saveRequired) {
          roll = Math.floor(Math.random() * 20) + 1;
          passed = roll + mod >= parseInt(massActionData.saveDc);
        }

        let baseDmg = parseInt(massActionData.dmgAmount) || 0;
        if (massActionData.saveRequired && passed) {
          baseDmg =
            massActionData.saveEffect === "half" ? Math.floor(baseDmg / 2) : 0;
        }

        let mult = 1;
        if (c.rawMonster) {
          const immStr = JSON.stringify(
            c.rawMonster.immune || "",
          ).toLowerCase();
          const resStr = JSON.stringify(
            c.rawMonster.resist || "",
          ).toLowerCase();
          const vulStr = JSON.stringify(
            c.rawMonster.vulnerable || "",
          ).toLowerCase();
          const dmgType = massActionData.dmgType.toLowerCase();

          if (immStr.includes(dmgType)) mult = 0;
          else if (resStr.includes(dmgType)) mult = 0.5;
          else if (vulStr.includes(dmgType)) mult = 2;
        }

        const finalDmg = Math.floor(baseDmg * mult);
        const newHp = Math.max(0, c.hp - finalDmg);

        let logMsg = `- ${c.name}: `;
        if (massActionData.saveRequired) {
          let natStr = roll === 20 ? " [NAT 20!]" : roll === 1 ? " [NAT 1!]" : "";
          logMsg += `Rolled ${roll}${natStr} + ${mod} = ${roll + mod} (Save ${passed ? "Passed" : "Failed"})`;
        }
        if (massActionData.dmgAmount) {
          logMsg += (massActionData.saveRequired ? " -> " : "") + `Took ${finalDmg} ${massActionData.dmgType} damage.`;
        }
        if (!massActionData.saveRequired && !massActionData.dmgAmount) {
          logMsg += "Targeted by effect.";
        }
        logs.push(logMsg);

        return { ...c, hp: newHp };
      });
    });

    if (logs.length > 0 && onBroadcastChat) {
      onBroadcastChat(`Mass Action Results:\n` + logs.join("\n"));
    }
    setIsMassActionOpen(false);
  };

  const updateMonsterDesc = (id, newDesc) => {
    updateActiveEncounter((prev) =>
      prev.map((m) => (m.id === id ? { ...m, desc: newDesc } : m)),
    );
  };

  const toggleExpanded = (id) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const filteredSearch = searchQuery
    ? allMonsters
        .filter((m) => m.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .slice(0, 100)
    : allMonsters.slice(0, 100);

  return (
    <>
      <Card shadow="sm" style={{ border: "2px solid var(--gold)" }}>
        <CardHeader
          className="font-cinzel font-bold text-lg"
          style={{ borderBottom: "1px solid var(--gold)" }}
        >
          Encounter Builder
        </CardHeader>
        <CardBody className="gap-4">
          <div className="flex justify-between items-center mb-2">
            <Input
              size="sm"
              value={activeEncounter.name}
              onValueChange={(val) => renameEncounter(activeEncounter.id, val)}
              className="max-w-xs font-cinzel font-bold text-lg"
              variant="underlined"
              aria-label="Encounter Name"
            />
            <div className="flex gap-2">
              <Button
                size="sm"
                color="primary"
                variant="flat"
                onPress={addNewEncounter}
              >
                + New Encounter
              </Button>
              {encounters.length > 1 && (
                <Button
                  size="sm"
                  color="danger"
                  variant="light"
                  onPress={() => removeEncounter(activeEncounter.id)}
                >
                  Delete
                </Button>
              )}
            </div>
          </div>

          <Tabs
            aria-label="Encounters"
            selectedKey={activeEncounterId}
            onSelectionChange={setActiveEncounterId}
            color="danger"
            variant="underlined"
            classNames={{
              tabList: "gap-4 w-full flex-wrap",
              tab: "h-auto py-2",
            }}
          >
            {encounters.map((enc) => (
              <Tab key={enc.id} title={enc.name}>
                <div className="grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-4 items-start">
                  {/* ── Left: Add controls ── */}
                  <div className="flex flex-col gap-3">
                    {/* Random Generator */}
                    <div className="flex flex-col gap-2 bg-default-50 p-3 border border-default-200 rounded">
                      <p className="font-cinzel text-xs font-bold" style={{ color: "var(--ink-light)" }}>RANDOM GENERATOR</p>
                      <div className="flex gap-2 items-end flex-wrap">
                        <Input size="sm" type="number" label="Min CR" labelPlacement="outside" value={crMin} onValueChange={setCrMin} className="w-20" />
                        <Input size="sm" type="number" label="Max CR" labelPlacement="outside" value={crMax} onValueChange={setCrMax} className="w-20" />
                        <Input size="sm" type="number" label="Count" labelPlacement="outside" value={count} onValueChange={setCount} className="w-20" />
                      </div>
                      <Button size="sm" color="primary" onPress={generate} isLoading={loading} className="font-cinzel font-bold w-full">Generate Random</Button>
                    </div>

                    {/* Manual Add */}
                    <div className="flex flex-col gap-2 bg-default-50 p-3 border border-default-200 rounded">
                      <p className="font-cinzel text-xs font-bold" style={{ color: "var(--ink-light)" }}>ADD CREATURE</p>
                      <Input size="sm" placeholder="Custom creature name..." value={customName} onValueChange={setCustomName} onKeyDown={(e) => e.key === "Enter" && addCustom()} />
                      <div className="flex gap-2">
                        <Button size="sm" onPress={addCustom} color="secondary" className="font-cinzel font-bold flex-1">Add Custom</Button>
                        <Button size="sm" onPress={() => setIsSearchOpen(true)} color="primary" className="font-cinzel font-bold flex-1">Search DB</Button>
                      </div>
                    </div>
                  </div>

                  {/* ── Right: Creature list ── */}
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <h3 className="font-cinzel font-bold text-md m-0" style={{ color: "var(--red-dark)" }}>
                        Creatures {enc.creatures.length > 0 && <span className="text-sm text-default-400 font-normal">({enc.creatures.length})</span>}
                      </h3>
                      <div className="flex gap-2">
                        {enc.creatures.length > 0 && (
                          <>
                            <Button size="sm" color="danger" variant="flat" onPress={() => setIsMassActionOpen(true)}>Mass Action</Button>
                            <Button size="sm" color="warning" variant="flat" onPress={() => onAddMonstersToInit(enc.creatures)}>Add All to Init</Button>
                            <Button size="sm" variant="light" color="danger" onPress={() => updateActiveEncounter(() => [])}>Clear</Button>
                          </>
                        )}
                      </div>
                    </div>

                    {enc.creatures.length === 0 && !loading && (
                      <em className="text-sm text-default-400">No creatures added. Generate or add to the left.</em>
                    )}
                    {enc.creatures.map((m) => (
                      <div key={m.id} className="flex flex-col bg-white border border-default-200 rounded p-2 shadow-sm">
                        <div className="flex justify-between items-center">
                          <div>
                            <span className="font-bold text-sm cursor-pointer hover:text-primary" onClick={() => toggleExpanded(m.id)}>{m.name}</span>
                            <span className="ml-2 text-xs text-default-400">CR {m.cr} [{m.source}]</span>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="text-xs text-default-500">HP:</span>
                              <Input size="sm" type="number" value={String(m.hp)} onValueChange={(val) => updateActiveEncounter((p) => p.map((c) => c.id === m.id ? { ...c, hp: parseInt(val) || 0 } : c))} className="w-16 min-h-6 h-6 text-xs" />
                              <span className="text-xs text-default-500">/ {m.maxHp}</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button size="sm" variant="flat" onPress={() => toggleExpanded(m.id)}>{expandedIds.has(m.id) ? "Hide" : "Details"}</Button>
                            <Button size="sm" variant="flat" color="danger" onPress={() => onAddMonstersToInit(m)}>+ Init</Button>
                            <Button isIconOnly size="sm" variant="light" color="danger" onPress={() => removeMonster(m.id)} className="h-6 min-h-6 w-6 min-w-6 ml-1">✕</Button>
                          </div>
                        </div>
                        {expandedIds.has(m.id) && (
                          <div className="mt-2 pt-2 text-sm max-h-60 overflow-y-auto" style={{ borderTop: "1px dashed var(--gold)" }}>
                            {m.desc && m.desc.includes("<") ? (
                              <div onClick={handlePreviewClick} dangerouslySetInnerHTML={{ __html: m.desc }} />
                            ) : (
                              <textarea className="w-full bg-transparent outline-none resize-y min-h-[60px]" value={m.desc || ""} onChange={(e) => updateMonsterDesc(m.id, e.target.value)} placeholder="Add a description..." />
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </Tab>
            ))}
          </Tabs>
        </CardBody>

        <Modal isOpen={isMassActionOpen} onClose={() => setIsMassActionOpen(false)}>
          <ModalContent>
            {(onClose) => (
              <>
                <ModalHeader className="font-cinzel text-red-800">Mass Apply Action</ModalHeader>
                <ModalBody>
                  <div className="flex flex-col gap-4">
                    <div className="flex gap-2 items-center">
                      <Input size="sm" type="number" label="Damage (Optional)" value={massActionData.dmgAmount} onValueChange={(v) => setMassActionData((p) => ({ ...p, dmgAmount: v }))} className="flex-1" />
                      <Select size="sm" label="Damage Type" selectedKeys={[massActionData.dmgType]} onSelectionChange={(k) => setMassActionData((p) => ({ ...p, dmgType: Array.from(k)[0] }))} className="w-32">
                        {["slashing", "piercing", "bludgeoning", "fire", "cold", "lightning", "thunder", "poison", "acid", "radiant", "necrotic", "force", "psychic"].map((type) => (
                          <SelectItem key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</SelectItem>
                        ))}
                      </Select>
                    </div>

                    <div className="flex flex-col gap-2 bg-default-50 p-2 rounded border border-default-200">
                      <Checkbox size="sm" isSelected={massActionData.saveRequired} onValueChange={(v) => setMassActionData((p) => ({ ...p, saveRequired: v }))}><span className="font-bold">Require Saving Throw?</span></Checkbox>
                      {massActionData.saveRequired && (
                        <div className="flex gap-2 items-center mt-2">
                          <Select size="sm" label="Save Ability" selectedKeys={[massActionData.saveAbility]} onSelectionChange={(k) => setMassActionData((p) => ({ ...p, saveAbility: Array.from(k)[0] }))} className="flex-1">
                            {["str", "dex", "con", "int", "wis", "cha"].map((stat) => (
                              <SelectItem key={stat} value={stat}>{stat.toUpperCase()}</SelectItem>
                            ))}
                          </Select>
                          <Input size="sm" type="number" label="Save DC" value={massActionData.saveDc} onValueChange={(v) => setMassActionData((p) => ({ ...p, saveDc: v }))} className="w-24" />
                          <Select size="sm" label="Save Effect" selectedKeys={[massActionData.saveEffect]} onSelectionChange={(k) => setMassActionData((p) => ({ ...p, saveEffect: Array.from(k)[0] }))} className="w-28">
                            <SelectItem key="half" value="half">Half Dmg</SelectItem>
                            <SelectItem key="none" value="none">No Dmg</SelectItem>
                          </Select>
                        </div>
                      )}
                    </div>
                    <Divider />
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm">Targets:</span>
                      <Button size="sm" variant="light" onPress={() => setMassActionData((p) => ({ ...p, selectedIds: p.selectedIds.size === activeEncounter.creatures.length ? new Set() : new Set(activeEncounter.creatures.map((c) => c.id)) }))}>Toggle All</Button>
                    </div>
                    <div className="flex flex-col gap-2 max-h-40 overflow-y-auto border border-default-200 rounded p-2">
                      {activeEncounter.creatures.map((c) => (
                        <Checkbox key={c.id} size="sm" isSelected={massActionData.selectedIds.has(c.id)} onValueChange={(sel) => setMassActionData((p) => { const next = new Set(p.selectedIds); sel ? next.add(c.id) : next.delete(c.id); return { ...p, selectedIds: next }; })}>
                          <span>{c.name} <span className="text-default-400">(HP: {c.hp}/{c.maxHp})</span></span>
                        </Checkbox>
                      ))}
                    </div>
                  </div>
                </ModalBody>
                <ModalFooter>
                  <Button variant="light" onPress={onClose}>Cancel</Button>
                  <Button color="danger" onPress={handleApplyMassAction} isDisabled={massActionData.selectedIds.size === 0}>Apply Action</Button>
                </ModalFooter>
              </>
            )}
          </ModalContent>
        </Modal>
      </Card>
      
      <Modal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} scrollBehavior="inside" size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="font-cinzel text-red-800">Search Creatures</ModalHeader>
              <ModalBody>
                <Input
                  placeholder="Search monsters..."
                  value={searchQuery}
                  onValueChange={setSearchQuery}
                  autoFocus
                  variant="bordered"
                />
                <div className="flex flex-col gap-1 overflow-y-auto border border-default-200 rounded-md p-1 min-h-[300px]">
                  {allMonsters.length === 0 ? (
                    <div className="p-4 text-center text-default-500 italic">Loading data...</div>
                  ) : filteredSearch.length > 0 ? (
                    filteredSearch.map((m, idx) => {
                      const cr = m.cr ? (typeof m.cr === 'object' ? m.cr.cr : m.cr) : '?';
                      return (
                        <div
                          key={idx}
                          onClick={() => addDbMonster(m)}
                          className="p-2 cursor-pointer border-b border-default-100 hover:bg-default-100 flex justify-between items-center rounded-sm transition-colors"
                        >
                          <span><strong>{m.name}</strong> <span className="text-default-400 text-xs ml-1">[{m.source || ''}]</span></span>
                          <span className="text-default-500 text-xs font-semibold">CR {cr}</span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="p-4 text-center text-default-500 italic">No results found.</div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>Close</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

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
    </>
  );
}