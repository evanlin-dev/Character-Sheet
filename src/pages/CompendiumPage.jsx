import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import Sidebar, { SidebarBtn } from "src/components/Sidebar";
import { openDB, STORE_NAME } from "src/utils/db";
import { processEntries as originalProcessEntries, cleanText } from "src/utils/dndEntries";
import FluffImage, { TokenImage } from "src/components/FluffImage";
import {
  ModalOverlay,
  ModalBox,
  ModalTitle,
  CloseBtn,
} from "src/styles/shared";
import { schoolMap } from "src/components/SpellTable";
import { formatPrerequisites } from "src/utils/creatorLogic";
import {
  getGlobalSourcePriority,
  replaceAtkTags,
} from "src/utils/formatHelpers";

const sanitizeTableCells = (obj) => {
  if (Array.isArray(obj)) return obj.map(sanitizeTableCells);
  if (obj && typeof obj === "object") {
    if (obj.type === "cell" && obj.roll && !obj.entry) {
      if (obj.roll.exact !== undefined) {
        return String(obj.roll.exact);
      } else if (obj.roll.min !== undefined && obj.roll.max !== undefined) {
        return obj.roll.min === obj.roll.max ? String(obj.roll.min) : `${obj.roll.min}-${obj.roll.max}`;
      }
    }
    const res = {};
    for (const k in obj) res[k] = sanitizeTableCells(obj[k]);
    return res;
  }
  return obj;
};
const processEntries = (entries) => originalProcessEntries(sanitizeTableCells(entries));

const fmtCell = (cell) => {
  if (cell === null || cell === undefined) return "—";
  if (cell === 0) return "—";
  if (typeof cell === "object") {
    if (cell.toRoll) return cell.toRoll.map((d) => `${d.number}d${d.faces}`).join("+");
    if (cell.type === "dice") return cell.toRoll?.map((d) => `${d.number}d${d.faces}`).join("+") || "—";
    return String(cell.value ?? cell.average ?? "—");
  }
  return String(cell);
};

