/* =========================================
   UTILS.JS — Shared Utilities
   Loaded before script.js and character_creator.js
   ========================================= */

// ── IndexedDB Constants ──────────────────
window.DB_NAME    = 'DndDataDB';
window.STORE_NAME = 'files';
window.DB_VERSION = 7;

// ── IndexedDB Helper ─────────────────────
window.openDB = function () {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(window.DB_NAME, window.DB_VERSION);
        request.onerror      = () => { console.error('[DB] Open error:', request.error); reject(request.error); };
        request.onsuccess    = () => { console.log('[DB] Opened successfully.'); resolve(request.result); };
        request.onblocked    = () => alert('Database upgrade blocked. Please close other tabs with this site open and reload.');
        request.onupgradeneeded = (e) => {
            console.log(`[DB] Upgrade: ${e.oldVersion} → ${e.newVersion}`);
            const db = e.target.result;
            if (db.objectStoreNames.contains(window.STORE_NAME)) db.deleteObjectStore(window.STORE_NAME);
            db.createObjectStore(window.STORE_NAME);
        };
    });
};

// ── Math Helpers ─────────────────────────
window.calcMod   = (score) => Math.floor((score - 10) / 2);
window.formatMod = (mod)   => mod >= 0 ? `+${mod}` : `${mod}`;

// ── Equipment Packs ──────────────────────
window.EQUIPMENT_PACKS = {
    "burglar's pack":    ["Backpack", "Ball Bearings (bag of 1000)", "String (10 feet)", "Bell", "5 Candle", "Crowbar", "Hammer", "10 Piton", "Lantern, Hooded", "2 Oil (flask)", "5 Rations (1 day)", "Tinderbox", "Waterskin", "Rope, Hempen (50 feet)"],
    "diplomat's pack":   ["Chest", "2 Case, Map or Scroll", "Clothes, Fine", "Ink (1 ounce bottle)", "Ink Pen", "Lamp", "2 Oil (flask)", "5 Paper (one sheet)", "Perfume (vial)", "Sealing Wax", "Soap"],
    "dungeoneer's pack": ["Backpack", "Crowbar", "Hammer", "10 Piton", "10 Torch", "Tinderbox", "10 Rations (1 day)", "Waterskin", "Rope, Hempen (50 feet)"],
    "entertainer's pack":["Backpack", "Bedroll", "2 Costume", "5 Candle", "5 Rations (1 day)", "Waterskin", "Disguise Kit"],
    "explorer's pack":   ["Backpack", "Bedroll", "Mess Kit", "Tinderbox", "10 Torch", "10 Rations (1 day)", "Waterskin", "Rope, Hempen (50 feet)"],
    "priest's pack":     ["Backpack", "Blanket", "10 Candle", "Tinderbox", "Alms Box", "2 Incense (block)", "Censer", "Vestments", "2 Rations (1 day)", "Waterskin"],
    "scholar's pack":    ["Backpack", "Book of Lore", "Ink (1 ounce bottle)", "Ink Pen", "10 Parchment (one sheet)", "Sand (little bag)", "Small Knife"],
};

