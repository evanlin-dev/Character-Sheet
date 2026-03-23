import { processEntries, cleanText } from "src/utils/dndEntries";

export function sourcePriority(s) {
  if (!s) return 100;
  const sUpper = s.toUpperCase();
  if (sUpper === "XPHB" || sUpper === "XDMG" || sUpper === "XMM") return 0;
  if (sUpper === "EFA") return 10;
  if (sUpper === "CROOKEDMOON24") return 15;
  if (sUpper === "CROOKEDMOON14") return 20;
  if (sUpper === "PHB" || sUpper === "DMG" || sUpper === "MM") return 50;
  if (sUpper === "TCE") return 60;
  if (sUpper === "XGE") return 70;
  return 100;
}

export function dedup(arr) {
  const map = new Map();
  arr.forEach((item) => {
    const existing = map.get(item.name);
    if (
      !existing ||
      sourcePriority(item.source) < sourcePriority(existing.source)
    ) {
      map.set(item.name, item);
    }
  });
  return [...map.values()];
}

export function getBestMatch(arr, name) {
  const matches = arr.filter((x) => x.name === name);
  if (!matches.length) return null;
  return matches.sort(
    (a, b) => sourcePriority(a.source) - sourcePriority(b.source),
  )[0];
}

export function resolveFeatureWithCopy(candidates, dbCollections, targetSource) {
  if (!candidates || candidates.length === 0) return null;
  let selected = null;
  if (targetSource)
    selected = candidates.find((f) => f.source === targetSource);
  if (!selected) selected = candidates.find((f) => f.source === "XPHB");
  if (
    selected &&
    !selected.entries &&
    !selected.entry &&
    !selected.description &&
    !selected._copy
  ) {
    const better = candidates.find(
      (f) =>
        (f.entries || f.entry || f.description || f._copy) &&
        (!targetSource || f.source === targetSource),
    );
    if (better) selected = better;
    else {
      const anyBetter = candidates.find(
        (f) => f.entries || f.entry || f.description || f._copy,
      );
      if (anyBetter) selected = anyBetter;
    }
  }
  if (!selected)
    selected =
      candidates.find((f) => f.source === "PHB") ||
      candidates.sort(
        (a, b) => sourcePriority(a.source) - sourcePriority(b.source),
      )[0];

  if (
    selected &&
    (!selected.entries ||
      (Array.isArray(selected.entries) &&
        selected.entries.length === 1 &&
        typeof selected.entries[0] === "string")) &&
    selected._copy
  ) {
    const copyName = selected._copy.name;
    const copySource = selected._copy.source || selected.source;
    let original = null;
    for (const col of dbCollections) {
      if (!col) continue;
      original = col.find(
        (o) =>
          o.name === copyName &&
          (o.source === copySource || !selected._copy.source) &&
          (o.entries || o.entry),
      );
      if (original) break;
    }
    if (original)
      selected = {
        ...original,
        ...selected,
        entries: original.entries || original.entry,
      };
  }
  return selected;
}