export default function CompendiumPage() {
  const [loading, setLoading] = useState(true);
  const [dataMap, setDataMap] = useState({});
  const [category, setCategory] = useState("monster");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);
  const [classFeats, setClassFeats] = useState([]);
  const [subclasses, setSubclasses] = useState([]);
  const [subclassFeats, setSubclassFeats] = useState([]);
  const [showSubclasses, setShowSubclasses] = useState(false);
  const [activeSubclass, setActiveSubclass] = useState(null);
  const [displayLimit, setDisplayLimit] = useState(100);
  const [previewSpell, setPreviewSpell] = useState(null);
  const [previewFeat, setPreviewFeat] = useState(null);
  const [previewItem, setPreviewItem] = useState(null);
  const rightPanelRef = useRef(null);

  useEffect(() => {
    async function loadData() {
      try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const data = await new Promise((resolve) => {
          const req = store.get("currentData");
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => resolve(null);
        });

        if (data) {
          const mapped = {
            monster: [],
            spell: [],
            item: [],
            feat: [],
            background: [],
            race: [],
            class: [],
            condition: [],
          };
          const fluffMapped = {
            monster: [],
            spell: [],
            item: [],
            feat: [],
            background: [],
            race: [],
            class: [],
            condition: [],
          };
          const cFeats = [];
          const sClasses = [];
          const sFeats = [];
          const sFluff = [];

          data.forEach((file) => {
            if (!file.name.toLowerCase().endsWith(".json")) return;
            try {
              const json = JSON.parse(file.content);
              Object.keys(mapped).forEach((key) => {
                if (key === "item") {
                  [
                    "item",
                    "items",
                    "baseitem",
                    "baseitems",
                    "magicvariant",
                    "magicvariants",
                    "variant",
                    "itemGroup",
                  ].forEach((k) => {
                    if (json[k] && Array.isArray(json[k]))
                      mapped.item.push(...json[k]);
                  });
                } else if (key === "spell") {
                  ["spell", "spells"].forEach((k) => {
                    if (json[k] && Array.isArray(json[k]))
                      mapped.spell.push(...json[k]);
                  });
                } else if (key === "condition") {
                  ["condition", "conditions", "status"].forEach((k) => {
                    if (json[k] && Array.isArray(json[k]))
                      mapped.condition.push(...json[k]);
                  });
                } else {
                  if (json[key] && Array.isArray(json[key]))
                    mapped[key].push(...json[key]);
                }

                const fluffKey = key + "Fluff";
                if (json[fluffKey] && Array.isArray(json[fluffKey]))
                  fluffMapped[key].push(...json[fluffKey]);
                if (
                  json.fluff &&
                  json.fluff[key] &&
                  Array.isArray(json.fluff[key])
                )
                  fluffMapped[key].push(...json.fluff[key]);
              });

              if (json.classFeature && Array.isArray(json.classFeature))
                cFeats.push(...json.classFeature);
              if (json.subclass && Array.isArray(json.subclass))
                sClasses.push(...json.subclass);
              if (json.subclassFeature && Array.isArray(json.subclassFeature))
                sFeats.push(...json.subclassFeature);
              if (json.subclassFluff && Array.isArray(json.subclassFluff))
                sFluff.push(...json.subclassFluff);
            } catch (e) {}
          });

          const resolveFluffCopy = (f, map, depth = 0) => {
            if (!f || depth > 5) return f;
            if (!f._copy) return f;

            let baseKey = null;
            if (f._copy.name) {
              baseKey = `${f._copy.name.toLowerCase()}|${(f._copy.source || "").toLowerCase()}`;
            } else if (f._copy.class || f._copy.className) {
              const cls = (f._copy.className || f._copy.class).toLowerCase();
              const sc = (
                f._copy.shortName ||
                f._copy.name ||
                ""
              ).toLowerCase();
              baseKey = `${cls}-${sc}|${(f._copy.source || "").toLowerCase()}`;
            }

            let base = null;
            if (baseKey) base = map.get(baseKey);
            if (!base && f._copy.name)
              base = map.get(f._copy.name.toLowerCase());
            if (!base && (f._copy.class || f._copy.className)) {
              base = map.get(
                `${(f._copy.className || f._copy.class).toLowerCase()}-${(f._copy.shortName || f._copy.name || "").toLowerCase()}`,
              );
            }

            if (!base) return f;
            base = resolveFluffCopy(base, map, depth + 1);

            let resolvedBase = JSON.parse(JSON.stringify(base));
            const modObj = f._copy._mod || {};
            for (const k in modObj) {
              const mod = modObj[k];
              if (mod) {
                let targetArr = Array.isArray(resolvedBase[k])
                  ? resolvedBase[k]
                  : resolvedBase[k]
                    ? [resolvedBase[k]]
                    : [];
                const itemsToInsert = Array.isArray(mod.items)
                  ? mod.items
                  : mod.items || mod.item
                    ? [mod.items || mod.item]
                    : [];

                if (mod.mode === "prependArr") {
                  resolvedBase[k] = [...itemsToInsert, ...targetArr];
                } else if (mod.mode === "appendArr") {
                  resolvedBase[k] = [...targetArr, ...itemsToInsert];
                } else if (mod.mode === "replaceArr") {
                  const idx = targetArr.findIndex(
                    (i) => i.name === mod.replace,
                  );
                  if (idx !== -1) {
                    targetArr.splice(idx, 1, ...itemsToInsert);
                  }
                  resolvedBase[k] = targetArr;
                }
              }
            }
            return { ...resolvedBase, ...f, _copy: undefined };
          };

          const exactMap = new Map();
          Object.keys(mapped).forEach((key) => {
            const fluffMap = new Map();
            fluffMapped[key].forEach((f) => {
              if (f.name) {
                fluffMap.set(
                  `${f.name.toLowerCase()}|${(f.source || "").toLowerCase()}`,
                  f,
                );
                fluffMap.set(f.name.toLowerCase(), f);
              }
            });

            const unique = new Map();
            mapped[key].forEach((item) => {
              if (item?.name) {
                const id = item.name.toLowerCase();
                const exactId = `${id}_${(item.source || "").toLowerCase()}`;
                exactMap.set(exactId, item);

                if (!unique.has(id)) {
                  unique.set(id, item);
                } else {
                  const ex = unique.get(id);
                  const itemPrio = getGlobalSourcePriority(item.source);
                  const exPrio = getGlobalSourcePriority(ex.source);
                  const itemHasDesc = !!(
                    item.entries ||
                    item.entry ||
                    item.description ||
                    item.desc ||
                    item.text
                  );
                  const exHasDesc = !!(
                    ex.entries ||
                    ex.entry ||
                    ex.description ||
                    ex.desc ||
                    ex.text
                  );
                  if (
                    itemPrio > exPrio ||
                    (itemPrio === exPrio && itemHasDesc && !exHasDesc)
                  ) {
                    unique.set(id, item);
                  }
                }

                const f =
                  fluffMap.get(`${id}|${(item.source || "").toLowerCase()}`) ||
                  fluffMap.get(id);
                if (f) item._fluff = resolveFluffCopy(f, fluffMap);
                else if (item.fluff) item._fluff = item.fluff;
              }
            });

            const resolveCopy = (m, depth = 0) => {
              if (depth > 5) return m;
              if (!m._copy) return m;
              const baseKey = `${m._copy.name.toLowerCase()}_${(m._copy.source || "").toLowerCase()}`;
              let base =
                exactMap.get(baseKey) || unique.get(m._copy.name.toLowerCase());
              if (!base) return m;
              base = resolveCopy(base, depth + 1);

              let resolvedBase = JSON.parse(JSON.stringify(base));
              if (m._copy._mod && m._copy._mod["*"]) {
                const mod = m._copy._mod["*"];
                if (mod.mode === "replaceTxt" && mod.replace) {
                  try {
                    let flags = mod.flags || "";
                    if (!flags.includes("g")) flags += "g";
                    const regex = new RegExp(mod.replace, flags);
                    const applyReplacement = (obj) => {
                      if (typeof obj === "string")
                        return obj.replace(regex, mod.with || "");
                      if (Array.isArray(obj)) return obj.map(applyReplacement);
                      if (obj && typeof obj === "object") {
                        const res = {};
                        for (const k in obj) res[k] = applyReplacement(obj[k]);
                        return res;
                      }
                      return obj;
                    };
                    resolvedBase = applyReplacement(resolvedBase);
                  } catch (e) {}
                }
              }
              return { ...resolvedBase, ...m };
            };

            const resolvedItems = [];
            unique.forEach((item) => resolvedItems.push(resolveCopy(item)));
            mapped[key] = resolvedItems.sort((a, b) =>
              a.name.localeCompare(b.name),
            );
          });

          const scFluffMap = new Map();
          sFluff.forEach((f) => {
            const clsName = (f.className || f.class || "").toLowerCase();
            const scName = (f.shortName || f.name || "").toLowerCase();
            if (clsName && scName) {
              scFluffMap.set(
                `${clsName}-${scName}|${(f.source || "").toLowerCase()}`,
                f,
              );
              scFluffMap.set(`${clsName}-${scName}`, f);
            }
          });

          const uniqueSubclasses = new Map();
          sClasses.forEach((sc) => {
            const clsName = (sc.className || sc.class || "").toLowerCase();
            const scName = (sc.shortName || sc.name || "").toLowerCase();
            if (!clsName || !scName) return;
            const id = `${clsName}-${scName}`;

            const f =
              scFluffMap.get(`${id}|${(sc.source || "").toLowerCase()}`) ||
              scFluffMap.get(id);
            if (f) sc._fluff = resolveFluffCopy(f, scFluffMap);
            else if (sc.fluff) sc._fluff = sc.fluff;

            if (!uniqueSubclasses.has(id)) {
              uniqueSubclasses.set(id, sc);
            } else {
              const ex = uniqueSubclasses.get(id);
              if (
                getGlobalSourcePriority(sc.source) >
                getGlobalSourcePriority(ex.source)
              ) {
                uniqueSubclasses.set(id, sc);
              }
            }
          });

          setDataMap(mapped);
          setClassFeats(cFeats);
          setSubclasses(
            Array.from(uniqueSubclasses.values()).sort((a, b) =>
              (a.name || "").localeCompare(b.name || ""),
            ),
          );
          setSubclassFeats(sFeats);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    document.body.classList.add("compendium-page");
    return () => document.body.classList.remove("compendium-page");
  }, []);

  useEffect(() => {
    if (rightPanelRef.current) {
      rightPanelRef.current.scrollTop = 0;
    }
  }, [selectedItem]);

  const list = useMemo(() => {
    if (!dataMap[category]) return [];
    if (!searchQuery) return dataMap[category].slice(0, displayLimit);
    return dataMap[category]
      .filter((i) => i.name.toLowerCase().includes(searchQuery.toLowerCase()))
      .slice(0, displayLimit);
  }, [dataMap, category, searchQuery, displayLimit]);

  const handleListScroll = (e) => {
    const { scrollTop, clientHeight, scrollHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight + 150) {
      setDisplayLimit((prev) => prev + 50);
    }
  };

  const formatLinks = (text) => {
    let processed = text || "";
    const spellMapList = [];
    const featMapList = [];
    const itemMapList = [];

    const toTitleCase = (str) => {
      const lowers = [
        "a",
        "an",
        "and",
        "as",
        "at",
        "but",
        "by",
        "for",
        "from",
        "in",
        "into",
        "near",
        "nor",
        "of",
        "on",
        "onto",
        "or",
        "the",
        "to",
        "with",
      ];
      return str
        .split(" ")
        .map((w, i) => {
          if (i !== 0 && lowers.includes(w.toLowerCase()))
            return w.toLowerCase();
          return w
            .split(/([/-])/)
            .map(
              (part) =>
                part.charAt(0).toUpperCase() + part.slice(1).toLowerCase(),
            )
            .join("");
        })
        .join(" ");
    };

    if (typeof processed === "string") {
      processed = processed.replace(
        /\{@spell ([^|}]+)(?:\|[^}]*)?\}/gi,
        (match, spellName) => {
          spellMapList.push({ orig: spellName, title: toTitleCase(spellName) });
          return `__SPELL_LINK_${spellMapList.length - 1}__`;
        },
      );
      processed = processed.replace(
        /\{@feat ([^|}]+)(?:\|[^}]*)?\}/gi,
        (match, featName) => {
          featMapList.push({ orig: featName, title: toTitleCase(featName) });
          return `__FEAT_LINK_${featMapList.length - 1}__`;
        },
      );
      processed = processed.replace(
        /\{@item ([^|}]+)(?:\|[^}]*)?\}/gi,
        (match, itemName) => {
          itemMapList.push({ orig: itemName, title: toTitleCase(itemName) });
          return `__ITEM_LINK_${itemMapList.length - 1}__`;
        },
      );

      processed = processed.replace(/\{@recharge\s*([^}]*)\}/gi, (_, p1) =>
        p1 ? `(Recharge ${p1}-6)` : `(Recharge 6)`,
      );
      processed = replaceAtkTags(processed);
      processed = processed.replace(/\{@h\}/gi, "<em>Hit:</em> ");
      processed = processed.replace(/\{@damage\s+([^|}]+)[^}]*\}/gi, "$1");
      processed = processed.replace(/\{@dice\s+([^|}]+)[^}]*\}/gi, "$1");
      processed = processed.replace(/\{@hit\s+([^|}]+)[^}]*\}/gi, "+$1");
      processed = processed.replace(/\{@dc\s+([^|}]+)[^}]*\}/gi, "DC $1");

      processed = cleanText(processed);
      spellMapList.forEach((spellItem, i) => {
        processed = processed.replace(
          `__SPELL_LINK_${i}__`,
          `<span class="spell-link" style="color: var(--red-dark); font-weight: bold; cursor: pointer; border-bottom: 1px dashed var(--red-dark);" data-spell="${spellItem.orig.replace(/"/g, "&quot;")}">${spellItem.title}</span>`,
        );
      });
      featMapList.forEach((featItem, i) => {
        processed = processed.replace(
          `__FEAT_LINK_${i}__`,
          `<span class="feat-link" style="color: var(--red-dark); font-weight: bold; cursor: pointer; border-bottom: 1px dashed var(--red-dark);" data-feat="${featItem.orig.replace(/"/g, "&quot;")}">${featItem.title}</span>`,
        );
      });
      itemMapList.forEach((itemObj, i) => {
        processed = processed.replace(
          `__ITEM_LINK_${i}__`,
          `<span class="item-link" style="color: var(--red-dark); font-weight: bold; cursor: pointer; border-bottom: 1px dashed var(--red-dark);" data-item="${itemObj.orig.replace(/"/g, "&quot;")}">${itemObj.title}</span>`,
        );
      });
    } else {
      processed = cleanText(processed);
    }
    return processed;
  };

  const handlePreviewClick = (e) => {
    if (e.target.classList.contains("spell-link")) {
      const spellName = e.target.getAttribute("data-spell");
      const candidates =
        dataMap.spell?.filter(
          (s) => s.name.toLowerCase() === spellName.toLowerCase(),
        ) || [];
      const spell = candidates.sort(
        (a, b) =>
          getGlobalSourcePriority(b.source) - getGlobalSourcePriority(a.source),
      )[0];
      if (spell) setPreviewSpell(spell);
    }
    if (e.target.classList.contains("feat-link")) {
      const featName = e.target.getAttribute("data-feat");
      const candidates =
        dataMap.feat?.filter(
          (f) => f.name.toLowerCase() === featName.toLowerCase(),
        ) || [];
      const feat = candidates.sort(
        (a, b) =>
          getGlobalSourcePriority(b.source) - getGlobalSourcePriority(a.source),
      )[0];
      if (feat) setPreviewFeat(feat);
    }
    if (e.target.classList.contains("item-link")) {
      const itemName = e.target.getAttribute("data-item");
      const candidates =
        dataMap.item?.filter(
          (i) => i.name.toLowerCase() === itemName.toLowerCase(),
        ) || [];
      const item = candidates.sort(
        (a, b) =>
          getGlobalSourcePriority(b.source) - getGlobalSourcePriority(a.source),
      )[0];
      if (item) setPreviewItem(item);
    }
  };


  const renderDetails = () => {
    if (!selectedItem)
      return (
        <div
          style={{
            padding: 20,
            color: "var(--ink-light)",
            fontStyle: "italic",
          }}
        >
          Select an entry to view details.
        </div>
      );

    let html = "";

    if (category === "monster") {
      const renderSection = (title, data) => {
        if (!data) return "";
        let sectionHtml = `<h3 style="color: var(--red-dark); border-bottom: 1px solid var(--gold-light); margin-top: 16px; margin-bottom: 8px; font-family: 'Cinzel', serif;">${title}</h3>`;
        sectionHtml += formatLinks(processEntries(data));
        return sectionHtml;
      };

      html += renderSection("Traits", selectedItem.trait);
      html += renderSection("Actions", selectedItem.action);
      html += renderSection("Bonus Actions", selectedItem.bonus);
      html += renderSection("Reactions", selectedItem.reaction);
      html += renderSection("Legendary Actions", selectedItem.legendary);
      html += renderSection("Mythic Actions", selectedItem.mythic);
      html += renderSection("Lair Actions", selectedItem.lairActions);
      html += renderSection("Regional Effects", selectedItem.regionalEffects);

      if (!html && selectedItem.entries)
        html += formatLinks(processEntries(selectedItem.entries));
    } else {
      let descHtml = "";
      if (selectedItem.entries)
        descHtml += formatLinks(processEntries(selectedItem.entries));
      else if (selectedItem.description)
        descHtml += formatLinks(selectedItem.description);
      else if (selectedItem.inherits && selectedItem.inherits.entries)
        descHtml += formatLinks(processEntries(selectedItem.inherits.entries));
      else if (selectedItem.entry)
        descHtml += formatLinks(processEntries(selectedItem.entry));
      else if (selectedItem.text)
        descHtml += formatLinks(processEntries(selectedItem.text));

      if (selectedItem.additionalEntries) {
        if (descHtml) descHtml += "<br/><br/>";
        descHtml += formatLinks(processEntries(selectedItem.additionalEntries));
      }

      if (selectedItem.entriesHigherLevel) {
        if (descHtml) descHtml += "<br/><br/>";
        descHtml += formatLinks(
          processEntries(selectedItem.entriesHigherLevel),
        );
      }
      html += descHtml;
    }

    if (html) {
      html = html.replace(/\{=([^}]+)\}/g, (match, key) => {
        if (selectedItem[key] !== undefined) return selectedItem[key];
        if (selectedItem.inherits && selectedItem.inherits[key] !== undefined)
          return selectedItem.inherits[key];
        return match;
      });
    }

    let matchingSubclasses = [];

    if (category === "class") {
      matchingSubclasses = subclasses.filter(
        (sc) =>
          (sc.className || sc.class)?.toLowerCase() ===
          selectedItem.name.toLowerCase(),
      );

      if (showSubclasses && !activeSubclass) {
        return (
          <div style={{ padding: "20px 24px" }}>
            <button
              className="btn btn-secondary"
              style={{
                marginBottom: 16,
                padding: "4px 12px",
                fontSize: "0.85rem",
              }}
              onClick={() => setShowSubclasses(false)}
            >
              ← Back to {selectedItem.name}
            </button>
            <h2
              style={{
                fontFamily: "'Cinzel', serif",
                color: "var(--red-dark)",
                marginTop: 0,
                marginBottom: 16,
              }}
            >
              {selectedItem.name} Subclasses
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {matchingSubclasses.map((sc) => (
                <div
                  key={sc.name + sc.source}
                  style={{
                    padding: "12px 16px",
                    border: "1px solid var(--gold)",
                    borderRadius: 6,
                    background: "rgba(255,255,255,0.5)",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.background = "var(--parchment-dark)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.background = "rgba(255,255,255,0.5)")
                  }
                  onClick={() => setActiveSubclass(sc)}
                >
                  <strong
                    style={{
                      fontSize: "1.1rem",
                      color: "var(--red-dark)",
                      fontFamily: "'Cinzel', serif",
                    }}
                  >
                    {sc.name || sc.shortName}
                  </strong>
                  <div
                    style={{ fontSize: "0.8rem", color: "var(--ink-light)" }}
                  >
                    Source: {sc.source || "Unknown"}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      }

      if (activeSubclass) {
        let scHtml = "";
        const scFeats = subclassFeats
          .filter((f) => {
            const cName = f.className || f.class;
            const sName = f.subclassShortName || f.subclassName || f.subclass;
            return (
              cName?.toLowerCase() === selectedItem.name.toLowerCase() &&
              sName?.toLowerCase() ===
                (activeSubclass.shortName || activeSubclass.name)?.toLowerCase()
            );
          })
          .sort((a, b) => a.level - b.level);

        const uniqueScFeats = [];
        const seenScFeats = new Set();
        scFeats.forEach((f) => {
          const key = `${f.name}-${f.level}`;
          if (!seenScFeats.has(key)) {
            seenScFeats.add(key);
            uniqueScFeats.push(f);
          }
        });

        uniqueScFeats.forEach((f) => {
          scHtml += `<h4 style="color: var(--ink); border-bottom: 1px dashed var(--gold-light); margin-top: 12px; padding-bottom: 2px;">${f.name} <span style="font-size: 0.8rem; color: var(--ink-light); font-weight: normal;">(Level ${f.level})</span></h4>`;
          if (f.entries) scHtml += formatLinks(processEntries(f.entries));
          else if (f.entry) scHtml += formatLinks(processEntries(f.entry));
        });

        let scFluffHtml = "";
        if (activeSubclass._fluff && activeSubclass._fluff.entries) {
          const scFluffEntries = Array.isArray(activeSubclass._fluff.entries)
            ? activeSubclass._fluff.entries
            : [activeSubclass._fluff.entries];
          scFluffHtml = scFluffEntries
            .map((entry) =>
              formatLinks(
                processEntries(Array.isArray(entry) ? entry : [entry]),
              ),
            )
            .filter(Boolean)
            .join("<br/><br/>");
        }

        return (
          <div style={{ padding: "20px 24px" }}>
            <button
              className="btn btn-secondary"
              style={{
                marginBottom: 16,
                padding: "4px 12px",
                fontSize: "0.85rem",
              }}
              onClick={() => setActiveSubclass(null)}
            >
              ← Back to Subclasses
            </button>
            <h2
              style={{
                fontFamily: "'Cinzel', serif",
                color: "var(--red-dark)",
                marginTop: 0,
                marginBottom: 8,
              }}
            >
              {activeSubclass.name || activeSubclass.shortName}
            </h2>
            <div
              style={{
                fontSize: "0.85rem",
                color: "var(--ink-light)",
                marginBottom: 16,
                paddingBottom: 8,
                borderBottom: "1px dashed var(--gold)",
              }}
            >
              <span>Source: {activeSubclass.source}</span>
            </div>
            <div style={{ marginBottom: 16 }}>
              <FluffImage
                fluff={activeSubclass._fluff}
                baseObj={activeSubclass}
                type="subclasses"
                className={selectedItem.name}
                subclassName={activeSubclass.name || activeSubclass.shortName}
                subclassShortName={activeSubclass.shortName}
                source={activeSubclass.source}
              />
            </div>
            <div
              className="rendered-desc"
              style={{
                fontSize: "0.95rem",
                lineHeight: 1.6,
                color: "var(--ink)",
              }}
              dangerouslySetInnerHTML={{
                __html:
                  (scFluffHtml ? scFluffHtml + "<br/><br/>" : "") +
                  (scHtml ||
                    '<em style="color:var(--ink-light)">No features found.</em>'),
              }}
            />
          </div>
        );
      }

      if (selectedItem.hd) {
        const faces = selectedItem.hd.faces || selectedItem.hd;
        html += `<div style="margin-bottom: 16px;"><strong>Hit Dice:</strong> 1d${faces} per ${selectedItem.name} level</div>`;
      }
      const feats = classFeats
        .filter((f) => {
          const cName = f.className || f.class;
          return (
            cName?.toLowerCase() === selectedItem.name.toLowerCase() &&
            !f.subclassShortName
          );
        })
        .sort((a, b) => a.level - b.level);

      const uniqueFeats = [];
      const seenFeats = new Set();
      feats.forEach((f) => {
        const key = `${f.name}-${f.level}`;
        if (!seenFeats.has(key)) {
          seenFeats.add(key);
          uniqueFeats.push(f);
        }
      });

      uniqueFeats.forEach((f) => {
        html += `<h3 style="color: var(--red-dark); border-bottom: 1px dashed var(--gold); margin-top: 16px; padding-bottom: 4px;">${f.name} <span style="font-size: 0.85rem; color: var(--ink-light);">(Level ${f.level})</span></h3>`;
        if (f.entries) html += formatLinks(processEntries(f.entries));
        else if (f.entry) html += formatLinks(processEntries(f.entry));
      });
    }

    let fluffHtml = "";
    if (selectedItem._fluff && selectedItem._fluff.entries) {
      const fluffEntries = Array.isArray(selectedItem._fluff.entries)
        ? selectedItem._fluff.entries
        : [selectedItem._fluff.entries];
      fluffHtml = fluffEntries
        .map((entry) =>
          formatLinks(processEntries(Array.isArray(entry) ? entry : [entry])),
        )
        .filter(Boolean)
        .join("<br/><br/>");
    }

    const typeMap = {
      monster: "monsters",
      spell: "spells",
      item: "items",
      feat: "feats",
      background: "backgrounds",
      race: "races",
      class: "classes",
      condition: "conditions",
    };

    const renderMonsterStats = () => {
      if (category !== "monster") return null;

      const getAC = (ac) => {
        if (!ac) return 10;
        if (Array.isArray(ac)) {
          return ac
            .map((a) => {
              if (typeof a === "object") {
                const acVal = a.ac || a.value || 10;
                let fromStr = a.from
                  ? ` (${cleanText(processEntries(a.from))})`
                  : "";
                let condStr = a.condition
                  ? ` ${cleanText(processEntries([a.condition]))}`
                  : "";
                return `${acVal}${fromStr}${condStr}`;
              }
              return formatLinks(processEntries([a]));
            })
            .join(", ");
        }
        return formatLinks(processEntries([ac]));
      };

      const getHP = (hp) => {
        if (!hp) return 10;
        if (typeof hp === "object")
          return `${hp.average || hp.value || 10} ${hp.formula ? `(${hp.formula})` : ""}`;
        return hp;
      };

      const getSpeed = (speed) => {
        if (!speed) return "30 ft.";
        if (typeof speed === "object") {
          return Object.entries(speed)
            .map(([k, v]) => {
              if (k === "choose") return "";
              let val = typeof v === "object" ? v.number : v;
              return `${k === "walk" ? "" : k + " "}${val} ft.`;
            })
            .filter(Boolean)
            .join(", ");
        }
        return speed;
      };

      const formatList = (obj, isSave = false) => {
        const capFirst = (s) =>
          typeof s === "string" ? s.charAt(0).toUpperCase() + s.slice(1) : s;
        if (!obj) return "";
        if (Array.isArray(obj))
          return obj
            .map((i) => {
              if (typeof i === "string") return capFirst(i);
              if (i.name) return capFirst(i.name);
              if (i.immune) return i.immune.map(capFirst).join(", ");
              if (i.resist) return i.resist.map(capFirst).join(", ");
              if (i.vulnerable) return i.vulnerable.map(capFirst).join(", ");
              if (i.conditionImmune)
                return i.conditionImmune.map(capFirst).join(", ");
              return JSON.stringify(i);
            })
            .join(", ");
        if (typeof obj === "object") {
          return Object.entries(obj)
            .map(([k, v]) => {
              let val = v;
              if (
                isSave &&
                !String(v).startsWith("+") &&
                !String(v).startsWith("-")
              ) {
                val = `+${v}`;
              }
              return `${capFirst(k)} ${val}`;
            })
            .join(", ");
        }
        return capFirst(String(obj));
      };

      let crStr = "?";
      if (selectedItem.cr) {
        crStr =
          typeof selectedItem.cr === "object"
            ? selectedItem.cr.cr
            : String(selectedItem.cr);
      }

      return (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            background: "rgba(255,255,255,0.5)",
            border: "1px solid var(--gold)",
            borderRadius: 6,
          }}
        >
          <div
            style={{
              marginBottom: 12,
              color: "var(--ink)",
              fontSize: "0.9rem",
              lineHeight: 1.5,
            }}
          >
            <div>
              <strong>Armor Class</strong> {getAC(selectedItem.ac)}
            </div>
            <div>
              <strong>Hit Points</strong> {getHP(selectedItem.hp)}
            </div>
            <div>
              <strong>Speed</strong> {getSpeed(selectedItem.speed)}
            </div>
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: 4,
              textAlign: "center",
              marginBottom: 12,
            }}
          >
            {["str", "dex", "con", "int", "wis", "cha"].map((ab) => {
              const score = selectedItem[ab] ?? 10;
              const mod = Math.floor((score - 10) / 2);
              const modStr = mod >= 0 ? `+${mod}` : `${mod}`;
              let saveStr = modStr;
              if (selectedItem.save && selectedItem.save[ab]) {
                let sv = selectedItem.save[ab];
                saveStr =
                  String(sv).startsWith("+") || String(sv).startsWith("-")
                    ? String(sv)
                    : `+${sv}`;
              }
              return (
                <div
                  key={ab}
                  style={{
                    background: "var(--parchment)",
                    padding: "4px 2px",
                    border: "1px solid var(--gold)",
                    borderRadius: 4,
                  }}
                >
                  <div
                    style={{
                      fontSize: "0.65rem",
                      fontWeight: "bold",
                      color: "var(--ink-light)",
                      textTransform: "uppercase",
                    }}
                  >
                    {ab}
                  </div>
                  <div
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: "bold",
                      color: "var(--ink)",
                    }}
                  >
                    {score}
                  </div>
                  <div
                    style={{ fontSize: "0.75rem", color: "var(--ink-light)" }}
                  >
                    Mod: {modStr}
                  </div>
                  <div
                    style={{ fontSize: "0.75rem", color: "var(--ink-light)" }}
                  >
                    Save: {saveStr}
                  </div>
                </div>
              );
            })}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr",
              gap: 4,
              fontSize: "0.85rem",
            }}
          >
            {selectedItem.skill && (
              <div>
                <strong>Skills:</strong> {formatList(selectedItem.skill, true)}
              </div>
            )}
            {selectedItem.vulnerable && (
              <div>
                <strong>Damage Vulnerabilities:</strong>{" "}
                {formatList(selectedItem.vulnerable)}
              </div>
            )}
            {selectedItem.resist && (
              <div>
                <strong>Damage Resistances:</strong>{" "}
                {formatList(selectedItem.resist)}
              </div>
            )}
            {selectedItem.immune && (
              <div>
                <strong>Damage Immunities:</strong>{" "}
                {formatList(selectedItem.immune)}
              </div>
            )}
            {selectedItem.conditionImmune && (
              <div>
                <strong>Condition Immunities:</strong>{" "}
                {formatList(selectedItem.conditionImmune)}
              </div>
            )}
            {selectedItem.senses && (
              <div>
                <strong>Senses:</strong>{" "}
                {selectedItem.senses.join
                  ? selectedItem.senses
                      .map((s) =>
                        typeof s === "string"
                          ? s.charAt(0).toUpperCase() + s.slice(1)
                          : s,
                      )
                      .join(", ")
                  : typeof selectedItem.senses === "string"
                    ? selectedItem.senses.charAt(0).toUpperCase() +
                      selectedItem.senses.slice(1)
                    : selectedItem.senses}
              </div>
            )}
            {selectedItem.languages && (
              <div>
                <strong>Languages:</strong>{" "}
                {selectedItem.languages.join
                  ? selectedItem.languages.join(", ")
                  : selectedItem.languages}
              </div>
            )}
            <div>
              <strong>Challenge:</strong> {crStr}
            </div>
          </div>
        </div>
      );
    };

    const renderItemStats = () => {
      if (category !== "item") return null;

      const formatValue = (val) => {
        if (!val) return null;
        if (typeof val === "string") return val;
        if (val >= 100 && val % 100 === 0) return `${val / 100} gp`;
        if (val >= 10 && val % 10 === 0) return `${val / 10} sp`;
        return `${val} cp`;
      };

      const dmgTypeMap = {
        S: "Slashing",
        P: "Piercing",
        B: "Bludgeoning",
        F: "Fire",
        C: "Cold",
        L: "Lightning",
        A: "Acid",
        N: "Necrotic",
        R: "Radiant",
        T: "Thunder",
        O: "Force",
        Y: "Psychic",
        I: "Poison",
      };
      const propMap = {
        A: "Ammunition",
        F: "Finesse",
        H: "Heavy",
        L: "Light",
        LD: "Loading",
        R: "Reach",
        S: "Special",
        T: "Thrown",
        "2H": "Two-Handed",
        V: "Versatile",
      };

      const props = (selectedItem.property || [])
        .map((p) => propMap[p] || p)
        .join(", ");

      let acStr = selectedItem.ac;
      if (acStr) {
        if (selectedItem.type === "LA") acStr += " + Dex modifier";
        else if (selectedItem.type === "MA") acStr += " + Dex modifier (max 2)";
      }

      return (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            background: "rgba(255,255,255,0.5)",
            border: "1px solid var(--gold)",
            borderRadius: 6,
            fontSize: "0.9rem",
          }}
        >
          <div
            style={{
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
              marginBottom: 8,
              color: "var(--ink)",
            }}
          >
            {selectedItem.value !== undefined && (
              <span>
                <strong>Cost:</strong> {formatValue(selectedItem.value)}
              </span>
            )}
            {selectedItem.weight !== undefined && (
              <span>
                <strong>Weight:</strong> {selectedItem.weight} lb.
              </span>
            )}
            {selectedItem.rarity && (
              <span>
                <strong>Rarity:</strong>{" "}
                {selectedItem.rarity.charAt(0).toUpperCase() +
                  selectedItem.rarity.slice(1)}
              </span>
            )}
            {selectedItem.reqAttune && (
              <span>
                <strong>Attunement:</strong>{" "}
                {selectedItem.reqAttune === true
                  ? "Yes"
                  : selectedItem.reqAttune}
              </span>
            )}
          </div>
          <div
            style={{
              display: "flex",
              gap: 16,
              flexWrap: "wrap",
              color: "var(--ink)",
            }}
          >
            {acStr && (
              <span>
                <strong>Armor Class:</strong> {acStr}
              </span>
            )}
            {selectedItem.dmg1 && (
              <span>
                <strong>Damage:</strong> {selectedItem.dmg1}{" "}
                {dmgTypeMap[selectedItem.dmgType] || selectedItem.dmgType}{" "}
                {selectedItem.dmg2 ? `(${selectedItem.dmg2} Versatile)` : ""}
              </span>
            )}
            {props && (
              <span>
                <strong>Properties:</strong> {props}
              </span>
            )}
          </div>
        </div>
      );
    };

    const renderSpellStats = () => {
      if (category !== "spell") return null;

      const schoolMap = {
        A: "Abjuration",
        C: "Conjuration",
        D: "Divination",
        E: "Enchantment",
        V: "Evocation",
        I: "Illusion",
        N: "Necromancy",
        T: "Transmutation",
        a: "Abjuration",
        c: "Conjuration",
        d: "Divination",
        e: "Enchantment",
        v: "Evocation",
        i: "Illusion",
        n: "Necromancy",
        t: "Transmutation",
      };
      const isRitual = !!(selectedItem.meta && selectedItem.meta.ritual);
      const isConc = !!(
        selectedItem.duration &&
        selectedItem.duration.some((d) => d.concentration)
      );
      const hasMat = !!(
        selectedItem.components &&
        (selectedItem.components.m || selectedItem.components.M)
      );

      let time = "";
      if (selectedItem.time && selectedItem.time[0]) {
        const t = selectedItem.time[0];
        time = `${t.number} ${t.unit}${t.condition ? "*" : ""}`;
      }

      let rangeStr = "—";
      if (selectedItem.range) {
        if (selectedItem.range.distance) {
          rangeStr = `${selectedItem.range.distance.amount ? selectedItem.range.distance.amount + " " : ""}${selectedItem.range.distance.type}`;
        } else {
          rangeStr = selectedItem.range.type || "—";
        }
      }

      let durStr = "";
      if (selectedItem.duration && selectedItem.duration[0]) {
        const d = selectedItem.duration[0];
        durStr =
          d.type === "instant"
            ? "Instantaneous"
            : `${d.duration ? d.duration.amount + " " + d.duration.type : d.type}${isConc ? " (Concentration)" : ""}`;
      }

      let comps = [];
      if (selectedItem.components?.v || selectedItem.components?.V)
        comps.push("V");
      if (selectedItem.components?.s || selectedItem.components?.S)
        comps.push("S");
      const rawMat = selectedItem.components?.m || selectedItem.components?.M;
      if (rawMat) {
        let matText = typeof rawMat === "object" ? rawMat.text || "" : rawMat;
        if (matText) {
          comps.push(`M (${matText})`);
        } else {
          comps.push("M");
        }
      }
      let compStr = comps.join(", ");

      const lvlLabel =
        selectedItem.level === 0 ? "Cantrip" : `Level ${selectedItem.level}`;
      const tags = [
        schoolMap[selectedItem.school] || selectedItem.school || "",
        isRitual ? "Ritual" : "",
        isConc ? "Concentration" : "",
        hasMat ? "Material" : "",
      ]
        .filter(Boolean)
        .join(" · ");

      return (
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            background: "rgba(255,255,255,0.5)",
            border: "1px solid var(--gold)",
            borderRadius: 6,
            fontSize: "0.9rem",
          }}
        >
          <div
            style={{
              fontSize: "0.85rem",
              color: "var(--ink-light)",
              marginBottom: 8,
              paddingBottom: 8,
              borderBottom: "1px dashed var(--gold)",
            }}
          >
            {lvlLabel} · {tags}
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "4px 12px",
              color: "var(--ink)",
            }}
          >
            {time && (
              <span>
                <strong>Casting Time:</strong> {time}
              </span>
            )}
            {rangeStr !== "—" && (
              <span>
                <strong>Range:</strong> {rangeStr}
              </span>
            )}
            {durStr && (
              <span>
                <strong>Duration:</strong> {durStr}
              </span>
            )}
            {compStr && (
              <span style={{ gridColumn: "1 / -1" }}>
                <strong>Components:</strong> {compStr}
              </span>
            )}
          </div>
        </div>
      );
    };

    let typeStr = "";
    if (selectedItem.type) {
      if (typeof selectedItem.type === "string") typeStr = selectedItem.type;
      else if (selectedItem.type.type) {
        typeStr = selectedItem.type.type;
        if (selectedItem.type.tags) {
          const tags = selectedItem.type.tags.map((t) =>
            typeof t === "string" ? t : t.tag || t.prefix || JSON.stringify(t),
          );
          typeStr += ` (${tags.join(", ")})`;
        }
      }
    }
    if (typeStr) {
      typeStr = typeStr.replace(/\b\w/g, (c) => c.toUpperCase());
    }

    return (
      <div style={{ padding: "20px 24px" }}>
        {category === "class" && matchingSubclasses.length > 0 && (
          <button
            className="btn"
            style={{
              marginBottom: 16,
              padding: "6px 16px",
              fontSize: "0.9rem",
            }}
            onClick={() => setShowSubclasses(true)}
          >
            View Subclasses ({matchingSubclasses.length})
          </button>
        )}
        {category === "class" ? (
          <div
            style={{
              display: "flex",
              gap: 16,
              alignItems: "flex-start",
              marginBottom: 16,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <h2
                style={{
                  fontFamily: "'Cinzel', serif",
                  color: "var(--red-dark)",
                  marginTop: 0,
                  marginBottom: 8,
                }}
              >
                {selectedItem.name}
              </h2>
              <div
                style={{
                  fontSize: "0.85rem",
                  color: "var(--ink-light)",
                  marginBottom: 8,
                  paddingBottom: 8,
                  borderBottom: "1px dashed var(--gold)",
                }}
              >
                {selectedItem.source && (
                  <span>Source: {selectedItem.source}</span>
                )}
                {selectedItem.hd && (
                  <span>
                    {" "}
                    &bull; Hit Die: d{selectedItem.hd.faces || selectedItem.hd}
                  </span>
                )}
                {selectedItem.proficiency && (
                  <span>
                    {" "}
                    &bull; Saves:{" "}
                    {selectedItem.proficiency
                      .map((p) => p.toUpperCase())
                      .join(", ")}
                  </span>
                )}
              </div>
            </div>
            <FluffImage
              fluff={selectedItem._fluff}
              baseObj={selectedItem}
              type={typeMap[category]}
              name={selectedItem.name}
              source={selectedItem.source}
              imgStyle={{
                float: "none",
                flexShrink: 0,
                width: "220px",
                height: "280px",
                objectFit: "contain",
                borderRadius: 6,
                margin: 0,
                // background: "var(--parchment-dark)",
              }}
            />
          </div>
        ) : (
          <>
            <h2
              style={{
                fontFamily: "'Cinzel', serif",
                color: "var(--red-dark)",
                marginTop: 0,
                marginBottom: 8,
              }}
            >
              {selectedItem.name}
            </h2>
            {category === "monster" && (
              <TokenImage
                baseObj={selectedItem}
                name={selectedItem.name}
                source={selectedItem.source}
              />
            )}
            <div
              style={{
                fontSize: "0.85rem",
                color: "var(--ink-light)",
                marginBottom: 16,
                paddingBottom: 8,
                borderBottom: "1px dashed var(--gold)",
              }}
            >
              {selectedItem.source && (
                <span>Source: {selectedItem.source}</span>
              )}
              {selectedItem.level !== undefined && (
                <span> &bull; Level {selectedItem.level}</span>
              )}
              {typeStr && <span> &bull; {typeStr}</span>}
            </div>
            {category !== "monster" && (
              <div style={{ marginBottom: 16 }}>
                <FluffImage
                  fluff={selectedItem._fluff}
                  baseObj={selectedItem}
                  type={typeMap[category]}
                  name={selectedItem.name}
                  source={selectedItem.source}
                />
              </div>
            )}
          </>
        )}

        {renderMonsterStats()}
        {category === "monster" && (
          <div style={{ marginBottom: 16 }}>
            <FluffImage
              fluff={selectedItem._fluff}
              baseObj={selectedItem}
              type={typeMap[category]}
              name={selectedItem.name}
              source={selectedItem.source}
            />
          </div>
        )}
        {renderItemStats()}
        {renderSpellStats()}

        {category === "class" &&
          selectedItem.classTableGroups?.length > 0 &&
          (() => {
            const groups = selectedItem.classTableGroups;
            return (
              <div style={{ marginBottom: 20, overflowX: "auto" }}>
                <h3
                  style={{
                    fontFamily: "'Cinzel', serif",
                    color: "var(--red-dark)",
                    marginBottom: 8,
                    fontSize: "1rem",
                  }}
                >
                  {selectedItem.name} Progression
                </h3>
                <table
                  className="currency-table"
                  style={{
                    width: "100%",
                    fontSize: "0.78rem",
                    borderCollapse: "collapse",
                  }}
                >
                  <thead>
                    <tr>
                      <th style={{ padding: "4px 6px", textAlign: "center" }}>
                        Lvl
                      </th>
                      <th style={{ padding: "4px 6px", textAlign: "center" }}>
                        Prof
                      </th>
                      {groups.map((g, gi) =>
                        (g.colLabels || []).map((col, ci) => (
                          <th
                            key={`${gi}-${ci}`}
                            style={{ padding: "4px 6px", textAlign: "center" }}
                            title={g.title || ""}
                          >
                            {cleanText(col)}
                          </th>
                        )),
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.from({ length: 20 }, (_, lvl) => {
                      const prof =
                        lvl < 4
                          ? 2
                          : lvl < 8
                            ? 3
                            : lvl < 12
                              ? 4
                              : lvl < 16
                                ? 5
                                : 6;
                      return (
                        <tr
                          key={lvl}
                          style={{
                            background:
                              lvl % 2 === 0
                                ? "rgba(0,0,0,0.03)"
                                : "transparent",
                          }}
                        >
                          <td
                            style={{
                              padding: "3px 6px",
                              textAlign: "center",
                              fontWeight: "bold",
                            }}
                          >
                            {lvl + 1}
                          </td>
                          <td
                            style={{ padding: "3px 6px", textAlign: "center" }}
                          >
                            +{prof}
                          </td>
                          {groups.map((g, gi) =>
                            (g.colLabels || []).map((_, ci) => {
                              const cell = g.rows?.[lvl]?.[ci];
                              return (
                                <td
                                  key={`${gi}-${ci}`}
                                  style={{
                                    padding: "3px 6px",
                                    textAlign: "center",
                                  }}
                                >
                                  {fmtCell(cell)}
                                </td>
                              );
                            }),
                          )}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            );
          })()}

        <div
          className="rendered-desc"
          onClick={handlePreviewClick}
          style={{ fontSize: "0.95rem", lineHeight: 1.6, color: "var(--ink)" }}
          dangerouslySetInnerHTML={{
            __html:
              (fluffHtml ? fluffHtml + "<br/><br/>" : "") +
              (html ||
                '<em style="color:var(--ink-light)">No description available.</em>'),
          }}
        />
      </div>
    );
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const detailsContent = useMemo(() => renderDetails(), [selectedItem, category, showSubclasses, activeSubclass]);

  return (
    <>
      <style>{`
        .compendium-container { display: flex; flex: 1; overflow: hidden; padding: 16px; gap: 16px; max-width: 1400px; margin: 0 auto; width: 100%; position: relative; z-index: 1; flex-direction: row; }
        .compendium-left { width: 220px; display: flex; flex-direction: column; gap: 8px; border-right: 1px solid var(--gold); padding-right: 16px; flex-shrink: 0; }
        .compendium-mid { width: 320px; display: flex; flex-direction: column; gap: 12px; border-right: 1px solid var(--gold); padding-right: 16px; flex-shrink: 0; }
        .compendium-right { flex: 1; overflow-y: auto; background: rgba(255,255,255,0.6); border: 1px solid var(--gold); border-radius: 8px; }
        .compendium-detail { animation: compendiumFadeIn 0.12s ease; }
        @media (max-width: 900px) {
          .compendium-container { flex-direction: column; overflow-y: auto; }
          .compendium-left { width: 100%; border-right: none; border-bottom: 1px solid var(--gold); padding-right: 0; padding-bottom: 12px; flex-direction: row; flex-wrap: wrap; }
          .compendium-mid { width: 100%; border-right: none; border-bottom: 1px solid var(--gold); padding-right: 0; padding-bottom: 12px; height: 350px; }
          .compendium-right { width: 100%; min-height: 400px; overflow-y: visible; }
        }
      `}</style>
      <Sidebar>
        {(closeSidebar) => (
          <>
            <SidebarBtn onClick={closeSidebar}>
              <Link to="/" style={{ color: "inherit", textDecoration: "none" }}>
                Character Sheet
              </Link>
            </SidebarBtn>
            <SidebarBtn onClick={closeSidebar}>
              <Link
                to="/data"
                style={{ color: "inherit", textDecoration: "none" }}
              >
                Data Viewer
              </Link>
            </SidebarBtn>
          </>
        )}
      </Sidebar>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          height: "100dvh",
          background: "var(--parchment)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage:
              "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(42,24,16,0.02) 2px, rgba(42,24,16,0.02) 4px)",
            pointerEvents: "none",
            opacity: 0.5,
          }}
        />
        <div className="header" style={{ position: "relative", zIndex: 1 }}>
          <h1>Compendium</h1>
          <Link to="/" className="dm-screen-button">
            Character Sheet
          </Link>
        </div>
        <div className="compendium-container">
          {loading ? (
            <div
              style={{
                margin: "auto",
                fontStyle: "italic",
                color: "var(--ink-light)",
              }}
            >
              Loading database...
            </div>
          ) : (
            <>
              <div className="compendium-left">
                <h3
                  style={{ fontFamily: "'Cinzel', serif", margin: "0 0 8px" }}
                >
                  Categories
                </h3>
                {[
                  "monster",
                  "spell",
                  "item",
                  "feat",
                  "background",
                  "race",
                  "class",
                  "condition",
                ].map((cat) => (
                  <button
                    key={cat}
                    className={`btn ${category === cat ? "btn-primary" : ""}`}
                    onClick={() => {
                      setCategory(cat);
                      setSelectedItem(null);
                      setSearchQuery("");
                      setShowSubclasses(false);
                      setActiveSubclass(null);
                      setDisplayLimit(100);
                    }}
                    style={{
                      textTransform: "capitalize",
                      textAlign: "left",
                      padding: "8px 12px",
                    }}
                  >
                    {cat}s ({dataMap[cat]?.length || 0})
                  </button>
                ))}
              </div>
              <div className="compendium-mid">
                <input
                  type="text"
                  placeholder={`Search ${category}s...`}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setDisplayLimit(100);
                  }}
                  style={{
                    padding: 10,
                    borderRadius: 4,
                    border: "1px solid var(--gold)",
                    fontSize: "1rem",
                  }}
                />
                <div
                  onScroll={handleListScroll}
                  style={{
                    overflowY: "auto",
                    flex: 1,
                    display: "flex",
                    flexDirection: "column",
                    gap: 4,
                    paddingRight: 8,
                  }}
                >
                  {list.map((item) => (
                    <div
                      key={item.name + (item.source || "")}
                      onClick={() => {
                        setSelectedItem(item);
                        setShowSubclasses(false);
                        setActiveSubclass(null);
                      }}
                      style={{
                        padding: "8px 12px",
                        cursor: "pointer",
                        borderRadius: 4,
                        background:
                          selectedItem === item
                            ? "var(--parchment-dark)"
                            : "rgba(255,255,255,0.4)",
                        border: `1px solid ${selectedItem === item ? "var(--red-dark)" : "var(--gold-light)"}`,
                        fontSize: "0.9rem",
                        fontWeight: selectedItem === item ? "bold" : "normal",
                      }}
                    >
                      {item.name}
                    </div>
                  ))}
                </div>
              </div>
              <div className="compendium-right" ref={rightPanelRef}>
                <div key={selectedItem?.name + (selectedItem?.source || "") + category} className="compendium-detail">
                  {detailsContent}
                </div>
              </div>
            </>
          )}
        </div>

        {previewSpell && (
          <ModalOverlay onClick={() => setPreviewSpell(null)} $zIndex={2000}>
            <ModalBox $maxWidth="500px" onClick={(e) => e.stopPropagation()}>
              <CloseBtn onClick={() => setPreviewSpell(null)}>&times;</CloseBtn>
              <ModalTitle>{previewSpell.name}</ModalTitle>
              <div
                style={{
                  color: "var(--ink-light)",
                  fontSize: "0.85rem",
                  marginBottom: 12,
                }}
              >
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
                    ? previewSpell.time
                        .map((t) => `${t.number} ${t.unit}`)
                        .join(", ")
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
                    ? previewSpell.duration
                        .map((d) =>
                          d.type === "permanent"
                            ? "Until dispelled"
                            : d.type === "timed"
                              ? `${d.concentration ? "Concentration, " : ""}${d.duration?.amount || ""} ${d.duration?.type || ""}`.trim()
                              : d.type,
                        )
                        .join(", ")
                    : previewSpell.duration}
                </div>
              )}
              <div
                style={{ marginTop: 10, fontSize: "0.9rem", lineHeight: 1.6 }}
                dangerouslySetInnerHTML={{
                  __html: formatLinks(processEntries(previewSpell.entries)),
                }}
              />
              {previewSpell.entriesHigherLevel && (
                <div
                  style={{
                    marginTop: 10,
                    borderTop: "1px dashed var(--gold)",
                    paddingTop: 8,
                    fontSize: "0.9rem",
                  }}
                  dangerouslySetInnerHTML={{
                    __html: formatLinks(
                      processEntries(previewSpell.entriesHigherLevel),
                    ),
                  }}
                />
              )}
            </ModalBox>
          </ModalOverlay>
        )}

        {previewFeat && (
          <ModalOverlay onClick={() => setPreviewFeat(null)} $zIndex={2000}>
            <ModalBox $maxWidth="500px" onClick={(e) => e.stopPropagation()}>
              <CloseBtn onClick={() => setPreviewFeat(null)}>&times;</CloseBtn>
              <ModalTitle>{previewFeat.name}</ModalTitle>
              <div
                style={{
                  color: "var(--ink-light)",
                  fontSize: "0.85rem",
                  marginBottom: 12,
                }}
              >
                {previewFeat.category === "O" ||
                previewFeat.category === "Origin"
                  ? "Origin Feat"
                  : previewFeat.category === "G"
                    ? "General Feat"
                    : previewFeat.category === "EB"
                      ? "Epic Boon"
                      : "Feat"}
                {previewFeat.source && ` · ${previewFeat.source}`}
              </div>
              {previewFeat.prerequisite && (
                <div
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--red)",
                    fontStyle: "italic",
                    marginBottom: 8,
                  }}
                >
                  Requires: {formatPrerequisites(previewFeat)}
                </div>
              )}
              {previewFeat.ability && (
                <div
                  style={{
                    fontSize: "0.9rem",
                    color: "var(--ink)",
                    marginBottom: 12,
                    background: "rgba(255,255,255,0.5)",
                    padding: 8,
                    borderRadius: 4,
                    border: "1px solid var(--gold-light)",
                  }}
                >
                  <strong>Ability Score Increase:</strong>{" "}
                  {previewFeat.ability
                    .map((a) => {
                      if (a.choose && a.choose.from)
                        return `Choose ${a.choose.count || a.choose.amount || 1} from ${a.choose.from.join(", ").toUpperCase()}`;
                      return Object.entries(a)
                        .filter(([k]) => k !== "choose")
                        .map(([k, v]) => `${k.toUpperCase()} +${v}`)
                        .join(", ");
                    })
                    .join("; ")}
                </div>
              )}
              <div
                style={{ marginTop: 10, fontSize: "0.9rem", lineHeight: 1.6 }}
                dangerouslySetInnerHTML={{
                  __html: formatLinks(
                    processEntries(previewFeat.entries || previewFeat.entry),
                  ),
                }}
              />
            </ModalBox>
          </ModalOverlay>
        )}

        {previewItem && (
          <ModalOverlay onClick={() => setPreviewItem(null)} $zIndex={2000}>
            <ModalBox $maxWidth="500px" onClick={(e) => e.stopPropagation()}>
              <CloseBtn onClick={() => setPreviewItem(null)}>&times;</CloseBtn>
              <ModalTitle>{previewItem.name}</ModalTitle>
              <div
                style={{
                  color: "var(--ink-light)",
                  fontSize: "0.85rem",
                  marginBottom: 12,
                }}
              >
                {previewItem.type && previewItem.type}
                {previewItem.rarity &&
                  ` · ${previewItem.rarity.charAt(0).toUpperCase() + previewItem.rarity.slice(1)}`}
                {previewItem.reqAttune &&
                  ` · Requires Attunement${previewItem.reqAttune === true ? "" : ` ${previewItem.reqAttune}`}`}
                {previewItem.source && ` · ${previewItem.source}`}
              </div>
              <div
                style={{ marginTop: 10, fontSize: "0.9rem", lineHeight: 1.6 }}
                dangerouslySetInnerHTML={{
                  __html: formatLinks(
                    processEntries(
                      previewItem.entries ||
                        previewItem.description ||
                        previewItem.desc ||
                        previewItem.entry ||
                        [],
                    ) +
                      (previewItem.additionalEntries
                        ? "<br/><br/>" +
                          processEntries(previewItem.additionalEntries)
                        : ""),
                  ),
                }}
              />
            </ModalBox>
          </ModalOverlay>
        )}
      </div>
    </>
  );
}
