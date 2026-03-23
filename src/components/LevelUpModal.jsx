import { useState, useMemo, useEffect } from 'react';
import { useCharacter } from '../context/CharacterContext';
import { useCreatorData } from '../utils/useCreatorData';
import { ModalOverlay, ModalBox, ModalTitle, CloseBtn, PrimaryBtn } from '../styles/shared';
import { processEntries, cleanText } from '../utils/dndEntries';
import {
  resolveFeatureWithCopy
} from '../utils/creatorLogic';
import FeatureChoices from "./FeatureChoices";
import SpellTable, { schoolMap } from "./SpellTable";
import { getGlobalSourcePriority } from '../utils/formatHelpers';

const HIT_DICE = { Barbarian:12, Fighter:10, Paladin:10, Ranger:10, Bard:8, Cleric:8, Druid:8, Monk:8, Rogue:8, Warlock:8, Artificer:8, Sorcerer:6, Wizard:6 };

export default function LevelUpModal() {
  const { modals, closeModal, character, update } = useCharacter();
  const { data, loading } = useCreatorData();
  const { level: targetLevel = 1, oldLevel = 1 } = modals.levelUp || {};

  const [activeTab, setActiveTab] = useState('features');
  const [subclassSelected, setSubclassSelected] = useState(character.charSubclass || '');
  const [hpMode, setHpMode] = useState('average');
  const [hpRolls, setHpRolls] = useState({});
  const [asiChoices, setAsiChoices] = useState({});
  const [selectedOptions, setSelectedOptions] = useState(new Set());
  const [selectedSpells, setSelectedSpells] = useState(new Set());
  const [removedSpells, setRemovedSpells] = useState(new Set());
  const [spellSearch, setSpellSearch] = useState('');
  const [selectedSpellDetail, setSelectedSpellDetail] = useState(null);

  const toggleOption = (key, exclusiveGroupKey = null) => {
    setSelectedOptions((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        if (exclusiveGroupKey) {
          for (const item of next) {
            if (item.startsWith(exclusiveGroupKey + "|||")) next.delete(item);
          }
        }
        next.add(key);
      }
      return next;
    });
  };

  useEffect(() => {
    if (modals.levelUp?.open) {
      setSubclassSelected(character.charSubclass || '');
      setHpRolls({});
      setAsiChoices({});
      setSelectedOptions(new Set());
      setSelectedSpells(new Set());
      setRemovedSpells(new Set());
      setSelectedSpellDetail(null);
      setActiveTab('features');
    }
  }, [modals.levelUp, character.charSubclass]);

  const classObj = useMemo(() => {
    if (!modals.levelUp?.open || !data.classes || !character.charClass) return null;
    const candidates = data.classes.filter(c => c.name?.toLowerCase() === character.charClass.toLowerCase());
    if (!candidates.length) return null;
    return candidates.sort((a, b) => getGlobalSourcePriority(b.source) - getGlobalSourcePriority(a.source))[0];
  }, [data.classes, character.charClass, modals.levelUp?.open]);

  const isSpellcaster = useMemo(() => {
    if (!modals.levelUp?.open) return false;
    const c = (character.charClass || "").toLowerCase();
    const fullCasters = ["bard", "cleric", "druid", "sorcerer", "wizard"];
    const halfCasters = ["paladin", "ranger", "artificer"];
    let caster = fullCasters.includes(c) || halfCasters.includes(c) || c === "warlock";
    if (!caster && subclassSelected) {
      if (c === "fighter" && subclassSelected.toLowerCase().includes("eldritch knight")) caster = true;
      if (c === "rogue" && subclassSelected.toLowerCase().includes("arcane trickster")) caster = true;
    }
    return caster;
  }, [character.charClass, subclassSelected, modals.levelUp?.open]);

  const maxSpellLevel = useMemo(() => {
    if (!modals.levelUp?.open) return 0;
    const c = (character.charClass || "").toLowerCase();
    const l = targetLevel;
    const fullCasters = ["bard", "cleric", "druid", "sorcerer", "wizard"];
    if (fullCasters.includes(c)) return Math.min(9, Math.ceil(l / 2));
    if (c === "warlock") return Math.min(9, Math.ceil(l / 2));
    const halfCasters = ["paladin", "ranger", "artificer"];
    if (halfCasters.includes(c)) {
      if (l >= 17) return 5;
      if (l >= 13) return 4;
      if (l >= 9) return 3;
      if (l >= 5) return 2;
      return (l >= 2 || c === "artificer") ? 1 : 0;
    }
    const thirdCasters = ["fighter", "rogue"];
    if (thirdCasters.includes(c)) {
      if (l >= 19) return 4;
      if (l >= 13) return 3;
      if (l >= 7) return 2;
      if (l >= 3) return 1;
      return 0;
    }
    return 0;
  }, [character.charClass, targetLevel, modals.levelUp?.open]);

  const classSpells = useMemo(() => {
    if (!modals.levelUp?.open || !character.charClass || !data.spells) return [];
    let cls = character.charClass.toLowerCase();
    if (cls === "fighter" && subclassSelected?.toLowerCase().includes("eldritch knight")) cls = "wizard";
    if (cls === "rogue" && subclassSelected?.toLowerCase().includes("arcane trickster")) cls = "wizard";

    const matched = data.spells?.filter((s) => {
      if (s.level > maxSpellLevel) return false;
      if (s._normalizedClasses) return s._normalizedClasses.has(cls);
      if (!s.classes) return false;
      const check = (c) => (typeof c === "string" ? c : c.name).toLowerCase() === cls;
      if (Array.isArray(s.classes)) return s.classes.some(check);
      if (s.classes.fromClassList) return s.classes.fromClassList.some(check);
      return false;
    });
    const unique = new Map();
    matched.forEach(s => {
      if (!unique.has(s.name)) {
        unique.set(s.name, s);
      } else {
        const ex = unique.get(s.name);
        if (getGlobalSourcePriority(s.source) > getGlobalSourcePriority(ex.source)) {
          unique.set(s.name, s);
        }
      }
    });
    return Array.from(unique.values()).sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
  }, [data.spells, character.charClass, subclassSelected, maxSpellLevel, modals.levelUp?.open]);

  const filteredSpells = useMemo(() => {
    if (!modals.levelUp?.open) return [];
    const q = spellSearch.toLowerCase();
    return classSpells.filter(s => s.name.toLowerCase().includes(q));
  }, [classSpells, spellSearch, modals.levelUp?.open]);

  const currentSpells = useMemo(() => {
    if (!modals.levelUp?.open) return [];
    return [
      ...(character.cantripsList || []),
      ...(character.preparedSpellsList || []),
      ...(character.spellsList || [])
    ];
  }, [character, modals.levelUp?.open]);

  const toggleSpellAdd = (name) => {
    setSelectedSpells(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const toggleSpellRemove = (name) => {
    setRemovedSpells(prev => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  const spellsToRender = useMemo(() => {
    return filteredSpells.filter(s => {
      const isCurrentlyKnown = currentSpells.some(cs => cs.name === s.name) && !removedSpells.has(s.name);
      return !isCurrentlyKnown;
    });
  }, [filteredSpells, currentSpells, removedSpells]);

  const limits = useMemo(() => {
    if (!modals.levelUp?.open || !classObj) return { cantrips: 0, spells: 0, type: "known" };

    let cantrips = 0;
    if (classObj.cantripProgression) {
      cantrips = classObj.cantripProgression[targetLevel - 1] || 0;
    } else {
      const getColValue = (regex) => {
        if (!classObj.classTableGroups) return Infinity;
        for (const group of classObj.classTableGroups) {
          if (!group.colLabels) continue;
          const colIndex = group.colLabels.findIndex((l) => {
            const clean = l.replace(/\{@\w+\s*([^}]+)?\}/g, (m, c) => c ? c.split("|")[0] : "");
            return regex.test(clean);
          });
          if (colIndex !== -1 && group.rows && group.rows[targetLevel - 1]) {
            let val = group.rows[targetLevel - 1][colIndex];
            if (typeof val === "object" && val.value !== undefined) val = val.value;
            if (val === "-" || val === "\u2014") return 0;
            const parsed = parseInt(val, 10);
            return isNaN(parsed) ? Infinity : parsed;
          }
        }
        return Infinity;
      };
      cantrips = getColValue(/Cantrips/i);
      if (cantrips === Infinity) cantrips = 0;
    }

    let spells = 0;
    let type = "known";

    if (classObj.preparedSpellsProgression) {
      spells = classObj.preparedSpellsProgression[targetLevel - 1] || 0;
      type = "prepared";
    } else if (classObj.spellsKnownProgression) {
      spells = classObj.spellsKnownProgression[targetLevel - 1] || 0;
      type = "known";
    } else {
      const SPELLS_KNOWN_TABLE = {
        sorcerer: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 12, 13, 13, 14, 14, 15, 15, 15, 15],
        warlock: [2, 3, 4, 5, 6, 7, 8, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15],
        bard: [4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 15, 15, 16, 18, 19, 19, 20, 22, 22, 22],
      };
      const cClass = (character.charClass || "").toLowerCase();
      if (SPELLS_KNOWN_TABLE[cClass]) {
        spells = SPELLS_KNOWN_TABLE[cClass][targetLevel - 1] || Infinity;
      } else {
        type = "prepared";
        const spellAbility = classObj.spellcastingAbility || "int";
        const abilityScore = parseInt(character[spellAbility]) || 10;
        const abilityMod = Math.floor((abilityScore - 10) / 2);
        const halfLevel = Math.max(1, Math.floor(targetLevel / 2));

        if (["cleric", "druid", "wizard"].includes(cClass)) {
          spells = abilityMod + targetLevel;
        } else if (["paladin", "ranger", "artificer"].includes(cClass)) {
          spells = abilityMod + halfLevel;
        } else {
          spells = Infinity;
        }
        spells = Math.max(1, spells);
      }
    }
    return { cantrips, spells, type };
  }, [classObj, character, targetLevel, modals.levelUp?.open]);

  const selectedCounts = useMemo(() => {
    if (!modals.levelUp?.open) return { cantrips: 0, leveled: 0 };
    const classSpellNames = new Set(classSpells.map(s => s.name));
    let cantrips = currentSpells.filter(s => s.level === 0 && !removedSpells.has(s.name) && classSpellNames.has(s.name)).length;
    let leveled = currentSpells.filter(s => s.level > 0 && !removedSpells.has(s.name) && classSpellNames.has(s.name)).length;

    Array.from(selectedSpells).forEach(name => {
      const s = classSpells.find(sp => sp.name === name);
      if (s) {
        if (s.level === 0) cantrips++;
        else leveled++;
      }
    });

    return { cantrips, leveled };
  }, [selectedSpells, removedSpells, currentSpells, classSpells, modals.levelUp?.open]);

  const features = useMemo(() => {
    if (!modals.levelUp?.open || !data || !character.charClass) return [];
    const minLvl = oldLevel ? oldLevel + 1 : targetLevel;
    const targetCls = character.charClass.toLowerCase();
    
    let classSource = classObj?.source || 'PHB';

    const cFeats = data.classFeatures?.filter(f => 
      f.className?.toLowerCase() === targetCls && 
      f.source === classSource &&
      !f.subclassShortName &&
      f.level >= minLvl && f.level <= targetLevel
    ) || [];

    const syntheticFeats = [];
    const getCount = (progMap, lvl) => {
      let c = 0;
      for (let i = 1; i <= lvl; i++) {
          if (progMap && progMap[i]) c = progMap[i];
      }
      return c;
    };

    const processProgression = (prog) => {
        const oldC = getCount(prog.progression, oldLevel || targetLevel - 1);
        const newC = getCount(prog.progression, targetLevel);
        if (newC > oldC) {
            syntheticFeats.push({
                name: prog.name,
                level: targetLevel,
                entries: [`You gain ${newC - oldC} additional ${prog.name}.`],
                _isSyntheticOption: true,
                _choiceCount: newC - oldC
            });
        }
    };

    if (classObj?.optionalfeatureProgression) {
        classObj.optionalfeatureProgression.forEach(processProgression);
    }

    let sFeats = [];
    if (subclassSelected) {
      const subCandidates = data.subclasses?.filter(s => s.name?.toLowerCase() === subclassSelected.toLowerCase() && s.className?.toLowerCase() === targetCls) || [];
      const subObj = subCandidates.sort((a, b) => getGlobalSourcePriority(b.source) - getGlobalSourcePriority(a.source))[0];
      const scShort = subObj?.shortName?.toLowerCase() || subclassSelected.toLowerCase();
      const subSource = subObj?.source || classSource;
      if (subObj?.optionalfeatureProgression) {
          subObj.optionalfeatureProgression.forEach(processProgression);
      }
      sFeats = data.subclassFeatures?.filter(f => 
        f.className?.toLowerCase() === targetCls && 
        f.subclassShortName?.toLowerCase() === scShort &&
        f.source === subSource &&
        f.level >= minLvl && f.level <= targetLevel
      ) || [];
    }

    const all = [...cFeats, ...sFeats, ...syntheticFeats];
    const unique = new Map();
    all.forEach(f => {
      if (!unique.has(f.name)) unique.set(f.name, f);
    });
    return Array.from(unique.values()).sort((a,b) => a.level - b.level);
  }, [data, character.charClass, classObj, subclassSelected, oldLevel, targetLevel, modals.levelUp?.open]);

  const asiFeatures = features.filter(f => /ability score improvement|epic boon/i.test(f.name));

  const hitDie = classObj ? (classObj.hd?.faces || 8) : (HIT_DICE[character.charClass] || 8);
  const levelsGained = Math.max(1, targetLevel - (oldLevel || targetLevel - 1));
  const conMod = Math.floor(((parseInt(character.con) || 10) - 10) / 2);
  const avgRoll = Math.floor(hitDie / 2) + 1;
  const avgGain = (avgRoll + conMod) * levelsGained;

  const totalHpGain = hpMode === 'average' ? avgGain : 
    Array.from({ length: levelsGained }).reduce((sum, _, i) => sum + Math.max(1, Math.min(hitDie, parseInt(hpRolls[i]) || 0)) + conMod, 0);

  if (!modals.levelUp?.open) return null;

  const handleConfirm = () => {
    const updates = {};
    if (subclassSelected && subclassSelected !== character.charSubclass) {
      updates.charSubclass = subclassSelected;
    }

    if (totalHpGain > 0) {
      updates.maxHp = (parseInt(character.maxHp) || 0) + totalHpGain;
      updates.hp = (parseInt(character.hp) || 0) + totalHpGain;
    }

    let newStr = parseInt(character.str) || 10;
    let newDex = parseInt(character.dex) || 10;
    let newCon = parseInt(character.con) || 10;
    let newInt = parseInt(character.int) || 10;
    let newWis = parseInt(character.wis) || 10;
    let newCha = parseInt(character.cha) || 10;
    const newFeats = [...(character.feats || [])];

    Object.values(asiChoices).forEach(choice => {
      if (choice.mode === '+2' && choice.stat1) {
        if (choice.stat1 === 'str') newStr += 2; if (choice.stat1 === 'dex') newDex += 2;
        if (choice.stat1 === 'con') newCon += 2; if (choice.stat1 === 'int') newInt += 2;
        if (choice.stat1 === 'wis') newWis += 2; if (choice.stat1 === 'cha') newCha += 2;
      } else if (choice.mode === '+1+1' && choice.statA && choice.statB) {
        if (choice.statA === 'str' || choice.statB === 'str') newStr += 1;
        if (choice.statA === 'dex' || choice.statB === 'dex') newDex += 1;
        if (choice.statA === 'con' || choice.statB === 'con') newCon += 1;
        if (choice.statA === 'int' || choice.statB === 'int') newInt += 1;
        if (choice.statA === 'wis' || choice.statB === 'wis') newWis += 1;
        if (choice.statA === 'cha' || choice.statB === 'cha') newCha += 1;
      } else if (choice.mode === 'feat' && choice.featName) {
        newFeats.push({ title: choice.featName, desc: '' });
      }
    });

    if (newStr !== (parseInt(character.str) || 10)) updates.str = newStr;
    if (newDex !== (parseInt(character.dex) || 10)) updates.dex = newDex;
    if (newCon !== (parseInt(character.con) || 10)) updates.con = newCon;
    if (newInt !== (parseInt(character.int) || 10)) updates.int = newInt;
    if (newWis !== (parseInt(character.wis) || 10)) updates.wis = newWis;
    if (newCha !== (parseInt(character.cha) || 10)) updates.cha = newCha;
    if (newFeats.length !== (character.feats?.length || 0)) updates.feats = newFeats;

    const newClassFeatures = [...(character.classFeatures || [])];
    features.forEach(f => {
      if (!/ability score improvement|epic boon/i.test(f.name) && !newClassFeatures.some(cf => cf.title === f.name)) {
        newClassFeatures.push({ title: f.name, desc: cleanText(processEntries(f.entries || f.entry)) });
      }
    });

    selectedOptions.forEach((optKey) => {
      const parts = optKey.split("|||");
      const name = parts[parts.length - 1];
      const cands = [
        ...(data.optionalFeatures?.filter((f) => f.name === name) || []),
        ...(data.classFeatures?.filter((f) => f.name === name) || []),
        ...(data.feats?.filter((f) => f.name === name) || []),
      ];
      const resolvedFeat = resolveFeatureWithCopy(cands, [
        data.optionalFeatures,
        data.classFeatures,
        data.feats,
      ], classObj?.source || 'PHB');
      if (resolvedFeat) {
        newClassFeatures.push({
          title: resolvedFeat.name,
          desc: cleanText(
            processEntries(resolvedFeat.entries || resolvedFeat.entry),
          ),
          source: "choice",
        });
      } else {
        newClassFeatures.push({
          title: "Feature Choice",
          desc: name,
          source: "choice",
        });
      }
    });
    updates.classFeatures = newClassFeatures;

    if (isSpellcaster) {
        let updatedCantrips = [...(character.cantripsList || [])].filter(s => !removedSpells.has(s.name));
        let updatedPrepared = [...(character.preparedSpellsList || [])].filter(s => !removedSpells.has(s.name));
        let updatedKnown = [...(character.spellsList || [])].filter(s => !removedSpells.has(s.name));

        const preparedClasses = ["cleric", "druid", "paladin", "wizard", "artificer"];
        const isPreparedClass = preparedClasses.includes((character.charClass || "").toLowerCase());

        selectedSpells.forEach(name => {
          const s = data.spells?.find(sp => sp.name === name);
          if (!s) return;
          const lvl = s.level || 0;
          const spellObj = {
            name,
            level: lvl,
            time: s.time ? `${s.time[0]?.number || ''} ${s.time[0]?.unit || ''}`.trim() : "",
            range: s.range ? (s.range.distance ? `${s.range.distance.amount || ""} ${s.range.distance.type}`.trim() : s.range.type) : "",
            ritual: s.meta?.ritual || false,
            concentration: s.duration?.[0]?.concentration || false,
            material: !!s.components?.m || !!s.components?.M,
            description: cleanText(processEntries(s.entries || [])),
            attackType: s.spellAttack?.[0]?.toUpperCase() || "",
            saveAbility: s.savingThrow?.[0]?.toLowerCase() || "",
            prepared: lvl > 0 ? isPreparedClass : false
          };
          if (lvl === 0) updatedCantrips.push(spellObj);
          else if (isPreparedClass) updatedPrepared.push(spellObj);
          else updatedKnown.push(spellObj);
        });

        updates.cantripsList = updatedCantrips;
        updates.preparedSpellsList = updatedPrepared;
        updates.spellsList = updatedKnown;
    }

    update(updates);
    closeModal('levelUp');
  };

  const STATS = [
    { id: 'str', label: 'Strength' }, { id: 'dex', label: 'Dexterity' },
    { id: 'con', label: 'Constitution' }, { id: 'int', label: 'Intelligence' },
    { id: 'wis', label: 'Wisdom' }, { id: 'cha', label: 'Charisma' },
  ];

  const tabStyle = (active) => ({ background: 'transparent', border: 'none', borderBottom: active ? '3px solid var(--red-dark)' : '3px solid transparent', padding: '8px 16px', fontFamily: '"Cinzel", serif', fontSize: '0.85rem', fontWeight: 600, color: active ? 'var(--red-dark)' : 'var(--ink-light)', cursor: 'pointer', transition: 'all 0.15s', marginBottom: '-2px' });

  return (
    <ModalOverlay onClick={(e) => { if (e.target === e.currentTarget) closeModal('levelUp'); }} $zIndex={2010}>
      <ModalBox $maxWidth="950px" style={{ display: 'flex', flexDirection: 'column', height: '85vh' }}>
        <CloseBtn type="button" style={{ zIndex: 100 }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); closeModal('levelUp');}}>&times;</CloseBtn>
        <ModalTitle style={{ textAlign: 'center', marginBottom: 10 }}>Level {targetLevel} Features</ModalTitle>
        
        <div style={{ display: 'flex', gap: 4, borderBottom: '2px solid var(--gold)', paddingBottom: 0, marginBottom: 10, background: 'var(--parchment-dark)' }}>
          <button style={tabStyle(activeTab === 'features')} onClick={() => setActiveTab('features')}>Features</button>
          {isSpellcaster && <button style={tabStyle(activeTab === 'spells')} onClick={() => setActiveTab('spells')}>Spells</button>}
          <button style={tabStyle(activeTab === 'hp')} onClick={() => setActiveTab('hp')}>HP</button>
          {asiFeatures.length > 0 && <button style={tabStyle(activeTab === 'asi')} onClick={() => setActiveTab('asi')}>ASI / Feat</button>}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', paddingRight: 4 }}>
          {loading && <div style={{ textAlign: 'center', padding: 20 }}>Loading database...</div>}
          {!loading && activeTab === 'features' && (
            <div>
              {targetLevel >= 3 && !character.charSubclass && (
                <div style={{ padding: 10, border: '2px dashed var(--gold)', background: 'var(--parchment)', marginBottom: 15 }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--red-dark)', marginBottom: 5 }}>Select Subclass</div>
                  <select className="styled-select" value={subclassSelected} onChange={e => setSubclassSelected(e.target.value)}>
                    <option value="">-- Choose --</option>
                    {Array.from(new Set(data.subclasses?.filter(s => s.className?.toLowerCase() === character.charClass?.toLowerCase()).map(s => s.name))).sort().map(name => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                </div>
              )}
              {features.length === 0 && <div style={{ color: 'var(--ink-light)', textAlign: 'center', fontStyle: 'italic' }}>No new features found for this level.</div>}
              {features.map((f, i) => (
                <div key={i} style={{ padding: 10, border: '1px solid var(--gold)', borderRadius: 4, background: 'white', marginBottom: 12 }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--red-dark)', borderBottom: '1px solid var(--gold-light)', paddingBottom: 2, marginBottom: 6 }}>
                    <span style={{ color: 'var(--ink)' }}>[Lv {f.level}]</span> {f.name} {f.source && <span style={{ fontSize: '0.8rem', color: 'var(--ink-light)', fontWeight: 'normal', marginLeft: 4 }}>({f.source})</span>}
                  </div>
                  <div style={{ fontSize: '0.85rem', lineHeight: 1.5 }} dangerouslySetInnerHTML={{ __html: cleanText(processEntries(f.entries || f.entry)) }} />
                  <FeatureChoices
                    feature={f}
                    data={data}
                    character={character}
                    selectedSpells={selectedSpells}
                    selectedClass={character.charClass}
                    subclassSelected={subclassSelected}
                    classSource={classObj?.source || 'PHB'}
                    selectedLevel={targetLevel}
                    selectedOptions={selectedOptions}
                    onToggleOption={toggleOption}
                  />
                </div>
              ))}
            </div>
          )}

          {!loading && activeTab === 'spells' && isSpellcaster && (
            <div style={{ display: "flex", flexWrap: "wrap", height: "100%", overflow: "hidden", gap: 16 }}>
              {/* Left Side: Table */}
              <div style={{ flex: "1 1 400px", display: "flex", flexDirection: "column", background: "var(--parchment-dark)", border: "1px solid var(--gold)", borderRadius: 6, overflow: "hidden", maxHeight: "100%" }}>
                <div style={{ padding: "10px", borderBottom: "1px solid var(--gold)", display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                  <strong style={{ fontSize: "1.1rem", color: "var(--ink)", whiteSpace: "nowrap" }}>Spells (Max Lvl {maxSpellLevel})</strong>
                  <input
                    type="text"
                    placeholder="Search spells..."
                    value={spellSearch}
                    onChange={e => setSpellSearch(e.target.value)}
                    className="styled-select"
                    style={{ flex: 1, padding: "4px 8px", minWidth: "150px" }}
                  />
                </div>
                <div style={{ flex: 1, overflowY: "auto" }}>
                  <SpellTable 
                    spells={spellsToRender}
                    selectedSpells={selectedSpells}
                    onToggleSpell={toggleSpellAdd}
                    onSetDetail={setSelectedSpellDetail}
                    showSource={false}
                  />
                </div>
              </div>

              {/* Right Side: Details & Selection */}
              <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: 16, overflowY: "auto", paddingRight: 4, maxHeight: "100%" }}>
                {/* Selections box */}
                <div style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--gold)", borderRadius: 6, padding: "12px 16px", flexShrink: 0 }}>
                  <h3 style={{ margin: "0 0 10px", color: "var(--red-dark)", borderBottom: "1px solid var(--gold)", paddingBottom: 4 }}>Spell Selections</h3>

                  {/* Limits UI */}
                  {limits && (
                    <div style={{ marginBottom: 16 }}>
                      {limits.cantrips !== Infinity && limits.cantrips > 0 && (
                        <div style={{ marginBottom: 8 }}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: 2 }}>
                            <span>Total Cantrips:</span>
                            <strong style={{ color: selectedCounts.cantrips > limits.cantrips ? "var(--red)" : "var(--ink)" }}>{selectedCounts.cantrips} / {limits.cantrips}</strong>
                          </div>
                          <div style={{ width: "100%", background: "rgba(0,0,0,0.1)", height: 6, borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ width: `${Math.min(100, (selectedCounts.cantrips / limits.cantrips) * 100)}%`, background: selectedCounts.cantrips > limits.cantrips ? "var(--red)" : "#3b82f6", height: "100%", transition: "width 0.3s" }} />
                          </div>
                        </div>
                      )}
                      {limits.spells !== Infinity && limits.spells > 0 && (
                        <div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: 2 }}>
                            <span>{limits.type === "prepared" ? "Max Prepared" : "Total Spells Known"}:</span>
                            <strong style={{ color: selectedCounts.leveled > limits.spells ? "var(--red)" : "var(--ink)" }}>{selectedCounts.leveled} / {limits.spells}</strong>
                          </div>
                          <div style={{ width: "100%", background: "rgba(0,0,0,0.1)", height: 6, borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ width: `${Math.min(100, (selectedCounts.leveled / limits.spells) * 100)}%`, background: selectedCounts.leveled > limits.spells ? "var(--red)" : "#3b82f6", height: "100%", transition: "width 0.3s" }} />
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* New Selections */}
                  {selectedSpells.size > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <strong style={{ fontSize: "0.85rem", color: "var(--ink-light)" }}>New Spells ({selectedSpells.size})</strong>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                        {Array.from(selectedSpells).map(name => (
                          <span key={name} onClick={() => toggleSpellAdd(name)} style={{ background: "var(--red)", color: "white", padding: "2px 8px", borderRadius: 12, fontSize: "0.8rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}>
                            {name} <span style={{ opacity: 0.7 }}>×</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Replaced Spells */}
                  {removedSpells.size > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <strong style={{ fontSize: "0.85rem", color: "var(--ink-light)" }}>Replacing ({removedSpells.size})</strong>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                        {Array.from(removedSpells).map(name => (
                          <span key={name} onClick={() => toggleSpellRemove(name)} style={{ background: "rgba(0,0,0,0.1)", color: "var(--ink-light)", padding: "2px 8px", borderRadius: 12, fontSize: "0.8rem", cursor: "pointer", textDecoration: "line-through", display: "flex", alignItems: "center", gap: 4 }}>
                            {name} <span style={{ opacity: 0.7, textDecoration: "none" }}>↺</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Current Spells */}
                  <div>
                    <strong style={{ fontSize: "0.85rem", color: "var(--ink-light)" }}>Currently Known (Click to Replace)</strong>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                      {currentSpells.filter(s => !removedSpells.has(s.name)).map(s => (
                        <span key={s.name} onClick={() => toggleSpellRemove(s.name)} style={{ background: "var(--parchment-dark)", border: "1px solid var(--gold-dark)", color: "var(--ink)", padding: "2px 8px", borderRadius: 12, fontSize: "0.8rem", cursor: "pointer", transition: "all 0.15s" }} onMouseEnter={e => { e.currentTarget.style.background = 'var(--red)'; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'var(--red-dark)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'var(--parchment-dark)'; e.currentTarget.style.color = 'var(--ink)'; e.currentTarget.style.borderColor = 'var(--gold-dark)'; }}>
                          {s.name}
                        </span>
                      ))}
                      {currentSpells.filter(s => !removedSpells.has(s.name)).length === 0 && (
                        <em style={{ color: "var(--ink-light)", fontSize: "0.8rem" }}>None</em>
                      )}
                    </div>
                  </div>
                </div>

                {/* Spell Detail Box */}
                {selectedSpellDetail ? (
                  <div style={{ background: "rgba(255,255,255,0.6)", border: "1px solid var(--gold)", borderRadius: 6, padding: 16, flexShrink: 0 }}>
                    <h3 style={{ marginTop: 0, color: "var(--red-dark)" }}>{selectedSpellDetail.name}</h3>
                    <p style={{ margin: "4px 0", color: "var(--ink-light)", fontSize: "0.85rem" }}>
                      {selectedSpellDetail.level === 0 ? "Cantrip" : `${selectedSpellDetail.level}${["st", "nd", "rd"][selectedSpellDetail.level - 1] || "th"}-level`}
                      {selectedSpellDetail.school && ` ${schoolMap[selectedSpellDetail.school.toLowerCase()] || selectedSpellDetail.school}`}
                      {selectedSpellDetail.meta?.ritual && " (Ritual)"}
                      {selectedSpellDetail.meta?.concentration && " (Concentration)"}
                    </p>
                    {selectedSpellDetail.time && (
                      <p style={{ margin: "4px 0", fontSize: "0.85rem" }}>
                        <strong>Casting Time:</strong> {Array.isArray(selectedSpellDetail.time) ? selectedSpellDetail.time.map((t) => `${t.number} ${t.unit}`).join(", ") : selectedSpellDetail.time}
                      </p>
                    )}
                    {selectedSpellDetail.range && (
                      <p style={{ margin: "4px 0", fontSize: "0.85rem" }}>
                        <strong>Range:</strong> {typeof selectedSpellDetail.range === "object" ? `${selectedSpellDetail.range.distance?.amount || ""} ${selectedSpellDetail.range.distance?.type || ""}`.trim() : selectedSpellDetail.range}
                      </p>
                    )}
                    {selectedSpellDetail.duration && (
                      <p style={{ margin: "4px 0", fontSize: "0.85rem" }}>
                        <strong>Duration:</strong> {Array.isArray(selectedSpellDetail.duration) ? selectedSpellDetail.duration.map((d) => d.type === "permanent" ? "Until dispelled" : d.type === "timed" ? `${d.concentration ? "Concentration, " : ""}${d.duration?.amount || ""} ${d.duration?.type || ""}`.trim() : d.type).join(", ") : selectedSpellDetail.duration}
                      </p>
                    )}
                    {selectedSpellDetail.entries && (
                      <div style={{ marginTop: 10, fontSize: "0.9rem", lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: cleanText(processEntries(selectedSpellDetail.entries)).replace(/\n/g, "<br>").replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") }} />
                    )}
                    {selectedSpellDetail.entriesHigherLevel && (
                      <div style={{ marginTop: 10, borderTop: "1px dashed var(--gold)", paddingTop: 8, fontSize: "0.9rem" }} dangerouslySetInnerHTML={{ __html: cleanText(processEntries(selectedSpellDetail.entriesHigherLevel)).replace(/\n/g, "<br>").replace(/\*\*(.*?)\*\*/g, "<b>$1</b>") }} />
                    )}
                  </div>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px dashed var(--gold)', borderRadius: 6, color: 'var(--ink-light)', fontStyle: 'italic', minHeight: 200 }}>
                    Hover or click a spell to view details
                  </div>
                )}
              </div>
            </div>
          )}

          {!loading && activeTab === 'hp' && (
            <div>
              <div style={{ background: 'var(--parchment-dark)', border: '1px solid var(--gold)', borderRadius: 6, padding: '10px 12px', marginBottom: 12, display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: '0.9rem' }}>
                <span>Hit Die: <strong>d{hitDie}</strong></span>
                <span>CON mod: <strong>{conMod}</strong></span>
                <span>Levels gained: <strong>{levelsGained}</strong></span>
                <span>Current Max HP: <strong>{character.maxHp || 0}</strong></span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
                <button className={`btn ${hpMode === 'average' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setHpMode('average')} style={{ flex: 1, padding: '6px' }}>Average</button>
                <button className={`btn ${hpMode === 'manual' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setHpMode('manual')} style={{ flex: 1, padding: '6px' }}>Roll</button>
              </div>
              {hpMode === 'average' ? (
                <div style={{ background: 'white', border: '1px solid var(--gold)', borderRadius: 6, padding: 12, marginBottom: 12, fontSize: '0.9rem' }}>
                  Average per level: <strong>{avgRoll}</strong> + <strong>{conMod}</strong> CON = <strong style={{ color: 'var(--red-dark)' }}>{avgRoll + conMod}</strong>
                  {levelsGained > 1 && <div style={{ marginTop: 4 }}>Total ({levelsGained} levels): <strong style={{ color: 'var(--red-dark)' }}>{avgGain}</strong></div>}
                </div>
              ) : (
                <div style={{ marginBottom: 12 }}>
                  {Array.from({ length: levelsGained }).map((_, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: '0.9rem', color: 'var(--ink-light)', minWidth: 60 }}>Roll {i + 1}:</span>
                      <input type="number" min="1" max={hitDie} placeholder={`1-${hitDie}`} value={hpRolls[i] || ''} onChange={e => setHpRolls(p => ({ ...p, [i]: e.target.value }))} style={{ width: 60, textAlign: 'center', padding: '4px', border: '1px solid var(--gold)', borderRadius: 4 }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--ink-light)' }}>/ d{hitDie}</span>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ background: 'var(--parchment-dark)', border: '2px solid var(--gold)', borderRadius: 6, padding: 12, textAlign: 'center', fontSize: '1rem' }}>
                New Max HP: <strong>{character.maxHp || 0}</strong> + <strong style={{ color: 'var(--red-dark)' }}>{totalHpGain}</strong> = <strong style={{ color: 'var(--red-dark)', fontSize: '1.2rem' }}>{(parseInt(character.maxHp) || 0) + totalHpGain}</strong>
              </div>
            </div>
          )}

          {!loading && activeTab === 'asi' && (
            <div>
              {asiFeatures.map((f, fi) => {
                const uid = `asi-${fi}`;
                const choice = asiChoices[uid] || { mode: '+2', stat1: '', statA: '', statB: '', featName: '' };
                const setChoice = (updates) => setAsiChoices(p => ({ ...p, [uid]: { ...choice, ...updates } }));
                
                return (
                  <div key={fi} style={{ marginBottom: 18, border: '1px solid var(--gold)', borderRadius: 6, padding: 12, background: 'var(--parchment)' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--red-dark)', marginBottom: 10, fontSize: '0.95rem' }}>{f.name} <span style={{ fontWeight: 'normal', color: 'var(--ink-light)', fontSize: '0.8rem' }}>[Level {f.level}]</span></div>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                      <button className={`btn ${choice.mode === '+2' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, padding: 6, fontSize: '0.8rem' }} onClick={() => setChoice({ mode: '+2' })}>+2 to One</button>
                      <button className={`btn ${choice.mode === '+1+1' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, padding: 6, fontSize: '0.8rem' }} onClick={() => setChoice({ mode: '+1+1' })}>+1 / +1</button>
                      <button className={`btn ${choice.mode === 'feat' ? 'btn-primary' : 'btn-secondary'}`} style={{ flex: 1, padding: 6, fontSize: '0.8rem' }} onClick={() => setChoice({ mode: 'feat' })}>Feat</button>
                    </div>
                    {choice.mode === '+2' && (
                      <select className="styled-select" value={choice.stat1} onChange={e => setChoice({ stat1: e.target.value })}>
                        <option value="">-- Choose Ability --</option>
                        {STATS.map(s => <option key={s.id} value={s.id}>{s.label} ({parseInt(character[s.id]) || 10})</option>)}
                      </select>
                    )}
                    {choice.mode === '+1+1' && (
                      <div style={{ display: 'flex', gap: 10 }}>
                        <select className="styled-select" style={{ flex: 1 }} value={choice.statA} onChange={e => setChoice({ statA: e.target.value })}>
                          <option value="">-- First (+1) --</option>
                          {STATS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                        </select>
                        <select className="styled-select" style={{ flex: 1 }} value={choice.statB} onChange={e => setChoice({ statB: e.target.value })}>
                          <option value="">-- Second (+1) --</option>
                          {STATS.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
                        </select>
                      </div>
                    )}
                    {choice.mode === 'feat' && (
                      <div>
                        <input type="text" className="styled-select" placeholder="Enter feat name..." value={choice.featName} onChange={e => setChoice({ featName: e.target.value })} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 'auto', borderTop: '1px solid var(--gold)', paddingTop: 10, flexShrink: 0 }}>
          <button type="button" className="btn btn-secondary" style={{ flex: 1 }} onClick={(e) => { e.preventDefault(); e.stopPropagation(); closeModal('levelUp'); }}>Cancel</button>
          <PrimaryBtn style={{ flex: 1 }} onClick={handleConfirm}>Confirm Updates</PrimaryBtn>
        </div>
      </ModalBox>
    </ModalOverlay>
  );
}