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
    let selectedSpecies = null;

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
    const nextBtn = document.getElementById('next-step-btn');
    nextBtn.addEventListener('click', () => {
        if (!selectedClass) {
            alert("Please select a class.");
            return;
        }

        const step3 = document.getElementById('step-3-section');
        if (step3.style.display === 'none') {
            step3.style.display = 'block';
            renderBackgroundOptions();
            renderSpeciesSection();
            renderAbilityScoreSection();
            step3.scrollIntoView({ behavior: 'smooth' });
            // nextBtn.textContent = "Finish"; // Optional: Change button text
        } else {
            console.log(`Selected: ${selectedClass}, Level: ${selectedLevel}, Subclass: ${selectedSubclass}, Background: ${selectedBackground}`);
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
            } else if (f.name.includes("Metamagic")) {
                renderOptionalFeatures(div, ["MM"], selectedClass, f.level, selectedSubclass);
            }

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
        if (!selectedSpecies) return;
        const candidates = allSpecies.filter(r => r.name === selectedSpecies);
        let race = candidates.find(r => r.source === 'XPHB') || candidates.find(r => r.source === 'PHB') || candidates[0];
        if (race && race._copy && !race.entries) { const orig = allSpecies.find(r => r.name === race._copy.name); if(orig) race = {...orig, ...race, entries: orig.entries}; }
        if (race && race.entries) { let desc = processEntries(race.entries); desc = desc.replace(/{@\w+\s*([^}]+)?}/g, (m, c) => c ? c.split('|')[0] : ""); container.innerHTML = desc; }
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
});