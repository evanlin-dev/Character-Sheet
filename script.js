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

// Weapon DB — base set from utils.js; extended by loadWeaponsFromData()
let dndWeaponsDB = window.dndWeaponsDB;
window.dndTablesDB = {};
window.dndItemsDB = {};
window.dndItemWeightsDB = {};

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
const skillExpertise = {};
const saveExpertise = {};
const advantageState = { skills: {}, saves: {}, initiative: false };
const deathSaves = {
  successes: [false, false, false],
  failures: [false, false, false],
};
let spellSlotsData = [{ level: 1, total: 1, used: 0 }];
let resourcesData = [];
let summonsData = [];
let hitDiceUsed = 0;
let pbScores = { str: 8, dex: 8, con: 8, int: 8, wis: 8, cha: 8 };

// Class resource definitions for auto-detection
// colLabel: regex to match class table column; formula: fn(level, abilityMod) => max; levelMin: earliest level
const CLASS_RESOURCE_DEFS = {
    'Barbarian': [
        { name: 'Rages', colLabel: /^Rages$/i, reset: 'lr' }
    ],
    'Bard': [
        { name: 'Bardic Inspiration', formula: (lvl, chaMod) => Math.max(1, chaMod), levelMin: 1, reset: 'lr' }
    ],
    'Cleric': [
        { name: 'Channel Divinity', formula: (lvl) => lvl >= 18 ? 3 : lvl >= 6 ? 2 : 1, levelMin: 2, reset: 'sr' }
    ],
    'Druid': [
        { name: 'Wild Shape', formula: () => 2, levelMin: 2, reset: 'sr' }
    ],
    'Fighter': [
        { name: 'Second Wind', formula: () => 1, levelMin: 1, reset: 'sr' },
        { name: 'Action Surge', formula: (lvl) => lvl >= 17 ? 2 : 1, levelMin: 2, reset: 'sr' },
        { name: 'Indomitable', formula: (lvl) => lvl >= 17 ? 3 : lvl >= 13 ? 2 : 1, levelMin: 9, reset: 'lr' }
    ],
    'Monk': [
        { name: 'Ki Points', colLabel: /^Ki Points$/i, reset: 'sr' }
    ],
    'Paladin': [
        { name: 'Lay on Hands', formula: (lvl) => lvl * 5, levelMin: 1, reset: 'lr' },
        { name: 'Channel Divinity', formula: () => 1, levelMin: 3, reset: 'sr' }
    ],
    'Sorcerer': [
        { name: 'Sorcery Points', colLabel: /^Sorcery Points$/i, reset: 'lr' }
    ],
    'Wizard': [
        { name: 'Arcane Recovery', formula: () => 1, levelMin: 1, reset: 'lr' }
    ]
};

// Formula options for custom resource max and weapon stats
const RESOURCE_FORMULA_OPTS = [
    { key: 'fixed',         label: 'Fixed number' },
    { key: 'pb',            label: 'Proficiency Bonus',    compute: () => getPB() },
    { key: 'pb_x2',         label: 'Prof. Bonus × 2',      compute: () => getPB() * 2 },
    { key: 'level',         label: 'Level',                compute: () => getLevel() },
    { key: 'half_level',    label: 'Half Level',           compute: () => Math.max(1, Math.floor(getLevel() / 2)) },
    { key: 'level_x5',      label: 'Level × 5',            compute: () => getLevel() * 5 },
    { key: 'str_mod',    label: 'STR modifier',         compute: () => Math.max(1, getAbilityMod('str')) },
    { key: 'dex_mod',    label: 'DEX modifier',         compute: () => Math.max(1, getAbilityMod('dex')) },
    { key: 'con_mod',    label: 'CON modifier',         compute: () => Math.max(1, getAbilityMod('con')) },
    { key: 'int_mod',    label: 'INT modifier',         compute: () => Math.max(1, getAbilityMod('int')) },
    { key: 'wis_mod',    label: 'WIS modifier',         compute: () => Math.max(1, getAbilityMod('wis')) },
    { key: 'cha_mod',    label: 'CHA modifier',         compute: () => Math.max(1, getAbilityMod('cha')) },
    { key: 'str_mod_pb', label: 'STR mod + Prof. Bonus', compute: () => Math.max(1, getAbilityMod('str') + getPB()) },
    { key: 'dex_mod_pb', label: 'DEX mod + Prof. Bonus', compute: () => Math.max(1, getAbilityMod('dex') + getPB()) },
    { key: 'con_mod_pb', label: 'CON mod + Prof. Bonus', compute: () => Math.max(1, getAbilityMod('con') + getPB()) },
    { key: 'int_mod_pb', label: 'INT mod + Prof. Bonus', compute: () => Math.max(1, getAbilityMod('int') + getPB()) },
    { key: 'wis_mod_pb', label: 'WIS mod + Prof. Bonus', compute: () => Math.max(1, getAbilityMod('wis') + getPB()) },
    { key: 'cha_mod_pb', label: 'CHA mod + Prof. Bonus', compute: () => Math.max(1, getAbilityMod('cha') + getPB()) },
];

const ABILITY_OPTS = [
    { key: 'none', label: 'Manual / None' },
    { key: 'str', label: 'STR' }, { key: 'dex', label: 'DEX' },
    { key: 'con', label: 'CON' }, { key: 'int', label: 'INT' },
    { key: 'wis', label: 'WIS' }, { key: 'cha', label: 'CHA' },
];

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

// Shared stat helpers used by formulas
function getPB() {
    const pbInput = document.getElementById("profBonus");
    if (pbInput && pbInput.value) {
        const parsed = parseInt(String(pbInput.value).replace(/[^0-9-]/g, ''));
        if (!isNaN(parsed) && parsed !== 0) return parsed;
    }
    const lvl = parseInt(document.getElementById("level")?.value) || 1;
    return Math.ceil(lvl / 4) + 1;
}
function getAbilityMod(ability) {
    return Math.floor(((parseInt(document.getElementById(ability)?.value) || 10) - 10) / 2);
}
function getLevel() {
    return parseInt(document.getElementById("level")?.value) || 1;
}

// processEntries and cleanText live in utils.js

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
  let profBonus = 2;
  const pbInput = document.getElementById("profBonus");
  if (pbInput && pbInput.value) {
      const parsed = parseInt(String(pbInput.value).replace(/[^0-9-]/g, ''));
      if (!isNaN(parsed) && parsed !== 0) profBonus = parsed;
  } else {
      const lvl = parseInt(document.getElementById("level")?.value) || 1;
      profBonus = Math.ceil(lvl / 4) + 1;
  }

  abilities.forEach((ability) => {
    const score = parseInt(document.getElementById(ability)?.value) || 10;
    const mod = calcMod(score);
    const modEl = document.getElementById(`${ability}Mod`);
    if (modEl) {
        if (modEl.tagName === 'INPUT') modEl.value = formatMod(mod);
        else modEl.textContent = formatMod(mod);
    }

    const isSaveProf = saveProficiency[ability] || false;
    const isSaveExp = saveExpertise[ability] || false;
    const saveTotal = mod + (isSaveProf ? profBonus : 0) + (isSaveProf && isSaveExp ? profBonus : 0);
    const saveEl = document.getElementById(`saveMod_${ability}`);
    if (saveEl) {
        if (saveEl.tagName === 'INPUT') saveEl.value = formatMod(saveTotal);
        else saveEl.textContent = formatMod(saveTotal);
    }
  });
  
  Object.keys(skillsMap).forEach((skillName) => {
    const ability = skillsMap[skillName];
    const abilityScore = parseInt(document.getElementById(ability)?.value) || 10;
    const abilityMod = calcMod(abilityScore);
    const isProf = skillProficiency[skillName] || false;
    const isExp = skillExpertise[skillName] || false;
    const total = abilityMod + (isProf ? profBonus : 0) + (isProf && isExp ? profBonus : 0);
    const skillEl = document.getElementById(`skillMod_${skillName}`);
    if (skillEl) {
        if (skillEl.tagName === 'INPUT') skillEl.value = formatMod(total);
        else skillEl.textContent = formatMod(total);
    }
  });
  
  updateCombatStats();
  updateSpellDC();
  updateAllWeaponStats();
  if (window.recomputeWeaponFormulas) window.recomputeWeaponFormulas();
  if (window.recomputeResourceMaxes) window.recomputeResourceMaxes();
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
  if (window.renderWeaponsCard) window.renderWeaponsCard();
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

  if (window.updateSpellRollTags) window.updateSpellRollTags();
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

window._getItemCategory = function(name) {
    const n = name.toLowerCase();
    if (/sword|dagger|bow|axe|mace|staff|spear|crossbow|wand|hammer|lance|pike|trident|rapier|whip|club|flail|sling|javelin|dart|quarterstaff|greatclub|glaive|halberd|maul|morningstar|scimitar|handaxe|shortsword|longsword|greatsword|blowgun|net|kukri|sickle|hatchet|cleaver/.test(n)) return 'Weapons';
    if (/armor|shield|helmet|gauntlet|plate|chainmail|chain mail|leather armor|breastplate|hide armor|padded|studded|ring mail|scale mail|splint|half plate|brigandine|buckler|pauldron|vambrace/.test(n)) return 'Armor & Shields';
    if (/potion|scroll|elixir|tincture|vial|philter|antitoxin|acid flask|alchemist/.test(n)) return 'Potions & Scrolls';
    if (/cloak|robe|hat|cape|ring|amulet|necklace|bracelet|gloves|belt|boots|goggles|glasses|crown|circlet|earring|brooch|pendant|tunic|coat|vestment/.test(n)) return 'Clothing & Accessories';
    if (/tool|kit|instrument|thieves|herbalism|navigator|poisoner|tinker|forgery|disguise|calligrapher|cartographer|cobbler|cook|glassblower|jeweler|leatherworker|mason|painter|potter|smith|weaver|woodcarver/.test(n)) return 'Tools & Kits';
    if (/ration|food|drink|water|meal|provision|bread|meat|cheese|wine|ale|mead|soup|jerky/.test(n)) return 'Food & Drink';
    if (/rope|bag|pack|backpack|bedroll|blanket|lantern|torch|candle|mirror|tent|waterskin|flask|oil|piton|spike|crowbar|grappling|ladder|manacles|lock|ink|paper|parchment|book|chest|barrel|bucket|jug|pot|sack|ball bearing|block|tackle|holy water|signal whistle|soap|string|wire|fishing|shovel|pickaxe|sledge|magnifying|hourglass|compass|map|net|saddlebag|saddle|bit|bridle/.test(n)) return 'Adventuring Gear';
    return 'Miscellaneous';
};

window.openEncumbranceChart = function() {
    const COLORS = {
        'Weapons':               '#c0392b',
        'Armor & Shields':       '#2980b9',
        'Potions & Scrolls':     '#8e44ad',
        'Clothing & Accessories':'#e67e22',
        'Tools & Kits':          '#16a085',
        'Food & Drink':          '#f39c12',
        'Adventuring Gear':      '#27ae60',
        'Miscellaneous':         '#7f8c8d',
        'Free Capacity':         '#e8e0d0',
    };

    // Collect all items
    const allItems = [];
    document.querySelectorAll('.inventory-item').forEach(row => {
        const name    = row.querySelector('.name-field')?.value?.trim() || '(unnamed)';
        const qty     = parseFloat(row.querySelector('.qty-field')?.value) || 0;
        const wt      = parseFloat(row.querySelector('.weight-field')?.value) || 0;
        const equipped = !!row.closest('#equippedList');
        allItems.push({ name, qty, weight: qty * wt, equipped });
    });

    // Group by category
    const groups = {};
    allItems.forEach(item => {
        const cat = window._getItemCategory(item.name);
        if (!groups[cat]) groups[cat] = { weight: 0, items: [] };
        groups[cat].weight += item.weight;
        groups[cat].items.push(item);
    });

    const totalCarried = parseFloat(document.getElementById('totalWeightVal')?.textContent) || 0;
    const maxCap       = parseFloat(document.getElementById('maxWeightVal')?.textContent) || 150;
    const free         = Math.max(0, maxCap - totalCarried);

    // Build slices (only categories with weight > 0)
    const slices = Object.entries(groups)
        .filter(([, g]) => g.weight > 0)
        .sort((a,b) => b[1].weight - a[1].weight)
        .map(([cat, g]) => ({ label: cat, value: g.weight, color: COLORS[cat] || '#95a5a6', items: g.items }));
    if (free > 0) slices.push({ label: 'Free Capacity', value: free, color: COLORS['Free Capacity'], items: [] });

    const chartTotal = slices.reduce((s,sl) => s + sl.value, 0);

    // Build modal
    let modal = document.getElementById('encumbranceModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'encumbranceModal';
        modal.className = 'info-modal-overlay';
        modal.onclick = e => { if (e.target === modal) modal.style.display = 'none'; };
        document.body.appendChild(modal);
    }
    modal.innerHTML = `
        <div class="info-modal-content" style="max-width:460px; max-height:88vh; display:flex; flex-direction:column; overflow:hidden;">
            <button class="close-modal-btn" onclick="document.getElementById('encumbranceModal').style.display='none'">&times;</button>
            <h3 class="info-modal-title" style="text-align:center;">Weight Breakdown</h3>
            <div style="text-align:center; font-size:0.85rem; color:var(--ink-light); margin-bottom:8px;">
                <b>${totalCarried.toFixed(1)}</b> / ${maxCap} lbs carried
                ${totalCarried > maxCap ? ' <span style="color:var(--red-dark);font-weight:bold;">— Encumbered!</span>' : ''}
            </div>
            <canvas id="encumbranceCanvas" width="260" height="260" style="display:block; margin:0 auto 12px; flex-shrink:0;"></canvas>
            <div id="encumbranceLegend" style="overflow-y:auto; flex:1; display:flex; flex-direction:column; gap:4px; padding:0 2px;"></div>
        </div>`;
    modal.style.display = 'flex';

    // Draw donut chart
    const canvas = document.getElementById('encumbranceCanvas');
    const ctx    = canvas.getContext('2d');
    const cx = 130, cy = 130, rOuter = 110, rInner = 55;
    ctx.clearRect(0, 0, 260, 260);
    let angle = -Math.PI / 2;
    slices.forEach(slice => {
        const sweep = (slice.value / chartTotal) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx + rInner * Math.cos(angle), cy + rInner * Math.sin(angle));
        ctx.arc(cx, cy, rOuter, angle, angle + sweep);
        ctx.arc(cx, cy, rInner, angle + sweep, angle, true);
        ctx.closePath();
        ctx.fillStyle = slice.color;
        ctx.fill();
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.stroke();
        angle += sweep;
    });
    // Center text
    ctx.fillStyle = '#4a3728';
    ctx.font = 'bold 15px serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${totalCarried.toFixed(1)} lbs`, cx, cy - 5);
    ctx.font = '11px sans-serif';
    ctx.fillStyle = '#888';
    ctx.fillText('carried', cx, cy + 13);

    // Legend with expandable item lists
    const legend = document.getElementById('encumbranceLegend');
    slices.forEach(slice => {
        const pct = chartTotal > 0 ? ((slice.value / chartTotal) * 100).toFixed(1) : '0';
        const hasItems = slice.items && slice.items.length > 0;

        const entry = document.createElement('div');
        entry.style.cssText = 'border:1px solid var(--gold); border-radius:6px; overflow:hidden; background:white;';

        const header = document.createElement('div');
        header.style.cssText = `display:flex; align-items:center; gap:8px; padding:6px 10px; cursor:${hasItems ? 'pointer' : 'default'};`;
        header.innerHTML = `
            <span style="width:13px;height:13px;border-radius:3px;background:${slice.color};flex-shrink:0;display:inline-block;border:1px solid rgba(0,0,0,0.15);"></span>
            <span style="flex:1;font-weight:600;font-size:0.85rem;">${slice.label}</span>
            <span style="font-size:0.8rem;color:var(--ink-light);">${slice.value.toFixed(1)} lbs · ${pct}%</span>
            ${hasItems ? '<span style="font-size:0.75rem;color:var(--ink-light);margin-left:4px;">▾</span>' : ''}`;

        entry.appendChild(header);

        if (hasItems) {
            const itemList = document.createElement('div');
            itemList.style.cssText = 'display:none; background:var(--parchment); border-top:1px solid var(--gold); padding:6px 10px 6px 30px; font-size:0.8rem; color:var(--ink);';
            slice.items.forEach(item => {
                const line = document.createElement('div');
                line.style.cssText = 'display:flex; justify-content:space-between; padding:2px 0; border-bottom:1px dashed var(--gold-light,#e8d9a0);';
                line.innerHTML = `<span>${item.name}${item.equipped ? ' <em style="color:var(--ink-light);">(E)</em>' : ''} ×${item.qty}</span><span style="color:var(--ink-light);">${item.weight.toFixed(1)} lbs</span>`;
                itemList.appendChild(line);
            });
            entry.appendChild(itemList);

            const arrow = header.querySelector('span:last-child');
            header.addEventListener('click', () => {
                const open = itemList.style.display !== 'none';
                itemList.style.display = open ? 'none' : 'block';
                if (arrow) arrow.textContent = open ? '▾' : '▴';
            });
        }

        legend.appendChild(entry);
    });

    // Weightless items
    const zeroItems = allItems.filter(i => i.weight === 0 && i.name !== '(unnamed)');
    if (zeroItems.length) {
        const note = document.createElement('div');
        note.style.cssText = 'font-size:0.75rem;color:var(--ink-light);font-style:italic;margin-top:4px;padding:4px 6px;border-top:1px dashed var(--gold);';
        note.textContent = `Weightless: ${zeroItems.map(i => i.name).join(', ')}`;
        legend.appendChild(note);
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
                <div style="margin-bottom: 15px; display: flex; align-items: center; justify-content: center; gap: 10px;">
                    <span style="font-weight: bold; color: var(--ink);">Max HP:</span>
                    <input type="number" id="hpManageMaxVal" style="width: 80px; text-align: center; border: 1px solid var(--gold); border-radius: 4px; padding: 4px; font-weight: bold; font-size: 1.2rem; color: var(--ink);">
                </div>
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

        document.getElementById('hpManageMaxVal').addEventListener('change', (e) => {
            const val = parseInt(e.target.value);
            if (!isNaN(val) && val > 0) {
                document.getElementById('maxHp').value = val;
                window.updateHpBar();
                window.saveCharacter();
            }
        });
    }
    document.getElementById('hpManageAmount').value = '';
    document.getElementById('hpManageMaxVal').value = document.getElementById('maxHp').value || 1;
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
  document.getElementById(`skillCheck_${skillName}`)?.classList.toggle("checked", skillProficiency[skillName]);
  if (!skillProficiency[skillName]) {
    skillExpertise[skillName] = false;
    document.getElementById(`expertiseBtn_${skillName}`)?.classList.remove('expertise-active');
  }
  updateModifiers();
  saveCharacter();
};
window.toggleSave = function (ability) {
  saveProficiency[ability] = !saveProficiency[ability];
  document.getElementById(`saveCheck_${ability}`)?.classList.toggle("checked", saveProficiency[ability]);
  if (!saveProficiency[ability]) {
    saveExpertise[ability] = false;
    document.getElementById(`expertiseBtnSave_${ability}`)?.classList.remove('expertise-active');
  }
  updateModifiers();
  saveCharacter();
};
window.toggleExpertise = function(type, name) {
  if (type === 'skill') {
    skillExpertise[name] = !skillExpertise[name];
    document.getElementById(`expertiseBtn_${name}`)?.classList.toggle('expertise-active', skillExpertise[name]);
  } else {
    saveExpertise[name] = !saveExpertise[name];
    document.getElementById(`expertiseBtnSave_${name}`)?.classList.toggle('expertise-active', saveExpertise[name]);
  }
  updateModifiers();
  saveCharacter();
};