// ── Weapons Database ─────────────────
// Used as base data in character_creator; extended from IndexedDB in script.js
window.dndWeaponsDB = {
    "Club":           { type: "Simple",  cat: "Melee",  dmg: "1d4",  dtype: "bludgeoning", props: ["Light"],                                        mastery: "Slow"   },
    "Dagger":         { type: "Simple",  cat: "Melee",  dmg: "1d4",  dtype: "piercing",     props: ["Finesse", "Light", "Thrown (20/60)"],             mastery: "Nick"   },
    "Greatclub":      { type: "Simple",  cat: "Melee",  dmg: "1d8",  dtype: "bludgeoning", props: ["Two-Handed"],                                    mastery: "Push"   },
    "Handaxe":        { type: "Simple",  cat: "Melee",  dmg: "1d6",  dtype: "slashing",     props: ["Light", "Thrown (20/60)"],                       mastery: "Vex"    },
    "Javelin":        { type: "Simple",  cat: "Melee",  dmg: "1d6",  dtype: "piercing",     props: ["Thrown (30/120)"],                               mastery: "Slow"   },
    "Light Hammer":   { type: "Simple",  cat: "Melee",  dmg: "1d4",  dtype: "bludgeoning", props: ["Light", "Thrown (20/60)"],                       mastery: "Nick"   },
    "Mace":           { type: "Simple",  cat: "Melee",  dmg: "1d6",  dtype: "bludgeoning", props: [],                                               mastery: "Sap"    },
    "Quarterstaff":   { type: "Simple",  cat: "Melee",  dmg: "1d6",  dtype: "bludgeoning", props: ["Versatile (1d8)"],                               mastery: "Topple" },
    "Sickle":         { type: "Simple",  cat: "Melee",  dmg: "1d4",  dtype: "slashing",     props: ["Light"],                                        mastery: "Nick"   },
    "Spear":          { type: "Simple",  cat: "Melee",  dmg: "1d6",  dtype: "piercing",     props: ["Thrown (20/60)", "Versatile (1d8)"],             mastery: "Sap"    },
    "Light Crossbow": { type: "Simple",  cat: "Ranged", dmg: "1d8",  dtype: "piercing",     props: ["Ammunition (80/320)", "Loading", "Two-Handed"],  mastery: "Slow"   },
    "Dart":           { type: "Simple",  cat: "Ranged", dmg: "1d4",  dtype: "piercing",     props: ["Finesse", "Thrown (20/60)"],                     mastery: "Vex"    },
    "Shortbow":       { type: "Simple",  cat: "Ranged", dmg: "1d6",  dtype: "piercing",     props: ["Ammunition (80/320)", "Two-Handed"],             mastery: "Vex"    },
    "Sling":          { type: "Simple",  cat: "Ranged", dmg: "1d4",  dtype: "bludgeoning", props: ["Ammunition (30/120)"],                           mastery: "Slow"   },
    "Battleaxe":      { type: "Martial", cat: "Melee",  dmg: "1d8",  dtype: "slashing",     props: ["Versatile (1d10)"],                              mastery: "Topple" },
    "Flail":          { type: "Martial", cat: "Melee",  dmg: "1d8",  dtype: "bludgeoning", props: [],                                               mastery: "Sap"    },
    "Glaive":         { type: "Martial", cat: "Melee",  dmg: "1d10", dtype: "slashing",     props: ["Heavy", "Reach", "Two-Handed"],                 mastery: "Graze"  },
    "Greataxe":       { type: "Martial", cat: "Melee",  dmg: "1d12", dtype: "slashing",     props: ["Heavy", "Two-Handed"],                          mastery: "Cleave" },
    "Greatsword":     { type: "Martial", cat: "Melee",  dmg: "2d6",  dtype: "slashing",     props: ["Heavy", "Two-Handed"],                          mastery: "Graze"  },
    "Halberd":        { type: "Martial", cat: "Melee",  dmg: "1d10", dtype: "slashing",     props: ["Heavy", "Reach", "Two-Handed"],                 mastery: "Cleave" },
    "Lance":          { type: "Martial", cat: "Melee",  dmg: "1d12", dtype: "piercing",     props: ["Reach", "Special"],                             mastery: "Topple" },
    "Longsword":      { type: "Martial", cat: "Melee",  dmg: "1d8",  dtype: "slashing",     props: ["Versatile (1d10)"],                              mastery: "Sap"    },
    "Maul":           { type: "Martial", cat: "Melee",  dmg: "2d6",  dtype: "bludgeoning", props: ["Heavy", "Two-Handed"],                          mastery: "Topple" },
    "Morningstar":    { type: "Martial", cat: "Melee",  dmg: "1d8",  dtype: "piercing",     props: [],                                               mastery: "Sap"    },
    "Pike":           { type: "Martial", cat: "Melee",  dmg: "1d10", dtype: "piercing",     props: ["Heavy", "Reach", "Two-Handed"],                 mastery: "Push"   },
    "Rapier":         { type: "Martial", cat: "Melee",  dmg: "1d8",  dtype: "piercing",     props: ["Finesse"],                                      mastery: "Vex"    },
    "Scimitar":       { type: "Martial", cat: "Melee",  dmg: "1d6",  dtype: "slashing",     props: ["Finesse", "Light"],                             mastery: "Nick"   },
    "Shortsword":     { type: "Martial", cat: "Melee",  dmg: "1d6",  dtype: "piercing",     props: ["Finesse", "Light"],                             mastery: "Vex"    },
    "Trident":        { type: "Martial", cat: "Melee",  dmg: "1d6",  dtype: "piercing",     props: ["Thrown (20/60)", "Versatile (1d8)"],             mastery: "Topple" },
    "War Pick":       { type: "Martial", cat: "Melee",  dmg: "1d8",  dtype: "piercing",     props: [],                                               mastery: "Sap"    },
    "Warhammer":      { type: "Martial", cat: "Melee",  dmg: "1d8",  dtype: "bludgeoning", props: ["Versatile (1d10)"],                              mastery: "Push"   },
    "Whip":           { type: "Martial", cat: "Melee",  dmg: "1d4",  dtype: "slashing",     props: ["Finesse", "Reach"],                             mastery: "Slow"   },
    "Blowgun":        { type: "Martial", cat: "Ranged", dmg: "1",    dtype: "piercing",     props: ["Ammunition (25/100)", "Loading"],               mastery: "Vex"    },
    "Hand Crossbow":  { type: "Martial", cat: "Ranged", dmg: "1d6",  dtype: "piercing",     props: ["Ammunition (30/120)", "Light", "Loading"],      mastery: "Vex"    },
    "Heavy Crossbow": { type: "Martial", cat: "Ranged", dmg: "1d10", dtype: "piercing",     props: ["Ammunition (100/400)", "Heavy", "Loading", "Two-Handed"], mastery: "Push" },
    "Longbow":        { type: "Martial", cat: "Ranged", dmg: "1d8",  dtype: "piercing",     props: ["Ammunition (150/600)", "Heavy", "Two-Handed"],  mastery: "Slow"   },
    "Net":            { type: "Martial", cat: "Ranged", dmg: "0",    dtype: "-",            props: ["Special", "Thrown (5/15)"],                     mastery: null     },
    "Musket":         { type: "Martial", cat: "Ranged", dmg: "1d12", dtype: "piercing",     props: ["Ammunition (40/120)", "Loading", "Two-Handed"], mastery: "Slow"   },
    "Pistol":         { type: "Martial", cat: "Ranged", dmg: "1d10", dtype: "piercing",     props: ["Ammunition (30/90)", "Loading"],                mastery: "Vex"    },
};

