import { useState, useEffect } from "react";
import { openDB, STORE_NAME } from "src/utils/db";

export function useCreatorData() {
  const [data, setData] = useState({
    classes: [],
    classFeatures: [],
    subclasses: [],
    subclassFeatures: [],
    spells: [],
    optionalFeatures: [],
    feats: [],
    backgrounds: [],
    backgroundFluff: [],
    species: [],
    raceFluff: [],
    subraces: [],
    deities: [],
    items: [],
    classFluff: [],
    subclassFluff: [],
  });
  const [loading, setLoading] = useState(true);
  const [noData, setNoData] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const db = await openDB();
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          setNoData(true);
          setLoading(false);
          return;
        }
        const tx = db.transaction(STORE_NAME, "readonly");
        const store = tx.objectStore(STORE_NAME);
        const files = await new Promise((resolve, reject) => {
          const req = store.get("currentData");
          req.onsuccess = () => resolve(req.result);
          req.onerror = () => reject(req.error);
        });
        if (!files || !files.length) {
          setNoData(true);
          setLoading(false);
          return;
        }

        const parsed = {
          classes: [],
          classFeatures: [],
          subclasses: [],
          subclassFeatures: [],
          spells: [],
          optionalFeatures: [],
          feats: [],
          backgrounds: [],
          backgroundFluff: [],
          species: [],
          raceFluff: [],
          subraces: [],
          deities: [],
          items: [],
          classFluff: [],
          subclassFluff: [],
        };

        const spellClassMap = {};
        const processBookEntries = (entries, currentClass = null) => {
          if (!entries || !Array.isArray(entries)) return;
          entries.forEach((entry) => {
            if (!entry) return;
            let className = currentClass;
            if (
              entry.name &&
              typeof entry.name === "string" &&
              entry.name.endsWith(" Spells")
            ) {
              className = entry.name.replace(" Spells", "").trim();
            }
            if (className && entry.items && Array.isArray(entry.items)) {
              entry.items.forEach((item) => {
                const itemStr = typeof item === "string" ? item : item.name || "";
                const match = /\{@spell ([^}|]+)/.exec(itemStr);
                if (match) {
                  const n = match[1].toLowerCase().trim();
                  if (!spellClassMap[n]) spellClassMap[n] = new Set();
                  spellClassMap[n].add(className);
                }
              });
            }
            if (entry.entries) processBookEntries(entry.entries, className);
          });
        };

        files.forEach((file) => {
          if (!file.name.toLowerCase().endsWith(".json")) return;
          try {
            const json = JSON.parse(file.content);
            if (json.data && Array.isArray(json.data))
              processBookEntries(json.data);
          } catch {}
        });

        files.forEach((file) => {
          if (!file.name.toLowerCase().endsWith(".json")) return;
          try {
            const json = JSON.parse(file.content);
            if (json.classFeature) for (const i of json.classFeature) parsed.classFeatures.push(i);
            if (json.subclass) for (const i of json.subclass) parsed.subclasses.push(i);
            if (json.subclassFeature) for (const i of json.subclassFeature) parsed.subclassFeatures.push(i);
            if (json.class) for (const i of json.class) parsed.classes.push(i);
            if (json.optionalfeature) for (const i of json.optionalfeature) parsed.optionalFeatures.push(i);
            if (json.feat) for (const i of json.feat) parsed.feats.push(i);
            if (json.background) for (const b of json.background) parsed.backgrounds.push(b);
            if (json.classFluff) for (const f of json.classFluff) parsed.classFluff.push(f);
            if (json.subclassFluff) for (const f of json.subclassFluff) parsed.subclassFluff.push(f);
            if (json.backgroundFluff) {
              const isInline = !!(json.background && json.background.length > 0);
              for (const f of json.backgroundFluff) parsed.backgroundFluff.push({ ...f, _inline: isInline });
            }
            if (json.race) for (const r of json.race) parsed.species.push(r);
            if (json.raceFluff) {
              const isInline = !!(json.race && json.race.length > 0);
              for (const f of json.raceFluff) parsed.raceFluff.push({ ...f, _inline: isInline });
            }
            if (json.subrace) for (const s of json.subrace) parsed.subraces.push(s);
            if (json.deity) for (const d of json.deity) parsed.deities.push(d);

            [json.item, json.items, json.baseitem, json.baseitems].forEach((arr) => {
                if (Array.isArray(arr)) for (const i of arr) { if (i.name) parsed.items.push(i); }
            });

            const spellArr = json.spell || json.spells || (json.data && json.data.some?.((s) => s.school || s.time) ? json.data : null);
            if (spellArr && Array.isArray(spellArr)) {
              for (const s of spellArr) {
                if (!s.name || typeof s.level !== "number") continue;
                const mapped = spellClassMap[s.name.toLowerCase().trim()];
                if (mapped) {
                  if (!s.classes) s.classes = { fromClassList: [] };
                  else if (Array.isArray(s.classes)) {
                    s.classes = { fromClassList: s.classes.map((c) => typeof c === "string" ? { name: c } : c ) };
                  }
                  if (!s.classes.fromClassList) s.classes.fromClassList = [];
                  mapped.forEach((c) => {
                    if (!s.classes.fromClassList.some((cl) => cl.name === c)) {
                      s.classes.fromClassList.push({ name: c, source: "PHB" });
                    }
                  });
                }
                s._normalizedClasses = new Set();
                const addC = (c) => {
                  if (!c) return;
                  s._normalizedClasses.add((typeof c === "string" ? c : c.name).toLowerCase().trim());
                };
                if (s.classes) {
                  if (Array.isArray(s.classes)) s.classes.forEach(addC);
                  if (s.classes.fromClassList) s.classes.fromClassList.forEach(addC);
                  if (s.classes.fromClassListVariant) s.classes.fromClassListVariant.forEach(addC);
                }
                if (json.data === spellArr) {
                  if (s.school || s.time) parsed.spells.push(s);
                } else parsed.spells.push(s);
              }
            }
          } catch {}
        });

        setData(parsed);
      } catch (e) {
        console.error("Failed to load creator data:", e);
        setNoData(true);
      }
      setLoading(false);
    }
    load();
  }, []);

  return { data, loading, noData };
}