export function resolveBackgroundWithCopy(bg, allBackgrounds) {
  if (!bg) return null;
  let current = bg;
  let depth = 0;
  let resolvedEntries = current.entries ? JSON.parse(JSON.stringify(current.entries)) : null;
  let resolvedSkills = current.skillProficiencies;
  let resolvedTools = current.toolProficiencies;
  let resolvedLangs = current.languageProficiencies;
  let resolvedEquip = current.startingEquipment;
  
  while (current._copy && depth < 5) {
      const original = allBackgrounds.find(b => b.name === current._copy.name && (b.source === current._copy.source || !current._copy.source));
      if (!original) break;
      
      if (!resolvedEntries && original.entries) {
          resolvedEntries = JSON.parse(JSON.stringify(original.entries));
      }
      if (!resolvedSkills && original.skillProficiencies) resolvedSkills = original.skillProficiencies;
      if (!resolvedTools && original.toolProficiencies) resolvedTools = original.toolProficiencies;
      if (!resolvedLangs && original.languageProficiencies) resolvedLangs = original.languageProficiencies;
      if (!resolvedEquip && original.startingEquipment) resolvedEquip = original.startingEquipment;

      if (current._copy._mod && current._copy._mod.entries && resolvedEntries) {
          const mods = Array.isArray(current._copy._mod.entries) ? current._copy._mod.entries : [current._copy._mod.entries];
          mods.forEach(mod => {
              if (mod.mode === 'replaceArr' && mod.replace !== undefined) {
                  let idx = -1;
                  if (typeof mod.replace === 'string') {
                      idx = resolvedEntries.findIndex(e => e.name === mod.replace);
                  } else if (typeof mod.replace === 'object' && mod.replace.index !== undefined) {
                      idx = mod.replace.index;
                  }
                  if (idx !== -1) {
                      const items = Array.isArray(mod.items) ? mod.items : [mod.items];
                      resolvedEntries.splice(idx, 1, ...items);
                  }
              } else if (mod.mode === 'insertArr' && mod.index !== undefined) {
                  const items = Array.isArray(mod.items) ? mod.items : [mod.items];
                  resolvedEntries.splice(mod.index, 0, ...items);
              }
          });
      }
      
      current = original;
      depth++;
  }
  
  return { 
      ...bg, 
      entries: resolvedEntries || bg.entries,
      skillProficiencies: resolvedSkills || bg.skillProficiencies,
      toolProficiencies: resolvedTools || bg.toolProficiencies,
      languageProficiencies: resolvedLangs || bg.languageProficiencies,
      startingEquipment: resolvedEquip || bg.startingEquipment
  };
}

export function resolveRaceWithCopy(race, allRaces) {
  if (!race) return null;
  let current = race;
  let depth = 0;
  let resolvedEntries = current.entries ? JSON.parse(JSON.stringify(current.entries)) : null;
  let resolvedSize = current.size;
  let resolvedSpeed = current.speed;
  let resolvedDarkvision = current.darkvision;
  let resolvedAbility = current.ability;
  let resolvedSkill = current.skillProficiencies;
  let resolvedLanguage = current.languageProficiencies;
  let resolvedWeapon = current.weaponProficiencies;
  let resolvedArmor = current.armorProficiencies;
  let resolvedTool = current.toolProficiencies;
  let resolvedResist = current.resist;
  let resolvedImmune = current.immune;
  let resolvedConditionImmune = current.conditionImmune;

  while (current._copy && depth < 5) {
      const original = allRaces.find(r => r.name === current._copy.name && (!current._copy.source || r.source === current._copy.source));
      if (!original) break;
      
      if (!resolvedEntries && original.entries) resolvedEntries = JSON.parse(JSON.stringify(original.entries));
      if (!resolvedSize && original.size) resolvedSize = original.size;
      if (resolvedSpeed === undefined && original.speed !== undefined) resolvedSpeed = original.speed;
      if (resolvedDarkvision === undefined && original.darkvision !== undefined) resolvedDarkvision = original.darkvision;
      if (!resolvedAbility && original.ability) resolvedAbility = original.ability;
      if (!resolvedSkill && original.skillProficiencies) resolvedSkill = original.skillProficiencies;
      if (!resolvedLanguage && original.languageProficiencies) resolvedLanguage = original.languageProficiencies;
      if (!resolvedWeapon && original.weaponProficiencies) resolvedWeapon = original.weaponProficiencies;
      if (!resolvedArmor && original.armorProficiencies) resolvedArmor = original.armorProficiencies;
      if (!resolvedTool && original.toolProficiencies) resolvedTool = original.toolProficiencies;
      if (!resolvedResist && original.resist) resolvedResist = original.resist;
      if (!resolvedImmune && original.immune) resolvedImmune = original.immune;
      if (!resolvedConditionImmune && original.conditionImmune) resolvedConditionImmune = original.conditionImmune;

      if (current._copy._mod && current._copy._mod.entries && resolvedEntries) {
          const mods = Array.isArray(current._copy._mod.entries) ? current._copy._mod.entries : [current._copy._mod.entries];
          mods.forEach(mod => {
              if (mod.mode === 'replaceArr' && mod.replace !== undefined) {
                  let idx = -1;
                  if (typeof mod.replace === 'string') {
                      idx = resolvedEntries.findIndex(e => e.name === mod.replace);
                  } else if (typeof mod.replace === 'object' && mod.replace.index !== undefined) {
                      idx = mod.replace.index;
                  }
                  if (idx !== -1) {
                      const items = Array.isArray(mod.items) ? mod.items : (mod.items ? [mod.items] : []);
                      resolvedEntries.splice(idx, 1, ...items);
                  }
              } else if (mod.mode === 'insertArr' && mod.index !== undefined) {
                  const items = Array.isArray(mod.items) ? mod.items : (mod.items ? [mod.items] : []);
                  resolvedEntries.splice(mod.index, 0, ...items);
              } else if (mod.mode === 'appendArr') {
                  const items = Array.isArray(mod.items) ? mod.items : (mod.items ? [mod.items] : []);
                  resolvedEntries.push(...items);
              }
          });
      }
      
      current = original;
      depth++;
  }
  
  return { 
      ...race, 
      entries: resolvedEntries || race.entries,
      size: resolvedSize || race.size,
      speed: resolvedSpeed !== undefined ? resolvedSpeed : race.speed,
      darkvision: resolvedDarkvision !== undefined ? resolvedDarkvision : race.darkvision,
      ability: resolvedAbility || race.ability,
      skillProficiencies: resolvedSkill || race.skillProficiencies,
      languageProficiencies: resolvedLanguage || race.languageProficiencies,
      weaponProficiencies: resolvedWeapon || race.weaponProficiencies,
      armorProficiencies: resolvedArmor || race.armorProficiencies,
      toolProficiencies: resolvedTool || race.toolProficiencies,
      resist: resolvedResist || race.resist,
      immune: resolvedImmune || race.immune,
      conditionImmune: resolvedConditionImmune || race.conditionImmune
  };
}

