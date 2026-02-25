/* =========================================
   1. CONSTANTS & DATA
   ========================================= */
const abilities = ["str", "dex", "con", "int", "wis", "cha"];

const skillsMap = {
  athletics: "str",
  acrobatics: "dex",
  sleight_of_hand: "dex",
  stealth: "dex",
  arcana: "int",
  history: "int",
  investigation: "int",
  nature: "int",
  religion: "int",
  animal_handling: "wis",
  insight: "wis",
  medicine: "wis",
  perception: "wis",
  survival: "wis",
  deception: "cha",
  intimidation: "cha",
  performance: "cha",
  persuasion: "cha",
};

const skillDescriptions = {
  athletics:
    "Covers difficult situations you encounter while climbing, jumping, or swimming.",
  acrobatics:
    "Covers your attempt to stay on your feet in a tricky situation (ice, tightrope, etc).",
  sleight_of_hand:
    "Checks manual trickery, such as planting something on someone else.",
  stealth: "Covers your ability to conceal yourself from enemies.",
  arcana:
    "Measures your ability to recall lore about spells, magic items, and planes.",
  history: "Measures your ability to recall lore about historical events.",
  investigation: "Looks around for clues and makes deductions based on them.",
  nature:
    "Measures your ability to recall lore about terrain, plants, and animals.",
  religion: "Measures your ability to recall lore about deities and rites.",
  animal_handling: "Checks your ability to calm down a domesticated animal.",
  insight:
    "Decides whether you can determine the true intentions of a creature.",
  medicine:
    "Allows you to try to stabilize a dying companion or diagnose an illness.",
  perception:
    "Lets you spot, hear, or otherwise detect the presence of something.",
  survival: "Allows you to follow tracks, hunt wild game, and predict weather.",
  deception: "Determines whether you can convincingly hide the truth.",
  intimidation: "Allows you to influence others through overt threats.",
  performance: "Determines how well you can delight an audience.",
  persuasion: "Attempts to influence someone with tact and social graces.",
  save_str:
    "Used to resist a force that would physically move or bind you (e.g. gusts of wind, nets, entanglement).",
  save_dex:
    "Used to dodge out of harm's way (e.g. fireballs, lightning bolts, breath weapons, traps).",
  save_con:
    "Used to endure a toxic or physically taxing effect (e.g. poison, disease, concentration checks).",
  save_int:
    "Used to disbelieve certain illusions or resist mental assaults that rely on logic, memory, or psyche.",
  save_wis:
    "Used to resist effects that charm, frighten, or assault your willpower and senses (e.g. domination).",
  save_cha:
    "Used to withstand effects, such as possession or banishment, that would subsume your personality or hurl you to another plane.",
};

const xpTable = [
  { xp: 0, lvl: 1, prof: 2 },
  { xp: 300, lvl: 2, prof: 2 },
  { xp: 900, lvl: 3, prof: 2 },
  { xp: 2700, lvl: 4, prof: 2 },
  { xp: 6500, lvl: 5, prof: 3 },
  { xp: 14000, lvl: 6, prof: 3 },
  { xp: 23000, lvl: 7, prof: 3 },
  { xp: 34000, lvl: 8, prof: 3 },
  { xp: 48000, lvl: 9, prof: 4 },
  { xp: 64000, lvl: 10, prof: 4 },
  { xp: 85000, lvl: 11, prof: 4 },
  { xp: 100000, lvl: 12, prof: 4 },
  { xp: 120000, lvl: 13, prof: 5 },
  { xp: 140000, lvl: 14, prof: 5 },
  { xp: 165000, lvl: 15, prof: 5 },
  { xp: 195000, lvl: 16, prof: 5 },
  { xp: 225000, lvl: 17, prof: 6 },
  { xp: 265000, lvl: 18, prof: 6 },
  { xp: 305000, lvl: 19, prof: 6 },
  { xp: 355000, lvl: 20, prof: 6 },
];

// Weapon Proficiencies Data
const weaponProficiencyOptions = [
  {
    category: "Categories",
    items: ["Simple Weapons", "Martial Weapons", "Firearms", "Shields"],
  },
  {
    category: "Properties/Groups",
    items: [
      "Finesse Weapons",
      "Heavy Weapons",
      "Light Weapons",
      "Reach Weapons",
      "Thrown Weapons",
      "Versatile Weapons",
    ],
  },
];

// Weapon DB
let dndWeaponsDB = {};
window.dndTablesDB = {};

const conditionsDB = {
  Blinded:
    "You can't see. Attacks against you have Advantage. Your attacks have Disadvantage.",
  Charmed:
    "You can't attack the charmer. The charmer has Advantage on social checks against you.",
  Deafened: "You can't hear. You fail checks involving hearing.",
  Exhaustion:
    "Suffering from levels of exhaustion. 1: Disadv on checks. 2: Speed halved. 3: Disadv on attacks/saves. 4: HP max halved. 5: Speed 0. 6: Death.",
  Frightened:
    "Disadvantage on checks/attacks while source of fear is visible. Can't move closer to source.",
  Grappled:
    "Speed is 0. Ends if grappler is incapacitated or you are moved away.",
  Incapacitated: "You can't take actions or reactions.",
  Invisible:
    "You can't be seen. You have Advantage on attacks. Attacks against you have Disadvantage.",
  Paralyzed:
    "Incapacitated. Can't move/speak. Auto-fail Str/Dex saves. Attacks against you have Advantage and are crits if within 5ft.",
  Petrified:
    "Transformed to stone. Incapacitated. Resistant to all damage. Immune to poison/disease.",
  Poisoned: "Disadvantage on attack rolls and ability checks.",
  Prone:
    "Move at half speed. Attacks have Disadvantage. Melee attacks against you have Advantage; Ranged have Disadvantage.",
  Restrained:
    "Speed is 0. Attacks against you have Advantage. Your attacks have Disadvantage. Disadvantage on Dex saves.",
  Stunned:
    "Incapacitated. Can't move/speak. Fails Str/Dex saves. Attacks against you have Advantage.",
  Unconscious:
    "Incapacitated. Drop held items. Prone. Auto-fail Str/Dex saves. Attacks against you have Advantage and are crits if within 5ft.",
};
window.conditionsDB = { ...conditionsDB };

const conditionIcons = {
  Blinded: "🙈",
  Charmed: "❤️",
  Deafened: "🙉",
  Exhaustion: "😫",
  Frightened: "😱",
  Grappled: "🤼",
  Incapacitated: "🤕",
  Invisible: "👻",
  Paralyzed: "⚡",
  Petrified: "🗿",
  Poisoned: "🤢",
  Prone: "🛌",
  Restrained: "⛓️",
  Stunned: "💫",
  Unconscious: "💤",
};

// State Variables
const skillProficiency = {};
const saveProficiency = {};
const advantageState = { skills: {}, saves: {}, initiative: false };
const deathSaves = {
  successes: [false, false, false],
  failures: [false, false, false],
};
let spellSlotsData = [{ level: 1, total: 1, used: 0 }];
let resourcesData = [];
let pbScores = { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 };
const pbCosts = { 8: 0, 9: 1, 10: 2, 11: 3, 12: 4, 13: 5, 14: 7, 15: 9 };
const maxPoints = 27;
window.characterClasses = []; // Stores {name, subclass, level}

window.isInitializing = true;

/* =========================================
      2. FUNCTIONS
      ========================================= */

function calcMod(score) {
  return Math.floor((score - 10) / 2);
}
function formatMod(mod) {
  return mod >= 0 ? `+${mod}` : `${mod}`;
}

// Helper to process entries recursively (Global)
window.processEntries = function (entries) {
  if (!entries) return "";
  if (typeof entries === "string") return entries;
  if (Array.isArray(entries))
    return entries.map((e) => window.processEntries(e)).filter(e => e).join("<br><br>");

  if (entries.type === "list") {
    return (
      "<ul style='padding-left: 20px; margin: 5px 0;'>" +
      (entries.items || [])
        .map((i) => `<li>${window.processEntries(i)}</li>`)
        .join("") +
      "</ul>"
    );
  }
  if (entries.type === "table") {
    let html =
      "<div style='overflow-x:auto;'><table class='currency-table' style='width:100%; font-size:0.8rem; margin-top:5px;'>";
    if (entries.colLabels) {
      html +=
        "<thead><tr>" +
        entries.colLabels
          .map((l) => `<th>${window.processEntries(l)}</th>`)
          .join("") +
        "</tr></thead>";
    }
    if (entries.rows) {
      html +=
        "<tbody>" +
        entries.rows
          .map(
            (row) =>
              "<tr>" +
              row
                .map((cell) => `<td>${window.processEntries(cell)}</td>`)
                .join("") +
              "</tr>",
          )
          .join("") +
        "</tbody>";
    }
    html += "</table></div>";
    return html;
  }

  if (entries.type === "refFeat") return `<strong>Feat:</strong> {@feat ${entries.feat}}`;
  if (entries.type === "refOptionalfeature") return `<strong>Option:</strong> {@optionalfeature ${entries.optionalfeature}}`;
  if (entries.type === "refClassFeature") return "";
  if (entries.type === "refSubclassFeature") return "";
  if (entries.type === "refSpell") return `<strong>Spell:</strong> {@spell ${entries.spell}}`;

  let text = "";
  if (entries.name) text += `<strong>${entries.name}.</strong> `;
  if (entries.entries) text += window.processEntries(entries.entries);
  else if (entries.entry) text += window.processEntries(entries.entry);
  return text || entries.text || "";
};

// Helper to clean 5e-tools style tags (Global)
window.cleanText = function (str) {
  if (!str) return "";
  let cleaned = str.replace(/\{@(\w+)\s*([^}]+)?\}/g, (match, tag, content) => {
    if (tag === 'recharge') return content ? `(Recharge ${content}-6)` : "(Recharge 6)";
    
    if (!content) return "";
    const parts = content.split('|');
    const name = parts[0];

    if (tag === 'h') return "Hit: ";
    if (tag === 'm') return "Miss: ";
    if (tag === 'atk') {
        if (name === 'm') return "Melee Attack: ";
        if (name === 'r') return "Ranged Attack: ";
        if (name === 'mw') return "Melee Weapon Attack: ";
        if (name === 'rw') return "Ranged Weapon Attack: ";
        if (name === 'ms') return "Melee Spell Attack: ";
        if (name === 'rs') return "Ranged Spell Attack: ";
        return "Attack: ";
    }
    if (tag === 'b' || tag === 'bold') return `<b>${name}</b>`;
    if (tag === 'i' || tag === 'italic') return `<i>${name}</i>`;
    if (tag === 'dc') return `DC ${name}`;
    if (tag === 'hit') return `+${name}`;
    if (tag === 'chance') return `${parts[1] || name + '%'}`;
    if (tag === 'note') return `Note: ${name}`;

    if (tag === 'table') {
        const tableName = name.split(';')[0].trim();
        if (window.dndTablesDB && window.dndTablesDB[tableName]) {
            return window.processEntries(window.dndTablesDB[tableName]);
        }
        return tableName;
    }
    if (tag === 'filter') return name.split(';')[0].trim();
    
    // Generic handler for pipe-separated content (name|source|display)
    // If there's a display text (usually 3rd arg), use it. Otherwise use name.
    if (parts.length >= 3 && parts[2]) return parts[2];
    return name;
  });

  if (cleaned !== str && /\{@(\w+)\s*([^}]+)?\}/.test(cleaned)) {
      return window.cleanText(cleaned);
  }
  return cleaned;
};

// Auto-resize logic
function autoResizeTextarea(element) {
  element.style.height = "auto";
  element.style.height = element.scrollHeight + "px";
}
document.addEventListener("input", function (event) {
  if (
    event.target.tagName.toLowerCase() === "textarea" &&
    event.target.id !== "lastSavedTextarea" &&
    !event.target.classList.contains("note-textarea")
  ) {
    autoResizeTextarea(event.target);
  }
});
function resizeAllTextareas() {
  document
    .querySelectorAll("textarea:not(#lastSavedTextarea)")
    .forEach(autoResizeTextarea);
}

// Update Logic
window.updateModifiers = function () {
  const profBonusStr = document.getElementById("profBonus").value;
  const profBonus = parseInt(profBonusStr.replace(/[^0-9-]/g, '')) || 0;
  abilities.forEach((ability) => {
    const score = parseInt(document.getElementById(ability).value) || 10;
    const mod = calcMod(score);
    document.getElementById(`${ability}Mod`).value = formatMod(mod);
    const isSaveProf = saveProficiency[ability] || false;
    const saveTotal = mod + (isSaveProf ? profBonus : 0);
    const saveEl = document.getElementById(`saveMod_${ability}`);
    if (saveEl) saveEl.textContent = formatMod(saveTotal);
  });
  Object.keys(skillsMap).forEach((skillName) => {
    const ability = skillsMap[skillName];
    const abilityScore = parseInt(document.getElementById(ability).value) || 10;
    const abilityMod = calcMod(abilityScore);
    const isProf = skillProficiency[skillName] || false;
    const total = abilityMod + (isProf ? profBonus : 0);
    const skillEl = document.getElementById(`skillMod_${skillName}`);
    if (skillEl) skillEl.textContent = formatMod(total);
  });
  updateCombatStats();
  updateSpellDC();
  updateAllWeaponStats();
};

window.updateAllWeaponStats = function () {
  const str = parseInt(document.getElementById("str").value) || 10;
  const dex = parseInt(document.getElementById("dex").value) || 10;
  const strMod = Math.floor((str - 10) / 2);
  const dexMod = Math.floor((dex - 10) / 2);
  const profBonusStr = document.getElementById("profBonus").value;
  const profBonus = parseInt(profBonusStr.replace(/[^0-9-]/g, '')) || 2;
  const profString = document.getElementById("weaponProfs").value || "";

  document.querySelectorAll(".weapon-item").forEach((row) => {
    const nameInput = row.querySelector(".weapon-name");
    const weaponName = nameInput.value;
    const weaponData = dndWeaponsDB[weaponName];
    if (!weaponData) return;
    let abilityMod = strMod;
    if (weaponData.props.includes("Finesse")) {
      abilityMod = Math.max(strMod, dexMod);
    } else if (
      weaponData.cat === "Ranged" &&
      !weaponData.props.some((p) => p.includes("Thrown"))
    ) {
      abilityMod = dexMod;
    }

    let isProficient = false;
    if (weaponData.type === "Simple" && profString.includes("Simple Weapons"))
      isProficient = true;
    if (weaponData.type === "Martial" && profString.includes("Martial Weapons"))
      isProficient = true;
    if (profString.includes(weaponName)) isProficient = true;

    const totalAtk = abilityMod + (isProficient ? profBonus : 0);
    const totalDmg = abilityMod;
    const atkString = totalAtk >= 0 ? `+${totalAtk}` : `${totalAtk}`;
    const dmgString = `${weaponData.dmg} ${totalDmg >= 0 ? "+" : ""}${totalDmg} ${weaponData.dtype}`;
    row.querySelector(".weapon-atk").value = atkString;
    row.querySelector(".weapon-damage").value = dmgString;
  });
  saveCharacter();
};

function updateCombatStats() {
  const dexScore = parseInt(document.getElementById("dex").value) || 10;
  document.getElementById("initiative").value = formatMod(calcMod(dexScore));
}

function updateSpellDC() {
  const spellAbilityEl = document.getElementById("spellAbility");
  if (!spellAbilityEl) return;
  const spellAbility = spellAbilityEl.value;
  if (!spellAbility) return;

  const abilityInput = document.getElementById(spellAbility);
  if (!abilityInput) return;

  const abilityScore = parseInt(abilityInput.value) || 10;
  const abilityMod = calcMod(abilityScore);
  const profBonusStr = document.getElementById("profBonus").value;
  const profBonus = parseInt(profBonusStr.replace(/[^0-9-]/g, '')) || 0;

  const dcEl = document.getElementById("spellDC");
  if (dcEl) dcEl.value = 8 + profBonus + abilityMod;

  const totalAtk = abilityMod + profBonus;
  const atkEl = document.getElementById("spellAttackBonus");
  if (atkEl) {
    if (atkEl.tagName === "INPUT" || atkEl.tagName === "TEXTAREA") {
      if (atkEl.type === "number") atkEl.value = totalAtk;
      else atkEl.value = totalAtk >= 0 ? `+${totalAtk}` : totalAtk;
    } else {
      atkEl.textContent = totalAtk >= 0 ? `+${totalAtk}` : totalAtk;
    }
  }

  const modEl = document.getElementById("spellAttackMod");
  if (modEl) {
    if (modEl.tagName === "INPUT" || modEl.tagName === "TEXTAREA") {
      if (modEl.type === "number") modEl.value = abilityMod;
      else modEl.value = abilityMod >= 0 ? `+${abilityMod}` : abilityMod;
    } else {
      modEl.textContent = abilityMod >= 0 ? `+${abilityMod}` : abilityMod;
    }
  }

  saveCharacter();
}

window.calculateTotalAC = function () {
  const acInput = document.getElementById("baseAC");
  const shieldBox = document.getElementById("shieldEquipped");
  let currentVal = parseInt(acInput.value) || 10;
  if (shieldBox.checked) {
    acInput.value = currentVal + 2;
  } else {
    acInput.value = currentVal - 2;
  }
  saveCharacter();
};

window.calculateWeight = function () {
  let total = 0;
  document.querySelectorAll(".inventory-item").forEach((row) => {
    const qty = parseFloat(row.querySelector(".qty-field").value) || 0;
    const weight = parseFloat(row.querySelector(".weight-field").value) || 0;
    total += qty * weight;
  });
  const strScore = parseInt(document.getElementById("str").value) || 0;
  const sizeSelect = document.getElementById("charSize");
  const size = sizeSelect ? sizeSelect.value : "Medium";
  let multiplier = 15;
  switch (size) {
    case "Tiny":
      multiplier = 7.5;
      break;
    case "Large":
      multiplier = 30;
      break;
    case "Huge":
      multiplier = 60;
      break;
    case "Gargantuan":
      multiplier = 120;
      break;
  }
  const maxCapacity = Math.floor(strScore * multiplier);
  document.getElementById("totalWeightVal").textContent = total.toFixed(1);
  document.getElementById("maxWeightVal").textContent = maxCapacity;
  const dragSpan = document.getElementById("maxDragVal");
  if (dragSpan) dragSpan.textContent = maxCapacity * 2;

  const weightBox = document.querySelector(".total-weight-box");
  if (total > maxCapacity) {
    weightBox.style.color = "#8b0000";
    weightBox.style.borderColor = "#8b0000";
    weightBox.style.backgroundColor = "#ffdddd";
    weightBox.style.fontWeight = "800";
  } else {
    weightBox.style.color = "var(--ink)";
    weightBox.style.borderColor = "var(--gold)";
    weightBox.style.backgroundColor = "var(--parchment-dark)";
    weightBox.style.fontWeight = "700";
  }
};

// HP & Toggles
window.updateHpBar = function () {
  const current = parseInt(document.getElementById("hp").value) || 0;
  const max = parseInt(document.getElementById("maxHp").value) || 1;
  const temp = parseInt(document.getElementById("tempHp").value) || 0;
  
  // If using DDB Box, these might not exist, so check first
  const hpBarCurrent = document.getElementById("hpBarCurrent");
  const hpBarTemp = document.getElementById("hpBarTemp");
  
  if (hpBarCurrent && hpBarTemp) {
  const currentPct = Math.min(100, Math.max(0, (current / max) * 100));
  const tempPct = Math.min(100, (temp / max) * 100);
  if (current >= max) {
    hpBarCurrent.style.width = `${currentPct}%`;
    hpBarTemp.style.width = `${tempPct}%`;
    hpBarTemp.style.left = "0%";
  } else {
    hpBarCurrent.style.width = `${currentPct}%`;
    hpBarTemp.style.width = `${Math.min(tempPct, 100 - currentPct)}%`;
    hpBarTemp.style.left = `${currentPct}%`;
  }
  }
  
  const textDisplay = document.getElementById("hpTextDisplay");
  if (textDisplay) {
      textDisplay.textContent = current + (temp > 0 ? ` (+${temp})` : "");
      document.getElementById("maxHpTextDisplay").textContent = max;
  }

  // Sync DDB Box if present
  const ddbHp = document.getElementById("ddb-hp");
  const ddbMax = document.getElementById("ddb-maxHp");
  const ddbTemp = document.getElementById("ddb-tempHp");
  if (ddbHp) ddbHp.value = current;
  if (ddbMax) ddbMax.value = max;
  if (ddbTemp) ddbTemp.value = temp;
};

window.adjustHP = function (amount) {
  const hpInput = document.getElementById("hp");
  const maxHpInput = document.getElementById("maxHp");
  let val = (parseInt(hpInput.value) || 0) + amount;
  const max = parseInt(maxHpInput.value) || 1;
  if (val < 0) val = 0;
  if (val > max) val = max;
  hpInput.value = val;
  updateHpBar();
  saveCharacter();
};
window.adjustTempHP = function (amount) {
  const tempInput = document.getElementById("tempHp");
  let val = (parseInt(tempInput.value) || 0) + amount;
  if (val < 0) val = 0;
  tempInput.value = val;
  updateHpBar();
  saveCharacter();
};

window.openHpManagementModal = function() {
    let modal = document.getElementById('hpManageModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'hpManageModal';
        modal.className = 'info-modal-overlay';
        modal.innerHTML = `
            <div class="info-modal-content" style="max-width: 350px; text-align: center;">
                <button class="close-modal-btn" onclick="window.closeHpManageModal()">&times;</button>
                <h3 class="info-modal-title">Manage HP</h3>
                <div style="margin-bottom: 15px;">
                    <input type="number" id="hpManageAmount" placeholder="Amount" style="font-size: 2rem; width: 100%; text-align: center; border: 2px solid var(--gold); border-radius: 8px; padding: 10px; font-weight: bold; color: var(--red-dark);">
                </div>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px;">
                    <button class="btn" style="background: #8b0000; border-color: #500;" onclick="window.applyHpChange('damage')">Damage</button>
                    <button class="btn" style="background: #2d6a4f; border-color: #1b4332;" onclick="window.applyHpChange('heal')">Heal</button>
                </div>
                <button class="btn btn-secondary" style="width: 100%;" onclick="window.applyHpChange('temp')">Set Temp HP</button>
            </div>
        `;
        document.body.appendChild(modal);
        
        const input = document.getElementById('hpManageAmount');
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') window.applyHpChange('damage'); 
        });
    }
    document.getElementById('hpManageAmount').value = '';
    modal.style.display = 'flex';
    setTimeout(() => document.getElementById('hpManageAmount').focus(), 50);
};

window.closeHpManageModal = function() {
    const modal = document.getElementById('hpManageModal');
    if (modal) modal.style.display = 'none';
};

window.applyHpChange = function(type) {
    const amountInput = document.getElementById('hpManageAmount');
    const val = parseInt(amountInput.value);
    if (isNaN(val) || val < 0) return;

    const hpInput = document.getElementById("hp");
    const maxHpInput = document.getElementById("maxHp");
    const tempHpInput = document.getElementById("tempHp");
    
    let currentHp = parseInt(hpInput.value) || 0;
    let maxHp = parseInt(maxHpInput.value) || 1;
    let tempHp = parseInt(tempHpInput.value) || 0;

    if (type === 'heal') {
        currentHp += val;
        if (currentHp > maxHp) currentHp = maxHp;
    } else if (type === 'damage') {
        let damage = val;
        if (tempHp > 0) {
            const absorbed = Math.min(tempHp, damage);
            tempHp -= absorbed;
            damage -= absorbed;
        }
        currentHp -= damage;
        if (currentHp < 0) currentHp = 0;
    } else if (type === 'temp') {
        tempHp = val;
    }

    hpInput.value = currentHp;
    tempHpInput.value = tempHp;
    
    window.updateHpBar();
    window.saveCharacter();
    window.closeHpManageModal();
};

window.toggleSkill = function (skillName) {
  skillProficiency[skillName] = !skillProficiency[skillName];
  document
    .getElementById(`skillCheck_${skillName}`)
    ?.classList.toggle("checked", skillProficiency[skillName]);
  updateModifiers();
  saveCharacter();
};
window.toggleSave = function (ability) {
  saveProficiency[ability] = !saveProficiency[ability];
  document
    .getElementById(`saveCheck_${ability}`)
    ?.classList.toggle("checked", saveProficiency[ability]);
  updateModifiers();
  saveCharacter();
};
window.toggleDeathSave = function (type, index) {
  const arr = type === "success" ? deathSaves.successes : deathSaves.failures;
  arr[index] = !arr[index];
  document
    .getElementById(
      type === "success" ? `deathSuccess${index}` : `deathFailure${index}`,
    )
    .classList.toggle("checked", arr[index]);
  saveCharacter();
};
window.switchTab = function (tabName) {
  document
    .querySelectorAll(".tab-content")
    .forEach((c) => c.classList.remove("active"));
  document
    .querySelectorAll(".tab")
    .forEach((t) => t.classList.remove("active"));
  const content = document.getElementById(tabName);
  if (content) {
    content.classList.add("active");
    content.querySelectorAll("textarea").forEach(autoResizeTextarea);
  }

  // Find the tab button that controls this tab and activate it
  const tabBtn = document.querySelector(`.tab[onclick*="'${tabName}'"]`);
  if (tabBtn) tabBtn.classList.add("active");
  saveCharacter();
};

window.addFeatureItem = function (containerId, title = "", desc = "") {
  const container = document.getElementById(containerId);
  if (!container) return;

  const isCompact = [
    "actionsContainer",
    "bonusActionsContainer",
    "reactionsContainer",
  ].includes(containerId);

  const box = document.createElement("div");
  box.className = "feature-box";

  if (isCompact) {
    box.style.display = "flex";
    box.style.alignItems = "center";
    box.style.justifyContent = "space-between";
    box.style.padding = "8px";
    box.style.gap = "8px";
  }

  // Header with Textarea for Title (allows wrapping)
  const header = document.createElement("div");
  header.className = "feature-header";

  if (isCompact) {
    header.style.borderBottom = "none";
    header.style.marginBottom = "0";
    header.style.paddingBottom = "0";
    header.style.flexGrow = "1";
  }

  const dragHandle = document.createElement("div");
  dragHandle.className = "drag-handle";
  dragHandle.innerHTML = "☰";
  dragHandle.style.marginRight = "8px";
  dragHandle.style.cursor = "grab";
  dragHandle.style.flexShrink = "0";
  if (isCompact) dragHandle.style.alignSelf = "center";
  header.appendChild(dragHandle);

  const titleInput = document.createElement("textarea");
  titleInput.className = "feature-title-input";
  titleInput.placeholder = "Feature Name";
  titleInput.rows = 1;
  titleInput.value = title;
  titleInput.oninput = function () {
    saveCharacter();
    autoResizeTextarea(this);
  };
  
  titleInput.style.width = "auto";
  titleInput.style.flex = "1";

  if (isCompact) {
    titleInput.style.width = "100%";
  }

  const delBtn = document.createElement("button");
  delBtn.className = "delete-feature-btn";
  delBtn.innerHTML = "×";
  delBtn.onclick = function () {
    box.remove();
    saveCharacter();
  };

  header.appendChild(titleInput);

  if (!isCompact) {
    header.appendChild(delBtn);
  }

  box.appendChild(header);

  const descContainer = document.createElement("div");
  descContainer.className = "feature-desc-container";

  const display = document.createElement("div");
  display.className = "feature-desc-display";
  display.style.fontSize = "0.9rem";
  display.style.color = "var(--ink)";
  display.style.lineHeight = "1.4";
  // Replace newlines with <br> for display if it's plain text, but trust HTML if present
  display.innerHTML = desc
    ? desc.replace(/\n/g, "<br>")
    : "<em style='color:#999'>Click to edit description...</em>";

  const input = document.createElement("textarea");
  input.className = "feature-desc-input";
  input.style.display = "none";
  input.value = desc;

  descContainer.appendChild(display);
  descContainer.appendChild(input);

  if (isCompact) {
    descContainer.style.display = "none";

    // Add Info Button for Compact Mode
    const infoBtn = document.createElement("button");
    infoBtn.className = "skill-info-btn";
    infoBtn.innerHTML = "?";
    infoBtn.title = "View Description";
    infoBtn.style.marginRight = "4px";
    infoBtn.style.flexShrink = "0";

    infoBtn.onclick = function () {
      const titleVal = titleInput.value;
      openNoteEditor(
        titleVal || "Feature Description",
        input,
        null,
        (newVal) => {
          display.innerHTML = newVal
            ? newVal.replace(/\n/g, "<br>")
            : "<em style='color:#999'>Click to edit description...</em>";
        },
      );
    };

    box.appendChild(infoBtn);
    box.appendChild(delBtn);
  } else {
    descContainer.style.cursor = "pointer";
    descContainer.style.minHeight = "20px";
    descContainer.onclick = function () {
      const titleVal = titleInput.value;
      openNoteEditor(
        titleVal || "Feature Description",
        input,
        null,
        (newVal) => {
          display.innerHTML = newVal
            ? newVal.replace(/\n/g, "<br>")
            : "<em style='color:#999'>Click to edit description...</em>";
        },
      );
    };
    box.appendChild(descContainer);
  }

  container.appendChild(box);
  autoResizeTextarea(titleInput); // Initial resize
  setupDragItem(box, containerId);
  saveCharacter();
};

