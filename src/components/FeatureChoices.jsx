import { useMemo } from 'react';
import { processEntries, cleanText } from '../utils/dndEntries';
import {
  extractChoiceLists,
  extractOptionSets,
  formatPrerequisites,
  resolveFeatureWithCopy
} from '../utils/creatorLogic';
import { getGlobalSourcePriority } from '../utils/formatHelpers';

export default function FeatureChoices({
  feature,
  data,
  character,
  selectedSpells,
  selectedClass,
  subclassSelected,
  classSource,
  selectedLevel,
  selectedOptions,
  onToggleOption,
  containerStyle,
}) {
  const classObj = useMemo(() => {
    if (!selectedClass) return null;
    const candidates = (data.classes || []).filter(c => c.name?.toLowerCase() === selectedClass.toLowerCase());
    if (!candidates.length) return null;
    return candidates.sort((a, b) => getGlobalSourcePriority(b.source) - getGlobalSourcePriority(a.source))[0];
  }, [selectedClass, data.classes]);

  const subclassObj = useMemo(() => {
    if (!selectedClass || !subclassSelected) return null;
    const candidates = (data.subclasses || []).filter(s => s.name?.toLowerCase() === subclassSelected.toLowerCase() && s.className?.toLowerCase() === selectedClass.toLowerCase());
    if (!candidates.length) return null;
    return candidates.sort((a, b) => getGlobalSourcePriority(b.source) - getGlobalSourcePriority(a.source))[0];
  }, [selectedClass, subclassSelected, data.subclasses]);

  const optionSets = useMemo(
    () => extractOptionSets(feature.entries || feature.entry),
    [feature],
  );
  const choiceLists = useMemo(
    () => extractChoiceLists(feature.entries || feature.entry),
    [feature],
  );

  const optFeatureTypes = useMemo(() => {
    if (
      feature.name === "Ability Score Improvement" ||
      feature.name === "Epic Boon"
    )
      return [];
    const types = [];
    const entriesStr = JSON.stringify(feature.entries || feature.entry || []);
    const regex =
      /\{@filter\s+[^|]+\|\s*optionalfeatures\s*\|(?:[^}]*?)featuretype=([^}|]+)/gi;
    let match;
    while ((match = regex.exec(entriesStr)) !== null) {
      types.push(...match[1].split(";").map((t) => t.trim()));
    }

      const normalize = s => s.toLowerCase().replace(/ies$/, 'y').replace(/s$/, '');
      if (classObj && classObj.optionalfeatureProgression) {
          classObj.optionalfeatureProgression.forEach(prog => {
              if (normalize(feature.name).includes(normalize(prog.name)) || normalize(prog.name).includes(normalize(feature.name))) {
                  types.push(...(Array.isArray(prog.featureType) ? prog.featureType : [prog.featureType]));
              }
          });
      }

      if (subclassObj && subclassObj.optionalfeatureProgression) {
          subclassObj.optionalfeatureProgression.forEach(prog => {
              if (normalize(feature.name).includes(normalize(prog.name)) || normalize(prog.name).includes(normalize(feature.name))) {
                  types.push(...(Array.isArray(prog.featureType) ? prog.featureType : [prog.featureType]));
              }
          });
      }

    const name = feature.name || "";
    if (name.includes("Eldritch Invocation")) types.push("EI");
    if (name.includes("Pact Boon")) types.push("PB");
    if (name.includes("Elemental Discipline")) types.push("ED");
    if (name.includes("Artificer Infusion") || name.includes("Infuse Item"))
      types.push("AI");
    if (name.includes("Maneuver")) types.push("MV", "MV:B", "MV:C2-UA");
    if (name.includes("Arcane Shot")) types.push("AS", "AS:V1-UA", "AS:V2-UA");
    if (name.includes("Rune Carver") || name.includes("Rune Magic"))
      types.push("RN");
    if (name.includes("Alchemical Formula")) types.push("AF");
    if (name.includes("Fighting Style")) {
      types.push("FS");
      if (selectedClass === "Fighter") types.push("FS:F");
      if (selectedClass === "Ranger") types.push("FS:R");
      if (selectedClass === "Paladin") types.push("FS:P");
      if (selectedClass === "Bard") types.push("FS:B");
    }
    if (name.includes("Metamagic") && feature.level <= 3) types.push("MM");
    return [...new Set(types)].map((t) => t.toLowerCase());
  }, [feature, selectedClass, classObj, subclassObj]);

  const dynamicOptions = useMemo(() => {
    if (!optFeatureTypes.length || !data.optionalFeatures) return [];
    const candidates = new Map();
    data.optionalFeatures.forEach((opt) => {
      if (!opt.featureType || !opt.name) return;
      const types = Array.isArray(opt.featureType)
        ? opt.featureType
        : [opt.featureType];
      if (
        types.some((t) => optFeatureTypes.includes(String(t).toLowerCase()))
      ) {
        if (!candidates.has(opt.name)) candidates.set(opt.name, []);
        candidates.get(opt.name).push(opt);
      }
    });
    const unique = [];
    candidates.forEach((opts) => {
      const selected = resolveFeatureWithCopy(
        opts,
        [data.optionalFeatures, data.classFeatures],
        classSource,
      );
      if (selected) unique.push(selected);
    });

    const cLvl = selectedLevel || 1;
    const checkPrereqs = (opt) => {
      if (!opt.prerequisite) return true;
      return opt.prerequisite.some((req) => {
        if (req.level) {
          let reqLvl =
            typeof req.level === "object" ? req.level.level : req.level;
          if (cLvl < reqLvl) return false;
        }
        if (req.pact) {
          const pactName = `Pact of the ${req.pact}`.toLowerCase();
          const hasOpt = Array.from(selectedOptions || []).some(s => s.toLowerCase().includes(pactName));
          const hasFeat = character?.classFeatures?.some(f => f.title.toLowerCase().includes(pactName));
          if (!hasOpt && !hasFeat) return false;
        }
        if (req.feature) {
          const rfList = req.feature.map(f => (typeof f === 'string' ? f : f.name).split('|')[0].toLowerCase());
          const hasOpt = Array.from(selectedOptions || []).some(s => rfList.some(rf => s.toLowerCase().includes(rf)));
          const hasFeat = [...(character?.classFeatures||[]), ...(character?.feats||[])].some(f => rfList.some(rf => f.title.toLowerCase().includes(rf)));
          if (!hasOpt && !hasFeat) return false;
        }
        if (req.optionalfeature) {
          const rfList = req.optionalfeature.map(f => f.split('|')[0].toLowerCase());
          const hasOpt = Array.from(selectedOptions || []).some(s => rfList.some(rf => s.toLowerCase().includes(rf)));
          const hasFeat = [...(character?.classFeatures||[]), ...(character?.feats||[])].some(f => rfList.some(rf => f.title.toLowerCase().includes(rf)));
          if (!hasOpt && !hasFeat) return false;
        }
        if (req.spell) {
          const rsList = req.spell.map(s => (typeof s === 'string' ? s : s.entry || '').split('|')[0].split('#')[0].toLowerCase().trim());
          const hasOpt = Array.from(selectedSpells || []).some(s => rsList.includes(s.toLowerCase().trim()));
          const hasFeat = [...(character?.spellsList||[]), ...(character?.cantripsList||[]), ...(character?.preparedSpellsList||[])].some(s => rsList.includes(s.name.toLowerCase().trim()));
          if (!hasOpt && !hasFeat) return false;
        }
        return true;
      });
    };
    return unique
      .filter(checkPrereqs)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [optFeatureTypes, data, selectedLevel, selectedOptions, classSource, character, selectedSpells]);

  if (
    optionSets.length === 0 &&
    choiceLists.length === 0 &&
    dynamicOptions.length === 0
  )
    return null;

  const renderCheckbox = (
    key,
    label,
    descHtml,
    groupKey,
    maxCount,
    prereqHtml = "",
  ) => {
    const isChecked = selectedOptions?.has(key);
    let countInGroup = 0;
    if (groupKey && maxCount > 1) {
      for (const k of selectedOptions || []) {
        if (k.startsWith(groupKey + "|||")) countInGroup++;
      }
    }
    const disabled = !isChecked && maxCount > 1 && countInGroup >= maxCount;

    return (
      <label
        key={key}
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 10,
          padding: "8px 10px",
          background: "rgba(255,255,255,0.7)",
          border: "1px solid var(--gold)",
          borderRadius: 6,
          marginBottom: 6,
          cursor: disabled ? "not-allowed" : "pointer",
          opacity: disabled ? 0.6 : 1,
          transition: "background 0.15s",
        }}
      >
        <input
          type={maxCount === 1 ? "radio" : "checkbox"}
          checked={isChecked}
          disabled={disabled}
          onChange={() => onToggleOption(key, maxCount === 1 ? groupKey : null)}
          style={{
            marginTop: 4,
            cursor: disabled ? "not-allowed" : "pointer",
            width: 16,
            height: 16,
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1 }}>
          <strong
            style={{
              color: "var(--ink)",
              fontSize: "0.95rem",
              display: "block",
            }}
          >
            {label}
          </strong>
          {prereqHtml && (
            <div
              style={{ fontSize: "0.85rem", color: "var(--red)", marginTop: 2 }}
            >
              Requires: {prereqHtml}
            </div>
          )}
          {descHtml && (
            <div
              style={{
                fontSize: "0.9rem",
                color: "var(--ink-light)",
                marginTop: 4,
                lineHeight: 1.4,
              }}
              dangerouslySetInnerHTML={{ __html: descHtml }}
            />
          )}
        </div>
      </label>
    );
  };

  return (
    <div style={containerStyle || { paddingTop: 12, paddingBottom: 4 }}>
      <div
        style={{
          fontSize: "0.95rem",
          fontWeight: "bold",
          color: "var(--red-dark)",
          marginBottom: 8,
          borderBottom: "1px solid var(--gold-dark)",
          paddingBottom: 4,
        }}
      >
        {feature.level !== undefined
          ? `Lvl ${feature.level}: ${feature.name}`
          : "Feature Choices"}
      </div>
      {optionSets.map((optSet) => (
        <div key={optSet.setId} style={{ marginBottom: 12 }}>
          <div
            style={{ fontWeight: "bold", marginBottom: 6, fontSize: "0.95rem" }}
          >
            Choose {optSet.count}:
          </div>
          {optSet.choices.map((choice) => {
            let name =
              choice.name || (choice.uid ? choice.uid.split("|")[0] : "");
            const key = `OptionSet|||${optSet.setId}|||${name}`;
            let descHtml = "";
            let prereqText = "";
            if (choice.entries)
              descHtml = cleanText(processEntries(choice.entries));
            if (data.optionalFeatures) {
              const cands = [
                ...(data.optionalFeatures?.filter((f) => f.name === name) ||
                  []),
                ...(data.classFeatures?.filter((f) => f.name === name) || []),
              ];
              const found = resolveFeatureWithCopy(
                cands,
                [data.optionalFeatures, data.classFeatures],
                classSource,
              );
              if (found) {
                if (!descHtml)
                  descHtml = cleanText(
                    processEntries(found.entries || found.entry),
                  );
                prereqText = formatPrerequisites(found);
              }
            }
            return renderCheckbox(
              key,
              name,
              descHtml,
              `OptionSet|||${optSet.setId}`,
              optSet.count,
              prereqText,
            );
          })}
        </div>
      ))}
      {choiceLists.map((list, idx) => {
        const groupKey = `ChoiceList|||${feature.name}|||${feature.level || 0}|||${idx}`;
        return (
          <div key={groupKey} style={{ marginBottom: 12 }}>
            <div
              style={{
                fontWeight: "bold",
                marginBottom: 6,
                fontSize: "0.95rem",
              }}
            >
              {cleanText(list.prompt)}
            </div>
            {list.items.map((item, itemIdx) => {
              const name =
                typeof item === "string"
                  ? item
                  : item.name || `Option ${itemIdx + 1}`;
              const key = `${groupKey}|||${name}`;
              let descHtml = "";
              if (typeof item === "object" && (item.entries || item.entry))
                descHtml = cleanText(
                  processEntries(item.entries || item.entry),
                );
              return renderCheckbox(key, name, descHtml, groupKey, list.count);
            })}
          </div>
        );
      })}
      {dynamicOptions.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <div
            style={{ fontWeight: "bold", marginBottom: 6, fontSize: "0.95rem" }}
          >
            Available Options:
          </div>
          {dynamicOptions.map((opt) => {
            const key = `DynamicOpt|||${feature.name}|||${opt.name}`;
            const descHtml = cleanText(
              processEntries(opt.entries || opt.entry),
            );
            const prereqText = formatPrerequisites(opt);
            return renderCheckbox(
              key,
              opt.name,
              descHtml,
              `DynamicOpt|||${feature.name}`,
              feature._choiceCount || 99,
              prereqText,
            );
          })}
        </div>
      )}
    </div>
  );
}