// ── Entry Renderer ───────────────────
window.processEntries = function (entries, depth) {
    depth = depth || 0;
    if (!entries) return "";
    if (typeof entries === 'string') return entries;
    if (Array.isArray(entries))
        return entries.map(e => window.processEntries(e, depth)).filter(Boolean).join("<br><br>");

    const entry = entries;
    const type  = entry.type || 'entries';
    let result  = '';

    switch (type) {
        case 'entries':
        case 'section':
        case 'item':
            if (entry.name)    result += `<strong>${entry.name}.</strong> `;
            if (entry.entries) result += window.processEntries(entry.entries, depth + 1);
            else if (entry.entry) result += window.processEntries(entry.entry, depth + 1);
            break;

        case 'list':
            if (entry.name) result += `<strong>${entry.name}</strong>`;
            result += "<ul style='padding-left:20px; margin:5px 0;'>";
            if (entry.items) result += entry.items.map(i => `<li>${window.processEntries(i, depth + 1)}</li>`).join('');
            result += "</ul>";
            break;

        case 'table':
            if (entry.caption) result += `<strong>${entry.caption}</strong>`;
            result += "<div style='overflow-x:auto;'><table class='currency-table' style='width:100%; font-size:0.8rem; margin-top:5px;'>";
            if (entry.colLabels)
                result += "<thead><tr>" + entry.colLabels.map(l => `<th>${window.processEntries(l, depth)}</th>`).join('') + "</tr></thead>";
            if (entry.rows)
                result += "<tbody>" + entry.rows.map(row =>
                    "<tr>" + row.map(cell => {
                        const c = (typeof cell === 'object' && cell.roll) ? `${cell.roll.min}-${cell.roll.max}` : cell;
                        return `<td>${window.processEntries(c, depth)}</td>`;
                    }).join('') + "</tr>"
                ).join('') + "</tbody>";
            result += "</table></div>";
            break;

        case 'inset':
        case 'insetReadaloud':
        case 'quote':
            result += "<div style='background:rgba(0,0,0,0.05); padding:10px; border-left:3px solid var(--gold); margin:10px 0;'>";
            if (entry.name)    result += `<strong>${entry.name}</strong><br>`;
            if (entry.entries) result += window.processEntries(entry.entries, depth + 1);
            if (entry.by)      result += `<div style='text-align:right; font-style:italic;'>— ${entry.by}</div>`;
            result += "</div>";
            break;

        case 'refFeat':             return `<strong>Feat:</strong> ${entry.feat || ''}`;
        case 'refOptionalfeature':  return `<strong>Option:</strong> ${entry.optionalfeature || ''}`;
        case 'refClassFeature':     return '';
        case 'refSubclassFeature':  return '';
        case 'refSpell':            return `<strong>Spell:</strong> ${entry.spell || ''}`;

        default:
            if (entry.name)    result += `<strong>${entry.name}.</strong> `;
            if (entry.entries) result += window.processEntries(entry.entries, depth + 1);
            else if (entry.entry) result += window.processEntries(entry.entry, depth + 1);
            else if (entry.text)  result += entry.text;
            break;
    }
    return result;
};