// Drag & Drop
function setupDragItem(item, containerId) {
  const handle = item.querySelector(".drag-handle");
  const container = document.getElementById(containerId);
  if (!handle || !container) return;
  item.draggable = true;
  item.addEventListener("dragstart", () => item.classList.add("dragging"));
  item.addEventListener("dragend", () => {
    item.classList.remove("dragging");
    saveCharacter();
  });
  handle.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      item.classList.add("dragging");
    },
    { passive: false },
  );
  handle.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault();
      const touch = e.touches[0];
      const afterElement = getDragAfterElement(container, touch.clientY);
      if (afterElement == null) {
        container.appendChild(item);
      } else {
        container.insertBefore(item, afterElement);
      }
    },
    { passive: false },
  );
  handle.addEventListener("touchend", (e) => {
    item.classList.remove("dragging");
    saveCharacter();
  });
}

function getDragAfterElement(container, y) {
  const draggableElements = [
    ...container.querySelectorAll(
      ".inventory-item:not(.dragging), .spell-row:not(.dragging), .feature-box:not(.dragging)",
      ".inventory-item:not(.dragging), .spell-row:not(.dragging)",
    ),
  ];
  return draggableElements.reduce(
    (closest, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;
      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    },
    { offset: Number.NEGATIVE_INFINITY },
  ).element;
}

/* =========================================
      3. INVENTORY & NOTES
      ========================================= */
window.addInventoryItem = function (
  name = "",
  qty = 1,
  weight = 0,
  isEquipped = false,
  description = "",
  skipSave = false,
) {
  const listId = isEquipped ? "equippedList" : "inventoryList";
  const list = document.getElementById(listId);
  const div = document.createElement("div");
  div.className = "inventory-item";

  // Hidden Input for Description
  const descInput = document.createElement("input");
  descInput.type = "hidden";
  descInput.className = "desc-field";
  descInput.value = description || "";

  // Drag Handle
  const dragHandle = document.createElement("div");
  dragHandle.className = "drag-handle";
  dragHandle.innerHTML = "☰";

  // Equip Check
  const check = document.createElement("input");
  check.type = "checkbox";
  check.className = "equip-check";
  check.checked = isEquipped;
  check.title = "Equip/Unequip";
  check.onchange = function () {
    // Logic to move item between lists
    div.remove();
    addInventoryItem(
      nameInput.value,
      qtyInput.value,
      weightInput.value,
      !isEquipped,
      descInput.value,
    );
    calculateWeight();
    saveCharacter();
  };

  // Fields
  const nameInput = document.createElement("input");
  nameInput.type = "text";
  nameInput.className = "name-field";
  nameInput.placeholder = "Item Name";
  nameInput.value = name;
  nameInput.oninput = saveCharacter;
  const qtyInput = document.createElement("input");
  qtyInput.type = "number";
  qtyInput.className = "qty-field";
  qtyInput.placeholder = "Qty";
  qtyInput.value = qty;
  qtyInput.oninput = () => {
    calculateWeight();
    saveCharacter();
  };
  const weightInput = document.createElement("input");
  weightInput.type = "number";
  weightInput.className = "weight-field";
  weightInput.placeholder = "Lbs";
  weightInput.value = weight;
  weightInput.oninput = () => {
    calculateWeight();
    saveCharacter();
  };

  // Note Button
  const noteBtn = document.createElement("button");
  noteBtn.className = "note-btn";
  noteBtn.innerHTML = "📝";
  noteBtn.title = "View/Edit Notes";
  if (description && description.trim().length > 0) {
    noteBtn.classList.add("has-notes");
  }
  noteBtn.onclick = function () {
    openNoteEditor(nameInput.value, descInput, noteBtn);
  };

  // Delete
  const delBtn = document.createElement("button");
  delBtn.innerText = "×";
  delBtn.className = "delete-btn";
  delBtn.onclick = function () {
    if (confirm("Delete item?")) {
      div.remove();
      calculateWeight();
      saveCharacter();
    }
  };

  div.appendChild(dragHandle);
  div.appendChild(check);
  div.appendChild(descInput);
  div.appendChild(nameInput);
  div.appendChild(qtyInput);
  div.appendChild(weightInput);
  div.appendChild(noteBtn);
  div.appendChild(delBtn);
  list.appendChild(div);
  setupDragItem(div, listId);
  calculateWeight();
  if (!skipSave) saveCharacter();
};

window.openNoteEditor = function (
  itemName,
  inputElement,
  btnElement,
  callback,
) {
  const existing = document.getElementById("note-modal-overlay");
  if (existing) existing.remove();
  const overlay = document.createElement("div");
  overlay.id = "note-modal-overlay";
  overlay.className = "note-modal-overlay";
  const box = document.createElement("div");
  box.className = "note-modal";
  const header = document.createElement("h3");
  header.style.margin = "0 0 10px 0";
  header.style.borderBottom = "1px solid #8b2e2e";
  header.innerText = itemName || "Item Notes";
  const displayDiv = document.createElement("div");
  displayDiv.className = "note-display";

  const formatText = (text) => {
      if (!text) return "<em style='color:#999'>No notes...</em>";
      return text.replace(/\n/g, "<br>").replace(/\*\*(.*?)\*\*/g, '<b>$1</b>');
  };

  displayDiv.innerHTML = formatText(inputElement.value);
  const textArea = document.createElement("textarea");
  textArea.className = "note-textarea";
  textArea.value = inputElement.value;
  const controls = document.createElement("div");
  controls.className = "note-controls";

  const editBtn = document.createElement("button");
  editBtn.innerText = "Edit Text";
  editBtn.className = "btn btn-secondary";
  editBtn.style.padding = "5px 10px";
  editBtn.style.fontSize = "0.8rem";
  const saveBtn = document.createElement("button");
  saveBtn.innerText = "Save & Close";
  saveBtn.className = "btn";
  saveBtn.style.padding = "5px 15px";
  saveBtn.style.fontSize = "0.9rem";

  let isEditing = false;
  editBtn.onclick = () => {
    isEditing = !isEditing;
    if (isEditing) {
      displayDiv.style.display = "none";
      textArea.style.display = "block";
      editBtn.innerText = "View Rendered";
      textArea.focus();
    } else {
      displayDiv.innerHTML = formatText(textArea.value);
      displayDiv.style.display = "block";
      textArea.style.display = "none";
      editBtn.innerText = "Edit Text";
    }
  };
  saveBtn.onclick = () => {
    inputElement.value = textArea.value;
    if (btnElement) {
      if (textArea.value.trim().length > 0) {
        btnElement.classList.add("has-notes");
      } else {
        btnElement.classList.remove("has-notes");
      }
    }
    if (callback) callback(textArea.value);
    saveCharacter();
    overlay.remove();
  };
  const closeBtn = document.createElement("button");
  closeBtn.innerText = "Cancel";
  closeBtn.style.background = "none";
  closeBtn.style.border = "none";
  closeBtn.style.cursor = "pointer";
  closeBtn.onclick = () => overlay.remove();

  controls.appendChild(editBtn);
  controls.appendChild(closeBtn);
  controls.appendChild(saveBtn);
  box.appendChild(header);
  box.appendChild(displayDiv);
  box.appendChild(textArea);
  box.appendChild(controls);
  overlay.appendChild(box);
  document.body.appendChild(overlay);
};

/* =========================================
      ITEM SEARCH (IndexedDB)
      ========================================= */
const DB_NAME = "DndDataDB";
const STORE_NAME = "files";
const DB_VERSION = 7;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => {
      console.error("IndexedDB open error:", request.error);
      reject(request.error);
    };
    request.onsuccess = () => resolve(request.result);
    request.onblocked = (e) => {
      console.warn("IndexedDB blocked. Please close other tabs.");
      alert(
        "Database upgrade blocked. Please close other tabs with this site open and reload.",
      );
    };
    request.onupgradeneeded = (e) => {
      console.log(
        `IndexedDB upgrade needed: ${e.oldVersion} -> ${e.newVersion}`,
      );
      const db = e.target.result;
      if (db.objectStoreNames.contains(STORE_NAME))
        db.deleteObjectStore(STORE_NAME);
      db.createObjectStore(STORE_NAME);
    };
  });
}

