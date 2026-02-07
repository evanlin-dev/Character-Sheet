document.addEventListener('DOMContentLoaded', () => {
    const classList = document.getElementById('creator-class-list');
    let selectedClass = null;
    let selectedLevel = 1;
    let selectedSubclass = null;
    let currentClassSource = null;
    let selectedSubclassSource = null;
    let allClassFeatures = [];
    let allSubclasses = [];
    let allSubclassFeatures = [];
    let allClasses = [];
    let allSpells = [];
    let allOptionalFeatures = [];
    let allFeats = [];
    let selectedOptionalFeatures = new Set();
    let selectedSpells = new Set();
    let allBackgrounds = [];
    let selectedBackground = null;
    let allSpecies = [];
    let allSubraces = [];
    let selectedSubrace = null;
    let selectedSpeciesOption = null;
    let selectedSpeciesOptionFeature = null;
    let selectedSpecies = null;
    let allMasteryProperties = {};
    let allItems = [];

    // Helper for Equipment Selection UI
    window.updateEquipSelection = function(radio) {
        const container = radio.closest('.equip-selection-container');
        container.querySelectorAll('.equip-option-box').forEach(box => {
            box.classList.remove('selected');
            box.style.borderColor = 'var(--gold)';
            box.style.background = 'white';
            const ind = box.querySelector('.check-indicator');
            if(ind) ind.style.display = 'none';
        });
        const selectedBox = radio.closest('.equip-option-box');
        selectedBox.classList.add('selected');
        selectedBox.style.borderColor = 'var(--red)';
        selectedBox.style.background = 'var(--parchment)';
        const ind = selectedBox.querySelector('.check-indicator');
        if(ind) ind.style.display = 'block';
    };

    // Weapon DB (Copied for Character Creator)
    const dndWeaponsDB = {
        "Club": { type: "Simple", cat: "Melee", dmg: "1d4", dtype: "bludgeoning", props: ["Light"], mastery: "Slow" },
        "Dagger": { type: "Simple", cat: "Melee", dmg: "1d4", dtype: "piercing", props: ["Finesse", "Light", "Thrown (20/60)"], mastery: "Nick" },
        "Greatclub": { type: "Simple", cat: "Melee", dmg: "1d8", dtype: "bludgeoning", props: ["Two-Handed"], mastery: "Push" },
        "Handaxe": { type: "Simple", cat: "Melee", dmg: "1d6", dtype: "slashing", props: ["Light", "Thrown (20/60)"], mastery: "Vex" },
        "Javelin": { type: "Simple", cat: "Melee", dmg: "1d6", dtype: "piercing", props: ["Thrown (30/120)"], mastery: "Slow" },
        "Light Hammer": { type: "Simple", cat: "Melee", dmg: "1d4", dtype: "bludgeoning", props: ["Light", "Thrown (20/60)"], mastery: "Nick" },
        "Mace": { type: "Simple", cat: "Melee", dmg: "1d6", dtype: "bludgeoning", props: [], mastery: "Sap" },
        "Quarterstaff": { type: "Simple", cat: "Melee", dmg: "1d6", dtype: "bludgeoning", props: ["Versatile (1d8)"], mastery: "Topple" },
        "Sickle": { type: "Simple", cat: "Melee", dmg: "1d4", dtype: "slashing", props: ["Light"], mastery: "Nick" },
        "Spear": { type: "Simple", cat: "Melee", dmg: "1d6", dtype: "piercing", props: ["Thrown (20/60)", "Versatile (1d8)"], mastery: "Sap" },
        "Light Crossbow": { type: "Simple", cat: "Ranged", dmg: "1d8", dtype: "piercing", props: ["Ammunition (80/320)", "Loading", "Two-Handed"], mastery: "Slow" },
        "Dart": { type: "Simple", cat: "Ranged", dmg: "1d4", dtype: "piercing", props: ["Finesse", "Thrown (20/60)"], mastery: "Vex" },
        "Shortbow": { type: "Simple", cat: "Ranged", dmg: "1d6", dtype: "piercing", props: ["Ammunition (80/320)", "Two-Handed"], mastery: "Vex" },
        "Sling": { type: "Simple", cat: "Ranged", dmg: "1d4", dtype: "bludgeoning", props: ["Ammunition (30/120)"], mastery: "Slow" },
        "Battleaxe": { type: "Martial", cat: "Melee", dmg: "1d8", dtype: "slashing", props: ["Versatile (1d10)"], mastery: "Topple" },
        "Flail": { type: "Martial", cat: "Melee", dmg: "1d8", dtype: "bludgeoning", props: [], mastery: "Sap" },
        "Glaive": { type: "Martial", cat: "Melee", dmg: "1d10", dtype: "slashing", props: ["Heavy", "Reach", "Two-Handed"], mastery: "Graze" },
        "Greataxe": { type: "Martial", cat: "Melee", dmg: "1d12", dtype: "slashing", props: ["Heavy", "Two-Handed"], mastery: "Cleave" },
        "Greatsword": { type: "Martial", cat: "Melee", dmg: "2d6", dtype: "slashing", props: ["Heavy", "Two-Handed"], mastery: "Graze" },
        "Halberd": { type: "Martial", cat: "Melee", dmg: "1d10", dtype: "slashing", props: ["Heavy", "Reach", "Two-Handed"], mastery: "Cleave" },
        "Lance": { type: "Martial", cat: "Melee", dmg: "1d12", dtype: "piercing", props: ["Reach", "Special"], mastery: "Topple" },
        "Longsword": { type: "Martial", cat: "Melee", dmg: "1d8", dtype: "slashing", props: ["Versatile (1d10)"], mastery: "Sap" },
        "Maul": { type: "Martial", cat: "Melee", dmg: "2d6", dtype: "bludgeoning", props: ["Heavy", "Two-Handed"], mastery: "Topple" },
        "Morningstar": { type: "Martial", cat: "Melee", dmg: "1d8", dtype: "piercing", props: [], mastery: "Sap" },
        "Pike": { type: "Martial", cat: "Melee", dmg: "1d10", dtype: "piercing", props: ["Heavy", "Reach", "Two-Handed"], mastery: "Push" },
        "Rapier": { type: "Martial", cat: "Melee", dmg: "1d8", dtype: "piercing", props: ["Finesse"], mastery: "Vex" },
        "Scimitar": { type: "Martial", cat: "Melee", dmg: "1d6", dtype: "slashing", props: ["Finesse", "Light"], mastery: "Nick" },
        "Shortsword": { type: "Martial", cat: "Melee", dmg: "1d6", dtype: "piercing", props: ["Finesse", "Light"], mastery: "Vex" },
        "Trident": { type: "Martial", cat: "Melee", dmg: "1d6", dtype: "piercing", props: ["Thrown (20/60)", "Versatile (1d8)"], mastery: "Topple" },
        "War Pick": { type: "Martial", cat: "Melee", dmg: "1d8", dtype: "piercing", props: [], mastery: "Sap" },
        "Warhammer": { type: "Martial", cat: "Melee", dmg: "1d8", dtype: "bludgeoning", props: ["Versatile (1d10)"], mastery: "Push" },
        "Whip": { type: "Martial", cat: "Melee", dmg: "1d4", dtype: "slashing", props: ["Finesse", "Reach"], mastery: "Slow" },
        "Blowgun": { type: "Martial", cat: "Ranged", dmg: "1", dtype: "piercing", props: ["Ammunition (25/100)", "Loading"], mastery: "Vex" },
        "Hand Crossbow": { type: "Martial", cat: "Ranged", dmg: "1d6", dtype: "piercing", props: ["Ammunition (30/120)", "Light", "Loading"], mastery: "Vex" },
        "Heavy Crossbow": { type: "Martial", cat: "Ranged", dmg: "1d10", dtype: "piercing", props: ["Ammunition (100/400)", "Heavy", "Loading", "Two-Handed"], mastery: "Push" },
        "Longbow": { type: "Martial", cat: "Ranged", dmg: "1d8", dtype: "piercing", props: ["Ammunition (150/600)", "Heavy", "Two-Handed"], mastery: "Slow" },
        "Net": { type: "Martial", cat: "Ranged", dmg: "0", dtype: "-", props: ["Special", "Thrown (5/15)"], mastery: null },
        "Musket": { type: "Martial", cat: "Ranged", dmg: "1d12", dtype: "piercing", props: ["Ammunition (40/120)", "Loading", "Two-Handed"], mastery: "Slow" },
        "Pistol": { type: "Martial", cat: "Ranged", dmg: "1d10", dtype: "piercing", props: ["Ammunition (30/90)", "Loading"], mastery: "Vex" }
    };

    // DB Setup
    const DB_NAME = 'DndDataDB';
    const STORE_NAME = 'files';
    const DB_VERSION = 7;

    // Helper to process entries recursively
    const processEntries = (entries) => {
        if (!entries) return "";
        if (typeof entries === 'string') return entries;
        if (!Array.isArray(entries)) return "";
        
        return entries.map(e => {
            if (!e) return "";
            if (typeof e === 'string') return e;
            
            let text = "";
            
            // Handle Lists
            if (e.type === 'list') {
                if (e.name) text += `<strong>${e.name}</strong>`;
                if (e.items) {
                    text += "<ul style='margin-top:4px; padding-left:20px; list-style-type:disc;'>" + e.items.map(item => {
                        let itemText = "";
                        if (typeof item === 'object') {
                            if (item.name) itemText += `<strong>${item.name}</strong> `;
                            if (item.entry) itemText += (typeof item.entry === 'string' ? item.entry : processEntries([item.entry]));
                            else if (item.entries) itemText += processEntries(item.entries);
                        } else {
                            itemText += item;
                        }
                        return `<li>${itemText}</li>`;
                    }).join("") + "</ul>";
                }
                return text;
            }

            // Handle Tables
            if (e.type === 'table') {
                if (e.caption) text += `<strong>${e.caption}</strong>`;
                text += "<table class='currency-table' style='width:100%; font-size:0.8rem; margin-top:5px;'>";
                if (e.colLabels) {
                    text += "<thead><tr>" + e.colLabels.map(l => `<th>${l.replace(/\{@\w+\s*([^}]+)?\}/g, (m, c) => c ? c.split('|')[0] : "")}</th>`).join("") + "</tr></thead>";
                }
                if (e.rows) {
                    text += "<tbody>" + e.rows.map(row => "<tr>" + row.map(cell => {
                        let cellContent = cell;
                        if (typeof cell === 'object') {
                            if (cell.roll) cellContent = `${cell.roll.min}-${cell.roll.max}`;
                            else cellContent = processEntries([cell]);
                        }
                        return `<td>${String(cellContent).replace(/\{@\w+\s*([^}]+)?\}/g, (m, c) => c ? c.split('|')[0] : "")}</td>`;
                    }).join("") + "</tr>").join("") + "</tbody>";
                }
                text += "</table>";
                return text;
            }

            if (e.name && (e.type === 'section' || e.type === 'entries')) text += `<strong>${e.name}.</strong> `;
            
            if (e.entries) text += processEntries(e.entries);
            else if (e.items) text += processEntries(e.items);
            else if (e.entry) text += (typeof e.entry === 'string' ? e.entry : processEntries([e.entry]));
            else if (e.caption) text += e.caption;
            else if (e.text) text += e.text;
            
            return text;
        }).filter(t => t && t.trim().length > 0).join("<br><br>");
    };

    function openDB() {
        return new Promise((resolve, reject) => {
            console.log(`[DB] Opening ${DB_NAME} version ${DB_VERSION}...`);
            const request = indexedDB.open(DB_NAME, DB_VERSION);
            
            request.onerror = (event) => {
                console.error("[DB] Error opening database:", request.error);
                reject(request.error);
            };

            request.onblocked = (event) => {
                console.warn("[DB] Database upgrade blocked. Please close other tabs.");
                alert("Database upgrade blocked. Please close other tabs with this site open and reload.");
            };

            request.onsuccess = (event) => {
                console.log("[DB] Database opened successfully.");
                resolve(request.result);
            };
            
            request.onupgradeneeded = (e) => {
                console.log(`[DB] Upgrade needed: ${e.oldVersion} -> ${e.newVersion}`);
                const db = e.target.result;
                if (db.objectStoreNames.contains(STORE_NAME)) {
                    console.log(`[DB] Deleting old object store: ${STORE_NAME}`);
                    db.deleteObjectStore(STORE_NAME);
                }
                console.log(`[DB] Creating object store: ${STORE_NAME}`);
                db.createObjectStore(STORE_NAME);
            };
        });
    }

    async function loadClassData() {
        try {
            console.log("[Data] Loading class data...");
            const db = await openDB();
            
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                console.error(`[Data] Store '${STORE_NAME}' not found in database!`);
                return;
            }

            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const data = await new Promise((resolve) => {
                const req = store.get('currentData');
                req.onsuccess = () => {
                    console.log("[Data] Fetch success. Data found:", !!req.result);
                    resolve(req.result);
                };
                req.onerror = (e) => {
                    console.error("[Data] Fetch error:", e);
                    resolve(null);
                };
            });
            if (data) {
                // Pass 1: Build Spell Class Map from Book Data (Logic from script.js)
                const spellClassMap = {};
                const processBookEntries = (entries, currentClass = null) => {
                    if (!entries || !Array.isArray(entries)) return;
                    entries.forEach(entry => {
                        if (!entry) return;
                        let className = currentClass;
                        if (entry.name && typeof entry.name === 'string' && entry.name.endsWith(" Spells")) {
                            className = entry.name.replace(" Spells", "").trim();
                        }
                        if (className) {
                            if (entry.items && Array.isArray(entry.items)) {
                                entry.items.forEach(item => {
                                    const itemStr = typeof item === 'string' ? item : (item.name || "");
                                    const match = /{@spell ([^}|]+)/.exec(itemStr);
                                    if (match) {
                                        const spellName = match[1].toLowerCase().trim();
                                        if (!spellClassMap[spellName]) spellClassMap[spellName] = new Set();
                                        spellClassMap[spellName].add(className);
                                    }
                                });
                            }
                        }
                        if (entry.entries) processBookEntries(entry.entries, className);
                    });
                };

                data.forEach(file => {
                    if (!file.name.toLowerCase().endsWith('.json')) return;
                    try {
                        const json = JSON.parse(file.content);
                        if (json.data && Array.isArray(json.data)) processBookEntries(json.data);
                    } catch (e) {}
                });

                // Pass 2: Load Items
                data.forEach(file => {
                    if (!file.name.toLowerCase().endsWith('.json')) return;
                    try {
                        const json = JSON.parse(file.content);
                        // Use loops instead of spread to avoid stack overflow on large arrays
                        if (json.classFeature && Array.isArray(json.classFeature)) {
                            for (const i of json.classFeature) allClassFeatures.push(i);
                        }
                        if (json.subclass && Array.isArray(json.subclass)) {
                            for (const i of json.subclass) allSubclasses.push(i);
                        }
                        if (json.subclassFeature && Array.isArray(json.subclassFeature)) {
                            for (const i of json.subclassFeature) allSubclassFeatures.push(i);
                        }
                        if (json.class && Array.isArray(json.class)) {
                            for (const i of json.class) allClasses.push(i);
                        }
                        if (json.optionalfeature && Array.isArray(json.optionalfeature)) {
                            for (const i of json.optionalfeature) allOptionalFeatures.push(i);
                        }
                        if (json.feat && Array.isArray(json.feat)) {
                            for (const i of json.feat) allFeats.push(i);
                        }
                        if (json.background && Array.isArray(json.background)) {
                            for (const b of json.background) allBackgrounds.push(b);
                        }
                        if (json.race && Array.isArray(json.race)) {
                            for (const r of json.race) allSpecies.push(r);
                        }
                        if (json.subrace && Array.isArray(json.subrace)) {
                            for (const s of json.subrace) allSubraces.push(s);
                        }

                        // Load Items for Description Lookup
                        [json.item, json.items, json.baseitem, json.baseitems, json.magicvariant, json.magicvariants].forEach(arr => {
                            if (Array.isArray(arr)) {
                                for (const i of arr) {
                                    if (i.name) allItems.push(i);
                                }
                            }
                        });
                        
                        // Robust spell loading with enrichment
                        const spells = json.spell || json.spells || json.data;
                        if (spells && Array.isArray(spells)) {
                            for (const s of spells) {
                                if (s.name && typeof s.level === 'number') {
                                    // Enrich with class info
                                    const mappedClasses = spellClassMap[s.name.toLowerCase().trim()];
                                    if (mappedClasses) {
                                        if (!s.classes) {
                                            s.classes = { fromClassList: [] };
                                            mappedClasses.forEach(c => s.classes.fromClassList.push({name: c, source: "PHB"}));
                                        } else if (Array.isArray(s.classes)) {
                                            mappedClasses.forEach(c => {
                                                const exists = s.classes.some(existing => (typeof existing === 'string' ? existing : existing.name) === c);
                                                if (!exists) s.classes.push({name: c, source: "PHB"});
                                            });
                                        } else if (typeof s.classes === 'object') {
                                            if (!s.classes.fromClassList) s.classes.fromClassList = [];
                                            mappedClasses.forEach(c => {
                                                if (!s.classes.fromClassList.some(cl => cl.name === c)) {
                                                    s.classes.fromClassList.push({name: c, source: "PHB"});
                                                }
                                            });
                                        }
                                    }

                                    // Filter out non-spells if coming from generic data
                                    if (json.data === spells) {
                                        if (s.school || s.time) allSpells.push(s);
                                    } else {
                                        allSpells.push(s);
                                    }
                                }
                            }
                        }

                        // Load Weapons from baseitem
                        if (json.baseitem && Array.isArray(json.baseitem)) {
                            json.baseitem.forEach(item => {
                                if (item.weaponCategory) {
                                    const name = item.name;
                                    const type = item.weaponCategory.toLowerCase() === "martial" ? "Martial" : "Simple";
                                    const rawType = (item.type || "").split('|')[0];
                                    const cat = (rawType === "R" || rawType === "F") ? "Ranged" : "Melee";
                                    const dmg = item.dmg1 || "";
                                    const dmgTypeMap = { "S": "slashing", "P": "piercing", "B": "bludgeoning" };
                                    const dtype = dmgTypeMap[item.dmgType] || item.dmgType || "";
                                    
                                    const propMap = {
                                        "L": "Light", "F": "Finesse", "T": "Thrown", "2H": "Two-Handed", 
                                        "H": "Heavy", "R": "Reach", "V": "Versatile", "LD": "Loading", "A": "Ammunition"
                                    };
                                    
                                    const props = [];
                                    if (item.property) {
                                        item.property.forEach(p => {
                                            const pStr = typeof p === 'string' ? p : (p.uid || p.name || "");
                                            const cleanP = pStr.split('|')[0];
                                            let propName = propMap[cleanP] || cleanP;
                                            if (cleanP === "T" || cleanP === "A") {
                                                if (item.range) {
                                                    if (typeof item.range === 'string') {
                                                        propName += ` (${item.range})`;
                                                    } else if (item.range.normal) {
                                                    propName += ` (${item.range.normal}/${item.range.long})`;
                                                    }
                                                }
                                            }
                                            if (cleanP === "V" && item.dmg2) {
                                                propName += ` (${item.dmg2})`;
                                            }
                                            props.push(propName);
                                        });
                                    }

                                    let mastery = item.mastery || null;
                                    if (Array.isArray(mastery)) mastery = mastery[0];
                                    if (mastery) mastery = mastery.split('|')[0];
                                    dndWeaponsDB[name] = { type, cat, dmg, dtype, props, mastery };
                                }
                            });
                        }

                        // Load Mastery Properties
                        const scanForMastery = (entries) => {
                            if (!entries || !Array.isArray(entries)) return;
                            entries.forEach(e => {
                                if (e.name === "Mastery Properties" && e.entries) {
                                    e.entries.forEach(prop => {
                                        if (prop.name && prop.entries) {
                                            allMasteryProperties[prop.name] = processEntries(prop.entries);
                                        }
                                    });
                                }
                                if (e.entries) scanForMastery(e.entries);
                            });
                        };
                        if (json.data) scanForMastery(json.data);
                        if (json.entries) scanForMastery(json.entries);
                        
                        if (json.itemMastery && Array.isArray(json.itemMastery)) {
                            json.itemMastery.forEach(m => {
                                if (m.name && m.entries) {
                                    allMasteryProperties[m.name] = processEntries(m.entries);
                                }
                            });
                        }
                    } catch (e) {}
                });
                console.log("All Optional Features:", allOptionalFeatures);
                console.log("All Mastery Properties:", allMasteryProperties);
            }
        } catch (e) { console.error("Error loading DB:", e); }
    }
    loadClassData();

    // Populate Levels
    const levelSelect = document.getElementById('creator-level');
    for (let i = 1; i <= 20; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = i;
        levelSelect.appendChild(opt);
    }

    const classes = [
        "Artificer", "Barbarian", "Bard", "Cleric", "Druid", "Fighter", 
        "Monk", "Paladin", "Ranger", "Rogue", "Sorcerer", "Warlock", "Wizard"
    ];

    // Populate Classes
    classes.forEach(c => {
        const div = document.createElement('div');
        div.className = 'checklist-item';
        div.textContent = c;
        div.style.justifyContent = 'center';
        div.style.fontWeight = 'bold';
        
        div.onclick = () => {
            document.querySelectorAll('.checklist-item').forEach(item => {
                item.style.background = 'white';
                item.style.color = 'var(--ink)';
                item.style.borderColor = 'var(--gold)';
            });
            selectedClass = c;
            div.style.background = 'var(--red)';
            div.style.color = 'white';
            div.style.borderColor = 'var(--red-dark)';
            
            // Determine Source (Prefer XPHB, then PHB)
            const sources = allClasses.filter(cls => cls.name === c).map(cls => cls.source);
            if (sources.length === 0) {
                const featureSources = new Set(allClassFeatures.filter(f => f.className === c).map(f => f.source));
                sources.push(...featureSources);
            }
            if (sources.includes('XPHB')) currentClassSource = 'XPHB';
            else if (sources.includes('PHB')) currentClassSource = 'PHB';
            else currentClassSource = sources[0] || 'PHB';

            // Reset Level/Subclass on class change
            selectedLevel = 1;
            levelSelect.value = 1;
            selectedSubclass = null;
            selectedSubclassSource = null;
            selectedOptionalFeatures.clear();
            selectedSpells.clear();
            updateSubclassOptions(c);
            updateUIState();
            renderClassPreview();
            renderCoreTraits();
            renderClassTable();
            renderClassFeatures();
        };
        
        classList.appendChild(div);
    });

    // Level Change
    levelSelect.addEventListener('change', () => {
        selectedLevel = parseInt(levelSelect.value);
        updateUIState();
        renderClassFeatures();
    });

    function updateSubclassOptions(className) {
        const subclassList = document.getElementById('creator-subclass-list');
        subclassList.innerHTML = '';
        const available = allSubclasses.filter(s => s.className === className);
        
        // Deduplicate preferring XPHB
        const uniqueMap = new Map();
        available.forEach(s => {
            if (!uniqueMap.has(s.name)) {
                uniqueMap.set(s.name, s);
            } else {
                const existing = uniqueMap.get(s.name);
                if (s.source === 'XPHB') {
                    uniqueMap.set(s.name, s);
                } else if (s.source === 'PHB' && existing.source !== 'XPHB') {
                    uniqueMap.set(s.name, s);
                }
            }
        });
        const unique = Array.from(uniqueMap.values()).sort((a,b) => a.name.localeCompare(b.name));

        unique.forEach(s => {
            const div = document.createElement('div');
            div.className = 'checklist-item';
            div.textContent = s.name;
            div.style.justifyContent = 'center';
            div.onclick = () => {
                document.querySelectorAll('#creator-subclass-list .checklist-item').forEach(item => {
                    item.style.background = 'white';
                    item.style.color = 'var(--ink)';
                });
                div.style.background = 'var(--red)';
                div.style.color = 'white';
                selectedSubclass = s.shortName;
                selectedSubclassSource = s.source;
                renderClassFeatures();
            };
            subclassList.appendChild(div);
        });
    }

    function updateUIState() {
        const step2 = document.getElementById('step-2-section');
        const subContainer = document.getElementById('subclass-container');
        
        if (selectedClass) {
            step2.style.display = 'block';
        } else {
            step2.style.display = 'none';
        }

        if (selectedLevel >= 3) {
            subContainer.style.display = 'block';
        } else {
            subContainer.style.display = 'none';
            selectedSubclass = null; // Reset subclass if level drops below 3
        }
    }

    // Next Step Handler
    const nextBtn = document.getElementById('next-step-btn');
    nextBtn.addEventListener('click', () => {
        if (!selectedClass) {
            alert("Please select a class.");
            return;
        }

        const step3 = document.getElementById('step-3-section');
        const step4 = document.getElementById('step-4-review');

        if (step3.style.display === 'none') {
            step3.style.display = 'block';
            renderBackgroundOptions();
            renderSpeciesSection();
            renderAbilityScoreSection();
            step3.scrollIntoView({ behavior: 'smooth' });
            nextBtn.textContent = "Review & Finish";
        } else if (!step4) {
            renderReviewSection();
            nextBtn.style.display = 'none'; // Hide next button, replaced by Create
        }
        // Future steps will go here
    });

    function renderClassFeatures() {
        if (!selectedClass) return;
        const className = selectedClass;
        const container = document.getElementById('creator-class-features');
        container.innerHTML = '';
        
        if (allClassFeatures.length === 0) {
            container.innerHTML = '<div style="color:var(--red);">No class data found. Please upload data in the main sheet.</div>';
            return;
        }

        let features = allClassFeatures.filter(f => 
            f.className === className && 
            f.source === currentClassSource &&
            !f.subclassShortName && 
            f.level <= selectedLevel
        );

        if (selectedSubclass) {
            const subFeatures = allSubclassFeatures.filter(f => 
                f.className === className && 
                f.subclassShortName === selectedSubclass && 
                f.source === selectedSubclassSource &&
                f.level <= selectedLevel
            ).map(f => ({...f, isSubclassFeature: true}));
            features = [...features, ...subFeatures];
        }

        features.sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));

        // Deduplicate by name/level
        const uniqueFeatures = [];
        const seen = new Set();
        features.forEach(f => {
            const key = `${f.name}-${f.level}`;
            if (!seen.has(key)) { seen.add(key); uniqueFeatures.push(f); }
        });

        if (uniqueFeatures.length === 0) {
            container.innerHTML = '<div>No features found for this class.</div>';
            return;
        }

        uniqueFeatures.forEach(f => {
            const div = document.createElement('div');
            div.style.marginBottom = '10px';
            div.style.borderBottom = '1px dashed var(--gold)';
            div.style.paddingBottom = '5px';

            if (f.isSubclassFeature) {
                div.style.backgroundColor = "rgba(212, 165, 116, 0.2)";
                div.style.padding = "5px";
                div.style.borderRadius = "4px";
                div.style.borderLeft = "3px solid var(--gold-dark)";
            }
            
            let desc = processEntries(f.entries);
            desc = desc.replace(/\{@\w+\s*([^}]+)?\}/g, (match, content) => content ? content.split('|')[0] : "");
            
            const subLabel = f.isSubclassFeature ? `<span style="font-size:0.75rem; color:var(--ink-light); font-style:italic; margin-left:4px;">(Subclass)</span>` : "";
            div.innerHTML = `<div><span style="font-weight:bold; color:var(--red-dark); margin-right:5px;">Lvl ${f.level}</span> <span style="font-weight:bold;">${f.name}</span>${subLabel}</div><div style="font-size:0.85rem; color:var(--ink-light); margin-top:2px;">${desc}</div>`;
            
            // Append Spells if this feature grants them
            if (f.name.includes("Spellcasting") || f.name === "Pact Magic") {
                renderSpellsForFeature(div, selectedClass, selectedLevel, selectedSubclass);
            } else if (f.name.includes("Mystic Arcanum")) {
                // Extract level for Mystic Arcanum (e.g. "Mystic Arcanum (6th level)")
                const match = f.name.match(/(\d+)(?:st|nd|rd|th)\s+level/i);
                if (match) {
                    renderSpellsForFeature(div, selectedClass, selectedLevel, selectedSubclass, parseInt(match[1]));
                }
            } else if (f.name.includes("Eldritch Invocations")) {
                renderOptionalFeatures(div, ["EI"], selectedClass, f.level, selectedSubclass);
            } else if (f.name.includes("Fighting Style")) {
                const codes = ["FS"];
                if (selectedClass === "Fighter") codes.push("FS:F");
                if (selectedClass === "Ranger") codes.push("FS:R");
                if (selectedClass === "Paladin") codes.push("FS:P");
                if (selectedClass === "Bard") codes.push("FS:B");
                renderOptionalFeatures(div, codes, selectedClass, f.level, selectedSubclass);
            } else if (f.name === "Metamagic") {
                if (f.level <= 3) {
                    let limit = 2;
                    if (selectedLevel >= 10) limit = 4;
                    if (selectedLevel >= 17) limit = 6;
                    renderOptionalFeatures(div, ["MM"], selectedClass, f.level, selectedSubclass, limit);
                }
            } else if (f.name === "Weapon Mastery") {
                renderWeaponMasteryChoices(div, f, selectedClass, f.level);
            } else if (f.name === "Ability Score Improvement") {
                renderFeatSelection(div, f, selectedClass, f.level);
                
                // Render selected feat description if any
                const selectionKey = `ASI Level ${f.level}`;
                let selectedFeatName = null;
                for (const item of selectedOptionalFeatures) {
                    if (item.startsWith(selectionKey + ":")) {
                        selectedFeatName = item.substring(selectionKey.length + 2);
                        break;
                    }
                }

                if (selectedFeatName) {
                    const candidates = allFeats.filter(ft => ft.name === selectedFeatName);
                    let feat = candidates.find(ft => ft.source === 'XPHB') || candidates.find(ft => ft.source === 'PHB') || candidates[0];
                    if (feat) {
                        const featDiv = document.createElement('div');
                        featDiv.style.marginTop = "10px";
                        featDiv.style.padding = "10px";
                        featDiv.style.backgroundColor = "rgba(255, 255, 255, 0.7)";
                        featDiv.style.border = "1px solid var(--gold)";
                        featDiv.style.borderRadius = "4px";
                        
                        let featDesc = processEntries(feat.entries);
                        featDesc = featDesc.replace(/\{@\w+\s*([^}]+)?\}/g, (match, content) => content ? content.split('|')[0] : "");

                        featDiv.innerHTML = `
                            <div style="font-weight:bold; color:var(--red-dark); border-bottom:1px solid var(--gold-dark); padding-bottom:4px; margin-bottom:6px;">Feat: ${feat.name}</div>
                            <div style="font-size:0.85rem; color:var(--ink); line-height:1.4;">${featDesc}</div>
                        `;
                        div.appendChild(featDiv);
                    }
                }
            } else if (f.name === "Epic Boon") {
                const selectionKey = `ASI Level ${f.level}`;
                let selectedFeatName = null;
                for (const item of selectedOptionalFeatures) {
                    if (item.startsWith(selectionKey + ":")) {
                        selectedFeatName = item.substring(selectionKey.length + 2);
                        break;
                    }
                }

                if (selectedFeatName) {
                    div.innerHTML = `<div><span style="font-weight:bold; color:var(--red-dark); margin-right:5px;">Lvl ${f.level}</span> <span style="font-weight:bold;">${f.name}</span>${subLabel}</div>`;
                }

                renderFeatSelection(div, f, selectedClass, f.level);

                if (selectedFeatName) {
                    const candidates = allFeats.filter(ft => ft.name === selectedFeatName);
                    let feat = candidates.find(ft => ft.source === 'XPHB') || candidates.find(ft => ft.source === 'PHB') || candidates[0];
                    if (feat) {
                        const featDiv = document.createElement('div');
                        featDiv.style.marginTop = "10px";
                        featDiv.style.padding = "10px";
                        featDiv.style.backgroundColor = "rgba(255, 255, 255, 0.7)";
                        featDiv.style.border = "1px solid var(--gold)";
                        featDiv.style.borderRadius = "4px";
                        
                        let featDesc = processEntries(feat.entries);
                        featDesc = featDesc.replace(/\{@\w+\s*([^}]+)?\}/g, (match, content) => content ? content.split('|')[0] : "");

                        featDiv.innerHTML = `
                            <div style="font-weight:bold; color:var(--red-dark); border-bottom:1px solid var(--gold-dark); padding-bottom:4px; margin-bottom:6px;">Feat: ${feat.name}</div>
                            <div style="font-size:0.85rem; color:var(--ink); line-height:1.4;">${featDesc}</div>
                        `;
                        div.appendChild(featDiv);
                    }
                }
            } else if (f.name === "Primal Knowledge") {
                const clsObj = allClasses.find(c => c.name === selectedClass && c.source === currentClassSource);
                if (clsObj && clsObj.startingProficiencies && clsObj.startingProficiencies.skills) {
                    const s = clsObj.startingProficiencies.skills;
                    let skillOptions = [];
                    if (Array.isArray(s)) {
                        s.forEach(sk => {
                            if (sk.choose && sk.choose.from) {
                                skillOptions = sk.choose.from;
                            }
                        });
                    }
                    
                    if (skillOptions.length > 0) {
                        const pkDiv = document.createElement('div');
                        pkDiv.style.marginTop = "10px";
                        pkDiv.style.padding = "10px";
                        pkDiv.style.background = "rgba(255,255,255,0.5)";
                        pkDiv.style.border = "1px solid var(--gold)";
                        pkDiv.style.borderRadius = "4px";
                        
                        pkDiv.innerHTML = `<strong>Primal Knowledge:</strong> Choose one additional skill proficiency from the Barbarian list.`;
                        
                        const select = document.createElement('select');
                        select.className = 'styled-select';
                        select.style.width = '100%';
                        select.style.marginTop = '5px';
                        
                        const cap = str => str.charAt(0).toUpperCase() + str.slice(1);
                        
                        const populateOptions = () => {
                            const coreSelects = document.querySelectorAll('.skill-select-dropdown');
                            const coreValues = new Set(Array.from(coreSelects).map(s => s.value));
                            const currentVal = select.value;
                            
                            let html = `<option value="" disabled ${!currentVal ? 'selected' : ''}>Select Skill</option>`;
                            skillOptions.forEach(opt => {
                                const label = cap(opt);
                                if (!coreValues.has(label)) {
                                    html += `<option value="${opt}" ${opt === currentVal ? 'selected' : ''}>${label}</option>`;
                                }
                            });
                            select.innerHTML = html;
                        };

                        populateOptions();
                        select.addEventListener('focus', populateOptions);

                        select.addEventListener('change', () => {
                            Array.from(selectedOptionalFeatures).forEach(feat => { if (feat.startsWith("Primal Knowledge Skill:")) selectedOptionalFeatures.delete(feat); });
                            if (select.value) selectedOptionalFeatures.add(`Primal Knowledge Skill: ${select.value}`);
                        });
                        Array.from(selectedOptionalFeatures).forEach(feat => { if (feat.startsWith("Primal Knowledge Skill:")) select.value = feat.replace("Primal Knowledge Skill: ", ""); });

                        pkDiv.appendChild(select);
                        div.appendChild(pkDiv);
                    }
                }
            }

            // Check for Feats in entries and render them
            // Skip for ASI feature as we handle it dynamically
            if (f.name !== "Ability Score Improvement") {
            const featsInFeature = new Set();
            const scanForFeats = (obj) => {
                if (!obj) return;
                if (typeof obj === 'string') {
                    const matches = obj.matchAll(/{@feat ([^}|]+)/g);
                    for (const m of matches) featsInFeature.add(m[1].toLowerCase().trim());
                } else if (Array.isArray(obj)) {
                    obj.forEach(scanForFeats);
                } else if (typeof obj === 'object') {
                    Object.values(obj).forEach(scanForFeats);
                }
            };
            scanForFeats(f.entries);

            if (featsInFeature.size > 0) {
                featsInFeature.forEach(featName => {
                    const candidates = allFeats.filter(ft => ft.name.toLowerCase() === featName);
                    let feat = candidates.find(ft => ft.source === 'XPHB');
                    if (!feat) feat = candidates.find(ft => ft.source === 'PHB');
                    if (!feat) feat = candidates[0];

                    if (feat) {
                        const featDiv = document.createElement('div');
                        featDiv.style.marginTop = "10px";
                        featDiv.style.padding = "10px";
                        featDiv.style.backgroundColor = "rgba(255, 255, 255, 0.7)";
                        featDiv.style.border = "1px solid var(--gold)";
                        featDiv.style.borderRadius = "4px";
                        
                        let featDesc = processEntries(feat.entries);
                        featDesc = featDesc.replace(/\{@\w+\s*([^}]+)?\}/g, (match, content) => content ? content.split('|')[0] : "");

                        featDiv.innerHTML = `
                            <div style="font-weight:bold; color:var(--red-dark); border-bottom:1px solid var(--gold-dark); padding-bottom:4px; margin-bottom:6px;">Feat: ${feat.name}</div>
                            <div style="font-size:0.85rem; color:var(--ink); line-height:1.4;">${featDesc}</div>
                        `;
                        div.appendChild(featDiv);
                    }
                });
            }
            }

            container.appendChild(div);
        });
        renderGrantedSpells();
    }

    function renderClassPreview() {
        if (!selectedClass) return;
        const className = selectedClass;
        const container = document.getElementById('creator-class-preview');
        container.innerHTML = '';

        // Show all base class features 1-20
        let features = allClassFeatures.filter(f => 
            f.className === className && 
            f.source === currentClassSource &&
            !f.subclassShortName
        ).sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));

        const uniqueFeatures = [];
        const seen = new Set();
        features.forEach(f => {
            const key = `${f.name}-${f.level}`;
            if (!seen.has(key)) { seen.add(key); uniqueFeatures.push(f); }
        });

        if (uniqueFeatures.length === 0) {
            container.innerHTML = '<div>No features found.</div>';
            return;
        }

        uniqueFeatures.forEach(f => {
            const div = document.createElement('div');
            div.style.marginBottom = '8px';
            div.style.borderBottom = '1px dashed var(--gold)';
            div.style.paddingBottom = '4px';
            div.style.cursor = 'pointer';
            
            let desc = processEntries(f.entries);
            desc = desc.replace(/\{@\w+\s*([^}]+)?\}/g, (match, content) => content ? content.split('|')[0] : "");

            const uniqueId = `preview-${f.name.replace(/[^a-zA-Z0-9]/g, '')}-${f.level}-${Math.random().toString(36).substr(2, 5)}`;

            div.innerHTML = `
                <div style="display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <span style="font-weight:bold; color:var(--red-dark); margin-right:5px;">Lvl ${f.level}</span> 
                        <span style="font-weight:bold;">${f.name}</span>
                    </div>
                    <span class="toggle-icon" style="font-size:0.8rem; color:var(--ink-light);">▼</span>
                </div>
                <div id="${uniqueId}" style="display:none; margin-top:8px; font-size:0.9rem; color:var(--ink); line-height:1.4; padding: 8px; background: rgba(255,255,255,0.5); border-radius: 4px;">
                    ${desc || "No description available."}
                </div>
            `;

            div.onclick = (e) => {
                const content = document.getElementById(uniqueId);
                const icon = div.querySelector('.toggle-icon');
                if (content.style.display === 'none') {
                    content.style.display = 'block';
                    icon.textContent = '▲';
                    icon.style.color = 'var(--red)';
                } else {
                    content.style.display = 'none';
                    icon.textContent = '▼';
                    icon.style.color = 'var(--ink-light)';
                }
            };

            container.appendChild(div);
        });
    }

    function renderCoreTraits() {
        let container = document.getElementById('creator-class-table');

        // Fix: Remove wrapping .field container if it exists (removes "Class Table" label)
        if (container && container.parentElement && container.parentElement.classList.contains('field')) {
            const parent = container.parentElement;
            parent.parentNode.insertBefore(container, parent);
            parent.remove();
        }

        let isFallback = false;
        if (!container) {
            container = document.getElementById('creator-class-preview');
            isFallback = true;
        }
        if (!container || !selectedClass) return;
        if (!isFallback) container.innerHTML = '';

        const clsObj = allClasses.find(c => c.name === selectedClass && c.source === currentClassSource);
        if (!clsObj) return;

        const makeRow = (label, value) => {
            if (!value) return "";
            return `<div style="margin-bottom:4px;"><strong>${label}:</strong> ${value}</div>`;
        };
        
        const capitalize = (s) => {
            if (typeof s !== 'string') return s;
            return s.charAt(0).toUpperCase() + s.slice(1);
        };

        let html = `<div style="padding: 10px;">`;
        html += `<h3 style="margin-top:0; color:var(--red-dark); border-bottom:1px solid var(--gold); padding-bottom:5px; font-family:'Cinzel',serif;">Core Traits</h3>`;
        html += `<div style="font-size: 0.9rem; line-height: 1.6; color:var(--ink);">`;

        // Primary Ability
        if (clsObj.primaryAbility) {
             const map = { str: 'Strength', dex: 'Dexterity', con: 'Constitution', int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma' };
             const parseAbility = (obj) => {
                 const opts = [];
                 Object.keys(obj).forEach(k => { if (map[k]) opts.push(map[k]); });
                 return opts.join(' or ');
             };
             const abilities = [];
             if (Array.isArray(clsObj.primaryAbility)) {
                 clsObj.primaryAbility.forEach(entry => abilities.push(parseAbility(entry)));
             } else if (typeof clsObj.primaryAbility === 'object') {
                 abilities.push(parseAbility(clsObj.primaryAbility));
             }
             if (abilities.length) html += makeRow("Primary Ability", abilities.join('; '));
        }

        // Hit Points
        if (clsObj.hd) {
            const faces = clsObj.hd.faces || clsObj.hd;
            html += makeRow("Hit Point Die", `D${faces} per ${selectedClass} level`);
            html += makeRow("Hit Points at Level 1", `${faces} + Con. modifier`);
            html += makeRow("Hit Points per Level", `D${faces} (or ${Math.floor(faces/2)+1}) + Con. modifier`);
        }

        // Saves
        if (clsObj.proficiency) {
            const saves = clsObj.proficiency.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(', ');
            html += makeRow("Saving Throws", saves);
        }

        // Tools
        if (clsObj.startingProficiencies && clsObj.startingProficiencies.tools) {
            const tools = clsObj.startingProficiencies.tools.map(t => {
                const text = typeof t === 'string' ? t : (t.name || "");
                return capitalize(text.replace(/\{@\w+\s*([^}]+)?\}/g, (m, c) => c ? c.split('|')[0] : ""));
            }).filter(t => t).join(', ');
            html += makeRow("Tool Proficiencies", tools);
        }

        // Skills
        let skillDropdownIndex = 0;
        if (clsObj.startingProficiencies && clsObj.startingProficiencies.skills) {
            const s = clsObj.startingProficiencies.skills;
            if (Array.isArray(s)) {
                s.forEach(sk => {
                    if (sk.choose) {
                        const count = sk.choose.count || 1;
                        const options = sk.choose.from.map(o => capitalize(o));
                        html += makeRow("Skill Proficiencies", `Choose ${count}: ${options.join(', ')}`);
                        
                        html += `<div style="margin-bottom:8px; display:flex; gap:8px; flex-wrap:wrap;">`;
                        for(let i=0; i<count; i++) {
                            html += `<select class="styled-select skill-select-dropdown" id="core-skill-${skillDropdownIndex++}" style="font-size:0.9rem; padding:2px 4px;">`;
                            html += `<option value="" disabled selected>Select Skill</option>`;
                            options.forEach(opt => {
                                html += `<option value="${opt}">${opt}</option>`;
                            });
                            html += `</select>`;
                        }
                        html += `</div>`;
                    }
                });
            }
        }

        // Weapons & Armor
        if (clsObj.startingProficiencies) {
            if (clsObj.startingProficiencies.weapons) {
                const weapons = clsObj.startingProficiencies.weapons.map(w => {
                    const text = typeof w === 'string' ? w : (w.proficiency || "");
                    return capitalize(text.replace(/\{@\w+\s*([^}]+)?\}/g, (m, c) => c ? c.split('|')[0] : ""));
                }).filter(w => w).join(', ');
                html += makeRow("Weapon Proficiencies", weapons);
            }
            if (clsObj.startingProficiencies.armor) {
                const armor = clsObj.startingProficiencies.armor.map(a => {
                    const text = typeof a === 'string' ? a : (a.proficiency || "");
                    return capitalize(text.replace(/\{@\w+\s*([^}]+)?\}/g, (m, c) => c ? c.split('|')[0] : ""));
                }).filter(a => a).join(', ');
                html += makeRow("Armor Training", armor);
            }
        }

        // Starting Equipment
        if (clsObj.startingEquipment) {
             let equipItems = [];
             if (clsObj.startingEquipment.default) {
                 equipItems = clsObj.startingEquipment.default;
             } else if (clsObj.startingEquipment.entries) {
                 equipItems = clsObj.startingEquipment.entries;
             }

             // Clean tags
             const clean = (str) => str.replace(/\{@\w+\s*([^}]+)?\}/g, (m, c) => c ? c.split('|')[0] : "");
             
             // Check for A/B split
             const fullText = equipItems.join(' ');
             const splitRegex = /(?:choose|option).*?\(a\)\s*(.*?)(?:;?\s*(?:or|and)?\s*\(b\)\s*)(.*)/i;
             const match = fullText.match(splitRegex);
             
             html += `<div style="margin-bottom:15px;">`;
             html += `<h4 style="margin:10px 0 8px 0; color:var(--red-dark); font-family:'Cinzel',serif;">Starting Equipment</h4>`;
             html += `<div class="equip-selection-container" style="display:flex; gap:15px; flex-wrap:wrap;">`;
             
             if (match) {
                 const optA = clean(match[1]);
                 const optB = clean(match[2]);

                 // Option A
                 html += `
                 <label class="equip-option-box selected" style="flex:1; min-width:250px; border:2px solid var(--red); background:var(--parchment); padding:15px; border-radius:6px; cursor:pointer; transition:all 0.2s; position:relative; display:flex; flex-direction:column;">
                    <input type="radio" name="class_equip_choice" value="equipment_a" checked style="display:none;" onchange="window.updateEquipSelection(this)">
                    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--gold); padding-bottom:8px; margin-bottom:8px;">
                        <span style="font-weight:bold; color:var(--red-dark); font-size:1.05rem;">Option A</span>
                        <span class="check-indicator" style="color:var(--red); font-weight:bold; font-size:1.2rem;">✓</span>
                    </div>
                    <div style="font-size:0.9rem; color:var(--ink); line-height:1.4; flex-grow:1;">${optA}</div>
                    <input type="hidden" id="equip-opt-a-val" value="${optA.replace(/"/g, '&quot;')}">
                 </label>`;

                 // Option B
                 html += `
                 <label class="equip-option-box" style="flex:1; min-width:250px; border:1px solid var(--gold); background:white; padding:15px; border-radius:6px; cursor:pointer; transition:all 0.2s; position:relative; display:flex; flex-direction:column;">
                    <input type="radio" name="class_equip_choice" value="equipment_b" style="display:none;" onchange="window.updateEquipSelection(this)">
                    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--gold); padding-bottom:8px; margin-bottom:8px;">
                        <span style="font-weight:bold; color:var(--red-dark); font-size:1.05rem;">Option B</span>
                        <span class="check-indicator" style="display:none; color:var(--red); font-weight:bold; font-size:1.2rem;">✓</span>
                    </div>
                    <div style="font-size:0.9rem; color:var(--ink); line-height:1.4; flex-grow:1;">${optB}</div>
                    <input type="hidden" id="equip-opt-b-val" value="${optB.replace(/"/g, '&quot;')}">
                 </label>`;
             } else {
                 let equipListHtml = "";
                 if (equipItems.length > 0) {
                     equipListHtml = "<ul style='padding-left:20px; margin:5px 0;'>";
                     equipItems.forEach(item => {
                         equipListHtml += `<li style="margin-bottom:2px;">${clean(item)}</li>`;
                     });
                     equipListHtml += "</ul>";
                 } else {
                     equipListHtml = "See class description.";
                 }

                 html += `
                 <label class="equip-option-box selected" style="flex:1; min-width:250px; border:2px solid var(--red); background:var(--parchment); padding:15px; border-radius:6px; cursor:pointer; transition:all 0.2s; position:relative; display:flex; flex-direction:column;">
                    <input type="radio" name="class_equip_choice" value="equipment" checked style="display:none;" onchange="window.updateEquipSelection(this)">
                    <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--gold); padding-bottom:8px; margin-bottom:8px;">
                        <span style="font-weight:bold; color:var(--red-dark); font-size:1.05rem;">Standard Equipment</span>
                        <span class="check-indicator" style="color:var(--red); font-weight:bold; font-size:1.2rem;">✓</span>
                    </div>
                    <div style="font-size:0.9rem; color:var(--ink); line-height:1.4; flex-grow:1;">${equipListHtml}</div>
                 </label>`;
             }

             
             html += `</div></div>`;
        }

        // Multiclassing
        if (clsObj.multiclassing && clsObj.multiclassing.requirements) {
            const reqs = [];
            const map = { str: 'Strength', dex: 'Dexterity', con: 'Constitution', int: 'Intelligence', wis: 'Wisdom', cha: 'Charisma' };
            Object.entries(clsObj.multiclassing.requirements).forEach(([k, v]) => {
                if (map[k]) reqs.push(`${map[k]} ${v}`);
            });
            if (reqs.length) html += makeRow("Multiclassing Requirement", reqs.join(', '));
        }

        html += `</div></div>`;
        
        if (isFallback) {
            const wrapper = document.createElement('div');
            wrapper.innerHTML = html;
            container.appendChild(wrapper);
        } else {
            container.innerHTML = html;
        }

        // Add event listeners to prevent duplicate skill selection
        const skillSelects = container.querySelectorAll('.skill-select-dropdown');
        if (skillSelects.length > 0) {
            const updateSkillOptions = () => {
                const selectedValues = Array.from(skillSelects).map(s => s.value).filter(v => v);
                skillSelects.forEach(select => {
                    const currentVal = select.value;
                    Array.from(select.options).forEach(opt => {
                        if (!opt.value) return;
                        // Disable if selected in another dropdown
                        if (selectedValues.includes(opt.value) && opt.value !== currentVal) {
                            opt.disabled = true;
                        } else {
                            opt.disabled = false;
                        }
                    });
                });
            };
            skillSelects.forEach(s => s.addEventListener('change', updateSkillOptions));
        }
    }

    function renderClassTable() {
        let container = document.getElementById('creator-class-table-dynamic');
        if (!container) {
            const step2 = document.getElementById('step-2-section');
            if (step2 && step2.parentNode) {
                container = document.createElement('div');
                container.id = 'creator-class-table-dynamic';
                container.style.marginTop = "20px";
                container.style.marginBottom = "20px";
                step2.parentNode.insertBefore(container, step2);
            } else {
                container = document.getElementById('creator-class-preview');
            }
        }
        if (!container || !selectedClass) return;
        container.innerHTML = '';
        
        const clsObj = allClasses.find(c => c.name === selectedClass && c.source === currentClassSource);
        if (!clsObj) {
            // container.innerHTML = '<div style="padding:10px;">Class data not found.</div>';
            return;
        }

        const table = document.createElement('table');
        table.className = 'currency-table';
        table.style.fontSize = '0.8rem';
        table.style.width = '100%';
        
        // Build Header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        
        ['Lvl', 'PB', 'Features'].forEach(h => {
            const th = document.createElement('th');
            th.textContent = h;
            headerRow.appendChild(th);
        });

        if (clsObj.classTableGroups) {
            clsObj.classTableGroups.forEach(group => {
                if (group.colLabels) {
                    group.colLabels.forEach(label => {
                        const th = document.createElement('th');
                        th.innerHTML = label.replace(/\{@\w+\s*([^}]+)?\}/g, (m, c) => c ? c.split('|')[0] : "");
                        headerRow.appendChild(th);
                    });
                }
            });
        }
        
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Build Body
        const tbody = document.createElement('tbody');
        for (let i = 1; i <= 20; i++) {
            const tr = document.createElement('tr');
            if (i % 2 === 0) tr.style.backgroundColor = "var(--parchment-dark)";
            
            const tdLvl = document.createElement('td'); tdLvl.textContent = i; tr.appendChild(tdLvl);
            const tdPB = document.createElement('td'); tdPB.textContent = `+${Math.ceil(i / 4) + 1}`; tr.appendChild(tdPB);
            
            const tdFeats = document.createElement('td');
            const feats = [...new Set(allClassFeatures.filter(f => f.className === selectedClass && f.source === currentClassSource && !f.subclassShortName && f.level === i).map(f => f.name))].join(', ');
            tdFeats.textContent = feats || "-";
            tdFeats.style.textAlign = "left";
            tr.appendChild(tdFeats);
            
            if (clsObj.classTableGroups) {
                clsObj.classTableGroups.forEach(group => {
                    const rows = group.rows || group.rowsSpellProgression;
                    if (rows && rows[i-1]) {
                        rows[i-1].forEach(cellVal => {
                            const td = document.createElement('td');
                            let val = cellVal;
                            if (typeof cellVal === 'object' && cellVal !== null) {
                                if (cellVal.type === 'dice' && cellVal.toRoll) val = cellVal.toRoll.map(r => `${r.number || 1}d${r.faces}`).join('+');
                                else if (cellVal.value !== undefined) val = cellVal.value;
                            }
                            if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
                            if (val === null || val === undefined || val === "" || val === 0) val = "-";
                            td.innerHTML = val.toString().replace(/\{@\w+\s*([^}]+)?\}/g, (m, c) => c ? c.split('|')[0] : "");
                            tr.appendChild(td);
                        });
                    }
                });
            }
            tbody.appendChild(tr);
        }
        table.appendChild(tbody);
        
        container.appendChild(table);
    }

    function renderSpellsForFeature(parentElement, className, charLevel, subclass, specificSpellLevel = null) {
        if (!className) return;

        // Use the passed className, not the global selectedClass
        const cls = className;

        // Determine Max Spell Level based on Class Type
        let maxSpellLevel = 0;
        const fullCasters = ["Bard", "Cleric", "Druid", "Sorcerer", "Wizard"];
        const halfCasters = ["Paladin", "Ranger", "Artificer"];
        
        if (fullCasters.includes(cls)) {
            maxSpellLevel = Math.ceil(charLevel / 2);
        } else if (cls === "Warlock") {
            // Warlock Slot Level Progression
            if (charLevel >= 9) maxSpellLevel = 5;
            else if (charLevel >= 7) maxSpellLevel = 4;
            else if (charLevel >= 5) maxSpellLevel = 3;
            else if (charLevel >= 3) maxSpellLevel = 2;
            else maxSpellLevel = 1;
        } else if (halfCasters.includes(cls)) {
            if (cls === "Artificer") {
                maxSpellLevel = Math.ceil(charLevel / 2);
            } else {
                // Paladin/Ranger Progression
                if (charLevel >= 17) maxSpellLevel = 5;
                else if (charLevel >= 13) maxSpellLevel = 4;
                else if (charLevel >= 9) maxSpellLevel = 3;
                else if (charLevel >= 5) maxSpellLevel = 2;
                else if (charLevel >= 2) maxSpellLevel = 1;
                else maxSpellLevel = 0;
            }
        } else if (["Fighter", "Rogue"].includes(cls)) {
            // 1/3 Casters (Eldritch Knight / Arcane Trickster)
            if (charLevel >= 19) maxSpellLevel = 4;
            else if (charLevel >= 13) maxSpellLevel = 3;
            else if (charLevel >= 7) maxSpellLevel = 2;
            else if (charLevel >= 3) maxSpellLevel = 1;
            else maxSpellLevel = 0;
        }

        // Filter Spells
        let availableSpells = allSpells.filter(s => {
            if (specificSpellLevel !== null) {
                if (s.level !== specificSpellLevel) return false;
            } else {
                if (s.level > maxSpellLevel) return false;
            }
            
            let matchesClass = false;
            const targetClass = cls.toLowerCase();

            // Helper to check a class entry safely
            const check = (c) => {
                if (!c) return false;
                const cName = (typeof c === 'string' ? c : c.name).toLowerCase();
                return cName === targetClass;
            };

            // Check Class List
            if (s.classes) {
                if (s.classes.fromClassList && s.classes.fromClassList.some(check)) matchesClass = true;
                else if (s.classes.fromClassListVariant && s.classes.fromClassListVariant.some(check)) matchesClass = true;
                else if (Array.isArray(s.classes) && s.classes.some(check)) matchesClass = true;
            }

            // Check Subclass
            if (!matchesClass && subclass && s.classes && s.classes.fromSubclass) {
                if (s.classes.fromSubclass.some(sc => {
                    return sc.class && sc.class.name.toLowerCase() === targetClass && 
                           sc.subclass && sc.subclass.shortName.toLowerCase() === subclass.toLowerCase();
                })) {
                    matchesClass = true;
                }
            }

            return matchesClass;
        });

        // Deduplicate (Prefer XPHB)
        const spellMap = new Map();
        availableSpells.forEach(s => {
            if (!spellMap.has(s.name)) {
                spellMap.set(s.name, s);
            } else {
                const existing = spellMap.get(s.name);
                if (s.source === 'XPHB') {
                    spellMap.set(s.name, s);
                } else if (s.source === 'PHB' && existing.source !== 'XPHB') {
                    spellMap.set(s.name, s);
                }
            }
        });
        availableSpells = Array.from(spellMap.values()).sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));

        // Helper to get limits from class table
        const getLimit = (regex) => {
            const clsObj = allClasses.find(c => c.name === className && c.source === currentClassSource);
            if (!clsObj || !clsObj.classTableGroups) return Infinity;
            for (const group of clsObj.classTableGroups) {
                if (!group.colLabels) continue;
                const colIndex = group.colLabels.findIndex(l => {
                    const clean = l.replace(/\{@\w+\s*([^}]+)?\}/g, (m, c) => c ? c.split('|')[0] : "");
                    return regex.test(clean);
                });
                if (colIndex !== -1 && group.rows && group.rows[charLevel - 1]) {
                    let val = group.rows[charLevel - 1][colIndex];
                    if (typeof val === 'object' && val.value !== undefined) val = val.value;
                    if (val === "-" || val === "\u2014") return 0;
                    const parsed = parseInt(val);
                    return isNaN(parsed) ? Infinity : parsed;
                }
            }
            return Infinity;
        };

        let cantripLimit = getLimit(/Cantrips/i);
        let spellLimit = getLimit(/(?:Spells\s*(?:Known|Prepared)|Prepared\s*Spells)/i);

        // Special case for Wizard Level 1 (Starting Spellbook)
        if (className === 'Wizard' && charLevel === 1 && spellLimit === Infinity) {
            spellLimit = 6;
        }

        if (availableSpells.length === 0) {
            const msg = document.createElement('div');
            msg.style.fontSize = "0.8rem";
            msg.style.color = "var(--ink-light)";
            msg.style.fontStyle = "italic";
            msg.textContent = "No spells found in data for this class/level.";
            parentElement.appendChild(msg);
            return;
        }

        const container = document.createElement('div');
        container.style.marginTop = "10px";
        container.style.padding = "10px";
        container.style.background = "rgba(255,255,255,0.5)";
        container.style.border = "1px solid var(--gold)";
        container.style.borderRadius = "4px";
        container.style.maxHeight = "300px";
        container.style.overflowY = "auto";

        const title = document.createElement('div');
        title.textContent = specificSpellLevel !== null ? `Available Spells (Level ${specificSpellLevel})` : "Available Spells";
        title.style.fontWeight = "bold";
        title.style.fontSize = "0.85rem";
        title.style.marginBottom = "8px";
        title.style.color = "var(--ink)";
        title.style.borderBottom = "1px solid var(--gold-dark)";
        container.appendChild(title);
        
        // Group by Level
        const levels = {};
        availableSpells.forEach(s => {
            if (!levels[s.level]) levels[s.level] = [];
            levels[s.level].push(s);
        });

        Object.keys(levels).sort((a,b) => parseInt(a)-parseInt(b)).forEach(lvl => {
            const lvlHeader = document.createElement('div');
            lvlHeader.style.gridColumn = "1 / -1";
            lvlHeader.style.fontWeight = "bold";
            lvlHeader.style.color = "var(--red-dark)";
            lvlHeader.style.marginTop = "10px";
            lvlHeader.style.borderBottom = "1px solid var(--gold)";
            lvlHeader.textContent = lvl === "0" ? "Cantrips" : `Level ${lvl}`;
            container.appendChild(lvlHeader);

            const grid = document.createElement('div');
            grid.style.display = "grid";
            grid.style.gridTemplateColumns = "repeat(auto-fill, minmax(180px, 1fr))";
            grid.style.gap = "8px";
            grid.style.gridColumn = "1 / -1";

            levels[lvl].forEach(s => {
                const spellDiv = document.createElement('div');
                spellDiv.textContent = s.name;
                spellDiv.style.padding = "4px 8px"; 
                spellDiv.style.borderRadius = "4px";
                spellDiv.style.fontSize = "0.9rem";
                spellDiv.style.cursor = "pointer";
                spellDiv.style.userSelect = "none";

                const updateStyle = () => {
                    const isSelected = selectedSpells.has(s.name);
                    spellDiv.style.background = isSelected ? "var(--red)" : "var(--parchment-dark)";
                    spellDiv.style.color = isSelected ? "white" : "var(--ink)";
                    spellDiv.style.border = isSelected ? "1px solid var(--red-dark)" : "1px solid var(--gold-dark)";
                };
                updateStyle();

                spellDiv.onclick = () => {
                    if (selectedSpells.has(s.name)) selectedSpells.delete(s.name);
                    else {
                        // Check limits
                        const currentSelected = Array.from(selectedSpells).map(name => allSpells.find(sp => sp.name === name)).filter(Boolean);
                        
                        if (s.level === 0) {
                            const cantripCount = currentSelected.filter(sp => sp.level === 0).length;
                            if (cantripLimit !== Infinity && cantripCount >= cantripLimit) {
                                alert(`You can only select ${cantripLimit} cantrips.`);
                                return;
                            }
                        } else if (specificSpellLevel === null) {
                            // Only enforce table limit for general spellcasting (not specific feature grants like Mystic Arcanum)
                            // Count only spells within the max spell level (e.g. Warlock 1-5)
                            const relevantSpellCount = currentSelected.filter(sp => sp.level > 0 && sp.level <= maxSpellLevel).length;
                            if (spellLimit !== Infinity && relevantSpellCount >= spellLimit) {
                                alert(`You can only select ${spellLimit} spells.`);
                                return;
                            }
                        }
                        selectedSpells.add(s.name);
                    }
                    updateStyle();
                    renderGrantedSpells();
                };

                grid.appendChild(spellDiv);
            });
            container.appendChild(grid);
        });
        parentElement.appendChild(container);
    }

    function renderOptionalFeatures(parentElement, featureTypes, className, charLevel, subclass, limit = null) {
        if (!allOptionalFeatures.length) return;

        // 1. Filter by Feature Type & Group by Name
        const candidates = new Map();
        allOptionalFeatures.forEach(opt => {
            if (!opt.featureType || !opt.name) return;
            const types = Array.isArray(opt.featureType) ? opt.featureType : [opt.featureType];
            if (types.some(t => featureTypes.includes(t))) {
                if (!candidates.has(opt.name)) candidates.set(opt.name, []);
                candidates.get(opt.name).push(opt);
            }
        });

        // 2. Deduplicate (Select best source: XPHB > PHB > Others)
        const uniqueOptions = [];
        candidates.forEach((opts) => {
            let selected = opts.find(o => o.source === 'XPHB');
            if (!selected) selected = opts.find(o => o.source === 'PHB');
            if (!selected) selected = opts[0];
            uniqueOptions.push(selected);
        });

        // 3. Filter by Prerequisites (Level)
        const cLvl = parseInt(charLevel);
        const available = uniqueOptions.filter(opt => {
            if (opt.prerequisite) {
                // 5e-tools prerequisites: Top-level array is OR (any group met), Object keys are AND (all keys in group met)
                const meetsAnyPrereq = opt.prerequisite.some(req => {
                    if (req.level) {
                        let reqLvl = req.level;
                        if (typeof req.level === 'object') {
                            reqLvl = req.level.level;
                            // Check class restriction if present
                            if (req.level.class && req.level.class.name && className) {
                                if (req.level.class.name.toLowerCase() !== className.toLowerCase()) return false;
                            }
                        }
                        if (cLvl < reqLvl) return false;
                    }

                    // Pact Check
                    if (req.pact) {
                        const pactName = `Pact of the ${req.pact}`;
                        let hasPact = false;
                        for (const selected of selectedOptionalFeatures) {
                            if (selected.toLowerCase().includes(pactName.toLowerCase())) { hasPact = true; break; }
                        }
                        if (!hasPact) return false;
                    }

                    // Optional Feature Check
                    if (req.optionalfeature) {
                        const hasFeat = req.optionalfeature.some(f => {
                            const clean = f.split('|')[0].toLowerCase();
                            for (const selected of selectedOptionalFeatures) {
                                if (selected.toLowerCase().includes(clean)) return true;
                            }
                            return false;
                        });
                        if (!hasFeat) return false;
                    }

                    // Spell Check
                    if (req.spell) {
                        const hasSpell = req.spell.some(s => {
                            const sName = (typeof s === 'string' ? s : s.entry || "").split('|')[0].split('#')[0].toLowerCase();
                            for (const selected of selectedSpells) {
                                if (selected.toLowerCase() === sName) return true;
                            }
                            return false;
                        });
                        if (!hasSpell) return false;
                    }

                    return true;
                });

                if (!meetsAnyPrereq) {
                    // Debug log for filtered items
                    // console.log(`Filtered out ${opt.name} due to prereqs`, opt.prerequisite);
                    return false;
                }
                return true;
            }
            return true;
        }).sort((a, b) => a.name.localeCompare(b.name));

        console.log(`Optional Features for ${className} (Level ${charLevel}):`, available);

        if (available.length === 0) return;

        const container = document.createElement('div');
        container.style.marginTop = "10px";
        container.style.padding = "10px";
        container.style.background = "rgba(255,255,255,0.5)";
        container.style.border = "1px solid var(--gold)";
        container.style.borderRadius = "4px";
        container.style.maxHeight = "300px";
        container.style.overflowY = "auto";

        const title = document.createElement('div');
        title.textContent = "Available Options";
        title.style.fontWeight = "bold";
        title.style.fontSize = "0.85rem";
        title.style.marginBottom = "8px";
        title.style.color = "var(--ink)";
        title.style.borderBottom = "1px solid var(--gold-dark)";
        container.appendChild(title);

        const list = document.createElement('div');
        list.style.display = "flex";
        list.style.flexDirection = "column";
        list.style.gap = "4px";

        available.forEach(opt => {
            const div = document.createElement('div');
            div.className = 'checklist-item';
            div.style.padding = "4px 8px";
            div.style.fontSize = "0.9rem";
            div.style.cursor = "pointer";
            div.style.flexDirection = "column";
            div.style.alignItems = "flex-start";
            
            let prereqText = "";
            if (opt.prerequisite) {
                const groupTexts = opt.prerequisite.map(req => {
                    const groupReqs = [];
                    
                    // Level
                    if (req.level) {
                        if (typeof req.level === 'object') {
                            let lvlStr = `Lvl ${req.level.level}`;
                            if (req.level.class && req.level.class.name) lvlStr += ` ${req.level.class.name}`;
                            groupReqs.push(lvlStr);
                        } else {
                            groupReqs.push(`Lvl ${req.level}`);
                        }
                    }
                    
                    // Pact
                    if (req.pact) groupReqs.push(`Pact: ${req.pact}`);
                    
                    // Spells
                    if (req.spell) {
                        req.spell.forEach(s => {
                            if (typeof s === 'string') groupReqs.push(`Spell: ${s.split('#')[0]}`);
                            else if (s.entry) groupReqs.push(s.entry);
                        });
                    }

                    // Features
                    if (req.optionalfeature) {
                        req.optionalfeature.forEach(f => groupReqs.push(`Feature: ${f.split('|')[0]}`));
                    }
                    
                    // Items
                    if (req.item) req.item.forEach(i => groupReqs.push(i));

                    // Other Summary
                    if (req.otherSummary) {
                        groupReqs.push(req.otherSummary.entrySummary || req.otherSummary.entry);
                    }
                    
                    return groupReqs.join(', ');
                }).filter(t => t);

                if (groupTexts.length) prereqText = ` <span style="color:var(--ink-light); font-size:0.8rem;">(Req: ${groupTexts.join(' OR ')})</span>`;
            }

            const titleDiv = document.createElement('div');
            titleDiv.style.fontWeight = 'bold';
            titleDiv.innerHTML = `${opt.name}${prereqText}`;
            div.appendChild(titleDiv);
            
            let desc = processEntries(opt.entries);
            desc = desc.replace(/\{@\w+\s*([^}]+)?\}/g, (match, content) => content ? content.split('|')[0] : "");
            
            const descDiv = document.createElement('div');
            descDiv.style.fontSize = "0.85rem";
            descDiv.style.color = "var(--ink-light)";
            descDiv.style.marginTop = "2px";
            descDiv.innerHTML = desc;
            div.appendChild(descDiv);

            if (selectedOptionalFeatures.has(opt.name)) {
                div.style.background = 'var(--red)';
                div.style.color = 'white';
                div.style.borderColor = 'var(--red-dark)';
                
                // Fix text colors for readability when selected
                descDiv.style.color = "rgba(255, 255, 255, 0.9)";
                const prereqSpan = titleDiv.querySelector('span');
                if (prereqSpan) prereqSpan.style.color = "rgba(255, 255, 255, 0.8)";
            }

            div.onclick = () => {
                if (selectedOptionalFeatures.has(opt.name)) selectedOptionalFeatures.delete(opt.name);
                else {
                    if (limit !== null) {
                        let currentCount = 0;
                        available.forEach(a => {
                            if (selectedOptionalFeatures.has(a.name)) currentCount++;
                        });
                        if (currentCount >= limit) {
                            alert(`You can only select ${limit} options.`);
                            return;
                        }
                    }
                    selectedOptionalFeatures.add(opt.name);
                }
                renderClassFeatures();
            };

            list.appendChild(div);
        });

        container.appendChild(list);
        parentElement.appendChild(container);
    }

    function renderWeaponMasteryChoices(parentElement, feature, className, charLevel) {
        // 1. Determine Count from Class Table
        let count = 2; // Default
        const clsObj = allClasses.find(c => c.name === className && c.source === currentClassSource);
        if (clsObj && clsObj.classTableGroups) {
            for (const group of clsObj.classTableGroups) {
                if (!group.colLabels) continue;
                const colIndex = group.colLabels.findIndex(l => l.includes("Weapon Mastery"));
                if (colIndex !== -1 && group.rows && group.rows[charLevel - 1]) {
                    let val = group.rows[charLevel - 1][colIndex];
                    if (typeof val === 'object' && val.value !== undefined) val = val.value;
                    const parsed = parseInt(val);
                    if (!isNaN(parsed)) count = parsed;
                }
            }
        }

        // 2. Parse Filters
        if (typeof dndWeaponsDB === 'undefined') return;
        
        if (Object.keys(dndWeaponsDB).length === 0) {
             container.innerHTML = "<div style='color:var(--red); font-style:italic;'>No weapon data loaded. Please upload items data (items-base.json).</div>";
             parentElement.appendChild(container);
             return;
        }

        const validWeapons = new Set();
        const entriesStr = JSON.stringify(feature.entries);
        const filterRegex = /{@filter ([^|]+)\|items\|([^}]+)}/g;
        let match;
        let hasFilters = false;

        while ((match = filterRegex.exec(entriesStr)) !== null) {
            hasFilters = true;
            const params = match[2];
            const criteria = {};
            params.split(';').forEach(p => {
                const parts = p.split('=');
                if (parts.length >= 2) {
                    criteria[parts[0].trim().toLowerCase()] = parts[1].trim();
                }
            });

            Object.entries(dndWeaponsDB).forEach(([name, w]) => {
                if (!w.mastery) return;
                let isValid = true;
                if (criteria['type']) {
                    const typeReq = criteria['type'].toLowerCase();
                    if (typeReq.includes('simple') && w.type !== 'Simple') isValid = false;
                    if (typeReq.includes('martial') && w.type !== 'Martial') isValid = false;
                }
                if (criteria['melee weapon'] && w.cat !== 'Melee') isValid = false;
                if (criteria['ranged weapon'] && w.cat !== 'Ranged') isValid = false;
                
                if (isValid) validWeapons.add(name);
            });
        }

        if (!hasFilters) {
             Object.entries(dndWeaponsDB).forEach(([name, w]) => {
                if (w.mastery) validWeapons.add(name);
            });
        }

        const sortedWeapons = Array.from(validWeapons).sort();

        const container = document.createElement('div');
        container.style.marginTop = "10px";
        container.style.padding = "10px";
        container.style.background = "rgba(255,255,255,0.5)";
        container.style.border = "1px solid var(--gold)";
        container.style.borderRadius = "4px";

        container.innerHTML = `<div style="font-weight:bold; margin-bottom:8px; border-bottom:1px solid var(--gold-dark);">Choose ${count} Weapon Masteries:</div>`;
        
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search weapons...';
        searchInput.style.width = '100%';
        searchInput.style.marginBottom = '8px';
        searchInput.style.padding = '4px';
        searchInput.style.border = '1px solid var(--gold)';
        searchInput.style.borderRadius = '4px';
        searchInput.oninput = () => {
            const term = searchInput.value.toLowerCase();
            grid.querySelectorAll('.checklist-item').forEach(item => {
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(term) ? 'flex' : 'none';
            });
        };
        container.appendChild(searchInput);
        
        const grid = document.createElement('div');
        grid.style.display = "grid";
        grid.style.gridTemplateColumns = "repeat(auto-fill, minmax(200px, 1fr))";
        grid.style.gap = "8px";

        sortedWeapons.forEach(wName => {
            const w = dndWeaponsDB[wName];
            const key = `Mastery: ${wName}`;
            const isSelected = selectedOptionalFeatures.has(key);
            const div = document.createElement('div');
            div.className = 'checklist-item';
            div.style.padding = "4px 8px";
            div.style.fontSize = "0.9rem";
            div.style.justifyContent = "space-between";
            
            const masteryDesc = allMasteryProperties[w.mastery] || "See rules.";
            const tooltip = masteryDesc.replace(/<[^>]*>/g, '');
            
            div.innerHTML = `<span>${wName}</span> <span title="${tooltip}" style="font-size:0.8rem; font-style:italic; cursor:help; border-bottom:1px dotted var(--ink-light);">${w.mastery}</span>`;
            if (isSelected) { div.style.background = 'var(--red)'; div.style.color = 'white'; }
            div.onclick = () => {
                if (selectedOptionalFeatures.has(key)) selectedOptionalFeatures.delete(key);
                else {
                    let current = 0; selectedOptionalFeatures.forEach(k => { if(k.startsWith("Mastery: ")) current++; });
                    if (current < count) selectedOptionalFeatures.add(key);
                    else alert(`Limit ${count} reached.`);
                }
                renderClassFeatures();
            };
            grid.appendChild(div);
        });
        container.appendChild(grid);
        parentElement.appendChild(container);
    }

    function renderFeatSelection(parentElement, feature, className, charLevel) {
        const container = document.createElement('div');
        container.style.marginTop = "10px";
        container.style.padding = "10px";
        container.style.background = "rgba(255,255,255,0.5)";
        container.style.border = "1px solid var(--gold)";
        container.style.borderRadius = "4px";
        container.style.maxHeight = "400px";
        container.style.overflowY = "auto";

        container.innerHTML = `<div style="font-weight:bold; margin-bottom:8px; border-bottom:1px solid var(--gold-dark);">Select a Feat (Level ${charLevel}):</div>`;

        // Deduplicate Feats
        const candidates = new Map();
        allFeats.forEach(feat => {
            if (!candidates.has(feat.name)) candidates.set(feat.name, []);
            candidates.get(feat.name).push(feat);
        });

        const uniqueFeats = [];
        candidates.forEach((opts) => {
            let selected = opts.find(o => o.source === 'XPHB');
            if (!selected) selected = opts.find(o => o.source === 'PHB');
            if (!selected) selected = opts[0];
            uniqueFeats.push(selected);
        });

        // Filter by Level Prerequisite
        const available = uniqueFeats.filter(feat => {
            if (feat.prerequisite) {
                return feat.prerequisite.every(req => {
                    if (req.level) {
                        let reqLvl = typeof req.level === 'object' ? req.level.level : req.level;
                        return charLevel >= reqLvl;
                    }
                    return true;
                });
            }
            return true;
        }).sort((a, b) => a.name.localeCompare(b.name));

        // Search
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.placeholder = 'Search feats...';
        searchInput.className = 'styled-input';
        searchInput.style.width = '100%';
        searchInput.style.marginBottom = '8px';
        searchInput.style.padding = '4px';
        searchInput.style.border = '1px solid var(--gold)';
        searchInput.style.borderRadius = '4px';
        
        const list = document.createElement('div');
        list.style.display = 'flex';
        list.style.flexDirection = 'column';
        list.style.gap = '4px';

        searchInput.oninput = () => {
            const term = searchInput.value.toLowerCase();
            Array.from(list.children).forEach(child => {
                const text = child.querySelector('.feat-name').textContent.toLowerCase();
                child.style.display = text.includes(term) ? 'flex' : 'none';
            });
        };

        container.appendChild(searchInput);

        const selectionKey = `ASI Level ${charLevel}`;
        let currentSelection = null;
        for (const item of selectedOptionalFeatures) {
            if (item.startsWith(selectionKey + ":")) {
                currentSelection = item.substring(selectionKey.length + 2);
                break;
            }
        }

        available.forEach(feat => {
            const div = document.createElement('div');
            div.className = 'checklist-item';
            div.style.flexDirection = 'column';
            div.style.alignItems = 'flex-start';
            div.style.padding = '8px';
            
            const header = document.createElement('div');
            header.className = 'feat-name';
            header.style.fontWeight = 'bold';
            header.textContent = feat.name;
            
            div.appendChild(header);

            if (currentSelection === feat.name) {
                div.style.background = 'var(--red)';
                div.style.color = 'white';
            }

            div.onclick = () => {
                const toRemove = [];
                selectedOptionalFeatures.forEach(k => {
                    if (k.startsWith(selectionKey + ":")) toRemove.push(k);
                });
                toRemove.forEach(k => selectedOptionalFeatures.delete(k));

                if (currentSelection !== feat.name) {
                    selectedOptionalFeatures.add(`${selectionKey}: ${feat.name}`);
                }
                renderClassFeatures();
            };

            list.appendChild(div);
        });

        container.appendChild(list);
        parentElement.appendChild(container);
    }

    function renderGrantedSpells() {
        const container = document.getElementById('creator-granted-spells');
        const wrapper = document.getElementById('creator-granted-spells-container');
        if (!container || !wrapper) return;
        
        container.innerHTML = '';
        const spells = new Set();
        const choices = [];

        // Add manually selected spells
        selectedSpells.forEach(s => spells.add(s));

        // Helper to format "Choose" strings
        const formatChoose = (str) => {
            if (!str) return "";
            return str.split('|').map(part => {
                const [key, val] = part.split('=');
                if (key === 'level') return val === '0' ? 'Cantrips' : `Level ${val} Spells`;
                if (key === 'class') return `${val} Spells`;
                if (key === 'components & miscellaneous' && val === 'ritual') return 'Rituals';
                return part;
            }).join(', ');
        };
        
        // Find selected feature objects
        const selectedFeatures = [];
        selectedOptionalFeatures.forEach(name => {
            // Find best match (XPHB > PHB)
            const candidates = allOptionalFeatures.filter(f => f.name === name);
            let feat = candidates.find(f => f.source === 'XPHB');
            if (!feat) feat = candidates.find(f => f.source === 'PHB');
            if (!feat) feat = candidates[0];
            if (feat) selectedFeatures.push(feat);
        });

        selectedFeatures.forEach(feat => {
            if (feat.additionalSpells) {
                feat.additionalSpells.forEach(entry => {
                    // Helper to extract spell names
                    const extract = (obj) => {
                        if (!obj) return;
                        Object.values(obj).forEach(val => {
                            if (Array.isArray(val)) {
                                val.forEach(v => {
                                    if (typeof v === 'string') spells.add(v.split('#')[0].split('|')[0]);
                                    else if (v.choose) {
                                        const criteria = formatChoose(v.choose);
                                        choices.push(`Choose ${v.count || 1} from: ${criteria}`);
                                    }
                                });
                            } else if (typeof val === 'object') {
                                extract(val);
                            }
                        });
                    };
                    
                    if (entry.innate) extract(entry.innate);
                    if (entry.known) extract(entry.known);
                    if (entry.prepared) extract(entry.prepared);
                });
            }
        });

        if (spells.size === 0 && choices.length === 0) {
            wrapper.style.display = 'none';
            return;
        }

        wrapper.style.display = 'block';

        choices.forEach(c => {
            const div = document.createElement('div');
            div.textContent = c;
            div.style.padding = "4px 0";
            div.style.borderBottom = "1px dashed var(--gold)";
            div.style.color = "var(--ink)";
            div.style.fontStyle = "italic";
            container.appendChild(div);
        });

        spells.forEach(s => {
            const div = document.createElement('div');
            div.textContent = s;
            div.style.padding = "4px 0";
            div.style.borderBottom = "1px dashed var(--gold)";
            div.style.color = "var(--red-dark)";
            div.style.fontWeight = "bold";
            container.appendChild(div);
        });
    }

    // Background Logic
    const backgroundSelect = document.getElementById('creator-background');
    backgroundSelect.addEventListener('change', () => {
        selectedBackground = backgroundSelect.value;
        renderBackgroundInfo();
    });

    function renderBackgroundOptions() {
        backgroundSelect.innerHTML = '<option value="" disabled selected>Select Background</option>';
        
        // Deduplicate preferring XPHB
        const uniqueMap = new Map();
        allBackgrounds.forEach(b => {
            if (!uniqueMap.has(b.name)) {
                uniqueMap.set(b.name, b);
            } else {
                const existing = uniqueMap.get(b.name);
                if (b.source === 'XPHB') {
                    uniqueMap.set(b.name, b);
                } else if (b.source === 'PHB' && existing.source !== 'XPHB') {
                    uniqueMap.set(b.name, b);
                }
            }
        });
        
        const sortedBackgrounds = Array.from(uniqueMap.values()).sort((a, b) => a.name.localeCompare(b.name));

        sortedBackgrounds.forEach(b => {
            const opt = document.createElement('option');
            opt.value = b.name;
            opt.textContent = b.name;
            backgroundSelect.appendChild(opt);
        });
    }

    function renderBackgroundInfo() {
        const container = document.getElementById('creator-background-info');
        container.innerHTML = '';
        
        if (!selectedBackground) return;

        // Find the background object (using the same logic as options to ensure match)
        // Since we populated options from uniqueMap, we can just find by name in allBackgrounds 
        // but we should respect the source priority again or just store the object. 
        // For simplicity, we'll find the best match again.
        const candidates = allBackgrounds.filter(b => b.name === selectedBackground);
        let bg = candidates.find(b => b.source === 'XPHB') || candidates.find(b => b.source === 'PHB') || candidates[0];

        if (bg) {
            // Handle _copy if entries are missing (e.g. "Augen Trust (Spy)" copies "Criminal")
            if (!bg.entries && bg._copy) {
                const original = allBackgrounds.find(b => b.name === bg._copy.name && b.source === bg._copy.source);
                if (original && original.entries) bg = { ...original, ...bg, entries: original.entries };
            }

            if (bg.entries) {
                let desc = processEntries(bg.entries);
                desc = desc.replace(/\{@\w+\s*([^}]+)?\}/g, (match, content) => content ? content.split('|')[0] : "");
                container.innerHTML = desc;

                // Ability Score Adjustment Logic
                const allAbilities = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'];
                let foundAbilities = [];

                // 1. Try to parse structured 'ability' data (2024 standard)
                if (bg.ability) {
                    const codes = new Set();
                    bg.ability.forEach(a => {
                        // Handle weighted choose
                        if (a.choose && a.choose.weighted && a.choose.weighted.from) {
                            a.choose.weighted.from.forEach(c => codes.add(c));
                        }
                        // Handle simple choose
                        else if (a.choose && a.choose.from) {
                             a.choose.from.forEach(c => codes.add(c));
                        }
                        // Handle static boosts or simple keys
                        Object.keys(a).forEach(key => {
                            if (['str','dex','con','int','wis','cha'].includes(key)) codes.add(key);
                        });
                    });
                    
                    const map = {
                        'str': 'Strength', 'dex': 'Dexterity', 'con': 'Constitution',
                        'int': 'Intelligence', 'wis': 'Wisdom', 'cha': 'Charisma'
                    };
                    
                    codes.forEach(c => {
                        if (map[c]) foundAbilities.push(map[c]);
                    });
                }

                // 2. Fallback to text parsing if no structured data found
                if (foundAbilities.length === 0) {
                    let asiEntry = null;
                    const findASI = (obj) => {
                        if (asiEntry) return;
                        if (typeof obj === 'string') {
                            if (obj.includes('Ability Scores:')) {
                                asiEntry = obj;
                            }
                            return;
                        }
                        if (Array.isArray(obj)) {
                            obj.forEach(findASI);
                            return;
                        }
                        if (typeof obj === 'object' && obj !== null) {
                            // Handle object with name "Ability Scores" or "Ability Scores:"
                            if ((obj.name === 'Ability Scores' || obj.name === 'Ability Scores:') && (obj.entries || obj.entry)) {
                                const content = obj.entries ? (Array.isArray(obj.entries) ? obj.entries.join(' ') : obj.entries) : obj.entry;
                                asiEntry = "Ability Scores: " + content;
                                return;
                            }
                            if (obj.items) findASI(obj.items);
                            if (obj.entries) findASI(obj.entries);
                        }
                    };
                    findASI(bg.entries);

                    if (asiEntry) {
                        let text = asiEntry;
                        // Handle 5e-tools style tags {@ability str}
                        text = text.replace(/{@ability\s+([^}]+)}/gi, (match, content) => {
                            const code = content.split('|')[0].trim().toLowerCase();
                            const map = {
                                'str': 'Strength', 'dex': 'Dexterity', 'con': 'Constitution',
                                'int': 'Intelligence', 'wis': 'Wisdom', 'cha': 'Charisma'
                            };
                            return map[code] || content;
                        });

                        foundAbilities = allAbilities.filter(ability => {
                            const regex = new RegExp(`\\b${ability}\\b`, 'i');
                            return regex.test(text);
                        });
                    }
                }

                const hasSuggestions = foundAbilities.length > 0;
                
                const asiDiv = document.createElement('div');
                asiDiv.className = 'feature-box';
                asiDiv.style.marginTop = '15px';
                asiDiv.style.border = '2px solid var(--gold)';
                
                asiDiv.innerHTML = `
                    <div class="feature-header" style="border-bottom: 1px solid var(--gold); margin-bottom: 10px;">
                        <strong>Background Ability Score Adjustment</strong>
                    </div>
                    <div style="margin-bottom: 10px; font-size: 0.9rem;">
                        ${hasSuggestions ? `Background options: <strong>${foundAbilities.join(', ')}</strong>` : "Choose your ability score increases."}
                    </div>
                    <div style="margin-bottom: 10px;">
                        <label style="display:block; font-weight:bold; margin-bottom:4px;">Adjustment Method:</label>
                        <select id="bg_asi_method" class="styled-select" style="width: 100%;">
                            <option value="flat">+1 to Three Scores</option>
                            <option value="split">+2 to One, +1 to Another</option>
                        </select>
                    </div>
                    
                    <div id="bg_asi_inputs"></div>

                    <button id="apply_bg_asi_btn" class="btn" style="margin-top: 15px; width: 100%; font-size: 0.9rem;">Apply Bonuses</button>
                `;
                container.appendChild(asiDiv);

                const methodSelect = asiDiv.querySelector('#bg_asi_method');
                const inputsContainer = asiDiv.querySelector('#bg_asi_inputs');

                const renderInputs = () => {
                    const method = methodSelect.value;
                    inputsContainer.innerHTML = '';
                    
                    const selects = [];

                    const createSelect = (label, id) => {
                        const wrapper = document.createElement('div');
                        wrapper.style.marginBottom = '8px';
                        wrapper.innerHTML = `<label style="font-size:0.9rem;">${label}</label>`;
                        const sel = document.createElement('select');
                        sel.id = id;
                        sel.className = 'styled-select';
                        sel.style.width = '100%';
                        
                        const optionsList = hasSuggestions ? foundAbilities : allAbilities;
                        sel.innerHTML = `<option value="" disabled selected>--</option>` + optionsList.map(opt => `<option value="${opt}">${opt}</option>`).join('');
                        wrapper.appendChild(sel);
                        selects.push(sel);
                        return wrapper;
                    };

                    if (method === 'flat') {
                        inputsContainer.appendChild(createSelect('Score 1 (+1)', 'bg_asi_s1'));
                        inputsContainer.appendChild(createSelect('Score 2 (+1)', 'bg_asi_s2'));
                        inputsContainer.appendChild(createSelect('Score 3 (+1)', 'bg_asi_s3'));
                    } else {
                        inputsContainer.appendChild(createSelect('Score (+2)', 'bg_asi_p2'));
                        inputsContainer.appendChild(createSelect('Score (+1)', 'bg_asi_p1'));
                    }

                    // Logic to disable selected options
                    const updateOptions = () => {
                        const selectedValues = selects.map(s => s.value).filter(v => v !== "");
                        selects.forEach(sel => {
                            const currentVal = sel.value;
                            Array.from(sel.options).forEach(opt => {
                                if (opt.value === "") return;

                                if (opt.value === currentVal) {
                                    opt.disabled = false;
                                    opt.hidden = false;
                                } else {
                                    const isSelected = selectedValues.includes(opt.value);
                                    opt.disabled = isSelected;
                                    opt.hidden = isSelected;
                                }
                            });
                        });
                    };

                    selects.forEach(s => s.addEventListener('change', updateOptions));
                    updateOptions();
                };

                methodSelect.addEventListener('change', renderInputs);
                renderInputs();

                asiDiv.querySelector('#apply_bg_asi_btn').addEventListener('click', () => {
                    const method = methodSelect.value;
                    const map = { 'Strength': 'str', 'Dexterity': 'dex', 'Constitution': 'con', 'Intelligence': 'int', 'Wisdom': 'wis', 'Charisma': 'cha' };
                    const add = (n, v) => { const el = document.getElementById(map[n]); if(el) el.value = (parseInt(el.value)||10) + v; };
                    
                    if (method === 'flat') {
                        const s1 = document.getElementById('bg_asi_s1').value;
                        const s2 = document.getElementById('bg_asi_s2').value;
                        const s3 = document.getElementById('bg_asi_s3').value;
                        if (!s1 || !s2 || !s3) return alert("Please select all ability scores.");
                        if (s1 === s2 || s1 === s3 || s2 === s3) return alert("Please select three different scores.");
                        add(s1, 1); add(s2, 1); add(s3, 1);
                    } else {
                        const p2 = document.getElementById('bg_asi_p2').value;
                        const p1 = document.getElementById('bg_asi_p1').value;
                        if (!p2 || !p1) return alert("Please select all ability scores.");
                        if (p2 === p1) return alert("Scores must be different.");
                        add(p2, 2); add(p1, 1);
                    }
                    if(window.updateModifiers) window.updateModifiers();
                    if(window.saveCharacter) window.saveCharacter();
                    alert("Ability scores updated!");
                });

                // Check for Feats in entries and render them
                const featsInFeature = new Set();
                const scanForFeats = (obj) => {
                    if (!obj) return;
                    if (typeof obj === 'string') {
                        const matches = obj.matchAll(/{@feat ([^}|]+)/g);
                        for (const m of matches) featsInFeature.add(m[1].toLowerCase().trim());
                    } else if (Array.isArray(obj)) {
                        obj.forEach(scanForFeats);
                    } else if (typeof obj === 'object') {
                        Object.values(obj).forEach(scanForFeats);
                    }
                };
                scanForFeats(bg.entries);

                if (featsInFeature.size > 0) {
                    featsInFeature.forEach(featName => {
                        let candidates = allFeats.filter(ft => ft.name.toLowerCase() === featName);
                        if (candidates.length === 0 && featName.includes('(')) {
                            const baseName = featName.replace(/\s*\(.*?\)/, '').trim();
                            candidates = allFeats.filter(ft => ft.name.toLowerCase() === baseName);
                        }
                        let feat = candidates.find(ft => ft.source === 'XPHB');
                        if (!feat) feat = candidates.find(ft => ft.source === 'PHB');
                        if (!feat) feat = candidates[0];

                        if (feat) {
                            const featDiv = document.createElement('div');
                            featDiv.style.marginTop = "10px";
                            featDiv.style.padding = "10px";
                            featDiv.style.backgroundColor = "rgba(255, 255, 255, 0.7)";
                            featDiv.style.border = "1px solid var(--gold)";
                            featDiv.style.borderRadius = "4px";
                            
                            let featDesc = processEntries(feat.entries);
                            featDesc = featDesc.replace(/\{@\w+\s*([^}]+)?\}/g, (match, content) => content ? content.split('|')[0] : "");

                            featDiv.innerHTML = `
                                <div style="font-weight:bold; color:var(--red-dark); border-bottom:1px solid var(--gold-dark); padding-bottom:4px; margin-bottom:6px;">Feat: ${feat.name}</div>
                                <div style="font-size:0.85rem; color:var(--ink); line-height:1.4;">${featDesc}</div>
                            `;
                            container.appendChild(featDiv);
                        }
                    });
                }
            } else {
                container.innerHTML = "No description available.";
            }

            // Add Equipment Choice Section
            const equipDiv = document.createElement('div');
            equipDiv.className = 'feature-box';
            equipDiv.style.marginTop = '15px';
            equipDiv.style.border = '2px solid var(--gold)';
            
            let optAText = "";
            let optBText = "";
            let hasOptions = false;

            // Try Structured Data first
            if (bg.startingEquipment && bg.startingEquipment.length > 0) {
                const se = bg.startingEquipment[0];
                
                const parseItems = (arr) => {
                    if (!arr) return "";
                    return arr.map(i => {
                        if (typeof i === 'string') {
                            let name = i.replace(/\{@\w+\s*([^}]+)?\}/g, (m, c) => c ? c.split('|')[0] : "");
                            name = name.split('|')[0];
                            return name.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
                        }
                        if (i.special) return i.special;
                        if (i.item) {
                            let name = i.displayName || i.item.split('|')[0];
                            name = name.replace(/\{@\w+\s*([^}]+)?\}/g, (m, c) => c ? c.split('|')[0] : "");
                            name = name.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.slice(1).toLowerCase());
                            if (i.quantity && i.quantity > 1) name += ` (${i.quantity})`;
                            return name;
                        }
                        if (i.value) {
                            const gp = i.value / 100;
                            return `${gp} GP`;
                        }
                        return "";
                    }).filter(Boolean).join(', ');
                };

                if (se.A || se.B || se.a || se.b) {
                    hasOptions = true;
                    optAText = parseItems(se.A || se.a);
                    optBText = parseItems(se.B || se.b);
                } else if (se.default) {
                    optAText = parseItems(se.default);
                } else if (se.items) {
                    optAText = parseItems(se.items);
                } else if (se.entries) {
                    optAText = parseItems(se.entries);
                } else if (typeof se === 'string' || se.item) {
                    optAText = parseItems(bg.startingEquipment);
                }
            }

            // Find Equipment Entry
            let equipText = "";
            const findEquip = (entries) => {
                if (!entries) return false;
                for (const e of entries) {
                    if (typeof e === 'object' && e.name) {
                        const name = e.name.toLowerCase();
                        if (name.includes("equipment")) {
                            if (e.entries) equipText = processEntries(e.entries);
                            else if (e.entry) equipText = (typeof e.entry === 'string' ? e.entry : processEntries([e.entry]));
                            return true;
                        }
                    }
                    if (typeof e === 'object' && e.entries) {
                        if (findEquip(e.entries)) return true;
                    }
                }
                return false;
            };
            
            if (!hasOptions && !optAText) {
                findEquip(bg.entries);
                const cleanTags = (str) => str.replace(/\{@\w+\s*([^}]+)?\}/g, (m, c) => c ? c.split('|')[0] : "");
                const stripHtml = (str) => str.replace(/<[^>]*>/g, '');
                
                const textForMatch = stripHtml(cleanTags(equipText));
                const splitRegex = /(?:choose|option)?.*?(?:^|[\s\.,])\(a\)\s*(.*?)(?:;?\s*(?:or|and)?\s*\(b\)\s*)(.*)/i;
                const match = textForMatch.match(splitRegex);

                if (match) {
                    hasOptions = true;
                    optAText = match[1].trim();
                    optBText = match[2].trim();
                } else {
                    optAText = cleanTags(equipText) || "Standard background items.";
                }
            }

            let html = `
                <div class="feature-header" style="border-bottom: 1px solid var(--gold); margin-bottom: 10px;">
                    <strong>Background Equipment</strong>
                </div>
                <div class="equip-selection-container" style="display:flex; gap:10px; flex-wrap:wrap;">
            `;

            if (hasOptions) {
                html += `
                     <label class="equip-option-box selected" style="flex:1; min-width:200px; border:2px solid var(--red); background:var(--parchment); padding:10px; border-radius:6px; cursor:pointer; transition:all 0.2s; position:relative;">
                        <input type="radio" name="bg_equip_choice" value="equipment_a" checked style="display:none;" onchange="window.updateEquipSelection(this)">
                        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--gold); padding-bottom:5px; margin-bottom:5px;">
                            <span style="font-weight:bold; color:var(--red-dark);">Option A</span>
                            <span class="check-indicator" style="color:var(--red); font-weight:bold;">✓</span>
                        </div>
                        <div style="font-size:0.85rem; color:var(--ink); flex-grow:1;">${optAText}</div>
                        <input type="hidden" id="bg-equip-opt-a-val" value="${optAText.replace(/"/g, '&quot;')}">
                     </label>
                     <label class="equip-option-box" style="flex:1; min-width:200px; border:1px solid var(--gold); background:white; padding:10px; border-radius:6px; cursor:pointer; transition:all 0.2s; position:relative;">
                        <input type="radio" name="bg_equip_choice" value="equipment_b" style="display:none;" onchange="window.updateEquipSelection(this)">
                        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--gold); padding-bottom:5px; margin-bottom:5px;">
                            <span style="font-weight:bold; color:var(--red-dark);">Option B</span>
                            <span class="check-indicator" style="display:none; color:var(--red); font-weight:bold;">✓</span>
                        </div>
                        <div style="font-size:0.85rem; color:var(--ink); flex-grow:1;">${optBText}</div>
                        <input type="hidden" id="bg-equip-opt-b-val" value="${optBText.replace(/"/g, '&quot;')}">
                     </label>
                `;
            } else {
                html += `
                     <label class="equip-option-box selected" style="flex:1; min-width:200px; border:2px solid var(--red); background:var(--parchment); padding:10px; border-radius:6px; cursor:pointer; transition:all 0.2s; position:relative; display:flex; flex-direction:column;">
                        <input type="radio" name="bg_equip_choice" value="equipment" checked style="display:none;" onchange="window.updateEquipSelection(this)">
                        <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--gold); padding-bottom:5px; margin-bottom:5px;">
                            <span style="font-weight:bold; color:var(--red-dark);">Equipment</span>
                            <span class="check-indicator" style="color:var(--red); font-weight:bold;">✓</span>
                        </div>
                        <div style="font-size:0.85rem; color:var(--ink); flex-grow:1;">${optAText}</div>
                        <input type="hidden" id="bg-equip-default-val" value="${optAText.replace(/"/g, '&quot;')}">
                     </label>
                `;
            }
            html += `</div>`;
            equipDiv.innerHTML = html;
            container.appendChild(equipDiv);
        }
    }

    function renderSpeciesSection() {
        const step3 = document.getElementById('step-3-section');
        if (document.getElementById('creator-species')) return;

        const container = document.createElement('div');
        container.style.marginTop = "30px";
        container.style.borderTop = "2px solid var(--gold)";
        container.style.paddingTop = "20px";
        
        container.innerHTML = `
            <h3 class="section-title" style="margin-top:0;">Select Species</h3>
            <div class="field" style="margin-bottom: 20px;">
                <span class="field-label">Species</span>
                <select id="creator-species" class="styled-select" style="width: 100%;">
                    <option value="" disabled selected>Select Species</option>
                </select>
            </div>
            <div id="creator-species-info" style="background: rgba(255,255,255,0.5); padding: 15px; border-radius: 4px; border: 1px dashed var(--gold);">
                <em style="color:var(--ink-light);">Select a species to view details...</em>
            </div>
        `;
        
        step3.appendChild(container);

        const speciesSelect = document.getElementById('creator-species');
        speciesSelect.addEventListener('change', () => {
            selectedSpecies = speciesSelect.value;
            renderSpeciesInfo();
        });

        const uniqueMap = new Map();
        allSpecies.forEach(r => {
            if (!uniqueMap.has(r.name)) {
                uniqueMap.set(r.name, r);
            } else {
                const existing = uniqueMap.get(r.name);
                if (r.source === 'XPHB') uniqueMap.set(r.name, r);
                else if (r.source === 'PHB' && existing.source !== 'XPHB') uniqueMap.set(r.name, r);
            }
        });
        
        const sorted = Array.from(uniqueMap.values()).sort((a, b) => a.name.localeCompare(b.name));
        sorted.forEach(r => {
            const opt = document.createElement('option');
            opt.value = r.name;
            opt.textContent = r.name;
            speciesSelect.appendChild(opt);
        });
    }

    function renderSpeciesInfo() {
        const container = document.getElementById('creator-species-info');
        container.innerHTML = '';
        selectedSubrace = null;
        selectedSpeciesOption = null;
        selectedSpeciesOptionFeature = null;

        if (!selectedSpecies) return;

        const candidates = allSpecies.filter(r => r.name === selectedSpecies);
        let race = candidates.find(r => r.source === 'XPHB') || candidates.find(r => r.source === 'PHB') || candidates[0];
        if (race && race._copy && !race.entries) { const orig = allSpecies.find(r => r.name === race._copy.name); if(orig) race = {...orig, ...race, entries: orig.entries}; }
        
        if (race) {
            // 1. Render Main Description
            if (race.entries) {
                let desc = processEntries(race.entries);
                desc = desc.replace(/{@\w+\s*([^}]+)?}/g, (m, c) => c ? c.split('|')[0] : "");
                container.innerHTML = desc;
            }

            // 2. Check for Subraces (Legacy/2014)
            const subraces = allSubraces.filter(sr => sr.raceName === race.name && (sr.raceSource === race.source || !sr.raceSource));
            
            if (subraces.length > 0) {
                const subDiv = document.createElement('div');
                subDiv.style.marginTop = "15px";
                subDiv.style.padding = "10px";
                subDiv.style.border = "1px solid var(--gold)";
                subDiv.style.borderRadius = "4px";
                subDiv.style.background = "rgba(255,255,255,0.5)";

                subDiv.innerHTML = `<div style="font-weight:bold; margin-bottom:5px;">Choose Subrace:</div>`;
                const select = document.createElement('select');
                select.className = 'styled-select';
                select.style.width = '100%';
                select.innerHTML = `<option value="" disabled selected>Select Subrace</option>` + 
                                   subraces.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
                
                const subDescDiv = document.createElement('div');
                subDescDiv.style.marginTop = "10px";
                subDescDiv.style.fontSize = "0.9rem";

                select.addEventListener('change', () => {
                    const sName = select.value;
                    selectedSubrace = subraces.find(s => s.name === sName);
                    if (selectedSubrace && selectedSubrace.entries) {
                        let sDesc = processEntries(selectedSubrace.entries);
                        sDesc = sDesc.replace(/{@\w+\s*([^}]+)?}/g, (m, c) => c ? c.split('|')[0] : "");
                        subDescDiv.innerHTML = `<strong>${sName}:</strong> ${sDesc}`;
                    } else {
                        subDescDiv.innerHTML = "";
                    }
                });

                subDiv.appendChild(select);
                subDiv.appendChild(subDescDiv);
                container.appendChild(subDiv);
            }

            // 3. Check for Internal Choices (2024 Lineages/Legacies)
            // Look for specific feature names that imply a choice table/list
            const choiceFeatures = [
                { name: "Fiendish Legacy", type: "table", nameCol: 0, descCol: 1 },
                { name: "Elven Lineage", type: "table", nameCol: 0, descCol: 1 },
                { name: "Gnomish Lineage", type: "list" },
                { name: "Draconic Ancestry", type: "table", nameCol: 0, descCol: 1 },
                { name: "Giant Ancestry", type: "list" }
            ];

            const findFeature = (entries) => {
                if (!entries) return null;
                for (const entry of entries) {
                    if (entry.name && choiceFeatures.some(cf => entry.name === cf.name || entry.name.startsWith(cf.name))) {
                        const cf = choiceFeatures.find(c => entry.name === c.name || entry.name.startsWith(c.name));
                        // Find the table or list inside
                        if (cf.type === 'table') {
                            const table = entry.entries.find(e => e.type === 'table');
                            if (table && table.rows) return { feature: cf, data: table.rows, type: 'table' };
                        } else if (cf.type === 'list') {
                            const list = entry.entries.find(e => e.type === 'list');
                            if (list && list.items) return { feature: cf, data: list.items, type: 'list' };
                        }
                    }
                    if (entry.entries) {
                        const found = findFeature(entry.entries);
                        if (found) return found;
                    }
                }
                return null;
            };

            const found = findFeature(race.entries);
            if (found) {
                const choiceDiv = document.createElement('div');
                choiceDiv.style.marginTop = "15px";
                choiceDiv.style.padding = "10px";
                choiceDiv.style.border = "1px solid var(--gold)";
                choiceDiv.style.borderRadius = "4px";
                choiceDiv.style.background = "rgba(255,255,255,0.5)";

                choiceDiv.innerHTML = `<div style="font-weight:bold; margin-bottom:5px;">Choose ${found.feature.name}:</div>`;
                const select = document.createElement('select');
                select.className = 'styled-select';
                select.style.width = '100%';
                
                let options = [];
                if (found.type === 'table') {
                    options = found.data.map(row => ({
                        name: row[found.feature.nameCol].replace(/{@\w+\s*([^}]+)?}/g, "$1"),
                        desc: row[found.feature.descCol] ? row[found.feature.descCol].replace(/{@\w+\s*([^}]+)?}/g, "$1") : ""
                    }));
                } else {
                    options = found.data.map(item => ({
                        name: item.name.replace(/\(.*\)/, '').trim(),
                        desc: item.entry || (item.entries ? item.entries.join(' ') : "")
                    }));
                }

                select.innerHTML = `<option value="" disabled selected>Select Option</option>` + 
                                   options.map(o => `<option value="${o.name}">${o.name}</option>`).join('');

                const optDescDiv = document.createElement('div');
                optDescDiv.style.marginTop = "10px";
                optDescDiv.style.fontSize = "0.9rem";

                select.addEventListener('change', () => {
                    const val = select.value;
                    selectedSpeciesOption = val;
                    const opt = options.find(o => o.name === val);
                    if (opt) {
                        selectedSpeciesOptionFeature = {
                            title: `${found.feature.name}: ${opt.name}`,
                            desc: opt.desc
                        };
                        optDescDiv.innerHTML = `<strong>${opt.name}:</strong> ${opt.desc}`;
                    }
                });

                choiceDiv.appendChild(select);
                choiceDiv.appendChild(optDescDiv);
                container.appendChild(choiceDiv);
            }
        }
    }

    function renderAbilityScoreSection() {
        const step3 = document.getElementById('step-3-section');
        if (document.getElementById('creator-abilities')) return;

        const container = document.createElement('div');
        container.style.marginTop = "30px";
        container.style.borderTop = "2px solid var(--gold)";
        container.style.paddingTop = "20px";
        container.id = 'creator-abilities';
        
        container.innerHTML = `
            <h3 class="section-title" style="margin-top:0;">Ability Scores</h3>
            <div style="margin-bottom: 15px;">
                <div style="display:flex; gap:10px; margin-bottom:15px;">
                    <button id="btn-method-standard" class="btn" style="flex:1; font-size:0.8rem;">Standard Array</button>
                    <button id="btn-method-pointbuy" class="btn btn-secondary" style="flex:1; font-size:0.8rem;">Point Buy</button>
                    <button id="btn-method-random" class="btn btn-secondary" style="flex:1; font-size:0.8rem;">Random</button>
                </div>
                <div id="ability-score-content" style="background:rgba(255,255,255,0.5); padding:15px; border-radius:4px; border:1px solid var(--gold);"></div>
            </div>
        `;
        
        step3.appendChild(container);

        const setMethod = (method) => {
            ['standard', 'pointbuy', 'random'].forEach(m => {
                const btn = document.getElementById(`btn-method-${m}`);
                if (m === method) {
                    btn.classList.remove('btn-secondary');
                    btn.classList.add('btn');
                } else {
                    btn.classList.add('btn-secondary');
                    btn.classList.remove('btn');
                }
            });
            if (method === 'standard') renderStandardArray();
            if (method === 'pointbuy') renderPointBuy();
            if (method === 'random') renderRandomStats();
        };

        document.getElementById('btn-method-standard').onclick = () => setMethod('standard');
        document.getElementById('btn-method-pointbuy').onclick = () => setMethod('pointbuy');
        document.getElementById('btn-method-random').onclick = () => setMethod('random');
        
        renderStandardArray();
    }

    function renderStandardArray() {
        const container = document.getElementById('ability-score-content');
        container.innerHTML = `
            <div style="margin-bottom:10px; font-style:italic; color:var(--ink-light);">Assign the standard array (15, 14, 13, 12, 10, 8) to your abilities.</div>
            <div id="sa-container" style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;"></div>
        `;
        
        const abilities = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'];
        const standardValues = [15, 14, 13, 12, 10, 8];
        const saContainer = document.getElementById('sa-container');

        abilities.forEach(ab => {
            const div = document.createElement('div');
            div.innerHTML = `
                <label style="font-weight:bold; font-size:0.9rem;">${ab}</label>
                <select class="styled-select sa-select" data-ability="${ab}" style="width:100%;">
                    <option value="" selected>--</option>
                    ${standardValues.map(v => `<option value="${v}">${v}</option>`).join('')}
                </select>
            `;
            saContainer.appendChild(div);
        });

        const selects = container.querySelectorAll('.sa-select');
        selects.forEach(sel => {
            sel.addEventListener('change', () => {
                const used = Array.from(selects).map(s => s.value).filter(v => v);
                selects.forEach(s => {
                    const current = s.value;
                    Array.from(s.options).forEach(opt => {
                        if (!opt.value) return;
                        if (opt.value === current) opt.disabled = false;
                        else opt.disabled = used.includes(opt.value);
                    });
                });
            });
        });
    }

    function renderPointBuy() {
        const container = document.getElementById('ability-score-content');
        container.innerHTML = `
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <span style="font-style:italic; color:var(--ink-light);">27 Points Total</span>
                <span id="pb-remaining" style="font-weight:bold; color:var(--ink);">Remaining: 27</span>
            </div>
            <div id="pb-container"></div>
        `;

        const abilities = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'];
        const pbContainer = document.getElementById('pb-container');
        const scores = { Strength: 8, Dexterity: 8, Constitution: 8, Intelligence: 8, Wisdom: 8, Charisma: 8 };
        const costs = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };

        const update = () => {
            let spent = 0;
            Object.values(scores).forEach(s => spent += costs[s]);
            const remaining = 27 - spent;
            const remEl = document.getElementById('pb-remaining');
            remEl.textContent = `Remaining: ${remaining}`;
            remEl.style.color = remaining < 0 ? 'red' : 'var(--ink)';

            pbContainer.innerHTML = '';
            abilities.forEach(ab => {
                const score = scores[ab];
                const cost = costs[score];
                const nextCost = costs[score + 1];
                
                const canInc = score < 15 && (remaining >= (nextCost - cost));
                const canDec = score > 8;

                const row = document.createElement('div');
                row.style.display = 'flex';
                row.style.justifyContent = 'space-between';
                row.style.alignItems = 'center';
                row.style.marginBottom = '5px';
                row.style.padding = '5px';
                row.style.background = 'white';
                row.style.border = '1px solid var(--gold)';
                row.style.borderRadius = '4px';

                row.innerHTML = `
                    <span style="font-weight:bold; width:100px;">${ab}</span>
                    <div style="display:flex; align-items:center; gap:10px;">
                        <button class="btn-dec" style="width:24px; height:24px; cursor:pointer;">-</button>
                        <span style="font-weight:bold; font-size:1.1rem; width:20px; text-align:center;">${score}</span>
                        <button class="btn-inc" style="width:24px; height:24px; cursor:pointer;">+</button>
                    </div>
                    <span style="color:var(--ink-light); font-size:0.8rem; width:50px; text-align:right;">(${cost} pts)</span>
                `;

                const btnDec = row.querySelector('.btn-dec');
                const btnInc = row.querySelector('.btn-inc');

                if (!canDec) btnDec.disabled = true;
                if (!canInc) btnInc.disabled = true;

                btnDec.onclick = () => { scores[ab]--; update(); };
                btnInc.onclick = () => { scores[ab]++; update(); };

                pbContainer.appendChild(row);
            });
        };
        update();
    }

    function renderRandomStats() {
        const container = document.getElementById('ability-score-content');
        container.innerHTML = `
            <div style="text-align:center; margin-bottom:15px;">
                <button id="btn-roll-stats" class="btn" style="width:100%;">Roll Stats (4d6 drop lowest)</button>
            </div>
            <div id="random-results" style="display:flex; justify-content:center; gap:10px; margin-bottom:15px; font-weight:bold; font-size:1.2rem;"></div>
            <div id="random-assign-container" style="display:none; grid-template-columns: 1fr 1fr; gap:10px;"></div>
        `;

        const abilities = ['Strength', 'Dexterity', 'Constitution', 'Intelligence', 'Wisdom', 'Charisma'];

        document.getElementById('btn-roll-stats').onclick = () => {
            const rolls = [];
            for(let i=0; i<6; i++) {
                const dice = [
                    Math.floor(Math.random()*6)+1,
                    Math.floor(Math.random()*6)+1,
                    Math.floor(Math.random()*6)+1,
                    Math.floor(Math.random()*6)+1
                ];
                dice.sort((a,b) => a-b);
                rolls.push(dice[1] + dice[2] + dice[3]);
            }
            
            const resultsDiv = document.getElementById('random-results');
            resultsDiv.innerHTML = rolls.map(r => `<span style="padding:5px 10px; background:white; border:1px solid var(--gold); border-radius:4px;">${r}</span>`).join('');
            
            const assignContainer = document.getElementById('random-assign-container');
            assignContainer.style.display = 'grid';
            assignContainer.innerHTML = '';

            abilities.forEach(ab => {
                const div = document.createElement('div');
                div.innerHTML = `
                    <label style="font-weight:bold; font-size:0.9rem;">${ab}</label>
                    <select class="styled-select random-select" data-ability="${ab}" style="width:100%;">
                        <option value="" selected>--</option>
                        ${rolls.map((v, i) => `<option value="${v}" data-index="${i}">${v}</option>`).join('')}
                    </select>
                `;
                assignContainer.appendChild(div);
            });

            const selects = assignContainer.querySelectorAll('.random-select');
            selects.forEach(sel => {
                sel.addEventListener('change', () => {
                    const usedIndices = Array.from(selects).map(s => {
                        if (s.selectedIndex === -1) return null;
                        const opt = s.options[s.selectedIndex];
                        return opt.dataset.index;
                    }).filter(v => v !== undefined);

                    selects.forEach(s => {
                        const currentIndex = s.options[s.selectedIndex]?.dataset.index;
                        Array.from(s.options).forEach(opt => {
                            if (!opt.value) return;
                            const optIndex = opt.dataset.index;
                            if (optIndex === currentIndex) opt.disabled = false;
                            else opt.disabled = usedIndices.includes(optIndex);
                        });
                    });
                });
            });
        };
    }

    function renderReviewSection() {
        const step3 = document.getElementById('step-3-section');
        const container = document.createElement('div');
        container.id = 'step-4-review';
        container.style.marginTop = "30px";
        container.style.borderTop = "2px solid var(--gold)";
        container.style.paddingTop = "20px";
        
        const scores = getFinalAbilityScores();
        const scoreStr = Object.entries(scores).map(([k, v]) => `<strong>${k.slice(0,3)}:</strong> ${v}`).join(', ');

        container.innerHTML = `
            <h3 class="section-title" style="margin-top:0;">Review Character</h3>
            <div class="field" style="margin-bottom: 20px;">
                <span class="field-label">Character Name</span>
                <input type="text" id="creator-char-name" placeholder="Enter Name" style="font-weight:bold; color:var(--red-dark); font-size:1.2rem;">
            </div>
            
            <div style="background:rgba(255,255,255,0.5); padding:15px; border-radius:4px; border:1px solid var(--gold); margin-bottom:20px; line-height:1.6;">
                <div><strong>Class:</strong> ${selectedClass} (Level ${selectedLevel})</div>
                <div><strong>Subclass:</strong> ${selectedSubclass || "None"}</div>
                <div><strong>Species:</strong> ${selectedSpecies || "None"}</div>
                <div><strong>Background:</strong> ${selectedBackground || "None"}</div>
                <div style="margin-top:8px;">${scoreStr}</div>
            </div>

            <button id="create-char-btn" class="btn" style="width:100%; font-size:1.2rem; padding:15px;">Create Character</button>
        `;
        
        step3.parentNode.appendChild(container);
        container.scrollIntoView({ behavior: 'smooth' });

        document.getElementById('create-char-btn').addEventListener('click', createCharacter);
    }

    function getFinalAbilityScores() {
        const scores = { Strength: 10, Dexterity: 10, Constitution: 10, Intelligence: 10, Wisdom: 10, Charisma: 10 };
        
        // 1. Base Scores
        if (document.getElementById('btn-method-standard').classList.contains('btn')) {
            document.querySelectorAll('.sa-select').forEach(sel => {
                if (sel.value) scores[sel.dataset.ability] = parseInt(sel.value);
            });
        } else if (document.getElementById('btn-method-pointbuy').classList.contains('btn')) {
            const rows = document.querySelectorAll('#pb-container > div');
            rows.forEach(row => {
                const ability = row.children[0].textContent;
                const scoreSpan = row.children[1].children[1];
                if (ability && scoreSpan) scores[ability] = parseInt(scoreSpan.textContent);
            });
        } else if (document.getElementById('btn-method-random').classList.contains('btn')) {
            document.querySelectorAll('.random-select').forEach(sel => {
                if (sel.value) scores[sel.dataset.ability] = parseInt(sel.value);
            });
        }

        // 2. Background ASI
        const bgMethod = document.getElementById('bg_asi_method')?.value;
        if (bgMethod === 'flat') {
            ['bg_asi_s1', 'bg_asi_s2', 'bg_asi_s3'].forEach(id => {
                const val = document.getElementById(id)?.value;
                if (val && scores[val]) scores[val] += 1;
            });
        } else if (bgMethod === 'split') {
            const p2 = document.getElementById('bg_asi_p2')?.value;
            const p1 = document.getElementById('bg_asi_p1')?.value;
            if (p2 && scores[p2]) scores[p2] += 2;
            if (p1 && scores[p1]) scores[p1] += 1;
        }

        return scores;
    }

    function createCharacter() {
        const name = document.getElementById('creator-char-name').value;
        if (!name) { alert("Please enter a character name."); return; }

        const scores = getFinalAbilityScores();
        
        // Calculate HP
        const clsObj = allClasses.find(c => c.name === selectedClass && c.source === currentClassSource) || allClasses.find(c => c.name === selectedClass);
        const hitDie = clsObj && clsObj.hd ? clsObj.hd.faces : 8;
        const conMod = Math.floor((scores.Constitution - 10) / 2);
        let hp = hitDie + conMod; // Level 1
        if (selectedLevel > 1) {
            hp += (selectedLevel - 1) * (Math.floor(hitDie / 2) + 1 + conMod);
        }

        // Gather Features
        const features = [];
        
        // Helper for text cleaning
        const cleanText = (text) => {
            if (!text) return "";
            let clean = text;
            // 1. Replace 5e-tools tags {@tag content|...} -> content
            clean = clean.replace(/\{@\w+\s*([^}]+)?\}/g, (match, content) => {
                if (!content) return "";
                return content.split('|')[0];
            });
            // 2. Replace breaks with newlines
            clean = clean.replace(/<br\s*\/?>/gi, '\n');
            // 3. Replace list items
            clean = clean.replace(/<li>/gi, '\n• ');
            clean = clean.replace(/<\/li>/gi, '');
            clean = clean.replace(/<ul>/gi, '');
            clean = clean.replace(/<\/ul>/gi, '\n');
            // 4. Strip remaining HTML
            clean = clean.replace(/<[^>]*>/g, '');
            // 5. Decode entities (basic)
            clean = clean.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ');
            return clean.trim();
        };

        // Initialize Proficiencies & Details
        const skillProficiency = {};
        let toolProfs = [];
        let weaponProfs = [];
        let armorLight = false;
        let armorMedium = false;
        let armorHeavy = false;
        let armorShield = false;
        let spellAbility = "";
        let spellSlotsData = [];

        // Inventory & Gold Logic
        const inventory = [];
        let cp = 0, sp = 0, ep = 0, gp = 0, pp = 0;

        // Helper to add items from string list
        const addItemsFromList = (listStr, sourceLabel) => {
            if (!listStr) return;
            // Split by comma, ignoring commas inside parentheses
            const items = listStr.split(/,\s*(?![^(]*\))/).map(s => s.trim()).filter(s => s);
            
            items.forEach(itemStr => {
                let name = itemStr;
                let qty = 1;
                
                // Check for "Name (x)" or "Name (Qty)" pattern
                const qtyMatch = itemStr.match(/(.*)\s*\((\d+)\)$/);
                if (qtyMatch) {
                    name = qtyMatch[1].trim();
                    qty = parseInt(qtyMatch[2]);
                }
                
                // Check for GP values in list (e.g. "10 GP" or "and 10 GP")
                const gpMatch = name.match(/^(?:and\s+)?(\d+)\s*GP[\s.]*$/i);
                if (gpMatch) {
                    gp += parseInt(gpMatch[1]) * qty;
                    return; 
                }

                // Check for embedded GP (e.g. "Item (and 10 GP)")
                const embeddedGpMatch = name.match(/(.*?)\s*\(\s*(?:and\s+)?(\d+)\s*GP\s*\)[\s.]*$/i);
                if (embeddedGpMatch) {
                    name = embeddedGpMatch[1].trim();
                    gp += parseInt(embeddedGpMatch[2]) * qty;
                }

                // Check for trailing GP (e.g. "Item and 10 GP")
                const trailingGpMatch = name.match(/(.*?)(?:,?\s+and)\s+(\d+)\s*GP[\s.]*$/i);
                if (trailingGpMatch) {
                    name = trailingGpMatch[1].trim();
                    gp += parseInt(trailingGpMatch[2]) * qty;
                }

                // Lookup description
                let desc = sourceLabel;
                let foundItem = allItems.find(i => i.name.toLowerCase() === name.toLowerCase());
                if (!foundItem && name.toLowerCase().endsWith('s')) {
                     foundItem = allItems.find(i => i.name.toLowerCase() === name.toLowerCase().slice(0, -1));
                }

                if (foundItem) {
                    if (foundItem.entries) desc = processEntries(foundItem.entries);
                    else if (foundItem.desc) desc = processEntries(foundItem.desc);
                    else if (foundItem.description) desc = foundItem.description;
                    
                    desc = cleanText(desc);
                }

                inventory.push({ name: name, qty: qty, weight: 0, equipped: false, description: desc });
            });
        };

        // Class Equipment
        const classEquipChoice = document.querySelector('input[name="class_equip_choice"]:checked')?.value;
        if (classEquipChoice === 'equipment_a') {
             const val = document.getElementById('equip-opt-a-val')?.value;
             addItemsFromList(val, "Class Equipment (Option A)");
        } else if (classEquipChoice === 'equipment_b') {
             const val = document.getElementById('equip-opt-b-val')?.value;
             addItemsFromList(val, "Class Equipment (Option B)");
        } else {
             if (clsObj && clsObj.startingEquipment) {
                 if (clsObj.startingEquipment.default) {
                     clsObj.startingEquipment.default.forEach(itemStr => {
                         let clean = itemStr.replace(/\{@\w+\s*([^}]+)?\}/g, (m, c) => c ? c.split('|')[0] : "");
                         inventory.push({ name: clean, qty: 1, weight: 0, equipped: false, description: "Class Starting Equipment" });
                     });
                 } else {
                     inventory.push({ name: "Class Equipment", qty: 1, weight: 0, equipped: false, description: "See Class description for items." });
                 }
             }
        }

        // Background Equipment
        const bgEquipChoice = document.querySelector('input[name="bg_equip_choice"]:checked')?.value;
        if (bgEquipChoice === 'gold') {
            gp += 50;
        } else if (bgEquipChoice === 'equipment_a') {
             const val = document.getElementById('bg-equip-opt-a-val')?.value;
             addItemsFromList(val, "Background Equipment (Option A)");
        } else if (bgEquipChoice === 'equipment_b') {
             const val = document.getElementById('bg-equip-opt-b-val')?.value;
             if (val) {
                 if (val.toLowerCase().replace(/[^a-z0-9]/g, '').includes('50gp')) {
                     gp += 50;
                 } else {
                     addItemsFromList(val, "Background Equipment (Option B)");
                 }
             }
        } else {
            const val = document.getElementById('bg-equip-default-val')?.value;
            if (val) {
                addItemsFromList(val, "Background Equipment");
            } else {
                inventory.push({ name: "Background Equipment", qty: 1, weight: 0, equipped: false, description: "See Background description for items." });
            }
        }

        // Capture Class Skills from Dropdowns
        document.querySelectorAll('.skill-select-dropdown').forEach(sel => {
            if (sel.value) {
                // Convert "Animal Handling" -> "animal_handling"
                const key = sel.value.toLowerCase().replace(/ /g, '_');
                skillProficiency[key] = true;
            }
        });

        // Class Features
        const classFeats = allClassFeatures.filter(f => 
            f.className === selectedClass && 
            f.source === currentClassSource &&
            (!f.subclassShortName || f.subclassShortName === selectedSubclass) && 
            f.level <= selectedLevel
        );
        classFeats.forEach(f => {
            let desc = processEntries(f.entries);
            features.push({ title: f.name, desc: cleanText(desc), type: 'class' });
        });

        // Optional Features (Invocations, Masteries, etc.)
        selectedOptionalFeatures.forEach(name => {
            if (name.startsWith("Mastery: ")) {
                const wName = name.replace("Mastery: ", "");
                const w = (typeof dndWeaponsDB !== 'undefined') ? dndWeaponsDB[wName] : { mastery: "Unknown" };
                features.push({ 
                    title: `Weapon Mastery: ${wName}`, 
                    desc: `You have mastery with the ${wName}. Property: ${w.mastery || "See rules"}.`, 
                    type: 'class' 
                });
            } else if (name.startsWith("Primal Knowledge Skill: ")) {
                const skill = name.replace("Primal Knowledge Skill: ", "");
                features.push({
                    title: "Primal Knowledge",
                    desc: `You gain proficiency in the ${skill.charAt(0).toUpperCase() + skill.slice(1)} skill.`,
                    type: 'class'
                });
                const key = skill.toLowerCase().replace(/ /g, '_');
                skillProficiency[key] = true;
            } else if (name.startsWith("ASI Level ")) {
                const featName = name.substring(name.indexOf(':') + 2);
                const candidates = allFeats.filter(f => f.name === featName);
                let feat = candidates.find(f => f.source === 'XPHB') || candidates.find(f => f.source === 'PHB') || candidates[0];
                if (feat) {
                    let desc = processEntries(feat.entries);
                    features.push({ title: `Feat: ${feat.name}`, desc: cleanText(desc), type: 'feat' });
                }
            } else {
                const candidates = allOptionalFeatures.filter(f => f.name === name);
                let feat = candidates.find(f => f.source === 'XPHB') || candidates.find(f => f.source === 'PHB') || candidates[0];
                if (feat) {
                    let desc = processEntries(feat.entries);
                    features.push({ title: feat.name, desc: cleanText(desc), type: 'class' });
                }
            }
        });

        // Species Features
        const speciesCandidates = allSpecies.filter(r => r.name === selectedSpecies);
        let race = speciesCandidates.find(r => r.source === 'XPHB') || speciesCandidates[0];
        if (race && race.entries) {
            race.entries.forEach(e => {
                if (e.name) {
                    let desc = processEntries(e.entries || e);
                    features.push({ title: e.name, desc: cleanText(desc), type: 'race' });
                }
            });
        }
        
        // Subrace Features
        if (selectedSubrace && selectedSubrace.entries) {
            let desc = processEntries(selectedSubrace.entries);
            features.push({ title: `Subrace: ${selectedSubrace.name}`, desc: cleanText(desc), type: 'race' });
        }

        // Lineage/Legacy Choice Features
        if (selectedSpeciesOptionFeature) {
            features.push({ title: selectedSpeciesOptionFeature.title, desc: cleanText(selectedSpeciesOptionFeature.desc), type: 'race' });
        }

        // Background Features
        const bgCandidates = allBackgrounds.filter(b => b.name === selectedBackground);
        let bg = bgCandidates.find(b => b.source === 'XPHB') || bgCandidates[0];
        if (bg) {
            if (bg.entries) {
                 let desc = processEntries(bg.entries);
                 features.push({ title: "Background Feature", desc: cleanText(desc), type: 'background' });
            }
            // Background Skills
            if (bg.skillProficiencies) {
                bg.skillProficiencies.forEach(entry => {
                    Object.keys(entry).forEach(k => { 
                        if (k !== 'choose') {
                            const key = k.toLowerCase().replace(/ /g, '_');
                            skillProficiency[key] = true; 
                        }
                    });
                });
            }
            // Background Tools
            if (bg.toolProficiencies) {
                bg.toolProficiencies.forEach(entry => {
                    Object.keys(entry).forEach(k => { 
                        if (k !== 'choose') {
                            let tName = cleanText(k);
                            if (tName) toolProfs.push(tName.toLowerCase().split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '));
                        }
                    });
                });
            }
        }

        // --- Proficiencies, Spellcasting, and Details ---
        // (Variables initialized at top of function)

        if (clsObj) {
            // Proficiencies
            if (clsObj.startingProficiencies) {
                if (clsObj.startingProficiencies.armor) {
                    clsObj.startingProficiencies.armor.forEach(a => {
                        let aName = (typeof a === 'string' ? a : a.proficiency);
                        aName = cleanText(aName).toLowerCase();
                        if (aName === 'light' || aName === 'light armor') armorLight = true;
                        if (aName === 'medium' || aName === 'medium armor') armorMedium = true;
                        if (aName === 'heavy' || aName === 'heavy armor') armorHeavy = true;
                        if (aName === 'shields' || aName === 'shield') armorShield = true;
                    });
                }
                if (clsObj.startingProficiencies.weapons) {
                    clsObj.startingProficiencies.weapons.forEach(w => {
                        let wName = (typeof w === 'string' ? w : w.proficiency);
                        wName = cleanText(wName);
                        if (!wName) return;

                        if (wName.toLowerCase() === 'simple') weaponProfs.push("Simple Weapons");
                        else if (wName.toLowerCase() === 'martial') weaponProfs.push("Martial Weapons");
                        else weaponProfs.push(wName.charAt(0).toUpperCase() + wName.slice(1));
                    });
                }
                if (clsObj.startingProficiencies.tools) {
                    clsObj.startingProficiencies.tools.forEach(t => {
                        let tName = typeof t === 'string' ? t : t.name || t.proficiency;
                        tName = cleanText(tName);
                        if (tName) {
                            tName = tName.toLowerCase().split(' ').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' ');
                            toolProfs.push(tName);
                        }
                    });
                }
            }

            // Spellcasting Ability
            if (clsObj.spellcastingAbility) {
                spellAbility = clsObj.spellcastingAbility;
            }

            // Spell Slots
            if (clsObj.classTableGroups) {
                // Iterate all groups to find spell slots (standard casting)
                clsObj.classTableGroups.forEach(group => {
                    const rows = group.rows || group.rowsSpellProgression;
                    if (!group.colLabels || !rows || !rows[selectedLevel - 1]) return;
                    
                    const row = rows[selectedLevel - 1];
                    const isSpellGroup = (group.title && group.title.toLowerCase().includes("spell slots")) || group.rowsSpellProgression;

                    group.colLabels.forEach((label, idx) => {
                        // Clean label (remove tags)
                        const cleanLabel = label.replace(/\{@\w+\s*([^}]+)?\}/g, (m, c) => c ? c.split('|')[0] : "").trim();
                        
                        // Match "1st", "2nd", "3rd", etc.
                        let slotMatch = cleanLabel.match(/(\d+)(?:st|nd|rd|th)/i);
                        if (!slotMatch && isSpellGroup) {
                            slotMatch = cleanLabel.match(/^(\d+)$/);
                        }
                        
                        if (slotMatch) {
                            const lvl = parseInt(slotMatch[1]);
                            // Sanity check: Spell levels are 1-9
                            if (lvl >= 1 && lvl <= 9) {
                                let val = row[idx];
                                if (typeof val === 'object' && val !== null && val.value !== undefined) val = val.value;
                                const total = parseInt(val);
                                if (!isNaN(total) && total > 0) {
                                    if (!spellSlotsData.some(s => s.level === lvl)) {
                                        spellSlotsData.push({ level: lvl, total: total, used: 0 });
                                    }
                                }
                            }
                        }
                    });
                });

                // Warlock / Pact Magic (if no standard slots found)
                if (spellSlotsData.length === 0) {
                     let slotsCount = 0;
                     let slotLevel = 0;
                     clsObj.classTableGroups.forEach(g => {
                         const rows = g.rows || g.rowsSpellProgression;
                         if (!g.colLabels || !rows || !rows[selectedLevel - 1]) return;
                         
                         const row = rows[selectedLevel - 1];
                         g.colLabels.forEach((label, idx) => {
                             const cleanLabel = label.replace(/\{@\w+\s*([^}]+)?\}/g, (m, c) => c ? c.split('|')[0] : "");
                             
                             if (cleanLabel.match(/Spell Slots/i)) {
                                 let val = row[idx];
                                 if (typeof val === 'object' && val !== null && val.value !== undefined) val = val.value;
                                 slotsCount = parseInt(val) || 0;
                             }
                             if (cleanLabel.match(/Slot Level/i)) {
                                 let val = row[idx];
                                 if (typeof val === 'object' && val !== null && val.value !== undefined) val = val.value;
                                 const lvlMatch = String(val).match(/(\d+)/);
                                 if (lvlMatch) slotLevel = parseInt(lvlMatch[1]);
                             }
                         });
                     });
                     if (slotsCount > 0 && slotLevel > 0) {
                         spellSlotsData.push({ level: slotLevel, total: slotsCount, used: 0 });
                     }
                }
            }
        }

        // Spells List Processing
        const cantripsList = [];
        const spellsList = [];

        selectedSpells.forEach(sName => {
            const cleanName = sName.trim();
            let candidates = allSpells.filter(s => s.name === cleanName);
            if (candidates.length === 0) {
                candidates = allSpells.filter(s => s.name.toLowerCase() === cleanName.toLowerCase());
            }

            let spell = candidates.find(s => s.source === 'XPHB') || candidates.find(s => s.source === 'PHB') || candidates[0];
            
            if (spell) {
                let time = "";
                if (spell.time && spell.time[0]) {
                    const t = spell.time[0];
                    time = `${t.number || ""} ${t.unit || ""}`.trim();
                }
                
                let range = "";
                if (spell.range) {
                    if (spell.range.distance) {
                         const dist = spell.range.distance;
                         range = `${dist.amount ? dist.amount + ' ' : ''}${dist.type}`;
                    } else {
                        range = spell.range.type || "";
                    }
                }

                let duration = "";
                if (spell.duration) {
                    duration = spell.duration.map(d => {
                        if (d.type === "instant") return "Instantaneous";
                        if (d.type === "timed" && d.duration) return `${d.concentration ? "Concentration, " : ""}${d.duration.amount} ${d.duration.type}${d.duration.amount > 1 ? "s" : ""}`;
                        if (d.type === "permanent") return "Permanent";
                        return "Special";
                    }).join(" or ");
                }

                let desc = processEntries(spell.entries);
                desc = cleanText(desc);
                if (duration) desc = `**Duration:** ${duration}\n\n${desc}`;

                const spellData = {
                    name: spell.name,
                    level: spell.level,
                    time: time,
                    range: range,
                    ritual: spell.meta && spell.meta.ritual ? true : false,
                    concentration: spell.duration && spell.duration[0] && spell.duration[0].concentration ? true : false,
                    material: spell.components && (spell.components.m || spell.components.M) ? true : false,
                    description: desc,
                    prepared: false
                };

                if (spell.level === 0) {
                    cantripsList.push(spellData);
                } else {
                    spellsList.push(spellData);
                }
            } else {
                console.warn(`Spell not found: ${sName}`);
                spellsList.push({ name: sName, level: 1, prepared: false, description: "Details not found." });
            }
        });

        const charData = {
            charID: crypto.randomUUID(),
            charName: name,
            charClass: selectedClass,
            level: selectedLevel,
            charSubclass: selectedSubclass || "",
            race: selectedSpecies || "",
            background: selectedBackground || "",
            str: scores.Strength,
            dex: scores.Dexterity,
            con: scores.Constitution,
            int: scores.Intelligence,
            wis: scores.Wisdom,
            cha: scores.Charisma,
            hp: hp,
            maxHp: hp,
            hitDice: `${selectedLevel}d${hitDie}`,
            profBonus: Math.ceil(selectedLevel / 4) + 1,
            classFeatures: features.filter(f => f.type === 'class'),
            raceFeatures: features.filter(f => f.type === 'race'),
            backgroundFeatures: features.filter(f => f.type === 'background'),
            feats: features.filter(f => f.type === 'feat'),
            
            skillProficiency,
            // New Fields
            inventory,
            cp, sp, ep, gp, pp,
            armorLight, armorMedium, armorHeavy, armorShield,
            weaponProfs: weaponProfs.join(", "),
            toolProfs: toolProfs.join(", "),
            spellAbility,
            spellSlotsData,
            cantripsList,
            spellsList,
            preparedSpellsList: []
        };

        localStorage.setItem('dndCharacter', JSON.stringify(charData));
        window.location.href = 'index.html';
    }
});