// ── Tag Cleaner ──────────────────────
window.cleanText = function (str) {
    if (!str) return "";
    const cleaned = str.replace(/\{@(\w+)\s*([^}]+)?\}/g, (match, tag, content) => {
        if (tag === 'recharge') return content ? `(Recharge ${content}-6)` : "(Recharge 6)";
        if (!content) return "";
        const parts = content.split('|');
        const name  = parts[0];

        if (tag === 'h') return "Hit: ";
        if (tag === 'm') return "Miss: ";
        if (tag === 'atk') {
            const map = { m: "Melee Attack: ", r: "Ranged Attack: ", mw: "Melee Weapon Attack: ", rw: "Ranged Weapon Attack: ", ms: "Melee Spell Attack: ", rs: "Ranged Spell Attack: " };
            return map[name] || "Attack: ";
        }
        if (tag === 'b' || tag === 'bold')   return `<b>${name}</b>`;
        if (tag === 'i' || tag === 'italic') return `<i>${name}</i>`;
        if (tag === 'dc')     return `DC ${name}`;
        if (tag === 'hit')    return `+${name}`;
        if (tag === 'chance') return parts[1] || `${name}%`;
        if (tag === 'note')   return `Note: ${name}`;
        if (tag === 'table') {
            const tableName = name.split(';')[0].trim();
            if (window.dndTablesDB?.[tableName]) return window.processEntries(window.dndTablesDB[tableName]);
            return tableName;
        }
        if (tag === 'filter') return name.split(';')[0].trim();
        if (parts.length >= 3 && parts[2]) return parts[2];
        return name;
    });
    // Recurse if nested tags remain
    return /\{@\w+/.test(cleaned) ? window.cleanText(cleaned) : cleaned;
};

// ── Mobile View Mover ────────────────────
// Returns a moveEl(el) function that teleports DOM elements into a mobile view,
// leaving an invisible placeholder so they can be restored later.
// attrKey: camelCase dataset key used to track moved elements (e.g. 'defMoved')
window.createViewMover = function (targetView, attrKey) {
    return function moveEl(el) {
        if (!el || el.dataset[attrKey]) return;
        const ph = document.createElement('div');
        ph.id    = attrKey + '-ph-' + Math.random().toString(36).slice(2);
        ph.style.display = 'none';
        el.parentNode.insertBefore(ph, el);
        el.dataset[attrKey] = ph.id;
        targetView.appendChild(el);
    };
};