function loadWeaponsFromData(parsedData) {
  if (!parsedData) return;
  parsedData.forEach((json) => {
    try {
      if (json.baseitem && Array.isArray(json.baseitem)) {
        json.baseitem.forEach((item) => {
          if (item.weaponCategory) {
            const name = item.name;
            const type =
              item.weaponCategory.toLowerCase() === "martial"
                ? "Martial"
                : "Simple";
            const rawType = (item.type || "").split("|")[0];
            const cat = rawType === "R" || rawType === "F" ? "Ranged" : "Melee";
            const dmg = item.dmg1 || "";
            const dmgTypeMap = {
              S: "slashing",
              P: "piercing",
              B: "bludgeoning",
            };
            const dtype = dmgTypeMap[item.dmgType] || item.dmgType || "";

            const propMap = {
              L: "Light",
              F: "Finesse",
              T: "Thrown",
              "2H": "Two-Handed",
              H: "Heavy",
              R: "Reach",
              V: "Versatile",
              LD: "Loading",
              A: "Ammunition",
            };

            const props = [];
            if (item.property) {
              item.property.forEach((p) => {
                const pStr = typeof p === "string" ? p : p.uid || p.name || "";
                const cleanP = pStr.split("|")[0];
                let propName = propMap[cleanP] || cleanP;
                if (cleanP === "T" || cleanP === "A") {
                  if (item.range) {
                    if (typeof item.range === "string") {
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
            if (mastery) mastery = mastery.split("|")[0];
            dndWeaponsDB[name] = { type, cat, dmg, dtype, props, mastery };
          }
        });
      }
    } catch (e) {
      console.error("Error parsing weapon data:", e);
    }
  });
}

function loadActionsFromData(parsedData) {
  if (!parsedData) return;
  let actions = [];
  parsedData.forEach((json) => {
    try {
      if (json.action && Array.isArray(json.action)) {
        actions.push(...json.action);
      }
    } catch (e) {}
  });

  if (actions.length > 0) {
    // Deduplicate preferring XPHB
    const uniqueActions = new Map();
    actions.forEach((a) => {
      if (!uniqueActions.has(a.name)) uniqueActions.set(a.name, a);
      else {
        const existing = uniqueActions.get(a.name);
        if (a.source === "XPHB") uniqueActions.set(a.name, a);
      }
    });
    window.injectCombatActions(
      Array.from(uniqueActions.values()).sort((a, b) =>
        a.name.localeCompare(b.name),
      ),
    );
  }
}

function loadTablesFromData(parsedData) {
  if (!parsedData) return;
  parsedData.forEach((json) => {
    try {
      if (json.table && Array.isArray(json.table)) {
        json.table.forEach((t) => {
          if (t.name) {
             t.type = "table"; 
             window.dndTablesDB[t.name] = t;
          }
        });
      }
    } catch (e) {}
  });
}

async function checkDataUploadStatus() {
  console.log(`Checking data upload status (DB v${DB_VERSION})...`);
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const req = store.get("currentData");
    req.onsuccess = () => {
      if (req.result) {
        const parsedData = [];
        req.result.forEach((file) => {
          if (file.name.toLowerCase().endsWith(".json")) {
            try {
              parsedData.push(JSON.parse(file.content));
            } catch (e) {}
          }
        });
        loadWeaponsFromData(parsedData);
        loadActionsFromData(parsedData);
        loadTablesFromData(parsedData);
        loadLanguagesFromData(parsedData);
        loadConditionsFromData(parsedData);
      }
      const btnItems = document.getElementById("btn-search-items-zip");
      const btnCantrips = document.getElementById("btn-search-cantrips-zip");
      const btnSpells = document.getElementById("btn-search-spells-zip");
      const btnClassTable = document.getElementById("btn-view-class-table");
      const hasData = req.result && req.result.length > 0;

      // Inject Feat Search Button if missing
      let btnFeats = document.getElementById("btn-search-feats-zip");
      if (!btnFeats && hasData) {
          const addBtn = document.querySelector("button[onclick*=\"addFeatureItem('featsContainer'\"]");
          if (addBtn && addBtn.parentNode) {
              const wrapper = document.createElement('div');
              wrapper.style.display = "flex";
              wrapper.style.gap = "5px";
              wrapper.style.width = "100%";
              addBtn.parentNode.insertBefore(wrapper, addBtn);
              wrapper.appendChild(addBtn);

              btnFeats = document.createElement('button');
              btnFeats.id = "btn-search-feats-zip";
              btnFeats.className = addBtn.className;
              btnFeats.style.cssText = addBtn.style.cssText;
              btnFeats.innerHTML = "Search Feats";
              btnFeats.onclick = window.openFeatSearch;
              
              addBtn.style.flex = "1";
              addBtn.style.width = "auto";
              btnFeats.style.flex = "1";
              btnFeats.style.width = "auto";
              
              wrapper.appendChild(btnFeats);
          }
      }
      
      // Inject Language Search Button if missing
      let btnLangs = document.getElementById("btn-search-langs-zip");
      const langInput = document.getElementById("languages");
      if (!btnLangs && hasData && langInput) {
          const parent = langInput.parentElement;
          if (parent) {
              const label = parent.querySelector('.field-label');
              if (label) {
                  btnLangs = document.createElement('button');
                  btnLangs.id = "btn-search-langs-zip";
                  btnLangs.className = "skill-info-btn";
                  btnLangs.style.marginLeft = "8px";
                  btnLangs.style.verticalAlign = "middle";
                  btnLangs.innerHTML = "🔍";
                  btnLangs.title = "Search Languages";
                  btnLangs.onclick = window.openLanguageSearch;
                  label.appendChild(btnLangs);
              }
          }
      }

      console.log("DB Query Result:", hasData ? "Data Found" : "Empty");

      // Toggle Buttons
      if (hasData) {
        if (btnItems) btnItems.style.display = "inline-block";
        if (btnCantrips) btnCantrips.style.display = "inline-block";
        if (btnSpells) btnSpells.style.display = "inline-block";
        if (btnFeats) btnFeats.style.display = "inline-block";
        if (btnLangs) btnLangs.style.display = "inline-block";
        if (btnClassTable) btnClassTable.style.display = "inline-flex";
      } else {
        if (btnItems) btnItems.style.display = "none";
        if (btnCantrips) btnCantrips.style.display = "none";
        if (btnSpells) btnSpells.style.display = "none";
        if (btnFeats) btnFeats.style.display = "none";
        if (btnLangs) btnLangs.style.display = "none";
        if (btnClassTable) btnClassTable.style.display = "none";
      }

      // Toggle Weapon Proficiency Input Mode
      const selectorDiv = document.getElementById("weaponProfsSelector");
      const textInput = document.querySelector(".weapon-profs-text");

      if (selectorDiv && textInput) {
        const hiddenInput = selectorDiv.querySelector('input[type="hidden"]');
        if (hasData) {
          // Show Selector, Hide Text
          selectorDiv.style.display = "block";
          textInput.style.display = "none";
          // Ensure ID 'weaponProfs' is on the hidden input for save/load compatibility
          if (textInput.id === "weaponProfs") {
            textInput.id = "weaponProfsText";
            hiddenInput.id = "weaponProfs";
            hiddenInput.value = textInput.value; // Sync value
            if (window.renderWeaponTags) window.renderWeaponTags();
          }
        } else {
          // Show Text, Hide Selector
          selectorDiv.style.display = "none";
          textInput.style.display = "block";
          // Ensure ID 'weaponProfs' is on the text input
          if (hiddenInput.id === "weaponProfs") {
            hiddenInput.id = "weaponProfsHidden";
            textInput.id = "weaponProfs";
            textInput.value = hiddenInput.value; // Sync value
          }
        }
      }

      // Toggle Weapon Attack Inputs
      window.isDataAvailable = hasData;
      document.querySelectorAll(".weapon-name").forEach((input) => {
        if (hasData) {
          input.setAttribute("readonly", "true");
          input.setAttribute("onclick", "openWeaponPicker(this)");
          input.onclick = function () {
            openWeaponPicker(this);
          };
          input.style.cursor = "pointer";
          input.style.color = "var(--red-dark)";
          input.placeholder = "Click to select...";
        } else {
          input.removeAttribute("readonly");
          input.removeAttribute("onclick");
          input.onclick = null;
          input.style.cursor = "text";
          input.style.color = "var(--ink)";
          input.placeholder = "Enter weapon name";
        }
      });

      // Toggle Conditions Input
      const condInput = document.getElementById("activeConditionsInput");
      const condDisplay = document.getElementById("conditionsDisplay");
      if (condInput) {
          const hasConditions = window.conditionsDB && Object.keys(window.conditionsDB).length > 0;
          if (hasData && hasConditions) {
              condInput.setAttribute("readonly", "true");
              condInput.onclick = window.openConditionModal;
              condInput.style.cursor = "pointer";
              condInput.placeholder = "Click to select conditions...";
              condInput.style.display = "block";
              condInput.type = "text";
              if (condDisplay) condDisplay.style.display = "none";
          } else {
              condInput.removeAttribute("readonly");
              condInput.removeAttribute("onclick");
              condInput.onclick = null;
              condInput.style.cursor = "text";
              condInput.placeholder = "Enter conditions (comma separated)...";
              condInput.style.display = "block";
              condInput.type = "text";
              if (condDisplay) condDisplay.style.display = "none";
          }
      }

      // Check for pending level up after data is confirmed available
      if (localStorage.getItem('pendingLevelUp') === 'true') {
          const lvl = parseInt(document.getElementById('level').value) || 1;
          if (window.showLevelUpButton) window.showLevelUpButton(lvl);
      }
    };
    req.onerror = (e) => {
      console.error("Error reading from object store:", e);
    };
  } catch (e) {
    console.error("Error checking data status:", e);
  }
}

let allItemsCache = [];
let currentSearchResults = [];
let itemSearchPage = 1;
const ITEMS_PER_PAGE = 50;

window.openItemSearch = async function () {
  document.getElementById("itemSearchModal").style.display = "flex";
  document.getElementById("itemSearchInput").value = "";
  const list = document.getElementById("itemSearchList");
  list.innerHTML =
    '<div style="padding:10px; color:#666; text-align:center;">Loading items library...</div>';
  document.getElementById("itemSearchPagination").style.display = "none";

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const data = await new Promise((resolve, reject) => {
      const req = store.get("currentData");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    if (!data) {
      list.innerHTML =
        '<div style="padding:10px; color:#666; text-align:center;">No data found. Please upload a file in Data Viewer.</div>';
      return;
    }

    const parsedData = [];
    data.forEach((file) => {
      if (file.name.toLowerCase().endsWith(".json")) {
        try {
          parsedData.push(JSON.parse(file.content));
        } catch (e) {}
      }
    });

    const results = [];
    parsedData.forEach((json) => {
      try {
        // Strict filtering: Only look in known item arrays to avoid monsters/spells/adventures
        const arraysToCheck = [
          json.item,
          json.items,
          json.baseitem,
          json.baseitems,
          json.magicvariant,
          json.magicvariants,
          json.variant,
        ];
        arraysToCheck.forEach((arr) => {
          if (Array.isArray(arr)) {
            arr.forEach((item) => {
              if (item.name && typeof item.name === "string") {
                results.push(item);
              }
            });
          }
        });
      } catch (e) {}
    });

    // Deduplicate by name
    const uniqueResults = Array.from(
      new Map(results.map((item) => [item.name, item])).values(),
    );
    // Sort
    uniqueResults.sort((a, b) => a.name.localeCompare(b.name));

    allItemsCache = uniqueResults;
    currentSearchResults = allItemsCache;
    itemSearchPage = 1;

    renderItemSearchPage();
    document.getElementById("itemSearchInput").focus();
  } catch (e) {
    console.error(e);
    list.innerHTML =
      '<div style="padding:10px; color:red; text-align:center;">Error loading database.</div>';
  }
};

window.closeItemSearch = function () {
  document.getElementById("itemSearchModal").style.display = "none";
};

window.filterItemSearch = function () {
  const term = document.getElementById("itemSearchInput").value.toLowerCase();
  if (!term) {
    currentSearchResults = allItemsCache;
  } else {
    currentSearchResults = allItemsCache.filter((item) =>
      item.name.toLowerCase().includes(term),
    );
  }
  itemSearchPage = 1;
  renderItemSearchPage();
};

window.changeItemSearchPage = function (delta) {
  const maxPage = Math.ceil(currentSearchResults.length / ITEMS_PER_PAGE);
  const newPage = itemSearchPage + delta;
  if (newPage >= 1 && newPage <= maxPage) {
    itemSearchPage = newPage;
    renderItemSearchPage();
    document.getElementById("itemSearchList").scrollTop = 0;
  }
};

function renderItemSearchPage() {
  const list = document.getElementById("itemSearchList");
  const pagination = document.getElementById("itemSearchPagination");
  const pageInfo = document.getElementById("itemSearchPageInfo");

  if (currentSearchResults.length === 0) {
    list.innerHTML =
      '<div style="padding:10px; color:#666; text-align:center;">No matching items found.</div>';
    pagination.style.display = "none";
    return;
  }

  pagination.style.display = "flex";
  const maxPage = Math.ceil(currentSearchResults.length / ITEMS_PER_PAGE);
  pageInfo.textContent = `Page ${itemSearchPage} of ${maxPage}`;

  const startIndex = (itemSearchPage - 1) * ITEMS_PER_PAGE;
  const itemsToShow = currentSearchResults.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  list.innerHTML = "";

  itemsToShow.forEach((item) => {
    const div = document.createElement("div");
    div.className = "checklist-item";
    div.style.flexDirection = "column";
    div.style.alignItems = "flex-start";

    const weight = item.weight || item.weight_lbs || 0;
    let desc = "";

    if (item.entries) desc = window.processEntries(item.entries);
    if (!desc && item.inherits && item.inherits.entries)
      desc = window.processEntries(item.inherits.entries);
    if (!desc && item.description) desc = item.description;
    if (!desc && item.text) desc = item.text;

    // Clean the description
    desc = window.cleanText(desc);

    // Format description for preview
    let previewDesc =
      typeof desc === "string" ? desc.replace(/<[^>]*>/g, "") : "See notes";
    if (previewDesc.length > 80)
      previewDesc = previewDesc.substring(0, 80) + "...";

    div.innerHTML = `
               <div style="font-weight:bold; width:100%; display:flex; justify-content:space-between;">
                   <span>${item.name}</span>
                   <span style="font-size:0.8rem; color:var(--ink-light);">${weight} lbs</span>
               </div>
               <div style="font-size:0.8rem; color:var(--ink-light); margin-top:4px;">${previewDesc}</div>
           `;
    div.onclick = () => {
      addInventoryItem(item.name, 1, weight, false, desc);
      closeItemSearch();
    };
    list.appendChild(div);
  });
}

/* =========================================
      SPELL SEARCH (IndexedDB)
      ========================================= */
let allSpellsCache = [];
let currentSpellResults = [];
let spellSearchPage = 1;
let spellTargetContainer = "";
let spellSearchFilterType = ""; // 'cantrip' or 'leveled'
window.currentSpellMaxLevel = 9;
let spellSearchOnSelect = null;

window.openSpellSearch = async function (containerId, filterType, maxLevel = 9, preselectedClass = null, onSelect = null) {
  spellTargetContainer = containerId;
  spellSearchFilterType = filterType;
  window.currentSpellMaxLevel = maxLevel;
  spellSearchOnSelect = onSelect;
  document.getElementById("spellSearchModal").style.display = "flex";
  document.getElementById("spellSearchInput").value = "";
  document.getElementById("spellSearchSort").value = "name-asc";

  // Reset and setup filters
  const levelSelect = document.getElementById("spellSearchLevel");
  const classSelect = document.getElementById("spellSearchClass");
  classSelect.innerHTML = '<option value="">All Classes</option>';

  if (filterType === "cantrip") {
    levelSelect.value = "0";
    levelSelect.disabled = true;
    levelSelect.style.opacity = "0.5";
  } else {
    levelSelect.value = "";
    levelSelect.disabled = false;
    levelSelect.style.opacity = "1";
  }

  const list = document.getElementById("spellSearchList");
  list.innerHTML =
    '<div style="padding:10px; color:#666; text-align:center;">Loading spells library...</div>';
  document.getElementById("spellSearchPagination").style.display = "none";

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const data = await new Promise((resolve, reject) => {
      const req = store.get("currentData");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    if (!data) {
      list.innerHTML =
        '<div style="padding:10px; color:#666; text-align:center;">No data found. Please upload a file in Data Viewer.</div>';
      return;
    }

    const parsedData = [];
    data.forEach((file) => {
      if (file.name.toLowerCase().endsWith(".json")) {
        try {
          parsedData.push(JSON.parse(file.content));
        } catch (e) {}
      }
    });

    // Pass 1: Build Spell Class Map from Book Data
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

        if (className) {
          if (entry.items && Array.isArray(entry.items)) {
            entry.items.forEach((item) => {
              const itemStr = typeof item === "string" ? item : item.name || "";
              const match = /{@spell ([^}|]+)/.exec(itemStr);
              if (match) {
                const spellName = match[1].toLowerCase().trim();
                if (!spellClassMap[spellName])
                  spellClassMap[spellName] = new Set();
                spellClassMap[spellName].add(className);
              }
            });
          }
        }

        if (entry.entries) processBookEntries(entry.entries, className);
      });
    };

    parsedData.forEach((json) => {
      if (json.data && Array.isArray(json.data)) {
        processBookEntries(json.data);
      }
    });

    const results = [];
    parsedData.forEach((json) => {
      try {
        // console.log("Spell Data:", json);
        let arraysToCheck = [json.spell, json.spells, json.data];
        if (Array.isArray(json)) arraysToCheck.push(json);

        arraysToCheck.forEach((arr) => {
          if (Array.isArray(arr)) {
            arr.forEach((spell) => {
              if (spell.name && typeof spell.name === "string") {
                // Enrich with class info from book if available
                const mappedClasses =
                  spellClassMap[spell.name.toLowerCase().trim()];
                if (mappedClasses) {
                  if (!spell.classes) {
                    spell.classes = Array.from(mappedClasses);
                  } else if (Array.isArray(spell.classes)) {
                    mappedClasses.forEach((c) => {
                      if (
                        !spell.classes.some(
                          (existing) =>
                            (typeof existing === "string"
                              ? existing
                              : existing.name) === c,
                        )
                      ) {
                        spell.classes.push(c);
                      }
                    });
                  } else if (typeof spell.classes === "object") {
                    if (!spell.classes.fromClassList)
                      spell.classes.fromClassList = [];
                    mappedClasses.forEach((c) => {
                      if (
                        !spell.classes.fromClassList.some((cl) => cl.name === c)
                      ) {
                        spell.classes.fromClassList.push({
                          name: c,
                          source: "PHB",
                        });
                      }
                    });
                  }
                }

                // Filter based on type
                if (spellSearchFilterType === "cantrip" && spell.level === 0) {
                  results.push(spell);
                } else if (
                  spellSearchFilterType === "leveled" &&
                  spell.level > 0
                ) {
                  if (spell.level <= window.currentSpellMaxLevel) results.push(spell);
                } else if (spellSearchFilterType === "all") {
                  if (spell.level <= window.currentSpellMaxLevel) results.push(spell);
                }
              }
            });
          }
        });
      } catch (e) {
        console.error(`Error parsing spell file (${file.name}):`, e);
      }
    });

    // Filter out PHB if newer exists
    const spellsByName = new Map();
    results.forEach((s) => {
      if (!spellsByName.has(s.name)) spellsByName.set(s.name, []);
      spellsByName.get(s.name).push(s);
    });

    const filteredResults = [];
    spellsByName.forEach((variants) => {
      const hasNonPHB = variants.some((s) => s.source !== "PHB");
      if (hasNonPHB) {
        variants.forEach((s) => {
          if (s.source !== "PHB") filteredResults.push(s);
        });
      } else {
        variants.forEach((s) => filteredResults.push(s));
      }
    });

    // Deduplicate
    const uniqueResults = Array.from(
      new Map(filteredResults.map((s) => [s.name + s.source, s])).values(),
    );
    uniqueResults.sort((a, b) => a.name.localeCompare(b.name));

    allSpellsCache = uniqueResults;
    currentSpellResults = allSpellsCache;
    spellSearchPage = 1;

    // Populate Class Filter
    const classSet = new Set([
      "Artificer",
      "Bard",
      "Cleric",
      "Druid",
      "Paladin",
      "Ranger",
      "Sorcerer",
      "Warlock",
      "Wizard",
    ]);
    allSpellsCache.forEach((s) => {
      if (!s.classes) return;

      if (s.classes.fromClassList) {
        s.classes.fromClassList.forEach((c) => {
          if (c.name) classSet.add(c.name);
        });
      }
      if (s.classes.fromClassListVariant) {
        s.classes.fromClassListVariant.forEach((c) => {
          if (c.name) classSet.add(c.name);
        });
      }
      if (s.classes.fromSubclass) {
        s.classes.fromSubclass.forEach((sc) => {
          if (sc.class && sc.class.name) classSet.add(sc.class.name);
        });
      }
      // Fallback for array of strings or objects
      if (Array.isArray(s.classes)) {
        s.classes.forEach((c) => {
          if (typeof c === "string") classSet.add(c);
          else if (c.name) classSet.add(c.name);
        });
      }
    });

    const sortedClasses = Array.from(classSet).filter(c => !c.toLowerCase().includes("chapter") && !c.toLowerCase().includes("appendix")).sort();
    let optionsHTML = '<option value="">All Classes</option>';
    sortedClasses.forEach((c) => {
      optionsHTML += `<option value="${c}">${c}</option>`;
    });
    classSelect.innerHTML = optionsHTML;

    if (preselectedClass) {
        const match = sortedClasses.find(c => c.toLowerCase() === preselectedClass.toLowerCase());
        if (match) classSelect.value = match;
    }

    if (preselectedClass && classSelect.value) {
        filterSpellSearch();
    } else {
        renderSpellSearchPage();
    }
    document.getElementById("spellSearchInput").focus();
  } catch (e) {
    console.error(e);
    list.innerHTML =
      '<div style="padding:10px; color:red; text-align:center;">Error loading database.</div>';
  }
};

window.closeSpellSearch = function () {
  document.getElementById("spellSearchModal").style.display = "none";
};

window.filterSpellSearch = function () {
  const term = document.getElementById("spellSearchInput").value.toLowerCase();
  const classFilter = document.getElementById("spellSearchClass").value;
  const levelFilter = document.getElementById("spellSearchLevel").value;
  const sortFilter = document.getElementById("spellSearchSort").value;

  let results = allSpellsCache;

  // Filter Name
  if (term) {
    results = results.filter((s) => s.name.toLowerCase().includes(term));
  }
  // Filter Class
  if (classFilter) {
    const target = classFilter.toLowerCase().trim();
    results = results.filter((s) => {
      if (!s.classes) return false;
      let match = false;
      const check = (name) => name && name.toLowerCase().trim() === target;
      if (
        s.classes.fromClassList &&
        s.classes.fromClassList.some((c) => check(c.name))
      )
        match = true;
      if (
        !match &&
        s.classes.fromClassListVariant &&
        s.classes.fromClassListVariant.some((c) => check(c.name))
      )
        match = true;
      if (
        !match &&
        s.classes.fromSubclass &&
        s.classes.fromSubclass.some((sc) => sc.class && check(sc.class.name))
      )
        match = true;
      if (
        !match &&
        Array.isArray(s.classes) &&
        s.classes.some((c) => check(typeof c === "string" ? c : c.name))
      )
        match = true;
      return match;
    });
  }
  // Filter Level
  if (levelFilter !== "") {
    results = results.filter((s) => s.level === parseInt(levelFilter));
  }

  // Sort
  results.sort((a, b) => {
    if (sortFilter === "name-asc") return a.name.localeCompare(b.name);
    if (sortFilter === "name-desc") return b.name.localeCompare(a.name);
    if (sortFilter === "level-asc")
      return a.level - b.level || a.name.localeCompare(b.name);
    if (sortFilter === "level-desc")
      return b.level - a.level || a.name.localeCompare(b.name);
    return 0;
  });

  currentSpellResults = results;
  spellSearchPage = 1;
  renderSpellSearchPage();
};

window.changeSpellSearchPage = function (delta) {
  const maxPage = Math.ceil(currentSpellResults.length / ITEMS_PER_PAGE);
  const newPage = spellSearchPage + delta;
  if (newPage >= 1 && newPage <= maxPage) {
    spellSearchPage = newPage;
    renderSpellSearchPage();
    document.getElementById("spellSearchList").scrollTop = 0;
  }
};

function renderSpellSearchPage() {
  const list = document.getElementById("spellSearchList");
  const pagination = document.getElementById("spellSearchPagination");
  const pageInfo = document.getElementById("spellSearchPageInfo");

  if (currentSpellResults.length === 0) {
    list.innerHTML =
      '<div style="padding:10px; color:#666; text-align:center;">No matching spells found.</div>';
    pagination.style.display = "none";
    return;
  }

  pagination.style.display = "flex";
  const maxPage = Math.ceil(currentSpellResults.length / ITEMS_PER_PAGE);
  pageInfo.textContent = `Page ${spellSearchPage} of ${maxPage}`;

  const startIndex = (spellSearchPage - 1) * ITEMS_PER_PAGE;
  const spellsToShow = currentSpellResults.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE,
  );

  list.innerHTML = "";
  spellsToShow.forEach((spell) => {
    const div = document.createElement("div");
    div.className = "checklist-item";
    div.style.flexDirection = "column";
    div.style.alignItems = "flex-start";

    const levelStr = spell.level === 0 ? "Cantrip" : `Level ${spell.level}`;
    const school = spell.school ? spell.school.toUpperCase() : "";

    div.innerHTML = `
               <div style="font-weight:bold; width:100%; display:flex; justify-content:space-between;">
                   <span>${spell.name}</span>
                   <span style="font-size:0.8rem; color:var(--ink-light);">${levelStr} ${school ? "(" + school + ")" : ""}</span>
               </div>
           `;
    div.onclick = () => {
      // Map 5e-tools data to our format
      let time = "";
      let desc = "";

      if (spell.entries) desc = window.processEntries(spell.entries);
      else if (spell.description) desc = spell.description;
      if (spell.entriesHigherLevel) {
        desc += "<br><br>" + window.processEntries(spell.entriesHigherLevel);
      }
      desc = window.cleanText(desc);

      if (spell.time && spell.time[0]) {
        const t = spell.time[0];
        time = `${t.number} ${t.unit}`;
      }

      let range = "";
      if (spell.range) {
        if (spell.range.distance) {
          range = `${spell.range.distance.amount ? spell.range.distance.amount + " " : ""}${spell.range.distance.type}`;
        } else {
          range = spell.range.type;
        }
      }

      let concentration = false;
      if (
        spell.duration &&
        spell.duration[0] &&
        spell.duration[0].concentration
      )
        concentration = true;

      let ritual = spell.meta && spell.meta.ritual ? true : false;

      let material = false;
      if (spell.components && (spell.components.m || spell.components.M))
        material = true;

      const spellData = {
        name: spell.name,
        level: spell.level,
        time: time,
        range: range,
        ritual: ritual,
        concentration: concentration,
        material: material,
        description: desc,
      };

      if (spellSearchOnSelect) {
          spellSearchOnSelect(spellData);
      } else {
          const target = (spell.level === 0 && spellTargetContainer === 'spellList') ? 'cantripList' : spellTargetContainer;
          addSpellRow(target, spell.level, spellData);
      }
      closeSpellSearch();
    };
    list.appendChild(div);
  });
}

/* =========================================
      LANGUAGE SEARCH (IndexedDB)
      ========================================= */
let allLanguagesCache = [];

function loadLanguagesFromData(parsedData) {
  if (!parsedData) return;
  const langs = [];
  parsedData.forEach((json) => {
    if (json.language && Array.isArray(json.language)) {
      json.language.forEach((l) => {
        if (l.name) langs.push(l);
      });
    }
  });
  const unique = new Map();
  langs.forEach(l => {
      if (!unique.has(l.name)) unique.set(l.name, l);
      else {
          const existing = unique.get(l.name);
          if (l.source === 'XPHB' || (l.source === 'PHB' && existing.source !== 'XPHB')) {
              unique.set(l.name, l);
          }
      }
  });
  allLanguagesCache = Array.from(unique.values()).sort((a,b) => a.name.localeCompare(b.name));
}

function loadConditionsFromData(parsedData) {
  if (!parsedData) return;
  const conditionMap = new Map();
  
  parsedData.forEach((json) => {
      const arrays = [json.condition, json.conditions, json.status];
      arrays.forEach(arr => {
          if (Array.isArray(arr)) {
              arr.forEach(c => {
                  if (!c.name) return;
                  if (!conditionMap.has(c.name)) {
                      conditionMap.set(c.name, c);
                  } else {
                      const existing = conditionMap.get(c.name);
                      if (c.source === 'XPHB') conditionMap.set(c.name, c);
                      else if (c.source === 'PHB' && existing.source !== 'XPHB') conditionMap.set(c.name, c);
                  }
              });
          }
      });
  });

  window.conditionsDB = { ...conditionsDB };
  Array.from(conditionMap.keys()).sort().forEach(name => {
      const c = conditionMap.get(name);
      window.conditionsDB[name] = window.cleanText(window.processEntries(c.entries));
  });
}

window.openLanguageSearch = function() {
    let modal = document.getElementById("languageSearchModal");
    if (!modal) {
        modal = document.createElement("div");
        modal.id = "languageSearchModal";
        modal.className = "info-modal-overlay";
        modal.innerHTML = `
            <div class="info-modal-content" style="max-width: 500px; max-height: 80vh; display: flex; flex-direction: column;">
                <button class="close-modal-btn" onclick="document.getElementById('languageSearchModal').style.display='none'">&times;</button>
                <h3 class="info-modal-title" style="text-align: center">Languages</h3>
                <input type="text" id="langSearchInput" placeholder="Search..." style="margin-bottom: 10px; padding: 8px; border: 1px solid var(--gold); border-radius: 4px;">
                <div id="languageList" class="checklist-grid" style="grid-template-columns: 1fr; flex: 1; overflow-y: auto; gap: 8px;"></div>
            </div>
        `;
        document.body.appendChild(modal);
        
        document.getElementById('langSearchInput').addEventListener('input', (e) => {
            const term = e.target.value.toLowerCase();
            document.querySelectorAll('#languageList .checklist-item').forEach(item => {
                item.style.display = item.textContent.toLowerCase().includes(term) ? 'flex' : 'none';
            });
        });
    }
    
    const list = document.getElementById("languageList");
    list.innerHTML = "";
    
    if (allLanguagesCache.length === 0) {
        list.innerHTML = "<div style='text-align:center; color:gray;'>No languages found.</div>";
    } else {
        allLanguagesCache.forEach(l => {
            const div = document.createElement("div");
            div.className = "checklist-item";
            div.style.justifyContent = "space-between";
            div.style.cursor = "pointer";
            
            let type = l.type || "";
            if (type) type = type.charAt(0).toUpperCase() + type.slice(1);
            
            div.innerHTML = `<span><strong>${l.name}</strong> ${type ? `(${type})` : ""}</span><span style="font-size:0.8rem; color:gray;">${l.script || ""}</span>`;
            div.onclick = () => {
                const langInput = document.getElementById("languages");
                if (langInput) {
                    const current = langInput.value.trim();
                    langInput.value = current ? `${current}, ${l.name}` : l.name;
                    window.saveCharacter();
                    document.getElementById("languageSearchModal").style.display = "none";
                }
            };
            list.appendChild(div);
        });
    }
    
    modal.style.display = "flex";
    document.getElementById('langSearchInput').focus();
};

/* =========================================
      FEAT SEARCH (IndexedDB)
      ========================================= */
let allFeatsCache = [];
let currentFeatResults = [];
let featSearchPage = 1;

window.openFeatSearch = async function () {
  // Create modal if not exists
  let modal = document.getElementById("featSearchModal");
  if (!modal) {
      modal = document.createElement("div");
      modal.id = "featSearchModal";
      modal.className = "info-modal-overlay";
      modal.innerHTML = `
        <div class="info-modal-content" style="max-width: 600px; max-height: 80vh; display: flex; flex-direction: column;">
            <button class="close-modal-btn" onclick="document.getElementById('featSearchModal').style.display='none'">&times;</button>
            <h3 class="info-modal-title" style="text-align: center">Feat Search</h3>
            <div style="margin-bottom: 10px; display: flex; gap: 10px;">
                <input type="text" id="featSearchInput" placeholder="Search feats..." style="border: 1px solid var(--gold); padding: 8px; border-radius: 4px; flex: 1;" oninput="window.filterFeatSearch()">
            </div>
            <div id="featSearchList" class="checklist-grid" style="grid-template-columns: 1fr; flex: 1; overflow-y: auto; gap: 8px;"></div>
            <div id="featSearchPagination" style="display: flex; justify-content: center; align-items: center; gap: 10px; margin-top: 10px;">
                <button class="btn btn-secondary" onclick="window.changeFeatSearchPage(-1)" style="padding: 5px 10px;">&lt;</button>
                <span id="featSearchPageInfo" style="font-size: 0.9rem;">Page 1</span>
                <button class="btn btn-secondary" onclick="window.changeFeatSearchPage(1)" style="padding: 5px 10px;">&gt;</button>
            </div>
        </div>
      `;
      document.body.appendChild(modal);
  }

  modal.style.display = "flex";
  document.getElementById("featSearchInput").value = "";
  const list = document.getElementById("featSearchList");
  list.innerHTML = '<div style="padding:10px; color:#666; text-align:center;">Loading feats library...</div>';
  document.getElementById("featSearchPagination").style.display = "none";

  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const data = await new Promise((resolve, reject) => {
      const req = store.get("currentData");
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });

    if (!data) {
      list.innerHTML = '<div style="padding:10px; color:#666; text-align:center;">No data found.</div>';
      return;
    }

    const parsedData = [];
    data.forEach((file) => {
      if (file.name.toLowerCase().endsWith(".json")) {
        try { parsedData.push(JSON.parse(file.content)); } catch (e) {}
      }
    });

    const results = [];
    parsedData.forEach((json) => {
        if (json.feat && Array.isArray(json.feat)) {
            json.feat.forEach(f => {
                if (f.name) results.push(f);
            });
        }
    });

    // Deduplicate
    const uniqueResults = [];
    const seen = new Set();
    results.forEach(f => {
        const key = f.name + (f.source || "");
        if (!seen.has(key)) {
            seen.add(key);
            uniqueResults.push(f);
        }
    });
    
    // Sort
    uniqueResults.sort((a, b) => a.name.localeCompare(b.name));

    allFeatsCache = uniqueResults;
    currentFeatResults = allFeatsCache;
    featSearchPage = 1;

    renderFeatSearchPage();
    document.getElementById("featSearchInput").focus();
  } catch (e) {
    console.error(e);
    list.innerHTML = '<div style="padding:10px; color:red; text-align:center;">Error loading database.</div>';
  }
};

window.filterFeatSearch = function () {
  const term = document.getElementById("featSearchInput").value.toLowerCase();
  if (!term) {
    currentFeatResults = allFeatsCache;
  } else {
    currentFeatResults = allFeatsCache.filter((item) =>
      item.name.toLowerCase().includes(term)
    );
  }
  featSearchPage = 1;
  renderFeatSearchPage();
};

window.changeFeatSearchPage = function (delta) {
  const maxPage = Math.ceil(currentFeatResults.length / ITEMS_PER_PAGE);
  const newPage = featSearchPage + delta;
  if (newPage >= 1 && newPage <= maxPage) {
    featSearchPage = newPage;
    renderFeatSearchPage();
    document.getElementById("featSearchList").scrollTop = 0;
  }
};

function renderFeatSearchPage() {
  const list = document.getElementById("featSearchList");
  const pagination = document.getElementById("featSearchPagination");
  const pageInfo = document.getElementById("featSearchPageInfo");

  if (currentFeatResults.length === 0) {
    list.innerHTML = '<div style="padding:10px; color:#666; text-align:center;">No matching feats found.</div>';
    pagination.style.display = "none";
    return;
  }

  pagination.style.display = "flex";
  const maxPage = Math.ceil(currentFeatResults.length / ITEMS_PER_PAGE);
  pageInfo.textContent = `Page ${featSearchPage} of ${maxPage}`;

  const startIndex = (featSearchPage - 1) * ITEMS_PER_PAGE;
  const itemsToShow = currentFeatResults.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  list.innerHTML = "";

  itemsToShow.forEach((feat) => {
    const div = document.createElement("div");
    div.className = "checklist-item";
    div.style.flexDirection = "column";
    div.style.alignItems = "flex-start";
    div.style.cursor = "pointer";

    let desc = window.processEntries(feat.entries);
    let cleanDesc = window.cleanText(desc);
    let previewDesc = cleanDesc.replace(/<[^>]*>/g, "");
    if (previewDesc.length > 80) previewDesc = previewDesc.substring(0, 80) + "...";

    let prereq = "";
    if (feat.prerequisite) {
        prereq = "Prereq: " + feat.prerequisite.map(p => {
            if (p.level) return "Lvl " + (p.level.level || p.level);
            if (p.ability) return "Ability";
            if (p.race) return "Race";
            return "Other";
        }).join(", ");
    }

    div.innerHTML = `
       <div style="font-weight:bold; width:100%; display:flex; justify-content:space-between;">
           <span>${feat.name}</span>
           <span style="font-size:0.8rem; color:var(--ink-light);">${feat.source || ""}</span>
       </div>
       ${prereq ? `<div style="font-size:0.75rem; color:var(--red); font-style:italic;">${prereq}</div>` : ""}
       <div style="font-size:0.8rem; color:var(--ink-light); margin-top:4px;">${previewDesc}</div>
    `;
    
    div.onclick = () => {
        window.addFeatureItem("featsContainer", feat.name, cleanDesc);
        document.getElementById("featSearchModal").style.display = "none";
    };
    list.appendChild(div);
  });
}

/* =========================================
      4. WEAPONS, CONDITIONS, MODALS
      ========================================= */
window.openConditionModal = function (targetCondition = null) {
  if (!window.isDataAvailable) return;
  const container = document.getElementById("conditionListContainer");
  container.innerHTML = "";
  const currentVal = document.getElementById("activeConditionsInput").value;
  const activeList = currentVal ? currentVal.split(",") : [];
  
  let targetEl = null;

  Object.keys(window.conditionsDB).sort().forEach((name) => {
    const desc = window.conditionsDB[name];
    const div = document.createElement("div");
    div.className = "checklist-item";
    div.style.flexDirection = "column";
    div.style.alignItems = "flex-start";
    div.style.padding = "10px";
    
    if (targetCondition && name === targetCondition) {
        targetEl = div;
        div.style.border = "2px solid var(--red)";
        div.style.backgroundColor = "var(--parchment)";
    }

    const topRow = document.createElement("div");
    topRow.style.display = "flex";
    topRow.style.alignItems = "center";
    topRow.style.gap = "10px";
    topRow.style.width = "100%";
    topRow.style.marginBottom = "4px";
    const checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.value = name;
    checkbox.checked = activeList.includes(name);
    checkbox.onchange = saveConditionsSelection;
    const label = document.createElement("span");
    label.style.fontWeight = "bold";
    label.style.fontSize = "1rem";
    label.textContent = name;
    topRow.appendChild(checkbox);
    topRow.appendChild(label);
    const descText = document.createElement("div");
    descText.style.fontSize = "0.85rem";
    descText.style.color = "var(--ink-light)";
    descText.style.marginLeft = "26px";
    descText.style.lineHeight = "1.4";
    descText.textContent = desc;
    descText.innerHTML = desc;
    div.appendChild(topRow);
    div.appendChild(descText);
    div.onclick = (e) => {
      if (e.target !== checkbox) {
        checkbox.checked = !checkbox.checked;
        saveConditionsSelection();
      }
    };
    container.appendChild(div);
  });
  document.getElementById("conditionModal").style.display = "flex";
  
  if (targetEl) {
      setTimeout(() => {
          targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
  }
};
window.closeConditionModal = () =>
  (document.getElementById("conditionModal").style.display = "none");
function saveConditionsSelection() {
  const checkboxes = document.querySelectorAll(
    "#conditionListContainer input[type='checkbox']:checked",
  );
  const selected = Array.from(checkboxes).map((cb) => cb.value);
  document.getElementById("activeConditionsInput").value = selected.join(",");
  renderConditionTags();
  saveCharacter();
}

window.renderConditionTags = function () {
  const val = document.getElementById("activeConditionsInput").value;
  const display = document.getElementById("conditionsDisplay");
  
  updateStickyConditions(val ? val.split(",") : []);

  if (!val) {
    display.textContent = "None";
    display.style.color = "var(--ink-light)";
    return;
  }
  display.textContent = val.split(",").join(", ");
  display.style.color = "var(--red)";
};

function updateStickyConditions(conditions) {
  let container = document.getElementById("sticky-conditions-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "sticky-conditions-container";
    document.body.appendChild(container);
  }
  container.innerHTML = "";
  conditions.forEach((c) => {
    const cleanC = c.trim();
    if (!cleanC) return;
    const icon = conditionIcons[cleanC] || "⚠️";
    const div = document.createElement("div");
    div.className = "sticky-condition-icon";
    // div.title = cleanC; // Removed title to use custom label
    div.innerHTML = `<span class="cond-icon">${icon}</span><span class="cond-label">${cleanC}</span>`;
    
    div.onclick = function(e) {
        e.stopPropagation();
        
        if (!window.isDataAvailable) {
            // Free text mode: clicking icon removes it
            const currentVal = document.getElementById("activeConditionsInput").value;
            const list = currentVal.split(",").map(s => s.trim());
            const index = list.indexOf(cleanC);
            if (index > -1) {
                list.splice(index, 1);
                document.getElementById("activeConditionsInput").value = list.join(", ");
                window.renderConditionTags();
                window.saveCharacter();
            }
            return;
        }

        // Check for hover capability (Desktop vs Mobile)
        const hasHover = window.matchMedia('(hover: hover)').matches;
        
        if (hasHover) {
            window.openConditionModal(cleanC);
        } else {
            // Mobile: First tap expands, Second tap opens modal
            if (this.classList.contains('expanded')) {
                window.openConditionModal(cleanC);
            } else {
                // Collapse others
                Array.from(container.children).forEach(child => child.classList.remove('expanded'));
                this.classList.add('expanded');
                // Auto-collapse after 3s
                if (this.collapseTimer) clearTimeout(this.collapseTimer);
                this.collapseTimer = setTimeout(() => this.classList.remove('expanded'), 3000);
            }
        }
    };
    container.appendChild(div);
  });
}

window.openWeaponProfModal = function () {
  const currentVal = document.getElementById("weaponProfs").value;
  const currentArray = currentVal
    ? currentVal.split(",").map((s) => s.trim())
    : [];
  const container = document.getElementById("weaponChecklist");
  container.innerHTML = "";
  weaponProficiencyOptions.forEach((group) => {
    const header = document.createElement("div");
    header.className = "modal-section-header";
    header.style.gridColumn = "1 / -1";
    header.textContent = group.category;
    container.appendChild(header);
    group.items.forEach((item) => {
      const div = document.createElement("div");
      div.className = "checklist-item";
      div.onclick = function (e) {
        if (e.target.tagName !== "INPUT") {
          const cb = this.querySelector("input");
          cb.checked = !cb.checked;
        }
      };
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = item;
      if (currentArray.includes(item)) checkbox.checked = true;
      const span = document.createElement("span");
      span.textContent = item;
      div.appendChild(checkbox);
      div.appendChild(span);
      container.appendChild(div);
    });
  });
  document.getElementById("weaponProfModal").style.display = "flex";
};
window.closeWeaponProfModal = () =>
  (document.getElementById("weaponProfModal").style.display = "none");
window.saveWeaponProfsSelection = function () {
  const checkboxes = document.querySelectorAll(
    "#weaponChecklist input[type='checkbox']:checked",
  );
  const selected = Array.from(checkboxes).map((cb) => cb.value);
  document.getElementById("weaponProfs").value = selected.join(", ");
  renderWeaponTags();
  updateAllWeaponStats();
  saveCharacter();
  closeWeaponProfModal();
};
window.renderWeaponTags = function () {
  const raw = document.getElementById("weaponProfs").value;
  const display = document.getElementById("weaponProfsDisplay");
  display.innerHTML = "";
  if (!raw) {
    display.innerHTML =
      '<span style="color: var(--ink-light); font-style: italic; font-size: 0.9rem;">Click to select...</span>';
    return;
  }
  raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s)
    .forEach((item) => {
      const tag = document.createElement("div");
      tag.className = "tag-item";
      tag.textContent = item;
      display.appendChild(tag);
    });
};

// Weapon Picker
let currentWeaponInput = null;
window.openWeaponPicker = function (inputElement) {
  currentWeaponInput = inputElement;
  const modal = document.getElementById("weaponPickerModal");
  const list = document.getElementById("weaponPickerList");
  document.getElementById("weaponSearch").value = "";
  list.innerHTML = "";
  Object.keys(dndWeaponsDB)
    .sort()
    .forEach((name) => {
      const w = dndWeaponsDB[name];
      const div = document.createElement("div");
      div.className = "checklist-item";
      div.style.justifyContent = "space-between";
      div.innerHTML = `<span style="font-weight:bold;">${name}</span><span style="font-size:0.8rem; color:var(--ink-light);">${w.dmg} ${w.dtype}</span>`;
      div.onclick = () => selectWeaponFromPicker(name);
      list.appendChild(div);
    });
  modal.style.display = "flex";
  document.getElementById("weaponSearch").focus();
};
window.filterWeaponPicker = function () {
  const term = document.getElementById("weaponSearch").value.toLowerCase();
  document
    .querySelectorAll("#weaponPickerList .checklist-item")
    .forEach((item) => {
      item.style.display = item.textContent.toLowerCase().includes(term)
        ? "flex"
        : "none";
    });
};
window.closeWeaponPicker = function () {
  document.getElementById("weaponPickerModal").style.display = "none";
  currentWeaponInput = null;
};
window.selectCustomWeapon = function () {
  const term = document.getElementById("weaponSearch").value;
  if (currentWeaponInput) {
    currentWeaponInput.value = term || "Custom Weapon";
    saveCharacter();
  }
  closeWeaponPicker();
};
window.selectWeaponFromPicker = function (weaponName) {
  if (!currentWeaponInput) return;
  const weaponData = dndWeaponsDB[weaponName];
  const row = currentWeaponInput.closest(".weapon-item");
  const str = parseInt(document.getElementById("str").value) || 10;
  const dex = parseInt(document.getElementById("dex").value) || 10;
  const strMod = Math.floor((str - 10) / 2);
  const dexMod = Math.floor((dex - 10) / 2);
  const profBonusStr = document.getElementById("profBonus").value;
  const profBonus = parseInt(profBonusStr.replace(/[^0-9-]/g, '')) || 2;
  let abilityMod = strMod;
  if (weaponData.props.includes("Finesse")) {
    abilityMod = Math.max(strMod, dexMod);
  } else if (
    weaponData.cat === "Ranged" &&
    !weaponData.props.some((p) => p.includes("Thrown"))
  ) {
    abilityMod = dexMod;
  }

  const profString = document.getElementById("weaponProfs").value || "";
  let isProficient = false;
  if (weaponData.type === "Simple" && profString.includes("Simple Weapons"))
    isProficient = true;
  if (weaponData.type === "Martial" && profString.includes("Martial Weapons"))
    isProficient = true;
  if (profString.includes(weaponName)) isProficient = true;

  const totalAtk = abilityMod + (isProficient ? profBonus : 0);
  const totalDmg = abilityMod;
  const atkString = totalAtk >= 0 ? `+${totalAtk}` : `${totalAtk}`;
  const dmgString = `${weaponData.dmg} ${totalDmg >= 0 ? "+" : ""}${totalDmg} ${weaponData.dtype}`;
  let finalNotes = [...weaponData.props];
  if (weaponData.mastery) finalNotes.push(`Mastery: ${weaponData.mastery}`);

  currentWeaponInput.value = weaponName;
  row.querySelector(".weapon-atk").value = atkString;
  row.querySelector(".weapon-damage").value = dmgString;
  row.querySelector(".weapon-notes").value = finalNotes.join(", ");
  saveCharacter();
  closeWeaponPicker();
};

window.openMasteryModal = () =>
  (document.getElementById("masteryModal").style.display = "flex");
window.addWeapon = function (data = null) {
  const weaponList = document.getElementById("weapon-list");
  const newWeapon = document.createElement("div");
  newWeapon.className = "feature-box weapon-item";
  newWeapon.style.paddingRight = "40px";
  newWeapon.style.position = "relative";

  const isLocked = window.isDataAvailable;
  const nameField = isLocked
    ? `<input type="text" class="weapon-name" placeholder="Click to select..." onclick="openWeaponPicker(this)" readonly value="${data ? data.name : ""}" style="cursor: pointer; color: var(--red-dark); font-weight: bold;" />`
    : `<input type="text" class="weapon-name" placeholder="Enter weapon name" value="${data ? data.name : ""}" style="cursor: text; color: var(--ink); font-weight: bold;" />`;

  newWeapon.innerHTML = `<button class="delete-feature-btn" style="position: absolute; top: 5px; right: 5px; z-index:10; width: 24px; height: 24px;" onclick="this.closest('.weapon-item').remove(); saveCharacter();">&times;</button><div style="display: flex; flex-direction: column; gap: 10px;"><div class="grid grid-3" style="margin-bottom: 0; gap: 10px;"><div class="field"><span class="field-label">Weapon Name</span>${nameField}</div><div class="field"><span class="field-label">Atk Bonus</span><input type="text" class="weapon-atk" placeholder="+0" value="${data ? data.atk : ""}" /></div><div class="field"><span class="field-label">Damage</span><input type="text" class="weapon-damage" placeholder="1d6+0" value="${data ? data.damage : ""}" /></div></div><div class="field"><span class="field-label">Notes</span><input type="text" class="weapon-notes" placeholder="Properties..." value="${data ? data.notes : ""}" /></div></div>`;
  weaponList.appendChild(newWeapon);
  newWeapon
    .querySelectorAll("input")
    .forEach((input) => input.addEventListener("input", saveCharacter));
  if (!window.isInitializing) saveCharacter();
};

// Resources
window.renderResources = function() {
    const container = document.getElementById('resourcesContainer');
    if (!container) return;
    container.innerHTML = '';
    resourcesData.forEach((res, index) => {
        const box = document.createElement('div');
        box.className = 'resource-item';
        
        let slotsHtml = '';
        for(let i=0; i<res.max; i++) {
            const isUsed = i < res.used ? 'used' : '';
            slotsHtml += `<div class="resource-slot ${isUsed}" onclick="toggleResourceSlot(${index}, ${i})"></div>`;
        }

        box.innerHTML = `
            <div class="resource-header">
                <input type="text" class="resource-name" value="${res.name}" onchange="updateResourceName(${index}, this.value)" placeholder="Resource Name">
                <div class="resource-controls">
                    <button class="mini-btn" onclick="adjustResourceMax(${index}, -1)">-</button>
                    <input type="number" class="resource-max" value="${res.max}" onchange="updateResourceMax(${index}, this.value)" min="1" style="width:40px; text-align:center;">
                    <button class="mini-btn" onclick="adjustResourceMax(${index}, 1)">+</button>
                    <button class="delete-feature-btn" onclick="deleteResource(${index})">&times;</button>
                </div>
            </div>
            <div class="resource-slots">${slotsHtml}</div>
        `;
        container.appendChild(box);
    });
};

window.addResource = function() {
    resourcesData.push({ name: "New Resource", max: 3, used: 0 });
    renderResources();
    saveCharacter();
};
window.deleteResource = function(index) {
    if(confirm("Delete this resource?")) {
        resourcesData.splice(index, 1);
        renderResources();
        saveCharacter();
    }
};
window.updateResourceName = function(index, val) { resourcesData[index].name = val; saveCharacter(); };
window.updateResourceMax = function(index, val) { resourcesData[index].max = parseInt(val) || 1; if(resourcesData[index].used > resourcesData[index].max) resourcesData[index].used = resourcesData[index].max; renderResources(); saveCharacter(); };
window.adjustResourceMax = function(index, delta) {
    const res = resourcesData[index];
    if (!res) return;
    let newMax = (parseInt(res.max) || 0) + delta;
    if (newMax < 1) newMax = 1;
    res.max = newMax;
    if (res.used > res.max) res.used = res.max;
    renderResources();
    saveCharacter();
};
window.toggleResourceSlot = function(index, slotIndex) {
    if (slotIndex < resourcesData[index].used) resourcesData[index].used = slotIndex;
    else resourcesData[index].used = slotIndex + 1;
    renderResources();
    saveCharacter();
};

// Spells
function renderSpellSlots() {
  const container = document.getElementById("spellSlotsContainer");
  container.innerHTML = "";
  spellSlotsData.forEach((slotData, index) => {
    const slotBox = document.createElement("div");
    slotBox.className = "slot-level-container";
    let html = `<div class="slot-controls"><strong>Level ${slotData.level}</strong><div class="slot-btn-group"><button class="slot-btn-small" onclick="adjustSlotCount(${index}, -1)">-</button><button class="slot-btn-small" onclick="adjustSlotCount(${index}, 1)">+</button><button class="slot-btn-small" style="background:#fee; color:red; margin-left:8px;" onclick="removeSpellLevel(${index})">×</button></div></div><div class="spell-slot-tracker">`;
    for (let i = 0; i < slotData.total; i++) {
      const isUsed = i < slotData.used ? "used" : "";
      html += `<div class="spell-slot ${isUsed}" onclick="toggleSlot(${index}, ${i})"></div>`;
    }
    html += `</div>`;
    slotBox.innerHTML = html;
    container.appendChild(slotBox);
  });
}
window.toggleSlot = function (levelIndex, slotIndex) {
  const data = spellSlotsData[levelIndex];
  if (slotIndex < data.used) {
    data.used = slotIndex;
  } else {
    data.used = slotIndex + 1;
  }
  renderSpellSlots();
  saveCharacter();
};
window.adjustSlotCount = function (index, change) {
  if (spellSlotsData[index].total + change < 0) return;
  spellSlotsData[index].total += change;
  if (spellSlotsData[index].used > spellSlotsData[index].total) {
    spellSlotsData[index].used = spellSlotsData[index].total;
  }
  renderSpellSlots();
  saveCharacter();
};
window.addNewSpellLevel = function () {
  const nextLevel =
    spellSlotsData.length > 0
      ? spellSlotsData[spellSlotsData.length - 1].level + 1
      : 1;
  spellSlotsData.push({ level: nextLevel, total: 1, used: 0 });
  renderSpellSlots();
  saveCharacter();
};
window.removeSpellLevel = function (index) {
  if (confirm("Delete this spell level group?")) {
    spellSlotsData.splice(index, 1);
    renderSpellSlots();
    saveCharacter();
  }
};

window.openSpellNoteEditor = function(btn) {
    const row = btn.closest(".spell-row");
    const nameInput = row.querySelector(".spell-name");
    const descInput = row.querySelector(".spell-desc");
    window.openNoteEditor(nameInput.value, descInput, btn);
};

window.addSpellRow = function (containerId, defaultLevel = 1, data = null) {
  const container = document.getElementById(containerId);
  const row = document.createElement("div");
  row.className = "spell-row";
  const lvl = data ? data.level : defaultLevel === 0 ? "0" : "1";
  const isPrep = data ? data.prepared : containerId === "preparedSpellsList";
  const isCantrip =
    containerId === "cantripList" || defaultLevel === 0 || lvl === "0";
  if (isCantrip) row.classList.add("cantrip-row");
  const prepVisibility = isCantrip ? "visibility:hidden;" : "";
  const rChecked = data && data.ritual ? "checked" : "";
  const cChecked = data && data.concentration ? "checked" : "";
  const mChecked = data && data.material ? "checked" : "";
  
  const descVal = data && data.description ? data.description.replace(/"/g, "&quot;") : "";
  const hasNotes = descVal && descVal.length > 0;
  const noteBtnClass = hasNotes ? "note-btn has-notes" : "note-btn";

  row.innerHTML = `<div class="drag-handle">☰</div><div class="spell-col-prep" style="${prepVisibility}"><span class="mobile-label">Prep</span><input type="checkbox" class="spell-check spell-prep" title="Prepared" ${isPrep ? "checked" : ""}></div><input type="number" class="spell-input spell-lvl" value="${lvl}" placeholder="Lvl" style="text-align:center;"><input type="text" class="spell-input spell-name" value="${data ? data.name : ""}" placeholder="Spell Name"><input type="text" class="spell-input spell-time" value="${data ? data.time : ""}" placeholder="1 Act"><input type="text" class="spell-input spell-range" value="${data ? data.range : ""}" placeholder="60 ft"><div class="spell-col-ritual"><span class="mobile-label">Ritual</span><input type="checkbox" class="spell-check spell-ritual" title="Ritual" ${rChecked}></div><div class="spell-col-conc"><span class="mobile-label">Conc</span><input type="checkbox" class="spell-check spell-conc" title="Concentration" ${cChecked}></div><div class="spell-col-mat"><span class="mobile-label">Mat</span><input type="checkbox" class="spell-check spell-mat" title="Material" ${mChecked}></div><input type="hidden" class="spell-desc" value="${descVal}"><button class="${noteBtnClass}" onclick="openSpellNoteEditor(this)" title="Edit Description">📝</button><button class="delete-feature-btn" onclick="this.parentElement.remove(); saveCharacter()">×</button>`;

  const prepBox = row.querySelector(".spell-prep");
  if (!isCantrip) {
    prepBox.addEventListener("change", function () {
      if (this.checked) {
        document.getElementById("preparedSpellsList").appendChild(row);
      } else {
        document.getElementById("spellList").appendChild(row);
      }
      saveCharacter();
    });
  }
  row
    .querySelectorAll("input")
    .forEach((input) => input.addEventListener("input", saveCharacter));
  container.appendChild(row);
  setupDragItem(row, containerId);
  saveCharacter();
};

window.showSpellInfo = function (btn) {
  const row = btn.closest(".spell-row");
  const name = row.querySelector(".spell-name").value;
  const desc = row.querySelector(".spell-desc").value;
  document.getElementById("infoModalTitle").textContent =
    name || "Spell Description";
  document.getElementById("infoModalText").innerHTML = desc
    ? desc.replace(/\n/g, "<br>").replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
    : "No description available.";
  document.getElementById("infoModal").style.display = "flex";
};

// Modals Generic
window.showSkillInfo = function (skillKey, event) {
  if (event) event.stopPropagation();
  const title = skillKey
    .replace(/_/g, " ")
    .replace(/\b\w/g, (l) => l.toUpperCase());
  document.getElementById("infoModalTitle").textContent = title;
  document.getElementById("infoModalText").textContent =
    skillDescriptions[skillKey] || "No description available.";
  document.getElementById("infoModal").style.display = "flex";
};
window.closeInfoModal = (e) => {
  if (e.target.id === "infoModal")
    document.getElementById("infoModal").style.display = "none";
};
window.openCurrencyModal = () =>
  (document.getElementById("currencyModal").style.display = "flex");
window.closeCurrencyModal = (e) => {
  if (e.target.id === "currencyModal")
    document.getElementById("currencyModal").style.display = "none";
};

// Split Money Logic
window.openSplitMoneyModal = () => {
  ["splitCp", "splitSp", "splitEp", "splitGp", "splitPp"].forEach(
    (id) => (document.getElementById(id).value = ""),
  );
  document.getElementById("splitMoneyModal").style.display = "flex";
};
window.closeSplitMoneyModal = () =>
  (document.getElementById("splitMoneyModal").style.display = "none");

window.applySplitLoot = function () {
  const partySize =
    parseInt(document.getElementById("splitPartySize").value) || 1;
  if (partySize < 1) return;

  const currencies = ["cp", "sp", "ep", "gp", "pp"];
  currencies.forEach((curr) => {
    const totalFound =
      parseInt(
        document.getElementById(
          "split" + curr.charAt(0).toUpperCase() + curr.slice(1),
        ).value,
      ) || 0;
    const share = Math.floor(totalFound / partySize);
    if (share > 0) {
      const currentVal = parseInt(document.getElementById(curr).value) || 0;
      document.getElementById(curr).value = currentVal + share;
    }
  });
  saveCharacter();
  closeSplitMoneyModal();
};

// Manage Money Logic
window.openManageMoneyModal = () => {
  ["manageCp", "manageSp", "manageEp", "manageGp", "managePp"].forEach(
    (id) => (document.getElementById(id).value = ""),
  );
  document.getElementById("manageMoneyModal").style.display = "flex";
};
window.closeManageMoneyModal = () =>
  (document.getElementById("manageMoneyModal").style.display = "none");

window.applyMoneyChange = function (multiplier) {
  const currencies = ["cp", "sp", "ep", "gp", "pp"];
  currencies.forEach((curr) => {
    const change =
      parseInt(
        document.getElementById(
          "manage" + curr.charAt(0).toUpperCase() + curr.slice(1),
        ).value,
      ) || 0;
    if (change !== 0) {
      const currentVal = parseInt(document.getElementById(curr).value) || 0;
      // Allow negative values or clamp to 0? Usually D&D sheets allow debt or just 0. Let's allow math to happen.
      let newVal = currentVal + change * multiplier;
      if (newVal < 0) newVal = 0; // Prevent negative currency
      document.getElementById(curr).value = newVal;
    }
  });
  saveCharacter();
  closeManageMoneyModal();
};

window.openXpTableModal = function () {
  const container = document.getElementById("xpTableContent");
  if (!container.innerHTML.trim()) {
    let html =
      '<table class="currency-table"><thead><tr><th>Level</th><th>XP</th><th>Prof</th></tr></thead><tbody>';
    xpTable.forEach((row) => {
      html += `<tr><td>${row.lvl}</td><td>${row.xp.toLocaleString()}</td><td>+${row.prof}</td></tr>`;
    });
    html += "</tbody></table>";
    container.innerHTML = html;
  }
  const modal = document.getElementById("xpTableModal");
  const modalContent = modal.querySelector('.info-modal-content');
  if (modalContent) {
      modalContent.style.maxWidth = '';
      modalContent.style.width = '';
  }
  modal.style.display = "flex";
};
window.closeXpTableModal = (e) => {
  if (e.target.id === "xpTableModal")
    document.getElementById("xpTableModal").style.display = "none";
};

window.openScoreModal = function () {
  document.getElementById("scoreModal").style.display = "flex";
  abilities.forEach((stat) => {
    document.getElementById(`sa_${stat}`).value = "";
  });
  updateStandardArrayOptions();
  resetPointBuy();
};
window.closeScoreModal = () =>
  (document.getElementById("scoreModal").style.display = "none");
window.switchScoreTab = function (mode) {
  document
    .querySelectorAll(".score-tab")
    .forEach((t) => t.classList.remove("active"));
  document
    .querySelectorAll(".score-method-container")
    .forEach((c) => c.classList.remove("active"));
  if (mode === "standard") {
    document.querySelector(".score-tab:first-child").classList.add("active");
    document.getElementById("tab-standard").classList.add("active");
  } else {
    document.querySelector(".score-tab:last-child").classList.add("active");
    document.getElementById("tab-pointbuy").classList.add("active");
  }
};
window.updateStandardArrayOptions = function () {
  const selects = abilities.map((s) => document.getElementById(`sa_${s}`));
  const selectedValues = selects.map((s) => s.value).filter((v) => v !== "");
  selects.forEach((select) => {
    const myValue = select.value;
    Array.from(select.options).forEach((opt) => {
      if (opt.value === "") {
        opt.disabled = false;
        return;
      }
      opt.disabled =
        selectedValues.includes(opt.value) && opt.value !== myValue;
    });
  });
};
window.applyStandardArray = function () {
  let allFilled = true;
  abilities.forEach((stat) => {
    if (document.getElementById(`sa_${stat}`).value === "") allFilled = false;
  });
  if (!allFilled) {
    alert("Please assign a score to every ability.");
    return;
  }
  abilities.forEach((stat) => {
    document.getElementById(stat).value = document.getElementById(
      `sa_${stat}`,
    ).value;
  });
  updateModifiers();
  saveCharacter();
  closeScoreModal();
};
function resetPointBuy() {
  pbScores = { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 };
  renderPointBuy();
}
function getPointCost(score) {
  return pbCosts[score] || 0;
}
function calculateSpentPoints() {
  return Object.values(pbScores).reduce(
    (acc, score) => acc + getPointCost(score),
    0,
  );
}
window.adjustPointBuy = function (stat, delta) {
  const currentScore = pbScores[stat];
  const newScore = currentScore + delta;
  if (newScore < 8 || newScore > 15) return;
  pbScores[stat] = newScore;
  if (calculateSpentPoints() > maxPoints) {
    pbScores[stat] = currentScore;
    alert("Not enough points!");
  }
  renderPointBuy();
};
function renderPointBuy() {
  const container = document.getElementById("pb-rows-container");
  container.innerHTML = "";
  const remaining = maxPoints - calculateSpentPoints();
  const remEl = document.getElementById("pb-remaining");
  remEl.textContent = remaining;
  remEl.style.color = remaining < 0 ? "red" : "var(--ink)";
  Object.keys(pbScores).forEach((stat) => {
    const score = pbScores[stat];
    const canUpgrade =
      score < 15 && remaining >= getPointCost(score + 1) - getPointCost(score);
    const row = document.createElement("div");
    row.className = "pb-row";
    row.innerHTML = `<div class="pb-label" style="text-transform:uppercase; font-weight:bold; width:100px;">${stat}</div><div class="pb-controls"><button class="pb-btn" onclick="adjustPointBuy('${stat}', -1)" ${score <= 8 ? "disabled" : ""}>-</button><span class="pb-val">${score}</span><button class="pb-btn" onclick="adjustPointBuy('${stat}', 1)" ${!canUpgrade ? "disabled" : ""}>+</button></div><div class="pb-cost">Cost: ${getPointCost(score)}</div>`;
    container.appendChild(row);
  });
}
window.applyPointBuy = function () {
  Object.keys(pbScores).forEach((stat) => {
    document.getElementById(stat).value = pbScores[stat];
  });
  updateModifiers();
  saveCharacter();
  closeScoreModal();
};
window.setAlignment = function (val) {
  document.getElementById("alignment").value = val;
  document.getElementById("alignModal").style.display = "none";
  saveCharacter();
};
document
  .getElementById("alignment")
  .addEventListener(
    "click",
    () => (document.getElementById("alignModal").style.display = "flex"),
  );
document.getElementById("cancelAlign").onclick = () =>
  (document.getElementById("alignModal").style.display = "none");
window.openThemeModal = () =>
  (document.getElementById("themeModal").style.display = "flex");
window.closeThemeModal = (e) => {
  if (e.target.id === "themeModal")
    document.getElementById("themeModal").style.display = "none";
};
window.setTheme = function (themeName) {
  document.body.className = themeName;
  document.getElementById("themeModal").style.display = "none";
  saveCharacter();
};

/* =========================================
      ADVANTAGE TOGGLES
      ========================================= */
window.injectAdvantageToggles = function() {
    // Skills
    Object.keys(skillsMap).forEach(skill => {
        const modEl = document.getElementById(`skillMod_${skill}`);
        if (modEl && modEl.parentElement && !document.getElementById(`adv_skill_${skill}`)) {
            const btn = document.createElement('button');
            btn.id = `adv_skill_${skill}`;
            btn.className = 'adv-toggle';
            btn.innerText = 'A';
            btn.title = 'Toggle Advantage';
            btn.onclick = (e) => { e.stopPropagation(); toggleAdvantage('skills', skill); };
            modEl.parentElement.insertBefore(btn, modEl);
        }
    });
    
    // Saves
    abilities.forEach(ability => {
        const modEl = document.getElementById(`saveMod_${ability}`);
        if (modEl && modEl.parentElement && !document.getElementById(`adv_save_${ability}`)) {
            const btn = document.createElement('button');
            btn.id = `adv_save_${ability}`;
            btn.className = 'adv-toggle';
            btn.innerText = 'A';
            btn.title = 'Toggle Advantage';
            btn.onclick = (e) => { e.stopPropagation(); toggleAdvantage('saves', ability); };
            modEl.parentElement.insertBefore(btn, modEl);
        }
    });

    // Initiative
    const initInput = document.getElementById('initiative');
    if (initInput && initInput.parentElement && !document.getElementById('adv_init')) {
        const btn = document.createElement('button');
        btn.id = 'adv_init';
        btn.className = 'adv-toggle';
        btn.innerText = 'A';
        btn.title = 'Toggle Advantage';
        btn.style.position = 'absolute';
        btn.style.right = '5px';
        btn.style.top = '5px';
        btn.onclick = (e) => { e.stopPropagation(); toggleAdvantage('initiative'); };
        initInput.parentElement.style.position = 'relative';
        initInput.parentElement.appendChild(btn);
    }
};

window.toggleAdvantage = function(type, key) {
    if (type === 'initiative') {
        advantageState.initiative = !advantageState.initiative;
    } else {
        if (!advantageState[type]) advantageState[type] = {};
        advantageState[type][key] = !advantageState[type][key];
    }
    updateAdvantageVisuals();
    saveCharacter();
};

window.updateAdvantageVisuals = function() {
    // Skills
    Object.keys(skillsMap).forEach(skill => {
        const btn = document.getElementById(`adv_skill_${skill}`);
        if (btn) {
            const active = advantageState.skills && advantageState.skills[skill];
            btn.classList.toggle('active', !!active);
        }
    });
    // Saves
    abilities.forEach(ability => {
        const btn = document.getElementById(`adv_save_${ability}`);
        if (btn) {
            const active = advantageState.saves && advantageState.saves[ability];
            btn.classList.toggle('active', !!active);
        }
    });
    // Initiative
    const initBtn = document.getElementById('adv_init');
    if (initBtn) {
        initBtn.classList.toggle('active', !!advantageState.initiative);
    }
};

/* =========================================
      5. PERSISTENCE (SAVE / LOAD)
      ========================================= */
function getFeatureData(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return [];
  return Array.from(container.querySelectorAll(".feature-box")).map((box) => {
    const titleEl = box.querySelector(".feature-title-input");
    const descEl = box.querySelector(".feature-desc-input");
    if (!titleEl || !descEl) return null;
    return { title: titleEl.value, desc: descEl.value };
  }).filter(item => item !== null);
}

window.saveCharacter = function () {
  if (window.isInitializing) return;
  // CRITICAL FIX: Safe element selection for Inventory
  // We filter out any null entries in case a row is half-deleted or malformed
  const safeInventoryMap = (selector) => {
    return Array.from(document.querySelectorAll(selector))
      .map((item) => {
        const nameEl = item.querySelector(".name-field");
        if (!nameEl) return null; // Skip if main field missing
        return {
          name: nameEl.value,
          qty: item.querySelector(".qty-field")?.value || 0,
          weight: item.querySelector(".weight-field")?.value || 0,
          equipped: item.querySelector(".equip-check")?.checked || false,
          description: item.querySelector(".desc-field")?.value || "",
        };
      })
      .filter((item) => item !== null);
  };

  const characterData = {
    charID: document.getElementById("charID")?.value || "",
    charName: document.getElementById("charName").value,
    charClass: document.getElementById("charClass").value,
    charSubclass: document.getElementById("charSubclass").value,
    level: document.getElementById("level").value,
    race: document.getElementById("race").value,
    background: document.getElementById("background").value,
    alignment: document.getElementById("alignment").value,
    deity: document.getElementById("deity")?.value || "",
    xp: document.getElementById("experience").value,
    str: document.getElementById("str").value,
    dex: document.getElementById("dex").value,
    con: document.getElementById("con").value,
    int: document.getElementById("int").value,
    wis: document.getElementById("wis").value,
    cha: document.getElementById("cha").value,
    ac: document.getElementById("baseAC")?.value || "10",
    shield: document.getElementById("shieldEquipped")?.checked || false,
    armorLight: document.getElementById("armorLight").checked,
    armorMedium: document.getElementById("armorMedium").checked,
    armorHeavy: document.getElementById("armorHeavy").checked,
    armorShield: document.getElementById("armorShield").checked,
    weaponProfs: document.getElementById("weaponProfs").value,
    toolProfs: document.getElementById("toolProfs").value,
    speed: document.getElementById("speed").value,
    charSize: document.getElementById("charSize").value,
    sizeFt: document.getElementById("sizeFt").value,
    hp: document.getElementById("hp").value,
    maxHp: document.getElementById("maxHp").value,
    tempHp: document.getElementById("tempHp").value,
    profBonus: document.getElementById("profBonus").value,
    hitDice: document.getElementById("hitDice").value,
    activeConditions: document.getElementById("activeConditionsInput").value,
    heroicInspiration: document.getElementById("heroicInspiration").checked,
    defenses: document.getElementById("defenses").value,
    resourcesData: resourcesData,
    classes: window.characterClasses,

    weapons: Array.from(document.querySelectorAll(".weapon-item")).map(
      (item) => ({
        name: item.querySelector(".weapon-name").value,
        atk: item.querySelector(".weapon-atk").value,
        damage: item.querySelector(".weapon-damage").value,
        notes: item.querySelector(".weapon-notes").value,
      }),
    ),

    classFeatures: getFeatureData("classFeaturesContainer"),
    raceFeatures: getFeatureData("raceFeaturesContainer"),
    backgroundFeatures: getFeatureData("backgroundFeaturesContainer"),
    feats: getFeatureData("featsContainer"),
    actions: getFeatureData("actionsContainer"),
    bonusActions: getFeatureData("bonusActionsContainer"),
    reactions: getFeatureData("reactionsContainer"),

    // Using the safe map function here
    inventory: safeInventoryMap(".inventory-item"),

    attunement: [
      document.getElementById("attune1").value,
      document.getElementById("attune2").value,
      document.getElementById("attune3").value,
    ],
    spellSlotsData: spellSlotsData,
    cantripsList: Array.from(
      document.querySelectorAll("#cantripList .spell-row"),
    ).map((row) => ({
      level: row.querySelector(".spell-lvl").value,
      name: row.querySelector(".spell-name").value,
      time: row.querySelector(".spell-time").value,
      range: row.querySelector(".spell-range").value,
      ritual: row.querySelector(".spell-ritual").checked,
      concentration: row.querySelector(".spell-conc").checked,
      material: row.querySelector(".spell-mat").checked,
      description: row.querySelector(".spell-desc").value,
    })),
    preparedSpellsList: Array.from(
      document.querySelectorAll("#preparedSpellsList .spell-row"),
    ).map((row) => ({
      level: row.querySelector(".spell-lvl").value,
      name: row.querySelector(".spell-name").value,
      time: row.querySelector(".spell-time").value,
      range: row.querySelector(".spell-range").value,
      ritual: row.querySelector(".spell-ritual").checked,
      concentration: row.querySelector(".spell-conc").checked,
      material: row.querySelector(".spell-mat").checked,
      description: row.querySelector(".spell-desc").value,
      prepared: true,
    })),
    spellsList: Array.from(
      document.querySelectorAll("#spellList .spell-row"),
    ).map((row) => ({
      level: row.querySelector(".spell-lvl").value,
      name: row.querySelector(".spell-name").value,
      time: row.querySelector(".spell-time").value,
      range: row.querySelector(".spell-range").value,
      ritual: row.querySelector(".spell-ritual").checked,
      concentration: row.querySelector(".spell-conc").checked,
      material: row.querySelector(".spell-mat").checked,
      description: row.querySelector(".spell-desc").value,
      prepared: false,
    })),
    languages: document.getElementById("languages").value,
    personality: document.getElementById("personality").value,
    ideals: document.getElementById("ideals").value,
    bonds: document.getElementById("bonds").value,
    flaws: document.getElementById("flaws").value,
    notes: document.getElementById("notes").value,
    cp: document.getElementById("cp").value,
    sp: document.getElementById("sp").value,
    ep: document.getElementById("ep").value,
    gp: document.getElementById("gp").value,
    pp: document.getElementById("pp").value,
    spellAbility: document.getElementById("spellAbility").value,
    spellAttackMod: document.getElementById("spellAttackMod")?.value || "",
    spellAttackBonus: document.getElementById("spellAttackBonus")?.value || "",
    skillProficiency,
    saveProficiency,
    deathSaves,
    advantageState,
    currentTheme: document.body.className,
    activeTab: document.querySelector(".tab-content.active")?.id,
  };
  localStorage.setItem("dndCharacter", JSON.stringify(characterData));

  // Update Dense Header if active
  const denseHeader = document.getElementById('dense-header');
  if (denseHeader) {
      const nameVal = characterData.charName || "Character Name";
      const raceVal = characterData.race || "Race";
      const classVal = characterData.charClass || "Class";
      const levelVal = characterData.level || "1";
      denseHeader.innerHTML = `
          <div style="font-family:'Cinzel',serif; font-weight:700; font-size:1.6rem; color:var(--red-dark); line-height:1.2;">${nameVal}</div>
          <div style="font-family:'Crimson Text',serif; font-size:1rem; color:var(--ink); font-weight:bold;">${raceVal} ${classVal}</div>
          <div style="font-family:'Cinzel',serif; font-size:0.9rem; color:var(--ink-light); margin-top:2px;">Level ${levelVal}</div>
      `;
  }
};

window.downloadJSON = function () {
  saveCharacter();
  const dataStr = localStorage.getItem("dndCharacter");
  const dataObj = JSON.parse(dataStr);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${dataObj.charName || "character"}_sheet.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

window.loadJSON = function (input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      JSON.parse(e.target.result);
      localStorage.setItem("dndCharacter", e.target.result);
      location.reload();
    } catch (err) {
      alert("Error loading file: " + err);
    }
  };
  reader.readAsText(file);
};

window.openLastSavedModal = function () {
  const saved = localStorage.getItem("dndCharacter");
  const textarea = document.getElementById("lastSavedTextarea");
  if (saved) {
    try {
      textarea.value = JSON.stringify(JSON.parse(saved), null, 2);
    } catch (e) {
      textarea.value = saved;
    }
  } else {
    textarea.value = "";
  }
  document.getElementById("lastSavedModal").style.display = "flex";
};

window.restoreFromModal = function () {
  const val = document.getElementById("lastSavedTextarea").value;
  if (!val) return;
  try {
    JSON.parse(val); // Validate
    localStorage.setItem("dndCharacter", val);
    location.reload();
  } catch (e) {
    alert("Invalid JSON data. Cannot load.");
  }
};

window.copyLastSaved = function () {
  const textarea = document.getElementById("lastSavedTextarea");
  textarea.select();
  textarea.setSelectionRange(0, 99999);
  try {
    document.execCommand("copy");
    alert("Copied to clipboard!");
  } catch (err) {
    alert("Failed to copy.");
  }
};

/* =========================================
      CHARACTER MANAGER (Multi-Character)
      ========================================= */
window.openCharacterManager = function () {
  // Ensure modal exists
  let modal = document.getElementById("charManagerModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "charManagerModal";
    modal.className = "info-modal-overlay";
    modal.innerHTML = `
               <div class="info-modal-content" style="max-width: 500px;">
                   <button class="close-modal-btn" onclick="document.getElementById('charManagerModal').style.display='none'">&times;</button>
                   <h3 class="info-modal-title">Character Library</h3>
                   
                   <div style="margin-bottom: 20px; padding-bottom: 15px; border-bottom: 1px solid var(--gold);">
                       <h4 style="margin-bottom: 10px; color: var(--ink);">Current Character</h4>
                       <div style="display: flex; gap: 10px;">
                           <button class="btn" onclick="saveCurrentToLibrary()" style="flex: 1; font-size: 0.9rem;">Save to Library</button>
                           <button class="btn btn-secondary" onclick="createNewCharacter()" style="flex: 1; font-size: 0.9rem;">New Character</button>
                       </div>
                       <div style="margin-top: 8px; font-size: 0.85rem; color: var(--ink-light); font-style: italic;">
                           "Save to Library" stores the current sheet so you can switch back to it later.
                       </div>
                   </div>

                   <h4 style="margin-bottom: 10px; color: var(--ink);">Saved Characters</h4>
                   <div id="charManagerList" class="char-manager-list"></div>
               </div>
           `;
    document.body.appendChild(modal);
  }

  renderCharacterLibrary();
  modal.style.display = "flex";
};

window.renderCharacterLibrary = function () {
  const list = document.getElementById("charManagerList");
  list.innerHTML = "";
  const library = JSON.parse(localStorage.getItem("dndLibrary") || "{}");
  const ids = Object.keys(library);

  if (ids.length === 0) {
    list.innerHTML =
      '<div style="text-align: center; color: var(--ink-light); padding: 10px;">No saved characters.</div>';
    return;
  }

  ids.forEach((id) => {
    const char = library[id];
    const div = document.createElement("div");
    div.className = "char-manager-item";
    div.innerHTML = `
               <div class="char-info">
                   <div class="char-name">${char.charName || "Unnamed"}</div>
                   <div class="char-details">Lvl ${char.level || 1} ${char.charClass || "Adventurer"}</div>
               </div>
               <div class="char-actions">
                   <button class="btn btn-secondary" onclick="loadFromLibrary('${id}')" style="padding: 4px 8px; font-size: 0.8rem;">Load</button>
                   <button class="delete-feature-btn" onclick="deleteFromLibrary('${id}')" title="Delete">&times;</button>
               </div>
           `;
    list.appendChild(div);
  });
};

window.saveCurrentToLibrary = function () {
  let charID = document.getElementById("charID").value;
  if (!charID) {
    charID = crypto.randomUUID();
    document.getElementById("charID").value = charID;
    saveCharacter(); // Save ID to current state
  }

  const currentData = JSON.parse(localStorage.getItem("dndCharacter"));
  const library = JSON.parse(localStorage.getItem("dndLibrary") || "{}");

  library[charID] = currentData;
  localStorage.setItem("dndLibrary", JSON.stringify(library));
  renderCharacterLibrary();
  alert("Character saved to library!");
};

window.loadFromLibrary = function (id) {
  if (
    !confirm(
      "Load this character? Unsaved changes to the current sheet will be lost if not saved to the library.",
    )
  )
    return;

  const library = JSON.parse(localStorage.getItem("dndLibrary") || "{}");
  const data = library[id];
  if (data) {
    localStorage.setItem("dndCharacter", JSON.stringify(data));
    location.reload();
  }
};

window.deleteFromLibrary = function (id) {
  if (!confirm("Permanently delete this character from the library?")) return;
  const library = JSON.parse(localStorage.getItem("dndLibrary") || "{}");
  delete library[id];
  localStorage.setItem("dndLibrary", JSON.stringify(library));
  renderCharacterLibrary();
};

window.createNewCharacter = function () {
  if (
    !confirm(
      "Create new character? Make sure to save your current one to the library first!",
    )
  )
    return;
  localStorage.removeItem("dndCharacter");
  location.reload();
};

window.resetSheet = function () {
  if (confirm("Clear all data? This cannot be undone.")) {
    localStorage.removeItem("dndCharacter");
    location.reload();
  }
};

window.createSidebarMenu = function () {
  if (document.querySelector(".hamburger-btn")) return; // Prevent duplicates

  const hamburger = document.createElement("button");
  hamburger.className = "hamburger-btn";
  hamburger.innerHTML = "☰";
  hamburger.title = "Menu";
  hamburger.onclick = window.toggleSidebar;
  document.body.appendChild(hamburger);

  const gridBtn = document.createElement("button");
  gridBtn.className = "grid-menu-btn";
  gridBtn.innerHTML =
    '<svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/></svg>';
  gridBtn.title = "Apps";
  document.body.appendChild(gridBtn);

  const sidebar = document.createElement("div");
  sidebar.id = "main-sidebar";
  sidebar.className = "sidebar-nav";
  sidebar.innerHTML = `
           <div class="sidebar-header">
               <h3>Menu</h3>
               <button class="close-sidebar-btn" onclick="window.toggleSidebar()">&times;</button>
           </div>
           <div class="sidebar-content" id="sidebar-content"></div>
       `;
  document.body.appendChild(sidebar);

  const overlay = document.createElement("div");
  overlay.id = "sidebar-overlay";
  overlay.className = "sidebar-overlay";
  overlay.onclick = window.toggleSidebar;
  document.body.appendChild(overlay);

  const actionsDiv = document.querySelector(".sheet-actions");
  const sidebarContent = document.getElementById("sidebar-content");

  // Add Characters Button
  const charBtn = document.createElement("button");
  charBtn.className = "sidebar-btn";
  charBtn.innerText = "Characters";
  charBtn.onclick = () => {
    window.openCharacterManager();
    window.toggleSidebar();
  };
  sidebarContent.appendChild(charBtn);

  // Dense Mode Toggle
  const denseBtn = document.createElement("button");
  denseBtn.className = "sidebar-btn";
  denseBtn.innerText = "Toggle Dense View";
  denseBtn.onclick = window.toggleDenseMode;
  sidebarContent.appendChild(denseBtn);

  if (actionsDiv) {
    Array.from(actionsDiv.children).forEach((child) => {
      // Move buttons/labels to sidebar
      child.classList.add("sidebar-btn");
      child.classList.remove("btn", "btn-secondary", "btn-danger");
      sidebarContent.appendChild(child);
    });
    actionsDiv.style.display = "none";
  }
};

window.injectCombatActions = function (actionsData) {
  const actionsContainer = document.getElementById("actionsContainer");
  if (!actionsContainer) return;

  let refDiv = document.getElementById("combat-actions-ref");
  if (!refDiv) {
    refDiv = document.createElement("div");
    refDiv.id = "combat-actions-ref";
    refDiv.className = "feature-box";
    refDiv.style.background = "var(--parchment-dark)";
    refDiv.style.marginBottom = "15px";

    // Insert Logic
    let inserted = false;
    if (
      !inserted &&
      actionsContainer.parentElement &&
      actionsContainer.parentElement.parentElement &&
      actionsContainer.parentElement.parentElement.classList.contains("grid")
    ) {
      const grid = actionsContainer.parentElement.parentElement;
      grid.parentNode.insertBefore(refDiv, grid);
      inserted = true;
    }
    if (!inserted) {
      actionsContainer.parentNode.insertBefore(refDiv, actionsContainer);
    }
  }

  refDiv.innerHTML = `
           <div style="font-family:'Cinzel',serif; font-weight:bold; color:var(--red-dark); border-bottom:1px solid var(--gold); margin-bottom:5px; padding-bottom:2px; font-size:0.9rem;">
               Actions in Combat
           </div>
           <div class="combat-actions-list" style="font-size:0.85rem; color:var(--ink); line-height:1.4; display:flex; flex-wrap:wrap; gap:4px;"></div>
       `;

  const list = refDiv.querySelector(".combat-actions-list");
  actionsData.forEach((action, index) => {
    const span = document.createElement("span");
    span.textContent = action.name;
    span.style.cursor = "help";
    span.style.borderBottom = "1px dotted var(--ink-light)";
    span.title = "Click for details";
    span.onclick = () => {
      document.getElementById("infoModalTitle").textContent = action.name;
      let desc = window.processEntries(action.entries);
      // Clean tags
      desc = window.cleanText(desc);
      document.getElementById("infoModalText").innerHTML = desc;
      document.getElementById("infoModal").style.display = "flex";
    };
    list.appendChild(span);
    if (index < actionsData.length - 1) {
      list.appendChild(document.createTextNode(", "));
    }
  });
};

window.toggleDenseMode = function () {
  document.body.classList.toggle("dense-mode");
  const isDense = document.body.classList.contains("dense-mode");
  localStorage.setItem("denseMode", isDense);
  resizeAllTextareas();
  
  if (isDense) {
      window.enableDenseLayout();
  } else {
      window.disableDenseLayout();
  }
};

window.enableDenseLayout = function() {
    if (document.getElementById('dense-layout-root')) return;
    const sheet = document.querySelector('.character-sheet');
    if (!sheet) return;

    // Create Grid Structure
    const root = document.createElement('div');
    root.id = 'dense-layout-root';
    
    const combatArea = document.createElement('div');
    combatArea.id = 'dense-combat-top';

    const scoresArea = document.createElement('div');
    scoresArea.id = 'dense-scores';
    
    const sidebarArea = document.createElement('div');
    sidebarArea.id = 'dense-sidebar';

    const sidebarLeft = document.createElement('div');
    sidebarLeft.id = 'dense-sidebar-left';
    const sidebarRight = document.createElement('div');
    sidebarRight.id = 'dense-sidebar-right';
    sidebarArea.appendChild(sidebarLeft);
    sidebarArea.appendChild(sidebarRight);
    
    const mainArea = document.createElement('div');
    mainArea.id = 'dense-main';
    
    root.appendChild(combatArea);
    root.appendChild(scoresArea);
    root.appendChild(sidebarArea);
    root.appendChild(mainArea);

    // Helper to move element with placeholder
    const move = (el, target) => {
        if (!el) return;
        const ph = document.createElement('div');
        ph.id = `ph-${el.id || Math.random().toString(36).substr(2,9)}`;
        ph.className = 'dense-placeholder';
        ph.style.display = 'none';
        el.parentNode.insertBefore(ph, el);
        el.dataset.originalParent = ph.id;
        target.appendChild(el);
    };

    // 0. Move Combat & HP (Top)
    const combatStats = document.querySelector('.combat-stats');
    if (combatStats) move(combatStats, combatArea);
    
    const ddbHp = document.querySelector('.ddb-hp-box');
    if (ddbHp) move(ddbHp, combatArea);

    // Hide Top Section & Create Dense Header
    const charNameInput = document.getElementById('charName');
    if (charNameInput) {
        const topSection = charNameInput.closest('.sheet-section');
        if (topSection) {
            topSection.style.display = 'none';
            topSection.dataset.hiddenByDense = 'true';

            const denseHeader = document.createElement('div');
            denseHeader.id = 'dense-header';

            const nameVal = charNameInput.value || "Character Name";
            const raceVal = document.getElementById('race').value || "Race";
            const classVal = document.getElementById('charClass').value || "Class";
            const levelVal = document.getElementById('level').value || "1";
            
            denseHeader.innerHTML = `
                <div style="font-family:'Cinzel',serif; font-weight:700; font-size:1.6rem; color:var(--red-dark); line-height:1.2;">${nameVal}</div>
                <div style="font-family:'Crimson Text',serif; font-size:1rem; color:var(--ink); font-weight:bold;">${raceVal} ${classVal}</div>
                <div style="font-family:'Cinzel',serif; font-size:0.9rem; color:var(--ink-light); margin-top:2px;">Level ${levelVal}</div>
            `;
            
            topSection.parentNode.insertBefore(denseHeader, topSection);
        }
    }

    // Shorten Stat Names
    document.querySelectorAll('.stat-name').forEach(el => {
        if (!el.dataset.originalText) el.dataset.originalText = el.textContent;
        el.textContent = el.textContent.substring(0, 3).toUpperCase();
    });

    // 1. Move Stats (Top) & Skills (Left)
    document.querySelectorAll('.stat-card').forEach(card => {
        const stat = card.querySelector('.stat');
        const skills = card.querySelector('.stat-skills');
        if (stat) move(stat, scoresArea);
        if (skills) {
            const wrapper = document.createElement('div');
            wrapper.className = 'dense-skill-group feature-box';
            wrapper.style.marginBottom = '0';
            
            // Add Header
            const statName = stat.querySelector('.stat-name');
            if (statName) {
                const header = document.createElement('div');
                header.className = 'dense-group-header';
                header.textContent = (statName.dataset.originalText || statName.textContent).toUpperCase();
                header.style.fontWeight = 'bold';
                header.style.color = 'var(--red-dark)';
                header.style.borderBottom = '1px solid var(--gold)';
                header.style.marginBottom = '5px';
                header.style.fontSize = '0.85rem';
                wrapper.appendChild(header);
            }

            move(skills, wrapper);
            sidebarRight.appendChild(wrapper);
        }
    });

    // 2. Move Proficiencies (Left)
    const profsWrapper = document.createElement('div');
    profsWrapper.className = 'feature-box dense-profs-wrapper';
    profsWrapper.style.display = 'flex';
    profsWrapper.style.flexDirection = 'column';
    profsWrapper.style.gap = '5px';
    profsWrapper.innerHTML = '<div class="feature-header" style="border-bottom: 1px solid var(--gold); margin-bottom: 2px; font-weight: bold; color: var(--red-dark); font-size: 0.85rem; padding-bottom: 2px;">Proficiencies</div>';

    const armorField = document.getElementById('armorLight')?.closest('.field');
    if (armorField) move(armorField, profsWrapper);
    
    const weaponField = document.getElementById('weaponProfs')?.closest('.field') || document.getElementById('weaponProfsSelector')?.closest('.field');
    if (weaponField) move(weaponField, profsWrapper);
    
    const toolField = document.getElementById('toolProfs')?.closest('.field');
    if (toolField) move(toolField, profsWrapper);
    
    if (profsWrapper.children.length > 1) {
        sidebarLeft.appendChild(profsWrapper);
    }
    
    const langField = document.getElementById('languages')?.closest('.field');
    if (langField) move(langField, sidebarLeft);
    
    const defField = document.getElementById('defenses')?.closest('.field');
    const condField = document.getElementById('activeConditionsInput')?.closest('.combat-stat') || document.getElementById('activeConditionsInput')?.closest('.field');

    if (defField || condField) {
        const defWrapper = document.createElement('div');
        defWrapper.className = 'feature-box dense-defenses-wrapper';
        defWrapper.style.display = 'flex';
        defWrapper.style.flexDirection = 'column';
        defWrapper.style.gap = '5px';
        defWrapper.innerHTML = '<div class="feature-header" style="border-bottom: 1px solid var(--gold); margin-bottom: 2px; font-weight: bold; color: var(--red-dark); font-size: 0.85rem; padding-bottom: 2px;">Defenses & Immunities</div>';
        
        if (defField) move(defField, defWrapper);
        if (condField) move(condField, defWrapper);
        
        sidebarLeft.appendChild(defWrapper);
    }

    const deathSavesBox = document.querySelector('.death-saves-box');
    if (deathSavesBox) move(deathSavesBox, sidebarLeft);

    const hpDeathGrid = document.querySelector('.hp-death-grid');
    if (hpDeathGrid) hpDeathGrid.style.display = 'none';

    // 3. Move Tabs & Actions (Right)
    const tabs = document.querySelector('.tabs');
    if (tabs) move(tabs, mainArea);
    
    document.querySelectorAll('.tab-content').forEach(tc => move(tc, mainArea));

    // Move Action Economy to Tabs
    const actionHeader = document.getElementById('section-actions');
    if (actionHeader) {
        const actionSection = actionHeader.closest('.sheet-section');
        if (actionSection) {
            // Create Tab Button
            const actionTabBtn = document.createElement('div');
            actionTabBtn.className = 'tab dense-generated-tab';
            actionTabBtn.textContent = 'Actions';
            actionTabBtn.setAttribute('onclick', "switchTab('dense-actions')");
            
            // Insert next to Spells tab
            if (tabs) {
                const spellsTab = Array.from(tabs.children).find(el => el.textContent.includes('Spells'));
                if (spellsTab && spellsTab.nextSibling) {
                    tabs.insertBefore(actionTabBtn, spellsTab.nextSibling);
                } else {
                    tabs.appendChild(actionTabBtn);
                }
            }

            // Prepare Content
            actionSection.classList.add('tab-content');
            actionSection.id = 'dense-actions';
            
            move(actionSection, mainArea);

            // Move Weapon List to Actions Tab
            const weaponList = document.getElementById('weapon-list');
            if (weaponList) {
                move(weaponList, actionSection);
                actionSection.prepend(weaponList);
                
                const atkHeader = document.createElement('div');
                atkHeader.className = 'dense-attacks-header feature-header';
                atkHeader.style.fontWeight = 'bold';
                atkHeader.style.color = 'var(--red-dark)';
                atkHeader.style.borderBottom = '1px solid var(--gold)';
                atkHeader.style.marginBottom = '5px';
                atkHeader.style.marginTop = '5px';
                atkHeader.textContent = 'Attacks';
                actionSection.prepend(atkHeader);
            }
        }
    }

    // Insert Root before Stat Block (keeping Name/Inputs at top)
    const statBlock = document.querySelector('.stat-block');
    if (statBlock) {
        statBlock.parentNode.insertBefore(root, statBlock);
    } else {
        // Fallback
        const header = document.querySelector('.header');
        if (header && header.nextSibling) header.parentNode.insertBefore(root, header.nextSibling);
        else sheet.appendChild(root);
    }
};

window.disableDenseLayout = function() {
    const root = document.getElementById('dense-layout-root');
    if (!root) return;

    // Remove Dense Header & Show Top Section
    const denseHeader = document.getElementById('dense-header');
    if (denseHeader) denseHeader.remove();

    // Restore Stat Names
    document.querySelectorAll('.stat-name').forEach(el => {
        if (el.dataset.originalText) {
            el.textContent = el.dataset.originalText;
            delete el.dataset.originalText;
        }
    });

    const charNameInput = document.getElementById('charName');
    if (charNameInput) {
        const topSection = charNameInput.closest('.sheet-section');
        if (topSection && topSection.dataset.hiddenByDense === 'true') {
            topSection.style.display = '';
            delete topSection.dataset.hiddenByDense;
        }
    }

    // Cleanup Action Tab
    const actionSection = document.getElementById('dense-actions');
    if (actionSection) {
        actionSection.classList.remove('tab-content');
        actionSection.classList.remove('active');
        actionSection.removeAttribute('id');
    }
    document.querySelectorAll('.dense-generated-tab').forEach(el => el.remove());
    document.querySelectorAll('.dense-attacks-header').forEach(el => el.remove());

    // Restore all moved elements
    document.querySelectorAll('[data-original-parent]').forEach(el => {
        const ph = document.getElementById(el.dataset.originalParent);
        if (ph) {
            ph.parentNode.insertBefore(el, ph);
            ph.remove();
        }
        delete el.dataset.originalParent;
    });

    const hpDeathGrid = document.querySelector('.hp-death-grid');
    if (hpDeathGrid) hpDeathGrid.style.display = '';

    // Remove Labels
    document.querySelectorAll('.dense-ability-label').forEach(el => el.remove());

    root.remove();
};

window.toggleSidebar = function () {
  const sidebar = document.getElementById("main-sidebar");
  const overlay = document.getElementById("sidebar-overlay");
  if (sidebar.classList.contains("open")) {
    sidebar.classList.remove("open");
    overlay.classList.remove("open");
  } else {
    sidebar.classList.add("open");
    overlay.classList.add("open");
  }
};

window.initQuickNav = function () {
  if (document.getElementById("quick-nav")) return;

  const nav = document.createElement("div");
  nav.className = "quick-nav";
  nav.id = "quick-nav";

  const gridBtn = document.querySelector(".grid-menu-btn");
  if (gridBtn) {
    gridBtn.onclick = (e) => {
      e.stopPropagation();
      nav.classList.toggle("visible");
    };
  }

  document.addEventListener("click", (e) => {
    if (
      nav.classList.contains("visible") &&
      !nav.contains(e.target) &&
      (!gridBtn || !gridBtn.contains(e.target))
    ) {
      nav.classList.remove("visible");
    }
  });

  document.body.appendChild(nav);

  const buildLinks = () => {
    const navItems = [
      {
        id: "stats",
        label: "Abilities",
        icon: '<path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>',
      },
      {
        id: "combat",
        label: "Combat",
        icon: '<path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>',
      },
      {
        id: "resources",
        label: "Resources",
        icon: '<path d="M7 2v11h3v9l7-12h-4l4-8z"/>',
      },
      {
        id: "actions",
        label: "Actions",
        icon: '<path d="M6 2l10 10L6 22l-2-2 10-10L4 4z"/>',
      },
      {
        id: "extras",
        label: "Extras",
        icon: '<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>',
      },
      {
        id: "features",
        label: "Features",
        icon: '<path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>',
      },
      {
        id: "equipment",
        label: "Inventory",
        icon: '<path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z"/>',
      },
      {
        id: "spells",
        label: "Spells",
        icon: '<path d="M7.5 5.6L10 7 7.5 8.4 6.1 10.9 4.7 8.4 2.2 7l2.5-1.4L6.1 3.1 7.5 5.6zm12 9.8L17 14l2.5-1.4 1.4-2.5 1.4 2.5 2.5 1.4-2.5 1.4-1.4 2.5-1.4-2.5zM22 2l-2.5 1.4L18.1 5.9 16.7 3.4 14.2 2l2.5-1.4L18.1.6 19.5 3.1 22 2z"/>',
      },
      {
        id: "notes",
        label: "Notes",
        icon: '<path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>',
      },
    ];

    let html = "";
    navItems.forEach((item) => {
      if (item.id === "features") {
          html += `
            <div class="nav-group-features">
                <button class="nav-btn-custom" data-target="${item.id}">
                    <svg viewBox="0 0 24 24" width="1.5em" height="1.5em" style="min-width:24px" fill="currentColor">
                        ${item.icon}
                    </svg>
                    <span>${item.label}</span>
                    <span class="arrow" style="margin-left:auto; font-size:0.8em;">▶</span>
                </button>
                <div class="nav-sub-items" style="display:none; flex-direction:column; gap:5px; padding-left:15px; border-left:2px solid var(--gold); margin-top:5px;">
                    <button class="nav-btn-custom sub-item" data-target="class-features-sub" style="font-size:0.85rem; padding:8px;">Class</button>
                    <button class="nav-btn-custom sub-item" data-target="race-features-sub" style="font-size:0.85rem; padding:8px;">Race</button>
                    <button class="nav-btn-custom sub-item" data-target="bg-features-sub" style="font-size:0.85rem; padding:8px;">Background</button>
                    <button class="nav-btn-custom sub-item" data-target="feats-sub" style="font-size:0.85rem; padding:8px;">Feats</button>
                </div>
            </div>
          `;
      } else {
          html += `
                <button class="nav-btn-custom" data-target="${item.id}">
                    <svg viewBox="0 0 24 24" width="1.5em" height="1.5em" style="min-width:24px" fill="currentColor">
                        ${item.icon}
                    </svg>
                    <span>${item.label}</span>
                </button>
               `;
      }
    });

    nav.innerHTML = html;

    nav.querySelectorAll(".nav-btn-custom").forEach((btn) => {
      btn.onclick = (e) => {
        const target = btn.dataset.target;
        
        if (target === "features") {
            e.stopPropagation();
            const sub = btn.nextElementSibling;
            if (sub && sub.classList.contains('nav-sub-items')) {
                const isHidden = sub.style.display === 'none';
                sub.style.display = isHidden ? 'flex' : 'none';
                const arrow = btn.querySelector('.arrow');
                if (arrow) arrow.innerHTML = isHidden ? '▼' : '▶';
            }
            return;
        }

        nav.classList.remove("visible");

        const scrollToContainer = (id) => {
            const el = document.getElementById(id);
            if (el) {
                const tabContent = el.closest('.tab-content');
                if (tabContent) {
                    window.switchTab(tabContent.id);
                    setTimeout(() => el.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
                }
            }
        };

        // Logic to scroll to section or switch tab
        if (target === "stats") {
          document
            .getElementById("section-stats")
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (target === "combat") {
          document
            .getElementById("section-combat")
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        } else if (target === "resources") {
          document
            .getElementById("section-resources")
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        } else if (target === "actions") {
          document
            .getElementById("section-actions")
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        } else if (target === "spells") {
          window.switchTab("spells");
          const el = document.querySelector(".tabs");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (target === "equipment") {
          window.switchTab("equipment");
          const el = document.querySelector(".tabs");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (target === "class-features-sub") {
          scrollToContainer("classFeaturesContainer");
        } else if (target === "race-features-sub") {
          scrollToContainer("raceFeaturesContainer");
        } else if (target === "bg-features-sub") {
          scrollToContainer("backgroundFeaturesContainer");
        } else if (target === "feats-sub") {
          scrollToContainer("featsContainer");
        } else if (target === "notes") {
          window.switchTab("notes");
          const el = document.querySelector(".tabs");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        } else if (target === "extras") {
          window.switchTab("feats"); // Default extra to feats since spells has its own button
          const el = document.querySelector(".tabs");
          if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      };
    });
  };
  // Build immediately
  buildLinks();
};

window.openHpSettingsModal = function() {
    let modal = document.getElementById('hpSettingsModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'hpSettingsModal';
        modal.className = 'info-modal-overlay';
        modal.innerHTML = `
            <div class="info-modal-content" style="max-width: 300px; text-align: center;">
                <button class="close-modal-btn" onclick="document.getElementById('hpSettingsModal').style.display='none'">&times;</button>
                <h3 class="info-modal-title">HP Settings</h3>
                <div class="field" style="margin-bottom: 10px;">
                    <span class="field-label">Current HP</span>
                    <input type="number" id="modal-hp-current" style="text-align:center; font-weight:bold;">
                </div>
                <div class="field" style="margin-bottom: 10px;">
                    <span class="field-label">Max HP</span>
                    <input type="number" id="modal-hp-max" style="text-align:center; font-weight:bold;">
                </div>
                <div class="field" style="margin-bottom: 15px;">
                    <span class="field-label">Temp HP</span>
                    <input type="number" id="modal-hp-temp" style="text-align:center; font-weight:bold; color:#2d6a4f;">
                </div>
                <button class="btn" onclick="window.saveHpSettings()">Save</button>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    document.getElementById('modal-hp-current').value = document.getElementById('hp').value;
    document.getElementById('modal-hp-max').value = document.getElementById('maxHp').value;
    document.getElementById('modal-hp-temp').value = document.getElementById('tempHp').value;
    
    modal.style.display = 'flex';
};

window.saveHpSettings = function() {
    const cur = parseInt(document.getElementById('modal-hp-current').value) || 0;
    const max = parseInt(document.getElementById('modal-hp-max').value) || 1;
    const temp = parseInt(document.getElementById('modal-hp-temp').value) || 0;
    
    document.getElementById('hp').value = cur;
    document.getElementById('maxHp').value = max;
    document.getElementById('tempHp').value = temp;
    
    window.updateHpBar();
    window.saveCharacter();
    document.getElementById('hpSettingsModal').style.display = 'none';
};

window.injectDDBHPBox = function() {
    const hpBar = document.querySelector('.hp-bar-container');
    const hpControls = document.querySelector('.hp-controls');
    
    // Find insertion point (replace existing HP bar)
    let target = hpBar || hpControls;
    if (!target) return; 
    
    const container = document.createElement('div');
    container.className = 'ddb-hp-box';
    container.innerHTML = `
        <div class="ddb-box-background">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 317 88.98" class="ddb-svg">
                <path fill="#FEFEFE" d="M9.35,8,7,10.29a38.78,38.78,0,0,1,.35,6.19l.85,57c0,4.29.29,6.67,3.67,9.37l3.76,2.46c2.56,2,19.53,1.87,9.58,1.87l271.48-.68c3.29,0,5.19-2.23,7.75-4.28l3-2.64c3.38-2.7,1.7-2.4,1.7-6.69L310,17.06c0-4.28-.76-8-4.13-10.71h0a18.9,18.9,0,0,0-10.39-3.64L19.59,2.48A36.38,36.38,0,0,0,9.35,8Z"></path>
                <path fill="#C53131" d="M305.89,0H11.1L0,9V79.93l11.1,9H305.89l11.11-9V9ZM294.34,86.5H22.6A24.06,24.06,0,0,1,8.69,78.78V10.24a24.36,24.36,0,0,1,14-7.76H294.4a24.09,24.09,0,0,1,13.91,7.72V78.73a24.36,24.36,0,0,1-14,7.77ZM3.05,21.16a27.77,27.77,0,0,1,4-8.79V76.63c-.37-.53-.76-1-1.09-1.62a27.78,27.78,0,0,1-2.89-7.1ZM310,12.34c.37.54.76,1.05,1.09,1.62A28,28,0,0,1,314,21.07V67.81a27.91,27.91,0,0,1-4,8.8Zm4-2.27v7a26.94,26.94,0,0,0-4-6.77v-.13h-.1a24.53,24.53,0,0,0-11.24-7.68h6ZM12.37,2.48h6A24.53,24.53,0,0,0,7.13,10.16H7v.13a26.94,26.94,0,0,0-4,6.77v-7ZM3.05,78.91v-7a26.81,26.81,0,0,0,4,6.78v.13h.1A24.61,24.61,0,0,0,18.37,86.5h-6ZM304.63,86.5h-6a24.61,24.61,0,0,0,11.24-7.68h.1v-.13a26.81,26.81,0,0,0,4-6.78v7Z"></path>
            </svg>
        </div>
        <div class="ddb-content">
            <div style="position: relative; width: 100%; text-align: center;">
                <h1 class="ddb-label">Hit Points</h1>
                <button class="edit-hp-btn" style="position: absolute; right: 0; top: -5px; background: none; border: none; cursor: pointer; font-size: 1rem; color: #999; padding: 0;" title="Edit Max HP">⚙️</button>
            </div>
            <div class="ddb-controls">
                <button class="ddb-btn heal-btn">Heal</button>
                <input class="ddb-input" type="number" placeholder="Amount" id="hp-adjust-input">
                <button class="ddb-btn damage-btn">Damage</button>
            </div>
            <div class="ddb-stats">
                <div class="ddb-stat-item">
                    <label>Current</label>
                    <input type="number" id="ddb-hp" class="ddb-current-val" value="0">
                </div>
                <div class="ddb-separator">/</div>
                <div class="ddb-stat-item">
                    <label>Max</label>
                    <input type="number" id="ddb-maxHp" class="ddb-small-val" value="0">
                </div>
                <div class="ddb-stat-item" style="margin-left:10px;">
                    <label>Temp</label>
                    <input type="number" id="ddb-tempHp" class="ddb-small-val" value="0" style="color:#2d6a4f;">
                </div>
            </div>
        </div>
    `;
    
    target.parentNode.insertBefore(container, target);
    
    container.querySelector('.edit-hp-btn').onclick = window.openHpSettingsModal;

    // Re-attach listeners
    const hpInput = document.getElementById('hp');
    const maxHpInput = document.getElementById('maxHp');
    const tempHpInput = document.getElementById('tempHp');
    const adjustInput = document.getElementById('hp-adjust-input');

    // Sync DDB inputs to main inputs
    const ddbHp = document.getElementById("ddb-hp");
    const ddbMax = document.getElementById("ddb-maxHp");
    const ddbTemp = document.getElementById("ddb-tempHp");

    const syncToMain = () => {
        if (ddbHp) hpInput.value = ddbHp.value;
        if (ddbMax) maxHpInput.value = ddbMax.value;
        if (ddbTemp) tempHpInput.value = ddbTemp.value;
        window.updateHpBar();
        window.saveCharacter();
    };

    if (ddbHp) ddbHp.addEventListener('input', syncToMain);
    if (ddbMax) ddbMax.addEventListener('input', syncToMain);
    if (ddbTemp) ddbTemp.addEventListener('input', syncToMain);
    
    [hpInput, maxHpInput, tempHpInput].forEach(el => {
        el.addEventListener('input', window.saveCharacter);
        el.addEventListener('change', window.saveCharacter);
    });

    container.querySelector('.heal-btn').onclick = () => {
        const amt = parseInt(adjustInput.value) || 0;
        if (amt <= 0) return;
        let cur = parseInt(hpInput.value) || 0;
        let max = parseInt(maxHpInput.value) || 0;
        cur = Math.min(cur + amt, max);
        hpInput.value = cur;
        adjustInput.value = '';
        window.saveCharacter();
    };

    container.querySelector('.damage-btn').onclick = () => {
        const amt = parseInt(adjustInput.value) || 0;
        if (amt <= 0) return;
        let cur = parseInt(hpInput.value) || 0;
        let temp = parseInt(tempHpInput.value) || 0;
        
        let damage = amt;
        if (temp > 0) {
            const absorbed = Math.min(temp, damage);
            temp -= absorbed;
            damage -= absorbed;
            tempHpInput.value = temp;
        }
        cur = Math.max(cur - damage, 0);
        hpInput.value = cur;
        adjustInput.value = '';
        window.saveCharacter();
    };
    
    adjustInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') container.querySelector('.damage-btn').click();
    });
};

/* =========================================
      6. INITIALIZATION
      ========================================= */
document.addEventListener("DOMContentLoaded", () => {
  // Initialize UI components (Sidebar, QuickNav)
  if (window.createSidebarMenu) window.createSidebarMenu();
  if (window.initQuickNav) window.initQuickNav();
  
  // Inject DDB HP Box
  if (window.injectDDBHPBox) window.injectDDBHPBox();

  // Guard clause: Only run initialization if we are on the character sheet (checking for charName input)
  if (!document.getElementById("charName")) return;

  // Inject Character ID hidden input if missing
  if (!document.getElementById("charID")) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.id = "charID";
    document.body.appendChild(input);
  }

  // Force profBonus to text to allow custom strings like "+3" or "Level 5"
  const pbInput = document.getElementById("profBonus");
  if (pbInput) {
      pbInput.type = "text";
      pbInput.style.textAlign = "center";
      pbInput.style.fontSize = "1.3rem";
      pbInput.style.fontWeight = "600";
  }

  window.isInitializing = true;

    // Load Dense Mode Preference
    if (localStorage.getItem("denseMode") === "true") {
      document.body.classList.add("dense-mode");
    }

  try {
    // Check for data immediately
    checkDataUploadStatus();

    // Re-check when tab becomes visible (e.g. returning from Data Viewer)
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") checkDataUploadStatus();
    });

    // XP Modal
    const expModal = document.getElementById("expModal");
    document.getElementById("addExpBtn").onclick = () => {
      document.getElementById("expTotalInput").value = "";
      document.getElementById("expPartySize").value = "1";
      expModal.style.display = "flex";
    };
    document.getElementById("cancelExp").onclick = () =>
      (expModal.style.display = "none");
    document.getElementById("confirmExp").onclick = function () {
      const totalXp =
        parseInt(document.getElementById("expTotalInput").value) || 0;
      const partySize =
        parseInt(document.getElementById("expPartySize").value) || 1;
      if (partySize < 1) return;
      const toAdd = Math.floor(totalXp / partySize);

      let currentXp =
        parseInt(document.getElementById("experience").value) || 0;
      let currentLevel = parseInt(document.getElementById("level").value) || 1;
      const oldLevel = currentLevel;

      currentXp += toAdd;
      
      let checkedLevel = true;
      while (checkedLevel) {
        let nextLevelEntry = xpTable.find((x) => x.lvl === currentLevel + 1);
        let currentLevelEntry = xpTable.find((x) => x.lvl === currentLevel);
        
        if (!nextLevelEntry || !currentLevelEntry) {
          checkedLevel = false;
          break;
        }
        
        let xpNeeded = nextLevelEntry.xp - currentLevelEntry.xp;
        
        if (currentXp >= xpNeeded) {
          currentXp -= xpNeeded;
          currentLevel++;
          let newProf = xpTable.find((x) => x.lvl === currentLevel)?.prof;
          if (newProf) document.getElementById("profBonus").value = newProf;
        } else {
          checkedLevel = false;
        }
      }

      document.getElementById("experience").value = currentXp;
      document.getElementById("level").value = currentLevel;

      expModal.style.display = "none";
      updateModifiers();
      saveCharacter();

      if (currentLevel > oldLevel) {
        if (window.showLevelUpToast) window.showLevelUpToast(currentLevel);
        localStorage.setItem('pendingLevelUp', 'true');
        localStorage.setItem('previousLevel', oldLevel);
      }
    };

    // Drag Listeners
    [
      "inventoryList",
      "equippedList",
      "weapon-list",
      "cantripList",
      "spellList",
      "preparedSpellsList",
    ].forEach((id) => {
      const container = document.getElementById(id);
      if (!container) return;
      container.addEventListener("dragover", (e) => {
        e.preventDefault();
        const afterElement = getDragAfterElement(container, e.clientY);
        const draggable = document.querySelector(".dragging");
        if (draggable) {
          if (afterElement == null) {
            container.appendChild(draggable);
          } else {
            container.insertBefore(draggable, afterElement);
          }
        }
      });
    });

    // Global Auto-save
    document.querySelectorAll("input, textarea, select").forEach((el) => {
      el.addEventListener("input", saveCharacter);
      el.addEventListener("change", saveCharacter);
    });
    abilities.forEach((a) =>
      document.getElementById(a).addEventListener("input", updateModifiers),
    );
    document.getElementById("profBonus").addEventListener("input", () => {
      updateModifiers();
      updateSpellDC();
    });
    // Sync class inputs to array on manual edit (single class mode)
    document.getElementById("charClass").addEventListener("change", (e) => { if(window.characterClasses.length <= 1) { window.characterClasses[0] = window.characterClasses[0] || {}; window.characterClasses[0].name = e.target.value; window.characterClasses[0].level = parseInt(document.getElementById('level').value)||1; } });
    document.getElementById("charSubclass").addEventListener("change", (e) => { if(window.characterClasses.length <= 1) { window.characterClasses[0] = window.characterClasses[0] || {}; window.characterClasses[0].subclass = e.target.value; } });

    document
      .getElementById("spellAbility")
      .addEventListener("change", updateSpellDC);
    document.getElementById("str").addEventListener("input", calculateWeight);
    ["hp", "maxHp", "tempHp"].forEach((id) =>
      document.getElementById(id).addEventListener("input", updateHpBar),
    );
    document.getElementById("hp").addEventListener("change", function() {
        const max = parseInt(document.getElementById("maxHp").value) || 1;
        let val = parseInt(this.value) || 0;
        if (val < 0) val = 0;
        if (val > max) val = max;
        this.value = val;
        updateHpBar();
        saveCharacter();
    });
    
    const hpControls = document.querySelector('.hp-controls');
    if (hpControls && !document.getElementById('hp-manage-btn')) {
        const btn = document.createElement('button');
        btn.id = 'hp-manage-btn';
        btn.className = 'hp-btn';
        btn.innerHTML = '⚡';
        btn.title = "Manage HP (Heal/Damage)";
        btn.onclick = window.openHpManagementModal;
        hpControls.appendChild(btn);
    }

    document
      .getElementById("charSize")
      ?.addEventListener("change", calculateWeight);
    document.getElementById("activeConditionsInput")?.addEventListener("input", window.renderConditionTags);

    // Load Data
    const saved = localStorage.getItem("dndCharacter");
    if (saved) {
      const data = JSON.parse(saved);
      if (data.currentTheme) {
        document.body.className = data.currentTheme;
        // Enforce dense mode preference over saved theme string
        if (localStorage.getItem("denseMode") === "true") {
          document.body.classList.add("dense-mode");
        } else {
          document.body.classList.remove("dense-mode");
        }
      }
      Object.keys(data).forEach((key) => {
        const el = document.getElementById(key);
        if (
          el &&
          !key.includes("Features") &&
          ![
            "weapons",
            "inventory",
            "attunement",
            "skillProficiency",
            "saveProficiency",
            "deathSaves",
          ].includes(key)
        ) {
          if (el.type === "checkbox") el.checked = data[key];
          else el.value = data[key];
        }
      });
      if (data.skillProficiency) {
        Object.assign(skillProficiency, data.skillProficiency);
        Object.keys(skillProficiency).forEach((k) => {
          if (skillProficiency[k])
            document
              .getElementById(`skillCheck_${k}`)
              ?.classList.add("checked");
        });
      }
      if (data.saveProficiency) {
        Object.assign(saveProficiency, data.saveProficiency);
        Object.keys(saveProficiency).forEach((k) => {
          if (saveProficiency[k])
            document.getElementById(`saveCheck_${k}`)?.classList.add("checked");
        });
      }
      if (data.deathSaves) {
        Object.assign(deathSaves, data.deathSaves);
        deathSaves.successes.forEach((v, i) =>
          document
            .getElementById(`deathSuccess${i}`)
            ?.classList.toggle("checked", v),
        );
        deathSaves.failures.forEach((v, i) =>
          document
            .getElementById(`deathFailure${i}`)
            ?.classList.toggle("checked", v),
        );
      }
      if (data.advantageState) {
        Object.assign(advantageState, data.advantageState);
      }
      if (data.activeConditions) {
        document.getElementById("activeConditionsInput").value =
          data.activeConditions;
        renderConditionTags();
      }
      
      // Load Classes
      if (data.classes && Array.isArray(data.classes) && data.classes.length > 0) {
          window.characterClasses = data.classes;
      } else {
          window.characterClasses = [{ name: data.charClass || "", subclass: data.charSubclass || "", level: parseInt(data.level) || 1 }];
      }
      window.injectClassManagerButton();
      window.updateClassDisplay();

      (data.classFeatures || []).forEach((f) =>
        addFeatureItem("classFeaturesContainer", f.title, f.desc),
      );
      (data.raceFeatures || []).forEach((f) =>
        addFeatureItem("raceFeaturesContainer", f.title, f.desc),
      );
      (data.backgroundFeatures || []).forEach((f) =>
        addFeatureItem("backgroundFeaturesContainer", f.title, f.desc),
      );
      (data.feats || []).forEach((f) =>
        addFeatureItem("featsContainer", f.title, f.desc),
      );
      (data.actions || []).forEach((f) =>
        addFeatureItem("actionsContainer", f.title, f.desc),
      );
      (data.bonusActions || []).forEach((f) =>
        addFeatureItem("bonusActionsContainer", f.title, f.desc),
      );
      (data.reactions || []).forEach((f) =>
        addFeatureItem("reactionsContainer", f.title, f.desc),
      );
      if (data.charSize)
        document.getElementById("charSize").value = data.charSize;
      if (data.sizeFt) document.getElementById("sizeFt").value = data.sizeFt;

      const weaponList = document.getElementById("weapon-list");
      weaponList.innerHTML = "";
      if (data.weapons && data.weapons.length > 0) {
        data.weapons.forEach((w) => {
          try {
            addWeapon(w);
          } catch (e) {
            console.error("Error adding weapon:", w, e);
          }
        });
      }

      document.getElementById("inventoryList").innerHTML = "";
      document.getElementById("equippedList").innerHTML = "";
      (data.inventory || []).forEach((item) => {
        try {
          addInventoryItem(
            item.name,
            item.qty,
            item.weight,
            item.equipped,
            item.description,
          );
        } catch (e) {
          console.error("Error adding item:", item, e);
        }
      });

      if (data.spellSlotsData) spellSlotsData = data.spellSlotsData;
      if (data.resourcesData) resourcesData = data.resourcesData;
      
      document.getElementById("cantripList").innerHTML = "";
      (data.cantripsList || []).forEach((s) => {
        try {
          addSpellRow("cantripList", 0, s);
        } catch (e) {
          console.error("Error adding cantrip:", s, e);
        }
      });
      document.getElementById("preparedSpellsList").innerHTML = "";
      (data.preparedSpellsList || []).forEach((s) => {
        try {
          s.prepared = true;
          addSpellRow("preparedSpellsList", 1, s);
        } catch (e) {
          console.error("Error adding prepared spell:", s, e);
        }
      });
      document.getElementById("spellList").innerHTML = "";
      (data.spellsList || []).forEach((s) => {
        try {
          s.prepared = false;
          addSpellRow("spellList", 1, s);
        } catch (e) {
          console.error("Error adding spell:", s, e);
        }
      });

      if (data.attunement) {
        data.attunement.forEach(
          (v, i) => (document.getElementById(`attune${i + 1}`).value = v || ""),
        );
      }
      if (data.shield) document.getElementById("shieldEquipped").checked = true;
      if (data.activeTab) window.switchTab(data.activeTab);
    } else {
      document.querySelectorAll("input, textarea, select").forEach((el) => {
        if (el.type === "checkbox" || el.type === "radio") el.checked = false;
        else el.value = "";
      });
      addFeatureItem("classFeaturesContainer");
      addFeatureItem("raceFeaturesContainer");
      addFeatureItem("backgroundFeaturesContainer");
      addFeatureItem("featsContainer");
      addFeatureItem("actionsContainer");
      addFeatureItem("bonusActionsContainer");
      addFeatureItem("reactionsContainer");
      
      window.characterClasses = [{ name: "", subclass: "", level: 1 }];
      window.injectClassManagerButton();
      window.updateClassDisplay();
    }

    updateModifiers();
    renderSpellSlots();
    renderResources();
    updateHpBar();
    calculateWeight();
    renderWeaponTags();
    injectAdvantageToggles();
    updateAdvantageVisuals();
    resizeAllTextareas();

    // Check for pending level up
    if (localStorage.getItem('pendingLevelUp') === 'true') {
        const lvl = parseInt(document.getElementById('level').value) || 1;
        if (window.showLevelUpButton) window.showLevelUpButton(lvl);
    }

    // Modal Scroll Lock Logic
    const modalSelectors = [
        '.info-modal-overlay',
        '.note-modal-overlay',
        '#itemSearchModal',
        '#spellSearchModal',
        '#conditionModal',
        '#weaponProfModal',
        '#weaponPickerModal',
        '#masteryModal',
        '#infoModal',
        '#currencyModal',
        '#splitMoneyModal',
        '#manageMoneyModal',
        '#xpTableModal',
        '#scoreModal',
        '#alignModal',
        '#themeModal',
        '#lastSavedModal',
        '#expModal',
        '#languageSearchModal',
        '#hpManageModal',
        '#hpSettingsModal'
    ];

    const checkModals = () => {
        let isOpen = false;
        modalSelectors.forEach(selector => {
            document.querySelectorAll(selector).forEach(el => {
                const style = window.getComputedStyle(el);
                if (style.display !== 'none' && style.visibility !== 'hidden') {
                    isOpen = true;
                }
            });
        });
        if (isOpen) document.body.classList.add('modal-open');
        else document.body.classList.remove('modal-open');
    };

    const modalObserver = new MutationObserver(checkModals);
    modalSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(el => {
            modalObserver.observe(el, { attributes: true, attributeFilter: ['style', 'class'] });
        });
    });

    const bodyObserver = new MutationObserver((mutations) => {
        mutations.forEach(m => {
            if (m.addedNodes.length) {
                m.addedNodes.forEach(node => {
                    if (node.nodeType === 1 && node.matches && (node.matches('.info-modal-overlay') || node.matches('.note-modal-overlay'))) {
                        modalObserver.observe(node, { attributes: true, attributeFilter: ['style', 'class'] });
                    }
                });
                checkModals();
            }
            if (m.removedNodes.length) checkModals();
        });
    });
    bodyObserver.observe(document.body, { childList: true });
  } catch (e) {
    console.error("Initialization error:", e);
  } finally {
    // Enable Dense Layout if needed (after data load so header has correct values)
    if (document.body.classList.contains("dense-mode")) {
        window.enableDenseLayout();
    }

    // Delay unlocking to allow any pending DOM events to fire without triggering a save
    setTimeout(() => {
      window.isInitializing = false;
    }, 200);
  }
});

/* =========================================
      17. LEVEL UP FEATURES
      ========================================= */
window.showLevelUpToast = function(level) {
    if (!window.isDataAvailable) return;

    let toast = document.getElementById('level-up-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'level-up-toast';
        toast.className = 'toast-notification';
        // Override default bottom positioning to top
        toast.style.bottom = 'auto';
        toast.style.top = '20px';
        document.body.appendChild(toast);
    }
    
    toast.innerHTML = `
        <span><strong>Level Up!</strong> You are now level ${level}.</span>
        <button class="toast-close" onclick="this.parentElement.classList.remove('show')">&times;</button>
    `;
    
    toast.classList.remove('show');
    void toast.offsetWidth; // Trigger reflow
    toast.classList.add('show');

    // Show the arrow button in the level box
    if (window.showLevelUpButton) window.showLevelUpButton(level);
};

window.showLevelUpButton = function(level) {
    if (!window.isDataAvailable) return;

    const levelInput = document.getElementById('level');
    if (!levelInput) return;
    
    let btn = document.getElementById('level-up-arrow-btn');
    if (!btn) {
        btn = document.createElement('button');
        btn.id = 'level-up-arrow-btn';
        btn.innerHTML = '▲'; 
        btn.title = "View Level Up Features";
        
        // Style the button to sit inside the input field
        btn.style.position = 'absolute';
        btn.style.right = '5px'; 
        btn.style.top = '50%';
        btn.style.transform = 'translateY(-50%)';
        
        btn.style.background = 'var(--red)';
        btn.style.color = 'white';
        btn.style.border = '1px solid var(--gold)';
        btn.style.borderRadius = '50%';
        btn.style.width = '24px';
        btn.style.height = '24px';
        btn.style.cursor = 'pointer';
        btn.style.fontSize = '12px';
        btn.style.display = 'flex';
        btn.style.alignItems = 'center';
        btn.style.justifyContent = 'center';
        btn.style.zIndex = '10';
        btn.style.boxShadow = '0 2px 4px rgba(0,0,0,0.2)';
        
        if (levelInput.parentElement) {
            levelInput.parentElement.style.position = 'relative'; // Ensure positioning context
            levelInput.parentElement.appendChild(btn);
        }
    }
    
    btn.onclick = (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.openLevelUpModal(level);
    };
    
    btn.style.display = 'flex';
};

window.openLevelUpModal = async function(level) {
    window.pendingLevelUpChanges = { spells: new Set(), choices: new Map() };

    if (!window.isDataAvailable) return;
    let modal = document.getElementById('levelUpModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'levelUpModal';
        modal.className = 'info-modal-overlay';
        modal.innerHTML = `
            <div class="info-modal-content" style="max-width: 600px; max-height: 80vh; display: flex; flex-direction: column;">
                <button class="close-modal-btn" onclick="document.getElementById('levelUpModal').style.display='none'">&times;</button>
                <h3 class="info-modal-title" style="text-align: center">Level ${level} Features</h3>
                <div id="levelUpContent" style="overflow-y: auto; flex: 1; padding: 10px;">Loading...</div>
                <div style="margin-top: 15px; text-align: center; border-top: 1px solid var(--gold); padding-top: 10px;">
                    <button id="confirmLevelUpBtn" class="btn" style="width: 100%;">Confirm Level Up</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        document.getElementById('confirmLevelUpBtn').addEventListener('click', () => {
            localStorage.removeItem('pendingLevelUp');
            localStorage.removeItem('previousLevel');
            const btn = document.getElementById('level-up-arrow-btn');
            if (btn) btn.remove();
            document.getElementById('levelUpModal').style.display = 'none';
        });
    } else {
        modal.querySelector('.info-modal-title').textContent = `Level ${level} Features`;
        document.getElementById('levelUpContent').innerHTML = 'Loading...';
    }

    // Reset Confirm Button Listener
    const oldBtn = document.getElementById('confirmLevelUpBtn');
    const newBtn = oldBtn.cloneNode(true);
    oldBtn.parentNode.replaceChild(newBtn, oldBtn);
    
    newBtn.addEventListener('click', async () => {
        // Show Loading
        const loadingOverlay = document.createElement('div');
        loadingOverlay.className = 'info-modal-overlay';
        loadingOverlay.style.display = 'flex';
        loadingOverlay.style.zIndex = '3000';
        loadingOverlay.innerHTML = `
            <div class="info-modal-content" style="max-width: 300px; text-align: center; padding: 20px;">
                <h3 style="margin-top:0;">Processing Level Up...</h3>
                <div style="margin: 20px 0;">Please wait while features and spells are added.</div>
                <div style="border: 4px solid #f3f3f3; border-top: 4px solid var(--red); border-radius: 50%; width: 30px; height: 30px; animation: spin 1s linear infinite; margin: 0 auto;"></div>
            </div>
        `;
        document.body.appendChild(loadingOverlay);

        try {
        if (window.pendingLevelUpChanges) {
            // Apply Subclass Change
            if (window.pendingLevelUpChanges.subclass) {
                const idx = window.pendingLevelUpChanges.classIndex !== undefined ? window.pendingLevelUpChanges.classIndex : 0;
                if (window.characterClasses[idx]) {
                    window.characterClasses[idx].subclass = window.pendingLevelUpChanges.subclass;
                }
                if (idx === 0) {
                    const scInput = document.getElementById('charSubclass');
                    if (scInput) scInput.value = window.pendingLevelUpChanges.subclass;
                }
            }

            if (window.pendingLevelUpChanges.features) {
                window.pendingLevelUpChanges.features.forEach(f => {
                    let desc = window.processEntries(f.entries || f.entry);
                    desc = window.cleanText(desc);
                    window.addFeatureItem("classFeaturesContainer", f.name, desc);
                });
            }

            for (const spellName of window.pendingLevelUpChanges.spells) {
                await window.addSpellFromFeature(spellName, true);
            }
            for (const [key, choice] of window.pendingLevelUpChanges.choices) {
                window.addFeatureItem("featsContainer", choice.name, choice.desc);
            }
            if (window.pendingLevelUpChanges.customSpells) {
                window.pendingLevelUpChanges.customSpells.forEach(item => {
                    window.addSpellRow(item.target, item.spellData.level, item.spellData);
                });
            }
            
            // Apply Spell Slot Updates
            if (window.pendingLevelUpChanges.warlockUpdate) {
                const update = window.pendingLevelUpChanges.warlockUpdate;
                if (spellSlotsData.length > 0) {
                    // Update the first slot entry (assuming Warlock primary or Pact Magic slot)
                    spellSlotsData[0].level = update.level;
                    spellSlotsData[0].total = update.count;
                    if (spellSlotsData[0].used > update.count) spellSlotsData[0].used = update.count;
                } else {
                    spellSlotsData.push({ level: update.level, total: update.count, used: 0 });
                }
                renderSpellSlots();
            }
            if (window.pendingLevelUpChanges.newSlotLevel) {
                const lvl = window.pendingLevelUpChanges.newSlotLevel;
                if (!spellSlotsData.some(s => s.level === lvl)) {
                    spellSlotsData.push({ level: lvl, total: 1, used: 0 });
                    renderSpellSlots();
                }
            }
        }
        localStorage.removeItem('pendingLevelUp');
        localStorage.removeItem('previousLevel');
        const btn = document.getElementById('level-up-arrow-btn');
        if (btn) btn.remove();
        document.getElementById('levelUpModal').style.display = 'none';
        
        window.updateClassDisplay();
        window.saveCharacter();
        
        loadingOverlay.remove();
        alert("Level up confirmed! Features and spells have been added.");
        } catch (e) {
            console.error(e);
            loadingOverlay.remove();
            alert("Error processing level up: " + e.message);
        }
    });
    
    modal.style.display = 'flex';
    
    // Check for Multiclass / Level Assignment
    const currentAssignedLevel = window.characterClasses.reduce((sum, c) => sum + c.level, 0);
    const targetLevel = parseInt(level);
    
    if (targetLevel > currentAssignedLevel) {
        const remainingLevels = targetLevel - currentAssignedLevel;
        // We need to assign a level
        const content = document.getElementById('levelUpContent');
        content.innerHTML = `<div style="text-align:center; margin-bottom:15px;">You reached Level ${targetLevel}. Assign ${remainingLevels} level(s):</div>`;
        
        // Existing Classes
        window.characterClasses.forEach((c, idx) => {
            if (!c.name) return;
            const btn = document.createElement('button');
            btn.className = 'btn btn-secondary';
            btn.style.width = '100%';
            btn.style.marginBottom = '10px';
            btn.style.justifyContent = 'space-between';
            const newLevel = c.level + remainingLevels;
            btn.innerHTML = `<span>${c.name}</span> <span>Lvl ${c.level} ➝ ${newLevel}</span>`;
            btn.onclick = () => {
                // Apply level up
                const oldLevel = c.level;
                window.characterClasses[idx].level = newLevel;
                window.updateClassDisplay();
                window.saveCharacter();
                // Show features for the new level
                window.renderLevelUpFeatures(c.name, c.subclass, newLevel, true, idx, oldLevel + 1, remainingLevels);
            };
            content.appendChild(btn);
        });
        
        // New Class
        const newBtn = document.createElement('button');
        newBtn.className = 'btn';
        newBtn.style.width = '100%';
        newBtn.innerHTML = '+ Add New Class';
        newBtn.onclick = () => {
            window.openClassPickerModal((name) => {
                if (name) {
                    window.characterClasses.push({ name: name, subclass: "", level: 1 });
                    window.updateClassDisplay();
                    window.saveCharacter();
                    window.renderLevelUpFeatures(name, "", 1, true, window.characterClasses.length - 1);
                }
            });
        };
        content.appendChild(newBtn);
        
        return;
    }

    // If multiple classes exist and levels match (review mode), show selection
    if (window.characterClasses.length > 1) {
        const content = document.getElementById('levelUpContent');
        content.innerHTML = `<div style="text-align:center; margin-bottom:15px;">Select class to view features:</div>`;
        
        window.characterClasses.forEach((c, idx) => {
            const btn = document.createElement('button');
            btn.className = 'btn btn-secondary';
            btn.style.width = '100%';
            btn.style.marginBottom = '10px';
            btn.innerHTML = `<span>${c.name} (Lvl ${c.level})</span>`;
            btn.onclick = () => {
                window.renderLevelUpFeatures(c.name, c.subclass, c.level, true, idx, null, 0);
            };
            content.appendChild(btn);
        });
        return;
    }

    // If levels match, just show features for the primary or last class
    // For simplicity, show the first class or allow selection if multiple
    const c = window.characterClasses[0];
    if (c) {
        let minLevel = c.level;
        if (localStorage.getItem('pendingLevelUp') === 'true' && window.characterClasses.length === 1) {
            const prev = parseInt(localStorage.getItem('previousLevel'));
            if (!isNaN(prev) && prev < c.level) {
                minLevel = prev + 1;
            }
        }
        window.renderLevelUpFeatures(c.name, c.subclass, c.level, false, -1, minLevel);
    }
};

window.getSpellsFromFeature = function(feature, charLevel) {
    const spells = new Set();
    
    const extractFromText = (text) => {
        const regex = /{@spell ([^}|]+)/g;
        let match;
        while ((match = regex.exec(text)) !== null) {
            spells.add(match[1]);
        }
    };

    const traverse = (entry) => {
        if (!entry) return;
        if (typeof entry === 'string') {
            extractFromText(entry);
            return;
        }
        if (Array.isArray(entry)) {
            entry.forEach(traverse);
            return;
        }
        
        if (entry.type === 'table') {
            let levelColIndex = -1;
            if (entry.colLabels) {
                levelColIndex = entry.colLabels.findIndex(l => /level/i.test(l));
            }
            
            if (levelColIndex !== -1 && entry.rows) {
                entry.rows.forEach(row => {
                    let levelCell = row[levelColIndex];
                    if (typeof levelCell === 'object' && levelCell.value) levelCell = levelCell.value;
                    
                    const levelStr = String(levelCell).replace(/[^0-9]/g, '');
                    const reqLevel = parseInt(levelStr);
                    
                    if (!isNaN(reqLevel)) {
                        if (reqLevel <= charLevel) {
                            row.forEach(cell => {
                                if (typeof cell === 'string') extractFromText(cell);
                                else if (typeof cell === 'object') traverse(cell);
                            });
                        }
                    } else {
                        row.forEach(cell => {
                             if (typeof cell === 'string') extractFromText(cell);
                             else if (typeof cell === 'object') traverse(cell);
                        });
                    }
                });
            } else {
                if (entry.rows) {
                    entry.rows.forEach(row => {
                        row.forEach(cell => {
                             if (typeof cell === 'string') extractFromText(cell);
                             else if (typeof cell === 'object') traverse(cell);
                        });
                    });
                }
            }
            return;
        }

        if (entry.entries) traverse(entry.entries);
        if (entry.items) traverse(entry.items);
        if (entry.entry) traverse(entry.entry);
    };

    traverse(feature.entries || feature.entry);
    return spells;
};

window.renderLevelUpFeatures = async function(charClass, charSubclass, level, showBackBtn = false, classIndex = -1, minLevel = null, levelsAdded = 1) {
    const list = document.getElementById('levelUpContent');
    
    const modalTitle = document.querySelector('#levelUpModal .info-modal-title');
    if (modalTitle) {
        let helpBtnHtml = '';
        if (window.isDataAvailable) {
            helpBtnHtml = `<button class="skill-info-btn" style="margin-left:10px; vertical-align: middle;" onclick="window.renderClassTableFor('${charClass.replace(/'/g, "\\'")}')" title="View Class Table">?</button>`;
        }
        modalTitle.innerHTML = `Level ${level} Features ${helpBtnHtml}`;
    }

    if (showBackBtn) {
        list.innerHTML = '';
        const backBtn = document.createElement('button');
        backBtn.className = 'btn btn-secondary';
        backBtn.style.marginBottom = '10px';
        backBtn.style.padding = '4px 10px';
        backBtn.style.fontSize = '0.9rem';
        backBtn.innerHTML = '← Back';
        backBtn.onclick = () => {
            if (classIndex >= 0 && window.characterClasses[classIndex]) {
                if (levelsAdded > 0) {
                    window.characterClasses[classIndex].level -= levelsAdded;
                    if (window.characterClasses[classIndex].level <= 0) {
                        window.characterClasses.splice(classIndex, 1);
                    }
                    window.updateClassDisplay();
                    window.saveCharacter();
                }
                const totalLevel = parseInt(document.getElementById('level').value) || 1;
                window.openLevelUpModal(totalLevel);
            }
        };
        list.appendChild(backBtn);
        const loading = document.createElement('div');
        loading.id = 'lvl-loading';
        loading.style.textAlign = 'center';
        loading.textContent = 'Loading features...';
        list.appendChild(loading);
    } else {
        list.innerHTML = '<div style="text-align:center;">Loading features...</div>';
    }

    if (window.pendingLevelUpChanges) {
        // Clear auto-detected items to prevent stale data from previous renders
        window.pendingLevelUpChanges.spells.clear();
        window.pendingLevelUpChanges.choices.clear();
        window.pendingLevelUpChanges.features = [];
    }

    try {
        const features = await fetchLevelUpFeatures(charClass, charSubclass, level, minLevel || level);
        
        if (window.pendingLevelUpChanges) {
            window.pendingLevelUpChanges.features = features;
        }
        
        if (showBackBtn) {
            const loading = document.getElementById('lvl-loading');
            if (loading) loading.remove();
        } else {
            list.innerHTML = '';
        }
        
        if (features.length === 0) {
            const msg = document.createElement('div');
            msg.style.textAlign = 'center';
            msg.style.color = 'var(--ink-light)';
            msg.textContent = 'No features found for this level.';
            list.appendChild(msg);
            return;
        }

        // Subclass Selection (Level 3+)
        let committedSubclass = "";
        if (classIndex >= 0 && window.characterClasses[classIndex]) {
            committedSubclass = window.characterClasses[classIndex].subclass;
        } else if (window.characterClasses.length > 0) {
             committedSubclass = window.characterClasses[0].subclass;
        }

        if (level >= 3 && !committedSubclass) {
            const subDiv = document.createElement('div');
            subDiv.style.marginBottom = '15px';
            subDiv.style.padding = '10px';
            subDiv.style.border = '2px dashed var(--gold)';
            subDiv.style.background = 'var(--parchment)';
            subDiv.innerHTML = `<div style="font-weight:bold; color:var(--red-dark); margin-bottom:5px;">Select Subclass</div>`;
            
            const select = document.createElement('select');
            select.className = 'styled-select';
            select.style.width = '100%';
            select.innerHTML = '<option value="">-- Choose --</option>';
            
            const db = await openDB();
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const data = await new Promise((resolve) => {
                const req = store.get('currentData');
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => resolve(null);
            });
            
            if (data) {
                const subclasses = [];
                data.forEach(file => {
                    if (!file.name.toLowerCase().endsWith('.json')) return;
                    try {
                        const json = JSON.parse(file.content);
                        if (json.subclass) {
                            json.subclass.forEach(sc => {
                                if (sc.className === charClass) subclasses.push(sc);
                            });
                        }
                    } catch (e) {}
                });
                
                const unique = new Map();
                subclasses.forEach(sc => {
                    if (!unique.has(sc.name)) unique.set(sc.name, sc);
                    else {
                        const existing = unique.get(sc.name);
                        if (sc.source === 'XPHB') unique.set(sc.name, sc);
                        else if (sc.source === 'PHB' && existing.source !== 'XPHB') unique.set(sc.name, sc);
                    }
                });
                
                Array.from(unique.values()).sort((a,b) => a.name.localeCompare(b.name)).forEach(sc => {
                    const opt = document.createElement('option');
                    opt.value = sc.name;
                    opt.textContent = sc.name + (sc.source ? ` [${sc.source}]` : "");
                    select.appendChild(opt);
                });
            }
            
            select.value = charSubclass || "";

            select.onchange = () => {
                if (select.value) {
                    if (window.pendingLevelUpChanges) {
                        window.pendingLevelUpChanges.subclass = select.value;
                        window.pendingLevelUpChanges.classIndex = classIndex;
                    }
                    window.renderLevelUpFeatures(charClass, select.value, level, showBackBtn, classIndex, minLevel, levelsAdded);
                }
            };
            
            subDiv.appendChild(select);
            list.appendChild(subDiv);
        }

        // Check for Spellcasting to show "Add Spells" button
        const fullCasters = ["Bard", "Cleric", "Druid", "Sorcerer", "Wizard"];
        const halfCasters = ["Paladin", "Ranger", "Artificer"];
        let isCaster = fullCasters.includes(charClass) || halfCasters.includes(charClass) || charClass === "Warlock";
        
        if (!isCaster && charSubclass) {
            if (charClass === "Fighter" && charSubclass.includes("Eldritch Knight")) isCaster = true;
            if (charClass === "Rogue" && charSubclass.includes("Arcane Trickster")) isCaster = true;
        }
        if (!isCaster && features.some(f => f.name.includes("Spellcasting") || f.name.includes("Pact Magic"))) isCaster = true;

        if (isCaster) {
            // Calculate max spell level
            let maxLevel = 0;
            
            if (fullCasters.includes(charClass)) {
                maxLevel = Math.ceil(level / 2);
            } else if (charClass === "Warlock") {
                if (level >= 9) maxLevel = 5;
                else if (level >= 7) maxLevel = 4;
                else if (level >= 5) maxLevel = 3;
                else if (level >= 3) maxLevel = 2;
                else maxLevel = 1;
            } else if (halfCasters.includes(charClass)) {
                if (charClass === "Artificer") maxLevel = Math.ceil(level / 2);
                else {
                    if (level >= 17) maxLevel = 5;
                    else if (level >= 13) maxLevel = 4;
                    else if (level >= 9) maxLevel = 3;
                    else if (level >= 5) maxLevel = 2;
                    else if (level >= 1) maxLevel = 1;
                }
            } else if (["Fighter", "Rogue"].includes(charClass)) {
                if (level >= 19) maxLevel = 4;
                else if (level >= 13) maxLevel = 3;
                else if (level >= 7) maxLevel = 2;
                else if (level >= 3) maxLevel = 1;
            }

            let spellText = `+ Add Spells`;
            let spellHint = "";

            if (charClass === "Wizard") {
                spellText = `+ Add 2 Spells to Spellbook`;
                spellHint = "Wizards add 2 new spells to their spellbook.";
            } else if (["Bard", "Sorcerer", "Warlock", "Ranger"].includes(charClass) || (charClass === "Fighter" && charSubclass && charSubclass.includes("Eldritch Knight")) || (charClass === "Rogue" && charSubclass && charSubclass.includes("Arcane Trickster"))) {
                spellText = `+ Learn New Spell`;
                spellHint = "You typically learn 1 new spell per level.";
            } else if (["Cleric", "Druid", "Paladin", "Artificer"].includes(charClass)) {
                spellText = `+ Add Spells to Sheet`;
                spellHint = "You have access to your full list. Add spells to prepare them.";
            }

            const spellBtn = document.createElement('button');
            spellBtn.className = 'btn';
            spellBtn.style.width = '100%';
            spellBtn.style.marginBottom = '5px';
            spellBtn.innerHTML = `${spellText} <span style="font-size:0.8em; opacity:0.8;">(Max Lvl ${maxLevel})</span>`;
            
            let filterClass = charClass;
            if (charClass === "Fighter" && charSubclass && charSubclass.includes("Eldritch Knight")) filterClass = "Wizard";
            if (charClass === "Rogue" && charSubclass && charSubclass.includes("Arcane Trickster")) filterClass = "Wizard";

            const selectedSpellsDiv = document.createElement('div');
            selectedSpellsDiv.style.display = 'flex';
            selectedSpellsDiv.style.flexWrap = 'wrap';
            selectedSpellsDiv.style.gap = '5px';
            selectedSpellsDiv.style.marginBottom = '15px';

            const createRemovableTag = (spellData) => {
                const tag = document.createElement('span');
                tag.style.background = 'var(--parchment-dark)';
                tag.style.border = '1px solid var(--gold)';
                tag.style.padding = '2px 6px';
                tag.style.borderRadius = '4px';
                tag.style.fontSize = '0.8rem';
                tag.style.display = 'inline-flex';
                tag.style.alignItems = 'center';
                tag.style.gap = '4px';
                
                tag.innerHTML = `<strong>${spellData.name}</strong>`;
                
                const removeBtn = document.createElement('span');
                removeBtn.innerHTML = '&times;';
                removeBtn.style.cursor = 'pointer';
                removeBtn.style.color = 'var(--red)';
                removeBtn.style.fontWeight = 'bold';
                removeBtn.style.marginLeft = '2px';
                removeBtn.title = 'Remove spell';
                
                removeBtn.onclick = () => {
                    if (window.pendingLevelUpChanges && window.pendingLevelUpChanges.customSpells) {
                        const idx = window.pendingLevelUpChanges.customSpells.findIndex(s => s.spellData.name === spellData.name);
                        if (idx > -1) {
                            window.pendingLevelUpChanges.customSpells.splice(idx, 1);
                            tag.remove();
                        }
                    }
                };
                
                tag.appendChild(removeBtn);
                return tag;
            };

            if (window.pendingLevelUpChanges && window.pendingLevelUpChanges.customSpells) {
                window.pendingLevelUpChanges.customSpells.forEach(item => {
                    selectedSpellsDiv.appendChild(createRemovableTag(item.spellData));
                });
            }

            spellBtn.onclick = () => {
                window.openSpellSearch('spellList', 'all', maxLevel, filterClass, (spellData) => {
                    // Check if already selected in pending changes
                    if (window.pendingLevelUpChanges && window.pendingLevelUpChanges.customSpells) {
                        if (window.pendingLevelUpChanges.customSpells.some(s => s.spellData.name === spellData.name)) {
                            alert("You have already selected this spell.");
                            return;
                        }
                    }
                    // Check if already on sheet
                    const existing = Array.from(document.querySelectorAll('.spell-name')).some(i => i.value.toLowerCase() === spellData.name.toLowerCase());
                    if (existing) {
                        alert("You already have this spell.");
                        return;
                    }

                    const target = (spellData.level === 0) ? 'cantripList' : 'spellList';
                    
                    if (window.pendingLevelUpChanges) {
                        if (!window.pendingLevelUpChanges.customSpells) window.pendingLevelUpChanges.customSpells = [];
                        window.pendingLevelUpChanges.customSpells.push({ target, spellData });
                    } else {
                        window.addSpellRow(target, spellData.level, spellData);
                    }
                    
                    selectedSpellsDiv.appendChild(createRemovableTag(spellData));
                });
            };
            list.appendChild(spellBtn);

            // Fetch Class Table Data for Spell Info
            (async () => {
                try {
                    const db = await openDB();
                    const tx = db.transaction(STORE_NAME, 'readonly');
                    const store = tx.objectStore(STORE_NAME);
                    const data = await new Promise((resolve) => {
                        const req = store.get('currentData');
                        req.onsuccess = () => resolve(req.result);
                        req.onerror = () => resolve(null);
                    });

                    if (data) {
                        let classObj = null;
                        for (const file of data) {
                            if (!file.name.toLowerCase().endsWith('.json')) continue;
                            try {
                                const json = JSON.parse(file.content);
                                if (json.class) {
                                    const matches = json.class.filter(c => c.name.toLowerCase() === charClass.toLowerCase());
                                    for (const m of matches) {
                                        if (!classObj) classObj = m;
                                        else if (m.source === 'XPHB') classObj = m;
                                        else if (m.source === 'PHB' && classObj.source !== 'XPHB') classObj = m;
                                    }
                                }
                            } catch (e) {}
                        }

                        if (classObj && classObj.classTableGroups) {
                            const currentLevelIdx = level - 1;
                            const prevLevelIdx = level - 2;
                            
                            const getValue = (lvlIdx, regex) => {
                                if (lvlIdx < 0) return 0;
                                for (const group of classObj.classTableGroups) {
                                    if (!group.colLabels) continue;
                                    const colIndex = group.colLabels.findIndex(l => regex.test(l.replace(/{@\w+\s*([^}]+)?}/g, "$1")));
                                    if (colIndex !== -1 && group.rows && group.rows[lvlIdx]) {
                                        let val = group.rows[lvlIdx][colIndex];
                                        if (typeof val === 'object' && val.value !== undefined) val = val.value;
                                        return val;
                                    }
                                }
                                return 0;
                            };

                            let infoHtml = "";

                            // Spells Known
                            const spellsKnown = getValue(currentLevelIdx, /Spells\s*Known/i);
                            const prevSpellsKnown = getValue(prevLevelIdx, /Spells\s*Known/i);
                            if (spellsKnown && spellsKnown > prevSpellsKnown) {
                                infoHtml += `<div>You can learn <strong>${spellsKnown - prevSpellsKnown}</strong> new spell(s) (Total Known: ${spellsKnown}).</div>`;
                            }

                            // Spell Slots
                            if (charClass === "Warlock") {
                                const slotLevel = getValue(currentLevelIdx, /Slot Level/i);
                                const prevSlotLevel = getValue(prevLevelIdx, /Slot Level/i);
                                const slotCount = getValue(currentLevelIdx, /Spell Slots/i);
                                const parseLvl = (v) => parseInt(String(v).match(/\d+/)) || 0;
                                const currLvlNum = parseLvl(slotLevel);
                                const prevLvlNum = parseLvl(prevSlotLevel);
                                
                                if (currLvlNum > prevLvlNum) {
                                    infoHtml += `<div style="margin-top:4px; color:var(--red-dark);">Spell Slots upgrade to <strong>Level ${currLvlNum}</strong>.</div>`;
                                    if (window.pendingLevelUpChanges) window.pendingLevelUpChanges.warlockUpdate = { level: currLvlNum, count: parseInt(slotCount)||1 };
                                } else if (slotCount > getValue(prevLevelIdx, /Spell Slots/i)) {
                                    if (window.pendingLevelUpChanges) window.pendingLevelUpChanges.warlockUpdate = { level: currLvlNum, count: parseInt(slotCount)||1 };
                                }
                            } else {
                                for (let i = 1; i <= 9; i++) {
                                    const val = getValue(currentLevelIdx, new RegExp(`^${i}(?:st|nd|rd|th)(?:\\s*Level)?$`, 'i'));
                                    const prevVal = getValue(prevLevelIdx, new RegExp(`^${i}(?:st|nd|rd|th)(?:\\s*Level)?$`, 'i'));
                                    if (val > 0 && prevVal == 0) {
                                        infoHtml += `<div style="margin-top:4px; color:var(--red-dark);">You gain <strong>Level ${i} Spell Slots</strong>!</div>`;
                                        if (window.pendingLevelUpChanges) window.pendingLevelUpChanges.newSlotLevel = i;
                                        break;
                                    }
                                }
                            }

                            if (infoHtml) {
                                const infoDiv = document.createElement('div');
                                infoDiv.style.background = "var(--parchment-dark)";
                                infoDiv.style.padding = "8px";
                                infoDiv.style.borderRadius = "4px";
                                infoDiv.style.marginBottom = "10px";
                                infoDiv.style.fontSize = "0.9rem";
                                infoDiv.style.border = "1px solid var(--gold)";
                                infoDiv.innerHTML = infoHtml;
                                list.insertBefore(infoDiv, selectedSpellsDiv);
                            }
                        }
                    }
                } catch (e) { console.error(e); }
            })();

            if (spellHint) {
                const hintDiv = document.createElement('div');
                hintDiv.style.fontSize = '0.8rem';
                hintDiv.style.color = 'var(--ink-light)';
                hintDiv.style.fontStyle = 'italic';
                hintDiv.style.marginBottom = '15px';
                hintDiv.style.textAlign = 'center';
                hintDiv.textContent = spellHint;
                list.appendChild(hintDiv);
            }

            list.appendChild(selectedSpellsDiv);
        }
        
        for (const f of features) {
            const div = document.createElement('div');
            div.style.marginBottom = '15px';
            div.style.border = '1px solid var(--gold)';
            div.style.borderRadius = '4px';
            div.style.padding = '10px';
            div.style.background = 'white';
            
            let rawDesc = window.processEntries(f.entries || f.entry);
            let desc = window.cleanText(rawDesc);
            
            // Scan for interactive elements
            const spellsFound = window.getSpellsFromFeature(f, level);
            const featsFound = new Set();
            
            if (spellsFound.size > 0) {
                if (window.pendingLevelUpChanges) {
                    spellsFound.forEach(s => window.pendingLevelUpChanges.spells.add(s));
                }
            }
            
            if (rawDesc.includes('{@filter') && rawDesc.includes('|feats')) {
                featsFound.add('filter');
            }
            
            div.innerHTML = `
                <div style="font-weight:bold; color:var(--red-dark); border-bottom:1px solid var(--gold-dark); margin-bottom:5px; padding-bottom:2px;">
                    <span style="color:var(--ink); margin-right:5px;">[Lvl ${f.level}]</span> ${f.name} <span style="font-size:0.8rem; color:var(--ink-light); font-weight:normal;">(${f.source})</span>
                </div>
                <div style="font-size:0.9rem; line-height:1.5; overflow-wrap: break-word; word-break: break-word;">${desc}</div>
            `;
            
            if (f.name.includes("Fighting Style")) {
                const fsContainer = document.createElement('div');
                fsContainer.style.marginTop = "10px";
                fsContainer.style.padding = "10px";
                fsContainer.style.border = "1px dashed var(--gold)";
                fsContainer.style.background = "rgba(0,0,0,0.02)";
                
                const hasBlessedWarrior = rawDesc.includes("Blessed Warrior");
                
                if (hasBlessedWarrior) {
                    fsContainer.innerHTML = `<div style="font-weight:bold; font-size:0.9rem; margin-bottom:5px;">Select Option:</div>`;
                    
                    const primarySelect = document.createElement('select');
                    primarySelect.className = "styled-select";
                    primarySelect.style.width = "100%";
                    primarySelect.innerHTML = `
                        <option value="">-- Choose --</option>
                        <option value="feat">Fighting Style Feat</option>
                        <option value="Blessed Warrior">Blessed Warrior</option>
                    `;
                    
                    const secondaryContainer = document.createElement('div');
                    secondaryContainer.style.marginTop = "10px";
                    
                    const detailDiv = document.createElement('div');
                    detailDiv.style.marginTop = "10px";
                    detailDiv.style.fontSize = "0.9rem";

                    primarySelect.onchange = async () => {
                        secondaryContainer.innerHTML = '';
                        detailDiv.innerHTML = '';
                        
                        if (primarySelect.value === 'feat') {
                            const featSelect = document.createElement('select');
                            featSelect.className = "styled-select";
                            featSelect.style.width = "100%";
                            featSelect.innerHTML = `<option value="">-- Select Fighting Style --</option>`;
                            
                            const feats = await window.getFeatsByCategory("FS");
                            feats.forEach(feat => {
                                if (feat.name === "Blessed Warrior") return;
                                const opt = document.createElement('option');
                                opt.value = feat.name;
                                opt.textContent = feat.name;
                                featSelect.appendChild(opt);
                            });
                            
                            featSelect.onchange = () => {
                                const selected = feats.find(ft => ft.name === featSelect.value);
                                if (selected) {
                                    let d = window.processEntries(selected.entries);
                                    d = window.cleanText(d);
                                    detailDiv.innerHTML = `<strong>${selected.name}:</strong> ${d}`;
                                    if (window.pendingLevelUpChanges) {
                                        window.pendingLevelUpChanges.choices.set(f.name, { name: selected.name, desc: d });
                                    }
                                } else {
                                    detailDiv.innerHTML = "";
                                    if (window.pendingLevelUpChanges) window.pendingLevelUpChanges.choices.delete(f.name);
                                }
                            };
                            secondaryContainer.appendChild(featSelect);
                            
                        } else if (primarySelect.value === 'Blessed Warrior') {
                            const feats = await window.getFeatsByCategory("Blessed Warrior", ["Blessed Warrior"]);
                            const selected = feats.find(f => f.name === "Blessed Warrior");
                            if (selected) {
                                let d = window.processEntries(selected.entries);
                                d = window.cleanText(d);
                                detailDiv.innerHTML = `<strong>${selected.name}:</strong> ${d}`;
                                if (window.pendingLevelUpChanges) {
                                    window.pendingLevelUpChanges.choices.set(f.name, { name: selected.name, desc: d });
                                }
                            }
                        }
                    };
                    
                    fsContainer.appendChild(primarySelect);
                    fsContainer.appendChild(secondaryContainer);
                    fsContainer.appendChild(detailDiv);
                } else {
                    fsContainer.innerHTML = `<div style="font-weight:bold; font-size:0.9rem; margin-bottom:5px;">Select Fighting Style:</div>`;
                    const select = document.createElement('select');
                    select.className = "styled-select";
                    select.style.width = "100%";
                    select.innerHTML = `<option value="">-- Choose --</option>`;
                    
                    const feats = await window.getFeatsByCategory("FS");
                    feats.forEach(feat => {
                        const opt = document.createElement('option');
                        opt.value = feat.name;
                        opt.textContent = feat.name;
                        select.appendChild(opt);
                    });
                
                const detailDiv = document.createElement('div');
                detailDiv.style.marginTop = "10px";
                detailDiv.style.fontSize = "0.9rem";
                
                const addBtn = document.createElement('button');
                addBtn.className = "btn btn-secondary";
                addBtn.style.marginTop = "5px";
                addBtn.style.display = "none";
                addBtn.textContent = "Add Fighting Style";
                
                select.onchange = () => {
                    const selected = feats.find(ft => ft.name === select.value);
                    if (selected) {
                        let d = window.processEntries(selected.entries);
                        d = window.cleanText(d);
                        detailDiv.innerHTML = `<strong>${selected.name}:</strong> ${d}`;
                        addBtn.style.display = "inline-block";
                        addBtn.onclick = () => {
                            window.addFeatureItem("featsContainer", selected.name, d);
                            alert(`Added ${selected.name} to Feats.`);
                        };
                        if (window.pendingLevelUpChanges) {
                            window.pendingLevelUpChanges.choices.set(f.name, { name: selected.name, desc: d });
                        }
                    } else {
                        detailDiv.innerHTML = "";
                        addBtn.style.display = "none";
                        if (window.pendingLevelUpChanges) window.pendingLevelUpChanges.choices.delete(f.name);
                    }
                };
                
                fsContainer.appendChild(select);
                fsContainer.appendChild(detailDiv);
                fsContainer.appendChild(addBtn);
                }
                div.appendChild(fsContainer);
            }
            
            if (spellsFound.size > 0 || featsFound.size > 0) {
                const btnContainer = document.createElement('div');
                btnContainer.style.marginTop = '10px';
                btnContainer.style.display = 'flex';
                btnContainer.style.gap = '5px';
                btnContainer.style.flexWrap = 'wrap';
                
                if (spellsFound.size > 0) {
                    const note = document.createElement('div');
                    note.style.fontSize = '0.8rem';
                    note.style.color = 'var(--ink-light)';
                    note.style.fontStyle = 'italic';
                    note.style.width = '100%';
                    note.innerHTML = `<strong>Auto-add:</strong> ${Array.from(spellsFound).join(', ')}`;
                    btnContainer.appendChild(note);
                }
                
                if (featsFound.size > 0) {
                    const btn = document.createElement('button');
                    btn.className = 'btn btn-secondary';
                    btn.style.padding = '4px 8px';
                    btn.style.fontSize = '0.8rem';
                    btn.innerHTML = `Browse Feats`;
                    btn.onclick = () => window.openFeatSearch();
                    btnContainer.appendChild(btn);
                }
                
                div.appendChild(btnContainer);
            }
            
            list.appendChild(div);
        }
    } catch (e) {
        console.error(e);
        if (showBackBtn) {
            const loading = document.getElementById('lvl-loading');
            if (loading) loading.remove();
        } else {
            list.innerHTML = '';
        }
        const err = document.createElement('div');
        err.style.textAlign = 'center';
        err.style.color = 'var(--red)';
        err.textContent = 'Error loading data. Ensure data is uploaded.';
        list.appendChild(err);
    }
};

window.addSpellFromFeature = async function(spellName, silent = false) {
    try {
        // Check if spell already exists in the sheet to prevent duplicates
        const existing = Array.from(document.querySelectorAll('.spell-name')).some(i => i.value.toLowerCase() === spellName.toLowerCase());
        if (existing) {
            if (!silent) alert(`${spellName} is already in your spell list.`);
            return;
        }

        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const data = await new Promise((resolve) => {
            const req = store.get('currentData');
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => resolve(null);
        });
        
        if (!data) return alert("No data loaded.");
        
        let foundSpell = null;
        for (const file of data) {
            if (!file.name.toLowerCase().endsWith('.json')) continue;
            try {
                const json = JSON.parse(file.content);
                const spells = json.spell || json.spells || json.data;
                if (Array.isArray(spells)) {
                    const match = spells.find(s => s.name && s.name.toLowerCase() === spellName.toLowerCase());
                    if (match) {
                        if (!foundSpell) foundSpell = match;
                        else if (match.source === 'XPHB') foundSpell = match;
                        else if (match.source === 'PHB' && foundSpell.source !== 'XPHB') foundSpell = match;
                    }
                }
            } catch (e) {}
        }
        
        if (foundSpell) {
            let time = "";
            if (foundSpell.time && foundSpell.time[0]) {
                const t = foundSpell.time[0];
                time = `${t.number} ${t.unit}`;
            }
            let range = "";
            if (foundSpell.range) {
                if (foundSpell.range.distance) range = `${foundSpell.range.distance.amount ? foundSpell.range.distance.amount + " " : ""}${foundSpell.range.distance.type}`;
                else range = foundSpell.range.type;
            }
            let desc = window.processEntries(foundSpell.entries);
            if (foundSpell.entriesHigherLevel) {
                desc += "<br><br>" + window.processEntries(foundSpell.entriesHigherLevel);
            }
            desc = window.cleanText(desc);
            
            const spellData = {
                name: foundSpell.name,
                level: foundSpell.level,
                time: time,
                range: range,
                ritual: foundSpell.meta && foundSpell.meta.ritual ? true : false,
                concentration: foundSpell.duration && foundSpell.duration[0] && foundSpell.duration[0].concentration ? true : false,
                material: foundSpell.components && (foundSpell.components.m || foundSpell.components.M) ? true : false,
                description: desc,
                prepared: true
            };
            
            window.addSpellRow('preparedSpellsList', foundSpell.level, spellData);
            if (!silent) alert(`Added ${foundSpell.name} to Prepared Spells.`);
        } else {
            alert("Spell data not found.");
        }
    } catch (e) {
        console.error(e);
        alert("Error adding spell.");
    }
};

window.getFeatsByCategory = async function(category, extraFeats = []) {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const data = await new Promise((resolve) => {
        const req = store.get('currentData');
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
    });
    if (!data) return [];
    
    const feats = [];
    data.forEach(file => {
        if (!file.name.toLowerCase().endsWith('.json')) return;
        try {
            const json = JSON.parse(file.content);
            if (json.feat) {
                json.feat.forEach(f => {
                    let match = false;
                    if (f.traits && f.traits.some(t => t.toLowerCase().includes(category.toLowerCase()))) match = true;
                    if (f.category && f.category.toLowerCase().includes(category.toLowerCase())) match = true;
                    if (extraFeats.includes(f.name)) match = true;
                    if (match) feats.push(f);
                });
            }
        } catch (e) {}
    });
    
    const unique = new Map();
    feats.forEach(f => {
        if (!unique.has(f.name)) unique.set(f.name, f);
        else {
            const existing = unique.get(f.name);
            if (f.source === 'XPHB') unique.set(f.name, f);
            else if (f.source === 'PHB' && existing.source !== 'XPHB') unique.set(f.name, f);
        }
    });
    
    return Array.from(unique.values()).sort((a,b) => a.name.localeCompare(b.name));
};

window.fetchLevelUpFeatures = async function(className, subclass, level, minLevel = null) {
    const startLevel = minLevel || level;
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const data = await new Promise((resolve) => {
        const req = store.get('currentData');
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
    });
    console.log("fetchLevelUpFeatures - Raw Data:", data);
    if (!data) return [];
    const classFeatures = [];
    const subclassFeatures = [];
    const subclasses = [];
    data.forEach(file => {
        if (!file.name.toLowerCase().endsWith('.json')) return;
        try {
            const json = JSON.parse(file.content);
            if (json.classFeature) classFeatures.push(...json.classFeature);
            if (json.subclassFeature) subclassFeatures.push(...json.subclassFeature);
            if (json.subclass) subclasses.push(...json.subclass);
        } catch (e) {}
    });
    console.log("fetchLevelUpFeatures - Extracted:", { classFeatures, subclassFeatures, subclasses });
    
    // Filter for class features, prioritizing XPHB if available
    const allClassFeaturesForName = classFeatures.filter(f => f.className.toLowerCase() === className.toLowerCase());
    const hasXPHB = allClassFeaturesForName.some(f => f.source === 'XPHB');
    const relevantClassFeatures = allClassFeaturesForName.filter(f => {
        if (f.level < startLevel || f.level > level) return false;
        if (hasXPHB && f.source === 'PHB') return false;
        return true;
    });

    let scShortName = null;
    if (subclass) {
        const scCandidates = subclasses.filter(s => s.name.toLowerCase() === subclass.toLowerCase() && s.className.toLowerCase() === className.toLowerCase());
        let scObj = scCandidates.find(s => s.source === 'XPHB');
        if (!scObj) scObj = scCandidates.find(s => s.source === 'PHB');
        if (!scObj) scObj = scCandidates[0];
        if (scObj) scShortName = scObj.shortName;
    }
    let relevantSubclassFeatures = [];
    if (scShortName) {
        const allScFeatures = subclassFeatures.filter(f => f.className.toLowerCase() === className.toLowerCase() && f.subclassShortName.toLowerCase() === scShortName.toLowerCase() && f.level >= startLevel && f.level <= level);
        const scHasXPHB = allScFeatures.some(f => f.source === 'XPHB');
        relevantSubclassFeatures = allScFeatures.filter(f => {
             if (scHasXPHB && f.source === 'PHB') return false;
             return true;
        });
    }
    const all = [...relevantClassFeatures, ...relevantSubclassFeatures];
    console.log("fetchLevelUpFeatures - Final List:", all);
    const uniqueMap = new Map();
    all.forEach(f => {
        if (!uniqueMap.has(f.name)) {
            uniqueMap.set(f.name, f);
        } else {
            const existing = uniqueMap.get(f.name);
            
            const getScore = (feat) => {
                let score = 0;
                if (feat.source === 'XPHB') score += 100;
                else if (feat.source === 'PHB') score += 50;
                if (feat.entries || feat.entry) score += 10;
                return score;
            };

            if (getScore(f) > getScore(existing)) {
                uniqueMap.set(f.name, f);
            }
        }
    });
    return Array.from(uniqueMap.values()).sort((a,b) => a.level - b.level || a.name.localeCompare(b.name));
};

/* =========================================
      18. CLASS MANAGER
      ========================================= */
window.injectClassManagerButton = function() {
    const classInput = document.getElementById('charClass');
    if (classInput && !document.getElementById('manage-classes-btn')) {
    const btn = document.createElement('button');
    btn.id = 'manage-classes-btn';
    btn.innerHTML = '⚙️';
    btn.title = "Manage Classes / Multiclass";
    btn.className = "mini-btn";
    btn.style.marginLeft = "5px";
    btn.style.background = "var(--gold)";
    btn.style.color = "var(--ink)";
    btn.onclick = window.openClassManagerModal;
    
    const helpBtn = document.createElement('button');
    helpBtn.id = 'btn-view-class-table';
    helpBtn.innerHTML = '?';
    helpBtn.title = "View Class Table";
    helpBtn.className = "skill-info-btn";
    helpBtn.style.display = 'none'; // Hidden by default, shown if data exists
    helpBtn.style.marginLeft = "5px";
    helpBtn.onclick = (e) => {
        e.preventDefault();
        window.openClassTableModal();
    };

    if (classInput.parentNode) {
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.width = '100%';
        wrapper.style.gap = '5px';
        
        classInput.parentNode.insertBefore(wrapper, classInput);
        wrapper.appendChild(classInput);
        
        const tagContainer = document.createElement('div');
        tagContainer.id = 'class-tag-container';
        tagContainer.style.display = 'none';
        tagContainer.style.flexWrap = 'wrap';
        tagContainer.style.gap = '5px';
        tagContainer.style.flex = '1';
        wrapper.appendChild(tagContainer);
        
        wrapper.appendChild(btn);
        wrapper.appendChild(helpBtn);
    }
    }

    const subclassInput = document.getElementById('charSubclass');
    if (subclassInput && !document.getElementById('subclass-tag-container')) {
        const wrapper = document.createElement('div');
        wrapper.style.display = 'flex';
        wrapper.style.alignItems = 'center';
        wrapper.style.width = '100%';
        wrapper.style.gap = '5px';
        
        subclassInput.parentNode.insertBefore(wrapper, subclassInput);
        wrapper.appendChild(subclassInput);
        
        const tagContainer = document.createElement('div');
        tagContainer.id = 'subclass-tag-container';
        tagContainer.style.display = 'none';
        tagContainer.style.flexWrap = 'wrap';
        tagContainer.style.gap = '5px';
        tagContainer.style.flex = '1';
        wrapper.appendChild(tagContainer);
    }
};

window.updateClassDisplay = function() {
    const classInput = document.getElementById('charClass');
    const subclassInput = document.getElementById('charSubclass');
    const levelInput = document.getElementById('level');
    const tagContainer = document.getElementById('class-tag-container');
    const subclassTagContainer = document.getElementById('subclass-tag-container');
    
    if (!classInput || !subclassInput || !levelInput) return;
    
    if (window.characterClasses.length === 0) {
        window.characterClasses.push({name: classInput.value, subclass: subclassInput.value, level: parseInt(levelInput.value) || 1});
    }

    const totalLevel = window.characterClasses.reduce((sum, c) => sum + c.level, 0);
    
    if (window.characterClasses.length > 1) {
        if (tagContainer) {
            classInput.style.display = 'none';
            tagContainer.style.display = 'flex';
            tagContainer.innerHTML = '';
            
            window.characterClasses.forEach(c => {
                const tag = document.createElement('div');
                tag.className = 'tag-item';
                tag.style.background = 'var(--parchment-dark)';
                tag.style.border = '1px solid var(--gold-dark)';
                tag.style.padding = '4px 8px';
                tag.style.borderRadius = '4px';
                tag.style.fontSize = '0.9rem';
                tag.style.whiteSpace = 'nowrap';
                tag.style.color = 'var(--ink)';
                tag.style.fontWeight = 'bold';
                tag.textContent = `${c.name} ${c.level}`;
                tagContainer.appendChild(tag);
            });
        }

        if (subclassTagContainer) {
            subclassInput.style.display = 'none';
            subclassTagContainer.style.display = 'flex';
            subclassTagContainer.innerHTML = '';
            
            window.characterClasses.forEach(c => {
                if (c.subclass) {
                    const tag = document.createElement('div');
                    tag.className = 'tag-item';
                    tag.style.background = 'var(--parchment-dark)';
                    tag.style.border = '1px solid var(--gold-dark)';
                    tag.style.padding = '4px 8px';
                    tag.style.borderRadius = '4px';
                    tag.style.fontSize = '0.9rem';
                    tag.style.whiteSpace = 'nowrap';
                    tag.style.color = 'var(--ink)';
                    tag.style.fontWeight = 'bold';
                    tag.textContent = c.subclass;
                    subclassTagContainer.appendChild(tag);
                }
            });
        }

        const classStr = window.characterClasses.map(c => `${c.name} ${c.level}`).join(' / ');
        classInput.value = classStr;
        
        const subclassStr = window.characterClasses.map(c => c.subclass).filter(s => s).join(' / ');
        subclassInput.value = subclassStr;
        
        if (parseInt(levelInput.value) < totalLevel) levelInput.value = totalLevel;
        
        subclassInput.readOnly = true;
    } else {
        if (tagContainer) {
            classInput.style.display = 'block';
            tagContainer.style.display = 'none';
        }
        if (subclassTagContainer) {
            subclassInput.style.display = 'block';
            subclassTagContainer.style.display = 'none';
        }
        classInput.readOnly = false;
        subclassInput.readOnly = false;
        if (classInput.value !== window.characterClasses[0].name) classInput.value = window.characterClasses[0].name;
        if (subclassInput.value !== window.characterClasses[0].subclass) subclassInput.value = window.characterClasses[0].subclass;
    }
};

window.openClassManagerModal = function() {
    let modal = document.getElementById('classManagerModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'classManagerModal';
        modal.className = 'info-modal-overlay';
        modal.innerHTML = `
            <div class="info-modal-content" style="max-width: 500px;">
                <button class="close-modal-btn" onclick="document.getElementById('classManagerModal').style.display='none'">&times;</button>
                <h3 class="info-modal-title">Manage Classes</h3>
                <div id="classListContainer" style="margin-bottom:15px;"></div>
                <button class="btn" onclick="window.addClassEntry()" style="width:100%;">+ Add Class</button>
            </div>
        `;
        document.body.appendChild(modal);
    }
    window.renderClassManagerList();
    modal.style.display = 'flex';
};

window.renderClassManagerList = function() {
    const container = document.getElementById('classListContainer');
    container.innerHTML = '';
    window.characterClasses.forEach((c, idx) => {
        const div = document.createElement('div');
        div.style.border = '1px solid var(--gold)';
        div.style.padding = '10px';
        div.style.marginBottom = '10px';
        div.style.borderRadius = '4px';
        div.style.background = 'white';
        div.innerHTML = `
            <div style="display:flex; gap:10px; margin-bottom:5px;">
                <input type="text" class="styled-input" value="${c.name}" placeholder="Class Name" onchange="window.characterClasses[${idx}].name = this.value; window.updateClassDisplay(); window.saveCharacter();">
                <input type="number" class="styled-input" value="${c.level}" style="width:60px;" onchange="window.characterClasses[${idx}].level = parseInt(this.value)||1; window.updateClassDisplay(); window.saveCharacter();">
                <button class="delete-feature-btn" onclick="window.characterClasses.splice(${idx}, 1); window.renderClassManagerList(); window.updateClassDisplay(); window.saveCharacter();">&times;</button>
            </div>
            <input type="text" class="styled-input" value="${c.subclass}" placeholder="Subclass" style="width:100%; font-size:0.9rem;" onchange="window.characterClasses[${idx}].subclass = this.value; window.updateClassDisplay(); window.saveCharacter();">
        `;
        container.appendChild(div);
    });
};

window.addClassEntry = function() {
    window.characterClasses.push({ name: "", subclass: "", level: 1 });
    window.renderClassManagerList();
    window.updateClassDisplay();
    window.saveCharacter();
};

window.openClassTableModal = async function() {
    // If multiple classes, ask which one
    if (window.characterClasses.length > 1) {
        const names = window.characterClasses.map(c => c.name).join('\n');
        const name = prompt(`Enter class name to view table:\n${names}`, window.characterClasses[0].name);
        if (!name) return;
        await renderClassTableFor(name);
    } else {
        await renderClassTableFor(window.characterClasses[0].name);
    }
};

async function renderClassTableFor(className) {
    if (!className) return;
    className = className.trim();
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const data = await new Promise((resolve) => {
        const req = store.get('currentData');
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
    });
    
    if (!data) return alert("No data loaded.");
    
    let classObj = null;
    for (const file of data) {
        if (!file.name.toLowerCase().endsWith('.json')) continue;
        try {
            const json = JSON.parse(file.content);
            if (json.class) {
                const matches = json.class.filter(c => c.name.toLowerCase() === className.toLowerCase());
                for (const found of matches) {
                    const hasTable = !!found.classTableGroups;
                    const currentHasTable = classObj && !!classObj.classTableGroups;

                    if (!classObj) {
                        classObj = found;
                    } else {
                        if (hasTable && !currentHasTable) {
                            classObj = found;
                        } else if (hasTable === currentHasTable) {
                            if (found.source === 'XPHB') classObj = found;
                            else if (found.source === 'PHB' && classObj.source !== 'XPHB') classObj = found;
                        }
                    }
                }
            }
        } catch (e) {}
    }
    
    if (!classObj || !classObj.classTableGroups) return alert("Class table not found.");

    const container = document.getElementById("xpTableContent");
    let html = `<h3 style="text-align:center; color:var(--red-dark);">${classObj.name} Table</h3>`;
    html += '<div style="overflow-x:auto;"><table class="currency-table" style="width:100%; font-size:0.8rem;"><thead><tr><th>Lvl</th><th>PB</th>';
    
    // Headers
    classObj.classTableGroups.forEach(g => {
        if (g.colLabels) {
            g.colLabels.forEach(l => html += `<th>${window.cleanText(l)}</th>`);
        }
    });
    html += '</tr></thead><tbody>';

    // Rows
    for (let i = 0; i < 20; i++) {
        const lvl = i + 1;
        const pb = Math.ceil(lvl / 4) + 1;
        html += `<tr><td>${lvl}</td><td>+${pb}</td>`;
        
        classObj.classTableGroups.forEach(g => {
            const rows = g.rows || g.rowsSpellProgression;
            if (rows && rows[i]) {
                rows[i].forEach(cell => {
                    let val = cell;
                    if (typeof cell === 'object' && cell.value !== undefined) val = cell.value;
                    if (val === 0) val = "-";
                    html += `<td>${window.cleanText(val.toString())}</td>`;
                });
            } else {
                html += `<td>-</td>`; // Fallback
            }
        });
        html += `</tr>`;
    }
    html += '</tbody></table></div>';
    
    container.innerHTML = html;
    
    const modal = document.getElementById("xpTableModal");
    const modalContent = modal.querySelector('.info-modal-content');
    if (modalContent) {
        modalContent.style.maxWidth = '900px';
        modalContent.style.width = '95%';
    }
    modal.style.display = "flex";
}

window.openClassPickerModal = async function(callback) {
    let modal = document.getElementById('classPickerModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'classPickerModal';
        modal.className = 'info-modal-overlay';
        modal.innerHTML = `
            <div class="info-modal-content" style="max-width: 400px; max-height: 80vh; display: flex; flex-direction: column;">
                <button class="close-modal-btn" onclick="document.getElementById('classPickerModal').style.display='none'">&times;</button>
                <h3 class="info-modal-title" style="text-align: center">Select Class</h3>
                <div id="classPickerList" style="overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 8px;">Loading...</div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    
    const list = document.getElementById('classPickerList');
    list.innerHTML = '<div style="text-align:center; padding:10px;">Loading classes...</div>';
    modal.style.display = 'flex';

    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const data = await new Promise((resolve) => {
            const req = store.get('currentData');
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => resolve(null);
        });

        const classes = new Set();
        if (data) {
            data.forEach(file => {
                if (!file.name.toLowerCase().endsWith('.json')) return;
                try {
                    const json = JSON.parse(file.content);
                    if (json.class) json.class.forEach(c => { if (!c.isSidekick) classes.add(c.name); });
                    if (json.classFeature) json.classFeature.forEach(f => classes.add(f.className));
                } catch (e) {}
            });
        }

        const sortedClasses = Array.from(classes).sort();
        list.innerHTML = '';

        const createItem = (name, isManual = false) => {
            const btn = document.createElement('div');
            btn.className = 'checklist-item';
            btn.style.justifyContent = 'center';
            btn.style.fontWeight = isManual ? 'normal' : 'bold';
            if (isManual) btn.style.fontStyle = 'italic';
            btn.textContent = name;
            btn.onclick = () => { modal.style.display = 'none'; callback(isManual ? prompt("Enter class name:") : name); };
            list.appendChild(btn);
        };

        sortedClasses.forEach(c => createItem(c));
        createItem("Enter Manually...", true);

    } catch (e) { console.error(e); list.innerHTML = '<div style="text-align:center; color:red;">Error loading classes.</div>'; }
};