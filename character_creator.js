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
    let selectedOptionalFeatures = new Set();
    let selectedSpells = new Set();

    // DB Setup
    const DB_NAME = 'DndDataDB';
    const STORE_NAME = 'files';
    const DB_VERSION = 4;

    // Helper to process entries recursively
    const processEntries = (entries) => {
        if (!entries) return "";
        if (typeof entries === 'string') return entries;
        if (!Array.isArray(entries)) return "";
        
        return entries.map(e => {
            if (!e) return "";
            if (typeof e === 'string') return e;
            
            let text = "";
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
                if (!db.objectStoreNames.contains(STORE_NAME)) {
                    console.log(`[DB] Creating object store: ${STORE_NAME}`);
                    db.createObjectStore(STORE_NAME);
                }
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
                    try {
                        const json = JSON.parse(file.content);
                        if (json.data && Array.isArray(json.data)) processBookEntries(json.data);
                    } catch (e) {}
                });

                // Pass 2: Load Items
                data.forEach(file => {
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
                    } catch (e) {}
                });
                console.log("All Optional Features:", allOptionalFeatures);
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
    document.getElementById('next-step-btn').addEventListener('click', () => {
        if (!selectedClass) {
            alert("Please select a class.");
            return;
        }

        console.log(`Selected: ${selectedClass}, Level: ${selectedLevel}, Subclass: ${selectedSubclass}`);
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
            } else if (f.name.includes("Metamagic")) {
                renderOptionalFeatures(div, ["MM"], selectedClass, f.level, selectedSubclass);
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

    function renderClassTable() {
        const container = document.getElementById('creator-class-table');
        if (!container || !selectedClass) return;
        
        container.innerHTML = '';
        
        const clsObj = allClasses.find(c => c.name === selectedClass && c.source === currentClassSource);
        if (!clsObj) {
            container.innerHTML = '<div style="padding:10px;">Class data not found.</div>';
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
                    if (group.rows && group.rows[i-1]) {
                        group.rows[i-1].forEach(cellVal => {
                            const td = document.createElement('td');
                            let val = cellVal;
                            if (typeof cellVal === 'object' && cellVal !== null) {
                                if (cellVal.type === 'dice' && cellVal.toRoll) val = cellVal.toRoll.map(r => `${r.number || 1}d${r.faces}`).join('+');
                                else if (cellVal.value !== undefined) val = cellVal.value;
                            }
                            if (typeof val === 'object' && val !== null) val = JSON.stringify(val);
                            if (val === null || val === undefined) val = "-";
                            td.innerHTML = (val === 0 ? "-" : val).toString().replace(/\{@\w+\s*([^}]+)?\}/g, (m, c) => c ? c.split('|')[0] : "");
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

    function renderOptionalFeatures(parentElement, featureTypes, className, charLevel, subclass) {
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
                else selectedOptionalFeatures.add(opt.name);
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
});