export function capitalizeSkill(str) {
  if (!str) return str;
  return str.split(/[\s_]+/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

export function resolveFluffWithCopy(fluff, allFluff) {
  if (!fluff) return null;
  let current = fluff;
  let depth = 0;
  let resolvedEntries = current.entries ? JSON.parse(JSON.stringify(current.entries)) : null;
  let resolvedImages = current.images ? JSON.parse(JSON.stringify(current.images)) : null;

  while (current._copy && depth < 5) {
      const original = allFluff?.find(f => f.name === current._copy.name && (!current._copy.source || f.source === current._copy.source));
      if (!original) break;

      if (!resolvedEntries && original.entries) resolvedEntries = JSON.parse(JSON.stringify(original.entries));
      if (!resolvedImages && original.images) resolvedImages = JSON.parse(JSON.stringify(original.images));

      if (current._copy._mod && current._copy._mod.entries && resolvedEntries) {
          const mods = Array.isArray(current._copy._mod.entries) ? current._copy._mod.entries : [current._copy._mod.entries];
          mods.forEach(mod => {
              if (mod.mode === 'prependArr' && mod.items) {
                  resolvedEntries.unshift(...mod.items);
              } else if (mod.mode === 'appendArr' && mod.items) {
                  resolvedEntries.push(...mod.items);
              }
          });
      }
      current = original;
      depth++;
  }

  return {
      ...fluff,
      entries: resolvedEntries || fluff.entries,
      images: resolvedImages || fluff.images
  };
}

export function extractChoiceLists(entries) {
  const CHOICE_RE =
    /\b(choose|pick|select)\b[^.]{0,60}?\b(one|two|three|four|five|\d+)\b|one of the following|\d+\s+of the following/i;
  const results = [];
  const wordToNum = { one: 1, two: 2, three: 3, four: 4, five: 5, a: 1, an: 1 };

  function parseCount(text) {
    const m = text.match(/\b(one|two|three|four|five|a|an|\d+)\b/i);
    if (m) return wordToNum[m[1].toLowerCase()] || parseInt(m[1], 10) || 1;
    return 1;
  }

  function stripTags(str) {
    if (typeof str !== "string") return "";
    return str.replace(/\{@[a-z]+\s([^|}]+)[^}]*\}/gi, "$1");
  }

  function extractInlineItems(raw, clean) {
    if (typeof raw !== "string") return [];
    const tagMatches = [
      ...raw.matchAll(/\{@(?:skill|feat|item|race|class)\s+([^|}\s][^|}]*)/gi),
    ];
    if (tagMatches.length >= 2)
      return tagMatches.map((m) => ({ name: m[1].trim(), type: "item" }));
    const colonIdx = clean.search(/:\s*/);
    if (colonIdx !== -1) {
      const after = clean.slice(colonIdx + 1);
      const parts = after
        .split(/,\s*|\s+or\s+/i)
        .map((s) => s.replace(/[.!?]$/, "").trim())
        .filter(
          (s) =>
            s.length > 1 &&
            s.length < 60 &&
            !/\b(you|your|the|a |an |and )\b/i.test(s),
        );
      if (parts.length >= 2)
        return parts.map((name) => ({ name, type: "item" }));
    }
    return [];
  }

  function walk(arr, depth = 0) {
    if (!Array.isArray(arr) || depth > 5) return;
    for (let i = 0; i < arr.length; i++) {
      const entry = arr[i];
      if (typeof entry === "string") {
        const clean = stripTags(entry);
        if (CHOICE_RE.test(clean)) {
          const next = arr[i + 1];
          if (
            next &&
            typeof next === "object" &&
            next.type === "list" &&
            Array.isArray(next.items)
          ) {
            const namedItems = next.items.filter(
              (it) =>
                typeof it === "object" &&
                it.name &&
                it.name.length <= 50 &&
                !/[.!?]$/.test(it.name.trim()) &&
                !/\b(attack|saving throw|bonus action|reaction|spell slot)\b/i.test(
                  it.name,
                ),
            );
            if (namedItems.length >= 2)
              results.push({
                prompt: clean,
                items: namedItems,
                count: parseCount(clean),
              });
            else if (next.items.length >= 2) {
              const strItems = next.items
                .map((it) =>
                  typeof it === "string"
                    ? { name: stripTags(it), type: "item" }
                    : it,
                )
                .filter(
                  (it) =>
                    it &&
                    it.name &&
                    it.name.length <= 60 &&
                    !/[.!?]$/.test(it.name.trim()) &&
                    !/\b(attack|saving throw|bonus action|reaction|spell slot|make a|force a|take a)\b/i.test(
                      it.name,
                    ),
                );
              if (strItems.length >= 2)
                results.push({
                  prompt: clean,
                  items: strItems,
                  count: parseCount(clean),
                });
            }
          } else {
            const inlineItems = extractInlineItems(entry, clean);
            if (inlineItems.length >= 2)
              results.push({
                prompt: clean,
                items: inlineItems,
                count: parseCount(clean),
              });
          }
        }
      } else if (entry && typeof entry === "object") {
        if (entry.type === "list" && entry.name) {
          const cleanName = stripTags(entry.name);
          if (CHOICE_RE.test(cleanName) && Array.isArray(entry.items)) {
            const namedItems = entry.items.filter(
              (it) => typeof it === "object" && it.name,
            );
            if (namedItems.length >= 2)
              results.push({
                prompt: cleanName,
                items: entry.items,
                count: parseCount(cleanName),
              });
          }
        }
        if (entry.entries) walk(entry.entries, depth + 1);
        if (entry.items && entry.type !== "list") walk(entry.items, depth + 1);
      }
    }
  }

  if (Array.isArray(entries)) walk(entries, 0);
  else if (entries && typeof entries === "object") walk([entries], 0);

  const seen = new Set();
  return results.filter((r) => {
    const k = r.prompt.slice(0, 80);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export function extractOptionSets(entries) {
  const optionSets = [];
  function walk(obj) {
    if (!obj || typeof obj !== "object") return;
    if (Array.isArray(obj)) {
      obj.forEach(walk);
      return;
    }
    if (obj.type === "options") {
      const count = obj.count != null ? obj.count : 1;
      const choices = [];
      if (obj.entries) {
        obj.entries.forEach((ent) => {
          if (ent.type === "refOptionalfeature")
            choices.push({ type: "optionalfeature", uid: ent.optionalfeature });
          else if (ent.type === "refClassFeature")
            choices.push({ type: "classFeature", uid: ent.classFeature });
          else if (ent.type === "refSubclassFeature")
            choices.push({ type: "subclassFeature", uid: ent.subclassFeature });
          else if (ent.name)
            choices.push({
              type: "entries",
              name: ent.name,
              entries: ent.entries,
            });
        });
      }
      if (choices.length > 0) {
        const setId = choices
          .map((c) => c.uid || c.name || "")
          .join("|")
          .replace(/[^a-z0-9|]/gi, "")
          .substring(0, 32);
        optionSets.push({ count, choices, setId });
      }
    }
    Object.values(obj).forEach(walk);
  }
  walk(entries);
  return optionSets;
}

export function formatPrerequisites(opt) {
  if (!opt || !opt.prerequisite || !Array.isArray(opt.prerequisite)) return "";
  const groupTexts = opt.prerequisite
    .map((req) => {
      const groupReqs = [];
      if (req.level) {
        if (typeof req.level === "object") {
          let lvlStr = `Lvl ${req.level.level}`;
          if (req.level.class && req.level.class.name)
            lvlStr += ` ${req.level.class.name}`;
          groupReqs.push(lvlStr);
        } else {
          groupReqs.push(`Lvl ${req.level}`);
        }
      }
      if (req.pact) groupReqs.push(`Pact: ${req.pact}`);
      if (req.patron)
        groupReqs.push(
          `Patron: ${typeof req.patron === "string" ? req.patron : req.patron.join("/")}`,
        );
      if (req.feature)
        req.feature.forEach((f) =>
          groupReqs.push(
            `Feature: ${(typeof f === "string" ? f : f.name || "").split("|")[0]}`,
          ),
        );
      if (req.spell)
        req.spell.forEach((s) => {
          if (typeof s === "string")
            groupReqs.push(`Spell: ${s.split("#")[0]}`);
          else if (s.entry) groupReqs.push(s.entry);
        });
      if (req.optionalfeature)
        req.optionalfeature.forEach((f) =>
          groupReqs.push(`Feature: ${f.split("|")[0]}`),
        );
      if (req.item) req.item.forEach((i) => groupReqs.push(i));
      if (req.otherSummary)
        groupReqs.push(req.otherSummary.entrySummary || req.otherSummary.entry);

      if (req.ability) {
        req.ability.forEach((a) => {
          if (a.choose && a.choose.from) {
            groupReqs.push(
              `Ability: ${a.choose.from.join(" or ").toUpperCase()}`,
            );
          } else {
            const abs = Object.keys(a)
              .filter((k) => k !== "choose")
              .map((k) => `${k.toUpperCase()} ${a[k]}`)
              .join(" or ");
            if (abs) groupReqs.push(abs);
          }
        });
      }
      if (req.race) {
        const races = req.race
          .map((r) => r.name + (r.subrace ? ` (${r.subrace})` : ""))
          .join(" or ");
        if (races) groupReqs.push(`Race: ${races}`);
      }
      if (req.proficiency) {
        req.proficiency.forEach((p) => {
          if (p.armor) groupReqs.push(`Armor: ${p.armor}`);
          if (p.weapon) groupReqs.push(`Weapon: ${p.weapon}`);
          if (p.weaponGroup) groupReqs.push(`Weapon Group: ${p.weaponGroup}`);
        });
      }
      if (req.spellcasting || req.spellcasting2020 || req.spellcastingFeature)
        groupReqs.push("Spellcasting Feature");
      if (req.campaign)
        groupReqs.push(`Campaign: ${req.campaign.join(" or ")}`);

      return groupReqs.join(", ");
    })
    .filter((t) => t);
  return groupTexts.length ? groupTexts.join(" OR ") : "";
}