window.injectExpertiseButtons = function() {
  Object.keys(skillsMap).forEach(skillName => {
    const checkbox = document.getElementById(`skillCheck_${skillName}`);
    if (!checkbox) return;
    const item = checkbox.closest('.skill-item');
    if (!item || item.querySelector('.expertise-btn')) return;
    const btn = document.createElement('button');
    btn.className = 'expertise-btn';
    btn.id = `expertiseBtn_${skillName}`;
    btn.textContent = 'E';
    btn.title = 'Expertise (doubles proficiency bonus)';
    btn.onclick = (e) => { e.stopPropagation(); window.toggleExpertise('skill', skillName); };
    checkbox.after(btn);
    if (skillExpertise[skillName]) btn.classList.add('expertise-active');
  });
  const abList = ['str','dex','con','int','wis','cha'];
  abList.forEach(ability => {
    const checkbox = document.getElementById(`saveCheck_${ability}`);
    if (!checkbox) return;
    const item = checkbox.closest('.skill-item');
    if (!item || item.querySelector('.expertise-btn')) return;
    const btn = document.createElement('button');
    btn.className = 'expertise-btn';
    btn.id = `expertiseBtnSave_${ability}`;
    btn.textContent = 'E';
    btn.title = 'Expertise (doubles proficiency bonus)';
    btn.onclick = (e) => { e.stopPropagation(); window.toggleExpertise('save', ability); };
    checkbox.after(btn);
    if (saveExpertise[ability]) btn.classList.add('expertise-active');
  });
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
// Map old saved tab IDs to the new features tab + filter
const _featuresTabMap = { 'class-features': 'class', 'race-features': 'species', 'background-features': 'background', 'feats': 'feats' };

window.switchFeaturesFilter = function(filter) {
  window._featuresFilter = filter;
  document.querySelectorAll('#features-filter-row .msv-filter-btn').forEach(btn => {
    const btnFilter = btn.getAttribute('onclick').match(/'(\w+)'/)?.[1];
    btn.classList.toggle('active', btnFilter === filter);
  });
  const sectionMap = { 'class': 'class-features', 'background': 'background-features', 'species': 'race-features', 'feats': 'feats' };
  document.querySelectorAll('.feature-section').forEach(s => {
    s.style.display = (filter === 'all' || s.id === sectionMap[filter]) ? '' : 'none';
  });
  saveCharacter();
};

window.switchTab = function (tabName) {
  // Remap old feature tab IDs
  if (_featuresTabMap[tabName]) {
    window.switchTab('features');
    window.switchFeaturesFilter(_featuresTabMap[tabName]);
    return;
  }
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
    box.style.padding = "8px 10px";
  }

  // Header with Textarea for Title (allows wrapping)
  const header = document.createElement("div");
  header.className = "feature-header";

  if (isCompact) {
    header.style.marginBottom = "4px";
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

  header.appendChild(delBtn);

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
  targetListId = null,
) {
  // Check for Equipment Pack Expansion (only for regular inventory)
  if (!targetListId) {
      const cleanName = name.toLowerCase().trim();
      const noPrefix = cleanName.replace(/^(?:a|an|the)\s+/i, '');
      const packContents = (window.EQUIPMENT_PACKS || {})[cleanName] || (window.EQUIPMENT_PACKS || {})[noPrefix];
      if (packContents) {
          packContents.forEach(p => {
              let pName = p;
              let pQty = 1;
              const match = p.match(/^(\d+)\s+(.*)$/);
              if (match) { pQty = parseInt(match[1]); pName = match[2]; }
              const pKey = pName.toLowerCase().trim();
              let itemDesc = (window.dndItemsDB || {})[pKey];
              let fullDesc = `From ${name}`;
              if (itemDesc) fullDesc = `${fullDesc}:\n${itemDesc}`;
              const itemWt = (window.dndItemWeightsDB || {})[pKey] || 0;
              addInventoryItem(pName, pQty * Math.max(1, parseInt(qty)||1), itemWt, isEquipped, fullDesc, skipSave);
          });
          return;
      }
  }

  const listId = targetListId || (isEquipped ? "equippedList" : "inventoryList");
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

  // Equip Check (hidden for component pouch items)
  const check = document.createElement("input");
  check.type = "checkbox";
  check.className = "equip-check";
  check.checked = isEquipped;
  check.title = "Equip/Unequip";
  if (targetListId === 'componentPouchList') check.style.visibility = 'hidden';
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
// DB constants and openDB() live in utils.js
const DB_NAME   = window.DB_NAME;
const STORE_NAME = window.STORE_NAME;
const DB_VERSION = window.DB_VERSION;
const openDB    = window.openDB;

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

function loadItemsFromData(parsedData) {
  if (!parsedData) return;
  window.dndItemsDB = {};
  window.dndItemWeightsDB = {};
  parsedData.forEach((json) => {
    try {
      const arrays = [json.item, json.items, json.baseitem, json.baseitems, json.magicvariant, json.magicvariants];
      arrays.forEach(arr => {
          if (Array.isArray(arr)) {
              arr.forEach(item => {
                  if (!item.name) return;
                  const key = item.name.toLowerCase().trim();
                  let desc = "";
                  if (item.entries) desc = window.processEntries(item.entries);
                  else if (item.desc) desc = window.processEntries(item.desc);
                  else if (item.description) desc = item.description;
                  if (desc) window.dndItemsDB[key] = window.cleanText(desc);
                  const wt = item.weight ?? item.weight_lbs ?? 0;
                  if (wt) window.dndItemWeightsDB[key] = parseFloat(wt) || 0;
              });
          }
      });
    } catch (e) {}
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
        loadItemsFromData(parsedData);
        loadActionsFromData(parsedData);
        loadTablesFromData(parsedData);
        loadLanguagesFromData(parsedData);
        loadConditionsFromData(parsedData);
      }
      const btnItems = document.getElementById("btn-search-items-zip");
      const btnCantrips = document.getElementById("btn-search-cantrips-zip");
      const btnSpells = document.getElementById("btn-search-spells-zip");
      const btnClassTable = document.getElementById("btn-view-class-table");
      const btnCustomData = document.getElementById("btn-custom-data-manager");
      const btnDataBrowser = document.getElementById("btn-data-browser");
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
      const btnItemsPouch = document.getElementById("btn-search-items-pouch");
      if (hasData) {
        if (btnItems) btnItems.style.display = "inline-block";
        if (btnItemsPouch) btnItemsPouch.style.display = "inline-block";
        if (btnCantrips) btnCantrips.style.display = "inline-block";
        if (btnSpells) btnSpells.style.display = "inline-block";
        if (btnFeats) btnFeats.style.display = "inline-block";
        if (btnLangs) btnLangs.style.display = "inline-block";
        if (btnClassTable) btnClassTable.style.display = "inline-flex";
        if (btnCustomData) btnCustomData.style.display = "block";
        if (btnDataBrowser) btnDataBrowser.style.display = "block";
      } else {
        if (btnItems) btnItems.style.display = "none";
        if (btnItemsPouch) btnItemsPouch.style.display = "none";
        if (btnCantrips) btnCantrips.style.display = "none";
        if (btnSpells) btnSpells.style.display = "none";
        if (btnFeats) btnFeats.style.display = "none";
        if (btnLangs) btnLangs.style.display = "none";
        if (btnClassTable) btnClassTable.style.display = "none";
        if (btnCustomData) btnCustomData.style.display = "none";
        if (btnDataBrowser) btnDataBrowser.style.display = "none";
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
      const summonsSearchBtn = document.getElementById('summons-search-btn');
      if (summonsSearchBtn) summonsSearchBtn.style.display = hasData ? '' : 'none';
      document.querySelectorAll(".weapon-name").forEach((input) => {
        if (input.dataset.customWeapon) return; // already unlocked for custom name editing
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

window._itemSearchTarget = 'inventoryList';
window.openItemSearch = async function (targetListId) {
  window._itemSearchTarget = targetListId || 'inventoryList';
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
      const tgt = window._itemSearchTarget || 'inventoryList';
      addInventoryItem(item.name, 1, weight, false, desc, false, tgt === 'inventoryList' ? null : tgt);
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
      // Map data to our format
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

      const rawMat = spell.components && (spell.components.m || spell.components.M);
      const material = !!rawMat;
      if (rawMat) {
        let matText = typeof rawMat === 'object' ? (rawMat.text || '') : rawMat;
        if (matText) {
          matText = matText.charAt(0).toUpperCase() + matText.slice(1);
          desc = `**Materials:** ${matText}\n\n${desc}`;
        }
      }

      const spellData = {
        name: spell.name,
        level: spell.level,
        time: time,
        range: range,
        ritual: ritual,
        concentration: concentration,
        material: material,
        description: desc,
        attackType: (spell.spellAttack && spell.spellAttack[0]) ? spell.spellAttack[0].toUpperCase() : '',
        saveAbility: (spell.savingThrow && spell.savingThrow[0]) ? spell.savingThrow[0].toLowerCase() : '',
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
  
  let searchInput = document.getElementById('conditionSearchInput');
  if (!searchInput) {
      searchInput = document.createElement('input');
      searchInput.id = 'conditionSearchInput';
      searchInput.type = 'text';
      searchInput.placeholder = 'Search conditions...';
      searchInput.style.marginBottom = '10px';
      searchInput.style.width = '100%';
      searchInput.style.padding = '8px';
      searchInput.style.border = '1px solid var(--gold)';
      searchInput.style.borderRadius = '4px';
      
      searchInput.addEventListener('input', (e) => {
          const term = e.target.value.toLowerCase();
          container.querySelectorAll('.checklist-item').forEach(item => {
              const nameSpan = item.querySelector('span');
              if (nameSpan) {
                  const name = nameSpan.textContent.toLowerCase();
                  item.style.display = name.includes(term) ? 'flex' : 'none';
              }
          });
      });
      
      container.parentNode.insertBefore(searchInput, container);
  }
  if (searchInput) searchInput.value = '';

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
    // Unlock the field so the user can type a custom name directly
    currentWeaponInput.removeAttribute("readonly");
    currentWeaponInput.removeAttribute("onclick");
    currentWeaponInput.onclick = null;
    currentWeaponInput.style.cursor = "text";
    currentWeaponInput.style.color = "var(--ink)";
    currentWeaponInput.placeholder = "Enter custom name";
    currentWeaponInput.dataset.customWeapon = "1";
    currentWeaponInput.addEventListener('change', saveCharacter, { once: false });
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
  let abilityKey = 'str';
  if (weaponData.props.includes("Finesse")) {
    if (dexMod > strMod) { abilityMod = dexMod; abilityKey = 'dex'; }
  } else if (weaponData.cat === "Ranged" && !weaponData.props.some(p => p.includes("Thrown"))) {
    abilityMod = dexMod;
    abilityKey = 'dex';
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
  row.dataset.wformula = JSON.stringify({
      atkAbility: abilityKey,
      atkProf: isProficient,
      dmgAbility: abilityKey,
      damageDice: weaponData.dmg || '',
      damageType: weaponData.dtype || '',
      saveDCAbility: 'none',
  });
  saveCharacter();
  window.recomputeWeaponFormulas();
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

  const isLocked = window.isDataAvailable && !(data && data.customWeapon);
  const nameField = isLocked
    ? `<input type="text" class="weapon-name" placeholder="Click to select..." onclick="openWeaponPicker(this)" readonly value="${data ? data.name : ""}" style="cursor: pointer; color: var(--red-dark); font-weight: bold;" />`
    : `<input type="text" class="weapon-name" placeholder="Enter weapon name" value="${data ? data.name : ""}" style="cursor: text; color: var(--ink); font-weight: bold;" />`;

  newWeapon.innerHTML = `
    <div style="display:flex; position:absolute; top:5px; right:5px; gap:4px; z-index:10;">
        <button class="weapon-formula-btn" title="Set formula" onclick="window.openWeaponFormulaModal(this)" style="width:24px; height:24px; background:transparent; border:1px solid var(--gold); border-radius:4px; font-size:0.75rem; cursor:pointer; color:var(--ink-light); display:flex; align-items:center; justify-content:center;">⚙</button>
        <button class="delete-feature-btn" style="width:24px; height:24px;" onclick="this.closest('.weapon-item').remove(); saveCharacter();">&times;</button>
    </div>
    <div style="display: flex; flex-direction: column; gap: 10px;">
        <div class="grid grid-3" style="margin-bottom: 0; gap: 10px;">
            <div class="field"><span class="field-label">Weapon Name</span>${nameField}</div>
            <div class="field"><span class="field-label">Atk Bonus</span><input type="text" class="weapon-atk" placeholder="+0" value="${data ? data.atk : ""}" /></div>
            <div class="field"><span class="field-label">Damage</span><input type="text" class="weapon-damage" placeholder="1d6+0" value="${data ? data.damage : ""}" /></div>
        </div>
        <div class="field"><span class="field-label">Notes</span><textarea class="weapon-notes" placeholder="Properties..." rows="1">${data ? data.notes : ""}</textarea></div>
    </div>`;
  if (data && data.formulaData) {
      newWeapon.dataset.wformula = JSON.stringify(data.formulaData);
  }
  if (data && data.customWeapon) {
      const ni = newWeapon.querySelector('.weapon-name');
      if (ni) {
          ni.dataset.customWeapon = "1";
          ni.addEventListener('change', saveCharacter);
      }
  }
  weaponList.appendChild(newWeapon);
  newWeapon
    .querySelectorAll("input")
    .forEach((input) => input.addEventListener("input", saveCharacter));
  const notesTA = newWeapon.querySelector('.weapon-notes');
  if (notesTA) {
      notesTA.addEventListener('input', saveCharacter);
      requestAnimationFrame(() => autoResizeTextarea(notesTA));
  }
  if (!window.isInitializing) {
      if (data && data.formulaData) window.recomputeWeaponFormulas();
      saveCharacter();
  }
};

// Recompute weapon atk/damage from saved formula
window.recomputeWeaponFormulas = function() {
    const pb = getPB();
    document.querySelectorAll('.weapon-item[data-wformula]').forEach(row => {
        try {
            const f = JSON.parse(row.dataset.wformula);
            if (!f) return;
            if (f.atkAbility && f.atkAbility !== 'none') {
                const mod = getAbilityMod(f.atkAbility);
                const total = mod + (f.atkProf ? pb : 0);
                const atkInput = row.querySelector('.weapon-atk');
                if (atkInput) atkInput.value = total >= 0 ? `+${total}` : `${total}`;
            }
            if (f.dmgAbility && f.dmgAbility !== 'none' && f.damageDice) {
                const mod = getAbilityMod(f.dmgAbility);
                const dmgInput = row.querySelector('.weapon-damage');
                if (dmgInput) {
                    let s = f.damageDice;
                    if (mod > 0) s += ` + ${mod}`;
                    else if (mod < 0) s += ` - ${Math.abs(mod)}`;
                    if (f.damageType) s += ` ${f.damageType}`;
                    dmgInput.value = s;
                }
            }
            if (f.saveDCAbility && f.saveDCAbility !== 'none') {
                const dc = 8 + getAbilityMod(f.saveDCAbility) + pb;
                const notesInput = row.querySelector('.weapon-notes');
                if (notesInput && !notesInput.value.includes('DC')) {
                    // Only update if DC isn't already in notes
                }
                // Write DC to a dedicated display if it exists
                const dcEl = row.querySelector('.weapon-dc-val');
                if (dcEl) dcEl.textContent = `DC ${dc}`;
            }
        } catch (e) {}
    });
    if (window.renderWeaponsCard) window.renderWeaponsCard();
};

const MASTERY_DESCRIPTIONS = {
    cleave:  'Hit a creature → make a second attack (no action) against a different creature within 5 ft. On hit, deal damage equal to your ability modifier.',
    graze:   'When you miss, the target still takes damage equal to your ability modifier.',
    nick:    'The extra attack from the Light property uses your Action instead of your Bonus Action.',
    push:    'On a hit, push the target up to 10 ft directly away from you.',
    sap:     'On a hit, the target has Disadvantage on its next attack roll before your next turn.',
    slow:    'On a hit, the target\'s Speed is reduced by 10 ft until the start of your next turn.',
    topple:  'On a hit, the target must succeed on a Constitution saving throw (DC = 8 + your ability modifier + PB) or fall Prone.',
    vex:     'On a hit that deals damage, you gain Advantage on your next attack roll against the same target before your next turn.',
};

window.renderWeaponsCard = function() {
    const card = document.getElementById('mobile-weapons-card');
    if (!card) return;

    const items = Array.from(document.querySelectorAll('.weapon-item'));
    if (items.length === 0) {
        card.innerHTML = `
            <div class="weapons-card-header">
                <span class="weapons-card-title">Weapons</span>
            </div>
            <div style="color:var(--ink-light); font-style:italic; font-size:0.82rem; padding:4px 0;">No weapons added yet.</div>`;
        return;
    }

    const pb = getPB();
    const rowsHtml = items.map((item, i) => {
        const name = item.querySelector('.weapon-name')?.value || '—';
        const atk  = item.querySelector('.weapon-atk')?.value  || '—';
        const dmg  = item.querySelector('.weapon-damage')?.value || '—';
        const notes = item.querySelector('.weapon-notes')?.value?.trim() || '';

        let dcStr = '';
        try {
            const f = JSON.parse(item.dataset.wformula || '{}');
            if (f.saveDCAbility && f.saveDCAbility !== 'none') {
                dcStr = `Save DC ${8 + getAbilityMod(f.saveDCAbility) + pb}`;
            }
        } catch(e) {}

        // Parse mastery from notes (e.g. "Finesse, Light, Mastery: Vex")
        const masteryMatch = notes.match(/Mastery:\s*(\w+)/i);
        const masteryName = masteryMatch ? masteryMatch[1] : '';
        const masteryDesc = masteryName ? MASTERY_DESCRIPTIONS[masteryName.toLowerCase()] : '';

        // Notes without the "Mastery: X" part (avoid duplicate display)
        const notesWithoutMastery = notes.replace(/,?\s*Mastery:\s*\w+/gi, '').trim().replace(/^,\s*/, '');

        const detailParts = [];
        if (notesWithoutMastery) detailParts.push(`<span class="wcard-notes">${notesWithoutMastery}</span>`);
        if (dcStr) detailParts.push(`<span class="wcard-notes">${dcStr}</span>`);
        const hasMastery = !!(masteryName && masteryDesc);
        const hasDetail = detailParts.length > 0 || hasMastery;
        const expandId = `wcard-detail-${i}`;

        const masteryHtml = hasMastery ? `
            <div class="wcard-mastery-block">
                <span class="wcard-mastery-name">${masteryName}</span>
                <span class="wcard-mastery-desc">${masteryDesc}</span>
            </div>` : '';

        return `<div class="weapon-card-item">
            <div class="weapon-card-row${hasDetail ? ' weapon-card-row-expandable' : ''}"
                 onclick="${hasDetail ? `var d=document.getElementById('${expandId}');if(d){d.classList.toggle('open');this.querySelector('.wcard-chevron').classList.toggle('open')}` : ''}">
                <span class="weapon-card-name">${name}</span>
                <span class="weapon-card-atk">${atk}</span>
                <span class="weapon-card-dmg">${dmg}</span>
                ${hasDetail ? `<span class="wcard-chevron">▾</span>` : '<span style="width:12px;flex-shrink:0;"></span>'}
            </div>
            ${hasDetail ? `<div class="weapon-card-detail" id="${expandId}">${detailParts.join(' · ')}${masteryHtml}</div>` : ''}
        </div>`;
    }).join('');

    card.innerHTML = `
        <div class="weapons-card-header">
            <span class="weapons-card-title">Weapons</span>
        </div>
        ${rowsHtml}`;
};

// Open weapon formula modal
window.openWeaponFormulaModal = function(btn) {
    const row = btn.closest('.weapon-item');
    if (!row) return;
    let current = {};
    try { current = JSON.parse(row.dataset.wformula || '{}'); } catch(e) {}
    if (!row.id) row.id = 'wrow-' + Date.now();

    const pb = getPB();
    const abilityOptHtml = (selected) => ABILITY_OPTS.map(o =>
        `<option value="${o.key}" ${selected === o.key ? 'selected' : ''}>${o.label}</option>`
    ).join('');

    const wfPreview = (f) => {
        const lines = [];
        if (f.atkAbility && f.atkAbility !== 'none') {
            const mod = getAbilityMod(f.atkAbility);
            const total = mod + (f.atkProf ? pb : 0);
            lines.push(`<b>Attack:</b> ${total >= 0 ? '+' : ''}${total}`);
        }
        if (f.dmgAbility && f.dmgAbility !== 'none') {
            const mod = getAbilityMod(f.dmgAbility);
            const dice = f.damageDice || '';
            let s = dice;
            if (mod > 0) s += ` + ${mod}`;
            else if (mod < 0) s += ` - ${Math.abs(mod)}`;
            if (f.damageType) s += ` ${f.damageType}`;
            lines.push(`<b>Damage:</b> ${s || `modifier: ${mod >= 0 ? '+' : ''}${mod}`}`);
        }
        if (f.saveDCAbility && f.saveDCAbility !== 'none') {
            lines.push(`<b>Save DC:</b> ${8 + getAbilityMod(f.saveDCAbility) + pb}`);
        }
        return lines.length ? lines.join('<br>') : '<span style="color:var(--ink-light);">No formula — manual input only.</span>';
    };

    let modal = document.getElementById('weapFormulaModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'weapFormulaModal';
        modal.className = 'info-modal-overlay';
        document.body.appendChild(modal);
    }
    modal.dataset.weaponRowId = row.id;
    modal.innerHTML = `
        <div class="info-modal-content" style="max-width:360px;">
            <button class="info-modal-close" onclick="document.getElementById('weapFormulaModal').style.display='none'">×</button>
            <h3 class="info-modal-title">Weapon Formula</h3>
            <div style="margin-bottom:10px;">
                <span class="field-label">Attack Bonus — Ability</span>
                <select id="wfAtkAbility" style="width:100%; margin-top:4px; padding:6px; border:1px solid var(--gold); border-radius:4px; background:var(--parchment);">
                    ${abilityOptHtml(current.atkAbility || 'none')}
                </select>
            </div>
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:14px;">
                <input type="checkbox" id="wfAtkProf" ${current.atkProf !== false ? 'checked' : ''} style="width:16px; height:16px;">
                <label for="wfAtkProf" style="font-family:'Cinzel',serif; font-size:0.82rem; color:var(--ink);">Add Proficiency Bonus</label>
            </div>
            <div style="margin-bottom:10px;">
                <span class="field-label">Damage Modifier — Ability</span>
                <select id="wfDmgAbility" style="width:100%; margin-top:4px; padding:6px; border:1px solid var(--gold); border-radius:4px; background:var(--parchment);">
                    ${abilityOptHtml(current.dmgAbility || 'none')}
                </select>
            </div>
            <div style="margin-bottom:14px;">
                <span class="field-label">Save DC — Ability (= 8 + mod + PB)</span>
                <select id="wfDCAbility" style="width:100%; margin-top:4px; padding:6px; border:1px solid var(--gold); border-radius:4px; background:var(--parchment);">
                    ${abilityOptHtml(current.saveDCAbility || 'none')}
                </select>
            </div>
            <div id="wfPreview" style="background:var(--parchment-dark); border:1px solid var(--gold); border-radius:4px; padding:8px; margin-bottom:16px; font-size:0.85rem; font-family:'Crimson Text',serif; line-height:1.6;">
                ${wfPreview(current)}
            </div>
            <div style="display:flex; gap:8px;">
                <button class="btn" style="flex:1;" onclick="window.applyWeaponFormula()">Apply</button>
                <button class="btn btn-secondary" style="flex:1;" onclick="document.getElementById('weapFormulaModal').style.display='none'">Cancel</button>
            </div>
        </div>`;

    // Live preview on any change
    const previewEl = modal.querySelector('#wfPreview');
    const getFormState = () => ({
        atkAbility: modal.querySelector('#wfAtkAbility').value,
        atkProf: modal.querySelector('#wfAtkProf').checked,
        dmgAbility: modal.querySelector('#wfDmgAbility').value,
        saveDCAbility: modal.querySelector('#wfDCAbility').value,
        damageDice: current.damageDice,
        damageType: current.damageType
    });
    ['wfAtkAbility', 'wfDmgAbility', 'wfDCAbility', 'wfAtkProf'].forEach(id => {
        modal.querySelector('#' + id).addEventListener('change', () => {
            previewEl.innerHTML = wfPreview(getFormState());
        });
    });

    window.applyWeaponFormula = function() {
        const r = document.getElementById(modal.dataset.weaponRowId);
        if (!r) return;
        const f = getFormState();
        // Extract dice and damage type from current damage field if not already set
        const dmgInput = r.querySelector('.weapon-damage');
        if (dmgInput && dmgInput.value && !f.damageDice) {
            const diceMatch = dmgInput.value.match(/^([\dd\s]+)/i);
            if (diceMatch) f.damageDice = diceMatch[1].trim();
            const typeMatch = dmgInput.value.match(/(slashing|piercing|bludgeoning|fire|cold|lightning|acid|poison|necrotic|radiant|thunder|psychic|force)/i);
            if (typeMatch) f.damageType = typeMatch[1].toLowerCase();
        }
        r.dataset.wformula = JSON.stringify(f);
        modal.style.display = 'none';
        window.recomputeWeaponFormulas();
        saveCharacter();
    };

    modal.style.display = 'flex';
};

// Resources
window.renderResources = function() {
    const container = document.getElementById('resourcesContainer');
    if (!container) return;
    container.innerHTML = '';
    resourcesData.forEach((res, index) => {
        const box = document.createElement('div');
        box.className = 'resource-item';
        box.style.position = 'relative';

        const effectiveMax = window.computeResourceMax ? window.computeResourceMax(res) : (res.max || 1);
        const usePips = effectiveMax <= 10;
        const resetLabel = res.reset === 'sr' ? 'Short Rest' : res.reset === 'both' ? 'Both Rests' : 'Long Rest';
        const formulaKey = res.formulaKey && res.formulaKey !== 'fixed' ? res.formulaKey : null;
        const formulaOpt = formulaKey ? RESOURCE_FORMULA_OPTS.find(o => o.key === formulaKey) : null;

        let maxInfoHtml = '';
        if (res.auto) {
            maxInfoHtml = `<span class="res-auto-tag" title="Auto-detected from class data">auto</span>`;
        } else if (formulaKey) {
            maxInfoHtml = `<span style="font-family:'Cinzel',serif; font-size:0.72rem; color:var(--ink-light); white-space:nowrap;">${formulaOpt ? formulaOpt.label : formulaKey} = ${effectiveMax}</span>`;
        }

        const resetBadge = `<span class="res-badge ${res.reset === 'sr' ? 'res-badge-sr' : res.reset === 'both' ? 'res-badge-both' : 'res-badge-lr'}" style="font-size:0.6rem;">${resetLabel}</span>`;

        let slotsHtml = '';
        if (usePips) {
            for (let i = 0; i < effectiveMax; i++) {
                const isUsed = i < res.used ? 'used' : '';
                slotsHtml += `<div class="resource-slot ${isUsed}" onclick="toggleResourceSlot(${index}, ${i})"></div>`;
            }
        } else {
            slotsHtml = `
                <div style="display:flex; align-items:center; gap:8px;">
                    <button class="mini-btn" onclick="stepResourceDesktop(${index}, -1)">−</button>
                    <span style="font-family:'Cinzel',serif; font-size:0.9rem; min-width:24px; text-align:center;">${res.used}</span>
                    <span style="color:var(--ink-light);">/</span>
                    <span style="font-family:'Cinzel',serif; font-size:0.9rem;">${effectiveMax}</span>
                    <button class="mini-btn" onclick="stepResourceDesktop(${index}, 1)">+</button>
                </div>`;
        }

        const settingsBtn = res.auto
            ? ''
            : `<button class="mini-btn" title="Resource settings" onclick="window.openResourceSettingsModal(${index})" style="padding:0 5px; font-size:0.75rem;">⚙</button>`;

        const deleteBtn = res.auto
            ? ''
            : `<button class="delete-feature-btn" onclick="deleteResource(${index})" style="position:absolute; top:4px; right:4px; margin:0;">&times;</button>`;

        box.innerHTML = `
            ${deleteBtn}
            <div class="resource-header" style="padding-right:${res.auto ? '0' : '22px'};">
                <input type="text" class="resource-name" value="${res.name}" onchange="updateResourceName(${index}, this.value)" placeholder="Resource Name" ${res.auto ? 'readonly style="pointer-events:none;"' : ''}>
                <div class="resource-controls" style="display:flex;align-items:center;gap:4px;flex-wrap:wrap;">
                    ${maxInfoHtml}
                    ${resetBadge}
                    ${settingsBtn}
                </div>
            </div>
            <div class="resource-slots">${slotsHtml}</div>
        `;
        container.appendChild(box);
    });
};

window.stepResourceDesktop = function(index, delta) {
    const res = resourcesData[index];
    if (!res) return;
    const max = window.computeResourceMax ? window.computeResourceMax(res) : res.max;
    res.used = Math.max(0, Math.min(max, (res.used || 0) + delta));
    renderResources();
    if (document.getElementById('mobile-resources-card')) window.renderMobileResources();
    saveCharacter();
};

/* ---- Component Pouch ---- */
const SPELLCASTING_CLASSES = ['artificer','bard','cleric','druid','paladin','ranger','sorcerer','warlock','wizard','blood hunter'];
window.isSpellcaster = function() {
    const cls = (document.getElementById('charClass')?.value || '').toLowerCase();
    const sub = (document.getElementById('charSubclass')?.value || '').toLowerCase();
    if (SPELLCASTING_CLASSES.some(c => cls.includes(c))) return true;
    if (sub.includes('eldritch knight') || sub.includes('arcane trickster')) return true;
    if (spellSlotsData && spellSlotsData.length > 0) return true;
    return false;
};
window.updateComponentPouchVisibility = function() {
    const section = document.getElementById('component-pouch-section');
    if (section) section.style.display = window.isSpellcaster() ? '' : 'none';
};
window.addComponentPouchItem = function() {
    addInventoryItem('', 1, 0, false, '', false, 'componentPouchList');
};

window.addResource = function() {
    resourcesData.push({ name: "New Resource", max: 3, used: 0, reset: 'lr', formulaKey: 'fixed', fixedMax: 3 });
    renderResources();
    saveCharacter();
};
window.deleteResource = function(index) {
    if(confirm("Delete this resource?")) {
        resourcesData.splice(index, 1);
        renderResources();
        if (document.getElementById('mobile-resources-card')) window.renderMobileResources();
        saveCharacter();
    }
};
window.updateResourceName = function(index, val) {
    resourcesData[index].name = val;
    if (document.getElementById('mobile-resources-card')) window.renderMobileResources();
    saveCharacter();
};
window.updateResourceMax = function(index, val) {
    const res = resourcesData[index];
    if (!res) return;
    const n = parseInt(val) || 1;
    res.fixedMax = n; res.max = n;
    if (res.used > n) res.used = n;
    renderResources();
    if (document.getElementById('mobile-resources-card')) window.renderMobileResources();
    saveCharacter();
};
window.adjustResourceMax = function(index, delta) {
    const res = resourcesData[index];
    if (!res) return;
    let newMax = (parseInt(res.fixedMax ?? res.max) || 0) + delta;
    if (newMax < 1) newMax = 1;
    res.fixedMax = newMax; res.max = newMax;
    if (res.used > newMax) res.used = newMax;
    renderResources();
    if (document.getElementById('mobile-resources-card')) window.renderMobileResources();
    saveCharacter();
};
window.toggleResourceSlot = function(index, slotIndex) {
    if (slotIndex < resourcesData[index].used) resourcesData[index].used = slotIndex;
    else resourcesData[index].used = slotIndex + 1;
    renderResources();
    saveCharacter();
};

// ===== SUMMONS / CREATURES =====
window.renderSummons = function() {
    const container = document.getElementById('summonsContainer');
    if (!container) return;
    container.innerHTML = '';
    if (summonsData.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:var(--ink-light);font-style:italic;padding:16px 0;">No creatures tracked. Add one below.</div>';
        return;
    }
    summonsData.forEach((s, i) => {
        const card = document.createElement('div');
        card.className = 'summon-card';

        // Build abilities HTML
        const abilities = s.abilities || [];
        const abilitiesHtml = abilities.map((ab, ai) => `
            <div class="summon-ability-row" id="summon-ab-${i}-${ai}">
                <input class="summon-ability-name" type="text" value="${(ab.name||'').replace(/"/g,'&quot;')}" placeholder="Ability name"
                    oninput="window.updateCreatureAbility(${i},${ai},'name',this.value)">
                <button class="mini-btn" style="color:var(--red-dark);flex-shrink:0;" onclick="window.removeCreatureAbility(${i},${ai})" title="Remove">✕</button>
                <textarea class="summon-ability-desc" rows="2" placeholder="Description..."
                    oninput="window.updateCreatureAbility(${i},${ai},'desc',this.value)">${(ab.desc||'').replace(/</g,'&lt;')}</textarea>
            </div>`).join('');

        const importBtn = window.isDataAvailable
            ? `<button class="mini-btn summon-import-btn" title="Import from data" onclick="window.openCreatureImportModal(${i})">⬇ Import</button>`
            : '';

        card.innerHTML = `
            <div class="summon-card-header">
                <input class="summon-name-inp" type="text" value="${s.name.replace(/"/g,'&quot;')}" placeholder="Creature name"
                    onchange="window.updateSummonField(${i},'name',this.value)" oninput="window.updateSummonField(${i},'name',this.value)">
                ${importBtn}
                <button class="mini-btn" style="color:var(--red-dark);" onclick="window.deleteSummon(${i})" title="Remove">✕</button>
            </div>
            <div class="summon-card-stats">
                <div class="summon-stat-block">
                    <span class="summon-stat-label">AC</span>
                    <input class="summon-stat-inp" type="number" min="0" value="${s.ac}"
                        onchange="window.updateSummonField(${i},'ac',parseInt(this.value)||0)"
                        oninput="window.updateSummonField(${i},'ac',parseInt(this.value)||0)">
                </div>
                <div class="summon-stat-block summon-hp-block">
                    <span class="summon-stat-label">HP</span>
                    <div class="summon-hp-row">
                        <button class="mini-btn" onclick="window.stepSummonHp(${i},-1)">−</button>
                        <input class="summon-stat-inp summon-hp-cur" type="number" min="0" value="${s.hp}"
                            onchange="window.updateSummonField(${i},'hp',parseInt(this.value)||0)"
                            oninput="window.updateSummonField(${i},'hp',parseInt(this.value)||0)">
                        <span style="color:var(--ink-light);font-size:0.85rem;">/</span>
                        <input class="summon-stat-inp summon-hp-max" type="number" min="1" value="${s.maxHp}"
                            onchange="window.updateSummonField(${i},'maxHp',Math.max(1,parseInt(this.value)||1))"
                            oninput="window.updateSummonField(${i},'maxHp',Math.max(1,parseInt(this.value)||1))">
                        <button class="mini-btn" onclick="window.stepSummonHp(${i},1)">+</button>
                    </div>
                </div>
                <div class="summon-stat-block">
                    <span class="summon-stat-label">Spd</span>
                    <input class="summon-stat-inp" type="text" style="width:52px;" value="${s.speed||''}" placeholder="30 ft"
                        oninput="window.updateSummonField(${i},'speed',this.value)">
                </div>
            </div>

            <div class="summon-section">
                <button class="summon-section-toggle" onclick="window.toggleSummonSection(this)">Ability Scores <span class="summon-toggle-arrow">▸</span></button>
                <div class="summon-section-body" style="display:none;">
                    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:4px;">
                        ${['str','dex','con','int','wis','cha'].map(ab => {
                            const score = s[ab] ?? 10;
                            const mod = Math.floor((score - 10) / 2);
                            const modStr = (mod >= 0 ? '+' : '') + mod;
                            return `<div style="text-align:center;background:var(--parchment);border:1px solid var(--gold);border-radius:4px;padding:4px 2px;">
                                <div style="font-size:0.7rem;font-weight:700;color:var(--ink-light);letter-spacing:0.05em;text-transform:uppercase;">${ab}</div>
                                <input type="number" min="1" max="30" value="${score}" style="width:38px;text-align:center;font-size:0.95rem;font-weight:700;border:none;background:transparent;padding:0;"
                                    oninput="window.updateSummonAbility(${i},'${ab}',parseInt(this.value)||10,this)">
                                <div class="summon-ab-mod" style="font-size:0.8rem;color:var(--ink-light);">${modStr}</div>
                            </div>`;
                        }).join('')}
                    </div>
                </div>
            </div>

            <div class="summon-section">
                <button class="summon-section-toggle" onclick="window.toggleSummonSection(this)">Abilities <span class="summon-toggle-arrow">▾</span></button>
                <div class="summon-section-body">
                    <div id="summon-abilities-${i}">${abilitiesHtml}</div>
                    <button class="add-feature-btn" style="margin-top:6px;" onclick="window.addCreatureAbility(${i})">+ Add Ability</button>
                </div>
            </div>

            <div class="summon-section">
                <button class="summon-section-toggle" onclick="window.toggleSummonSection(this)">Details <span class="summon-toggle-arrow">▾</span></button>
                <div class="summon-section-body">
                    <label class="summon-detail-label">Resistances</label>
                    <input class="summon-detail-inp" type="text" value="${(s.resistances||'').replace(/"/g,'&quot;')}" placeholder="e.g. Fire, Bludgeoning"
                        oninput="window.updateSummonField(${i},'resistances',this.value)">
                    <label class="summon-detail-label" style="margin-top:6px;">Vulnerabilities</label>
                    <input class="summon-detail-inp" type="text" value="${(s.vulnerabilities||'').replace(/"/g,'&quot;')}" placeholder="e.g. Cold"
                        oninput="window.updateSummonField(${i},'vulnerabilities',this.value)">
                    <label class="summon-detail-label" style="margin-top:6px;">Immunities</label>
                    <input class="summon-detail-inp" type="text" value="${(s.immunities||'').replace(/"/g,'&quot;')}" placeholder="e.g. Poison, Charmed"
                        oninput="window.updateSummonField(${i},'immunities',this.value)">
                    <label class="summon-detail-label" style="margin-top:6px;">Notes</label>
                    <textarea class="summon-notes" rows="2" placeholder="Additional notes..."
                        oninput="window.updateSummonField(${i},'notes',this.value)">${s.notes || ''}</textarea>
                </div>
            </div>
        `;
        container.appendChild(card);
    });
};

window.toggleSummonSection = function(btn) {
    const body = btn.nextElementSibling;
    const arrow = btn.querySelector('.summon-toggle-arrow');
    const collapsed = body.style.display === 'none';
    body.style.display = collapsed ? '' : 'none';
    if (arrow) arrow.textContent = collapsed ? '▾' : '▸';
};

window.addSummon = function() {
    summonsData.push({ name: 'New Creature', hp: 10, maxHp: 10, ac: 12, speed: '', notes: '', resistances: '', vulnerabilities: '', immunities: '', abilities: [], str: 10, dex: 10, con: 10, int: 10, wis: 10, cha: 10 });
    window.renderSummons();
    saveCharacter();
};

window.addCreatureAbility = function(i) {
    if (!summonsData[i]) return;
    if (!summonsData[i].abilities) summonsData[i].abilities = [];
    summonsData[i].abilities.push({ name: '', desc: '' });
    window.renderSummons();
    saveCharacter();
};

window.removeCreatureAbility = function(i, ai) {
    if (!summonsData[i]?.abilities) return;
    summonsData[i].abilities.splice(ai, 1);
    window.renderSummons();
    saveCharacter();
};

window.updateCreatureAbility = function(i, ai, field, val) {
    if (!summonsData[i]?.abilities?.[ai]) return;
    summonsData[i].abilities[ai][field] = val;
    saveCharacter();
};

window.openCreatureSearchAdd = async function() {
    // Creates a new summon slot then opens the picker to fill it
    window.addSummon();
    const newIdx = summonsData.length - 1;
    await window.openCreatureImportModal(newIdx, true);
};

window.openCreatureImportModal = async function(summonIdx, removeOnCancel = false) {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, 'readonly');
    const store = tx.objectStore(STORE_NAME);
    const data = await new Promise(resolve => {
        const req = store.get('currentData');
        req.onsuccess = () => resolve(req.result);
        req.onerror = () => resolve(null);
    });
    if (!data) return alert('No data loaded.');

    const monsters = [];
    data.forEach(file => {
        if (!file.name.toLowerCase().endsWith('.json')) return;
        try {
            const json = JSON.parse(file.content);
            if (json.monster) monsters.push(...json.monster);
        } catch(e) {}
    });
    if (!monsters.length) return alert('No monster data found in loaded files.');

    // Deduplicate — prefer MM then PHB then first
    const monMap = new Map();
    monsters.forEach(m => {
        if (!m?.name) return;
        const key = m.name.toLowerCase();
        if (!monMap.has(key)) monMap.set(key, m);
        else {
            const ex = monMap.get(key);
            if (m.source === 'MM' && ex.source !== 'MM') monMap.set(key, m);
        }
    });
    const sorted = Array.from(monMap.values()).sort((a,b) => a.name.localeCompare(b.name));

    let overlay = document.getElementById('creature-import-modal');
    if (overlay) overlay.remove();
    overlay = document.createElement('div');
    overlay.id = 'creature-import-modal';
    overlay.className = 'info-modal-overlay';
    overlay.style.display = 'flex';
    const onClose = () => {
        overlay.remove();
        if (removeOnCancel) { summonsData.splice(summonIdx, 1); window.renderSummons(); saveCharacter(); }
    };
    overlay.innerHTML = `
        <div class="info-modal-content" style="max-width:420px;max-height:85vh;display:flex;flex-direction:column;">
            <button class="close-modal-btn" id="creature-import-close">&times;</button>
            <h3 class="info-modal-title">Search Creatures</h3>
            <input id="creature-import-search" type="text" placeholder="Search monsters…"
                style="margin-bottom:8px;padding:6px 10px;border:1px solid var(--gold);border-radius:4px;font-size:0.9rem;background:var(--parchment);">
            <div id="creature-import-list" style="overflow-y:auto;flex:1;border:1px solid var(--gold);border-radius:4px;"></div>
        </div>`;
    document.body.appendChild(overlay);
    document.getElementById('creature-import-close').onclick = onClose;
    overlay.addEventListener('click', e => { if (e.target === overlay) onClose(); });

    const listEl = document.getElementById('creature-import-list');
    const searchEl = document.getElementById('creature-import-search');

    const renderList = (q) => {
        const filtered = q ? sorted.filter(m => m.name.toLowerCase().includes(q.toLowerCase())) : sorted;
        listEl.innerHTML = '';
        filtered.slice(0, 200).forEach(m => {
            const row = document.createElement('div');
            row.style.cssText = 'padding:7px 10px;cursor:pointer;border-bottom:1px solid var(--gold-light,#e8d9a0);font-size:0.9rem;';
            row.onmouseover = () => row.style.background = 'var(--parchment-dark)';
            row.onmouseout = () => row.style.background = '';
            const cr = m.cr ? (typeof m.cr === 'object' ? m.cr.cr : m.cr) : '?';
            row.innerHTML = `<strong>${m.name}</strong> <span style="color:var(--ink-light);font-size:0.8rem;">[CR ${cr}] ${m.source||''}</span>`;
            row.onclick = () => {
                window._importCreatureData(summonIdx, m);
                overlay.remove();
            };
            listEl.appendChild(row);
        });
        if (!listEl.children.length) listEl.innerHTML = '<div style="padding:10px;color:var(--ink-light);text-align:center;">No results</div>';
    };
    renderList('');
    searchEl.addEventListener('input', () => renderList(searchEl.value));
    searchEl.focus();
};

window._importCreatureData = function(i, m) {
    if (!summonsData[i]) return;
    const s = summonsData[i];
    s.name = m.name;

    // AC
    if (m.ac) {
        const acEntry = Array.isArray(m.ac) ? m.ac[0] : m.ac;
        s.ac = typeof acEntry === 'object' ? (acEntry.ac || acEntry.value || 10) : (parseInt(acEntry) || 10);
    }

    // HP
    if (m.hp) {
        const hp = typeof m.hp === 'object' ? (m.hp.average || m.hp.min || 1) : (parseInt(m.hp) || 1);
        s.hp = hp; s.maxHp = hp;
    }

    // Speed
    if (m.speed) {
        const spd = m.speed.walk || m.speed;
        s.speed = typeof spd === 'object' ? (spd.number ? `${spd.number} ft` : '') : (spd ? `${spd} ft` : '');
    }

    // Ability scores
    ['str','dex','con','int','wis','cha'].forEach(ab => {
        if (m[ab] !== undefined) s[ab] = parseInt(m[ab]) || 10;
    });

    // Resistances/Vulnerabilities/Immunities
    const joinDmg = arr => Array.isArray(arr) ? arr.map(x => typeof x === 'string' ? x : (x.resist || x.vulnerable || x.immune || JSON.stringify(x))).join(', ') : '';
    s.resistances = joinDmg(m.resist);
    s.vulnerabilities = joinDmg(m.vulnerable);
    s.immunities = joinDmg(m.immune);

    // Abilities from traits + actions
    s.abilities = [];
    const processEntryList = (list, tag) => {
        if (!Array.isArray(list)) return;
        list.forEach(entry => {
            if (!entry?.name) return;
            const rawDesc = window.processEntries ? window.processEntries(entry.entries || entry.entry || []) : '';
            const desc = window.cleanText ? window.cleanText(rawDesc) : rawDesc;
            s.abilities.push({ name: (tag ? `[${tag}] ` : '') + entry.name, desc });
        });
    };
    processEntryList(m.trait, '');
    processEntryList(m.action, 'Action');
    processEntryList(m.bonus, 'Bonus');
    processEntryList(m.reaction, 'Reaction');
    processEntryList(m.legendary, 'Legendary');

    window.renderSummons();
    saveCharacter();
};

window.deleteSummon = function(i) {
    summonsData.splice(i, 1);
    window.renderSummons();
    saveCharacter();
};

window.updateSummonField = function(i, field, val) {
    if (!summonsData[i]) return;
    summonsData[i][field] = val;
    saveCharacter();
};

window.updateSummonAbility = function(i, ab, val, inputEl) {
    if (!summonsData[i]) return;
    summonsData[i][ab] = val;
    saveCharacter();
    const mod = Math.floor((val - 10) / 2);
    const modEl = inputEl?.closest('div')?.querySelector('.summon-ab-mod');
    if (modEl) modEl.textContent = (mod >= 0 ? '+' : '') + mod;
};

window.stepSummonHp = function(i, delta) {
    if (!summonsData[i]) return;
    summonsData[i].hp = Math.max(0, Math.min(summonsData[i].maxHp, summonsData[i].hp + delta));
    window.renderSummons();
    saveCharacter();
};

// Auto-detect class resources from class table + known formulas
window.autoDetectClassResources = async function() {
    const charClass = document.getElementById('charClass')?.value?.trim();
    const level = parseInt(document.getElementById('level')?.value) || 1;
    if (!charClass) return;

    const defs = CLASS_RESOURCE_DEFS[charClass];
    if (!defs || defs.length === 0) {
        // Remove stale auto-detected resources from a prior class
        resourcesData = resourcesData.filter(r => !r.auto);
        renderResources();
        if (document.getElementById('mobile-resources-card')) window.renderMobileResources();
        saveCharacter();
        return;
    }

    const chaMod = Math.floor(((parseInt(document.getElementById('cha')?.value) || 10) - 10) / 2);
    const stripTag = s => s.replace(/\{@\w+\s*([^}]+)?\}/g, '$1').trim();

    // Load class data for colLabel lookups
    let classObj = null;
    if (window.isDataAvailable) {
        try {
            const db = await openDB();
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const allFiles = await new Promise(resolve => {
                const req = store.get('currentData');
                req.onsuccess = () => resolve(req.result || []);
                req.onerror = () => resolve([]);
            });
            allFiles.forEach(file => {
                if (!file.name.toLowerCase().endsWith('.json')) return;
                try {
                    const json = JSON.parse(file.content);
                    if (json.class) {
                        json.class.filter(c => c.name.toLowerCase() === charClass.toLowerCase()).forEach(m => {
                            if (!classObj) classObj = m;
                            else if (m.source === 'XPHB') classObj = m;
                            else if (m.source === 'PHB' && classObj.source !== 'XPHB') classObj = m;
                        });
                    }
                } catch (e) {}
            });
        } catch (e) {}
    }

    const getColValue = (regex) => {
        if (!classObj || !classObj.classTableGroups) return null;
        const li = level - 1;
        for (const group of classObj.classTableGroups) {
            if (!group.colLabels) continue;
            const ci = group.colLabels.findIndex(l => regex.test(stripTag(l)));
            if (ci !== -1 && group.rows && group.rows[li]) {
                const cell = group.rows[li][ci];
                const v = parseInt(typeof cell === 'object' ? (cell.value ?? cell) : cell);
                if (!isNaN(v)) return v;
            }
        }
        return null;
    };

    // Build set of expected auto resource names at this level
    const expectedNames = new Set();
    const updates = [];

    for (const def of defs) {
        if (def.levelMin && level < def.levelMin) continue;
        let maxVal = null;
        if (def.colLabel) maxVal = getColValue(def.colLabel);
        if (maxVal === null && def.formula) maxVal = def.formula(level, chaMod);
        if (maxVal === null || maxVal <= 0) continue;

        expectedNames.add(def.name);
        updates.push({ name: def.name, max: maxVal, reset: def.reset });
    }

    // Remove stale auto-detected resources (class changed or level too low)
    resourcesData = resourcesData.filter(r => !r.auto || expectedNames.has(r.name));

    // Add or update auto resources
    for (const upd of updates) {
        const existing = resourcesData.find(r => r.auto && r.name === upd.name);
        if (existing) {
            // Update max if it changed (preserve used count)
            if (existing.max !== upd.max) {
                existing.max = upd.max;
                if (existing.used > existing.max) existing.used = existing.max;
            }
            existing.reset = upd.reset;
        } else {
            // Check if user already manually added one with this name — don't duplicate
            const userHas = resourcesData.find(r => !r.auto && r.name === upd.name);
            if (!userHas) {
                resourcesData.unshift({ name: upd.name, max: upd.max, used: 0, reset: upd.reset, auto: true });
            }
        }
    }

    renderResources();
    if (document.getElementById('mobile-resources-card')) window.renderMobileResources();
    saveCharacter();
};

// Short rest: restore SR resources, re-render
/* ---- Rest Modals ---- */

function _getHitDieSize() {
    const hd = (document.getElementById('hitDice')?.value || '1d8').toLowerCase().trim();
    const m = /d(\d+)/.exec(hd);
    return m ? parseInt(m[1]) : 8;
}
function _getLevel() {
    return parseInt(document.getElementById('level')?.value) || 1;
}
function _availableHitDice() {
    return Math.max(0, _getLevel() - hitDiceUsed);
}

window.doShortRest = function() {
    let modal = document.getElementById('restModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'restModal';
        modal.className = 'info-modal-overlay';
        document.body.appendChild(modal);
    }
    const curHp = parseInt(document.getElementById('hp')?.value) || 0;
    const maxHp = parseInt(document.getElementById('maxHp')?.value) || 1;
    const avail = _availableHitDice();
    const dieSize = _getHitDieSize();
    const srRes = resourcesData.filter(r => r.reset === 'sr' || r.reset === 'both');
    modal.innerHTML = `
        <div class="info-modal-content" style="max-width:320px;">
            <button class="info-modal-close" onclick="document.getElementById('restModal').style.display='none'">×</button>
            <h3 class="info-modal-title">Short Rest</h3>
            <div style="display:flex; gap:12px; margin-bottom:16px;">
                <div style="text-align:center; flex:1;">
                    <div style="font-family:'Cinzel',serif; font-size:0.7rem; color:var(--ink-light); margin-bottom:4px;">HP</div>
                    <div style="font-family:'Cinzel',serif; font-size:1.1rem; font-weight:700;">${curHp} / ${maxHp}</div>
                </div>
                <div style="text-align:center; flex:1;">
                    <div style="font-family:'Cinzel',serif; font-size:0.7rem; color:var(--ink-light); margin-bottom:4px;">Hit Dice</div>
                    <div style="font-family:'Cinzel',serif; font-size:1.1rem; font-weight:700;">${avail} / ${_getLevel()} (d${dieSize})</div>
                </div>
            </div>
            <div style="margin-bottom:16px;">
                <label style="font-family:'Cinzel',serif; font-size:0.75rem; color:var(--ink-light); display:block; margin-bottom:6px;">HP GAINED (roll your dice, then enter total)</label>
                <div style="display:flex; align-items:center; gap:8px;">
                    <input id="srHpInput" type="number" min="0" value="0"
                        style="width:80px; padding:6px 8px; border:1px solid var(--gold); border-radius:4px; background:var(--parchment); font-family:'Cinzel',serif; font-size:1.1rem; font-weight:700; text-align:center;">
                    <span style="font-family:'Crimson Text',serif; font-size:0.9rem; color:var(--ink-light);">hit dice used:</span>
                    <input id="srHdInput" type="number" min="0" max="${avail}" value="0"
                        style="width:56px; padding:6px 8px; border:1px solid var(--gold); border-radius:4px; background:var(--parchment); font-family:'Cinzel',serif; font-size:1.1rem; font-weight:700; text-align:center;">
                </div>
            </div>
            ${srRes.length > 0 ? `<div style="font-size:0.82rem; color:var(--ink-light); margin-bottom:14px; font-style:italic; font-family:'Crimson Text',serif;">Restores: ${srRes.map(r => r.name).join(', ')}</div>` : ''}
            <div style="display:flex; gap:8px;">
                <button class="btn" style="flex:1;" onclick="window._applyShortRest()">Finish Rest</button>
                <button class="btn btn-secondary" style="flex:1;" onclick="document.getElementById('restModal').style.display='none'">Cancel</button>
            </div>
        </div>`;
    modal.style.display = 'flex';
};

window._applyShortRest = function() {
    // Apply HP gain
    const hpGained = parseInt(document.getElementById('srHpInput')?.value) || 0;
    const hdUsedNow = parseInt(document.getElementById('srHdInput')?.value) || 0;
    if (hpGained > 0) {
        const hpEl = document.getElementById('hp');
        const maxHp = parseInt(document.getElementById('maxHp')?.value) || 1;
        if (hpEl) hpEl.value = Math.min(maxHp, (parseInt(hpEl.value) || 0) + hpGained);
        if (window.updateHpBar) window.updateHpBar();
    }
    hitDiceUsed = Math.min(_getLevel(), hitDiceUsed + hdUsedNow);
    // Restore SR resources
    resourcesData.forEach(r => { if (r.reset === 'sr' || r.reset === 'both') r.used = 0; });
    renderResources();
    if (document.getElementById('mobile-resources-card')) window.renderMobileResources();
    saveCharacter();
    document.getElementById('restModal').style.display = 'none';
};

window.doLongRest = function() {
    const maxHp = parseInt(document.getElementById('maxHp')?.value) || 1;
    let modal = document.getElementById('restModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'restModal';
        modal.className = 'info-modal-overlay';
        document.body.appendChild(modal);
    }
    modal.innerHTML = `
        <div class="info-modal-content" style="max-width:300px;">
            <button class="info-modal-close" onclick="document.getElementById('restModal').style.display='none'">×</button>
            <h3 class="info-modal-title">Long Rest</h3>
            <div style="margin-bottom:18px; display:flex; flex-direction:column; gap:10px;">
                <div style="display:flex; align-items:center; gap:10px; font-family:'Crimson Text',serif; font-size:1rem;">
                    <span style="color:var(--green,#3a7a3a); font-size:1.1rem;">✓</span>
                    <span>HP restored to <strong>${maxHp}</strong></span>
                </div>
                <div style="display:flex; align-items:center; gap:10px; font-family:'Crimson Text',serif; font-size:1rem;">
                    <span style="color:var(--green,#3a7a3a); font-size:1.1rem;">✓</span>
                    <span>All spell slots restored</span>
                </div>
                <div style="display:flex; align-items:center; gap:10px; font-family:'Crimson Text',serif; font-size:1rem;">
                    <span style="color:var(--green,#3a7a3a); font-size:1.1rem;">✓</span>
                    <span>All resources restored</span>
                </div>
            </div>
            <div style="display:flex; gap:8px;">
                <button class="btn" style="flex:1;" onclick="window._applyLongRest()">Take Long Rest</button>
                <button class="btn btn-secondary" style="flex:1;" onclick="document.getElementById('restModal').style.display='none'">Cancel</button>
            </div>
        </div>`;
    modal.style.display = 'flex';
};

window._applyLongRest = function() {
    const maxHp = parseInt(document.getElementById('maxHp')?.value) || 1;
    const hpEl = document.getElementById('hp');
    if (hpEl) hpEl.value = maxHp;
    if (window.updateHpBar) window.updateHpBar();
    spellSlotsData.forEach(s => s.used = 0);
    renderSpellSlots();
    resourcesData.forEach(r => r.used = 0);
    renderResources();
    if (document.getElementById('mobile-resources-card')) window.renderMobileResources();
    saveCharacter();
    document.getElementById('restModal').style.display = 'none';
};

// Adjust max pips for fixed custom resources
window.adjustMobileResourceMax = function(index, delta) {
    const res = resourcesData[index];
    if (!res || res.auto) return;
    const newMax = Math.max(1, (res.fixedMax ?? res.max) + delta);
    res.fixedMax = newMax;
    res.max = newMax;
    if (res.used > res.max) res.used = res.max;
    renderResources();
    window.renderMobileResources();
    saveCharacter();
};

// Mobile pip toggle
window.toggleMobileResourcePip = function(index, pipIndex) {
    const res = resourcesData[index];
    if (!res) return;
    if (pipIndex < res.used) res.used = pipIndex;
    else res.used = pipIndex + 1;
    renderResources();
    window.renderMobileResources();
    saveCharacter();
};

// Mobile stepper (+/-)
window.stepMobileResource = function(index, delta) {
    const res = resourcesData[index];
    if (!res) return;
    res.used = Math.max(0, Math.min(res.max, (res.used || 0) + delta));
    renderResources();
    window.renderMobileResources();
    saveCharacter();
};

// Add a custom resource from mobile UI
window.addCustomResourceMobile = function() {
    resourcesData.push({ name: 'New Resource', max: 3, used: 0, reset: 'lr', auto: false });
    renderResources();
    window.renderMobileResources();
    saveCharacter();
};

// Delete a resource from mobile UI
window.deleteMobileResource = function(index) {
    resourcesData.splice(index, 1);
    renderResources();
    window.renderMobileResources();
    saveCharacter();
};

// Rename resource from mobile UI
window.renameMobileResource = function(index, val) {
    if (resourcesData[index]) { resourcesData[index].name = val; saveCharacter(); }
};

// Change reset type from mobile UI
window.setMobileResourceReset = function(index, val) {
    if (resourcesData[index]) { resourcesData[index].reset = val; window.renderMobileResources(); saveCharacter(); }
};

// Compute a resource's effective max from its formulaKey
window.computeResourceMax = function(res) {
    if (!res.formulaKey || res.formulaKey === 'fixed') return res.fixedMax ?? res.max;
    const opt = RESOURCE_FORMULA_OPTS.find(o => o.key === res.formulaKey);
    return (opt && opt.compute) ? Math.max(1, opt.compute()) : (res.fixedMax ?? res.max);
};

// Re-run formula for all formula-driven resources after stat changes
window.recomputeResourceMaxes = function() {
    let changed = false;
    resourcesData.forEach(res => {
        if (!res.formulaKey || res.formulaKey === 'fixed') return;
        const newMax = window.computeResourceMax(res);
        if (newMax !== res.max) {
            res.max = newMax;
            if (res.used > res.max) res.used = res.max;
            changed = true;
        }
    });
    if (changed) {
        renderResources();
        if (document.getElementById('mobile-resources-card')) window.renderMobileResources();
        saveCharacter();
    }
};

// Open resource settings modal (formula + fixed max adjuster)
window.openResourceSettingsModal = function(index) {
    const res = resourcesData[index];
    if (!res) return;
    const currentKey = res.formulaKey || 'fixed';
    const currentFixed = res.fixedMax ?? res.max;
    const optHtml = RESOURCE_FORMULA_OPTS.map(o =>
        `<option value="${o.key}" ${currentKey === o.key ? 'selected' : ''}>${o.label}</option>`
    ).join('');
    const preview = window.computeResourceMax(res);

    let modal = document.getElementById('resFormulaModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'resFormulaModal';
        modal.className = 'info-modal-overlay';
        document.body.appendChild(modal);
    }
    modal.dataset.resIndex = index;
    modal.innerHTML = `
        <div class="info-modal-content" style="max-width:320px;">
            <button class="info-modal-close" onclick="document.getElementById('resFormulaModal').style.display='none'">×</button>
            <h3 class="info-modal-title">${res.name} — Settings</h3>
            <div class="field" style="margin-bottom:10px;">
                <span class="field-label">Max Pips Formula</span>
                <select id="resFormulaSelect" style="width:100%; margin-top:4px; padding:6px; border:1px solid var(--gold); border-radius:4px; background:var(--parchment); font-size:0.9rem;">
                    ${optHtml}
                </select>
            </div>
            <div id="resFixedRow" style="display:${currentKey === 'fixed' ? 'flex' : 'none'}; align-items:center; gap:10px; margin-bottom:10px;">
                <span style="font-family:'Cinzel',serif; font-size:0.8rem; color:var(--ink); white-space:nowrap;">Fixed max:</span>
                <button class="mini-btn" id="resFixedMinus">−</button>
                <span id="resFixedVal" style="font-family:'Cinzel',serif; font-size:1rem; font-weight:700; min-width:24px; text-align:center;">${currentFixed}</span>
                <button class="mini-btn" id="resFixedPlus">+</button>
            </div>
            <div style="font-size:0.85rem; color:var(--ink-light); margin-bottom:16px;">
                Computed value: <strong id="resFormulaPreview">${preview}</strong>
            </div>
            <div style="margin-bottom:12px;">
                <span class="field-label">Resets on</span>
                <select id="resResetSelect" style="width:100%; margin-top:4px; padding:6px; border:1px solid var(--gold); border-radius:4px; background:var(--parchment); font-size:0.9rem;">
                    <option value="lr" ${(res.reset||'lr')==='lr'?'selected':''}>Long Rest</option>
                    <option value="sr" ${res.reset==='sr'?'selected':''}>Short Rest</option>
                    <option value="both" ${res.reset==='both'?'selected':''}>Both Rests</option>
                </select>
            </div>
            <div style="display:flex; gap:8px;">
                <button class="btn" style="flex:1;" onclick="window.applyResourceFormula()">Apply</button>
                <button class="btn btn-secondary" style="flex:1;" onclick="document.getElementById('resFormulaModal').style.display='none'">Cancel</button>
            </div>
        </div>`;

    // Live preview
    let fixedVal = currentFixed;
    const selEl = modal.querySelector('#resFormulaSelect');
    const previewEl = modal.querySelector('#resFormulaPreview');
    const fixedRow = modal.querySelector('#resFixedRow');
    const fixedValEl = modal.querySelector('#resFixedVal');

    selEl.addEventListener('change', function() {
        const key = this.value;
        const opt = RESOURCE_FORMULA_OPTS.find(o => o.key === key);
        const val = (opt && opt.compute) ? Math.max(1, opt.compute()) : fixedVal;
        previewEl.textContent = val;
        fixedRow.style.display = key === 'fixed' ? 'flex' : 'none';
    });
    modal.querySelector('#resFixedMinus').addEventListener('click', () => {
        fixedVal = Math.max(1, fixedVal - 1);
        fixedValEl.textContent = fixedVal;
        if (selEl.value === 'fixed') previewEl.textContent = fixedVal;
    });
    modal.querySelector('#resFixedPlus').addEventListener('click', () => {
        fixedVal = fixedVal + 1;
        fixedValEl.textContent = fixedVal;
        if (selEl.value === 'fixed') previewEl.textContent = fixedVal;
    });

    window.applyResourceFormula = function() {
        const idx = parseInt(modal.dataset.resIndex);
        const r = resourcesData[idx];
        if (!r) return;
        const key = selEl.value;
        r.formulaKey = key;
        r.fixedMax = fixedVal;
        r.reset = modal.querySelector('#resResetSelect').value;
        if (key === 'fixed') {
            r.max = fixedVal;
        } else {
            r.max = window.computeResourceMax(r);
        }
        if (r.used > r.max) r.used = r.max;
        modal.style.display = 'none';
        renderResources();
        window.renderMobileResources();
        saveCharacter();
    };

    modal.style.display = 'flex';
};

// Render mobile resources card into #mobile-resources-card
window.renderMobileResources = function() {
    const card = document.getElementById('mobile-resources-card');
    if (!card) return;

    if (resourcesData.length === 0) {
        card.innerHTML = `
            <div class="res-card-header">
                <span class="res-card-title">Resources</span>
                <button class="res-add-btn" onclick="window.addCustomResourceMobile()">+ Add</button>
            </div>
            <div style="color:var(--ink-light); font-style:italic; font-size:0.82rem; padding:8px 0;">No resources yet. Add a custom one or level up to auto-detect class resources.</div>`;
        return;
    }

    let rowsHtml = '';
    resourcesData.forEach((res, i) => {
        const effectiveMax = window.computeResourceMax(res);
        const usePips = effectiveMax <= 10;
        const resetLabel = res.reset === 'sr' ? 'Short Rest' : res.reset === 'both' ? 'Both Rests' : 'Long Rest';
        const resetClass = res.reset === 'sr' ? 'res-badge-sr' : res.reset === 'both' ? 'res-badge-both' : 'res-badge-lr';
        const hasFormula = res.formulaKey && res.formulaKey !== 'fixed';

        let inputHtml = '';
        if (usePips) {
            let pips = '';
            for (let p = 0; p < effectiveMax; p++) {
                const filled = p < res.used ? 'filled' : '';
                pips += `<div class="res-pip ${filled}" onclick="window.toggleMobileResourcePip(${i}, ${p})"></div>`;
            }
            inputHtml = `<div class="res-pips-row"><div class="res-pips">${pips}</div></div>`;
        } else {
            inputHtml = `<div class="res-stepper">
                <button class="res-step-btn" onclick="window.stepMobileResource(${i}, 1)">−</button>
                <span class="res-step-val">${effectiveMax - res.used}</span>
                <span class="res-step-sep">/</span>
                <span class="res-step-max">${effectiveMax}</span>
                <button class="res-step-btn" onclick="window.stepMobileResource(${i}, -1)">+</button>
            </div>`;
        }

        const actionBtns = `<div style="position:absolute;top:4px;right:4px;display:flex;gap:4px;z-index:10;">
                ${res.auto ? '<span class="res-auto-tag" title="Auto-detected from class" style="font-size:0.6rem;padding-top:3px;">auto</span>' : ''}
                <button class="res-settings-btn" onclick="window.openResourceSettingsModal(${i})" title="Settings">⚙</button>
                <button class="res-del-btn" style="position:static;" onclick="window.deleteMobileResource(${i})">×</button>
               </div>`;
        rowsHtml += `<div class="res-row">
            ${actionBtns}
            <div class="res-row-top">
                <input class="res-name-inp" value="${res.name.replace(/"/g, '&quot;')}" onchange="window.renameMobileResource(${i}, this.value)" />
                <span class="res-badge ${resetClass}">${resetLabel}</span>
            </div>
            ${inputHtml}
        </div>`;
    });

    card.innerHTML = `
        <div class="res-card-header">
            <span class="res-card-title">Resources</span>
            <button class="res-add-btn" onclick="window.addCustomResourceMobile()">+ Add</button>
        </div>
        ${rowsHtml}`;
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
  
  const hasNotes = !!(data && data.description && data.description.length > 0);
  const noteBtnClass = hasNotes ? "note-btn has-notes" : "note-btn";

  row.innerHTML = `<div class="drag-handle">☰</div><div class="spell-col-prep" style="${prepVisibility}"><span class="mobile-label">Prep</span><input type="checkbox" class="spell-check spell-prep" title="Prepared" ${isPrep ? "checked" : ""}></div><input type="number" class="spell-input spell-lvl" value="${lvl}" placeholder="Lvl" style="text-align:center;"><div class="spell-name-cell"><input type="text" class="spell-input spell-name" value="${data ? data.name : ""}" placeholder="Spell Name"><span class="spell-roll-tag"></span></div><input type="text" class="spell-input spell-time" value="${data ? data.time : ""}" placeholder="1 Act"><input type="text" class="spell-input spell-range" value="${data ? data.range : ""}" placeholder="60 ft"><div class="spell-col-ritual"><span class="mobile-label">Ritual</span><input type="checkbox" class="spell-check spell-ritual" title="Ritual" ${rChecked}></div><div class="spell-col-conc"><span class="mobile-label">Conc</span><input type="checkbox" class="spell-check spell-conc" title="Concentration" ${cChecked}></div><div class="spell-col-mat"><span class="mobile-label">Mat</span><input type="checkbox" class="spell-check spell-mat" title="Material" ${mChecked}></div><input type="hidden" class="spell-desc"><button class="${noteBtnClass}" onclick="openSpellNoteEditor(this)" title="Edit Description">📝</button><button class="delete-feature-btn" onclick="this.parentElement.remove(); saveCharacter()">×</button>`;
  // Set description via .value (not in the attribute) so HTML content is stored verbatim
  row.querySelector('.spell-desc').value = (data && data.description) ? data.description : '';
  row.dataset.atkType = (data && data.attackType) ? data.attackType : '';
  row.dataset.saveAbility = (data && data.saveAbility) ? data.saveAbility : '';

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
  if (window.updateSpellRollTags) window.updateSpellRollTags();
  saveCharacter();
};

const _SPELL_ABILITY_ABBR = { str: 'STR', dex: 'DEX', con: 'CON', int: 'INT', wis: 'WIS', cha: 'CHA' };
const _SPELL_SAVE_PATTERN = /\b(strength|dexterity|constitution|intelligence|wisdom|charisma)\s+saving throw/i;
const _SPELL_ATK_PATTERN = /\b(ranged|melee)\s+spell\s+attack/i;
const _SAVE_NAME_MAP = { strength:'str', dexterity:'dex', constitution:'con', intelligence:'int', wisdom:'wis', charisma:'cha' };

window.updateSpellRollTags = function() {
    const atkRaw = parseInt(document.getElementById('spellAttackBonus')?.value) || 0;
    const atkStr = atkRaw >= 0 ? `+${atkRaw}` : `${atkRaw}`;
    const dc = parseInt(document.getElementById('spellDC')?.value) || 10;
    document.querySelectorAll('.spell-row').forEach(row => {
        const tag = row.querySelector('.spell-roll-tag');
        if (!tag) return;
        let atkType = row.dataset.atkType || '';
        let saveAb = row.dataset.saveAbility || '';
        // Fallback: parse description if no stored data
        if (!atkType && !saveAb) {
            const desc = (row.querySelector('.spell-desc')?.value || '').toLowerCase();
            const atkMatch = _SPELL_ATK_PATTERN.exec(desc);
            if (atkMatch) {
                atkType = atkMatch[1][0].toUpperCase(); // 'R' or 'M'
            } else {
                const saveMatch = _SPELL_SAVE_PATTERN.exec(desc);
                if (saveMatch) saveAb = _SAVE_NAME_MAP[saveMatch[1].toLowerCase()] || '';
            }
        }
        if (atkType) {
            tag.textContent = `Hit ${atkStr}`;
            tag.className = 'spell-roll-tag spell-roll-atk';
        } else if (saveAb) {
            const abbr = _SPELL_ABILITY_ABBR[saveAb] || saveAb.toUpperCase().slice(0, 3);
            tag.textContent = `${abbr} ${dc}`;
            tag.className = 'spell-roll-tag spell-roll-save';
        } else {
            tag.textContent = '';
            tag.className = 'spell-roll-tag';
        }
    });
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
    experience: document.getElementById("experience").value,
    str: document.getElementById("str").value,
    dex: document.getElementById("dex").value,
    con: document.getElementById("con").value,
    int: document.getElementById("int").value,
    wis: document.getElementById("wis").value,
    cha: document.getElementById("cha").value,
    baseAC: document.getElementById("baseAC")?.value || "10",
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
    resistances: document.getElementById("resistances")?.value || '',
    immunities: document.getElementById("immunities")?.value || '',
    vulnerabilities: document.getElementById("vulnerabilities")?.value || '',
    resourcesData: resourcesData,
    summonsData: summonsData,
    classes: window.characterClasses,

    weapons: Array.from(document.querySelectorAll(".weapon-item")).map(
      (item) => ({
        name: item.querySelector(".weapon-name").value,
        atk: item.querySelector(".weapon-atk").value,
        damage: item.querySelector(".weapon-damage").value,
        notes: item.querySelector(".weapon-notes").value,
        formulaData: item.dataset.wformula ? JSON.parse(item.dataset.wformula) : null,
        customWeapon: item.querySelector(".weapon-name")?.dataset.customWeapon === "1" || undefined,
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
    inventory: safeInventoryMap("#inventoryList .inventory-item, #equippedList .inventory-item"),
    componentPouch: safeInventoryMap("#componentPouchList .inventory-item"),

    attunement: [
      document.getElementById("attune1").value,
      document.getElementById("attune2").value,
      document.getElementById("attune3").value,
    ],
    spellSlotsData: spellSlotsData,
    hitDiceUsed: hitDiceUsed,
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
      attackType: row.dataset.atkType || '',
      saveAbility: row.dataset.saveAbility || '',
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
      attackType: row.dataset.atkType || '',
      saveAbility: row.dataset.saveAbility || '',
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
      attackType: row.dataset.atkType || '',
      saveAbility: row.dataset.saveAbility || '',
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
    skillExpertise,
    saveExpertise,
    deathSaves,
    advantageState,
    currentTheme: document.body.className.replace(/\bapp-view-active\b/g, '').trim(),
    activeTab: document.querySelector(".tab-content.active")?.id,
    featuresFilter: window._featuresFilter || 'all',
    attacksPerAction: document.getElementById('attacksPerAction')?.value || '1',
  };
  localStorage.setItem("dndCharacter", JSON.stringify(characterData));

  // Refresh auto-spell entries in actions view (both full sheet and mobile)
  if (window.refreshSpellsInActionsView) {
      window.refreshSpellsInActionsView();
  }

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

window.openShareModal = function() {
    let modal = document.getElementById('shareModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'shareModal';
        modal.className = 'info-modal-overlay';
        modal.onclick = e => { if (e.target === modal) modal.style.display = 'none'; };
        document.body.appendChild(modal);
    }
    modal.innerHTML = `
        <div class="info-modal-content" style="max-width:320px;">
            <button class="info-modal-close" onclick="document.getElementById('shareModal').style.display='none'">×</button>
            <h3 class="info-modal-title">Share / Export</h3>
            <div style="display:flex; flex-direction:column; gap:10px; margin-top:4px;">
                <button class="btn" style="text-align:left; height:auto; padding:10px 14px;" onclick="window.downloadJSON(); document.getElementById('shareModal').style.display='none'">
                    <div style="font-weight:700;">📥 Download JSON</div>
                    <div style="font-size:0.78rem; font-weight:400; color:var(--parchment); opacity:0.85; margin-top:2px;">Save all character data as a file you can reload later</div>
                </button>
                <button class="btn" style="text-align:left; height:auto; padding:10px 14px;" onclick="window.printCharacterSheet(); document.getElementById('shareModal').style.display='none'">
                    <div style="font-weight:700;">🖨️ Print / Save as PDF</div>
                    <div style="font-size:0.78rem; font-weight:400; color:var(--parchment); opacity:0.85; margin-top:2px;">Opens a compact print-ready sheet (~3 pages) — use browser Print → Save as PDF</div>
                </button>
            </div>
        </div>`;
    modal.style.display = 'flex';
};

window.printCharacterSheet = function() {
    saveCharacter();
    const raw = localStorage.getItem('dndCharacter');
    if (!raw) return;
    const d = JSON.parse(raw);

    const v = (id, fallback = '') => {
        const el = document.getElementById(id);
        return el ? (el.value || fallback) : fallback;
    };
    const mod = score => {
        const n = parseInt(score) || 10;
        const m = Math.floor((n - 10) / 2);
        return (m >= 0 ? '+' : '') + m;
    };
    const pct = (used, total) => total > 0 ? Math.round((used / total) * 100) : 0;
    const pip = (used, total) => {
        let s = '';
        for (let i = 0; i < total; i++) s += i < used ? '●' : '○';
        return s || '—';
    };

    const stats = ['str','dex','con','int','wis','cha'];
    const statLabels = ['STR','DEX','CON','INT','WIS','CHA'];
    const saveNames = ['Strength','Dexterity','Constitution','Intelligence','Wisdom','Charisma'];
    const skillList = [
        {name:'Acrobatics', stat:'dex'}, {name:'Animal Handling', stat:'wis'}, {name:'Arcana', stat:'int'},
        {name:'Athletics', stat:'str'}, {name:'Deception', stat:'cha'}, {name:'History', stat:'int'},
        {name:'Insight', stat:'wis'}, {name:'Intimidation', stat:'cha'}, {name:'Investigation', stat:'int'},
        {name:'Medicine', stat:'wis'}, {name:'Nature', stat:'int'}, {name:'Perception', stat:'wis'},
        {name:'Performance', stat:'cha'}, {name:'Persuasion', stat:'cha'}, {name:'Religion', stat:'int'},
        {name:'Sleight of Hand', stat:'dex'}, {name:'Stealth', stat:'dex'}, {name:'Survival', stat:'wis'},
    ];

    const pb = parseInt(d.profBonus) || 2;
    const statVals = {};
    stats.forEach(s => { statVals[s] = parseInt(d[s]) || 10; });
    const modVal = s => Math.floor((statVals[s] - 10) / 2);

    const saveProfs = d.savingThrows || {};
    const saveExps = d.savingThrowsExpertise || {};
    const skillProfs = d.skills || {};
    const skillExps = d.skillsExpertise || {};
    const advStates = d.advantageState || {};

    const skillBonus = skill => {
        const base = modVal(skill.stat);
        const prof = skillProfs[skill.name] ? (skillExps[skill.name] ? pb * 2 : pb) : 0;
        const total = base + prof;
        return (total >= 0 ? '+' : '') + total;
    };
    const saveBonus = (stat, i) => {
        const base = modVal(stat);
        const prof = saveProfs[saveNames[i]] ? pb : 0;
        const total = base + prof;
        return (total >= 0 ? '+' : '') + total;
    };

    const skillHalf = Math.ceil(skillList.length / 2);
    const skillsCol1 = skillList.slice(0, skillHalf);
    const skillsCol2 = skillList.slice(skillHalf);
    const skillRow = skill => {
        const isProf = !!skillProfs[skill.name];
        const isExp = isProf && !!skillExps[skill.name];
        const hasAdv = !!(advStates.skills && advStates.skills[skill.name]);
        const badge = isExp ? 'EXP' : isProf ? 'PROF' : '';
        const advMark = hasAdv ? ' ▲' : '';
        return `<tr><td class="pip">${badge}</td><td>${skill.name}${advMark}</td><td class="right">${skillBonus(skill)}</td></tr>`;
    };

    const resources = (d.resourcesData || []).map(r => {
        const max = r.max || 0;
        return `<tr><td>${r.name}</td><td class="right">${pip(r.used, max)}</td><td class="center">${r.reset === 'sr' ? 'SR' : r.reset === 'both' ? 'SR/LR' : 'LR'}</td></tr>`;
    }).join('') || '<tr><td colspan="3" class="muted">—</td></tr>';

    const weapons = (d.weapons || []).map(w =>
        `<tr><td>${w.name || '—'}</td><td class="center">${w.atk || '—'}</td><td class="center">${w.damage || '—'}</td><td>${w.notes || ''}</td></tr>`
    ).join('') || '<tr><td colspan="4" class="muted">—</td></tr>';

    const renderFeatureList = arr => (arr || []).map(f =>
        `<div class="feature"><span class="fname">${f.title || ''}</span>${f.desc ? ': <span class="fdesc">' + f.desc.replace(/<[^>]+>/g, ' ').substring(0, 200) + (f.desc.length > 200 ? '…' : '') + '</span>' : ''}</div>`
    ).join('');

    const allFeatures = [
        ...(d.classFeatures || []), ...(d.raceFeatures || []),
        ...(d.backgroundFeatures || []), ...(d.feats || [])
    ];

    const actionList = type => (d[type] || []).map(f => `<span class="atag">${f.title}</span>`).join(' ');

    const slots = (d.spellSlotsData || []).map(s =>
        `<span class="slot-entry">Lv${s.level}: ${pip(s.used, s.total)} (${s.total - s.used}/${s.total})</span>`
    ).join('  ');

    const cantrips = (d.cantripsList || []).map(c => c.name).filter(Boolean).join(', ');

    const spellsByLevel = {};
    [...(d.preparedSpells || []), ...(d.unpreparedSpells || [])].forEach(s => {
        const lv = parseInt(s.level) || 0;
        if (!spellsByLevel[lv]) spellsByLevel[lv] = [];
        spellsByLevel[lv].push(s);
    });
    const spellRows = Object.keys(spellsByLevel).sort((a,b) => a-b).map(lv => {
        const list = spellsByLevel[lv].map(s => {
            const prep = (d.preparedSpells || []).some(p => p.name === s.name) ? '★ ' : '';
            const conc = s.concentration ? ' [C]' : '';
            const rit = s.ritual ? ' [R]' : '';
            return `${prep}${s.name}${conc}${rit}`;
        }).join(', ');
        return `<tr><td class="center lv">Lv${lv}</td><td>${list}</td></tr>`;
    }).join('');

    const equipped = (d.inventory || []).filter(i => i.equipped);
    const backpack = (d.inventory || []).filter(i => !i.equipped);
    const invRow = i => `<tr><td>${i.name || ''}</td><td class="center">${i.qty || 1}</td><td class="right">${i.weight ? i.weight + ' lb' : '—'}</td></tr>`;

    const currency = ['pp','gp','ep','sp','cp'].map(c => d[c] ? `${d[c]} ${c.toUpperCase()}` : '').filter(Boolean).join('  ');

    const armorProfs = ['light','medium','heavy','shields'].filter(k => d['armor_' + k]).join(', ');
    const weaponProfs = (d.weaponProficiencies || []).join(', ');
    const tools = d.toolProficiencies || '';
    const langs = (d.languages || []).join(', ');

    const condList = (d.activeConditions || []).join(', ') || '—';

    const html = `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<title>${d.charName || 'Character'} — Character Sheet</title>
<style>
* { margin:0; padding:0; box-sizing:border-box; }
body { font-family: 'Georgia', serif; font-size: 9pt; color: #1a1008; background: white; }
h1 { font-family: 'Palatino Linotype', serif; font-size: 18pt; color: #6b1a1a; letter-spacing: 0.03em; border-bottom: 2px solid #8b6914; padding-bottom: 4px; margin-bottom: 2px; }
h2 { font-family: 'Palatino Linotype', serif; font-size: 9pt; color: #6b1a1a; text-transform: uppercase; letter-spacing: 0.08em; border-bottom: 1px solid #c8a830; padding-bottom: 2px; margin: 8px 0 4px; }
h3 { font-family: 'Palatino Linotype', serif; font-size: 8pt; font-weight: bold; color: #4a3000; text-transform: uppercase; letter-spacing: 0.05em; margin: 6px 0 3px; }
.page { width: 100%; padding: 14mm 14mm 10mm; page-break-after: always; }
.page:last-child { page-break-after: auto; }
.char-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 6px; }
.char-meta { font-size: 8pt; color: #5a4020; }
.char-meta span { margin-left: 12px; }
.cols2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
.cols3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 10px; }
.box { border: 1px solid #c8a830; border-radius: 3px; padding: 5px 7px; background: #fdf8ed; }
.stat-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 4px; margin-bottom: 6px; }
.stat-box { border: 1px solid #c8a830; border-radius: 3px; padding: 3px; text-align: center; background: #fdf8ed; }
.stat-label { font-size: 6.5pt; text-transform: uppercase; letter-spacing: 0.08em; color: #6b1a1a; font-weight: bold; }
.stat-val { font-size: 14pt; font-weight: bold; font-family: 'Palatino Linotype', serif; }
.stat-mod { font-size: 9pt; color: #6b1a1a; font-weight: bold; }
.combat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 5px; margin-bottom: 6px; }
.combat-box { border: 1px solid #c8a830; border-radius: 3px; padding: 3px 5px; text-align: center; background: #fdf8ed; }
.combat-label { font-size: 6pt; text-transform: uppercase; letter-spacing: 0.06em; color: #8b6914; }
.combat-val { font-size: 12pt; font-weight: bold; }
.hp-bar { width: 100%; height: 7px; background: #e8e0d0; border-radius: 3px; overflow: hidden; margin: 2px 0; }
.hp-fill { height: 100%; background: #8b1a1a; border-radius: 3px; }
table { width: 100%; border-collapse: collapse; font-size: 8pt; }
td, th { padding: 1.5px 4px; }
th { font-size: 7pt; text-transform: uppercase; letter-spacing: 0.05em; color: #6b1a1a; border-bottom: 1px solid #c8a830; font-weight: bold; }
tr:nth-child(even) td { background: #fdf8ed; }
td.right { text-align: right; }
td.center { text-align: center; }
td.pip { font-size: 7pt; color: #6b1a1a; width: 30px; }
td.lv { font-weight: bold; color: #6b1a1a; width: 30px; }
.muted { color: #999; font-style: italic; }
.save-row { display: flex; gap: 3px; flex-wrap: wrap; margin-bottom: 4px; }
.save-item { font-size: 7.5pt; border: 1px solid #c8a830; border-radius: 2px; padding: 1px 5px; background: #fdf8ed; white-space: nowrap; }
.save-item.prof { background: #6b1a1a; color: white; border-color: #6b1a1a; }
.save-item.exp { background: #3a1a6b; color: white; border-color: #3a1a6b; }
.feature { margin-bottom: 3px; font-size: 8pt; line-height: 1.3; }
.fname { font-weight: bold; color: #4a3000; }
.fdesc { color: #333; }
.slot-entry { font-size: 8pt; display: inline-block; margin-right: 8px; margin-bottom: 2px; }
.atag { display: inline-block; background: #fdf8ed; border: 1px solid #c8a830; border-radius: 2px; padding: 0 4px; font-size: 7.5pt; margin: 1px 2px; }
.section-note { font-size: 7.5pt; color: #666; font-style: italic; margin-bottom: 2px; }
.star { color: #6b1a1a; }
@media print {
    body { font-size: 9pt; }
    .page { padding: 10mm 12mm 8mm; }
    @page { margin: 0; size: letter; }
}
</style></head>
<body>

<!-- PAGE 1: Core Stats -->
<div class="page">
    <div class="char-header">
        <div>
            <h1>${d.charName || 'Unnamed Character'}</h1>
            <div class="char-meta">
                <span>${[d.race, d.charClass, d.charSubclass].filter(Boolean).join(' · ')}</span>
                <span>Level ${d.level || 1}</span>
                ${d.background ? `<span>· ${d.background}</span>` : ''}
                ${d.alignment ? `<span>· ${d.alignment}</span>` : ''}
                ${d.deity ? `<span>· Deity: ${d.deity}</span>` : ''}
            </div>
        </div>
        <div style="text-align:right; font-size:8pt; color:#8b6914;">
            ${d.experience ? `XP: ${d.experience}` : ''}
        </div>
    </div>

    <div class="stat-grid">
        ${stats.map((s,i) => `<div class="stat-box">
            <div class="stat-label">${statLabels[i]}</div>
            <div class="stat-val">${statVals[s]}</div>
            <div class="stat-mod">${mod(statVals[s])}</div>
        </div>`).join('')}
    </div>

    <div class="combat-grid">
        <div class="combat-box"><div class="combat-label">Armor Class</div><div class="combat-val">${d.ac || '—'}</div></div>
        <div class="combat-box"><div class="combat-label">Initiative</div><div class="combat-val">${mod(statVals['dex'])}</div></div>
        <div class="combat-box"><div class="combat-label">Speed</div><div class="combat-val">${d.speed || '—'}</div></div>
        <div class="combat-box"><div class="combat-label">Prof Bonus</div><div class="combat-val">+${pb}</div></div>
        <div class="combat-box" style="grid-column:span 2;">
            <div class="combat-label">Hit Points</div>
            <div class="combat-val">${d.hp || 0} / ${d.maxHp || 0}${d.tempHp ? ` (+${d.tempHp} temp)` : ''}</div>
            <div class="hp-bar"><div class="hp-fill" style="width:${pct(parseInt(d.hp)||0, parseInt(d.maxHp)||1)}%"></div></div>
        </div>
        <div class="combat-box"><div class="combat-label">Hit Dice</div><div class="combat-val" style="font-size:10pt;">${d.hitDice || '—'}</div></div>
        <div class="combat-box"><div class="combat-label">Atks / Action</div><div class="combat-val">${d.attacksPerAction || 1}</div></div>
    </div>
    ${condList !== '—' ? `<div style="font-size:7.5pt; margin-bottom:4px; color:#6b1a1a;"><b>Conditions:</b> ${condList}</div>` : ''}

    <div class="cols2">
        <div>
            <h2>Saving Throws</h2>
            <div class="save-row">
                ${stats.map((s,i) => {
                    const isProf = !!saveProfs[saveNames[i]];
                    const isExp = isProf && !!(saveExps[saveNames[i]] || saveExps[s]);
                    const hasAdv = !!(advStates.saves && advStates.saves[saveNames[i]]);
                    const cls = isExp ? 'save-item exp' : isProf ? 'save-item prof' : 'save-item';
                    const advMark = hasAdv ? ' ▲' : '';
                    return `<span class="${cls}">${statLabels[i]} ${saveBonus(s,i)}${advMark}</span>`;
                }).join('')}
            </div>
            <h2>Skills</h2>
            <div class="cols2" style="gap:0;">
                <table>
                    ${skillsCol1.map(skillRow).join('')}
                </table>
                <table>
                    ${skillsCol2.map(skillRow).join('')}
                </table>
            </div>
        </div>
        <div>
            <h2>Defenses</h2>
            <div class="box" style="margin-bottom:4px;">
                <div style="font-size:7.5pt;"><b>Resistances:</b> ${d.resistances || '—'}</div>
                <div style="font-size:7.5pt;"><b>Immunities:</b> ${d.immunities || '—'}</div>
                <div style="font-size:7.5pt;"><b>Vulnerabilities:</b> ${d.vulnerabilities || '—'}</div>
            </div>
            <h2>Proficiencies</h2>
            <div class="box" style="font-size:7.5pt; line-height:1.6;">
                ${armorProfs ? `<div><b>Armor:</b> ${armorProfs}</div>` : ''}
                ${weaponProfs ? `<div><b>Weapons:</b> ${weaponProfs}</div>` : ''}
                ${tools ? `<div><b>Tools:</b> ${tools}</div>` : ''}
                ${langs ? `<div><b>Languages:</b> ${langs}</div>` : ''}
            </div>
        </div>
    </div>
</div>

<!-- PAGE 2: Combat Abilities & Features -->
<div class="page">
    <h2>Weapon Attacks</h2>
    <table style="margin-bottom:6px;">
        <thead><tr><th>Weapon</th><th class="center">ATK</th><th class="center">Damage</th><th>Notes</th></tr></thead>
        <tbody>${weapons}</tbody>
    </table>

    ${(d.resourcesData || []).length > 0 ? `
    <h2>Class Resources</h2>
    <table style="margin-bottom:6px;">
        <thead><tr><th>Resource</th><th class="right">Slots</th><th class="center">Resets</th></tr></thead>
        <tbody>${resources}</tbody>
    </table>` : ''}

    <div class="cols3" style="margin-bottom:6px;">
        ${d.actions?.length ? `<div><h2>Actions</h2>${actionList('actions').split('</span>').join('</span><br>')}</div>` : ''}
        ${d.bonusActions?.length ? `<div><h2>Bonus Actions</h2>${actionList('bonusActions').split('</span>').join('</span><br>')}</div>` : ''}
        ${d.reactions?.length ? `<div><h2>Reactions</h2>${actionList('reactions').split('</span>').join('</span><br>')}</div>` : ''}
    </div>

    <h2>Features & Traits</h2>
    <div class="cols2">
        <div>${renderFeatureList([...(d.classFeatures||[]), ...(d.feats||[])])}</div>
        <div>${renderFeatureList([...(d.raceFeatures||[]), ...(d.backgroundFeatures||[])])}</div>
    </div>
</div>

<!-- PAGE 3: Spells, Inventory, Notes -->
<div class="page">
    ${(d.spellSlotsData || []).length > 0 || (d.cantripsList || []).length > 0 || (d.preparedSpells || []).length > 0 ? `
    <h2>Spells ${d.spellAbility ? `<span style="font-size:7.5pt; font-weight:400; text-transform:none;">(Casting stat: ${d.spellAbility})</span>` : ''}</h2>
    ${slots ? `<div style="margin-bottom:4px;">${slots}</div>` : ''}
    ${cantrips ? `<div style="font-size:8pt; margin-bottom:4px;"><b>Cantrips:</b> ${cantrips}</div>` : ''}
    ${spellRows ? `
    <div class="section-note"><span class="star">★</span> = Prepared &nbsp; [C] = Concentration &nbsp; [R] = Ritual</div>
    <table style="margin-bottom:8px;">
        <thead><tr><th>Lvl</th><th>Spells</th></tr></thead>
        <tbody>${spellRows}</tbody>
    </table>` : ''}` : ''}

    <div class="cols2">
        <div>
            <h2>Inventory</h2>
            ${equipped.length ? `<h3>Equipped</h3><table><thead><tr><th>Item</th><th class="center">Qty</th><th class="right">Wt</th></tr></thead><tbody>${equipped.map(invRow).join('')}</tbody></table>` : ''}
            ${backpack.length ? `<h3>Backpack</h3><table><thead><tr><th>Item</th><th class="center">Qty</th><th class="right">Wt</th></tr></thead><tbody>${backpack.map(invRow).join('')}</tbody></table>` : ''}
            ${currency ? `<div style="font-size:8pt; margin-top:4px;"><b>Currency:</b> ${currency}</div>` : ''}
        </div>
        <div>
            <h2>Notes</h2>
            ${d.personality ? `<div class="feature"><span class="fname">Personality:</span> ${d.personality}</div>` : ''}
            ${d.ideals ? `<div class="feature"><span class="fname">Ideals:</span> ${d.ideals}</div>` : ''}
            ${d.bonds ? `<div class="feature"><span class="fname">Bonds:</span> ${d.bonds}</div>` : ''}
            ${d.flaws ? `<div class="feature"><span class="fname">Flaws:</span> ${d.flaws}</div>` : ''}
            ${d.notes ? `<div class="feature"><span class="fname">Notes:</span> <span class="fdesc">${(d.notes || '').replace(/<[^>]+>/g,' ').substring(0,600)}</span></div>` : ''}
        </div>
    </div>
</div>

</body></html>`;

    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) { alert('Pop-up blocked — please allow pop-ups for this page.'); return; }
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 400);
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

  // Swap Scores Toggle
  const swapBtn = document.createElement("button");
  swapBtn.className = "sidebar-btn";
  swapBtn.id = "btn-swap-score";
  const isSwapped = document.body.classList.contains("swap-scores");
  swapBtn.innerText = isSwapped ? "Swap Score/Mod (On)" : "Swap Score/Mod";
  swapBtn.onclick = window.toggleScoreSwap;
  sidebarContent.appendChild(swapBtn);

  // Custom Data Manager Button
  const dataBtn = document.createElement("button");
  dataBtn.id = "btn-custom-data-manager";
  dataBtn.className = "sidebar-btn";
  dataBtn.innerText = "Custom Data / Templates";
  dataBtn.style.display = "none";
  dataBtn.onclick = () => {
    window.openCustomDataManager();
    window.toggleSidebar();
  };
  sidebarContent.appendChild(dataBtn);

  // Data Browser Button
  const browserBtn = document.createElement("button");
  browserBtn.id = "btn-data-browser";
  browserBtn.className = "sidebar-btn";
  browserBtn.innerText = "Data Browser";
  browserBtn.style.display = "none";
  browserBtn.onclick = () => {
    window.openDataBrowser();
    window.toggleSidebar();
  };
  sidebarContent.appendChild(browserBtn);

  if (actionsDiv) {
    Array.from(actionsDiv.children).forEach((child) => {
      // Move buttons/labels to sidebar
      child.classList.add("sidebar-btn");
      child.classList.remove("btn", "btn-secondary", "btn-danger");
      sidebarContent.appendChild(child);
    });
    actionsDiv.style.display = "none";
  }

  // Help & Guide button
  const helpBtn = document.createElement('button');
  helpBtn.className = 'sidebar-btn';
  helpBtn.innerText = 'Help & Guide';
  helpBtn.onclick = () => { window.openHelpPage(); window.toggleSidebar(); };
  sidebarContent.appendChild(helpBtn);
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

window.toggleScoreSwap = function () {
  document.body.classList.toggle("swap-scores");
  const isSwapped = document.body.classList.contains("swap-scores");
  localStorage.setItem("swapScores", isSwapped);
  
  const btn = document.getElementById("btn-swap-score");
  if (btn) btn.innerText = isSwapped ? "Swap Score/Mod (On)" : "Swap Score/Mod";

  window.toggleSidebar(); // Close sidebar
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

// Dynamically shorten Ability Score names on mobile or dense mode
window.updateResponsiveStatNames = function() {
    const isMobile = window.matchMedia('(max-width: 900px)').matches;
    const isDense = document.body.classList.contains('dense-mode');
    document.querySelectorAll('.stat-name').forEach(el => {
        if (!el.dataset.originalText) el.dataset.originalText = el.textContent.trim();
        if (isMobile || isDense) {
            el.textContent = el.dataset.originalText.substring(0, 3).toUpperCase();
        } else {
            el.textContent = el.dataset.originalText;
        }
    });
};
window.addEventListener('resize', window.updateResponsiveStatNames);

window.injectMobileModLabels = function() {
    // Stats
    document.querySelectorAll('.stat-card').forEach((card) => {
        const statNameEl = card.querySelector('.stat-name');
        if (!statNameEl) return;
        const ability = (statNameEl.dataset.originalText || statNameEl.textContent).trim().substring(0,3).toUpperCase();
        
        card.querySelectorAll('.skill-item').forEach(skill => {
            if (!skill.querySelector('.mobile-mod-label')) {
                const lbl = document.createElement('div');
                lbl.className = 'mobile-mod-label';
                lbl.textContent = ability;
                skill.appendChild(lbl);
            }
        });
    });

    // Global fallback for saves
    const abilitiesArr = ["str", "dex", "con", "int", "wis", "cha"];
    abilitiesArr.forEach(ab => {
        const check = document.getElementById(`saveCheck_${ab}`);
        if (check) {
            let item = check.closest('.skill-item');
            if (item && !item.querySelector('.mobile-mod-label')) {
                const lbl = document.createElement('div');
                lbl.className = 'mobile-mod-label';
                lbl.textContent = ab.toUpperCase();
                item.appendChild(lbl);
            }
        }
    });
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

    // Move Heroic Inspiration to Combat Stats
    const heroicInspiration = document.getElementById('heroicInspiration');
    if (heroicInspiration && combatStats) {
        const wrapper = heroicInspiration.closest('.combat-stat') || heroicInspiration.closest('.field');
        if (wrapper && !combatStats.contains(wrapper)) {
            move(wrapper, combatStats);
            
            // Place next to Proficiency Bonus if possible
            const profBonus = document.getElementById('profBonus');
            const profWrapper = profBonus ? (profBonus.closest('.combat-stat') || profBonus.closest('.field')) : null;
            if (profWrapper && combatStats.contains(profWrapper)) {
                profWrapper.parentNode.insertBefore(wrapper, profWrapper.nextSibling);
            }

            if (wrapper.classList.contains('field')) {
                wrapper.classList.add('combat-stat');
                wrapper.classList.remove('field');
                wrapper.dataset.wasField = 'true';
                wrapper.style.display = 'flex';
                wrapper.style.flexDirection = 'column';
                wrapper.style.alignItems = 'center';
                wrapper.style.justifyContent = 'center';
            }
        }
    }

    // Wrapper for HP and Death Saves
    const hpDeathWrapper = document.createElement('div');
    hpDeathWrapper.className = 'dense-hp-death-wrapper';
    combatArea.appendChild(hpDeathWrapper);

    const ddbHp = document.querySelector('.ddb-hp-box');
    if (ddbHp) move(ddbHp, hpDeathWrapper);

    const deathSavesBox = document.querySelector('.death-saves-box');
    if (deathSavesBox) move(deathSavesBox, hpDeathWrapper);

    // Hide Size Box
    const sizeField = document.getElementById('charSize')?.closest('.field');
    if (sizeField) {
        sizeField.style.display = 'none';
        sizeField.dataset.hiddenByDenseSize = 'true';
    }

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
    window.updateResponsiveStatNames();

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
    
    const defField = document.getElementById('resistances')?.closest('.field');
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
                
                const addWeaponBtn = document.querySelector('button[onclick="addWeapon()"]');
                if (addWeaponBtn) {
                    move(addWeaponBtn, actionSection);
                    if (weaponList.nextSibling) {
                        actionSection.insertBefore(addWeaponBtn, weaponList.nextSibling);
                    } else {
                        actionSection.appendChild(addWeaponBtn);
                    }
                    addWeaponBtn.classList.add('dense-add-weapon-btn');
                }
                
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

    // Move Resources to Tabs
    const resourcesContainer = document.getElementById('resourcesContainer');
    if (resourcesContainer) {
        const resourcesSection = resourcesContainer.closest('.sheet-section');
        if (resourcesSection) {
            // Create Tab Button
            const resTabBtn = document.createElement('div');
            resTabBtn.className = 'tab dense-generated-tab';
            resTabBtn.textContent = 'Resources';
            resTabBtn.setAttribute('onclick', "switchTab('dense-resources')");
            
            if (tabs) {
                tabs.appendChild(resTabBtn);
            }

            // Prepare Content
            resourcesSection.classList.add('tab-content');
            resourcesSection.id = 'dense-resources';
            
            move(resourcesSection, mainArea);
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
    window.updateResponsiveStatNames();

    const charNameInput = document.getElementById('charName');
    if (charNameInput) {
        const topSection = charNameInput.closest('.sheet-section');
        if (topSection && topSection.dataset.hiddenByDense === 'true') {
            topSection.style.display = '';
            delete topSection.dataset.hiddenByDense;
        }
    }

    // Restore Size Box
    const sizeField = document.getElementById('charSize')?.closest('.field');
    if (sizeField && sizeField.dataset.hiddenByDenseSize === 'true') {
        sizeField.style.display = '';
        delete sizeField.dataset.hiddenByDenseSize;
    }

    // Cleanup Action Tab
    const actionSection = document.getElementById('dense-actions');
    if (actionSection) {
        actionSection.classList.remove('tab-content');
        actionSection.classList.remove('active');
        actionSection.removeAttribute('id');
    }

    // Cleanup Resources Tab
    const resSection = document.getElementById('dense-resources');
    if (resSection) {
        resSection.classList.remove('tab-content');
        resSection.classList.remove('active');
        resSection.removeAttribute('id');
    }

    document.querySelectorAll('.dense-generated-tab').forEach(el => el.remove());
    document.querySelectorAll('.dense-attacks-header').forEach(el => el.remove());
    document.querySelectorAll('.dense-hp-death-wrapper').forEach(el => el.remove());

    // Restore all moved elements
    document.querySelectorAll('[data-original-parent]').forEach(el => {
        const ph = document.getElementById(el.dataset.originalParent);
        if (ph) {
            ph.parentNode.insertBefore(el, ph);
            ph.remove();
        }
        delete el.dataset.originalParent;

        if (el.dataset.wasField === 'true') {
            el.classList.add('field');
            el.classList.remove('combat-stat');
            el.style.display = '';
            el.style.flexDirection = '';
            el.style.alignItems = '';
            el.style.justifyContent = '';
            delete el.dataset.wasField;
        }
    });

    const hpDeathGrid = document.querySelector('.hp-death-grid');
    if (hpDeathGrid) hpDeathGrid.style.display = '';

    // Remove Labels
    document.querySelectorAll('.dense-ability-label').forEach(el => el.remove());
    document.querySelectorAll('.dense-add-weapon-btn').forEach(el => el.classList.remove('dense-add-weapon-btn'));

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

window.openHelpPage = function() {
    let modal = document.getElementById('helpModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'helpModal';
        modal.className = 'info-modal-overlay';
        modal.onclick = e => { if (e.target === modal) modal.style.display = 'none'; };
        modal.innerHTML = `
            <div class="help-modal-content">
                <div class="help-modal-header">
                    <h2 style="margin:0;font-family:'Cinzel',serif;font-size:1.2rem;color:var(--red-dark);">Character Sheet Guide</h2>
                    <button onclick="document.getElementById('helpModal').style.display='none'" style="background:none;border:none;font-size:1.8rem;cursor:pointer;color:var(--ink);line-height:1;padding:0;">&times;</button>
                </div>
                <div class="help-modal-body"></div>
            </div>`;
        document.body.appendChild(modal);
    }
    modal.querySelector('.help-modal-body').innerHTML = window._buildHelpContent();
    modal.style.display = 'flex';
};

window._buildHelpContent = function() {
    const renderSection = s => `
        <div class="help-section">
            <div class="help-section-title">${s.icon} ${s.title}</div>
            <div class="help-section-desc">${s.desc}</div>
            ${s.example ? `<div class="help-section-example">Example: ${s.example}</div>` : ''}
        </div>`;

    const renderGroup = (title, sections) => `
        <div class="help-group">
            <div class="help-group-title">${title}</div>
            ${sections.map(renderSection).join('')}
        </div>`;

    const groups = [
        {
            title: 'Navigation & Layout',
            sections: [
                {
                    icon: '🖥️',
                    title: 'Desktop vs Mobile',
                    desc: '<b>Full Sheet:</b> All sections visible at once in a multi-column layout. Best for desktops and editing.<br><b>Mobile/Tablet:</b> A <b>⊞ nav button</b> appears in the bottom-right — tap it to switch between focused views (Stats, Actions, Spells, etc.).<br><b>Swipe left or right</b> anywhere on a mobile/tablet view to move between nav views.<br><br><b>⚠️ Some edits (features, weapon details, armor training) can only be done in Full Sheet view.</b>',
                },
                {
                    icon: '📐',
                    title: 'Dense Mode',
                    desc: 'Toggle via <b>Menu → Toggle Dense View</b>. Replaces the top of the sheet with a compact header bar showing name, race/class, and level. Sections are tighter — useful for play when screen space is limited.',
                    example: 'Dense header: "Thorn — Half-Elf Ranger Lv 8"'
                },
            ]
        },
        {
            title: 'Combat',
            sections: [
                {
                    icon: '⚔️',
                    title: 'Combat Stats & HP',
                    desc: 'Track AC, Initiative (auto-calculated from DEX), Speed, HP, Temp HP, Hit Dice, and Proficiency Bonus.<br><br>Click <b>⚡</b> next to HP to open the HP manager. On mobile, tap the HP value directly.<br><br>The <b>Short Rest</b> and <b>Long Rest</b> buttons open a popup — Short Rest lets you enter HP gained from dice you roll physically; Long Rest fully restores HP, spell slots, and all resources.',
                    example: 'Fighter Lv 5: HP 44/52, AC 18, Speed 30ft.'
                },
                {
                    icon: '🗡️',
                    title: 'Weapon Attacks',
                    desc: 'Add weapons with attack bonus and damage. Each weapon has a <b>⚙ button</b> — click it to define <b>scaling formulas</b> for ATK and damage (e.g. STR mod, DEX mod + Prof Bonus) so values update automatically when your stats change.<br><br>On mobile/tablet, weapons appear as a compact reference card in the <b>Actions</b> view.',
                    example: 'Longsword: ATK formula = STR mod + Prof Bonus → auto-updates to +6 at level 5.'
                },
                {
                    icon: '✨',
                    title: 'Class Resources',
                    desc: 'Track named resources (Ki, Bardic Inspiration, Lay on Hands, etc.). Click pips to use/restore them.<br><br>Each resource has a <b>⚙ settings button</b> — use it to set a <b>scaling formula</b> for the max (e.g. Proficiency Bonus, Level, ability modifier) and set whether it resets on Short Rest, Long Rest, or both.<br><br>Common class resources (like Bardic Inspiration) are <b>auto-detected</b> from your class and level when data is loaded.',
                    example: 'Ki Points: formula = Level → auto-sets to 8 at level 8. Resets on Short Rest.'
                },
                {
                    icon: '⚡',
                    title: 'Action Economy',
                    desc: 'Add actions, bonus actions, and reactions. Spells with matching casting times appear automatically (e.g. "1 action" spells show under Actions). Tap any spell entry to expand its description.',
                    example: 'Actions: Attack ×2, Fireball. Bonus: Cunning Action. Reaction: Shield.'
                },
            ]
        },
        {
            title: 'Character',
            sections: [
                {
                    icon: '🎲',
                    title: 'Ability Scores',
                    desc: 'Enter a score — the modifier is calculated automatically. On mobile, use the <b>Stats</b> nav view.',
                    example: 'STR 18 → +4 modifier.'
                },
                {
                    icon: '🛡️',
                    title: 'Saving Throws & Skills',
                    desc: 'Click the <b>checkbox</b> next to a save or skill to mark proficiency. When proficient, an <b>E</b> button appears — click it to grant <b>Expertise</b> (double proficiency bonus).<br><br>The circular button cycles <b>advantage / disadvantage</b>.',
                    example: 'Stealth (DEX, prof + Expertise, PB+3): +2 DEX +6 = +8.'
                },
                {
                    icon: '📚',
                    title: 'Features & Traits',
                    desc: 'Add class features, species traits, background features, and feats. Filter by type using the pill buttons. Feature descriptions support a <b>rich HTML editor</b> (click the <b>📝</b> icon) for formatted text, bold, italic, tables, and links.',
                    example: 'Class: Second Wind. Species: Darkvision. Feat: Alert.'
                },
                {
                    icon: '📋',
                    title: 'Proficiencies',
                    desc: 'Armor Training checkboxes, Weapon Proficiency tags, Tool Proficiencies, and Languages. Accessible in the <b>Proficiencies</b> mobile nav view.',
                    example: 'Armor: Light, Medium, Shields. Languages: Common, Elvish.'
                },
            ]
        },
        {
            title: 'Spells & Magic',
            sections: [
                {
                    icon: '🔮',
                    title: 'Spells & Spell Slots',
                    desc: 'Add spells with level, casting time, range, and description. Check <b>Prep</b> to move a spell to your prepared list. Cantrips go in the Cantrips list.<br><br>Track spell slots with the visual slot tracker — click a slot to mark it used.',
                    example: 'Fireball: Lv 3, 1 action, 150ft. Slots: Lv3 ●●○'
                },
            ]
        },
        {
            title: 'Inventory & Notes',
            sections: [
                {
                    icon: '🎒',
                    title: 'Inventory',
                    desc: 'Track equipped items and backpack contents with name, qty, and weight. Check the equip box to move an item to Equipped.<br><br>Click <b>📝</b> on any item to open a <b>rich HTML editor</b> for formatted descriptions — bold, italic, links, tables, and more. The same editor is available on <b>feature descriptions</b> and <b>notes fields</b>.',
                    example: 'Equipped: Chain Mail (55 lbs). Backpack: Rope x1, Potion of Healing x3.'
                },
                {
                    icon: '🧭',
                    title: 'Defenses',
                    desc: 'Resistances, Immunities, and Vulnerabilities. Accessible via the <b>Defenses</b> mobile nav view.',
                    example: 'Resistances: Fire, Poison. Immunities: Charmed.'
                },
                {
                    icon: '📝',
                    title: 'Notes',
                    desc: 'Record personality traits, ideals, bonds, flaws, deity, and general notes. Accessible via the <b>Notes</b> mobile nav view. Notes fields also support the <b>rich HTML editor</b> (📝 icon).',
                    example: 'Flaw: Overconfident. Notes: Met Queen Miranel in session 4.'
                },
            ]
        },
    ];

    const dataGroups = window.isDataAvailable ? [
        {
            title: 'Compendium Data Features',
            sections: [
                {
                    icon: '⬆️',
                    title: 'Uploading Data',
                    desc: 'Go to <b>Menu → Data Browser</b> to upload compendium files. Supports <b>.json</b> files or <b>.zip</b> archives. Uploaded files appear in the Uploaded Files tab.',
                    example: 'Upload "my-campaign.zip" → all JSONs inside are imported.'
                },
                {
                    icon: '⬆️',
                    title: 'Level-Up',
                    desc: 'When data is loaded, a <b>Level Up</b> button appears near your level field. Click it to open the level-up popup — it shows new class features gained at the next level and lets you <b>choose new spells</b> from your class spell list (for spellcasters).',
                    example: 'Wizard level 3 → choose 2 new spells from the full wizard spell list.'
                },
                {
                    icon: '📦',
                    title: 'Adding Spells from Data',
                    desc: 'Click <b>+ Add Spell</b> or <b>+ Cantrip</b> to open the spell picker — search, filter by level/class, and click to add with all details pre-filled.',
                    example: 'Search "fire" → Fireball, Fire Bolt, Wall of Fire with full descriptions.'
                },
                {
                    icon: '🗃️',
                    title: 'Adding Items from Data',
                    desc: 'Click <b>+ Add Item</b> in Inventory to search and pick items with weight pre-filled.',
                    example: 'Search "sword" → Longsword, Shortsword, Greatsword.'
                },
                {
                    icon: '🗡️',
                    title: 'Auto-fill Weapons from Data',
                    desc: 'When adding a weapon, click the name field to open a picker — selecting a weapon auto-fills ATK bonus, damage dice, damage type, and mastery.',
                    example: 'Choose "Rapier" → 1d8 piercing, Finesse filled automatically.'
                },
            ]
        }
    ] : [];

    let html = groups.map(g => renderGroup(g.title, g.sections)).join('');
    if (dataGroups.length) {
        html += dataGroups.map(g => renderGroup(g.title, g.sections)).join('');
    }
    return html;
};

window.initQuickNav = function () {
  if (document.getElementById("view-selection-modal")) return;

  const modal = document.createElement("div");
  modal.id = "view-selection-modal";
  modal.className = "info-modal-overlay";
  modal.innerHTML = `
      <div class="info-modal-content" style="max-width: 350px; text-align: center;">
          <button class="close-modal-btn" onclick="document.getElementById('view-selection-modal').style.display='none'">&times;</button>
          <h3 class="info-modal-title">Navigation</h3>
          <div style="display: flex; flex-direction: column; gap: 8px;">
              <button class="btn" style="white-space: normal; height: auto; padding: 10px;" onclick="window.switchAppView('view-legacy')">Full Sheet</button>
              <hr style="border: none; border-top: 1px solid var(--gold); margin: 2px 0;" />
              <button class="btn btn-secondary" style="white-space: normal; height: auto; padding: 10px;" onclick="window.switchAppView('view-stats')">Ability Scores, Saving Throws, & Skills</button>
              <button class="btn btn-secondary" style="white-space: normal; height: auto; padding: 10px;" onclick="window.switchAppView('view-actions')">Actions</button>
              <button class="btn btn-secondary" style="white-space: normal; height: auto; padding: 10px;" onclick="window.switchAppView('view-inventory')">Inventory</button>
              <button class="btn btn-secondary" style="white-space: normal; height: auto; padding: 10px;" onclick="window.switchAppView('view-spells')">Spells</button>
              <button class="btn btn-secondary" style="white-space: normal; height: auto; padding: 10px;" onclick="window.switchAppView('view-features')">Features & Traits</button>
              <button class="btn btn-secondary" style="white-space: normal; height: auto; padding: 10px;" onclick="window.switchAppView('view-defenses')">Speed & Defenses</button>
              <button class="btn btn-secondary" style="white-space: normal; height: auto; padding: 10px;" onclick="window.switchAppView('view-proficiencies')">Proficiencies & Training</button>
              <button class="btn btn-secondary" style="white-space: normal; height: auto; padding: 10px;" onclick="window.switchAppView('view-notes')">Notes</button>
              <button class="btn btn-secondary" style="white-space: normal; height: auto; padding: 10px;" onclick="window.switchAppView('view-summons')">Summons &amp; Creatures</button>
          </div>
      </div>
  `;
  document.body.appendChild(modal);

  const gridBtn = document.querySelector(".grid-menu-btn");
  if (gridBtn) {
    gridBtn.onclick = (e) => {
      e.stopPropagation();
      document.getElementById('view-selection-modal').style.display = 'flex';
    };
  }
};

window.mountStatsView = function() {
    const statsView = document.getElementById('view-stats');
    if (!statsView) return;

    if (!document.getElementById('mobile-stats-wrapper')) {
        statsView.innerHTML = `
            <div id="mobile-stats-wrapper" class="mobile-stats-grid"></div>
            <h3 class="section-title">Saving Throws</h3>
            <div class="mobile-list-header mobile-saves-header"><span>PROF</span><span>ADV</span><span>SKILL</span><span>BONUS</span></div>
            <div id="mobile-saves-wrapper" class="mobile-skills-grid"></div>
            <h3 class="section-title">Skills</h3>
            <div class="mobile-list-header"><span>PROF</span><span>ADV</span><span>MOD</span><span>SKILL</span><span>BONUS</span></div>
            <div id="mobile-skills-wrapper" class="mobile-skills-grid"></div>
        `;
    }

    const statsWrapper = document.getElementById('mobile-stats-wrapper');
    const savesWrapper = document.getElementById('mobile-saves-wrapper');
    const skillsWrapper = document.getElementById('mobile-skills-wrapper');

    // 1. Move Saving Throws globally by ID to catch them even if they are outside stat-cards
    const abilitiesArr = ["str", "dex", "con", "int", "wis", "cha"];
    const abilityMapFull = { 'str': 'Strength', 'dex': 'Dexterity', 'con': 'Constitution', 'int': 'Intelligence', 'wis': 'Wisdom', 'cha': 'Charisma' };

    abilitiesArr.forEach(ab => {
        const check = document.getElementById(`saveCheck_${ab}`);
        if (check) {
            let saveItem = check.closest('.skill-item');
            if (!saveItem) {
                saveItem = check.parentElement;
                saveItem.classList.add('skill-item', 'mobile-save-item-added');
            }
            
            if (saveItem && !saveItem.dataset.moved) {
                const ph = document.createElement('div');
                ph.id = 'ph-save-' + ab;
                ph.style.display = 'none';
                saveItem.parentNode.insertBefore(ph, saveItem);
                saveItem.dataset.moved = ph.id;
                
                const modEl = document.getElementById(`saveMod_${ab}`);
                if (modEl) modEl.classList.add('skill-mod');

                const nameCandidates = Array.from(saveItem.children).filter(c => !c.classList.contains('skill-checkbox') && !c.classList.contains('adv-toggle') && !c.classList.contains('skill-mod') && !c.classList.contains('mobile-mod-label') && c !== modEl);
                let nameEl = saveItem.querySelector('.skill-name') || nameCandidates[0];
                
                if (nameEl) {
                    nameEl.classList.add('skill-name');
                    if (!nameEl.dataset.originalText) nameEl.dataset.originalText = nameEl.textContent;
                    nameEl.textContent = abilityMapFull[ab];
                }
                
                let modLabel = saveItem.querySelector('.mobile-mod-label');
                if (!modLabel) {
                    modLabel = document.createElement('div');
                    modLabel.className = 'mobile-mod-label';
                    modLabel.textContent = ab.toUpperCase();
                    saveItem.appendChild(modLabel);
                }
                
                savesWrapper.appendChild(saveItem);
            }
        }
    });

    // 2. Move Stat Blocks & Remaining Skills
    document.querySelectorAll('.stat-card').forEach((card, cardIdx) => {
        if (!card.dataset.id) card.dataset.id = 'stat-card-' + cardIdx;
        const cardId = card.dataset.id;
        
        let ability = "STR";
        const statNameEl = card.querySelector('.stat-name');
        if (statNameEl) ability = (statNameEl.dataset.originalText || statNameEl.textContent).trim().substring(0,3).toUpperCase();

        const stat = card.querySelector('.stat');
        if (stat && !stat.dataset.moved) {
            const ph = document.createElement('div');
            ph.id = 'ph-' + cardId + '-stat';
            ph.style.display = 'none';
            stat.parentNode.insertBefore(ph, stat);
            stat.dataset.moved = ph.id;
            statsWrapper.appendChild(stat);
        }

        const skills = card.querySelectorAll('.skill-item');
        skills.forEach((skill, idx) => {
            if (!skill.dataset.moved) {
                const ph = document.createElement('div');
                ph.id = 'ph-' + cardId + '-skill-' + idx;
                ph.style.display = 'none';
                skill.parentNode.insertBefore(ph, skill);
                skill.dataset.moved = ph.id;

                const nameEl = skill.querySelector('.skill-name');
                const isSave = nameEl && nameEl.textContent.toLowerCase().includes('save');

                let modLabel = skill.querySelector('.mobile-mod-label');
                if (!modLabel) {
                    modLabel = document.createElement('div');
                    modLabel.className = 'mobile-mod-label';
                    modLabel.textContent = ability;
                    skill.appendChild(modLabel);
                }

                if (isSave) {
                    savesWrapper.appendChild(skill);
                } else {
                    skillsWrapper.appendChild(skill);
                }
            }
        });
    });

    // Sort skills alphabetically
    const skillItems = Array.from(skillsWrapper.children);
    skillItems.sort((a, b) => {
        const nameCandA = a.querySelector('.skill-name');
        const nameCandB = b.querySelector('.skill-name');
        const nameA = nameCandA ? nameCandA.textContent.trim() : "";
        const nameB = nameCandB ? nameCandB.textContent.trim() : "";
        return nameA.localeCompare(nameB);
    });
    skillItems.forEach(item => skillsWrapper.appendChild(item));
};

window.unmountStatsView = function() {
    document.querySelectorAll('[data-moved]').forEach(el => {
        const ph = document.getElementById(el.dataset.moved);
        if (ph) {
            ph.parentNode.insertBefore(el, ph);
            ph.remove();
        }
        
        const nameCandidates = Array.from(el.children).filter(c => !c.classList.contains('skill-checkbox') && !c.classList.contains('adv-toggle') && !c.classList.contains('skill-mod') && !c.classList.contains('mobile-mod-label'));
        const nameEl = el.querySelector('.skill-name') || nameCandidates[0];
        
        if (nameEl && nameEl.dataset.originalText) {
            nameEl.textContent = nameEl.dataset.originalText;
            delete nameEl.dataset.originalText;
        }

        if (el.classList.contains('mobile-save-item-added')) {
            el.classList.remove('skill-item', 'mobile-save-item-added');
            if (nameEl) nameEl.classList.remove('skill-name');
        }

        delete el.dataset.moved;
    });
};

// ===== INVENTORY VIEW (Mobile) =====
window.syncMobileMoneyField = function(id, val) {
    const inp = document.getElementById(id);
    if (inp) { inp.value = Math.max(0, parseInt(val) || 0); saveCharacter(); }
};

window.mountInventoryView = function() {
    const invView = document.getElementById('view-inventory');
    if (!invView) return;

    // Inject money card at top
    if (!document.getElementById('mobile-money-card')) {
        const coins = [
            { id: 'cp', label: 'CP' },
            { id: 'sp', label: 'SP' },
            { id: 'ep', label: 'EP' },
            { id: 'gp', label: 'GP' },
            { id: 'pp', label: 'PP' },
        ];
        const mc = document.createElement('div');
        mc.id = 'mobile-money-card';
        mc.className = 'mobile-money-card';
        mc.innerHTML = `
            <div class="money-card-header">
                <span class="money-card-title">Currency</span>
                <button class="add-feature-btn" onclick="openManageMoneyModal()" style="font-size:0.72rem;padding:3px 10px;width:auto;">Manage</button>
            </div>
            <div class="money-coins-row">
                ${coins.map(c => `<div class="money-coin" data-coin="${c.id}">
                    <label class="money-coin-label">${c.label}</label>
                    <input class="money-coin-inp" type="number" min="0" value="${document.getElementById(c.id)?.value || 0}"
                        onchange="window.syncMobileMoneyField('${c.id}', this.value)">
                </div>`).join('')}
            </div>`;
        invView.insertBefore(mc, invView.firstChild);
    }

    if (!document.getElementById('mobile-inv-wrapper')) {
        const wrapper = document.createElement('div');
        wrapper.id = 'mobile-inv-wrapper';
        wrapper.innerHTML = '<div id="mobile-inv-equipped-slot"></div><div id="mobile-inv-backpack-slot"></div><div id="mobile-inv-pouch-slot"></div>';
        invView.appendChild(wrapper);
    }
    const equippedList = document.getElementById('equippedList');
    if (equippedList) {
        const section = equippedList.closest('.sheet-section-col');
        if (section && !section.dataset.invMoved) {
            const ph = document.createElement('div');
            ph.id = 'ph-inv-equipped';
            ph.style.display = 'none';
            section.parentNode.insertBefore(ph, section);
            section.dataset.invMoved = 'ph-inv-equipped';
            document.getElementById('mobile-inv-equipped-slot').appendChild(section);
        }
    }
    const inventoryList = document.getElementById('inventoryList');
    if (inventoryList) {
        const section = inventoryList.closest('.sheet-section-col');
        if (section && !section.dataset.invMoved) {
            const ph = document.createElement('div');
            ph.id = 'ph-inv-backpack';
            ph.style.display = 'none';
            section.parentNode.insertBefore(ph, section);
            section.dataset.invMoved = 'ph-inv-backpack';
            document.getElementById('mobile-inv-backpack-slot').appendChild(section);
        }
    }
    const pouchSection = document.getElementById('component-pouch-section');
    if (pouchSection && !pouchSection.dataset.invMoved) {
        const ph = document.createElement('div');
        ph.id = 'ph-inv-pouch';
        ph.style.display = 'none';
        pouchSection.parentNode.insertBefore(ph, pouchSection);
        pouchSection.dataset.invMoved = 'ph-inv-pouch';
        document.getElementById('mobile-inv-pouch-slot').appendChild(pouchSection);
    }
};

window.unmountInventoryView = function() {
    document.getElementById('mobile-money-card')?.remove();
    document.querySelectorAll('[data-inv-moved]').forEach(section => {
        const ph = document.getElementById(section.dataset.invMoved);
        if (ph) { ph.parentNode.insertBefore(section, ph); ph.remove(); }
        delete section.dataset.invMoved;
    });
};

// ===== SPELL VIEW (Mobile) =====
window.mountSpellView = function() {
    const spellView = document.getElementById('view-spells');
    if (!spellView) return;
    // Compute which filter buttons to show
    const _prepLevels = Array.from(document.querySelectorAll('#preparedSpellsList .spell-row'))
        .map(r => parseInt(r.querySelector('.spell-lvl')?.value) || 0).filter(l => l > 0);
    const _maxLevel = _prepLevels.length ? Math.max(..._prepLevels) : 0;
    const _hasCantrips = document.querySelectorAll('#cantripList .spell-row').length > 0;
    const _hasRitual = Array.from(document.querySelectorAll('#preparedSpellsList .spell-row'))
        .some(r => r.querySelector('.spell-ritual')?.checked);
    const _lvlLabels = ['','1st','2nd','3rd','4th','5th','6th','7th','8th','9th'];
    let _filterBtns = `<button class="msv-filter-btn active" data-filter="all" onclick="window.setSpellFilter('all')">All</button>`;
    if (_hasCantrips) _filterBtns += `<button class="msv-filter-btn" data-filter="0" onclick="window.setSpellFilter('0')">Cantrips</button>`;
    for (let i = 1; i <= _maxLevel; i++) _filterBtns += `<button class="msv-filter-btn" data-filter="${i}" onclick="window.setSpellFilter('${i}')">${_lvlLabels[i]}</button>`;
    if (_hasRitual) _filterBtns += `<button class="msv-filter-btn" data-filter="ritual" onclick="window.setSpellFilter('ritual')">Ritual</button>`;

    spellView.innerHTML = `
        <div id="mobile-spell-wrapper">
            <div class="mobile-spell-stats-row">
                <div class="mobile-spell-stat-box">
                    <span class="mobile-spell-stat-label">Modifier</span>
                    <span id="msv-mod">—</span>
                </div>
                <div class="mobile-spell-stat-box">
                    <span class="mobile-spell-stat-label">Spell Attack</span>
                    <span id="msv-atk">—</span>
                </div>
                <div class="mobile-spell-stat-box">
                    <span class="mobile-spell-stat-label">Save DC</span>
                    <span id="msv-dc">—</span>
                </div>
            </div>
            <div class="mobile-spell-actions-row">
                <button class="btn" onclick="window.openManageSpellsModal()">⚙ Manage Spells</button>
            </div>
            <div id="msv-slots"></div>
            <div class="mobile-spell-filter-row">${_filterBtns}</div>
            <div id="msv-list"></div>
        </div>`;
    window._msvFilter = 'all';
    window.refreshMobileSpellStats();
    window.refreshMobileSpellSlots();
    window.refreshMobileSpellView();
};

window.unmountSpellView = function() { /* rebuilt on each mount */ };

window._syncAtkBadge = function() {
    const badge = document.getElementById('act-atk-badge');
    if (badge) badge.textContent = document.getElementById('attacksPerAction')?.value || '1';
};

window.mountActionsView = function() {
    const view = document.getElementById('view-actions');
    if (!view) return;

    // Inject attacks-per-action header
    if (!document.getElementById('act-view-header')) {
        const atkVal = parseInt(document.getElementById('attacksPerAction')?.value) || 1;
        const hdr = document.createElement('div');
        hdr.id = 'act-view-header';
        hdr.className = 'act-view-header';
        hdr.innerHTML = `Attacks per Action: <strong id="act-atk-badge">${atkVal}</strong>`;
        view.insertBefore(hdr, view.firstChild);
        const atkInput = document.getElementById('attacksPerAction');
        if (atkInput) atkInput.addEventListener('input', window._syncAtkBadge);
    }

    // Inject pill filters
    if (!document.getElementById('actions-filter-bar')) {
        const bar = document.createElement('div');
        bar.id = 'actions-filter-bar';
        bar.className = 'actions-filter-bar';
        bar.innerHTML = ['All','Actions','Bonus Actions','Reactions'].map((label, i) => {
            const key = ['all','action','bonus','reaction'][i];
            return `<button class="act-filter-pill${i === 0 ? ' active' : ''}" data-filter="${key}" onclick="window.filterActionsView('${key}')">${label}</button>`;
        }).join('');
        const hdr = document.getElementById('act-view-header');
        if (hdr) hdr.after(bar); else view.insertBefore(bar, view.firstChild);
    }

    // Inject mobile resources card
    if (!document.getElementById('mobile-resources-card')) {
        const card = document.createElement('div');
        card.id = 'mobile-resources-card';
        card.className = 'res-card';
        view.insertBefore(card, view.children[1] || null);
        window.renderMobileResources();
    }

    // Inject mobile weapons card
    if (!document.getElementById('mobile-weapons-card')) {
        const wcard = document.createElement('div');
        wcard.id = 'mobile-weapons-card';
        wcard.className = 'weapons-mobile-card';
        const resCard = document.getElementById('mobile-resources-card');
        view.insertBefore(wcard, resCard ? resCard.nextSibling : view.children[2] || null);
        window.renderWeaponsCard();
    }

    // Move actions, bonus actions, reactions sections
    ['actionsContainer', 'bonusActionsContainer', 'reactionsContainer'].forEach((id, i) => {
        const container = document.getElementById(id);
        if (!container) return;
        const section = container.closest('div[class=""]') || container.parentElement;
        if (!section || section.dataset.actMoved) return;
        const ph = document.createElement('div');
        ph.id = 'ph-act-' + i;
        ph.style.display = 'none';
        section.parentNode.insertBefore(ph, section);
        section.dataset.actMoved = ph.id;
        view.appendChild(section);
    });

    // Inject auto-spell entries from prepared spells / cantrips
    window.refreshSpellsInActionsView();
};

window.filterActionsView = function(filter) {
    document.querySelectorAll('#actions-filter-bar .act-filter-pill').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    const map = [
        { id: 'actionsContainer',      key: 'action'   },
        { id: 'bonusActionsContainer', key: 'bonus'    },
        { id: 'reactionsContainer',    key: 'reaction' },
    ];
    map.forEach(({ id, key }) => {
        const section = document.getElementById(id)?.closest('[data-act-moved]');
        if (section) section.style.display = (filter === 'all' || filter === key) ? '' : 'none';
    });
};

window.unmountActionsView = function() {
    // Remove injected header, filter bar, resources card, and weapons card
    document.getElementById('act-view-header')?.remove();
    document.getElementById('actions-filter-bar')?.remove();
    document.getElementById('mobile-resources-card')?.remove();
    document.getElementById('mobile-weapons-card')?.remove();
    const atkInput = document.getElementById('attacksPerAction');
    if (atkInput) atkInput.removeEventListener('input', window._syncAtkBadge);

    // Remove auto-spell containers
    ['auto-act-spells', 'auto-bonus-spells', 'auto-react-spells'].forEach(id => {
        document.getElementById(id)?.remove();
    });

    // Restore moved sections (also reset any filter-hidden display)
    document.querySelectorAll('[data-act-moved]').forEach(el => {
        el.style.display = '';
        const ph = document.getElementById(el.dataset.actMoved);
        if (ph) { ph.parentNode.insertBefore(el, ph); ph.remove(); }
        delete el.dataset.actMoved;
    });
};

window.refreshSpellsInActionsView = function() {
    const classify = (time) => {
        if (!time) return null;
        const t = time.toLowerCase().trim();
        // Order matters: "reaction" contains "action" as a substring — check specific first.
        // 5e-tools stores bonus actions as "1 bonus" (not "1 bonus action").
        if (t.includes('bonus')) return 'bonus';
        if (t.includes('reaction')) return 'reaction';
        if (t.includes('action')) return 'action';
        return null;
    };

    // Compute Hit/DC string from hitType using current character stats
    const getHitDC = (hitType, saveAb) => {
        if (hitType) {
            const raw = document.getElementById('spellAttackBonus')?.value ?? '';
            const n = parseInt(raw);
            return isNaN(n) ? '' : `Hit ${n >= 0 ? '+' + n : n}`;
        }
        if (saveAb) {
            const dc = document.getElementById('spellDC')?.value ?? '';
            const abbr = (_SPELL_ABILITY_ABBR[saveAb] || saveAb.toUpperCase().slice(0, 3));
            return dc ? `${abbr} ${dc}` : '';
        }
        return '';
    };

    // Extract damage dice from description
    const extractDmg = (desc) => {
        const text = desc.replace(/<[^>]+>/g, ' ');
        const dmgMatch = text.match(/\b(\d+d\d+(?:[+\-]\d+)?)\b/);
        return dmgMatch ? dmgMatch[1] : '';
    };

    const allRows = [
        ...Array.from(document.querySelectorAll('#preparedSpellsList .spell-row')),
        ...Array.from(document.querySelectorAll('#cantripList .spell-row'))
    ];

    const groups = { action: [], bonus: [], reaction: [] };
    allRows.forEach(row => {
        const time = row.querySelector('.spell-time')?.value || '';
        const name = row.querySelector('.spell-name')?.value || '';
        if (!name) return;
        const desc = row.querySelector('.spell-desc')?.value || '';
        const range = row.querySelector('.spell-range')?.value || '';
        const lvl = parseInt(row.querySelector('.spell-lvl')?.value) || 0;
        const lvlLabel = lvl === 0 ? 'Cantrip' : `Lv ${lvl}`;
        // Resolve attack/save type: stored data attrs first, then description fallback
        let atkType = row.dataset.atkType || '';
        let saveAb = row.dataset.saveAbility || '';
        if (!atkType && !saveAb && desc) {
            const d = desc.toLowerCase();
            const am = _SPELL_ATK_PATTERN.exec(d);
            if (am) { atkType = am[1][0].toUpperCase(); }
            else { const sm = _SPELL_SAVE_PATTERN.exec(d); if (sm) saveAb = _SAVE_NAME_MAP[sm[1].toLowerCase()] || ''; }
        }
        const cat = classify(time);
        if (cat) groups[cat].push({ name, desc, range, atkType, saveAb, lvlLabel });
    });

    const inject = (containerId, spells, autoId) => {
        const container = document.getElementById(containerId);
        if (!container) return;
        let autoDiv = document.getElementById(autoId);
        if (!autoDiv) {
            autoDiv = document.createElement('div');
            autoDiv.id = autoId;
            container.parentElement.insertBefore(autoDiv, container);
        }
        if (spells.length === 0) { autoDiv.innerHTML = ''; return; }
        const labelHtml = `<div class="auto-spells-label">From Spells</div>`;
        const itemsHtml = spells.map((s, idx) => {
            const descHtml = s.desc
                ? s.desc.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                : '';
            const metaParts = [];
            if (s.range) metaParts.push(`<span class="auto-spell-meta-txt">${s.range}</span>`);
            const dmg = extractDmg(s.desc);
            if (dmg) metaParts.push(`<span class="auto-spell-meta-txt">${dmg}</span>`);
            const hitdc = getHitDC(s.atkType, s.saveAb);
            if (hitdc) {
                const cls = s.atkType ? 'msv-tag msv-tag-atk' : 'msv-tag msv-tag-save';
                metaParts.push(`<span class="${cls}">${hitdc}</span>`);
            }
            const statsHtml = metaParts.length
                ? `<div class="auto-spell-stats">${metaParts.join('')}</div>`
                : '';
            return `<div class="auto-spell-item">
                <div class="auto-spell-header" onclick="var d=document.getElementById('${autoId}-d-${idx}');if(d)d.classList.toggle('open')">
                    <div class="auto-spell-left">
                        <span class="auto-spell-name">${s.name}</span>
                        <span class="auto-spell-lvl">${s.lvlLabel}</span>
                    </div>
                    ${statsHtml}
                </div>
                ${descHtml ? `<div class="auto-spell-desc" id="${autoId}-d-${idx}">${descHtml}</div>` : ''}
            </div>`;
        }).join('');
        autoDiv.innerHTML = labelHtml + itemsHtml;
    };

    inject('actionsContainer', groups.action, 'auto-act-spells');
    inject('bonusActionsContainer', groups.bonus, 'auto-bonus-spells');
    inject('reactionsContainer', groups.reaction, 'auto-react-spells');
};

// ===== DEFENSES VIEW (Mobile) =====
window.mountDefensesView = function() {
    const view = document.getElementById('view-defenses');
    if (!view) return;

    const gv = id => document.getElementById(id)?.value || '';
    const speed = gv('speed') || '30';
    const size = gv('charSize') || 'Medium';
    const sizeOpts = ['Tiny','Small','Medium','Large','Huge','Gargantuan']
        .map(s => `<option${size === s ? ' selected' : ''}>${s}</option>`).join('');

    view.innerHTML = `<div id="def-view-inner">
        <div class="def-stat-grid">
            <div class="def-stat-card">
                <div class="def-stat-label">Speed</div>
                <div class="def-stat-input-row">
                    <input class="def-stat-input" id="def-speed" type="number" value="${speed}" oninput="window._defSync('speed',this.value)"/>
                    <span class="def-stat-unit">ft</span>
                </div>
            </div>
            <div class="def-stat-card">
                <div class="def-stat-label">Size</div>
                <select class="def-stat-select" id="def-size" onchange="window._defSync('charSize',this.value)">${sizeOpts}</select>
            </div>
        </div>
        <div class="def-card">
            <div class="def-card-header">Defenses</div>
            <div class="def-defense-row">
                <div class="def-defense-label">Resistances</div>
                <textarea class="def-defense-textarea" id="def-res" placeholder="e.g. Fire, Poison…" oninput="window._defSync('resistances',this.value)">${gv('resistances')}</textarea>
            </div>
            <div class="def-defense-row">
                <div class="def-defense-label">Immunities</div>
                <textarea class="def-defense-textarea" id="def-imm" placeholder="e.g. Charmed, Frightened…" oninput="window._defSync('immunities',this.value)">${gv('immunities')}</textarea>
            </div>
            <div class="def-defense-row" style="margin-bottom:0">
                <div class="def-defense-label">Vulnerabilities</div>
                <textarea class="def-defense-textarea" id="def-vuln" placeholder="e.g. Cold…" oninput="window._defSync('vulnerabilities',this.value)">${gv('vulnerabilities')}</textarea>
            </div>
        </div>
    </div>`;
};

window._defSync = function(sourceId, value) {
    const el = document.getElementById(sourceId);
    if (el) { el.value = value; saveCharacter(); }
};

window.unmountDefensesView = function() {
    const view = document.getElementById('view-defenses');
    if (view) view.innerHTML = '';
};

// ===== PROFICIENCIES VIEW (Mobile) =====
window.mountProficienciesView = function() {
    const view = document.getElementById('view-proficiencies');
    if (!view) return;

    const pb = parseInt(document.getElementById('profBonus')?.value) || 2;
    const armorIds   = ['armorLight','armorMedium','armorHeavy','armorShield'];
    const armorLabels = ['Light','Medium','Heavy','Shield'];
    const armorBoxes = armorIds.map((id, i) => {
        const chk = document.getElementById(id)?.checked ? 'checked' : '';
        return `<label class="prof-armor-item"><input type="checkbox" ${chk} onchange="var s=document.getElementById('${id}');if(s){s.checked=this.checked;saveCharacter()}"> ${armorLabels[i]}</label>`;
    }).join('');

    view.innerHTML = `<div id="prof-view-inner">
        <div class="prof-pb-row">
            <div class="def-stat-card prof-pb-card">
                <div class="def-stat-label">Proficiency Bonus</div>
                <div class="def-stat-readonly">+${pb}</div>
            </div>
        </div>
        <div class="def-card">
            <div class="def-card-header">Armor Training</div>
            <div class="prof-armor-grid">${armorBoxes}</div>
        </div>
        <div class="def-card">
            <div class="def-card-header">Weapon Proficiencies</div>
            <div id="prof-weapon-slot" class="prof-field-slot"></div>
        </div>
        <div class="def-card">
            <div class="def-card-header">Tool Proficiencies</div>
            <div id="prof-tool-slot" class="prof-field-slot"></div>
        </div>
        <div class="def-card">
            <div class="def-card-header">Languages</div>
            <div id="prof-lang-slot" class="prof-field-slot"></div>
        </div>
    </div>`;

    const moveInto = (slotId, el) => {
        if (!el) return;
        const slot = document.getElementById(slotId);
        if (!slot) return;
        const ph = document.createElement('span');
        ph.id = 'profph-' + slotId + '-' + el.id;
        ph.style.display = 'none';
        el.parentNode.insertBefore(ph, el);
        el.dataset.profViewMoved = ph.id;
        slot.appendChild(el);
    };

    moveInto('prof-weapon-slot', document.getElementById('weaponProfsSelector'));
    moveInto('prof-weapon-slot', document.getElementById('weaponProfsText'));
    moveInto('prof-tool-slot',   document.getElementById('toolProfs'));
    moveInto('prof-lang-slot',   document.getElementById('languages'));
};

window.unmountProficienciesView = function() {
    document.querySelectorAll('[data-prof-view-moved]').forEach(el => {
        const ph = document.getElementById(el.dataset.profViewMoved);
        if (ph) { ph.parentNode.insertBefore(el, ph); ph.remove(); }
        delete el.dataset.profViewMoved;
    });
    const view = document.getElementById('view-proficiencies');
    if (view) view.innerHTML = '';
};

// ===== NOTES VIEW (Mobile) =====
window.mountNotesView = function() {
    const view = document.getElementById('view-notes');
    if (!view) return;
    const moveEl = window.createViewMover(view, 'notesMoved');
    ['personality','ideals','bonds','flaws','deity','notes'].forEach(id =>
        moveEl(document.getElementById(id)?.closest('.field'))
    );
};

window.unmountNotesView = function() {
    document.querySelectorAll('[data-notes-moved]').forEach(el => {
        const ph = document.getElementById(el.dataset.notesMoved);
        if (ph) { ph.parentNode.insertBefore(el, ph); ph.remove(); }
        delete el.dataset.notesMoved;
    });
};

// ===== SUMMONS VIEW (Mobile) =====
window.mountSummonsView = function() {
    const view = document.getElementById('view-summons');
    if (!view) return;
    if (!document.getElementById('summons-view-title')) {
        const h = document.createElement('h2');
        h.id = 'summons-view-title';
        h.className = 'section-title';
        h.textContent = 'Summons & Creatures';
        view.appendChild(h);
    }
    // Inject add-buttons if not already present
    if (!document.getElementById('summons-mobile-add')) {
        const bar = document.createElement('div');
        bar.id = 'summons-mobile-add';
        bar.style.cssText = 'display:flex;gap:8px;margin:4px 0 8px;flex-wrap:wrap;';
        const addBtn = document.createElement('button');
        addBtn.className = 'add-feature-btn';
        addBtn.style.flex = '1';
        addBtn.textContent = '+ Add Blank';
        addBtn.onclick = () => window.addSummon();
        bar.appendChild(addBtn);
        if (window.isDataAvailable) {
            const searchBtn = document.createElement('button');
            searchBtn.className = 'add-feature-btn';
            searchBtn.style.flex = '1';
            searchBtn.textContent = '🔍 Search Creatures';
            searchBtn.onclick = () => window.openCreatureSearchAdd();
            bar.appendChild(searchBtn);
        }
        view.appendChild(bar);
    }
    const moveEl = window.createViewMover(view, 'summonsMoved');
    moveEl(document.getElementById('summonsContainer'));
};

window.unmountSummonsView = function() {
    document.getElementById('summons-view-title')?.remove();
    document.querySelectorAll('[data-summons-moved]').forEach(el => {
        const ph = document.getElementById(el.dataset.summonsMoved);
        if (ph) { ph.parentNode.insertBefore(el, ph); ph.remove(); }
        delete el.dataset.summonsMoved;
    });
    document.getElementById('summons-mobile-add')?.remove();
};

// ===== FEATURES VIEW (Mobile) =====
window.mountFeaturesView = function() {
    const view = document.getElementById('view-features');
    if (!view) return;
    const moveEl = window.createViewMover(view, 'featMoved');
    ['features-filter-row','class-features','race-features','background-features','feats'].forEach(id =>
        moveEl(document.getElementById(id))
    );
};

window.unmountFeaturesView = function() {
    document.querySelectorAll('[data-feat-moved]').forEach(el => {
        const ph = document.getElementById(el.dataset.featMoved);
        if (ph) { ph.parentNode.insertBefore(el, ph); ph.remove(); }
        delete el.dataset.featMoved;
    });
};

window.setSpellFilter = function(filter) {
    window._msvFilter = filter;
    document.querySelectorAll('.msv-filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.filter === filter);
    });
    window.refreshMobileSpellView();
};

window.refreshMobileSpellStats = function() {
    const fmt = v => (v >= 0 ? `+${v}` : `${v}`);
    const modVal = parseInt(document.getElementById('spellAttackMod')?.value) || 0;
    const atkVal = parseInt(document.getElementById('spellAttackBonus')?.value) || 0;
    const dcVal = document.getElementById('spellDC')?.value || '—';
    if (document.getElementById('msv-mod')) document.getElementById('msv-mod').textContent = fmt(modVal);
    if (document.getElementById('msv-atk')) document.getElementById('msv-atk').textContent = fmt(atkVal);
    if (document.getElementById('msv-dc')) document.getElementById('msv-dc').textContent = dcVal;
};

window.refreshMobileSpellSlots = function() {
    const container = document.getElementById('msv-slots');
    if (!container || typeof spellSlotsData === 'undefined' || spellSlotsData.length === 0) {
        if (container) container.innerHTML = '';
        return;
    }
    container.innerHTML = '<div class="msv-slots-grid">' +
        spellSlotsData.map((slot, idx) =>
            `<div class="msv-slot-level"><span class="msv-slot-label">Lv ${slot.level}</span><div class="msv-slot-dots">${
                Array.from({ length: slot.total }, (_, i) =>
                    `<div class="msv-slot-dot${i < slot.used ? ' used' : ''}" onclick="window.toggleSlotMsv(${idx},${i})"></div>`
                ).join('')
            }</div></div>`
        ).join('') + '</div>';
};

window.toggleSlotMsv = function(levelIndex, slotIndex) {
    window.toggleSlot(levelIndex, slotIndex);
    window.refreshMobileSpellSlots();
};

window.refreshMobileSpellView = function() {
    const container = document.getElementById('msv-list');
    if (!container) return;
    window._msvSpells = [];
    const filter = window._msvFilter || 'all';

    const spells = [];
    document.querySelectorAll('#cantripList .spell-row').forEach(row => {
        const name = row.querySelector('.spell-name')?.value?.trim();
        if (!name) return;
        spells.push({ level: 0, name,
            time: row.querySelector('.spell-time')?.value || '',
            range: row.querySelector('.spell-range')?.value || '',
            ritual: row.querySelector('.spell-ritual')?.checked || false,
            concentration: row.querySelector('.spell-conc')?.checked || false,
            material: row.querySelector('.spell-mat')?.checked || false,
            description: row.querySelector('.spell-desc')?.value || '',
            attackType: row.dataset.atkType || '',
            saveAbility: row.dataset.saveAbility || '',
            _row: row });
    });
    document.querySelectorAll('#preparedSpellsList .spell-row').forEach(row => {
        const name = row.querySelector('.spell-name')?.value?.trim();
        if (!name) return;
        spells.push({ level: parseInt(row.querySelector('.spell-lvl')?.value) || 1, name,
            time: row.querySelector('.spell-time')?.value || '',
            range: row.querySelector('.spell-range')?.value || '',
            ritual: row.querySelector('.spell-ritual')?.checked || false,
            concentration: row.querySelector('.spell-conc')?.checked || false,
            material: row.querySelector('.spell-mat')?.checked || false,
            description: row.querySelector('.spell-desc')?.value || '',
            attackType: row.dataset.atkType || '',
            saveAbility: row.dataset.saveAbility || '',
            _row: row });
    });

    let filtered = spells;
    if (filter === '0') filtered = spells.filter(s => s.level === 0);
    else if (filter === 'ritual') filtered = spells.filter(s => s.ritual);
    else if (filter !== 'all') filtered = spells.filter(s => s.level === parseInt(filter));

    if (filtered.length === 0) {
        container.innerHTML = '<div style="text-align:center;color:var(--ink-light);padding:24px;font-style:italic;">No prepared spells</div>';
        return;
    }

    const byLevel = {};
    filtered.forEach(s => { (byLevel[s.level] = byLevel[s.level] || []).push(s); });
    const lvlLabel = l => ['Cantrips','1st Level','2nd Level','3rd Level','4th Level','5th Level','6th Level','7th Level','8th Level','9th Level'][l] || `${l}th Level`;
    const badge = l => ['Cantrip','1st','2nd','3rd','4th','5th','6th','7th','8th','9th'][l] || `${l}th`;

    const _msvAtkRaw = parseInt(document.getElementById('spellAttackBonus')?.value) || 0;
    const _msvAtkStr = _msvAtkRaw >= 0 ? `+${_msvAtkRaw}` : `${_msvAtkRaw}`;
    const _msvDC = parseInt(document.getElementById('spellDC')?.value) || 10;

    let html = '';
    Object.keys(byLevel).sort((a,b) => a-b).forEach(lvl => {
        html += '<div class="msv-level-group">';
        if (filter === 'all' || filter === 'ritual') html += `<h3 class="msv-level-header">${lvlLabel(+lvl)}</h3>`;
        byLevel[lvl].forEach(spell => {
            let atkType = spell.attackType || '';
            let saveAb = spell.saveAbility || '';
            if (!atkType && !saveAb && spell.description) {
                const desc = spell.description.toLowerCase();
                const atkMatch = _SPELL_ATK_PATTERN.exec(desc);
                if (atkMatch) { atkType = atkMatch[1][0].toUpperCase(); }
                else { const sm = _SPELL_SAVE_PATTERN.exec(desc); if (sm) saveAb = _SAVE_NAME_MAP[sm[1].toLowerCase()] || ''; }
            }
            let rollTag = '';
            if (atkType) {
                rollTag = `<span class="msv-tag msv-tag-atk">Hit ${_msvAtkStr}</span>`;
            } else if (saveAb) {
                const abbr = _SPELL_ABILITY_ABBR[saveAb] || saveAb.toUpperCase().slice(0, 3);
                rollTag = `<span class="msv-tag msv-tag-save">${abbr} ${_msvDC}</span>`;
            }
            const rcmTags = [
                spell.ritual ? '<span class="msv-tag">R</span>' : '',
                spell.concentration ? '<span class="msv-tag msv-tag-conc">C</span>' : '',
                spell.material ? '<span class="msv-tag">M</span>' : '',
            ].join('');
            const hasDesc = spell.description.trim().length > 0;
            const spellIdx = window._msvSpells.push({ name: spell.name, desc: spell.description, row: spell._row }) - 1;
            html += `<div class="msv-spell-card">
                <div class="msv-spell-card-main">
                    <div class="msv-drag-handle" ontouchstart="window.msvDragStart(event,${spellIdx})" onmousedown="window.msvDragStart(event,${spellIdx})">☰</div>
                    <div class="msv-spell-card-left">
                        <span class="msv-spell-level-badge">${badge(+lvl)}</span>
                        <span class="msv-spell-name">${spell.name}</span>
                    </div>
                    <div class="msv-spell-card-right">
                        ${rollTag}
                        ${rcmTags}
                        ${spell.time ? `<span class="msv-spell-meta">${spell.time}</span>` : ''}
                        ${spell.range ? `<span class="msv-spell-meta">${spell.range}</span>` : ''}
                        ${hasDesc ? `<button class="msv-info-btn" onclick="window.showMsvSpellInfo(${spellIdx})">?</button>` : ''}
                    </div>
                </div>
            </div>`;
        });
        html += '</div>';
    });
    container.innerHTML = html;
};

window.showMsvSpellInfo = function(idx) {
    const s = window._msvSpells?.[idx];
    if (!s) return;
    document.getElementById('infoModalTitle').textContent = s.name || 'Spell';
    document.getElementById('infoModalText').innerHTML = s.desc
        ? s.desc.replace(/\n/g,'<br>').replace(/\*\*(.*?)\*\*/g,'<b>$1</b>')
        : 'No description available.';
    document.getElementById('infoModal').style.display = 'flex';
};

window.msvDragStart = function(e, idx) {
    e.preventDefault();
    const isTouch = e.type === 'touchstart';
    const clientY = isTouch ? e.touches[0].clientY : e.clientY;
    const clientX = isTouch ? e.touches[0].clientX : e.clientX;

    const card = e.currentTarget.closest('.msv-spell-card');
    if (!card) return;
    const rect = card.getBoundingClientRect();

    const ghost = card.cloneNode(true);
    ghost.id = 'msv-drag-ghost';
    ghost.style.cssText = `position:fixed;z-index:9999;opacity:0.9;pointer-events:none;width:${rect.width}px;left:${rect.left}px;top:${rect.top}px;box-shadow:0 6px 20px rgba(0,0,0,0.25);border-radius:6px;margin:0;`;
    document.body.appendChild(ghost);
    card.classList.add('msv-dragging');

    const ds = { idx, ghost, card, offsetY: clientY - rect.top, offsetX: clientX - rect.left };
    window._msvDragState = ds;

    let dropIndicator = null;

    const onMove = (ev) => {
        ev.preventDefault();
        const cy = ev.type === 'touchmove' ? ev.touches[0].clientY : ev.clientY;
        const cx = ev.type === 'touchmove' ? ev.touches[0].clientX : ev.clientX;
        ds.ghost.style.top = (cy - ds.offsetY) + 'px';
        ds.ghost.style.left = (cx - ds.offsetX) + 'px';

        // Show drop indicator
        ds.ghost.style.display = 'none';
        const el = document.elementFromPoint(cx, cy);
        ds.ghost.style.display = '';
        const overCard = el?.closest('.msv-spell-card');
        if (dropIndicator) dropIndicator.classList.remove('msv-drop-above', 'msv-drop-below');
        if (overCard && overCard !== ds.card) {
            const overRect = overCard.getBoundingClientRect();
            const overMid = overRect.top + overRect.height / 2;
            dropIndicator = overCard;
            overCard.classList.add(cy < overMid ? 'msv-drop-above' : 'msv-drop-below');
        }
    };

    const onEnd = (ev) => {
        const cy = ev.type === 'touchend' ? ev.changedTouches[0].clientY : ev.clientY;
        const cx = ev.type === 'touchend' ? ev.changedTouches[0].clientX : ev.clientX;

        ds.ghost.style.display = 'none';
        const el = document.elementFromPoint(cx, cy);
        ds.ghost.remove();
        ds.card.classList.remove('msv-dragging');
        if (dropIndicator) dropIndicator.classList.remove('msv-drop-above', 'msv-drop-below');
        window._msvDragState = null;

        const targetCard = el?.closest('.msv-spell-card');
        if (targetCard && targetCard !== ds.card) {
            const allCards = [...document.querySelectorAll('#msv-list .msv-spell-card')];
            const targetIdx = allCards.indexOf(targetCard);
            const srcRow = window._msvSpells[ds.idx]?.row;
            const tgtRow = window._msvSpells[targetIdx]?.row;
            if (srcRow && tgtRow && srcRow !== tgtRow && srcRow.parentElement === tgtRow.parentElement) {
                const overRect = targetCard.getBoundingClientRect();
                const overMid = overRect.top + overRect.height / 2;
                if (cy < overMid) {
                    tgtRow.parentElement.insertBefore(srcRow, tgtRow);
                } else {
                    tgtRow.after(srcRow);
                }
                saveCharacter();
                window.refreshMobileSpellView();
            }
        }

        document.removeEventListener('touchmove', onMove);
        document.removeEventListener('touchend', onEnd);
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup', onEnd);
    };

    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onEnd);
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onEnd);
};

window.openManageSpellsModal = function() {
    let modal = document.getElementById('msvManageModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'msvManageModal';
        modal.className = 'info-modal-overlay';
        modal.innerHTML = `
            <div class="info-modal-content" style="max-width:500px;width:95%;max-height:80vh;display:flex;flex-direction:column;overflow:hidden;">
                <button class="close-modal-btn" onclick="document.getElementById('msvManageModal').style.display='none';window.refreshMobileSpellView();">&times;</button>
                <h3 class="info-modal-title">Manage Spells</h3>
                <div id="msv-prep-count" style="text-align:center;font-size:0.85rem;color:var(--ink-light);margin-bottom:10px;"></div>
                <div id="msv-manage-actions" style="display:flex;gap:8px;margin-bottom:12px;justify-content:center;flex-wrap:wrap;"></div>
                <div style="overflow-y:auto;flex:1;padding-right:4px;" id="msv-manage-list"></div>
            </div>`;
        document.body.appendChild(modal);
    }
    window.refreshManageSpellsModal();
    modal.style.display = 'flex';
};

window.calcMaxPreparedSpells = function() {
    const className = (document.getElementById('charClass')?.value || '').toLowerCase().trim();
    const level = parseInt(document.getElementById('level')?.value) || 1;
    const spellAbility = (document.getElementById('spellAbility')?.value || '').toLowerCase();
    const abilityScore = parseInt(document.getElementById(spellAbility)?.value) || 10;
    const abilityMod = Math.floor((abilityScore - 10) / 2);
    const halfLevel = Math.max(1, Math.floor(level / 2));

    const formulas = {
        wizard: abilityMod + level,
        cleric: abilityMod + level,
        druid: abilityMod + level,
        paladin: abilityMod + halfLevel,
        ranger: abilityMod + halfLevel,
        artificer: abilityMod + halfLevel,
    };
    const keys = Object.keys(formulas);
    const match = keys.find(k => className.includes(k));
    if (!match) return null;
    return Math.max(1, formulas[match]);
};

window.refreshManageSpellsModal = function() {
    const preparedCount = document.querySelectorAll('#preparedSpellsList .spell-row').length;
    const countEl = document.getElementById('msv-prep-count');

    const renderCount = (maxPrepared) => {
        if (!countEl) return;
        if (maxPrepared !== null) {
            const over = preparedCount > maxPrepared;
            countEl.innerHTML = `<span style="${over ? 'color:var(--red-dark);font-weight:bold;' : ''}">${preparedCount} / ${maxPrepared}</span> spells prepared`;
        } else {
            countEl.textContent = `${preparedCount} spells prepared`;
        }
    };

    // Show formula-based count immediately, then try class table
    const formulaMax = window.calcMaxPreparedSpells();
    renderCount(formulaMax);

    if (window.isDataAvailable) {
        (async () => {
            try {
                const charClassRaw = document.getElementById('charClass')?.value || '';
                const charLevel = parseInt(document.getElementById('level')?.value) || 1;
                const spellAbility = (document.getElementById('spellAbility')?.value || '').toLowerCase();
                const abilityScore = parseInt(document.getElementById(spellAbility)?.value) || 10;
                const abilityMod = Math.floor((abilityScore - 10) / 2);

                const db = await openDB();
                const tx = db.transaction(STORE_NAME, 'readonly');
                const store = tx.objectStore(STORE_NAME);
                const data = await new Promise(resolve => {
                    const req = store.get('currentData');
                    req.onsuccess = () => resolve(req.result);
                    req.onerror = () => resolve(null);
                });
                if (!data) return;

                let classObj = null;
                data.forEach(file => {
                    if (!file.name.toLowerCase().endsWith('.json')) return;
                    try {
                        const json = JSON.parse(file.content);
                        if (json.class) {
                            json.class.filter(c => c.name.toLowerCase() === charClassRaw.toLowerCase()).forEach(m => {
                                if (!classObj) classObj = m;
                                else if (m.source === 'XPHB') classObj = m;
                                else if (m.source === 'PHB' && classObj.source !== 'XPHB') classObj = m;
                            });
                        }
                    } catch (e) {}
                });
                if (!classObj || !classObj.classTableGroups) return;

                const li = charLevel - 1;
                const stripTag = s => s.replace(/{@\w+\s*([^}]+)?}/g, '$1');
                for (const group of classObj.classTableGroups) {
                    if (!group.colLabels) continue;
                    const ci = group.colLabels.findIndex(l => /Spells\s*Prepared/i.test(stripTag(l)));
                    if (ci !== -1 && group.rows && group.rows[li]) {
                        const val = group.rows[li][ci];
                        const v = typeof val === 'object' ? (val.value ?? val) : val;
                        const num = parseInt(v);
                        if (!isNaN(num) && num > 0) { renderCount(num); return; }
                    }
                }
                // Class table had no "Spells Prepared" column — fall back to ability+level formula
                // (already rendered above, no update needed)
            } catch (e) {}
        })();
    }

    const actionsEl = document.getElementById('msv-manage-actions');
    if (actionsEl) {
        actionsEl.innerHTML = `
            <button class="add-feature-btn" onclick="window.msvAddCustomSpell()">+ Add to Spellbook</button>
            ${window.isDataAvailable ? `<button class="add-feature-btn" onclick="window.msvSearchAndAdd('spellList','leveled')">Search Spells</button>` : ''}
            <button class="add-feature-btn" onclick="window.msvAddCantrip()">+ Add Cantrip</button>
            ${window.isDataAvailable ? `<button class="add-feature-btn" onclick="window.msvSearchAndAdd('cantripList','cantrip')">Search Cantrips</button>` : ''}`;
    }

    const listEl = document.getElementById('msv-manage-list');
    if (!listEl) return;
    listEl.innerHTML = '';

    function buildManageRow(row, prepared, isCantrip) {
        const name = row.querySelector('.spell-name')?.value?.trim() || '(unnamed)';
        const level = isCantrip ? 'C' : (row.querySelector('.spell-lvl')?.value || '?');
        const ritual = row.querySelector('.spell-ritual')?.checked;
        const conc = row.querySelector('.spell-conc')?.checked;
        const mat = row.querySelector('.spell-mat')?.checked;
        const div = document.createElement('div');
        div.className = 'msv-manage-row' + (prepared ? ' msv-manage-row-prep' : '');
        const removeBtn = document.createElement('button');
        removeBtn.className = 'msv-manage-remove';
        removeBtn.textContent = '✕';
        removeBtn.title = 'Remove from spellbook';
        removeBtn.onclick = function() {
            row.remove();
            saveCharacter();
            window.refreshManageSpellsModal();
        };
        div.appendChild(removeBtn);
        div.insertAdjacentHTML('beforeend', `<span class="msv-manage-level">${level}</span><span class="msv-manage-name">${name}</span><span class="msv-manage-tags">${ritual ? '<span class="msv-tag">R</span>' : ''}${conc ? '<span class="msv-tag msv-tag-conc">C</span>' : ''}${mat ? '<span class="msv-tag msv-tag-mat">M</span>' : ''}</span>`);
        if (isCantrip) {
            const badge = document.createElement('span');
            badge.className = 'msv-manage-prep-badge';
            badge.textContent = 'Always';
            div.appendChild(badge);
        } else {
            const btn = document.createElement('button');
            btn.className = 'msv-prep-toggle' + (prepared ? ' msv-prep-toggle-active' : '');
            btn.textContent = prepared ? '✓ Prep' : 'Prepare';
            btn.onclick = function() {
                const cb = row.querySelector('.spell-prep');
                if (cb) { cb.checked = !prepared; cb.dispatchEvent(new Event('change')); }
                window.refreshManageSpellsModal();
            };
            div.appendChild(btn);
        }
        return div;
    }

    const cantrips = document.querySelectorAll('#cantripList .spell-row');
    if (cantrips.length > 0) {
        const grp = document.createElement('div');
        grp.className = 'msv-manage-group';
        grp.innerHTML = '<h4 class="msv-manage-group-header">Cantrips</h4>';
        cantrips.forEach(row => grp.appendChild(buildManageRow(row, true, true)));
        listEl.appendChild(grp);
    }

    const preparedRows = Array.from(document.querySelectorAll('#preparedSpellsList .spell-row'));
    const knownRows = Array.from(document.querySelectorAll('#spellList .spell-row'));
    if (preparedRows.length > 0 || knownRows.length > 0) {
        const grp = document.createElement('div');
        grp.className = 'msv-manage-group';
        grp.innerHTML = '<h4 class="msv-manage-group-header">Leveled Spells</h4>';
        [...preparedRows.map(r => ({r, p:true})), ...knownRows.map(r => ({r, p:false}))]
            .sort((a,b) => (parseInt(a.r.querySelector('.spell-lvl')?.value)||0) - (parseInt(b.r.querySelector('.spell-lvl')?.value)||0))
            .forEach(({r, p}) => grp.appendChild(buildManageRow(r, p, false)));
        listEl.appendChild(grp);
    }
};

window.msvAddCustomSpell = function() {
    window.addSpellRow('spellList', 1);
    window.refreshManageSpellsModal();
};

window.msvAddCantrip = function() {
    window.addSpellRow('cantripList', 0);
    window.refreshManageSpellsModal();
};

window.msvSearchAndAdd = function(containerId, filterType) {
    window.openSpellSearch(containerId, filterType, 9, null, function(spellData) {
        const target = (spellData.level === 0 && containerId === 'spellList') ? 'cantripList' : containerId;
        window.addSpellRow(target, spellData.level, spellData);
        window.refreshManageSpellsModal();
    });
};

// ===== SWITCH APP VIEW =====
window.switchAppView = function(viewId) {
    document.getElementById('view-selection-modal').style.display = 'none';
    const prev = window._currentMobileView;

    if (viewId === 'view-legacy') {
        document.body.classList.remove('app-view-active');
        const container = document.getElementById('app-views-container');
        if (container) container.style.display = 'none';
        if (window.unmountStatsView) window.unmountStatsView();
        if (window.unmountInventoryView) window.unmountInventoryView();
        if (window.unmountDefensesView) window.unmountDefensesView();
        if (window.unmountProficienciesView) window.unmountProficienciesView();
        if (window.unmountNotesView) window.unmountNotesView();
        if (window.unmountFeaturesView) window.unmountFeaturesView();
        if (window.unmountActionsView) window.unmountActionsView();
        window._currentMobileView = null;
        return;
    }

    document.body.classList.add('app-view-active');

    let container = document.getElementById('app-views-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'app-views-container';
        const sheet = document.querySelector('.character-sheet');
        if (sheet) sheet.appendChild(container);

        const views = [
            { id: 'view-stats', title: 'Ability Scores, Saving Throws, & Skills' },
            { id: 'view-actions', title: 'Actions' },
            { id: 'view-inventory', title: 'Inventory' },
            { id: 'view-spells', title: 'Spells' },
            { id: 'view-features', title: 'Features & Traits' },
            { id: 'view-defenses', title: 'Speed & Defenses' },
            { id: 'view-proficiencies', title: 'Proficiencies & Training' },
            { id: 'view-notes', title: 'Notes' },
            { id: 'view-summons', title: 'Summons & Creatures' }
        ];
        window._appViewOrder = views.map(v => v.id);

        const noPlaceholder = new Set(['view-stats', 'view-actions', 'view-inventory', 'view-spells', 'view-features', 'view-defenses', 'view-proficiencies', 'view-notes', 'view-summons']);
        views.forEach(v => {
            const vDiv = document.createElement('div');
            vDiv.id = v.id;
            vDiv.className = 'app-view';
            vDiv.style.display = 'none';
            if (!noPlaceholder.has(v.id)) {
                vDiv.innerHTML = `<h2 class="section-title">${v.title}</h2><div style="text-align:center; color:var(--ink-light); padding: 20px; font-style: italic;">Empty for now, will add content later.</div>`;
            }
            container.appendChild(vDiv);
        });

        // Swipe gesture navigation
        let swipeTouchStartX = 0;
        let swipeTouchStartY = 0;
        container.addEventListener('touchstart', function(e) {
            swipeTouchStartX = e.touches[0].clientX;
            swipeTouchStartY = e.touches[0].clientY;
        }, { passive: true });
        container.addEventListener('touchend', function(e) {
            const dx = e.changedTouches[0].clientX - swipeTouchStartX;
            const dy = e.changedTouches[0].clientY - swipeTouchStartY;
            if (Math.abs(dx) < 50 || Math.abs(dx) < Math.abs(dy) * 1.5) return;
            const viewIds = views.map(v => v.id);
            const cur = viewIds.indexOf(window._currentMobileView);
            if (cur === -1) return;
            if (dx < 0 && cur < viewIds.length - 1) window.switchAppView(viewIds[cur + 1]);
            else if (dx > 0 && cur > 0) window.switchAppView(viewIds[cur - 1]);
        }, { passive: true });
    }

    container.style.display = 'flex';

    // Unmount previous view before mounting new one
    if (prev !== viewId) {
        if (prev === 'view-stats' && window.unmountStatsView) window.unmountStatsView();
        if (prev === 'view-inventory' && window.unmountInventoryView) window.unmountInventoryView();
        if (prev === 'view-defenses' && window.unmountDefensesView) window.unmountDefensesView();
        if (prev === 'view-proficiencies' && window.unmountProficienciesView) window.unmountProficienciesView();
        if (prev === 'view-notes' && window.unmountNotesView) window.unmountNotesView();
        if (prev === 'view-summons' && window.unmountSummonsView) window.unmountSummonsView();
        if (prev === 'view-features' && window.unmountFeaturesView) window.unmountFeaturesView();
        if (prev === 'view-actions' && window.unmountActionsView) window.unmountActionsView();
    }

    // Hide all views
    document.querySelectorAll('.app-view').forEach(v => v.style.display = 'none');

    // Mount new view
    if (viewId === 'view-stats' && window.mountStatsView) window.mountStatsView();
    if (viewId === 'view-inventory' && window.mountInventoryView) window.mountInventoryView();
    if (viewId === 'view-spells' && window.mountSpellView) window.mountSpellView();
    if (viewId === 'view-defenses' && window.mountDefensesView) window.mountDefensesView();
    if (viewId === 'view-proficiencies' && window.mountProficienciesView) window.mountProficienciesView();
    if (viewId === 'view-notes' && window.mountNotesView) window.mountNotesView();
    if (viewId === 'view-summons' && window.mountSummonsView) window.mountSummonsView();
    if (viewId === 'view-features' && window.mountFeaturesView) window.mountFeaturesView();
    if (viewId === 'view-actions' && window.mountActionsView) window.mountActionsView();
    window._currentMobileView = viewId;

    const activeView = document.getElementById(viewId);
    if (activeView) {
        activeView.style.display = 'block';
        const order = window._appViewOrder;
        if (order && prev && prev !== viewId) {
            const prevIdx = order.indexOf(prev);
            const newIdx = order.indexOf(viewId);
            if (prevIdx !== -1 && newIdx !== -1) {
                const animClass = newIdx > prevIdx ? 'slide-from-right' : 'slide-from-left';
                activeView.classList.remove('slide-from-right', 'slide-from-left');
                void activeView.offsetWidth; // force reflow so animation restarts
                activeView.classList.add(animClass);
                setTimeout(() => activeView.classList.remove(animClass), 250);
            }
        }
    }
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

window.syncMobileHeaderToReal = function() {
    const pairs = [
        { mh: 'mh-charName', real: 'charName', type: 'value' },
        { mh: 'mh-race', real: 'race', type: 'value' },
        { mh: 'mh-charClass', real: 'charClass', type: 'value' },
        { mh: 'mh-charSubclass', real: 'charSubclass', type: 'value' },
        { mh: 'mh-level', real: 'level', type: 'value' },
        { mh: 'mh-baseAC', real: 'baseAC', type: 'value' },
        { mh: 'mh-initiative', real: 'initiative', type: 'value' },
        { mh: 'mh-heroicInspiration', real: 'heroicInspiration', type: 'checked' }
    ];
    pairs.forEach(p => {
        const mhEl = document.getElementById(p.mh);
        const realEl = document.getElementById(p.real);
        if (mhEl && realEl) {
            mhEl[p.type] = realEl[p.type];
            if (realEl.readOnly !== undefined) {
                mhEl.readOnly = realEl.readOnly;
            }
        }
    });
    const mhCond = document.getElementById('mh-activeConditionsInput');
    const realCond = document.getElementById('activeConditionsInput');
    if (mhCond && realCond) {
        mhCond.value = realCond.value;
    }
    const mhHp = document.getElementById('mh-hp');
    const hpEl = document.getElementById('hp');
    const tempHpEl = document.getElementById('tempHp');
    if (mhHp && hpEl) {
        const cur = parseInt(hpEl.value) || 0;
        const temp = tempHpEl ? parseInt(tempHpEl.value) : 0;
        if (temp > 0) {
            mhHp.innerHTML = `${cur} <span style="color:#2d6a4f; font-size:0.9rem;">(+${temp})</span>`;
        } else {
            mhHp.innerHTML = cur;
        }
    }
    
    [0, 1, 2].forEach(i => {
        const sCb = document.getElementById(`mh-ds-s${i}`);
        const fCb = document.getElementById(`mh-ds-f${i}`);
        if (sCb) sCb.checked = document.getElementById(`deathSuccess${i}`)?.classList.contains('checked') || false;
        if (fCb) fCb.checked = document.getElementById(`deathFailure${i}`)?.classList.contains('checked') || false;
    });
};

window.initMobileHeader = function() {
    const sheet = document.querySelector('.character-sheet');
    if (!sheet) return;
    if (document.getElementById('mobile-sync-header')) return;

    const mh = document.createElement('div');
    mh.id = 'mobile-sync-header';
    mh.innerHTML = `
        <input type="text" id="mh-charName" class="mh-name" placeholder="Character Name">
        <div class="mh-class-info">
            <input type="text" id="mh-race" placeholder="Race">
            <input type="text" id="mh-charClass" placeholder="Class">
            <input type="text" id="mh-charSubclass" placeholder="Subclass">
            <span>Lvl</span><input type="number" id="mh-level" placeholder="1">
        </div>
        <div class="mh-stats-row" style="margin-bottom: 8px;">
            <div class="mh-ac-box">
                <span class="mh-label">AC</span>
                <input type="number" id="mh-baseAC">
            </div>
            <div class="mh-init-box">
                <span class="mh-label">Init</span>
                <input type="text" id="mh-initiative">
            </div>
            <div class="mh-heroic">
                <input type="checkbox" id="mh-heroicInspiration">
                <label for="mh-heroicInspiration">Insp.</label>
            </div>
            <button class="mh-more-btn" onclick="window.openMobileMoreModal()">&#8942;</button>
        </div>
        <div class="mh-stats-row">
            <div class="mh-hp-box" onclick="if(window.openHpManagementModal) window.openHpManagementModal();">
                <span class="mh-label">HP</span>
                <div id="mh-hp" style="pointer-events: none;"></div>
            </div>
            <div class="mh-death-saves-box" id="mh-death-saves" style="display: none;">
                <div class="mh-ds-tracker">
                    <span style="color:var(--ink);">S</span>
                    <input type="checkbox" id="mh-ds-s0"><input type="checkbox" id="mh-ds-s1"><input type="checkbox" id="mh-ds-s2">
                </div>
                <div class="mh-ds-tracker">
                    <span style="color:var(--red);">F</span>
                    <input type="checkbox" id="mh-ds-f0"><input type="checkbox" id="mh-ds-f1"><input type="checkbox" id="mh-ds-f2">
                </div>
                <button class="mh-more-btn" onclick="if(window.openHpManagementModal) window.openHpManagementModal();" style="margin-left:auto; padding:0 2px;">&#8942;</button>
            </div>
            <div class="mh-conditions-box" id="mh-cond-wrapper">
                <input type="text" id="mh-activeConditionsInput" placeholder="Conditions" readonly style="pointer-events: none;">
            </div>
        </div>
        <div style="display:flex; gap:6px; margin-top:6px;">
            <button class="rest-btn rest-btn-sr" style="flex:1; padding:6px 4px;" onclick="window.doShortRest()">Short Rest</button>
            <button class="rest-btn rest-btn-lr" style="flex:1; padding:6px 4px;" onclick="window.doLongRest()">Long Rest</button>
        </div>
    `;
    sheet.prepend(mh);

    const pairs = [
        { mh: 'mh-charName', real: 'charName', type: 'value' },
        { mh: 'mh-race', real: 'race', type: 'value' },
        { mh: 'mh-charClass', real: 'charClass', type: 'value' },
        { mh: 'mh-charSubclass', real: 'charSubclass', type: 'value' },
        { mh: 'mh-level', real: 'level', type: 'value' },
        { mh: 'mh-baseAC', real: 'baseAC', type: 'value' },
        { mh: 'mh-initiative', real: 'initiative', type: 'value' },
        { mh: 'mh-heroicInspiration', real: 'heroicInspiration', type: 'checked' }
    ];

    pairs.forEach(p => {
        const mhEl = document.getElementById(p.mh);
        const realEl = document.getElementById(p.real);
        if (mhEl && realEl) {
            mhEl.addEventListener('input', (e) => {
                realEl[p.type] = mhEl[p.type];
                realEl.dispatchEvent(new Event('input', { bubbles: true }));
                realEl.dispatchEvent(new Event('change', { bubbles: true }));
            });
            mhEl.addEventListener('change', (e) => {
                realEl[p.type] = mhEl[p.type];
                realEl.dispatchEvent(new Event('input', { bubbles: true }));
                realEl.dispatchEvent(new Event('change', { bubbles: true }));
            });
            realEl.addEventListener('input', () => mhEl[p.type] = realEl[p.type]);
            realEl.addEventListener('change', () => mhEl[p.type] = realEl[p.type]);
        }
    });

    [0, 1, 2].forEach(i => {
        const sCb = document.getElementById(`mh-ds-s${i}`);
        const fCb = document.getElementById(`mh-ds-f${i}`);
        if (sCb) sCb.addEventListener('change', (e) => {
            const isChecked = document.getElementById(`deathSuccess${i}`)?.classList.contains('checked');
            if (e.target.checked !== isChecked) window.toggleDeathSave('success', i);
        });
        if (fCb) fCb.addEventListener('change', (e) => {
            const isChecked = document.getElementById(`deathFailure${i}`)?.classList.contains('checked');
            if (e.target.checked !== isChecked) window.toggleDeathSave('failure', i);
        });
    });

    if (!window.mobileDeathSaveOverrideApplied) {
        const originalToggleDeathSave = window.toggleDeathSave;
        window.toggleDeathSave = function(type, index) {
            if (originalToggleDeathSave) originalToggleDeathSave(type, index);
            if (window.syncMobileHeaderToReal) window.syncMobileHeaderToReal();
        };
        window.mobileDeathSaveOverrideApplied = true;
    }

    const mhCondWrapper = document.getElementById('mh-cond-wrapper');
    const mhCond = document.getElementById('mh-activeConditionsInput');
    const realCond = document.getElementById('activeConditionsInput');
    if (mhCondWrapper && realCond && mhCond) {
        mhCondWrapper.onclick = () => {
            if (window.isDataAvailable) window.openConditionModal();
            else realCond.focus();
        };
        realCond.addEventListener('input', () => mhCond.value = realCond.value);
        realCond.addEventListener('change', () => mhCond.value = realCond.value);
    }
    
    const originalUpdateHpBar = window.updateHpBar;
    window.updateHpBar = function() {
        if (originalUpdateHpBar) originalUpdateHpBar();
        const mhHp = document.getElementById('mh-hp');
        const hpEl = document.getElementById('hp');
        const tempHpEl = document.getElementById('tempHp');
        
        const mhHpBox = document.querySelector('.mh-hp-box');
        const mhDsBox = document.getElementById('mh-death-saves');

        if (mhHp && hpEl) {
            const cur = parseInt(hpEl.value) || 0;
            const temp = tempHpEl ? parseInt(tempHpEl.value) : 0;
            if (temp > 0) {
                mhHp.innerHTML = `${cur} <span style="color:#2d6a4f; font-size:0.9rem;">(+${temp})</span>`;
            } else {
                mhHp.innerHTML = cur;
            }
            
            if (mhHpBox && mhDsBox) {
                if (cur <= 0) {
                    mhHpBox.style.display = 'none';
                    mhDsBox.style.display = 'flex';
                } else {
                    mhHpBox.style.display = 'flex';
                    mhDsBox.style.display = 'none';
                }
            }
        }
    };
    
    const originalRenderConds = window.renderConditionTags;
    window.renderConditionTags = function() {
        if (originalRenderConds) originalRenderConds();
        const condEl = document.getElementById('activeConditionsInput');
        if (condEl) document.getElementById('mh-activeConditionsInput').value = condEl.value;
    };

    const originalUpdateClassDisplay = window.updateClassDisplay;
    window.updateClassDisplay = function() {
        if (originalUpdateClassDisplay) originalUpdateClassDisplay();
        if (window.syncMobileHeaderToReal) window.syncMobileHeaderToReal();
    };

    const originalUpdateModifiers = window.updateModifiers;
    window.updateModifiers = function() {
        if (originalUpdateModifiers) originalUpdateModifiers();
        if (window.syncMobileHeaderToReal) window.syncMobileHeaderToReal();
    };

    const originalCalculateTotalAC = window.calculateTotalAC;
    window.calculateTotalAC = function() {
        if (originalCalculateTotalAC) originalCalculateTotalAC();
        if (window.syncMobileHeaderToReal) window.syncMobileHeaderToReal();
    };
};

window.openMobileMoreModal = function() {
    let modal = document.getElementById('mhMoreModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'mhMoreModal';
        modal.className = 'info-modal-overlay';
        modal.innerHTML = `
            <div class="info-modal-content" style="max-width: 320px; text-align: center; padding: 20px;">
                <button class="close-modal-btn" onclick="document.getElementById('mhMoreModal').style.display='none'">&times;</button>
                <h3 class="info-modal-title">Character Details</h3>
                <div class="field" style="margin-bottom: 10px; text-align: left;">
                    <span class="field-label">Background</span>
                    <input type="text" id="mh-modal-bg" style="font-weight:bold; color: var(--ink);">
                </div>
                <div class="field" style="margin-bottom: 10px; text-align: left;">
                    <span class="field-label">Alignment</span>
                    <input type="text" id="mh-modal-align" style="font-weight:bold; color: var(--red-dark); cursor: pointer;" readonly>
                </div>
                <div class="field" style="margin-bottom: 15px; text-align: left;">
                    <span class="field-label">Experience</span>
                    <div style="display:flex; gap:8px; align-items:center;">
                        <input type="number" id="mh-modal-exp" style="font-weight:bold; color: var(--ink); flex:1; text-align:left;">
                        <button class="btn btn-secondary" onclick="const btn = document.getElementById('addExpBtn'); if(btn) btn.click(); document.getElementById('mhMoreModal').style.display='none';" style="padding: 4px 12px; font-size: 0.85rem;">+ XP</button>
                    </div>
                </div>
            </div>
        `;
        document.body.appendChild(modal);

        const sync = (modalId, realId) => {
            const mEl = document.getElementById(modalId);
            const rEl = document.getElementById(realId);
            if (!mEl || !rEl) return;
            mEl.addEventListener('input', () => { 
                rEl.value = mEl.value; 
                if (window.saveCharacter) window.saveCharacter(); 
            });
            rEl.addEventListener('input', () => mEl.value = rEl.value);
            rEl.addEventListener('change', () => mEl.value = rEl.value);
        };
        sync('mh-modal-bg', 'background');
        sync('mh-modal-exp', 'experience');

        const alignModalEl = document.getElementById('mh-modal-align');
        const realAlign = document.getElementById('alignment');
        if (alignModalEl && realAlign) {
            alignModalEl.onclick = () => {
                document.getElementById('mhMoreModal').style.display = 'none';
                realAlign.click();
            };
            if (!window.mobileAlignOverrideApplied) {
                const originalSetAlignment = window.setAlignment;
                window.setAlignment = function(val) {
                    if (originalSetAlignment) originalSetAlignment(val);
                    alignModalEl.value = val;
                };
                window.mobileAlignOverrideApplied = true;
            }
        }
    }
    
    const bgEl = document.getElementById('background');
    const alignEl = document.getElementById('alignment');
    const expEl = document.getElementById('experience');
    
    if(bgEl) document.getElementById('mh-modal-bg').value = bgEl.value;
    if(alignEl) document.getElementById('mh-modal-align').value = alignEl.value;
    if(expEl) document.getElementById('mh-modal-exp').value = expEl.value;
    
    modal.style.display = 'flex';
};

/* =========================================
      6. INITIALIZATION
      ========================================= */
// Reset to full sheet on bfcache restore (iOS Safari / mobile back-forward nav)
window.addEventListener('pageshow', (e) => {
  if (e.persisted) {
    document.body.classList.remove('app-view-active');
    const c = document.getElementById('app-views-container');
    if (c) c.style.display = 'none';
    if (window.unmountStatsView) window.unmountStatsView();
    if (window.unmountInventoryView) window.unmountInventoryView();
    if (window.unmountDefensesView) window.unmountDefensesView();
    if (window.unmountProficienciesView) window.unmountProficienciesView();
    if (window.unmountNotesView) window.unmountNotesView();
    if (window.unmountFeaturesView) window.unmountFeaturesView();
    if (window.unmountActionsView) window.unmountActionsView();
    window._currentMobileView = null;
  }
});

document.addEventListener("DOMContentLoaded", () => {
  // Always start with full sheet (no filtered view active)
  document.body.classList.remove('app-view-active');
  const existingContainer = document.getElementById('app-views-container');
  if (existingContainer) existingContainer.style.display = 'none';

  // Load Dense Mode Preference
  if (localStorage.getItem("denseMode") === "true") {
    document.body.classList.add("dense-mode");
  }
  // Load Swap Scores Preference
  if (localStorage.getItem("swapScores") === "true") {
    document.body.classList.add("swap-scores");
  }

  // Initialize UI components (Sidebar, QuickNav)
  if (window.createSidebarMenu) window.createSidebarMenu();
  if (window.initQuickNav) window.initQuickNav();
  
  // Inject DDB HP Box
  if (window.injectDDBHPBox) window.injectDDBHPBox();

  // Inject Mobile Header
  if (window.initMobileHeader) window.initMobileHeader();

  // Apply responsive stat names automatically on initial load
  if (window.updateResponsiveStatNames) window.updateResponsiveStatNames();

  // Inject mobile mod labels globally for grid layout (mobile/tablet only)
  if (window.injectMobileModLabels && window.matchMedia('(max-width: 900px)').matches) window.injectMobileModLabels();
  if (window.injectExpertiseButtons) window.injectExpertiseButtons();

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

    // Load Dense Mode Preference
    if (localStorage.getItem("denseMode") === "true") {
      document.body.classList.add("dense-mode");
    }
    // Load Swap Scores Preference
    if (localStorage.getItem("swapScores") === "true") {
      document.body.classList.add("swap-scores");
    }

  window.isInitializing = true;

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
      const totalXpInput =
        parseInt(document.getElementById("expTotalInput").value) || 0;
      const partySize =
        parseInt(document.getElementById("expPartySize").value) || 1;
      if (partySize < 1) return;
      const toAdd = Math.floor(totalXpInput / partySize);

      const leftoverStored = parseInt(document.getElementById("experience").value) || 0;
      let currentLevel = parseInt(document.getElementById("level").value) || 1;
      const oldLevel = currentLevel;

      // Reconstruct total XP from leftover-within-level + current level threshold
      const curLvlEntry = xpTable.find(x => x.lvl === currentLevel) || xpTable[0];
      let currentXp = curLvlEntry.xp + leftoverStored + toAdd;

      // Determine the new level from total accumulated XP
      let newEntry = xpTable[0];
      for (const entry of xpTable) {
        if (currentXp >= entry.xp) newEntry = entry;
        else break;
      }
      currentLevel = newEntry.lvl;
      if (newEntry.prof) document.getElementById("profBonus").value = newEntry.prof;

      // Display leftover XP within the new level (e.g. 0 when exactly on threshold)
      document.getElementById("experience").value = currentXp - newEntry.xp;
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
    document.getElementById("charClass").addEventListener("change", (e) => { if(window.characterClasses.length <= 1) { window.characterClasses[0] = window.characterClasses[0] || {}; window.characterClasses[0].name = e.target.value; window.characterClasses[0].level = parseInt(document.getElementById('level').value)||1; } if (window.updateComponentPouchVisibility) window.updateComponentPouchVisibility(); });
    document.getElementById("charSubclass").addEventListener("change", (e) => { if(window.characterClasses.length <= 1) { window.characterClasses[0] = window.characterClasses[0] || {}; window.characterClasses[0].subclass = e.target.value; } if (window.updateComponentPouchVisibility) window.updateComponentPouchVisibility(); });

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
        // Enforce swap scores preference over saved theme string
        if (localStorage.getItem("swapScores") === "true") {
          document.body.classList.add("swap-scores");
        } else {
          document.body.classList.remove("swap-scores");
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
      // Migrate old 'ac' key to 'baseAC'
      if (data.ac && !data.baseAC) {
        const acEl = document.getElementById('baseAC');
        if (acEl) acEl.value = data.ac;
      }
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
      if (data.skillExpertise) {
        Object.assign(skillExpertise, data.skillExpertise);
        Object.keys(skillExpertise).forEach(k => {
          if (skillExpertise[k]) document.getElementById(`expertiseBtn_${k}`)?.classList.add('expertise-active');
        });
      }
      if (data.saveExpertise) {
        Object.assign(saveExpertise, data.saveExpertise);
        Object.keys(saveExpertise).forEach(k => {
          if (saveExpertise[k]) document.getElementById(`expertiseBtnSave_${k}`)?.classList.add('expertise-active');
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
      const cpList = document.getElementById("componentPouchList");
      if (cpList) cpList.innerHTML = "";
      (data.componentPouch || []).forEach((item) => {
        try {
          addInventoryItem(item.name, item.qty, item.weight, false, item.description, true, 'componentPouchList');
        } catch (e) {}
      });

      if (data.spellSlotsData) spellSlotsData = data.spellSlotsData;
      if (data.resourcesData) resourcesData = data.resourcesData;
      if (data.summonsData) summonsData = data.summonsData;
      if (data.hitDiceUsed !== undefined) hitDiceUsed = data.hitDiceUsed;
      
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
      if (data.resistances !== undefined) { const el = document.getElementById('resistances'); if (el) el.value = data.resistances; }
      if (data.immunities !== undefined) { const el = document.getElementById('immunities'); if (el) el.value = data.immunities; }
      if (data.vulnerabilities !== undefined) { const el = document.getElementById('vulnerabilities'); if (el) el.value = data.vulnerabilities; }
      // Backward compat: old saved data had a single 'defenses' field
      if (data.defenses && !data.resistances) { const el = document.getElementById('resistances'); if (el) el.value = data.defenses; }
      // Backward compat: old saves stored XP as 'xp' key; now stored as 'experience'
      if (data.xp !== undefined && data.experience === undefined) { const el = document.getElementById('experience'); if (el) el.value = data.xp; }
      if (data.featuresFilter) window.switchFeaturesFilter(data.featuresFilter);
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
    if (window.updateComponentPouchVisibility) window.updateComponentPouchVisibility();
    renderSpellSlots();
    if (window.updateSpellRollTags) window.updateSpellRollTags();
    renderResources();
    window.renderSummons();
    updateHpBar();
    calculateWeight();
    renderWeaponTags();
    injectAdvantageToggles();
    updateAdvantageVisuals();
    resizeAllTextareas();
    // Auto-detect class resources (async, non-blocking)
    if (window.autoDetectClassResources) setTimeout(() => window.autoDetectClassResources(), 50);
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
        '#hpSettingsModal',
        '#restModal'
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
            if (!el) return;
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

    const attachBtn = (targetInput, btnId) => {
        if (!targetInput) return;
        let btn = document.getElementById(btnId);
        if (!btn) {
            btn = document.createElement('button');
            btn.id = btnId;
            btn.innerHTML = '▲'; 
            btn.title = "View Level Up Features";
            
            btn.style.position = 'absolute';
            if (btnId === 'mh-level-up-arrow-btn') {
                btn.style.right = '-12px'; 
                btn.style.top = '-8px';
            } else {
                btn.style.right = '5px'; 
                btn.style.top = '50%';
                btn.style.transform = 'translateY(-50%)';
            }
            
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
            
            if (targetInput.parentElement) {
                targetInput.parentElement.style.position = 'relative'; 
                targetInput.parentElement.appendChild(btn);
            }
        }
        
        btn.onclick = (e) => {
            e.preventDefault();
            e.stopPropagation();
            window.openLevelUpModal(level);
        };
        btn.style.display = 'flex';
    };

    attachBtn(document.getElementById('level'), 'level-up-arrow-btn');
    attachBtn(document.getElementById('mh-level'), 'mh-level-up-arrow-btn');
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
            <div class="info-modal-content" style="max-width: 700px; max-height: 85vh; display: flex; flex-direction: column;">
                <button class="close-modal-btn" onclick="document.getElementById('levelUpModal').style.display='none'">&times;</button>
                <h3 class="info-modal-title" style="text-align: center; margin-bottom: 0;">Level ${level} Features</h3>
                <div id="levelUpTabs" style="display:flex; border-bottom:2px solid var(--gold); padding:0 10px; gap:4px; background:var(--parchment-dark); flex-shrink:0;">
                    <button id="lvlup-tab-features" class="lvlup-tab lvlup-tab-active" onclick="window.switchLevelUpTab('features')">Features</button>
                    <button id="lvlup-tab-spells" class="lvlup-tab" onclick="window.switchLevelUpTab('spells')" style="display:none;">Spells</button>
                    <button id="lvlup-tab-hp" class="lvlup-tab" onclick="window.switchLevelUpTab('hp')" style="display:none;">HP</button>
                    <button id="lvlup-tab-asi" class="lvlup-tab" onclick="window.switchLevelUpTab('asi')" style="display:none;">ASI / Feat</button>
                </div>
                <div id="levelUpContent" style="overflow-y: auto; flex: 1; padding: 10px;">Loading...</div>
                <div id="levelUpSpellsPane" style="display:none; flex:1; overflow:hidden; flex-direction:column;">
                    <div style="display:flex; gap:0; flex:1; overflow:hidden;">
                        <div id="lvlup-spell-list" style="width:55%; border-right:1px solid var(--gold); display:flex; flex-direction:column; overflow:hidden;">
                            <div id="lvlup-spell-filter-row" style="padding:6px 8px; border-bottom:1px solid var(--gold); display:flex; gap:6px; background:var(--parchment-dark); flex-shrink:0;"></div>
                            <div id="lvlup-spell-table-wrap" style="overflow-y:auto; flex:1;"><div style="padding:10px; color:var(--ink-light); font-style:italic;">Loading spells…</div></div>
                        </div>
                        <div id="lvlup-spell-detail" style="width:45%; overflow-y:auto; padding:12px; font-size:0.88rem; line-height:1.55; background:white; color:var(--ink);">
                            <div style="color:var(--ink-light); font-style:italic; margin-top:20px; text-align:center;">Click a spell to view details.</div>
                        </div>
                    </div>
                    <div style="padding:6px 10px; border-top:1px solid var(--gold); background:var(--parchment-dark); display:flex; align-items:center; justify-content:space-between; flex-shrink:0;">
                        <span id="lvlup-spell-counter" style="font-size:0.85rem; color:var(--ink-light);">0 selected</span>
                        <span style="font-size:0.78rem; color:var(--ink-light); font-style:italic;">Click row to select · click again to deselect</span>
                    </div>
                </div>
                <div id="levelUpHPPane" style="display:none; overflow-y:auto; flex:1; padding:10px;"></div>
                <div id="levelUpASIPane" style="display:none; overflow-y:auto; flex:1; padding:10px;"></div>
                <div style="margin-top: auto; text-align: center; border-top: 1px solid var(--gold); padding: 10px; flex-shrink:0;">
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
            const mhBtn = document.getElementById('mh-level-up-arrow-btn');
            if (mhBtn) mhBtn.remove();
            document.getElementById('levelUpModal').style.display = 'none';
        });
    } else {
        modal.querySelector('.info-modal-title').textContent = `Level ${level} Features`;
        document.getElementById('levelUpContent').innerHTML = 'Loading...';
        document.getElementById('lvlup-tab-spells').style.display = 'none';
        document.getElementById('lvlup-tab-hp').style.display = 'none';
        document.getElementById('lvlup-tab-asi').style.display = 'none';
        window.switchLevelUpTab('features');
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
        const mhBtn = document.getElementById('mh-level-up-arrow-btn');
        if (mhBtn) mhBtn.remove();
        document.getElementById('levelUpModal').style.display = 'none';
        
        // Apply HP gain
        if (window.pendingLevelUpChanges?.hpGain) {
            const gain = window.pendingLevelUpChanges.hpGain;
            const maxHpEl = document.getElementById('maxHp');
            const hpEl = document.getElementById('hp');
            if (maxHpEl) {
                const newMax = (parseInt(maxHpEl.value) || 0) + gain;
                maxHpEl.value = newMax;
                if (hpEl) hpEl.value = (parseInt(hpEl.value) || 0) + gain;
            }
        }
        // Apply ASI choices
        if (window.pendingLevelUpChanges?.asiChoices?.length) {
            window.pendingLevelUpChanges.asiChoices.forEach(group => {
                if (!Array.isArray(group)) return;
                group.forEach(({ ability, bonus }) => {
                    const el = document.getElementById(ability);
                    if (el) el.value = Math.min(20, (parseInt(el.value) || 10) + bonus);
                });
            });
        }

        window.updateClassDisplay();
        window.saveCharacter();
        // Re-detect class resources for the new level
        if (window.autoDetectClassResources) window.autoDetectClassResources();

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

function showSpellDetail(s, pane) {
    const SCHOOL_FULL = { A: 'Abjuration', C: 'Conjuration', D: 'Divination', E: 'Enchantment', V: 'Evocation', I: 'Illusion', N: 'Necromancy', T: 'Transmutation' };
    const isRitual = !!(s.meta && s.meta.ritual);
    const isConc = !!(s.duration && s.duration.some(d => d.concentration));
    const hasMat = !!(s.components && s.components.m);
    let time = ''; if (s.time && s.time[0]) { const t = s.time[0]; time = `${t.number} ${t.unit}`; }
    const rangeStr = s.range ? (s.range.type === 'point' && s.range.distance ? (s.range.distance.type === 'self' ? 'Self' : s.range.distance.type === 'touch' ? 'Touch' : `${s.range.distance.amount||''} ${s.range.distance.type}`.trim()) : (s.range.type || '—')) : '—';
    let desc = window.processEntries ? window.processEntries(s.entries) : '';
    if (s.entriesHigherLevel) desc += '<hr style="margin:8px 0; border-color:var(--gold);">' + (window.processEntries ? window.processEntries(s.entriesHigherLevel) : '');
    desc = window.cleanText ? window.cleanText(desc) : desc;
    const lvlLabel = s.level === 0 ? 'Cantrip' : `Level ${s.level}`;
    const tags = [SCHOOL_FULL[s.school] || s.school || '', isRitual ? 'Ritual' : '', isConc ? 'Concentration' : '', hasMat ? 'Material' : ''].filter(Boolean).join(' · ');
    pane.innerHTML = `
        <div style="border-bottom:2px solid var(--gold); padding-bottom:8px; margin-bottom:10px;">
            <div style="font-family:'Cinzel',serif; font-weight:700; font-size:1rem; color:var(--red-dark);">${s.name}</div>
            <div style="font-size:0.78rem; color:var(--ink-light);">${lvlLabel} · ${tags}</div>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:4px 12px; font-size:0.8rem; margin-bottom:10px;">
            ${time ? `<div><strong>Casting:</strong> ${time}</div>` : ''}
            <div><strong>Range:</strong> ${rangeStr}</div>
            ${s.duration && s.duration[0] ? `<div><strong>Duration:</strong> ${s.duration[0].type || ''} ${s.duration[0].duration ? s.duration[0].duration.amount + ' ' + s.duration[0].duration.type : ''}</div>` : ''}
            ${s.components ? `<div><strong>Components:</strong> ${['V','S','M'].filter(c=>s.components[c.toLowerCase()]||s.components[c]).join(', ')}</div>` : ''}
        </div>
        <div style="font-size:0.85rem; line-height:1.6;">${desc}</div>
    `;
}

window.switchLevelUpTab = function(tab) {
    const panes = {
        features: document.getElementById('levelUpContent'),
        spells:   document.getElementById('levelUpSpellsPane'),
        hp:       document.getElementById('levelUpHPPane'),
        asi:      document.getElementById('levelUpASIPane'),
    };
    const tabs = {
        features: document.getElementById('lvlup-tab-features'),
        spells:   document.getElementById('lvlup-tab-spells'),
        hp:       document.getElementById('lvlup-tab-hp'),
        asi:      document.getElementById('lvlup-tab-asi'),
    };
    Object.values(panes).forEach(p => { if (p) p.style.display = 'none'; });
    Object.values(tabs).forEach(t => { if (t) t.classList.remove('lvlup-tab-active'); });
    if (tab === 'spells' && panes.spells) {
        panes.spells.style.display = 'flex';
        panes.spells.style.flexDirection = 'column';
    } else if (panes[tab]) {
        panes[tab].style.display = '';
    }
    if (tabs[tab]) tabs[tab].classList.add('lvlup-tab-active');
};

// ── Level-up: HP pane ──
const _LVLUP_HIT_DICE = { Barbarian:12, Fighter:10, Paladin:10, Ranger:10, Bard:8, Cleric:8, Druid:8, Monk:8, Rogue:8, Warlock:8, Sorcerer:6, Wizard:6, Artificer:8 };

window.renderLevelUpHPPane = function(charClass, level, minLevel) {
    const pane = document.getElementById('levelUpHPPane');
    if (!pane) return;
    const hpTabBtn = document.getElementById('lvlup-tab-hp');
    if (hpTabBtn) hpTabBtn.style.display = '';

    const hitDie = _LVLUP_HIT_DICE[charClass] || 8;
    const levelsGained = minLevel ? Math.max(1, level - minLevel + 1) : 1;
    const avgRoll = Math.floor(hitDie / 2) + 1;
    const conMod = Math.floor(((parseInt(document.getElementById('con')?.value) || 10) - 10) / 2);
    const currentMaxHp = parseInt(document.getElementById('maxHp')?.value) || 0;
    const avgGain = (avgRoll + conMod) * levelsGained;

    const abilityRows = Array.from({ length: levelsGained }, (_, i) =>
        `<div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
            <span style="color:var(--ink-light);font-size:0.88rem;min-width:80px;">${levelsGained > 1 ? `Level ${(minLevel || level) + i}:` : 'Roll:'}</span>
            <input id="hp-roll-${i}" type="number" min="1" max="${hitDie}" placeholder="1–${hitDie}"
                style="width:64px;text-align:center;font-size:1rem;font-weight:700;padding:4px 2px;border:1px solid var(--gold);border-radius:4px;background:var(--parchment);"
                oninput="window.updateHPPreview(${levelsGained},${hitDie},${conMod})">
            <span style="color:var(--ink-light);font-size:0.8rem;">/ d${hitDie}</span>
        </div>`
    ).join('');

    pane.innerHTML = `
        <div style="background:var(--parchment-dark);border:1px solid var(--gold);border-radius:6px;padding:10px 12px;margin-bottom:12px;display:flex;gap:16px;flex-wrap:wrap;font-size:0.88rem;">
            <span><span style="color:var(--ink-light);">Hit Die:</span> <strong>d${hitDie}</strong></span>
            <span><span style="color:var(--ink-light);">CON mod:</span> <strong>${conMod}</strong></span>
            <span><span style="color:var(--ink-light);">Levels gained:</span> <strong>${levelsGained}</strong></span>
            <span><span style="color:var(--ink-light);">Current Max HP:</span> <strong>${currentMaxHp}</strong></span>
        </div>
        <div style="display:flex;gap:8px;margin-bottom:14px;">
            <button id="hp-mode-avg" class="act-filter-pill active" onclick="window.selectHPMode('average')">Average</button>
            <button id="hp-mode-manual" class="act-filter-pill" onclick="window.selectHPMode('manual')">Manual (Roll)</button>
        </div>
        <div id="hp-avg-section" style="background:var(--parchment);border:1px solid var(--gold);border-radius:6px;padding:10px;margin-bottom:12px;font-size:0.9rem;">
            Average per level: <strong>${avgRoll}</strong> + <strong>${conMod}</strong> CON = <strong style="color:var(--red-dark);">${avgRoll + conMod}</strong>
            ${levelsGained > 1 ? `<div style="margin-top:4px;">Total (${levelsGained} levels): <strong style="color:var(--red-dark);">${avgGain}</strong></div>` : ''}
        </div>
        <div id="hp-manual-section" style="display:none;margin-bottom:12px;">${abilityRows}</div>
        <div id="hp-preview" style="background:var(--parchment-dark);border:2px solid var(--gold);border-radius:6px;padding:10px;text-align:center;font-size:0.95rem;">
            New Max HP: <strong>${currentMaxHp}</strong> + <strong style="color:var(--red-dark);">${avgGain}</strong> = <strong style="color:var(--red-dark);font-size:1.15rem;">${currentMaxHp + avgGain}</strong>
        </div>`;

    if (window.pendingLevelUpChanges) {
        window.pendingLevelUpChanges.hpMode = 'average';
        window.pendingLevelUpChanges.hpGain = avgGain;
    }
};

window.selectHPMode = function(mode) {
    document.getElementById('hp-mode-avg')?.classList.toggle('active', mode === 'average');
    document.getElementById('hp-mode-manual')?.classList.toggle('active', mode === 'manual');
    document.getElementById('hp-avg-section').style.display = mode === 'average' ? '' : 'none';
    document.getElementById('hp-manual-section').style.display = mode === 'manual' ? '' : 'none';
    if (window.pendingLevelUpChanges) window.pendingLevelUpChanges.hpMode = mode;
    if (mode === 'average') {
        // re-read average gain from preview text isn't reliable; just re-trigger
        const preview = document.getElementById('hp-preview');
        if (preview && window.pendingLevelUpChanges?._hpAvgGain !== undefined) {
            const g = window.pendingLevelUpChanges._hpAvgGain;
            const cur = window.pendingLevelUpChanges._hpCurrent || 0;
            preview.innerHTML = `New Max HP: <strong>${cur}</strong> + <strong style="color:var(--red-dark);">${g}</strong> = <strong style="color:var(--red-dark);font-size:1.15rem;">${cur + g}</strong>`;
            window.pendingLevelUpChanges.hpGain = g;
        }
    }
};

window.updateHPPreview = function(levelsGained, hitDie, conMod) {
    let total = 0;
    for (let i = 0; i < levelsGained; i++) {
        total += Math.max(1, Math.min(hitDie, parseInt(document.getElementById(`hp-roll-${i}`)?.value) || 0));
    }
    const gain = total + conMod * levelsGained;
    const cur = parseInt(document.getElementById('maxHp')?.value) || 0;
    const preview = document.getElementById('hp-preview');
    if (preview) preview.innerHTML = `New Max HP: <strong>${cur}</strong> + <strong style="color:var(--red-dark);">${gain}</strong> = <strong style="color:var(--red-dark);font-size:1.15rem;">${cur + gain}</strong>`;
    if (window.pendingLevelUpChanges) window.pendingLevelUpChanges.hpGain = gain;
};

// ── Level-up: ASI pane ──
window.renderLevelUpASIPane = function(asiFeatures) {
    const pane = document.getElementById('levelUpASIPane');
    if (!pane || !asiFeatures?.length) return;
    const asiTabBtn = document.getElementById('lvlup-tab-asi');
    if (asiTabBtn) asiTabBtn.style.display = '';

    if (!window.pendingLevelUpChanges.asiChoices) window.pendingLevelUpChanges.asiChoices = [];
    const pending = window.pendingLevelUpChanges.asiChoices;

    const STATS = [
        { id: 'str', label: 'Strength' }, { id: 'dex', label: 'Dexterity' },
        { id: 'con', label: 'Constitution' }, { id: 'int', label: 'Intelligence' },
        { id: 'wis', label: 'Wisdom' }, { id: 'cha', label: 'Charisma' },
    ];
    const statOpts = (selectedId = '') => STATS.map(s =>
        `<option value="${s.id}" ${s.id === selectedId ? 'selected' : ''}>${s.label} (${(parseInt(document.getElementById(s.id)?.value)||10)})</option>`
    ).join('');

    pane.innerHTML = '';
    asiFeatures.forEach((f, fi) => {
        const uid = `asi-${fi}`;
        const block = document.createElement('div');
        block.style.cssText = 'margin-bottom:18px;border:1px solid var(--gold);border-radius:6px;padding:12px;background:var(--parchment);';
        block.innerHTML = `
            <div style="font-weight:700;color:var(--red-dark);margin-bottom:10px;font-size:0.95rem;">${f.name} <span style="font-weight:400;color:var(--ink-light);font-size:0.8rem;">[Level ${f.level}]</span></div>
            <div style="display:flex;gap:8px;margin-bottom:12px;">
                <button class="act-filter-pill active" id="${uid}-mode-+2" onclick="window._asiSetMode('${uid}','+2')">+2 to One</button>
                <button class="act-filter-pill" id="${uid}-mode-+1+1" onclick="window._asiSetMode('${uid}','+1+1')">+1 / +1</button>
                <button class="act-filter-pill" id="${uid}-mode-feat" onclick="window._asiSetMode('${uid}','feat')">Feat</button>
            </div>
            <div id="${uid}-section-+2">
                <label style="font-size:0.88rem;color:var(--ink-light);">Choose ability (+2):</label>
                <select id="${uid}-stat1" class="styled-select" style="width:100%;margin-top:6px;" onchange="window._asiUpdate('${uid}')">
                    <option value="">— Choose —</option>${statOpts()}
                </select>
            </div>
            <div id="${uid}-section-+1+1" style="display:none;">
                <label style="font-size:0.88rem;color:var(--ink-light);">First ability (+1):</label>
                <select id="${uid}-statA" class="styled-select" style="width:100%;margin-top:6px;margin-bottom:8px;" onchange="window._asiUpdate('${uid}')">
                    <option value="">— Choose —</option>${statOpts()}
                </select>
                <label style="font-size:0.88rem;color:var(--ink-light);">Second ability (+1):</label>
                <select id="${uid}-statB" class="styled-select" style="width:100%;margin-top:6px;" onchange="window._asiUpdate('${uid}')">
                    <option value="">— Choose —</option>${statOpts()}
                </select>
            </div>
            <div id="${uid}-section-feat" style="display:none;">
                <div style="font-size:0.88rem;color:var(--ink-light);margin-bottom:8px;">Select a feat to add to your character.</div>
                <button class="add-feature-btn" onclick="window.openFeatSearch()">Browse Feats</button>
            </div>`;
        block.querySelector(`#${uid}-stat1`).addEventListener('change', () => window._asiUpdate(uid));
        pane.appendChild(block);
        // init entry
        pending[fi] = null;
    });
};

window._asiSetMode = function(uid, mode) {
    ['+2', '+1+1', 'feat'].forEach(m => {
        document.getElementById(`${uid}-mode-${m}`)?.classList.toggle('active', m === mode);
        const sec = document.getElementById(`${uid}-section-${m}`);
        if (sec) sec.style.display = m === mode ? '' : 'none';
    });
    window._asiUpdate(uid, mode);
};

window._asiUpdate = function(uid, modeOverride) {
    // Determine current mode
    const activeBtn = document.querySelector(`[id^="${uid}-mode-"].active`);
    const mode = modeOverride || (activeBtn ? activeBtn.id.replace(`${uid}-mode-`, '') : '+2');
    const idx = parseInt(uid.split('-')[1]);
    if (!window.pendingLevelUpChanges.asiChoices) window.pendingLevelUpChanges.asiChoices = [];
    if (mode === '+2') {
        const s = document.getElementById(`${uid}-stat1`)?.value;
        window.pendingLevelUpChanges.asiChoices[idx] = s ? [{ ability: s, bonus: 2 }] : null;
    } else if (mode === '+1+1') {
        const a = document.getElementById(`${uid}-statA`)?.value;
        const b = document.getElementById(`${uid}-statB`)?.value;
        window.pendingLevelUpChanges.asiChoices[idx] = (a && b && a !== b) ? [{ ability: a, bonus: 1 }, { ability: b, bonus: 1 }] : null;
    } else {
        window.pendingLevelUpChanges.asiChoices[idx] = null; // feat handled by feat search
    }
};

// ── Level-up helper: parse {type:"options"} blocks from a feature's entries ──
function lvlup_extractOptionSets(entries) {
    const optionSets = [];
    function walk(obj) {
        if (!obj || typeof obj !== 'object') return;
        if (Array.isArray(obj)) { obj.forEach(walk); return; }
        if (obj.type === 'options') {
            const count = obj.count != null ? obj.count : 1;
            const choices = [];
            if (obj.entries) {
                obj.entries.forEach(ent => {
                    if (ent.type === 'refOptionalfeature') choices.push({ type: 'optionalfeature', uid: ent.optionalfeature });
                    else if (ent.type === 'refClassFeature') choices.push({ type: 'classFeature', uid: ent.classFeature });
                    else if (ent.type === 'refSubclassFeature') choices.push({ type: 'subclassFeature', uid: ent.subclassFeature });
                    else if (ent.name) choices.push({ type: 'entries', name: ent.name, entries: ent.entries });
                });
            }
            if (choices.length > 0) {
                const setId = choices.map(c => c.uid || c.name || '').join('|').replace(/[^a-z0-9|]/gi, '').substring(0, 32);
                optionSets.push({ count, choices, setId });
            }
        }
        Object.values(obj).forEach(walk);
    }
    walk(entries);
    return optionSets;
}

// ── Level-up helper: find "choose X of the following" text patterns ──
function lvlup_extractChoiceLists(entries) {
    const CHOICE_RE = /\b(choose|pick|select)\b[^.]{0,60}?\b(one|two|three|four|five|\d+)\b|one of the following|\d+\s+of the following/i;
    const results = [];
    const wordToNum = { one: 1, two: 2, three: 3, four: 4, five: 5, a: 1, an: 1 };
    const parseCount = t => { const m = t.match(/\b(one|two|three|four|five|a|an|\d+)\b/i); return m ? (wordToNum[m[1].toLowerCase()] || parseInt(m[1]) || 1) : 1; };
    const stripTags = s => s.replace(/\{@[a-z]+\s([^|}]+)[^}]*\}/gi, '$1');

    function extractInlineItems(raw, clean) {
        // Try {@skill}/{@feat/{@item} tags first
        const tagMatches = [...raw.matchAll(/\{@(?:skill|feat|item|race|class|sense|action)\s+([^|}\s][^|}]*)/gi)];
        if (tagMatches.length >= 2) return tagMatches.map(m => ({ name: m[1].trim() }));
        // Fall back to comma/semicolon-separated after colon or after "following:"
        const colonIdx = clean.search(/:\s*/);
        if (colonIdx !== -1) {
            const after = clean.slice(colonIdx + 1);
            const parts = after.split(/,\s*|\s+or\s+/i).map(s => s.replace(/[.!?]$/, '').trim()).filter(s => s.length > 1 && s.length < 60 && !/\b(you|your|the|a |an |and )\b/i.test(s));
            if (parts.length >= 2) return parts.map(name => ({ name }));
        }
        return [];
    }

    function walk(arr, depth) {
        if (!Array.isArray(arr) || depth > 5) return;
        for (let i = 0; i < arr.length; i++) {
            const entry = arr[i];
            if (typeof entry === 'string') {
                const clean = stripTags(entry);
                if (CHOICE_RE.test(clean)) {
                    const next = arr[i + 1];
                    if (next && typeof next === 'object' && next.type === 'list' && Array.isArray(next.items)) {
                        const namedItems = next.items.filter(it => typeof it === 'object' && it.name && it.name.length <= 50 && !/[.!?]$/.test(it.name.trim()) && !/\b(attack|saving throw|bonus action|reaction|spell slot)\b/i.test(it.name));
                        if (namedItems.length >= 2) results.push({ prompt: clean, items: namedItems, count: parseCount(clean) });
                        else if (next.items.length >= 2) {
                            const strItems = next.items.map(it => typeof it === 'string' ? { name: stripTags(it) } : it).filter(it => it && it.name && it.name.length <= 60 && !/[.!?]$/.test(it.name.trim()) && !/\b(attack|saving throw|bonus action|reaction|spell slot|make a|force a|take a)\b/i.test(it.name));
                            if (strItems.length >= 2) results.push({ prompt: clean, items: strItems, count: parseCount(clean) });
                        }
                    } else {
                        // No adjacent list — try inline comma-separated items
                        const inlineItems = extractInlineItems(entry, clean);
                        if (inlineItems.length >= 2) results.push({ prompt: clean, items: inlineItems, count: parseCount(clean) });
                    }
                }
            } else if (entry && typeof entry === 'object') {
                if (entry.entries) walk(entry.entries, depth + 1);
                if (entry.items && entry.type !== 'list') walk(entry.items, depth + 1);
            }
        }
    }
    if (Array.isArray(entries)) walk(entries, 0);
    else if (entries && typeof entries === 'object') walk([entries], 0);
    const seen = new Set();
    return results.filter(r => { const k = r.prompt.slice(0, 80); if (seen.has(k)) return false; seen.add(k); return true; });
}

// ── Level-up helper: render choice checkboxes/radios for a feature ──
function lvlup_renderChoices(parentEl, featureName, featureLevel, optionSets, choiceLists, pendingChoices) {
    // Structured {type:"options"} choices
    optionSets.forEach(optSet => {
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'margin-top:8px; padding:8px; background:rgba(255,255,255,0.5); border:1px solid var(--gold-dark); border-radius:4px;';
        const header = document.createElement('div');
        header.style.cssText = 'font-weight:bold; margin-bottom:6px; border-bottom:1px solid var(--gold-dark); padding-bottom:3px; font-size:0.9rem; color:var(--red-dark);';
        header.textContent = `Choose ${optSet.count} option${optSet.count > 1 ? 's' : ''}:`;
        wrapper.appendChild(header);

        // Resolve candidate names (inline entries type don't need DB lookup)
        const candidates = optSet.choices.filter(c => c.type === 'entries');
        if (candidates.length === 0) {
            // UIDs that need DB — try to extract names from UID string
            optSet.choices.forEach(c => {
                const name = (c.uid || '').split('|')[0];
                if (name) candidates.push({ name, entries: null });
            });
        }

        candidates.forEach(candidate => {
            const key = `options:${optSet.setId}:${candidate.name}`;
            const lbl = document.createElement('label');
            lbl.style.cssText = 'display:flex; align-items:flex-start; gap:8px; margin-bottom:4px; cursor:pointer; padding:4px 6px; border-radius:3px;';
            lbl.onmouseover = () => lbl.style.background = 'rgba(0,0,0,0.05)';
            lbl.onmouseout = () => lbl.style.background = '';
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.style.cssText = 'flex-shrink:0; margin-top:3px; cursor:pointer; width:14px; height:14px;';
            cb.checked = !!(pendingChoices && pendingChoices.has(key));
            cb.addEventListener('change', () => {
                if (cb.checked) {
                    const checkedCount = wrapper.querySelectorAll('input[type="checkbox"]:checked').length;
                    if (checkedCount > optSet.count) { cb.checked = false; return; }
                    if (pendingChoices) pendingChoices.set(key, { name: candidate.name, desc: '' });
                } else {
                    if (pendingChoices) pendingChoices.delete(key);
                }
                // Dim other checkboxes if at limit
                const total = wrapper.querySelectorAll('input[type="checkbox"]');
                const checked = wrapper.querySelectorAll('input[type="checkbox"]:checked').length;
                total.forEach(c2 => { if (!c2.checked) { c2.disabled = checked >= optSet.count; c2.closest('label').style.opacity = (checked >= optSet.count) ? '0.5' : '1'; } });
            });
            const txt = document.createElement('div');
            txt.style.flex = '1';
            let descHtml = '';
            if (candidate.entries) {
                const raw = window.processEntries ? window.processEntries(candidate.entries) : '';
                descHtml = window.cleanText ? window.cleanText(raw) : raw;
            }
            txt.innerHTML = `<strong>${candidate.name}</strong>${descHtml ? `<div style="font-size:0.82em; color:var(--ink-light); margin-top:2px; line-height:1.4;">${descHtml}</div>` : ''}`;
            lbl.appendChild(cb);
            lbl.appendChild(txt);
            wrapper.appendChild(lbl);
        });
        if (candidates.length > 0) parentEl.appendChild(wrapper);
    });

    // Text-based "choose one of:" choices
    choiceLists.forEach((group, groupIdx) => {
        const groupKey = `text:${featureName}:${featureLevel}:${groupIdx}`;
        const isMulti = group.count > 1;
        const wrapper = document.createElement('div');
        wrapper.style.cssText = 'margin-top:8px; padding:8px; background:rgba(255,255,255,0.5); border:1px solid var(--gold-dark); border-radius:4px;';
        const cleanTags = s => s.replace(/\{@[a-z]+\s([^|}]+)[^}]*\}/gi, '$1');
        const promptEl = document.createElement('div');
        promptEl.style.cssText = 'font-weight:bold; margin-bottom:6px; border-bottom:1px solid var(--gold-dark); padding-bottom:3px; font-size:0.9rem; color:var(--red-dark);';
        promptEl.textContent = cleanTags(group.prompt) + (isMulti ? ` (Choose ${group.count})` : '');
        wrapper.appendChild(promptEl);

        group.items.forEach((item, itemIdx) => {
            if (!item) return;
            const itemName = typeof item === 'string' ? item : (item.name || `Option ${itemIdx + 1}`);
            const itemEntries = typeof item === 'object' ? (item.entries || item.entry) : null;
            const selKey = `${groupKey}:${itemName}`;
            const lbl = document.createElement('label');
            lbl.style.cssText = 'display:flex; align-items:flex-start; gap:8px; margin-bottom:4px; cursor:pointer; padding:4px 6px; border-radius:3px;';
            lbl.onmouseover = () => lbl.style.background = 'rgba(0,0,0,0.05)';
            lbl.onmouseout = () => lbl.style.background = '';
            const inp = document.createElement('input');
            inp.type = isMulti ? 'checkbox' : 'radio';
            inp.name = `lvlup-${groupKey}`;
            inp.value = itemName;
            inp.style.cssText = 'flex-shrink:0; margin-top:3px; cursor:pointer; width:14px; height:14px;';
            inp.checked = !!(pendingChoices && pendingChoices.has(selKey));
            inp.addEventListener('change', () => {
                if (!isMulti && pendingChoices) {
                    // clear others in group
                    Array.from(pendingChoices.keys()).forEach(k => { if (k.startsWith(groupKey + ':')) pendingChoices.delete(k); });
                }
                if (inp.checked) {
                    if (isMulti) {
                        const cnt = wrapper.querySelectorAll('input:checked').length;
                        if (cnt > group.count) { inp.checked = false; return; }
                    }
                    if (pendingChoices) pendingChoices.set(selKey, { name: itemName, desc: '' });
                } else {
                    if (pendingChoices) pendingChoices.delete(selKey);
                }
                if (isMulti) {
                    const cnt = wrapper.querySelectorAll('input:checked').length;
                    wrapper.querySelectorAll('input').forEach(i2 => { if (!i2.checked) { i2.disabled = cnt >= group.count; i2.closest('label').style.opacity = (cnt >= group.count) ? '0.5' : '1'; } });
                }
            });
            const txt = document.createElement('div');
            txt.style.flex = '1';
            let descHtml = '';
            if (itemEntries) {
                const raw = window.processEntries ? window.processEntries(itemEntries) : '';
                descHtml = window.cleanText ? window.cleanText(raw) : raw;
            }
            txt.innerHTML = `<strong>${itemName}</strong>${descHtml ? `<div style="font-size:0.82em; color:var(--ink-light); margin-top:2px; line-height:1.4;">${descHtml}</div>` : ''}`;
            lbl.appendChild(inp);
            lbl.appendChild(txt);
            wrapper.appendChild(lbl);
        });
        parentEl.appendChild(wrapper);
    });
}

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
        window.pendingLevelUpChanges.asiChoices = [];
        window.pendingLevelUpChanges.hpGain = 0;
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
                            console.log(`[Level Up] Scanning subclasses in ${file.name}:`, json.subclass);
                            json.subclass.forEach(sc => {
                                if (sc.className && sc.className.trim().toLowerCase() === charClass.trim().toLowerCase()) subclasses.push(sc);
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

        // HP tab
        window.renderLevelUpHPPane(charClass, level, minLevel);
        // Store cached values for mode switching
        if (window.pendingLevelUpChanges) {
            const hd = _LVLUP_HIT_DICE[charClass] || 8;
            const lg = minLevel ? Math.max(1, level - minLevel + 1) : 1;
            const cm = Math.floor(((parseInt(document.getElementById('con')?.value)||10)-10)/2);
            window.pendingLevelUpChanges._hpAvgGain = (Math.floor(hd/2)+1+cm)*lg;
            window.pendingLevelUpChanges._hpCurrent = parseInt(document.getElementById('maxHp')?.value)||0;
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

            let spellHint = "";
            if (charClass === "Wizard") spellHint = "Wizards add 2 new spells to their spellbook.";
            else if (["Bard", "Sorcerer", "Warlock", "Ranger"].includes(charClass) || (charClass === "Fighter" && charSubclass && charSubclass.includes("Eldritch Knight")) || (charClass === "Rogue" && charSubclass && charSubclass.includes("Arcane Trickster"))) spellHint = "You typically learn 1 new spell per level.";
            else if (["Cleric", "Druid", "Paladin", "Artificer"].includes(charClass)) spellHint = "You have access to your full list. Add spells to prepare them.";

            let filterClass = charClass;
            if (charClass === "Fighter" && charSubclass && charSubclass.includes("Eldritch Knight")) filterClass = "Wizard";
            if (charClass === "Rogue" && charSubclass && charSubclass.includes("Arcane Trickster")) filterClass = "Wizard";

            // Show the Spells tab button
            const spellTabBtn = document.getElementById('lvlup-tab-spells');
            if (spellTabBtn) {
                spellTabBtn.style.display = '';
                spellTabBtn.textContent = `Spells (Max Lvl ${maxLevel})`;
            }

            // Update hint in spells pane footer
            const counterEl = document.getElementById('lvlup-spell-counter');
            if (counterEl && spellHint) {
                counterEl.closest('div').querySelector('span:last-child').textContent = spellHint;
            }

            // Populate the spell tab pane asynchronously
            const spellTableWrap = document.getElementById('lvlup-spell-table-wrap');
            const filterRowEl = document.getElementById('lvlup-spell-filter-row');
            const detailPane = document.getElementById('lvlup-spell-detail');
            if (!spellTableWrap) return; // shouldn't happen

            if (!window.pendingLevelUpChanges.customSpells) window.pendingLevelUpChanges.customSpells = [];
            const pendingSpells = window.pendingLevelUpChanges.customSpells;
            let maxSpellsSelectable = null; // will be set from class table after data loads
            const updateCounter = () => {
                if (!counterEl) return;
                if (maxSpellsSelectable !== null) {
                    counterEl.textContent = `${pendingSpells.length} / ${maxSpellsSelectable} spell${maxSpellsSelectable !== 1 ? 's' : ''} selected`;
                    counterEl.style.color = pendingSpells.length >= maxSpellsSelectable ? 'var(--red-dark)' : 'var(--ink-light)';
                } else {
                    counterEl.textContent = `${pendingSpells.length} selected`;
                    counterEl.style.color = 'var(--ink-light)';
                }
            };

            (async () => {
                try {
                    const db = await openDB();
                    const tx2 = db.transaction(STORE_NAME, 'readonly');
                    const store2 = tx2.objectStore(STORE_NAME);
                    const data2 = await new Promise(resolve => {
                        const req = store2.get('currentData');
                        req.onsuccess = () => resolve(req.result);
                        req.onerror = () => resolve(null);
                    });
                    if (!data2) { spellTableWrap.innerHTML = '<div style="padding:10px; color:var(--red);">No data loaded.</div>'; return; }

                    // Pass 1: Build spellClassMap from book/class description data
                    const lvlUpSpellClassMap = {};
                    const processLvlUpEntries = (entries, className) => {
                        if (!entries || !Array.isArray(entries)) return;
                        const addSpellRef = (sn, cls) => {
                            if (!sn || !cls) return;
                            const key = sn.toLowerCase().trim();
                            if (!lvlUpSpellClassMap[key]) lvlUpSpellClassMap[key] = new Set();
                            lvlUpSpellClassMap[key].add(cls.toLowerCase());
                        };
                        const extractSpellTags = (str, cls) => {
                            let m;
                            const re = /{@spell ([^}|]+)/g;
                            while ((m = re.exec(str)) !== null) addSpellRef(m[1], cls);
                        };
                        entries.forEach(entry => {
                            if (!entry) return;
                            // String entries may contain {@spell ...} tags inline
                            if (typeof entry === 'string') { extractSpellTags(entry, className); return; }
                            let cls = className;
                            if (entry.name && typeof entry.name === 'string' && entry.name.endsWith(' Spells')) {
                                cls = entry.name.replace(' Spells', '').trim();
                            }
                            if (cls && entry.items && Array.isArray(entry.items)) {
                                entry.items.forEach(itemStr => {
                                    if (typeof itemStr === 'string') extractSpellTags(itemStr, cls);
                                });
                            }
                            if (entry.entries) processLvlUpEntries(entry.entries, cls);
                        });
                    };
                    data2.forEach(file => {
                        if (!file.name.toLowerCase().endsWith('.json')) return;
                        try {
                            const json = JSON.parse(file.content);
                            if (json.class) json.class.forEach(cls => processLvlUpEntries(cls.classFeatures || [], cls.name));
                            if (json.classFeature) json.classFeature.forEach(f => processLvlUpEntries(f.entries || [], f.className));
                            if (json.subclassFeature) json.subclassFeature.forEach(f => processLvlUpEntries(f.entries || [], f.className));
                        } catch (e) {}
                    });

                    // Pass 2: Build spell map filtered by class
                    const spellMap = new Map();
                    data2.forEach(file => {
                        if (!file.name.toLowerCase().endsWith('.json')) return;
                        try {
                            const json = JSON.parse(file.content);
                            const arr = json.spell || json.spells || json.data;
                            if (!Array.isArray(arr)) return;
                            arr.forEach(s => {
                                if (!s || !s.name || s.level > maxLevel) return;
                                const tgt = filterClass.toLowerCase();
                                let ok = false;
                                if (s.classes) {
                                    const checkC = c => (typeof c === 'string' ? c : c.name).toLowerCase() === tgt;
                                    if (s.classes.fromClassList && s.classes.fromClassList.some(checkC)) ok = true;
                                    if (!ok && s.classes.fromClassListVariant && s.classes.fromClassListVariant.some(checkC)) ok = true;
                                    if (!ok && Array.isArray(s.classes) && s.classes.some(checkC)) ok = true;
                                }
                                // Enrich via book-derived class map (stored lowercase)
                                if (!ok) {
                                    const mapped = lvlUpSpellClassMap[s.name.toLowerCase().trim()];
                                    if (mapped && mapped.has(filterClass.toLowerCase())) ok = true;
                                }
                                if (!ok && charSubclass && s.classes && s.classes.fromSubclass) {
                                    if (s.classes.fromSubclass.some(sc => sc.class && sc.class.name.toLowerCase() === tgt && sc.subclass && sc.subclass.shortName.toLowerCase() === charSubclass.toLowerCase())) ok = true;
                                }
                                if (!ok) return;
                                if (!spellMap.has(s.name)) spellMap.set(s.name, s);
                                else {
                                    const ex = spellMap.get(s.name);
                                    if (s.source === 'XPHB') spellMap.set(s.name, s);
                                    else if (s.source === 'PHB' && ex.source !== 'XPHB') spellMap.set(s.name, s);
                                }
                            });
                        } catch (e) {}
                    });
                    const spells = Array.from(spellMap.values()).sort((a, b) => a.level - b.level || a.name.localeCompare(b.name));
                    if (spells.length === 0) { spellTableWrap.innerHTML = '<div style="padding:10px; color:var(--ink-light); font-style:italic;">No spells found for this class.</div>'; return; }
                    // canLearnCantrips will be resolved below; trim after that lookup

                    const existingOnSheet = new Set(Array.from(document.querySelectorAll('.spell-name')).map(i => i.value.toLowerCase()));

                    // Determine max spells selectable + cantrip gain from class table
                    let canLearnCantrips = true; // assume yes unless class table says no gain
                    try {
                        let classObj = null;
                        data2.forEach(file => {
                            if (!file.name.toLowerCase().endsWith('.json')) return;
                            try {
                                const json = JSON.parse(file.content);
                                if (json.class) {
                                    json.class.filter(c => c.name.toLowerCase() === charClass.toLowerCase()).forEach(m => {
                                        if (!classObj) classObj = m;
                                        else if (m.source === 'XPHB') classObj = m;
                                        else if (m.source === 'PHB' && classObj.source !== 'XPHB') classObj = m;
                                    });
                                }
                            } catch (e) {}
                        });
                        if (classObj && classObj.classTableGroups) {
                            const li = level - 1, pi = level - 2;
                            const stripTag = s => s.replace(/{@\w+\s*([^}]+)?}/g, '$1');
                            const getColDiff = (regex) => {
                                for (const group of classObj.classTableGroups) {
                                    if (!group.colLabels) continue;
                                    const ci = group.colLabels.findIndex(l => regex.test(stripTag(l)));
                                    if (ci !== -1 && group.rows && group.rows[li]) {
                                        const cur = group.rows[li][ci];
                                        const prev = pi >= 0 && group.rows[pi] ? group.rows[pi][ci] : 0;
                                        const curV = parseInt(typeof cur === 'object' ? (cur.value ?? cur) : cur) || 0;
                                        const prevV = parseInt(typeof prev === 'object' ? (prev.value ?? prev) : prev) || 0;
                                        return { cur: curV, prev: prevV, diff: curV - prevV };
                                    }
                                }
                                return null;
                            };

                            const spellsKnown = getColDiff(/Spells\s*Known/i);
                            if (spellsKnown && spellsKnown.diff > 0) maxSpellsSelectable = spellsKnown.diff;

                            const cantripsKnown = getColDiff(/Cantrips\s*Known/i);
                            if (cantripsKnown !== null) {
                                // Class has a cantrips column — only allow cantrips if gained this level
                                canLearnCantrips = cantripsKnown.diff > 0;
                            }
                            // If no cantrips column exists, leave canLearnCantrips = true (can't tell, show them)
                        }
                        // Wizards always learn 2 spells per level (no cantrips via leveling)
                        if (charClass === 'Wizard' && maxSpellsSelectable === null) maxSpellsSelectable = 2;
                        if (charClass === 'Wizard') canLearnCantrips = false;
                        updateCounter();
                    } catch (e) {}

                    // Build search filter
                    if (filterRowEl) {
                        filterRowEl.innerHTML = '';
                        filterRowEl.style.cssText = 'padding:6px 8px; border-bottom:1px solid var(--gold); display:grid; grid-template-columns:1fr 1fr; gap:6px; background:var(--parchment-dark); flex-shrink:0;';
                        const searchInp = document.createElement('input');
                        searchInp.type = 'text';
                        searchInp.placeholder = 'Search spells…';
                        searchInp.style.cssText = 'width:100%; font-size:0.82rem; padding:4px 8px; border:1px solid var(--gold); border-radius:3px; background:var(--parchment); box-sizing:border-box;';
                        const lvlFilter = document.createElement('select');
                        lvlFilter.style.cssText = 'width:100%; font-size:0.82rem; padding:4px 6px; border:1px solid var(--gold); border-radius:3px; background:var(--parchment); box-sizing:border-box;';
                        lvlFilter.innerHTML = `<option value="">All Levels</option>${[...new Set(spells.map(s=>s.level))].filter(l => l !== 0 || canLearnCantrips).map(l=>`<option value="${l}">${l===0?'Cantrip':'Level '+l}</option>`).join('')}`;
                        filterRowEl.appendChild(searchInp);
                        filterRowEl.appendChild(lvlFilter);

                        const applyFilter = () => {
                            const q = searchInp.value.toLowerCase();
                            const lv = lvlFilter.value;
                            spellTableWrap.querySelectorAll('tr[data-spell]').forEach(tr2 => {
                                const nm = tr2.dataset.spell;
                                const sp = spells.find(x => x.name === nm);
                                if (!sp) return;
                                tr2.style.display = (!q || sp.name.toLowerCase().includes(q)) && (!lv || String(sp.level) === lv) ? '' : 'none';
                            });
                            spellTableWrap.querySelectorAll('.spell-level-section').forEach(sec => {
                                const visible = sec.querySelectorAll('tr[data-spell]:not([style*="display: none"]):not([style*="display:none"])').length;
                                sec.style.display = visible === 0 ? 'none' : '';
                            });
                        };
                        searchInp.addEventListener('input', applyFilter);
                        lvlFilter.addEventListener('change', applyFilter);
                    }

                    // Build spell tables grouped by level
                    spellTableWrap.innerHTML = '';
                    const SCHOOL_ABBR = { A: 'Abjur', C: 'Conj', D: 'Div', E: 'Ench', V: 'Evoc', I: 'Illus', N: 'Necro', T: 'Trans' };
                    const rowMap = new Map();

                    const atLimit = () => maxSpellsSelectable !== null && pendingSpells.length >= maxSpellsSelectable;

                    const updateStyles = () => {
                        rowMap.forEach((tr2, spell) => {
                            const isPending = pendingSpells.some(p => p.spellData.name === spell.name);
                            const isOnSheet = existingOnSheet.has(spell.name.toLowerCase());
                            const blocked = !isPending && !isOnSheet && atLimit();
                            tr2.style.background = isPending ? 'var(--red)' : isOnSheet ? 'rgba(200,200,200,0.15)' : '';
                            tr2.style.color = isPending ? 'white' : (isOnSheet || blocked) ? 'var(--ink-light)' : 'var(--ink)';
                            tr2.style.cursor = (isOnSheet || blocked) ? 'default' : 'pointer';
                            tr2.style.opacity = (isOnSheet || blocked) ? '0.45' : '1';
                        });
                    };

                    const levelGroups = [...new Set(spells.map(s => s.level))].filter(l => l !== 0 || canLearnCantrips).sort((a, b) => a - b);
                    levelGroups.forEach(lvl => {
                        const group = spells.filter(s => s.level === lvl);
                        const section = document.createElement('div');
                        section.className = 'spell-level-section';

                        // Level heading
                        const heading = document.createElement('div');
                        heading.style.cssText = 'font-family:"Cinzel",serif; font-size:0.72rem; font-weight:600; color:var(--red-dark); background:var(--parchment-dark); padding:3px 8px; border-bottom:1px solid var(--gold); border-top:1px solid var(--gold); letter-spacing:0.05em; text-transform:uppercase;';
                        heading.textContent = lvl === 0 ? 'Cantrips' : `Level ${lvl} Spells`;
                        section.appendChild(heading);

                        const tbl = document.createElement('table');
                        tbl.style.cssText = 'width:100%; border-collapse:collapse; font-size:0.78rem;';
                        tbl.innerHTML = `<thead><tr style="background:rgba(0,0,0,0.03); text-align:left; border-bottom:1px solid rgba(212,175,55,0.3);">
                            <th style="padding:2px 6px; color:var(--ink-light); font-weight:500; font-size:0.72rem;">Name</th>
                            <th style="padding:2px 6px; color:var(--ink-light); font-weight:500; font-size:0.72rem;">School</th>
                            <th style="padding:2px 6px; color:var(--ink-light); font-weight:500; font-size:0.72rem; text-align:center;" title="Ritual">R</th>
                            <th style="padding:2px 6px; color:var(--ink-light); font-weight:500; font-size:0.72rem; text-align:center;" title="Concentration">C</th>
                            <th style="padding:2px 6px; color:var(--ink-light); font-weight:500; font-size:0.72rem; text-align:center;" title="Material">M</th>
                            <th style="padding:2px 6px; color:var(--ink-light); font-weight:500; font-size:0.72rem;">Range</th>
                        </tr></thead>`;
                        const tbody = document.createElement('tbody');

                        group.forEach(s => {
                            const isRitual = !!(s.meta && s.meta.ritual);
                            const isConc = !!(s.duration && s.duration.some(d => d.concentration));
                            const hasMat = !!(s.components && s.components.m);
                            const rangeStr = s.range ? (s.range.type === 'point' && s.range.distance ? (s.range.distance.type === 'self' ? 'Self' : s.range.distance.type === 'touch' ? 'Touch' : `${s.range.distance.amount||''} ${s.range.distance.type}`.trim()) : (s.range.type || '—')) : '—';
                            const tr = document.createElement('tr');
                            tr.dataset.spell = s.name;
                            tr.style.cssText = 'border-bottom:1px solid rgba(212,175,55,0.15); transition:background 0.1s, opacity 0.1s;';
                            tr.innerHTML = `<td style="padding:3px 6px; font-weight:500;">${s.name}</td><td style="padding:3px 6px;" title="${SCHOOL_ABBR[s.school]||s.school||''}">${s.school||''}</td><td style="padding:3px 6px; text-align:center;">${isRitual?'✦':''}</td><td style="padding:3px 6px; text-align:center;">${isConc?'●':''}</td><td style="padding:3px 6px; text-align:center;">${hasMat?'◆':''}</td><td style="padding:3px 6px;">${rangeStr}</td>`;

                            tr.onmouseenter = () => {
                                if (!pendingSpells.some(p=>p.spellData.name===s.name) && !existingOnSheet.has(s.name.toLowerCase()) && !atLimit())
                                    tr.style.background = 'rgba(180,140,60,0.12)';
                            };
                            tr.onmouseleave = () => updateStyles();

                            tr.onclick = () => {
                                if (detailPane) showSpellDetail(s, detailPane);
                                if (existingOnSheet.has(s.name.toLowerCase())) return;
                                const idx2 = pendingSpells.findIndex(p => p.spellData.name === s.name);
                                if (idx2 > -1) {
                                    pendingSpells.splice(idx2, 1);
                                } else {
                                    if (atLimit()) return; // enforce limit
                                    let time = ''; if (s.time && s.time[0]) { const t = s.time[0]; time = `${t.number} ${t.unit}`; }
                                    let desc = window.processEntries ? window.processEntries(s.entries) : '';
                                    if (s.entriesHigherLevel) desc += '<br><br>' + (window.processEntries ? window.processEntries(s.entriesHigherLevel) : '');
                                    desc = window.cleanText ? window.cleanText(desc) : desc;
                                    const rawMat2 = s.components && (s.components.m || s.components.M);
                                    if (rawMat2) {
                                        let matText = typeof rawMat2 === 'object' ? (rawMat2.text || '') : rawMat2;
                                        if (matText) { matText = matText.charAt(0).toUpperCase() + matText.slice(1); desc = `**Materials:** ${matText}\n\n${desc}`; }
                                    }
                                    pendingSpells.push({ target: s.level === 0 ? 'cantripList' : 'spellList', spellData: { name: s.name, level: s.level, time, range: rangeStr, ritual: isRitual, concentration: isConc, material: !!rawMat2, description: desc, prepared: s.level !== 0, attackType: (s.spellAttack && s.spellAttack[0]) ? s.spellAttack[0].toUpperCase() : '', saveAbility: (s.savingThrow && s.savingThrow[0]) ? s.savingThrow[0].toLowerCase() : '' } });
                                }
                                updateStyles();
                                updateCounter();
                            };

                            rowMap.set(s, tr);
                            tbody.appendChild(tr);
                        });

                        tbl.appendChild(tbody);
                        section.appendChild(tbl);
                        spellTableWrap.appendChild(section);
                    });

                    updateStyles();
                    updateCounter();

                } catch (e) { console.error(e); spellTableWrap.innerHTML = '<div style="padding:10px; color:var(--red);">Error loading spells.</div>'; }
            })();

            // Fetch Class Table Data for Spell Info (slot counts etc.)
            const spellSectionDiv = null; // no longer inserting into features list
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
                                list.appendChild(infoDiv);
                            }
                        }
                    }
                } catch (e) { console.error(e); }
            })();
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

            // ASI / Feat inline selector
            if (/ability score improvement|ability improvements/i.test(f.name)) {
                if (!window.pendingLevelUpChanges.asiChoices) window.pendingLevelUpChanges.asiChoices = [];
                const asiIdx = window.pendingLevelUpChanges.asiChoices.length;
                window.pendingLevelUpChanges.asiChoices.push(null);
                const uid = `asi-${asiIdx}`;
                const STATS = [
                    { id: 'str', label: 'Strength' }, { id: 'dex', label: 'Dexterity' },
                    { id: 'con', label: 'Constitution' }, { id: 'int', label: 'Intelligence' },
                    { id: 'wis', label: 'Wisdom' }, { id: 'cha', label: 'Charisma' },
                ];
                const statOpts = (sel = '') => STATS.map(s =>
                    `<option value="${s.id}" ${s.id === sel ? 'selected' : ''}>${s.label} (${parseInt(document.getElementById(s.id)?.value)||10})</option>`
                ).join('');
                const asiContainer = document.createElement('div');
                asiContainer.style.cssText = 'margin-top:12px;padding:10px;background:var(--parchment-dark);border:1px solid var(--gold);border-radius:6px;';
                asiContainer.innerHTML = `
                    <div style="font-weight:700;font-size:0.88rem;color:var(--red-dark);margin-bottom:8px;">Apply ASI</div>
                    <div style="display:flex;gap:6px;margin-bottom:10px;">
                        <button class="act-filter-pill active" id="${uid}-mode-+2" onclick="window._asiSetMode('${uid}','+2')">+2 to One</button>
                        <button class="act-filter-pill" id="${uid}-mode-+1+1" onclick="window._asiSetMode('${uid}','+1+1')">+1 / +1</button>
                        <button class="act-filter-pill" id="${uid}-mode-feat" onclick="window._asiSetMode('${uid}','feat')">Feat</button>
                    </div>
                    <div id="${uid}-section-+2">
                        <label style="font-size:0.85rem;color:var(--ink-light);">Ability (+2):</label>
                        <select id="${uid}-stat1" class="styled-select" style="width:100%;margin-top:4px;" onchange="window._asiUpdate('${uid}')">
                            <option value="">— Choose —</option>${statOpts()}
                        </select>
                    </div>
                    <div id="${uid}-section-+1+1" style="display:none;">
                        <label style="font-size:0.85rem;color:var(--ink-light);">First (+1):</label>
                        <select id="${uid}-statA" class="styled-select" style="width:100%;margin-top:4px;margin-bottom:6px;" onchange="window._asiUpdate('${uid}')">
                            <option value="">— Choose —</option>${statOpts()}
                        </select>
                        <label style="font-size:0.85rem;color:var(--ink-light);">Second (+1):</label>
                        <select id="${uid}-statB" class="styled-select" style="width:100%;margin-top:4px;" onchange="window._asiUpdate('${uid}')">
                            <option value="">— Choose —</option>${statOpts()}
                        </select>
                    </div>
                    <div id="${uid}-section-feat" style="display:none;">
                        <div style="font-size:0.85rem;color:var(--ink-light);margin-bottom:6px;">Select a feat to add.</div>
                        <button class="add-feature-btn" onclick="window.openFeatSearch()">Browse Feats</button>
                    </div>`;
                div.appendChild(asiContainer);
            }

            // Render choice UI for this feature
            const optSets = lvlup_extractOptionSets(f.entries || f.entry || []);
            const choiceLists = lvlup_extractChoiceLists(f.entries || f.entry || []);
            if ((optSets.length > 0 || choiceLists.length > 0) && !f.name.includes("Fighting Style")) {
                lvlup_renderChoices(div, f.name, f.level, optSets, choiceLists, window.pendingLevelUpChanges ? window.pendingLevelUpChanges.choices : null);
            }

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
            const rawMat = foundSpell.components && (foundSpell.components.m || foundSpell.components.M);
            if (rawMat) {
                let matText = typeof rawMat === 'object' ? (rawMat.text || '') : rawMat;
                if (matText) {
                    matText = matText.charAt(0).toUpperCase() + matText.slice(1);
                    desc = `**Materials:** ${matText}\n\n${desc}`;
                }
            }

            const spellData = {
                name: foundSpell.name,
                level: foundSpell.level,
                time: time,
                range: range,
                ritual: foundSpell.meta && foundSpell.meta.ritual ? true : false,
                concentration: foundSpell.duration && foundSpell.duration[0] && foundSpell.duration[0].concentration ? true : false,
                material: !!rawMat,
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
    const classes = [];
    data.forEach(file => {
        if (!file.name.toLowerCase().endsWith('.json')) return;
        try {
            const json = JSON.parse(file.content);
            if (json.classFeature) classFeatures.push(...json.classFeature);
            if (json.subclassFeature) subclassFeatures.push(...json.subclassFeature);
            if (json.subclass) {
                console.log(`[Level Up] Loaded subclasses from ${file.name}:`, json.subclass);
                subclasses.push(...json.subclass);
            }
            if (json.class) classes.push(...json.class);
        } catch (e) {}
    });
    console.log("fetchLevelUpFeatures - Extracted:", { classFeatures, subclassFeatures, subclasses });
    
    const normClass = className ? className.trim().toLowerCase() : "";

    // Determine Class Source
    const classCandidates = classes.filter(c => c.name.toLowerCase() === normClass);
    let classSource = null;
    if (classCandidates.some(c => c.source === 'XPHB')) classSource = 'XPHB';
    else if (classCandidates.some(c => c.source === 'PHB')) classSource = 'PHB';
    else if (classCandidates.length > 0) classSource = classCandidates[0].source;

    // Filter for class features, prioritizing XPHB if available
    const allClassFeaturesForName = classFeatures.filter(f => f.className && f.className.trim().toLowerCase() === normClass);
    
    let relevantClassFeatures = [];
    if (classSource) {
        relevantClassFeatures = allClassFeaturesForName.filter(f => f.level >= startLevel && f.level <= level && f.source === classSource);
    } else {
        const hasXPHB = allClassFeaturesForName.some(f => f.source === 'XPHB');
        relevantClassFeatures = allClassFeaturesForName.filter(f => {
            if (f.level < startLevel || f.level > level) return false;
            if (hasXPHB && f.source === 'PHB') return false;
            return true;
        });
    }

    let scShortName = null;
    if (subclass) {
        const normSub = subclass.trim().toLowerCase();
        const scCandidates = subclasses.filter(s => s.name && s.name.trim().toLowerCase() === normSub && s.className && s.className.trim().toLowerCase() === normClass);
        let scObj = scCandidates.find(s => s.source === 'XPHB');
        if (!scObj) scObj = scCandidates.find(s => s.source === 'PHB');
        if (!scObj) scObj = scCandidates[0];
        if (scObj) scShortName = scObj.shortName;
    }
    let relevantSubclassFeatures = [];
    if (scShortName) {
        const normShort = scShortName.trim().toLowerCase();
        const allScFeatures = subclassFeatures.filter(f => f.className && f.className.trim().toLowerCase() === normClass && f.subclassShortName && f.subclassShortName.trim().toLowerCase() === normShort && f.level >= startLevel && f.level <= level);
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

/* =========================================
      CUSTOM DATA MANAGER (Templates)
      ========================================= */
window.openCustomDataManager = function() {
    let modal = document.getElementById('customDataModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'customDataModal';
        modal.className = 'info-modal-overlay';
        modal.innerHTML = `
            <div class="info-modal-content" style="max-width: 400px; text-align: center;">
                <button class="close-modal-btn" onclick="document.getElementById('customDataModal').style.display='none'">&times;</button>
                <h3 class="info-modal-title">Custom Data & Templates</h3>
                <p style="font-size:0.9rem; color:var(--ink-light); margin-bottom:15px; line-height: 1.4;">
                    Create custom content by downloading a template below.
                    <br>1. <strong>Download</strong> the JSON template.
                    <br>2. <strong>Edit</strong> the file with your content.
                    <br>3. <strong>Upload</strong> via Data Viewer (data.html).
                </p>
                <div style="margin-bottom: 15px; background: white; padding: 15px; border: 1px solid var(--gold); border-radius: 4px;">
                    <label style="font-weight:bold; display:block; margin-bottom:8px; color: var(--red-dark);">Select Template Type</label>
                    <select id="templateTypeSelect" class="styled-select" style="width:100%; margin-bottom:10px;">
                        <option value="class">Class Template</option>
                        <option value="subclass">Subclass Template</option>
                        <option value="race">Species/Race Template</option>
                        <option value="feat">Feat Template</option>
                        <option value="spell">Spell Template</option>
                    </select>
                    <button class="btn" onclick="window.downloadDataTemplate()" style="width:100%;">Download JSON</button>
                </div>
                <div style="font-size: 0.8rem; font-style: italic; color: var(--ink-light);">
                    Note: Ensure 'className' and 'source' match exactly when linking features.
                </div>
            </div>
        `;
        document.body.appendChild(modal);
    }
    modal.style.display = 'flex';
};

window.downloadDataTemplate = function() {
    const type = document.getElementById('templateTypeSelect').value;
    let data = {};
    let filename = "template.json";

    if (type === 'class') {
        filename = "custom-class.json";
        data = {
            "class": [
                {
                    "name": "My Custom Class",
                    "source": "Custom",
                    "hd": { "number": 1, "faces": 8 },
                    "proficiency": ["dex", "int"],
                    "spellcastingAbility": "int",
                    "casterProgression": "1/2",
                    "startingProficiencies": {
                        "armor": ["light", "medium", "shields"],
                        "weapons": ["simple", "martial"],
                        "tools": ["thieves' tools"],
                        "skills": {
                            "choose": {
                                "from": ["acrobatics", "arcana", "history", "investigation", "nature", "religion"],
                                "count": 2
                            }
                        }
                    },
                    "classTableGroups": [
                        {
                            "colLabels": ["{@bold Level}", "{@bold PB}", "{@bold Features}"],
                            "rows": [
                                [1, "+2", "{@classFeature My Feature|My Custom Class|Custom|1}"],
                                [2, "+2", "{@classFeature Another Feature|My Custom Class|Custom|2}"]
                            ]
                        }
                    ]
                }
            ],
            "classFeature": [
                { "name": "My Feature", "source": "Custom", "className": "My Custom Class", "classSource": "Custom", "level": 1, "entries": ["Description of feature 1."] },
                { "name": "Another Feature", "source": "Custom", "className": "My Custom Class", "classSource": "Custom", "level": 2, "entries": ["Description of feature 2."] }
            ]
        };
    } else if (type === 'subclass') {
        filename = "custom-subclass.json";
        data = {
            "subclass": [
                {
                    "name": "My Custom Subclass",
                    "shortName": "My Sub",
                    "source": "Custom",
                    "className": "Fighter",
                    "classSource": "PHB",
                    "subclassFeatures": ["My Subclass Feature|Fighter|PHB|My Subclass|Custom|3"]
                }
            ],
            "subclassFeature": [
                { "name": "My Subclass Feature", "source": "Custom", "className": "Fighter", "classSource": "PHB", "subclassShortName": "My Sub", "subclassSource": "Custom", "level": 3, "entries": ["Description of subclass feature."] }
            ]
        };
    } else if (type === 'race') {
        filename = "custom-race.json";
        data = { "race": [{ "name": "My Custom Species", "source": "Custom", "size": ["M"], "speed": 30, "entries": [{ "name": "Trait 1", "entries": ["Description."] }] }] };
    } else if (type === 'feat') {
        filename = "custom-feat.json";
        data = { "feat": [{ "name": "My Custom Feat", "source": "Custom", "entries": ["Description."], "ability": [{ "str": 1 }] }] };
    } else if (type === 'spell') {
        filename = "custom-spell.json";
        data = { "spell": [{ "name": "My Custom Spell", "source": "Custom", "level": 1, "school": "V", "time": [{ "number": 1, "unit": "action" }], "range": { "type": "point", "distance": { "type": "feet", "amount": 60 } }, "components": { "v": true }, "duration": [{ "type": "instant" }], "entries": ["Effect."], "classes": { "fromClassList": [{ "name": "Wizard", "source": "PHB" }] } }] };
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};

/* =========================================
      CUSTOM DATA MANAGER (Templates)
      ========================================= */
window.openCustomDataManager = async function() {
    let modal = document.getElementById('customDataModal');
    
    let hasData = false;
    try {
        const db = await openDB();
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const data = await new Promise((resolve) => {
            const req = store.get('currentData');
            req.onsuccess = () => resolve(req.result);
            req.onerror = () => resolve(null);
        });
        if (data && data.length > 0) hasData = true;
    } catch (e) { console.error("DB Check failed", e); }

    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'customDataModal';
        modal.className = 'info-modal-overlay';
        document.body.appendChild(modal);
    }
    
    modal.innerHTML = `
            <div class="info-modal-content" style="max-width: 400px; text-align: center;">
                <button class="close-modal-btn" onclick="document.getElementById('customDataModal').style.display='none'">&times;</button>
                <h3 class="info-modal-title">Custom Data Manager</h3>
                <p style="font-size:0.9rem; color:var(--ink-light); margin-bottom:15px; line-height: 1.4;">
                    Download JSON templates to create custom content.
                    <br>Fill them out, and upload them (or a .zip of multiple files) here or via the Data Viewer.
                </p>
                <div style="margin-bottom: 15px; background: white; padding: 15px; border: 1px solid var(--gold); border-radius: 4px;">
                    <label style="font-weight:bold; display:block; margin-bottom:8px; color: var(--red-dark);">Download Template</label>
                    <select id="templateTypeSelect" class="styled-select" style="width:100%; margin-bottom:10px;">
                        <option value="class">Class Template</option>
                        <option value="subclass">Subclass Template</option>
                        <option value="race">Species/Race Template</option>
                        <option value="feat">Feat Template</option>
                        <option value="spell">Spell Template</option>
                    </select>
                    <button class="btn" onclick="window.downloadDataTemplate()" style="width:100%;">Download JSON</button>
                </div>
                ${hasData ? `
                <div style="margin-bottom: 15px; background: white; padding: 15px; border: 1px solid var(--gold); border-radius: 4px;">
                    <label style="font-weight:bold; display:block; margin-bottom:8px; color: var(--red-dark);">Upload Custom JSON or ZIP</label>
                    <input type="file" id="customJsonUpload" accept=".json,.zip" style="width: 100%; margin-bottom: 10px; font-size: 0.9rem;">
                    <button class="btn" onclick="window.uploadCustomJson()" style="width:100%;">Upload & Refresh</button>
                </div>
                <div style="margin-bottom: 15px; background: white; padding: 15px; border: 1px solid var(--gold); border-radius: 4px;">
                    <label style="font-weight:bold; display:block; margin-bottom:8px; color: var(--red-dark);">Browse Uploaded Data</label>
                    <button class="btn btn-secondary" onclick="window.openDataBrowser()" style="width:100%;">Open Data Browser</button>
                </div>
                ` : ''}
                <div style="font-size: 0.8rem; font-style: italic; color: var(--ink-light);">
                    Note: Ensure 'className' and 'source' match exactly when linking features.
                </div>
            </div>
    `;
    modal.style.display = 'flex';
};

window.uploadCustomJson = async function() {
    const input = document.getElementById('customJsonUpload');
    if (!input || !input.files[0]) return alert("Please select a JSON or ZIP file.");
    
    const file = input.files[0];
    
    // Check for massive files (e.g. full repo with images ~4GB)
    if (file.name.toLowerCase().endsWith('.zip') && file.size > 300 * 1024 * 1024) {
        if (!confirm(`This ZIP file is very large (${Math.round(file.size / (1024*1024))} MB) and likely contains images or non-data files which may cause the browser to crash.\n\nFor best results, zip only the 'data' folder (or relevant JSON files) and upload that.\n\nAttempt to process anyway?`)) {
            return;
        }
    }

    try {
        const db = await openDB();
        
        let currentData = [];
        try {
            const tx = db.transaction(STORE_NAME, 'readonly');
            const store = tx.objectStore(STORE_NAME);
            const data = await new Promise((resolve, reject) => {
                const req = store.get('currentData');
                req.onsuccess = () => resolve(req.result);
                req.onerror = () => reject(req.error);
            });
            if (data) currentData = data;
        } catch (e) {
            console.warn("Could not read current data, might be empty", e);
        }
        
        if (!currentData || currentData.length === 0) return alert("No database found. Please use Data Viewer to initialize first.");

        if (file.name.toLowerCase().endsWith('.zip')) {
            if (typeof JSZip === 'undefined') {
                try {
                    await new Promise((resolve, reject) => {
                        const script = document.createElement('script');
                        script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
                        script.onload = resolve;
                        script.onerror = reject;
                        document.head.appendChild(script);
                    });
                } catch (e) {
                    return alert("Failed to load JSZip. Cannot process ZIP files.");
                }
            }

            const zip = await JSZip.loadAsync(file);
            let addedCount = 0;
            let skippedCount = 0;

            for (const relativePath of Object.keys(zip.files)) {
                const zipEntry = zip.files[relativePath];
                const p = relativePath.toLowerCase();
                
                if (zipEntry.dir || !p.endsWith('.json')) continue;
                if (p.includes('package.json') || p.includes('package-lock.json')) continue;

                // Check if it belongs to a valid folder or is in root
                const pathParts = p.split('/');
                const fileName = pathParts.pop();
                
                const content = await zipEntry.async("string");
                try {
                    JSON.parse(content); // Validate JSON
                    const newFileEntry = { name: fileName, content: content };
                    
                    const index = currentData.findIndex(f => f.name === fileName);
                    if (index >= 0) {
                        currentData[index] = newFileEntry;
                    } else {
                        currentData.push(newFileEntry);
                    }
                    addedCount++;
                } catch (e) {
                    console.warn(`Skipping invalid JSON in zip: ${relativePath}`);
                }
            }

            if (addedCount === 0) return alert(`No valid JSON files found in the ZIP.`);
            
            if (skippedCount > 0) {
                console.log(`[ZIP Upload] Added ${addedCount} files. Skipped ${skippedCount} irrelevant files.`);
            }

        } else if (file.name.toLowerCase().endsWith('.json')) {
            const content = await file.text();
            JSON.parse(content); // Validate JSON
            
            const newFileEntry = { name: file.name, content: content };
            const index = currentData.findIndex(f => f.name === file.name);
            
            if (index >= 0) {
                if(!confirm(`File '${file.name}' already exists. Overwrite?`)) return;
                currentData[index] = newFileEntry;
            } else {
                currentData.push(newFileEntry);
            }
        } else {
            return alert("Unsupported file type. Please upload a .json or .zip file.");
        }
        
        // Keep sorted
        currentData.sort((a, b) => a.name.localeCompare(b.name));
        
        const writeTx = db.transaction(STORE_NAME, 'readwrite');
        const writeStore = writeTx.objectStore(STORE_NAME);
        await new Promise((resolve, reject) => {
            const req = writeStore.put(currentData, 'currentData');
            req.onsuccess = () => resolve();
            req.onerror = () => reject(req.error);
        });
        
        alert("Custom data uploaded successfully.");
        location.reload();
    } catch (err) {
        console.error(err);
        if (err.message && err.message.includes("End of data reached")) {
            alert("Error: The ZIP file is too large or corrupted and the browser ran out of memory extracting it.\n\nPlease extract the ZIP file on your computer and upload only the smaller 'data.zip' or individual JSON files from the 'data' folder.");
        } else {
            alert("Error uploading file: " + err.message);
        }
    }
};

window._deleteDataFile = async function(filename, rowEl) {
    if (!confirm(`Delete "${filename}" from the database?\n\nThis cannot be undone.`)) return;
    try {
        const db = await openDB();
        const rTx = db.transaction(STORE_NAME, 'readonly');
        const rStore = rTx.objectStore(STORE_NAME);
        const [currentData, manifest] = await Promise.all([
            new Promise(res => { const r = rStore.get('currentData'); r.onsuccess = () => res(r.result || []); r.onerror = () => res([]); }),
            new Promise(res => { const r = rStore.get('fileManifest'); r.onsuccess = () => res(r.result || []); r.onerror = () => res([]); }),
        ]);

        const entry = manifest.find(m => m.name === filename);
        const filesToRemove = new Set(entry ? entry.files : [filename]);
        const newData = currentData.filter(f => !filesToRemove.has(f.name));
        const newManifest = manifest.filter(m => m.name !== filename);

        const wTx = db.transaction(STORE_NAME, 'readwrite');
        const wStore = wTx.objectStore(STORE_NAME);
        wStore.put(newData, 'currentData');
        wStore.put(newManifest, 'fileManifest');
        await new Promise((res, rej) => { wTx.oncomplete = res; wTx.onerror = () => rej(wTx.error); });

        if (rowEl) rowEl.remove();
        const fileStats = document.getElementById('dbFileStats');
        const term = document.getElementById('dbFileSearch')?.value || '';
        const shown = term ? newManifest.filter(e => e.name.toLowerCase().includes(term.toLowerCase())).length : newManifest.length;
        if (fileStats) fileStats.textContent = term
            ? `${shown} of ${newManifest.length} file${newManifest.length !== 1 ? 's' : ''}`
            : `${newManifest.length} file${newManifest.length !== 1 ? 's' : ''} uploaded.`;
    } catch(e) {
        alert('Error deleting file: ' + e.message);
    }
};

window._dbSwitchTab = function(tab) {
    const browsePanel = document.getElementById('dbBrowsePanel');
    const filesPanel = document.getElementById('dbFilesPanel');
    const browseBtn = document.getElementById('dbTabBrowse');
    const filesBtn = document.getElementById('dbTabFiles');
    if (!browsePanel || !filesPanel) return;
    if (tab === 'browse') {
        filesPanel.style.display = 'none';
        browsePanel.style.display = 'flex';
        filesBtn.classList.add('btn-secondary');
        browseBtn.classList.remove('btn-secondary');
    } else {
        browsePanel.style.display = 'none';
        filesPanel.style.display = 'flex';
        browseBtn.classList.add('btn-secondary');
        filesBtn.classList.remove('btn-secondary');
    }
};

window.openDataBrowser = async function() {
    let modal = document.getElementById('dataBrowserModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'dataBrowserModal';
        modal.className = 'info-modal-overlay';
        modal.style.zIndex = '2020';
        document.body.appendChild(modal);
    }

    modal.innerHTML = `
        <div class="info-modal-content" style="max-width: 600px; max-height: 85vh; display: flex; flex-direction: column;">
            <button class="close-modal-btn" onclick="document.getElementById('dataBrowserModal').style.display='none'">&times;</button>
            <h3 class="info-modal-title" style="text-align: center">Data Browser</h3>
            <div style="display:flex; gap:6px; margin-bottom:12px;">
                <button id="dbTabFiles" onclick="window._dbSwitchTab('files')" class="btn" style="flex:1;">Uploaded Files</button>
                <button id="dbTabBrowse" onclick="window._dbSwitchTab('browse')" class="btn btn-secondary" style="flex:1;">Browse Data</button>
            </div>
            <div id="dataBrowserLoading" style="text-align:center; padding:20px; color:var(--ink-light);">Loading database...</div>
            <div id="dataBrowserContent" style="display:none; flex-direction:column; flex:1; overflow:hidden;">
                <div id="dbBrowsePanel" style="display:none; flex-direction:column; flex:1; overflow:hidden;">
                    <div style="display:flex; gap:10px; margin-bottom:10px; flex-wrap:wrap;">
                        <select id="dbCategorySelect" class="styled-select" style="flex:1; min-width:200px;">
                            <option value="">-- Select Category --</option>
                        </select>
                        <input type="text" id="dbSearchInput" placeholder="Search..." class="styled-select" style="flex:1; min-width:200px;">
                    </div>
                    <div id="dbStats" style="font-size:0.85rem; color:var(--ink-light); margin-bottom:10px; font-style:italic;"></div>
                    <div id="dataBrowserList" class="checklist-grid" style="grid-template-columns: 1fr; flex: 1; overflow-y: auto; gap: 8px; align-content: flex-start;"></div>
                </div>
                <div id="dbFilesPanel" style="display:flex; flex-direction:column; flex:1; overflow:hidden;">
                    <input type="text" id="dbFileSearch" placeholder="Search files..." class="styled-select" style="margin-bottom:8px;">
                    <div id="dbFileStats" style="font-size:0.85rem; color:var(--ink-light); margin-bottom:8px; font-style:italic;"></div>
                    <div id="dbFileList" style="flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:6px;"></div>
                </div>
            </div>
        </div>
    `;
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

        if (!data || data.length === 0) {
            document.getElementById('dataBrowserLoading').innerHTML = '<span style="color:var(--red);">No data found in the database. Please initialize or upload data first.</span>';
            return;
        }

        // Populate Files panel from manifest
        const fileList = document.getElementById('dbFileList');
        const fileStats = document.getElementById('dbFileStats');
        const fileSearch = document.getElementById('dbFileSearch');

        let manifest = [];
        try {
            const mTx = db.transaction(STORE_NAME, 'readonly');
            const mStore = mTx.objectStore(STORE_NAME);
            manifest = await new Promise(res => {
                const r = mStore.get('fileManifest');
                r.onsuccess = () => res(r.result || []);
                r.onerror = () => res([]);
            });
        } catch(e) { manifest = []; }

        // If no manifest, fall back to raw currentData file names (legacy uploads)
        let displayList = manifest;
        if (manifest.length === 0 && data && data.length > 0) {
            displayList = data.map(f => ({ name: f.name, type: 'json', files: [f.name], _legacy: true }));
        }

        const renderFileList = (term) => {
            fileList.innerHTML = '';
            const filtered = term
                ? displayList.filter(e => e.name.toLowerCase().includes(term.toLowerCase()))
                : displayList;
            if (displayList.length === 0) {
                fileStats.textContent = 'No files found in the database.';
                return;
            }
            fileStats.textContent = `${filtered.length} of ${displayList.length} file${displayList.length !== 1 ? 's' : ''}`;
            filtered.forEach(entry => {
                const row = document.createElement('div');
                row.style.cssText = 'display:flex; align-items:center; justify-content:space-between; gap:10px; padding:6px 10px; background:white; border:1px solid var(--gold); border-radius:6px; font-size:0.9rem;';
                const badge = entry.type === 'zip'
                    ? `<span style="font-size:0.7rem; background:var(--parchment-dark); border:1px solid var(--gold); border-radius:4px; padding:1px 5px; white-space:nowrap; flex-shrink:0;">ZIP · ${(entry.files||[]).length} files</span>`
                    : `<span style="font-size:0.7rem; background:var(--parchment-dark); border:1px solid var(--gold); border-radius:4px; padding:1px 5px; white-space:nowrap; flex-shrink:0;">JSON</span>`;
                row.innerHTML = `
                    <span style="flex:1; min-width:0; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${entry.name}">${entry.name}</span>
                    ${badge}
                    <button class="btn btn-secondary" style="padding:2px 8px; font-size:0.8rem; color:var(--red-dark); border-color:var(--red-dark); flex-shrink:0;">Delete</button>
                `;
                row.querySelector('button').addEventListener('click', () => window._deleteDataFile(entry.name, row));
                fileList.appendChild(row);
            });
        };

        renderFileList('');
        if (fileSearch) fileSearch.addEventListener('input', e => renderFileList(e.target.value));

        const categoryMap = {
            'spell': 'Spells', 'spells': 'Spells',
            'item': 'Items', 'items': 'Items', 'baseitem': 'Items', 'magicvariant': 'Items',
            'class': 'Classes',
            'subclass': 'Subclasses',
            'classFeature': 'Class Features',
            'subclassFeature': 'Subclass Features',
            'race': 'Species/Races',
            'subrace': 'Subraces',
            'feat': 'Feats',
            'background': 'Backgrounds',
            'optionalfeature': 'Optional Features',
            'deity': 'Deities',
            'condition': 'Conditions',
            'language': 'Languages',
            'action': 'Actions',
            'table': 'Tables',
            'monster': 'Monsters'
        };

        const aggregated = {};

        data.forEach(file => {
            if (!file.name.toLowerCase().endsWith('.json')) return;
            try {
                const json = JSON.parse(file.content);
                Object.keys(json).forEach(key => {
                    if (Array.isArray(json[key]) && json[key].length > 0 && typeof json[key][0] === 'object' && json[key][0].name) {
                        let targetCategory = categoryMap[key];
                        if (!targetCategory) {
                            // Fallback for unknown categories
                            targetCategory = key.charAt(0).toUpperCase() + key.slice(1) + (key.endsWith('s') ? '' : 's');
                        }
                        if (!aggregated[targetCategory]) aggregated[targetCategory] = [];
                        aggregated[targetCategory].push(...json[key]);
                    }
                });
            } catch(e) {
                console.warn("Skipped invalid JSON file:", file.name);
            }
        });

        window.browserDataCache = {};
        Object.keys(aggregated).sort().forEach(cat => {
            const uniqueMap = new Map();
            aggregated[cat].forEach(item => {
                if (!item || !item.name) return;
                const id = item.name + "|" + (item.source || "");
                if (!uniqueMap.has(id)) {
                    uniqueMap.set(id, item);
                } else {
                    const existing = uniqueMap.get(id);
                    if (item.source === 'XPHB' && existing.source !== 'XPHB') {
                        uniqueMap.set(id, item);
                    }
                }
            });
            window.browserDataCache[cat] = Array.from(uniqueMap.values()).sort((a,b) => a.name.localeCompare(b.name));
        });

        document.getElementById('dataBrowserLoading').style.display = 'none';
        document.getElementById('dataBrowserContent').style.display = 'flex';

        const select = document.getElementById('dbCategorySelect');
        Object.keys(window.browserDataCache).forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = `${cat} (${window.browserDataCache[cat].length})`;
            select.appendChild(opt);
        });

        const renderList = () => {
            const cat = select.value;
            const term = document.getElementById('dbSearchInput').value.toLowerCase();
            const list = document.getElementById('dataBrowserList');
            const stats = document.getElementById('dbStats');
            list.innerHTML = '';
            
            if (!cat) {
                stats.textContent = "Select a category to view items.";
                return;
            }

            let items = window.browserDataCache[cat];
            if (term) {
                items = items.filter(i => i.name.toLowerCase().includes(term));
            }

            stats.textContent = `Showing ${items.length} items.`;

            const maxRender = 200;
            const toRender = items.slice(0, maxRender);

            toRender.forEach(item => {
                const div = document.createElement('div');
                div.className = 'checklist-item';
                div.style.flexDirection = 'column';
                div.style.alignItems = 'flex-start';
                div.style.cursor = 'pointer';
                div.style.border = '1px solid var(--gold)';

                let subtitleParts = [];
                if (item.source) subtitleParts.push(item.source);
                if (item.level !== undefined) subtitleParts.push(`Lvl ${item.level}`);
                if (item.className) subtitleParts.push(item.className);
                const subtitle = subtitleParts.join(' | ');

                div.innerHTML = `
                    <div style="font-weight:bold; width:100%; display:flex; justify-content:space-between; align-items:center;">
                        <span>${item.name}</span>
                        <span style="font-size:0.8rem; color:var(--ink-light); text-align:right;">${subtitle}</span>
                    </div>
                    <div class="db-item-details" style="display:none; font-size:0.85rem; color:var(--ink); margin-top:8px; border-top:1px dashed var(--gold); padding-top:8px; line-height:1.5; width:100%;"></div>
                `;

                let loaded = false;
                div.onclick = () => {
                    const details = div.querySelector('.db-item-details');
                    if (details.style.display === 'none') {
                        details.style.display = 'block';
                        div.style.backgroundColor = 'var(--parchment)';
                        div.style.borderColor = 'var(--red)';
                        if (!loaded) {
                            let desc = "";
                            if (item.entries) desc = window.processEntries(item.entries);
                            else if (item.desc) desc = window.processEntries(item.desc);
                            else if (item.description) desc = item.description;
                            else desc = "<pre style='white-space:pre-wrap; word-break:break-all; font-family:monospace; font-size:0.75rem; background:rgba(0,0,0,0.05); padding:10px; border-radius:4px; margin:0;'>" + JSON.stringify(item, null, 2).replace(/</g, "&lt;").replace(/>/g, "&gt;") + "</pre>";
                            
                            if (!desc.startsWith("<pre")) desc = window.cleanText(desc);
                            details.innerHTML = desc || "<em>No description available.</em>";
                            loaded = true;
                        }
                    } else {
                        details.style.display = 'none';
                        div.style.backgroundColor = 'white';
                        div.style.borderColor = 'var(--gold)';
                    }
                };

                list.appendChild(div);
            });

            if (items.length > maxRender) {
                const msg = document.createElement('div');
                msg.style.padding = "10px";
                msg.style.textAlign = "center";
                msg.style.color = "var(--ink-light)";
                msg.style.fontStyle = "italic";
                msg.textContent = `...and ${items.length - maxRender} more. Use search to find specific entries.`;
                list.appendChild(msg);
            }
        };

        select.addEventListener('change', renderList);
        document.getElementById('dbSearchInput').addEventListener('input', renderList);

    } catch(e) {
        console.error("Data Browser Error:", e);
        document.getElementById('dataBrowserLoading').innerHTML = '<span style="color:var(--red);">Error loading data from the database.</span>';
    }
};